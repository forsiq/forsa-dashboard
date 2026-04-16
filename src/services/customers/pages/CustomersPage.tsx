import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Mail, Phone, Building2, User } from 'lucide-react';
import { useLanguage } from '../../../core/contexts/LanguageContext';
import { cn } from '../../../core/lib/utils/cn';
import { AmberButton } from '../../../core/components/AmberButton';
import { AmberInput } from '../../../core/components/AmberInput';
import { AmberAvatar, AmberAvatarGroup } from '../../../core/components/AmberAvatar';
import { AmberTableSkeleton } from '../../../core/components/Loading/AmberTableSkeleton';
import { DataTable } from '../../../core/components/Data/DataTable';
import { StatusBadge } from '../../../core/components/Data/StatusBadge';
import { AmberCard as Card } from '../../../core/components/AmberCard';
import { useGetCustomers, useGetCustomerStats, useDeleteCustomer } from '../hooks';
import type { Customer } from '../types';
import { Users, TrendingUp, Calendar, Trophy, ArrowRight, Activity } from 'lucide-react';

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
          <div className="flex items-center gap-4 group/avatar">
            <div className="relative">
              <AmberAvatar
                src={customer.avatar}
                fallback={fullName}
                size="md"
                className="ring-1 ring-white/10 group-hover/avatar:ring-brand/50 transition-all duration-300"
              />
              {customer.status === 'active' && (
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-success rounded-full border-2 border-obsidian-card animate-pulse" />
              )}
            </div>
            <div className="space-y-0.5">
              <p className="text-lg font-black text-zinc-text uppercase tracking-tight group-hover/avatar:text-brand transition-colors">
                {fullName}
              </p>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-zinc-muted/40" />
                <p className="text-sm font-bold text-zinc-muted uppercase tracking-wider">{customer.email}</p>
              </div>
            </div>
          </div>
        );
      },
      sortable: true,
    },
    {
      key: 'type',
      label: t('customer.type') || 'Classification',
      render: (customer: any) => {
        const typeLabel = customer.type === 'business' 
          ? (t('customer.business') || 'Corporate')
          : (t('customer.individual') || 'Personal');
        
        return (
          <div className="flex items-center gap-3 group/type">
            <div className={cn(
              "w-9 h-9 rounded-sm flex items-center justify-center transition-colors",
              customer.type === 'business' ? "bg-[var(--color-brand)]/10 text-[var(--color-brand)]" : "bg-[var(--color-info)]/10 text-[var(--color-info)]"
            )}>
              {customer.type === 'business' ? (
                <Building2 className="w-5 h-5" />
              ) : (
                <User className="w-5 h-5" />
              )}
            </div>
            <span className="text-sm font-black text-zinc-muted uppercase tracking-[0.2em] group-hover/type:text-zinc-text transition-colors">
              {typeLabel}
            </span>
          </div>
        );
      },
    },
    {
      key: 'phone',
      label: t('customer.phone') || 'Comms Channel',
      render: (customer: any) => (
        <span className="text-base font-black text-zinc-text tabular-nums tracking-tight">
          {customer.phone || 'N/A'}
        </span>
      ),
    },
    {
      key: 'totalOrders',
      label: t('customer.orders') || 'Thread Count',
      render: (customer: Customer) => (
        <div className="flex flex-col items-center">
          <span className="text-lg font-black text-zinc-text tabular-nums leading-none">
            {customer.totalOrders ?? 0}
          </span>
          <span className="text-[10px] font-black text-zinc-muted uppercase tracking-[0.2em] mt-1 opacity-40">{t('customer.orders') || 'Orders'}</span>
        </div>
      ),
      sortable: true,
      align: 'center' as const,
    },
    {
      key: 'status',
      label: t('common.status') || 'Protocol State',
      render: (customer: any) => (
        <div className="flex justify-end">
          <StatusBadge
            status={t(`status.${customer.status || 'unknown'}`).toUpperCase()}
            variant={customer.status === 'active' ? 'success' : customer.status === 'blocked' ? 'error' : 'warning'}
            className="tracking-[0.2em] font-black text-sm h-8 px-5 border-none bg-white/5"
          />
        </div>
      ),sortable: true,
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

      {/* Enhanced Statistics Grid */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="!p-6 bg-[var(--color-obsidian-card)] border border-[var(--color-border)] shadow-xl hover:border-[var(--color-brand)]/40 transition-all duration-500 cursor-default group overflow-hidden relative active:scale-[0.98]">
            <div className="relative z-10 flex items-start justify-between">
              <div className="space-y-1">
                <span className="text-[10px] font-black text-zinc-muted uppercase tracking-[0.25em] block mb-1">
                   {t('common.total') || 'Aggregated Total'}
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-black text-zinc-text tracking-tighter tabular-nums leading-none">
                    {stats.total ?? 0}
                  </span>
                  <div className="bg-success/10 px-1.5 py-0.5 rounded text-[8px] font-black text-success uppercase tracking-tighter">+12%</div>
                </div>
              </div>
              <div className="p-3 bg-brand/10 rounded-xl text-brand border border-brand/20 group-hover:scale-110 transition-transform duration-500">
                <Users className="w-5 h-5" />
              </div>
            </div>
            {/* Visual Flare */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-brand/5 rounded-full blur-[80px] -mr-16 -mt-16 group-hover:bg-brand/10 transition-all duration-700" />
            <div className="mt-8 flex items-center justify-between">
               <div className="flex items-center gap-2">
                 <div className="w-8 h-1 bg-brand/20 rounded-full overflow-hidden">
                   <div className="w-[70%] h-full bg-brand" />
                 </div>
                 <span className="text-[9px] font-bold text-zinc-muted uppercase tracking-widest">Growth Velocity</span>
               </div>
               <ArrowRight className="w-4 h-4 text-zinc-muted/30 group-hover:text-brand/60 transition-colors" />
            </div>
          </Card>

          <Card className="!p-6 bg-[var(--color-obsidian-card)] border border-[var(--color-border)] shadow-xl hover:border-success/40 transition-all duration-500 cursor-default group overflow-hidden relative active:scale-[0.98]">
             <div className="relative z-10 flex items-start justify-between">
              <div className="space-y-1">
                <span className="text-[10px] font-black text-zinc-muted uppercase tracking-[0.25em] block mb-1">
                   {t('status.active') || 'Operational Nodes'}
                </span>
                <span className="text-4xl font-black text-success tracking-tighter tabular-nums leading-none">
                  {stats.active ?? 0}
                </span>
              </div>
              <div className="p-3 bg-success/10 rounded-xl text-success border border-success/20 group-hover:scale-110 transition-transform duration-500">
                <Activity className="w-5 h-5" />
              </div>
            </div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-success/5 rounded-full blur-[80px] -mr-16 -mt-16 group-hover:bg-success/10 transition-all duration-700" />
            <div className="mt-8 flex items-center gap-1.5">
               <div className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
               <span className="text-[9px] font-bold text-success uppercase tracking-[0.2em]">{t('portal.all_systems_normal') || 'Systems Nominal'}</span>
            </div>
          </Card>

          <Card className="!p-6 bg-[var(--color-obsidian-card)] border border-[var(--color-border)] shadow-xl hover:border-brand/40 transition-all duration-500 cursor-default group overflow-hidden relative active:scale-[0.98]">
             <div className="relative z-10 flex items-start justify-between">
              <div className="space-y-1">
                <span className="text-[10px] font-black text-zinc-muted uppercase tracking-[0.25em] block mb-1">
                   {t('customer.new_this_month') || 'Monthly Iterations'}
                </span>
                <span className="text-4xl font-black text-brand tracking-tighter tabular-nums leading-none">
                  {stats.newThisMonth ?? 0}
                </span>
              </div>
              <div className="p-3 bg-brand/10 rounded-xl text-brand border border-brand/20 group-hover:scale-110 transition-transform duration-500">
                <Calendar className="w-5 h-5" />
              </div>
            </div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-brand/5 rounded-full blur-[80px] -mr-16 -mt-16 group-hover:bg-brand/10 transition-all duration-700" />
            <div className="mt-8">
               <span className="text-[9px] font-bold text-zinc-muted uppercase tracking-[0.2em]">{t('customer.recent_onboarding') || 'Recent Onboarding Protocol'}</span>
            </div>
          </Card>

          <Card className="!p-6 bg-[var(--color-obsidian-card)] border border-[var(--color-border)] shadow-xl hover:border-brand/40 transition-all duration-500 cursor-default group overflow-hidden relative active:scale-[0.98]">
            <div className="relative z-10">
              <div className="flex items-start justify-between mb-4">
                <div className="space-y-1">
                  <span className="text-[10px] font-black text-zinc-muted uppercase tracking-[0.25em] block">
                     {t('customer.top_spenders') || 'Priority Accounts'}
                  </span>
                  <p className="text-[9px] text-zinc-muted font-bold uppercase tracking-tight mt-0.5">Top Transaction Velocity</p>
                </div>
                <div className="p-2 bg-brand/10 rounded-lg text-brand group-hover:rotate-12 transition-transform">
                  <Trophy className="w-4 h-4" />
                </div>
              </div>
              <div className="flex items-center justify-between mt-auto">
                <AmberAvatarGroup max={4} size="sm" className="space-x-[-12px]">
                  {((stats.topSpenders as any) || []).map((c: any) => (
                    <AmberAvatar 
                      key={c.id} 
                      src={c.avatar} 
                      fallback={c.name} 
                      size="sm" 
                      className="ring-2 ring-[var(--color-obsidian-card)] group-hover:ring-brand/30 transition-all"
                    />
                  ))}
                </AmberAvatarGroup>
                <div className="text-right">
                   <div className="text-xs font-black text-brand tracking-tighter">$14.2k</div>
                   <div className="text-[8px] font-bold text-zinc-muted uppercase">Avg/Session</div>
                </div>
              </div>
            </div>
            <div className="absolute bottom-0 right-0 w-24 h-24 bg-brand/5 rounded-full blur-[60px] translate-x-12 translate-y-12" />
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
