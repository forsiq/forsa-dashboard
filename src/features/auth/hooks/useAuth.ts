import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/router';
import * as authApi from '../services/authApi';
import { LoginCredentials, RegisterData, OTPData } from '../types';
import {
  setAccessToken,
  setRefreshToken,
  setUser,
  getUser,
  clearAuthCookies,
  isAuthenticated as checkAuthenticated
} from '@core/lib';

interface AuthResponse {
  access: string;
  refresh: string;
  user: { id: string; username: string; email?: string };
}

export const useAuth = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [user, setUserState] = useState<{ id: string; username: string; email?: string } | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedUser = getUser();
      if (savedUser) {
        setUserState(savedUser);
      }
    }
  }, []);

  const getRedirectPath = useCallback((): string => {
    const from = router.query.from as string;
    if (from && from !== '/login' && from !== '/register') {
      return from;
    }
    return '/dashboard';
  }, [router.query.from]);

  const handleAuthSuccess = useCallback((response: AuthResponse) => {
    setAccessToken(response.access);
    setRefreshToken(response.refresh);
    setUser(response.user);
    setUserState(response.user);
  }, []);

  const login = useCallback(async (credentials: LoginCredentials) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await authApi.login(credentials);
      handleAuthSuccess(response);
      router.push(getRedirectPath());
      return response;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [router, handleAuthSuccess, getRedirectPath]);

  const register = useCallback(async (data: RegisterData) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await authApi.register(data);
      handleAuthSuccess(response);
      router.push(getRedirectPath());
      return response;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [router, handleAuthSuccess, getRedirectPath]);

  const verifyOTP = useCallback(async (data: OTPData) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await authApi.verifyOTP(data);
      handleAuthSuccess(response);
      router.push(getRedirectPath());
      return response;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'OTP verification failed');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [router, handleAuthSuccess, getRedirectPath]);

  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      clearAuthCookies();

      setUserState(null);
      router.push('/login');

      try {
        await authApi.logout();
      } catch (e) {
        console.error('Backend logout failed:', e);
      }
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  return {
    login,
    register,
    verifyOTP,
    logout,
    isLoading,
    error,
    isAuthenticated: checkAuthenticated,
    user
  };
};
