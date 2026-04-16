import React, { useState, useEffect } from 'react';
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
  Calendar,
  Layers,
  ChevronRight,
  LayoutGrid,
  List
} from 'lucide-react';
import { useLanguage } from '@core/contexts/LanguageContext';
import { cn } from '@core/lib/utils/cn';
import { AmberCard as Card } from '@core/components/AmberCard';
import { AmberButton } from '@core/components/AmberButton';
import { AmberInput } from '@core/components/AmberInput';
import { AmberDropdown } from '@core/components/AmberDropdown';
import { AmberSlideOver } from '@core/components/AmberSlideOver';
import { StatusBadge } from '@core/components/Data/StatusBadge';
import { useGetAuctions, useGetAuctionStats, useDeleteAuction } from '../api';
import { AuctionImage } from '../components/AuctionImage';
import type { AuctionStatus, Auction } from '../types/auction.types';

/**
 * AuctionsList - Premium Multi-state Auction Management
 */
export const AuctionsList: React.FC = () => {
    const { t, dir } = useLanguage();
    const router = useRouter();
    const isRTL = dir === 'rtl';

    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | AuctionStatus>('all');
    const [page, setPage] = useState(1);
    const [limit] = useState(12);
    const [currentTime, setCurrentTime] = useState(new Date());
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    // Update current time every second for accurate countdowns
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const { data: auctionsData, isLoading: listLoading } = useGetAuctions({
        status: statusFilter === 'all' ? undefined : statusFilter as AuctionStatus,
        search: searchQuery || undefined,
        sortBy: 'endTime',
        sortOrder: 'asc',
        page,
        limit
    });

    const { data: stats } = useGetAuctionStats();
    const { mutate: deleteAuction } = useDeleteAuction();

    const auctions = auctionsData?.data || [];

    // Helper: Calculate time remaining
    const getCountdown = (endTimeStr: string) => {
        if (!endTimeStr) return 'TBD';
        const end = new Date(endTimeStr);
        const diff = end.getTime() - currentTime.getTime();
        
        if (diff <= 0) return t('TIME.ENDED');
        
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const secs = Math.floor((diff % (1000 * 60)) / 1000);

        if (days > 0) return `${days}d ${hours}h`;
        return `${hours}h ${mins}m ${secs}s`;
    };

    if (!isClient) return null;

    return (
        <div className="space-y-8 p-6 max-w-[1600px] mx-auto animate-in fade-in duration-700" dir={dir}>
            {/* Page Title & Deployment Base */}
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
                    <div className="flex bg-obsidian-card p-1 rounded-xl border border-border">
                        <button 
                            onClick={() => setViewMode('grid')}
                            className={cn(
                                "p-2 rounded-lg transition-all",
                                viewMode === 'grid' ? "bg-brand text-black" : "text-zinc-muted hover:text-zinc-text"
                            )}
                        >
                            <LayoutGrid className="w-4 h-4" />
                        </button>
                        <button 
                            onClick={() => setViewMode('list')}
                            className={cn(
                                "p-2 rounded-lg transition-all",
                                viewMode === 'list' ? "bg-brand text-black" : "text-zinc-muted hover:text-zinc-text"
                            )}
                        >
                            <List className="w-4 h-4" />
                        </button>
                    </div>
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

            {/* Telemetry Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="!p-5 bg-obsidian-card border-border relative overflow-hidden group">
                    <div className="flex items-start justify-between mb-2">
                        <div className="space-y-1">
                            <span className="text-[10px] font-black text-zinc-muted uppercase tracking-widest font-bold">{t('auction.metrics.active_engines')}</span>
                            <h3 className="text-3xl font-black text-zinc-text tracking-tighter tabular-nums">{stats?.activeAuctions || 0}</h3>
                        </div>
                        <div className="p-3 bg-brand/10 text-brand rounded-xl border border-brand/20">
                            <Gavel className="w-5 h-5" />
                        </div>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] font-bold text-brand mt-4 uppercase tracking-widest">
                        <span>{t('auction.metrics.live_liquidations')}</span>
                    </div>
                </Card>

                <Card className="!p-5 bg-obsidian-card border-border relative overflow-hidden group">
                    <div className="flex items-start justify-between mb-2">
                        <div className="space-y-1">
                            <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest font-bold">{t('auction.metrics.bid_velocity')}</span>
                            <h3 className="text-3xl font-black text-emerald-400 tracking-tighter tabular-nums">{stats?.totalBids || 0}</h3>
                        </div>
                        <div className="p-3 bg-emerald-400/10 text-emerald-400 rounded-xl border border-emerald-400/20">
                            <TrendingUp className="w-5 h-5" />
                        </div>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] font-bold text-zinc-muted mt-4 uppercase tracking-widest">
                        <span>{t('auction.metrics.interaction_throughput')}</span>
                    </div>
                </Card>

                <Card className="!p-5 bg-obsidian-card border-border relative overflow-hidden group">
                    <div className="flex items-start justify-between mb-2">
                        <div className="space-y-1">
                            <span className="text-[10px] font-black text-info uppercase tracking-widest font-bold">{t('auction.metrics.projected_revenue')}</span>
                            <h3 className="text-3xl font-black text-info tracking-tighter tabular-nums">${stats?.totalRevenue?.toLocaleString() || '0'}</h3>
                        </div>
                        <div className="p-3 bg-info/10 text-info rounded-xl border border-info/20">
                            <DollarSign className="w-5 h-5" />
                        </div>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] font-bold text-zinc-muted mt-4 uppercase tracking-widest">
                        <span>{t('auction.equitable_distribution')}</span>
                    </div>
                </Card>

                <Card className="!p-5 bg-obsidian-card border-border relative overflow-hidden group">
                    <div className="flex items-start justify-between mb-2">
                        <div className="space-y-1">
                            <span className="text-[10px] font-black text-warning uppercase tracking-widest font-bold">{t('auction.critical_termination')}</span>
                            <h3 className="text-3xl font-black text-warning tracking-tighter tabular-nums">{stats?.scheduledAuctions || 0}</h3>
                        </div>
                        <div className="p-3 bg-warning/10 text-warning rounded-xl border border-warning/20">
                            <Clock className="w-5 h-5" />
                        </div>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] font-bold text-zinc-muted mt-4 uppercase tracking-widest">
                        <span>{t('auction.concluding_soon')}</span>
                    </div>
                </Card>
            </div>

            {/* Asset Distribution Grid */}
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
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                {listLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                         {[1,2,3,4,5,6].map(i => (
                             <div key={i} className="h-[400px] rounded-2xl bg-white/[0.02] border border-white/[0.05] animate-pulse" />
                         ))}
                    </div>
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
                ) : viewMode === 'grid' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {auctions.map((auction) => (
                            <Card 
                                key={auction.id} 
                                className="!p-0 border-border bg-obsidian-card overflow-hidden group hover:border-brand/30 transition-all duration-500 hover:-translate-y-1 shadow-lg cursor-pointer"
                                onClick={() => router.push(`/auctions/${auction.id}`)}
                            >
                                {/* Asset Narrative & Dynamic Visual */}
                                <div className="h-56 bg-obsidian-panel/50 relative overflow-hidden">
                                     <AuctionImage
                                         auction={auction}
                                         alt={auction.title}
                                         className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                     />
                                     {/* State Indicators */}
                                     <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
                                         <StatusBadge 
                                            status={auction.status.toUpperCase()} 
                                            variant={auction.status === 'active' ? 'success' : auction.status === 'ended' ? 'failed' : 'warning'}
                                            size="sm"
                                            className="font-bold tracking-[0.2em] backdrop-blur-md bg-black/40"
                                         />
                                         <div className="bg-black/60 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded-lg flex items-center gap-2">
                                             <Clock className="w-3.5 h-3.5 text-warning" />
                                             <span className="text-[10px] font-black text-white tabular-nums uppercase">
                                                 {getCountdown(auction.endTime)}
                                             </span>
                                         </div>
                                     </div>
                                     {/* Bottom Gradient Over */}
                                     <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                                     <div className="absolute bottom-4 left-4 right-4">
                                         <span className="text-[10px] font-black text-brand uppercase tracking-widest">{auction.categoryName || (t('common.general_asset') || 'GENERAL ASSET')}</span>
                                         <h4 className="text-lg font-black text-white leading-none uppercase tracking-tight truncate mt-1">{auction.title}</h4>
                                     </div>
                                </div>

                                <div className="p-6 space-y-6">
                                     {/* High-Level Bidding Telemetry */}
                                     <div className="grid grid-cols-2 gap-4">
                                         <div className="space-y-1">
                                             <span className="text-[9px] font-black text-zinc-muted uppercase tracking-[0.2em]">{t('auction.detail.current_premium')}</span>
                                             <div className="flex items-baseline gap-1 text-brand">
                                                 <span className="text-xl font-black tabular-nums leading-none tracking-tighter">
                                                     ${(auction.currentBid || auction.startPrice).toLocaleString()}
                                                 </span>
                                             </div>
                                         </div>
                                         <div className="space-y-1 text-right">
                                             <span className="text-[9px] font-black text-zinc-muted uppercase tracking-[0.2em]">{t('auction.table.interactions')}</span>
                                             <div className="flex items-center justify-end gap-1.5 text-zinc-text">
                                                 <TrendingUp className="w-3.5 h-3.5 text-success" />
                                                 <span className="text-xl font-black tabular-nums leading-none tracking-tighter">{auction.totalBids || 0}</span>
                                             </div>
                                         </div>
                                     </div>

                                     <div className="h-px bg-white/[0.03]" />

                                     {/* Control Surface */}
                                     <div className="flex items-center gap-3">
                                         <AmberButton 
                                            variant="secondary" 
                                            className="flex-1 h-11 rounded-xl bg-obsidian-hover hover:bg-brand hover:text-black font-black uppercase text-[10px] tracking-widest transition-all active:scale-95"
                                         >
                                             {t('auction.action.inspect_node')}
                                         </AmberButton>
                                         <Link href={`/auctions/edit/${auction.id}`} onClick={(e) => e.stopPropagation()}>
                                            <AmberButton variant="outline" className="p-0 w-11 h-11 rounded-xl flex items-center justify-center border-white/5 hover:border-brand/30 hover:bg-brand/5 active:scale-95 transition-all">
                                                <Edit className="w-4 h-4" />
                                            </AmberButton>
                                         </Link>
                                         <AmberButton 
                                            variant="outline" 
                                            onClick={(e) => { e.stopPropagation(); deleteAuction(auction.id); }}
                                            className="p-0 w-11 h-11 rounded-xl flex items-center justify-center border-white/5 hover:border-danger/30 hover:bg-danger/5 text-zinc-muted hover:text-danger active:scale-95 transition-all"
                                         >
                                             <Trash2 className="w-4 h-4" />
                                         </AmberButton>
                                     </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <div className="bg-obsidian-card border border-border rounded-2xl overflow-hidden">
                         <table className="w-full text-left border-collapse" dir={dir}>
                             <thead>
                                 <tr className="border-b border-border bg-obsidian-panel/40">
                                     <th className="px-6 py-4 text-[10px] font-black text-zinc-muted uppercase tracking-widest">{t('auction.table.identification')}</th>
                                     <th className="px-6 py-4 text-[10px] font-black text-zinc-muted uppercase tracking-widest">{t('auction.table.state')}</th>
                                     <th className="px-6 py-4 text-[10px] font-black text-zinc-muted uppercase tracking-widest text-center">{t('auction.table.protocol_duration')}</th>
                                     <th className="px-6 py-4 text-[10px] font-black text-zinc-muted uppercase tracking-widest text-right">{t('auction.table.premium_value')}</th>
                                     <th className="px-6 py-4 text-[10px] font-black text-zinc-muted uppercase tracking-widest text-right">{t('auction.table.interactions')}</th>
                                     <th className="px-6 py-4"></th>
                                 </tr>
                             </thead>
                             <tbody>
                                 {auctions.map((auction) => (
                                     <tr key={auction.id} className="border-b border-border/5 hover:bg-white/[0.02] transition-colors cursor-pointer group" onClick={() => router.push(`/auctions/${auction.id}`)}>
                                         <td className="px-6 py-5">
                                             <div className="flex items-center gap-4">
                                                 <div className="w-10 h-10 rounded-lg bg-obsidian-outer border border-border flex items-center justify-center overflow-hidden shrink-0 group-hover:border-brand/30 transition-colors">
                                                     <AuctionImage
                                                         auction={auction}
                                                         alt={auction.title}
                                                         fallbackClassName="w-full h-full object-cover"
                                                     />
                                                 </div>
                                                 <div>
                                                     <p className="text-sm font-black text-zinc-text uppercase tracking-tight">{auction.title}</p>
                                                     <p className="text-[9px] font-black text-zinc-muted uppercase tracking-widest mt-0.5">{auction.categoryName || t('common.general_asset')}</p>
                                                 </div>
                                             </div>
                                         </td>
                                         <td className="px-6 py-5">
                                             <StatusBadge status={auction.status.toUpperCase()} variant={auction.status === 'active' ? 'success' : 'warning'} size="sm" />
                                         </td>
                                         <td className="px-6 py-5 text-center">
                                             <div className="inline-flex items-center gap-2 text-[10px] font-black text-warning tabular-nums bg-warning/10 px-3 py-1 rounded-full border border-warning/20">
                                                 <Clock className="w-3 h-3" />
                                                 {getCountdown(auction.endTime)}
                                             </div>
                                         </td>
                                         <td className="px-6 py-5 text-right">
                                             <span className="text-base font-black text-brand tabular-nums leading-none tracking-tight">
                                                 ${(auction.currentBid || auction.startPrice).toLocaleString()}
                                             </span>
                                         </td>
                                         <td className="px-6 py-5 text-right font-black text-zinc-text text-sm tabular-nums tracking-tighter">
                                             {auction.totalBids || 0}
                                         </td>
                                         <td className="px-6 py-5 text-right">
                                             <div className="flex justify-end gap-2">
                                                <Link href={`/auctions/edit/${auction.id}`} onClick={(e) => e.stopPropagation()}>
                                                    <AmberButton variant="ghost" className="p-2 h-auto text-zinc-muted hover:text-brand">
                                                        <Edit className="w-4 h-4" />
                                                    </AmberButton>
                                                </Link>
                                                <AmberButton variant="ghost" className="p-2 h-auto text-zinc-muted hover:text-danger" onClick={(e) => { e.stopPropagation(); deleteAuction(auction.id); }}>
                                                    <Trash2 className="w-4 h-4" />
                                                </AmberButton>
                                             </div>
                                         </td>
                                     </tr>
                                 ))}
                             </tbody>
                         </table>
                    </div>
                )}
            </div>

            {/* Matrix Configuration SlideOver */}
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
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="h-12"
                        />
                    </div>

                    <div className="h-px bg-white/5" />

                    <div className="space-y-6">
                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-zinc-muted uppercase tracking-widest">{t('auction.config.state_protocol')}</label>
                            <AmberDropdown 
                                options={[
                                    { label: t('common.all_protocols'), value: 'all' },
                                    { label: t('auction.metrics.live_liquidations'), value: 'active' },
                                    { label: t('auction.scheduled_deployments'), value: 'scheduled' },
                                    { label: t('auction.concluded_nodes'), value: 'ended' },
                                    { label: t('auction.draft_schema'), value: 'draft' },
                                ]}
                                value={statusFilter}
                                onChange={(value: any) => setStatusFilter(value)}
                                className="h-12 w-full"
                            />
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
                                setStatusFilter('all');
                                setSearchQuery('');
                                setIsFilterOpen(false);
                            }}
                        >
                            {t('common.reset')}
                        </AmberButton>
                    </div>
                </div>
            </AmberSlideOver>
        </div>
    );
};

export default AuctionsList;
