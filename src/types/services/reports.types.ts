/**
 * Report Types
 * Ready-made service types - DO NOT MODIFY unless necessary
 */

import type { ApiResponse } from '../common';

/**
 * Report types
 */
export type ReportType = 'sales' | 'inventory' | 'customers' | 'orders' | 'financial';
export type ReportPeriod = 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly' | 'custom';

/**
 * Report entity
 */
export interface Report {
  id: string;
  name: string;
  type: ReportType;
  period: ReportPeriod;
  startDate: string;
  endDate: string;
  status: 'pending' | 'generating' | 'completed' | 'failed';
  generatedBy?: string;
  fileUrl?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Sales report data
 */
export interface SalesReportData {
  totalSales: number;
  totalOrders: number;
  averageOrderValue: number;
  topProducts: { productName: string; quantity: number; revenue: number }[];
  salesByPeriod: { date: string; sales: number; orders: number }[];
  salesByCategory: { categoryName: string; sales: number }[];
}

/**
 * Inventory report data
 */
export interface InventoryReportData {
  totalProducts: number;
  totalValue: number;
  lowStockItems: { productName: string; stock: number; threshold: number }[];
  stockByWarehouse: { warehouseName: string; totalProducts: number; totalValue: number }[];
  stockMovements: StockMovementSummary[];
}

/**
 * Stock movement summary
 */
export interface StockMovementSummary {
  warehouseName: string;
  in: number;
  out: number;
  transfers: number;
  adjustments: number;
}

/**
 * Generate report request
 */
export interface GenerateReportRequest {
  type: ReportType;
  period: ReportPeriod;
  startDate?: string;
  endDate?: string;
  filters?: Record<string, unknown>;
}

/**
 * Report list params
 */
export interface GetReportsParams {
  page?: number;
  pageSize?: number;
  type?: ReportType | 'all';
  status?: string;
  startDate?: string;
  endDate?: string;
}

/**
 * Dashboard stats
 */
export interface DashboardStats {
  sales: { total: number; growth: number; period: string };
  orders: { total: number; growth: number; period: string };
  customers: { total: number; growth: number; period: string };
  revenue: { total: number; growth: number; period: string };
  inventory: { totalProducts: number; lowStock: number; value: number };
}

/**
 * API response types for reports
 */
export type ReportsListResponse = ApiResponse<{ reports: Report[] }>;
export type SalesReportDataResponse = ApiResponse<SalesReportData>;
export type InventoryReportDataResponse = ApiResponse<InventoryReportData>;
export type DashboardStatsResponse = ApiResponse<DashboardStats>;
