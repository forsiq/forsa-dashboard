import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Lock, Eye, EyeOff, Loader2, User, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { AmberInput } from '@core/components/AmberInput';
import { AmberButton } from '@core/components/AmberButton';
import { useAuth } from '../hooks/useAuth';
import { LoginCredentials } from '../types';
import { useLanguage } from '@core/contexts/LanguageContext';

export const LoginForm: React.FC = () => {
  const { t } = useLanguage();
  const { login, isLoading, error: authError } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  
  const [credentials, setCredentials] = useState<LoginCredentials>({
    username: '',
    password: ''
  });

  // Load remembered username
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('remember_username');
      if (saved) {
        setCredentials(prev => ({ ...prev, username: saved }));
        setRememberMe(true);
      }
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    // Basic validation
    if (!credentials.username.trim() || !credentials.password.trim()) {
      setLocalError(t('error.required_fields') || 'Please fill in all fields');
      return;
    }

    try {
      await login(credentials);
      
      // Save username if remember me is checked
      if (typeof window !== 'undefined') {
        if (rememberMe) {
          localStorage.setItem('remember_username', credentials.username);
        } else {
          localStorage.removeItem('remember_username');
        }
      }
    } catch (err) {
      console.error('[LoginForm] login error:', err);
    }
  };

  const currentError = localError || authError;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="w-full space-y-10"
    >
      <AnimatePresence mode="wait">
        {currentError && (
          <motion.div
            initial={{ opacity: 0, height: 0, marginBottom: 0 }}
            animate={{ opacity: 1, height: 'auto', marginBottom: 24 }}
            exit={{ opacity: 0, height: 0, marginBottom: 0 }}
            className="bg-danger/10 border border-danger/20 p-5 rounded-3xl flex items-center gap-4 overflow-hidden"
          >
            <div className="w-2 h-2 rounded-full bg-danger animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.5)]" />
            <p className="text-[12px] font-black text-danger uppercase tracking-[0.1em] leading-tight">
              {currentError}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <form onSubmit={handleSubmit} className="space-y-10">
        <div className="space-y-6">
          <AmberInput
            label={t('login.email')}
            placeholder={t('login.email')}
            icon={<User className="w-5 h-5 text-brand/60" />}
            className="h-14 text-base bg-white/[0.03] border-white/10 focus:border-brand/50 transition-all rounded-2xl"
            value={credentials.username}
            onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
            required
            autoComplete="username"
          />

          <div className="space-y-4">
            <AmberInput
              label={t('login.password')}
              type={showPassword ? 'text' : 'password'}
              placeholder={t('login.password')}
              icon={<Lock className="w-5 h-5 text-brand/60" />}
              className="h-14 text-base bg-white/[0.03] border-white/10 focus:border-brand/50 transition-all rounded-2xl"
              autoComplete="current-password"
              rightElement={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="p-2 me-2 text-zinc-muted/60 hover:text-brand transition-colors outline-none"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              }
              value={credentials.password}
              onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
              required
            />
            <div className="flex justify-end px-1">
              <Link
                href="/forgot-password"
                className="text-[10px] font-black text-brand hover:text-brand-light transition-all uppercase tracking-[0.15em] hover:scale-105"
              >
                {t('login.forgot')}
              </Link>
            </div>
          </div>
        </div>

        <div className="flex items-center px-2">
          <label className="flex items-center gap-4 cursor-pointer group">
            <div className={`w-6 h-6 rounded-xl border-2 transition-all flex items-center justify-center ${
              rememberMe ? 'bg-brand border-brand shadow-[0_0_20px_rgba(255,192,0,0.4)]' : 'border-white/10 bg-white/[0.02] group-hover:border-white/20'
            }`}>
              {rememberMe && <div className="w-2.5 h-2.5 bg-obsidian-outer rounded-sm" />}
            </div>
            <input 
              type="checkbox" 
              className="hidden" 
              checked={rememberMe}
              onChange={() => setRememberMe(!rememberMe)}
            />
            <span className={`text-[11px] font-black uppercase tracking-[0.15em] transition-colors ${
              rememberMe ? 'text-white' : 'text-zinc-muted group-hover:text-zinc-400'
            }`}>
              {t('login.remember')}
            </span>
          </label>
        </div>

        <AmberButton
          type="submit"
          variant="primary"
          size="lg"
          className="w-full h-14 bg-brand hover:bg-brand/90 text-obsidian-outer shadow-2xl shadow-brand/20 relative overflow-hidden group rounded-[1.25rem]"
          disabled={isLoading}
        >
          {isLoading ? (
            <div className="flex items-center gap-3">
              <Loader2 className="w-6 h-6 animate-spin" />
              <span className="font-black uppercase tracking-[0.3em] text-lg">{t('common.loading')}</span>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-3">
              <span className="font-black uppercase tracking-[0.25em] text-base">{t('login.button')}</span>
              <ChevronRight className="w-5 h-5 group-hover:translate-x-2 transition-transform duration-300" />
            </div>
          )}
          <div className="absolute inset-0 bg-white/30 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 skew-x-12" />
        </AmberButton>
      </form>

      <div className="pt-4">
        <div className="w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent mb-8" />
        <p className="text-[11px] font-black text-zinc-muted uppercase tracking-[0.2em] text-center leading-relaxed">
          {t('login.no_account')}<br />
          <Link
            href="/register"
            className="text-white hover:text-brand transition-all mt-3 inline-block decoration-brand/30 underline underline-offset-8 decoration-2"
          >
            {t('login.create_account')}
          </Link>
        </p>
      </div>
    </motion.div>
  );
};
