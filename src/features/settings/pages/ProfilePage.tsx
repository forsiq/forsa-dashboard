import React from 'react';
import { SettingsForm } from '../components/SettingsForm';

export const ProfilePage = () => {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-black text-zinc-text uppercase tracking-wider">
          Profile Settings
        </h2>
        <p className="text-sm text-zinc-muted mt-1">
          Update your personal information
        </p>
      </div>
      <SettingsForm />
    </div>
  );
};
