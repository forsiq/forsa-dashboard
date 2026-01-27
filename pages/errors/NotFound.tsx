
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AlertCircle, ArrowLeft, Home, Search, HelpCircle } from 'lucide-react';
import { AmberCard } from '../../amber-ui/components/AmberCard';

export const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 animate-fade-up">
      <div className="relative mb-8">
        <div className="w-24 h-24 rounded-full bg-obsidian-panel border border-white/5 flex items-center justify-center relative z-10 shadow-2xl">
           <span className="text-4xl font-black text-zinc-muted/20 select-none">404</span>
           <AlertCircle className="w-10 h-10 text-danger absolute" />
        </div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-danger/5 rounded-full blur-xl -z-0 animate-pulse" />
      </div>

      <div className="text-center max-w-md space-y-4 mb-10">
        <h1 className="text-3xl font-black text-zinc-text tracking-tighter uppercase italic">
          Lost in the Grid
        </h1>
        <p className="text-sm font-medium text-zinc-muted leading-relaxed">
          The node you are looking for has been moved, deleted, or never existed in this sector.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-lg">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center justify-center gap-2 p-4 bg-obsidian-panel border border-white/10 rounded-sm hover:border-brand/30 hover:bg-white/5 transition-all group"
        >
           <ArrowLeft className="w-4 h-4 text-zinc-muted group-hover:text-brand transition-colors" />
           <span className="text-[10px] font-black text-zinc-text uppercase tracking-widest">Go Back</span>
        </button>

        <Link 
          to="/" 
          className="flex items-center justify-center gap-2 p-4 bg-obsidian-panel border border-white/10 rounded-sm hover:border-brand/30 hover:bg-white/5 transition-all group"
        >
           <Home className="w-4 h-4 text-zinc-muted group-hover:text-brand transition-colors" />
           <span className="text-[10px] font-black text-zinc-text uppercase tracking-widest">Dashboard</span>
        </Link>
      </div>

      <div className="mt-8 pt-8 border-t border-white/5 w-full max-w-lg flex justify-center gap-6">
         <Link to="/help" className="flex items-center gap-2 text-[10px] font-bold text-zinc-muted hover:text-zinc-text transition-colors uppercase tracking-wider">
            <HelpCircle className="w-3 h-3" /> Help Center
         </Link>
         <div className="w-px h-4 bg-white/10" />
         <button className="flex items-center gap-2 text-[10px] font-bold text-zinc-muted hover:text-zinc-text transition-colors uppercase tracking-wider">
            <Search className="w-3 h-3" /> Global Search
         </button>
      </div>
    </div>
  );
};
