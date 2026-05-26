export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://test.zonevast.com/forsa/api/v1';
export const AUTH_API_BASE = process.env.NEXT_PUBLIC_AUTH_API_URL || 'https://test.zonevast.com/api/v1/auth/auth/';
export const WS_BASE_URL = process.env.NEXT_PUBLIC_WS_BASE_URL || '';
export const WS_API_URL = process.env.NEXT_PUBLIC_WS_API_URL || '';

export function getApiOrigin(): string {
  try {
    return new URL(API_BASE_URL).origin;
  } catch {
    return 'https://test.zonevast.com';
  }
}
