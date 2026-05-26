import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import {
  useModerationActivity,
  useModerationActivityStats,
  useModerationTimeline,
  useAllBids,
  useVoidBid,
  useSuspendUser,
  useUnsuspendUser,
} from '../../auctions/api/auction-hooks';
import { useLanguage } from '@core/contexts/LanguageContext';
import { useToast } from '@core/contexts/ToastContext';
import { AdminListPageShell } from '@core/components/Layout';
import { StatusBadge } from '@core/components/Data/StatusBadge';
import { AmberButton } from '@core/components/AmberButton';
import { cn } from '@core/lib/utils/cn';
import { useDebounce } from '@core/hooks/useDebounce';
import { AuctionImage } from '../../auctions/components/AuctionImage';
import {
  Activity,
  Zap,
  Flame,
  Snowflake,
  Clock,
  TrendingUp,
  Search,
  ChevronLeft,
  ChevronRight,
  Timer,
  Eye,
  Ban,
  UserX,
  UserCheck,
  AlertTriangle,
} from 'lucide-react';
import type { ActivityAuctionItem, TimelineEvent } from '../../auctions/api/auction-api';

function timeAgo(dateStr: string, t: (key: string) => string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return t('moderation.just_now');
  if (minutes < 60) return `${minutes}${t('moderation.time_m')}`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}${t('moderation.time_h')}`;
  return `${Math.floor(hours / 24)}${t('moderation.time_d')}`;
}

function maskId(id: string): string {
  return id.substring(0, 8) + '...';
}

function auctionStatusVariant(status: string): 'success' | 'info' | 'inactive' | 'error' | 'warning' {
  switch (status) {
    case 'active': return 'success';
    case 'paused': return 'warning';
    case 'ended':
    case 'sold': return 'inactive';
    case 'cancelled': return 'error';
    default: return 'info';
  }
}

function auctionStatusLabel(status: string, t: (key: string) => string): string {
  const map: Record<string, string> = {
    active: t('auction.lifecycle.active'),
    paused: t('auction.lifecycle.paused'),
    ended: t('auction.lifecycle.ended'),
    sold: t('auction.lifecycle.sold'),
    cancelled: t('auction.lifecycle.cancelled'),
    draft: t('auction.lifecycle.draft'),
    scheduled: t('auction.lifecycle.scheduled'),
  };
  return map[status] || status;
}

function activityIndicator(level: 'hot' | 'warm' | 'cold', t: (key: string) => string) {
  const config = {
    hot: { icon: Flame, color: 'text-red-400', bg: 'bg-red-400/10', label: t('moderation.activity.hot') },
    warm: { icon: Zap, color: 'text-amber-400', bg: 'bg-amber-400/10', label: t('moderation.activity.warm') },
    cold: { icon: Snowflake, color: 'text-blue-400', bg: 'bg-blue-400/10', label: t('moderation.activity.cold') },
  };
  const c = config[level];
  const Icon = c.icon;
  return (
    <span className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold', c.bg, c.color)}>
      <Icon className="w-3 h-3" />
      {c.label}
    </span>
  );
}

// ─── Timeline Event Component ──────────────────────────────────────────────
function TimelineEventRow({ event, t }: { event: TimelineEvent; t: (key: string) => string }) {
  return (
    <div className="flex items-start gap-3 py-2 border-b border-[var(--color-border)] last:border-0">
      <div className="flex-shrink-0 w-2 h-2 mt-2 rounded-full bg-[var(--color-brand)]" />
      <div className="flex-1 min-w-0">
        <p className="text-[13px] text-zinc-text leading-relaxed">
          <span className="font-mono text-zinc-muted">{maskId(event.bidderId)}</span>
          {' '}
          <span className="text-zinc-muted">{t('moderation.activity.timeline_bid')
            .replace('{amount}', Number(event.amount).toLocaleString())
            .replace('{auction}', event.auctionTitle || `#${event.auctionId}`)
          }</span>
        </p>
        <p className="text-[11px] text-zinc-muted mt-0.5">
          {event.createdAt ? timeAgo(event.createdAt, t) : ''}
        </p>
      </div>
    </div>
  );
}

// ─── Auction Card Component ────────────────────────────────────────────────
function AuctionCard({ auction, t, dir }: { auction: ActivityAuctionItem; t: (key: string) => string; dir: string }) {
  return (
    <div className="bg-[var(--color-obsidian-card)] border border-[var(--color-border)] rounded-2xl p-4 hover:border-[var(--color-brand)]/30 transition-all duration-200 group">
      <div className="flex gap-4">
        {/* Image */}
        <div className="flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden bg-[var(--color-obsidian-outer)]">
          <AuctionImage
            auction={{
              imageUrl: auction.image,
              mainAttachmentId: auction.mainAttachmentId ?? null,
              attachmentIds: auction.attachmentIds ?? null,
              images: auction.images ?? null,
            }}
            alt={auction.title}
            className="w-16 h-16"
            fallbackClassName="w-full h-full"
          />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          {/* Title + Status */}
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-bold text-sm text-zinc-text truncate">{auction.title}</h3>
            <div className="flex items-center gap-1.5 flex-shrink-0">
              {activityIndicator(auction.activityLevel, t)}
              <StatusBadge
                status={auctionStatusLabel(auction.status, t)}
                variant={auctionStatusVariant(auction.status)}
                showDot
                size="sm"
                className="font-bold text-[11px]"
              />
            </div>
          </div>

          {/* Stats row */}
          <div className="flex items-center gap-4 mt-2">
            {/* Bid count */}
            <div className="flex items-center gap-1">
              <Activity className="w-3.5 h-3.5 text-zinc-muted" />
              <span className="text-xs font-bold text-zinc-text">
                {auction.bidCount}
              </span>
              <span className="text-[11px] text-zinc-muted">
                {t('moderation.activity.bids_count')}
              </span>
            </div>

            {/* Current price */}
            <div className="flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5 text-[var(--color-brand)]" />
              <span className="text-xs font-black text-zinc-text tabular-nums">
                {auction.currentPrice.toLocaleString()}
              </span>
              <span className="text-[11px] text-zinc-muted">IQD</span>
            </div>
          </div>

          {/* Last bid */}
          <div className="flex items-center gap-2 mt-1.5">
            {auction.lastBid ? (
              <>
                <Clock className="w-3 h-3 text-zinc-muted" />
                <span className="text-[11px] text-zinc-muted">
                  {t('moderation.activity.last_bid')}: {Number(auction.lastBid.amount).toLocaleString()} IQD
                </span>
                <span className="text-[11px] text-zinc-muted/60">•</span>
                <span className="text-[11px] text-zinc-muted">
                  {timeAgo(auction.lastBid.timeAgo, t)}
                </span>
              </>
            ) : (
              <span className="text-[11px] text-zinc-muted">
                {t('moderation.activity.no_bids_yet')}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Bid Moderation Section ──────────────────────────────────────────────
function BidModerationSection() {
  const { t } = useLanguage();
  const toast = useToast();
  const [confirmAction, setConfirmAction] = useState<{
    type: 'void' | 'suspend' | 'unsuspend';
    id: string;
    label: string;
  } | null>(null);

  const { data: bidsData, isLoading: bidsLoading } = useAllBids({ limit: 20 });
  const voidBid = useVoidBid();
  const suspendUser = useSuspendUser();
  const unsuspendUser = useUnsuspendUser();

  const bids = (bidsData as any)?.data || (bidsData as any)?.bids || [];

  const handleConfirm = () => {
    if (!confirmAction) return;
    const { type, id } = confirmAction;
    if (type === 'void') {
      voidBid.mutate(id, { onSettled: () => setConfirmAction(null) });
    } else if (type === 'suspend') {
      suspendUser.mutate(id, { onSettled: () => setConfirmAction(null) });
    } else {
      unsuspendUser.mutate(id, { onSettled: () => setConfirmAction(null) });
    }
  };

  const isBusy = voidBid.isPending || suspendUser.isPending || unsuspendUser.isPending;

  return (
    <>
      <div className="bg-[var(--color-obsidian-card)] border border-[var(--color-border)] rounded-2xl p-6 space-y-4">
        <div className="flex items-center gap-3 border-b border-[var(--color-border)] pb-4">
          <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center text-red-400">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-black text-zinc-text uppercase tracking-widest">
            {t('moderation.recent_bids') || 'Recent Bids – Moderation'}
          </h3>
        </div>

        {bidsLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-14 bg-[var(--color-obsidian-outer)] rounded-xl animate-pulse" />
            ))}
          </div>
        ) : bids.length === 0 ? (
          <div className="py-8 text-center">
            <Activity className="w-8 h-8 text-zinc-muted mx-auto mb-2" />
            <p className="text-sm text-zinc-muted font-bold">{t('moderation.no_bids') || 'No recent bids to moderate'}</p>
          </div>
        ) : (
          <div className="space-y-2">
            {bids.map((bid: any) => (
              <div
                key={bid.id}
                className="flex items-center justify-between p-3 rounded-xl bg-[var(--color-obsidian-outer)]/40 border border-[var(--color-border)]"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-brand/10 flex items-center justify-center text-brand text-xs font-black shrink-0">
                    {bid.bidderName?.[0] || '?'}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-zinc-text truncate">
                      {bid.bidderName || maskId(bid.bidderId || bid.id)}
                    </p>
                    <p className="text-[11px] text-zinc-muted">
                      {Number(bid.amount).toLocaleString()} IQD — {bid.auctionTitle || `Auction #${bid.auctionId}`}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <AmberButton
                    className="h-8 px-3 text-[11px] font-black uppercase tracking-widest bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 rounded-lg transition-all"
                    onClick={() =>
                      setConfirmAction({
                        type: 'void',
                        id: String(bid.id),
                        label: `Bid #${bid.id} (${Number(bid.amount).toLocaleString()} IQD)`,
                      })
                    }
                    disabled={bid.status === 'voided'}
                  >
                    <Ban className="w-3 h-3 me-1" />
                    {bid.status === 'voided' ? 'Voided' : 'Void'}
                  </AmberButton>

                  <AmberButton
                    className="h-8 px-3 text-[11px] font-black uppercase tracking-widest bg-amber-500/10 border border-amber-500/20 text-amber-400 hover:bg-amber-500/20 rounded-lg transition-all"
                    onClick={() =>
                      setConfirmAction({
                        type: 'suspend',
                        id: String(bid.bidderId),
                        label: bid.bidderName || maskId(bid.bidderId),
                      })
                    }
                  >
                    <UserX className="w-3 h-3 me-1" />
                    Suspend
                  </AmberButton>

                  <AmberButton
                    className="h-8 px-3 text-[11px] font-black uppercase tracking-widest bg-success/10 border border-success/20 text-success hover:bg-success/20 rounded-lg transition-all"
                    onClick={() =>
                      setConfirmAction({
                        type: 'unsuspend',
                        id: String(bid.bidderId),
                        label: bid.bidderName || maskId(bid.bidderId),
                      })
                    }
                  >
                    <UserCheck className="w-3 h-3 me-1" />
                    Unsuspend
                  </AmberButton>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Confirmation Dialog */}
      {confirmAction && typeof window !== 'undefined' && ReactDOM.createPortal(
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200" role="dialog" aria-modal="true">
          <div className="bg-[var(--color-obsidian-card)] border border-[var(--color-border)] rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-danger/10 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-danger" />
              </div>
              <div>
                <h3 className="text-sm font-black text-zinc-text uppercase tracking-widest">
                  {confirmAction.type === 'void' ? 'Void Bid' : confirmAction.type === 'suspend' ? 'Suspend User' : 'Unsuspend User'}
                </h3>
                <p className="text-[13px] text-zinc-muted font-bold">{confirmAction.label}</p>
              </div>
            </div>
            <p className="text-sm text-zinc-muted mb-6">
              {confirmAction.type === 'void'
                ? 'Are you sure you want to void this bid? This action cannot be undone.'
                : confirmAction.type === 'suspend'
                  ? 'Are you sure you want to suspend this user? They will not be able to place bids.'
                  : 'Are you sure you want to unsuspend this user? They will be able to place bids again.'}
            </p>
            <div className="flex items-center justify-end gap-3">
              <AmberButton
                variant="outline"
                className="h-10 px-6 font-bold uppercase tracking-wider text-xs"
                onClick={() => setConfirmAction(null)}
                disabled={isBusy}
              >
                Cancel
              </AmberButton>
              <AmberButton
                className={cn(
                  'h-10 px-6 font-bold uppercase tracking-wider text-xs border-none',
                  confirmAction.type === 'unsuspend'
                    ? 'bg-success text-black hover:bg-success/90'
                    : 'bg-danger text-white hover:bg-danger/90'
                )}
                onClick={handleConfirm}
                disabled={isBusy}
              >
                {isBusy ? 'Processing...' : 'Confirm'}
              </AmberButton>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}

// ─── Main Page ──────────────────────────────────────────────────────────────
export const ModerationHubPage = () => {
  const { t, dir } = useLanguage();
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('most_active');
  const [searchInput, setSearchInput] = useState('');
  const debouncedSearch = useDebounce(searchInput, 300);

  const { data: statsData, isLoading: statsLoading } = useModerationActivityStats();
  const { data: activityData, isLoading: activityLoading } = useModerationActivity({
    status: statusFilter !== 'all' ? statusFilter : undefined,
    search: debouncedSearch || undefined,
    sortBy,
    page,
    limit: 12,
  });
  const { data: timelineData } = useModerationTimeline(10);

  const stats = statsData;
  const items = activityData?.items || [];
  const total = activityData?.total || 0;
  const totalPages = activityData?.totalPages || 1;
  const timeline = timelineData || [];

  const hasFilters = statusFilter !== 'all' || searchInput;

  const clearFilters = () => {
    setStatusFilter('all');
    setSearchInput('');
    setSortBy('most_active');
    setPage(1);
  };

  return (
    <AdminListPageShell
      title={t('moderation.activity.title')}
      description={t('moderation.activity.subtitle')}
      icon={Activity}
      stats={[
        {
          label: t('moderation.activity.stat.active'),
          value: (stats?.activeAuctions ?? 0).toString(),
          icon: Zap,
          color: 'success',
        },
        {
          label: t('moderation.activity.stat.ended'),
          value: (stats?.endedAuctions ?? 0).toString(),
          icon: Timer,
          color: 'muted',
        },
        {
          label: t('moderation.activity.stat.most_active'),
          value: stats?.mostActiveAuction?.title || t('moderation.activity.no_most_active'),
          valueClassName: 'text-zinc-text text-lg font-black leading-snug line-clamp-2 break-words',
          icon: Flame,
          color: 'warning',
          href: stats?.mostActiveAuction?.id ? `/auctions/${stats.mostActiveAuction.id}` : undefined,
        },
        {
          label: t('moderation.activity.stat.bids_today'),
          value: (stats?.totalBidsToday ?? 0).toString(),
          icon: Activity,
          color: 'brand',
        },
      ]}
      statsColumns={4}
    >
      <div className="space-y-8">
      {/* Main Layout: Activity + Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left: Filters + Auction Cards */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          {/* Filters Bar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            {/* Status Tabs */}
            <div className="flex items-center bg-[var(--color-obsidian-card)] border border-[var(--color-border)] p-1 rounded-xl shadow-sm">
              {[
                { key: 'all', label: t('moderation.activity.filter.all') },
                { key: 'active', label: t('moderation.activity.filter.active') },
                { key: 'ended', label: t('moderation.activity.filter.ended') },
                { key: 'paused', label: t('moderation.activity.filter.paused') },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => { setStatusFilter(tab.key); setPage(1); }}
                  className={cn(
                    'px-3 py-2 text-xs font-bold transition-colors rounded-lg whitespace-nowrap',
                    statusFilter === tab.key
                      ? 'bg-[var(--color-brand)] text-black shadow-sm'
                      : 'text-zinc-muted hover:text-zinc-text hover:bg-[var(--color-obsidian-hover)]',
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => { setSortBy(e.target.value); setPage(1); }}
              className="bg-[var(--color-obsidian-card)] border border-[var(--color-border)] rounded-xl px-3 py-2 text-xs font-bold text-zinc-text focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)]/20"
            >
              <option value="most_active">{t('moderation.activity.sort.most_active')}</option>
              <option value="newest">{t('moderation.activity.sort.newest')}</option>
              <option value="highest_price">{t('moderation.activity.sort.highest_price')}</option>
              <option value="ending_soon">{t('moderation.activity.sort.ending_soon')}</option>
            </select>

            {/* Search */}
            <div className="relative flex-1 max-w-xs w-full group">
              <Search className="absolute top-1/2 -translate-y-1/2 start-3 w-4 h-4 text-zinc-muted group-focus-within:text-[var(--color-brand)] transition-colors" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => { setSearchInput(e.target.value); setPage(1); }}
                placeholder={t('moderation.activity.search')}
                className="w-full bg-[var(--color-obsidian-card)] border border-[var(--color-border)] shadow-sm rounded-xl h-9 text-xs text-zinc-text font-bold focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)]/20 ps-9 pe-3"
              />
            </div>

            {/* Clear */}
            {hasFilters && (
              <button
                onClick={clearFilters}
                className="px-3 py-2 text-xs font-black uppercase tracking-widest rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-colors whitespace-nowrap"
              >
                {t('moderation.activity.clear_filters')}
              </button>
            )}
          </div>

          {/* Auction Cards Grid */}
          {activityLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-[var(--color-obsidian-card)] border border-[var(--color-border)] rounded-2xl p-4 animate-pulse">
                  <div className="flex gap-4">
                    <div className="w-16 h-16 rounded-xl bg-[var(--color-obsidian-outer)]" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3 bg-[var(--color-obsidian-outer)] rounded w-3/4" />
                      <div className="h-2 bg-[var(--color-obsidian-outer)] rounded w-1/2" />
                      <div className="h-2 bg-[var(--color-obsidian-outer)] rounded w-2/3" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : items.length === 0 ? (
            <div className="bg-[var(--color-obsidian-card)] border border-[var(--color-border)] rounded-2xl p-12 text-center">
              <Activity className="w-10 h-10 text-zinc-muted mx-auto mb-3" />
              <p className="text-sm text-zinc-muted font-bold">{t('moderation.activity.empty')}</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {items.map((auction) => (
                  <AuctionCard key={auction.id} auction={auction} t={t} dir={dir} />
                ))}
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

        {/* Right Sidebar: Timeline */}
        <div className="lg:col-span-1">
          <div className="bg-[var(--color-obsidian-card)] border border-[var(--color-border)] rounded-2xl p-4 sticky top-4">
            <h3 className="text-sm font-black text-zinc-text mb-3 flex items-center gap-2">
              <Clock className="w-4 h-4 text-[var(--color-brand)]" />
              {t('moderation.activity.timeline_title')}
            </h3>

            {timeline.length === 0 ? (
              <p className="text-[13px] text-zinc-muted py-4 text-center">
                {t('moderation.activity.no_activity')}
              </p>
            ) : (
              <div className="max-h-[500px] overflow-y-auto">
                {timeline.map((event) => (
                  <TimelineEventRow key={event.bidId} event={event} t={t} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bid Moderation Section */}
      <BidModerationSection />
      </div>
    </AdminListPageShell>
  );
};
