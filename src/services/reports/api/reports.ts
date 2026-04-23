/** Reports API - Using REST */
import { auctionBaseApi } from '../../../features/auctions/api/auction-api';
import { orderBaseApi } from '../../orders/api/orders';
import type {
  ReportData,
  AnalyticsData,
  SalesReportData
} from '../types';

export async function getReports(period = 'monthly'): Promise<ReportData> {
  try {
    const [auctionStats, orderStats] = await Promise.all([
      auctionBaseApi.getStats(),
      orderBaseApi.getStats()
    ]);

    const aStats = (auctionStats.data || {}) as any;
    const oStats = (orderStats.data || {}) as any;

    return {
      totalSales: (oStats.total_revenue as number) || 0,
      totalOrders: (oStats.total as number) || 0,
      totalCustomers: 0,
      averageOrderValue: (oStats.average_order_value as number) || 0,
      growth: 0,
      period,
    };
  } catch (error) {
    console.error('Failed to fetch reports:', error);
    return {
      totalSales: 0,
      totalOrders: 0,
      totalCustomers: 0,
      averageOrderValue: 0,
      growth: 0,
      period,
    };
  }
}

export async function getAnalytics(_service = 'all'): Promise<AnalyticsData> {
  const [auctionStats, orderStats] = await Promise.all([
    auctionBaseApi.getStats(),
    orderBaseApi.getStats()
  ]).catch(() => [{ data: {} }, { data: {} }]);

  const aStats = (auctionStats.data || {}) as any;
  const oStats = (orderStats.data || {}) as any;

  const today = new Date();
  const sales: { date: string; value: number }[] = [];
  const orders: { date: string; value: number }[] = [];
  const visitors: { date: string; value: number }[] = [];

  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    sales.push({ date: dateStr, value: 0 });
    orders.push({ date: dateStr, value: 0 });
    visitors.push({ date: dateStr, value: 0 });
  }

  const totalRevenue = (oStats.total_revenue as number) || 0;
  const activeUsers = (aStats.active_users as number) || 0;
  const avgOrderValue = (oStats.average_order_value as number) || 0;
  const conversionRate = 0;

  return {
    sales,
    orders,
    visitors,
    conversion: conversionRate,
    totalRevenue,
    totalRevenueChange: '',
    activeUsers,
    activeUsersChange: '',
    avgOrderValue,
    avgOrderValueChange: '',
    conversionRate,
    conversionRateChange: '',
  };
}

export async function getSalesReport(period = 'monthly'): Promise<SalesReportData> {
  const [orderStats] = await Promise.all([
    orderBaseApi.getStats()
  ]).catch(() => [{ data: {} }]);

  const oStats = (orderStats?.data || {}) as any;

  const grossSales = (oStats.total_revenue as number) || 0;
  const taxCollected = 0;
  const shipping = 0;
  const netProfit = 0;

  return {
    products: [],
    categories: [],
    topCustomers: [],
    grossSales,
    grossSalesChange: '',
    netProfit,
    netProfitChange: '',
    taxCollected,
    taxCollectedChange: '',
    shipping,
    shippingChange: '',
  };
}

export const reportKeys = {
  all: ['reports'] as const,
  summary: (period: string) => [...reportKeys.all, 'summary', period] as const,
  analytics: (service: string) => [...reportKeys.all, 'analytics', service] as const,
  sales: (period: string) => [...reportKeys.all, 'sales', period] as const,
};
