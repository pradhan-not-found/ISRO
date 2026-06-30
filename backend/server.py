from flask import Flask, request, jsonify, send_file
import os
import traceback
from flask_cors import CORS
import torch
import torch_directml
import cv2
import numpy as np
import io
import math
import base64
import h5py
from piq import fsim
from skimage.metrics import structural_similarity as ssim
from skimage.metrics import mean_squared_error as mse
from model import SatelliteInterpolatorUNet

app = Flask(__name__)
# CORS setup
CORS(app) 

print("[*] Booting AI Engine...")
device = torch_directml.device()
model = SatelliteInterpolatorUNet().to(device)
model.load_state_dict(torch.load("models/satellite_interpolator.pth", map_location=device))
model.eval()
print("[+] Model loaded and ready.")

def process_image(file_storage):
    img_bytes = file_storage.read()
    nparr = np.frombuffer(img_bytes, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_GRAYSCALE)
    img = np.repeat(img[:, :, np.newaxis], 3, axis=2)
    tensor = torch.from_numpy(img).permute(2, 0, 1).float() / 255.0
    return tensor.unsqueeze(0).to(device)

@app.route('/interpolate', methods=['POST'])
def interpolate():
    if 'frame1' not in request.files or 'frame3' not in request.files:
        return {"error": "Missing frames"}, 400
        
    t0_tensor = process_image(request.files['frame1'])
    t2_tensor = process_image(request.files['frame3'])
    resolution = request.form.get('resolution', '15min')
    
    with torch.no_grad():
        f15_tensor = model(t0_tensor, t2_tensor)
        if resolution == '7.5min':
            f07_5_tensor = model(t0_tensor, f15_tensor)
            f22_5_tensor = model(f15_tensor, t2_tensor)
            
        pred_tensor = f15_tensor
        
    pred_img = (pred_tensor.squeeze().cpu().permute(1, 2, 0).numpy() * 255).astype(np.uint8)
    pred_gray = cv2.cvtColor(pred_img, cv2.COLOR_BGR2GRAY)
    
    # 1. High-Velocity Adaptive Warning (MAC)
    mac_val = torch.mean(torch.abs(t0_tensor - t2_tensor)).item() * 255.0
    
    # 2. Differential Analysis (Heatmap)
    linear_blend = (t0_tensor + t2_tensor) / 2.0
    linear_img = (linear_blend.squeeze().cpu().permute(1, 2, 0).numpy() * 255).astype(np.uint8)
    linear_gray = cv2.cvtColor(linear_img, cv2.COLOR_BGR2GRAY)
    
    delta = cv2.absdiff(pred_gray, linear_gray)
    delta_norm = cv2.normalize(delta, None, 0, 255, cv2.NORM_MINMAX)
    heatmap_img = cv2.applyColorMap(delta_norm, cv2.COLORMAP_JET)
    
    # 3. Thermal Gradient Analysis (Sobel)
    sobelx = cv2.Sobel(pred_gray, cv2.CV_64F, 1, 0, ksize=3)
    sobely = cv2.Sobel(pred_gray, cv2.CV_64F, 0, 1, ksize=3)
    sobel_mag = np.sqrt(sobelx**2 + sobely**2)
    sobel_norm = cv2.normalize(sobel_mag, None, 0, 255, cv2.NORM_MINMAX).astype(np.uint8)
    sobel_img = cv2.applyColorMap(sobel_norm, cv2.COLORMAP_HOT) 
    
    # --- HACKATHON VALIDATION METRICS ---
    try:
        # Load the ACTUAL ground truth frame (Frame 1) we saved earlier
        gt_img = cv2.imread('data/processed/frame_001.png', cv2.IMREAD_GRAYSCALE)
        gt_tensor = torch.from_numpy(gt_img).unsqueeze(0).unsqueeze(0).float() / 255.0
        
        # Calculate AI Metrics
        ai_mse = mse(gt_img, pred_gray)
        ai_psnr = 10 * math.log10((255 ** 2) / ai_mse) if ai_mse > 0 else float('inf')
        ai_ssim = ssim(gt_img, pred_gray)
        pred_gray_tensor = torch.from_numpy(pred_gray).unsqueeze(0).unsqueeze(0).float() / 255.0
        ai_fsim = fsim(pred_gray_tensor, gt_tensor, data_range=1.0, chromatic=False).item()
        
        # Calculate Baseline Metrics (Linear Blend)
        base_mse = mse(gt_img, linear_gray)
        base_psnr = 10 * math.log10((255 ** 2) / base_mse) if base_mse > 0 else float('inf')
        base_ssim = ssim(gt_img, linear_gray)
        linear_gray_tensor = torch.from_numpy(linear_gray).unsqueeze(0).unsqueeze(0).float() / 255.0
        base_fsim = fsim(linear_gray_tensor, gt_tensor, data_range=1.0, chromatic=False).item()
        
        print(f"AI Metrics -> MSE: {ai_mse:.2f}, PSNR: {ai_psnr:.2f}, SSIM: {ai_ssim:.4f}, FSIM: {ai_fsim:.4f}")
    except Exception as e:
        print("Could not calculate metrics:", e, flush=True)
        traceback.print_exc()
        ai_mse, ai_psnr, ai_ssim, ai_fsim = 0, 0, 0, 0
        base_mse, base_psnr, base_ssim, base_fsim = 0, 0, 0, 0

    # Save to .h5 format
    h5_path = os.path.join("data", "latest_prediction.h5")
    os.makedirs("data", exist_ok=True)
    with h5py.File(h5_path, "w") as f:
        if resolution == '7.5min':
            f.create_dataset("f07_5", data=f07_5_tensor.squeeze().cpu().numpy())
            f.create_dataset("f15", data=f15_tensor.squeeze().cpu().numpy())
            f.create_dataset("f22_5", data=f22_5_tensor.squeeze().cpu().numpy())
        else:
            f.create_dataset("interpolated_frame", data=pred_tensor.squeeze().cpu().numpy())

    def img_to_base64(img):
        _, buffer = cv2.imencode('.png', img)
        return "data:image/png;base64," + base64.b64encode(buffer).decode('utf-8')
        
    extra_frames = []
    if resolution == '7.5min':
        f07_img = (f07_5_tensor.squeeze().cpu().permute(1, 2, 0).numpy() * 255).astype(np.uint8)
        f07_gray = cv2.cvtColor(f07_img, cv2.COLOR_BGR2GRAY)
        
        f22_img = (f22_5_tensor.squeeze().cpu().permute(1, 2, 0).numpy() * 255).astype(np.uint8)
        f22_gray = cv2.cvtColor(f22_img, cv2.COLOR_BGR2GRAY)
        
        extra_frames = [img_to_base64(f07_gray), img_to_base64(f22_gray)]
        
    return jsonify({
        "base_image": img_to_base64(pred_gray),
        "differential_image": img_to_base64(heatmap_img),
        "sobel_image": img_to_base64(sobel_img),
        "extra_frames": extra_frames,
        "metrics": {
            "mse": f"{ai_mse:.3f}",
            "psnr": f"{ai_psnr:.2f}",
            "ssim": f"{ai_ssim:.4f}",
            "fsim": f"{ai_fsim:.4f}",
            "mac": f"{mac_val:.2f}",
            "baseline": {
                "mse": f"{base_mse:.3f}",
                "psnr": f"{base_psnr:.2f}",
                "ssim": f"{base_ssim:.4f}",
                "fsim": f"{base_fsim:.4f}"
            }
        }
    })

@app.route('/download_h5', methods=['GET'])
def download_h5():
    h5_path = os.path.join("data", "latest_prediction.h5")
    if os.path.exists(h5_path):
        return send_file(h5_path, as_attachment=True, download_name="interpolated_t1.h5")
    return {"error": "No data available"}, 404

if __name__ == '__main__':
    app.run(port=5000, debug=True)