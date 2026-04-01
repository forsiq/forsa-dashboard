import React from 'react';
import { ThemeToggle } from '../components/ThemeToggle';

export const PreferencesPage = () => {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-black text-zinc-text uppercase tracking-wider">
          Preferences
        </h2>
        <p className="text-sm text-zinc-muted mt-1">
          Customize your application experience
        </p>
      </div>
      <div className="space-y-4">
        <ThemeToggle />
      </div>
    </div>
  );
};
