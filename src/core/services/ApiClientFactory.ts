/**
 * API Client Factory
 * Generates configured axios instances for services
 */

import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import type { ServiceEndpoints, ApiError, ApiResponse } from './types';

// ============================================================================
// Configuration
// ============================================================================

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://test.zonevast.com';

const PROJECT_STORAGE_KEY = 'zv_project';

/**
 * Get auth token from storage
 */
function getAuthToken(): string | null {
  // Check cookie first (preferred)
  const cookies = document.cookie.split(';');
  const accessCookie = cookies.find(c => c.trim().startsWith('access='));
  if (accessCookie) {
    return accessCookie.split('=')[1]?.trim() || null;
  }

  // Fallback to localStorage
  return localStorage.getItem('access_token');
}

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
      // Only clear tokens if we're not already on the login page and it's a genuine auth error
      if (error.response?.status === 401) {
        const isAuthEndpoint = error.config?.url?.includes('/auth/');
        const isLoginPath = window.location.pathname.includes('/login');
        
        // Log it for transparency
        console.error('[API] 401 Unauthorized:', error.config?.url, apiError);

        if (!isLoginPath && (isAuthEndpoint || (error.response?.data as any)?.code === 'token_not_valid')) {
          // Clear tokens
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          document.cookie = 'access=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
          
          // Optionally notify the user or redirect
          console.warn('[API] Session expired or invalid. Logging out.');
          
          // Only redirect if absolutely necessary to avoid infinite loops
          if (!isLoginPath) {
            window.location.href = '/login?expired=true';
          }
        }
      } else {
        // Log other errors for debugging "lost connection"
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
