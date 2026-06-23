import React from 'react';
import { useRouter } from 'next/router';
import { useLanguage } from '@core/contexts/LanguageContext';
import {
  AdminListPageShell,
  ListPageToolbar,
  ListPageToolbarSearch,
} from '@core/components/Layout';
import { StatusBadge } from '@core/components/Data/StatusBadge';
import { cn } from '@core/lib/utils/cn';
import { useDebounce } from '@core/hooks/useDebounce';
import { useFilterState } from '@core/hooks/useFilterState';
import {
  UserPlus,
  Phone,
  Tag,
  Calendar,
  ChevronLeft,
  ChevronRight,
  X,
  Inbox,
} from 'lucide-react';
import dayjs from 'dayjs';
import { useGetApplications } from '../hooks/useMerchantApplications';
import type {
  MerchantApplication,
  MerchantApplicationStatus,
} from '../services/merchantApplicationsService';

function applicationStatusVariant(status: string): 'success' | 'error' | 'warning' | 'info' {
  switch (status) {
    case 'approved': return 'success';
    case 'rejected': return 'error';
    case 'pending': return 'warning';
    default: return 'info';
  }
}

export function ApplicationsListPage() {
  const { t } = useLanguage();
  const router = useRouter();

  const [searchInput, setSearchInput] = useFilterState('search', '');
  const [statusFilter, setStatusFilter] = useFilterState<string>('status', 'all');
  const [page, setPage] = useFilterState('page', 1);
  const debouncedSearch = useDebounce(searchInput, 300);

  const { data: applicationsData, isPending, isFetching } = useGetApplications({
    search: debouncedSearch || undefined,
    status: statusFilter !== 'all' ? statusFilter : undefined,
    page,
    limit: 20,
  });

  const applications = Array.isArray(applicationsData?.data)
    ? applicationsData.data
    : [];
  const total = applicationsData?.total || 0;
  const totalPages = applicationsData?.totalPages || 1;

  const pendingCount = applications.filter((a) => a.status === 'pending').length;
  const approvedCount = applications.filter((a) => a.status === 'approved').length;
  const rejectedCount = applications.filter((a) => a.status === 'rejected').length;

  const hasFilters = statusFilter !== 'all' || searchInput;

  const clearFilters = () => {
    setStatusFilter('all');
    setSearchInput('');
    setPage(1);
  };

  return (
    <AdminListPageShell
      title={t('merchantApps.title') || 'Merchant Applications'}
      description={t('merchantApps.subtitle') || 'Review and approve merchant join requests'}
      icon={UserPlus}
      className="p-3 md:p-6 space-y-4 md:space-y-8"
      stats={[
        {
          label: t('merchantApps.stats.total') || 'Total',
          value: total.toString(),
          icon: UserPlus,
          color: 'brand',
        },
        {
          label: t('merchantApps.stats.pending') || 'Pending',
          value: pendingCount.toString(),
          icon: Calendar,
          color: 'warning',
        },
        {
          label: t('merchantApps.stats.approved') || 'Approved',
          value: approvedCount.toString(),
          icon: Inbox,
          color: 'success',
        },
        {
          label: t('merchantApps.stats.rejected') || 'Rejected',
          value: rejectedCount.toString(),
          icon: X,
          color: 'danger',
        },
      ]}
      statsColumns={4}
      tabs={
        <div className="flex items-center gap-1 bg-[var(--color-obsidian-card)] border border-[var(--color-border)] p-1.5 rounded-xl shadow-sm overflow-x-auto scrollbar-hide">
          {[
            { key: 'all', label: t('merchantApps.filter.all') || 'All' },
            { key: 'pending', label: t('merchantApps.filter.pending') || 'Pending' },
            { key: 'approved', label: t('merchantApps.filter.approved') || 'Approved' },
            { key: 'rejected', label: t('merchantApps.filter.rejected') || 'Rejected' },
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
              placeholder={t('merchantApps.search') || 'Search applications...'}
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
      ) : applications.length === 0 ? (
        <div className="bg-[var(--color-obsidian-card)] border border-[var(--color-border)] rounded-2xl p-16 text-center">
          <UserPlus className="w-12 h-12 text-zinc-muted mx-auto mb-4" />
          <p className="text-sm text-zinc-muted font-bold">
            {t('merchantApps.list.empty') || 'No applications found'}
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
            <div className="hidden md:grid grid-cols-[2fr_1.2fr_1.4fr_0.8fr_1fr_0.4fr] gap-4 px-5 py-3 border-b border-[var(--color-border)] bg-white/[0.01]">
              <span className="text-[11px] font-black uppercase tracking-widest text-zinc-muted">{t('merchantApps.table.business') || 'Business'}</span>
              <span className="text-[11px] font-black uppercase tracking-widest text-zinc-muted">{t('merchantApps.table.phone') || 'Phone'}</span>
              <span className="text-[11px] font-black uppercase tracking-widest text-zinc-muted">{t('merchantApps.table.categories') || 'Categories'}</span>
              <span className="text-[11px] font-black uppercase tracking-widest text-zinc-muted text-center">{t('merchantApps.table.status') || 'Status'}</span>
              <span className="text-[11px] font-black uppercase tracking-widest text-zinc-muted">{t('merchantApps.table.submitted') || 'Submitted'}</span>
              <span className="text-[11px] font-black uppercase tracking-widest text-zinc-muted" />
            </div>

            {/* Rows */}
            <div className="divide-y divide-[var(--color-border)]">
              {applications.map((application) => (
                <ApplicationRow
                  key={application.id}
                  application={application}
                  t={t}
                  onClick={() => router.push(`/merchant-applications/${application.id}`)}
                />
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

function ApplicationRow({
  application,
  t,
  onClick,
}: {
  application: MerchantApplication;
  t: (key: string) => string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full text-start grid grid-cols-1 md:grid-cols-[2fr_1.2fr_1.4fr_0.8fr_1fr_0.4fr] gap-2 md:gap-4 px-5 py-4 hover:bg-white/[0.01] transition-colors group"
    >
      {/* Business Name */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-brand/10 flex items-center justify-center text-brand text-xs font-black shrink-0">
          {application.businessName?.[0]?.toUpperCase() || '?'}
        </div>
        <span className="text-sm font-bold text-zinc-text truncate group-hover:text-[var(--color-brand)] transition-colors">
          {application.businessName}
        </span>
      </div>

      {/* Phone */}
      <div className="flex items-center gap-1.5">
        <Phone className="w-3 h-3 text-zinc-muted hidden md:block" />
        <span className="text-[12px] text-zinc-muted font-medium">{application.phone}</span>
      </div>

      {/* Categories */}
      <div className="flex items-center gap-1.5">
        <Tag className="w-3 h-3 text-zinc-muted hidden md:block shrink-0" />
        <span className="text-[12px] text-zinc-muted truncate">
          {application.productCategories || '—'}
        </span>
      </div>

      {/* Status */}
      <div className="flex justify-center">
        <StatusBadge
          status={application.status}
          variant={applicationStatusVariant(application.status)}
          showDot
          size="sm"
          className="font-bold text-[11px]"
        />
      </div>

      {/* Submitted */}
      <div className="flex items-center gap-1.5">
        <Calendar className="w-3 h-3 text-zinc-muted hidden md:block" />
        <span className="text-[12px] text-zinc-muted">{dayjs(application.createdAt).format('MMM D, YYYY')}</span>
      </div>

      {/* Chevron */}
      <div className="hidden md:flex items-center justify-end">
        <ChevronRight className="w-4 h-4 text-zinc-muted group-hover:text-[var(--color-brand)] transition-colors" />
      </div>
    </button>
  );
}

export { applicationStatusVariant };
export type { MerchantApplicationStatus };
