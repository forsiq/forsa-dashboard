import React from 'react';

interface FetchingOverlayProps {
  message?: string;
}

export function FetchingOverlay({ message }: FetchingOverlayProps) {
  return (
    <div
      className="absolute inset-0 z-[80] flex items-start justify-center pt-2 pointer-events-none"
      aria-busy="true"
      aria-live="polite"
    >
      <div className="flex items-center gap-2 bg-obsidian-card/80 backdrop-blur-sm border border-white/[0.05] rounded-lg px-3 py-1.5 shadow-lg">
        <div className="w-3 h-3 border-2 border-brand border-t-transparent rounded-full animate-spin" />
        {message && (
          <span className="text-[10px] font-black uppercase tracking-widest text-zinc-muted">
            {message}
          </span>
        )}
      </div>
    </div>
  );
}
