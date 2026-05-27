import { useQuery, useMutation, keepPreviousData } from '@tanstack/react-query';
import { useErrorHandler } from '@core/hooks';
import { useMutationContext } from '@core/hooks/useMutationContext';
import { moderationService } from '../services/moderationService';
import type { PendingResponse } from '../services/moderationService';

export const moderationKeys = {
  all: ['moderation-approval'] as const,
  pending: () => [...moderationKeys.all, 'pending'] as const,
};

export function usePendingItems() {
  const query = useQuery<PendingResponse>({
    queryKey: moderationKeys.pending(),
    queryFn: () => moderationService.getPending(),
    staleTime: 30 * 1000,
    refetchInterval: (q) => (q.state.status === 'error' ? false : 60 * 1000),
    placeholderData: keepPreviousData,
  });

  useErrorHandler(query.error, 'Failed to load pending items');
  return query;
}

export function useApproveListing() {
  const { queryClient, toast, t, getErrorDetail } = useMutationContext();

  return useMutation({
    mutationFn: (id: number | string) => moderationService.approveListing(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: moderationKeys.pending() });
      toast.success(t('approval.messages.approved'));
    },
    onError: (error: unknown) => {
      toast.error(`${t('toast.moderation.listing_approve_failed')}: ${getErrorDetail(error)}`, 8000);
    },
  });
}

export function useRejectListing() {
  const { queryClient, toast, t, getErrorDetail } = useMutationContext();

  return useMutation({
    mutationFn: ({ id, reason }: { id: number | string; reason: string }) =>
      moderationService.rejectListing(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: moderationKeys.pending() });
      toast.success(t('approval.messages.rejected'));
    },
    onError: (error: unknown) => {
      toast.error(`${t('toast.moderation.listing_reject_failed')}: ${getErrorDetail(error)}`, 8000);
    },
  });
}

export function useRequestChangesListing() {
  const { queryClient, toast, t, getErrorDetail } = useMutationContext();

  return useMutation({
    mutationFn: ({ id, reason }: { id: number | string; reason: string }) =>
      moderationService.requestChangesListing(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: moderationKeys.pending() });
      toast.success(t('approval.messages.changes_requested'));
    },
    onError: (error: unknown) => {
      toast.error(`${t('toast.moderation.listing_changes_failed')}: ${getErrorDetail(error)}`, 8000);
    },
  });
}

export function useApproveAuction() {
  const { queryClient, toast, t, getErrorDetail } = useMutationContext();

  return useMutation({
    mutationFn: (id: number | string) => moderationService.approveAuction(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: moderationKeys.pending() });
      toast.success(t('approval.messages.approved'));
    },
    onError: (error: unknown) => {
      const detail = getErrorDetail(error);
      const friendly = detail.includes('already approved')
        ? t('moderation.approval.error_already_approved')
        : detail;
      toast.error(`${t('moderation.approval.error_approve_auction')}: ${friendly}`, 8000);
    },
  });
}

export function useRejectAuction() {
  const { queryClient, toast, t, getErrorDetail } = useMutationContext();

  return useMutation({
    mutationFn: ({ id, reason }: { id: number | string; reason: string }) =>
      moderationService.rejectAuction(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: moderationKeys.pending() });
      toast.success(t('toast.moderation.auction_rejected'));
    },
    onError: (error: unknown) => {
      toast.error(`${t('toast.moderation.auction_reject_failed')}: ${getErrorDetail(error)}`, 8000);
    },
  });
}

export function useRequestChangesAuction() {
  const { queryClient, toast, t, getErrorDetail } = useMutationContext();

  return useMutation({
    mutationFn: ({ id, reason }: { id: number | string; reason: string }) =>
      moderationService.requestChangesAuction(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: moderationKeys.pending() });
      toast.success(t('toast.moderation.auction_changes_requested'));
    },
    onError: (error: unknown) => {
      toast.error(`${t('toast.moderation.auction_changes_failed')}: ${getErrorDetail(error)}`, 8000);
    },
  });
}
