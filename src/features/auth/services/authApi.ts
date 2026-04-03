import { LoginCredentials, RegisterData, OTPData, AuthResponse } from '../types';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'https://test.zonevast.com';
const PROJECT_API_BASE = import.meta.env.VITE_API_BASE_URL || 'https://test.zonevast.com';
const PROJECT_STORAGE_KEY = 'zv_project';

/**
 * Get project ID from localStorage
 */
function getProjectId(): string {
  const stored = localStorage.getItem(PROJECT_STORAGE_KEY);
  if (stored) {
    try {
      const project = JSON.parse(stored);
      // Ignore legacy local- IDs and enforce 11 as the standard
      if (project.id && !project.id.startsWith('local-')) {
        return project.id;
      }
    } catch {
      // Ignore
    }
  }
  return '11'; // Base project default
}

/**
 * Fetch with timeout helper
 * Handles slow API responses by setting a maximum wait time
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
      throw new Error(`Request timeout after ${timeout}ms`);
    }
    throw error;
  }
}

/**
 * Login with username and password
 */
export const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
  const response = await fetchWithTimeout(`${API_BASE}/api/v1/auth/auth/token/`, {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'X-Project': getProjectId(),
        'X-Project-ID': getProjectId()
    },
    body: JSON.stringify(credentials)
  }, 30000); // 30 second timeout for slow API

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || errorData.message || 'Login failed');
  }

  const data = await response.json();

  // Fetch user profile after successful login
  const userResponse = await fetchWithTimeout(`${API_BASE}/api/v1/auth/auth/user/`, {
    headers: {
      'Authorization': `Bearer ${data.access}`,
      'X-Project': getProjectId(),
      'X-Project-ID': getProjectId()
    }
  }, 30000);

  let user = { id: 'unknown', username: credentials.username, email: '' };
  if (userResponse.ok) {
    user = await userResponse.json();
  }

  return {
    access: data.access,
    refresh: data.refresh,
    user
  };
};

/**
 * Register a new user
 */
export const register = async (data: RegisterData): Promise<AuthResponse> => {
    // Note: Registration endpoint might vary, using a placeholder for now
    const response = await fetchWithTimeout(`${API_BASE}/api/v1/auth/auth/register/`, {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json',
          'X-Project': getProjectId(),
          'X-Project-ID': getProjectId()
      },
      body: JSON.stringify(data)
    }, 30000);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || errorData.message || 'Registration failed');
    }

    return response.json();
};

/**
 * Verify OTP code
 */
export const verifyOTP = async (data: OTPData): Promise<AuthResponse> => {
  // Placeholder implementation for OTP verification
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        access: 'mock-access-token',
        refresh: 'mock-refresh-token',
        user: {
          id: '1',
          username: 'user',
          email: 'user@example.com'
        }
      });
    }, 500);
  });
};

/**
 * Logout
 */
export const logout = async (): Promise<void> => {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  localStorage.removeItem('user');
};

/**
 * Refresh access token
 */
export const refreshToken = async (refreshToken: string): Promise<AuthResponse> => {
    const response = await fetchWithTimeout(`${API_BASE}/api/v1/auth/auth/token/refresh/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Project': getProjectId(),
        'X-Project-ID': getProjectId()
      },
      body: JSON.stringify({ refresh: refreshToken })
    }, 30000);

    if (!response.ok) throw new Error('Refresh failed');
    return response.json();
};
