import React from 'react';
import { ThemeToggle } from '../components/ThemeToggle';
import { useLanguage } from '@core/contexts/LanguageContext';

export const PreferencesPage = () => {
  const { t } = useLanguage();
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-black text-zinc-text uppercase tracking-wider">
          {t('settings.preferences_title')}
        </h2>
        <p className="text-sm text-zinc-muted mt-1">
          {t('settings.preferences_desc')}
        </p>
      </div>
      <div className="space-y-4">
        <ThemeToggle />
      </div>
    </div>
  );
};
