import { useQuery } from '@tanstack/react-query';
import { useLanguage } from '@core/contexts/LanguageContext';
import { formatCurrency } from '@core/lib/utils/formatCurrency';
import { ActivityItem, StatCard } from '@core/core/dashboard/types';
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

export const useDashboardStats = () => {
  return useQuery({
    queryKey: dashboardKeys.stats(),
    queryFn: async (): Promise<DashboardStats> => {
      const [auctionStatsRes, groupBuyingStatsRes, ordersRes, categoriesRes] = await Promise.all([
        auctionBaseApi.getStats().catch(() => ({ data: {} })),
        groupBuyingBaseApi.getStats().catch(() => ({ data: {} })),
        orderBaseApi.getStats().catch(() => ({ data: {} })),
        categoryBaseApi.getStats().catch(() => ({ data: {} })),
      ]);

      const auctionStats = (auctionStatsRes as any).data || {};
      const groupStats = (groupBuyingStatsRes as any).data || {};
      const orderStats = (ordersRes as any).data || {};

      return {
        totalRevenue: orderStats.total_revenue || auctionStats.totalRevenue || 0,
        revenueChange: 0,
        totalOrders: orderStats.total || 0,
        ordersChange: 0,
        totalProducts: (auctionStats.totalAuctions || 0) + (groupStats.active_campaigns || 0),
        productsChange: 0,
        totalCustomers: (groupStats.total_participants || 0) + (auctionStats.totalAuctions || 0),
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
      const [auctionsRes, groupBuyingsRes, ordersRes] = await Promise.all([
        auctionBaseApi.list({ limit: 5, sortBy: 'createdAt', sortOrder: 'desc' }).catch(() => ({ data: [] })),
        groupBuyingBaseApi.list({ limit: 5 }).catch(() => ({ data: [] })),
        orderBaseApi.list({ limit: 5 }).catch(() => ({ data: [] })),
      ]);

      const auctions = (auctionsRes as any).data || [];
      const groupBuyings = (groupBuyingsRes as any).data || [];
      const orders = (ordersRes as any).data || [];

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

export const useTopProducts = () => {
  return useQuery({
    queryKey: dashboardKeys.topProducts(),
    queryFn: async (): Promise<TopProduct[]> => {
      const [auctionsRes, categoriesRes] = await Promise.all([
        auctionBaseApi.list({ limit: 10, status: 'active', sortBy: 'totalBids', sortOrder: 'desc' }).catch(() => ({ data: [] })),
        categoryBaseApi.list().catch(() => ({ data: [] })),
      ]);

      const auctions = (auctionsRes as any).data || [];
      const categories = (categoriesRes as any).data || [];

      const categoryMap = new Map(categories.map((c: any) => [c.id, c.name]));

      return auctions
        .map((a: any) => ({
          id: String(a.id),
          name: a.title || `Auction #${a.id}`,
          category: categoryMap.get(a.categoryId) || a.category?.name || 'Uncategorized',
          sales: a.totalBids || 0,
          revenue: parseFloat(a.currentBid || a.startPrice || '0'),
          stock: a.viewCount || 0,
        }))
        .sort((a: any, b: any) => b.revenue - a.revenue)
        .slice(0, 5);
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
        category: c.translations?.ar?.name || c.name,
        orders: c.productCount || 0,
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
      // Fetch recent orders to build chart data
      const ordersRes = await orderBaseApi.list({ limit: 30 }).catch(() => ({ data: [] }));
      const orders = (ordersRes as any).data || [];

      // Group orders by date
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
  });
};

// ============================================================================
// Combined Hook (for backward compatibility)
// ============================================================================

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
      change: stats?.revenueChange,
      color: 'brand',
    },
    {
      id: 'orders',
      title: t('dash.total_orders') || 'Total Orders',
      value: (stats?.totalOrders || 0).toString(),
      change: stats?.ordersChange,
      color: 'success',
    },
    {
      id: 'total',
      title: t('dash.total_items') || 'Auctions & Deals',
      value: (stats?.totalProducts || 0).toString(),
      change: stats?.productsChange,
      color: 'warning',
    },
    {
      id: 'participants',
      title: t('dash.participants') || 'Total Participants',
      value: (stats?.totalCustomers || 0).toString(),
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
      timestamp: new Date(order.date).toLocaleDateString(),
    };
  });

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
