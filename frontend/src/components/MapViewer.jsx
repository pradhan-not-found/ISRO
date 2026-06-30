import React from 'react'

export default function MapViewer() {
  return (
    <div className="flex-1 flex p-2 min-h-[400px] gap-2">
      <div className="flex-1 relative rounded-xl border border-[var(--app-hairline)] liquid-card overflow-hidden">
        <div className="absolute inset-0 bg-noise opacity-[0.02] dark:opacity-10 pointer-events-none mix-blend-overlay"></div>
        <div className="absolute top-4 left-4 z-10 bg-[var(--app-canvas)]/80 backdrop-blur-md border border-[var(--app-hairline)] px-3 py-1.5 rounded-lg text-xs font-bold tracking-widest text-[var(--app-ink)] uppercase shadow-sm liquid-text">
          Original (30 min)
        </div>
        <div className="absolute inset-0 flex items-center justify-center opacity-40">
          <span className="font-mono text-sm text-[var(--app-muted)] font-medium">Map 1</span>
        </div>
      </div>
      
      <div className="flex-1 relative rounded-xl border border-[var(--app-hairline)] bg-[var(--app-soft)] overflow-hidden liquid-row">
        <div className="absolute inset-0 bg-noise opacity-[0.02] dark:opacity-[0.05] pointer-events-none mix-blend-overlay"></div>
        <div className="absolute top-4 left-4 z-10 bg-[var(--app-ink)] text-[var(--app-canvas)] border border-[var(--app-ink)] px-3 py-1.5 rounded-lg text-xs font-bold tracking-widest uppercase shadow-md card-elevate">
          AI Interpolated (7.5 min)
        </div>
        <div className="absolute inset-0 flex items-center justify-center opacity-40">
          <span className="font-mono text-sm text-[var(--app-muted)] font-medium">Map 2</span>
        </div>
      </div>
    </div>
  )
}
