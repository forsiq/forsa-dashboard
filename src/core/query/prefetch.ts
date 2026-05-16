import { queryClient } from './queryClient';
import { auctionApi } from '@features/auctions/api/auction-api';
import { auctionKeys } from '@features/auctions/api/auction-hooks';
import { listingApi } from '@features/listings/api/listing-api';
import { listingKeys } from '@features/listings/api/listing-hooks';
import { groupBuyingKeys } from '@features/sales/api/group-buying-hooks';
import { groupBuyingApi } from '@features/sales/api/group-buying-api';
import { orderKeys, getOrders } from '@services/orders/api/orders';
import { customerKeys, getCustomers } from '@services/customers/api/customers';
import { categoryKeys, getCategories } from '@services/categories/api/categories';
import { inventoryKeys, getProducts } from '@services/inventory/api/products';

const STALE = 5 * 60 * 1000;
const DEFAULT_LIST_FILTERS = { page: 1, limit: 20 } as const;

const prefetchMap: Record<string, () => void> = {
  '/auctions': () =>
    queryClient.prefetchQuery({
      queryKey: auctionKeys.list({ ...DEFAULT_LIST_FILTERS, sortBy: 'createdAt', sortOrder: 'desc' }),
      queryFn: ({ signal }) => auctionApi.list({ ...DEFAULT_LIST_FILTERS, sortBy: 'createdAt', sortOrder: 'desc' }, signal),
      staleTime: STALE,
    }),
  '/listings': () =>
    queryClient.prefetchQuery({
      queryKey: listingKeys.list(DEFAULT_LIST_FILTERS),
      queryFn: ({ signal }) => listingApi.list(DEFAULT_LIST_FILTERS, signal),
      staleTime: STALE,
    }),
  '/group-buying': () =>
    queryClient.prefetchQuery({
      queryKey: groupBuyingKeys.list(DEFAULT_LIST_FILTERS),
      queryFn: ({ signal }) => groupBuyingApi.list(DEFAULT_LIST_FILTERS, signal),
      staleTime: STALE,
    }),
  '/orders': () =>
    queryClient.prefetchQuery({
      queryKey: orderKeys.list(DEFAULT_LIST_FILTERS),
      queryFn: ({ signal }) => getOrders(DEFAULT_LIST_FILTERS, signal),
      staleTime: STALE,
    }),
  '/customers': () =>
    queryClient.prefetchQuery({
      queryKey: customerKeys.list(DEFAULT_LIST_FILTERS),
      queryFn: ({ signal }) => getCustomers(DEFAULT_LIST_FILTERS, signal),
      staleTime: STALE,
    }),
  '/categories': () =>
    queryClient.prefetchQuery({
      queryKey: categoryKeys.list({ page: 1, limit: 100 }),
      queryFn: ({ signal }) => getCategories({ page: 1, limit: 100 }, signal),
      staleTime: STALE,
    }),
  '/inventory': () =>
    queryClient.prefetchQuery({
      queryKey: inventoryKeys.list(DEFAULT_LIST_FILTERS),
      queryFn: ({ signal }) => getProducts(DEFAULT_LIST_FILTERS, signal),
      staleTime: STALE,
    }),
};

export function prefetchRouteData(path: string): void {
  if (typeof window === 'undefined') return;
  const base = path.split('?')[0];
  prefetchMap[base]?.();
}
