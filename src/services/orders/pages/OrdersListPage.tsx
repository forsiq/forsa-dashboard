import { useState, useMemo, useCallback } from 'react';
import { useRouter } from 'next/router';
import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { Plus, Package, TrendingUp, AlertCircle, DollarSign, Eye, Edit, CheckCircle, XCircle, Truck, Clock } from 'lucide-react';
import { useLanguage } from '@core/contexts/LanguageContext';
import { formatCurrency } from '@core/lib/utils/formatCurrency';
import { useIsMobile } from '@core/hooks/useIsMobile';
import { getOrders, getOrderStats, updateOrderStatus, orderKeys } from '../api/orders';
import type { Order, OrderFilters, OrderStatus, OrderStats } from '../types';
import {
  formatOrderCustomerName,
  orderMatchesStatusFilter,
  orderStatusLabelKey,
} from '../utils/order-display';
import {
  AmberButton,
  AmberCard as Card,
  DataTable,
  StatusBadge
} from '@core/components';
import { Column, Action } from '@core/components/Data/DataTable';
import { cn } from '@core/lib/utils/cn';
import { useDebounce } from '@core/hooks/useDebounce';
import { useFilterState } from '@core/hooks/useFilterState';
import { useIsClient } from '@core/hooks/useIsClient';
import { useConfirmModal } from '@core/components/Feedback/AmberConfirmModal';
import { useToast } from '@core/contexts/ToastContext';
import {
  AdminListPageShell,
  ListPageToolbar,
  ListPageToolbarSearch,
} from '@core/components/Layout';
import { ListPageSkeleton, FetchingOverlay } from '@core/loading';
import { EmptyState } from '@core/components/EmptyState';

type StatusTab = 'all' | 'pending' | 'processing' | 'delivered' | 'cancelled';

export const OrdersListPage = () => {
  const router = useRouter();
  const { t, dir } = useLanguage();
  const isClient = useIsClient();
  const { isMobile } = useIsMobile();

  const [searchQuery, setSearchQuery] = useFilterState('search', '');
  const [statusFilter, setStatusFilter] = useFilterState<StatusTab>('status', 'all');
  const [sortBy, setSortBy] = useFilterState<'createdAt' | 'total' | 'orderNumber'>('sortBy', 'createdAt');
  const [sortOrder, setSortOrder] = useFilterState<'asc' | 'desc'>('sortOrder', 'desc');
  const [page, setPage] = useFilterState('page', 1);
  const [limit] = useState(20);

  const debouncedSearch = useDebounce(searchQuery, 300);

  // Fetch orders
  const {
    data: ordersData,
    isPending: isLoadingOrders,
    isFetching,
    isError: ordersLoadError,
    error: ordersError,
    refetch,
  } = useQuery({
    queryKey: orderKeys.list({ page, limit, status: statusFilter, search: debouncedSearch, sortBy, sortOrder }),
    queryFn: async () => {
      const apiStatus =
        statusFilter === 'all' || statusFilter === 'processing'
          ? undefined
          : statusFilter;
      const response = await getOrders({
        page,
        limit,
        status: apiStatus as OrderFilters['status'],
        search: debouncedSearch || undefined,
        sortBy,
        sortOrder,
      });
      if (statusFilter === 'processing') {
        return {
          ...response,
          data: response.data.filter((order) =>
            orderMatchesStatusFilter(order.status, 'processing'),
          ),
        };
      }
      return response;
    },
    enabled: isClient,
    placeholderData: keepPreviousData,
  });

  // Fetch stats
  const { data: statsData, isPending: statsLoading } = useQuery({
    queryKey: orderKeys.stats(),
    queryFn: getOrderStats,
    enabled: isClient,
  });

  const handleSortChange = (key: string, direction: 'asc' | 'desc') => {
    const validKeys = ['createdAt', 'total', 'orderNumber', 'date', 'status'] as const;
    const typedKey = validKeys.includes(key as (typeof validKeys)[number])
      ? (key as (typeof validKeys)[number])
      : 'createdAt';
    setSortBy(typedKey);
    setSortOrder(direction);
    setPage(1);
  };

  const bulkActions = [
    {
      label: t('orders.bulk_processing') || 'Mark as Processing',
      icon: Clock,
      onClick: (selectedIds: string[]) => {
        openConfirm({
          title: t('orders.bulk_processing') || 'Mark as Processing',
          message: `${t('orders.bulk_processing_confirm') || 'Are you sure you want to mark'} ${selectedIds.length} ${t('orders.as_processing') || 'orders as processing'}?`,
          variant: 'warning',
          onConfirm: () => {
            selectedIds.forEach(id => {
              statusMutation.mutate({ id, status: 'processing' as OrderStatus });
            });
          },
        });
      },
    },
  ];

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
          <div className="text-sm font-bold text-zinc-text">
            {formatOrderCustomerName(order.customerName, t)}
          </div>
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
      render: (order: any) => (
          <StatusBadge
            status={order.status}
            labelKey={orderStatusLabelKey(order.status)}
            variant={
              order.status === 'delivered' ? 'success' :
              order.status === 'shipped' ? 'info' :
              order.status === 'confirmed' || order.status === 'paid' || order.status === 'processing' ? 'warning' :
              order.status === 'cancelled' ? 'failed' :
              'pending'
            }
            showDot
            className="font-black"
          />
      ),
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

  const queryClient = useQueryClient();
  const toast = useToast();
  const { openConfirm, ConfirmModal } = useConfirmModal();

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: OrderStatus }) =>
      updateOrderStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: orderKeys.all });
      toast.success(t('orders.status_updated') || 'تم تحديث حالة الطلب');
    },
    onError: () => {
      toast.error(t('orders.status_update_failed') || 'فشل تحديث حالة الطلب');
    },
  });

  const handleStatusChange = useCallback((order: Order, newStatus: OrderStatus) => {
    openConfirm({
      title: t('orders.updateStatus') || 'تحديث حالة الطلب',
      message: `${t('orders.status_change_confirm')} "${t(orderStatusLabelKey(newStatus)) || newStatus}"?\n\n${order.orderNumber}`,
      variant: newStatus === 'cancelled' ? 'destructive' : 'warning',
      confirmText: t(orderStatusLabelKey(newStatus)) || newStatus,
      onConfirm: () => {
        statusMutation.mutate({ id: order.id, status: newStatus });
      },
    });
  }, [openConfirm, statusMutation, t]);

  const statusTransitions: Partial<Record<OrderStatus, { status: OrderStatus; icon: React.ElementType; variant?: 'default' | 'danger' | 'success' }[]>> = useMemo(() => ({
    pending: [
      { status: 'confirmed', icon: Clock },
      { status: 'cancelled', icon: XCircle, variant: 'danger' },
    ],
    confirmed: [
      { status: 'paid', icon: CheckCircle },
      { status: 'cancelled', icon: XCircle, variant: 'danger' },
    ],
    paid: [
      { status: 'shipped', icon: Truck },
      { status: 'cancelled', icon: XCircle, variant: 'danger' },
    ],
    shipped: [
      { status: 'delivered', icon: CheckCircle, variant: 'success' },
      { status: 'cancelled', icon: XCircle, variant: 'danger' },
    ],
    delivered: [],
    cancelled: [],
    refunded: [],
    processing: [],
  }), []);

  const rowActions: Action<Order>[] = useMemo(() => [
    {
      label: t('orders.view_details') || 'عرض التفاصيل',
      icon: Eye,
      onClick: (order) => router.push(`/orders/${order.id}`),
    },
    ...(['pending', 'confirmed', 'paid', 'shipped'] as OrderStatus[]).flatMap((fromStatus) =>
      (statusTransitions[fromStatus] ?? []).map((transition) => ({
        label: (order: Order) =>
          order.status === fromStatus
            ? (t(orderStatusLabelKey(transition.status)) || transition.status)
            : null,
        icon: transition.icon,
        variant: transition.variant as 'default' | 'danger' | 'success',
        onClick: (order: Order) => {
          if (order.status === fromStatus) {
            handleStatusChange(order, transition.status);
          }
        },
      }))
    ),
  ], [router, t, statusTransitions, handleStatusChange]);

  const handleRowClick = (order: Order) => {
    router.push(`/orders/${order.id}`);
  };

  const getStatusVariant = useCallback((status: OrderStatus) => {
    if (status === 'delivered') return 'success' as const;
    if (status === 'shipped') return 'info' as const;
    if (status === 'confirmed' || status === 'paid' || status === 'processing') return 'warning' as const;
    if (status === 'cancelled') return 'failed' as const;
    return 'pending' as const;
  }, []);

  const formatOrderDate = useCallback(
    (order: Order) => {
      const dateStr = (order as { date?: string }).date || order.createdAt;
      if (!dateStr) return '—';
      const date = new Date(dateStr);
      if (Number.isNaN(date.getTime())) return '—';
      return date.toLocaleDateString(dir === 'rtl' ? 'ar-EG' : 'en-US', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    },
    [dir],
  );

  const renderOrderCard = useCallback(
    (order: Order) => (
      <div
        key={order.id}
        className="group relative rounded-xl border border-white/5 bg-[var(--color-obsidian-card)] transition-all duration-300 overflow-hidden hover:border-white/10 hover:shadow-md cursor-pointer active:scale-[0.98]"
        onClick={() => handleRowClick(order)}
      >
        <div className="p-3 space-y-2">
          <div className="flex items-start justify-between gap-2">
            <span className="text-[11px] font-black text-brand uppercase tracking-wider truncate">
              #{order.orderNumber}
            </span>
            <StatusBadge
              status={order.status}
              labelKey={orderStatusLabelKey(order.status)}
              variant={getStatusVariant(order.status)}
              showDot
              size="sm"
              className="shrink-0 font-black"
            />
          </div>

          <p className="text-sm font-bold text-zinc-text truncate leading-tight">
            {formatOrderCustomerName(order.customerName, t)}
          </p>

          <div className="pt-2 border-t border-white/5 space-y-1">
            <p className="text-base font-black text-zinc-text tabular-nums leading-none">
              {formatCurrency(order.total || 0)}
            </p>
            <p className="text-[10px] font-bold text-zinc-muted uppercase tracking-widest">
              {formatOrderDate(order)}
            </p>
          </div>
        </div>
      </div>
    ),
    [formatOrderDate, getStatusVariant, t],
  );

  const orders = ordersData?.data || [];

  const STATUS_TABS: { key: StatusTab; labelKey: string }[] = [
    { key: 'all', labelKey: 'common.all' },
    { key: 'pending', labelKey: 'orders.status.pending' },
    { key: 'processing', labelKey: 'orders.status.processing' },
    { key: 'delivered', labelKey: 'orders.status.delivered' },
    { key: 'cancelled', labelKey: 'orders.status.cancelled' },
  ];

  if (!isClient) {
    return <ListPageSkeleton count={6} columns={4} showStats />;
  }

  return (
    <AdminListPageShell
      title={t('orders.title') || 'الطلبات'}
      description={t('orders.subtitle') || 'إدارة وتتبع جميع طلبات العملاء'}
      icon={Package}
      className="p-3 md:p-6 space-y-4 md:space-y-8"
      statsLoading={statsLoading}
      stats={[
        { label: t('orders.stat.total'), value: statsData?.total || 0, icon: Package, color: 'brand' },
        { label: t('orders.stat.revenue'), value: formatCurrency(statsData?.totalRevenue), icon: DollarSign, color: 'success' },
        { label: t('orders.stat.pending'), value: statsData?.pending || 0, icon: AlertCircle, color: 'warning' },
        {
          label: t('orders.stat.this_month') || t('orders.stat.active'),
          value: statsData?.todayOrders || 0,
          icon: TrendingUp,
          color: 'info',
        },
      ]}
      tabs={
        <div className="flex items-center gap-1 bg-[var(--color-obsidian-card)] border border-[var(--color-border)] p-1.5 rounded-xl shadow-sm overflow-x-auto scrollbar-hide">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => { setStatusFilter(tab.key); setPage(1); }}
              className={cn(
                "flex items-center gap-2 px-4 py-2.5 rounded-lg text-[11px] font-black uppercase tracking-widest transition-colors whitespace-nowrap",
                statusFilter === tab.key
                  ? "bg-[var(--color-brand)] text-black shadow-sm"
                  : "text-zinc-muted hover:text-zinc-text hover:bg-black/5"
              )}
            >
              {t(tab.labelKey)}
            </button>
          ))}
        </div>
      }
      toolbar={
        <ListPageToolbar
          search={<ListPageToolbarSearch value={searchQuery} onChange={(v) => { setSearchQuery(v); setPage(1); }} placeholder={t('orders.search') || 'البحث في الطلبات...'} />}
        />
      }
    >
      <div className="space-y-6">
        {isLoadingOrders ? (
          <ListPageSkeleton count={8} columns={4} showStats />
        ) : ordersLoadError ? (
          <div className="p-12 text-center space-y-4">
            <p className="text-danger font-bold">
              {t('orders.error_loading') || 'حدث خطأ في تحميل الطلبات'}
            </p>
            <p className="text-sm text-zinc-muted">
              {(ordersError as Error)?.message || ''}
            </p>
            <AmberButton variant="outline" size="sm" onClick={() => refetch()} className="font-bold">
              {t('common.retry') || 'إعادة المحاولة'}
            </AmberButton>
          </div>
        ) : orders.length === 0 ? (
          <EmptyState
            icon={Package}
            title={t('orders.empty') || 'No Orders'}
            description={t('orders.empty_description') || 'No orders found matching your criteria.'}
          />
        ) : isMobile ? (
          <div className="relative space-y-4">
            {isFetching && <FetchingOverlay />}
            <div className="grid grid-cols-2 gap-3">
              {orders.map((order) => renderOrderCard(order))}
            </div>
            {(ordersData?.total || 0) > limit && (
              <div className="flex items-center justify-center gap-3 pt-4">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page <= 1}
                  className="px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest bg-obsidian-card border border-white/5 text-zinc-text disabled:opacity-30 disabled:cursor-not-allowed active:scale-95 transition-all"
                >
                  {t('common.prev') || 'Prev'}
                </button>
                <span className="text-[11px] font-bold text-zinc-muted tabular-nums">
                  {page} / {Math.ceil((ordersData?.total || 0) / limit)}
                </span>
                <button
                  onClick={() => setPage(page + 1)}
                  disabled={page >= Math.ceil((ordersData?.total || 0) / limit)}
                  className="px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest bg-obsidian-card border border-white/5 text-zinc-text disabled:opacity-30 disabled:cursor-not-allowed active:scale-95 transition-all"
                >
                  {t('common.next') || 'Next'}
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="relative bg-[var(--color-obsidian-card)] border border-[var(--color-border)] rounded-2xl shadow-sm overflow-hidden">
            {isFetching && <FetchingOverlay />}
            <DataTable
              columns={columns}
              data={orders}
              onRowClick={handleRowClick}
              rowActions={rowActions}
              selectable
              bulkActions={bulkActions}
              pagination
              pageSize={limit}
              currentPage={page}
              totalItems={ordersData?.total || 0}
              onPageChange={(newPage) => setPage(newPage)}
              showViewToggle
              viewMode="table"
              onSortChange={handleSortChange}
              sortBy={sortBy}
              sortOrder={sortOrder}
            />
          </div>
        )}
      </div>

      <ConfirmModal />
    </AdminListPageShell>
  );
};
