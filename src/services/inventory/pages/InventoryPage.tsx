import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AmberCard as Card } from '@core/components/AmberCard';
import { AmberButton } from '@core/components/AmberButton';
import { AmberInput } from '@core/components/AmberInput';
import { AmberDropdown } from '@core/components/AmberDropdown';
import { cn } from '@core/lib/utils/cn';
import { useLanguage } from '@core/contexts/LanguageContext';
import { formatCurrency } from '@core/lib/utils/formatCurrency';
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
import { StatsGrid } from '@core/components/Layout/StatsGrid';
import { AmberSlideOver } from '@core/components/Feedback/AmberSlideOver';
import { DeleteCardConfirmation } from '@core/components/Feedback/DeleteCardConfirmation';
import { useList, useStats } from '../hooks';

export const InventoryPage = () => {
  const { t, dir } = useLanguage();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; id: string | null }>({
    isOpen: false,
    id: null
  });
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const isRTL = dir === 'rtl';

  const { data: inventoryData, isLoading } = useList();
  const { data: statsData } = useStats();

  const products: any[] = (inventoryData as any)?.items || [];
  const inventoryStats = (statsData as any)?.data || {};

  const data = useMemo(() => {
    return products.map((p: any) => ({
      id: String(p.id),
      name: p.name || p.title || '',
      sku: p.sku || '',
      category: p.category?.name || p.category || '',
      price: parseFloat(p.price) || 0,
      stock: p.inventory_quantity || p.stock || 0,
      warehouse: p.warehouse || t('inventory.default_warehouse') || 'Default',
      lastUpdated: p.updatedAt || p.updated_at || '',
      image: p.image_url || p.image || '',
    }));
  }, [products, t]);

  const uniqueCategories = useMemo(() => {
    const cats = new Set(data.map(p => p.category).filter(Boolean));
    return Array.from(cats);
  }, [data]);

  const filteredData = useMemo(() => {
    return data.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           p.sku.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' ||
                           (statusFilter === 'in_stock' && p.stock > 5) ||
                           (statusFilter === 'low_stock' && p.stock > 0 && p.stock <= 5) ||
                           (statusFilter === 'out_of_stock' && p.stock === 0);
      const matchesCategory = categoryFilter === 'all' || p.category === categoryFilter;

      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [data, searchQuery, statusFilter, categoryFilter]);

  const lowStockAlerts = useMemo(() => {
    return data.filter(p => p.stock <= 5 && p.stock > 0);
  }, [data]);

  const totalValue = useMemo(() => {
    return data.reduce((sum, p) => sum + (p.price * p.stock), 0);
  }, [data]);

  const stats = [
    { label: t('inventory.total_items'), value: data.length.toString(), icon: Package, color: 'brand' as const, description: '' },
    { label: t('inventory.low_stock'), value: lowStockAlerts.length.toString(), icon: AlertCircle, color: 'danger' as const, description: t('inventory.needs_review') },
    { label: t('inventory.warehouses'), value: '1', icon: Warehouse, color: 'info' as const, description: t('inventory.global_dist') },
    { label: t('inventory.total_value'), value: formatCurrency(totalValue), icon: TrendingUp, color: 'success' as const, description: '' },
  ];

  const columns: Column<any>[] = [
    {
      key: 'item',
      label: t('inventory.table.item'),
      cardTitle: true,
      cardMedia: true,
      render: (row) => (
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-[var(--color-obsidian-card)] border border-[var(--color-border)] rounded-xl flex items-center justify-center overflow-hidden shrink-0">
            {row.image ? (
              <img src={row.image} alt={row.name} className="w-full h-full object-cover" />
            ) : (
              <ImageIcon className="w-5 h-5 text-zinc-muted" />
            )}
          </div>
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
          status={row.stock > 5 ? t('inventory.stock_in_stock') : row.stock > 0 ? t('inventory.stock_low') : t('inventory.stock_out')}
          variant={row.stock > 5 ? 'success' : row.stock > 0 ? 'warning' : 'failed'}
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
      onClick: (row) => router.push(`/inventory`),
    },
    {
      label: t('common.edit') || 'Edit',
      icon: Edit,
      onClick: (row) => router.push(`/inventory`),
    },
    {
      label: t('common.delete') || 'Delete',
      icon: Trash2,
      variant: 'danger',
      onClick: (row) => setDeleteModal({ isOpen: true, id: row.id }),
    },
  ];

  if (!isClient) return null;

  return (
    <div className="space-y-8 p-6 max-w-[1600px] mx-auto animate-in fade-in duration-700" dir={dir}>
      {/* Page Header */}
      <div className={cn(
        "flex flex-col sm:flex-row sm:items-start justify-between gap-6",
        isRTL ? "text-right" : "text-left"
      )}>
        <div className={cn("space-y-1", isRTL ? "text-right" : "text-left")}>
          <h1 className="text-4xl font-black text-zinc-text tracking-tight leading-none">
            {t('inventory.overview')}
          </h1>
          <p className="text-base text-zinc-secondary font-bold">
            {t('inventory.overview_subtitle')}
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href="/inventory">
            <AmberButton className="gap-2 px-6 h-11 bg-[var(--color-brand)] hover:bg-[var(--color-brand)] text-black font-bold rounded-xl shadow-sm transition-all border-none active:scale-95">
              <span>{t('inventory.add_item')}</span>
              <Plus className="w-5 h-5" />
            </AmberButton>
          </Link>
          <AmberButton variant="outline" className="gap-2 px-6 h-11 border-[var(--color-border)] text-zinc-text font-bold rounded-xl active:scale-95 transition-all hover:bg-[var(--color-obsidian-hover)]">
            <History className="w-4 h-4" />
            {t('inventory.transactions')}
          </AmberButton>
        </div>
      </div>

      {/* Stats Grid */}
      <StatsGrid
        stats={stats.map(s => ({
          label: s.label,
          value: s.value,
          icon: s.icon,
          color: s.color,
          description: s.description,
        }))}
      />

      {/* Filters & Search Row */}
      <div className={cn(
        "flex flex-col md:flex-row items-center gap-4 pt-2",
        isRTL ? "text-right" : "text-left"
      )}>
        <div className="flex items-center bg-[var(--color-obsidian-card)] border border-[var(--color-border)] p-1.5 rounded-xl shadow-sm">
          <button
            onClick={() => setStatusFilter('all')}
            className={cn(
              'px-6 py-2.5 text-sm font-bold transition-colors rounded-lg',
              statusFilter === 'all'
                ? 'bg-[var(--color-brand)] text-black shadow-sm'
                : 'text-zinc-muted hover:text-zinc-text hover:bg-[var(--color-obsidian-hover)]'
            )}
          >
            {t('common.all') || 'All'}
          </button>
          <button
            onClick={() => setStatusFilter('in_stock')}
            className={cn(
              'px-6 py-2.5 text-sm font-bold transition-colors rounded-lg',
              statusFilter === 'in_stock'
                ? 'bg-[var(--color-brand)] text-black shadow-sm'
                : 'text-zinc-muted hover:text-zinc-text hover:bg-[var(--color-obsidian-hover)]'
            )}
          >
            {t('inventory.stock_in_stock') || 'In Stock'}
          </button>
          <button
            onClick={() => setStatusFilter('low_stock')}
            className={cn(
              'px-6 py-2.5 text-sm font-bold transition-colors rounded-lg',
              statusFilter === 'low_stock'
                ? 'bg-[var(--color-brand)] text-black shadow-sm'
                : 'text-zinc-muted hover:text-zinc-text hover:bg-[var(--color-obsidian-hover)]'
            )}
          >
            {t('inventory.stock_low') || 'Low Stock'}
          </button>
        </div>

        <div className="relative flex-1 max-w-sm w-full group">
          <Search className={cn(
            "absolute top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-muted group-focus-within:text-[var(--color-brand)] transition-colors",
            isRTL ? 'left-4' : 'right-4'
          )} />
          <AmberInput
            placeholder={t('inventory.search') || 'Search inventory...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={cn(
              "bg-[var(--color-obsidian-card)] border-[var(--color-border)] shadow-sm rounded-xl h-11 focus:ring-[var(--color-brand)]/20",
              isRTL ? 'pl-4 pr-10' : 'pr-4 pl-10'
            )}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Table Area */}
        <div className="lg:col-span-2 space-y-4">
          {isLoading ? (
            <div className="bg-[var(--color-obsidian-card)] border border-[var(--color-border)] rounded-2xl shadow-sm p-12 text-center">
              <div className="w-12 h-12 border-4 border-brand border-t-transparent rounded-full animate-spin mx-auto" />
            </div>
          ) : (
            <div className="bg-[var(--color-obsidian-card)] border border-[var(--color-border)] rounded-2xl shadow-sm overflow-hidden">
              <DataTable
                columns={columns}
                data={filteredData}
                pagination
                pageSize={10}
                selectable
                rowActions={rowActions}
                emptyMessage={t('inventory.empty')}
                showViewToggle
              />
            </div>
          )}
        </div>

        {/* Sidebar Status Info */}
        <div className="space-y-6">
          {/* Real-time Alerts */}
          <Card className="!p-6 bg-[var(--color-obsidian-card)] border border-[var(--color-border)] relative overflow-hidden rounded-2xl shadow-sm">
            <div className={cn("absolute top-0 bottom-0 w-1 bg-[var(--color-danger)]", isRTL ? "right-0" : "left-0")} />
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-sm font-black text-zinc-text uppercase tracking-widest flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-[var(--color-danger)] animate-pulse" /> {t('inventory.alerts')}
              </h3>
              <span className="text-xs font-black text-white bg-[var(--color-danger)] px-2.5 py-1 rounded-full shadow-lg">
                {lowStockAlerts.length}
              </span>
            </div>

            <div className="space-y-4 max-h-[320px] overflow-y-auto custom-scrollbar">
              {lowStockAlerts.length > 0 ? (
                lowStockAlerts.map((alert, i) => (
                  <div key={i} className="group p-4 bg-[var(--color-obsidian-hover)]/30 border border-[var(--color-border)] rounded-xl hover:border-[var(--color-danger)]/30 transition-all cursor-pointer">
                    <div className="flex items-center justify-between mb-2">
                       <p className="text-xs font-bold text-zinc-text uppercase tracking-tight truncate pr-4">
                        {alert.name}
                      </p>
                      <StatusBadge status="LOW" variant="warning" size="sm" />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex-1 pr-4">
                        <div className="h-1.5 bg-obsidian-outer rounded-full overflow-hidden mb-2">
                          <div className="h-full bg-[var(--color-danger)]" style={{ width: `${(alert.stock / 5) * 100}%` }} />
                        </div>
                        <p className="text-[11px] font-black text-zinc-muted uppercase tracking-widest">
                          {alert.stock} / 5 {t('inventory.units') || 'units'}
                        </p>
                      </div>
                      <ChevronRight className={cn("w-4 h-4 text-zinc-muted opacity-0 group-hover:opacity-100 transition-all", isRTL ? "rotate-180" : "")} />
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-8 opacity-30 text-center">
                  <Package className="w-10 h-10 mb-2 stroke-1" />
                  <p className="text-xs font-black uppercase tracking-widest">{t('inventory.all_stocks_nominal') || 'All stocks within nominal parameters'}</p>
                </div>
              )}
            </div>
          </Card>

          {/* Stats Summary */}
          <Card className="!p-6 bg-[var(--color-obsidian-card)] border border-[var(--color-border)] rounded-2xl shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <TrendingUp className="w-5 h-5 text-[var(--color-success)]" />
              <h3 className="text-sm font-black text-zinc-text uppercase tracking-widest">
                {t('inventory.total_value')}
              </h3>
            </div>
            <p className="text-3xl font-black text-success tracking-tighter tabular-nums">
              {formatCurrency(totalValue)}
            </p>
            <p className="text-xs text-zinc-muted mt-2">
              {data.length} {t('inventory.items')}
            </p>
          </Card>
        </div>
      </div>

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
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="p-1.5 bg-brand/10 rounded-sm">
                <Search className="w-3.5 h-3.5 text-brand" />
              </div>
              <label className="text-[10px] font-black text-zinc-text uppercase tracking-widest">
                {t('inventory.search_label')}
              </label>
            </div>
            <div className="relative group">
              <Search className={cn("absolute top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-muted transition-colors group-focus-within:text-brand", isRTL ? 'right-3' : 'left-3')} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('inventory.search')}
                className={cn(
                  "w-full h-12 bg-obsidian-outer border border-white/5 rounded-sm shadow-inner focus:bg-obsidian-card text-xs font-bold text-zinc-text outline-none focus:border-brand/30 transition-all placeholder:text-zinc-muted/40",
                  isRTL ? 'pr-10 pl-4' : 'pl-10 pr-4'
                )}
              />
            </div>
          </div>

          <div className="h-px bg-white/[0.05]" />

          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="p-1.5 bg-info/10 rounded-sm">
                  <Package className="w-3.5 h-3.5 text-info" />
                </div>
                <label className="text-[10px] font-black text-zinc-text uppercase tracking-widest">
                  {t('common.status')}
                </label>
              </div>
              <AmberDropdown
                options={[
                  { label: t('common.all') || 'All Status', value: 'all' },
                  { label: t('inventory.stock_in_stock'), value: 'in_stock' },
                  { label: t('inventory.stock_low'), value: 'low_stock' },
                  { label: t('inventory.stock_out'), value: 'out_of_stock' },
                ]}
                value={statusFilter}
                onChange={setStatusFilter}
                className="w-full h-12"
              />
            </div>

            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="p-1.5 bg-success/10 rounded-sm">
                  <Filter className="w-3.5 h-3.5 text-success" />
                </div>
                <label className="text-[10px] font-black text-zinc-text uppercase tracking-widest">
                  {t('inventory.table.category')}
                </label>
              </div>
              <AmberDropdown
                options={[
                  { label: t('common.all') || 'All Categories', value: 'all' },
                  ...uniqueCategories.map(cat => ({ label: cat, value: cat })),
                ]}
                value={categoryFilter}
                onChange={setCategoryFilter}
                className="w-full h-12"
              />
            </div>
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
    </div>
  );
};
