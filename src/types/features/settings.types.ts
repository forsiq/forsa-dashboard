/**
 * Settings Feature Types
 * Developer workspace - modify as needed
 */

import type { ApiResponse } from '../common';

/**
 * Settings sections
 */
export type SettingsSection = 'general' | 'profile' | 'security' | 'notifications' | 'language' | 'preferences';

/**
 * User preferences
 */
export interface UserPreferences {
  theme: 'light' | 'dark' | 'auto';
  language: 'en' | 'ar' | 'ku';
  timezone: string;
  dateFormat: string;
  currency: string;
}

/**
 * User profile
 */
export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  bio?: string;
  timezone?: string;
  preferences: UserPreferences;
  createdAt: string;
  updatedAt: string;
}

/**
 * Update profile request
 */
export interface UpdateProfileRequest {
  name?: string;
  phone?: string;
  bio?: string;
  avatar?: string;
}

/**
 * Update preferences request
 */
export interface UpdatePreferencesRequest {
  theme?: 'light' | 'dark' | 'auto';
  language?: 'en' | 'ar' | 'ku';
  timezone?: string;
  dateFormat?: string;
  currency?: string;
}

/**
 * Change password request
 */
export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

/**
 * Notification settings
 */
export interface NotificationSettings {
  email: boolean;
  push: boolean;
  sms: boolean;
  marketing: boolean;
  orders: boolean;
  updates: boolean;
}

/**
 * API response types for settings
 */
export type UserProfileResponse = ApiResponse<{ user: UserProfile }>;
export type UpdateProfileResponse = ApiResponse<{ message: string; user: UserProfile }>;
export type UpdatePreferencesResponse = ApiResponse<{ message: string; preferences: UserPreferences }>;
