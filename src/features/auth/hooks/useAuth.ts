import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/router';
import * as authApi from '../services/authApi';
import { LoginCredentials, OTPData, LoginMethod, FlexAuthUser } from '../types';
import { AUTH_ERROR_CODES, isAuthApiError } from '../constants/authErrors';
import {
  setAccessToken,
  setRefreshToken,
  setUser,
  getUser,
  clearAuthCookies,
  isAuthenticated as checkAuthenticated,
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
  const [otpCooldown, setOtpCooldown] = useState<number | null>(null);

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

  // ── Login with phone + password (flex-auth) ──
  const loginWithPassword = useCallback(
    async (phone: string, password: string) => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await authApi.loginWithPassword(phone, password);
        handleAuthSuccess(response);
        router.push(getRedirectPath());
        return response;
      } catch (err) {
        if (isAuthApiError(err)) {
          setError(err.backendMessage ?? err.code);
        } else {
          setError(AUTH_ERROR_CODES.LOGIN_FAILED);
        }
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [router, handleAuthSuccess, getRedirectPath],
  );

  // ── Send OTP for login ──
  const sendLoginOtp = useCallback(async (phone: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await authApi.sendOtp(phone);
      if (result.cooldownSeconds) {
        setOtpCooldown(result.cooldownSeconds);
      }
      return result;
    } catch (err) {
      if (isAuthApiError(err)) {
        setError(err.backendMessage ?? err.code);
      } else {
        setError(AUTH_ERROR_CODES.AUTH_FAILED);
      }
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ── Login with OTP ──
  const loginWithOtp = useCallback(
    async (phone: string, otp: string) => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await authApi.loginWithOtp(phone, otp);
        handleAuthSuccess(response);
        router.push(getRedirectPath());
        return response;
      } catch (err) {
        if (isAuthApiError(err)) {
          setError(err.backendMessage ?? err.code);
        } else {
          setError(AUTH_ERROR_CODES.LOGIN_FAILED);
        }
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [router, handleAuthSuccess, getRedirectPath],
  );

  // ── Legacy login (maps username → phone for compat) ──
  const login = useCallback(
    async (credentials: LoginCredentials) => {
      return loginWithPassword(credentials.username, credentials.password);
    },
    [loginWithPassword],
  );

  // ── Registration: step 1 — send OTP ──
  const registerInit = useCallback(async (phone: string, password?: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await authApi.registerInit(phone, undefined, password);
      // Store phone for OTP verification step
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('zv_auth_phone', phone);
      }
      return result;
    } catch (err) {
      if (isAuthApiError(err)) {
        setError(err.backendMessage ?? err.code);
      } else {
        setError(AUTH_ERROR_CODES.REGISTRATION_FAILED);
      }
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ── Registration: step 2 — verify OTP ──
  const registerVerify = useCallback(
    async (otp: string, firstName?: string, lastName?: string) => {
      setIsLoading(true);
      setError(null);
      try {
        const phone = typeof window !== 'undefined'
          ? sessionStorage.getItem('zv_auth_phone') || ''
          : '';
        const response = await authApi.registerVerify(phone, otp, firstName, lastName);
        handleAuthSuccess(response);
        if (typeof window !== 'undefined') {
          sessionStorage.removeItem('zv_auth_phone');
        }
        router.push(getRedirectPath());
        return response;
      } catch (err) {
        if (isAuthApiError(err)) {
          setError(err.backendMessage ?? err.code);
        } else {
          setError(AUTH_ERROR_CODES.OTP_VERIFICATION_FAILED);
        }
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [router, handleAuthSuccess, getRedirectPath],
  );

  // ── Legacy register (deprecated — kept for compile compat) ──
  const register = useCallback(
    async (_data: any) => {
      setError(AUTH_ERROR_CODES.REGISTRATION_FAILED);
      throw new Error('Use registerInit() + registerVerify() instead');
    },
    [],
  );

  // ── Legacy verifyOTP (maps to registerVerify) ──
  const verifyOTP = useCallback(
    async (data: OTPData) => {
      return registerVerify(data.code);
    },
    [registerVerify],
  );

  // ── Logout ──
  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      clearAuthCookies();
      setUserState(null);
      router.push('/login');
      try {
        await authApi.logout();
      } catch (e) {
        // ignore
      }
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  // ── Fetch current profile from flex-auth ──
  const fetchProfile = useCallback(async (): Promise<FlexAuthUser | null> => {
    try {
      return await authApi.getProfile();
    } catch {
      return null;
    }
  }, []);

  return {
    // New flex-auth methods
    loginWithPassword,
    loginWithOtp,
    sendLoginOtp,
    registerInit,
    registerVerify,
    fetchProfile,
    otpCooldown,

    // Legacy compat
    login,
    register,
    verifyOTP,
    logout,

    isLoading,
    error,
    isAuthenticated: checkAuthenticated,
    user,
  };
};
