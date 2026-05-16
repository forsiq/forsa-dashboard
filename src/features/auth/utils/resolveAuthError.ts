import {
  AUTH_ERROR_I18N_KEYS,
  AuthErrorCode,
  isAuthErrorCode,
} from '../constants/authErrors';

/**
 * Resolve an auth error code or raw backend message for display.
 */
export function resolveAuthErrorMessage(
  error: string | null,
  t: (key: string) => string
): string | null {
  if (!error) return null;

  if (isAuthErrorCode(error)) {
    const key = AUTH_ERROR_I18N_KEYS[error as AuthErrorCode];
    const translated = t(key);
    return translated !== key ? translated : error;
  }

  return error;
}
