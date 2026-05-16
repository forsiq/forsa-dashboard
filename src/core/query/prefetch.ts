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

const DEFAULT_STALE = 5 * 60 * 1000;

const prefetchMap: Record<string, () => void> = {
  '/auctions': () =>
    queryClient.prefetchQuery({
      queryKey: auctionKeys.list({ sortBy: 'createdAt', sortOrder: 'desc', page: 1, limit: 20 }),
      queryFn: ({ signal }) => auctionApi.list({ sortBy: 'createdAt', sortOrder: 'desc', page: 1, limit: 20 }, signal),
      staleTime: DEFAULT_STALE,
    }),
  '/listings': () =>
    queryClient.prefetchQuery({
      queryKey: listingKeys.list({ page: 1, limit: 20 }),
      queryFn: ({ signal }) => listingApi.list({ page: 1, limit: 20 }, signal),
      staleTime: DEFAULT_STALE,
    }),
  '/group-buying': () =>
    queryClient.prefetchQuery({
      queryKey: groupBuyingKeys.list({ page: 1, limit: 20 }),
      queryFn: ({ signal }) => groupBuyingApi.list({ page: 1, limit: 20 }, signal),
      staleTime: DEFAULT_STALE,
    }),
  '/orders': () =>
    queryClient.prefetchQuery({
      queryKey: orderKeys.list({ page: 1, limit: 20 }),
      queryFn: () => getOrders({ page: 1, limit: 20 }),
      staleTime: DEFAULT_STALE,
    }),
  '/customers': () =>
    queryClient.prefetchQuery({
      queryKey: customerKeys.list({ page: 1, limit: 20 }),
      queryFn: () => getCustomers({ page: 1, limit: 20 }),
      staleTime: DEFAULT_STALE,
    }),
  '/categories': () =>
    queryClient.prefetchQuery({
      queryKey: categoryKeys.list({ page: 1, limit: 100 }),
      queryFn: () => getCategories({ page: 1, limit: 100 }),
      staleTime: DEFAULT_STALE,
    }),
  '/inventory': () =>
    queryClient.prefetchQuery({
      queryKey: inventoryKeys.list({ page: 1, limit: 20 }),
      queryFn: () => getProducts({ page: 1, limit: 20 }),
      staleTime: DEFAULT_STALE,
    }),
};

export function prefetchRouteData(path: string): void {
  if (typeof window === 'undefined') return;
  const base = path.split('?')[0];
  prefetchMap[base]?.();
}
