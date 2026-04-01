/**
 * Common API Response Types
 * Shared across all API calls
 */

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data: T;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
  errors?: Record<string, string[]>;
}

export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
}

/**
 * Standard success response wrapper
 */
export function createApiResponse<T>(data: T, message?: string): ApiResponse<T> {
  return {
    success: true,
    message,
    data,
  };
}

/**
 * Standard error response wrapper
 */
export function createApiErrorResponse(code: string, message: string, details?: Record<string, unknown>): ApiErrorResponse {
  return {
    success: false,
    error: {
      code,
      message,
      details,
    },
  };
}
