import React from 'react';
import { ForgotPasswordForm } from '../components/ForgotPasswordForm';
import { ForsaAuthLayout } from '../../../layout/ForsaAuthLayout';
import { useLanguage } from '@core/contexts/LanguageContext';

export const ForgotPasswordPage = () => {
  const { t } = useLanguage();
  return (
    <ForsaAuthLayout 
      title={t('auth.forgot.title') || 'Reset Password'} 
      subtitle={t('auth.forgot.subtitle') || 'Recover your account'}
    >
      <ForgotPasswordForm />
    </ForsaAuthLayout>
  );
};
