import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useFeatureConfig } from '../hooks/useFeatureConfig';
import { useProject } from '@core/contexts';
import { ProjectOnboarding } from '@core/components';

interface AuthGuardProps {
  children: React.ReactNode;
  fallback?: string;
}

/**
 * AuthGuard - Protects routes that require authentication
 * Redirects to login if user is not authenticated
 * Shows project onboarding if no project is selected
 */
export const AuthGuard: React.FC<AuthGuardProps> = ({
  children,
  fallback = '/login'
}) => {
  const location = useLocation();
  const { isFeatureEnabled } = useFeatureConfig();
  const { isAuthenticated: isProjectSelected } = useProject();

  // If auth feature is disabled, bypass auth check
  if (!isFeatureEnabled('auth')) {
    // Still require project selection
    if (!isProjectSelected) {
      return <ProjectOnboarding />;
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
  if (!isProjectSelected) {
    return <ProjectOnboarding />;
  }

  return <>{children}</>;
};
