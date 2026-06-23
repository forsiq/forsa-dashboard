import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
  type UseQueryResult,
} from '@tanstack/react-query';
import { useToast } from '@core/contexts/ToastContext';
import { useErrorHandler } from '@core/hooks';
import { merchantApplicationsService } from '../services/merchantApplicationsService';
import type {
  MerchantApplication,
  MerchantApplicationsResponse,
  MerchantApplicationFilters,
} from '../services/merchantApplicationsService';

export const merchantAppKeys = {
  all: ['merchant-applications'] as const,
  lists: () => [...merchantAppKeys.all, 'list'] as const,
  list: (filters: MerchantApplicationFilters) => [...merchantAppKeys.lists(), filters] as const,
  details: () => [...merchantAppKeys.all, 'detail'] as const,
  detail: (id: number | string) => [...merchantAppKeys.details(), id] as const,
};

export function useGetApplications(
  filters: MerchantApplicationFilters = {},
): UseQueryResult<MerchantApplicationsResponse> {
  const query = useQuery({
    queryKey: merchantAppKeys.list(filters),
    queryFn: ({ signal }) => merchantApplicationsService.list(filters, signal),
    staleTime: 5 * 60 * 1000,
    placeholderData: keepPreviousData,
  });

  useErrorHandler(query.error, 'Failed to load merchant applications');
  return query;
}

export function useGetApplication(
  id: number | string,
  enabled = true,
): UseQueryResult<MerchantApplication> {
  const query = useQuery({
    queryKey: merchantAppKeys.detail(id),
    queryFn: () => merchantApplicationsService.get(id),
    enabled: enabled && !!id,
    staleTime: 5 * 60 * 1000,
  });

  useErrorHandler(query.error, 'Failed to load merchant application');
  return query;
}

export function useApproveApplication() {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: (id: number | string) => merchantApplicationsService.approve(id),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: merchantAppKeys.lists() });
      queryClient.invalidateQueries({ queryKey: merchantAppKeys.detail(id) });
      toast.success('Application approved successfully');
    },
    onError: (error) => {
      const message =
        error instanceof Error ? error.message : 'Failed to approve application';
      toast.error(message);
    },
  });
}

export function useRejectApplication() {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: ({ id, rejectionReason }: { id: number | string; rejectionReason: string }) =>
      merchantApplicationsService.reject(id, rejectionReason),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: merchantAppKeys.lists() });
      queryClient.invalidateQueries({ queryKey: merchantAppKeys.detail(variables.id) });
      toast.success('Application rejected');
    },
    onError: (error) => {
      const message =
        error instanceof Error ? error.message : 'Failed to reject application';
      toast.error(message);
    },
  });
}
