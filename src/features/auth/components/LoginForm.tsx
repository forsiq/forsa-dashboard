import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Lock, Eye, EyeOff, Loader2, Phone, ChevronRight, WifiOff, ShieldX, AlertTriangle, RotateCw, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { AmberInput } from '@core/components/AmberInput';
import { AmberButton } from '@core/components/AmberButton';
import { useAuth } from '../hooks/useAuth';
import { LoginMethod } from '../types';
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

type LoginStep = 'credentials' | 'otp';

export const LoginForm: React.FC = () => {
  const { t } = useLanguage();
  const { loginWithPassword, loginWithOtp, sendLoginOtp, isLoading, error: authError, otpCooldown } = useAuth();
  const [loginMethod, setLoginMethod] = useState<LoginMethod>('password');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [step, setStep] = useState<LoginStep>('credentials');
  const [otpCode, setOtpCode] = useState('');
  const [cooldownTimer, setCooldownTimer] = useState<number>(0);

  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('remember_phone');
      if (saved) {
        setPhone(saved);
        setRememberMe(true);
      }
    }
  }, []);

  // Countdown timer for OTP resend
  useEffect(() => {
    if (otpCooldown && otpCooldown > 0 && step === 'otp') {
      setCooldownTimer(otpCooldown);
    }
  }, [otpCooldown, step]);

  useEffect(() => {
    if (cooldownTimer <= 0) return;
    const interval = setInterval(() => {
      setCooldownTimer((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [cooldownTimer]);

  // ── Password Login ──
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    if (!phone.trim() || !password.trim()) {
      setLocalError(t('error.required_fields') || 'Please fill in all fields');
      return;
    }

    try {
      await loginWithPassword(phone, password);

      if (typeof window !== 'undefined') {
        if (rememberMe) {
          localStorage.setItem('remember_phone', phone);
        } else {
          localStorage.removeItem('remember_phone');
        }
      }
    } catch (err) {
      console.error('[LoginForm] password login error:', err);
    }
  };

  // ── OTP Login Step 1: Send OTP ──
  const handleOtpSend = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    if (!phone.trim()) {
      setLocalError(t('auth.errors.phone_required') || 'Phone number is required');
      return;
    }

    try {
      await sendLoginOtp(phone);
      setStep('otp');
    } catch (err) {
      console.error('[LoginForm] OTP send error:', err);
    }
  };

  // ── OTP Login Step 2: Verify OTP ──
  const handleOtpVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    if (otpCode.length !== 6) {
      setLocalError(t('auth.errors.otp_required') || 'Please enter the 6-digit code');
      return;
    }

    try {
      await loginWithOtp(phone, otpCode);
    } catch (err) {
      console.error('[LoginForm] OTP verify error:', err);
    }
  };

  const handleResendOtp = async () => {
    if (cooldownTimer > 0) return;
    try {
      await sendLoginOtp(phone);
    } catch {
      // error handled by hook
    }
  };

  const rawError = localError || authError;
  const currentError = resolveAuthErrorMessage(rawError, t);
  const errorInfo = rawError ? getErrorInfo(rawError) : null;
  const isRateLimited =
    rawError === AUTH_ERROR_CODES.TOO_MANY_ATTEMPTS ||
    Boolean(rawError?.toLowerCase().includes('too many'));

  // ── OTP verification step ──
  if (step === 'otp') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="w-full space-y-8"
      >
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-brand/10 border border-brand/20 flex items-center justify-center">
            <MessageSquare className="w-8 h-8 text-brand" />
          </div>
          <div className="text-center space-y-1">
            <h3 className="text-base font-black text-zinc-text uppercase tracking-widest">
              {t('auth.otp.verify_identity') || 'VERIFY IDENTITY'}
            </h3>
            <p className="text-[11px] font-bold text-zinc-muted uppercase tracking-[0.15em]">
              {t('auth.otp.sent_to') || 'ENTER THE 6-DIGIT CODE SENT TO'} {phone}
            </p>
          </div>
        </div>

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
              <p className={`text-[13px] font-bold flex-1 ${
                errorInfo.type === 'validation' && isRateLimited ? 'text-warning' : 'text-danger'
              }`}>
                {currentError}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleOtpVerify} className="space-y-8">
          <div className="grid grid-cols-6 gap-3">
            {[0, 1, 2, 3, 4, 5].map((index) => (
              <input
                key={index}
                type="text"
                inputMode="numeric"
                maxLength={1}
                className="w-full h-14 text-center text-xl font-black bg-obsidian-card border border-border rounded-xl focus:border-brand/50 focus:ring-1 focus:ring-brand/20 outline-none transition-all text-zinc-text placeholder:text-zinc-muted/30"
                placeholder="•"
                value={otpCode[index] || ''}
                onChange={(e) => {
                  const newCode = otpCode.split('');
                  newCode[index] = e.target.value.replace(/[^0-9]/g, '');
                  setOtpCode(newCode.join(''));
                  if (e.target.value && index < 5) {
                    const elements = e.target.parentElement?.querySelectorAll('input');
                    elements?.[index + 1]?.focus();
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Backspace' && !otpCode[index] && index > 0) {
                    const elements = e.currentTarget.parentElement?.querySelectorAll('input');
                    elements?.[index - 1]?.focus();
                  }
                }}
              />
            ))}
          </div>

          <AmberButton
            type="submit"
            variant="primary"
            size="lg"
            className="w-full h-14 rounded-2xl"
            disabled={isLoading || otpCode.length !== 6}
          >
            {isLoading ? (
              <div className="flex items-center gap-3">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span className="font-bold uppercase tracking-[0.2em]">{t('common.loading')}</span>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2">
                <span className="font-bold uppercase tracking-[0.15em]">{t('auth.otp.submit') || 'VERIFY'}</span>
                <ChevronRight className="w-4 h-4" />
              </div>
            )}
          </AmberButton>
        </form>

        <div className="text-center pt-2">
          <div className="w-full h-px bg-border mb-4" />
          <button
            type="button"
            onClick={() => setStep('credentials')}
            className="text-[11px] font-bold text-zinc-muted uppercase tracking-[0.1em] hover:text-brand transition-colors"
          >
            {t('auth.login.back') || 'BACK TO LOGIN'}
          </button>
          <span className="text-zinc-muted mx-3">|</span>
          <button
            type="button"
            onClick={handleResendOtp}
            disabled={cooldownTimer > 0}
            className={`text-[11px] font-bold uppercase tracking-[0.1em] transition-colors ${
              cooldownTimer > 0 ? 'text-zinc-muted cursor-not-allowed' : 'text-brand hover:opacity-80'
            }`}
          >
            {cooldownTimer > 0
              ? `${t('auth.otp.resend_in') || 'RESEND IN'} ${cooldownTimer}s`
              : (t('auth.otp.resend_button') || 'RESEND OTP')}
          </button>
        </div>
      </motion.div>
    );
  }

  // ── Credentials step ──
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="w-full space-y-8"
    >
      {/* Method toggle */}
      <div className="flex gap-2 p-1 bg-white/5 rounded-xl">
        <button
          type="button"
          onClick={() => { setLoginMethod('password'); setLocalError(null); }}
          className={`flex-1 py-2.5 text-[11px] font-bold uppercase tracking-[0.1em] rounded-lg transition-all ${
            loginMethod === 'password'
              ? 'bg-brand text-obsidian-outer'
              : 'text-zinc-muted hover:text-zinc-secondary'
          }`}
        >
          {t('auth.login.password_tab') || 'PASSWORD'}
        </button>
        <button
          type="button"
          onClick={() => { setLoginMethod('otp'); setLocalError(null); }}
          className={`flex-1 py-2.5 text-[11px] font-bold uppercase tracking-[0.1em] rounded-lg transition-all ${
            loginMethod === 'otp'
              ? 'bg-brand text-obsidian-outer'
              : 'text-zinc-muted hover:text-zinc-secondary'
          }`}
        >
          {t('auth.login.otp_tab') || 'OTP'}
        </button>
      </div>

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
              <p className={`text-[13px] font-bold ${
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

      {/* Phone + Password Form */}
      {loginMethod === 'password' && (
        <form onSubmit={handlePasswordSubmit} className="space-y-6">
          <div className="space-y-5">
            <AmberInput
              label={t('login.phone') || 'Phone Number'}
              placeholder={t('login.phone_placeholder') || '+966...'}
              icon={<Phone className="w-5 h-5 text-brand/60" />}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              autoComplete="tel"
              type="tel"
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
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <div className="flex justify-end px-1">
                <Link
                  href="/forgot-password"
                  className="text-[11px] font-bold text-brand hover:opacity-80 transition-opacity uppercase tracking-[0.1em]"
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
      )}

      {/* Phone + OTP Form */}
      {loginMethod === 'otp' && (
        <form onSubmit={handleOtpSend} className="space-y-6">
          <div className="space-y-5">
            <AmberInput
              label={t('login.phone') || 'Phone Number'}
              placeholder={t('login.phone_placeholder') || '+966...'}
              icon={<Phone className="w-5 h-5 text-brand/60" />}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              autoComplete="tel"
              type="tel"
            />
          </div>

          <p className="text-[11px] text-zinc-muted text-center uppercase tracking-[0.1em]">
            {t('auth.login.otp_hint') || 'We will send a verification code to your phone'}
          </p>

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
                <span className="font-bold uppercase tracking-[0.15em]">{t('auth.login.send_otp') || 'SEND CODE'}</span>
                <ChevronRight className="w-4 h-4" />
              </div>
            )}
          </AmberButton>
        </form>
      )}

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
