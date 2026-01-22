
import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, Lock } from 'lucide-react';

export const AccessDenied = () => {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center space-y-6">
      <div className="relative">
        <div className="w-16 h-16 rounded-full bg-danger/5 border border-danger/20 flex items-center justify-center text-danger animate-pulse">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <Lock className="absolute -bottom-1 -right-1 w-6 h-6 text-zinc-muted fill-obsidian-outer" />
      </div>
      <div>
        <h1 className="text-3xl font-black text-zinc-text tracking-tighter uppercase italic">Access Restricted</h1>
        <p className="text-[10px] font-bold text-zinc-muted uppercase tracking-[0.3em] mt-2 max-w-sm">Insufficient Clearance Level • Protocol 403 Active</p>
      </div>
      <p className="text-[11px] font-medium text-zinc-secondary uppercase max-w-md">Your credentials do not possess the required authentication token to access this secure node sector. Contact your catalog administrator for permission elevation.</p>
      <Link 
        to="/" 
        className="flex items-center gap-2 px-6 py-2.5 bg-white/5 border border-white/10 rounded-sm text-[10px] font-black text-zinc-text hover:bg-white/10 transition-all uppercase tracking-widest"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> Request Root Re-routing
      </Link>
    </div>
  );
};
