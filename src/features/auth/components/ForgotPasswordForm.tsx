import React, { useState } from 'react';
import Link from 'next/link';
import { Mail, Loader2, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { AmberInput } from '@core/components/AmberInput';
import { AmberButton } from '@core/components/AmberButton';
import { requestPasswordReset } from '../services/authApi';
import { useLanguage } from '@core/contexts/LanguageContext';

export const ForgotPasswordForm: React.FC = () => {
  const { t } = useLanguage();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim()) {
      setError(t('auth.forgot.error_empty') || 'Please enter your email address');
      return;
    }

    setIsLoading(true);
    try {
      await requestPasswordReset({ email });
      setIsSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send reset email');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
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
            {t('auth.forgot.success_title') || 'Email Sent'}
          </h2>
          <p className="text-sm font-medium text-zinc-muted leading-relaxed">
            {t('auth.forgot.success_desc') || 'Check your email for a password reset link.'}
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="w-full space-y-6"
    >
      <p className="text-sm text-zinc-secondary leading-relaxed">
        {t('auth.forgot.instructions') || 'Enter your email address and we will send you a link to reset your password.'}
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
            <p className="text-xs font-bold text-danger">{error}</p>
          </motion.div>
        )}
      </AnimatePresence>

      <form onSubmit={handleSubmit} className="space-y-6">
        <AmberInput
          label={t('auth.forgot.email') || 'Email Address'}
          type="email"
          placeholder={t('auth.forgot.email_placeholder') || 'your@email.com'}
          icon={<Mail className="w-5 h-5 text-brand/60" />}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
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
              {t('auth.forgot.submit') || 'Send Reset Link'}
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
