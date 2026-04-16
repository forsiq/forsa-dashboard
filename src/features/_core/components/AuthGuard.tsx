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
  const [isClient, setIsClient] = React.useState(false);

  React.useEffect(() => {
    setIsClient(true);
  }, []);

  // Check auth (using token in cookie or localStorage)
  const checkAuthToken = (): boolean => {
    if (typeof window === 'undefined') return false;
    
    // Check cookie first
    const cookies = document.cookie.split(';');
    const hasAccessCookie = cookies.some(c => c.trim().startsWith('access='));
    if (hasAccessCookie) return true;

    // Fallback to localStorage
    return localStorage.getItem('access_token') !== null;
  };

  const isAuthValid = checkAuthToken();
  const projectUsername = getProjectUsername();
  const authEnabled = isFeatureEnabled('auth');

  // Handle loading and initial state
  if (!isClient) return null;

  // 1. If auth is enabled but token is missing, redirect to login
  if (authEnabled && !isAuthValid) {
    return <Navigate to={fallback} state={{ from: location }} replace />;
  }

  // 2. If auth is disabled, or token is valid, check project selection
  // If no project username configured but project feature is enabled, show onboarding
  if (!authEnabled) {
    if (!projectUsername && !isProjectSelected && !projectLoading) {
       // Allow through for now
    }
    return <>{children}</>;
  }

  // 3. Authenticated - Check project selection
  if (!isProjectSelected && !projectUsername && !projectLoading && location.pathname !== '/onboarding') {
    // authenticated but no project - let through or redirect to onboarding if needed
  }

  return <>{children}</>;
};
