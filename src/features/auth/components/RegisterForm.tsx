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
        className="text-center space-y-6 py-8"
      >
        <div className="flex justify-center">
          <div className="w-20 h-20 bg-success/10 rounded-full flex items-center justify-center border border-success/20 shadow-[0_0_30px_rgba(16,185,129,0.1)]">
            <CheckCircle2 className="w-10 h-10 text-success" />
          </div>
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-black text-zinc-text tracking-tighter uppercase italic">Account Created</h2>
          <p className="text-sm text-zinc-muted max-w-[280px] mx-auto leading-relaxed">
            Your account has been successfully initialized. Welcome to the ecosystem.
          </p>
        </div>
        <Link href="/login" className="inline-block mt-4">
          <AmberButton variant="primary" size="lg" className="px-12 h-14 bg-brand text-obsidian-outer">
            Proceed to Login
          </AmberButton>
        </Link>
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
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

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid gap-4">
          <AmberInput
            label={t('auth.register.username') || 'Username'}
            placeholder={t('auth.register.username_placeholder') || 'Choose identity'}
            icon={<User className="w-4 h-4" />}
            value={formData.username}
            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            required
          />

          <AmberInput
            label={t('auth.register.email') || 'Email'}
            type="email"
            placeholder={t('auth.register.email_placeholder') || 'Enter contact email'}
            icon={<Mail className="w-4 h-4" />}
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />

          <div className="grid grid-cols-1 gap-4">
            <AmberInput
              label={t('auth.register.password') || 'Password'}
              type={showPassword ? 'text' : 'password'}
              placeholder={t('auth.register.password_placeholder') || 'Min 6 characters'}
              icon={<Lock className="w-4 h-4" />}
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
            />

            <AmberInput
              label={t('auth.register.confirm_password') || 'Confirm Password'}
              type={showPassword ? 'text' : 'password'}
              placeholder={t('auth.register.confirm_password_placeholder') || 'Confirm credentials'}
              icon={<Lock className="w-4 h-4" />}
              rightElement={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="p-1 text-zinc-muted hover:text-zinc-text transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              }
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              error={formData.password !== formData.confirmPassword && formData.confirmPassword ? 'Passwords do not match' : ''}
              required
            />
          </div>
        </div>

        <div className="pt-4">
          <AmberButton
            type="submit"
            variant="primary"
            size="lg"
            className="w-full h-14 bg-brand text-obsidian-outer shadow-xl shadow-brand/10 group overflow-hidden relative"
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span className="font-black uppercase tracking-[0.2em]">{t('common.loading')}</span>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2">
                <span className="font-black uppercase tracking-[0.2em]">{t('auth.register.submit') || 'Create Account'}</span>
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </div>
            )}
            <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 skew-x-12" />
          </AmberButton>
        </div>
      </form>

      <div className="pt-2">
        <div className="w-full h-px bg-gradient-to-r from-transparent via-zinc-200 dark:via-white/5 to-transparent mb-6" />
        <p className="text-[11px] font-bold text-zinc-muted dark:text-zinc-muted uppercase tracking-widest text-center">
          {t('auth.register.has_account') || 'Already have access?'}{' '}
          <Link
            href="/login"
            className="text-zinc-text dark:text-white hover:text-brand transition-colors decoration-brand/30 underline underline-offset-4"
          >
            {t('auth.register.login') || 'Sign In'}
          </Link>
        </p>
      </div>
    </motion.div>
  );
};
