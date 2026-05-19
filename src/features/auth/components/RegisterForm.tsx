import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { Phone, Lock, Eye, EyeOff, Loader2, ChevronRight, CheckCircle2, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { AmberInput } from '@core/components/AmberInput';
import { AmberButton } from '@core/components/AmberButton';
import { useAuth } from '../hooks/useAuth';
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
  const { registerInit, isLoading, error: authError } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [isOtpSent, setIsOtpSent] = useState(false);

  const [formData, setFormData] = useState({
    phone: '',
    firstName: '',
    lastName: '',
    password: '',
    confirmPassword: '',
  });

  const passwordStrength = useMemo(() => getPasswordStrength(formData.password), [formData.password]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    if (!formData.phone.trim()) {
      setLocalError(t('auth.errors.phone_required') || 'Phone number is required');
      return;
    }

    if (formData.password && formData.password.length < 6) {
      setLocalError(t('validation.password_too_short') || 'Password must be at least 6 characters');
      return;
    }

    if (formData.password && formData.password !== formData.confirmPassword) {
      setLocalError(t('error.password_mismatch') || 'Passwords do not match');
      return;
    }

    try {
      // Store phone + names in sessionStorage for OTP page to use
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('zv_auth_phone', formData.phone);
        if (formData.firstName) sessionStorage.setItem('zv_auth_firstName', formData.firstName);
        if (formData.lastName) sessionStorage.setItem('zv_auth_lastName', formData.lastName);
      }

      await registerInit(formData.phone, formData.password || undefined);
      // OTP sent — redirect to OTP verification page
      window.location.href = '/otp';
    } catch (err: any) {
      console.error('[RegisterForm] Registration init failed:', err);
      setLocalError(err?.message || 'Registration failed. Please try again.');
    }
  };

  const currentError = localError || authError;

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
            <p className="text-[13px] font-bold text-danger">
              {currentError}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid gap-5">
          {/* Phone Number */}
          <AmberInput
            label={t('auth.register.phone') || 'Phone Number'}
            placeholder={t('auth.register.phone_placeholder') || '+966...'}
            icon={<Phone className="w-5 h-5 text-brand/60" />}
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            required
            type="tel"
          />

          {/* First Name */}
          <AmberInput
            label={t('auth.register.first_name') || 'First Name'}
            placeholder={t('auth.register.first_name_placeholder') || 'First Name'}
            icon={<User className="w-5 h-5 text-brand/60" />}
            value={formData.firstName}
            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
          />

          {/* Last Name */}
          <AmberInput
            label={t('auth.register.last_name') || 'Last Name'}
            placeholder={t('auth.register.last_name_placeholder') || 'Last Name'}
            icon={<User className="w-5 h-5 text-brand/60" />}
            value={formData.lastName}
            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
          />

          {/* Password (optional) */}
          <div className="space-y-2">
            <AmberInput
              label={t('auth.register.password') || 'Password (optional)'}
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              icon={<Lock className="w-5 h-5 text-brand/60" />}
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
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
                <span className={`text-[11px] font-bold uppercase tracking-wider ${
                  passwordStrength.label === 'weak' ? 'text-danger' :
                  passwordStrength.label === 'fair' ? 'text-warning' : 'text-success'
                }`}>
                  {t(`auth.password.${passwordStrength.label}`)}
                </span>
              </div>
            )}
          </div>

          {/* Confirm Password */}
          {formData.password && (
            <AmberInput
              label={t('auth.register.confirm_password') || 'Confirm Password'}
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
          )}
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
              <span className="font-bold uppercase tracking-[0.15em]">
                {t('auth.register.send_otp') || 'SEND VERIFICATION CODE'}
              </span>
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
