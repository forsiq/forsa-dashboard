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
  Target,
  Zap,
  CheckCircle,
  Play,
  XCircle,
  CheckCheck,
} from 'lucide-react';
import { useLanguage } from '@core/contexts/LanguageContext';
import { cn } from '@core/lib/utils/cn';
import { formatCurrency } from '@core/lib/utils/formatCurrency';
import { AmberCard as Card } from '@core/components/AmberCard';
import { AmberButton } from '@core/components/AmberButton';
import { AmberInput } from '@core/components/AmberInput';
import { AmberSlideOver } from '@core/components';
import { AmberProgress } from '@core/components/AmberProgress';
import { StatusBadge } from '@core/components/Data/StatusBadge';
import { DataTable, Column, Action } from '@core/components/Data/DataTable';
import { StatsGrid } from '@core/components/Layout/StatsGrid';
import {
  useGetGroupBuyings,
  useGetGroupBuyingStats,
  useDeleteGroupBuying,
  useStartGroupBuying,
  useCancelGroupBuying,
  useCompleteGroupBuying
} from '../api';
import { useConfirmModal } from '@core/components/Feedback/AmberConfirmModal';
import { useList as useCategories } from '@services/categories/hooks';
import { getLocalizedName } from '@services/categories/types';
import { AuctionImage } from '../../auctions/components/AuctionImage';
import type { GroupBuying } from '../types';

/**
 * GroupBuyingListPage - Campaign Management with DataTable
 */
export const GroupBuyingListPage: React.FC = () => {
  const { t, language, dir } = useLanguage();
  const router = useRouter();
  const isRTL = dir === 'rtl';
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<any>('all');
  const [categoryIdFilter, setCategoryIdFilter] = useState<string | 'all'>('all');

  const { data: campaignsData, isLoading: listLoading } = useGetGroupBuyings({
    status: statusFilter === 'all' ? undefined : statusFilter,
    categoryId: categoryIdFilter === 'all' ? undefined : categoryIdFilter,
    search: searchQuery || undefined,
  });

  const { data: stats } = useGetGroupBuyingStats();
  const { data: categoriesData } = useCategories({ limit: 100 });
  const { mutate: deleteCampaign } = useDeleteGroupBuying();
  const startDeal = useStartGroupBuying();
  const cancelDeal = useCancelGroupBuying();
  const completeDeal = useCompleteGroupBuying();
  const { openConfirm, ConfirmModal } = useConfirmModal();

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

  /** Map status to translation key */
  const getStatusLabel = (status: string): string => {
    const key = `groupBuying.status.${status.toLowerCase()}`;
    return t(key) || status;
  };

  // Table columns
  const columns: Column<GroupBuying>[] = [
    {
      key: 'title',
      label: t('groupBuying.capital_allocation') || 'Campaign',
      cardTitle: true,
      render: (campaign) => (
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-obsidian-outer border border-border flex items-center justify-center overflow-hidden shrink-0">
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
            <p className="text-sm font-black text-zinc-text uppercase tracking-tight">{campaign.title}</p>
            <p className="text-[10px] font-black text-zinc-muted uppercase tracking-widest mt-0.5">
              {campaign.category?.name || 'GENERAL'}
            </p>
          </div>
        </div>
      ),
      sortable: true,
    },
    {
      key: 'status',
      label: t('common.status') || 'Status',
      cardBadge: true,
      render: (campaign) => (
        <StatusBadge
          status={getStatusLabel(campaign.status)}
          variant={getStatusVariant(campaign.status)}
          size="sm"
        />
      ),
      sortable: true,
    },
    {
      key: 'currentParticipants',
      label: t('groupBuying.participants') || 'Participants',
      render: (campaign) => {
        const progress = campaign.maxParticipants > 0 ? (campaign.currentParticipants / campaign.maxParticipants) * 100 : 0;
        return (
          <div className="w-36 space-y-1.5">
            <AmberProgress value={progress} className="h-1.5" variant={progress >= 100 ? 'success' : 'primary'} />
            <div className="flex justify-between text-[10px] font-black">
              <span className="text-zinc-text">{campaign.currentParticipants}</span>
              <span className="text-zinc-muted">{Math.round(progress)}%</span>
            </div>
          </div>
        );
      },
      align: 'center',
    },
    {
      key: 'dealPrice',
      label: t('groupBuying.consolidate_price') || 'Deal Price',
      render: (campaign) => (
        <div>
          <span className="text-base font-black text-brand tabular-nums leading-none tracking-tight">
            {formatCurrency(campaign.dealPrice)}
          </span>
          <p className="text-[10px] font-black text-zinc-muted line-through mt-0.5">
            {formatCurrency(campaign.originalPrice)}
          </p>
        </div>
      ),
      sortable: true,
      align: 'right',
    },
    {
      key: 'endTime',
      label: t('common.date') || 'End Date',
      hideInCard: true,
      render: (campaign) => (
        <span className="text-sm text-zinc-muted">
          {new Date(campaign.endTime).toLocaleDateString()}
        </span>
      ),
      sortable: true,
      align: 'center',
    },
  ];

  const rowActions: Action<GroupBuying>[] = [
    {
      label: t('groupBuying.analyze_node') || 'View',
      icon: Eye,
      onClick: (campaign) => router.push(`/group-buying/${campaign.id}`),
    },
    {
      label: t('common.edit') || 'Edit',
      icon: Edit,
      onClick: (campaign) => router.push(`/group-buying/${campaign.id}/edit`),
    },
    {
      label: (campaign) => (campaign.status === 'draft' || campaign.status === 'scheduled') ? (t('groupBuying.lifecycle.start') || 'Start') : null as any,
      icon: Play,
      onClick: (campaign) => openConfirm({
        title: t('groupBuying.lifecycle.start_title') || 'Start Campaign',
        message: t('groupBuying.lifecycle.start_confirm') || 'Are you sure?',
        onConfirm: () => startDeal.mutate(String(campaign.id)),
        variant: 'success',
      }),
      variant: 'success',
    },
    {
      label: (campaign) => (campaign.status === 'unlocked' || campaign.status === 'active') ? (t('groupBuying.lifecycle.complete') || 'Complete') : null as any,
      icon: CheckCheck,
      onClick: (campaign) => openConfirm({
        title: t('groupBuying.lifecycle.complete_title') || 'Complete Campaign',
        message: t('groupBuying.lifecycle.complete_confirm') || 'Are you sure?',
        onConfirm: () => completeDeal.mutate(String(campaign.id)),
        variant: 'success',
      }),
      variant: 'success',
    },
    {
      label: (campaign) => !['completed', 'cancelled'].includes(campaign.status) ? (t('groupBuying.lifecycle.cancel') || 'Cancel') : null as any,
      icon: XCircle,
      variant: 'danger',
      onClick: (campaign) => openConfirm({
        title: t('groupBuying.lifecycle.cancel_title') || 'Cancel Campaign',
        message: t('groupBuying.lifecycle.cancel_confirm') || 'Are you sure?',
        onConfirm: () => cancelDeal.mutate(String(campaign.id)),
        variant: 'danger',
      }),
    },
    {
      label: t('common.delete') || 'Delete',
      icon: Trash2,
      variant: 'danger',
      onClick: (campaign) => openConfirm({
        title: t('common.confirm_delete') || 'Delete Campaign',
        message: t('common.delete_confirm') || 'Are you sure you want to delete this campaign?',
        onConfirm: () => deleteCampaign(String(campaign.id)),
        variant: 'danger',
      }),
    },
  ];

  if (!isClient) return null;

  return (
    <div className="space-y-8 p-6 max-w-[1600px] mx-auto animate-in fade-in duration-700" dir={dir}>
      {/* Header */}
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
                {t('groupBuying.title') || 'CAMPAIGNS'}
              </h1>
              <p className="text-base text-zinc-muted font-bold tracking-tight uppercase mt-1">
                {t('groupBuying.subtitle') || 'Group buying campaigns management'}
              </p>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          <AmberButton
            variant="secondary"
            className="gap-2 h-11 border-border font-bold rounded-xl active:scale-95 transition-all hover:bg-obsidian-hover hover:border-brand/30"
            onClick={() => setIsFilterOpen(true)}
          >
            <SlidersHorizontal className="w-4 h-4" />
            {t('common.filters') || 'Filters'}
          </AmberButton>
          <Link href="/group-buying/new">
            <AmberButton className="gap-2 h-11 bg-brand hover:bg-brand text-black font-black rounded-xl shadow-sm transition-all border-none active:scale-95 px-8">
              <Plus className="w-5 h-5" />
              <span>{t('groupBuying.create') || 'Create Campaign'}</span>
            </AmberButton>
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <StatsGrid
        stats={[
          {
            label: t('groupBuying.active_engines'),
            value: stats?.activeCampaigns || 0,
            icon: Zap,
            color: 'brand',
            description: t('groupBuying.live_distribution') || 'LIVE',
          },
          {
            label: t('groupBuying.total_conversion'),
                value: formatCurrency(stats?.totalRevenue),
            icon: TrendingUp,
            color: 'success',
            description: t('groupBuying.aggregate_yield') || 'REVENUE',
          },
          {
            label: t('groupBuying.network_reach'),
            value: stats?.totalParticipants || 0,
            icon: Users,
            color: 'info',
            description: t('groupBuying.node_participation') || 'PARTICIPANTS',
          },
          {
            label: t('groupBuying.success_delta'),
            value: stats?.completedCampaigns || 0,
            icon: CheckCircle,
            color: 'primary',
            description: t('groupBuying.concluded_nodes') || 'COMPLETED',
          },
        ]}
      />

      {/* Main Table */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="text-sm font-black text-zinc-muted uppercase tracking-[0.25em] flex items-center gap-2">
            <Layers className="w-4 h-4" /> {t('groupBuying.orchestration_matrix') || 'Campaigns'}
          </h2>
          <div className="relative group min-w-[320px]">
            <Search className={cn(
              "absolute top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-muted/50 group-focus-within:text-brand transition-colors",
              isRTL ? 'right-4' : 'left-4'
            )} />
            <AmberInput
              placeholder={t('groupBuying.scan_nomenclature') || "Search campaigns..."}
              className="h-11 bg-obsidian-card border-border pl-11 pr-4 text-xs font-bold shadow-inner"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {listLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-[300px] rounded-xl bg-white/[0.02] border border-white/[0.05] animate-pulse" />
            ))}
          </div>
        ) : campaigns.length === 0 ? (
          <Card className="!p-24 text-center space-y-6 bg-obsidian-card/40 border-dashed border-border/40">
            <div className="w-24 h-24 rounded-full bg-white/[0.02] flex items-center justify-center mx-auto border border-white/[0.05]">
              <Target className="w-10 h-10 text-zinc-muted/30" />
            </div>
            <div className="max-w-md mx-auto space-y-2">
              <h3 className="text-xl font-black text-zinc-text uppercase tracking-widest">{t('groupBuying.operational_gap') || 'No Campaigns'}</h3>
              <p className="text-sm text-zinc-muted font-bold tracking-tight">{t('groupBuying.no_active_protocols') || 'No campaigns found.'}</p>
            </div>
            <AmberButton onClick={() => router.push('/group-buying/new')} className="h-12 px-10 rounded-xl bg-brand text-black font-black uppercase active:scale-95 transition-all">
              {t('groupBuying.initialize_first_call') || 'Create Campaign'}
            </AmberButton>
          </Card>
        ) : (
          <div className="bg-[var(--color-obsidian-card)] border border-[var(--color-border)] rounded-2xl shadow-sm overflow-hidden">
            <DataTable
              columns={columns}
              data={campaigns}
              keyField="id"
              rowActions={rowActions}
              onRowClick={(row) => router.push(`/group-buying/${row.id}`)}
              pagination
              pageSize={10}
              showViewToggle
            />
          </div>
        )}
      </div>

      {/* Filter SlideOver */}
      <AmberSlideOver
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        title={t('groupBuying.config_title') || "Filters"}
        description={t('groupBuying.config_desc') || "Filter campaigns by status."}
      >
        <div className="space-y-8 py-6">
          <div className="space-y-3">
            <label className="text-[10px] font-black text-zinc-muted uppercase tracking-widest">{t('groupBuying.nomenclature_scan') || 'Search'}</label>
            <AmberInput
              placeholder={t('groupBuying.enter_identifier') || "Search campaigns..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-12 bg-obsidian-outer"
            />
          </div>

          <div className="h-px bg-white/5" />

          <div className="space-y-6">
            <div className="space-y-3">
              <label className="text-[10px] font-black text-zinc-muted uppercase tracking-widest">{t('groupBuying.strategy') || 'Status'}</label>
              <div className="grid grid-cols-2 gap-3">
                {['all', 'active', 'scheduled', 'completed', 'cancelled', 'draft', 'unlocked', 'expired'].map((status) => (
                  <button
                    key={status}
                    onClick={() => setStatusFilter(status)}
                    className={cn(
                      "h-11 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border",
                      statusFilter === status
                        ? "bg-brand text-black border-brand shadow-lg"
                        : "bg-obsidian-panel text-zinc-muted border-white/5 hover:border-white/10"
                    )}
                  >
                    {getStatusLabel(status)}
                  </button>
                ))}
              </div>
            </div>

            {(categoriesData?.categories || []).length > 0 && (
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
                      onClick={() => setCategoryIdFilter(String(cat.id))}
                      className={cn(
                        "px-3 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all border",
                        categoryIdFilter === String(cat.id)
                          ? "bg-brand text-black border-brand"
                          : "bg-obsidian-panel text-zinc-muted border-white/5 hover:border-white/10"
                      )}
                    >
                      {getLocalizedName(cat, language)}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="pt-10 space-y-4">
            <AmberButton className="w-full h-14 bg-zinc-text text-black font-black uppercase tracking-[0.3em] active:scale-95 transition-all rounded-2xl shadow-xl" onClick={() => setIsFilterOpen(false)}>
              {t('groupBuying.reinitialize_scan') || 'Apply'}
            </AmberButton>
            <AmberButton
              variant="secondary"
              className="w-full h-12 font-black uppercase tracking-widest border border-white/5 active:scale-95 transition-all rounded-xl"
              onClick={() => {
                setStatusFilter('all');
                setCategoryIdFilter('all');
                setSearchQuery('');
                setIsFilterOpen(false);
              }}
            >
              {t('groupBuying.reset_matrix') || 'Reset'}
            </AmberButton>
          </div>
        </div>
      </AmberSlideOver>
      <ConfirmModal />
    </div>
  );
};

export default GroupBuyingListPage;
