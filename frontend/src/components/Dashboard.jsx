import React, { useState, useEffect } from 'react';
import { Upload, Cpu, Loader2, Image as ImageIcon, Zap, Play, Pause, Database } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend } from 'recharts';

export default function Dashboard() {
  const [frame1, setFrame1] = useState(null);
  const [frame3, setFrame3] = useState(null);
  const [resultImage, setResultImage] = useState(null);
  const [resultImages, setResultImages] = useState(null);
  const [analysisLayer, setAnalysisLayer] = useState("default");
  const [macValue, setMacValue] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [mse, setMse] = useState("0.00");
  const [psnr, setPsnr] = useState("0.00");
  const [ssim, setSsim] = useState("0.00");
  const [fsim, setFsim] = useState("0.00");
  const [baselineMetrics, setBaselineMetrics] = useState(null);
  const [resolution, setResolution] = useState("15min");
  const [extraFrames, setExtraFrames] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackIndex, setPlaybackIndex] = useState(0);

  useEffect(() => {
    let interval;
    if (isPlaying) {
      interval = setInterval(() => {
        setPlaybackIndex((prev) => (prev + 1) % (resolution === '7.5min' && extraFrames.length === 2 ? 5 : 3));
      }, 400);
    }
    return () => clearInterval(interval);
  }, [isPlaying, resolution, extraFrames.length]);

  const handleGenerate = async () => {
    if (!frame1 || !frame3) return;

    setIsGenerating(true);
    setResultImage(null);

    const formData = new FormData();
    formData.append('frame1', frame1);
    formData.append('frame3', frame3);
    formData.append('resolution', resolution);

    try {
      const response = await fetch('http://localhost:5000/interpolate', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to fetch from server.');
      }

      const data = await response.json();
      
      setResultImages({
        base: data.base_image,
        differential: data.differential_image,
        sobel: data.sobel_image
      });
      
      setMse(data.metrics.mse);
      setPsnr(data.metrics.psnr);
      setSsim(data.metrics.ssim);
      setFsim(data.metrics.fsim);
      setBaselineMetrics(data.metrics.baseline || null);
      setExtraFrames(data.extra_frames || []);
      setMacValue(parseFloat(data.metrics.mac));
      setResultImage(data.base_image);
    } catch (error) {
      console.error('Error generating AI interpolation:', error);
      alert('Failed to generate. Make sure backend is running on port 5000.');
    } finally {
      setIsGenerating(false);
    }
  };

  const getObjectUrl = (file) => {
    return file ? URL.createObjectURL(file) : null;
  };

  const frame1Url = getObjectUrl(frame1);
  const frame3Url = getObjectUrl(frame3);

  const currentOutputImage = resultImages ? 
    (analysisLayer === "differential" ? resultImages.differential : 
     analysisLayer === "sobel" ? resultImages.sobel : resultImages.base) 
    : null;

  let playbackImages = [];
  let playbackLabels = [];
  
  if (resolution === '7.5min' && extraFrames.length === 2) {
    playbackImages = [frame1Url, extraFrames[0], currentOutputImage, extraFrames[1], frame3Url];
    playbackLabels = ["00:00 UTC", "00:07.5 UTC (AI)", "00:15 UTC (AI)", "00:22.5 UTC (AI)", "00:30 UTC"];
  } else {
    playbackImages = [frame1Url, currentOutputImage, frame3Url];
    playbackLabels = ["00:00 UTC", "00:15 UTC (AI)", "00:30 UTC"];
  }

  const getChartData = () => {
    if (!baselineMetrics || !fsim) return [];
    
    return [
      {
        name: 'PSNR (dB)',
        "AI Interpolator": parseFloat(psnr),
        "Linear Blend": parseFloat(baselineMetrics.psnr)
      },
      {
        name: 'SSIM (x100)',
        "AI Interpolator": parseFloat(ssim) * 100,
        "Linear Blend": parseFloat(baselineMetrics.ssim) * 100
      },
      {
        name: 'FSIM (x100)',
        "AI Interpolator": parseFloat(fsim) * 100,
        "Linear Blend": parseFloat(baselineMetrics.fsim) * 100
      }
    ];
  };

  const getQualitativeAssessment = () => {
    if (!baselineMetrics || !fsim) return null;
    
    const psnrDiff = (parseFloat(psnr) - parseFloat(baselineMetrics.psnr)).toFixed(2);
    const ssimVal = parseFloat(ssim);
    
    let text = `The Optical Flow AI model outperformed simple linear interpolation by +${psnrDiff} dB in PSNR. `;
    if (ssimVal > 0.90) {
      text += "An SSIM score above 0.90 indicates excellent structural preservation of the cyclone/cloud formations. ";
    }
    if (parseFloat(fsim) > 0.85) {
      text += "The high FSIM score confirms superior perceptual quality, meaning the generated imagery accurately maintains the low-level thermal feature representations critical for meteorological analysis.";
    }
    
    return text;
  };

  const chartData = getChartData();
  const qualitativeText = getQualitativeAssessment();

  return (
    <div className="min-h-screen bg-black text-slate-200 font-sans p-6">
      
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-white tracking-tight">SurplusGrid Orbital</h1>
        <p className="text-slate-400 mt-2">INSAT-3DS Temporal Enhancer (Optical Flow Interpolation)</p>
      </header>

      {/* Control Section */}
      <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mb-8 shadow-2xl">
        <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
          <Upload className="w-5 h-5 text-cyan-500" /> Control Panel
        </h2>

        <div className="mb-6 w-full md:w-1/2 lg:w-1/3">
          <label className="block text-sm font-medium text-slate-300 mb-2">Target Resolution</label>
          <select
            value={resolution}
            onChange={(e) => setResolution(e.target.value)}
            className="w-full bg-black border border-slate-700 text-slate-300 rounded-lg px-4 py-2.5 outline-none focus:border-cyan-500 transition-colors"
          >
            <option value="15min">15-minute intervals (2x Upscale)</option>
            <option value="7.5min">7.5-minute intervals (4x Upscale)</option>
          </select>
        </div>

        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-1">
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Upload Frame 00:00 (t=0)
            </label>
            <div className="relative border-2 border-dashed border-slate-700 bg-black hover:border-cyan-500/50 hover:bg-slate-900/50 rounded-xl p-4 transition-all group">
              <input 
                type="file" 
                accept="image/*"
                onChange={(e) => setFrame1(e.target.files?.[0] || null)}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 group-hover:text-cyan-400">
                  <Upload className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm text-slate-300 font-medium">
                    {frame1 ? frame1.name : "Select t=0 Image"}
                  </p>
                  <p className="text-xs text-slate-500">
                    {frame1 ? `${(frame1.size / 1024).toFixed(1)} KB` : "PNG, JPG up to 10MB"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex-1">
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Upload Frame 00:30 (t=2)
            </label>
            <div className="relative border-2 border-dashed border-slate-700 bg-black hover:border-cyan-500/50 hover:bg-slate-900/50 rounded-xl p-4 transition-all group">
              <input 
                type="file" 
                accept="image/*"
                onChange={(e) => setFrame3(e.target.files?.[0] || null)}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 group-hover:text-cyan-400">
                  <Upload className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm text-slate-300 font-medium">
                    {frame3 ? frame3.name : "Select t=2 Image"}
                  </p>
                  <p className="text-xs text-slate-500">
                    {frame3 ? `${(frame3.size / 1024).toFixed(1)} KB` : "PNG, JPG up to 10MB"}
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex items-end">
            <button
              onClick={handleGenerate}
              disabled={!frame1 || !frame3 || isGenerating}
              className={`w-full md:w-auto h-[76px] px-8 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg ${
                (!frame1 || !frame3) 
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  : 'bg-cyan-600 hover:bg-cyan-500 text-white hover:shadow-[0_0_20px_rgba(6,182,212,0.4)]'
              }`}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Cpu className="w-5 h-5" />
                  Generate AI Interpolation
                </>
              )}
            </button>
          </div>
        </div>

        {/* High-Velocity Warning */}
        {macValue > 10.0 && (
          <div className="mt-6 p-4 rounded-xl bg-orange-950/40 border border-orange-500/50 shadow-[0_0_20px_rgba(249,115,22,0.15)] flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center">
                <Zap className="w-5 h-5 text-orange-500 animate-pulse" />
              </div>
              <div>
                <h4 className="text-orange-400 font-bold tracking-wider">HIGH-VELOCITY DYNAMICS DETECTED</h4>
                <p className="text-orange-200/60 text-xs mt-1">Mean Absolute Change: {macValue} - Indicates rapid storm evolution.</p>
              </div>
            </div>
            <button className="px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white text-sm font-bold rounded-lg shadow-lg transition-colors whitespace-nowrap">
              Adaptive Interpolation
            </button>
          </div>
        )}

        <div className="mt-6 flex flex-col gap-4 border-t border-slate-800 pt-6">
          <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Scientific Analysis</h3>
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-300">
              <input 
                type="checkbox" 
                checked={analysisLayer === "differential"}
                onChange={(e) => setAnalysisLayer(e.target.checked ? "differential" : "default")}
                className="w-4 h-4 rounded border-slate-700 text-cyan-500 bg-black"
              />
              <span>Enable Differential Analysis (Heatmap)</span>
            </label>
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-400">Analysis Layer:</span>
              <select
                value={analysisLayer === "sobel" ? "sobel" : "default"}
                onChange={(e) => setAnalysisLayer(e.target.value)}
                disabled={analysisLayer === "differential"}
                className="bg-black border border-slate-700 text-slate-300 rounded-lg px-3 py-1.5 text-sm outline-none focus:border-cyan-500 disabled:opacity-50"
              >
                <option value="default">Default</option>
                <option value="sobel">Thermal Gradient (Sobel)</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* Metrics Section */}
      <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mb-8 shadow-2xl relative overflow-hidden">
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl"></div>
        <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2 relative z-10">
          <Zap className="w-5 h-5 text-yellow-400" />
          Validation Metrics
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 relative z-10">
          <div className="bg-black border border-slate-800 rounded-xl p-5 flex flex-col justify-center shadow-inner">
            <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-2">MSE (Mean Squared Error)</span>
            <span className="text-3xl font-bold text-slate-200">{mse}</span>
          </div>
          <div className="bg-black border border-slate-800 rounded-xl p-5 flex flex-col justify-center shadow-inner">
            <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-2">PSNR (Peak Signal-to-Noise)</span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-slate-200">{psnr}</span>
              <span className="text-sm text-slate-500 font-normal">dB</span>
            </div>
          </div>
          <div className="bg-black border border-slate-800 rounded-xl p-5 flex flex-col justify-center shadow-inner">
            <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-2">SSIM (Structural Similarity)</span>
            <span className="text-3xl font-bold text-cyan-400">{ssim}</span>
          </div>
          <div className="bg-black border border-slate-800 rounded-xl p-5 flex flex-col justify-center shadow-inner">
            <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-2">FSIM (Feature Similarity)</span>
            <span className="text-3xl font-bold text-purple-400">{fsim}</span>
          </div>
        </div>
      </section>

      {/* Validation Report (Plots & Assessment) */}
      {resultImage && baselineMetrics && (
        <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mb-8 shadow-2xl mt-8">
          <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
            <Zap className="w-5 h-5 text-purple-400" />
            Validation Report & Comparative Analysis
          </h2>
          
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="flex-1 bg-black border border-slate-800 rounded-xl p-6 shadow-inner">
              <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">AI vs Baseline Interpolation</h3>
              <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="name" stroke="#94a3b8" />
                    <YAxis stroke="#94a3b8" />
                    <RechartsTooltip 
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#f1f5f9' }}
                    />
                    <Legend />
                    <Bar dataKey="AI Interpolator" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Linear Blend" fill="#475569" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            <div className="flex-1 flex flex-col gap-4">
              <div className="bg-black border border-slate-800 rounded-xl p-6 shadow-inner flex-1">
                <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Qualitative Assessment</h3>
                <p className="text-slate-300 leading-relaxed">
                  {qualitativeText}
                </p>
                <div className="mt-6 pt-6 border-t border-slate-800">
                  <p className="text-xs text-slate-500">
                    <strong>Note:</strong> SSIM and FSIM values have been scaled by 100 in the comparative chart for visualization purposes alongside PSNR.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Visualizer Canvas */}
      <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl">
        <h2 className="text-xl font-semibold text-white mb-6">Observation Canvas</h2>
        
        <div className="flex flex-col lg:flex-row gap-4 h-[500px]">
          
          {/* Map 1 (Frame 1) */}
          <div className="flex-1 bg-black border border-slate-700 rounded-xl overflow-hidden relative group">
            <div className="absolute top-3 left-3 z-10 bg-black/60 backdrop-blur-md border border-slate-700 px-3 py-1.5 rounded text-xs font-bold text-slate-300">
              Map 1: Input (t=0)
            </div>
            
            {frame1Url ? (
              <img src={frame1Url} alt="Frame 1" className="w-full h-full object-contain" />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center opacity-40">
                <ImageIcon className="w-12 h-12 mb-2 text-slate-500" />
                <span className="font-mono text-sm text-slate-400 font-medium">Awaiting Upload</span>
              </div>
            )}
          </div>

          {/* Map 2 (AI Result) */}
          <div className="flex-1 bg-black border-2 border-cyan-900/50 rounded-xl overflow-hidden relative group shadow-[inset_0_0_50px_rgba(6,182,212,0.05)]">
            <div className="absolute top-3 left-3 z-10 bg-cyan-950/80 backdrop-blur-md border border-cyan-800 px-3 py-1.5 rounded text-xs font-bold text-cyan-400">
              Map 2: AI Interpolated (t=1)
            </div>
            
            {isGenerating ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 z-20">
                <Loader2 className="w-10 h-10 text-cyan-500 animate-spin mb-4" />
                <span className="text-cyan-400 font-medium animate-pulse">Running Optical Flow Model...</span>
              </div>
            ) : null}

            {currentOutputImage ? (
              <img src={currentOutputImage} alt="Interpolated Result" className="w-full h-full object-contain" />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center opacity-40">
                <Cpu className="w-12 h-12 mb-2 text-slate-500" />
                <span className="font-mono text-sm text-slate-400 font-medium">Awaiting Generation</span>
              </div>
            )}
          </div>

          {/* Map 3 (Frame 3) */}
          <div className="flex-1 bg-black border border-slate-700 rounded-xl overflow-hidden relative group">
            <div className="absolute top-3 left-3 z-10 bg-black/60 backdrop-blur-md border border-slate-700 px-3 py-1.5 rounded text-xs font-bold text-slate-300">
              Map 3: Input (t=2)
            </div>
            
            {frame3Url ? (
              <img src={frame3Url} alt="Frame 3" className="w-full h-full object-contain" />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center opacity-40">
                <ImageIcon className="w-12 h-12 mb-2 text-slate-500" />
                <span className="font-mono text-sm text-slate-400 font-medium">Awaiting Upload</span>
              </div>
            )}
          </div>

        </div>
      </section>

      {/* Time-Lapse Playback Section */}
      {resultImage && (
        <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl mt-8 flex flex-col items-center">
          <div className="w-full flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-white">Time-Lapse Playback</h2>
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="bg-cyan-600 hover:bg-cyan-500 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition-all shadow-lg"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              {isPlaying ? "Pause" : "Play"}
            </button>
          </div>
          
           <div className="w-full max-w-3xl aspect-square bg-black border border-slate-700 rounded-xl overflow-hidden relative shadow-[0_0_50px_rgba(6,182,212,0.1)]">
             <div className="absolute top-4 left-4 z-10 bg-black/60 backdrop-blur-md border border-slate-700 px-4 py-2 rounded-lg text-sm font-bold text-cyan-400">
               {playbackLabels[playbackIndex]}
             </div>
             
             {playbackImages[playbackIndex] ? (
               <img src={playbackImages[playbackIndex]} alt="Time-lapse frame" className="w-full h-full object-contain" />
             ) : (
               <div className="absolute inset-0 flex flex-col items-center justify-center opacity-40">
                 <Loader2 className="w-12 h-12 mb-2 text-slate-500 animate-spin" />
                 <span className="font-mono text-sm text-slate-400 font-medium">Loading Frame...</span>
               </div>
             )}
          </div>
          
          <div className="w-full max-w-3xl flex justify-end mt-4">
            <button
              onClick={() => window.open('http://localhost:5000/download_h5', '_blank')}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all border border-slate-700 shadow-lg"
            >
              <Database className="w-4 h-4 text-cyan-500" /> 
              Download Raw Tensor (.h5)
            </button>
          </div>
        </section>
      )}

    </div>
  );
}
