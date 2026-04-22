import React, { useState } from 'react';
import Link from 'next/link';
import { Mail, Lock, User, Eye, EyeOff, Loader2, ChevronRight, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { AmberInput } from '@core/components/AmberInput';
import { AmberButton } from '@core/components/AmberButton';
import { useAuth } from '../hooks/useAuth';
import { RegisterData } from '../types';
import { useLanguage } from '@core/contexts/LanguageContext';

export const RegisterForm: React.FC = () => {
  const { t } = useLanguage();
  const { register, isLoading, error: authError } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const [formData, setFormData] = useState<RegisterData>({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    // Basic validation
    if (formData.password !== formData.confirmPassword) {
      setLocalError(t('error.password_mismatch') || 'Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setLocalError(t('validation.password_too_short') || 'Password must be at least 6 characters');
      return;
    }

    try {
      await register(formData);
      setIsSuccess(true);
    } catch (err) { }
  };

  const currentError = localError || authError;

  if (isSuccess) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="text-center space-y-10 py-12"
      >
        <div className="flex justify-center relative">
          <div className="absolute inset-0 bg-success/20 blur-3xl rounded-full scale-150 animate-pulse-slow" />
          <div className="w-24 h-24 bg-success/10 rounded-[2.5rem] flex items-center justify-center border border-success/20 shadow-[0_0_50px_rgba(16,185,129,0.2)] ring-1 ring-success/30 relative z-10">
            <CheckCircle2 className="w-12 h-12 text-success" />
          </div>
        </div>
        <div className="space-y-4">
          <h2 className="text-3xl font-black text-white tracking-tighter uppercase italic drop-shadow-lg">
             {t('auth.register.success_title')}
          </h2>
          <p className="text-[13px] font-black text-zinc-muted uppercase tracking-[0.2em] max-w-[320px] mx-auto leading-relaxed">
            {t('auth.register.success_desc')}
          </p>
        </div>
        <Link href="/login" className="inline-block w-full mt-6">
          <AmberButton variant="primary" size="lg" className="w-full h-14 bg-brand text-obsidian-outer shadow-2xl shadow-brand/20 group overflow-hidden relative rounded-[1.25rem]">
             <span className="font-black uppercase tracking-[0.25em] text-base">{t('auth.register.proceed_login')}</span>
             <div className="absolute inset-0 bg-white/30 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 skew-x-12" />
          </AmberButton>
        </Link>
      </motion.div>
    );
  }

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
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-danger/10 border border-danger/20 p-5 rounded-3xl flex items-center gap-4 overflow-hidden"
          >
            <div className="w-2 h-2 rounded-full bg-danger animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.5)]" />
            <p className="text-[12px] font-black text-danger uppercase tracking-[0.1em]">
              {currentError}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid gap-6">
          <AmberInput
            label={t('auth.register.username') || 'Username'}
            placeholder={t('auth.register.username_placeholder') || 'IDENTITY'}
            icon={<User className="w-5 h-5 text-brand/60" />}
            className="h-14 text-base bg-white/[0.03] border-white/10 focus:border-brand/50 rounded-2xl transition-all"
            value={formData.username}
            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            required
          />

          <AmberInput
            label={t('auth.register.email') || 'Email'}
            type="email"
            placeholder={t('auth.register.email_placeholder') || 'CONTACT@PROTOCOL.COM'}
            icon={<Mail className="w-5 h-5 text-brand/60" />}
            className="h-14 text-base bg-white/[0.03] border-white/10 focus:border-brand/50 rounded-2xl transition-all"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <AmberInput
              label={t('auth.register.password') || 'Password'}
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              icon={<Lock className="w-5 h-5 text-brand/60" />}
              className="h-14 text-base bg-white/[0.03] border-white/10 focus:border-brand/50 rounded-2xl transition-all"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
            />

            <AmberInput
              label={t('auth.register.confirm_password') || 'Confirm'}
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              icon={<Lock className="w-5 h-5 text-brand/60" />}
              className="h-14 text-base bg-white/[0.03] border-white/10 focus:border-brand/50 rounded-2xl transition-all"
              rightElement={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="p-2 mr-2 text-zinc-muted/60 hover:text-brand transition-colors outline-none"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              }
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              error={formData.password !== formData.confirmPassword && formData.confirmPassword ? 'Passwords do not match' : ''}
              required
            />
          </div>
        </div>

        <div className="pt-6">
          <AmberButton
            type="submit"
            variant="primary"
            size="lg"
            className="w-full h-14 bg-brand text-obsidian-outer shadow-2xl shadow-brand/20 group overflow-hidden relative rounded-[1.25rem]"
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="flex items-center gap-3">
                <Loader2 className="w-6 h-6 animate-spin" />
                <span className="font-black uppercase tracking-[0.3em] text-lg">{t('common.loading')}</span>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-3">
                <span className="font-black uppercase tracking-[0.25em] text-base">{t('auth.register.submit') || 'INITIALIZE ACCOUNT'}</span>
                <ChevronRight className="w-5 h-5 group-hover:translate-x-2 transition-transform duration-300" />
              </div>
            )}
            <div className="absolute inset-0 bg-white/30 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 skew-x-12" />
          </AmberButton>
        </div>
      </form>

      <div className="pt-4">
        <div className="w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent mb-8" />
        <p className="text-[11px] font-black text-zinc-muted uppercase tracking-[0.2em] text-center leading-relaxed">
          {t('auth.register.has_account') || 'ALREADY HAVE ACCESS?'}<br />
          <Link
            href="/login"
            className="text-white hover:text-brand transition-all mt-4 inline-block decoration-brand/30 underline underline-offset-8 decoration-2 hover:scale-105"
          >
            {t('auth.register.login') || 'RETURN TO SIGN IN'}
          </Link>
        </p>
      </div>
    </motion.div>
  );
};
