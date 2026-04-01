import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Plus, Search, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import { useLanguage } from '@core/contexts/LanguageContext';
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

export const OrdersListPage = () => {
  const navigate = useNavigate();
  const { t, dir } = useLanguage();
  const isRTL = dir === 'rtl';
  
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'processing' | 'delivered' | 'cancelled'>('all');
  const [filters, setFilters] = useState<OrderFilters>({
    page: 1,
    limit: 20,
    status: 'all',
  });

  // Fetch orders
  const { data: ordersData, isLoading: isLoadingOrders, refetch } = useQuery({
    queryKey: orderKeys.list({ ...filters, status: statusFilter, search: searchQuery }),
    queryFn: () => getOrders({ ...filters, status: statusFilter, search: searchQuery }),
  });

  // Fetch stats
  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: orderKeys.stats(),
    queryFn: getOrderStats,
  });

  const columns: Column<Order>[] = [
    {
      key: 'orderNumber',
      label: t('orders.table.id') || 'Order #',
      render: (order) => (
        <span className="font-bold text-zinc-text">#{order.orderNumber}</span>
      ),
      sortable: true,
    },
    {
      key: 'customerName',
      label: t('orders.table.customer') || 'Customer',
      render: (order) => (
        <div className="space-y-0.5">
          <div className="text-sm font-bold text-zinc-text">{order.customerName}</div>
          <div className="text-xs font-medium text-zinc-muted">{order.customerEmail}</div>
        </div>
      ),
      sortable: true,
    },
    {
      key: 'total',
      label: t('orders.table.total') || 'Total',
      render: (order) => (
        <span className="text-zinc-text font-black tabular-nums">
          {order.currency} {order.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
        </span>
      ),
      sortable: true,
      align: 'center',
    },
    {
      key: 'status',
      label: t('orders.table.status') || 'Status',
      render: (order) => (
        <StatusBadge
          status={t(`orders.status.${order.status}`) || order.status}
          variant={
            order.status === 'delivered' ? 'success' :
            order.status === 'shipped' ? 'info' :
            order.status === 'processing' ? 'warning' :
            order.status === 'cancelled' ? 'failed' :
            'pending'
          }
          size="sm"
        />
      ),
      sortable: true,
      align: 'center',
    },
    {
      key: 'paymentStatus',
      label: t('orders.table.payment') || 'Payment',
      render: (order) => (
        <StatusBadge 
          status={order.paymentStatus}
          variant={order.paymentStatus === 'paid' ? 'success' : 'warning'}
          size="sm"
        />
      ),
      sortable: true,
      align: 'center',
    },
    {
      key: 'createdAt',
      label: t('orders.table.date') || 'Date',
      render: (order) => (
        <span className="text-zinc-muted text-sm font-medium">
          {new Date(order.createdAt).toLocaleDateString(dir === 'rtl' ? 'ar-EG' : 'en-US')}
        </span>
      ),
      sortable: true,
      align: 'center',
    },
  ];

  const handleRowClick = (order: Order) => {
    navigate(`/orders/${order.id}`);
  };

  const stats = [
    { label: t('orders.stat.total'), value: statsData?.total.toString() || '0', color: 'text-brand', icon: Search },
    { label: t('orders.stat.revenue'), value: '$' + (statsData?.totalRevenue.toLocaleString() || '0'), color: 'text-success', icon: Plus },
    { label: t('orders.stat.pending'), value: statsData?.pending.toString() || '0', color: 'text-warning', icon: Filter },
    { label: t('orders.stat.active'), value: statsData?.todayOrders.toString() || '0', color: 'text-info', icon: Search },
  ];

  return (
    <div className="space-y-8 p-6 max-w-[1600px] mx-auto animate-in fade-in duration-700" dir={dir}>
      {/* Header */}
      <div className={cn(
        "flex flex-col sm:flex-row sm:items-start justify-between gap-6",
        isRTL ? "text-right" : "text-left"
      )}>
        <div className="space-y-1">
          <h1 className="text-4xl font-black text-zinc-text tracking-tight leading-none">
            {t('orders.title') || 'الطلبات'}
          </h1>
          <p className="text-base text-zinc-secondary font-bold">
            {t('orders.subtitle') || 'إدارة وتتبع جميع طلبات العملاء'}
          </p>
        </div>
        <AmberButton
          className="gap-2 px-6 h-11 bg-[var(--color-brand)] hover:bg-[var(--color-brand)] text-black font-bold rounded-xl shadow-sm transition-all border-none"
          onClick={() => navigate('/orders/new')}
        >
          <span>{t('orders.new') || 'طلب جديد'}</span>
          <Plus className="w-5 h-5" />
        </AmberButton>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <Card key={i} className="!p-5 bg-[var(--color-obsidian-card)] border border-[var(--color-border)] shadow-sm hover:border-[var(--color-brand)]/30 transition-all cursor-default group overflow-hidden relative">
            <div className="flex items-start justify-between relative z-10">
              <div className="space-y-1">
                <span className="text-xs font-bold text-zinc-muted uppercase tracking-wider block">
                  {stat.label}
                </span>
                <span className="text-3xl font-black text-zinc-text tracking-tight italic tabular-nums leading-none">
                  {stat.value}
                </span>
              </div>
              <div className={cn(
                "p-3 rounded-xl border-none shadow-sm flex-shrink-0",
                stat.color === 'text-brand' && "bg-[var(--color-brand)]/10 text-[var(--color-brand)]",
                stat.color === 'text-warning' && "bg-[var(--color-warning)]/10 text-[var(--color-warning)]",
                stat.color === 'text-info' && "bg-[var(--color-info)]/10 text-[var(--color-info)]",
                stat.color === 'text-success' && "bg-[var(--color-success)]/10 text-[var(--color-success)]"
              )}>
                <stat.icon className="w-5 h-5 stroke-[2.5]" />
              </div>
            </div>
            <div className="absolute top-0 right-0 w-24 h-24 bg-[var(--color-brand)]/5 rounded-full blur-3xl -mr-12 -mt-12 group-hover:bg-[var(--color-brand)]/10 transition-colors" />
          </Card>
        ))}
      </div>

      {/* Toolbar */}
      <div className={cn(
        "flex flex-col md:flex-row items-center gap-4 pt-2",
        isRTL ? "text-right" : "text-left"
      )}>
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
          <Search className={cn(
            "absolute top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-muted group-focus-within:text-[var(--color-brand)] transition-colors",
            isRTL ? 'left-4' : 'right-4'
          )} />
          <AmberInput
            placeholder={t('orders.search') || 'البحث في الطلبات...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={cn(
              "bg-[var(--color-obsidian-card)] border-[var(--color-border)] shadow-sm rounded-xl h-11 focus:ring-[var(--color-brand)]/20",
              isRTL ? 'pl-4 pr-10' : 'pr-4 pl-10'
            )}
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
            data={ordersData || []}
            onRowClick={handleRowClick}
            pagination
            pageSize={filters.limit}
          />
        )}
      </div>
    </div>
  );
};
