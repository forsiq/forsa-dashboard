import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLanguage } from '@core/contexts/LanguageContext';
import { getLanguage } from '@core/lib/utils/cookieStorage';
import { formatCurrency } from '@core/lib/utils/formatCurrency';
import { ActivityItem, StatCard } from '@core/core/dashboard/types';
import { auctionBaseApi } from '../../auctions/api/auction-api';
import { orderBaseApi } from '../../../services/orders/api/orders';
import { categoryBaseApi } from '../../../services/categories/api/categories';
import { getLocalizedName } from '../../../services/categories/types';
import { groupBuyingBaseApi } from '../../sales/api/group-buying-api';

// ============================================================================
// Types
// ============================================================================

export interface DashboardStats {
  totalRevenue: number;
  revenueChange: number;
  totalOrders: number;
  ordersChange: number;
  totalProducts: number;
  productsChange: number;
  totalCustomers: number;
  customersChange: number;
}

export interface RecentOrder {
  id: string;
  customerName: string;
  productName: string;
  amount: number;
  status: string;
  date: string;
}

export interface TopProduct {
  id: string;
  name: string;
  category: string;
  sales: number;
  revenue: number;
  stock: number;
}

export interface ChartDataPoint {
  date: string;
  revenue: number;
  orders: number;
}

export interface CategoryDistribution {
  category: string;
  orders: number;
  fill: string;
}

export interface QuickCounts {
  activeAuctions: number;
  totalAuctions: number;
  activeDeals: number;
  pendingOrders: number;
  totalParticipants: number;
}

interface AllStatsData {
  stats: DashboardStats;
  quickCounts: QuickCounts;
  partialError: boolean;
}

// ============================================================================
// Query Keys
// ============================================================================

export const dashboardKeys = {
  all: ['dashboard'] as const,
  stats: () => [...dashboardKeys.all, 'stats'] as const,
  recentOrders: () => [...dashboardKeys.all, 'recentOrders'] as const,
  topProducts: () => [...dashboardKeys.all, 'topProducts'] as const,
  categoryDistribution: () => [...dashboardKeys.all, 'categoryDistribution'] as const,
  salesChart: () => [...dashboardKeys.all, 'salesChart'] as const,
};

// ============================================================================
// Shared Query Keys for deduplicated fetches
// ============================================================================

/**
 * Shared keys for raw endpoint data that multiple dashboard hooks need.
 * Using consistent keys ensures React Query caches and reuses results
 * instead of firing duplicate HTTP requests.
 */
const sharedDashboardKeys = {
  categories: () => ['dashboard', 'shared', 'categories'] as const,
  auctionsList: (params: Record<string, unknown>) => ['dashboard', 'shared', 'auctions', params] as const,
  ordersList: (params: Record<string, unknown>) => ['dashboard', 'shared', 'orders', params] as const,
  groupBuyingsList: (params: Record<string, unknown>) => ['dashboard', 'shared', 'groupBuyings', params] as const,
};

// ============================================================================
// Shared Fetchers (reused by multiple hooks via consistent query keys)
// ============================================================================

async function fetchCategories() {
  const res = await categoryBaseApi.list().catch((err) => { console.warn('[Dashboard] categories fetch failed:', err?.message); return { data: [] }; });
  return (res as any).data || [];
}

async function fetchAuctionsList(params: Record<string, unknown>) {
  const res = await auctionBaseApi.list(params).catch((err) => { console.warn('[Dashboard] auctions fetch failed:', err?.message); return { data: [] }; });
  return (res as any).data || [];
}

async function fetchOrdersList(params: Record<string, unknown>) {
  const res = await orderBaseApi.list(params).catch((err) => { console.warn('[Dashboard] orders fetch failed:', err?.message); return { data: [] }; });
  return (res as any).data || [];
}

async function fetchGroupBuyingsList(params: Record<string, unknown>) {
  const res = await groupBuyingBaseApi.list(params).catch((err) => { console.warn('[Dashboard] group-buyings fetch failed:', err?.message); return { data: [] }; });
  return (res as any).data || [];
}

// ============================================================================
// Shared Data Hooks (deduplicated via React Query cache)
// ============================================================================

/**
 * Shared categories hook — used by useTopProducts and useCategoryDistribution.
 * Only one HTTP request is made regardless of how many consumers call this.
 */
function useSharedCategories() {
  return useQuery({
    queryKey: sharedDashboardKeys.categories(),
    queryFn: fetchCategories,
    staleTime: 1000 * 60 * 5,
  });
}

/**
 * Shared auctions list hook — used by useRecentOrders and useTopProducts.
 */
function useSharedAuctionsList(params: Record<string, unknown>) {
  return useQuery({
    queryKey: sharedDashboardKeys.auctionsList(params),
    queryFn: () => fetchAuctionsList(params),
    staleTime: 1000 * 60 * 2,
  });
}

/**
 * Shared orders list hook — used by useRecentOrders and useSalesChartData.
 */
function useSharedOrdersList(params: Record<string, unknown>) {
  return useQuery({
    queryKey: sharedDashboardKeys.ordersList(params),
    queryFn: () => fetchOrdersList(params),
    staleTime: 1000 * 60 * 2,
  });
}

/**
 * Shared group-buyings list hook — used by useRecentOrders.
 */
function useSharedGroupBuyingsList(params: Record<string, unknown>) {
  return useQuery({
    queryKey: sharedDashboardKeys.groupBuyingsList(params),
    queryFn: () => fetchGroupBuyingsList(params),
    staleTime: 1000 * 60 * 2,
  });
}

export const useDashboardStats = () => {
  return useQuery({
    queryKey: dashboardKeys.stats(),
    queryFn: async (): Promise<AllStatsData> => {
      let failedCount = 0;

      const [auctionStatsRes, groupBuyingStatsRes, ordersRes] = await Promise.all([
        auctionBaseApi.getStats().catch((err) => {
          console.warn('[Dashboard] auction-stats fetch failed:', err?.message);
          failedCount++;
          return { data: {} };
        }),
        groupBuyingBaseApi.getStats().catch((err) => {
          console.warn('[Dashboard] group-buying-stats fetch failed:', err?.message);
          failedCount++;
          return { data: {} };
        }),
        orderBaseApi.getStats().catch((err) => {
          console.warn('[Dashboard] order-stats fetch failed:', err?.message);
          failedCount++;
          return { data: {} };
        }),
      ]);

      const auctionStats = (auctionStatsRes as any).data || {};
      const groupStats = (groupBuyingStatsRes as any).data || {};
      const orderStats = (ordersRes as any).data || {};

      return {
        stats: {
          totalRevenue: orderStats.thisMonthRevenue || 0,
          revenueChange: 0,
          totalOrders: orderStats.thisMonthOrders || 0,
          ordersChange: 0,
          totalProducts: (auctionStats.totalAuctions || 0) + (groupStats.active_campaigns || 0),
          productsChange: 0,
          totalCustomers: (groupStats.total_participants || 0) + (auctionStats.totalAuctions || 0),
          customersChange: 0,
        },
        quickCounts: {
          activeAuctions: auctionStats.activeAuctions || 0,
          totalAuctions: auctionStats.totalAuctions || 0,
          activeDeals: groupStats.active_campaigns || 0,
          pendingOrders: orderStats.pending || 0,
          totalParticipants: groupStats.total_participants || 0,
        },
        partialError: failedCount > 0,
      };
    },
    staleTime: 1000 * 60 * 5,
  });
};

// ============================================================================
// Recent Orders Hook
// ============================================================================

export const useRecentOrders = () => {
  const { data: auctions = [] } = useSharedAuctionsList({ limit: 5, sortBy: 'createdAt', sortOrder: 'desc' });
  const { data: groupBuyings = [] } = useSharedGroupBuyingsList({ limit: 5 });
  const { data: orders = [] } = useSharedOrdersList({ limit: 5 });

  return useQuery({
    queryKey: dashboardKeys.recentOrders(),
    queryFn: async (): Promise<RecentOrder[]> => {
      const items: RecentOrder[] = [
        ...auctions.map((a: any) => ({
          id: `AUC-${a.id}`,
          customerName: a.sellerId || 'Seller',
          productName: a.title || 'Auction',
          amount: parseFloat(a.currentBid || a.startPrice || '0'),
          status: a.status,
          date: a.createdAt || a.created_at || new Date().toISOString(),
        })),
        ...groupBuyings.map((g: any) => ({
          id: `GB-${g.id}`,
          customerName: `${g.currentParticipants || 0} ${typeof window !== 'undefined' ? 'participants' : ''}`,
          productName: g.title || 'Group Deal',
          amount: parseFloat(g.dealPrice || '0') * (g.currentParticipants || 0),
          status: g.status,
          date: g.createdAt || g.created_at || new Date().toISOString(),
        })),
        ...orders.map((o: any) => ({
          id: `ORD-${o.id}`,
          customerName: o.customerName || o.customer?.name || 'Customer',
          productName: o.items?.[0]?.productName || `Order #${o.id}`,
          amount: parseFloat(o.totalAmount || o.total || '0'),
          status: o.status,
          date: o.createdAt || o.created_at || new Date().toISOString(),
        })),
      ];

      return items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 8);
    },
    staleTime: 1000 * 60 * 2,
  });
};

// ============================================================================
// Top Products Hook
// ============================================================================

export const useTopProducts = (options?: { enabled?: boolean }) => {
  const { data: auctions = [] } = useSharedAuctionsList({ limit: 10, status: 'active', sortBy: 'currentBid', sortOrder: 'desc' });
  const { data: categories = [] } = useSharedCategories();

  return useQuery({
    queryKey: dashboardKeys.topProducts(),
    queryFn: async (): Promise<TopProduct[]> => {
      const lang = getLanguage();

      const categoryMap = new Map(
        categories.map((c: any) => [c.id, getLocalizedName(c, lang) || c.slug || 'Uncategorized']),
      );

      return auctions
        .map((a: any) => ({
          id: String(a.id),
          name: a.title || `Auction #${a.id}`,
          category: categoryMap.get(a.categoryId) || getLocalizedName(a.category, lang) || 'Uncategorized',
          sales: a.totalBids || 0,
          revenue: parseFloat(a.currentBid || a.startPrice || '0'),
          stock: a.viewCount || 0,
        }))
        .sort((a: any, b: any) => b.revenue - a.revenue)
        .slice(0, 5);
    },
    staleTime: 1000 * 60 * 5,
    enabled: options?.enabled !== false,
  });
};

// ============================================================================
// Category Distribution Hook
// ============================================================================

export const useCategoryDistribution = (options?: { enabled?: boolean }) => {
  const { data: categories = [] } = useSharedCategories();

  return useQuery({
    queryKey: dashboardKeys.categoryDistribution(),
    queryFn: async (): Promise<CategoryDistribution[]> => {
      const lang = getLanguage();

      const colors = [
        'var(--chart-1)',
        'var(--chart-2)',
        'var(--chart-3)',
        'var(--chart-4)',
        'var(--chart-5)',
      ];

      return categories.slice(0, 5).map((c: any, index: number) => ({
        category: getLocalizedName(c, lang) || '',
        orders: c.productCount || 0,
        fill: colors[index % colors.length],
      }));
    },
    staleTime: 1000 * 60 * 5,
    enabled: options?.enabled !== false,
  });
};

// ============================================================================
// Sales Chart Data Hook
// ============================================================================

export const useSalesChartData = (options?: { enabled?: boolean }) => {
  const { data: orders = [] } = useSharedOrdersList({ limit: 30 });

  return useQuery({
    queryKey: dashboardKeys.salesChart(),
    queryFn: async (): Promise<ChartDataPoint[]> => {
      const byDate = new Map<string, { revenue: number; count: number }>();

      const today = new Date();
      for (let i = 29; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        byDate.set(dateStr, { revenue: 0, count: 0 });
      }

      orders.forEach((o: any) => {
        const dateStr = (o.createdAt || o.created_at || '').split('T')[0];
        if (byDate.has(dateStr)) {
          const existing = byDate.get(dateStr)!;
          existing.revenue += parseFloat(o.totalAmount || o.total || '0');
          existing.count += 1;
        }
      });

      return Array.from(byDate.entries()).map(([date, data]) => ({
        date,
        revenue: data.revenue,
        orders: data.count,
      }));
    },
    staleTime: 1000 * 60 * 10,
    enabled: options?.enabled !== false,
  });
};

// ============================================================================
// Quick Counts Hook (now derives from merged stats query)
// ============================================================================

export const useDashboardQuickCounts = () => {
  const { data } = useDashboardStats();
  return {
    data: data?.quickCounts,
    isLoading: !data,
  };
};

// ============================================================================
// Combined Hook (for backward compatibility)
// ============================================================================

export const useDashboardData = () => {
  const { t } = useLanguage();
  const [deferredReady, setDeferredReady] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setDeferredReady(true), 2000);
    return () => clearTimeout(timer);
  }, []);

  const { data: allStatsData, isLoading: statsLoading, isError: statsError, refetch: refetchStats } = useDashboardStats();
  const { data: recentActivities, isLoading: activitiesLoading, isError: activitiesError, refetch: refetchActivities } = useRecentOrders();
  const { data: topProducts, isLoading: topProductsLoading } = useTopProducts({ enabled: deferredReady });
  const { data: categoryData, isLoading: categoriesLoading } = useCategoryDistribution({ enabled: deferredReady });
  const { data: salesChart, isLoading: salesLoading } = useSalesChartData({ enabled: deferredReady });

  const stats = allStatsData?.stats;
  const quickCounts = allStatsData?.quickCounts;
  const statsPartialError = allStatsData?.partialError ?? false;

  const dashboardStats: StatCard[] = [
    {
      id: 'revenue',
      title: t('stats.revenue') || 'Total Revenue',
      value: stats ? formatCurrency(stats.totalRevenue) : '—',
      change: stats?.revenueChange,
      color: 'brand',
    },
    {
      id: 'orders',
      title: t('dash.total_orders') || 'Total Orders',
      value: stats ? (stats.totalOrders).toString() : '—',
      change: stats?.ordersChange,
      color: 'success',
    },
    {
      id: 'total',
      title: t('dash.total_items') || 'Auctions & Deals',
      value: stats ? (stats.totalProducts).toString() : '—',
      change: stats?.productsChange,
      color: 'warning',
    },
    {
      id: 'participants',
      title: t('dash.participants') || 'Total Participants',
      value: stats ? (stats.totalCustomers).toString() : '—',
      change: stats?.customersChange,
      color: 'info',
    },
  ];

  const activities: ActivityItem[] = (recentActivities || []).map(order => {
    const statusTypeMap: Record<string, 'success' | 'info' | 'warning' | 'danger'> = {
      active: 'success',
      completed: 'success',
      delivered: 'success',
      pending: 'warning',
      processing: 'info',
      shipped: 'info',
      cancelled: 'danger',
      expired: 'danger',
      scheduled: 'info',
    };
    return {
      id: order.id,
      type: statusTypeMap[order.status] || 'info',
      title: order.productName,
      description: `${order.customerName} - ${formatCurrency(order.amount)}`,
      timestamp: order.date,
    };
  });

  return {
    stats: dashboardStats,
    activities,
    topProducts,
    categoryData,
    salesChart,
    quickCounts,
    isLoading: statsLoading || activitiesLoading,
    isDeferredLoading: statsLoading || activitiesLoading || topProductsLoading || categoriesLoading || salesLoading,
    isError: statsError || activitiesError,
    partialError: statsPartialError,
    refetch: () => {
      refetchStats();
      refetchActivities();
    },
  };
};
