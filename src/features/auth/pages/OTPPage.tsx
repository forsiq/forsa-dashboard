import React from 'react';
import { OTPForm } from '../components/OTPForm';
import { AmberAuthLayout } from '@core/layout/AmberAuthLayout';
import { useLanguage } from '@core/contexts/LanguageContext';

export const OTPPage = () => {
  const { t } = useLanguage();
  return (
    <AmberAuthLayout 
      title={t('auth.otp.title')} 
      subtitle={t('auth.otp.subtitle')}
    >
      <OTPForm />
    </AmberAuthLayout>
  );
};
