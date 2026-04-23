import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/router';
import { useFeatureConfig } from '../hooks/useFeatureConfig';
import { useProject } from '@core/contexts';
import { getCookieOptions } from '@core/lib/utils/cookieStorage';
import axios from 'axios';
import Cookies from 'js-cookie';

interface AuthGuardProps {
  children: React.ReactNode;
  fallback?: string;
}

type AuthState = 'checking' | 'valid' | 'expired' | 'none';

/**
 * Decode JWT payload without external library
 */
function decodeJWTPayload(token: string): { exp?: number; [key: string]: unknown } | null {
  try {
    const base64Url = token.split('.')[1];
    if (!base64Url) return null;
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

/**
 * Check if a JWT token is expired (with 30s buffer)
 */
function isTokenExpired(token: string): boolean {
  const payload = decodeJWTPayload(token);
  if (!payload?.exp) return true;
  // 30 second buffer to account for clock skew
  return Date.now() >= (payload.exp - 30) * 1000;
}

/**
 * Get stored tokens (cookie only — shared across subdomains)
 */
function getAccessToken(): string | null {
  if (typeof window === 'undefined') return null;
  return Cookies.get('access') || null;
}

function getRefreshToken(): string | null {
  if (typeof window === 'undefined') return null;
  return Cookies.get('refresh') || null;
}

function getApiOrigin(): string {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://test.zonevast.com/forsa/api/v1';
  try { return new URL(baseUrl).origin; } catch { return 'https://test.zonevast.com'; }
}

/**
 * AuthGuard - Protects routes that require authentication
 *
 * Flow:
 * 1. If auth feature is disabled → bypass auth, check project only
 * 2. Check auth token existence AND validity (not expired)
 * 3. If token expired → attempt silent refresh
 * 4. If refresh succeeds → allow access
 * 5. If no token or refresh fails → redirect to login
 */
export const AuthGuard: React.FC<AuthGuardProps> = ({
  children,
  fallback = '/login'
}) => {
  const router = useRouter();
  const { isFeatureEnabled } = useFeatureConfig();
  const { isAuthenticated: isProjectSelected, isLoading: projectLoading } = useProject();
  const [authState, setAuthState] = useState<AuthState>('checking');
  const [isMounted, setIsMounted] = useState(false);

  const isAuthEnabled = isFeatureEnabled('auth');

  // Ensure client-side only rendering to prevent hydration mismatch
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const attemptRefresh = useCallback(async (refreshToken: string): Promise<boolean> => {
    try {
      const origin = getApiOrigin();
      const response = await axios.post(`${origin}/api/v1/auth/token/refresh/`, {
        refresh: refreshToken,
      }, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 8000,
      });

      const newAccess = response.data?.access;
      const newRefresh = response.data?.refresh;

      if (newAccess) {
        const cookieOpts = getCookieOptions();
        Cookies.set('access', newAccess, cookieOpts);
        if (newRefresh) {
          Cookies.set('refresh', newRefresh, cookieOpts);
        }
        console.log('[AuthGuard] Token refreshed successfully');
        return true;
      }
      return false;
    } catch (err) {
      console.warn('[AuthGuard] Token refresh failed:', (err as Error)?.message);
      return false;
    }
  }, []);

  useEffect(() => {
    if (!isAuthEnabled) {
      setAuthState('valid');
      return;
    }

    const validateAuth = async () => {
      const accessToken = getAccessToken();

      // No token at all → redirect to login
      if (!accessToken) {
        setAuthState('none');
        const publicPaths = ['/login', '/register', '/otp', '/404'];
        if (!publicPaths.includes(router.pathname)) {
          router.replace({
            pathname: fallback,
            query: { from: router.asPath }
          });
        }
        return;
      }

      // Token exists but not expired → valid
      if (!isTokenExpired(accessToken)) {
        setAuthState('valid');
        return;
      }

      // Token is expired → try refresh
      console.log('[AuthGuard] Access token expired, attempting refresh...');
      const refreshToken = getRefreshToken();

      if (!refreshToken) {
        console.warn('[AuthGuard] No refresh token available');
        setAuthState('expired');
        return;
      }

      if (isTokenExpired(refreshToken)) {
        console.warn('[AuthGuard] Refresh token also expired');
        setAuthState('expired');
        return;
      }

      const refreshed = await attemptRefresh(refreshToken);
      if (refreshed) {
        setAuthState('valid');
      } else {
        setAuthState('expired');
      }
    };

    validateAuth();
  }, [isAuthEnabled, router, fallback, attemptRefresh]);

  // Not client-side yet - return null to avoid hydration mismatch
  if (!isMounted) {
    return null;
  }

  // Auth feature disabled
  if (!isAuthEnabled) {
    return <>{children}</>;
  }

  // Still checking
  if (authState === 'checking') {
    return (
      <div className="flex items-center justify-center min-h-screen text-zinc-muted font-bold font-mono animate-pulse">
        AUTHENTICATING...
      </div>
    );
  }

  // No token → redirect already triggered above, show loading
  if (authState === 'none') {
    return (
      <div className="flex items-center justify-center min-h-screen text-zinc-muted font-bold font-mono animate-pulse">
        AUTHENTICATING...
      </div>
    );
  }

  // Token expired and refresh failed → redirect to login with expired flag
  if (authState === 'expired') {
    // Use replace to avoid back-button loop, only redirect once
    const publicPaths = ['/login', '/register', '/otp', '/404'];
    if (!publicPaths.includes(router.pathname)) {
      router.replace({
        pathname: fallback,
        query: { expired: 'true', from: router.asPath }
      });
    }
    return (
      <div className="flex items-center justify-center min-h-screen text-zinc-muted font-bold font-mono animate-pulse">
        SESSION EXPIRED...
      </div>
    );
  }

  // Valid token → render children
  return <>{children}</>;
};
