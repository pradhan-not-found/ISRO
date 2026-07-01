import React, { useState, useEffect } from 'react';
import { Upload, Cpu, Loader2, Image as ImageIcon, Zap, Play, Pause, Database, BarChart2, Menu, Calendar, Share2, Plus, Minus, ChevronsLeft, ChevronsRight, Download } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend } from 'recharts';
import navImg from '../assets/navbar.png';

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
  const [comparisonMode, setComparisonMode] = useState(false);
  const [sliderPosition, setSliderPosition] = useState(50);

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
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 font-sans">
      
      {/* Top Navbar Header (White) */}
      <nav className="w-full bg-white px-6 md:px-8 py-3 flex items-center justify-start border-b border-slate-100">
        <img src={navImg} alt="ISRO Navbar" className="h-16 md:h-20 object-contain" />
      </nav>

      {/* Secondary ISRO Blue Navigation Bar */}
      <div className="w-full bg-[#1b5597] text-white shadow-md text-sm font-medium flex flex-wrap items-center">
        <div className="px-5 py-2.5 bg-[#144275] cursor-pointer border-r border-white/10">Dashboard</div>
        <div className="px-5 py-2.5 hover:bg-white/10 cursor-pointer border-r border-white/10 flex items-center gap-1">Optical Flow <span className="text-[10px] opacity-70">▼</span></div>
        <div className="px-5 py-2.5 hover:bg-white/10 cursor-pointer border-r border-white/10 flex items-center gap-1">Heatmaps <span className="text-[10px] opacity-70">▼</span></div>
        <div className="px-5 py-2.5 hover:bg-white/10 cursor-pointer border-r border-white/10 flex items-center gap-1">Time-Lapse <span className="text-[10px] opacity-70">▼</span></div>
        <div className="px-5 py-2.5 hover:bg-white/10 cursor-pointer border-r border-white/10 flex items-center gap-1">Validation Metrics <span className="text-[10px] opacity-70">▼</span></div>
        <div className="px-5 py-2.5 hover:bg-white/10 cursor-pointer border-r border-white/10 flex items-center gap-1">Data Access <span className="text-[10px] opacity-70">▼</span></div>
        <div className="px-5 py-2.5 hover:bg-white/10 cursor-pointer border-r border-white/10">Model Config</div>
        <div className="px-5 py-2.5 hover:bg-white/10 cursor-pointer border-r border-white/10">Tools</div>
        <div className="px-5 py-2.5 hover:bg-white/10 cursor-pointer border-r border-white/10">Help</div>
      </div>

      <div className="max-w-7xl mx-auto p-6 md:p-8">
        <header className="mb-8 border-b border-slate-200 pb-6">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">INSAT-3DS Temporal Enhancer</h1>
          <p className="text-slate-500 mt-2 font-medium">Advanced Optical Flow Interpolation Dashboard</p>
        </header>



        {/* Control Section */}
        <section className="bg-white border border-slate-200 rounded-xl p-6 mb-8 shadow-sm">
          <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
            <Upload className="w-5 h-5 text-blue-600" /> Image Input & Controls
          </h2>

          <div className="mb-6 w-full md:w-1/2 lg:w-1/3">
            <label className="block text-sm font-semibold text-slate-700 mb-2">Target Resolution</label>
            <select
              value={resolution}
              onChange={(e) => setResolution(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 text-slate-800 rounded-lg px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all font-medium"
            >
              <option value="15min">15-minute intervals (2x Upscale)</option>
              <option value="7.5min">7.5-minute intervals (4x Upscale)</option>
            </select>
          </div>

          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-1">
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Upload Frame 00:00 (t=0)
              </label>
              <div className="relative border-2 border-dashed border-slate-300 bg-slate-50 hover:border-blue-400 hover:bg-blue-50/50 rounded-xl p-4 transition-all group">
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={(e) => setFrame1(e.target.files?.[0] || null)}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-white shadow-sm border border-slate-200 flex items-center justify-center text-slate-500 group-hover:text-blue-500 transition-colors">
                    <Upload className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-700 font-semibold">
                      {frame1 ? frame1.name : "Select t=0 Image"}
                    </p>
                    <p className="text-xs text-slate-500 font-medium">
                      {frame1 ? `${(frame1.size / 1024).toFixed(1)} KB` : "PNG, JPG up to 10MB"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex-1">
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Upload Frame 00:30 (t=2)
              </label>
              <div className="relative border-2 border-dashed border-slate-300 bg-slate-50 hover:border-blue-400 hover:bg-blue-50/50 rounded-xl p-4 transition-all group">
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={(e) => setFrame3(e.target.files?.[0] || null)}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-white shadow-sm border border-slate-200 flex items-center justify-center text-slate-500 group-hover:text-blue-500 transition-colors">
                    <Upload className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-700 font-semibold">
                      {frame3 ? frame3.name : "Select t=2 Image"}
                    </p>
                    <p className="text-xs text-slate-500 font-medium">
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
                className={`w-full md:w-auto h-[76px] px-8 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-sm ${
                  (!frame1 || !frame3) 
                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 text-white hover:shadow-md'
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
                    Run Interpolation
                  </>
                )}
              </button>
            </div>
          </div>

          {/* High-Velocity Warning */}
          {macValue > 10.0 && (
            <div className="mt-6 p-4 rounded-xl bg-orange-50 border border-orange-200 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                  <Zap className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <h4 className="text-orange-700 font-bold tracking-wide text-sm">HIGH-VELOCITY DYNAMICS DETECTED</h4>
                  <p className="text-orange-600/80 text-xs mt-1 font-medium">Mean Absolute Change: {macValue} - Indicates rapid storm evolution.</p>
                </div>
              </div>
              <button className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white text-sm font-bold rounded-lg shadow-sm transition-colors whitespace-nowrap">
                Adaptive Mode
              </button>
            </div>
          )}

          <div className="mt-6 flex flex-col gap-4 border-t border-slate-100 pt-6">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Analysis Layers</h3>
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-slate-700">
                <input 
                  type="checkbox" 
                  checked={analysisLayer === "differential"}
                  onChange={(e) => setAnalysisLayer(e.target.checked ? "differential" : "default")}
                  className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <span>Enable Differential Heatmap</span>
              </label>
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-slate-500">Secondary Layer:</span>
                <select
                  value={analysisLayer === "sobel" ? "sobel" : "default"}
                  onChange={(e) => setAnalysisLayer(e.target.value)}
                  disabled={analysisLayer === "differential"}
                  className="bg-white border border-slate-300 text-slate-700 rounded-lg px-3 py-1.5 text-sm font-medium outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:opacity-50 disabled:bg-slate-50"
                >
                  <option value="default">None</option>
                  <option value="sobel">Thermal Gradient (Sobel)</option>
                </select>
              </div>
            </div>
          </div>
        </section>

        {/* Metrics Section */}
        <section className="bg-white border border-slate-200 rounded-xl p-6 mb-8 shadow-sm">
          <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
            <BarChart2 className="w-5 h-5 text-blue-600" />
            Validation Metrics
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 flex flex-col justify-center">
              <span className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-2">MSE</span>
              <span className="text-2xl font-black text-slate-800">{mse}</span>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 flex flex-col justify-center">
              <span className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-2">PSNR</span>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-black text-slate-800">{psnr}</span>
                <span className="text-sm text-slate-500 font-bold">dB</span>
              </div>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 flex flex-col justify-center">
              <span className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-2">SSIM</span>
              <span className="text-2xl font-black text-blue-600">{ssim}</span>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 flex flex-col justify-center">
              <span className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-2">FSIM</span>
              <span className="text-2xl font-black text-indigo-600">{fsim}</span>
            </div>
          </div>
        </section>

        {/* Visualizer Canvas */}
        <section className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-blue-600" /> Observation Canvas
            </h2>
            <label className="flex items-center gap-2 cursor-pointer text-sm font-bold text-slate-700">
              <input type="checkbox" checked={comparisonMode} onChange={(e)=>setComparisonMode(e.target.checked)} className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
              <span>Slider Comparison Mode</span>
            </label>
          </div>
          
          {comparisonMode && currentOutputImage && frame1Url ? (
            <div className="w-full h-[500px] bg-slate-100 border border-slate-300 rounded-xl relative overflow-hidden select-none cursor-ew-resize"
                 onMouseMove={(e) => {
                   const rect = e.currentTarget.getBoundingClientRect();
                   const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
                   setSliderPosition((x / rect.width) * 100);
                 }}
                 onTouchMove={(e) => {
                   const rect = e.currentTarget.getBoundingClientRect();
                   const x = Math.max(0, Math.min(e.touches[0].clientX - rect.left, rect.width));
                   setSliderPosition((x / rect.width) * 100);
                 }}
            >
               <div className="absolute top-4 left-4 z-20 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-lg text-xs font-bold text-slate-700 shadow-sm pointer-events-none">
                 t=0 (Ground Truth)
               </div>
               <div className="absolute top-4 right-4 z-20 bg-blue-600/90 backdrop-blur-sm px-3 py-1.5 rounded-lg text-xs font-bold text-white shadow-sm pointer-events-none">
                 t=1 (AI Prediction)
               </div>
               <img src={frame1Url} className="absolute inset-0 w-full h-full object-contain pointer-events-none" draggable="false" />
               <img src={currentOutputImage} className="absolute inset-0 w-full h-full object-contain pointer-events-none" style={{ clipPath: `polygon(0 0, ${sliderPosition}% 0, ${sliderPosition}% 100%, 0 100%)` }} draggable="false" />
               <div className="absolute top-0 bottom-0 w-1 bg-white shadow-[0_0_10px_rgba(0,0,0,0.5)] pointer-events-none" style={{ left: `calc(${sliderPosition}% - 2px)` }}>
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-blue-600 rounded-full shadow-lg flex items-center justify-center border-2 border-white">
                    <ChevronsLeft className="w-4 h-4 text-white -mr-1" />
                    <ChevronsRight className="w-4 h-4 text-white -ml-1" />
                  </div>
               </div>
            </div>
          ) : (
          <div className="flex flex-col lg:flex-row gap-4 h-[400px]">
            {/* Map 1 */}
            <div className="flex-1 bg-slate-100 border border-slate-200 rounded-xl overflow-hidden relative group flex items-center justify-center">
              <div className="absolute top-3 left-3 z-10 bg-white/90 backdrop-blur-sm border border-slate-200 px-3 py-1.5 rounded-lg text-xs font-bold text-slate-700 shadow-sm">
                Map 1: Input (t=0)
              </div>
              
              {frame1Url ? (
                <img src={frame1Url} alt="Frame 1" className="w-full h-full object-contain" />
              ) : (
                <div className="flex flex-col items-center justify-center text-slate-400">
                  <ImageIcon className="w-10 h-10 mb-2 opacity-50" />
                  <span className="text-sm font-semibold">Awaiting Upload</span>
                </div>
              )}
            </div>

            {/* Map 2 (AI Result) */}
            <div className="flex-1 bg-blue-50/50 border-2 border-blue-200 rounded-xl overflow-hidden relative group flex items-center justify-center">
              <div className="absolute top-3 left-3 z-10 bg-blue-600/90 backdrop-blur-sm border border-blue-700 px-3 py-1.5 rounded-lg text-xs font-bold text-white shadow-sm">
                Map 2: Interpolated (t=1)
              </div>
              
              {isGenerating ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 z-20 backdrop-blur-sm">
                  <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-3" />
                  <span className="text-blue-700 font-bold text-sm">Processing Data...</span>
                </div>
              ) : null}

              {currentOutputImage ? (
                <img src={currentOutputImage} alt="Interpolated Result" className="w-full h-full object-contain" />
              ) : (
                <div className="flex flex-col items-center justify-center text-slate-400">
                  <Cpu className="w-10 h-10 mb-2 opacity-50" />
                  <span className="text-sm font-semibold">Awaiting Generation</span>
                </div>
              )}
            </div>

            {/* Map 3 */}
            <div className="flex-1 bg-slate-100 border border-slate-200 rounded-xl overflow-hidden relative group flex items-center justify-center">
              <div className="absolute top-3 left-3 z-10 bg-white/90 backdrop-blur-sm border border-slate-200 px-3 py-1.5 rounded-lg text-xs font-bold text-slate-700 shadow-sm">
                Map 3: Input (t=2)
              </div>
              
              {frame3Url ? (
                <img src={frame3Url} alt="Frame 3" className="w-full h-full object-contain" />
              ) : (
                <div className="flex flex-col items-center justify-center text-slate-400">
                  <ImageIcon className="w-10 h-10 mb-2 opacity-50" />
                  <span className="text-sm font-semibold">Awaiting Upload</span>
                </div>
              )}
            </div>
          </div>
          )}
        </section>

        {/* Validation Report (Plots & Assessment) */}
        {resultImage && baselineMetrics && (
          <section className="bg-white border border-slate-200 rounded-xl p-6 mb-8 shadow-sm">
            <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
              <BarChart2 className="w-5 h-5 text-blue-600" />
              Performance Report
            </h2>
            
            <div className="flex flex-col lg:flex-row gap-8">
              <div className="flex-1 bg-slate-50 border border-slate-200 rounded-xl p-6">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-6">AI vs Baseline Models</h3>
                <div className="h-[250px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                      <XAxis dataKey="name" stroke="#64748b" axisLine={false} tickLine={false} />
                      <YAxis stroke="#64748b" axisLine={false} tickLine={false} />
                      <RechartsTooltip 
                        contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '8px', color: '#1e293b', fontWeight: 'bold', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      />
                      <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px', fontSize: '13px', fontWeight: 'bold' }} />
                      <Bar dataKey="AI Interpolator" fill="#1b5597" radius={[6, 6, 0, 0]} maxBarSize={35} />
                      <Bar dataKey="Linear Blend" fill="#94a3b8" radius={[6, 6, 0, 0]} maxBarSize={35} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
              
              <div className="flex-1 flex flex-col gap-4">
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 flex-1 flex flex-col justify-center">
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Qualitative Assessment</h3>
                  <p className="text-slate-700 leading-relaxed font-medium">
                    {qualitativeText}
                  </p>
                  <div className="mt-6 pt-6 border-t border-slate-200">
                    <p className="text-xs text-slate-500 font-medium">
                      <strong>Note:</strong> SSIM and FSIM values have been scaled by 100 in the comparative chart for visualization alongside PSNR.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Time-Lapse Playback Section (MOSDAC UI Clone) */}
        {resultImage && (
          <section className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col items-center mb-8">
            <div className="w-full flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Play className="w-5 h-5 text-[#1b5597]" /> Satellite Data Viewer
              </h2>
              <div className="flex gap-3">
                 <button
                  onClick={() => window.open('http://localhost:5000/download_h5', '_blank')}
                  className="bg-white hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 border border-slate-300 shadow-sm"
                >
                  <Database className="w-4 h-4 text-[#1b5597]" /> 
                  .h5
                </button>
                <button
                  onClick={() => {
                    const link = document.createElement('a');
                    link.href = currentOutputImage;
                    link.download = `interpolated_frame.png`;
                    link.click();
                  }}
                  className="bg-[#1b5597] hover:bg-[#144275] text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 shadow-sm"
                >
                  <Download className="w-4 h-4" /> 
                  Export PNG
                </button>
              </div>
            </div>

            {/* Black MOSDAC Container */}
            <div className="w-full bg-black rounded-lg overflow-hidden flex flex-col relative shadow-[inset_0_0_100px_rgba(0,0,0,0.8)] border border-slate-800" style={{ height: '500px' }}>
              
              {/* Top Controls */}
              <div className="absolute top-0 left-0 right-0 p-4 flex justify-between z-20 pointer-events-none">
                <div className="pointer-events-auto cursor-pointer p-2 hover:bg-white/10 rounded transition-colors">
                  <Menu className="text-white w-6 h-6" />
                </div>
                <div className="text-white font-medium text-sm md:text-lg drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                  {playbackLabels[playbackIndex]} (India Standard Time)
                </div>
                <div className="flex flex-col gap-2 pointer-events-auto">
                  <div className="bg-[#1b5597] p-2 rounded cursor-pointer hover:bg-[#144275] shadow-lg transition-colors"><Calendar className="text-white w-5 h-5" /></div>
                  <div className="bg-black/50 p-2 rounded cursor-pointer hover:bg-white/20 mt-4 transition-colors"><Share2 className="text-[#1b5597] w-5 h-5" /></div>
                  <div className="bg-[#1b5597] p-1 rounded-t cursor-pointer hover:bg-[#144275] mt-2 flex justify-center transition-colors"><Plus className="text-white w-5 h-5" /></div>
                  <div className="bg-[#1b5597] p-1 rounded-b cursor-pointer hover:bg-[#144275] flex justify-center mt-[1px] transition-colors"><Minus className="text-white w-5 h-5" /></div>
                </div>
              </div>

              {/* Central Globe/Image Container */}
              <div className="flex-1 w-full h-full relative flex items-center justify-center overflow-hidden z-0 pt-12 pb-24">
                {playbackImages[playbackIndex] ? (
                   <img src={playbackImages[playbackIndex]} alt="Time-lapse frame" className="w-[70%] max-w-[500px] h-auto object-contain rounded-full shadow-[0_0_80px_rgba(255,255,255,0.15)] opacity-90 transition-opacity" style={{ filter: 'grayscale(100%) contrast(1.1) brightness(1.1)' }} />
                 ) : (
                   <Loader2 className="w-12 h-12 animate-spin text-white opacity-50" />
                 )}
              </div>

              {/* Bottom Timeline Overlay */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/80 to-transparent z-20 flex flex-col justify-end px-6 pb-6 pointer-events-none">
                 
                 {/* Timeline Line */}
                 <div className="relative w-full h-1 bg-[#1b5597] mb-8 pointer-events-auto mt-12">
                    {playbackImages.map((_, i) => {
                       const pos = (i / (playbackImages.length - 1)) * 100;
                       const isActive = i === playbackIndex;
                       return (
                         <div key={i} className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 flex flex-col items-center" style={{ left: `${pos}%` }}>
                           <div className={`mb-3 text-[10px] md:text-xs font-mono px-2 py-0.5 rounded whitespace-nowrap transition-all ${isActive ? 'opacity-100 font-bold text-white bg-black' : 'opacity-70 text-slate-300 bg-black/50'}`}>
                             {playbackLabels[i].split(" ")[0]}
                           </div>
                           <div 
                             onClick={() => setPlaybackIndex(i)}
                             className={`rounded-full cursor-pointer transition-all shadow-[0_0_10px_rgba(27,85,151,0.5)] ${isActive ? 'w-6 h-6 bg-[#1b5597] border-[3px] border-white' : 'w-3 h-3 bg-[#cbd5e1] hover:bg-white hover:scale-125'}`}
                           ></div>
                         </div>
                       )
                    })}
                 </div>

                 {/* Playback Controls Row */}
                 <div className="flex items-center justify-between w-full pointer-events-auto">
                    <div className="flex items-center gap-6">
                       <div className="flex items-center text-[#1b5597] cursor-pointer hover:text-blue-400 transition-colors">
                         <ChevronsLeft className="w-5 h-5" />
                         <div className="h-4 w-[2px] bg-[#1b5597] mx-1 opacity-50"></div>
                         <ChevronsRight className="w-5 h-5" />
                       </div>
                       
                       {/* Custom Slider Toggle */}
                       <div className="flex items-center gap-3">
                         <div 
                           onClick={() => setIsPlaying(!isPlaying)}
                           className="w-14 h-5 bg-slate-800 rounded-full relative cursor-pointer flex items-center border border-slate-600 shadow-inner"
                         >
                            <div className={`w-6 h-6 bg-[#1b5597] rounded-full absolute shadow-[0_0_10px_rgba(27,85,151,0.5)] transition-all ${isPlaying ? 'left-8' : '-left-1'}`}></div>
                         </div>
                       </div>

                       <select className="bg-[#1b5597] text-white text-xs px-3 py-1.5 rounded outline-none cursor-pointer border border-[#144275] hover:bg-[#144275] transition-colors shadow-md font-medium">
                         <option>{playbackImages.length} Frames</option>
                       </select>
                    </div>

                    <div className="text-white border border-white/30 p-1.5 rounded cursor-pointer hover:bg-white/10 transition-colors">
                       <ChevronsLeft className="w-4 h-4 transform rotate-90" />
                    </div>
                 </div>
              </div>

            </div>
          </section>
        )}
        
      </div>
    </div>
  );
}
