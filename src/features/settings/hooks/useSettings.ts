import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createApiClient } from '@core/services/ApiClientFactory';
import { useErrorHandler } from '@core/hooks';
import type { UserProfile, UserPreferences } from '../types';

const settingsApi = createApiClient<UserProfile, Partial<UserProfile>, Partial<UserProfile>>({
  serviceName: 'settings',
  endpoint: '/auth/profile',
});

const appSettingsApi = createApiClient<any, any, any>({
  serviceName: 'settings',
  endpoint: '/settings',
});

const settingsKeys = {
  all: ['settings'] as const,
  profile: () => [...settingsKeys.all, 'profile'] as const,
  preferences: () => [...settingsKeys.all, 'preferences'] as const,
  app: () => [...settingsKeys.all, 'app'] as const,
  appSection: (section: string) => [...settingsKeys.all, 'app', section] as const,
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

const defaultAppSettings: Record<string, any> = {
  general: {
    siteName: 'Forsa Auction',
    siteDescription: 'Premium auction platform',
    currency: 'IQD',
    timezone: 'Asia/Baghdad',
    language: 'en',
    maintenanceMode: false,
  },
  auctions: {
    defaultDuration: 7,
    minBidIncrement: 10,
    maxBidIncrement: 1000,
    autoExtendOnBid: true,
    extendMinutes: 5,
    requireApproval: false,
  },
  notifications: {
    emailOnBid: true,
    emailOnOutbid: true,
    emailOnWin: true,
    pushOnBid: true,
  },
  payments: {
    currency: 'IQD',
    taxRate: 0,
    commissionRate: 5,
    minWithdrawal: 50,
  },
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

  const { data: appSettings, isLoading: appSettingsLoading } = useQuery({
    queryKey: settingsKeys.app(),
    queryFn: async (): Promise<Record<string, any>> => {
      try {
        const response = await appSettingsApi.list();
        return response.data || defaultAppSettings;
      } catch {
        return defaultAppSettings;
      }
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

  const updateAppSettingsMutation = useMutation({
    mutationFn: async (updates: Record<string, any>) => {
      try {
        const client = appSettingsApi.getInstance();
        const response = await client.patch('/settings/', updates);
        return response.data.data;
      } catch {
        const current = appSettings || defaultAppSettings;
        const updated = { ...current, ...updates };
        return updated;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.app() });
    },
  });

  return {
    profile: profile || defaultProfile,
    preferences: preferences || defaultPreferences,
    appSettings: appSettings || defaultAppSettings,
    isLoading: profileLoading || prefsLoading || appSettingsLoading,
    updateProfile: updateProfileMutation.mutateAsync,
    updatePreferences: updatePreferencesMutation.mutateAsync,
    updateAppSettings: updateAppSettingsMutation.mutateAsync,
  };
};
