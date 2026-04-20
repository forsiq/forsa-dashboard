import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createApiClient } from '@core/services/ApiClientFactory';
import { useErrorHandler } from '@core/hooks';
import type { UserProfile, UserPreferences } from '../types';

const settingsApi = createApiClient<UserProfile, Partial<UserProfile>, Partial<UserProfile>>({
  serviceName: 'settings',
  endpoint: '/auth/profile',
});

const settingsKeys = {
  all: ['settings'] as const,
  profile: () => [...settingsKeys.all, 'profile'] as const,
  preferences: () => [...settingsKeys.all, 'preferences'] as const,
};

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
  const queryClient = useQueryClient();

  const { data: profile, isLoading: profileLoading, error: profileError } = useQuery({
    queryKey: settingsKeys.profile(),
    queryFn: async (): Promise<UserProfile> => {
      try {
        const response = await settingsApi.getById('me');
        return response.data;
      } catch {
        const stored = localStorage.getItem('user_profile');
        return stored ? JSON.parse(stored) : defaultProfile;
      }
    },
    staleTime: 5 * 60 * 1000,
  });

  const { data: preferences, isLoading: prefsLoading, error: prefsError } = useQuery({
    queryKey: settingsKeys.preferences(),
    queryFn: async (): Promise<UserPreferences> => {
      const stored = localStorage.getItem('user_preferences');
      return stored ? JSON.parse(stored) : defaultPreferences;
    },
    staleTime: 5 * 60 * 1000,
  });

  useErrorHandler(profileError, 'Failed to load profile');

  const updateProfileMutation = useMutation({
    mutationFn: async (updates: Partial<UserProfile>) => {
      try {
        const response = await settingsApi.update({ ...updates, id: 'me' });
        return response.data;
      } catch {
        const current = profile || defaultProfile;
        const updated = { ...current, ...updates };
        localStorage.setItem('user_profile', JSON.stringify(updated));
        return updated;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.profile() });
    },
  });

  const updatePreferencesMutation = useMutation({
    mutationFn: async (updates: Partial<UserPreferences>) => {
      const current = preferences || defaultPreferences;
      const updated = { ...current, ...updates };
      localStorage.setItem('user_preferences', JSON.stringify(updated));
      return updated;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.preferences() });
    },
  });

  return {
    profile: profile || defaultProfile,
    preferences: preferences || defaultPreferences,
    isLoading: profileLoading || prefsLoading,
    updateProfile: updateProfileMutation.mutateAsync,
    updatePreferences: updatePreferencesMutation.mutateAsync,
  };
};
