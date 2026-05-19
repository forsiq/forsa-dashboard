// ── Legacy (zv-auth-service) ──
export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface OTPData {
  code: string;
}

export interface AuthResponse {
  access: string;
  refresh: string;
  user: {
    id: string;
    username: string;
    email: string;
  };
}

export interface ForgotPasswordData {
  email: string;
}

export interface AuthError {
  message: string;
  code?: string;
}

// ── Flex Auth Service (zv-flex-auth-service) ──

export type LoginMethod = 'password' | 'otp';

export interface FlexAuthUser {
  id: string;
  phone: string;
  projectId: number;
  role: string;
  firstName?: string;
  lastName?: string;
  phoneVerified: boolean;
  language: string;
  status: string;
  email?: string;
  username?: string;
  avatar?: string;
}

export interface FlexAuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn?: number;
}

export interface FlexAuthResponse {
  user: FlexAuthUser;
  tokens: FlexAuthTokens;
}

export interface FlexLoginPasswordPayload {
  phone: string;
  password: string;
  projectId: number;
}

export interface FlexLoginOtpPayload {
  phone: string;
  otp: string;
  projectId: number;
}

export interface FlexSendOtpPayload {
  phone: string;
  projectId: number;
}

export interface FlexRegisterInitPayload {
  phone: string;
  projectId: number;
  password?: string;
}

export interface FlexRegisterVerifyPayload {
  phone: string;
  otp: string;
  firstName?: string;
  lastName?: string;
}

export interface FlexForgotPasswordInitPayload {
  phone: string;
  projectId: number;
}

export interface FlexForgotPasswordConfirmPayload {
  phone: string;
  otp: string;
  newPassword: string;
  projectId: number;
}

export interface FlexRefreshPayload {
  refresh_token: string;
}

export interface FlexOtpResponse {
  message: string;
  cooldownSeconds?: number;
}

export interface FlexAdminListUsersParams {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
  status?: string;
}

export interface FlexAdminUserUpdatePayload {
  firstName?: string;
  lastName?: string;
  email?: string;
  role?: string;
  status?: string;
  language?: string;
}
