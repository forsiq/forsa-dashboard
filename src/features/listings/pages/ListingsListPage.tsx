import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/router';
import {
  Package,
  Plus,
  ShoppingBag,
  Eye,
  Edit,
  Trash2,
  Gavel,
  Users,
  Zap,
  AlertTriangle,
} from 'lucide-react';
import { useLanguage } from '@core/contexts/LanguageContext';
import { cn } from '@core/lib/utils/cn';
import { useIsMobile } from '@core/hooks/useIsMobile';
import { AmberCard as Card } from '@core/components/AmberCard';
import { CardGridSkeleton } from '@core/components/Loading/AmberCardSkeleton';
import { ListPageSkeleton, FetchingOverlay } from '@core/loading';
import { AmberButton } from '@core/components/AmberButton';
import { AmberInput } from '@core/components/AmberInput';
import { AmberSlideOver } from '@core/components';
import { StatusBadge } from '@core/components/Data/StatusBadge';
import { DataTable, Column, Action } from '@core/components/Data/DataTable';
import { DataTableEntityTitle } from '@core/components/Data/DataTableEntityTitle';
import {
  AdminListPageShell,
  ListPageToolbar,
  ListPageToolbarSearch,
} from '@core/components/Layout';
import { useConfirmModal } from '@core/components/Feedback/AmberConfirmModal';
import { useDebounce } from '@core/hooks/useDebounce';
import { useFilterState } from '@core/hooks/useFilterState';
import { useGetListings, useDeleteListing } from '../api/listing-hooks';
import { EmptyState } from '@core/components/EmptyState';
import type { ProductListing } from '../../../types/services/listings.types';
import { ListingImage } from '../components/ListingImage';
import { ListingReadinessBadge } from '../components/ListingReadinessBadge';
import { analyzeProductReadiness } from '../utils/product-readiness.utils';

export const ListingsListPage: React.FC = () => {
  const { t } = useLanguage();
  const router = useRouter();
  const { isMobile } = useIsMobile();

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useFilterState('search', '');
  const debouncedSearch = useDebounce(searchQuery, 300);
  const [page, setPage] = useFilterState('page', 1);
  const [limit] = useState(12);
  const [isClient, setIsClient] = useState(false);
  const [conditionFilter, setConditionFilter] = useFilterState<string>('condition', 'all');
  const [brandFilter, setBrandFilter] = useFilterState<string>('brand', 'all');
  const [sortBy, setSortBy] = useFilterState<string>('sortBy', 'createdAt');
  const [sortOrder, setSortOrder] = useFilterState<'asc' | 'desc'>('sortOrder', 'desc');
  const [issuesOnly, setIssuesOnly] = useFilterState<string>('issuesOnly', 'false');

  useEffect(() => { setIsClient(true); }, []);

  const handleSortChange = (key: string, direction: 'asc' | 'desc') => {
    setSortBy(key);
    setSortOrder(direction);
    setPage(1);
  };

  const { data: listingsData, isPending, isFetching } = useGetListings({
    search: debouncedSearch || undefined,
    condition: conditionFilter !== 'all' ? conditionFilter : undefined,
    brand: brandFilter !== 'all' ? brandFilter : undefined,
    sortBy: sortBy as any,
    sortOrder,
    page,
    limit,
  });

  const deleteMutation = useDeleteListing();
  const { openConfirm, ConfirmModal } = useConfirmModal();

  const listings = listingsData?.data || [];
  const pagination = listingsData?.pagination;

  const filteredListings = useMemo(() => {
    if (issuesOnly !== 'true') return listings;
    return listings.filter((l) => analyzeProductReadiness(l).length > 0);
  }, [listings, issuesOnly]);

  // Compute stats from listings — prefer API aggregate counts when available
  const stats = useMemo(() => {
    const all = pagination?.total || listings.length;
    return {
      total: all,
      withAuction: listingsData?.stats?.withAuction ?? (listings.filter(l => l._auctionCount && l._auctionCount > 0).length || 0),
      withDeal: listingsData?.stats?.withDeal ?? (listings.filter(l => l._dealCount && l._dealCount > 0).length || 0),
      orphan: listingsData?.stats?.orphan ?? (listings.filter(l => !l._auctionCount && !l._dealCount).length || 0),
      withIssues: listings.filter((l) => analyzeProductReadiness(l).length > 0).length,
    };
  }, [listings, pagination, listingsData?.stats]);

  // Extract unique brands and conditions for filter
  const brands = useMemo(() => {
    const set = new Set(listings.map(l => l.brand).filter(Boolean) as string[]);
    return Array.from(set).sort();
  }, [listings]);

  const conditions = useMemo(() => {
    const set = new Set(listings.map(l => l.condition).filter(Boolean) as string[]);
    return Array.from(set).sort();
  }, [listings]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (conditionFilter !== 'all') count += 1;
    if (brandFilter !== 'all') count += 1;
    if (issuesOnly === 'true') count += 1;
    return count;
  }, [conditionFilter, brandFilter, issuesOnly]);

  // Table columns
  const columns: Column<ProductListing>[] = [
    {
      key: 'title',
      label: t('listing.table.title') || 'Title',
      cardTitle: true,
      render: (listing) => (
        <div className="flex min-w-0 items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-obsidian-outer border border-border flex items-center justify-center overflow-hidden shrink-0">
            <ListingImage listing={listing} className="w-full h-full object-cover" fallbackClassName="w-5 h-5 text-zinc-muted/40" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex min-w-0 items-center gap-2">
              <DataTableEntityTitle text={listing.title} />
              <ListingReadinessBadge listing={listing} />
            </div>
            <p className="text-[11px] font-black text-zinc-muted uppercase tracking-widest mt-0.5">
              {listing.sku || listing.brand || '—'}
            </p>
          </div>
        </div>
      ),
      sortable: true,
    },
    {
      key: 'brand',
      label: t('listing.table.brand') || 'Brand',
      render: (listing) => (
        <span className="text-[13px] font-bold text-zinc-text">
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
          <span className="font-black text-zinc-text text-sm tabular-nums">{listing._auctionCount || 0}</span>
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
          <span className="font-black text-zinc-text text-sm tabular-nums">{listing._dealCount || 0}</span>
        </div>
      ),
      align: 'center',
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
      onClick: (listing) => router.push(`/listings/${listing.id}/publish?type=auction`),
      variant: 'success',
    },
    {
      label: t('listing.detail.deploy_group_buy') || 'Deploy as Group Buy',
      icon: Users,
      onClick: (listing) => router.push(`/listings/${listing.id}/publish?type=group-buy`),
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
    <AdminListPageShell
      title={t('listing.title')}
      description={t('listing.description')}
      icon={Package}
      className="p-3 md:p-6 space-y-4 md:space-y-8"
      headerActions={
        <div className="flex flex-wrap items-center gap-3">
          <AmberButton
            variant="outline"
            className="gap-2 h-11 border-border text-zinc-text font-bold rounded-xl active:scale-95 transition-all hover:bg-obsidian-hover px-4 md:px-6"
            onClick={() => router.push('/amazon-import')}
          >
            <ShoppingBag className="w-5 h-5" />
            <span className="hidden md:inline">{t('listing.import_amazon')}</span>
          </AmberButton>
          <AmberButton
            className="gap-2 h-11 bg-brand hover:bg-brand text-black font-black rounded-xl shadow-sm transition-all border-none active:scale-95 px-4 md:px-8"
            onClick={() => router.push('/listings/new')}
          >
            <Plus className="w-5 h-5" />
            <span>{t('listing.add_product') || t('listing.create')}</span>
          </AmberButton>
        </div>
      }
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
        {
          label: t('listing.stats.with_issues') || 'With Issues',
          value: stats.withIssues,
          icon: AlertTriangle,
          color: 'warning',
          description: t('listing.readiness.title') || 'Product Readiness',
        },
      ]}
      toolbar={
        <ListPageToolbar
          search={
            <ListPageToolbarSearch
              value={searchQuery}
              onChange={(v) => { setSearchQuery(v); setPage(1); }}
              placeholder={t('listing.search') || 'Search listings...'}
            />
          }
          onFilterClick={() => setIsFilterOpen(true)}
          filterLabel={t('listing.filter')}
          activeFilterCount={activeFilterCount}
        />
      }
    >
      <div className="space-y-6">
        {isPending ? (
          <ListPageSkeleton count={6} columns={3} />
        ) : filteredListings.length === 0 ? (
          <EmptyState
            icon={Package}
            title={t('listing.empty.title') || 'No Listings'}
            description={t('listing.empty.description')}
            actionLabel={t('listing.add_product') || t('listing.empty.create') || 'Add Product'}
            onAction={() => router.push('/listings/new')}
          />
        ) : (
          <div className="bg-[var(--color-obsidian-card)] border border-[var(--color-border)] rounded-2xl shadow-sm overflow-hidden">
            <DataTable
              columns={columns}
              data={filteredListings}
              keyField="id"
              rowActions={rowActions}
              onRowClick={(row) => router.push(`/listings/${row.id}`)}
              pagination
              pageSize={limit}
              currentPage={page}
              totalItems={issuesOnly === 'true' ? filteredListings.length : (pagination?.total || 0)}
              onPageChange={(newPage) => setPage(newPage)}
              showViewToggle
              viewMode={isMobile ? 'grid' : 'table'}
              gridCols={2}
              onSortChange={handleSortChange}
              sortBy={sortBy}
              sortOrder={sortOrder}
            />
          </div>
        )}
      </div>

      <AmberSlideOver
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        title={t('listing.filter') || 'Filter Listings'}
        description={t('listing.description') || 'Refine your product listings'}
      >
        <div className="space-y-8 py-4">
          {conditions.length > 0 && (
            <div className="space-y-3">
              <label className="text-[11px] font-black text-zinc-muted uppercase tracking-widest">{t('listing.table.condition')}</label>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => { setConditionFilter('all'); setPage(1); }}
                  className={cn(
                    "px-3 py-2 rounded-lg text-[11px] font-black uppercase tracking-widest transition-all border",
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
                      "px-3 py-2 rounded-lg text-[11px] font-black uppercase tracking-widest transition-all border",
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

          <div className="space-y-3">
            <label className="text-[11px] font-black text-zinc-muted uppercase tracking-widest">
              {t('listing.filter.issues_only') || 'Issues only'}
            </label>
            <button
              type="button"
              onClick={() => {
                setIssuesOnly(issuesOnly === 'true' ? 'false' : 'true');
                setPage(1);
              }}
              className={cn(
                'w-full px-3 py-2.5 rounded-lg text-[11px] font-black uppercase tracking-widest transition-all border text-start',
                issuesOnly === 'true'
                  ? 'bg-warning/15 text-warning border-warning/30'
                  : 'bg-obsidian-panel text-zinc-muted border-white/5 hover:border-white/10',
              )}
            >
              {t('listing.filter.issues_only') || 'Show products with readiness issues'}
            </button>
          </div>

          {brands.length > 0 && (
            <div className="space-y-3">
              <label className="text-[11px] font-black text-zinc-muted uppercase tracking-widest">{t('listing.table.brand')}</label>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => { setBrandFilter('all'); setPage(1); }}
                  className={cn(
                    "px-3 py-2 rounded-lg text-[11px] font-black uppercase tracking-widest transition-all border",
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
                      "px-3 py-2 rounded-lg text-[11px] font-black uppercase tracking-widest transition-all border",
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

          <div className="space-y-3">
            <label className="text-[11px] font-black text-zinc-muted uppercase tracking-widest">
              {t('listing.readiness.title') || 'Product Readiness'}
            </label>
            <button
              type="button"
              onClick={() => {
                setIssuesOnly(issuesOnly === 'true' ? 'false' : 'true');
                setPage(1);
              }}
              className={cn(
                'w-full px-3 py-2.5 rounded-lg text-[11px] font-black uppercase tracking-widest transition-all border text-start',
                issuesOnly === 'true'
                  ? 'bg-warning/10 text-warning border-warning/20'
                  : 'bg-obsidian-panel text-zinc-muted border-white/5 hover:border-white/10',
              )}
            >
              {t('listing.filter.issues_only') || 'Show only products with issues'}
            </button>
          </div>

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
                setIssuesOnly('false');
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

export default ListingsListPage;
