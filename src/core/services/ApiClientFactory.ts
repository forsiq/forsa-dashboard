/**
 * API Client Factory
 * Generates configured axios instances for services
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
  return '11'; // Default fallback
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
      } else if (!token) {
        console.warn('[API] No auth token found for request:', config.method?.toUpperCase(), config.url);
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

  // Response interceptor - standardize error handling
  instance.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
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

        console.warn('[API] 401 on:', requestUrl);

        // Skip 401 handling entirely for auth pages and token endpoints
        if (isLoginPath || isRegisterPath || isAuthTokenEndpoint || isRefreshEndpoint) {
          return Promise.reject(apiError);
        }

        const currentRefreshToken = getRefreshToken();
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

        // 401 on a request that already ran after a successful refresh: do not clear cookies or
        // show SessionExpired — the access token was just renewed; failure is likely JWT/API
        // mismatch, wrong audience, or backend 401, not "refresh token expired".
        if (originalRequest._retry) {
          console.warn(
            '[API] 401 on retried request (after refresh); rejecting without session dialog:',
            requestUrl
          );
          return Promise.reject(apiError);
        }

        // First 401: try refresh once, then retry with _retry set
        if (currentRefreshToken) {
          originalRequest._retry = true;
          console.log('[API] Attempting token refresh...');

          return axios
            .post(
              `${API_ORIGIN}${ZV_AUTH_JWT_REFRESH_PATH}`,
              { refresh: currentRefreshToken },
              { headers: { 'Content-Type': 'application/json' } }
            )
            .then((refreshResponse) => {
              const newAccess = refreshResponse.data?.access;
              const newRefresh = refreshResponse.data?.refresh;
              if (newAccess) {
                const cookieOpts = getCookieOptions();
                Cookies.set('access', newAccess, cookieOpts);
                if (newRefresh) {
                  Cookies.set('refresh', newRefresh, cookieOpts);
                }
                if (originalRequest.headers) {
                  originalRequest.headers.Authorization = `Bearer ${newAccess}`;
                }
                return instance(originalRequest);
              }
              return Promise.reject(apiError);
            })
            .catch((refreshErr) => {
              // Only here: refresh endpoint failed — session is truly invalid
              console.warn('[API] Token refresh failed for:', requestUrl, refreshErr);
              clearAuthSession();
              emitSessionExpired();
              return Promise.reject(apiError);
            });
        }

        // No refresh token: treat as logged-out or expired if we still had a stale access cookie
        const hadAccessToken = !!getAuthToken();
        console.warn('[API] 401 with no refresh token for:', requestUrl, '| had access token:', hadAccessToken);
        if (hadAccessToken) {
          clearAuthSession();
          emitSessionExpired();
        }
      } else if (error.response?.status && error.response.status !== 401) {
        console.error(`[API] ${error.response.status} Error:`, error.config?.url, apiError);
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
 *
 * @example
 * const categoryApi = createApiClient({
 *   serviceName: 'categories',
 *   endpoint: '/api/v1/categories',
 * });
 *
 * // Usage:
 * const categories = await categoryApi.list({ page: 1, limit: 20 });
 * const category = await categoryApi.getById('123');
 * const created = await categoryApi.create({ name: 'New Category' });
 */
export function createApiClient<TEntity, TCreateInput, TUpdateInput, TFilters = unknown>(
  config: ApiClientFactoryConfig
) {
  const { serviceName, endpoint, endpoints: customEndpoints, apiBaseUrl } = config;
  const fullBaseUrl = apiBaseUrl || API_BASE_URL;
  const endpoints = buildEndpoints(endpoint, customEndpoints);
  // Don't append endpoints.base to baseURL - it's already the full API base URL
  const client = createBaseInstance(fullBaseUrl);

  return {
    /**
     * List all entities with optional filters
     */
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

    /**
     * Get a single entity by ID
     */
    async getById(id: string): Promise<ApiResponse<TEntity>> {
      const url = buildEndpointUrl(endpoints.detail || '', id);
      const response = await client.get<ApiResponse<TEntity>>(url);
      return response.data;
    },

    /**
     * Get statistics for the entity
     */
    async getStats(): Promise<ApiResponse<Record<string, number>>> {
      const response = await client.get<ApiResponse<Record<string, number>>>(endpoints.stats || '/stats');
      return response.data;
    },

    /**
     * Create a new entity
     */
    async create(input: TCreateInput): Promise<ApiResponse<TEntity>> {
      const response = await client.post<ApiResponse<TEntity>>(endpoints.create || '', input);
      return response.data;
    },

    /**
     * Update an existing entity
     */
    async update(input: TUpdateInput & { id: string }): Promise<ApiResponse<TEntity>> {
      const { id, ...data } = input;
      const url = buildEndpointUrl(endpoints.update || '', id);
      const response = await client.patch<ApiResponse<TEntity>>(url, data);
      return response.data;
    },

    /**
     * Delete an entity
     */
    async delete(id: string): Promise<void> {
      const url = buildEndpointUrl(endpoints.delete || '', id);
      await client.delete(url);
    },

    /**
     * Bulk delete entities
     * Sends a single DELETE request with all IDs for efficiency.
     * Falls back to individual deletes if the batch endpoint is not available.
     */
    async bulkDelete(ids: string[]): Promise<void> {
      if (ids.length === 0) return;

      try {
        await client.delete(endpoints.base + '/', { data: { ids } });
      } catch {
        // Fallback: delete individually with concurrency limit of 5
        const batchSize = 5;
        for (let i = 0; i < ids.length; i += batchSize) {
          const batch = ids.slice(i, i + batchSize);
          await Promise.all(batch.map(id => this.delete(id)));
        }
      }
    },

    /**
     * Get the underlying axios instance for custom requests
     */
    getInstance: () => client,

    /**
     * Get endpoints configuration
     */
    getEndpoints: () => endpoints,
  };
}

/**
 * Creates a raw, configured axios instance
 */
export function createClient(baseURL?: string): AxiosInstance {
  return createBaseInstance(baseURL || API_BASE_URL);
}

// For compatibility with legacy code or patterns that expect a namespace
export const ApiClientFactory = {
  createClient,
  createApiClient,
  createUploadClient,
  uploadFile,
};

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Create a multipart/form-data client for file uploads
 */
export function createUploadClient(serviceName: string, endpoint: string): AxiosInstance {
  const fullUrl = `${API_BASE_URL}${endpoint}`;
  const client = createBaseInstance(fullUrl);

  // Override content type for multipart
  client.interceptors.request.use((config) => {
    const token = getAuthToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // Remove Content-Type to let browser set it with boundary
    if (config.headers) {
      delete config.headers['Content-Type'];
    }
    return config;
  });

  return client;
}

/**
 * Upload a file using FormData
 */
export async function uploadFile(
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
