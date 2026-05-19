import React, { useState } from 'react';
import Link from 'next/link';
import { Phone, Lock, Loader2, ArrowLeft, CheckCircle2, Shield } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { AmberInput } from '@core/components/AmberInput';
import { AmberButton } from '@core/components/AmberButton';
import { forgotPasswordInit, forgotPasswordConfirm } from '../services/authApi';
import { useLanguage } from '@core/contexts/LanguageContext';

type ForgotStep = 'phone' | 'otp' | 'success';

export const ForgotPasswordForm: React.FC = () => {
  const { t } = useLanguage();
  const [step, setStep] = useState<ForgotStep>('phone');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // ── Step 1: Send OTP to phone ──
  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!phone.trim()) {
      setError(t('auth.errors.phone_required') || 'Please enter your phone number');
      return;
    }

    setIsLoading(true);
    try {
      await forgotPasswordInit(phone);
      setStep('otp');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send OTP');
    } finally {
      setIsLoading(false);
    }
  };

  // ── Step 2: Verify OTP + set new password ──
  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (otp.length !== 6) {
      setError(t('auth.errors.otp_required') || 'Please enter the 6-digit code');
      return;
    }

    if (!newPassword || newPassword.length < 6) {
      setError(t('validation.password_too_short') || 'Password must be at least 6 characters');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError(t('error.password_mismatch') || 'Passwords do not match');
      return;
    }

    setIsLoading(true);
    try {
      await forgotPasswordConfirm(phone, otp, newPassword);
      setStep('success');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Password reset failed');
    } finally {
      setIsLoading(false);
    }
  };

  // ── Success State ──
  if (step === 'success') {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="text-center space-y-6 py-4"
      >
        <div className="flex justify-center">
          <div className="w-16 h-16 bg-success/10 rounded-2xl flex items-center justify-center border border-success/20">
            <CheckCircle2 className="w-8 h-8 text-success" />
          </div>
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-black text-zinc-text tracking-tight uppercase">
            {t('auth.forgot.success_title') || 'Password Reset'}
          </h2>
          <p className="text-sm font-medium text-zinc-muted leading-relaxed">
            {t('auth.forgot.success_desc') || 'Your password has been reset successfully. You can now log in with your new password.'}
          </p>
        </div>
        <Link href="/login" className="inline-block w-full">
          <AmberButton variant="primary" size="lg" className="w-full h-12 rounded-2xl">
            <span className="font-bold uppercase tracking-[0.1em]">
              {t('auth.forgot.back_to_login') || 'Back to Login'}
            </span>
          </AmberButton>
        </Link>
      </motion.div>
    );
  }

  // ── Step 2: OTP + New Password ──
  if (step === 'otp') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="w-full space-y-6"
      >
        <div className="flex flex-col items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-brand/10 border border-brand/20 flex items-center justify-center">
            <Shield className="w-7 h-7 text-brand" />
          </div>
          <p className="text-sm text-zinc-secondary leading-relaxed text-center">
            {t('auth.forgot.otp_instructions') || 'Enter the code sent to your phone and set a new password.'}
          </p>
          <p className="text-[11px] font-bold text-brand uppercase tracking-[0.1em]">{phone}</p>
        </div>

        <AnimatePresence mode="wait">
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-danger/10 border border-danger/20 p-4 rounded-2xl flex items-center gap-3 overflow-hidden"
            >
              <div className="w-2 h-2 rounded-full bg-danger shrink-0" />
              <p className="text-[13px] font-bold text-danger">{error}</p>
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleOtpSubmit} className="space-y-5">
          <div className="grid grid-cols-6 gap-3">
            {[0, 1, 2, 3, 4, 5].map((index) => (
              <input
                key={index}
                type="text"
                inputMode="numeric"
                maxLength={1}
                className="w-full h-14 text-center text-xl font-black bg-obsidian-card border border-border rounded-xl focus:border-brand/50 focus:ring-1 focus:ring-brand/20 outline-none transition-all text-zinc-text placeholder:text-zinc-muted/30"
                placeholder="•"
                value={otp[index] || ''}
                onChange={(e) => {
                  const newCode = otp.split('');
                  newCode[index] = e.target.value.replace(/[^0-9]/g, '');
                  setOtp(newCode.join(''));
                  if (e.target.value && index < 5) {
                    const elements = e.target.parentElement?.querySelectorAll('input');
                    elements?.[index + 1]?.focus();
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Backspace' && !otp[index] && index > 0) {
                    const elements = e.currentTarget.parentElement?.querySelectorAll('input');
                    elements?.[index - 1]?.focus();
                  }
                }}
              />
            ))}
          </div>

          <AmberInput
            label={t('auth.forgot.new_password') || 'New Password'}
            type="password"
            placeholder="••••••••"
            icon={<Lock className="w-5 h-5 text-brand/60" />}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />

          <AmberInput
            label={t('auth.forgot.confirm_password') || 'Confirm Password'}
            type="password"
            placeholder="••••••••"
            icon={<Lock className="w-5 h-5 text-brand/60" />}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            error={newPassword !== confirmPassword && confirmPassword ? t('error.password_mismatch') || '' : ''}
            required
          />

          <AmberButton
            type="submit"
            variant="primary"
            size="lg"
            className="w-full h-12 rounded-2xl"
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="flex items-center gap-3">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span className="font-bold uppercase tracking-[0.15em]">{t('common.loading') || 'Resetting...'}</span>
              </div>
            ) : (
              <span className="font-bold uppercase tracking-[0.1em]">
                {t('auth.forgot.reset_button') || 'RESET PASSWORD'}
              </span>
            )}
          </AmberButton>
        </form>

        <div className="pt-2">
          <button
            type="button"
            onClick={() => { setStep('phone'); setError(null); }}
            className="flex items-center justify-center gap-2 text-sm font-bold text-brand hover:opacity-80 transition-opacity w-full"
          >
            <ArrowLeft className="w-4 h-4" />
            {t('auth.forgot.back') || 'Back'}
          </button>
        </div>
      </motion.div>
    );
  }

  // ── Step 1: Enter phone ──
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="w-full space-y-6"
    >
      <p className="text-sm text-zinc-secondary leading-relaxed">
        {t('auth.forgot.instructions') || 'Enter your phone number and we will send you a verification code to reset your password.'}
      </p>

      <AnimatePresence mode="wait">
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-danger/10 border border-danger/20 p-4 rounded-2xl flex items-center gap-3 overflow-hidden"
          >
            <div className="w-2 h-2 rounded-full bg-danger shrink-0" />
            <p className="text-[13px] font-bold text-danger">{error}</p>
          </motion.div>
        )}
      </AnimatePresence>

      <form onSubmit={handlePhoneSubmit} className="space-y-6">
        <AmberInput
          label={t('auth.forgot.phone') || 'Phone Number'}
          type="tel"
          placeholder={t('auth.forgot.phone_placeholder') || '+966...'}
          icon={<Phone className="w-5 h-5 text-brand/60" />}
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          required
          autoComplete="tel"
        />

        <AmberButton
          type="submit"
          variant="primary"
          size="lg"
          className="w-full h-12 rounded-2xl"
          disabled={isLoading}
        >
          {isLoading ? (
            <div className="flex items-center gap-3">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="font-bold uppercase tracking-[0.15em]">{t('common.loading') || 'Sending...'}</span>
            </div>
          ) : (
            <span className="font-bold uppercase tracking-[0.1em]">
              {t('auth.forgot.send_code') || 'Send Verification Code'}
            </span>
          )}
        </AmberButton>
      </form>

      <div className="pt-2">
        <div className="w-full h-px bg-border mb-4" />
        <Link
          href="/login"
          className="flex items-center justify-center gap-2 text-sm font-bold text-brand hover:opacity-80 transition-opacity"
        >
          <ArrowLeft className="w-4 h-4" />
          {t('auth.forgot.back_to_login') || 'Back to Login'}
        </Link>
      </div>
    </motion.div>
  );
};
