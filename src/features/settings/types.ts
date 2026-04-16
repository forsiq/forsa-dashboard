export interface UserProfile {
  id: string;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
}

export interface UserPreferences {
  theme: 'light' | 'dark';
  language: 'en' | 'ar' | 'ku';
  notifications: boolean;
  emailUpdates: boolean;
}

export interface SettingsSection {
  id: string;
  title: string;
  icon?: React.ReactNode;
  path: string;
}
