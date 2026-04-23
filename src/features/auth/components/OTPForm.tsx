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
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="w-full max-w-md mx-auto space-y-12"
    >
      <div className="flex flex-col items-center gap-6">
        <div className="w-20 h-20 rounded-[2rem] bg-brand/10 border border-brand/20 flex items-center justify-center shadow-[0_0_30px_rgba(255,192,0,0.15)] ring-1 ring-brand/30 animate-pulse-slow">
          <Shield className="w-10 h-10 text-brand" />
        </div>
         <div className="text-center space-y-2">
            <h3 className="text-lg font-black text-white uppercase tracking-widest">{t('auth.otp.verify_identity') || 'SECURE VERIFICATION'}</h3>
            <p className="text-[10px] font-black text-zinc-muted uppercase tracking-[0.2em]">{t('auth.otp.sent_to') || 'ENTER THE 6-DIGIT CODE'}</p>
         </div>
      </div>

      <AnimatePresence mode="wait">
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-danger/10 border border-danger/20 p-5 rounded-3xl flex items-center gap-4 overflow-hidden"
          >
            <div className="w-2 h-2 rounded-full bg-danger animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.5)]" />
            <p className="text-[12px] font-black text-danger uppercase tracking-[0.1em]">
              {error}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <form onSubmit={handleSubmit} className="space-y-12">
        <div className="grid grid-cols-6 gap-4">
          {[0, 1, 2, 3, 4, 5].map((index) => (
            <input
              key={index}
              type="text"
              inputMode="numeric"
              maxLength={1}
              className="w-full h-14 text-center text-2xl font-black bg-white/[0.03] border border-white/10 rounded-2xl focus:border-brand/50 focus:bg-white/[0.06] outline-none transition-all text-white shadow-2xl placeholder:text-zinc-800"
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
          className="w-full h-14 bg-brand text-obsidian-outer shadow-2xl shadow-brand/20 group overflow-hidden relative rounded-[1.25rem]"
          disabled={isLoading || code.length !== 6}
        >
          {isLoading ? (
            <div className="flex items-center gap-3">
              <Loader2 className="w-6 h-6 animate-spin" />
              <span className="font-black uppercase tracking-[0.3em] text-lg">{t('common.loading')}</span>
            </div>
          ) : (
            <span className="font-black uppercase tracking-[0.25em] text-base">{t('auth.otp.submit') || 'VERIFY PROTOCOL'}</span>
          )}
          <div className="absolute inset-0 bg-white/30 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 skew-x-12" />
        </AmberButton>
      </form>

      <div className="text-center pt-4">
        <div className="w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent mb-8" />
        <p className="text-[11px] font-black text-zinc-muted uppercase tracking-[0.2em] leading-relaxed">
          {t('auth.otp.resend') || "DIDN'T RECEIVE THE CODE?"}<br />
          <button className="text-brand hover:text-brand-light transition-all mt-4 inline-block decoration-brand/30 underline underline-offset-8 decoration-2 hover:scale-105">
            {t('auth.otp.resend_button') || 'RESEND REQUEST'}
          </button>
        </p>
      </div>
    </motion.div>
  );
};
