
import React from 'react';
import { Hammer, Zap, RefreshCcw } from 'lucide-react';
import { Logo } from '../../components/Logo';

export const Maintenance = () => {
  return (
    <div className="min-h-screen bg-obsidian-outer flex flex-col items-center justify-center p-6 text-center">
      <div className="max-w-md space-y-8 animate-fade-up">
        <div className="flex flex-col items-center gap-4">
           <Logo className="w-12 h-12 opacity-50" />
           <div className="h-px w-24 bg-white/10" />
        </div>
        
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-brand/5 border border-brand/20 text-brand text-[9px] font-black uppercase tracking-[0.3em] rounded-sm animate-pulse">
            <RefreshCcw className="w-3 h-3" /> Node Synchronization in Progress
          </div>
          <h1 className="text-4xl font-black text-zinc-text tracking-tighter uppercase italic leading-none">
            System <span className="text-brand/60">Optimizing</span>
          </h1>
          <p className="text-[11px] font-black text-zinc-muted uppercase tracking-[0.4em]">Core Infrastructure Upgrade Cycle Active</p>
        </div>

        <p className="text-xs font-bold text-zinc-secondary leading-relaxed uppercase italic opacity-60">
          We are currently performing a global data schema migration and node optimization. All authoritative services are temporarily offline to ensure data integrity.
        </p>

        <div className="grid grid-cols-3 gap-4 py-8">
           {[
             { label: 'Cloud Sync', val: '92%' },
             { label: 'Auth Node', val: 'OK' },
             { label: 'ETA', val: '14m' }
           ].map((stat, i) => (
             <div key={i} className="p-3 bg-white/[0.02] border border-white/5 rounded-sm">
                <p className="text-[8px] font-black text-zinc-muted uppercase tracking-widest mb-1">{stat.label}</p>
                <p className="text-xs font-black text-brand tracking-tight">{stat.val}</p>
             </div>
           ))}
        </div>

        <button className="px-8 py-3 bg-white/5 border border-white/10 text-[10px] font-black text-zinc-text uppercase tracking-widest hover:bg-white/10 transition-all">
          Retry Uplink
        </button>
      </div>
    </div>
  );
};
