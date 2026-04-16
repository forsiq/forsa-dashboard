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

export const useAuth = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [user, setUserState] = useState<{ id: string; username: string; email?: string } | null>(null);

  // Initialize user from cookie or localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedUser = getUser() || (() => {
        const userStr = localStorage.getItem('user');
        return userStr ? JSON.parse(userStr) : null;
      })();
      if (savedUser) {
        setUserState(savedUser);
      }
    }
  }, []);

  const login = useCallback(async (credentials: LoginCredentials) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await authApi.login(credentials);

      // Store in cookies (priority)
      setAccessToken(response.access);
      setRefreshToken(response.refresh);
      setUser(response.user);
      setUserState(response.user);

      // Also store in localStorage as fallback
      if (typeof window !== 'undefined') {
        localStorage.setItem('access_token', response.access);
        localStorage.setItem('refresh_token', response.refresh);
        localStorage.setItem('user', JSON.stringify(response.user));
      }

      router.push('/dashboard');
      return response;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  const register = useCallback(async (data: RegisterData) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await authApi.register(data);

      // Store in cookies (priority)
      setAccessToken(response.access);
      setRefreshToken(response.refresh);
      setUser(response.user);
      setUserState(response.user);

      // Also store in localStorage as fallback
      if (typeof window !== 'undefined') {
        localStorage.setItem('access_token', response.access);
        localStorage.setItem('refresh_token', response.refresh);
        localStorage.setItem('user', JSON.stringify(response.user));
      }

      router.push('/dashboard');
      return response;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  const verifyOTP = useCallback(async (data: OTPData) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await authApi.verifyOTP(data);

      // Store in cookies (priority)
      setAccessToken(response.access);
      setRefreshToken(response.refresh);
      setUser(response.user);
      setUserState(response.user);

      // Also store in localStorage as fallback
      if (typeof window !== 'undefined') {
        localStorage.setItem('access_token', response.access);
        localStorage.setItem('refresh_token', response.refresh);
        localStorage.setItem('user', JSON.stringify(response.user));
      }

      router.push('/dashboard');
      return response;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'OTP verification failed');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      // Clear cookies (priority)
      clearAuthCookies();

      // Also clear localStorage
      if (typeof window !== 'undefined') {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
      }

      setUserState(null);
      router.push('/login');
      
      // Attempt backend logout if possible
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
