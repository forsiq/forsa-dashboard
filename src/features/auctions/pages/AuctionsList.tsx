import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/router';
import { useQueryClient } from '@tanstack/react-query';
import {
  Gavel,
  Plus,
  TrendingUp,
  Clock,
  DollarSign,
  Eye,
  Edit,
  Trash2,
  XCircle,
  Play,
  Pause,
  RotateCcw,
} from 'lucide-react';
import { useLanguage } from '@core/contexts/LanguageContext';
import { cn } from '@core/lib/utils/cn';
import { formatCurrency } from '@core/lib/utils/formatCurrency';
import { getCountdown } from '@core/utils/countdown';
import { EmptyState } from '@core/components/EmptyState';
import { AmberCard as Card } from '@core/components/AmberCard';
import { CardGridSkeleton } from '@core/components/Loading/AmberCardSkeleton';
import { ListPageSkeleton, FetchingOverlay } from '@core/loading';
import { AmberButton } from '@core/components/AmberButton';
import { AmberInput } from '@core/components/AmberInput';
import { AmberSlideOver } from '@core/components';
import { StatusBadge } from '@core/components/Data/StatusBadge';
import { isSafePathResourceId } from '@core/utils/safeRouteId';
import { useToast } from '@core/contexts/ToastContext';
import { DataTable, Column, Action, BulkAction } from '@core/components/Data/DataTable';
import { DataTableEntityTitle } from '@core/components/Data/DataTableEntityTitle';
import {
  AdminListPageShell,
  ListPageToolbar,
  ListPageToolbarSearch,
} from '@core/components/Layout';
import {
  useGetAuctions,
  useGetAuctionStats,
  useDeleteAuction,
  useCancelAuction,
  useStartAuction,
  usePauseAuction,
  useResumeAuction,
  auctionKeys,
} from '../api';
import { auctionApi } from '../api/auction-api';
import { useConfirmModal } from '@core/components/Feedback/AmberConfirmModal';
import { useDebounce } from '@core/hooks/useDebounce';
import { useList as useCategories } from '@services/categories/hooks';
import { getLocalizedName } from '@services/categories/types';
import { AuctionImage } from '../components/AuctionImage';
import type { AuctionStatus, Auction, AuctionFilters } from '../types/auction.types';

type TabValue = 'all' | AuctionStatus;

interface TabConfig {
  key: TabValue;
  labelKey: string;
  color: string;
  activeColor: string;
  countField?: keyof Pick<import('../types/auction.types').AuctionStats, 'activeAuctions' | 'scheduledAuctions' | 'endedAuctions' | 'totalAuctions'>;
}

const TABS: TabConfig[] = [
  { key: 'all', labelKey: 'auction.tabs.all', color: 'text-zinc-muted', activeColor: 'bg-zinc-text text-black', countField: 'totalAuctions' },
  { key: 'active', labelKey: 'auction.tabs.active', color: 'text-green-400', activeColor: 'bg-green-500 text-black', countField: 'activeAuctions' },
  { key: 'scheduled', labelKey: 'auction.tabs.scheduled', color: 'text-blue-400', activeColor: 'bg-blue-500 text-black', countField: 'scheduledAuctions' },
  { key: 'draft', labelKey: 'auction.tabs.draft', color: 'text-zinc-muted', activeColor: 'bg-zinc-400 text-black' },
  { key: 'ended', labelKey: 'auction.tabs.ended', color: 'text-red-400', activeColor: 'bg-red-500 text-black', countField: 'endedAuctions' },
  { key: 'paused', labelKey: 'auction.tabs.paused', color: 'text-amber-400', activeColor: 'bg-amber-500 text-black' },
  { key: 'cancelled', labelKey: 'auction.tabs.cancelled', color: 'text-red-300', activeColor: 'bg-red-900 text-red-100' },
];

/**
 * AuctionsList - Auction Management with DataTable and Status Tabs
 */
export const AuctionsList: React.FC = () => {
    const { t, language } = useLanguage();
    const router = useRouter();

    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const debouncedSearch = useDebounce(searchQuery, 300);
    const [activeTab, setActiveTab] = useState<TabValue>('all');
    const [categoryIdFilter, setCategoryIdFilter] = useState<number | 'all'>('all');
    const [page, setPage] = useState(1);
    const [limit] = useState(12);
    const [sortBy, setSortBy] = useState<string>('createdAt');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

    const activeFilterCount = categoryIdFilter === 'all' ? 0 : 1;

    const { data: auctionsData, isPending, isFetching } = useGetAuctions({
        status: activeTab === 'all' ? undefined : activeTab as AuctionStatus,
        categoryId: categoryIdFilter === 'all' ? undefined : categoryIdFilter,
        search: debouncedSearch || undefined,
        sortBy: sortBy as AuctionFilters['sortBy'],
        sortOrder,
        page,
        limit
    });

    const { data: stats } = useGetAuctionStats();
    const { data: categoriesData } = useCategories({ limit: 100 });
    const { mutate: deleteAuction } = useDeleteAuction();
    const cancelAuction = useCancelAuction();
    const startAuction = useStartAuction();
    const pauseAuction = usePauseAuction();
    const resumeAuction = useResumeAuction();
    const { openConfirm, ConfirmModal } = useConfirmModal();
    const queryClient = useQueryClient();
    const toast = useToast();
    const [bulkBusy, setBulkBusy] = useState(false);

    const invalidateAuctionQueries = useCallback(async () => {
        await queryClient.invalidateQueries({ queryKey: auctionKeys.lists() });
        await queryClient.invalidateQueries({ queryKey: auctionKeys.stats() });
    }, [queryClient]);

    const reportSettled = useCallback(
        (results: PromiseSettledResult<unknown>[], okKey: string, partialKey: string) => {
            const failed = results.filter((r) => r.status === 'rejected').length;
            const ok = results.length - failed;
            if (failed === 0) toast.success(t(okKey));
            else toast.warning(t(partialKey).replace('{ok}', String(ok)).replace('{failed}', String(failed)));
        },
        [toast, t],
    );

    const bulkActions: BulkAction<Auction>[] = useMemo(
        () => [
            {
                label: t('auction.bulk.cancel'),
                icon: XCircle,
                variant: 'danger',
                onClick: (_ids, rows) => {
                    if (bulkBusy || !rows.length) return;
                    const eligible = rows.filter((a) => !['ended', 'sold', 'cancelled'].includes(a.status));
                    if (!eligible.length) {
                        toast.warning(t('auction.bulk.none_eligible'));
                        return;
                    }
                    openConfirm({
                        title: t('auction.bulk.cancel_confirm_title'),
                        message: t('auction.bulk.cancel_confirm_message').replace('{count}', String(eligible.length)),
                        variant: 'danger',
                        onConfirm: async () => {
                            setBulkBusy(true);
                            try {
                                const results = await Promise.allSettled(eligible.map((a) => auctionApi.cancel(a.id)));
                                reportSettled(results, 'auction.bulk.lifecycle_ok', 'auction.bulk.lifecycle_partial');
                                await invalidateAuctionQueries();
                            } finally {
                                setBulkBusy(false);
                            }
                        },
                    });
                },
            },
        ],
        [t, bulkBusy, toast, openConfirm, reportSettled, invalidateAuctionQueries],
    );

    const auctions = auctionsData?.data || [];

    const getTabCount = (tab: TabConfig): number => {
        if (!stats) return 0;
        if (tab.countField) return stats[tab.countField] || 0;
        return 0;
    };

    const handleTabChange = (tabKey: TabValue) => {
        setActiveTab(tabKey);
        setPage(1);
    };

    const handleSortChange = (key: string, direction: 'asc' | 'desc') => {
        setSortBy(key);
        setSortOrder(direction);
        setPage(1);
    };

    // Table columns
    const columns: Column<Auction>[] = [
      {
        key: 'title',
        label: t('auction.table.identification') || 'Auction',
        cardTitle: true,
        render: (auction) => (
          <div className="flex min-w-0 items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-obsidian-outer border border-border flex items-center justify-center overflow-hidden shrink-0">
              <AuctionImage auction={auction} alt={auction.title} fallbackClassName="w-full h-full object-cover" />
            </div>
            <div className="min-w-0">
              <DataTableEntityTitle text={auction.title} />
              <p className="text-[11px] font-black text-zinc-muted uppercase tracking-widest mt-0.5">{auction.categoryName || t('common.general_asset')}</p>
            </div>
          </div>
        ),
        sortable: true,
      },
      {
        key: 'status',
        label: t('auction.table.state') || 'Status',
        cardBadge: true,
        render: (auction) => (
          <StatusBadge
            status={auction.status}
            labelKey={`auction.status.${auction.status}`}
            variant={auction.status === 'active' ? 'success' : auction.status === 'ended' ? 'failed' : 'warning'}
            size="sm"
          />
        ),
        sortable: true,
        align: 'center',
      },
      {
        key: 'endTime',
        label: t('auction.table.protocol_duration') || 'Duration',
        render: (auction) => {
          const raw = getCountdown(auction.endTime);
          const label = raw === 'ENDED' ? (t('TIME.ENDED') || 'ENDED') : raw;
          return (
          <div className="inline-flex items-center gap-2 text-xs font-black text-warning tabular-nums bg-warning/10 px-3 py-1 rounded-full border border-warning/20">
            <Clock className="w-3 h-3" />
            {label}
          </div>
          );
        },
        align: 'center',
      },
      {
        key: 'currentBid',
        label: t('auction.table.premium_value') || 'Price',
        render: (auction) => (
          <span className="text-base font-black text-brand tabular-nums leading-none tracking-tight">
            {formatCurrency(auction.currentBid || auction.startPrice)}
          </span>
        ),
        sortable: true,
        align: 'right',
      },
      {
        key: 'totalBids',
        label: t('auction.table.interactions') || 'Bids',
        render: (auction) => (
          <div className="flex items-center justify-end gap-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-success" />
            <span className="font-black text-zinc-text text-sm tabular-nums">{auction.totalBids || 0}</span>
          </div>
        ),
        sortable: true,
        align: 'right',
      },
    ];

    const rowActions: Action<Auction>[] = [
      {
        label: t('auction.action.inspect_node') || 'View',
        icon: Eye,
        onClick: (auction) => {
          if (!isSafePathResourceId(auction.id)) return;
          void router.push(`/auctions/${auction.id}`);
        },
      },
      {
        label: t('common.edit') || 'Edit',
        icon: Edit,
        onClick: (auction) => {
          if (!isSafePathResourceId(auction.id)) return;
          void router.push(`/auctions/edit/${auction.id}`);
        },
      },
      // Start - for draft or scheduled
      {
        label: (auction) => ['draft', 'scheduled'].includes(auction.status) ? (t('auction.lifecycle.start') || 'Start') : null,
        icon: Play,
        variant: 'success',
        onClick: (auction) => openConfirm({
          title: t('auction.lifecycle.start_title') || 'Start Auction',
          message: t('auction.lifecycle.start_confirm') || 'Are you sure you want to start this auction?',
          onConfirm: () => startAuction.mutate(auction.id),
        }),
      },
      // Pause - for active
      {
        label: (auction) => auction.status === 'active' ? (t('auction.lifecycle.pause') || 'Pause') : null,
        icon: Pause,
        variant: 'warning',
        onClick: (auction) => openConfirm({
          title: t('auction.lifecycle.pause_title') || 'Pause Auction',
          message: t('auction.lifecycle.pause_confirm') || 'Are you sure you want to pause this auction?',
          onConfirm: () => pauseAuction.mutate(auction.id),
        }),
      },
      // Resume - for paused
      {
        label: (auction) => auction.status === 'paused' ? (t('auction.lifecycle.resume') || 'Resume') : null,
        icon: RotateCcw,
        variant: 'success',
        onClick: (auction) => openConfirm({
          title: t('auction.lifecycle.resume_title') || 'Resume Auction',
          message: t('auction.lifecycle.resume_confirm') || 'Are you sure you want to resume this auction?',
          onConfirm: () => resumeAuction.mutate(auction.id),
        }),
      },
      {
        label: (auction) => !['ended', 'sold', 'cancelled'].includes(auction.status) ? (t('auction.lifecycle.cancel') || 'Cancel') : null,
        icon: XCircle,
        variant: 'danger',
        onClick: (auction) => openConfirm({
          title: t('auction.lifecycle.cancel_title') || 'Cancel Auction',
          message: t('auction.lifecycle.cancel_confirm') || 'Are you sure?',
          onConfirm: () => cancelAuction.mutate(auction.id),
          variant: 'danger',
        }),
      },
      {
        label: t('common.delete') || 'Delete',
        icon: Trash2,
        variant: 'danger',
        onClick: (auction) => openConfirm({
          title: t('common.confirm_delete') || 'Delete Auction',
          message: t('common.delete_confirm') || 'Are you sure you want to delete this auction?',
          onConfirm: () => deleteAuction(auction.id),
          variant: 'danger',
        }),
      },
    ];

    if (typeof window === 'undefined') return null;

    return (
        <AdminListPageShell
            title={t('auction.listings.title')}
            description={t('auction.listings.subtitle')}
            icon={Gavel}
            headerActions={
                <AmberButton
                    className="gap-2 h-11 bg-brand hover:bg-brand text-black font-black rounded-xl shadow-sm transition-all border-none active:scale-95 px-8"
                    onClick={() => router.push('/listings/new')}
                >
                    <Plus className="w-5 h-5" />
                    <span>{t('auction.create_auction')}</span>
                </AmberButton>
            }
            stats={[
                { label: t('auction.metrics.active_engines'), value: stats?.activeAuctions || 0, icon: Gavel, color: 'brand', description: t('auction.metrics.live_liquidations') },
                { label: t('auction.metrics.bid_velocity'), value: stats?.totalBids || 0, icon: TrendingUp, color: 'success', description: t('auction.metrics.interaction_throughput') },
                { label: t('auction.metrics.projected_revenue'), value: formatCurrency(stats?.totalRevenue), icon: DollarSign, color: 'info', description: t('auction.equitable_distribution') },
                { label: t('auction.critical_termination'), value: stats?.scheduledAuctions || 0, icon: Clock, color: 'warning', description: t('auction.concluding_soon') },
            ]}
            tabs={
            <div className="flex items-center gap-1 bg-[var(--color-obsidian-card)] border border-[var(--color-border)] p-1.5 rounded-xl shadow-sm overflow-x-auto scrollbar-hide">
                {TABS.map((tab) => {
                    const isActive = activeTab === tab.key;
                    const count = getTabCount(tab);
                    return (
                        <button
                            key={tab.key}
                            onClick={() => handleTabChange(tab.key)}
                            className={cn(
                                "flex items-center gap-2 px-4 py-2.5 rounded-lg text-[11px] font-black uppercase tracking-widest transition-colors whitespace-nowrap",
                                isActive ? "bg-[var(--color-brand)] text-black shadow-sm" : "text-zinc-muted hover:text-zinc-text hover:bg-black/5"
                            )}
                        >
                            {t(tab.labelKey)}
                            {count > 0 && (
                                <span className={cn(
                                    "inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-[11px] font-black tabular-nums",
                                    isActive ? "bg-black/20 text-inherit" : "bg-white/5 text-zinc-muted"
                                )}>{count}</span>
                            )}
                        </button>
                    );
                })}
            </div>
            }
            toolbar={
                <ListPageToolbar
                    search={<ListPageToolbarSearch value={searchQuery} onChange={(v) => { setSearchQuery(v); setPage(1); }} placeholder={t('auction.listings.search')} />}
                    onFilterClick={() => setIsFilterOpen(true)}
                    filterLabel={t('common.filters')}
                    activeFilterCount={activeFilterCount}
                />
            }
        >
            <div className="space-y-6">
                {isPending ? (
                    <ListPageSkeleton count={6} columns={3} showStats />
                ) : auctions.length === 0 ? (
                    <EmptyState
                      icon={Gavel}
                      title={t('auction.inventory.depleted') || 'No Auctions'}
                      description={t('auction.inventory.no_identifiers')}
                      actionLabel={t('auction.action.deploy_listing') || 'Create Auction'}
                      onAction={() => router.push('/listings/new')}
                    />
                ) : (
                    <div className="relative bg-[var(--color-obsidian-card)] border border-[var(--color-border)] rounded-2xl shadow-sm overflow-hidden">
                        {isFetching && <FetchingOverlay />}
                        {bulkBusy && (
                            <div
                                className="absolute inset-0 z-[90] flex flex-col items-center justify-center gap-3 bg-black/50 backdrop-blur-[2px]"
                                aria-busy="true"
                                aria-live="polite"
                            >
                                <Clock className="w-8 h-8 text-brand animate-pulse" />
                                <span className="text-[11px] font-black uppercase tracking-widest text-zinc-text">
                                    {t('common.loading') || 'Loading...'}
                                </span>
                            </div>
                        )}
                        <DataTable
                            columns={columns}
                            data={auctions}
                            keyField="id"
                            rowActions={rowActions}
                            selectable
                            bulkActions={bulkActions}
                            onRowClick={(row) => router.push(`/auctions/${row.id}`)}
                            pagination
                            pageSize={limit}
                            currentPage={page}
                            totalItems={auctionsData?.total || 0}
                            onPageChange={(newPage) => setPage(newPage)}
                            showViewToggle
                            onSortChange={handleSortChange}
                            sortBy={sortBy}
                            sortOrder={sortOrder}
                        />
                    </div>
                )}
            </div>

            {/* Filter SlideOver - Category Only */}
            <AmberSlideOver
                isOpen={isFilterOpen}
                onClose={() => setIsFilterOpen(false)}
                title={t('auction.config.operational_title')}
                description={t('auction.config.refine_matrix')}
            >
                <div className="space-y-8 py-4">
                    <div className="space-y-3">
                        <label className="text-[11px] font-black text-zinc-muted uppercase tracking-widest">{t('auction.listings.filter_category') || 'Category'}</label>
                        <div className="flex flex-wrap gap-2">
                            <button
                                onClick={() => setCategoryIdFilter('all')}
                                className={cn(
                                    "px-3 py-2 rounded-lg text-[11px] font-black uppercase tracking-widest transition-all border",
                                    categoryIdFilter === 'all'
                                        ? "bg-brand text-black border-brand"
                                        : "bg-obsidian-panel text-zinc-muted border-white/5 hover:border-white/10"
                                )}
                            >
                                {t('common.all') || 'All'}
                            </button>
                            {(categoriesData?.categories || []).map((cat: any) => (
                                <button
                                    key={cat.id}
                                    onClick={() => { setCategoryIdFilter(cat.id); setPage(1); }}
                                    className={cn(
                                        "px-3 py-2 rounded-lg text-[11px] font-black uppercase tracking-widest transition-all border",
                                        categoryIdFilter === cat.id
                                            ? "bg-brand text-black border-brand"
                                            : "bg-obsidian-panel text-zinc-muted border-white/5 hover:border-white/10"
                                    )}
                                >
                                    {getLocalizedName(cat, language)}
                                </button>
                            ))}
                        </div>
                    </div>
                    
                    <div className="pt-8 space-y-3">
                        <AmberButton className="w-full h-12 bg-zinc-text text-black font-black uppercase tracking-widest active:scale-95 transition-all" onClick={() => setIsFilterOpen(false)}>
                            {t('auction.config.reconfigure_matrix')}
                        </AmberButton>
                        <AmberButton
                            variant="secondary"
                            className="w-full h-12 font-black uppercase tracking-widest border border-white/5 active:scale-95 transition-all"
                            onClick={() => {
                                setActiveTab('all');
                                setCategoryIdFilter('all');
                                setSearchQuery('');
                                setPage(1);
                                setIsFilterOpen(false);
                            }}
                        >
                            {t('common.reset')}
                        </AmberButton>
                    </div>
                </div>
            </AmberSlideOver>
            <ConfirmModal />
        </AdminListPageShell>
    );
};

export default AuctionsList;
