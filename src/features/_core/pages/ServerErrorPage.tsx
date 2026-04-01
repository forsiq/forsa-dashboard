import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ServerCrash, RefreshCcw, Home, Terminal } from 'lucide-react';

export const ServerErrorPage = () => {
  const navigate = useNavigate();
  const traceId = `ERR-${Math.floor(Math.random() * 100000).toString(16).toUpperCase()}`;

  return (
    <div className="min-h-screen bg-obsidian-outer flex flex-col items-center justify-center p-6 text-center relative overflow-hidden">
      {/* Background Glitch Effect */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
         <div className="absolute top-[20%] left-[10%] w-64 h-64 bg-danger/10 rounded-full blur-[100px]" />
         <div className="absolute bottom-[20%] right-[10%] w-96 h-96 bg-brand/5 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 animate-in fade-in zoom-in-95 duration-500">
        <div className="w-24 h-24 mx-auto mb-8 rounded-full bg-obsidian-panel border border-white/10 flex items-center justify-center shadow-2xl relative">
          <ServerCrash className="w-10 h-10 text-danger" />
          <div className="absolute inset-0 border-2 border-danger/20 rounded-full animate-ping opacity-20" />
        </div>

        <h1 className="text-5xl font-black text-zinc-text tracking-tighter uppercase italic mb-2">
          System <span className="text-danger">Malfunction</span>
        </h1>
        <p className="text-[10px] font-black text-zinc-muted uppercase tracking-[0.4em] mb-8">
          Error 500 • Critical Exception
        </p>

        <div className="max-w-md mx-auto bg-obsidian-panel border border-white/5 rounded-sm p-6 mb-8 text-left">
           <div className="flex items-center gap-2 mb-4 border-b border-white/5 pb-2">
              <Terminal className="w-4 h-4 text-zinc-muted" />
              <span className="text-[10px] font-mono text-zinc-muted">System Diagnostic</span>
           </div>
           <div className="space-y-2 font-mono text-[10px] text-zinc-secondary">
              <p>&gt; Initiating recovery protocol...</p>
              <p className="text-danger">&gt; Error: Upstream dependency timeout.</p>
              <p>&gt; Trace ID: <span className="text-zinc-text font-bold">{traceId}</span></p>
              <p>&gt; Please contact your administrator if this persists.</p>
           </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-brand text-obsidian-outer rounded-sm text-[10px] font-black uppercase tracking-widest hover:opacity-90 transition-all flex items-center justify-center gap-2"
          >
            <RefreshCcw className="w-3.5 h-3.5" /> Reload System
          </button>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-white/5 border border-white/10 text-zinc-text rounded-sm text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all flex items-center justify-center gap-2"
          >
            <Home className="w-3.5 h-3.5" /> Return to Base
          </button>
        </div>
      </div>

      <div className="absolute bottom-6 left-0 right-0 text-center">
         <p className="text-[9px] font-mono text-zinc-muted/40 uppercase">ZoneVast Enterprise • {traceId}</p>
      </div>
    </div>
  );
};
