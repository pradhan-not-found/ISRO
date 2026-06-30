import React from 'react'
import { Activity, ThermometerSnowflake, Maximize, Layers } from 'lucide-react'

export default function MetricsPanel() {
  return (
    <>
      <div>
        <h3 className="text-sm font-semibold mb-6 flex items-center gap-2 text-[var(--app-ink)] border-b border-[var(--app-hairline)] pb-4">
          <Activity size={18} className="text-[var(--app-info)]" />
          Validation Metrics
        </h3>
        
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="flex flex-col border-b border-[var(--app-hairline)] pb-2">
            <div className="text-[10px] font-semibold text-[var(--app-muted)] uppercase tracking-widest mb-1">SSIM</div>
            <div className="text-lg font-bold text-[var(--app-ink)] font-mono liquid-text">0.94</div>
          </div>
          <div className="flex flex-col border-b border-[var(--app-hairline)] pb-2">
            <div className="text-[10px] font-semibold text-[var(--app-muted)] uppercase tracking-widest mb-1">MSE</div>
            <div className="text-lg font-bold text-[var(--app-ink)] font-mono liquid-text">0.02</div>
          </div>
          <div className="flex flex-col border-b border-[var(--app-hairline)] pb-2">
            <div className="text-[10px] font-semibold text-[var(--app-muted)] uppercase tracking-widest mb-1">PSNR</div>
            <div className="text-lg font-bold text-[var(--app-ink)] font-mono liquid-text">34.2<span className="text-[9px] ml-1 text-[var(--app-muted)]">dB</span></div>
          </div>
          <div className="flex flex-col border-b border-[var(--app-hairline)] pb-2">
            <div className="text-[10px] font-semibold text-[var(--app-muted)] uppercase tracking-widest mb-1">FSIM</div>
            <div className="text-lg font-bold text-[var(--app-ink)] font-mono liquid-text">0.96</div>
          </div>
        </div>
        
        <div className="flex flex-col gap-3 mb-6">
          <div className="liquid-shell relative p-4 rounded-xl border border-transparent flex items-center justify-between mt-2 overflow-hidden shadow-sm card-elevate group">
            <div className="liquid-inner absolute inset-0 transition-opacity group-hover:opacity-80"></div>
            <div className="relative z-10">
              <div className="text-[10px] font-bold text-[var(--app-ink)] uppercase tracking-widest mb-1 opacity-80">Cold Core Preservation</div>
              <div className="text-2xl font-black text-[var(--app-ink)] font-mono liquid-text">98.5%</div>
            </div>
            <ThermometerSnowflake className="text-[var(--app-info)] relative z-10 opacity-70 group-hover:scale-110 transition-transform" size={28} />
          </div>
        </div>
      </div>

      <div className="flex-1 min-h-[180px] border border-[var(--app-hairline)] rounded-xl bg-[var(--app-canvas)] p-4 relative flex flex-col shadow-inner liquid-row">
        <h4 className="text-[10px] font-bold text-[var(--app-ink)] uppercase tracking-widest mb-auto opacity-70">CTT Histogram</h4>
        <div className="flex-1 flex items-center justify-center opacity-40">
           <span className="font-mono text-[11px] text-[var(--app-muted)]">Plotly Chart</span>
        </div>
      </div>

      <div className="mt-4">
        <h3 className="text-[10px] font-bold mb-4 uppercase tracking-widest text-[var(--app-muted)]">Analysis Layers</h3>
        <div className="space-y-2">
          <label className="flex items-center justify-between cursor-pointer group p-3 rounded-xl hover:bg-[var(--app-soft)] transition-colors border border-transparent hover:border-[var(--app-hairline)] liquid-row">
            <div className="flex items-center gap-3">
              <div className="text-[var(--app-muted)] group-hover:text-[var(--app-ink)] transition-colors"><Layers size={16} /></div>
              <span className="text-sm font-semibold text-[var(--app-ink)]">Error Heatmap</span>
            </div>
            <input type="checkbox" className="w-4 h-4 accent-[var(--app-ink)] rounded cursor-pointer" />
          </label>
          <label className="flex items-center justify-between cursor-pointer group p-3 rounded-xl hover:bg-[var(--app-soft)] transition-colors border border-transparent hover:border-[var(--app-hairline)] liquid-row">
            <div className="flex items-center gap-3">
              <div className="text-[var(--app-muted)] group-hover:text-[var(--app-ink)] transition-colors"><Maximize size={16} /></div>
              <span className="text-sm font-semibold text-[var(--app-ink)]">Optical Flow Vectors</span>
            </div>
            <input type="checkbox" className="w-4 h-4 accent-[var(--app-ink)] rounded cursor-pointer" />
          </label>
        </div>
      </div>
    </>
  )
}
