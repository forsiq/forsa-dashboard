import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { 
  ClipboardCheck, 
  Search, 
  Filter, 
  Target, 
  CheckCircle2, 
  Users, 
  Zap, 
  TrendingUp,
  AlertCircle,
  MoreVertical,
  Edit,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  ArrowUpRight,
  ShieldCheck,
  Send,
  DollarSign
} from 'lucide-react';
import { useLanguage } from '@core/contexts/LanguageContext';
import { cn } from '@core/lib/utils/cn';
import { formatCurrency } from '@core/lib/utils/formatCurrency';
import { AmberCard as Card } from '@core/components/AmberCard';
import { AmberButton } from '@core/components/AmberButton';
import { AmberInput } from '@core/components/AmberInput';
import { StatusBadge } from '@core/components/Data/StatusBadge';
import { AmberProgress } from '@core/components/AmberProgress';
import { useGetGroupBuyings, useGetGroupBuyingStats } from '../api';

import type { GroupBuyingFilters } from '../types';

/**
 * GroupBuyingReviewPage - High-Level Campaign Evaluation & Fulfillment Matrix
 */
export const GroupBuyingReviewPage: React.FC = () => {
    const { t, dir } = useLanguage();
    const router = useRouter();
    const isRTL = dir === 'rtl';
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    const [searchQuery, setSearchQuery] = useState('');
    
    const filters = React.useMemo<GroupBuyingFilters>(() => ({
        status: 'active' as const,
        limit: 100
    }), []);
    
    // Fetch only active/ready campaigns for review
    const { data: campaignsData, isLoading } = useGetGroupBuyings(filters);

    const { data: stats } = useGetGroupBuyingStats();

    // Filter for campaigns that need review (e.g., reached min threshold or near end time)
    const reviewQueue = (campaignsData?.groupBuyings || []).filter(c => {
        const progress = (c.currentParticipants / c.minParticipants) * 100;
        const searchMatch = c.title.toLowerCase().includes(searchQuery.toLowerCase());
        return searchMatch && (progress >= 80 || c.status === 'active');
    });

    const getReviewStatus = (campaign: any) => {
        if (campaign.currentParticipants >= campaign.maxParticipants) return t('sales.capacityReached');
        if (campaign.currentParticipants >= campaign.minParticipants) return t('sales.thresholdUnlocked');
        return t('sales.pendingSync');
    };

    const getReviewVariant = (campaign: any): any => {
        if (campaign.currentParticipants >= campaign.minParticipants) return 'success';
        return 'warning';
    };

    if (!isClient) return null;

    return (
        <div className="space-y-8 p-6 max-w-[1600px] mx-auto animate-in fade-in duration-700" dir={dir}>
            {/* Mission Critical Header */}
            <div className={cn(
                "flex flex-col lg:flex-row lg:items-start justify-between gap-6 text-start"
            )}>
                <div className="space-y-1">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-sm bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]">
                            <ClipboardCheck className="w-6 h-6" />
                        </div>
                        <div>
                            <h1 className="text-4xl font-black text-zinc-text tracking-tighter leading-none uppercase">
                                {t('sales.dealEvaluation')}
                            </h1>
                            <p className="text-base text-zinc-muted font-bold tracking-tight uppercase mt-1">
                                {t('sales.reviewQueueSubtitle')}
                            </p>
                        </div>
                    </div>
                </div>
                
                <div className="flex flex-wrap gap-3">
                    <div className="bg-obsidian-card p-3 px-6 rounded-2xl border border-border flex items-center gap-6 shadow-xl">
                        <div>
                            <span className="text-[10px] font-black text-zinc-muted uppercase block tracking-widest leading-none">{t('sales.awaitingFinalization')}</span>
                            <span className="text-2xl font-black text-zinc-text tabular-nums">{reviewQueue.filter(c => c.currentParticipants >= c.minParticipants).length}</span>
                        </div>
                        <div className="w-px h-8 bg-white/5" />
                        <div>
                            <span className="text-[10px] font-black text-zinc-muted uppercase block tracking-widest leading-none">{t('sales.activeMatrixReach')}</span>
                            <span className="text-2xl font-black text-emerald-400 tabular-nums">{stats?.totalParticipants || 0}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tactical Selection Control */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-obsidian-panel/40 p-4 rounded-3xl border border-border/40 backdrop-blur-md">
                <div className="relative flex-1 max-w-lg group">
                    <Search className="absolute top-1/2 -translate-y-1/2 start-4 w-4 h-4 text-zinc-muted/50 group-focus-within:text-brand transition-colors" />
                    <AmberInput
                        placeholder={t('sales.searchCampaigns')}
                        className="h-12 bg-obsidian-card border-border ps-11 pe-4 text-xs font-black shadow-inner"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-3">
                    <AmberButton variant="secondary" className="gap-2 h-12 rounded-2xl border-white/5 font-black uppercase tracking-widest text-[10px]">
                        <Filter className="w-4 h-4" /> {t('sales.reconfigure')}
                    </AmberButton>
                    <AmberButton className="h-12 bg-zinc-text text-black px-8 rounded-2xl font-black uppercase tracking-widest text-[10px]">
                        {t('sales.forceRefresh')}
                    </AmberButton>
                </div>
            </div>

            {/* Evaluation Grid */}
            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                     {[1,2,3,4,5,6].map(i => (
                         <div key={i} className="h-[400px] rounded-[2rem] bg-white/[0.02] border border-white/[0.05] animate-pulse" />
                     ))}
                </div>
            ) : reviewQueue.length === 0 ? (
                <Card className="!p-32 text-center space-y-6 bg-obsidian-card/40 border-dashed border-border/40">
                    <ShieldCheck className="w-20 h-20 text-zinc-muted/20 mx-auto" />
                    <div className="max-w-md mx-auto space-y-2">
                        <h3 className="text-xl font-black text-zinc-text uppercase tracking-widest">{t('sales.allNodesSynchronized')}</h3>
                        <p className="text-sm text-zinc-muted font-bold tracking-tight uppercase">{t('sales.noReviewNeeded')}</p>
                    </div>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                    {reviewQueue.map((campaign) => {
                        const minProgress = Math.min((campaign.currentParticipants / campaign.minParticipants) * 100, 100);
                        const maxProgress = (campaign.currentParticipants / campaign.maxParticipants) * 100;
                        const isUnlocked = campaign.currentParticipants >= campaign.minParticipants;

                        return (
                            <Card 
                                key={campaign.id} 
                                className="!p-8 border-border bg-obsidian-card overflow-hidden group hover:border-emerald-500/40 transition-all duration-700 shadow-2xl relative rounded-[2rem]"
                            >
                                {/* Strategic Overlays */}
                                <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button className="p-2 text-zinc-muted hover:text-white transition-colors">
                                        <ArrowUpRight className="w-5 h-5" />
                                    </button>
                                </div>

                                <div className="space-y-8">
                                    {/* Campaign Identification */}
                                    <div className="flex items-start justify-between">
                                        <div className="space-y-1">
                                            <span className="text-[10px] font-black text-brand uppercase tracking-[0.3em] leading-none">{campaign.category?.name || t('sales.assetProtocol')}</span>
                                            <h3 className="text-xl font-black text-zinc-text uppercase tracking-tighter leading-tight mt-2 group-hover:text-white transition-colors truncate max-w-[200px]">
                                                {campaign.title}
                                            </h3>
                                        </div>
                                        <StatusBadge 
                                            status={getReviewStatus(campaign)} 
                                            variant={getReviewVariant(campaign)}
                                            className="font-black text-[8px] tracking-[0.2em] h-6 px-3 shadow-lg"
                                        />
                                    </div>

                                    {/* Evaluation Telemetry */}
                                    <div className="space-y-6">
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between">
                                                <span className="text-[10px] font-black text-zinc-muted uppercase tracking-widest">{t('sales.activationThreshold')}</span>
                                                <span className={cn(
                                                    "text-[10px] font-black",
                                                    isUnlocked ? "text-emerald-400" : "text-warning"
                                                )}>
                                                    {Math.round(minProgress)}% {t('sales.synced')}
                                                </span>
                                            </div>
                                            <AmberProgress value={minProgress} variant={isUnlocked ? 'success' : 'primary'} className="h-2 rounded-full bg-white/[0.05]" />
                                            <div className="flex items-center justify-between text-[11px] font-black">
                                                <span className="text-zinc-text">{campaign.currentParticipants} {t('sales.nodesActive')}</span>
                                                <span className="text-zinc-muted">{t('sales.min')}: {campaign.minParticipants}</span>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                             <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-1">
                                                 <span className="text-[10px] font-black text-zinc-muted uppercase tracking-widest">{t('sales.yieldPotential')}</span>
                                                 <div className="flex items-center gap-2">
                                                     <DollarSign className="w-3.5 h-3.5 text-brand" />
                                                     <p className="text-lg font-black text-zinc-text tracking-tighter tabular-nums">{formatCurrency(campaign.dealPrice)}</p>
                                                 </div>
                                             </div>
                                             <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-1">
                                                 <span className="text-[10px] font-black text-zinc-muted uppercase tracking-widest">{t('sales.temporalWindow')}</span>
                                                 <div className="flex items-center gap-2 text-warning">
                                                     <Clock className="w-3.5 h-3.5" />
                                                     <p className="text-lg font-black tracking-tighter tabular-nums truncate">
                                                         {new Date(campaign.endTime).toLocaleDateString()}
                                                     </p>
                                                 </div>
                                             </div>
                                        </div>
                                    </div>

                                    <div className="h-px bg-white/[0.05]" />

                                    {/* Operational Actions */}
                                    <div className="flex items-center gap-3">
                                        <AmberButton 
                                            className={cn(
                                                "flex-1 h-12 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all active:scale-95 shadow-xl",
                                                isUnlocked ? "bg-emerald-500 hover:bg-emerald-400 text-white" : "bg-obsidian-outer border border-border text-zinc-muted cursor-not-allowed"
                                            )}
                                            onClick={() => isUnlocked && router.push(`/group-buying/${campaign.id}`)}
                                        >
                                            {isUnlocked ? <Send className="w-4 h-4 me-2" /> : <AlertCircle className="w-4 h-4 me-2" />}
                                            {isUnlocked ? t('sales.finalizeDeal') : t('sales.pendingStabilization')}
                                        </AmberButton>
                                        <AmberButton 
                                            variant="secondary" 
                                            className="h-12 w-12 p-0 rounded-2xl border-white/5 bg-obsidian-outer hover:bg-white/10 active:scale-95 transition-all text-zinc-muted hover:text-white"
                                            onClick={() => router.push(`/group-buying/${campaign.id}/edit`)}
                                        >
                                            <Edit className="w-4 h-4" />
                                        </AmberButton>
                                    </div>
                                </div>

                                {/* Cinematic Pulse for Unlocked Deals */}
                                {isUnlocked && (
                                    <div className="absolute inset-0 border border-emerald-500/20 rounded-[2rem] pointer-events-none animate-pulse-slow" />
                                )}
                            </Card>
                        );
                    })}
                </div>
            )}

            {/* Queue Logistics Meta */}
            <div className="mt-12 p-10 bg-obsidian-card/40 rounded-[3rem] border border-border/40 backdrop-blur-xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-brand/5 rounded-full blur-[100px] pointer-events-none group-hover:bg-brand/10 transition-colors" />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 relative z-10">
                    <div className="space-y-4">
                        <div className="flex items-center gap-3 text-brand">
                            <Zap className="w-5 h-5" />
                            <h4 className="text-xs font-black uppercase tracking-[0.2em]">{t('sales.orchestrationHealth')}</h4>
                        </div>
                        <p className="text-[11px] text-zinc-muted font-bold uppercase tracking-tight leading-relaxed">
                            {t('sales.orchestrationHealthDesc')}
                        </p>
                    </div>
                    
                    <div className="space-y-4">
                        <div className="flex items-center gap-3 text-info">
                            <Users className="w-5 h-5" />
                            <h4 className="text-xs font-black uppercase tracking-[0.2em]">{t('sales.consensusReach')}</h4>
                        </div>
                        <div className="space-y-1">
                            <p className="text-2xl font-black text-zinc-text tabular-nums tracking-tighter leading-none">--</p>
                            <p className="text-[10px] text-zinc-muted font-bold uppercase">{t('sales.peakParticipation')}</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center gap-3 text-emerald-400">
                            <TrendingUp className="w-5 h-5" />
                            <h4 className="text-xs font-black uppercase tracking-[0.2em]">{t('sales.yieldProjection')}</h4>
                        </div>
                        <div className="space-y-1">
                            <p className="text-2xl font-black text-emerald-400 tabular-nums tracking-tighter leading-none">{formatCurrency((reviewQueue[0]?.dealPrice || 0) * (reviewQueue[0]?.currentParticipants || 1))}</p>
                            <p className="text-[10px] text-zinc-muted font-bold uppercase">{t('sales.aggregateNetConsolidation')}</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                         <AmberButton variant="secondary" className="w-full h-14 rounded-2xl bg-black/40 border-white/5 font-black uppercase tracking-widest text-[10px] hover:bg-emerald-500/10 hover:text-emerald-400 hover:border-emerald-500/20 active:scale-95 transition-all">
                             {t('sales.generateAnalytics')}
                         </AmberButton>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GroupBuyingReviewPage;
