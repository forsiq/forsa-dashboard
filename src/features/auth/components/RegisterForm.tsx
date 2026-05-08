import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { Mail, Lock, User, Eye, EyeOff, Loader2, ChevronRight, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { AmberInput } from '@core/components/AmberInput';
import { AmberButton } from '@core/components/AmberButton';
import { useAuth } from '../hooks/useAuth';
import { RegisterData } from '../types';
import { useLanguage } from '@core/contexts/LanguageContext';

function getPasswordStrength(password: string): { score: number; label: string; color: string } {
  if (!password) return { score: 0, label: '', color: '' };
  
  let score = 0;
  if (password.length >= 6) score++;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 2) return { score: 1, label: 'weak', color: 'bg-danger' };
  if (score <= 3) return { score: 2, label: 'fair', color: 'bg-warning' };
  return { score: 3, label: 'strong', color: 'bg-success' };
}

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

  const passwordStrength = useMemo(() => getPasswordStrength(formData.password), [formData.password]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

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
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="text-center space-y-8 py-8"
      >
        <div className="flex justify-center">
          <div className="w-20 h-20 bg-success/10 rounded-2xl flex items-center justify-center border border-success/20">
            <CheckCircle2 className="w-10 h-10 text-success" />
          </div>
        </div>
        <div className="space-y-3">
          <h2 className="text-2xl font-black text-zinc-text tracking-tight uppercase">
            {t('auth.register.success_title')}
          </h2>
          <p className="text-sm font-medium text-zinc-muted max-w-[320px] mx-auto leading-relaxed">
            {t('auth.register.success_desc')}
          </p>
        </div>
        <AmberButton variant="primary" size="lg" className="w-full h-14 rounded-2xl" onClick={() => window.location.href = '/login'}>
            <span className="font-bold uppercase tracking-[0.15em]">{t('auth.register.proceed_login')}</span>
        </AmberButton>
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="w-full space-y-8"
    >
      <AnimatePresence mode="wait">
        {currentError && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-danger/10 border border-danger/20 p-4 rounded-2xl flex items-center gap-3 overflow-hidden"
          >
            <div className="w-2 h-2 rounded-full bg-danger shrink-0" />
            <p className="text-xs font-bold text-danger">
              {currentError}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid gap-5">
          <AmberInput
            label={t('auth.register.username') || 'Username'}
            placeholder={t('auth.register.username_placeholder') || 'IDENTITY'}
            icon={<User className="w-5 h-5 text-brand/60" />}
            value={formData.username}
            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            required
          />

          <AmberInput
            label={t('auth.register.email') || 'Email'}
            type="email"
            placeholder={t('auth.register.email_placeholder') || 'CONTACT@PROTOCOL.COM'}
            icon={<Mail className="w-5 h-5 text-brand/60" />}
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />

          <div className="space-y-2">
            <AmberInput
              label={t('auth.register.password') || 'Password'}
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              icon={<Lock className="w-5 h-5 text-brand/60" />}
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
            />
            {formData.password && (
              <div className="flex items-center gap-3 px-1">
                <div className="flex-1 flex gap-1">
                  {[1, 2, 3].map((level) => (
                    <div
                      key={level}
                      className={`h-1 flex-1 rounded-full transition-all ${
                        passwordStrength.score >= level ? passwordStrength.color : 'bg-border'
                      }`}
                    />
                  ))}
                </div>
                <span className={`text-[10px] font-bold uppercase tracking-wider ${
                  passwordStrength.label === 'weak' ? 'text-danger' :
                  passwordStrength.label === 'fair' ? 'text-warning' : 'text-success'
                }`}>
                  {t(`auth.password.${passwordStrength.label}`)}
                </span>
              </div>
            )}
          </div>

          <AmberInput
            label={t('auth.register.confirm_password') || 'Confirm'}
            type={showPassword ? 'text' : 'password'}
            placeholder="••••••••"
            icon={<Lock className="w-5 h-5 text-brand/60" />}
            rightElement={
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="p-2 me-2 text-zinc-muted hover:text-brand transition-colors outline-none"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            }
            value={formData.confirmPassword}
            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
            error={formData.password !== formData.confirmPassword && formData.confirmPassword ? t('auth.register.password_mismatch_inline') : ''}
            required
          />
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
              <span className="font-bold uppercase tracking-[0.15em]">{t('auth.register.submit') || 'INITIALIZE ACCOUNT'}</span>
              <ChevronRight className="w-4 h-4" />
            </div>
          )}
        </AmberButton>
      </form>

      <div className="pt-2">
        <div className="w-full h-px bg-border mb-6" />
        <p className="text-[11px] font-bold text-zinc-muted uppercase tracking-[0.1em] text-center leading-relaxed">
          {t('auth.register.has_account') || 'ALREADY HAVE ACCESS?'}{' '}
          <Link
            href="/login"
            className="text-brand hover:opacity-80 transition-opacity"
          >
            {t('auth.register.login') || 'RETURN TO SIGN IN'}
          </Link>
        </p>
      </div>
    </motion.div>
  );
};
