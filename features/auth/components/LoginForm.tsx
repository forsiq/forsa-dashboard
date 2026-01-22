
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, User, ArrowRight } from 'lucide-react';
import { AmberAuthLayout } from '../../../amber-ui/layout/AmberAuthLayout';

export const LoginForm = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => navigate('/'), 1000);
  };

  return (
    <AmberAuthLayout>
      <div className="bg-obsidian-panel border border-white/5 p-8 rounded-lg shadow-2xl relative overflow-hidden group">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-brand/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        
        <div className="mb-8 text-center">
           <h1 className="text-2xl font-black text-zinc-text tracking-tighter uppercase italic">Welcome Back</h1>
           <p className="text-[11px] font-bold text-zinc-muted uppercase tracking-widest mt-2">Authenticate to access the portal</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-zinc-muted uppercase tracking-widest px-1">Node Identifier</label>
            <div className="relative group/input">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-muted group-focus-within/input:text-brand transition-colors" />
              <input 
                type="text" 
                placeholder="admin@zonevast.corp"
                required
                className="w-full h-12 bg-[#111827] border border-white/10 rounded-sm pl-11 pr-4 text-sm font-medium text-white outline-none focus:border-brand focus:ring-1 focus:ring-brand/20 transition-all placeholder:text-zinc-muted/50"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between items-center px-1">
              <label className="text-[10px] font-black text-zinc-muted uppercase tracking-widest">Security Key</label>
              <Link to="/forgot-password" type="button" className="text-[9px] font-black text-brand hover:underline uppercase tracking-widest">Recover?</Link>
            </div>
            <div className="relative group/input">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-muted group-focus-within/input:text-brand transition-colors" />
              <input 
                type="password" 
                placeholder="••••••••••••"
                required
                className="w-full h-12 bg-[#111827] border border-white/10 rounded-sm pl-11 pr-4 text-sm font-medium text-white outline-none focus:border-brand focus:ring-1 focus:ring-brand/20 transition-all placeholder:text-zinc-muted/50"
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full h-12 bg-brand text-black text-xs font-black uppercase tracking-[0.2em] rounded-sm hover:bg-[#F5C518] hover:shadow-lg active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-2"
          >
            {loading ? 'Authenticating...' : 'Establish Connection'}
            {!loading && <ArrowRight className="w-4 h-4" />}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-white/5 text-center">
           <p className="text-[10px] font-bold text-zinc-muted uppercase tracking-widest">
             No Credentials? <Link to="/signup" className="text-brand hover:underline ml-1">Create Identity</Link>
           </p>
        </div>
      </div>
    </AmberAuthLayout>
  );
};
