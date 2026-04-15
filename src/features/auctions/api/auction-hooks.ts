/**
 * Auction REST API React Query Hooks
 * Comprehensive implementation for Forsa Auctions
 */

import { useQuery, useMutation, useQueryClient, type UseQueryResult } from '@tanstack/react-query';
import { useRef, useEffect } from 'react';
import { useToast } from '@core/contexts/ToastContext';
import { auctionApi, bidApi } from './auction-api';
import type {
  Auction,
  AuctionsResponse,
  AuctionCreateInput,
  AuctionUpdateInput,
  Bid,
  BidCreateInput,
  AuctionFilters,
  AuctionStats,
} from '../types/auction.types';

// ============================================================================
// Query Keys
// ============================================================================

export const auctionKeys = {
  all: ['auctions'] as const,
  lists: () => [...auctionKeys.all, 'list'] as const,
  list: (filters: AuctionFilters) => [...auctionKeys.lists(), filters] as const,
  details: () => [...auctionKeys.all, 'detail'] as const,
  detail: (id: number | string) => [...auctionKeys.details(), id] as const,
  stats: () => [...auctionKeys.all, 'stats'] as const,
  bids: (auctionId: number | string, page = 1, limit = 20) =>
    [...auctionKeys.all, 'bids', auctionId, page, limit] as const,
  myBids: (page: number, limit: number) => [...auctionKeys.all, 'my-bids', page, limit] as const,
};

// ============================================================================
// Helper Hooks
// ============================================================================

/**
 * Hook to show error toast only once per unique error
 */
function useErrorHandler(error: any, messagePrefix: string) {
  const { error: toastError } = useToast();
  const lastErrorRef = useRef<string | null>(null);

  useEffect(() => {
    if (error) {
      const errorMsg = error.message || (error as any).error || 'Unknown error';
      const errorKey = `${messagePrefix}:${errorMsg}`;
      // Only show toast if this is a new error
      if (lastErrorRef.current !== errorKey) {
        lastErrorRef.current = errorKey;
        toastError(`${messagePrefix}: ${errorMsg}`, 8000);
      }
    } else {
      lastErrorRef.current = null;
    }
  }, [error, messagePrefix, toastError]);
}

// ============================================================================
// Query Hooks
// ============================================================================

/**
 * Get paginated list of auctions
 */
export function useGetAuctions(filters: AuctionFilters = {}): UseQueryResult<AuctionsResponse> {
  const query = useQuery({
    queryKey: auctionKeys.list(filters),
    queryFn: () => auctionApi.list(filters),
    staleTime: 5 * 60 * 1000,
  });

  useErrorHandler(query.error, 'Failed to load auctions');

  return query;
}

/**
 * Get a single auction by ID or slug
 */
export function useGetAuction(id: number | string, enabled = true): UseQueryResult<Auction> {
  const query = useQuery({
    queryKey: auctionKeys.detail(id),
    queryFn: () => auctionApi.get(id),
    enabled: enabled && !!id,
    staleTime: 10 * 60 * 1000,
  });

  useErrorHandler(query.error, 'Failed to load auction');

  return query;
}

/**
 * Get auction statistics
 */
export function useGetAuctionStats(): UseQueryResult<AuctionStats> {
  const query = useQuery({
    queryKey: auctionKeys.stats(),
    queryFn: auctionApi.getStats,
    staleTime: 2 * 60 * 1000,
  });

  useErrorHandler(query.error, 'Failed to load auction stats');

  return query;
}

/**
 * Get bid history for an auction
 */
export function useGetAuctionBids(auctionId: number | string, page = 1, limit = 20) {
  const query = useQuery({
    queryKey: auctionKeys.bids(auctionId, page, limit),
    queryFn: () => bidApi.list(auctionId, page, limit),
    enabled: !!auctionId,
    staleTime: 10 * 1000,
  });

  useErrorHandler(query.error, 'Failed to load bids');

  return query;
}

/**
 * Get current user's bids
 */
export function useGetMyBids(page = 1, limit = 20) {
  const query = useQuery({
    queryKey: auctionKeys.myBids(page, limit),
    queryFn: () => bidApi.getMyBids(page, limit),
    staleTime: 5 * 60 * 1000,
  });

  useErrorHandler(query.error, 'Failed to load your bids');

  return query;
}

// ============================================================================
// Mutation Hooks
// ============================================================================

/**
 * Create a new auction
 */
export function useCreateAuction() {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: (input: AuctionCreateInput) => auctionApi.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: auctionKeys.lists() });
      queryClient.invalidateQueries({ queryKey: auctionKeys.stats() });
      toast.success('Auction created successfully');
    },
    onError: (error: any) => {
      toast.error(`Failed to create auction: ${error.message || 'Unknown error'}`, 8000);
    },
  });
}

/**
 * Update an existing auction
 */
export function useUpdateAuction() {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: (input: AuctionUpdateInput) => auctionApi.update(Number(input.id), input),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: auctionKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: auctionKeys.lists() });
      queryClient.invalidateQueries({ queryKey: auctionKeys.stats() });
      toast.success('Auction updated successfully');
    },
    onError: (error: any) => {
      toast.error(`Failed to update auction: ${error.message || 'Unknown error'}`, 8000);
    },
  });
}

/**
 * Delete an auction
 */
export function useDeleteAuction() {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: (id: number) => auctionApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: auctionKeys.lists() });
      queryClient.invalidateQueries({ queryKey: auctionKeys.stats() });
      toast.success('Auction deleted successfully');
    },
    onError: (error: any) => {
      toast.error(`Failed to delete auction: ${error.message || 'Unknown error'}`, 8000);
    },
  });
}

/**
 * Place a bid
 */
export function usePlaceBid() {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: (input: BidCreateInput & { auctionId: number }) => 
      bidApi.create(input),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: auctionKeys.detail(variables.auctionId) });
      queryClient.invalidateQueries({ queryKey: [...auctionKeys.all, 'bids', variables.auctionId] });
      toast.success('Bid placed successfully');
    },
    onError: (error: any) => {
      toast.error(`Failed to place bid: ${error.message || 'Unknown error'}`, 8000);
    },
  });
}

/**
 * Toggle watch status
 */
export function useToggleWatch() {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: ({ auctionId, isLiked }: { auctionId: number, isLiked: boolean }) => 
      auctionApi.toggleWatch(auctionId, isLiked),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: auctionKeys.detail(variables.auctionId) });
      toast.success(variables.isLiked ? 'Removed from watchlist' : 'Added to watchlist');
    },
    onError: (error: any) => {
      toast.error(`Failed to update watchlist: ${error.message || 'Unknown error'}`, 8000);
    },
  });
}
