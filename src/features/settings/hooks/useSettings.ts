import { useState, useEffect } from 'react';
import { UserProfile, UserPreferences } from '../types';

const defaultProfile: UserProfile = {
  id: '1',
  username: 'admin',
  email: 'admin@zonevast.com',
  firstName: 'Admin',
  lastName: 'User'
};

const defaultPreferences: UserPreferences = {
  theme: 'dark',
  language: 'en',
  notifications: true,
  emailUpdates: false
};

export const useSettings = () => {
  const [profile, setProfile] = useState<UserProfile>(defaultProfile);
  const [preferences, setPreferences] = useState<UserPreferences>(defaultPreferences);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Load settings from localStorage or API
    const storedProfile = localStorage.getItem('user_profile');
    const storedPrefs = localStorage.getItem('user_preferences');

    if (storedProfile) setProfile(JSON.parse(storedProfile));
    if (storedPrefs) setPreferences(JSON.parse(storedPrefs));
  }, []);

  const updateProfile = async (updates: Partial<UserProfile>) => {
    setIsLoading(true);
    try {
      // TODO: Replace with actual API call
      const newProfile = { ...profile, ...updates };
      setProfile(newProfile);
      localStorage.setItem('user_profile', JSON.stringify(newProfile));
    } finally {
      setIsLoading(false);
    }
  };

  const updatePreferences = async (updates: Partial<UserPreferences>) => {
    setIsLoading(true);
    try {
      // TODO: Replace with actual API call
      const newPrefs = { ...preferences, ...updates };
      setPreferences(newPrefs);
      localStorage.setItem('user_preferences', JSON.stringify(newPrefs));
    } finally {
      setIsLoading(false);
    }
  };

  return {
    profile,
    preferences,
    isLoading,
    updateProfile,
    updatePreferences
  };
};
