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
    } catch (err) {
      // Error handled by useAuth
    }
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
          <div className="w-20 h-20 bg-success/10 rounded-full flex items-center justify-center border border-success/20">
            <CheckCircle2 className="w-10 h-10 text-success" />
          </div>
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-black text-zinc-text tracking-tighter uppercase italic">Account Created</h2>
          <p className="text-sm text-zinc-muted max-w-[280px] mx-auto">
            Your account has been successfully initialized. Welcome to the ecosystem.
          </p>
        </div>
        <Link href="/login" className="inline-block">
          <AmberButton variant="primary">
            Proceed to Login
          </AmberButton>
        </Link>
      </motion.div>
    );
  }

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
           transition={{ delay: 0.1 }}
        >
          <h1 className="text-3xl font-black text-zinc-text tracking-tighter uppercase italic bg-gradient-to-br from-white to-zinc-500 bg-clip-text text-transparent">
            {t('auth.register.title') || 'Create Account'}
          </h1>
          <p className="text-[11px] font-bold text-zinc-muted uppercase tracking-[0.2em]">
            {t('auth.register.subtitle') || 'Initialize your secure node access'}
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

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid gap-4">
          <AmberInput
            label={t('auth.register.username') || 'Username'}
            placeholder={t('auth.register.username_placeholder') || 'Choose identity'}
            icon={<User className="w-4 h-4" />}
            value={formData.username}
            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            required
            className="bg-obsidian-panel/50 border-white/5"
          />

          <AmberInput
            label={t('auth.register.email') || 'Email'}
            type="email"
            placeholder={t('auth.register.email_placeholder') || 'Enter contact email'}
            icon={<Mail className="w-4 h-4" />}
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
            className="bg-obsidian-panel/50 border-white/5"
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
              className="bg-obsidian-panel/50 border-white/5"
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
              className="bg-obsidian-panel/50 border-white/5"
            />
          </div>
        </div>

        <motion.div
           whileHover={{ scale: 1.01 }}
           whileTap={{ scale: 0.99 }}
           className="pt-4"
        >
          <AmberButton
            type="submit"
            variant="primary"
            size="lg"
            className="w-full relative py-6 group"
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="font-bold uppercase tracking-widest">{t('common.loading')}</span>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2">
                <span className="font-bold uppercase tracking-widest">{t('auth.register.submit') || 'Create Account'}</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            )}
          </AmberButton>
        </motion.div>
      </form>

      <div className="pt-4 flex flex-col items-center gap-4">
        <div className="w-full h-px bg-gradient-to-r from-transparent via-white/5 to-transparent" />
        
        <p className="text-[10px] font-bold text-zinc-muted uppercase tracking-widest flex items-center gap-2">
          {t('auth.register.has_account') || 'Already have access?'}{' '}
          <Link
            href="/login"
            className="text-white hover:text-brand transition-colors border-b border-white/10 hover:border-brand/40 pb-0.5"
          >
            {t('auth.register.login') || 'Sign In'}
          </Link>
        </p>
      </div>
    </motion.div>
  );
};

