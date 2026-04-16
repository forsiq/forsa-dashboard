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
 * 4. If no project configured and auth is enabled → redirect to login
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
    // Only redirect if:
    // 1. Component is mounted (isClient)
    // 2. Auth is globally enabled
    // 3. Current session is invalid
    // 4. We aren't already on a public route (handled by _app.tsx but as a safety)
    if (isClient && isAuthEnabled && !isAuthValid) {
      const publicPaths = ['/login', '/register', '/otp', '/404'];
      if (!publicPaths.includes(router.pathname)) {
        console.warn('[AuthGuard] Unauthorized access to', router.pathname, '- Redirecting to login');
        router.replace({
          pathname: fallback,
          query: { from: router.asPath }
        });
      }
    }
  }, [isClient, isAuthEnabled, isAuthValid, router, fallback]);

  // Handle Hydration: On server and first client render, show a consistent state
  if (!isClient) {
    // If auth is disabled globally, we might want to render children on server for SEO
    // but usually AuthGuard implies client-side logic. 
    // To match server exactly, we return a loading state if we're not sure.
    // However, if we know auth is disabled, we could render children.
    // The safest is to only render children once isClient is true.
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
