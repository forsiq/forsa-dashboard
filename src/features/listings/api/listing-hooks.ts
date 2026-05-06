import { useQuery, useMutation, useQueryClient, type UseQueryResult } from '@tanstack/react-query';
import { useToast } from '@core/contexts/ToastContext';
import { useErrorHandler } from '@core/hooks';
import { listingApi } from './listing-api';
import type {
  ProductListing,
  ListingsResponse,
  CreateListingInput,
  UpdateListingInput,
  ListingFilters,
  DeployAuctionInput,
  DeployGroupBuyInput,
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
    queryFn: () => listingApi.list(filters),
    staleTime: 2 * 60 * 1000,
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
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: (input: CreateListingInput) => listingApi.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: listingKeys.lists() });
      toast.success('Listing created successfully');
    },
    onError: (error: any) => {
      toast.error(`Failed to create listing: ${error.message || 'Unknown error'}`, 8000);
    },
  });
}

export function useUpdateListing() {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateListingInput }) =>
      listingApi.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: listingKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: listingKeys.lists() });
      toast.success('Listing updated successfully');
    },
    onError: (error: any) => {
      toast.error(`Failed to update listing: ${error.message || 'Unknown error'}`, 8000);
    },
  });
}

export function useDeleteListing() {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: (id: number) => listingApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: listingKeys.lists() });
      toast.success('Listing deleted successfully');
    },
    onError: (error: any) => {
      toast.error(`Failed to delete listing: ${error.message || 'Unknown error'}`, 8000);
    },
  });
}

export function useDeployAsAuction() {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: DeployAuctionInput }) =>
      listingApi.deployAsAuction(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: listingKeys.auctions(variables.id) });
      queryClient.invalidateQueries({ queryKey: listingKeys.detail(variables.id) });
      // Invalidate auctions list so new auction appears
      queryClient.invalidateQueries({ queryKey: ['auctions'] });
      toast.success('Auction deployed from listing');
    },
    onError: (error: any) => {
      toast.error(`Failed to deploy auction: ${error.message || 'Unknown error'}`, 8000);
    },
  });
}

export function useDeployAsGroupBuy() {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: DeployGroupBuyInput }) =>
      listingApi.deployAsGroupBuy(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: listingKeys.deals(variables.id) });
      queryClient.invalidateQueries({ queryKey: listingKeys.detail(variables.id) });
      toast.success('Group deal deployed from listing');
    },
    onError: (error: any) => {
      toast.error(`Failed to deploy group deal: ${error.message || 'Unknown error'}`, 8000);
    },
  });
}

export { listingKeys };
