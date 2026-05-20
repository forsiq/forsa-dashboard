import { useQuery } from '@tanstack/react-query';

import { auctionApi } from '@features/auctions/api/auction-api';
import { groupBuyingApi } from '@features/sales/api/group-buying-api';
import { groupBuyingKeys } from '@features/sales/api/group-buying-hooks';
import { getOrders } from '@services/orders/api/orders';
import { listingApi } from '@features/listings/api/listing-api';

const GROUP_BUYING_SIDEBAR_LIST_FILTERS = { limit: 1 } as const;

export interface SidebarBadgeCounts {
  activeAuctions: number;
  pendingOrders: number;
  totalListings: number;
  totalGroupBuyings: number;
}

const EMPTY_BADGES: SidebarBadgeCounts = {
  activeAuctions: 0,
  pendingOrders: 0,
  totalListings: 0,
  totalGroupBuyings: 0,
};

const refetchIntervalVisible = () =>
  typeof document !== 'undefined' && document.visibilityState === 'visible' ? 60_000 : false;

export function useSidebarBadges() {
  const baseBadges = useQuery<Pick<
    SidebarBadgeCounts,
    'activeAuctions' | 'pendingOrders' | 'totalListings'
  >>({
    queryKey: ['sidebar-badges'],
    queryFn: async () => {
      const [auctionsRes, ordersRes, listingsRes] = await Promise.all([
        auctionApi.list({ status: 'active', limit: 1 }).catch(() => ({ total: 0 } as const)),
        getOrders({ status: 'pending', limit: 1 } as any).catch(() => ({ total: 0 } as const)),
        listingApi.list({ limit: 1 }).catch(() => ({ pagination: { total: 0 } } as const)),
      ]);

      return {
        activeAuctions: auctionsRes.total ?? 0,
        pendingOrders: ordersRes.total ?? 0,
        totalListings: listingsRes.pagination?.total ?? 0,
      };
    },
    placeholderData: {
      activeAuctions: 0,
      pendingOrders: 0,
      totalListings: 0,
    },
    staleTime: 60_000,
    refetchInterval: refetchIntervalVisible,
    retry: false,
  });

  const groupBuyingTotal = useQuery({
    queryKey: groupBuyingKeys.list(GROUP_BUYING_SIDEBAR_LIST_FILTERS),
    queryFn: ({ signal }) => groupBuyingApi.list(GROUP_BUYING_SIDEBAR_LIST_FILTERS, signal),
    staleTime: 60_000,
    refetchInterval: refetchIntervalVisible,
    retry: false,
  });

  const merged: SidebarBadgeCounts = {
    ...EMPTY_BADGES,
    ...(baseBadges.data ?? {}),
    totalGroupBuyings: groupBuyingTotal.data?.total ?? 0,
  };

  return {
    ...baseBadges,
    data: merged,
    isLoading: baseBadges.isLoading || groupBuyingTotal.isLoading,
    isPending: baseBadges.isPending || groupBuyingTotal.isPending,
    isFetching: baseBadges.isFetching || groupBuyingTotal.isFetching,
    isRefetching: baseBadges.isRefetching || groupBuyingTotal.isRefetching,
  };
}
