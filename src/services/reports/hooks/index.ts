/**
 * Reports Hooks - Compatibility Layer
 */

import { useQuery } from '@tanstack/react-query';
import type { ReportData, AnalyticsData, SalesReportData } from '../types';

// Mock report data
const mockReportData: ReportData = {
  totalSales: 125430,
  totalOrders: 1248,
  averageOrderValue: 100.5,
  growth: 12.5,
  period: 'monthly',
};

const mockAnalyticsData: AnalyticsData = {
  sales: [
    { date: '2024-01', value: 45000 },
    { date: '2024-02', value: 52000 },
    { date: '2024-03', value: 48000 },
    { date: '2024-04', value: 61000 },
    { date: '2024-05', value: 58000 },
    { date: '2024-06', value: 67000 },
  ],
  orders: [
    { date: '2024-01', value: 180 },
    { date: '2024-02', value: 210 },
    { date: '2024-03', value: 195 },
    { date: '2024-04', value: 245 },
    { date: '2024-05', value: 230 },
    { date: '2024-06', value: 268 },
  ],
  visitors: [
    { date: '2024-01', value: 4200 },
    { date: '2024-02', value: 4800 },
    { date: '2024-03', value: 4500 },
    { date: '2024-04', value: 5200 },
    { date: '2024-05', value: 4900 },
    { date: '2024-06', value: 5600 },
  ],
  conversion: 3.2,
};

const mockSalesReportData: SalesReportData = {
  products: [
    { name: 'Product A', sales: 245, revenue: 24500 },
    { name: 'Product B', sales: 189, revenue: 18900 },
    { name: 'Product C', sales: 156, revenue: 15600 },
    { name: 'Product D', sales: 134, revenue: 13400 },
    { name: 'Product E', sales: 98, revenue: 9800 },
  ],
  categories: [
    { name: 'Electronics', sales: 412, revenue: 82400 },
    { name: 'Clothing', sales: 289, revenue: 28900 },
    { name: 'Books', sales: 156, revenue: 7800 },
    { name: 'Home & Garden', sales: 201, revenue: 20100 },
  ],
  topCustomers: [
    { name: 'John Doe', email: 'john@example.com', spent: 3450 },
    { name: 'Jane Smith', email: 'jane@example.com', spent: 2890 },
    { name: 'Bob Johnson', email: 'bob@example.com', spent: 2450 },
  ],
};

export function useGetReports(options = {}) {
  return useQuery<ReportData>({
    queryKey: ['reports'],
    queryFn: async () => mockReportData,
    staleTime: 60000,
    ...options,
  });
}

export function useGetAnalytics(options = {}) {
  return useQuery<AnalyticsData>({
    queryKey: ['analytics'],
    queryFn: async () => mockAnalyticsData,
    staleTime: 60000,
    ...options,
  });
}

export function useGetSalesReport(options = {}) {
  return useQuery<SalesReportData>({
    queryKey: ['sales-report'],
    queryFn: async () => mockSalesReportData,
    staleTime: 60000,
    ...options,
  });
}

// Generic list hooks for compatibility
export function useList(filters = {}, options = {}) {
  return useQuery<ReportData[]>({
    queryKey: ['reports', 'list', filters],
    queryFn: async () => [mockReportData],
    staleTime: 60000,
    ...options,
  });
}

export function useById(id: string, options = {}) {
  return useQuery({
    queryKey: ['reports', id],
    queryFn: async () => ({ id, ...mockReportData }),
    staleTime: 60000,
    ...options,
  });
}
