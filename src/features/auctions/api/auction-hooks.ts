/**
 * Auction REST API React Query Hooks
 * Comprehensive implementation for Forsa Auctions
 */

import { useQuery, useMutation, useQueryClient, type UseQueryResult, keepPreviousData } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { useToast } from '@core/contexts/ToastContext';
import { useLanguage } from '@core/contexts/LanguageContext';
import { useErrorHandler } from '@core/hooks';
import { useMapApiValidationError } from '@core/hooks/useMapApiValidationError';
import Cookies from 'js-cookie';
import { auctionApi, bidApi, liveMonitorApi, settlementApi, moderationApi } from './auction-api';
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
import type { SettlementsResponse, AllBidsResponse } from './auction-api';

/**
 * Check if user is authenticated (cookie + localStorage, same as ApiClientFactory)
 */
function hasAuthToken(): boolean {
  if (typeof window === 'undefined') return false;
  const cookieToken = Cookies.get('access');
  if (cookieToken) return true;
  try { return !!localStorage.getItem('access_token'); } catch { return false; }
}

// Shared module-level state to avoid duplicate listeners
let _authState = false;
let _listenerCount = 0;
let _sharedCheck: (() => void) | null = null;

function getSharedAuthState(): boolean {
  if (typeof window !== 'undefined' && _listenerCount === 0) {
    _authState = hasAuthToken();
  }
  return _authState;
}

/**
 * Reactive hook that tracks auth token availability.
 * Uses shared module-level listeners to avoid duplicates.
 */
function useIsAuthenticated(): boolean {
  const [authenticated, setAuthenticated] = useState(() => getSharedAuthState());

  useEffect(() => {
    _listenerCount++;
    if (!_sharedCheck) {
      _sharedCheck = () => {
        _authState = hasAuthToken();
      };
    }

    const check = () => {
      _sharedCheck!();
      setAuthenticated(_authState);
    };

    check();
    window.addEventListener('storage', check);
    window.addEventListener('focus', check);
    return () => {
      _listenerCount--;
      window.removeEventListener('storage', check);
      window.removeEventListener('focus', check);
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
    queryFn: ({ signal }) => auctionApi.list(filters, signal),
    staleTime: 5 * 60 * 1000,
    placeholderData: keepPreviousData,
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
    refetchInterval: (_q) => document.visibilityState === 'visible' ? 60 * 1000 : false,
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
  const mapApiError = useMapApiValidationError();
  const { t } = useLanguage();

  return useMutation({
    mutationFn: (input: AuctionCreateInput) => auctionApi.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: auctionKeys.lists() });
      queryClient.invalidateQueries({ queryKey: auctionKeys.stats() });
      toast.success(t('toast.auction.created'));
    },
    onError: (error: any) => {
      const detail = mapApiError(error) || error?.message || t('toast.unknown_error');
      toast.error(t('toast.auction.create_failed', { detail }), 8000);
    },
  });
}

/**
 * Update an existing auction
 */
export function useUpdateAuction() {
  const queryClient = useQueryClient();
  const toast = useToast();
  const mapApiError = useMapApiValidationError();
  const { t } = useLanguage();

  return useMutation({
    mutationFn: (input: AuctionUpdateInput) => auctionApi.update(Number(input.id), input),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: auctionKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: auctionKeys.lists() });
      queryClient.invalidateQueries({ queryKey: auctionKeys.stats() });
      toast.success(t('toast.auction.updated'));
    },
    onError: (error: any) => {
      const detail = mapApiError(error) || error?.message || t('toast.unknown_error');
      toast.error(t('toast.auction.update_failed', { detail }), 8000);
    },
  });
}

/**
 * Delete an auction
 */
export function useDeleteAuction() {
  const queryClient = useQueryClient();
  const toast = useToast();
  const mapApiError = useMapApiValidationError();
  const { t } = useLanguage();

  return useMutation({
    mutationFn: (id: number) => auctionApi.delete(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: auctionKeys.all });
      const previousData = queryClient.getQueriesData<AuctionsResponse>({ queryKey: auctionKeys.lists() });
      queryClient.setQueriesData<AuctionsResponse>({ queryKey: auctionKeys.lists() }, (old) => {
        if (!old || !Array.isArray(old.data)) return old;
        return {
          ...old,
          data: old.data.filter((auction) => auction.id !== id),
          total: Math.max(0, (old.total ?? old.data.length) - 1),
        };
      });
      return { previousData };
    },
    onError: (error: any, _id, context) => {
      if (context?.previousData) {
        context.previousData.forEach(([key, data]) => {
          queryClient.setQueryData(key, data);
        });
      }
      const detail = mapApiError(error) || error?.message || t('toast.unknown_error');
      toast.error(t('toast.auction.delete_failed', { detail }), 8000);
    },
    onSuccess: async (_data, id) => {
      queryClient.removeQueries({ queryKey: auctionKeys.detail(id) });
      queryClient.setQueriesData<AuctionsResponse>({ queryKey: auctionKeys.lists() }, (old) => {
        if (!old || !Array.isArray(old.data)) return old;
        return {
          ...old,
          data: old.data.filter((auction) => auction.id !== id),
          total: Math.max(0, (old.total ?? old.data.length) - 1),
        };
      });
      await queryClient.invalidateQueries({ queryKey: auctionKeys.lists() });
      await queryClient.invalidateQueries({ queryKey: auctionKeys.stats() });
      toast.success(t('toast.auction.deleted'));
    },
  });
}

/**
 * Place a bid
 */
export function usePlaceBid() {
  const queryClient = useQueryClient();
  const toast = useToast();
  const mapApiError = useMapApiValidationError();
  const { t } = useLanguage();

  return useMutation({
    mutationFn: (input: BidCreateInput & { auctionId: number }) => 
      bidApi.create(input),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: auctionKeys.detail(variables.auctionId) });
      queryClient.invalidateQueries({ queryKey: [...auctionKeys.all, 'bids', variables.auctionId] });
      toast.success(t('toast.auction.bid_placed'));
    },
    onError: (error: any) => {
      const detail = mapApiError(error) || error?.message || t('toast.unknown_error');
      toast.error(t('toast.auction.bid_failed', { detail }), 8000);
    },
  });
}

/**
 * Toggle watch status (optimistic update on detail + watched caches)
 */
export function useToggleWatch() {
  const queryClient = useQueryClient();
  const toast = useToast();
  const mapApiError = useMapApiValidationError();
  const { t } = useLanguage();

  return useMutation({
    mutationFn: ({ auctionId, isLiked }: { auctionId: number; isLiked: boolean }) =>
      auctionApi.toggleWatch(auctionId, isLiked),
    onMutate: async ({ auctionId, isLiked }) => {
      const nextWatched = !isLiked;

      await queryClient.cancelQueries({ queryKey: auctionKeys.detail(auctionId) });
      await queryClient.cancelQueries({ queryKey: auctionKeys.watched() });

      const previousDetail = queryClient.getQueryData<Auction>(auctionKeys.detail(auctionId));
      const previousWatched = queryClient.getQueryData<Auction[]>(auctionKeys.watched());

      if (previousDetail) {
        queryClient.setQueryData<Auction>(auctionKeys.detail(auctionId), {
          ...previousDetail,
          isWatched: nextWatched,
        });
      }

      if (previousWatched) {
        if (nextWatched && previousDetail && !previousWatched.some((a) => a.id === auctionId)) {
          queryClient.setQueryData<Auction[]>(auctionKeys.watched(), [
            ...previousWatched,
            { ...previousDetail, isWatched: true },
          ]);
        } else if (!nextWatched) {
          queryClient.setQueryData<Auction[]>(
            auctionKeys.watched(),
            previousWatched.filter((a) => a.id !== auctionId),
          );
        }
      }

      return { previousDetail, previousWatched };
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: auctionKeys.detail(variables.auctionId) });
      queryClient.invalidateQueries({ queryKey: auctionKeys.watched() });
      queryClient.invalidateQueries({ queryKey: auctionKeys.lists() });
      toast.success(
        variables.isLiked
          ? t('auction.watchlist.removed')
          : t('auction.watchlist.added'),
      );
    },
    onError: (error: unknown, variables, context) => {
      if (context?.previousDetail) {
        queryClient.setQueryData(auctionKeys.detail(variables.auctionId), context.previousDetail);
      }
      if (context?.previousWatched) {
        queryClient.setQueryData(auctionKeys.watched(), context.previousWatched);
      }
      const detail = mapApiError(error) || (error as Error)?.message || t('toast.unknown_error');
      toast.error(
        `${t('auction.watchlist.update_failed')}: ${detail}`,
        8000,
      );
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
  successKey: string,
  errorKey: string,
) {
  return function useLifecycleAction() {
    const queryClient = useQueryClient();
    const toast = useToast();
    const mapApiError = useMapApiValidationError();
    const { t } = useLanguage();

    return useMutation({
      mutationFn: (id: number | string) => action(id),
      onSuccess: (data) => {
        queryClient.invalidateQueries({ queryKey: auctionKeys.detail(data.id) });
        queryClient.invalidateQueries({ queryKey: auctionKeys.lists() });
        queryClient.invalidateQueries({ queryKey: auctionKeys.stats() });
        toast.success(t(successKey));
      },
      onError: (error: any) => {
        const detail = mapApiError(error) || error?.message || t('toast.unknown_error');
        toast.error(`${t(errorKey)}: ${detail}`, 8000);
      },
    });
  };
}

export const useStartAuction = createLifecycleHook(
  auctionApi.start.bind(auctionApi),
  'toast.auction.started',
  'toast.auction.start_failed',
);

export const usePauseAuction = createLifecycleHook(
  auctionApi.pause.bind(auctionApi),
  'toast.auction.paused',
  'toast.auction.pause_failed',
);

export const useResumeAuction = createLifecycleHook(
  auctionApi.resume.bind(auctionApi),
  'toast.auction.resumed',
  'toast.auction.resume_failed',
);

export const useEndAuction = createLifecycleHook(
  auctionApi.end.bind(auctionApi),
  'toast.auction.ended',
  'toast.auction.end_failed',
);

export const useCancelAuction = createLifecycleHook(
  auctionApi.cancel.bind(auctionApi),
  'toast.auction.cancelled',
  'toast.auction.cancel_failed',
);

// ============================================================================
// Live Monitor Hooks
// ============================================================================

export function useLiveStats() {
  const query = useQuery({
    queryKey: [...auctionKeys.all, 'live-stats'] as const,
    queryFn: () => liveMonitorApi.getLiveStats(),
    staleTime: 10 * 1000,
    refetchInterval: (_q) => document.visibilityState === 'visible' ? 30 * 1000 : false,
  });

  useErrorHandler(query.error, 'Failed to load live stats');

  return query;
}

export function useCriticalAuctions() {
  const query = useQuery({
    queryKey: [...auctionKeys.all, 'critical'] as const,
    queryFn: () => liveMonitorApi.getCriticalAuctions(),
    staleTime: 30 * 1000,
    refetchInterval: (_q) => document.visibilityState === 'visible' ? 60 * 1000 : false,
  });

  useErrorHandler(query.error, 'Failed to load critical auctions');

  return query;
}

export function useTickerHistory(limit = 100) {
  const query = useQuery({
    queryKey: [...auctionKeys.all, 'ticker-history', limit] as const,
    queryFn: () => liveMonitorApi.getTickerHistory(limit),
    staleTime: 10 * 1000,
  });

  useErrorHandler(query.error, 'Failed to load ticker history');

  return query;
}

export function useExtendAuction() {
  const queryClient = useQueryClient();
  const toast = useToast();
  const mapApiError = useMapApiValidationError();
  const { t } = useLanguage();

  return useMutation({
    mutationFn: ({ id, minutes }: { id: number | string; minutes?: number }) =>
      liveMonitorApi.extendAuction(id, minutes),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: auctionKeys.detail(data.id) });
      queryClient.invalidateQueries({ queryKey: auctionKeys.lists() });
      queryClient.invalidateQueries({ queryKey: [...auctionKeys.all, 'critical'] });
      queryClient.invalidateQueries({ queryKey: [...auctionKeys.all, 'live-stats'] });
      toast.success(t('toast.auction.extended'));
    },
    onError: (error: any) => {
      const detail = mapApiError(error) || error?.message || t('toast.unknown_error');
      toast.error(t('toast.auction.extend_failed', { detail }), 8000);
    },
  });
}

export function useRescheduleAuction() {
  const queryClient = useQueryClient();
  const toast = useToast();
  const mapApiError = useMapApiValidationError();
  const { t } = useLanguage();

  return useMutation({
    mutationFn: ({ id, endTime }: { id: number | string; endTime: string }) =>
      liveMonitorApi.rescheduleAuction(id, endTime),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: auctionKeys.detail(data.id), refetchType: 'all' });
      queryClient.invalidateQueries({ queryKey: auctionKeys.lists(), refetchType: 'all' });
      queryClient.invalidateQueries({ queryKey: [...auctionKeys.all, 'critical'], refetchType: 'all' });
      queryClient.invalidateQueries({ queryKey: [...auctionKeys.all, 'live-stats'], refetchType: 'all' });
      queryClient.invalidateQueries({ queryKey: auctionKeys.stats(), refetchType: 'all' });
      toast.success(t('toast.auction.rescheduled'));
    },
    onError: (error: any) => {
      const detail = mapApiError(error) || error?.message || t('toast.unknown_error');
      toast.error(t('toast.auction.reschedule_failed', { detail }), 8000);
    },
  });
}

// ============================================================================
// Settlement Hooks
// ============================================================================

export function useSettlements(filters?: { status?: string; page?: number; limit?: number }) {
  const query = useQuery({
    queryKey: [...auctionKeys.all, 'settlements', filters] as const,
    queryFn: () => settlementApi.getSettlements(filters),
    staleTime: 30 * 1000,
    // Stop polling while in error state to avoid repeated toasts / 401 noise
    refetchInterval: (q) => (q.state.status === 'error' ? false : 30 * 1000),
  });

  useErrorHandler(query.error, 'Failed to load settlements');
  return query;
}

export function useUpdatePaymentStatus() {
  const queryClient = useQueryClient();
  const toast = useToast();
  const mapApiError = useMapApiValidationError();
  const { t } = useLanguage();

  return useMutation({
    mutationFn: ({ id, paymentStatus }: { id: number | string; paymentStatus: string }) =>
      settlementApi.updatePaymentStatus(id, paymentStatus),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...auctionKeys.all, 'settlements'] });
      toast.success(t('toast.auction.payment_updated'));
    },
    onError: (error: any) => {
      const detail = mapApiError(error) || error?.message || t('toast.unknown_error');
      toast.error(t('toast.auction.payment_update_failed', { detail }), 8000);
    },
  });
}

export function useNudgeWinner() {
  const toast = useToast();
  const mapApiError = useMapApiValidationError();
  const { t } = useLanguage();

  return useMutation({
    mutationFn: (id: number | string) => settlementApi.nudgeWinner(id),
    onSuccess: (data) => {
      if (data.sent) {
        toast.success(t('toast.auction.nudge_sent'));
      } else {
        toast.warning(t('toast.auction.nudge_no_device'));
      }
    },
    onError: (error: any) => {
      const detail = mapApiError(error) || error?.message || t('toast.unknown_error');
      toast.error(t('toast.auction.nudge_failed', { detail }), 8000);
    },
  });
}

export function useOfferToUnderbidder() {
  const toast = useToast();
  const mapApiError = useMapApiValidationError();
  const { t } = useLanguage();

  return useMutation({
    mutationFn: (id: number | string) => settlementApi.offerToUnderbidder(id),
    onSuccess: (data) => {
      if (data.sent) {
        toast.success(t('toast.auction.offer_sent'));
      } else {
        toast.warning(t('toast.auction.offer_no_device'));
      }
    },
    onError: (error: any) => {
      const detail = mapApiError(error) || error?.message || t('toast.unknown_error');
      toast.error(t('toast.auction.offer_failed', { detail }), 8000);
    },
  });
}

// ============================================================================
// Moderation Hooks
// ============================================================================

export function useModerationActivity(filters?: {
  status?: string;
  search?: string;
  sortBy?: string;
  page?: number;
  limit?: number;
}) {
  const query = useQuery({
    queryKey: [...auctionKeys.all, 'moderation-activity', filters] as const,
    queryFn: () => moderationApi.getActivity(filters),
    staleTime: 15 * 1000,
    refetchInterval: (_q) => document.visibilityState === 'visible' ? 30 * 1000 : false,
  });

  useErrorHandler(query.error, 'Failed to load activity');
  return query;
}

export function useModerationActivityStats() {
  const query = useQuery({
    queryKey: [...auctionKeys.all, 'moderation-activity-stats'] as const,
    queryFn: () => moderationApi.getActivityStats(),
    staleTime: 15 * 1000,
    refetchInterval: (_q) => document.visibilityState === 'visible' ? 30 * 1000 : false,
  });

  useErrorHandler(query.error, 'Failed to load activity stats');
  return query;
}

export function useModerationTimeline(limit = 10) {
  const query = useQuery({
    queryKey: [...auctionKeys.all, 'moderation-timeline', limit] as const,
    queryFn: () => moderationApi.getTimeline(limit),
    staleTime: 10 * 1000,
    refetchInterval: (_q) => document.visibilityState === 'visible' ? 30 * 1000 : false,
  });

  useErrorHandler(query.error, 'Failed to load timeline');
  return query;
}

export function useAllBids(filters?: {
  page?: number;
  limit?: number;
  auctionId?: number;
  bidderId?: string;
  status?: string;
  minAmount?: number;
  maxAmount?: number;
}) {
  const query = useQuery({
    queryKey: [...auctionKeys.all, 'moderation-bids', filters] as const,
    queryFn: () => moderationApi.getAllBids(filters),
    staleTime: 15 * 1000,
  });

  useErrorHandler(query.error, 'Failed to load bids');
  return query;
}

export function useVoidBid() {
  const queryClient = useQueryClient();
  const toast = useToast();
  const mapApiError = useMapApiValidationError();
  const { t } = useLanguage();

  return useMutation({
    mutationFn: (bidId: number | string) => moderationApi.voidBid(bidId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...auctionKeys.all, 'moderation-bids'] });
      queryClient.invalidateQueries({ queryKey: auctionKeys.lists() });
      queryClient.invalidateQueries({ queryKey: [...auctionKeys.all, 'settlements'] });
      toast.success(t('toast.auction.bid_voided'));
    },
    onError: (error: any) => {
      const detail = mapApiError(error) || error?.message || t('toast.unknown_error');
      toast.error(t('toast.auction.bid_void_failed', { detail }), 8000);
    },
  });
}

export function useSuspendUser() {
  const queryClient = useQueryClient();
  const toast = useToast();
  const mapApiError = useMapApiValidationError();
  const { t } = useLanguage();

  return useMutation({
    mutationFn: (userId: string) => moderationApi.suspendUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...auctionKeys.all, 'moderation-bids'] });
      toast.success(t('toast.auction.user_suspended'));
    },
    onError: (error: any) => {
      const detail = mapApiError(error) || error?.message || t('toast.unknown_error');
      toast.error(t('toast.auction.suspend_failed', { detail }), 8000);
    },
  });
}

export function useUnsuspendUser() {
  const toast = useToast();
  const mapApiError = useMapApiValidationError();
  const { t } = useLanguage();

  return useMutation({
    mutationFn: (userId: string) => moderationApi.unsuspendUser(userId),
    onSuccess: () => {
      toast.success(t('toast.auction.user_unsuspended'));
    },
    onError: (error: any) => {
      const detail = mapApiError(error) || error?.message || t('toast.unknown_error');
      toast.error(t('toast.auction.unsuspend_failed', { detail }), 8000);
    },
  });
}

export function useSubmitAuctionForReview() {
  const queryClient = useQueryClient();
  const toast = useToast();
  const { t } = useLanguage();
  const mapApiError = useMapApiValidationError();

  return useMutation({
    mutationFn: (id: number | string) => auctionApi.submitForReview(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: auctionKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: auctionKeys.lists() });
      toast.success(t('approval.messages.submitted'));
    },
    onError: (error: unknown) => {
      const detail = mapApiError(error) || (error as any)?.message || t('toast.unknown_error');
      toast.error(detail, 8000);
    },
  });
}
