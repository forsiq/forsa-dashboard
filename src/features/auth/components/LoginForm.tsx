import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Lock, Eye, EyeOff, Loader2, User, ChevronRight, WifiOff, ShieldX, AlertTriangle, RotateCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { AmberInput } from '@core/components/AmberInput';
import { AmberButton } from '@core/components/AmberButton';
import { useAuth } from '../hooks/useAuth';
import { LoginCredentials } from '../types';
import { useLanguage } from '@core/contexts/LanguageContext';
import { AUTH_ERROR_CODES, isAuthErrorCode } from '../constants/authErrors';
import { resolveAuthErrorMessage } from '../utils/resolveAuthError';

function getErrorInfo(error: string): { icon: React.ReactNode; type: 'network' | 'auth' | 'validation' } {
  if (isAuthErrorCode(error)) {
    switch (error) {
      case AUTH_ERROR_CODES.CONNECTION_TIMEOUT:
      case AUTH_ERROR_CODES.NETWORK_ERROR:
        return { icon: <WifiOff className="w-4 h-4 text-danger shrink-0" />, type: 'network' };
      case AUTH_ERROR_CODES.INVALID_CREDENTIALS:
      case AUTH_ERROR_CODES.ACCOUNT_LOCKED:
      case AUTH_ERROR_CODES.SESSION_EXPIRED:
        return { icon: <ShieldX className="w-4 h-4 text-danger shrink-0" />, type: 'auth' };
      case AUTH_ERROR_CODES.TOO_MANY_ATTEMPTS:
        return { icon: <AlertTriangle className="w-4 h-4 text-warning shrink-0" />, type: 'validation' };
      default:
        break;
    }
  }

  const lower = error.toLowerCase();
  if (lower.includes('timeout') || lower.includes('network') || lower.includes('connection') || lower.includes('connectivity')) {
    return { icon: <WifiOff className="w-4 h-4 text-danger shrink-0" />, type: 'network' };
  }
  if (lower.includes('invalid') || lower.includes('credentials') || lower.includes('unauthorized') || lower.includes('401')) {
    return { icon: <ShieldX className="w-4 h-4 text-danger shrink-0" />, type: 'auth' };
  }
  if (lower.includes('too many') || lower.includes('rate') || lower.includes('429') || lower.includes('attempts')) {
    return { icon: <AlertTriangle className="w-4 h-4 text-warning shrink-0" />, type: 'validation' };
  }
  return { icon: <AlertTriangle className="w-4 h-4 text-danger shrink-0" />, type: 'validation' };
}

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

    if (!credentials.username.trim() || !credentials.password.trim()) {
      setLocalError(t('error.required_fields') || 'Please fill in all fields');
      return;
    }

    try {
      await login(credentials);
      
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

  const rawError = localError || authError;
  const currentError = resolveAuthErrorMessage(rawError, t);
  const errorInfo = rawError ? getErrorInfo(rawError) : null;
  const isRateLimited =
    rawError === AUTH_ERROR_CODES.TOO_MANY_ATTEMPTS ||
    Boolean(rawError?.toLowerCase().includes('too many'));

  return (
    <motion.div 
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="w-full space-y-8"
    >
      <AnimatePresence mode="wait">
        {currentError && errorInfo && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className={`p-4 rounded-2xl flex items-center gap-3 overflow-hidden ${
              errorInfo.type === 'validation' && isRateLimited
                ? 'bg-warning/10 border border-warning/20'
                : 'bg-danger/10 border border-danger/20'
            }`}
          >
            {errorInfo.icon}
            <div className="flex-1 min-w-0">
              <p className={`text-xs font-bold ${
                errorInfo.type === 'validation' && isRateLimited
                  ? 'text-warning'
                  : 'text-danger'
              }`}>
                {currentError}
              </p>
            </div>
            {errorInfo.type === 'network' && (
              <button
                type="button"
                onClick={() => setLocalError(null)}
                className="shrink-0 p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                title="Retry"
              >
                <RotateCw className="w-3.5 h-3.5 text-zinc-muted" />
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-5">
          <AmberInput
            label={t('login.email')}
            placeholder={t('login.email')}
            icon={<User className="w-5 h-5 text-brand/60" />}
            value={credentials.username}
            onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
            required
            autoComplete="username"
          />

          <div className="space-y-3">
            <AmberInput
              label={t('login.password')}
              type={showPassword ? 'text' : 'password'}
              placeholder={t('login.password')}
              icon={<Lock className="w-5 h-5 text-brand/60" />}
              autoComplete="current-password"
              rightElement={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="p-2 me-2 text-zinc-muted hover:text-brand transition-colors outline-none"
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
                className="text-[10px] font-bold text-brand hover:opacity-80 transition-opacity uppercase tracking-[0.1em]"
              >
                {t('login.forgot')}
              </Link>
            </div>
          </div>
        </div>

        <div className="flex items-center px-1">
          <label className="flex items-center gap-3 cursor-pointer group">
            <div className={`w-5 h-5 rounded-lg border-2 transition-all flex items-center justify-center ${
              rememberMe ? 'bg-brand border-brand' : 'border-zinc-200 dark:border-white/10 bg-obsidian-card group-hover:border-brand/40'
            }`}>
              {rememberMe && <div className="w-2 h-2 bg-obsidian-outer rounded-sm" />}
            </div>
            <input 
              type="checkbox" 
              className="hidden" 
              checked={rememberMe}
              onChange={() => setRememberMe(!rememberMe)}
            />
            <span className={`text-[11px] font-bold uppercase tracking-[0.1em] transition-colors ${
              rememberMe ? 'text-zinc-text' : 'text-zinc-muted group-hover:text-zinc-secondary'
            }`}>
              {t('login.remember')}
            </span>
          </label>
        </div>

        <AmberButton
          type="submit"
          variant="primary"
          size="lg"
          className="w-full h-14 rounded-2xl"
          disabled={isLoading}
        >
          {isLoading ? (
            <div className="flex items-center gap-3">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="font-bold uppercase tracking-[0.2em]">{t('common.loading')}</span>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2">
              <span className="font-bold uppercase tracking-[0.15em]">{t('login.button')}</span>
              <ChevronRight className="w-4 h-4" />
            </div>
          )}
        </AmberButton>
      </form>

      <div className="pt-2">
        <div className="w-full h-px bg-border mb-6" />
        <p className="text-[11px] font-bold text-zinc-muted uppercase tracking-[0.1em] text-center leading-relaxed">
          {t('login.no_account')}{' '}
          <Link
            href="/register"
            className="text-brand hover:opacity-80 transition-opacity"
          >
            {t('login.create_account')}
          </Link>
        </p>
      </div>
    </motion.div>
  );
};
