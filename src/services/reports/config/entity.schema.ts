/** Reports Entity Schema */
export interface Report {
  id: string;
  name: string;
  type: ReportType;
  description?: string;
  createdAt: string;
  generatedAt?: string;
}

export type ReportType = 'sales' | 'inventory' | 'customers' | 'analytics';

export interface SalesReportData {
  totalRevenue: number;
  orderCount: number;
  averageOrderValue: number;
  topProducts: Array<{ name: string; quantity: number; revenue: number }>;
}

export interface InventoryReportData {
  totalProducts: number;
  lowStock: number;
  outOfStock: number;
  totalValue: number;
  categoryBreakdown: Array<{ category: string; count: number; value: number }>;
}

export interface ReportFilters {
  type?: ReportType;
  startDate?: string;
  endDate?: string;
  format?: 'pdf' | 'excel' | 'csv';
}

export const reportsEntityMeta = {
  name: 'reports',
  singular: 'report',
  plural: 'reports',
  endpoint: '/api/v1/reports',
  basePath: '/reports',
  i18nPrefix: 'report',
  sortableFields: ['name', 'createdAt'] as const,
  filterableFields: ['type', 'startDate', 'endDate'] as const,
  requiredFields: ['name', 'type'] as const,
  hiddenFields: ['createdAt', 'updatedAt'] as const,
};
