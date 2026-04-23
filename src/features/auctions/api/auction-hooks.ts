/**
 * Auction REST API React Query Hooks
 * Comprehensive implementation for Forsa Auctions
 */

import { useQuery, useMutation, useQueryClient, type UseQueryResult } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { useToast } from '@core/contexts/ToastContext';
import { useErrorHandler } from '@core/hooks';
import Cookies from 'js-cookie';
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

/**
 * Check if user is authenticated (cookie + localStorage, same as ApiClientFactory)
 */
function hasAuthToken(): boolean {
  if (typeof window === 'undefined') return false;
  const cookieToken = Cookies.get('access');
  if (cookieToken) return true;
  try { return !!localStorage.getItem('access_token'); } catch { return false; }
}

/**
 * Reactive hook that tracks auth token availability.
 * Re-evaluates when cookie/localStorage changes.
 */
function useIsAuthenticated(): boolean {
  const [authenticated, setAuthenticated] = useState(() => hasAuthToken());

  useEffect(() => {
    const check = () => setAuthenticated(hasAuthToken());
    // Check on mount and on storage events (cross-tab) and focus (same-tab after login)
    check();
    window.addEventListener('storage', check);
    window.addEventListener('focus', check);
    // Also poll every 2 seconds for same-tab cookie changes
    const interval = setInterval(check, 2000);
    return () => {
      window.removeEventListener('storage', check);
      window.removeEventListener('focus', check);
      clearInterval(interval);
    };
  }, []);

  return authenticated;
}

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
  watched: () => [...auctionKeys.all, 'watched'] as const,
  slug: (slug: string) => [...auctionKeys.all, 'slug', slug] as const,
};

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
    refetchInterval: 60 * 1000,
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
 * Get current user's bids (requires auth)
 */
export function useGetMyBids(page = 1, limit = 20) {
  const isAuthenticated = useIsAuthenticated();
  const query = useQuery({
    queryKey: auctionKeys.myBids(page, limit),
    queryFn: () => bidApi.getMyBids(page, limit),
    enabled: isAuthenticated,
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
      queryClient.invalidateQueries({ queryKey: auctionKeys.watched() });
      toast.success(variables.isLiked ? 'Removed from watchlist' : 'Added to watchlist');
    },
    onError: (error: any) => {
      toast.error(`Failed to update watchlist: ${error.message || 'Unknown error'}`, 8000);
    },
  });
}

// ============================================================================
// Additional Hooks (merged from useAuctions.ts)
// ============================================================================

/**
 * Get auction by slug
 */
export function useAuctionBySlug(slug: string) {
  const query = useQuery({
    queryKey: auctionKeys.slug(slug),
    queryFn: () => auctionApi.getBySlug(slug),
    enabled: !!slug,
    staleTime: 10 * 1000,
  });

  useErrorHandler(query.error, 'Failed to load auction');

  return query;
}

/**
 * Get watched auctions (requires auth)
 */
export function useWatchedAuctions() {
  const isAuthenticated = useIsAuthenticated();
  const query = useQuery({
    queryKey: auctionKeys.watched(),
    queryFn: () => auctionApi.getWatched(),
    enabled: isAuthenticated,
    staleTime: 30 * 1000,
  });

  useErrorHandler(query.error, 'Failed to load watched auctions');

  return query;
}

// ============================================================================
// Lifecycle Hooks
// ============================================================================

function createLifecycleHook(
  action: (id: number | string) => Promise<Auction>,
  successMessage: string,
  errorMessage: string,
) {
  return function useLifecycleAction() {
    const queryClient = useQueryClient();
    const toast = useToast();

    return useMutation({
      mutationFn: (id: number | string) => action(id),
      onSuccess: (data) => {
        queryClient.invalidateQueries({ queryKey: auctionKeys.detail(data.id) });
        queryClient.invalidateQueries({ queryKey: auctionKeys.lists() });
        queryClient.invalidateQueries({ queryKey: auctionKeys.stats() });
        toast.success(successMessage);
      },
      onError: (error: any) => {
        toast.error(`${errorMessage}: ${error.message || 'Unknown error'}`, 8000);
      },
    });
  };
}

export const useStartAuction = createLifecycleHook(
  auctionApi.start.bind(auctionApi),
  'Auction started successfully',
  'Failed to start auction',
);

export const usePauseAuction = createLifecycleHook(
  auctionApi.pause.bind(auctionApi),
  'Auction paused successfully',
  'Failed to pause auction',
);

export const useResumeAuction = createLifecycleHook(
  auctionApi.resume.bind(auctionApi),
  'Auction resumed successfully',
  'Failed to resume auction',
);

export const useEndAuction = createLifecycleHook(
  auctionApi.end.bind(auctionApi),
  'Auction ended successfully',
  'Failed to end auction',
);

export const useCancelAuction = createLifecycleHook(
  auctionApi.cancel.bind(auctionApi),
  'Auction cancelled successfully',
  'Failed to cancel auction',
);

export const useBuyNow = createLifecycleHook(
  auctionApi.buyNow.bind(auctionApi),
  'Auction purchased successfully',
  'Failed to purchase auction',
);
