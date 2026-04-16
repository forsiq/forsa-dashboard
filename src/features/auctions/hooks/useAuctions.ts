/**
 * useAuctions Hook
 *
 * Fetches and manages auction listings
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { auctionApi } from '../api/auction-api';
import type { AuctionFilters, AuctionCreateInput, AuctionUpdateInput } from '../types/auction.types';

// Query keys
export const auctionKeys = {
  all: ['auctions'] as const,
  lists: () => [...auctionKeys.all, 'list'] as const,
  list: (filters: AuctionFilters) => [...auctionKeys.lists(), filters] as const,
  details: () => [...auctionKeys.all, 'detail'] as const,
  detail: (id: number) => [...auctionKeys.details(), id] as const,
  stats: () => [...auctionKeys.all, 'stats'] as const,
  watched: () => [...auctionKeys.all, 'watched'] as const,
  bids: (auctionId: number) => [...auctionKeys.all, 'bids', auctionId] as const,
};

/**
 * Fetch all auctions
 */
export const useAuctions = (filters?: AuctionFilters) => {
  return useQuery({
    queryKey: auctionKeys.list(filters || {}),
    queryFn: () => auctionApi.list(filters),
    staleTime: 30_000, // 30 seconds
  });
};

/**
 * Fetch single auction by ID
 */
export const useAuction = (id: number) => {
  return useQuery({
    queryKey: auctionKeys.detail(id),
    queryFn: () => auctionApi.get(id),
    enabled: !!id,
    staleTime: 10_000, // 10 seconds
  });
};

/**
 * Fetch auction by slug
 */
export const useAuctionBySlug = (slug: string) => {
  return useQuery({
    queryKey: [...auctionKeys.all, 'slug', slug],
    queryFn: () => auctionApi.getBySlug(slug),
    enabled: !!slug,
    staleTime: 10_000,
  });
};

/**
 * Create auction mutation
 */
export const useCreateAuction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: AuctionCreateInput) => auctionApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: auctionKeys.lists() });
    },
  });
};

/**
 * Update auction mutation
 */
export const useUpdateAuction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: AuctionUpdateInput }) =>
      auctionApi.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: auctionKeys.lists() });
      queryClient.invalidateQueries({ queryKey: auctionKeys.detail(id) });
    },
  });
};

/**
 * Delete auction mutation
 */
export const useDeleteAuction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => auctionApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: auctionKeys.lists() });
    },
  });
};

/**
 * Fetch auction statistics
 */
export const useAuctionStats = () => {
  return useQuery({
    queryKey: auctionKeys.stats(),
    queryFn: () => auctionApi.getStats(),
    staleTime: 60_000, // 1 minute
    refetchInterval: 60_000, // Refetch every minute
  });
};

/**
 * Fetch watched auctions
 */
export const useWatchedAuctions = () => {
  return useQuery({
    queryKey: auctionKeys.watched(),
    queryFn: () => auctionApi.getWatched(),
    staleTime: 30_000,
  });
};

/**
 * Toggle watch status mutation
 */
export const useToggleWatch = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (auctionId: number) => auctionApi.toggleWatch(auctionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: auctionKeys.watched() });
      queryClient.invalidateQueries({ queryKey: auctionKeys.lists() });
    },
  });
};

/**
 * Fetch bids for an auction
 */
export const useAuctionBids = (auctionId: number) => {
  return useQuery({
    queryKey: auctionKeys.bids(auctionId),
    queryFn: () => auctionApi.getBids(auctionId),
    enabled: !!auctionId,
    staleTime: 5_000, // 5 seconds - bids change frequently
    refetchInterval: 10_000, // Refetch every 10 seconds for live updates
  });
};

/**
 * Place bid mutation
 */
export const usePlaceBid = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ auctionId, amount, maxAmount, isAutoBid }: {
      auctionId: number;
      amount: number;
      maxAmount?: number;
      isAutoBid?: boolean;
    }) => auctionApi.placeBid(auctionId, { auctionId, amount, maxAmount, isAutoBid }),
    onSuccess: (_, { auctionId }) => {
      queryClient.invalidateQueries({ queryKey: auctionKeys.detail(auctionId) });
      queryClient.invalidateQueries({ queryKey: auctionKeys.bids(auctionId) });
      queryClient.invalidateQueries({ queryKey: auctionKeys.lists() });
    },
  });
};
