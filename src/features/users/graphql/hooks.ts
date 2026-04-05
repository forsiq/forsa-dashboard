/**
 * User GraphQL React Query Hooks
 */

import { useQuery, useMutation, useQueryClient, type UseQueryResult } from '@tanstack/react-query';
import * as api from './api';
import type {
  User,
  UserCreateInput,
  UserUpdateInput,
  UserFilters,
  UsersResponse,
  UserStats,
} from '../types';

// ============================================================================
// Query Hooks
// ============================================================================

/**
 * Fetch users with filters
 *
 * @example
 * const { data, isLoading, error } = useGetUsers({
 *   page: 1,
 *   limit: 20,
 *   status: 'active'
 * });
 */
export function useGetUsers(
  filters: UserFilters = {}
): UseQueryResult<UsersResponse> {
  return useQuery({
    queryKey: api.userKeys.list(filters),
    queryFn: () => api.getUsers(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Fetch a single user by ID
 *
 * @example
 * const { data, isLoading, error } = useGetUser('user-id');
 */
export function useGetUser(
  id: string,
  enabled = true
): UseQueryResult<User> {
  return useQuery({
    queryKey: api.userKeys.detail(id),
    queryFn: () => api.getUser(id),
    enabled: enabled && !!id,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Fetch user statistics
 *
 * @example
 * const { data, isLoading, error } = useGetUserStats();
 */
export function useGetUserStats(): UseQueryResult<UserStats> {
  return useQuery({
    queryKey: api.userKeys.stats(),
    queryFn: api.getUserStats,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

// ============================================================================
// Mutation Hooks
// ============================================================================

/**
 * Create a new user
 *
 * @example
 * const createMutation = useCreateUser();
 * await createMutation.mutateAsync({ name: 'John', email: 'john@example.com' });
 */
export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UserCreateInput) => api.createUser(input),
    onSuccess: () => {
      // Invalidate users list queries
      queryClient.invalidateQueries({ queryKey: api.userKeys.lists() });
      queryClient.invalidateQueries({ queryKey: api.userKeys.stats() });
    },
  });
}

/**
 * Update an existing user
 *
 * @example
 * const updateMutation = useUpdateUser();
 * await updateMutation.mutateAsync({ id: '123', name: 'Updated Name' });
 */
export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UserUpdateInput) => api.updateUser(input),
    onSuccess: (data, variables) => {
      // Invalidate the specific user query
      queryClient.invalidateQueries({ queryKey: api.userKeys.detail(String(variables.id)) });
      // Invalidate users list queries
      queryClient.invalidateQueries({ queryKey: api.userKeys.lists() });
    },
  });
}

/**
 * Delete a user
 *
 * @example
 * const deleteMutation = useDeleteUser();
 * await deleteMutation.mutateAsync('user-id');
 */
export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => api.deleteUser(id),
    onSuccess: () => {
      // Invalidate users list queries
      queryClient.invalidateQueries({ queryKey: api.userKeys.lists() });
      queryClient.invalidateQueries({ queryKey: api.userKeys.stats() });
    },
  });
}

/**
 * Update user status
 *
 * @example
 * const statusMutation = useUpdateUserStatus();
 * await statusMutation.mutateAsync({ id: '123', isActive: false });
 */
export function useUpdateUserStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      api.updateUserStatus(id, isActive),
    onSuccess: (data, variables) => {
      // Invalidate the specific user query
      queryClient.invalidateQueries({ queryKey: api.userKeys.detail(variables.id) });
      // Invalidate users list queries
      queryClient.invalidateQueries({ queryKey: api.userKeys.lists() });
      queryClient.invalidateQueries({ queryKey: api.userKeys.stats() });
    },
  });
}

/**
 * Reset user password
 *
 * @example
 * const resetMutation = useResetUserPassword();
 * await resetMutation.mutateAsync('user-id');
 */
export function useResetUserPassword() {
  return useMutation({
    mutationFn: (id: string) => api.resetUserPassword(id),
  });
}

// ============================================================================
// Prefetch Functions
// ============================================================================

/**
 * Prefetch user data for faster navigation
 *
 * @example
 * const queryClient = useQueryClient();
 * prefetchUser(queryClient, 'user-id');
 */
export async function prefetchUser(
  queryClient: ReturnType<typeof useQueryClient>,
  id: string
): Promise<void> {
  await queryClient.prefetchQuery({
    queryKey: api.userKeys.detail(id),
    queryFn: () => api.getUser(id),
    staleTime: 10 * 60 * 1000,
  });
}
