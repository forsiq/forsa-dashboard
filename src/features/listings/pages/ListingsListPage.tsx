import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/router';
import {
  Package,
  Plus,
  Search,
  SlidersHorizontal,
  Eye,
  Edit,
  Trash2,
  Gavel,
  Users,
  Layers,
  Zap,
  Rocket,
  X,
} from 'lucide-react';
import { useLanguage } from '@core/contexts/LanguageContext';
import { cn } from '@core/lib/utils/cn';
import { AmberCard as Card } from '@core/components/AmberCard';
import { CardGridSkeleton } from '@core/components/Loading/AmberCardSkeleton';
import { AmberButton } from '@core/components/AmberButton';
import { AmberInput } from '@core/components/AmberInput';
import { AmberSlideOver } from '@core/components';
import { StatusBadge } from '@core/components/Data/StatusBadge';
import { DataTable, Column, Action } from '@core/components/Data/DataTable';
import { DataTableEntityTitle } from '@core/components/Data/DataTableEntityTitle';
import { StatsGrid } from '@core/components/Layout/StatsGrid';
import { useConfirmModal } from '@core/components/Feedback/AmberConfirmModal';
import { useDebounce } from '@core/hooks/useDebounce';
import { useGetListings, useDeleteListing } from '../api/listing-hooks';
import { QuickAddListingModal } from '../components/QuickAddListingModal';
import { QuickDeployModal } from '../components/QuickDeployModal';
import type { ProductListing } from '../../../types/services/listings.types';
import { getListingPrimaryImageUrl } from '../utils/listing-media';

export const ListingsListPage: React.FC = () => {
  const { t, dir } = useLanguage();
  const router = useRouter();
  const isRTL = dir === 'rtl';

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 300);
  const [page, setPage] = useState(1);
  const [limit] = useState(12);
  const [isClient, setIsClient] = useState(false);
  const [conditionFilter, setConditionFilter] = useState<string>('all');
  const [brandFilter, setBrandFilter] = useState<string>('all');

  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [justCreatedListing, setJustCreatedListing] = useState<ProductListing | null>(null);
  const [isQuickDeployOpen, setIsQuickDeployOpen] = useState(false);
  const [quickDeployType, setQuickDeployType] = useState<'auction' | 'group-buy'>('auction');

  useEffect(() => { setIsClient(true); }, []);

  const handleQuickAddSuccess = (listing: ProductListing) => {
    setJustCreatedListing(listing);
  };

  const handleDeployFromBanner = (type: 'auction' | 'group-buy') => {
    setQuickDeployType(type);
    setIsQuickDeployOpen(true);
  };

  const { data: listingsData, isLoading } = useGetListings({
    search: debouncedSearch || undefined,
    condition: conditionFilter !== 'all' ? conditionFilter : undefined,
    brand: brandFilter !== 'all' ? brandFilter : undefined,
    sortBy: 'createdAt',
    sortOrder: 'desc',
    page,
    limit,
  });

  const deleteMutation = useDeleteListing();
  const { openConfirm, ConfirmModal } = useConfirmModal();

  const listings = listingsData?.data || [];
  const pagination = listingsData?.pagination;

  // Compute stats from listings
  const stats = useMemo(() => {
    const all = pagination?.total || listings.length;
    return {
      total: all,
      withAuction: listings.filter(l => (l as any)._auctionCount > 0).length || 0,
      withDeal: listings.filter(l => (l as any)._dealCount > 0).length || 0,
      orphan: listings.filter(l => !(l as any)._auctionCount && !(l as any)._dealCount).length || 0,
    };
  }, [listings, pagination]);

  // Extract unique brands and conditions for filter
  const brands = useMemo(() => {
    const set = new Set(listings.map(l => l.brand).filter(Boolean) as string[]);
    return Array.from(set).sort();
  }, [listings]);

  const conditions = useMemo(() => {
    const set = new Set(listings.map(l => l.condition).filter(Boolean) as string[]);
    return Array.from(set).sort();
  }, [listings]);

  // Table columns
  const columns: Column<ProductListing>[] = [
    {
      key: 'title',
      label: t('listing.table.title') || 'Title',
      cardTitle: true,
      render: (listing) => {
        const thumb = getListingPrimaryImageUrl(listing);
        return (
        <div className="flex min-w-0 items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-obsidian-outer border border-border flex items-center justify-center overflow-hidden shrink-0">
            {thumb ? (
              <img src={thumb} alt={listing.title} className="w-full h-full object-cover" />
            ) : (
              <Package className="w-5 h-5 text-zinc-muted/40" />
            )}
          </div>
          <div className="min-w-0">
            <DataTableEntityTitle text={listing.title} />
            <p className="text-[10px] font-black text-zinc-muted uppercase tracking-widest mt-0.5">
              {listing.sku || listing.brand || '—'}
            </p>
          </div>
        </div>
        );
      },
      sortable: true,
    },
    {
      key: 'brand',
      label: t('listing.table.brand') || 'Brand',
      render: (listing) => (
        <span className="text-xs font-bold text-zinc-text">
          {listing.brand ? `${listing.brand}${listing.model ? ` ${listing.model}` : ''}` : '—'}
        </span>
      ),
      sortable: true,
      align: 'center',
    },
    {
      key: 'condition',
      label: t('listing.table.condition') || 'Condition',
      cardBadge: true,
      render: (listing) => (
        listing.condition ? (
          <StatusBadge
            status={listing.condition}
            variant={listing.condition === 'new' ? 'success' : listing.condition === 'used' ? 'warning' : 'info'}
            size="sm"
          />
        ) : (
          <span className="text-xs text-zinc-muted">—</span>
        )
      ),
      align: 'center',
    },
    {
      key: 'metadata',
      label: t('listing.table.auction_count') || 'Auctions',
      render: (listing) => (
        <div className="flex items-center justify-center gap-1.5">
          <Gavel className="w-3.5 h-3.5 text-brand" />
          <span className="font-black text-zinc-text text-sm tabular-nums">{(listing as any)._auctionCount || 0}</span>
        </div>
      ),
      align: 'center',
    },
    {
      key: 'metadata2',
      label: t('listing.table.deal_count') || 'Deals',
      render: (listing) => (
        <div className="flex items-center justify-center gap-1.5">
          <Users className="w-3.5 h-3.5 text-info" />
          <span className="font-black text-zinc-text text-sm tabular-nums">{(listing as any)._dealCount || 0}</span>
        </div>
      ),
      align: 'center',
    },
    {
      key: 'actions',
      label: t('listing.table.actions') || 'Actions',
      render: () => null,
      align: 'right',
    },
  ];

  const rowActions: Action<ProductListing>[] = [
    {
      label: t('listing.view') || 'View',
      icon: Eye,
      onClick: (listing) => router.push(`/listings/${listing.id}`),
    },
    {
      label: t('common.edit') || 'Edit',
      icon: Edit,
      onClick: (listing) => router.push(`/listings/${listing.id}/edit`),
    },
    {
      label: t('listing.detail.deploy_auction') || 'Deploy as Auction',
      icon: Gavel,
      onClick: (listing) => router.push(`/listings/${listing.id}/deploy?type=auction`),
      variant: 'success',
    },
    {
      label: t('listing.detail.deploy_group_buy') || 'Deploy as Group Buy',
      icon: Users,
      onClick: (listing) => router.push(`/listings/${listing.id}/deploy?type=group-buy`),
    },
    {
      label: t('common.delete') || 'Delete',
      icon: Trash2,
      variant: 'danger',
      onClick: (listing) => openConfirm({
        title: t('listing.delete') || 'Delete Listing',
        message: t('listing.delete_confirm') || 'Are you sure?',
        onConfirm: () => deleteMutation.mutate(listing.id),
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
              <Package className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-4xl font-black text-zinc-text tracking-tighter leading-none uppercase">
                {t('listing.title')}
              </h1>
              <p className="text-base text-zinc-secondary font-bold tracking-tight uppercase mt-1">
                {t('listing.description')}
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
            {t('listing.filter')}
          </AmberButton>
          <AmberButton className="gap-2 h-11 bg-brand hover:bg-brand text-black font-black rounded-xl shadow-sm transition-all border-none active:scale-95 px-8" onClick={() => setIsQuickAddOpen(true)}>
              <Plus className="w-5 h-5" />
              <span>{t('listing.add_product') || t('listing.create')}</span>
          </AmberButton>
        </div>
      </div>

      {/* Deploy Banner - shows after product creation */}
      {justCreatedListing && (
        <div className="p-4 rounded-2xl bg-brand/[0.05] border border-brand/20 flex flex-col sm:flex-row items-start sm:items-center gap-4 animate-in fade-in slide-in-from-top-2 duration-500">
          <div className="w-10 h-10 rounded-xl bg-brand/10 flex items-center justify-center shrink-0">
            <Rocket className="w-5 h-5 text-brand" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-black text-zinc-text">
              {t('listing.created_success') || 'Product added successfully!'}
            </p>
            <p className="text-xs text-zinc-muted font-bold truncate">{justCreatedListing.title}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <AmberButton
              className="h-9 bg-brand text-black font-black rounded-lg px-4 gap-1.5 border-none active:scale-95 transition-all text-xs"
              onClick={() => handleDeployFromBanner('auction')}
            >
              <Gavel className="w-3.5 h-3.5" />
              {t('listing.detail.deploy_auction') || 'Deploy as Auction'}
            </AmberButton>
            <AmberButton
              className="h-9 bg-info text-white font-black rounded-lg px-4 gap-1.5 border-none active:scale-95 transition-all text-xs"
              onClick={() => handleDeployFromBanner('group-buy')}
            >
              <Users className="w-3.5 h-3.5" />
              {t('listing.detail.deploy_group_buy') || 'Deploy as Group Buy'}
            </AmberButton>
          </div>
          <button
            onClick={() => setJustCreatedListing(null)}
            className="p-1 rounded-lg hover:bg-white/5 transition-colors"
          >
            <X className="w-4 h-4 text-zinc-muted" />
          </button>
        </div>
      )}

      {/* Stats Grid */}
      <StatsGrid
        stats={[
          {
            label: t('listing.stats.total') || 'Total Listings',
            value: stats.total,
            icon: Package,
            color: 'brand',
            description: t('listing.title') || 'Product Listings',
          },
          {
            label: t('listing.stats.with_auction') || 'With Auctions',
            value: stats.withAuction,
            icon: Gavel,
            color: 'success',
            description: t('listing.detail.deploy_auction') || 'Deployed',
          },
          {
            label: t('listing.stats.with_deal') || 'With Deals',
            value: stats.withDeal,
            icon: Users,
            color: 'info',
            description: t('listing.detail.deploy_group_buy') || 'Group Deals',
          },
          {
            label: t('listing.stats.orphan') || 'Not Deployed',
            value: stats.orphan,
            icon: Zap,
            color: 'warning',
            description: t('listing.stats.orphan') || 'Draft',
          },
        ]}
      />

      {/* Search + Table */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-black text-zinc-muted uppercase tracking-[0.25em] flex items-center gap-2">
            <Layers className="w-4 h-4" /> {t('listing.title')}
          </h2>
          <div className="relative group min-w-[320px]">
            <Search className="absolute top-1/2 -translate-y-1/2 start-4 w-4 h-4 text-zinc-muted/50 group-focus-within:text-brand transition-colors" />
            <AmberInput
              placeholder={t('listing.search') || 'Search listings...'}
              className="h-11 bg-obsidian-card border-border text-xs font-bold ps-11 pe-4"
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
            />
          </div>
        </div>

        {isLoading ? (
          <CardGridSkeleton count={6} columns={3} />
        ) : listings.length === 0 ? (
          <Card className="!p-24 text-center space-y-6 bg-obsidian-card/40">
            <div className="w-20 h-20 rounded-full bg-white/[0.02] flex items-center justify-center mx-auto border border-white/[0.05]">
              <Package className="w-10 h-10 text-zinc-muted/30" />
            </div>
            <div className="max-w-md mx-auto space-y-2">
              <h3 className="text-xl font-black text-zinc-text uppercase tracking-widest">{t('listing.empty.title')}</h3>
              <p className="text-sm text-zinc-muted font-bold tracking-tight">{t('listing.empty.description')}</p>
            </div>
            <AmberButton className="h-11 px-8 rounded-xl bg-brand text-black font-black uppercase active:scale-95 transition-all" onClick={() => setIsQuickAddOpen(true)}>
                {t('listing.add_product') || t('listing.empty.create')}
            </AmberButton>
          </Card>
        ) : (
          <div className="bg-[var(--color-obsidian-card)] border border-[var(--color-border)] rounded-2xl shadow-sm overflow-hidden">
            <DataTable
              columns={columns}
              data={listings}
              keyField="id"
              rowActions={rowActions}
              onRowClick={(row) => router.push(`/listings/${row.id}`)}
              pagination
              pageSize={limit}
              currentPage={page}
              totalItems={pagination?.total || 0}
              onPageChange={(newPage) => setPage(newPage)}
              showViewToggle
            />
          </div>
        )}
      </div>

      {/* Filter SlideOver */}
      <AmberSlideOver
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        title={t('listing.filter') || 'Filter Listings'}
        description={t('listing.description') || 'Refine your product listings'}
      >
        <div className="space-y-8 py-4">
          <div className="space-y-3">
            <label className="text-[10px] font-black text-zinc-muted uppercase tracking-widest">{t('listing.search')}</label>
            <AmberInput
              placeholder={t('listing.search')}
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
              className="h-12"
            />
          </div>

          <div className="h-px bg-white/5" />

          {conditions.length > 0 && (
            <div className="space-y-3">
              <label className="text-[10px] font-black text-zinc-muted uppercase tracking-widest">{t('listing.table.condition')}</label>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => { setConditionFilter('all'); setPage(1); }}
                  className={cn(
                    "px-3 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all border",
                    conditionFilter === 'all'
                      ? "bg-brand text-black border-brand"
                      : "bg-obsidian-panel text-zinc-muted border-white/5 hover:border-white/10"
                  )}
                >
                  {t('common.all') || 'All'}
                </button>
                {conditions.map((cond) => (
                  <button
                    key={cond}
                    onClick={() => { setConditionFilter(cond); setPage(1); }}
                    className={cn(
                      "px-3 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all border",
                      conditionFilter === cond
                        ? "bg-brand text-black border-brand"
                        : "bg-obsidian-panel text-zinc-muted border-white/5 hover:border-white/10"
                    )}
                  >
                    {cond}
                  </button>
                ))}
              </div>
            </div>
          )}

          {brands.length > 0 && (
            <div className="space-y-3">
              <label className="text-[10px] font-black text-zinc-muted uppercase tracking-widest">{t('listing.table.brand')}</label>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => { setBrandFilter('all'); setPage(1); }}
                  className={cn(
                    "px-3 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all border",
                    brandFilter === 'all'
                      ? "bg-brand text-black border-brand"
                      : "bg-obsidian-panel text-zinc-muted border-white/5 hover:border-white/10"
                  )}
                >
                  {t('common.all') || 'All'}
                </button>
                {brands.map((brand) => (
                  <button
                    key={brand}
                    onClick={() => { setBrandFilter(brand); setPage(1); }}
                    className={cn(
                      "px-3 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all border",
                      brandFilter === brand
                        ? "bg-brand text-black border-brand"
                        : "bg-obsidian-panel text-zinc-muted border-white/5 hover:border-white/10"
                    )}
                  >
                    {brand}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="pt-8 space-y-3">
            <AmberButton className="w-full h-12 bg-zinc-text text-black font-black uppercase tracking-widest active:scale-95 transition-all" onClick={() => setIsFilterOpen(false)}>
              {t('common.apply') || 'Apply'}
            </AmberButton>
            <AmberButton
              variant="secondary"
              className="w-full h-12 font-black uppercase tracking-widest border border-white/5 active:scale-95 transition-all"
              onClick={() => {
                setSearchQuery('');
                setConditionFilter('all');
                setBrandFilter('all');
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

      {/* Quick Add Product Modal */}
      <QuickAddListingModal
        isOpen={isQuickAddOpen}
        onClose={() => setIsQuickAddOpen(false)}
        onSuccess={handleQuickAddSuccess}
      />

      {/* Quick Deploy Modal */}
      <QuickDeployModal
        isOpen={isQuickDeployOpen}
        onClose={() => {
          setIsQuickDeployOpen(false);
          setJustCreatedListing(null);
        }}
        listing={justCreatedListing}
        initialType={quickDeployType}
      />
    </div>
  );
};

export default ListingsListPage;
