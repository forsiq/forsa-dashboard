import React, { useMemo } from 'react';
import { useDashboardData } from '../hooks/useDashboardData';
import { StatsCard } from '@core/core/dashboard/StatsCard';
import { ActivityFeed } from '@core/core/dashboard/ActivityFeed';
import { QuickActions } from '../components/QuickActions';
import { DashboardCharts } from '../components/DashboardCharts';
import { TopAuctions } from '../components/TopAuctions';
import { CriticalNodes } from '../components/CriticalNodes';
import { RoleDashboardStats } from '../components/RoleDashboardStats';
import { useLanguage } from '@core/contexts/LanguageContext';
import { useDashboardRole } from '@core/hooks/useDashboardRole';
import { useIsMobile } from '@core/hooks/useIsMobile';
import { AlertTriangle, RefreshCw, Plus, Gavel, Users, BarChart2, ShoppingBag, Tag, Package } from 'lucide-react';
import type { QuickAction } from '@core/core/dashboard/types';
import type { UserRole } from '@features/auth/types';

type RoleFilteredAction = QuickAction & { allowedRoles?: UserRole[] };

export const DashboardHomePage = () => {
  const { t } = useLanguage();
  const { role } = useDashboardRole();
  const { isMobile } = useIsMobile();
  const { 
    stats, 
    activities, 
    topProducts, 
    categoryData, 
    salesChart, 
    quickCounts,
    isLoading,
    isError,
    refetch
  } = useDashboardData();

  // Build quick actions with live counts, filtered by role
  const quickActionItems = useMemo(() => {
    const allActions: RoleFilteredAction[] = [
      {
        id: 'new-auction',
        label: t('auction.create_auction') || 'New Auction',
        icon: <Plus className="w-4 h-4" />,
        path: '/auctions/add',
        color: 'brand' as const,
        allowedRoles: ['admin', 'merchant'],
      },
      {
        id: 'auctions',
        label: t('sidebar.auctions') || 'Auctions',
        icon: <Gavel className="w-4 h-4" />,
        path: '/auctions',
        color: 'warning' as const,
        count: quickCounts?.totalAuctions,
        isActive: (quickCounts?.activeAuctions ?? 0) > 0,
        allowedRoles: ['admin', 'merchant', 'product_analyst'],
      },
      {
        id: 'new-deal',
        label: t('dash.total_items') || 'New Deal',
        icon: <ShoppingBag className="w-4 h-4" />,
        path: '/group-buying/new',
        color: 'success' as const,
        allowedRoles: ['admin'],
      },
      {
        id: 'group-deals',
        label: t('sidebar.groupBuying') || 'Group Deals',
        icon: <Users className="w-4 h-4" />,
        path: '/group-buying',
        color: 'info' as const,
        count: quickCounts?.activeDeals,
        isActive: (quickCounts?.activeDeals ?? 0) > 0,
        allowedRoles: ['admin', 'product_analyst'],
      },
      {
        id: 'orders',
        label: t('sidebar.orders_section') || 'Orders',
        icon: <Package className="w-4 h-4" />,
        path: '/orders',
        color: 'warning' as const,
        count: quickCounts?.pendingOrders,
        isActive: (quickCounts?.pendingOrders ?? 0) > 0,
        allowedRoles: ['admin', 'merchant', 'customer_support'],
      },
      {
        id: 'categories',
        label: t('sidebar.categories') || 'Categories',
        icon: <Tag className="w-4 h-4" />,
        path: '/categories',
        color: 'brand' as const,
        allowedRoles: ['admin', 'merchant'],
      },
    ];
    return allActions.filter(a => !a.allowedRoles || a.allowedRoles.includes(role));
  }, [t, quickCounts, role]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 border-4 border-brand border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4 text-center">
        <AlertTriangle className="w-12 h-12 text-warning" />
        <p className="text-zinc-text font-bold text-lg">{t('common.error') || 'Something went wrong'}</p>
        <p className="text-zinc-secondary text-sm">{t('common.error_occurred') || 'Failed to load dashboard data'}</p>
        <button
          onClick={() => refetch()}
          className="flex items-center gap-2 px-4 py-2 bg-brand text-black rounded-lg font-bold hover:opacity-90 transition-opacity"
        >
          <RefreshCw className="w-4 h-4" />
          {t('common.retry') || 'Retry'}
        </button>
      </div>
    );
  }

  return (
    <div className={`space-y-8 max-w-[1600px] mx-auto animate-in fade-in duration-700 ${isMobile ? 'p-3' : 'p-4 md:p-6'}`}>
      {/* Header */}
      <div className="space-y-1">
        <h1 className={`${isMobile ? 'text-xl' : 'text-2xl md:text-3xl lg:text-4xl'} font-black text-zinc-text tracking-tight leading-none uppercase`}>
          {t('dash.title')}
        </h1>
        <p className="text-base text-zinc-secondary font-bold uppercase tracking-tight">
          {t('dash.subtitle')}
        </p>
      </div>

      {/* Role-Based Stats Grid */}
      <RoleDashboardStats />

      {/* Critical Nodes */}
      <CriticalNodes />

      {/* Charts Cluster */}
      <DashboardCharts salesData={salesChart || []} categoryData={categoryData || []} />

      {/* Content Grid */}
      <div className={`grid gap-4 md:gap-6 ${isMobile ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-3'}`}>
        <div className="lg:col-span-2 space-y-6">
          <TopAuctions products={topProducts || []} />
          <ActivityFeed activities={activities} />
        </div>
        <div className="lg:col-span-1">
          <QuickActions actions={quickActionItems} />
        </div>
      </div>
    </div>
  );
};
