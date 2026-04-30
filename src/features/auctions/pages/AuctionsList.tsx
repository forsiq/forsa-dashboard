import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import {
  Gavel,
  Plus,
  Search,
  SlidersHorizontal,
  TrendingUp,
  Clock,
  DollarSign,
  Eye,
  Edit,
  Trash2,
  Layers,
  Play,
  Pause,
  RotateCcw,
  Square,
  XCircle,
} from 'lucide-react';
import { useLanguage } from '@core/contexts/LanguageContext';
import { cn } from '@core/lib/utils/cn';
import { formatCurrency } from '@core/lib/utils/formatCurrency';
import { AmberCard as Card } from '@core/components/AmberCard';
import { CardGridSkeleton } from '@core/components/Loading/AmberCardSkeleton';
import { AmberButton } from '@core/components/AmberButton';
import { AmberInput } from '@core/components/AmberInput';
import { AmberSlideOver } from '@core/components';
import { StatusBadge } from '@core/components/Data/StatusBadge';
import { DataTable, Column, Action } from '@core/components/Data/DataTable';
import { StatsGrid } from '@core/components/Layout/StatsGrid';
import { useGetAuctions, useGetAuctionStats, useDeleteAuction, useStartAuction, usePauseAuction, useResumeAuction, useEndAuction, useCancelAuction } from '../api';
import { useConfirmModal } from '@core/components/Feedback/AmberConfirmModal';
import { useList as useCategories } from '@services/categories/hooks';
import { getLocalizedName } from '@services/categories/types';
import { AuctionImage } from '../components/AuctionImage';
import type { AuctionStatus, Auction } from '../types/auction.types';

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
  { key: 'draft', labelKey: 'auction.tabs.draft', color: 'text-zinc-400', activeColor: 'bg-zinc-400 text-black' },
  { key: 'ended', labelKey: 'auction.tabs.ended', color: 'text-red-400', activeColor: 'bg-red-500 text-black', countField: 'endedAuctions' },
  { key: 'paused', labelKey: 'auction.tabs.paused', color: 'text-amber-400', activeColor: 'bg-amber-500 text-black' },
  { key: 'cancelled', labelKey: 'auction.tabs.cancelled', color: 'text-red-300', activeColor: 'bg-red-900 text-red-100' },
];

/**
 * AuctionsList - Auction Management with DataTable and Status Tabs
 */
export const AuctionsList: React.FC = () => {
    const { t, language, dir } = useLanguage();
    const router = useRouter();
    const isRTL = dir === 'rtl';

    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState<TabValue>('all');
    const [categoryIdFilter, setCategoryIdFilter] = useState<number | 'all'>('all');
    const [page, setPage] = useState(1);
    const [limit] = useState(12);
    const [currentTime, setCurrentTime] = useState(new Date());
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const { data: auctionsData, isLoading: listLoading } = useGetAuctions({
        status: activeTab === 'all' ? undefined : activeTab as AuctionStatus,
        categoryId: categoryIdFilter === 'all' ? undefined : categoryIdFilter,
        search: searchQuery || undefined,
        sortBy: 'createdAt',
        sortOrder: 'desc',
        page,
        limit
    });

    const { data: stats } = useGetAuctionStats();
    const { data: categoriesData } = useCategories({ limit: 100 });
    const { mutate: deleteAuction } = useDeleteAuction();
    const startAuction = useStartAuction();
    const pauseAuction = usePauseAuction();
    const resumeAuction = useResumeAuction();
    const endAuction = useEndAuction();
    const cancelAuction = useCancelAuction();
    const { openConfirm, ConfirmModal } = useConfirmModal();

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

    const getCountdown = (endTimeStr: string) => {
        if (!endTimeStr) return 'TBD';
        const end = new Date(endTimeStr);
        const diff = end.getTime() - currentTime.getTime();
        
        if (diff <= 0) return t('TIME.ENDED') || 'ENDED';
        
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

        if (days > 0) return `${days}d ${hours}h`;
        return `${hours}h ${mins}m`;
    };

    // Table columns
    const columns: Column<Auction>[] = [
      {
        key: 'title',
        label: t('auction.table.identification') || 'Auction',
        cardTitle: true,
        render: (auction) => (
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-obsidian-outer border border-border flex items-center justify-center overflow-hidden shrink-0">
              <AuctionImage auction={auction} alt={auction.title} fallbackClassName="w-full h-full object-cover" />
            </div>
            <div>
              <p className="text-sm font-black text-zinc-text uppercase tracking-tight">{auction.title}</p>
              <p className="text-[10px] font-black text-zinc-muted uppercase tracking-widest mt-0.5">{auction.categoryName || t('common.general_asset')}</p>
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
            status={t(`auction.status.${auction.status}`) || auction.status}
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
        render: (auction) => (
          <div className="inline-flex items-center gap-2 text-[10px] font-black text-warning tabular-nums bg-warning/10 px-3 py-1 rounded-full border border-warning/20">
            <Clock className="w-3 h-3" />
            {getCountdown(auction.endTime)}
          </div>
        ),
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
        onClick: (auction) => router.push(`/auctions/${auction.id}`),
      },
      {
        label: t('common.edit') || 'Edit',
        icon: Edit,
        onClick: (auction) => router.push(`/auctions/edit/${auction.id}`),
      },
      {
        label: (auction) => (auction.status === 'draft' || auction.status === 'scheduled') ? (t('auction.lifecycle.start') || 'Start') : null as any,
        icon: Play,
        onClick: (auction) => openConfirm({
          title: t('auction.lifecycle.start_title') || 'Start Auction',
          message: t('auction.lifecycle.start_confirm') || 'Are you sure?',
          onConfirm: () => startAuction.mutate(auction.id),
          variant: 'success',
        }),
        variant: 'success',
      },
      {
        label: (auction) => auction.status === 'active' ? (t('auction.lifecycle.pause') || 'Pause') : null as any,
        icon: Pause,
        onClick: (auction) => openConfirm({
          title: t('auction.lifecycle.pause_title') || 'Pause Auction',
          message: t('auction.lifecycle.pause_confirm') || 'Are you sure?',
          onConfirm: () => pauseAuction.mutate(auction.id),
        }),
      },
      {
        label: (auction) => auction.status === 'paused' ? (t('auction.lifecycle.resume') || 'Resume') : null as any,
        icon: RotateCcw,
        onClick: (auction) => openConfirm({
          title: t('auction.lifecycle.resume_title') || 'Resume Auction',
          message: t('auction.lifecycle.resume_confirm') || 'Are you sure?',
          onConfirm: () => resumeAuction.mutate(auction.id),
          variant: 'success',
        }),
        variant: 'success',
      },
      {
        label: (auction) => auction.status === 'active' ? (t('auction.lifecycle.end') || 'End') : null as any,
        icon: Square,
        onClick: (auction) => openConfirm({
          title: t('auction.lifecycle.end_title') || 'End Auction',
          message: t('auction.lifecycle.end_confirm') || 'Are you sure?',
          onConfirm: () => endAuction.mutate(auction.id),
          variant: 'danger',
        }),
        variant: 'danger',
      },
      {
        label: (auction) => !['ended', 'sold', 'cancelled'].includes(auction.status) ? (t('auction.lifecycle.cancel') || 'Cancel') : null as any,
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

    if (!isClient) return null;

    return (
        <div className="space-y-8 p-6 max-w-[1600px] mx-auto animate-in fade-in duration-700" dir={dir}>
            {/* Page Title */}
            <div className={cn(
                "flex flex-col lg:flex-row lg:items-start justify-between gap-6",
                isRTL ? "text-right" : "text-left"
            )}>
                <div className="space-y-1">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-sm bg-brand/10 flex items-center justify-center text-brand border border-brand/20 shadow-[0_0_15px_rgba(245,196,81,0.1)]">
                            <Gavel className="w-6 h-6" />
                        </div>
                        <div>
                            <h1 className="text-4xl font-black text-zinc-text tracking-tighter leading-none uppercase">
                                {t('auction.listings.title')}
                            </h1>
                            <p className="text-base text-zinc-secondary font-bold tracking-tight uppercase mt-1">
                                {t('auction.listings.subtitle')}
                            </p>
                        </div>
                    </div>
                </div>
                <div className="flex flex-wrap gap-3">
                    <AmberButton
                        variant="secondary"
                        className="gap-2 h-11 border-border font-bold rounded-xl active:scale-95 transition-all hover:bg-obsidian-hover"
                        onClick={() => setIsFilterOpen(true)}
                    >
                        <SlidersHorizontal className="w-4 h-4" />
                        {t('common.filters')}
                    </AmberButton>
                    <Link href="/auctions/add">
                        <AmberButton className="gap-2 h-11 bg-brand hover:bg-brand text-black font-black rounded-xl shadow-sm transition-all border-none active:scale-95 px-8">
                            <Plus className="w-5 h-5" />
                            <span>{t('auction.create_auction')}</span>
                        </AmberButton>
                    </Link>
                </div>
            </div>

            {/* Status Tabs */}
            <div className="flex items-center gap-1 bg-obsidian-outer p-1.5 rounded-xl border border-white/5 overflow-x-auto scrollbar-hide">
                {TABS.map((tab) => {
                    const isActive = activeTab === tab.key;
                    const count = getTabCount(tab);
                    return (
                        <button
                            key={tab.key}
                            onClick={() => handleTabChange(tab.key)}
                            className={cn(
                                "flex items-center gap-2 px-4 py-2.5 rounded-lg text-[11px] font-black uppercase tracking-widest transition-all whitespace-nowrap",
                                isActive
                                    ? tab.activeColor
                                    : cn("text-zinc-muted hover:text-zinc-text hover:bg-white/5", tab.color)
                            )}
                        >
                            {t(tab.labelKey)}
                            {count > 0 && (
                                <span className={cn(
                                    "inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-[9px] font-black tabular-nums",
                                    isActive
                                        ? "bg-black/20 text-inherit"
                                        : "bg-white/5 text-zinc-muted"
                                )}>
                                    {count}
                                </span>
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Stats Grid */}
            <StatsGrid
                stats={[
                    {
                        label: t('auction.metrics.active_engines'),
                        value: stats?.activeAuctions || 0,
                        icon: Gavel,
                        color: 'brand',
                        description: t('auction.metrics.live_liquidations'),
                    },
                    {
                        label: t('auction.metrics.bid_velocity'),
                        value: stats?.totalBids || 0,
                        icon: TrendingUp,
                        color: 'success',
                        description: t('auction.metrics.interaction_throughput'),
                    },
                    {
                        label: t('auction.metrics.projected_revenue'),
                        value: formatCurrency(stats?.totalRevenue),
                        icon: DollarSign,
                        color: 'info',
                        description: t('auction.equitable_distribution'),
                    },
                    {
                        label: t('auction.critical_termination'),
                        value: stats?.scheduledAuctions || 0,
                        icon: Clock,
                        color: 'warning',
                        description: t('auction.concluding_soon'),
                    },
                ]}
            />

            {/* Search + Table */}
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-sm font-black text-zinc-muted uppercase tracking-[0.25em] flex items-center gap-2">
                        <Layers className="w-4 h-4" /> {t('auction.operational_listings_matrix')}
                    </h2>
                    <div className="relative group min-w-[320px]">
                        <Search className={cn(
                            "absolute top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-muted/50 group-focus-within:text-brand transition-colors",
                            isRTL ? 'right-4' : 'left-4'
                        )} />
                        <AmberInput
                            placeholder={t('auction.listings.search')}
                            className={cn(
                                "h-11 bg-obsidian-card border-border text-xs font-bold",
                                isRTL ? "pr-11 pl-4 text-right" : "pl-11 pr-4 text-left"
                            )}
                            value={searchQuery}
                            onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
                        />
                    </div>
                </div>

                {listLoading ? (
                    <CardGridSkeleton count={6} columns={3} />
                ) : auctions.length === 0 ? (
                    <Card className="!p-24 text-center space-y-6 bg-obsidian-card/40">
                        <div className="w-20 h-20 rounded-full bg-white/[0.02] flex items-center justify-center mx-auto border border-white/[0.05]">
                            <Gavel className="w-10 h-10 text-zinc-muted/30" />
                        </div>
                        <div className="max-w-md mx-auto space-y-2">
                            <h3 className="text-xl font-black text-zinc-text uppercase tracking-widest">{t('auction.inventory.depleted')}</h3>
                            <p className="text-sm text-zinc-muted font-bold tracking-tight">{t('auction.inventory.no_identifiers')}</p>
                        </div>
                        <AmberButton onClick={() => router.push('/auctions/add')} className="h-11 px-8 rounded-xl bg-brand text-black font-black uppercase active:scale-95 transition-all">
                            {t('auction.action.deploy_listing')}
                        </AmberButton>
                    </Card>
                ) : (
                    <div className="bg-[var(--color-obsidian-card)] border border-[var(--color-border)] rounded-2xl shadow-sm overflow-hidden">
                        <DataTable
                            columns={columns}
                            data={auctions}
                            keyField="id"
                            rowActions={rowActions}
                            onRowClick={(row) => router.push(`/auctions/${row.id}`)}
                            pagination
                            pageSize={limit}
                            currentPage={page}
                            totalItems={auctionsData?.total || 0}
                            onPageChange={(newPage) => setPage(newPage)}
                            showViewToggle
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
                        <label className="text-[10px] font-black text-zinc-muted uppercase tracking-widest">{t('auction.config.protocol_identifier_search')}</label>
                        <AmberInput
                            placeholder={t('auction.listings.search')}
                            value={searchQuery}
                            onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
                            className="h-12"
                        />
                    </div>

                    <div className="h-px bg-white/5" />

                    <div className="space-y-3">
                        <label className="text-[10px] font-black text-zinc-muted uppercase tracking-widest">{t('auction.listings.filter_category') || 'Category'}</label>
                        <div className="flex flex-wrap gap-2">
                            <button
                                onClick={() => setCategoryIdFilter('all')}
                                className={cn(
                                    "px-3 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all border",
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
                                        "px-3 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all border",
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
        </div>
    );
};

export default AuctionsList;
