import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useFeatureConfig } from '../hooks/useFeatureConfig';

interface AuthGuardProps {
  children: React.ReactNode;
  fallback?: string;
}

/**
 * AuthGuard - Protects routes that require authentication
 * Redirects to login if user is not authenticated
 */
export const AuthGuard: React.FC<AuthGuardProps> = ({
  children,
  fallback = '/login'
}) => {
  const location = useLocation();
  const { isFeatureEnabled } = useFeatureConfig();

  // If auth feature is disabled, bypass auth check
  if (!isFeatureEnabled('auth')) {
    return <>{children}</>;
  }

  // TODO: Implement actual auth check
  // For now, we'll use a simple localStorage check
  const isAuthenticated = localStorage.getItem('access_token') !== null;

  if (!isAuthenticated) {
    return <Navigate to={fallback} state={{ from: location }} replace />;
  }

  return <>{children}</>;
};
