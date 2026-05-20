import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { useToast } from '@core/contexts/ToastContext';
import { useErrorHandler } from '@core/hooks';
import { useMapApiValidationError } from '@core/hooks/useMapApiValidationError';
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
  const queryClient = useQueryClient();
  const toast = useToast();
  const mapApiError = useMapApiValidationError();

  return useMutation({
    mutationFn: (id: number | string) => moderationService.approveListing(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: moderationKeys.pending() });
      toast.success('Listing approved successfully');
    },
    onError: (error: any) => {
      const detail = mapApiError(error) || error?.message || 'Unknown error';
      toast.error(`Failed to approve listing: ${detail}`, 8000);
    },
  });
}

export function useRejectListing() {
  const queryClient = useQueryClient();
  const toast = useToast();
  const mapApiError = useMapApiValidationError();

  return useMutation({
    mutationFn: ({ id, reason }: { id: number | string; reason: string }) =>
      moderationService.rejectListing(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: moderationKeys.pending() });
      toast.success('Listing rejected');
    },
    onError: (error: any) => {
      const detail = mapApiError(error) || error?.message || 'Unknown error';
      toast.error(`Failed to reject listing: ${detail}`, 8000);
    },
  });
}

export function useRequestChangesListing() {
  const queryClient = useQueryClient();
  const toast = useToast();
  const mapApiError = useMapApiValidationError();

  return useMutation({
    mutationFn: ({ id, reason }: { id: number | string; reason: string }) =>
      moderationService.requestChangesListing(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: moderationKeys.pending() });
      toast.success('Changes requested for listing');
    },
    onError: (error: any) => {
      const detail = mapApiError(error) || error?.message || 'Unknown error';
      toast.error(`Failed to request changes: ${detail}`, 8000);
    },
  });
}

export function useApproveAuction() {
  const queryClient = useQueryClient();
  const toast = useToast();
  const mapApiError = useMapApiValidationError();

  return useMutation({
    mutationFn: (id: number | string) => moderationService.approveAuction(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: moderationKeys.pending() });
      toast.success('Auction approved successfully');
    },
    onError: (error: any) => {
      const detail = mapApiError(error) || error?.message || 'Unknown error';
      toast.error(`Failed to approve auction: ${detail}`, 8000);
    },
  });
}

export function useRejectAuction() {
  const queryClient = useQueryClient();
  const toast = useToast();
  const mapApiError = useMapApiValidationError();

  return useMutation({
    mutationFn: ({ id, reason }: { id: number | string; reason: string }) =>
      moderationService.rejectAuction(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: moderationKeys.pending() });
      toast.success('Auction rejected');
    },
    onError: (error: any) => {
      const detail = mapApiError(error) || error?.message || 'Unknown error';
      toast.error(`Failed to reject auction: ${detail}`, 8000);
    },
  });
}

export function useRequestChangesAuction() {
  const queryClient = useQueryClient();
  const toast = useToast();
  const mapApiError = useMapApiValidationError();

  return useMutation({
    mutationFn: ({ id, reason }: { id: number | string; reason: string }) =>
      moderationService.requestChangesAuction(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: moderationKeys.pending() });
      toast.success('Changes requested for auction');
    },
    onError: (error: any) => {
      const detail = mapApiError(error) || error?.message || 'Unknown error';
      toast.error(`Failed to request changes: ${detail}`, 8000);
    },
  });
}
