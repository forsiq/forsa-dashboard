
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, ShieldCheck } from 'lucide-react';
import { Logo } from '../../components/Logo';

export const ForgotPassword = () => {
  const [submitted, setSubmitted] = useState(false);

  return (
    <div className="min-h-screen bg-obsidian-outer flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-[320px] space-y-8 animate-fade-up">
        <div className="flex flex-col items-center gap-3">
          <Logo className="w-10 h-10" />
          <div className="text-center">
             <h1 className="text-xl font-black text-zinc-text tracking-tighter uppercase italic">Access Recovery</h1>
             <p className="text-[9px] font-black text-zinc-muted uppercase tracking-[0.3em] mt-1">Enterprise Credential Reset</p>
          </div>
        </div>

        {!submitted ? (
          <form onSubmit={(e) => { e.preventDefault(); setSubmitted(true); }} className="space-y-4">
            <div className="space-y-1">
              <label className="text-[9px] font-black text-zinc-muted uppercase tracking-widest px-1">Verified Email Address</label>
              <div className="relative group">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-muted group-focus-within:text-brand transition-colors" />
                <input 
                  type="email" 
                  placeholder="admin@zonevast.corp"
                  required
                  className="w-full h-10 bg-obsidian-panel border border-white/5 rounded-sm pl-10 pr-4 text-[11px] font-bold text-zinc-text outline-none focus:border-brand/30 transition-all"
                />
              </div>
            </div>

            <button 
              type="submit" 
              className="w-full h-10 bg-brand text-obsidian-outer text-[10px] font-black uppercase tracking-[0.2em] rounded-sm hover:opacity-90 active:scale-[0.98] transition-all"
            >
              Request Recovery Uplink
            </button>
            
            <Link to="/login" className="flex items-center justify-center gap-2 text-[9px] font-black text-zinc-muted hover:text-brand uppercase tracking-widest transition-colors">
              <ArrowLeft className="w-3 h-3" /> Back to Auth Node
            </Link>
          </form>
        ) : (
          <div className="text-center space-y-6 animate-in fade-in duration-500">
             <div className="w-12 h-12 rounded-full bg-success/10 border border-success/20 flex items-center justify-center text-success mx-auto">
                <ShieldCheck className="w-6 h-6" />
             </div>
             <div className="space-y-2">
                <p className="text-xs font-bold text-zinc-text uppercase tracking-tight">Recovery Signal Dispatched</p>
                <p className="text-[10px] text-zinc-muted leading-relaxed uppercase tracking-widest">A secure reset link has been transmitted to your primary node email. Check your inbox to proceed.</p>
             </div>
             <Link to="/login" className="block text-[9px] font-black text-brand hover:underline uppercase tracking-widest">
                Return to Login
             </Link>
          </div>
        )}
      </div>
    </div>
  );
};
