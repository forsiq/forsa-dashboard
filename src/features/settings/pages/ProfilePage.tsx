import React from 'react';
import { SettingsForm } from '../components/SettingsForm';
import { useLanguage } from '@core/contexts/LanguageContext';

export const ProfilePage = () => {
  const { t } = useLanguage();
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-black text-zinc-text uppercase tracking-wider">
          {t('settings.profile_title')}
        </h2>
        <p className="text-sm text-zinc-muted mt-1">
          {t('settings.profile_desc')}
        </p>
      </div>
      <SettingsForm />
    </div>
  );
};
