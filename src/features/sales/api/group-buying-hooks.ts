/**
 * Group Buying REST API React Query Hooks
 */

import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { groupBuyingApi } from './group-buying-api';
import type { 
  GroupBuying, 
  GroupBuyingCreateInput, 
  GroupBuyingUpdateInput, 
  GroupBuyingFilters,
  GroupBuyingsResponse,
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
    queryFn: ({ signal }) => groupBuyingApi.list(filters, signal),
    placeholderData: keepPreviousData,
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
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: groupBuyingKeys.all });
      const previousData = queryClient.getQueriesData<GroupBuyingsResponse>({ queryKey: groupBuyingKeys.lists() });
      queryClient.setQueriesData<GroupBuyingsResponse>({ queryKey: groupBuyingKeys.lists() }, (old) => {
        if (!old || !Array.isArray(old.groupBuyings)) return old;
        return {
          ...old,
          groupBuyings: old.groupBuyings.filter((gb) => String(gb.id) !== String(id)),
          total: Math.max(0, (old.total ?? old.groupBuyings.length) - 1),
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
      queryClient.removeQueries({ queryKey: groupBuyingKeys.detail(String(id)) });
      queryClient.setQueriesData<GroupBuyingsResponse>({ queryKey: groupBuyingKeys.lists() }, (old) => {
        if (!old || !Array.isArray(old.groupBuyings)) return old;
        return {
          ...old,
          groupBuyings: old.groupBuyings.filter((gb) => String(gb.id) !== String(id)),
          total: Math.max(0, (old.total ?? old.groupBuyings.length) - 1),
        };
      });
      await queryClient.invalidateQueries({ queryKey: groupBuyingKeys.lists() });
      await queryClient.invalidateQueries({ queryKey: groupBuyingKeys.stats() });
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

// ============================================================================
// Lifecycle Hooks
// ============================================================================

function createGroupBuyingLifecycleHook(
  action: (id: string) => Promise<GroupBuying>,
  successMessage: string,
  errorMessage: string,
) {
  return function useLifecycleAction() {
    const queryClient = useQueryClient();

    return useMutation({
      mutationFn: (id: string) => action(id),
      onSuccess: (data) => {
        queryClient.invalidateQueries({ queryKey: groupBuyingKeys.detail(String(data.id)) });
        queryClient.invalidateQueries({ queryKey: groupBuyingKeys.lists() });
        queryClient.invalidateQueries({ queryKey: groupBuyingKeys.stats() });
      },
    });
  };
}

export const useStartGroupBuying = createGroupBuyingLifecycleHook(
  groupBuyingApi.start.bind(groupBuyingApi),
  'Group deal started successfully',
  'Failed to start group deal',
);

export const useCancelGroupBuying = createGroupBuyingLifecycleHook(
  groupBuyingApi.cancel.bind(groupBuyingApi),
  'Group deal cancelled successfully',
  'Failed to cancel group deal',
);

export const useCompleteGroupBuying = createGroupBuyingLifecycleHook(
  groupBuyingApi.complete.bind(groupBuyingApi),
  'Group deal completed successfully',
  'Failed to complete group deal',
);
