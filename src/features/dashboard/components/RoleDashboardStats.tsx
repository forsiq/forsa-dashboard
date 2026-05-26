'use client';

import React from 'react';
import Cookies from 'js-cookie';
import {
  Package,
  Gavel,
  DollarSign,
  Users,
  Clock,
  Eye,
  BarChart2,
  ShoppingCart,
  AlertTriangle,
  TrendingUp,
  CheckCircle,
  FileSearch,
  UserCheck,
} from 'lucide-react';
import { useLanguage } from '@core/contexts/LanguageContext';
import { formatCurrency } from '@core/lib/utils/formatCurrency';
import { StatsCard } from '@core/core/dashboard/StatsCard';
import type { StatCard as StatCardType } from '@core/core/dashboard/types';
import { decodeJwtPayload, extractRole } from '@core/components/RoleGuard';
import type { UserRole } from '@features/auth/types';
import { useDashboardStats } from '../hooks/useDashboardData';

function getCurrentRole(): UserRole {
  if (typeof window === 'undefined') return 'admin';
  const token = Cookies.get('access');
  if (!token) return 'admin';
  const payload = decodeJwtPayload(token);
  return payload ? extractRole(payload) : 'admin';
}

// ============================================================================
// Admin Stats
// ============================================================================

const AdminStats: React.FC<{ stats: ReturnType<typeof useDashboardStats>['data'] }> = ({ stats }) => {
  const { t } = useLanguage();
  const dashboardStats = stats?.stats;
  const quickCounts = stats?.quickCounts;

  const cards: StatCardType[] = [
    {
      id: 'total-products',
      title: t('dash.admin.total_products') || 'Total Products',
      value: (dashboardStats?.totalProducts || 0).toString(),
      change: dashboardStats?.productsChange,
      color: 'brand',
    },
    {
      id: 'pending-reviews',
      title: t('dash.admin.pending_reviews') || 'Pending Reviews',
      value: t('dash.admin.pending_count') || '0',
      color: 'warning',
    },
    {
      id: 'active-auctions',
      title: t('dash.admin.active_auctions') || 'Active Auctions',
      value: (quickCounts?.activeAuctions || 0).toString(),
      color: 'success',
    },
    {
      id: 'total-revenue',
      title: t('stats.revenue') || 'Total Revenue',
      value: formatCurrency(dashboardStats?.totalRevenue),
      change: dashboardStats?.revenueChange,
      color: 'info',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((stat) => (
        <StatsCard key={stat.id} stat={stat} />
      ))}
    </div>
  );
};

// ============================================================================
// Merchant Stats
// ============================================================================

const MerchantStats: React.FC<{ stats: ReturnType<typeof useDashboardStats>['data'] }> = ({ stats }) => {
  const { t } = useLanguage();
  const dashboardStats = stats?.stats;
  const quickCounts = stats?.quickCounts;

  const cards: StatCardType[] = [
    {
      id: 'my-products',
      title: t('dash.merchant.my_products') || 'My Products',
      value: (dashboardStats?.totalProducts || 0).toString(),
      color: 'brand',
    },
    {
      id: 'my-active-auctions',
      title: t('dash.merchant.my_products_in_auctions') || 'My Products in Auctions',
      value: (quickCounts?.activeAuctions || 0).toString(),
      color: 'success',
    },
    {
      id: 'my-revenue',
      title: t('dash.merchant.my_revenue') || 'My Revenue',
      value: formatCurrency(dashboardStats?.totalRevenue),
      color: 'info',
    },
    {
      id: 'pending-submissions',
      title: t('dash.merchant.pending_submissions') || 'Pending Submissions',
      value: '0',
      color: 'warning',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((stat) => (
        <StatsCard key={stat.id} stat={stat} />
      ))}
    </div>
  );
};

// ============================================================================
// Customer Support Stats
// ============================================================================

const CustomerSupportStats: React.FC<{ stats: ReturnType<typeof useDashboardStats>['data'] }> = ({ stats }) => {
  const { t } = useLanguage();
  const dashboardStats = stats?.stats;
  const quickCounts = stats?.quickCounts;

  const cards: StatCardType[] = [
    {
      id: 'total-orders',
      title: t('dash.support.total_orders') || 'Total Orders',
      value: (dashboardStats?.totalOrders || 0).toString(),
      color: 'brand',
    },
    {
      id: 'pending-orders',
      title: t('dash.support.pending_orders') || 'Pending Orders',
      value: (quickCounts?.pendingOrders || 0).toString(),
      color: 'warning',
    },
    {
      id: 'total-customers',
      title: t('dash.support.total_customers') || 'Total Customers',
      value: (dashboardStats?.totalCustomers || 0).toString(),
      color: 'info',
    },
    {
      id: 'resolved-today',
      title: t('dash.support.resolved_today') || 'Resolved Today',
      value: '0',
      color: 'success',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((stat) => (
        <StatsCard key={stat.id} stat={stat} />
      ))}
    </div>
  );
};

// ============================================================================
// Product Analyst Stats
// ============================================================================

const ProductAnalystStats: React.FC<{ stats: ReturnType<typeof useDashboardStats>['data'] }> = ({ stats }) => {
  const { t } = useLanguage();
  const dashboardStats = stats?.stats;
  const quickCounts = stats?.quickCounts;

  const cards: StatCardType[] = [
    {
      id: 'total-bids',
      title: t('dash.analyst.total_bids') || 'Total Bids Today',
      value: (dashboardStats?.totalOrders || 0).toString(),
      color: 'brand',
    },
    {
      id: 'most-viewed',
      title: t('dash.analyst.most_viewed') || 'Most Viewed',
      value: '—',
      color: 'info',
    },
    {
      id: 'category-performance',
      title: t('dash.analyst.category_perf') || 'Category Performance',
      value: '—',
      color: 'success',
    },
    {
      id: 'engagement-trend',
      title: t('dash.analyst.engagement') || 'Engagement Trend',
      value: (quickCounts?.totalAuctions || 0).toString(),
      color: 'warning',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((stat) => (
        <StatsCard key={stat.id} stat={stat} />
      ))}
    </div>
  );
};

// ============================================================================
// Role Dashboard Selector
// ============================================================================

export const RoleDashboardStats: React.FC = () => {
  const role = getCurrentRole();
  const { data: stats } = useDashboardStats();

  switch (role) {
    case 'admin':
      return <AdminStats stats={stats} />;
    case 'merchant':
      return <MerchantStats stats={stats} />;
    case 'customer_support':
      return <CustomerSupportStats stats={stats} />;
    case 'product_analyst':
      return <ProductAnalystStats stats={stats} />;
    default:
      return <AdminStats stats={stats} />;
  }
};
