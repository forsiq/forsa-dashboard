/**
 * Group Buying REST API React Query Hooks
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { groupBuyingApi } from './group-buying-api';
import type { 
  GroupBuying, 
  GroupBuyingCreateInput, 
  GroupBuyingUpdateInput, 
  GroupBuyingFilters 
} from '../types';

export const groupBuyingKeys = {
  all: ['groupBuyings'] as const,
  lists: () => [...groupBuyingKeys.all, 'list'] as const,
  list: (filters: GroupBuyingFilters) => [...groupBuyingKeys.lists(), filters] as const,
  details: () => [...groupBuyingKeys.all, 'detail'] as const,
  detail: (id: string) => [...groupBuyingKeys.details(), id] as const,
  stats: () => [...groupBuyingKeys.all, 'stats'] as const,
  participants: (id: string) => [...groupBuyingKeys.all, 'participants', id] as const,
};

export const useGetGroupBuyings = (filters: GroupBuyingFilters = {}) => {
  return useQuery({
    queryKey: groupBuyingKeys.list(filters),
    queryFn: () => groupBuyingApi.list(filters),
  });
};

export const useGetGroupBuying = (id: string, enabledOrOptions?: boolean | { enabled?: boolean }) => {
  const enabled = typeof enabledOrOptions === 'boolean' ? enabledOrOptions : enabledOrOptions?.enabled ?? true;
  return useQuery({
    queryKey: groupBuyingKeys.detail(id),
    queryFn: () => groupBuyingApi.get(id),
    enabled: enabled && !!id,
  });
};

export const useGetGroupBuyingStats = () => {
  return useQuery({
    queryKey: groupBuyingKeys.stats(),
    queryFn: groupBuyingApi.getStats,
  });
};

export const useGetGroupBuyingParticipants = (id: string, page = 1, limit = 20) => {
  return useQuery({
    queryKey: [...groupBuyingKeys.participants(id), page, limit],
    queryFn: () => groupBuyingApi.getParticipants(id, page, limit),
    enabled: !!id,
  });
};

export const useCreateGroupBuying = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: GroupBuyingCreateInput) => groupBuyingApi.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: groupBuyingKeys.lists() });
      queryClient.invalidateQueries({ queryKey: groupBuyingKeys.stats() });
    },
  });
};

export const useUpdateGroupBuying = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: GroupBuyingUpdateInput) => groupBuyingApi.update(input),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: groupBuyingKeys.detail(String(data.id)) });
      queryClient.invalidateQueries({ queryKey: groupBuyingKeys.lists() });
    },
  });
};

export const useDeleteGroupBuying = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => groupBuyingApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: groupBuyingKeys.lists() });
      queryClient.invalidateQueries({ queryKey: groupBuyingKeys.stats() });
    },
  });
};

export const useJoinGroupBuying = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, quantity }: { id: string; quantity: number }) => groupBuyingApi.join(id, quantity),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: groupBuyingKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: groupBuyingKeys.participants(id) });
    },
  });
};

export const useLeaveGroupBuying = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => groupBuyingApi.leave(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: groupBuyingKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: groupBuyingKeys.participants(id) });
    },
  });
};
