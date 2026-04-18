import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Mail, Lock, Eye, EyeOff, Loader2, User, ChevronRight } from 'lucide-react';
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
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="w-full space-y-8"
    >
      <AnimatePresence mode="wait">
        {currentError && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-danger/10 border border-danger/20 p-4 rounded-2xl flex items-center gap-3"
          >
            <div className="w-1.5 h-1.5 rounded-full bg-danger animate-pulse" />
            <p className="text-[11px] font-bold text-danger uppercase tracking-wider">
              {currentError}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <AmberInput
            label={t('login.email')}
            placeholder={t('login.email')}
            icon={<User className="w-4 h-4" />}
            value={credentials.username}
            onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
            required
            autoComplete="username"
          />

          <div className="space-y-2">
            <AmberInput
              label={t('login.password')}
              type={showPassword ? 'text' : 'password'}
              placeholder={t('login.password')}
              icon={<Lock className="w-4 h-4" />}
              autoComplete="current-password"
              rightElement={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="p-1 text-zinc-muted/60 hover:text-zinc-text transition-colors outline-none"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              }
              value={credentials.password}
              onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
              required
            />
            <div className="flex justify-end">
              <Link
                href="/forgot-password"
                className="text-[10px] font-bold text-brand hover:text-brand-light transition-colors uppercase tracking-wider"
              >
                {t('login.forgot')}
              </Link>
            </div>
          </div>
        </div>

        <div className="flex items-center px-1">
          <label className="flex items-center gap-3 cursor-pointer group">
            <div className={`w-5 h-5 rounded-lg border transition-all flex items-center justify-center ${
              rememberMe ? 'bg-brand border-brand shadow-[0_0_15px_rgba(255,192,0,0.3)]' : 'border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-white/[0.02] group-hover:border-zinc-300 dark:group-hover:border-white/20'
            }`}>
              {rememberMe && <div className="w-2 h-2 bg-obsidian-outer rounded-sm" />}
            </div>
            <input 
              type="checkbox" 
              className="hidden" 
              checked={rememberMe}
              onChange={() => setRememberMe(!rememberMe)}
            />
            <span className={`text-[11px] font-bold uppercase tracking-wider transition-colors ${
              rememberMe ? 'text-zinc-text' : 'text-zinc-muted dark:text-zinc-muted group-hover:text-zinc-500 transition-colors'
            }`}>
              {t('login.remember')}
            </span>
          </label>
        </div>

        <AmberButton
          type="submit"
          variant="primary"
          size="lg"
          className="w-full h-14 bg-brand hover:bg-brand/90 text-obsidian-outer shadow-xl shadow-brand/10 relative overflow-hidden group"
          disabled={isLoading}
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="font-black uppercase tracking-[0.2em]">{t('common.loading')}</span>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2">
              <span className="font-black uppercase tracking-[0.2em]">{t('login.button')}</span>
              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </div>
          )}
          <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 skew-x-12" />
        </AmberButton>
      </form>

      <div className="pt-2">
        <div className="w-full h-px bg-gradient-to-r from-transparent via-zinc-200 dark:via-white/5 to-transparent mb-6" />
        <p className="text-[11px] font-bold text-zinc-muted dark:text-zinc-muted uppercase tracking-widest text-center">
          {t('login.no_account')}{' '}
          <Link
            href="/register"
            className="text-zinc-text dark:text-white hover:text-brand transition-colors decoration-brand/30 underline underline-offset-4"
          >
            {t('login.create_account')}
          </Link>
        </p>
      </div>
    </motion.div>
  );
};
