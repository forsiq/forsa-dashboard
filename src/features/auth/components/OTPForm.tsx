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
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="w-full max-w-md mx-auto space-y-8"
    >
      <div className="flex flex-col items-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-brand/10 border border-brand/20 flex items-center justify-center">
          <Shield className="w-8 h-8 text-brand" />
        </div>
        <div className="text-center space-y-1">
          <h3 className="text-base font-black text-zinc-text uppercase tracking-widest">{t('auth.otp.verify_identity') || 'SECURE VERIFICATION'}</h3>
          <p className="text-[10px] font-bold text-zinc-muted uppercase tracking-[0.15em]">{t('auth.otp.sent_to') || 'ENTER THE 6-DIGIT CODE'}</p>
        </div>
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
            <p className="text-xs font-bold text-danger">
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
              className="w-full h-14 text-center text-xl font-black bg-obsidian-card border border-border rounded-xl focus:border-brand/50 focus:ring-1 focus:ring-brand/20 outline-none transition-all text-zinc-text placeholder:text-zinc-muted/30"
              placeholder="•"
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
          className="w-full h-14 rounded-2xl"
          disabled={isLoading || code.length !== 6}
        >
          {isLoading ? (
            <div className="flex items-center gap-3">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="font-bold uppercase tracking-[0.2em]">{t('common.loading')}</span>
            </div>
          ) : (
            <span className="font-bold uppercase tracking-[0.15em]">{t('auth.otp.submit') || 'VERIFY PROTOCOL'}</span>
          )}
        </AmberButton>
      </form>

      <div className="text-center pt-2">
        <div className="w-full h-px bg-border mb-6" />
        <p className="text-[11px] font-bold text-zinc-muted uppercase tracking-[0.1em] leading-relaxed">
          {t('auth.otp.resend') || "DIDN'T RECEIVE THE CODE?"}{' '}
          <button className="text-brand hover:opacity-80 transition-opacity">
            {t('auth.otp.resend_button') || 'RESEND REQUEST'}
          </button>
        </p>
      </div>
    </motion.div>
  );
};
