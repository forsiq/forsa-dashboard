import React, { useEffect } from 'react';
import { LoginForm } from '../components/LoginForm';
import { ForsaAuthLayout } from '../../../layout/ForsaAuthLayout';
import { useLanguage } from '@core/contexts/LanguageContext';
import { clearViewportBlockers } from '@core/lib/utils/clearViewportBlockers';

export const LoginPage = () => {
  const { t } = useLanguage();

  useEffect(() => {
    clearViewportBlockers();
  }, []);

  return (
    <ForsaAuthLayout
      title={t('auth.loginTitle')}
      subtitle={t('auth.loginSubtitle')}
    >
      <LoginForm />
    </ForsaAuthLayout>
  );
};
