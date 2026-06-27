'use client';

import React from 'react';
import Link from 'next/link';
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
  href: string;
}

const ROLE_STATS: Record<string, StatCardConfig[]> = {
  admin: [
    {
      id: 'total-products',
      titleKey: 'dash.admin.total_products',
      getValue: (d) => (d?.stats?.totalProducts || 0).toString(),
      color: 'brand',
      href: '/auctions',
    },
    {
      id: 'pending-reviews',
      titleKey: 'dash.admin.pending_reviews',
      getValue: (d) => (d?.quickCounts?.pendingOrders || 0).toString(),
      color: 'warning',
      href: '/orders',
    },
    {
      id: 'active-auctions',
      titleKey: 'dash.admin.active_auctions',
      getValue: (d) => (d?.quickCounts?.activeAuctions || 0).toString(),
      color: 'success',
      href: '/auctions',
    },
    {
      id: 'total-revenue',
      titleKey: 'stats.revenue',
      getValue: (d) => formatCurrency(d?.stats?.totalRevenue),
      color: 'info',
      href: '/reports/sales-overview',
    },
  ],
  merchant: [
    {
      id: 'my-products',
      titleKey: 'dash.merchant.my_products',
      getValue: (d) => (d?.stats?.totalProducts || 0).toString(),
      color: 'brand',
      href: '/auctions',
    },
    {
      id: 'my-active-auctions',
      titleKey: 'dash.merchant.my_products_in_auctions',
      getValue: (d) => (d?.quickCounts?.activeAuctions || 0).toString(),
      color: 'success',
      href: '/auctions',
    },
    {
      id: 'my-revenue',
      titleKey: 'dash.merchant.my_revenue',
      getValue: (d) => formatCurrency(d?.stats?.totalRevenue),
      color: 'info',
      href: '/reports/sales-overview',
    },
    {
      id: 'pending-submissions',
      titleKey: 'dash.merchant.pending_submissions',
      getValue: (d) => (d?.quickCounts?.pendingOrders || 0).toString(),
      color: 'warning',
      href: '/orders',
    },
  ],
  customer_support: [
    {
      id: 'total-orders',
      titleKey: 'dash.support.total_orders',
      getValue: (d) => (d?.stats?.totalOrders || 0).toString(),
      color: 'brand',
      href: '/orders',
    },
    {
      id: 'pending-orders',
      titleKey: 'dash.support.pending_orders',
      getValue: (d) => (d?.quickCounts?.pendingOrders || 0).toString(),
      color: 'warning',
      href: '/orders',
    },
    {
      id: 'total-customers',
      titleKey: 'dash.support.total_customers',
      getValue: (d) => (d?.stats?.totalCustomers || 0).toString(),
      color: 'info',
      href: '/customers',
    },
    {
      id: 'resolved-today',
      titleKey: 'dash.support.resolved_today',
      getValue: (d) => (d?.quickCounts?.activeDeals || 0).toString(),
      color: 'success',
      href: '/reports/sales-overview',
    },
  ],
  product_analyst: [
    {
      id: 'total-bids',
      titleKey: 'dash.analyst.total_bids',
      getValue: (d) => (d?.stats?.totalOrders || 0).toString(),
      color: 'brand',
      href: '/orders',
    },
    {
      id: 'most-viewed',
      titleKey: 'dash.analyst.most_viewed',
      getValue: () => '—',
      color: 'info',
      href: '/reports/auction-performance',
    },
    {
      id: 'category-performance',
      titleKey: 'dash.analyst.category_perf',
      getValue: () => '—',
      color: 'success',
      href: '/reports/sales-overview',
    },
    {
      id: 'engagement-trend',
      titleKey: 'dash.analyst.engagement',
      getValue: (d) => (d?.quickCounts?.totalAuctions || 0).toString(),
      color: 'warning',
      href: '/reports/auction-performance',
    },
  ],
};

// ============================================================================
// Config-Driven Stats Renderer
// ============================================================================

export const RoleDashboardStats: React.FC = () => {
  const { role } = useDashboardRole();
  const { t } = useLanguage();
  const { data: statsData, isLoading, isError } = useDashboardStats();
  const stats = statsData;
  const partialError = statsData?.partialError ?? false;

  const configs = ROLE_STATS[role] ?? ROLE_STATS.admin;

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {configs.map((cfg) => (
          <div
            key={cfg.id}
            className="rounded-xl border border-white/5 bg-obsidian-card p-4 space-y-3 animate-pulse"
          >
            <div className="h-3 bg-white/5 rounded w-2/3" />
            <div className="h-7 bg-white/5 rounded w-1/2" />
            <div className="h-1 bg-white/5 rounded" />
          </div>
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {configs.map((cfg) => (
          <div
            key={cfg.id}
            className="rounded-xl border border-warning/20 bg-obsidian-card p-4 space-y-2"
          >
            <p className="text-[10px] font-black text-zinc-muted/60 uppercase tracking-widest">
              {t(cfg.titleKey) || cfg.titleKey}
            </p>
            <p className="text-2xl font-black text-warning/60">—</p>
            <p className="text-[9px] text-warning/40 font-semibold">
              {t('common.error_occurred') || 'Failed to load'}
            </p>
          </div>
        ))}
      </div>
    );
  }

  const cards: (StatCardType & { href: string })[] = configs.map((cfg) => ({
    id: cfg.id,
    title: t(cfg.titleKey) || cfg.titleKey,
    value: cfg.getValue(stats),
    color: cfg.color,
    href: cfg.href,
  }));

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {partialError && (
        <div className="col-span-2 lg:col-span-4 mb-2">
          <p className="text-[10px] text-warning/50 font-semibold uppercase tracking-widest">
            {t('dash.partial_data_warning') || 'Some data may be incomplete'}
          </p>
        </div>
      )}
      {cards.map((stat) => (
        <Link
          key={stat.id}
          href={stat.href}
          className="block rounded-xl transition-all hover:border-brand/40 hover:shadow-lg hover:shadow-brand/5 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
        >
          <StatsCard stat={stat} />
        </Link>
      ))}
    </div>
  );
};
