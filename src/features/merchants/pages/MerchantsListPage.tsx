import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import { useLanguage } from '@core/contexts/LanguageContext';
import { useIsMobile } from '@core/hooks/useIsMobile';
import {
  AdminListPageShell,
  ListPageToolbar,
  ListPageToolbarSearch,
} from '@core/components/Layout';
import { StatusBadge } from '@core/components/Data/StatusBadge';
import { DataTable, Column, Action } from '@core/components/Data/DataTable';
import { ListPageSkeleton, FetchingOverlay } from '@core/loading';
import { EmptyState } from '@core/components/EmptyState';
import { cn } from '@core/lib/utils/cn';
import { useDebounce } from '@core/hooks/useDebounce';
import { useFilterState } from '@core/hooks/useFilterState';
import { Store, Eye, Users, X } from 'lucide-react';
import { useGetMerchants } from '../hooks/useMerchants';
import type { Merchant } from '../services/merchantsService';

const PAGE_SIZE = 20;

function merchantStatusVariant(status: string): 'success' | 'error' | 'inactive' {
  switch (status) {
    case 'active':
      return 'success';
    case 'suspended':
      return 'error';
    default:
      return 'inactive';
  }
}

function merchantContactLine(merchant: Merchant): string {
  const phone = merchant.phone?.trim();
  if (phone && phone !== '—') return phone;
  const email = merchant.email?.trim();
  if (email) return email;
  const username = merchant.username?.trim();
  if (username) return `@${username}`;
  return '—';
}

function merchantInitials(name: string): string {
  return (
    name
      ?.split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join('') || '?'
  );
}

export function MerchantsListPage() {
  const { t, dir } = useLanguage();
  const router = useRouter();
  const { isMobile } = useIsMobile();
  const [isClient, setIsClient] = useState(false);

  const [searchInput, setSearchInput] = useFilterState('search', '');
  const [statusFilter, setStatusFilter] = useFilterState<string>('status', 'all');
  const [page, setPage] = useFilterState('page', 1);
  const debouncedSearch = useDebounce(searchInput, 300);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const { data: merchantsData, isPending, isFetching } = useGetMerchants({
    search: debouncedSearch || undefined,
    status: statusFilter !== 'all' ? statusFilter : undefined,
    page,
    limit: PAGE_SIZE,
  });

  const merchants = Array.isArray(merchantsData?.data) ? merchantsData.data : [];
  const total = merchantsData?.total || 0;
  const hasFilters = statusFilter !== 'all' || Boolean(searchInput);

  const clearFilters = () => {
    setStatusFilter('all');
    setSearchInput('');
    setPage(1);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleDateString(dir === 'rtl' ? 'ar-IQ' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const columns: Column<Merchant>[] = useMemo(
    () => [
      {
        key: 'name',
        label: t('merchant.table.name') || 'Name',
        cardTitle: true,
        className: 'max-w-[min(42vw,24rem)]',
        render: (merchant) => (
          <div className="flex min-w-0 items-center gap-3">
            {merchant.avatar ? (
              <img
                src={merchant.avatar}
                alt=""
                className="h-10 w-10 shrink-0 rounded-lg border border-white/10 object-cover"
              />
            ) : (
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-brand/20 bg-brand/10 text-[10px] font-black text-brand">
                {merchantInitials(merchant.name)}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-black text-zinc-text tracking-tight">
                {merchant.name}
              </p>
              {merchant.email && merchant.email !== merchant.name && (
                <p className="mt-0.5 truncate text-[11px] font-bold uppercase tracking-widest text-zinc-muted">
                  {merchant.email}
                </p>
              )}
            </div>
          </div>
        ),
      },
      {
        key: 'phone',
        label: t('merchant.table.phone') || 'Phone',
        cardSubtitle: true,
        render: (merchant) => (
          <span className="text-[13px] font-bold text-zinc-muted">{merchantContactLine(merchant)}</span>
        ),
      },
      {
        key: 'productsCount',
        label: t('merchant.table.products') || 'Products',
        align: 'center',
        render: (merchant) => (
          <span className="text-base font-black tabular-nums text-zinc-text">{merchant.productsCount}</span>
        ),
      },
      {
        key: 'auctionsCount',
        label: t('merchant.table.auctions') || 'Auctions',
        align: 'center',
        render: (merchant) => (
          <span className="text-base font-black tabular-nums text-brand">{merchant.auctionsCount}</span>
        ),
      },
      {
        key: 'status',
        label: t('merchant.table.status') || 'Status',
        cardBadge: true,
        align: 'center',
        render: (merchant) => (
          <StatusBadge
            status={merchant.status}
            labelKey={`merchant.filter.${merchant.status}`}
            variant={merchantStatusVariant(merchant.status)}
            showDot
            size="sm"
            className="font-bold text-[11px]"
          />
        ),
      },
      {
        key: 'joinedAt',
        label: t('merchant.table.joined') || 'Joined',
        render: (merchant) => (
          <span className="text-[13px] font-bold text-zinc-muted tabular-nums">
            {formatDate(merchant.joinedAt)}
          </span>
        ),
        align: 'center',
      },
    ],
    [t, dir],
  );

  const rowActions: Action<Merchant>[] = useMemo(
    () => [
      {
        label: t('common.view') || 'View',
        icon: Eye,
        onClick: (merchant) => router.push(`/merchants/${merchant.id}`),
      },
    ],
    [router, t],
  );

  if (!isClient) return null;

  return (
    <AdminListPageShell
      title={t('merchant.title') || 'Merchants'}
      description={t('merchant.list.subtitle') || 'Manage merchant accounts and view their activity'}
      icon={Store}
      className="p-3 md:p-6 space-y-4 md:space-y-8"
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
        <div className="flex items-center gap-1 overflow-x-auto rounded-xl border border-[var(--color-border)] bg-[var(--color-obsidian-card)] p-1.5 shadow-sm scrollbar-hide">
          {[
            { key: 'all', label: t('merchant.filter.all') || 'All' },
            { key: 'active', label: t('merchant.filter.active') || 'Active' },
            { key: 'inactive', label: t('merchant.filter.inactive') || 'Inactive' },
            { key: 'suspended', label: t('merchant.filter.suspended') || 'Suspended' },
          ].map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => {
                setStatusFilter(tab.key);
                setPage(1);
              }}
              className={cn(
                'whitespace-nowrap rounded-lg px-4 py-2.5 text-[11px] font-black uppercase tracking-widest transition-colors',
                statusFilter === tab.key
                  ? 'bg-[var(--color-brand)] text-black shadow-sm'
                  : 'text-zinc-muted hover:bg-black/5 hover:text-zinc-text',
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
              onChange={(v) => {
                setSearchInput(v);
                setPage(1);
              }}
              placeholder={t('merchant.search') || 'Search merchants...'}
            />
          }
          endActions={
            hasFilters ? (
              <button
                type="button"
                onClick={clearFilters}
                className="flex items-center gap-1.5 whitespace-nowrap rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs font-black uppercase tracking-widest text-red-400 transition-colors hover:bg-red-500/20"
              >
                <X className="h-3 w-3" />
                {t('common.clear_filters') || 'Clear'}
              </button>
            ) : undefined
          }
        />
      }
    >
      <div className="space-y-6">
        {isPending ? (
          <ListPageSkeleton count={6} columns={4} />
        ) : merchants.length === 0 ? (
          <EmptyState
            icon={Store}
            title={t('merchant.list.empty') || 'No merchants found'}
            description={t('merchant.list.subtitle') || 'Manage merchant accounts and view their activity'}
          />
        ) : (
          <div className="relative overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-obsidian-card)] shadow-sm">
            {isFetching && <FetchingOverlay />}
            <DataTable
              columns={columns}
              data={merchants}
              keyField="id"
              rowActions={rowActions}
              onRowClick={(merchant) => router.push(`/merchants/${merchant.id}`)}
              pagination
              pageSize={PAGE_SIZE}
              currentPage={page}
              totalItems={total}
              onPageChange={setPage}
              showViewToggle
              viewMode={isMobile ? 'grid' : 'table'}
              gridCols={2}
            />
          </div>
        )}
      </div>
    </AdminListPageShell>
  );
}
