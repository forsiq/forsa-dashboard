import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { OTPForm } from '../components/OTPForm';
import { ForsaAuthLayout } from '../../../layout/ForsaAuthLayout';
import { useLanguage } from '@core/contexts/LanguageContext';
import { useToast } from '@core/contexts/ToastContext';

function getCookie(name: string): string | undefined {
  if (typeof document === 'undefined') return undefined;
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : undefined;
}

export const OTPPage = () => {
  const { t } = useLanguage();
  const router = useRouter();
  const toast = useToast();
  const [canProceed, setCanProceed] = useState(false);

  useEffect(() => {
    const hasAuthContext =
      getCookie('access') ||
      sessionStorage.getItem('zv_registration_phone') ||
      sessionStorage.getItem('zv_otp_context') ||
      router.query.from === 'register' ||
      router.query.from === 'forgot-password';

    if (!hasAuthContext) {
      toast.warning(t('auth.otp.no_context') || 'Please register or log in first to access this page.');
      void router.replace('/register');
      return;
    }

    setCanProceed(true);
  }, [router, toast, t]);

  if (!canProceed) {
    return (
      <ForsaAuthLayout
        title={t('auth.otp.title')}
        subtitle={t('auth.otp.subtitle')}
      >
        <div className="flex items-center justify-center py-12">
          <div className="w-6 h-6 border-2 border-brand border-t-transparent rounded-full animate-spin" />
        </div>
      </ForsaAuthLayout>
    );
  }

  return (
    <ForsaAuthLayout
      title={t('auth.otp.title')}
      subtitle={t('auth.otp.subtitle')}
    >
      <OTPForm />
    </ForsaAuthLayout>
  );
};
