/**
 * User REST API Service
 * Uses flex-auth-service admin endpoints for user management
 */

import {
  adminListUsers,
  adminGetUser,
  adminUpdateUser,
  adminDeleteUser,
} from '../../auth/services/authApi';
import type { FlexAuthUser } from '../../auth/types';
import type {
  User,
  UserCreateInput,
  UserUpdateInput,
  UserFilters,
  UsersResponse,
  UserStats,
} from '../types';

const mapFlexUserToUser = (raw: FlexAuthUser): User => ({
  id: raw.id as any,
  userName: raw.username || raw.phone || '',
  fullName: [raw.firstName, raw.lastName].filter(Boolean).join(' '),
  email: raw.email || undefined,
  phone: raw.phone || undefined,
  role: (raw.role === 'admin' ? 'admin' : raw.role === 'staff' ? 'manager' : 'user') as User['role'],
  isActive: raw.status === 'active',
  isTempPass: false,
  createdAt: undefined,
  updatedAt: undefined,
});

/**
 * User API — backed by flex-auth admin endpoints
 */
export const userApi = {
  /**
   * Get paginated list of users
   */
  list: async (filters?: UserFilters, signal?: AbortSignal): Promise<UsersResponse> => {
    const result = await adminListUsers({
      page: filters?.page,
      limit: filters?.limit,
      search: filters?.search,
      role: filters?.role && filters.role !== 'all' ? filters.role : undefined,
      status: filters?.status && filters.status !== 'all' ? filters.status : undefined,
    });

    const users = (result.users || []).map(mapFlexUserToUser);
    const total = result.total || users.length;

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
    const flexUser = await adminGetUser(id);
    return mapFlexUserToUser(flexUser);
  },

  /**
   * Create a new user via flex-auth admin
   * Note: flex-auth doesn't have a direct admin create endpoint;
   * users self-register and admins can update them.
   */
  create: async (data: UserCreateInput): Promise<User> => {
    // flex-auth doesn't support admin user creation directly
    // Users must self-register via the registration flow
    throw new Error('User creation is handled through the registration flow. Users self-register and admins manage them after.');
  },

  /**
   * Update an existing user via flex-auth admin
   */
  update: async (input: UserUpdateInput): Promise<User> => {
    const updateData: Record<string, any> = {};

    if (input.fullName) {
      const parts = input.fullName.trim().split(/\s+/);
      updateData.firstName = parts[0] || '';
      updateData.lastName = parts.slice(1).join(' ') || '';
    }
    if (input.email !== undefined) updateData.email = input.email;
    if (input.role) updateData.role = input.role;
    if (input.isActive !== undefined) updateData.status = input.isActive ? 'active' : 'inactive';

    const flexUser = await adminUpdateUser(String(input.id), updateData);
    return mapFlexUserToUser(flexUser);
  },

  /**
   * Delete a user via flex-auth admin
   */
  delete: async (id: string): Promise<void> => {
    await adminDeleteUser(id);
  },

  /**
   * Get user statistics (derived from list)
   */
  getStats: async (): Promise<UserStats> => {
    try {
      const result = await adminListUsers({ limit: 1000 });
      const users = result.users || [];

      return {
        total: result.total || users.length,
        active: users.filter((u) => u.status === 'active').length,
        inactive: users.filter((u) => u.status !== 'active').length,
        admins: users.filter((u) => u.role === 'admin').length,
        managers: users.filter((u) => u.role === 'staff').length,
        newThisMonth: 0,
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
   * Update user status via flex-auth admin
   */
  setStatus: async (id: string, isActive: boolean): Promise<User> => {
    const flexUser = await adminUpdateUser(id, {
      status: isActive ? 'active' : 'inactive',
    });
    return mapFlexUserToUser(flexUser);
  },

  /**
   * Reset user password (not directly supported by flex-auth admin)
   */
  resetPassword: async (id: string): Promise<void> => {
    // flex-auth doesn't have an admin password reset endpoint
    // Users should use the forgot-password flow
    throw new Error('Admin password reset not supported. User should use the forgot-password flow.');
  },
};

// Keep base API export for backward compat (no longer used internally)
export { userApi as userBaseApi };
