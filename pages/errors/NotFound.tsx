
import React from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, ArrowLeft } from 'lucide-react';

export const NotFound = () => {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center space-y-6">
      <div className="w-16 h-16 rounded-full bg-danger/5 border border-danger/20 flex items-center justify-center text-danger animate-pulse">
        <AlertCircle className="w-8 h-8" />
      </div>
      <div>
        <h1 className="text-3xl font-black text-zinc-text tracking-tighter uppercase italic">Node Not Found</h1>
        <p className="text-[10px] font-bold text-zinc-muted uppercase tracking-[0.3em] mt-2">Error 404 • The requested resource does not exist</p>
      </div>
      <Link 
        to="/" 
        className="flex items-center gap-2 px-6 py-2.5 bg-white/5 border border-white/10 rounded-sm text-[10px] font-black text-zinc-text hover:bg-white/10 transition-all uppercase tracking-widest"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> Return to Root Node
      </Link>
    </div>
  );
};
