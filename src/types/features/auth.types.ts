/**
 * Authentication Feature Types
 * Developer workspace - modify as needed
 */

import type { ApiResponse } from '../common';

/**
 * User entity
 */
export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Auth tokens
 */
export interface AuthTokens {
  token: string;
  refreshToken: string;
  expiresIn: number;
}

/**
 * Login request
 */
export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

/**
 * Login response
 */
export interface LoginResponse {
  user: User;
  tokens: AuthTokens;
}

/**
 * Register request
 */
export interface RegisterRequest {
  name: string;
  email: string;
  phone?: string;
  password: string;
  confirmPassword: string;
}

/**
 * OTP request
 */
export interface OTPRequest {
  email: string;
  code: string;
}

/**
 * OTP send request
 */
export interface SendOTPRequest {
  email: string;
  type: 'register' | 'login' | 'reset';
}

/**
 * Forgot password request
 */
export interface ForgotPasswordRequest {
  email: string;
}

/**
 * Reset password request
 */
export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
  confirmPassword: string;
}

/**
 * API response types for auth
 */
export type LoginApiResponse = ApiResponse<LoginResponse>;
export type RegisterResponse = ApiResponse<{ message: string; user: User }>;
export type OTPResponse = ApiResponse<{ message: string }>;
export type UserResponse = ApiResponse<{ user: User }>;
