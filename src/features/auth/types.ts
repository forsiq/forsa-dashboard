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
