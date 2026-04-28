import React from 'react';
import { OTPForm } from '../components/OTPForm';
import { ForsaAuthLayout } from '../../../layout/ForsaAuthLayout';
import { useLanguage } from '@core/contexts/LanguageContext';

export const OTPPage = () => {
  const { t } = useLanguage();
  return (
    <ForsaAuthLayout 
      title={t('auth.otp.title')} 
      subtitle={t('auth.otp.subtitle')}
    >
      <OTPForm />
    </ForsaAuthLayout>
  );
};
