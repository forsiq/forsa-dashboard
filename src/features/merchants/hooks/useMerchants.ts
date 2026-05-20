import { useQuery, useMutation, useQueryClient, keepPreviousData, type UseQueryResult } from '@tanstack/react-query';
import { useToast } from '@core/contexts/ToastContext';
import { useErrorHandler } from '@core/hooks';
import { merchantsService } from '../services/merchantsService';
import type {
  Merchant,
  MerchantDetail,
  MerchantProduct,
  MerchantAuction,
  MerchantsResponse,
  MerchantFilters,
} from '../services/merchantsService';

export const merchantKeys = {
  all: ['merchants'] as const,
  lists: () => [...merchantKeys.all, 'list'] as const,
  list: (filters: MerchantFilters) => [...merchantKeys.lists(), filters] as const,
  details: () => [...merchantKeys.all, 'detail'] as const,
  detail: (id: string) => [...merchantKeys.details(), id] as const,
  products: (id: string) => [...merchantKeys.detail(id), 'products'] as const,
  auctions: (id: string) => [...merchantKeys.detail(id), 'auctions'] as const,
};

export function useGetMerchants(filters: MerchantFilters = {}): UseQueryResult<MerchantsResponse> {
  const query = useQuery({
    queryKey: merchantKeys.list(filters),
    queryFn: ({ signal }) => merchantsService.list(filters, signal),
    staleTime: 5 * 60 * 1000,
    placeholderData: keepPreviousData,
  });

  useErrorHandler(query.error, 'Failed to load merchants');
  return query;
}

export function useGetMerchant(id: string, enabled = true): UseQueryResult<MerchantDetail> {
  const query = useQuery({
    queryKey: merchantKeys.detail(id),
    queryFn: () => merchantsService.get(id),
    enabled: enabled && !!id,
    staleTime: 5 * 60 * 1000,
  });

  useErrorHandler(query.error, 'Failed to load merchant');
  return query;
}

export function useGetMerchantProducts(id: string, enabled = true): UseQueryResult<MerchantProduct[]> {
  const query = useQuery({
    queryKey: merchantKeys.products(id),
    queryFn: ({ signal }) => merchantsService.getProducts(id, signal),
    enabled: enabled && !!id,
    staleTime: 5 * 60 * 1000,
  });

  useErrorHandler(query.error, 'Failed to load merchant products');
  return query;
}

export function useGetMerchantAuctions(id: string, enabled = true): UseQueryResult<MerchantAuction[]> {
  const query = useQuery({
    queryKey: merchantKeys.auctions(id),
    queryFn: ({ signal }) => merchantsService.getAuctions(id, signal),
    enabled: enabled && !!id,
    staleTime: 5 * 60 * 1000,
  });

  useErrorHandler(query.error, 'Failed to load merchant auctions');
  return query;
}
