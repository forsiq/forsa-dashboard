import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Mail, Phone, Building2, User } from 'lucide-react';
import { useLanguage } from '../../../core/contexts/LanguageContext';
import { cn } from '../../../core/lib/utils/cn';
import { AmberButton } from '../../../core/components/AmberButton';
import { AmberInput } from '../../../core/components/AmberInput';
import { AmberAvatar } from '../../../core/components/AmberAvatar';
import { AmberTableSkeleton } from '../../../core/components/Loading/AmberTableSkeleton';
import { DataTable } from '../../../core/components/Data/DataTable';
import { StatusBadge } from '../../../core/components/Data/StatusBadge';
import { AmberCard as Card } from '../../../core/components/AmberCard';
import { useGetCustomers, useGetCustomerStats, useDeleteCustomer } from '../hooks';
import type { Customer } from '../types';

// Simple debounce hook
function useDebounce(value: string, delay: number) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}

/**
 * CustomersPage - Customers list page
 */
export function CustomersPage() {
  const { t, dir } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'individual' | 'business'>('all');
  const [debouncedSearch] = useDebounce(searchQuery, 300);

  const isRTL = dir === 'rtl';

  const { data, isLoading, error, refetch } = useGetCustomers({
    search: debouncedSearch || undefined,
    type: typeFilter === 'all' ? undefined : typeFilter,
    page: 1,
    limit: 50,
  });

  const { data: stats } = useGetCustomerStats();

  const deleteMutation = useDeleteCustomer();

  // Refetch customers after successful delete
  const handleDelete = async (id: string) => {
    await deleteMutation.mutateAsync(id);
    refetch();
  };

  const columns = [
    {
      key: 'name',
      label: t('customer.name') || 'Entity Name',
      render: (customer: any) => {
        const fullName = `${customer.firstName || ''} ${customer.lastName || ''}`.trim() || customer.email || 'N/A';
        return (
          <div className="flex items-center gap-3">
            <AmberAvatar
              src={customer.avatar}
              fallback={fullName}
              size="sm"
              className="ring-2 ring-[var(--color-border)]"
            />
            <div>
              <p className="text-sm font-black text-zinc-text uppercase tracking-tight">{fullName}</p>
              <p className="text-xs font-bold text-zinc-muted">{customer.email}</p>
            </div>
          </div>
        );
      },
      sortable: true,
    },
    {
      key: 'type',
      label: t('customer.type') || 'Classification',
      render: (customer: any) => (
        <div className="flex items-center gap-2">
          {customer.type === 'business' ? (
            <Building2 className="w-4 h-4 text-[var(--color-brand)]" />
          ) : (
            <User className="w-4 h-4 text-[var(--color-info)]" />
          )}
          <span className="text-xs font-bold text-zinc-muted uppercase tracking-widest">
            {customer.type || 'UNKNOWN'}
          </span>
        </div>
      ),
    },
    {
      key: 'phone',
      label: t('customer.contact') || 'Comms Channel',
      render: (customer: Customer) => (
        <div className="flex items-center gap-4 text-xs font-bold text-zinc-muted uppercase">
          {customer.phone && <span className="flex items-center gap-1.5"><Phone className="w-3 h-3 text-[var(--color-brand)]" />{customer.phone}</span>}
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
      render: (customer: any) => (
        <StatusBadge
          status={(customer.status || 'unknown').toUpperCase()}
          variant={customer.status === 'active' ? 'success' : 'inactive'}
        />
      ),
      sortable: true,
    },
  ];

  return (
    <div className="space-y-8 p-6 max-w-[1600px] mx-auto animate-in fade-in duration-700" dir={dir}>
      {/* Page Header */}
      <div className={cn(
        "flex flex-col sm:flex-row sm:items-start justify-between gap-6",
        isRTL ? "text-right" : "text-left"
      )}>
        <div className="space-y-1">
          <h1 className="text-4xl font-black text-zinc-text tracking-tight leading-none">
            {t('customer.title') || 'العملاء'}
          </h1>
          <p className="text-base text-zinc-secondary font-bold">
            {t('customer.subtitle') || 'إدارة وتتبع حسابات العملاء'}
          </p>
        </div>
        <Link to="/customers/new">
          <AmberButton className="gap-2 px-8 h-11 bg-[var(--color-brand)] hover:bg-[var(--color-brand)] text-black font-bold rounded-xl shadow-sm transition-all border-none active:scale-95">
            <Plus className="w-5 h-5" />
            <span>{t('customer.add_new') || 'Initialize Customer'}</span>
          </AmberButton>
        </Link>
      </div>

      {/* Statistics Grid */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="!p-5 bg-[var(--color-obsidian-card)] border border-[var(--color-border)] shadow-sm hover:border-[var(--color-brand)]/30 transition-all cursor-default group overflow-hidden relative">
            <div className="space-y-1">
              <span className="text-xs font-bold text-zinc-muted uppercase tracking-wider block">
                 {t('common.total') || 'Aggregated Total'}
              </span>
              <span className="text-3xl font-black text-zinc-text tracking-tight italic tabular-nums leading-none">
                {stats.total ?? 0}
              </span>
            </div>
            <div className="absolute top-0 right-0 w-24 h-24 bg-[var(--color-brand)]/5 rounded-full blur-3xl -mr-12 -mt-12 group-hover:bg-[var(--color-brand)]/10 transition-colors" />
          </Card>

          <Card className="!p-5 bg-[var(--color-obsidian-card)] border border-[var(--color-border)] shadow-sm hover:border-[var(--color-success)]/30 transition-all cursor-default group overflow-hidden relative">
            <div className="space-y-1">
              <span className="text-xs font-bold text-zinc-muted uppercase tracking-wider block">
                 {t('status.active') || 'Operational Nodes'}
              </span>
              <span className="text-3xl font-black text-[var(--color-success)] tracking-tight italic tabular-nums leading-none">
                {stats.active ?? 0}
              </span>
            </div>
          </Card>

          <Card className="!p-5 bg-[var(--color-obsidian-card)] border border-[var(--color-border)] shadow-sm hover:border-[var(--color-brand)]/30 transition-all cursor-default group overflow-hidden relative">
            <div className="space-y-1">
              <span className="text-xs font-bold text-zinc-muted uppercase tracking-wider block">
                 {t('customer.new_this_month') || 'Monthly Iterations'}
              </span>
              <span className="text-3xl font-black text-[var(--color-brand)] tracking-tight italic tabular-nums leading-none">
                {stats.newThisMonth ?? 0}
              </span>
            </div>
          </Card>

          <Card className="!p-5 bg-[var(--color-obsidian-card)] border border-[var(--color-border)] shadow-sm hover:border-[var(--color-brand)]/30 transition-all cursor-default group overflow-hidden relative">
            <div className="space-y-3">
              <span className="text-xs font-bold text-zinc-muted uppercase tracking-wider block">
                 {t('customer.top_spenders') || 'Priority Accounts'}
              </span>
              <div className="flex -space-x-3 rtl:space-x-reverse">
                {((stats.topSpenders as any) || []).map((c: any) => (
                  <AmberAvatar 
                    key={c.id} 
                    src={c.avatar} 
                    fallback={c.name} 
                    size="sm" 
                    className="ring-4 ring-[var(--color-obsidian-card)]"
                  />
                ))}
              </div>
            </div>
          </Card>
        </div>
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
            "absolute top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-muted group-focus-within:text-[var(--color-brand)] transition-colors",
            isRTL ? 'left-4' : 'right-4'
          )} />
          <AmberInput
            placeholder={t('customer.search_placeholder') || 'البحث عن العملاء...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={cn(
              "bg-[var(--color-obsidian-card)] border-[var(--color-border)] shadow-sm h-11 focus:ring-[var(--color-brand)]/20",
              isRTL ? 'pl-4 pr-10' : 'pr-4 pl-10'
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
          <DataTable
            columns={columns}
            data={data?.customers || []}
            pagination
            pageSize={10}
            selectable
            onRowClick={(row) => window.location.href = `/customers/${row.id}`}
          />
        )}
      </div>
    </div>
  );
}

export default CustomersPage;
