/**
 * User GraphQL API Functions
 */

import { gqlQuery, gqlMutation } from '@core/services/GraphQLClient';
import * as Queries from './queries';
import type {
  User,
  UserCreateInput,
  UserUpdateInput,
  UserFilters,
  UsersResponse,
  UserStats,
} from '../types';

// ============================================================================
// Query Functions
// ============================================================================

/**
 * Get paginated list of users
 */
export async function getUsers(filters: UserFilters = {}): Promise<UsersResponse> {
  const variables = {
    page: filters.page || 1,
    limit: filters.limit || 50,
    ...(filters.search && { search: filters.search }),
    ...(filters.role && filters.role !== 'all' && { role: filters.role }),
    ...(filters.status && filters.status !== 'all' && { status: filters.status }),
  };

  const data = await gqlQuery<{
    users: User[];
    userCount: number;
  }>(Queries.GET_USERS_QUERY, variables, 'auction');

  return {
    users: data.users || [],
    total: data.userCount || 0,
    page: filters.page || 1,
    limit: filters.limit || 50,
    totalPages: Math.ceil((data.userCount || 0) / (filters.limit || 50)),
  };
}

/**
 * Get a single user by ID
 */
export async function getUser(id: string): Promise<User> {
  const data = await gqlQuery<{ user: User }>(
    Queries.GET_USER_QUERY,
    { id },
    'auction'
  );
  return data.user;
}

/**
 * Get user statistics
 */
export async function getUserStats(): Promise<UserStats> {
  const data = await gqlQuery<{ userStats: UserStats }>(
    Queries.GET_USER_STATS_QUERY,
    {},
    'auction'
  );
  return data.userStats;
}

// ============================================================================
// Mutation Functions
// ============================================================================

/**
 * Create a new user
 */
export async function createUser(input: UserCreateInput): Promise<User> {
  const data = await gqlMutation<{ createUser: User }>(
    Queries.CREATE_USER_MUTATION,
    { input },
    'auction'
  );
  return data.createUser;
}

/**
 * Update an existing user
 */
export async function updateUser(input: UserUpdateInput): Promise<User> {
  const { id, ...data } = input;
  const result = await gqlMutation<{ updateUser: User }>(
    Queries.UPDATE_USER_MUTATION,
    { id, input: data },
    'auction'
  );
  return result.updateUser;
}

/**
 * Delete a user
 */
export async function deleteUser(id: string): Promise<{ success: boolean; message: string }> {
  const data = await gqlMutation<{ deleteUser: { success: boolean; message: string } }>(
    Queries.DELETE_USER_MUTATION,
    { id },
    'auction'
  );
  return data.deleteUser;
}

/**
 * Update user status
 */
export async function updateUserStatus(id: string, isActive: boolean): Promise<User> {
  const data = await gqlMutation<{ updateUserStatus: User }>(
    Queries.UPDATE_USER_STATUS_MUTATION,
    { id, isActive },
    'auction'
  );
  return data.updateUserStatus;
}

/**
 * Reset user password
 */
export async function resetUserPassword(id: string): Promise<{ success: boolean; message: string }> {
  const data = await gqlMutation<{ resetUserPassword: { success: boolean; message: string } }>(
    Queries.RESET_USER_PASSWORD_MUTATION,
    { id },
    'auction'
  );
  return data.resetUserPassword;
}

// ============================================================================
// Query Keys for React Query Cache
// ============================================================================

export const userKeys = {
  all: ['users'] as const,
  lists: () => [...userKeys.all, 'list'] as const,
  list: (filters: UserFilters) => [...userKeys.lists(), filters] as const,
  details: () => [...userKeys.all, 'detail'] as const,
  detail: (id: string) => [...userKeys.details(), id] as const,
  stats: () => [...userKeys.all, 'stats'] as const,
} as const;
