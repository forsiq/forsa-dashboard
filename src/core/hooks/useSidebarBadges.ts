import { useQuery } from '@tanstack/react-query';
import Cookies from 'js-cookie';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://test.zonevast.com/forsa/api/v1';

export interface SidebarBadgeCounts {
  activeAuctions: number;
  pendingOrders: number;
  totalListings: number;
}

const EMPTY_BADGES: SidebarBadgeCounts = {
  activeAuctions: 0,
  pendingOrders: 0,
  totalListings: 0,
};

export function useSidebarBadges() {
  return useQuery<SidebarBadgeCounts>({
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
    placeholderData: EMPTY_BADGES,
    staleTime: 60_000,
    refetchInterval: () =>
      typeof document !== 'undefined' && document.visibilityState === 'visible' ? 60_000 : false,
    retry: false,
  });
}
