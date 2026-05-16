import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { StatsGrid } from '@core/components/Layout/StatsGrid';
import { Plus, Search, Filter, ChevronLeft, ChevronRight, Package, TrendingUp, AlertCircle, DollarSign } from 'lucide-react';
import { useLanguage } from '@core/contexts/LanguageContext';
import { formatCurrency } from '@core/lib/utils/formatCurrency';
import { getOrders, getOrderStats, orderKeys } from '../api/orders';
import type { Order, OrderFilters, OrderStats } from '../types';
import {
  AmberButton,
  AmberCard as Card,
  AmberTableSkeleton,
  DataTable,
  AmberInput,
  AmberDropdown,
  StatusBadge
} from '@core/components';
import { Column, Action } from '@core/components/Data/DataTable';
import { cn } from '@core/lib/utils/cn';
import { useDebounce } from '@core/hooks/useDebounce';

export const OrdersListPage = () => {
  const router = useRouter();
  const { t, dir } = useLanguage();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'processing' | 'delivered' | 'cancelled'>('all');

  useEffect(() => {
    if (!router.isReady || router.pathname !== '/orders') return;
    const raw = router.query.status;
    const v = Array.isArray(raw) ? raw[0] : raw;
    if (v === 'pending' || v === 'processing' || v === 'delivered' || v === 'cancelled') {
      setStatusFilter(v);
    } else if (raw === undefined) {
      setStatusFilter('all');
    }
  }, [router.isReady, router.pathname, router.query.status]);
  const [debouncedSearch] = useDebounce(searchQuery, 300);
  const [filters, setFilters] = useState<OrderFilters>({
    page: 1,
    limit: 20,
    status: 'all',
  });

  // Fetch orders
  const { data: ordersData, isPending: isLoadingOrders, refetch } = useQuery({
    queryKey: orderKeys.list({ ...filters, status: statusFilter, search: debouncedSearch }),
    queryFn: () => getOrders({ ...filters, status: statusFilter, search: debouncedSearch || undefined }),
    enabled: isClient,
    placeholderData: keepPreviousData,
  });

  // Fetch stats
  const { data: statsData, isPending: statsLoading } = useQuery({
    queryKey: orderKeys.stats(),
    queryFn: getOrderStats,
    enabled: isClient,
  });

  const columns: Column<Order>[] = [
    {
      key: 'orderNumber',
      label: t('orders.table.id') || 'Order #',
      cardTitle: true,
      render: (order) => (
        <span className="font-bold text-zinc-text">#{order.orderNumber}</span>
      ),
      sortable: true,
    },
    {
      key: 'customerName',
      label: t('orders.table.customer') || 'Customer',
      cardSubtitle: true,
      render: (order: any) => (
        <div className="space-y-0.5">
          <div className="text-sm font-bold text-zinc-text">{order.customerName || '-'}</div>
          {order.customerEmail && <div className="text-xs font-medium text-zinc-muted">{order.customerEmail}</div>}
        </div>
      ),
      sortable: true,
    },
    {
      key: 'total',
      label: t('orders.table.total') || 'Total',
      render: (order: any) => (
        <span className="text-zinc-text font-black tabular-nums">
          {formatCurrency(order.total || 0)}
        </span>
      ),
      sortable: true,
      align: 'center',
    },
    {
      key: 'status',
      label: t('orders.table.status') || 'Status',
      cardBadge: true,
      render: (order: any) => {
        const statusKey = `orders.status.${order.status}`;
        const statusLabel = t(statusKey) || order.status;
        return (
          <StatusBadge
            status={statusLabel}
            variant={
              order.status === 'delivered' ? 'success' :
              order.status === 'shipped' ? 'info' :
              order.status === 'processing' ? 'warning' :
              order.status === 'cancelled' ? 'failed' :
              'pending'
            }
            showDot
            className="font-black"
          />
        );
      },
      sortable: true,
      align: 'center',
    },
    {
      key: 'date',
      label: t('orders.table.date') || 'Date',
      render: (order: any) => {
        const dateStr = order.date || order.createdAt;
        if (!dateStr) return <span className="text-zinc-muted text-sm">-</span>;
        const date = new Date(dateStr);
        const isValid = !isNaN(date.getTime());
        return (
          <span className="text-zinc-muted text-sm font-medium">
            {isValid ? date.toLocaleDateString(dir === 'rtl' ? 'ar-EG' : 'en-US') : '-'}
          </span>
        );
      },
      sortable: true,
      align: 'center',
    },
  ];

  const handleRowClick = (order: Order) => {
    router.push(`/orders/${order.id}`);
  };

  if (!isClient) return null;

  const statsColorMap: Record<string, 'brand' | 'success' | 'warning' | 'info'> = {
    'text-brand': 'brand',
    'text-success': 'success',
    'text-warning': 'warning',
    'text-info': 'info',
  };

  return (
    <div className="space-y-8 p-6 max-w-[1600px] mx-auto animate-in fade-in duration-700" dir={dir}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 text-start">
        <div className="space-y-1">
          <h1 className="text-4xl font-black text-zinc-text tracking-tight leading-none">
            {t('orders.title') || 'الطلبات'}
          </h1>
          <p className="text-base text-zinc-secondary font-bold">
            {t('orders.subtitle') || 'إدارة وتتبع جميع طلبات العملاء'}
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <StatsGrid
        stats={[
          { label: t('orders.stat.total'), value: statsData?.total.toString() || '0', icon: Package, color: 'brand' },
          { label: t('orders.stat.revenue'), value: formatCurrency(statsData?.totalRevenue), icon: DollarSign, color: 'success' },
          { label: t('orders.stat.pending'), value: statsData?.pending?.toString() || '0', icon: AlertCircle, color: 'warning' },
          { label: t('orders.stat.active'), value: statsData?.todayOrders?.toString() || '0', icon: TrendingUp, color: 'info' },
        ]}
      />

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row items-center gap-4 pt-2 text-start">
        {/* Status Tabs */}
        <div className="flex items-center bg-[var(--color-obsidian-card)] border border-[var(--color-border)] p-1.5 rounded-xl shadow-sm">
          <button
            onClick={() => setStatusFilter('all')}
            className={cn(
              'px-6 py-2.5 text-sm font-bold transition-colors rounded-lg',
              statusFilter === 'all'
                ? 'bg-[var(--color-brand)] text-black shadow-sm'
                : 'text-zinc-muted hover:text-zinc-text hover:bg-[var(--color-obsidian-hover)]'
            )}
          >
            {t('common.all') || 'الكل'}
          </button>
          <button
            onClick={() => setStatusFilter('pending')}
            className={cn(
              'px-6 py-2.5 text-sm font-bold transition-colors rounded-lg',
              statusFilter === 'pending'
                ? 'bg-[var(--color-brand)] text-black shadow-sm'
                : 'text-zinc-muted hover:text-zinc-text hover:bg-[var(--color-obsidian-hover)]'
            )}
          >
            {t('orders.status.pending') || 'معلق'}
          </button>
          <button
            onClick={() => setStatusFilter('processing')}
            className={cn(
              'px-6 py-2.5 text-sm font-bold transition-colors rounded-lg',
              statusFilter === 'processing'
                ? 'bg-[var(--color-brand)] text-black shadow-sm'
                : 'text-zinc-muted hover:text-zinc-text hover:bg-[var(--color-obsidian-hover)]'
            )}
          >
            {t('orders.status.processing') || 'قيد المعالجة'}
          </button>
        </div>

        {/* Search Input */}
        <div className="relative flex-1 max-w-sm w-full group">
          <Search className="absolute top-1/2 -translate-y-1/2 start-4 w-4 h-4 text-zinc-muted group-focus-within:text-[var(--color-brand)] transition-colors" />
          <AmberInput
            placeholder={t('orders.search') || 'البحث في الطلبات...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-[var(--color-obsidian-card)] border-[var(--color-border)] shadow-sm rounded-xl h-11 focus:ring-[var(--color-brand)]/20 ps-10 pe-4"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-[var(--color-obsidian-card)] border border-[var(--color-border)] rounded-2xl shadow-sm overflow-hidden">
        {isLoadingOrders ? (
          <AmberTableSkeleton rows={8} columns={6} />
        ) : (
          <DataTable
            columns={columns}
            data={ordersData?.data || []}
            onRowClick={handleRowClick}
            pagination
            pageSize={filters.limit}
            showViewToggle
          />
        )}
      </div>
    </div>
  );
};
