import React, { useState } from 'react';
import { Shield } from 'lucide-react';
import { AmberInput } from '@core/components/AmberInput';
import { AmberButton } from '@core/components/AmberButton';
import { useAuth } from '../hooks/useAuth';
import { OTPData } from '../types';
import { useLanguage } from '@core/contexts/LanguageContext';

export const OTPForm: React.FC = () => {
  const { t } = useLanguage();
  const { verifyOTP, isLoading, error } = useAuth();
  const [code, setCode] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await verifyOTP({ code });
    } catch (err) {
      // Error is handled by useAuth hook
    }
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-6">
      <div className="text-center space-y-2">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-brand/10 border border-brand/20 flex items-center justify-center">
          <Shield className="w-8 h-8 text-brand" />
        </div>
        <h1 className="text-2xl font-black text-zinc-text tracking-tighter uppercase italic">
          {t('auth.otp.title') || 'Verify OTP'}
        </h1>
        <p className="text-sm font-medium text-zinc-muted">
          {t('auth.otp.subtitle') || 'Enter the verification code sent to your device'}
        </p>
      </div>

      {error && (
        <div className="p-4 bg-danger/5 border border-danger/20 rounded-sm">
          <p className="text-sm text-danger font-medium">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-6 gap-2">
          {[0, 1, 2, 3, 4, 5].map((index) => (
            <input
              key={index}
              type="text"
              inputMode="numeric"
              maxLength={1}
              className="w-full h-14 text-center text-2xl font-bold bg-obsidian-panel border border-white/10 rounded-sm focus:border-brand/30 outline-none transition-all"
              value={code[index] || ''}
              onChange={(e) => {
                const newCode = code.split('');
                newCode[index] = e.target.value;
                setCode(newCode.join(''));
                // Auto-focus next input
                if (e.target.value && index < 5) {
                  (e.target.nextElementSibling as HTMLInputElement)?.focus();
                }
              }}
              onKeyDown={(e) => {
                // Handle backspace
                if (e.key === 'Backspace' && !code[index] && index > 0) {
                  const target = e.target as HTMLInputElement;
                  target.previousElementSibling?.querySelector('input')?.focus();
                }
              }}
            />
          ))}
        </div>

        <AmberButton
          type="submit"
          variant="primary"
          size="lg"
          className="w-full"
          disabled={isLoading || code.length !== 6}
        >
          {isLoading ? (t('common.loading') || 'Loading...') : (t('auth.otp.submit') || 'Verify')}
        </AmberButton>
      </form>

      <div className="text-center">
        <p className="text-[10px] font-bold text-zinc-muted uppercase tracking-wider">
          {t('auth.otp.resend') || "Didn't receive code?"}{' '}
          <button className="text-brand hover:text-brand/80 transition-colors">
            {t('auth.otp.resend_button') || 'Resend'}
          </button>
        </p>
      </div>
    </div>
  );
};
