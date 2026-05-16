import React, { useState } from 'react';
import {
  useModerationActivity,
  useModerationActivityStats,
  useModerationTimeline,
} from '../../auctions/api/auction-hooks';
import { useLanguage } from '@core/contexts/LanguageContext';
import { PageHeader } from '@core/components/Layout/PageHeader';
import { StatsGrid } from '@core/components/Layout/StatsGrid';
import { StatusBadge } from '@core/components/Data/StatusBadge';
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
        <p className="text-xs text-zinc-text leading-relaxed">
          <span className="font-mono text-zinc-muted">{maskId(event.bidderId)}</span>
          {' '}
          <span className="text-zinc-muted">{t('moderation.activity.timeline_bid')
            .replace('{amount}', Number(event.amount).toLocaleString())
            .replace('{auction}', event.auctionTitle || `#${event.auctionId}`)
          }</span>
        </p>
        <p className="text-[10px] text-zinc-muted mt-0.5">
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
          >
            {(url) => (
              <img
                src={url}
                alt={auction.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            )}
          </AuctionImage>
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
                className="font-bold text-[10px]"
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
              <span className="text-[10px] text-zinc-muted">
                {t('moderation.activity.bids_count')}
              </span>
            </div>

            {/* Current price */}
            <div className="flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5 text-[var(--color-brand)]" />
              <span className="text-xs font-black text-zinc-text tabular-nums">
                {auction.currentPrice.toLocaleString()}
              </span>
              <span className="text-[10px] text-zinc-muted">IQD</span>
            </div>
          </div>

          {/* Last bid */}
          <div className="flex items-center gap-2 mt-1.5">
            {auction.lastBid ? (
              <>
                <Clock className="w-3 h-3 text-zinc-muted" />
                <span className="text-[10px] text-zinc-muted">
                  {t('moderation.activity.last_bid')}: {Number(auction.lastBid.amount).toLocaleString()} IQD
                </span>
                <span className="text-[10px] text-zinc-muted/60">•</span>
                <span className="text-[10px] text-zinc-muted">
                  {timeAgo(auction.lastBid.timeAgo, t)}
                </span>
              </>
            ) : (
              <span className="text-[10px] text-zinc-muted">
                {t('moderation.activity.no_bids_yet')}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
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
    <div className="flex flex-col gap-4 p-4 pt-0" dir={dir}>
      {/* Page Header */}
      <PageHeader
        title={t('moderation.activity.title')}
        description={t('moderation.activity.subtitle')}
      />

      {/* Overview Stats */}
      <StatsGrid
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
        columns={4}
      />

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
                className="px-3 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-colors whitespace-nowrap"
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
              <p className="text-xs text-zinc-muted py-4 text-center">
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
    </div>
  );
};
