/** Machine-readable auth error codes (thrown by authApi, translated in UI). */
export const AUTH_ERROR_CODES = {
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  AUTH_FAILED: 'AUTH_FAILED',
  CONNECTION_TIMEOUT: 'CONNECTION_TIMEOUT',
  NETWORK_ERROR: 'NETWORK_ERROR',
  TOO_MANY_ATTEMPTS: 'TOO_MANY_ATTEMPTS',
  ACCOUNT_LOCKED: 'ACCOUNT_LOCKED',
  SESSION_EXPIRED: 'SESSION_EXPIRED',
  REGISTRATION_FAILED: 'REGISTRATION_FAILED',
  RESET_EMAIL_FAILED: 'RESET_EMAIL_FAILED',
  LOGIN_FAILED: 'LOGIN_FAILED',
  OTP_VERIFICATION_FAILED: 'OTP_VERIFICATION_FAILED',
} as const;

export type AuthErrorCode = (typeof AUTH_ERROR_CODES)[keyof typeof AUTH_ERROR_CODES];

export const AUTH_ERROR_I18N_KEYS: Record<AuthErrorCode, string> = {
  [AUTH_ERROR_CODES.INVALID_CREDENTIALS]: 'auth.errors.invalidCredentials',
  [AUTH_ERROR_CODES.AUTH_FAILED]: 'auth.errors.authenticationFailed',
  [AUTH_ERROR_CODES.CONNECTION_TIMEOUT]: 'auth.errors.connectionTimeout',
  [AUTH_ERROR_CODES.NETWORK_ERROR]: 'auth.errors.networkError',
  [AUTH_ERROR_CODES.TOO_MANY_ATTEMPTS]: 'auth.errors.tooManyAttempts',
  [AUTH_ERROR_CODES.ACCOUNT_LOCKED]: 'auth.errors.accountLocked',
  [AUTH_ERROR_CODES.SESSION_EXPIRED]: 'auth.errors.sessionExpired',
  [AUTH_ERROR_CODES.REGISTRATION_FAILED]: 'auth.errors.registrationFailed',
  [AUTH_ERROR_CODES.RESET_EMAIL_FAILED]: 'auth.errors.resetEmailFailed',
  [AUTH_ERROR_CODES.LOGIN_FAILED]: 'auth.errors.loginFailed',
  [AUTH_ERROR_CODES.OTP_VERIFICATION_FAILED]: 'auth.errors.otpVerificationFailed',
};

export class AuthApiError extends Error {
  readonly code: AuthErrorCode;
  readonly backendMessage?: string;

  constructor(code: AuthErrorCode, backendMessage?: string) {
    super(code);
    this.name = 'AuthApiError';
    this.code = code;
    this.backendMessage = backendMessage;
  }
}

export function isAuthErrorCode(value: string): value is AuthErrorCode {
  return Object.values(AUTH_ERROR_CODES).includes(value as AuthErrorCode);
}

export function isAuthApiError(err: unknown): err is AuthApiError {
  return err instanceof AuthApiError;
}
