
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, User, ArrowRight, AlertCircle, Check } from 'lucide-react';
import { AmberAuthLayout } from '../../../amber-ui/layout/AmberAuthLayout';

export const LoginForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const validate = () => {
    if (!formData.email || !formData.email.includes('@')) {
      setError('Invalid Node Identifier (Email)');
      return false;
    }
    if (formData.password.length < 6) {
      setError('Security Key must be at least 6 characters');
      return false;
    }
    return true;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!validate()) return;

    setLoading(true);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Mock success
    setLoading(false);
    navigate('/');
  };

  const handleGoogleLogin = () => {
    setLoading(true);
    // Simulate Google Auth Redirect
    setTimeout(() => {
        setLoading(false);
        navigate('/');
    }, 1500);
  };

  return (
    <AmberAuthLayout>
      <div className="bg-obsidian-panel border border-white/5 p-8 rounded-lg shadow-2xl relative overflow-hidden group">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-brand/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        
        <div className="mb-8 text-center">
           <h1 className="text-2xl font-black text-zinc-text tracking-tighter uppercase italic">Welcome Back</h1>
           <p className="text-[11px] font-bold text-zinc-muted uppercase tracking-widest mt-2">Authenticate to access the portal</p>
        </div>

        {error && (
            <div className="mb-6 p-3 bg-danger/10 border border-danger/20 rounded-sm flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                <AlertCircle className="w-4 h-4 text-danger shrink-0" />
                <p className="text-[10px] font-bold text-danger uppercase tracking-wide">{error}</p>
            </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-zinc-muted uppercase tracking-widest px-1">Node Identifier</label>
            <div className="relative group/input">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-muted group-focus-within/input:text-brand transition-colors" />
              <input 
                type="text" 
                placeholder="admin@zonevast.corp"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full h-12 bg-[#111827] border border-white/10 rounded-sm pl-11 pr-4 text-sm font-medium text-white outline-none focus:border-brand focus:ring-1 focus:ring-brand/20 transition-all placeholder:text-zinc-muted/50"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-zinc-muted uppercase tracking-widest px-1">Security Key</label>
            <div className="relative group/input">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-muted group-focus-within/input:text-brand transition-colors" />
              <input 
                type="password" 
                placeholder="••••••••••••"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                className="w-full h-12 bg-[#111827] border border-white/10 rounded-sm pl-11 pr-4 text-sm font-medium text-white outline-none focus:border-brand focus:ring-1 focus:ring-brand/20 transition-all placeholder:text-zinc-muted/50"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-2 cursor-pointer group">
                <div className={`w-4 h-4 border rounded-sm flex items-center justify-center transition-all ${formData.rememberMe ? 'bg-brand border-brand' : 'bg-obsidian-outer border-white/10 group-hover:border-white/20'}`}>
                    {formData.rememberMe && <Check className="w-3 h-3 text-black" />}
                </div>
                <input 
                    type="checkbox" 
                    className="hidden" 
                    checked={formData.rememberMe} 
                    onChange={(e) => setFormData({...formData, rememberMe: e.target.checked})}
                />
                <span className="text-[10px] font-bold text-zinc-muted uppercase tracking-widest group-hover:text-zinc-secondary transition-colors">Remember Node</span>
            </label>
            <Link to="/forgot-password" type="button" className="text-[10px] font-black text-brand hover:underline uppercase tracking-widest">Recover Access?</Link>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full h-12 bg-brand text-black text-xs font-black uppercase tracking-[0.2em] rounded-sm hover:bg-[#F5C518] hover:shadow-lg active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? (
                <>
                    <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                    <span>Verifying Credentials...</span>
                </>
            ) : (
                <>
                    Establish Connection
                    <ArrowRight className="w-4 h-4" />
                </>
            )}
          </button>
        </form>

        <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/5"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-obsidian-panel px-2 text-[9px] font-black text-zinc-muted tracking-widest">Or Continue With</span>
            </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
            <button 
                type="button"
                onClick={handleGoogleLogin}
                disabled={loading}
                className="flex items-center justify-center gap-2 h-10 bg-white text-black rounded-sm text-[10px] font-bold uppercase tracking-wide hover:bg-gray-100 transition-colors disabled:opacity-50"
            >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                Google
            </button>
            <button 
                type="button"
                disabled
                className="flex items-center justify-center gap-2 h-10 bg-[#24292e] text-white rounded-sm text-[10px] font-bold uppercase tracking-wide opacity-50 cursor-not-allowed"
            >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                    <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.419-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
                </svg>
                Github
            </button>
        </div>

        <div className="mt-8 pt-6 border-t border-white/5 text-center">
           <p className="text-[10px] font-bold text-zinc-muted uppercase tracking-widest">
             No Credentials? <Link to="/signup" className="text-brand hover:underline ml-1">Create Identity</Link>
           </p>
        </div>
      </div>
    </AmberAuthLayout>
  );
};
