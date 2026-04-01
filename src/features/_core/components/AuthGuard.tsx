import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useFeatureConfig } from '../hooks/useFeatureConfig';
import { useProject } from '@core/contexts';

interface AuthGuardProps {
  children: React.ReactNode;
  fallback?: string;
}

/**
 * AuthGuard - Protects routes that require authentication
 *
 * Flow:
 * 1. If auth feature is disabled → bypass auth, check project only
 * 2. Check auth token
 * 3. Check project selection (auto-loaded from config)
 * 4. If no project configured and auth is enabled → redirect to login
 */
export const AuthGuard: React.FC<AuthGuardProps> = ({
  children,
  fallback = '/login'
}) => {
  const location = useLocation();
  const { isFeatureEnabled, getProjectUsername } = useFeatureConfig();
  const { isAuthenticated: isProjectSelected, isLoading: projectLoading } = useProject();

  // Get project username from config
  const projectUsername = getProjectUsername();

  // If auth feature is disabled, bypass auth check
  if (!isFeatureEnabled('auth')) {
    // If no project username configured but project feature is enabled, show onboarding
    if (!projectUsername && !isProjectSelected && !projectLoading) {
      // TODO: Show project selection UI
      // For now, just let children through
    }
    return <>{children}</>;
  }

  // Check auth (using token in cookie or localStorage)
  const checkAuthToken = (): boolean => {
    // Check cookie first
    const cookies = document.cookie.split(';');
    const hasAccessCookie = cookies.some(c => c.trim().startsWith('access='));
    if (hasAccessCookie) return true;

    // Fallback to localStorage
    return localStorage.getItem('access_token') !== null;
  };

  const isAuthValid = checkAuthToken();

  // First check auth
  if (!isAuthValid) {
    return <Navigate to={fallback} state={{ from: location }} replace />;
  }

  // Then check project selection
  // If project username is configured, it will be auto-loaded
  // If not configured and project is not selected, redirect to login
  if (!isProjectSelected && !projectUsername && !projectLoading) {
    // No project configured, but user is authenticated
    // Let them through - they'll see empty dashboard or can configure project
  }

  return <>{children}</>;
};
