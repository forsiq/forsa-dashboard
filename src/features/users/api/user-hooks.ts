/**
 * User REST API React Query Hooks
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userApi } from './user-api';
import type { User, UserCreateInput, UserUpdateInput, UserFilters, UsersResponse, UserStats } from '../types';

export const userKeys = {
  all: ['users'] as const,
  lists: () => [...userKeys.all, 'list'] as const,
  list: (filters: UserFilters) => [...userKeys.lists(), filters] as const,
  details: () => [...userKeys.all, 'detail'] as const,
  detail: (id: string) => [...userKeys.details(), id] as const,
  stats: () => [...userKeys.all, 'stats'] as const,
};

export const useGetUsers = (filters: UserFilters = {}) => {
  return useQuery<UsersResponse>({
    queryKey: userKeys.list(filters),
    queryFn: ({ signal }) => userApi.list(filters, signal),
  });
};

export const useGetUser = (id: string, enabledOrOptions?: boolean | { enabled?: boolean }) => {
  const enabled = typeof enabledOrOptions === 'boolean' ? enabledOrOptions : enabledOrOptions?.enabled ?? true;
  return useQuery<User>({
    queryKey: userKeys.detail(id),
    queryFn: () => userApi.get(id),
    enabled: enabled && !!id,
  });
};

export const useGetUserStats = () => {
  return useQuery<UserStats>({
    queryKey: userKeys.stats(),
    queryFn: userApi.getStats,
  });
};

export const useCreateUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: UserCreateInput) => userApi.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      queryClient.invalidateQueries({ queryKey: userKeys.stats() });
    },
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: UserUpdateInput) => userApi.update(input),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: userKeys.detail(String(data.id)) });
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      queryClient.invalidateQueries({ queryKey: userKeys.stats() });
    },
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => userApi.delete(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: userKeys.all });
      const previousData = queryClient.getQueriesData<UsersResponse>({ queryKey: userKeys.lists() });
      queryClient.setQueriesData<UsersResponse>({ queryKey: userKeys.lists() }, (old) => {
        if (!old || !Array.isArray(old.users)) return old;
        return {
          ...old,
          users: old.users.filter((user) => String(user.id) !== String(id)),
          total: Math.max(0, (old.total ?? old.users.length) - 1),
        };
      });
      return { previousData };
    },
    onError: (_err, _id, context) => {
      if (context?.previousData) {
        context.previousData.forEach(([key, data]) => {
          queryClient.setQueryData(key, data);
        });
      }
    },
    onSuccess: async (_void, id) => {
      queryClient.removeQueries({ queryKey: userKeys.detail(String(id)) });
      queryClient.setQueriesData<UsersResponse>({ queryKey: userKeys.lists() }, (old) => {
        if (!old || !Array.isArray(old.users)) return old;
        return {
          ...old,
          users: old.users.filter((user) => String(user.id) !== String(id)),
          total: Math.max(0, (old.total ?? old.users.length) - 1),
        };
      });
      await queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      await queryClient.invalidateQueries({ queryKey: userKeys.stats() });
    },
  });
};

export const useUpdateUserStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) => userApi.setStatus(id, isActive),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: userKeys.detail(String(data.id)) });
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
    },
  });
};

export const useResetUserPassword = () => {
  return useMutation({
    mutationFn: (id: string) => userApi.resetPassword(id),
  });
};
