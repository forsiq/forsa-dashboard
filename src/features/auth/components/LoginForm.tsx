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
  const { t, dir } = useLanguage();
  const { login, isLoading, error: authError } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);
  
  const [credentials, setCredentials] = useState<LoginCredentials>({
    username: '',
    password: ''
  });

  useEffect(() => {
    setIsClient(true);
  }, []);

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
      // Error handled by useAuth but we can also react here if needed
      console.error('[LoginForm] login error:', err);
    }
  };

  const currentError = localError || authError;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full space-y-8"
    >
      <div className="text-center space-y-2">
        <motion.div
           initial={{ scale: 0.9, opacity: 0 }}
           animate={{ scale: 1, opacity: 1 }}
           transition={{ delay: 0.2 }}
        >
          <h1 className="text-3xl font-black text-zinc-text tracking-tighter uppercase italic bg-gradient-to-br from-white to-zinc-500 bg-clip-text text-transparent">
            {t('login.welcome')}
          </h1>
          <p className="text-[11px] font-bold text-zinc-muted uppercase tracking-[0.2em]">
            {t('login.subtitle')}
          </p>
        </motion.div>
      </div>

      <AnimatePresence mode="wait">
        {currentError && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-danger/10 border border-danger/20 p-4 rounded-xl flex items-center gap-3">
              <div className="w-1 h-8 bg-danger rounded-full" />
              <p className="text-xs text-danger font-medium leading-tight">
                {currentError}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-4">
          <AmberInput
            label={t('login.email')}
            placeholder={t('login.email')}
            icon={<User className="w-4 h-4" />}
            value={credentials.username}
            onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
            required
            autoComplete="username"
            className="transition-all duration-300"
          />

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
            className="transition-all duration-300"
          />
        </div>

        <div className="flex items-center justify-between px-1">
          <label className="flex items-center gap-2 cursor-pointer group">
            <div className={`w-4 h-4 rounded border transition-all flex items-center justify-center ${
              rememberMe ? 'bg-brand border-brand' : 'border-white/10 bg-white/[0.02] group-hover:border-white/20'
            }`}>
              {rememberMe && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
            </div>
            <input 
              type="checkbox" 
              className="hidden" 
              checked={rememberMe}
              onChange={() => setRememberMe(!rememberMe)}
            />
            <span className={`text-[10px] font-bold uppercase tracking-wider transition-colors ${
              rememberMe ? 'text-zinc-text' : 'text-zinc-muted group-hover:text-zinc-400'
            }`}>
              {t('login.remember')}
            </span>
          </label>
          <Link
            href="/forgot-password"
            className="text-[10px] font-bold text-brand hover:text-brand-light transition-colors uppercase tracking-wider underline-offset-4 hover:underline decoration-brand/30"
          >
            {t('login.forgot')}
          </Link>
        </div>

        <motion.div
           whileHover={{ scale: 1.01 }}
           whileTap={{ scale: 0.99 }}
        >
          <AmberButton
            type="submit"
            variant="primary"
            size="lg"
            className="w-full relative py-6 group"
            disabled={isLoading}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-brand to-brand-light opacity-0 group-hover:opacity-10 transition-opacity rounded-lg" />
            
            {isLoading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="font-bold uppercase tracking-widest">{t('common.loading')}</span>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2 group">
                <span className="font-bold uppercase tracking-widest">{t('login.button')}</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            )}
          </AmberButton>
        </motion.div>
      </form>

      <div className="pt-4 flex flex-col items-center gap-4">
        <div className="w-full h-px bg-gradient-to-r from-transparent via-white/5 to-transparent" />
        
        <p className="text-[10px] font-bold text-zinc-muted uppercase tracking-widest flex items-center gap-2">
          {t('login.no_account')}
          <Link
            href="/register"
            className="text-white hover:text-brand transition-colors border-b border-white/10 hover:border-brand/40 pb-0.5"
          >
            {t('login.create_account')}
          </Link>
        </p>
      </div>
    </motion.div>
  );
};

