// --- Report Types ---

export interface ReportData {
  totalSales: number;
  totalOrders: number;
  totalCustomers: number;
  averageOrderValue: number;
  growth: number;
  period: string;
}

export interface AnalyticsData {
  sales: { date: string; value: number }[];
  orders: { date: string; value: number }[];
  visitors: { date: string; value: number }[];
  conversion: number;
  totalRevenue: number;
  totalRevenueChange: string;
  activeUsers: number;
  activeUsersChange: string;
  avgOrderValue: number;
  avgOrderValueChange: string;
  conversionRate: number;
  conversionRateChange: string;
}

export interface SalesReportData {
  products: { name: string; sales: number; revenue: number }[];
  categories: { name: string; sales: number; revenue: number }[];
  topCustomers: { name: string; email: string; spent: number }[];
  grossSales: number;
  grossSalesChange: string;
  netProfit: number;
  netProfitChange: string;
  taxCollected: number;
  taxCollectedChange: string;
  shipping: number;
  shippingChange: string;
}
