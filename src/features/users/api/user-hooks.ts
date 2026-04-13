/**
 * User REST API React Query Hooks
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userApi } from './user-api';
import type { User, UserCreateInput, UserUpdateInput, UserFilters } from '../types';

export const userKeys = {
  all: ['users'] as const,
  lists: () => [...userKeys.all, 'list'] as const,
  list: (filters: UserFilters) => [...userKeys.lists(), filters] as const,
  details: () => [...userKeys.all, 'detail'] as const,
  detail: (id: string) => [...userKeys.details(), id] as const,
  stats: () => [...userKeys.all, 'stats'] as const,
};

export const useGetUsers = (filters: UserFilters = {}) => {
  return useQuery({
    queryKey: userKeys.list(filters),
    queryFn: () => userApi.list(filters),
  });
};

export const useGetUser = (id: string, enabled = true) => {
  return useQuery({
    queryKey: userKeys.detail(id),
    queryFn: () => userApi.get(id),
    enabled: enabled && !!id,
  });
};

export const useGetUserStats = () => {
  return useQuery({
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      queryClient.invalidateQueries({ queryKey: userKeys.stats() });
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
