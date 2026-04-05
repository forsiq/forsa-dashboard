/**
 * Reports Hooks - Production Layer
 */

import { useQuery } from '@tanstack/react-query';
import * as api from '../graphql/api';
import type { ReportData, AnalyticsData, SalesReportData } from '../types';

/**
 * Fetch overall reports summary
 * 
 * @example
 * const { data, isLoading } = useGetReports();
 */
export function useGetReports(options = {}) {
  return useQuery<ReportData>({
    queryKey: api.reportKeys.summary('monthly'), // Fixed as 'monthly' for now
    queryFn: () => api.getReports(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
}

/**
 * Fetch detailed analytics for charts
 * 
 * @example
 * const { data, isLoading } = useGetAnalytics();
 */
export function useGetAnalytics(options = {}) {
  return useQuery<AnalyticsData>({
    queryKey: api.reportKeys.analytics('all'),
    queryFn: () => api.getAnalytics(),
    staleTime: 5 * 60 * 1000,
    ...options,
  });
}

/**
 * Fetch specific sales report data
 * 
 * @example
 * const { data, isLoading } = useGetSalesReport();
 */
export function useGetSalesReport(options = {}) {
  return useQuery<SalesReportData>({
    queryKey: api.reportKeys.sales('monthly'),
    queryFn: () => api.getSalesReport(),
    staleTime: 10 * 60 * 1000, // 10 minutes
    ...options,
  });
}

/**
 * Generic list hook (Legacy Support)
 */
export function useList(filters = {}, options = {}) {
  return useQuery<ReportData[]>({
    queryKey: [...api.reportKeys.all, 'list', filters],
    queryFn: async () => {
      const data = await api.getReports();
      return [data];
    },
    ...options,
  });
}

/**
 * Generic by-id hook (Legacy Support)
 */
export function useById(id: string, options = {}) {
  return useQuery({
    queryKey: [...api.reportKeys.all, id],
    queryFn: async () => {
      const data = await api.getReports();
      return { id, ...data };
    },
    ...options,
  });
}
