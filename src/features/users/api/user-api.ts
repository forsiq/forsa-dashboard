/**
 * User REST API Service
 * Comprehensive implementation for Forsa Users
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
export const userBaseApi = createApiClient<User, UserCreateInput, UserUpdateInput, UserFilters>({
  serviceName: 'users',
  endpoint: '/users',
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
    const users = response.data || [];
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
    return response.data;
  },

  /**
   * Create a new user
   */
  create: async (data: UserCreateInput): Promise<User> => {
    const response = await userBaseApi.create(data);
    return response.data;
  },

  /**
   * Update an existing user
   */
  update: async (input: UserUpdateInput): Promise<User> => {
    const response = await userBaseApi.update({ ...input, id: String(input.id) });
    return response.data;
  },

  /**
   * Delete a user
   */
  delete: async (id: string): Promise<void> => {
    await userBaseApi.delete(id);
  },

  /**
   * Get user statistics
   */
  getStats: async (): Promise<UserStats> => {
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
  },


  /**
   * Update user status
   */
  setStatus: async (id: string, isActive: boolean): Promise<User> => {
    const response = await userBaseApi.getInstance().patch(`/users/${id}/`, { is_active: isActive });
    return response.data.data;
  },

  /**
   * Reset user password
   */
  resetPassword: async (id: string): Promise<void> => {
    await userBaseApi.getInstance().post(`/users/${id}/reset-password/`);
  },
};
