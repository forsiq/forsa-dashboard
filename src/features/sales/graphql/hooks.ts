/**
 * Group Buying GraphQL React Query Hooks
 */

import { useQuery, useMutation, useQueryClient, type UseQueryResult } from '@tanstack/react-query';
import { useRef, useEffect } from 'react';
import { useToast } from '@core/contexts/ToastContext';
import * as api from './api';
import type {
  GroupBuying,
  GroupBuyingCreateInput,
  GroupBuyingUpdateInput,
  GroupBuyingFilters,
  GroupBuyingsResponse,
  GroupBuyingStats,
  GroupBuyingParticipant,
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
 * Fetch group buying campaigns with filters
 *
 * @example
 * const { data, isLoading, error } = useGetGroupBuyings({
 *   page: 1,
 *   limit: 20,
 *   status: 'active'
 * });
 */
export function useGetGroupBuyings(
  filters: GroupBuyingFilters = {}
): UseQueryResult<GroupBuyingsResponse> {
  const query = useQuery({
    queryKey: api.groupBuyingKeys.list(filters),
    queryFn: () => api.getGroupBuyings(filters),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  useErrorHandler(query.error, 'Failed to load campaigns');

  return query;
}

/**
 * Fetch a single group buying campaign by ID
 *
 * @example
 * const { data, isLoading, error } = useGetGroupBuying('campaign-id');
 */
export function useGetGroupBuying(
  id: string,
  enabled = true
): UseQueryResult<GroupBuying> {
  const query = useQuery({
    queryKey: api.groupBuyingKeys.detail(id),
    queryFn: () => api.getGroupBuying(id),
    enabled: enabled && !!id,
    staleTime: 1 * 60 * 1000, // 1 minute
    refetchInterval: (query) => {
      // Refetch more frequently if campaign is active
      if (query.state.data?.status === 'active') {
        return 15 * 1000; // 15 seconds for active campaigns
      }
      return false;
    },
  });

  useErrorHandler(query.error, 'Failed to load campaign');

  return query;
}

/**
 * Fetch group buying statistics
 *
 * @example
 * const { data, isLoading, error } = useGetGroupBuyingStats();
 */
export function useGetGroupBuyingStats(): UseQueryResult<GroupBuyingStats> {
  const query = useQuery({
    queryKey: api.groupBuyingKeys.stats(),
    queryFn: api.getGroupBuyingStats,
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchInterval: 30 * 1000, // Refresh every 30 seconds
  });

  useErrorHandler(query.error, 'Failed to load stats');

  return query;
}

/**
 * Fetch participants for a group buying campaign
 *
 * @example
 * const { data, isLoading, error } = useGetGroupBuyingParticipants('campaign-id', 1, 20);
 */
export function useGetGroupBuyingParticipants(id: string, page = 1, limit = 20) {
  const query = useQuery({
    queryKey: [...api.groupBuyingKeys.participants(id), page, limit],
    queryFn: () => api.getGroupBuyingParticipants(id, page, limit),
    enabled: !!id,
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 15 * 1000, // Refresh participants frequently
  });

  useErrorHandler(query.error, 'Failed to load participants');

  return query;
}

// ============================================================================
// Mutation Hooks
// ============================================================================

/**
 * Create a new group buying campaign
 *
 * @example
 * const createMutation = useCreateGroupBuying();
 * await createMutation.mutateAsync({ title: 'My Campaign', ... });
 */
export function useCreateGroupBuying() {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: (input: GroupBuyingCreateInput) => api.createGroupBuying(input),
    onSuccess: () => {
      // Invalidate campaigns list queries
      queryClient.invalidateQueries({ queryKey: api.groupBuyingKeys.lists() });
      queryClient.invalidateQueries({ queryKey: api.groupBuyingKeys.stats() });
      toast.success('Campaign created successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to create campaign: ${error.message}`, 8000);
    },
  });
}

/**
 * Update an existing group buying campaign
 *
 * @example
 * const updateMutation = useUpdateGroupBuying();
 * await updateMutation.mutateAsync({ id: '123', title: 'Updated Title' });
 */
export function useUpdateGroupBuying() {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: (input: GroupBuyingUpdateInput) => api.updateGroupBuying(input),
    onSuccess: (data, variables) => {
      // Invalidate the specific campaign query
      queryClient.invalidateQueries({ queryKey: api.groupBuyingKeys.detail(variables.id) });
      // Invalidate campaigns list queries
      queryClient.invalidateQueries({ queryKey: api.groupBuyingKeys.lists() });
      queryClient.invalidateQueries({ queryKey: api.groupBuyingKeys.stats() });
      toast.success('Campaign updated successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update campaign: ${error.message}`, 8000);
    },
  });
}

/**
 * Delete a group buying campaign
 *
 * @example
 * const deleteMutation = useDeleteGroupBuying();
 * await deleteMutation.mutateAsync('campaign-id');
 */
export function useDeleteGroupBuying() {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: (id: string) => api.deleteGroupBuying(id),
    onSuccess: () => {
      // Invalidate campaigns list queries
      queryClient.invalidateQueries({ queryKey: api.groupBuyingKeys.lists() });
      queryClient.invalidateQueries({ queryKey: api.groupBuyingKeys.stats() });
      toast.success('Campaign deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete campaign: ${error.message}`, 8000);
    },
  });
}

/**
 * Update group buying campaign status
 *
 * @example
 * const statusMutation = useUpdateGroupBuyingStatus();
 * await statusMutation.mutateAsync({ id: '123', status: 'active' });
 */
export function useUpdateGroupBuyingStatus() {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: GroupBuying['status'] }) =>
      api.updateGroupBuyingStatus(id, status),
    onSuccess: (data, variables) => {
      // Invalidate the specific campaign query
      queryClient.invalidateQueries({ queryKey: api.groupBuyingKeys.detail(variables.id) });
      // Invalidate campaigns list queries
      queryClient.invalidateQueries({ queryKey: api.groupBuyingKeys.lists() });
      queryClient.invalidateQueries({ queryKey: api.groupBuyingKeys.stats() });
      toast.success('Campaign status updated successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update status: ${error.message}`, 8000);
    },
  });
}

/**
 * Join a group buying campaign
 *
 * @example
 * const joinMutation = useJoinGroupBuying();
 * await joinMutation.mutateAsync({ groupBuyingId: '123', quantity: 1 });
 */
export function useJoinGroupBuying() {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: ({ groupBuyingId, quantity }: { groupBuyingId: string; quantity: number }) =>
      api.joinGroupBuying(groupBuyingId, quantity),
    onSuccess: (data, variables) => {
      // Invalidate the specific campaign query
      queryClient.invalidateQueries({ queryKey: api.groupBuyingKeys.detail(variables.groupBuyingId) });
      // Invalidate participant list for this campaign
      queryClient.invalidateQueries({ queryKey: api.groupBuyingKeys.participants(variables.groupBuyingId) });
      // Invalidate stats
      queryClient.invalidateQueries({ queryKey: api.groupBuyingKeys.stats() });
      toast.success('Successfully joined campaign');
    },
    onError: (error: Error) => {
      toast.error(`Failed to join campaign: ${error.message}`, 8000);
    },
  });
}

// ============================================================================
// Prefetch Functions
// ============================================================================

/**
 * Prefetch group buying data for faster navigation
 *
 * @example
 * const queryClient = useQueryClient();
 * prefetchGroupBuying(queryClient, 'campaign-id');
 */
export async function prefetchGroupBuying(
  queryClient: ReturnType<typeof useQueryClient>,
  id: string
): Promise<void> {
  await queryClient.prefetchQuery({
    queryKey: api.groupBuyingKeys.detail(id),
    queryFn: () => api.getGroupBuying(id),
    staleTime: 1 * 60 * 1000,
  });
}
