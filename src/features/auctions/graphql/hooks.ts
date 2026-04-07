/**
 * Auction GraphQL React Query Hooks
 * Uses 'auction' service
 */

import { useQuery, useMutation, useQueryClient, type UseQueryResult } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useToast } from '@core/contexts/ToastContext';
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
  const toast = useToast();
  const query = useQuery({
    queryKey: api.auctionGraphQLKeys.list(filters),
    queryFn: () => api.getAuctions(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Show toast on error (React Query v5 pattern)
  useEffect(() => {
    if (query.error) {
      toast.error(`Failed to load auctions: ${query.error.message}`, 8000);
    }
  }, [query.error, toast]);

  return query;
}

/**
 * Get a single auction by ID or slug
 */
export function useGetAuction(id: number | string, enabled = true): UseQueryResult<Auction> {
  const toast = useToast();
  const query = useQuery({
    queryKey: api.auctionGraphQLKeys.detail(id),
    queryFn: () => api.getAuction(id),
    enabled: enabled && !!id,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  // Show toast on error
  useEffect(() => {
    if (query.error && enabled && id) {
      toast.error(`Failed to load auction: ${query.error.message}`, 8000);
    }
  }, [query.error, enabled, id, toast]);

  return query;
}

/**
 * Get auction statistics
 */
export function useGetAuctionStats(): UseQueryResult<AuctionStats> {
  const toast = useToast();
  const query = useQuery({
    queryKey: api.auctionGraphQLKeys.stats(),
    queryFn: api.getAuctionStats,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  // Show toast on error
  useEffect(() => {
    if (query.error) {
      toast.error(`Failed to load auction stats: ${query.error.message}`, 8000);
    }
  }, [query.error, toast]);

  return query;
}

/**
 * Get bid history for an auction
 */
export function useGetAuctionBids(auctionId: number | string, page = 1, limit = 20) {
  const toast = useToast();
  const query = useQuery({
    queryKey: [...api.auctionGraphQLKeys.bids(auctionId), page, limit],
    queryFn: () => api.getAuctionBids(auctionId, page, limit),
    enabled: !!auctionId,
    staleTime: 10 * 1000, // 10 seconds for real-time history
  });

  // Show toast on error
  useEffect(() => {
    if (query.error && auctionId) {
      toast.error(`Failed to load bids: ${query.error.message}`, 8000);
    }
  }, [query.error, auctionId, toast]);

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
    mutationFn: (input: AuctionCreateInput) => api.createAuction(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: api.auctionGraphQLKeys.lists() });
      queryClient.invalidateQueries({ queryKey: api.auctionGraphQLKeys.stats() });
      toast.success('Auction created successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to create auction: ${error.message}`, 8000);
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
    mutationFn: (input: AuctionUpdateInput) => api.updateAuction(input.id, input),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: api.auctionGraphQLKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: api.auctionGraphQLKeys.lists() });
      queryClient.invalidateQueries({ queryKey: api.auctionGraphQLKeys.stats() });
      toast.success('Auction updated successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update auction: ${error.message}`, 8000);
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
    mutationFn: (id: number | string) => api.deleteAuction(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: api.auctionGraphQLKeys.lists() });
      queryClient.invalidateQueries({ queryKey: api.auctionGraphQLKeys.stats() });
      toast.success('Auction deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete auction: ${error.message}`, 8000);
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
    mutationFn: (input: BidCreateInput) => api.placeBid(input),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: api.auctionGraphQLKeys.detail(variables.auctionId!) });
      queryClient.invalidateQueries({ queryKey: api.auctionGraphQLKeys.bids(variables.auctionId!) });
      toast.success('Bid placed successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to place bid: ${error.message}`, 8000);
    },
  });
}
