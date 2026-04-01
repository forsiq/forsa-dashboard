import { LoginCredentials, RegisterData, OTPData, AuthResponse } from '../types';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
const PROJECT_STORAGE_KEY = 'zv_project';

/**
 * Get project ID from localStorage
 */
function getProjectId(): string {
  const stored = localStorage.getItem(PROJECT_STORAGE_KEY);
  if (stored) {
    try {
      const project = JSON.parse(stored);
      return project.id || '11';
    } catch {
      // Ignore
    }
  }
  return '11'; // Default fallback
}

/**
 * Login with username and password
 */
export const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
  const response = await fetch(`${API_BASE}/api/v1/auth/auth/token/`, {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'X-Project-ID': getProjectId()
    },
    body: JSON.stringify(credentials)
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || errorData.message || 'Login failed');
  }

  const data = await response.json();

  // Fetch user profile after successful login
  const userResponse = await fetch(`${API_BASE}/api/v1/auth/auth/user/`, {
    headers: {
      'Authorization': `Bearer ${data.access}`,
      'X-Project-ID': getProjectId()
    }
  });

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
    const response = await fetch(`${API_BASE}/api/v1/auth/auth/register/`, {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json',
          'X-Project-ID': getProjectId()
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
    const response = await fetch(`${API_BASE}/api/v1/auth/auth/token/refresh/`, {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json',
          'X-Project-ID': getProjectId()
      },
      body: JSON.stringify({ refresh: refreshToken })
    });

    if (!response.ok) throw new Error('Refresh failed');
    return response.json();
};
