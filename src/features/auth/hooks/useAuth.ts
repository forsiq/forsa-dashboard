import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [user, setUserState] = useState<{ id: string; username: string; email?: string } | null>(null);

  // Initialize user from cookie or localStorage on mount
  useEffect(() => {
    const savedUser = getUser() || (() => {
      const userStr = localStorage.getItem('user');
      return userStr ? JSON.parse(userStr) : null;
    })();
    if (savedUser) {
      setUserState(savedUser);
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
      localStorage.setItem('access_token', response.access);
      localStorage.setItem('refresh_token', response.refresh);
      localStorage.setItem('user', JSON.stringify(response.user));

      navigate('/dashboard');
      return response;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [navigate]);

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
      localStorage.setItem('access_token', response.access);
      localStorage.setItem('refresh_token', response.refresh);
      localStorage.setItem('user', JSON.stringify(response.user));

      navigate('/dashboard');
      return response;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [navigate]);

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
      localStorage.setItem('access_token', response.access);
      localStorage.setItem('refresh_token', response.refresh);
      localStorage.setItem('user', JSON.stringify(response.user));

      navigate('/dashboard');
      return response;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'OTP verification failed');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [navigate]);

  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      await authApi.logout();

      // Clear cookies (priority)
      clearAuthCookies();

      // Also clear localStorage
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');

      setUserState(null);
      navigate('/login');
    } finally {
      setIsLoading(false);
    }
  }, [navigate]);

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
