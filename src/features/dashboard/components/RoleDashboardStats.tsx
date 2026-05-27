'use client';

import React from 'react';
import { useLanguage } from '@core/contexts/LanguageContext';
import { formatCurrency } from '@core/lib/utils/formatCurrency';
import { StatsCard } from '@core/core/dashboard/StatsCard';
import type { StatCard as StatCardType } from '@core/core/dashboard/types';
import { useDashboardRole } from '@core/hooks/useDashboardRole';
import { useDashboardStats } from '../hooks/useDashboardData';

// ============================================================================
// Stat Card Config per Role
// ============================================================================

interface StatCardConfig {
  id: string;
  titleKey: string;
  getValue: (data: ReturnType<typeof useDashboardStats>['data']) => string;
  color: StatCardType['color'];
}

const ROLE_STATS: Record<string, StatCardConfig[]> = {
  admin: [
    {
      id: 'total-products',
      titleKey: 'dash.admin.total_products',
      getValue: (d) => (d?.stats?.totalProducts || 0).toString(),
      color: 'brand',
    },
    {
      id: 'pending-reviews',
      titleKey: 'dash.admin.pending_reviews',
      getValue: () => '0',
      color: 'warning',
    },
    {
      id: 'active-auctions',
      titleKey: 'dash.admin.active_auctions',
      getValue: (d) => (d?.quickCounts?.activeAuctions || 0).toString(),
      color: 'success',
    },
    {
      id: 'total-revenue',
      titleKey: 'stats.revenue',
      getValue: (d) => formatCurrency(d?.stats?.totalRevenue),
      color: 'info',
    },
  ],
  merchant: [
    {
      id: 'my-products',
      titleKey: 'dash.merchant.my_products',
      getValue: (d) => (d?.stats?.totalProducts || 0).toString(),
      color: 'brand',
    },
    {
      id: 'my-active-auctions',
      titleKey: 'dash.merchant.my_products_in_auctions',
      getValue: (d) => (d?.quickCounts?.activeAuctions || 0).toString(),
      color: 'success',
    },
    {
      id: 'my-revenue',
      titleKey: 'dash.merchant.my_revenue',
      getValue: (d) => formatCurrency(d?.stats?.totalRevenue),
      color: 'info',
    },
    {
      id: 'pending-submissions',
      titleKey: 'dash.merchant.pending_submissions',
      getValue: () => '0',
      color: 'warning',
    },
  ],
  customer_support: [
    {
      id: 'total-orders',
      titleKey: 'dash.support.total_orders',
      getValue: (d) => (d?.stats?.totalOrders || 0).toString(),
      color: 'brand',
    },
    {
      id: 'pending-orders',
      titleKey: 'dash.support.pending_orders',
      getValue: (d) => (d?.quickCounts?.pendingOrders || 0).toString(),
      color: 'warning',
    },
    {
      id: 'total-customers',
      titleKey: 'dash.support.total_customers',
      getValue: (d) => (d?.stats?.totalCustomers || 0).toString(),
      color: 'info',
    },
    {
      id: 'resolved-today',
      titleKey: 'dash.support.resolved_today',
      getValue: () => '0',
      color: 'success',
    },
  ],
  product_analyst: [
    {
      id: 'total-bids',
      titleKey: 'dash.analyst.total_bids',
      getValue: (d) => (d?.stats?.totalOrders || 0).toString(),
      color: 'brand',
    },
    {
      id: 'most-viewed',
      titleKey: 'dash.analyst.most_viewed',
      getValue: () => '—',
      color: 'info',
    },
    {
      id: 'category-performance',
      titleKey: 'dash.analyst.category_perf',
      getValue: () => '—',
      color: 'success',
    },
    {
      id: 'engagement-trend',
      titleKey: 'dash.analyst.engagement',
      getValue: (d) => (d?.quickCounts?.totalAuctions || 0).toString(),
      color: 'warning',
    },
  ],
};

// ============================================================================
// Config-Driven Stats Renderer
// ============================================================================

export const RoleDashboardStats: React.FC = () => {
  const { role } = useDashboardRole();
  const { t } = useLanguage();
  const { data: stats } = useDashboardStats();

  const configs = ROLE_STATS[role] ?? ROLE_STATS.admin;

  const cards: StatCardType[] = configs.map((cfg) => ({
    id: cfg.id,
    title: t(cfg.titleKey) || cfg.titleKey,
    value: cfg.getValue(stats),
    color: cfg.color,
  }));

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((stat) => (
        <StatsCard key={stat.id} stat={stat} />
      ))}
    </div>
  );
};
