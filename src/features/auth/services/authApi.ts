/**
 * Auth API Layer — Flex Auth Service (zv-flex-auth-service)
 *
 * All auth operations now go through the NestJS flex-auth-service
 * deployed at /auth/api/v2/auth/ (test env).
 */

import {
  LoginCredentials,
  RegisterData,
  OTPData,
  AuthResponse,
  ForgotPasswordData,
  FlexRegisterInitPayload,
  FlexRegisterVerifyPayload,
  FlexOtpResponse,
  FlexAuthResponse,
  FlexAdminListUsersParams,
  FlexAdminUserUpdatePayload,
  FlexAuthUser,
} from '../types';
import { AUTH_ERROR_CODES, AuthApiError } from '../constants/authErrors';
import { FLEX_AUTH_API_BASE } from '@config/api';

// ── URL Builder ──

function buildFlexAuthUrl(path: string): string {
  const normalizedPath = path.startsWith('/') ? path.slice(1) : path;
  const base = FLEX_AUTH_API_BASE.endsWith('/') ? FLEX_AUTH_API_BASE : `${FLEX_AUTH_API_BASE}/`;
  return `${base}${normalizedPath}`;
}

// ── Project ID ──

function getProjectIdValue(): number {
  try {
    if (typeof window === 'undefined') return 11;
    const stored = localStorage.getItem('zv_project');
    if (stored) {
      const project = JSON.parse(stored);
      if (project.id && !String(project.id).startsWith('local-')) {
        return Number(project.id);
      }
    }
  } catch {
    // ignore
  }
  return 11;
}

function getAuthHeaders(token?: string): Record<string, string> {
  const projectId = getProjectIdValue();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'X-Project-ID': String(projectId),
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

function getAccessTokenFromCookie(): string | undefined {
  if (typeof document === 'undefined') return undefined;
  const match = document.cookie.match(/(?:^|;\s*)access=([^;]*)/);
  return match ? decodeURIComponent(match[1]) : undefined;
}

// ── Error Handling ──

function extractBackendError(data: Record<string, unknown>): string {
  if (typeof data.message === 'string' && data.message.trim()) return data.message;
  if (typeof data.detail === 'string' && data.detail.trim()) return data.detail;
  if (typeof data.error === 'string' && data.error.trim()) return data.error;
  if (Array.isArray(data.messages) && data.messages.length > 0) {
    return data.messages.map((m: any) => m.message || String(m)).join('. ');
  }
  return '';
}

async function fetchWithTimeout(
  url: string,
  options: RequestInit = {},
  timeout = 30000,
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === 'AbortError') {
      throw new AuthApiError(AUTH_ERROR_CODES.CONNECTION_TIMEOUT);
    }
    throw error;
  }
}

/**
 * Map flex-auth response shape to the legacy AuthResponse shape
 * so the rest of the app (useAuth hook, cookies) keeps working.
 */
function mapFlexResponseToAuthResponse(flex: FlexAuthResponse): AuthResponse {
  return {
    access: flex.tokens.accessToken,
    refresh: flex.tokens.refreshToken,
    user: {
      id: flex.user.id,
      username: flex.user.username || flex.user.phone,
      email: flex.user.email || '',
    },
  };
}

// ══════════════════════════════════════════════
//  Flex Auth Service — Public Endpoints
// ══════════════════════════════════════════════

/**
 * Send OTP to phone for passwordless login
 */
export const sendOtp = async (phone: string, projectId?: number): Promise<FlexOtpResponse> => {
  const response = await fetchWithTimeout(buildFlexAuthUrl('send-otp'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone, projectId: projectId || getProjectIdValue() }),
  });

  if (!response.ok) {
    const errorData = (await response.json().catch(() => ({}))) as Record<string, unknown>;
    throw new AuthApiError(
      AUTH_ERROR_CODES.AUTH_FAILED,
      extractBackendError(errorData) || undefined,
    );
  }

  return response.json();
};

/**
 * Login with phone + OTP
 */
export const loginWithOtp = async (
  phone: string,
  otp: string,
  projectId?: number,
): Promise<AuthResponse> => {
  const response = await fetchWithTimeout(buildFlexAuthUrl('login-otp'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone, otp, projectId: projectId || getProjectIdValue() }),
  });

  if (!response.ok) {
    const errorData = (await response.json().catch(() => ({}))) as Record<string, unknown>;
    if (response.status === 401) {
      throw new AuthApiError(AUTH_ERROR_CODES.INVALID_CREDENTIALS);
    }
    throw new AuthApiError(
      AUTH_ERROR_CODES.AUTH_FAILED,
      extractBackendError(errorData) || undefined,
    );
  }

  const flexData: FlexAuthResponse = await response.json();
  return mapFlexResponseToAuthResponse(flexData);
};

/**
 * Login with phone + password
 */
export const loginWithPassword = async (
  phone: string,
  password: string,
  projectId?: number,
): Promise<AuthResponse> => {
  const response = await fetchWithTimeout(buildFlexAuthUrl('login'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone, password, projectId: projectId || getProjectIdValue() }),
  });

  if (!response.ok) {
    const errorData = (await response.json().catch(() => ({}))) as Record<string, unknown>;
    if (response.status === 401) {
      throw new AuthApiError(AUTH_ERROR_CODES.INVALID_CREDENTIALS);
    }
    if (response.status === 429) {
      throw new AuthApiError(AUTH_ERROR_CODES.TOO_MANY_ATTEMPTS);
    }
    throw new AuthApiError(
      AUTH_ERROR_CODES.AUTH_FAILED,
      extractBackendError(errorData) || undefined,
    );
  }

  const flexData: FlexAuthResponse = await response.json();
  return mapFlexResponseToAuthResponse(flexData);
};

/**
 * Start registration — sends OTP to verify phone
 */
export const registerInit = async (
  phone: string,
  projectId?: number,
  password?: string,
): Promise<FlexOtpResponse> => {
  const body: FlexRegisterInitPayload = {
    phone,
    projectId: projectId || getProjectIdValue(),
  };
  if (password) body.password = password;

  const response = await fetchWithTimeout(buildFlexAuthUrl('register-init'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorData = (await response.json().catch(() => ({}))) as Record<string, unknown>;
    throw new AuthApiError(
      AUTH_ERROR_CODES.REGISTRATION_FAILED,
      extractBackendError(errorData) || undefined,
    );
  }

  return response.json();
};

/**
 * Complete registration with OTP verification
 */
export const registerVerify = async (
  phone: string,
  otp: string,
  firstName?: string,
  lastName?: string,
): Promise<AuthResponse> => {
  const body: FlexRegisterVerifyPayload = { phone, otp };
  if (firstName) body.firstName = firstName;
  if (lastName) body.lastName = lastName;

  const response = await fetchWithTimeout(buildFlexAuthUrl('register-verify'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorData = (await response.json().catch(() => ({}))) as Record<string, unknown>;
    throw new AuthApiError(
      AUTH_ERROR_CODES.OTP_VERIFICATION_FAILED,
      extractBackendError(errorData) || undefined,
    );
  }

  const flexData: FlexAuthResponse = await response.json();
  return mapFlexResponseToAuthResponse(flexData);
};

/**
 * Refresh access token
 */
export const refreshToken = async (refreshTokenValue: string): Promise<AuthResponse> => {
  const response = await fetchWithTimeout(buildFlexAuthUrl('refresh'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh_token: refreshTokenValue }),
  });

  if (!response.ok) {
    const errorData = (await response.json().catch(() => ({}))) as Record<string, unknown>;
    throw new AuthApiError(
      AUTH_ERROR_CODES.SESSION_EXPIRED,
      extractBackendError(errorData) || undefined,
    );
  }

  const data = await response.json();
  // flex-auth returns { accessToken, refreshToken } directly for refresh
  return {
    access: data.accessToken || data.access,
    refresh: data.refreshToken || data.refresh,
    user: { id: '', username: '', email: '' },
  };
};

/**
 * Get current user profile (authenticated)
 */
export const getProfile = async (): Promise<FlexAuthUser> => {
  const token = getAccessTokenFromCookie();
  const response = await fetchWithTimeout(buildFlexAuthUrl('profile'), {
    method: 'GET',
    headers: getAuthHeaders(token),
  });

  if (!response.ok) {
    throw new AuthApiError(AUTH_ERROR_CODES.SESSION_EXPIRED);
  }

  return response.json();
};

/**
 * Start password reset — sends OTP to phone
 */
export const forgotPasswordInit = async (
  phone: string,
  projectId?: number,
): Promise<FlexOtpResponse> => {
  const response = await fetchWithTimeout(buildFlexAuthUrl('password/reset/init'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone, projectId: projectId || getProjectIdValue() }),
  });

  if (!response.ok) {
    const errorData = (await response.json().catch(() => ({}))) as Record<string, unknown>;
    throw new AuthApiError(
      AUTH_ERROR_CODES.RESET_EMAIL_FAILED,
      extractBackendError(errorData) || undefined,
    );
  }

  return response.json();
};

/**
 * Confirm password reset with OTP + new password
 */
export const forgotPasswordConfirm = async (
  phone: string,
  otp: string,
  newPassword: string,
  projectId?: number,
): Promise<{ message: string }> => {
  const response = await fetchWithTimeout(buildFlexAuthUrl('password/reset/confirm'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      phone,
      otp,
      newPassword,
      projectId: projectId || getProjectIdValue(),
    }),
  });

  if (!response.ok) {
    const errorData = (await response.json().catch(() => ({}))) as Record<string, unknown>;
    throw new AuthApiError(
      AUTH_ERROR_CODES.RESET_EMAIL_FAILED,
      extractBackendError(errorData) || undefined,
    );
  }

  const data = await response.json();
  return { message: data.message || 'Password reset successful.' };
};

// ══════════════════════════════════════════════
//  Flex Auth Service — Admin Endpoints
// ══════════════════════════════════════════════

/**
 * List users (admin)
 */
export const adminListUsers = async (
  params?: FlexAdminListUsersParams,
): Promise<{ users: FlexAuthUser[]; total: number }> => {
  const token = getAccessTokenFromCookie();
  const searchParams = new URLSearchParams();
  if (params?.page) searchParams.set('page', String(params.page));
  if (params?.limit) searchParams.set('limit', String(params.limit));
  if (params?.search) searchParams.set('search', params.search);
  if (params?.role) searchParams.set('role', params.role);
  if (params?.status) searchParams.set('status', params.status);

  const qs = searchParams.toString();
  const url = buildFlexAuthUrl(`admin/users${qs ? `?${qs}` : ''}`);

  const response = await fetchWithTimeout(url, {
    method: 'GET',
    headers: getAuthHeaders(token),
  });

  if (!response.ok) {
    const errorData = (await response.json().catch(() => ({}))) as Record<string, unknown>;
    throw new Error(extractBackendError(errorData) || 'Failed to list users');
  }

  return response.json();
};

/**
 * Get a single user (admin)
 */
export const adminGetUser = async (id: string): Promise<FlexAuthUser> => {
  const token = getAccessTokenFromCookie();
  const response = await fetchWithTimeout(buildFlexAuthUrl(`admin/users/${id}`), {
    method: 'GET',
    headers: getAuthHeaders(token),
  });

  if (!response.ok) {
    const errorData = (await response.json().catch(() => ({}))) as Record<string, unknown>;
    throw new Error(extractBackendError(errorData) || 'Failed to get user');
  }

  return response.json();
};

/**
 * Update a user (admin)
 */
export const adminUpdateUser = async (
  id: string,
  data: FlexAdminUserUpdatePayload,
): Promise<FlexAuthUser> => {
  const token = getAccessTokenFromCookie();
  const response = await fetchWithTimeout(buildFlexAuthUrl(`admin/users/${id}`), {
    method: 'PATCH',
    headers: getAuthHeaders(token),
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = (await response.json().catch(() => ({}))) as Record<string, unknown>;
    throw new Error(extractBackendError(errorData) || 'Failed to update user');
  }

  return response.json();
};

/**
 * Delete a user (admin)
 */
export const adminDeleteUser = async (id: string): Promise<void> => {
  const token = getAccessTokenFromCookie();
  const response = await fetchWithTimeout(buildFlexAuthUrl(`admin/users/${id}`), {
    method: 'DELETE',
    headers: getAuthHeaders(token),
  });

  if (!response.ok) {
    const errorData = (await response.json().catch(() => ({}))) as Record<string, unknown>;
    throw new Error(extractBackendError(errorData) || 'Failed to delete user');
  }
};

// ══════════════════════════════════════════════
//  Legacy wrappers — kept so existing callers
//  (useAuth hook) compile during transition.
// ══════════════════════════════════════════════

/**
 * @deprecated Use loginWithPassword() or loginWithOtp() instead.
 */
export const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
  return loginWithPassword(credentials.username, credentials.password);
};

/**
 * @deprecated Use registerInit() + registerVerify() instead.
 */
export const register = async (data: RegisterData): Promise<AuthResponse> => {
  // For legacy compat: call registerInit then registerVerify in sequence
  await registerInit(data.username, undefined, data.password);
  // Can't auto-verify without OTP — throw so the UI redirects to OTP page
  throw new AuthApiError(
    AUTH_ERROR_CODES.REGISTRATION_FAILED,
    'OTP verification required. Please use the new registration flow.',
  );
};

/**
 * @deprecated Use forgotPasswordInit() + forgotPasswordConfirm() instead.
 */
export const requestPasswordReset = async (
  data: ForgotPasswordData,
): Promise<{ message: string }> => {
  // Legacy used email; new uses phone. The ForgotPasswordForm will be updated separately.
  const result = await forgotPasswordInit(data.email);
  return { message: result.message };
};

/**
 * Logout — clears local state
 */
export const logout = async (): Promise<void> => {
  // No server-side logout in flex-auth — cookies cleared by caller
};

/**
 * @deprecated Use registerVerify() instead.
 */
export const verifyOTP = async (data: OTPData): Promise<AuthResponse> => {
  // This needs phone from context; OTPForm will pass it via session storage
  if (typeof window !== 'undefined') {
    const phone = sessionStorage.getItem('zv_auth_phone') || '';
    const response = await registerVerify(phone, data.code);
    return response;
  }
  throw new AuthApiError(AUTH_ERROR_CODES.OTP_VERIFICATION_FAILED);
};
