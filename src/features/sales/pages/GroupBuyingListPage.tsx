import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { 
 Users, 
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
 ChevronRight,
 LayoutGrid,
 List,
 Target,
 Zap,
 CheckCircle,
 XCircle
} from 'lucide-react';
import { useLanguage } from '@core/contexts/LanguageContext';
import { cn } from '@core/lib/utils/cn';
import { AmberCard as Card } from '@core/components/AmberCard';
import { AmberButton } from '@core/components/AmberButton';
import { AmberInput } from '@core/components/AmberInput';
import { AmberSlideOver } from '@core/components/AmberSlideOver';
import { AmberProgress } from '@core/components/AmberProgress';
import { StatusBadge } from '@core/components/Data/StatusBadge';
import { StatsGrid } from '@core/components/Layout/StatsGrid';
import { 
 useGetGroupBuyings, 
 useGetGroupBuyingStats, 
 useDeleteGroupBuying 
} from '../api';
import { AuctionImage } from '../../auctions/components/AuctionImage';


/**
 * GroupBuyingListPage - Premium Campaign Orchestration Interface
 */
export const GroupBuyingListPage: React.FC = () => {
  const { t, dir } = useLanguage();
  const router = useRouter();
  const isRTL = dir === 'rtl';
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<any>('all');

  const { data: campaignsData, isLoading: listLoading } = useGetGroupBuyings({
    status: statusFilter === 'all' ? undefined : statusFilter,
    search: searchQuery || undefined,
  });

  const { data: stats } = useGetGroupBuyingStats();
  const { mutate: deleteCampaign } = useDeleteGroupBuying();

  const campaigns = campaignsData?.groupBuyings || [];

  const getStatusVariant = (status: string): any => {
    switch (status.toLowerCase()) {
      case 'active': return 'active';
      case 'scheduled': return 'warning';
      case 'completed': return 'completed';
      case 'cancelled':
      case 'expired': return 'failed';
      default: return 'warning';
    }
  };
  if (!isClient) return null;

  return (
    <div className="space-y-8 p-6 max-w-[1600px] mx-auto animate-in fade-in duration-700" dir={dir}>
      {/* Header Cluster */}
      <div className={cn(
        "flex flex-col lg:flex-row lg:items-start justify-between gap-6",
        isRTL ? "text-right" : "text-left"
      )}>
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-sm bg-brand/10 flex items-center justify-center text-brand border border-brand/20 shadow-[0_0_15px_rgba(245,196,81,0.1)]">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-4xl font-black text-zinc-text tracking-tighter leading-none uppercase">
                {t('groupBuying.title') || 'CAMPAIGN PROTOCOLS'}
              </h1>
              <p className="text-base text-zinc-muted font-bold tracking-tight uppercase mt-1">
                {t('groupBuying.subtitle') || 'High-volume asset consolidation and group acquisition matrix'}
              </p>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          <div className="flex bg-obsidian-card p-1 rounded-xl border border-border shadow-inner">
            <button 
              onClick={() => setViewMode('grid')}
              className={cn(
                "p-2 rounded-lg transition-all",
                viewMode === 'grid' ? "bg-brand text-black shadow-lg scale-105" : "text-zinc-muted hover:text-zinc-text"
              )}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setViewMode('list')}
              className={cn(
                "p-2 rounded-lg transition-all",
                viewMode === 'list' ? "bg-brand text-black shadow-lg scale-105" : "text-zinc-muted hover:text-zinc-text"
              )}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
          <AmberButton
            variant="secondary"
            className="gap-2 h-11 border-border font-bold rounded-xl active:scale-95 transition-all hover:bg-obsidian-hover hover:border-brand/30"
            onClick={() => setIsFilterOpen(true)}
          >
            <SlidersHorizontal className="w-4 h-4" />
            {t('common.filters') || 'Configuration'}
          </AmberButton>
          <Link href="/group-buying/new">
            <AmberButton className="gap-2 h-11 bg-brand hover:bg-brand text-black font-black rounded-xl shadow-[0_4px_20px_rgba(245,196,81,0.2)] transition-all border-none active:scale-95 px-8">
              <Plus className="w-5 h-5" />
              <span>{t('groupBuying.create') || 'Initialize Campaign'}</span>
            </AmberButton>
          </Link>
        </div>
      </div>

      {/* Campaign Metrics Matrix */}
      <StatsGrid
        stats={[
          {
            label: t('groupBuying.active_engines'),
            value: stats?.activeCampaigns || 0,
            icon: Zap,
            color: 'brand',
            description: t('groupBuying.live_distribution') || 'LIVE DISTRIBUTION',
          },
          {
            label: t('groupBuying.total_conversion'),
            value: `$${stats?.totalRevenue?.toLocaleString() || '0'}`,
            icon: TrendingUp,
            color: 'success',
            description: t('groupBuying.aggregate_yield') || 'AGGREGATE YIELD',
          },
          {
            label: t('groupBuying.network_reach'),
            value: stats?.totalParticipants || 0,
            icon: Users,
            color: 'info',
            description: t('groupBuying.node_participation') || 'NODE PARTICIPATION',
          },
          {
            label: t('groupBuying.success_delta'),
            value: stats?.completedCampaigns || 0,
            icon: CheckCircle,
            color: 'primary',
            description: t('groupBuying.concluded_nodes') || 'CONCLUDED NODES',
          },
        ]}
      />

      {/* Main Orchestration Matrix */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="text-sm font-black text-zinc-muted uppercase tracking-[0.25em] flex items-center gap-2">
            <Layers className="w-4 h-4" /> {t('groupBuying.orchestration_matrix') || 'Operational Campaign Grid'}
          </h2>
          <div className="relative group min-w-[320px]">
            <Search className={cn(
              "absolute top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-muted/50 group-focus-within:text-brand transition-colors",
              isRTL ? 'right-4' : 'left-4'
            )} />
            <AmberInput 
              placeholder={t('groupBuying.scan_nomenclature') || "Scan campaign nomenclature..."}
              className="h-11 bg-obsidian-card border-border pl-11 pr-4 text-xs font-bold shadow-inner"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {listLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
             {[1,2,3,4,5,6].map(i => (
               <div key={i} className="h-[450px] rounded-3xl bg-white/[0.02] border border-white/[0.05] animate-pulse shadow-sm" />
             ))}
          </div>
        ) : campaigns.length === 0 ? (
          <Card className="!p-24 text-center space-y-6 bg-obsidian-card/40 border-dashed border-border/40">
             <div className="w-24 h-24 rounded-full bg-white/[0.02] flex items-center justify-center mx-auto border border-white/[0.05] shadow-inner">
               <Target className="w-10 h-10 text-zinc-muted/30" />
             </div>
             <div className="max-w-md mx-auto space-y-2">
              <h3 className="text-xl font-black text-zinc-text uppercase tracking-widest">{t('groupBuying.operational_gap') || 'Operational Gap Detected'}</h3>
              <p className="text-sm text-zinc-muted font-bold tracking-tight uppercase">{t('groupBuying.no_active_protocols') || 'No active campaign protocols found within the current scan parameters.'}</p>
             </div>
             <AmberButton onClick={() => router.push('/group-buying/new')} className="h-12 px-10 rounded-xl bg-brand text-black font-black uppercase active:scale-95 transition-all shadow-lg">
               {t('groupBuying.initialize_first_call') || 'Initialize Node First Call'}
             </AmberButton>
          </Card>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {campaigns.map((campaign) => {
              const progress = (campaign.currentParticipants / campaign.maxParticipants) * 100;
              return (
                <Card 
                  key={campaign.id} 
                  className="!p-0 border-border bg-obsidian-card overflow-hidden group hover:border-brand/40 transition-all duration-700 hover:-translate-y-2 shadow-xl rounded-3xl"
                  onClick={() => router.push(`/group-buying/${campaign.id}`)}
                >
                  {/* Visual Coverage */}
                  <div className="h-56 bg-obsidian-panel/50 relative overflow-hidden">
                     <AuctionImage
                      auction={{
                       imageUrl: (campaign.item as any)?.imageUrl || (campaign as any).imageUrl,
                       images: (campaign.item as any)?.images || (campaign as any).images,
                       mainAttachmentId: (campaign.item as any)?.mainAttachmentId || (campaign as any).mainAttachmentId,
                       attachmentIds: (campaign.item as any)?.attachmentIds || (campaign as any).attachmentIds,
                      }}
                      alt={campaign.title}
                      className="w-full h-full"
                      fallbackClassName="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000 opacity-90 group-hover:opacity-100"
                     />
                     {/* State Indicators */}
                     <div className="absolute top-5 left-5 right-5 flex items-center justify-between">
                       <StatusBadge 
                        status={campaign.status.toUpperCase()} 
                        variant={getStatusVariant(campaign.status)}
                        className="font-black tracking-[0.2em] backdrop-blur-xl bg-black/60 px-4 py-1.5 border-none shadow-lg"
                       />
                       <div className="bg-black/60 backdrop-blur-xl border border-white/5 px-3 py-1.5 rounded-xl flex items-center gap-2 shadow-lg">
                         <Clock className="w-3.5 h-3.5 text-brand" />
                         <span className="text-[10px] font-black text-white tabular-nums uppercase">
                           {new Date(campaign.endTime).toLocaleDateString()}
                         </span>
                       </div>
                     </div>
                     <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                     <div className="absolute bottom-5 left-6 right-6">
                       <span className="text-[10px] font-black text-brand uppercase tracking-widest">{campaign.category?.name || (t('groupBuying.general_collaboration') || 'GENERAL COLLABORATION')}</span>
                       <h4 className="text-xl font-black text-white leading-none uppercase mt-1 tracking-tighter truncate">{campaign.title}</h4>
                     </div>
                  </div>

                  <div className="p-7 space-y-7">
                     {/* Progression Telemetry */}
                     <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-black text-zinc-muted uppercase tracking-[0.2em]">{t('groupBuying.threshold_sync') || 'Threshold Synchronization'}</span>
                          <span className="text-[10px] font-black text-brand">{Math.round(progress)}% {t('common.complete') || 'COMPLETE'}</span>
                        </div>
                       <AmberProgress value={progress} variant={progress >= 100 ? 'success' : 'primary'} className="h-2 rounded-full bg-white/[0.05]" />
                        <div className="flex items-center justify-between text-[11px] font-black tracking-tighter">
                          <span className="text-zinc-text">{campaign.currentParticipants} {t('groupBuying.participants') || 'PARTICIPANTS'}</span>
                          <span className="text-zinc-muted uppercase">{t('groupBuying.target') || 'Target'}: {campaign.maxParticipants}</span>
                        </div>
                     </div>

                     <div className="h-px bg-white/[0.05]" />

                     {/* Fiscal Delta Cluster */}
                     <div className="grid grid-cols-2 gap-6">
                       <div className="space-y-1">
                         <span className="text-[9px] font-black text-zinc-muted uppercase tracking-[0.2em]">{t('groupBuying.consolidate_price') || 'Consolidate Price'}</span>
                         <p className="text-2xl font-black text-brand tabular-nums leading-none tracking-tighter">${campaign.dealPrice.toLocaleString()}</p>
                       </div>
                       <div className="space-y-1 text-right">
                         <span className="text-[9px] font-black text-zinc-muted uppercase tracking-[0.2em]">{t('groupBuying.original_premium') || 'Original Premium'}</span>
                         <p className="text-zinc-muted text-lg font-bold line-through leading-none tabular-nums tracking-tighter">${campaign.originalPrice.toLocaleString()}</p>
                       </div>
                     </div>

                     {/* Operational Controls */}
                     <div className="flex items-center gap-3">
                       <AmberButton 
                        variant="secondary" 
                        className="flex-1 h-12 rounded-2xl bg-obsidian-outer hover:bg-brand hover:text-black font-black uppercase text-[10px] tracking-widest transition-all active:scale-95 border-border shadow-md"
                       >
                         {t('groupBuying.analyze_node') || 'Analyze Node'}
                       </AmberButton>
                       <Link href={`/group-buying/${campaign.id}/edit`}>
                        <AmberButton variant="outline" className="p-0 w-12 h-12 rounded-2xl flex items-center justify-center border-white/5 hover:border-brand/30 hover:bg-brand/5 active:scale-95 transition-all shadow-md">
                          <Edit className="w-4 h-4" />
                        </AmberButton>
                       </Link>
                       <AmberButton 
                        variant="outline" 
                        onClick={(e) => { e.stopPropagation(); deleteCampaign(campaign.id); }}
                        className="p-0 w-12 h-12 rounded-2xl flex items-center justify-center border-white/5 hover:border-danger/30 hover:bg-danger/5 text-zinc-muted hover:text-danger active:scale-95 transition-all shadow-md"
                       >
                         <Trash2 className="w-4 h-4" />
                       </AmberButton>
                     </div>
                  </div>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card className="!p-0 bg-obsidian-card border-border overflow-hidden rounded-3xl shadow-2xl">
             <table className="w-full text-left border-collapse" dir={dir}>
               <thead>
                 <tr className="border-b border-border bg-obsidian-panel/40">
                   <th className="px-8 py-5 text-[10px] font-black text-zinc-muted uppercase tracking-widest text-right">{t('groupBuying.capital_allocation') || 'Capital Allocation'}</th>
                   <th className="px-8 py-5"></th>
                 </tr>
               </thead>
               <tbody>
                 {campaigns.map((campaign) => {
                   const progress = (campaign.currentParticipants / campaign.maxParticipants) * 100;
                   return (
                     <tr key={campaign.id} className="border-b border-border/5 hover:bg-white/[0.02] transition-all cursor-pointer group" onClick={() => router.push(`/group-buying/${campaign.id}`)}>
                       <td className="px-8 py-6">
                         <div className="flex items-center gap-5">
                           <div className="w-12 h-12 rounded-xl bg-obsidian-outer border border-border flex items-center justify-center overflow-hidden shrink-0 group-hover:border-brand/40 transition-colors shadow-inner">
                            <AuctionImage
                              auction={{
                               imageUrl: (campaign.item as any)?.imageUrl || (campaign as any).imageUrl,
                               images: (campaign.item as any)?.images || (campaign as any).images,
                               mainAttachmentId: (campaign.item as any)?.mainAttachmentId || (campaign as any).mainAttachmentId,
                               attachmentIds: (campaign.item as any)?.attachmentIds || (campaign as any).attachmentIds,
                              }}
                              alt={campaign.title}
                              className="w-full h-full"
                              fallbackClassName="w-full h-full object-cover"
                            />
                           </div>
                           <div>
                             <p className="text-[9px] font-black text-zinc-muted uppercase tracking-widest mt-1">{campaign.category?.name || 'GENERAL'}</p>
                           </div>
                         </div>
                       </td>
                       <td className="px-8 py-6">
                         <StatusBadge status={campaign.status.toUpperCase()} variant={getStatusVariant(campaign.status)} size="sm" className="font-black px-3 py-1" />
                       </td>
                       <td className="px-8 py-6">
                         <div className="w-48 space-y-2">
                           <AmberProgress value={progress} className="h-1.5" variant={progress >= 100 ? 'success' : 'primary'} />
                           <div className="flex justify-between text-[10px] font-black">
                             <span className="text-zinc-text">{campaign.currentParticipants} {t('groupBuying.node_reach') || 'NODE REACH'}</span>
                             <span className="text-zinc-muted">{Math.round(progress)}%</span>
                           </div>
                         </div>
                       </td>
                       <td className="px-8 py-6 text-right">
                         <p className="text-lg font-black text-brand tabular-nums leading-none tracking-tighter">${campaign.dealPrice.toLocaleString()}</p>
                         <p className="text-[9px] font-black text-zinc-muted uppercase tracking-widest mt-1 line-through">${campaign.originalPrice.toLocaleString()}</p>
                       </td>
                       <td className="px-8 py-6 text-right">
                         <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                          <Link href={`/group-buying/${campaign.id}/edit`} onClick={(e) => e.stopPropagation()}>
                            <AmberButton variant="ghost" className="p-2 h-auto text-zinc-muted hover:text-brand bg-white/5 rounded-lg active:scale-95 transition-all">
                              <Edit className="w-4 h-4" />
                            </AmberButton>
                          </Link>
                          <AmberButton variant="ghost" className="p-2 h-auto text-zinc-muted hover:text-danger bg-white/5 rounded-lg active:scale-95 transition-all" onClick={(e) => { e.stopPropagation(); deleteCampaign(campaign.id); }}>
                            <Trash2 className="w-4 h-4" />
                          </AmberButton>
                         </div>
                       </td>
                     </tr>
                   );
                 })}
               </tbody>
             </table>
          </Card>
        )}
      </div>

      {/* Campaign Matrix Configuration SlideOver */}
      <AmberSlideOver
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        title={t('groupBuying.config_title') || "Operational Matrix Configuration"}
        description={t('groupBuying.config_desc') || "Refine campaign node visibility by status, reach, and Category protocols."}
      >
        <div className="space-y-8 py-6">
          <div className="space-y-3">
            <label className="text-[10px] font-black text-zinc-muted uppercase tracking-widest">{t('groupBuying.nomenclature_scan') || 'Protocol Nomenclature Scan'}</label>
            <AmberInput 
              placeholder={t('groupBuying.enter_identifier') || "Enter campaign identifier..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-12 bg-obsidian-outer"
            />
          </div>

          <div className="h-px bg-white/5" />

          <div className="space-y-6">
            <div className="space-y-3">
              <label className="text-[10px] font-black text-zinc-muted uppercase tracking-widest">{t('groupBuying.strategy') || 'Node State Strategy'}</label>
              <div className="grid grid-cols-2 gap-3">
                {['all', 'active', 'scheduled', 'completed', 'cancelled'].map((status) => (
                  <button
                    key={status}
                    onClick={() => setStatusFilter(status)}
                    className={cn(
                      "h-11 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border",
                      statusFilter === status 
                      ? "bg-brand text-black border-brand shadow-lg scale-105" 
                      : "bg-obsidian-panel text-zinc-muted border-white/5 hover:border-white/10"
                    )}
                  >
                     {status.toUpperCase()} {t('groupBuying.protocol') || 'PROTOCOL'}
                  </button>
                ))}
              </div>
            </div>
          </div>
          
          <div className="pt-10 space-y-4">
            <AmberButton className="w-full h-14 bg-zinc-text text-black font-black uppercase tracking-[0.3em] active:scale-95 transition-all rounded-2xl shadow-xl" onClick={() => setIsFilterOpen(false)}>
              {t('groupBuying.reinitialize_scan') || 'Reinitialize Scan'}
            </AmberButton>
            <AmberButton 
              variant="secondary" 
              className="w-full h-12 font-black uppercase tracking-widest border border-white/5 active:scale-95 transition-all rounded-xl"
              onClick={() => {
                setStatusFilter('all');
                setSearchQuery('');
                setIsFilterOpen(false);
              }}
            >
              {t('groupBuying.reset_matrix') || 'Reset Operational Matrix'}
            </AmberButton>
          </div>
        </div>
      </AmberSlideOver>
    </div>
  );
};

export default GroupBuyingListPage;
