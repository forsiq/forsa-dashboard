import { useQuery } from '@tanstack/react-query';
import type { ReportData, AnalyticsData, SalesReportData } from '../types';

// Mock data generators
const generateReportData = (): ReportData => ({
  totalSales: 15420,
  totalOrders: 423,
  averageOrderValue: 36.45,
  growth: 12.5,
  period: 'This Month',
});

const generateAnalyticsData = (): AnalyticsData => ({
  sales: Array.from({ length: 30 }, (_, i) => ({
    date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    value: Math.floor(Math.random() * 5000) + 1000,
  })),
  orders: Array.from({ length: 30 }, (_, i) => ({
    date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    value: Math.floor(Math.random() * 200) + 50,
  })),
  visitors: Array.from({ length: 30 }, (_, i) => ({
    date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    value: Math.floor(Math.random() * 10000) + 2000,
  })),
  conversion: 3.2,
});

const generateSalesReportData = (): SalesReportData => ({
  products: [
    { name: 'Product A', sales: 120, revenue: 4200 },
    { name: 'Product B', sales: 98, revenue: 3150 },
    { name: 'Product C', sales: 85, revenue: 2800 },
  ],
  categories: [
    { name: 'Electronics', sales: 303, revenue: 10150 },
    { name: 'Clothing', sales: 120, revenue: 4100 },
  ],
  topCustomers: [
    { name: 'John Doe', email: 'john@example.com', spent: 1250 },
    { name: 'Jane Smith', email: 'jane@example.com', spent: 980 },
  ],
});

// --- Query Hooks ---

export function useGetReports() {
  return useQuery({
    queryKey: ['reports'],
    queryFn: generateReportData,
    staleTime: 2 * 60 * 1000,
  });
}

export function useGetAnalytics() {
  return useQuery({
    queryKey: ['analytics'],
    queryFn: generateAnalyticsData,
    staleTime: 1 * 60 * 1000,
  });
}

export function useGetSalesReport() {
  return useQuery({
    queryKey: ['sales-report'],
    queryFn: generateSalesReportData,
    staleTime: 5 * 60 * 1000,
  });
}
