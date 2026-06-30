import React from 'react'
import { Play, SkipForward, SkipBack } from 'lucide-react'

export default function TimelineScrubber() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between text-[11px] text-[var(--app-muted)] font-mono font-semibold tracking-widest uppercase">
        <span>00:00 UTC</span>
        <span>06:00 UTC</span>
      </div>
      
      <div className="flex items-center gap-8">
        <div className="flex gap-4 text-[var(--app-ink)] items-center">
          <button className="hover:text-[var(--app-muted)] transition-colors"><SkipBack size={18} /></button>
          
          <button className="liquid-shell relative w-10 h-10 rounded-full flex items-center justify-center hover:scale-105 transition-transform group shadow-md">
            <div className="liquid-inner absolute inset-0 rounded-full group-hover:opacity-80 transition-opacity"></div>
            <Play size={16} className="ml-1 text-[var(--app-ink)] relative z-10" />
          </button>
          
          <button className="hover:text-[var(--app-muted)] transition-colors"><SkipForward size={18} /></button>
        </div>
        
        <div className="flex-1 relative h-1.5 flex items-center">
          <div className="absolute inset-x-0 h-1.5 bg-[var(--app-hairline)] rounded-full overflow-hidden shadow-inner">
            <div className="absolute top-0 left-0 bottom-0 w-1/3 bg-[var(--app-ink)]"></div>
          </div>
          <div className="absolute left-1/3 -ml-2.5 w-5 h-5 bg-[var(--app-canvas)] border border-[var(--app-hairline)] rounded-full shadow-md cursor-pointer hover:scale-125 transition-transform z-10 card-elevate"></div>
          
          {/* Tick marks */}
          <div className="absolute inset-x-0 flex justify-between px-2 pointer-events-none">
            {[...Array(20)].map((_, i) => (
              <div key={i} className={`w-[2px] rounded-full z-0 ${i % 4 === 0 ? 'bg-[var(--app-ink)] h-2.5 -mt-0.5' : 'bg-[var(--app-muted)] h-1.5 opacity-50'}`}></div>
            ))}
          </div>
        </div>
        
        <div className="text-[11px] font-mono text-[var(--app-ink)] border border-[var(--app-hairline)] bg-[var(--app-soft)] font-bold tracking-widest px-2.5 py-1.5 rounded-lg shadow-sm liquid-row">1X SPEED</div>
      </div>
    </div>
  )
}
