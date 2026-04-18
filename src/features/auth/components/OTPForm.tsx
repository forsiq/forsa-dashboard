import React, { useState } from 'react';
import { Shield, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { AmberButton } from '@core/components/AmberButton';
import { useAuth } from '../hooks/useAuth';
import { useLanguage } from '@core/contexts/LanguageContext';

export const OTPForm: React.FC = () => {
  const { t } = useLanguage();
  const { verifyOTP, isLoading, error } = useAuth();
  const [code, setCode] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await verifyOTP({ code });
    } catch (err) { }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-md mx-auto space-y-8"
    >
      <div className="flex justify-center mb-2">
        <div className="w-16 h-16 rounded-2xl bg-brand/10 border border-brand/20 flex items-center justify-center shadow-[0_0_20px_rgba(255,192,0,0.1)]">
          <Shield className="w-8 h-8 text-brand" />
        </div>
      </div>

      <AnimatePresence mode="wait">
        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-danger/10 border border-danger/20 p-4 rounded-2xl flex items-center gap-3"
          >
            <div className="w-1.5 h-1.5 rounded-full bg-danger animate-pulse" />
            <p className="text-[11px] font-bold text-danger uppercase tracking-wider">
              {error}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-6 gap-3">
          {[0, 1, 2, 3, 4, 5].map((index) => (
            <input
              key={index}
              type="text"
              inputMode="numeric"
              maxLength={1}
              className="w-full h-14 text-center text-2xl font-bold bg-white dark:bg-white/[0.02] border border-zinc-200 dark:border-white/10 rounded-xl focus:border-brand/40 dark:focus:bg-white/[0.05] outline-none transition-all text-zinc-text shadow-sm dark:shadow-inner"
              value={code[index] || ''}
              onChange={(e) => {
                const newCode = code.split('');
                newCode[index] = e.target.value.replace(/[^0-9]/g, '');
                setCode(newCode.join(''));
                if (e.target.value && index < 5) {
                   const elements = e.target.parentElement?.querySelectorAll('input');
                   elements?.[index + 1]?.focus();
                }
              }}
              onKeyDown={(e) => {
                if (e.key === 'Backspace' && !code[index] && index > 0) {
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
          className="w-full h-14 bg-brand text-obsidian-outer shadow-xl shadow-brand/10 group overflow-hidden relative"
          disabled={isLoading || code.length !== 6}
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="font-black uppercase tracking-[0.2em]">{t('common.loading')}</span>
            </div>
          ) : (
            <span className="font-black uppercase tracking-[0.2em]">{t('auth.otp.submit') || 'Verify'}</span>
          )}
          <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 skew-x-12" />
        </AmberButton>
      </form>

      <div className="text-center pt-2">
        <div className="w-full h-px bg-gradient-to-r from-transparent via-zinc-200 dark:via-white/5 to-transparent mb-6" />
        <p className="text-[11px] font-bold text-zinc-muted dark:text-zinc-muted uppercase tracking-widest leading-relaxed">
          {t('auth.otp.resend') || "Didn't receive code?"}<br />
          <button className="text-brand hover:text-brand-light transition-colors mt-2 decoration-brand/30 underline underline-offset-4">
            {t('auth.otp.resend_button') || 'Resend Code'}
          </button>
        </p>
      </div>
    </motion.div>
  );
};
