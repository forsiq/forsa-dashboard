import { useQuery } from '@tanstack/react-query';
import Cookies from 'js-cookie';

import { groupBuyingApi } from '@features/sales/api/group-buying-api';
import { groupBuyingKeys } from '@features/sales/api/group-buying-hooks';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://test.zonevast.com/forsa/api/v1';

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
      const baseUrl = API_BASE_URL;
      const token = Cookies.get('access');
      const projectId = localStorage.getItem('zv_project') || '11';
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'X-Project-ID': projectId,
      };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const fetchCount = async (url: string): Promise<number> => {
        try {
          const res = await fetch(`${baseUrl}${url}`, { headers });
          if (!res.ok) return 0;
          const data = await res.json();
          return data?.pagination?.total ?? 0;
        } catch {
          return 0;
        }
      };

      const [activeAuctions, pendingOrders, totalListings] = await Promise.all([
        fetchCount('/auctions?status=active&limit=1'),
        fetchCount('/orders?status=pending&limit=1'),
        fetchCount('/listings?limit=1'),
      ]);

      return { activeAuctions, pendingOrders, totalListings };
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
