
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowRight } from 'lucide-react';
import { AuthLayout } from '../../layouts/AuthLayout';

export const SignUp = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate API call
    setTimeout(() => navigate('/login'), 1500);
  };

  return (
    <AuthLayout>
      <div className="bg-obsidian-panel border border-white/5 p-8 rounded-lg shadow-2xl relative overflow-hidden group">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-brand/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        
        <div className="mb-8 text-center">
           <h1 className="text-2xl font-black text-zinc-text tracking-tighter uppercase italic">Initialize Node</h1>
           <p className="text-[11px] font-bold text-zinc-muted uppercase tracking-widest mt-2">Create your secure identity</p>
        </div>

        <form onSubmit={handleSignUp} className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-zinc-muted uppercase tracking-widest px-1">First Name</label>
              <input 
                type="text" 
                placeholder="Alex"
                required
                className="w-full h-12 bg-[#111827] border border-white/10 rounded-sm px-4 text-sm font-medium text-white outline-none focus:border-brand focus:ring-1 focus:ring-brand/20 transition-all placeholder:text-zinc-muted/50"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-zinc-muted uppercase tracking-widest px-1">Last Name</label>
              <input 
                type="text" 
                placeholder="Morgan"
                required
                className="w-full h-12 bg-[#111827] border border-white/10 rounded-sm px-4 text-sm font-medium text-white outline-none focus:border-brand focus:ring-1 focus:ring-brand/20 transition-all placeholder:text-zinc-muted/50"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-zinc-muted uppercase tracking-widest px-1">Work Email</label>
            <div className="relative group/input">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-muted group-focus-within/input:text-brand transition-colors" />
              <input 
                type="email" 
                placeholder="name@company.com"
                required
                className="w-full h-12 bg-[#111827] border border-white/10 rounded-sm pl-11 pr-4 text-sm font-medium text-white outline-none focus:border-brand focus:ring-1 focus:ring-brand/20 transition-all placeholder:text-zinc-muted/50"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-zinc-muted uppercase tracking-widest px-1">Set Password</label>
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

          <div className="pt-2">
            <label className="flex items-start gap-3 cursor-pointer group">
              <input type="checkbox" required className="mt-0.5 accent-brand" />
              <span className="text-[10px] font-medium text-zinc-muted leading-relaxed group-hover:text-zinc-secondary transition-colors">
                I acknowledge the <span className="text-brand underline">Service Protocols</span> and agree to the data retention policies.
              </span>
            </label>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full h-12 bg-brand text-black text-xs font-black uppercase tracking-[0.2em] rounded-sm hover:bg-[#F5C518] hover:shadow-lg active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-2"
          >
            {loading ? 'Registering Node...' : 'Create Account'}
            {!loading && <ArrowRight className="w-4 h-4" />}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-white/5 text-center">
           <p className="text-[10px] font-bold text-zinc-muted uppercase tracking-widest">
             Already have an identity? <Link to="/login" className="text-brand hover:underline ml-1">Login</Link>
           </p>
        </div>
      </div>
    </AuthLayout>
  );
};
