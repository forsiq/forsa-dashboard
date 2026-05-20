export type UserRole = 'admin' | 'merchant' | 'customer_support' | 'product_analyst';

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

export interface JwtPayload {
  sub: string;
  user_id: string;
  phone?: string;
  projectId?: number;
  project_id?: number;
  role?: string;
  roles?: string[];
  userType?: string;
  exp?: number;
  iat?: number;
}
