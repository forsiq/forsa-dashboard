import { useQuery } from '@tanstack/react-query';
import { gqlQuery } from '@core/services/GraphQLClient';
import { useLanguage } from '@core/contexts/LanguageContext';
import { ActivityItem, StatCard } from '../types';
import { TrendingUp, Gavel, Package, Users } from 'lucide-react';
import React from 'react';

// ============================================================================
// GraphQL Queries
// ============================================================================

const GET_PRODUCTS_COUNT = `
  query GetProducts($limit: Int) {
    products(limit: $limit) {
      id
      name
      status
      categoryId
      createdAt
    }
  }
`;

const GET_CATEGORIES = `
  query GetCategories {
    categories {
      id
      name
    }
  }
`;

const GET_CUSTOMERS = `
  query GetCustomers {
    customers {
      id
      firstName
      lastName
      email
      createdAt
    }
  }
`;

const GET_AUCTIONS = `
  query GetAuctions {
    auctions {
      id
      title
      status
      currentBid
      createdAt
    }
  }
`;

const GET_GROUP_BUYINGS = `
  query GetGroupBuyings {
    groupBuying {
      id
      title
      status
      dealPrice
      currentParticipants
      createdAt
    }
  }
`;

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
// Dashboard Stats Hook
// ============================================================================

/**
 * Hook to fetch dashboard statistics from multiple sources
 */
export const useDashboardStats = () => {
  return useQuery({
    queryKey: ['dashboard', 'stats'],
    queryFn: async (): Promise<DashboardStats> => {
      // Fetch data from multiple services in parallel using ACTUAL existing schema fields
      const [productsData, auctionsData] = await Promise.all([
        gqlQuery<{ products: any[] }>(`query { products(limit: 100) { id } }`, {}, 'product').catch(() => ({ products: [] })),
        gqlQuery<{ auctions: any[] }>(`
          query GetAuctions {
            auctions(limit: 100) {
              id
              status
              currentBid
            }
          }
        `, {}, 'auction').catch(() => ({ auctions: [] })),
      ]);

      const products = productsData?.products || [];
      const auctions = auctionsData?.auctions || [];

      // Calculate stats based on available data
      const activeAuctions = auctions.filter(a => a.status === 'active');
      const totalRevenue = auctions
        .filter(a => ['ended', 'sold'].includes(a.status))
        .reduce((sum, a) => sum + (a.currentBid || 0), 0);

      return {
        totalRevenue: totalRevenue,
        revenueChange: 0,
        totalOrders: activeAuctions.length,
        ordersChange: 0,
        totalProducts: products.length,
        productsChange: 0,
        totalCustomers: 0, // Disabled - customer service not available
        customersChange: 0,
      };
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

// ============================================================================
// Recent Orders Hook
// ============================================================================

/**
 * Hook to fetch recent orders/activities
 */
export const useRecentOrders = () => {
  return useQuery({
    queryKey: ['dashboard', 'recentOrders'],
    queryFn: async (): Promise<RecentOrder[]> => {
      // Fetch recent auctions and group buyings
      const [auctionsData, groupBuyingsData] = await Promise.all([
        gqlQuery<{ auctions: any[] }>(GET_AUCTIONS, { limit: 5 }, 'auction').catch(() => ({ auctions: [] })),
        gqlQuery<{ groupBuying: any[] }>(GET_GROUP_BUYINGS, { limit: 5 }, 'auction').catch(() => ({ groupBuying: [] })),
      ]);

      const auctions = auctionsData?.auctions || [];
      const groupBuyings = groupBuyingsData?.groupBuying || [];

      // Convert to unified order format
      const orders: RecentOrder[] = [
        ...auctions.map((a: any) => ({
          id: `AUC-${a.id}`,
          customerName: 'Auction',
          productName: a.title || 'Product',
          amount: a.currentBid || 0,
          status: a.status,
          date: a.createdAt,
        })),
        ...groupBuyings.map((g: any) => ({
          id: `GB-${g.id}`,
          customerName: `${g.currentParticipants || 0} participants`,
          productName: g.title || 'Group Buying',
          amount: (g.dealPrice || 0) * (g.currentParticipants || 0),
          status: g.status,
          date: g.createdAt,
        })),
      ];

      // Sort by date and take first 5
      return orders.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5);
    },
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
};

// ============================================================================
// Top Products Hook
// ============================================================================

/**
 * Hook to fetch top products
 */
export const useTopProducts = () => {
  return useQuery({
    queryKey: ['dashboard', 'topProducts'],
    queryFn: async (): Promise<TopProduct[]> => {
      const [productsData, categoriesData] = await Promise.all([
        gqlQuery<{ products: any[] }>(GET_PRODUCTS_COUNT, { limit: 10 }, 'product').catch(() => ({ products: [] })),
        gqlQuery<{ categories: any[] }>(GET_CATEGORIES, {}, 'product').catch(() => ({ categories: [] })),
      ]);

      const products = productsData?.products || [];
      const categories = categoriesData?.categories || [];

      // Create category map
      const categoryMap = new Map(categories.map((c: any) => [c.id, c.name]));

      return products.slice(0, 5).map((p: any, index: number) => ({
        id: p.id,
        name: p.name || `Product ${index + 1}`,
        category: categoryMap.get(p.categoryId?.toString()) || 'Uncategorized',
        sales: 0,
        revenue: p.price || 0,
        stock: p.stock || 0,
      }));
    },
    staleTime: 1000 * 60 * 5,
  });
};

// ============================================================================
// Category Distribution Hook
// ============================================================================

/**
 * Hook to fetch category distribution for pie chart
 */
export const useCategoryDistribution = () => {
  return useQuery({
    queryKey: ['dashboard', 'categoryDistribution'],
    queryFn: async (): Promise<CategoryDistribution[]> => {
      const [productsData, categoriesData] = await Promise.all([
        gqlQuery<{ products: any[] }>(GET_PRODUCTS_COUNT, { limit: 1000 }, 'product').catch(() => ({ products: [] })),
        gqlQuery<{ categories: any[] }>(GET_CATEGORIES, {}, 'product').catch(() => ({ categories: [] })),
      ]);

      const products = productsData?.products || [];
      const categories = categoriesData?.categories || [];

      // Count products per category
      const categoryCount = new Map<string, number>();
      products.forEach((p: any) => {
        const catId = p.categoryId?.toString() || 'uncategorized';
        categoryCount.set(catId, (categoryCount.get(catId) || 0) + 1);
      });

      // Create category name map
      const categoryMap = new Map(categories.map((c: any) => [c.id, c.name]));

      const colors = [
        'var(--chart-1)',
        'var(--chart-2)',
        'var(--chart-3)',
        'var(--chart-4)',
        'var(--chart-5)',
      ];

      // Convert to array and sort by count
      return Array.from(categoryCount.entries())
        .map(([catId, count], index) => ({
          category: categoryMap.get(catId) || 'Uncategorized',
          orders: count,
          fill: colors[index % colors.length],
        }))
        .sort((a, b) => b.orders - a.orders)
        .slice(0, 5);
    },
    staleTime: 1000 * 60 * 5,
  });
};

// ============================================================================
// Sales Chart Data Hook
// ============================================================================

/**
 * Hook to fetch sales chart data (simulated based on creation dates)
 */
export const useSalesChartData = () => {
  return useQuery({
    queryKey: ['dashboard', 'salesChart'],
    queryFn: async (): Promise<ChartDataPoint[]> => {
      const [auctionsData, groupBuyingsData] = await Promise.all([
        gqlQuery<{ auctions: any[] }>(GET_AUCTIONS, { limit: 100 }, 'auction').catch(() => ({ auctions: [] })),
        gqlQuery<{ groupBuying: any[] }>(GET_GROUP_BUYINGS, { limit: 100 }, 'auction').catch(() => ({ groupBuying: [] })),
      ]);

      const auctions = auctionsData?.auctions || [];
      const groupBuyings = groupBuyingsData?.groupBuying || [];

      // Generate last 30 days of data
      const today = new Date();
      const chartData: ChartDataPoint[] = [];

      for (let i = 29; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];

        // Count items created on this date
        const dayAuctions = auctions.filter((a: any) =>
          a.createdAt?.startsWith(dateStr)
        );
        const dayGroupBuyings = groupBuyings.filter((g: any) =>
          g.createdAt?.startsWith(dateStr)
        );

        const revenue = dayAuctions.reduce((sum: number, a: any) => sum + (a.currentBid || 0), 0)
          + dayGroupBuyings.reduce((sum: number, g: any) => sum + ((g.dealPrice || 0) * (g.currentParticipants || 0)), 0);

        const orders = dayAuctions.length + dayGroupBuyings.length;

        chartData.push({
          date: dateStr,
          revenue: revenue, // Show actual data, 0 if none
          orders: orders, // Show actual data, 0 if none
        });
      }

      return chartData;
    },
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
};

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
// Legacy Hook (for backward compatibility)
// ============================================================================

/**
 * Combined hook for all dashboard data
 */
export const useDashboardData = () => {
  const { t } = useLanguage();
  const { data: stats, isLoading: statsLoading, isError: statsError, refetch: refetchStats } = useDashboardStats();
  const { data: recentActivities, isLoading: activitiesLoading, isError: activitiesError, refetch: refetchActivities } = useRecentOrders();

  const dashboardStats: StatCard[] = [
    {
      id: 'revenue',
      title: t('stats.revenue') || 'Total Revenue',
      value: `$${(stats?.totalRevenue || 0).toLocaleString()}`,
      change: stats?.revenueChange || 0,
      color: 'brand',
    },
    {
      id: 'orders',
      title: t('stats.orders') || 'Active Auctions',
      value: (stats?.totalOrders || 0).toString(),
      change: stats?.ordersChange || 0,
      color: 'success',
    },
    {
      id: 'products',
      title: t('stats.products') || 'Total Products',
      value: (stats?.totalProducts || 0).toString(),
      change: stats?.productsChange || 0,
      color: 'warning',
    },
    {
      id: 'customers',
      title: t('stats.customers') || 'Total Customers',
      value: (stats?.totalCustomers || 0).toString(),
      change: stats?.customersChange || 0,
      color: 'info',
    },
  ];

  // Convert RecentOrder to ActivityItem
  const activities: ActivityItem[] = (recentActivities || []).map(order => ({
    id: order.id,
    type: order.status === 'active' ? 'success' : 'info',
    title: order.productName,
    description: `${order.customerName} - $${order.amount.toLocaleString()}`,
    timestamp: new Date(order.date).toLocaleString(),
  }));

  return {
    stats: dashboardStats,
    activities,
    isLoading: statsLoading || activitiesLoading,
    isError: statsError || activitiesError,
    refetch: () => {
      refetchStats();
      refetchActivities();
    },
  };
};
