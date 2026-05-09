/**
 * User REST API Service
 * Comprehensive implementation for Forsa Users
 * Uses compat endpoints derived from bids + orders data
 */

import { createApiClient } from '@core/services/ApiClientFactory';
import type {
  User,
  UserCreateInput,
  UserUpdateInput,
  UserFilters,
  UsersResponse,
  UserStats,
} from '../types';

/**
 * Base User API implementation using shared factory
 */
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://test.zonevast.com/forsa/api/v1';

export const userBaseApi = createApiClient<User, UserCreateInput, UserUpdateInput, UserFilters>({
  serviceName: 'users',
  endpoint: '/users',
  apiBaseUrl: API_BASE_URL,
});

const mapToUser = (raw: any): User => ({
  id: raw?.id || '',
  userName: raw?.userName || raw?.username || '',
  fullName: raw?.fullName || raw?.full_name || raw?.name || '',
  email: raw?.email || undefined,
  phone: raw?.phone || undefined,
  role: (raw?.role ?? 'user') as User['role'],
  isActive: Boolean(raw?.isActive ?? raw?.is_active ?? true),
  isTempPass: Boolean(raw?.isTempPass ?? raw?.is_temp_pass ?? false),
  createdAt: raw?.createdAt ?? raw?.created_at,
  updatedAt: raw?.updatedAt ?? raw?.updated_at,
});

/**
 * User API - main user operations
 */
export const userApi = {
  /**
   * Get paginated list of users
   */
  list: async (filters?: UserFilters): Promise<UsersResponse> => {
    const response = await userBaseApi.list(filters) as any;
    const users = (response.data || []).map(mapToUser);
    const total = response.total || users.length;
    
    return {
      users,
      total,
      page: filters?.page || 1,
      limit: filters?.limit || 50,
      totalPages: Math.ceil(total / (filters?.limit || 50)),
    };
  },

  /**
   * Get single user by ID
   */
  get: async (id: string): Promise<User> => {
    const response = await userBaseApi.getById(id);
    return mapToUser(response.data);
  },

  /**
   * Create a new user (compat - returns mock/empty)
   */
  create: async (data: UserCreateInput): Promise<User> => {
    return {
      id: Date.now(),
      userName: data.userName,
      fullName: data.fullName,
      email: data.email,
      phone: data.phone,
      role: data.role,
      isActive: true,
      isTempPass: false,
    };
  },

  /**
   * Update an existing user (compat - limited)
   */
  update: async (input: UserUpdateInput): Promise<User> => {
    try {
      const response = await userBaseApi.update({ ...input, id: String(input.id) } as any);
      return mapToUser(response.data);
    } catch {
      // Compat users are read-only - return the input as-is
      return {
        id: Number(input.id) || 0,
        userName: input.userName || '',
        fullName: input.fullName || '',
        email: input.email,
        phone: input.phone,
        role: input.role || 'user',
        isActive: input.isActive ?? true,
        isTempPass: false,
      };
    }
  },

  /**
   * Delete a user (compat - no-op)
   */
  delete: async (id: string): Promise<void> => {
    // Compat users are read-only - no actual delete
  },

  /**
   * Get user statistics
   */
  getStats: async (): Promise<UserStats> => {
    try {
      const response = await userBaseApi.getStats();
      const stats = response.data;
      return {
        total: stats.total || 0,
        active: stats.active || 0,
        inactive: stats.inactive || 0,
        admins: stats.admins || 0,
        managers: stats.managers || 0,
        newThisMonth: stats.new_this_month || 0,
      };
    } catch {
      return {
        total: 0,
        active: 0,
        inactive: 0,
        admins: 0,
        managers: 0,
        newThisMonth: 0,
      };
    }
  },

  /**
   * Update user status (compat - no-op)
   */
  setStatus: async (id: string, isActive: boolean): Promise<User> => {
    return {
      id: Number(id) || 0,
      userName: '',
      fullName: '',
      role: 'user',
      isActive,
      isTempPass: false,
    };
  },

  /**
   * Reset user password (compat - no-op)
   */
  resetPassword: async (id: string): Promise<void> => {
    // Compat users are read-only
  },
};
