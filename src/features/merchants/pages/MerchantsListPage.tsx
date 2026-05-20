import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { useLanguage } from '@core/contexts/LanguageContext';
import {
  AdminListPageShell,
  ListPageToolbar,
  ListPageToolbarSearch,
} from '@core/components/Layout';
import { StatusBadge } from '@core/components/Data/StatusBadge';
import { AmberButton } from '@core/components/AmberButton';
import { cn } from '@core/lib/utils/cn';
import { useDebounce } from '@core/hooks/useDebounce';
import {
  Store,
  Package,
  Gavel,
  Phone,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Users,
  X,
} from 'lucide-react';
import dayjs from 'dayjs';
import { useGetMerchants } from '../hooks/useMerchants';
import type { Merchant } from '../services/merchantsService';

function merchantStatusVariant(status: string): 'success' | 'error' | 'inactive' {
  switch (status) {
    case 'active': return 'success';
    case 'suspended': return 'error';
    default: return 'inactive';
  }
}

export function MerchantsListPage() {
  const { t } = useLanguage();
  const router = useRouter();

  const [searchInput, setSearchInput] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebounce(searchInput, 300);

  const { data: merchantsData, isPending, isFetching } = useGetMerchants({
    search: debouncedSearch || undefined,
    status: statusFilter !== 'all' ? statusFilter : undefined,
    page,
    limit: 20,
  });

  const merchants = Array.isArray(merchantsData?.data) ? merchantsData.data : [];
  const total = merchantsData?.total || 0;
  const totalPages = merchantsData?.totalPages || 1;

  const hasFilters = statusFilter !== 'all' || searchInput;

  const clearFilters = () => {
    setStatusFilter('all');
    setSearchInput('');
    setPage(1);
  };

  return (
    <AdminListPageShell
      title={t('merchant.title') || 'Merchants'}
      description={t('merchant.list.subtitle') || 'Manage merchant accounts and view their activity'}
      icon={Store}
      stats={[
        {
          label: t('merchant.stats.total') || 'Total Merchants',
          value: total.toString(),
          icon: Users,
          color: 'brand',
        },
      ]}
      statsColumns={1}
      tabs={
        <div className="flex items-center gap-1 bg-[var(--color-obsidian-card)] border border-[var(--color-border)] p-1.5 rounded-xl shadow-sm overflow-x-auto scrollbar-hide">
          {[
            { key: 'all', label: t('merchant.filter.all') || 'All' },
            { key: 'active', label: t('merchant.filter.active') || 'Active' },
            { key: 'inactive', label: t('merchant.filter.inactive') || 'Inactive' },
            { key: 'suspended', label: t('merchant.filter.suspended') || 'Suspended' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => { setStatusFilter(tab.key); setPage(1); }}
              className={cn(
                'px-4 py-2.5 text-[11px] font-black uppercase tracking-widest transition-colors rounded-lg whitespace-nowrap',
                statusFilter === tab.key
                  ? 'bg-[var(--color-brand)] text-black shadow-sm'
                  : 'text-zinc-muted hover:text-zinc-text hover:bg-black/5',
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      }
      toolbar={
        <ListPageToolbar
          search={
            <ListPageToolbarSearch
              value={searchInput}
              onChange={(v) => { setSearchInput(v); setPage(1); }}
              placeholder={t('merchant.search') || 'Search merchants...'}
            />
          }
          endActions={
            hasFilters ? (
              <button
                type="button"
                onClick={clearFilters}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-black uppercase tracking-widest rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-colors whitespace-nowrap"
              >
                <X className="w-3 h-3" />
                {t('common.clear_filters') || 'Clear'}
              </button>
            ) : undefined
          }
        />
      }
    >
      <div className="space-y-6">
      {isPending ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="bg-[var(--color-obsidian-card)] border border-[var(--color-border)] rounded-2xl p-5 animate-pulse">
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-full bg-[var(--color-obsidian-outer)]" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-[var(--color-obsidian-outer)] rounded w-1/3" />
                  <div className="h-2 bg-[var(--color-obsidian-outer)] rounded w-1/2" />
                  <div className="h-2 bg-[var(--color-obsidian-outer)] rounded w-1/4" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : merchants.length === 0 ? (
        <div className="bg-[var(--color-obsidian-card)] border border-[var(--color-border)] rounded-2xl p-16 text-center">
          <Store className="w-12 h-12 text-zinc-muted mx-auto mb-4" />
          <p className="text-sm text-zinc-muted font-bold">
            {t('merchant.list.empty') || 'No merchants found'}
          </p>
        </div>
      ) : (
        <>
          <div className="relative bg-[var(--color-obsidian-card)] border border-[var(--color-border)] rounded-2xl shadow-sm overflow-hidden">
            {isFetching && !isPending && (
              <div className="absolute inset-0 z-[80] flex items-start justify-center pt-2 pointer-events-none">
                <div className="flex items-center gap-2 bg-[var(--color-obsidian-card)]/80 backdrop-blur-sm border border-white/[0.05] rounded-lg px-3 py-1.5">
                  <div className="w-3 h-3 border-2 border-[var(--color-brand)] border-t-transparent rounded-full animate-spin" />
                  <span className="text-[11px] font-black uppercase tracking-widest text-zinc-muted">Refreshing...</span>
                </div>
              </div>
            )}

            {/* Table Header */}
            <div className="hidden md:grid grid-cols-[2fr_1fr_0.7fr_0.7fr_0.8fr_0.8fr] gap-4 px-5 py-3 border-b border-[var(--color-border)] bg-white/[0.01]">
              <span className="text-[11px] font-black uppercase tracking-widest text-zinc-muted">{t('merchant.table.name') || 'Name'}</span>
              <span className="text-[11px] font-black uppercase tracking-widest text-zinc-muted">{t('merchant.table.phone') || 'Phone'}</span>
              <span className="text-[11px] font-black uppercase tracking-widest text-zinc-muted text-center">{t('merchant.table.products') || 'Products'}</span>
              <span className="text-[11px] font-black uppercase tracking-widest text-zinc-muted text-center">{t('merchant.table.auctions') || 'Auctions'}</span>
              <span className="text-[11px] font-black uppercase tracking-widest text-zinc-muted text-center">{t('merchant.table.status') || 'Status'}</span>
              <span className="text-[11px] font-black uppercase tracking-widest text-zinc-muted">{t('merchant.table.joined') || 'Joined'}</span>
            </div>

            {/* Rows */}
            <div className="divide-y divide-[var(--color-border)]">
              {merchants.map((merchant) => (
                <MerchantRow key={merchant.id} merchant={merchant} t={t} onClick={() => router.push(`/merchants/${merchant.id}`)} />
              ))}
            </div>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page <= 1}
                className="p-2 rounded-lg bg-[var(--color-obsidian-card)] border border-[var(--color-border)] text-zinc-muted hover:text-zinc-text disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-xs text-zinc-muted font-bold tabular-nums">
                {page} / {totalPages}
              </span>
              <button
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page >= totalPages}
                className="p-2 rounded-lg bg-[var(--color-obsidian-card)] border border-[var(--color-border)] text-zinc-muted hover:text-zinc-text disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </>
      )}
      </div>
    </AdminListPageShell>
  );
}

function MerchantRow({ merchant, t, onClick }: { merchant: Merchant; t: (key: string) => string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full text-start grid grid-cols-1 md:grid-cols-[2fr_1fr_0.7fr_0.7fr_0.8fr_0.8fr] gap-2 md:gap-4 px-5 py-4 hover:bg-white/[0.01] transition-colors group"
    >
      {/* Name */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-brand/10 flex items-center justify-center text-brand text-xs font-black shrink-0">
          {merchant.name?.[0]?.toUpperCase() || '?'}
        </div>
        <span className="text-sm font-bold text-zinc-text truncate group-hover:text-[var(--color-brand)] transition-colors">
          {merchant.name}
        </span>
      </div>

      {/* Phone */}
      <div className="flex items-center gap-1.5">
        <Phone className="w-3 h-3 text-zinc-muted hidden md:block" />
        <span className="text-[12px] text-zinc-muted font-medium">{merchant.phone}</span>
      </div>

      {/* Products */}
      <div className="flex items-center justify-center gap-1">
        <Package className="w-3 h-3 text-zinc-muted" />
        <span className="text-xs font-bold text-zinc-text tabular-nums">{merchant.productsCount}</span>
      </div>

      {/* Auctions */}
      <div className="flex items-center justify-center gap-1">
        <Gavel className="w-3 h-3 text-zinc-muted" />
        <span className="text-xs font-bold text-zinc-text tabular-nums">{merchant.auctionsCount}</span>
      </div>

      {/* Status */}
      <div className="flex justify-center">
        <StatusBadge
          status={merchant.status}
          variant={merchantStatusVariant(merchant.status)}
          showDot
          size="sm"
          className="font-bold text-[11px]"
        />
      </div>

      {/* Joined */}
      <div className="flex items-center gap-1.5">
        <Calendar className="w-3 h-3 text-zinc-muted hidden md:block" />
        <span className="text-[12px] text-zinc-muted">{dayjs(merchant.joinedAt).format('MMM D, YYYY')}</span>
      </div>
    </button>
  );
}
