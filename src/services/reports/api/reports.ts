/** Reports API - Using REST */
import { auctionBaseApi } from '../../../features/auctions/api/auction-api';
import { orderBaseApi } from '../../orders/api/orders';
import type { 
  ReportData, 
  AnalyticsData, 
  SalesReportData 
} from '../types';

/**
 * Get overall reports summary
 */
export async function getReports(period = 'monthly'): Promise<ReportData> {
  try {
    // Ideally we'd have a dedicated analytics API, but as a fallback/interim:
    const [auctionStats, orderStats] = await Promise.all([
      auctionBaseApi.getStats(),
      orderBaseApi.getStats()
    ]);

    const aStats = auctionStats.data;
    const oStats = orderStats.data;

    return {
      totalSales: (oStats.total_revenue as number) || 0,
      totalOrders: (oStats.total as number) || 0,
      totalCustomers: 0, // Customer stats not aggregated yet
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

/**
 * Get detailed analytics data
 */
export async function getAnalytics(_service = 'all'): Promise<AnalyticsData> {
  // Mocking analytics data trend since backend doesn't provide historical data in stats
  const today = new Date();
  const sales: { date: string; value: number }[] = [];
  const orders: { date: string; value: number }[] = [];
  const visitors: { date: string; value: number }[] = [];

  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];

    sales.push({ date: dateStr, value: Math.floor(Math.random() * 5000) });
    orders.push({ date: dateStr, value: Math.floor(Math.random() * 50) });
    visitors.push({ date: dateStr, value: Math.floor(Math.random() * 500) });
  }

  return {
    sales,
    orders,
    visitors,
    conversion: 2.4,
  };
}

/**
 * Get sales report data
 */
export async function getSalesReport(period = 'monthly'): Promise<SalesReportData> {
  return {
    products: [],
    categories: [],
    topCustomers: [],
  };
}

export const reportKeys = {
  all: ['reports'] as const,
  summary: (period: string) => [...reportKeys.all, 'summary', period] as const,
  analytics: (service: string) => [...reportKeys.all, 'analytics', service] as const,
  sales: (period: string) => [...reportKeys.all, 'sales', period] as const,
};
