import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
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
 * 4. If no token → redirect to login (initial access, not session expiry)
 */
export const AuthGuard: React.FC<AuthGuardProps> = ({
  children,
  fallback = '/login'
}) => {
  const router = useRouter();
  const { isFeatureEnabled, getProjectUsername } = useFeatureConfig();
  const { isAuthenticated: isProjectSelected, isLoading: projectLoading } = useProject();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
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

  const isAuthEnabled = isFeatureEnabled('auth');
  const isAuthValid = checkAuthToken();

  useEffect(() => {
    // Only redirect if user has NO token at all (not logged in).
    // Session expiry during active use is handled by API interceptor → SessionExpiredDialog.
    if (isClient && isAuthEnabled && !isAuthValid) {
      const publicPaths = ['/login', '/register', '/otp', '/404'];
      if (!publicPaths.includes(router.pathname)) {
        router.replace({
          pathname: fallback,
          query: { from: router.asPath }
        });
      }
    }
  }, [isClient, isAuthEnabled, isAuthValid, router, fallback]);

  // Handle Hydration: On server and first client render, show a consistent state
  if (!isClient) {
    return null;
  }

  // If auth feature is disabled, bypass auth check
  if (!isAuthEnabled) {
    return <>{children}</>;
  }

  // If auth is required but invalid, show authenticating/loading while redirecting
  if (!isAuthValid) {
    return (
      <div className="flex items-center justify-center min-h-screen text-zinc-muted font-bold font-mono animate-pulse">
        AUTHENTICATING...
      </div>
    );
  }

  return <>{children}</>;
};
