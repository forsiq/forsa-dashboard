import { useQuery, useMutation, type UseQueryResult, keepPreviousData } from '@tanstack/react-query';
import { useErrorHandler } from '@core/hooks';
import { useMutationContext } from '@core/hooks/useMutationContext';
import { listingApi } from './listing-api';
import type {
  ProductListing,
  ListingsResponse,
  CreateListingInput,
  UpdateListingInput,
  ListingFilters,
} from '../../../types/services/listings.types';

const listingKeys = {
  all: ['listings'] as const,
  lists: () => [...listingKeys.all, 'list'] as const,
  list: (filters: ListingFilters) => [...listingKeys.lists(), filters] as const,
  details: () => [...listingKeys.all, 'detail'] as const,
  detail: (id: number | string) => [...listingKeys.details(), id] as const,
  auctions: (id: number) => [...listingKeys.detail(id), 'auctions'] as const,
  deals: (id: number) => [...listingKeys.detail(id), 'deals'] as const,
};

export function useGetListings(filters: ListingFilters = {}): UseQueryResult<ListingsResponse> {
  const query = useQuery({
    queryKey: listingKeys.list(filters),
    queryFn: ({ signal }) => listingApi.list(filters, signal),
    staleTime: 2 * 60 * 1000,
    placeholderData: keepPreviousData,
  });

  useErrorHandler(query.error, 'Failed to load listings');
  return query;
}

export function useGetListing(id: number | string, enabled = true): UseQueryResult<ProductListing> {
  const query = useQuery({
    queryKey: listingKeys.detail(id),
    queryFn: () => listingApi.get(id),
    enabled: enabled && !!id,
    staleTime: 5 * 60 * 1000,
  });

  useErrorHandler(query.error, 'Failed to load listing');
  return query;
}

export function useGetListingAuctions(id: number, enabled = true) {
  const query = useQuery({
    queryKey: listingKeys.auctions(id),
    queryFn: () => listingApi.getListingAuctions(id),
    enabled: enabled && !!id,
    staleTime: 30 * 1000,
  });

  useErrorHandler(query.error, 'Failed to load listing auctions');
  return query;
}

export function useGetListingDeals(id: number, enabled = true) {
  const query = useQuery({
    queryKey: listingKeys.deals(id),
    queryFn: () => listingApi.getListingDeals(id),
    enabled: enabled && !!id,
    staleTime: 30 * 1000,
  });

  useErrorHandler(query.error, 'Failed to load listing deals');
  return query;
}

export function useCreateListing() {
  const { queryClient, toast, t, getErrorDetail } = useMutationContext();

  return useMutation({
    mutationFn: (input: CreateListingInput) => listingApi.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: listingKeys.lists() });
      toast.success(t('toast.listing.created'));
    },
    onError: (error: unknown) => {
      toast.error(t('toast.listing.create_failed', { detail: getErrorDetail(error) }), 8000);
    },
  });
}

export function useUpdateListing() {
  const { queryClient, toast, t, getErrorDetail } = useMutationContext();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateListingInput }) =>
      listingApi.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: listingKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: listingKeys.lists() });
      toast.success(t('toast.listing.updated'));
    },
    onError: (error: unknown) => {
      toast.error(t('toast.listing.update_failed', { detail: getErrorDetail(error) }), 8000);
    },
  });
}

export function useDeleteListing() {
  const { queryClient, toast, t, getErrorDetail } = useMutationContext();

  return useMutation({
    mutationFn: (id: number) => listingApi.delete(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: listingKeys.all });
      const previousData = queryClient.getQueriesData<ListingsResponse>({ queryKey: listingKeys.lists() });
      queryClient.setQueriesData<ListingsResponse>({ queryKey: listingKeys.lists() }, (old) => {
        if (!old || !Array.isArray(old.data)) return old;
        return {
          ...old,
          data: old.data.filter((listing) => listing.id !== id),
          pagination: {
            ...old.pagination,
            total: Math.max(0, (old.pagination?.total ?? old.data.length) - 1),
          },
        };
      });
      return { previousData };
    },
    onError: (error: unknown, _id, context) => {
      if (context?.previousData) {
        context.previousData.forEach(([key, data]) => {
          queryClient.setQueryData(key, data);
        });
      }
      toast.error(t('toast.listing.delete_failed', { detail: getErrorDetail(error) }), 8000);
    },
    onSuccess: async (_void, id) => {
      queryClient.removeQueries({ queryKey: listingKeys.detail(id) });
      queryClient.setQueriesData<ListingsResponse>({ queryKey: listingKeys.lists() }, (old) => {
        if (!old || !Array.isArray(old.data)) return old;
        return {
          ...old,
          data: old.data.filter((listing) => listing.id !== id),
          pagination: {
            ...old.pagination,
            total: Math.max(0, (old.pagination?.total ?? old.data.length) - 1),
          },
        };
      });
      await queryClient.invalidateQueries({ queryKey: listingKeys.lists() });
      toast.success(t('toast.listing.deleted'));
    },
  });
}

export function useDeployAsAuction() {
  const { queryClient, toast, t, mapApiError } = useMutationContext();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Record<string, any> }) =>
      listingApi.deployAsAuction(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: listingKeys.auctions(variables.id) });
      queryClient.invalidateQueries({ queryKey: listingKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: ['auctions'] });
      toast.success(t('toast.listing.deploy_auction'));
    },
    onError: (error: unknown) => {
      const mapped = mapApiError(error, { firstOnly: true });
      const errMsg = typeof (error as { message?: string })?.message === 'string' ? (error as { message: string }).message.trim() : '';
      const reason = mapped?.trim() || errMsg || t('listing.deploy.error_reason_unknown');
      toast.error(t('listing.deploy.toast_auction_failed', { reason }), 8000);
    },
  });
}

export function useDeployAsGroupBuy() {
  const { queryClient, toast, t, mapApiError } = useMutationContext();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Record<string, any> }) =>
      listingApi.deployAsGroupBuy(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: listingKeys.deals(variables.id) });
      queryClient.invalidateQueries({ queryKey: listingKeys.detail(variables.id) });
      toast.success(t('toast.listing.deploy_group_buy'));
    },
    onError: (error: unknown) => {
      const mapped = mapApiError(error, { firstOnly: true });
      const errMsg = typeof (error as { message?: string })?.message === 'string' ? (error as { message: string }).message.trim() : '';
      const reason = mapped?.trim() || errMsg || t('listing.deploy.error_reason_unknown');
      toast.error(t('listing.deploy.toast_group_buy_failed', { reason }), 8000);
    },
  });
}

export function useSubmitListingForReview() {
  const { queryClient, toast, t, getErrorDetail } = useMutationContext();

  return useMutation({
    mutationFn: (id: number) => listingApi.submitForReview(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: listingKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: listingKeys.lists() });
      toast.success(t('approval.messages.submitted'));
    },
    onError: (error: unknown) => {
      toast.error(getErrorDetail(error), 8000);
    },
  });
}

export { listingKeys };

export function useLookupByBarcode() {
  return useMutation({
    mutationFn: (barcode: string) => listingApi.lookupByBarcode(barcode),
  });
}
