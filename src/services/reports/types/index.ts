// --- Report Types ---

export interface ReportData {
  totalSales: number;
  totalOrders: number;
  averageOrderValue: number;
  growth: number;
  period: string;
}

export interface AnalyticsData {
  sales: { date: string; value: number }[];
  orders: { date: string; value: number }[];
  visitors: { date: string; value: number }[];
  conversion: number;
}

export interface SalesReportData {
  products: { name: string; sales: number; revenue: number }[];
  categories: { name: string; sales: number; revenue: number }[];
  topCustomers: { name: string; email: string; spent: number }[];
}
