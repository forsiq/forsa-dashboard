/**
 * User GraphQL React Query Hooks
 */

import { useQuery, useMutation, useQueryClient, type UseQueryResult } from '@tanstack/react-query';
import { useRef, useEffect } from 'react';
import { useToast } from '@core/contexts/ToastContext';
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
 * Hook to show error toast only once per unique error
 */
function useErrorHandler(error: Error | null, messagePrefix: string) {
  const toast = useToast();
  const lastErrorRef = useRef<string | null>(null);

  useEffect(() => {
    if (error) {
      const errorKey = `${messagePrefix}:${error.message}`;
      // Only show toast if this is a new error
      if (lastErrorRef.current !== errorKey) {
        lastErrorRef.current = errorKey;
        toast.error(`${messagePrefix}: ${error.message}`, 8000);
      }
    } else {
      // Reset when no error
      lastErrorRef.current = null;
    }
  }, [error, messagePrefix, toast]);
}

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
  const query = useQuery({
    queryKey: api.userKeys.list(filters),
    queryFn: () => api.getUsers(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  useErrorHandler(query.error, 'Failed to load users');

  return query;
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
  const query = useQuery({
    queryKey: api.userKeys.detail(id),
    queryFn: () => api.getUser(id),
    enabled: enabled && !!id,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  useErrorHandler(query.error, 'Failed to load user');

  return query;
}

/**
 * Fetch user statistics
 *
 * @example
 * const { data, isLoading, error } = useGetUserStats();
 */
export function useGetUserStats(): UseQueryResult<UserStats> {
  const query = useQuery({
    queryKey: api.userKeys.stats(),
    queryFn: api.getUserStats,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  useErrorHandler(query.error, 'Failed to load user stats');

  return query;
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
  const toast = useToast();

  return useMutation({
    mutationFn: (input: UserCreateInput) => api.createUser(input),
    onSuccess: () => {
      // Invalidate users list queries
      queryClient.invalidateQueries({ queryKey: api.userKeys.lists() });
      queryClient.invalidateQueries({ queryKey: api.userKeys.stats() });
      toast.success('User created successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to create user: ${error.message}`, 8000);
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
  const toast = useToast();

  return useMutation({
    mutationFn: (input: UserUpdateInput) => api.updateUser(input),
    onSuccess: (data, variables) => {
      // Invalidate the specific user query
      queryClient.invalidateQueries({ queryKey: api.userKeys.detail(String(variables.id)) });
      // Invalidate users list queries
      queryClient.invalidateQueries({ queryKey: api.userKeys.lists() });
      toast.success('User updated successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update user: ${error.message}`, 8000);
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
  const toast = useToast();

  return useMutation({
    mutationFn: (id: string) => api.deleteUser(id),
    onSuccess: () => {
      // Invalidate users list queries
      queryClient.invalidateQueries({ queryKey: api.userKeys.lists() });
      queryClient.invalidateQueries({ queryKey: api.userKeys.stats() });
      toast.success('User deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete user: ${error.message}`, 8000);
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
  const toast = useToast();

  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      api.updateUserStatus(id, isActive),
    onSuccess: (data, variables) => {
      // Invalidate the specific user query
      queryClient.invalidateQueries({ queryKey: api.userKeys.detail(variables.id) });
      // Invalidate users list queries
      queryClient.invalidateQueries({ queryKey: api.userKeys.lists() });
      queryClient.invalidateQueries({ queryKey: api.userKeys.stats() });
      toast.success('User status updated successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update user status: ${error.message}`, 8000);
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
  const toast = useToast();

  return useMutation({
    mutationFn: (id: string) => api.resetUserPassword(id),
    onSuccess: () => {
      toast.success('Password reset email sent');
    },
    onError: (error: Error) => {
      toast.error(`Failed to reset password: ${error.message}`, 8000);
    },
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
