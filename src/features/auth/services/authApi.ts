import { LoginCredentials, RegisterData, OTPData, AuthResponse } from '../types';

/**
 * Get API base URL with priority:
 * 1. Environment variable
 * 2. Hardcoded fallback (https://test.zonevast.com)
 */
const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || '';

/**
 * Build auth API URL safely without duplicating /api/v1.
 * Supports bases like:
 * - https://test.zonevast.com
 * - https://test.zonevast.com/api/v1
 * - https://test.zonevast.com/forsa
 * - /api/v1
 */
function buildAuthUrl(path: string): string {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  let originOnly = '';

  if (API_BASE) {
    try {
      // Use only origin for auth calls; auth is a separate service.
      originOnly = new URL(API_BASE).origin;
    } catch {
      // Relative API_BASE values should still target root.
      originOnly = '';
    }
  }

  // Auth service is at /api/v1/auth/auth/ (double auth in path)
  // Incoming paths are like /auth/token/ → need to become /api/v1/auth/auth/token/
  // Strip leading /auth/ if present to avoid triple nesting
  let authPath = normalizedPath;
  if (authPath.startsWith('/auth/')) {
    authPath = authPath.slice(5); // Remove leading /auth, keep the rest like /token/
  }
  return `${originOnly}/api/v1/auth/auth${authPath}`;
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
  
  const response = await fetchWithTimeout(buildAuthUrl('/auth/token/'), {
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
    const userResponse = await fetchWithTimeout(buildAuthUrl('/auth/user/'), {
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
  const response = await fetchWithTimeout(buildAuthUrl('/auth/register/'), {
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
  const response = await fetchWithTimeout(buildAuthUrl('/auth/token/refresh/'), {
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

