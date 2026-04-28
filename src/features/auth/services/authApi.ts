import { getResolvedApiBaseUrl } from '@core/lib/apiBaseUrl';
import { LoginCredentials, RegisterData, OTPData, AuthResponse, ForgotPasswordData } from '../types';

/**
 * Auth API base URL - dedicated env var for auth service,
 * with hardcoded fallback to zv-auth-service on test.
 */
const AUTH_API_BASE = process.env.NEXT_PUBLIC_AUTH_API_URL || 'https://test.zonevast.com/api/v1/auth/auth/';

/**
 * Build the full auth API URL by appending a path to the base.
 */
function buildAuthUrl(path: string): string {
  const normalizedPath = path.startsWith('/') ? path.slice(1) : path;
  const base = AUTH_API_BASE.endsWith('/') ? AUTH_API_BASE : `${AUTH_API_BASE}/`;
  return `${base}${normalizedPath}`;
}

/**
 * Get project ID from localStorage with priority over static fallback
 */
function getProjectIdValue(): string {
  try {
    const stored = localStorage.getItem('zv_project');
    if (stored) {
      const project = JSON.parse(stored);
      // Enforce project ID 11 as the current standard, but respect stored ID if it's valid
      if (project.id && !project.id.startsWith('local-')) {
        return String(project.id);
      }
    }
  } catch (err) {
    console.warn('[authApi] Error reading project from localStorage:', err);
  }
  return '11'; // Default project ID per ZoneVast standards
}

/**
 * Helper to get all required project headers
 */
function getProjectHeaders(): Record<string, string> {
  const projectId = getProjectIdValue();
  return {
    'X-Project': projectId,
    'X-Project-ID': projectId
  };
}

/**
 * Fetch with timeout helper with better error reporting
 */
async function fetchWithTimeout(
  url: string,
  options: RequestInit = {},
  timeout = 30000
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error(`Connection timeout after ${timeout/1000}s. Please check your connectivity.`);
    }
    throw error;
  }
}

/**
 * Login with credentials
 */
export const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
  console.log('[authApi] Attempting login for:', credentials.username);
  
  const response = await fetchWithTimeout(buildAuthUrl('token/'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getProjectHeaders()
    },
    body: JSON.stringify({
      username: credentials.username,
      password: credentials.password
    })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    console.error('[authApi] Login failed:', response.status, errorData);
    
    if (response.status === 401) {
      throw new Error('Invalid username or password. Please verify your credentials.');
    }
    
    throw new Error(errorData.detail || errorData.message || 'Authentication failed. Please try again.');
  }

  const data = await response.json();
  console.log('[authApi] Login successful, fetching profile...');

  // Fetch user profile immediately after login
  try {
    const userResponse = await fetchWithTimeout(buildAuthUrl('user/'), {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${data.access}`,
        ...getProjectHeaders()
      }
    });

    if (userResponse.ok) {
      const userData = await userResponse.json();
      return {
        access: data.access,
        refresh: data.refresh,
        user: {
          id: userData.id || 'unknown',
          username: userData.username || credentials.username,
          email: userData.email || ''
        }
      };
    }
  } catch (profileErr) {
    console.warn('[authApi] Profile fetch failed, using fallback:', profileErr);
  }

  // Fallback if profile fetch fails
  return {
    access: data.access,
    refresh: data.refresh,
    user: {
      id: 'session-id',
      username: credentials.username,
      email: ''
    }
  };
};

/**
 * Register a new user
 */
export const register = async (data: RegisterData): Promise<AuthResponse> => {
  const response = await fetchWithTimeout(buildAuthUrl('register/'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getProjectHeaders()
    },
    body: JSON.stringify(data)
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || errorData.message || 'Registration failed');
  }

  return response.json();
};

/**
 * Logout - clears local state and potentially calls backend
 */
export const logout = async (): Promise<void> => {
  // Can be expanded to call sign-out endpoint if necessary
  console.log('[authApi] Logging out user...');
};

/**
 * Refresh access token
 */
export const refreshToken = async (refresh: string): Promise<{ access: string }> => {
  const response = await fetchWithTimeout(buildAuthUrl('token/refresh/'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getProjectHeaders()
    },
    body: JSON.stringify({ refresh })
  });

  if (!response.ok) {
    throw new Error('Session expired. Please login again.');
  }

  return response.json();
};

/**
 * Verify OTP
 */
export const verifyOTP = async (data: OTPData): Promise<AuthResponse> => {
  // Mock implementation for development; replace with actual API when ready
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        access: 'mock-token',
        refresh: 'mock-refresh',
        user: { id: '1', username: 'dev-user', email: 'dev@zonevast.com' }
      });
    }, 1000);
  });
};

/**
 * Request password reset - sends reset link to email
 */
export const requestPasswordReset = async (data: ForgotPasswordData): Promise<{ message: string }> => {
  const response = await fetchWithTimeout(buildAuthUrl('password/reset/'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getProjectHeaders()
    },
    body: JSON.stringify({ email: data.email })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || errorData.message || 'Failed to send reset email. Please try again.');
  }

  const result = await response.json();
  return { message: result.detail || result.message || 'Reset link sent to your email.' };
};

