import { useRef, useEffect } from 'react';
import { useQuery, useMutation, keepPreviousData } from '@tanstack/react-query';
import { useMutationContext } from '@core/hooks/useMutationContext';
import { moderationService } from '../services/moderationService';
import type { PendingResponse } from '../services/moderationService';
import { useLanguage } from '@core/contexts/LanguageContext';

export const moderationKeys = {
  all: ['moderation-approval'] as const,
  pending: () => [...moderationKeys.all, 'pending'] as const,
};

export function usePendingItems() {
  const { t } = useLanguage();
  const { toast } = useMutationContext();
  const lastErrorRef = useRef<string | null>(null);

  const query = useQuery<PendingResponse>({
    queryKey: moderationKeys.pending(),
    queryFn: () => moderationService.getPending(),
    staleTime: 30 * 1000,
    refetchInterval: (q) => (q.state.status === 'error' ? false : 60 * 1000),
    placeholderData: keepPreviousData,
  });

  useEffect(() => {
    if (query.error) {
      const errorMsg = (query.error as any)?.message || (query.error as any)?.error || 'Unknown error';
      const errorKey = `pending:${errorMsg}`;
      if (lastErrorRef.current !== errorKey) {
        lastErrorRef.current = errorKey;
        toast.error(`${t('moderation.approval.error_load_pending')}: ${errorMsg}`, 8000);
      }
    } else {
      lastErrorRef.current = null;
    }
  }, [query.error, t, toast]);

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
