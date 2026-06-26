import React, { useState, useMemo, useEffect } from 'react';
import NextImage from 'next/image';
import { useRouter } from 'next/router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AmberCard as Card } from '@core/components/AmberCard';
import { AmberButton } from '@core/components/AmberButton';
import { AmberInput } from '@core/components/AmberInput';
import { AmberDropdown } from '@core/components/AmberDropdown';
import { cn } from '@core/lib/utils/cn';
import { useLanguage } from '@core/contexts/LanguageContext';
import { formatCurrency } from '@core/lib/utils/formatCurrency';
import { useIsMobile } from '@core/hooks/useIsMobile';
import {
  Package,
  AlertCircle,
  Warehouse,
  TrendingUp,
  Search,
  Plus,
  History,
  Eye,
  Edit,
  Trash2,
  Image as ImageIcon,
  SlidersHorizontal,
  ChevronRight,
  Filter
} from 'lucide-react';
import { DataTable, Column, Action } from '@core/components/Data/DataTable';
import { StatusBadge } from '@core/components/Data/StatusBadge';
import { StatValue } from '@core/components/Data/StatValue';
import { AmberSlideOver } from '@core/components';
import { DeleteCardConfirmation } from '@core/components/Feedback/DeleteCardConfirmation';
import { useList, useStats, useDelete } from '../hooks';
import { useConfirmModal } from '@core/components/Feedback/AmberConfirmModal';
import {
  AdminListPageShell,
  ListPageToolbar,
  ListPageToolbarSearch,
} from '@core/components/Layout';
import { ListPageSkeleton, FetchingOverlay } from '@core/loading';
import { EmptyState } from '@core/components/EmptyState';
import { useDebounce } from '@core/hooks/useDebounce';
import { useFilterState } from '@core/hooks/useFilterState';
import { useAttachmentUrls } from '@core/hooks/useAttachmentUrls';

interface ProductRow {
  id: string;
  name: string;
  sku: string;
  category: string;
  price: number;
  stock: number;
  warehouse: string;
  lastUpdated: string;
  image: string;
  images: string[];
  mainAttachmentId?: number | null;
  attachmentIds?: number[];
}

const ProductListImage: React.FC<{ product: ProductRow }> = ({ product }) => {
  const directUrl = product.image || (product.images?.length > 0 ? product.images[0] : null);
  const ids = product.attachmentIds?.length ? product.attachmentIds : [];
  const { data: urlMap } = useAttachmentUrls(!directUrl && ids.length > 0 ? ids : []);

  const src = directUrl || (urlMap && ids[0] ? urlMap.get(ids[0]) : null) || '';

  return (
    <div className="w-12 h-12 bg-[var(--color-obsidian-card)] border border-[var(--color-border)] rounded-xl flex items-center justify-center overflow-hidden shrink-0">
      {src ? (
        <NextImage src={src} alt="" width={48} height={48} className="w-full h-full object-cover" />
      ) : (
        <ImageIcon className="w-5 h-5 text-zinc-muted" />
      )}
    </div>
  );
};

export const InventoryPage = () => {
  const { t, dir } = useLanguage();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { isMobile } = useIsMobile();
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useFilterState('search', '');
  const debouncedSearch = useDebounce(searchQuery, 300);
  const [statusFilter, setStatusFilter] = useFilterState('status', 'all');
  const [categoryFilter, setCategoryFilter] = useFilterState('category', 'all');
  const [sortBy, setSortBy] = useFilterState<string>('sortBy', 'name');
  const [sortOrder, setSortOrder] = useFilterState<'asc' | 'desc'>('sortOrder', 'asc');
  const [page, setPage] = useFilterState('page', 1);
  const [limit] = useState(10);
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; id: string | null }>({
    isOpen: false,
    id: null
  });
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const isRTL = dir === 'rtl';

  const { data: inventoryData, isLoading, isFetching } = useList();
  const { data: statsData } = useStats();

  const products: any[] = (inventoryData as any)?.data || [];
  const inventoryStats = statsData || {};

  const data = useMemo(() => {
    return products.map((p: any) => ({
      id: String(p.id),
      name: p.listing?.title || p.name || p.title || '',
      sku: p.sku || '',
      category: p.listing?.brand || p.category?.name || p.category || '',
      price: Number(p.sellingPrice ?? p.costPrice ?? p.price ?? 0),
      stock: Number(p.stockQuantity ?? p.stock ?? 0),
      stockStatus: p.stockStatus || 'in_stock',
      isActive: p.isActive ?? true,
      warehouse: t('inventory.default_warehouse') || 'Primary',
      lastUpdated: p.updatedAt || p.updated_at || '',
      image: p.listing?.imageUrl || p.image_url || p.image || (p.listing?.images?.[0]) || (p.images?.[0]) || '',
      images: p.listing?.images || p.images || [],
      mainAttachmentId: p.listing?.mainAttachmentId || p.mainAttachmentId || p.main_attachment_id || null,
      attachmentIds: p.listing?.attachmentIds || p.attachmentIds || p.attachment_ids || [],
    }));
  }, [products, t]);

  const uniqueCategories = useMemo(() => {
    const cats = new Set(data.map(p => p.category).filter(Boolean));
    return Array.from(cats);
  }, [data]);

  const filteredData = useMemo(() => {
    return data.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
                           p.sku.toLowerCase().includes(debouncedSearch.toLowerCase());
      const matchesStatus = statusFilter === 'all' ||
                           (statusFilter === 'in_stock' && p.stockStatus === 'in_stock') ||
                           (statusFilter === 'low_stock' && p.stockStatus === 'low_stock') ||
                           (statusFilter === 'out_of_stock' && (p.stockStatus === 'out_of_stock' || p.stock === 0));
      const matchesCategory = categoryFilter === 'all' || p.category === categoryFilter;

      return matchesSearch && matchesStatus && matchesCategory;
    }).sort((a, b) => {
      const aVal = (a as any)[sortBy];
      const bVal = (b as any)[sortBy];
      if (aVal == null) return 1;
      if (bVal == null) return -1;
      const cmp = typeof aVal === 'string' ? aVal.localeCompare(bVal) : aVal - bVal;
      return sortOrder === 'asc' ? cmp : -cmp;
    });
  }, [data, debouncedSearch, statusFilter, categoryFilter, sortBy, sortOrder]);

  const lowStockAlerts = useMemo(() => {
    return data.filter(p => p.stockStatus === 'low_stock' || (p.stock <= 5 && p.stock > 0 && !p.stockStatus));
  }, [data]);

  const totalValue = useMemo(() => {
    return data.reduce((sum, p) => sum + (p.price * p.stock), 0);
  }, [data]);

  const activeFilterCount = (statusFilter !== 'all' ? 1 : 0) + (categoryFilter !== 'all' ? 1 : 0);

  const handleSortChange = (key: string, direction: 'asc' | 'desc') => {
    setSortBy(key);
    setSortOrder(direction);
    setPage(1);
  };

  const { openConfirm } = useConfirmModal();
  const deleteProduct = useDelete();

  const bulkActions = [
    {
      label: t('inventory.bulk_delete') || 'Delete Selected',
      icon: Trash2,
      variant: 'danger' as const,
      onClick: (selectedIds: string[]) => {
        openConfirm({
          title: t('inventory.bulk_delete') || 'Delete Selected',
          message: `${t('inventory.bulk_delete_confirm') || 'Are you sure you want to delete'} ${selectedIds.length} ${t('inventory.items') || 'items'}?`,
          variant: 'destructive',
          onConfirm: () => {
            selectedIds.forEach(id => {
              deleteProduct.mutate(id);
            });
          },
        });
      },
    },
  ];

  const columns: Column<any>[] = [
    {
      key: 'item',
      label: t('inventory.table.item'),
      cardTitle: true,
      cardMedia: true,
      render: (row) => (
        <div className="flex items-center gap-4">
          <ProductListImage product={row} />
          <div className="space-y-0.5">
            <p className="text-sm font-bold text-zinc-text">
              {row.name}
            </p>
            <p className="text-xs font-medium text-zinc-secondary">{row.sku}</p>
          </div>
        </div>
      ),
      sortable: true,
      width: '30%'
    },
    {
      key: 'category',
      label: t('inventory.table.category'),
      cardBadge: true,
      render: (row) => (
        <span className="text-sm font-medium text-zinc-secondary">
          {row.category}
        </span>
      ),
      sortable: true,
      align: 'center',
    },
    {
      key: 'stock',
      label: t('inventory.stock_level'),
      render: (row) => (
        <div className="flex items-center gap-3">
          <span className="text-sm font-bold text-zinc-text">{row.stock}</span>
          <div className="flex-1 max-w-[80px] h-1.5 bg-black/10 dark:bg-white/5 rounded-full overflow-hidden">
            <div
              className={cn(
                "h-full rounded-full transition-all",
                row.stock > 10 ? "bg-[var(--color-success)]" : row.stock > 0 ? "bg-[var(--color-warning)]" : "bg-[var(--color-danger)]"
              )}
              style={{ width: `${Math.min((row.stock / 50) * 100, 100)}%` }}
            />
          </div>
        </div>
      ),
      sortable: true,
      align: 'center',
    },
    {
      key: 'status',
      label: t('common.status'),
      cardBadge: true,
      render: (row) => (
        <StatusBadge
          status={row.stockStatus === 'in_stock' ? (t('inventory.stock_in_stock') || 'In Stock') : row.stockStatus === 'low_stock' ? (t('inventory.stock_low') || 'Low') : row.stockStatus === 'discontinued' ? (t('inventory.status.discontinued') || 'Discontinued') : (t('inventory.stock_out') || 'Out')}
          variant={row.stockStatus === 'in_stock' ? 'success' : row.stockStatus === 'low_stock' ? 'warning' : 'failed'}
          size="sm"
        />
      ),
      sortable: true,
      align: 'center',
    },
    {
      key: 'warehouse',
      label: t('inventory.table.warehouse'),
      hideInCard: true,
      render: (row) => (
        <span className="text-sm font-medium text-zinc-muted">
          {row.warehouse}
        </span>
      ),
      sortable: true,
      align: 'center',
    },
  ];

  const rowActions: Action<any>[] = [
    {
      label: t('common.view') || 'View Details',
      icon: Eye,
      onClick: (row) => router.push(`/inventory/${row.id}`),
    },
    {
      label: t('common.edit') || 'Edit',
      icon: Edit,
      onClick: (row) => router.push(`/inventory/edit/${row.id}`),
    },
    {
      label: t('common.delete') || 'Delete',
      icon: Trash2,
      variant: 'danger',
      onClick: (row) => setDeleteModal({ isOpen: true, id: row.id }),
    },
  ];

  const hasInventory = data.length > 0;

  const sidebarPanel = (
    <>
      {/* Real-time Alerts */}
      <Card className="!p-4 md:!p-6 bg-[var(--color-obsidian-card)] border border-[var(--color-border)] relative overflow-hidden rounded-2xl shadow-sm min-w-0">
        <div className={cn("absolute top-0 bottom-0 w-1 bg-[var(--color-danger)]", isRTL ? "end-0" : "start-0")} />
        <div className="flex items-center justify-between gap-3 mb-4 md:mb-6">
          <h3 className="text-sm font-black text-zinc-text uppercase tracking-widest flex items-center gap-3 min-w-0">
            <AlertCircle className="w-5 h-5 shrink-0 text-[var(--color-danger)] animate-pulse" />
            <span className="truncate">{t('inventory.alerts')}</span>
          </h3>
          <span className="text-xs font-black text-white bg-[var(--color-danger)] px-2.5 py-1 rounded-full shadow-lg shrink-0 tabular-nums">
            {lowStockAlerts.length}
          </span>
        </div>

        <div className="space-y-4 max-h-[320px] overflow-y-auto custom-scrollbar">
          {lowStockAlerts.length > 0 ? (
            lowStockAlerts.map((alert, i) => (
              <div key={i} className="group p-4 bg-[var(--color-obsidian-hover)]/30 border border-[var(--color-border)] rounded-xl hover:border-[var(--color-danger)]/30 transition-all cursor-pointer">
                <div className="flex items-center justify-between gap-2 mb-2">
                   <p className="text-[13px] font-bold text-zinc-text uppercase tracking-tight break-words min-w-0 flex-1">
                    {alert.name}
                  </p>
                  <StatusBadge status="LOW" variant="warning" size="sm" />
                </div>
                <div className="flex items-center justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="h-1.5 bg-obsidian-outer rounded-full overflow-hidden mb-2">
                      <div className="h-full bg-[var(--color-danger)]" style={{ width: `${(alert.stock / 5) * 100}%` }} />
                    </div>
                    <p className="text-[11px] font-black text-zinc-muted uppercase tracking-widest">
                      {alert.stock} / 5 {t('inventory.units') || 'units'}
                    </p>
                  </div>
                  <ChevronRight className={cn("w-4 h-4 shrink-0 text-zinc-muted opacity-0 group-hover:opacity-100 transition-all", isRTL && "rotate-180")} />
                </div>
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center space-y-2">
              <Package className="w-10 h-10 text-zinc-muted/30 stroke-1" />
              <p className="text-xs font-semibold text-zinc-muted leading-relaxed max-w-[240px]">
                {t('inventory.all_stocks_nominal') || 'All stocks within nominal parameters'}
              </p>
            </div>
          )}
        </div>
      </Card>

      {/* Stats Summary */}
      <Card className="!p-4 md:!p-6 bg-[var(--color-obsidian-card)] border border-[var(--color-border)] rounded-2xl shadow-sm min-w-0">
        <div className="flex items-center gap-3 mb-4 md:mb-6">
          <TrendingUp className="w-5 h-5 shrink-0 text-[var(--color-success)]" />
          <h3 className="text-sm font-black text-zinc-text uppercase tracking-widest">
            {t('inventory.total_value')}
          </h3>
        </div>
        <StatValue value={formatCurrency(totalValue)} className="!text-success" />
        <p className="text-xs text-zinc-muted mt-2 tabular-nums">
          {data.length} {t('inventory.items')}
        </p>
      </Card>
    </>
  );

  if (!isClient) return null;

  return (
    <AdminListPageShell
      title={t('inventory.overview')}
      description={t('inventory.overview_subtitle')}
      icon={Package}
      className="p-3 md:p-6 space-y-4 md:space-y-8"
      headerActions={
        <div className="flex flex-wrap items-center gap-2 md:gap-3">
          <AmberButton className="gap-2 px-4 md:px-6 h-11 bg-[var(--color-brand)] hover:bg-[var(--color-brand)] text-black font-bold rounded-xl shadow-sm transition-all border-none active:scale-95" onClick={() => router.push('/inventory/new')}>
              <Plus className="w-5 h-5 shrink-0" />
              <span>{t('inventory.add_item')}</span>
          </AmberButton>
          <AmberButton variant="outline" className="gap-2 px-4 md:px-6 h-11 border-[var(--color-border)] text-zinc-text font-bold rounded-xl active:scale-95 transition-all hover:bg-[var(--color-obsidian-hover)]">
            <History className="w-4 h-4 shrink-0" />
            {t('inventory.transactions')}
          </AmberButton>
        </div>
      }
      statsColumns={2}
      stats={[
        { label: t('inventory.total_items'), value: data.length, icon: Package, color: 'brand' },
        { label: t('inventory.low_stock'), value: lowStockAlerts.length, icon: AlertCircle, color: 'danger', description: t('inventory.needs_review') },
        { label: t('inventory.warehouses'), value: '1', icon: Warehouse, color: 'info', description: t('inventory.global_dist') },
        { label: t('inventory.total_value'), value: formatCurrency(totalValue), icon: TrendingUp, color: 'success' },
      ]}
      toolbar={
        <ListPageToolbar
          search={<ListPageToolbarSearch value={searchQuery} onChange={(v) => { setSearchQuery(v); setPage(1); }} placeholder={t('inventory.search') || 'Search inventory...'} />}
          onFilterClick={() => setIsFilterOpen(true)}
          filterLabel={t('common.filters') || 'Filters'}
          activeFilterCount={activeFilterCount}
        />
      }
    >
      {!hasInventory && !isLoading ? (
        <div className="space-y-4 md:space-y-6 min-w-0">
          <EmptyState
            icon={Package}
            title={t('inventory.empty') || 'No Items'}
            description={t('inventory.empty_description') || 'No inventory items found.'}
            actionLabel={t('inventory.add_item') || 'Add Item'}
            onAction={() => router.push('/inventory/new')}
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 min-w-0">
            {sidebarPanel}
          </div>
        </div>
      ) : (
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 md:gap-6 min-w-0">
        {/* Main Table Area */}
        <div className="xl:col-span-2 space-y-4 min-w-0 order-2 xl:order-1">
          {isLoading ? (
            <ListPageSkeleton count={10} columns={4} showStats />
          ) : filteredData.length === 0 ? (
            <EmptyState
              icon={Package}
              title={t('inventory.empty') || 'No Items'}
              description={t('inventory.empty_description') || 'No inventory items found.'}
              actionLabel={t('inventory.add_item') || 'Add Item'}
              onAction={() => router.push('/inventory/new')}
            />
          ) : (
            <div className="relative bg-[var(--color-obsidian-card)] border border-[var(--color-border)] rounded-2xl shadow-sm overflow-hidden min-w-0">
              {isFetching && <FetchingOverlay />}
              <DataTable
                columns={columns}
                data={filteredData}
                pagination
                pageSize={limit}
                currentPage={page}
                totalItems={filteredData.length}
                onPageChange={(newPage) => setPage(newPage)}
                selectable
                bulkActions={bulkActions}
                rowActions={rowActions}
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

        {/* Sidebar Status Info */}
        <div className="space-y-4 md:space-y-6 min-w-0 order-1 xl:order-2">
          {sidebarPanel}
        </div>
      </div>
      )}

      {/* Filter SlideOver */}
      <AmberSlideOver
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        title={t('inventory.filters')}
        description={t('inventory.filter_description')}
        footer={
          <div className="flex gap-3 w-full">
            <AmberButton
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={() => {
                setStatusFilter('all');
                setCategoryFilter('all');
                setSearchQuery('');
              }}
            >
              {t('common.clear')}
            </AmberButton>
            <AmberButton
              size="sm"
              className="flex-1"
              onClick={() => setIsFilterOpen(false)}
            >
              {t('common.done')}
            </AmberButton>
          </div>
        }
      >
        <div className="space-y-8">
          <div className="space-y-3">
              <label className="text-[11px] font-black text-zinc-muted uppercase tracking-widest">{t('common.status')}</label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { value: 'all', label: t('common.all') || 'All' },
                  { value: 'in_stock', label: t('inventory.stock_in_stock') || 'In Stock' },
                  { value: 'low_stock', label: t('inventory.stock_low') || 'Low Stock' },
                  { value: 'out_of_stock', label: t('inventory.stock_out') || 'Out of Stock' },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setStatusFilter(opt.value)}
                    className={cn(
                      "h-11 px-4 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all border",
                      statusFilter === opt.value
                        ? "bg-brand text-black border-brand shadow-lg"
                        : "bg-obsidian-panel text-zinc-muted border-white/5 hover:border-white/10"
                    )}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {uniqueCategories.length > 0 && (
              <div className="space-y-3">
                <label className="text-[11px] font-black text-zinc-muted uppercase tracking-widest">{t('inventory.table.category')}</label>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setCategoryFilter('all')}
                    className={cn(
                      "px-3 py-2 rounded-lg text-[11px] font-black uppercase tracking-widest transition-all border",
                      categoryFilter === 'all'
                        ? "bg-brand text-black border-brand"
                        : "bg-obsidian-panel text-zinc-muted border-white/5 hover:border-white/10"
                    )}
                  >
                    {t('common.all') || 'All'}
                  </button>
                  {uniqueCategories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setCategoryFilter(cat)}
                      className={cn(
                        "px-3 py-2 rounded-lg text-[11px] font-black uppercase tracking-widest transition-all border",
                        categoryFilter === cat
                          ? "bg-brand text-black border-brand"
                          : "bg-obsidian-panel text-zinc-muted border-white/5 hover:border-white/10"
                      )}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
            )}

          <div className="pt-8 space-y-3">
            <AmberButton className="w-full h-12 bg-zinc-text text-black font-black uppercase tracking-widest active:scale-95 transition-all" onClick={() => setIsFilterOpen(false)}>
              {t('common.done') || 'Apply'}
            </AmberButton>
            <AmberButton
              variant="secondary"
              className="w-full h-12 font-black uppercase tracking-widest border border-white/5 active:scale-95 transition-all"
              onClick={() => {
                setStatusFilter('all');
                setCategoryFilter('all');
                setSearchQuery('');
                setIsFilterOpen(false);
              }}
            >
              {t('common.reset') || 'Reset'}
            </AmberButton>
          </div>
        </div>
      </AmberSlideOver>

      {/* Delete Confirmation */}
      <DeleteCardConfirmation
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, id: null })}
        onConfirm={() => {
          if (deleteModal.id) {
            queryClient.invalidateQueries({ queryKey: ['inventory'] });
            setDeleteModal({ isOpen: false, id: null });
          }
        }}
        title={t('inventory.delete_title')}
        message={t('inventory.delete_message')}
      />
    </AdminListPageShell>
  );
};
