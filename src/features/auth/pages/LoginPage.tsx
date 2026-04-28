import React from 'react';
import { LoginForm } from '../components/LoginForm';
import { ForsaAuthLayout } from '../../../layout/ForsaAuthLayout';
import { useLanguage } from '@core/contexts/LanguageContext';

export const LoginPage = () => {
  const { t } = useLanguage();
  return (
    <ForsaAuthLayout 
      title={t('login.welcome')} 
      subtitle={t('login.subtitle')}
    >
      <LoginForm />
    </ForsaAuthLayout>
  );
};
