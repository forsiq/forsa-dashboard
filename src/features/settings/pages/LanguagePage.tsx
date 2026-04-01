import React from 'react';
import { LanguageSelector } from '../components/LanguageSelector';

export const LanguagePage = () => {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-black text-zinc-text uppercase tracking-wider">
          Language & Region
        </h2>
        <p className="text-sm text-zinc-muted mt-1">
          Select your preferred language
        </p>
      </div>
      <LanguageSelector />
    </div>
  );
};
