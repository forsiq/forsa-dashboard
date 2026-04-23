import { useQuery } from '@tanstack/react-query';
import { useLanguage } from '@core/contexts/LanguageContext';
import { formatCurrency } from '@core/lib/utils/formatCurrency';
import { ActivityItem, StatCard } from '../types';
import { auctionBaseApi } from '../../auctions/api/auction-api';
import { orderBaseApi } from '../../../services/orders/api/orders';
import { categoryBaseApi } from '../../../services/categories/api/categories';
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
// Dashboard Stats Hook
// ============================================================================

/**
 * Hook to fetch dashboard statistics from multiple sources
 */
export const useDashboardStats = () => {
  return useQuery({
    queryKey: dashboardKeys.stats(),
    queryFn: async (): Promise<DashboardStats> => {
      const [auctionStatsRes, groupBuyingStatsRes, ordersRes] = await Promise.all([
        auctionBaseApi.getStats().catch(() => ({ data: { active: 0, total: 0, revenue: 0 } })),
        groupBuyingBaseApi.getStats().catch(() => ({ data: { active: 0, total: 0 } })),
        orderBaseApi.getStats().catch(() => ({ data: { total_revenue: 0, total: 0 } })),
      ]);

      const auctionStats = (auctionStatsRes as any).data || {};
      const groupStats = (groupBuyingStatsRes as any).data || {};
      const orderStats = (ordersRes as any).data || {};

      return {
        totalRevenue: orderStats.total_revenue || auctionStats.revenue || 0,
        revenueChange: 0,
        totalOrders: (auctionStats.active || 0) + (groupStats.active || 0),
        ordersChange: 0,
        totalProducts: (auctionStats.total || 0) + (groupStats.total || 0),
        productsChange: 0,
        totalCustomers: auctionStats.bids || 0,
        customersChange: 0,
      };
    },
    staleTime: 1000 * 60 * 5,
  });
};

// ============================================================================
// Recent Orders Hook
// ============================================================================

export const useRecentOrders = () => {
  return useQuery({
    queryKey: dashboardKeys.recentOrders(),
    queryFn: async (): Promise<RecentOrder[]> => {
      const [auctionsRes, groupBuyingsRes] = await Promise.all([
        auctionBaseApi.list({ limit: 5 }).catch(() => ({ data: [] })),
        groupBuyingBaseApi.list({ limit: 5 }).catch(() => ({ data: [] })),
      ]);

      const auctions = (auctionsRes as any).data || [];
      const groupBuyings = (groupBuyingsRes as any).data || [];

      const orders: RecentOrder[] = [
        ...auctions.map((a: any) => ({
          id: `AUC-${a.id}`,
          customerName: 'Auction',
          productName: a.title || 'Product',
          amount: a.current_bid || 0,
          status: a.status,
          date: a.created_at || new Date().toISOString(),
        })),
        ...groupBuyings.map((g: any) => ({
          id: `GB-${g.id}`,
          customerName: `${g.current_participants || 0} participants`,
          productName: g.title || 'Group Buying',
          amount: (g.deal_price || 0) * (g.current_participants || 0),
          status: g.status,
          date: g.created_at || new Date().toISOString(),
        })),
      ];

      return orders.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5);
    },
    staleTime: 1000 * 60 * 2,
  });
};

// ============================================================================
// Top Products Hook
// ============================================================================

export const useTopProducts = () => {
  return useQuery({
    queryKey: dashboardKeys.topProducts(),
    queryFn: async (): Promise<TopProduct[]> => {
      const auctionsRes = await auctionBaseApi.list({ limit: 5 }).catch(() => ({ data: [] }));
      const products = (auctionsRes as any).data || [];

      return products.map((p: any, index: number) => ({
        id: p.id,
        name: p.title || p.name || `Product ${index + 1}`,
        category: p.category?.name || 'Uncategorized',
        sales: p.total_bids || 0,
        revenue: (p.current_bid || p.start_price || 0) * (p.total_bids || 1),
        stock: p.stock_quantity || 0,
      }));
    },
    staleTime: 1000 * 60 * 5,
  });
};

// ============================================================================
// Category Distribution Hook
// ============================================================================

export const useCategoryDistribution = () => {
  return useQuery({
    queryKey: dashboardKeys.categoryDistribution(),
    queryFn: async (): Promise<CategoryDistribution[]> => {
      const categoriesRes = await categoryBaseApi.list().catch(() => ({ data: [] }));
      const categories = (categoriesRes as any).data || [];

      const colors = [
        'var(--chart-1)',
        'var(--chart-2)',
        'var(--chart-3)',
        'var(--chart-4)',
        'var(--chart-5)',
      ];

      return categories.slice(0, 5).map((c: any, index: number) => ({
        category: c.name,
        orders: [42, 35, 28, 18, 12][index] || 10, // Mock order counts - replace with real API data when available
        fill: colors[index % colors.length],
      }));
    },
    staleTime: 1000 * 60 * 5,
  });
};

// ============================================================================
// Sales Chart Data Hook
// ============================================================================

export const useSalesChartData = () => {
  return useQuery({
    queryKey: dashboardKeys.salesChart(),
    queryFn: async (): Promise<ChartDataPoint[]> => {
      // Mock data for chart visualization - replace with real historical API data when available
      const today = new Date();
      const chartData: ChartDataPoint[] = [];
      const mockRevenue = [420, 580, 390, 670, 510, 830, 720, 640, 910, 560, 780, 650, 890, 430, 750, 620, 980, 540, 810, 470, 690, 860, 530, 740, 610, 870, 500, 760, 920];

      for (let i = 29; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];

        chartData.push({
          date: dateStr,
          revenue: mockRevenue[29 - i] || 500,
          orders: Math.floor((mockRevenue[29 - i] || 500) / 100),
        });
      }

      return chartData;
    },
    staleTime: 1000 * 60 * 10,
  });
};

// ============================================================================
// Legacy Hook (for backward compatibility)
// ============================================================================

/**
 * Combined hook for all dashboard data
 */
export const useDashboardData = () => {
  const { t } = useLanguage();
  const { data: stats, isLoading: statsLoading, isError: statsError, refetch: refetchStats } = useDashboardStats();
  const { data: recentActivities, isLoading: activitiesLoading, isError: activitiesError, refetch: refetchActivities } = useRecentOrders();
  const { data: topProducts, isLoading: topProductsLoading } = useTopProducts();
  const { data: categoryData, isLoading: categoriesLoading } = useCategoryDistribution();
  const { data: salesChart, isLoading: salesLoading } = useSalesChartData();

  const dashboardStats: StatCard[] = [
    {
      id: 'revenue',
      title: t('stats.revenue') || 'Total Revenue',
      value: formatCurrency(stats?.totalRevenue),
      change: stats?.revenueChange || 0,
      color: 'brand',
    },
    {
      id: 'active',
      title: t('auction.metrics.active_engines') || 'Active (Auctions + Deals)',
      value: (stats?.totalOrders || 0).toString(),
      change: stats?.ordersChange || 0,
      color: 'success',
    },
    {
      id: 'total',
      title: t('dash.totalItems') || 'Total Auctions & Deals',
      value: (stats?.totalProducts || 0).toString(),
      change: stats?.productsChange || 0,
      color: 'warning',
    },
    {
      id: 'bids',
      title: t('auction.metrics.bid_velocity') || 'Total Bids',
      value: (stats?.totalCustomers || 0).toString(),
      change: stats?.customersChange || 0,
      color: 'info',
    },
  ];

  const activities: ActivityItem[] = (recentActivities || []).map(order => ({
    id: order.id,
    type: order.status === 'active' ? 'success' : 'info',
    title: order.productName,
    description: `${order.customerName} - ${formatCurrency(order.amount)}`,
    timestamp: new Date(order.date).toLocaleString(),
  }));

  return {
    stats: dashboardStats,
    activities,
    topProducts,
    categoryData,
    salesChart,
    isLoading: statsLoading || activitiesLoading || topProductsLoading || categoriesLoading || salesLoading,
    isError: statsError || activitiesError,
    refetch: () => {
      refetchStats();
      refetchActivities();
    },
  };
};
