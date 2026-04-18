import React from 'react';
import { LoginForm } from '../components/LoginForm';
import { AmberAuthLayout } from '@core/layout/AmberAuthLayout';
import { useLanguage } from '@core/contexts/LanguageContext';

export const LoginPage = () => {
  const { t } = useLanguage();
  return (
    <AmberAuthLayout 
      title={t('login.welcome')} 
      subtitle={t('login.subtitle')}
    >
      <LoginForm />
    </AmberAuthLayout>
  );
};
