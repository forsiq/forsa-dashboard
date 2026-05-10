import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Plus, Search, Mail, Phone, Building2, User, Edit, Trash2, Power, PowerOff } from 'lucide-react';
import { useLanguage } from '@core/contexts/LanguageContext';
import { cn } from '@core/lib/utils/cn';
import { formatPhone } from '@core/lib/utils/formatPhone';
import { AmberButton } from '@core/components/AmberButton';
import { AmberInput } from '@core/components/AmberInput';
import { StatsGrid } from '@core/components/Layout/StatsGrid';
import { AmberAvatar } from '@core/components/AmberAvatar';
import { AmberTableSkeleton } from '@core/components/Loading/AmberTableSkeleton';
import { DataTable, Column } from '@core/components/Data/DataTable';
import { DataTableColumnOrderToolbar } from '@core/components/Data/DataTableColumnOrderToolbar';
import { usePersistedColumnOrder } from '@core/hooks/usePersistedColumnOrder';
import { StatusBadge } from '@core/components/Data/StatusBadge';
import { AmberCard as Card } from '@core/components/AmberCard';
import { useConfirmModal } from '@core/components/Feedback/AmberConfirmModal';
import { useDebounce } from '@core/hooks/useDebounce';
import { useGetCustomers, useGetCustomerStats, useDeleteCustomer, useUpdateCustomerStatus } from '../hooks';
import type { Customer } from '../types';

/**
 * CustomersPage - Customers list page
 */
export function CustomersPage() {
  const { t, dir } = useLanguage();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'individual' | 'business'>('all');
  const [debouncedSearch] = useDebounce(searchQuery, 300);
  const [isClient, setIsClient] = useState(false);

  const isRTL = dir === 'rtl';
  const { openConfirm, ConfirmModal } = useConfirmModal();

  useEffect(() => {
    setIsClient(true);
  }, []);

  const { data, isLoading, error, refetch } = useGetCustomers({
    search: debouncedSearch || undefined,
    type: typeFilter === 'all' ? undefined : typeFilter,
    page: 1,
    limit: 50,
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
          status={t(`status.${customer.status}`) || (customer.status || 'unknown').toUpperCase()}
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

  if (!isClient) return null;

  return (
    <div className="space-y-8 p-6 max-w-[1600px] mx-auto animate-in fade-in duration-700" dir={dir}>
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 text-start">
        <div className="space-y-1">
          <h1 className="text-4xl font-black text-zinc-text tracking-tight leading-none">
            {t('customer.title') || 'العملاء'}
          </h1>
          <p className="text-base text-zinc-secondary font-bold">
            {t('customer.subtitle') || 'إدارة وتتبع حسابات العملاء'}
          </p>
        </div>
        <AmberButton className="gap-2 px-8 h-11 bg-[var(--color-brand)] hover:bg-[var(--color-brand)] text-black font-bold rounded-xl shadow-sm transition-all border-none active:scale-95" onClick={() => router.push('/customers/new')}>
          <Plus className="w-5 h-5" />
          <span>{t('customer.add_new') || 'Initialize Customer'}</span>
        </AmberButton>
      </div>

      {/* Statistics Grid */}
      {stats && (
        <StatsGrid
          stats={[
            {
              label: t('common.total') || 'Aggregated Total',
              value: stats.total ?? 0,
              color: 'brand',
            },
            {
              label: t('status.active') || 'Operational Nodes',
              value: stats.active ?? 0,
              color: 'success',
            },
            {
              label: t('customer.new_this_month') || 'Monthly Iterations',
              value: stats.newThisMonth ?? 0,
              color: 'brand',
            },
            {
              label: t('customer.top_spenders') || 'Priority Accounts',
              value: ((stats.topSpenders || []) as any).length,
              color: 'brand',
              footer: (
                <>
                  {((stats.topSpenders as any) || []).length > 0 && (
                    <div className="space-y-2">
                      <div className="flex -space-x-2 rtl:space-x-reverse">
                        {((stats.topSpenders as any) || []).slice(0, 5).map((c: any, index: number) => (
                          <button
                            key={c.id || `top-spender-${index}`}
                            type="button"
                            onClick={() => c.id && router.push(`/customers/${c.id}`)}
                            className="relative group/avatar transition-all duration-200 hover:z-10 hover:scale-110 active:scale-95 focus:outline-none"
                            title={c.name}
                          >
                            <AmberAvatar
                              src={c.avatar}
                              fallback={c.name || 'U'}
                              size="sm"
                              className="ring-2 ring-[var(--color-obsidian-card)] transition-shadow group-hover/avatar:ring-brand/50"
                            />
                            {/* Tooltip on hover */}
                            <span className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-obsidian-outer border border-white/10 rounded-md text-[10px] font-bold text-zinc-text whitespace-nowrap opacity-0 group-hover/avatar:opacity-100 transition-opacity pointer-events-none shadow-lg z-20">
                              {c.name?.split(' ')[0]}
                            </span>
                          </button>
                        ))}
                      </div>
                      <p className="text-[10px] font-bold text-brand/80 uppercase tracking-widest truncate">
                        {((stats.topSpenders as any) || []).slice(0, 3).map((c: any) => c.name?.split(' ')[0]).filter(Boolean).join(', ')}
                        {((stats.topSpenders as any) || []).length > 3 && ` +${((stats.topSpenders as any) || []).length - 3}`}
                      </p>
                    </div>
                  )}
                </>
              ),
            },
          ]}
        />
      )}

      {/* Interactive Controls */}
      <div className="flex flex-col md:flex-row items-center gap-4 pt-2">
        {/* Status Tabs */}
        <div className="flex items-center bg-[var(--color-obsidian-card)] border border-[var(--color-border)] p-1.5 rounded-xl shadow-sm">
          <button
            onClick={() => setTypeFilter('all')}
            className={cn(
              'px-6 py-2.5 text-sm font-bold transition-colors rounded-lg',
              typeFilter === 'all'
                ? 'bg-[var(--color-brand)] text-black shadow-sm'
                : 'text-zinc-muted hover:text-zinc-text hover:bg-[var(--color-obsidian-hover)]'
            )}
          >
            {t('common.all') || 'Aggregated'}
          </button>
          <button
            onClick={() => setTypeFilter('individual')}
            className={cn(
              'px-6 py-2.5 text-sm font-bold transition-colors rounded-lg',
              typeFilter === 'individual'
                ? 'bg-[var(--color-brand)] text-black shadow-sm'
                : 'text-zinc-muted hover:text-zinc-text hover:bg-[var(--color-obsidian-hover)]'
            )}
          >
            {t('customer.individual') || 'Personal'}
          </button>
          <button
            onClick={() => setTypeFilter('business')}
            className={cn(
              'px-6 py-2.5 text-sm font-bold transition-colors rounded-lg',
              typeFilter === 'business'
                ? 'bg-[var(--color-brand)] text-black shadow-sm'
                : 'text-zinc-muted hover:text-zinc-text hover:bg-[var(--color-obsidian-hover)]'
            )}
          >
            {t('customer.business') || 'Corporate'}
          </button>
        </div>

        {/* Search Input */}
        <div className="relative flex-1 max-w-sm w-full group">
          <Search className={cn(
            "absolute top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-muted group-focus-within:text-[var(--color-brand)] transition-colors",
            isRTL ? 'start-4' : 'end-4'
          )} />
          <AmberInput
            placeholder={t('customer.search_placeholder') || 'البحث عن العملاء...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={cn(
              "bg-white/5 border-[var(--color-border)] shadow-sm h-14 focus:ring-[var(--color-brand)]/20 text-lg",
              isRTL ? 'ps-4 pe-12' : 'pe-4 ps-12'
            )}
          />
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-[var(--color-obsidian-card)] border border-[var(--color-border)] rounded-2xl shadow-sm overflow-hidden">
        {isLoading ? (
          <AmberTableSkeleton rows={8} columns={6} hasActions />
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
        ) : (
          <div>
            <DataTableColumnOrderToolbar
              columns={orderedColumns}
              selectedKey={selectedKey}
              onSelectKey={setSelectedKey}
              onMove={(delta) => moveColumn(selectedKey, delta)}
              disabled={!(data?.customers || []).length}
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
              data={data?.customers || []}
              pagination
              pageSize={10}
              selectable
              rowActions={rowActions}
              onRowClick={(row) => router.push(`/customers/${row.id}`)}
              showViewToggle
            />
          </div>
        )}
      </div>

      <ConfirmModal />
    </div>
  );
}

export default CustomersPage;
