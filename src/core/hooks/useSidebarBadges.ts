import { useQuery } from '@tanstack/react-query';
import Cookies from 'js-cookie';
import { getResolvedApiBaseUrl } from '@core/lib/apiBaseUrl';

interface BadgeCounts {
  activeAuctions: number;
  pendingOrders: number;
  orphanListings: number;
}

export function useSidebarBadges() {
  return useQuery<BadgeCounts>({
    queryKey: ['sidebar-badges'],
    queryFn: async () => {
      const baseUrl = getResolvedApiBaseUrl();
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

      const [activeAuctions, pendingOrders, orphanListings] = await Promise.all([
        fetchCount('/auctions?status=active&limit=1'),
        fetchCount('/orders?status=pending&limit=1'),
        fetchCount('/listings?limit=1'),
      ]);

      return { activeAuctions, pendingOrders, orphanListings };
    },
    staleTime: 30_000,
    refetchInterval: (query) =>
      document.visibilityState === 'visible' ? 30_000 : false,
    retry: false,
  });
}
