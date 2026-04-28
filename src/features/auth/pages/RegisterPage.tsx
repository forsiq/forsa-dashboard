import React from 'react';
import { RegisterForm } from '../components/RegisterForm';
import { ForsaAuthLayout } from '../../../layout/ForsaAuthLayout';
import { useLanguage } from '@core/contexts/LanguageContext';

export const RegisterPage = () => {
  const { t } = useLanguage();
  return (
    <ForsaAuthLayout 
      title={t('auth.register.title')} 
      subtitle={t('auth.register.subtitle')}
    >
      <RegisterForm />
    </ForsaAuthLayout>
  );
};
