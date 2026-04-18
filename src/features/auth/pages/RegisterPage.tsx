import React from 'react';
import { RegisterForm } from '../components/RegisterForm';
import { AmberAuthLayout } from '@core/layout/AmberAuthLayout';
import { useLanguage } from '@core/contexts/LanguageContext';

export const RegisterPage = () => {
  const { t } = useLanguage();
  return (
    <AmberAuthLayout 
      title={t('auth.register.title')} 
      subtitle={t('auth.register.subtitle')}
    >
      <RegisterForm />
    </AmberAuthLayout>
  );
};
