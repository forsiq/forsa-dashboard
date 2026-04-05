/**
 * Auction GraphQL React Query Hooks
 * Uses 'auction' service
 */

import { useQuery, useMutation, useQueryClient, type UseQueryResult } from '@tanstack/react-query';
import * as api from './api';
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
// Query Hooks
// ============================================================================

/**
 * Get paginated list of auctions
 */
export function useGetAuctions(filters: AuctionFilters = {}): UseQueryResult<AuctionsResponse> {
  return useQuery({
    queryKey: api.auctionGraphQLKeys.list(filters),
    queryFn: () => api.getAuctions(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Get a single auction by ID or slug
 */
export function useGetAuction(id: number | string, enabled = true): UseQueryResult<Auction> {
  return useQuery({
    queryKey: api.auctionGraphQLKeys.detail(id),
    queryFn: () => api.getAuction(id),
    enabled: enabled && !!id,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Get auction statistics
 */
export function useGetAuctionStats(): UseQueryResult<AuctionStats> {
  return useQuery({
    queryKey: api.auctionGraphQLKeys.stats(),
    queryFn: api.getAuctionStats,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

/**
 * Get bid history for an auction
 */
export function useGetAuctionBids(auctionId: number | string, page = 1, limit = 20) {
  return useQuery({
    queryKey: [...api.auctionGraphQLKeys.bids(auctionId), page, limit],
    queryFn: () => api.getAuctionBids(auctionId, page, limit),
    enabled: !!auctionId,
    staleTime: 10 * 1000, // 10 seconds for real-time history
  });
}

// ============================================================================
// Mutation Hooks
// ============================================================================

/**
 * Create a new auction
 */
export function useCreateAuction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: AuctionCreateInput) => api.createAuction(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: api.auctionGraphQLKeys.lists() });
      queryClient.invalidateQueries({ queryKey: api.auctionGraphQLKeys.stats() });
    },
  });
}

/**
 * Update an existing auction
 */
export function useUpdateAuction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: AuctionUpdateInput) => api.updateAuction(input.id, input),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: api.auctionGraphQLKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: api.auctionGraphQLKeys.lists() });
      queryClient.invalidateQueries({ queryKey: api.auctionGraphQLKeys.stats() });
    },
  });
}

/**
 * Delete an auction
 */
export function useDeleteAuction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number | string) => api.deleteAuction(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: api.auctionGraphQLKeys.lists() });
      queryClient.invalidateQueries({ queryKey: api.auctionGraphQLKeys.stats() });
    },
  });
}

/**
 * Place a bid
 */
export function usePlaceBid() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: BidCreateInput) => api.placeBid(input),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: api.auctionGraphQLKeys.detail(variables.auctionId!) });
      queryClient.invalidateQueries({ queryKey: api.auctionGraphQLKeys.bids(variables.auctionId!) });
    },
  });
}
