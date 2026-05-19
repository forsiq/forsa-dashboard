import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { Plus, Search, Mail, Phone, Building2, User, Edit, Trash2, Power, PowerOff } from 'lucide-react';
import { useLanguage } from '@core/contexts/LanguageContext';
import { cn } from '@core/lib/utils/cn';
import { formatPhone } from '@core/lib/utils/formatPhone';
import { AmberButton } from '@core/components/AmberButton';
import { StatsGrid } from '@core/components/Layout/StatsGrid';
import { AmberAvatar } from '@core/components/AmberAvatar';
import { DataTable, Column } from '@core/components/Data/DataTable';
import { DataTableColumnOrderToolbar } from '@core/components/Data/DataTableColumnOrderToolbar';
import { usePersistedColumnOrder } from '@core/hooks/usePersistedColumnOrder';
import { StatusBadge } from '@core/components/Data/StatusBadge';
import { AmberCard as Card } from '@core/components/AmberCard';
import { useConfirmModal } from '@core/components/Feedback/AmberConfirmModal';
import { useDebounce } from '@core/hooks/useDebounce';
import { useGetCustomers, useGetCustomerStats, useDeleteCustomer, useUpdateCustomerStatus } from '../hooks';
import type { Customer } from '../types';
import { useIsClient } from '@core/hooks/useIsClient';
import {
  AdminListPageShell,
  ListPageToolbar,
  ListPageToolbarSearch,
} from '@core/components/Layout';
import { ListPageSkeleton, FetchingOverlay } from '@core/loading';
import { EmptyState } from '@core/components/EmptyState';

type TypeTab = 'all' | 'individual' | 'business';

/**
 * CustomersPage - Customers list page
 */
export function CustomersPage() {
  const { t, dir } = useLanguage();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<TypeTab>('all');
  const [debouncedSearch] = useDebounce(searchQuery, 300);
  const [sortBy, setSortBy] = useState<string>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);
  const [limit] = useState(50);
  const isClient = useIsClient();

  const isRTL = dir === 'rtl';
  const { openConfirm, ConfirmModal } = useConfirmModal();

  const { data, isPending, isFetching, error, refetch } = useGetCustomers({
    search: debouncedSearch || undefined,
    type: typeFilter === 'all' ? undefined : typeFilter,
    page,
    limit,
    sortBy,
    sortOrder,
  });

  const { data: stats } = useGetCustomerStats();

  const deleteMutation = useDeleteCustomer();
  const updateStatusMutation = useUpdateCustomerStatus();

  const handleDelete = async (id: string, name: string) => {
    await deleteMutation.mutateAsync(id);
    refetch();
  };

  const handleToggleStatus = (customer: Customer) => {
    const newStatus = customer.status === 'active' ? 'inactive' : 'active';
    const statusText = newStatus === 'active'
      ? (t('customer.activated') || 'مفعّل')
      : (t('customer.deactivated') || 'معطّل');

    openConfirm({
      title: t('customer.change_status') || 'تغيير الحالة',
      message: `${t('customer.toggle_status_confirm') || 'هل تريد تغيير حالة العميل إلى'} ${statusText}?\n\n"${customer.name}"`,
      variant: 'warning',
      confirmText: statusText,
      onConfirm: () => {
        updateStatusMutation.mutate({ id: customer.id, status: newStatus as Customer['status'] });
      },
    });
  };

  const handleSortChange = (key: string, direction: 'asc' | 'desc') => {
    setSortBy(key);
    setSortOrder(direction);
    setPage(1);
  };

  const columns: Column<any>[] = [
    {
      key: 'name',
      label: t('customer.name') || 'Entity Name',
      cardTitle: true,
      cardSubtitle: true,
      render: (customer: Customer) => {
        const fullName =
          customer.name ||
          `${(customer as any).firstName || ''} ${(customer as any).lastName || ''}`.trim() ||
          customer.email ||
          customer.phone ||
          'N/A';
        return (
          <div className="flex min-w-0 items-center gap-3">
            <AmberAvatar
              src={customer.avatar}
              fallback={fullName}
              size="sm"
              className="shrink-0"
            />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-black leading-tight tracking-tight text-zinc-text">{fullName}</p>
              {customer.email ? (
                <p className="mt-0.5 truncate text-[11px] font-bold text-zinc-muted">{customer.email}</p>
              ) : null}
            </div>
          </div>
        );
      },
      sortable: true,
    },
    {
      key: 'type',
      label: t('customer.type') || 'Classification',
      cardBadge: true,
      render: (customer: any) => (
        <div className="flex items-center gap-2">
          {customer.type === 'business' ? (
            <Building2 className="w-4 h-4 text-[var(--color-brand)]" />
          ) : (
            <User className="w-4 h-4 text-[var(--color-info)]" />
          )}
          <span className="text-sm font-bold text-zinc-text uppercase tracking-wider">
            {customer.type === 'business' ? t('customer.business') : t('customer.individual')}
          </span>
        </div>
      ),
    },
    {
      key: 'phone',
      label: t('customer.contact') || 'Comms Channel',
      hideInCard: true,
      render: (customer: Customer) => (
        <div className="flex items-center gap-4 text-sm font-bold text-zinc-text tabular-nums">
          {customer.phone && (
            <span dir="ltr" className="flex items-center gap-1.5" title={formatPhone(customer.phone)}>
              <Phone className="w-3.5 h-3.5 text-[var(--color-brand)]" />
              {formatPhone(customer.phone)}
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'totalOrders',
      label: t('customer.orders') || 'Thread Count',
      render: (customer: Customer) => (
        <span className="text-sm font-black text-zinc-text tabular-nums">{customer.totalOrders ?? 0}</span>
      ),
      sortable: true,
      align: 'center' as const,
    },
    {
      key: 'status',
      label: t('common.status') || 'Protocol State',
      cardBadge: true,
      render: (customer: any) => (
        <StatusBadge
          status={customer.status || 'unknown'}
          labelKey={`status.${customer.status || 'unknown'}`}
          variant={customer.status === 'active' ? 'success' : 'inactive'}
        />
      ),
      sortable: true,
    },
  ];

  const { orderedColumns, moveColumn, selectedKey, setSelectedKey } = usePersistedColumnOrder(
    columns,
    'datatable:customers:v1',
  );

  const rowActions = [
    {
      label: t('common.edit') || 'تعديل',
      icon: Edit,
      onClick: (customer: Customer) => router.push(`/customers/${customer.id}/edit`),
    },
    {
      label: (customer: Customer) => customer.status === 'active'
        ? (t('customer.deactivate') || 'تعطيل')
        : (t('customer.activate') || 'تفعيل'),
      icon: (customer: Customer) => customer.status === 'active' ? PowerOff : Power,
      onClick: (customer: Customer) => handleToggleStatus(customer),
    },
    {
      label: t('common.delete') || 'حذف',
      icon: Trash2,
      variant: 'danger' as const,
      onClick: (customer: Customer) => {
        openConfirm({
          title: t('customer.delete') || 'حذف العميل',
          message: `${t('customer.delete_confirm') || 'هل أنت متأكد من حذف هذا العميل؟'}\n\n"${customer.name}"`,
          variant: 'destructive',
          onConfirm: () => handleDelete(customer.id, customer.name),
        });
      },
    },
  ];

  const TYPE_TABS: { key: TypeTab; labelKey: string }[] = [
    { key: 'all', labelKey: 'common.all' },
    { key: 'individual', labelKey: 'customer.individual' },
    { key: 'business', labelKey: 'customer.business' },
  ];

  const customers = data?.customers || [];

  if (!isClient) return null;

  return (
    <AdminListPageShell
      title={t('customer.title') || 'العملاء'}
      description={t('customer.subtitle') || 'إدارة وتتبع حسابات العملاء'}
      icon={User}
      headerActions={
        <AmberButton className="gap-2 px-8 h-11 bg-[var(--color-brand)] hover:bg-[var(--color-brand)] text-black font-bold rounded-xl shadow-sm transition-all border-none active:scale-95" onClick={() => router.push('/customers/new')}>
          <Plus className="w-5 h-5" />
          <span>{t('customer.add_new') || 'Initialize Customer'}</span>
        </AmberButton>
      }
      stats={stats ? [
        { label: t('common.total') || 'Aggregated Total', value: stats.total ?? 0, color: 'brand' },
        { label: t('status.active') || 'Operational Nodes', value: stats.active ?? 0, color: 'success' },
        { label: t('customer.new_this_month') || 'Monthly Iterations', value: stats.newThisMonth ?? 0, color: 'brand' },
        { label: t('customer.top_spenders') || 'Priority Accounts', value: ((stats.topSpenders || []) as any).length, color: 'brand' },
      ] : []}
      tabs={
        <div className="flex items-center gap-1 bg-[var(--color-obsidian-card)] border border-[var(--color-border)] p-1.5 rounded-xl shadow-sm overflow-x-auto scrollbar-hide">
          {TYPE_TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => { setTypeFilter(tab.key); setPage(1); }}
              className={cn(
                "flex items-center gap-2 px-4 py-2.5 rounded-lg text-[11px] font-black uppercase tracking-widest transition-colors whitespace-nowrap",
                typeFilter === tab.key
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
          search={<ListPageToolbarSearch value={searchQuery} onChange={(v) => { setSearchQuery(v); setPage(1); }} placeholder={t('customer.search_placeholder') || 'البحث عن العملاء...'} />}
        />
      }
    >
      <div className="space-y-6">
        {isPending ? (
          <ListPageSkeleton count={8} columns={4} showStats />
        ) : error ? (
          <div className="p-12 text-center">
            <p className="text-[var(--color-danger)] font-black uppercase tracking-widest">{t('customer.error_loading') || 'Sync Interrupted'}</p>
            <AmberButton
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              className="mt-6 font-bold border-[var(--color-border)]"
            >
              {t('common.retry') || 'Retry Sync'}
            </AmberButton>
          </div>
        ) : customers.length === 0 ? (
          <EmptyState
            icon={User}
            title={t('customer.empty') || 'No Customers'}
            description={t('customer.empty_description') || 'No customers found matching your criteria.'}
            actionLabel={t('customer.add_new') || 'Add Customer'}
            onAction={() => router.push('/customers/new')}
          />
        ) : (
          <div className="relative bg-[var(--color-obsidian-card)] border border-[var(--color-border)] rounded-2xl shadow-sm overflow-hidden">
            {isFetching && <FetchingOverlay />}
            <DataTableColumnOrderToolbar
              columns={orderedColumns}
              selectedKey={selectedKey}
              onSelectKey={setSelectedKey}
              onMove={(delta) => moveColumn(selectedKey, delta)}
              disabled={!customers.length}
              dir={isRTL ? 'rtl' : 'ltr'}
              labels={{
                title: t('datatable.column_order') || 'Columns',
                selectColumn: t('datatable.select_column') || 'Select column',
                moveUp: t('datatable.move_column_up') || 'Move column up',
                moveDown: t('datatable.move_column_down') || 'Move column down',
              }}
            />
            <DataTable
              columns={orderedColumns}
              data={customers}
              pagination
              pageSize={limit}
              currentPage={page}
              totalItems={(data as any)?.total || customers.length}
              onPageChange={(newPage) => setPage(newPage)}
              selectable
              rowActions={rowActions}
              onRowClick={(row) => router.push(`/customers/${row.id}`)}
              showViewToggle
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
}

export default CustomersPage;
