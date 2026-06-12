import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import {
  Users,
  Plus,
  TrendingUp,
  Clock,
  Eye,
  Edit,
  Trash2,
  Target,
  Zap,
  CheckCircle,
  XCircle,
  Heart,
} from 'lucide-react';
import { useLanguage } from '@core/contexts/LanguageContext';
import { cn } from '@core/lib/utils/cn';
import { formatCurrency } from '@core/lib/utils/formatCurrency';
import { useIsMobile } from '@core/hooks/useIsMobile';
import { AmberCard as Card } from '@core/components/AmberCard';
import { AmberButton } from '@core/components/AmberButton';
import { AmberInput } from '@core/components/AmberInput';
import { AmberSlideOver } from '@core/components';
import { AmberProgress } from '@core/components/AmberProgress';
import { StatusBadge } from '@core/components/Data/StatusBadge';
import { DataTable, Column, Action } from '@core/components/Data/DataTable';
import {
  DataTableEntityTitle,
  dataTableLinkInGroupClass,
} from '@core/components/Data/DataTableEntityTitle';
import {
  AdminListPageShell,
  ListPageToolbar,
  ListPageToolbarSearch,
} from '@core/components/Layout';
import { ListPageSkeleton, FetchingOverlay } from '@core/loading';
import { useDashboardRole } from '@core/hooks/useDashboardRole';
import {
  useGetGroupBuyings,
  useGetGroupBuyingStats,
  useDeleteGroupBuying,
  useCancelGroupBuying,
} from '../api';
import { useConfirmModal } from '@core/components/Feedback/AmberConfirmModal';
import { useDebounce } from '@core/hooks/useDebounce';
import { useList as useCategories } from '@services/categories/hooks';
import { getLocalizedName } from '@services/categories/types';
import { AuctionImage } from '../../auctions/components/AuctionImage';
import { getCountdown } from '@core/utils/countdown';
import { EmptyState } from '@core/components/EmptyState';
import type { GroupBuying, GroupBuyingFilters } from '../types';

/**
 * GroupBuyingListPage - Campaign Management with DataTable
 */
export const GroupBuyingListPage: React.FC = () => {
  const { t, language, dir } = useLanguage();
  const router = useRouter();
  const { isMobile } = useIsMobile();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const { canManageGroupBuying } = useDashboardRole();

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 300);
  const [statusFilter, setStatusFilter] = useState<any>('all');
  const [categoryIdFilter, setCategoryIdFilter] = useState<string | 'all'>('all');
  const [sortBy, setSortBy] = useState<string>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  const activeFilterCount = (statusFilter !== 'all' ? 1 : 0) + (categoryIdFilter !== 'all' ? 1 : 0);

  const { data: campaignsData, isPending: listLoading, isFetching } = useGetGroupBuyings({
    status: statusFilter === 'all' ? undefined : statusFilter,
    categoryId: categoryIdFilter === 'all' ? undefined : categoryIdFilter,
    search: debouncedSearch || undefined,
    page,
    limit,
    sortBy: sortBy as GroupBuyingFilters['sortBy'],
    sortOrder,
  });

  const { data: stats } = useGetGroupBuyingStats();
  const { data: categoriesData } = useCategories({ limit: 100 });
  const { mutate: deleteCampaign } = useDeleteGroupBuying();
  const cancelDeal = useCancelGroupBuying();
  const { openConfirm, ConfirmModal } = useConfirmModal();

  const categoryMap = useMemo(() => {
    const cats = categoriesData?.categories || [];
    return new Map(cats.map((c) => [String(c.id), getLocalizedName(c, language)]));
  }, [categoriesData, language]);

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

  const handleSortChange = (key: string, direction: 'asc' | 'desc') => {
    setSortBy(key);
    setSortOrder(direction);
    setPage(1);
  };

  // Table columns
  const columns: Column<GroupBuying>[] = [
    {
      key: 'title',
      label: t('groupBuying.capital_allocation') || 'Campaign',
      cardTitle: true,
      className: 'min-w-[240px] max-w-[420px]',
      render: (campaign) => (
        <Link
          href={`/group-buying/${campaign.id}`}
          className="flex min-w-0 items-center gap-3 rounded-lg -mx-1 px-1 py-0.5 transition-colors hover:bg-white/[0.03] group/link"
          onClick={(e) => e.stopPropagation()}
        >
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
          <div className="min-w-0 flex-1">
            <DataTableEntityTitle text={campaign.title} className={dataTableLinkInGroupClass} />
            <p className="text-[11px] font-bold text-zinc-muted truncate mt-0.5">
              {categoryMap.get(String(campaign.categoryId)) || campaign.category?.name || '—'}
            </p>
          </div>
        </Link>
      ),
      sortable: true,
    },
    {
      key: 'status',
      label: t('common.status') || 'Status',
      cardBadge: true,
      width: 'w-[120px]',
      className: 'whitespace-nowrap',
      render: (campaign) => (
        <StatusBadge
          status={campaign.status}
          labelKey={`groupBuying.status.${campaign.status.toLowerCase()}`}
          variant={getStatusVariant(campaign.status)}
          size="sm"
        />
      ),
      sortable: true,
      align: 'center',
    },
    {
      key: 'currentParticipants',
      label: t('groupBuying.participants_count') || 'Participants',
      width: 'w-[150px]',
      className: 'whitespace-nowrap',
      render: (campaign) => {
        const goal = campaign.minParticipants > 0 ? campaign.minParticipants : campaign.maxParticipants;
        const progress = goal > 0 ? Math.min((campaign.currentParticipants / goal) * 100, 100) : 0;
        return (
          <div className="w-full max-w-[140px] mx-auto space-y-1.5">
            <AmberProgress value={progress} className="h-1.5" variant={progress >= 100 ? 'success' : 'primary'} />
            <div className="flex justify-between gap-2 text-[11px] font-black tabular-nums">
              <span className="text-zinc-text">{campaign.currentParticipants}/{goal}</span>
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
      width: 'w-[160px]',
      className: 'whitespace-nowrap',
      render: (campaign) => {
        const discount = campaign.originalPrice > 0
          ? Math.round(((campaign.originalPrice - campaign.dealPrice) / campaign.originalPrice) * 100)
          : 0;
        return (
          <div className="flex flex-col items-center gap-0.5">
            <span className="text-base font-black text-brand tabular-nums leading-none tracking-tight">
              {formatCurrency(campaign.dealPrice)}
            </span>
            <div className="flex flex-wrap items-center justify-center gap-1.5">
              <p className="text-[11px] font-black text-zinc-muted line-through tabular-nums">
                {formatCurrency(campaign.originalPrice)}
              </p>
              {discount > 0 && (
                <span className="text-[11px] font-black text-success bg-success/10 px-1.5 py-0.5 rounded-full tabular-nums">
                  -{discount}%
                </span>
              )}
            </div>
          </div>
        );
      },
      sortable: true,
      align: 'center',
    },
    {
      key: 'endTime',
      label: t('groupBuying.end_time') || 'Ends In',
      width: 'w-[140px]',
      className: 'whitespace-nowrap',
      render: (campaign) => {
        const raw = getCountdown(campaign.endTime);
        const label = raw === 'ENDED' ? (t('TIME.ENDED') || 'ENDED') : raw;
        return (
          <div className="flex flex-col items-center gap-1">
            <div className="inline-flex items-center gap-1.5 text-xs font-black tabular-nums bg-warning/10 px-2.5 py-1 rounded-full border border-warning/20 whitespace-nowrap">
              <Clock className="w-3 h-3 shrink-0" />
              {label}
            </div>
            <span className="text-[11px] text-zinc-muted tabular-nums">
              {new Date(campaign.endTime).toLocaleDateString(dir === 'rtl' ? 'ar-EG' : 'en-US')}
            </span>
          </div>
        );
      },
      sortable: true,
      align: 'center',
    },
    {
      key: 'engagement',
      label: t('groupBuying.engagement') || 'Engagement',
      hideInCard: true,
      width: 'w-[100px]',
      className: 'whitespace-nowrap',
      render: (campaign) => (
        <div className="flex items-center justify-center gap-3">
          <div className="flex items-center gap-1" title={t('groupBuying.favorites') || 'Favorites'}>
            <Heart className="w-3 h-3 text-rose-400 shrink-0" />
            <span className="text-xs font-bold text-zinc-text tabular-nums">{campaign.favoritesCount ?? 0}</span>
          </div>
          <div className="w-px h-3 bg-white/5 shrink-0" />
          <div className="flex items-center gap-1" title={t('groupBuying.views') || 'Views'}>
            <Eye className="w-3 h-3 text-blue-400 shrink-0" />
            <span className="text-xs font-bold text-zinc-text tabular-nums">{campaign.viewCount ?? 0}</span>
          </div>
        </div>
      ),
      align: 'center',
    },
  ];

  const rowActions: Action<GroupBuying>[] = [
    {
      label: t('groupBuying.analyze_node') || 'View',
      icon: Eye,
      onClick: (campaign) => router.push(`/group-buying/${campaign.id}`),
    },
    ...(canManageGroupBuying ? [
    {
      label: t('common.edit') || 'Edit',
      icon: Edit,
      onClick: (campaign) => router.push(`/group-buying/${campaign.id}/edit`),
    },
    {
      label: (campaign) => !['completed', 'cancelled'].includes(campaign.status) ? (t('groupBuying.lifecycle.cancel') || 'Cancel') : null,
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
    ] as Action<GroupBuying>[] : []),
  ];

  if (!isClient) return null;

  return (
    <AdminListPageShell
      title={t('groupBuying.title') || 'CAMPAIGNS'}
      description={t('groupBuying.subtitle') || 'Group buying campaigns management'}
      icon={Users}
      className="p-3 md:p-6 space-y-4 md:space-y-8"
      headerActions={
        canManageGroupBuying ? (
        <Link href="/group-buying/new">
          <AmberButton className="gap-2 h-11 bg-brand hover:bg-brand text-black font-black rounded-xl shadow-sm transition-all border-none active:scale-95 px-4 md:px-8">
            <Plus className="w-5 h-5" />
            <span className="hidden md:inline">{t('groupBuying.create') || 'Create Campaign'}</span>
          </AmberButton>
        </Link>
        ) : undefined
      }
      stats={[
        { label: t('groupBuying.active_engines'), value: stats?.activeCampaigns || 0, icon: Zap, color: 'brand', description: t('groupBuying.live_distribution') || 'LIVE' },
        { label: t('groupBuying.total_conversion'), value: formatCurrency(stats?.totalRevenue), icon: TrendingUp, color: 'success', description: t('groupBuying.aggregate_yield') || 'REVENUE' },
        { label: t('groupBuying.network_reach'), value: stats?.totalParticipants || 0, icon: Users, color: 'info', description: t('groupBuying.node_participation') || 'PARTICIPANTS' },
        { label: t('groupBuying.success_delta'), value: stats?.completedCampaigns || 0, icon: CheckCircle, color: 'primary', description: t('groupBuying.concluded_nodes') || 'COMPLETED' },
      ]}
      toolbar={
        <ListPageToolbar
          search={<ListPageToolbarSearch value={searchQuery} onChange={(v) => { setSearchQuery(v); setPage(1); }} placeholder={t('groupBuying.scan_nomenclature') || 'Search campaigns...'} />}
          onFilterClick={() => setIsFilterOpen(true)}
          filterLabel={t('common.filters') || 'Filters'}
          activeFilterCount={activeFilterCount}
        />
      }
    >
      <div className="space-y-6">
        {listLoading ? (
          <ListPageSkeleton count={6} columns={4} showStats />
        ) : campaigns.length === 0 ? (
          <EmptyState
            icon={Target}
            title={t('groupBuying.operational_gap') || 'No Campaigns'}
            description={t('groupBuying.no_active_protocols') || 'No campaigns found.'}
            actionLabel={
              canManageGroupBuying
                ? (t('groupBuying.initialize_first_call') || 'Create Campaign')
                : undefined
            }
            onAction={
              canManageGroupBuying ? () => router.push('/group-buying/new') : undefined
            }
          />
        ) : (
          <div className="relative min-w-0 overflow-x-auto rounded-2xl border border-[var(--color-border)] bg-[var(--color-obsidian-card)] shadow-sm">
            {isFetching && <FetchingOverlay />}
            <DataTable
              columns={columns}
              data={campaigns}
              keyField="id"
              rowActions={rowActions}
              onRowClick={(row) => router.push(`/group-buying/${row.id}`)}
              pagination
              pageSize={limit}
              currentPage={page}
              totalItems={campaignsData?.total || campaigns.length}
              onPageChange={(newPage) => setPage(newPage)}
              showViewToggle
              viewMode={isMobile ? 'grid' : 'table'}
              gridCols={2}
              onSortChange={handleSortChange}
              sortBy={sortBy}
              sortOrder={sortOrder}
              className="border-0 shadow-none rounded-none bg-transparent"
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
          <div className="space-y-6">
            <div className="space-y-3">
              <label className="text-[11px] font-black text-zinc-muted uppercase tracking-widest">{t('groupBuying.strategy') || 'Status'}</label>
              <div className="grid grid-cols-2 gap-3">
                {['all', 'active', 'scheduled', 'completed', 'cancelled', 'draft', 'unlocked', 'expired'].map((status) => (
                  <button
                    key={status}
                    onClick={() => setStatusFilter(status)}
                    className={cn(
                      "h-11 px-4 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all border",
                      statusFilter === status
                        ? "bg-brand text-black border-brand shadow-lg"
                        : "bg-obsidian-panel text-zinc-muted border-white/5 hover:border-white/10"
                    )}
                  >
                    {status === 'all'
                      ? (t('common.all') || 'All')
                      : (t(`groupBuying.status.${status}`) || status)}
                  </button>
                ))}
              </div>
            </div>

            {(categoriesData?.categories || []).length > 0 && (
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
                      onClick={() => setCategoryIdFilter(String(cat.id))}
                      className={cn(
                        "px-3 py-2 rounded-lg text-[11px] font-black uppercase tracking-widest transition-all border",
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
    </AdminListPageShell>
  );
};

export default GroupBuyingListPage;
