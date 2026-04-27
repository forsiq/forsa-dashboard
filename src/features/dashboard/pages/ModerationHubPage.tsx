import React, { useState, useMemo } from 'react';
import { useAllBids, useVoidBid, useSuspendUser } from '../../auctions/api/auction-hooks';
import { useConfirmModal } from '@core/components/Feedback/AmberConfirmModal';
import { useLanguage } from '@core/contexts/LanguageContext';
import { PageHeader } from '@core/components/Layout/PageHeader';
import { StatsGrid } from '@core/components/Layout/StatsGrid';
import { StatusBadge } from '@core/components/Data/StatusBadge';
import { DataTable, Column, Action } from '@core/components/Data/DataTable';
import { AmberTableSkeleton } from '@core/components/Loading/AmberTableSkeleton';
import { cn } from '@core/lib/utils/cn';
import { useDebounce } from '@core/hooks/useDebounce';
import { Ban, Snowflake, Gavel, AlertTriangle, XCircle, Search } from 'lucide-react';
import type { AllBidsItem } from '../../auctions/api/auction-api';

function maskId(id: string): string {
  return id.substring(0, 8) + '...';
}

function bidStatusVariant(status: string): 'success' | 'info' | 'inactive' | 'error' {
  switch (status) {
    case 'winning': return 'success';
    case 'active': return 'info';
    case 'outbid': return 'inactive';
    case 'cancelled': return 'error';
    default: return 'inactive';
  }
}

function bidStatusLabel(status: string, t: (key: string) => string): string {
  const map: Record<string, string> = {
    winning: t('moderation.status.winning'),
    active: t('moderation.status.active'),
    outbid: t('moderation.status.outbid'),
    cancelled: t('moderation.status.cancelled'),
  };
  return map[status] || status;
}

function timeAgo(dateStr: string, t: (key: string) => string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return t('moderation.just_now');
  if (minutes < 60) return `${minutes}${t('moderation.time_m')}`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}${t('moderation.time_h')}`;
  return `${Math.floor(hours / 24)}${t('moderation.time_d')}`;
}

export const ModerationHubPage = () => {
  const { t, dir } = useLanguage();
  const isRTL = dir === 'rtl';
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [bidderInput, setBidderInput] = useState('');

  // Debounce bidder search — only hit API after 300ms of inactivity
  const debouncedBidder = useDebounce(bidderInput, 300);

  const { data: bidsData, isLoading } = useAllBids({
    page,
    limit: 20,
    status: statusFilter || undefined,
    bidderId: debouncedBidder || undefined,
  });

  const voidBid = useVoidBid();
  const suspendUser = useSuspendUser();
  const { openConfirm, ConfirmModal: ConfirmModalComponent } = useConfirmModal();

  const items = bidsData?.items || [];
  const total = bidsData?.total || 0;

  const stats = useMemo(() => {
    return {
      totalBids: total,
      flagged: items.filter((i) => Number(i.amount) > 1000000).length,
      voided: items.filter((i) => i.status === 'cancelled').length,
    };
  }, [items, total]);

  const columns: Column<AllBidsItem>[] = [
    {
      key: 'id',
      label: t('moderation.col.bid_id'),
      cardTitle: true,
      render: (item) => (
        <span className="font-bold text-zinc-text">#{item.id}</span>
      ),
    },
    {
      key: 'auctionId',
      label: t('moderation.col.auction'),
      cardSubtitle: true,
      render: (item) => (
        <span className="text-sm text-zinc-text truncate max-w-[200px] block">
          {item.auction?.title || `Auction #${item.auctionId}`}
        </span>
      ),
    },
    {
      key: 'bidderId',
      label: t('moderation.col.bidder'),
      render: (item) => (
        <span className="font-mono text-zinc-secondary text-sm">{maskId(item.bidderId)}</span>
      ),
    },
    {
      key: 'amount',
      label: t('moderation.col.amount'),
      render: (item) => (
        <span className="text-zinc-text font-black tabular-nums">
          {Number(item.amount).toLocaleString()} <span className="text-zinc-muted font-normal text-xs">IQD</span>
        </span>
      ),
      align: 'center',
    },
    {
      key: 'status',
      label: t('moderation.col.status'),
      cardBadge: true,
      render: (item) => (
        <StatusBadge
          status={bidStatusLabel(item.status, t)}
          variant={bidStatusVariant(item.status)}
          showDot
          size="sm"
          className="font-black"
        />
      ),
      align: 'center',
    },
    {
      key: 'createdAt',
      label: t('moderation.col.time'),
      render: (item) => (
        <span className="text-zinc-muted text-sm font-medium">
          {timeAgo(item.createdAt, t)}
        </span>
      ),
      align: 'center',
    },
  ];

  const rowActions: Action<AllBidsItem>[] = [
    {
      label: (item) => item.status !== 'cancelled' ? t('moderation.action.void') : null,
      icon: Ban,
      variant: 'danger',
      onClick: (item) =>
        openConfirm({
          title: t('moderation.void_title'),
          message: `${t('moderation.void_confirm')} #${item.id} — ${Number(item.amount).toLocaleString()} IQD? ${
            item.status === 'winning' ? t('moderation.void_winning_warning') : ''
          }`,
          confirmText: t('moderation.void_confirm_btn'),
          variant: 'danger',
          onConfirm: () => voidBid.mutate(item.id),
        }),
    },
    {
      label: t('moderation.action.freeze'),
      icon: Snowflake,
      variant: 'danger',
      onClick: (item) =>
        openConfirm({
          title: t('moderation.freeze_title'),
          message: `${t('moderation.freeze_confirm')} ${maskId(item.bidderId)}`,
          confirmText: t('moderation.freeze_confirm_btn'),
          variant: 'danger',
          onConfirm: () => suspendUser.mutate(item.bidderId),
        }),
    },
  ];

  return (
    <div className="flex flex-col gap-4 p-4 pt-0" dir={dir}>
      <ConfirmModalComponent />

      {/* Page Header */}
      <PageHeader
        title={t('moderation.title')}
        description={t('moderation.subtitle')}
      />

      {/* Stats Grid */}
      <StatsGrid
        stats={[
          { label: t('moderation.stat.total_bids'), value: stats.totalBids.toString(), icon: Gavel, color: 'brand' },
          { label: t('moderation.stat.flagged'), value: stats.flagged.toString(), icon: AlertTriangle, color: 'warning' },
          { label: t('moderation.stat.voided'), value: stats.voided.toString(), icon: XCircle, color: 'danger' },
        ]}
        columns={3}
      />

      {/* Filters */}
      <div className={cn(
        "flex flex-col md:flex-row items-center gap-4 text-start"
      )}>
        {/* Status Filter */}
        <div className="flex items-center bg-[var(--color-obsidian-card)] border border-[var(--color-border)] p-1.5 rounded-xl shadow-sm">
          {[
            { key: '', label: t('moderation.filter.all') },
            { key: 'winning', label: t('moderation.status.winning') },
            { key: 'active', label: t('moderation.status.active') },
            { key: 'outbid', label: t('moderation.status.outbid') },
            { key: 'cancelled', label: t('moderation.status.cancelled') },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => { setStatusFilter(tab.key); setPage(1); }}
              className={cn(
                'px-4 py-2.5 text-sm font-bold transition-colors rounded-lg whitespace-nowrap',
                statusFilter === tab.key
                  ? 'bg-[var(--color-brand)] text-black shadow-sm'
                  : 'text-zinc-muted hover:text-zinc-text hover:bg-[var(--color-obsidian-hover)]'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Bidder ID Search */}
        <div className="relative flex-1 max-w-sm w-full group">
          <Search className={cn(
            "absolute top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-muted group-focus-within:text-[var(--color-brand)] transition-colors",
            'end-4'
          )} />
          <input
            type="text"
            value={bidderInput}
            onChange={(e) => { setBidderInput(e.target.value); setPage(1); }}
            placeholder={t('moderation.filter.bidder_placeholder')}
            className={cn(
              "w-full bg-[var(--color-obsidian-card)] border-[var(--color-border)] shadow-sm rounded-xl h-11 text-xs text-zinc-text font-bold focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)]/20",
              'ps-4 pe-10 text-start'
            )}
          />
        </div>

        {/* Clear Filters */}
        {(statusFilter || bidderInput) && (
          <button
            onClick={() => { setStatusFilter(''); setBidderInput(''); setPage(1); }}
            className="px-4 py-2.5 text-xs font-black uppercase tracking-widest rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-colors"
          >
            {t('moderation.filter.clear')}
          </button>
        )}
      </div>

      {/* Table */}
      <div className="bg-[var(--color-obsidian-card)] border border-[var(--color-border)] rounded-2xl shadow-sm overflow-hidden">
        {isLoading ? (
          <AmberTableSkeleton rows={8} columns={6} />
        ) : (
          <DataTable
            columns={columns}
            data={items}
            keyField="id"
            rowActions={rowActions}
            pagination
            pageSize={20}
            totalItems={total}
            currentPage={page}
            onPageChange={setPage}
            emptyMessage={t('moderation.no_bids')}
          />
        )}
      </div>
    </div>
  );
};
