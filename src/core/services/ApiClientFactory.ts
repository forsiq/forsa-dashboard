/**
 * API Client Factory
 * Generates configured axios instances for services
 *
 * Key features:
 * - Automatic token refresh on 401 with mutex (prevents race conditions)
 * - Auth token and project ID injection on every request
 * - Session expired dialog on refresh failure
 */

import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import Cookies from 'js-cookie';
import type { ServiceEndpoints, ApiError, ApiResponse } from './types';
import { getApiOrigin, getResolvedApiBaseUrl, ZV_AUTH_JWT_REFRESH_PATH } from '../lib/apiBaseUrl';
import { emitSessionExpired } from '../lib/session/sessionEvents';
import { getLanguage, getCookieOptions, clearAuthCookies } from '../lib/utils/cookieStorage';

// ============================================================================
// Configuration
// ============================================================================

const API_BASE_URL = getResolvedApiBaseUrl();
const API_ORIGIN = getApiOrigin();

const PROJECT_STORAGE_KEY = 'zv_project';

/**
 * Get auth token from storage (cookie only — shared across subdomains)
 */
function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return Cookies.get('access') || null;
}

/**
 * Get refresh token from storage (cookie only — shared across subdomains)
 */
function getRefreshToken(): string | null {
  if (typeof window === 'undefined') return null;
  return Cookies.get('refresh') || null;
}

/**
 * Get project ID from storage
 */
function getProjectId(): string {
  if (typeof window === 'undefined') return '11';

  try {
    const stored = localStorage.getItem(PROJECT_STORAGE_KEY);
    if (stored) {
      const project = JSON.parse(stored);
      return project.id || '11';
    }
  } catch {
    // Ignore
  }
  return '11';
}

/**
 * Clear all auth data — delegates to shared cookieStorage
 */
function clearAuthSession(): void {
  clearAuthCookies();
  try {
    localStorage.removeItem('zv_project');
  } catch {
    // Ignore
  }
}

// ============================================================================
// Token Refresh Mutex
// ============================================================================

/**
 * Singleton mutex for token refresh — ensures only ONE refresh request
 * happens at a time. Concurrent 401s wait for the same refresh promise.
 */
let refreshPromise: Promise<boolean> | null = null;

function refreshAccessToken(): Promise<boolean> {
  // If a refresh is already in progress, reuse the same promise
  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = (async () => {
    const currentRefreshToken = getRefreshToken();
    if (!currentRefreshToken) {
      return false;
    }

    try {
      const response = await axios.post(
        `${API_ORIGIN}${ZV_AUTH_JWT_REFRESH_PATH}`,
        { refresh: currentRefreshToken },
        { headers: { 'Content-Type': 'application/json' }, timeout: 10000 }
      );

      const newAccess = response.data?.access;
      const newRefresh = response.data?.refresh;

      if (newAccess) {
        const cookieOpts = getCookieOptions();
        Cookies.set('access', newAccess, cookieOpts);
        if (newRefresh) {
          Cookies.set('refresh', newRefresh, cookieOpts);
        }
        console.log('[API] Token refreshed successfully');
        return true;
      }
      return false;
    } catch (err) {
      console.warn('[API] Token refresh failed:', (err as Error)?.message);
      return false;
    } finally {
      // Always clear the mutex so future 401s can attempt a new refresh
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

// ============================================================================
// Proactive Token Refresh
// ============================================================================

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
 * Check if token will expire within the given buffer (seconds).
 */
function isTokenExpiringSoon(token: string, bufferSeconds: number = 120): boolean {
  const payload = decodeJWTPayload(token);
  if (!payload?.exp) return true;
  return Date.now() >= (payload.exp - bufferSeconds) * 1000;
}

/**
 * Start a periodic check that proactively refreshes the token
 * before it expires. Called once at app startup.
 */
let proactiveInterval: ReturnType<typeof setInterval> | null = null;

export function startProactiveTokenRefresh(): void {
  if (typeof window === 'undefined') return;
  if (proactiveInterval) return; // Already started

  // Check every 60 seconds
  proactiveInterval = setInterval(() => {
    const accessToken = getAuthToken();
    if (!accessToken) return; // Not logged in, skip

    if (isTokenExpiringSoon(accessToken, 120)) {
      console.log('[API] Token expiring soon, proactive refresh...');
      refreshAccessToken().then((success) => {
        if (!success) {
          console.warn('[API] Proactive refresh failed, will retry on next 401');
        }
      });
    }
  }, 60 * 1000);
}

export function stopProactiveTokenRefresh(): void {
  if (proactiveInterval) {
    clearInterval(proactiveInterval);
    proactiveInterval = null;
  }
}

// ============================================================================
// Base Axios Instance
// ============================================================================

/**
 * Create base axios instance with common configuration
 */
function createBaseInstance(baseURL: string): AxiosInstance {
  const instance = axios.create({
    baseURL,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Request interceptor - add auth token and project ID
  instance.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      const token = getAuthToken();
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      // Add project ID header
      if (config.headers) {
        config.headers['X-Project-ID'] = getProjectId();
        config.headers['Accept-Language'] = getLanguage() || 'en';
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  // Response interceptor - handle 401 with mutex-based refresh
  instance.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const apiError: ApiError = {
        message: (error.response?.data as any)?.message || error.message || 'An error occurred',
        code: (error.response?.data as any)?.code,
        status: error.response?.status,
        details: (error.response?.data as any)?.details,
      };

      // Handle 401 - unauthorized
      if (error.response?.status === 401 && typeof window !== 'undefined') {
        const requestUrl = error.config?.url || '';
        const isLoginPath = window.location.pathname.includes('/login');
        const isRegisterPath = window.location.pathname.includes('/register');
        const isRefreshEndpoint = requestUrl.includes('token/refresh');
        const isAuthTokenEndpoint =
          (requestUrl.includes('/auth/auth/token/') || requestUrl.includes('/auth/token/')) &&
          !isRefreshEndpoint;

        // Skip 401 handling for auth pages and token endpoints
        if (isLoginPath || isRegisterPath || isAuthTokenEndpoint || isRefreshEndpoint) {
          return Promise.reject(apiError);
        }

        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

        // Already retried after a refresh — don't loop
        if (originalRequest._retry) {
          console.warn('[API] 401 on retried request, rejecting:', requestUrl);
          return Promise.reject(apiError);
        }

        // Try refresh with mutex (only one refresh at a time)
        const refreshed = await refreshAccessToken();

        if (refreshed) {
          // Retry original request with new token
          originalRequest._retry = true;
          const newToken = getAuthToken();
          if (newToken && originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
          }
          return instance(originalRequest);
        }

        // Refresh failed — session is truly expired
        console.warn('[API] Session expired, clearing auth');
        clearAuthSession();
        emitSessionExpired();
        return Promise.reject(apiError);
      }

      return Promise.reject(apiError);
    }
  );

  return instance;
}

// ============================================================================
// Endpoints Builder
// ============================================================================

/**
 * Build full endpoints object from base endpoint
 */
function buildEndpoints(baseEndpoint: string, custom?: Partial<ServiceEndpoints>): ServiceEndpoints {
  const base = baseEndpoint.startsWith('/') ? baseEndpoint : `/${baseEndpoint}`;

  return {
    base,
    list: custom?.list ?? `${base}/`,
    detail: custom?.detail ?? `${base}/:id`,
    create: custom?.create ?? `${base}/`,
    update: custom?.update ?? `${base}/:id`,
    delete: custom?.delete ?? `${base}/:id`,
    stats: custom?.stats ?? `${base}/stats`,
    ...custom,
  };
}

/**
 * Replace :id placeholder in endpoint
 */
function buildEndpointUrl(endpoint: string, id?: string): string {
  if (id) {
    return endpoint.replace(':id', id);
  }
  return endpoint;
}

// ============================================================================
// API Client Factory
// ============================================================================

export interface ApiClientFactoryConfig {
  serviceName: string;
  endpoint: string;
  endpoints?: Partial<ServiceEndpoints>;
  apiBaseUrl?: string;
}

/**
 * Creates a configured API client for a service
 */
export function createApiClient<TEntity, TCreateInput, TUpdateInput, TFilters = unknown>(
  config: ApiClientFactoryConfig
) {
  const { serviceName, endpoint, endpoints: customEndpoints, apiBaseUrl } = config;
  const fullBaseUrl = apiBaseUrl || API_BASE_URL;
  const endpoints = buildEndpoints(endpoint, customEndpoints);
  const client = createBaseInstance(fullBaseUrl);

  return {
    async list(filters?: TFilters): Promise<ApiResponse<TEntity[]>> {
      const params = new URLSearchParams();

      if (filters) {
        Object.entries(filters as Record<string, unknown>).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            params.append(key, String(value));
          }
        });
      }

      const queryString = params.toString();
      const url = queryString ? `${endpoints.list}?${queryString}` : endpoints.list;

      const response = await client.get<ApiResponse<TEntity[]>>(url);
      return response.data;
    },

    async getById(id: string): Promise<ApiResponse<TEntity>> {
      const url = buildEndpointUrl(endpoints.detail || '', id);
      const response = await client.get<ApiResponse<TEntity>>(url);
      return response.data;
    },

    async getStats(): Promise<ApiResponse<Record<string, number>>> {
      const response = await client.get<ApiResponse<Record<string, number>>>(endpoints.stats || '/stats');
      return response.data;
    },

    async create(input: TCreateInput): Promise<ApiResponse<TEntity>> {
      const response = await client.post<ApiResponse<TEntity>>(endpoints.create || '', input);
      return response.data;
    },

    async update(input: TUpdateInput & { id: string }): Promise<ApiResponse<TEntity>> {
      const { id, ...data } = input;
      const url = buildEndpointUrl(endpoints.update || '', id);
      const response = await client.patch<ApiResponse<TEntity>>(url, data);
      return response.data;
    },

    async delete(id: string): Promise<void> {
      const url = buildEndpointUrl(endpoints.delete || '', id);
      await client.delete(url);
    },

    async bulkDelete(ids: string[]): Promise<void> {
      if (ids.length === 0) return;

      try {
        await client.delete(endpoints.base + '/', { data: { ids } });
      } catch {
        const batchSize = 5;
        for (let i = 0; i < ids.length; i += batchSize) {
          const batch = ids.slice(i, i + batchSize);
          await Promise.all(batch.map(id => this.delete(id)));
        }
      }
    },

    getInstance: () => client,
    getEndpoints: () => endpoints,
  };
}

/**
 * Creates a raw, configured axios instance
 */
export function createClient(baseURL?: string): AxiosInstance {
  return createBaseInstance(baseURL || API_BASE_URL);
}

export { createUploadClient, uploadFile };

export const ApiClientFactory = {
  createClient,
  createApiClient,
  createUploadClient,
  uploadFile,
};

// ============================================================================
// Utility Functions
// ============================================================================

function createUploadClient(serviceName: string, endpoint: string): AxiosInstance {
  const fullUrl = `${API_BASE_URL}${endpoint}`;
  const client = createBaseInstance(fullUrl);

  client.interceptors.request.use((config) => {
    const token = getAuthToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    if (config.headers) {
      delete config.headers['Content-Type'];
    }
    return config;
  });

  return client;
}

async function uploadFile(
  serviceName: string,
  endpoint: string,
  file: File,
  fieldName: string = 'file'
): Promise<{ url: string }> {
  const client = createUploadClient(serviceName, endpoint);

  const formData = new FormData();
  formData.append(fieldName, file);

  const response = await client.post<{ url: string }>('', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data;
}
