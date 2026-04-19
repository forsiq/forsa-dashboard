/**
 * API Client Factory
 * Generates configured axios instances for services
 */

import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import type { ServiceEndpoints, ApiError, ApiResponse } from './types';

// ============================================================================
// Configuration
// ============================================================================

const API_BASE_URL = 
  process.env.NEXT_PUBLIC_API_BASE_URL || 
  'https://test.zonevast.com/forsa/api/v1';

const PROJECT_STORAGE_KEY = 'zv_project';

/**
 * Get auth token from storage
 */
function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;

  // Check cookie first (preferred)
  try {
    const cookies = document.cookie.split(';');
    const accessCookie = cookies.find(c => c.trim().startsWith('access='));
    if (accessCookie) {
      return accessCookie.split('=')[1]?.trim() || null;
    }
  } catch (e) {
    // Ignore document errors
  }

  // Fallback to localStorage
  try {
    return localStorage.getItem('access_token');
  } catch (e) {
    return null;
  }
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
          const isLoginPath = window.location.pathname.includes('/login');
          const isRegisterPath = window.location.pathname.includes('/register');
          const isAuthTokenEndpoint = error.config?.url?.includes('/auth/token/');
          const isRefreshEndpoint = error.config?.url?.includes('/auth/token/refresh/');

          console.error('[API] 401 Unauthorized detected:', error.config?.url);

          // Only do emergency logout if NOT on auth pages and NOT a token/refresh endpoint
          // This prevents redirect loops and allows forms to handle errors gracefully
          if (!isLoginPath && !isRegisterPath && !isAuthTokenEndpoint && !isRefreshEndpoint) {
            const refreshToken = localStorage.getItem('refresh_token');
            const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

            // If we haven't retried yet and have a refresh token, try refreshing
            if (!originalRequest._retry && refreshToken) {
              originalRequest._retry = true;
              console.log('[API] Attempting token refresh...');

              return axios.post(`${API_BASE_URL}/auth/token/refresh/`, {
                refresh: refreshToken
              }, {
                headers: { 'Content-Type': 'application/json' }
              }).then((refreshResponse) => {
                const newAccess = refreshResponse.data?.access;
                if (newAccess) {
                  localStorage.setItem('access_token', newAccess);
                  document.cookie = `access=${newAccess}; path=/; SameSite=Lax`;
                  if (originalRequest.headers) {
                    originalRequest.headers.Authorization = `Bearer ${newAccess}`;
                  }
                  return instance(originalRequest);
                }
                return Promise.reject(apiError);
              }).catch(() => {
                // Refresh failed - clear session and redirect
                console.warn('[API] Token refresh failed. Performing emergency logout.');
                try {
                  localStorage.removeItem('access_token');
                  localStorage.removeItem('refresh_token');
                  localStorage.removeItem('user');
                  localStorage.removeItem('zv_project');
                  document.cookie = 'access=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
                  document.cookie = 'refresh=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
                } catch (e) {
                  // Ignore
                }
                window.location.href = `/login?expired=true&from=${encodeURIComponent(window.location.pathname)}`;
                return Promise.reject(apiError);
              });
            }

            // No refresh token available - redirect
            console.warn('[API] No refresh token. Redirecting to login.');
            try {
              localStorage.removeItem('access_token');
              localStorage.removeItem('refresh_token');
              localStorage.removeItem('user');
              localStorage.removeItem('zv_project');
              document.cookie = 'access=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
              document.cookie = 'refresh=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
            } catch (e) {
              // Ignore
            }
            window.location.href = `/login?expired=true&from=${encodeURIComponent(window.location.pathname)}`;
          }
        }
 else if (error.response?.status !== 401) {
        // Log other errors for debugging
        console.error(`[API] ${error.response?.status || 'Network'} Error:`, error.config?.url, apiError);
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
     */
    async bulkDelete(ids: string[]): Promise<void> {
      await Promise.all(ids.map(id => this.delete(id)));
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
