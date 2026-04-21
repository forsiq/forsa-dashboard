import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { AmberCard as Card } from '@core/components/AmberCard';
import { AmberButton } from '@core/components/AmberButton';
import { AmberInput } from '@core/components/AmberInput';
import { AmberDropdown } from '@core/components/AmberDropdown';
import { cn } from '@core/lib/utils/cn';
import { useLanguage } from '@core/contexts/LanguageContext';
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

// --- Types ---

interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  price: number;
  stock: number;
  warehouse: string;
  lastUpdated: string;
  image?: string;
}

// --- Mock Data ---

const MOCK_PRODUCTS: Product[] = [
  { id: '1', name: 'Neural Core V2', sku: 'NC-V2-001', category: 'Hardware', price: 1200, stock: 45, warehouse: 'Main Hub', lastUpdated: '2024-03-20', image: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=100&h=100&fit=crop' },
  { id: '2', name: 'Optic Sensor G3', sku: 'OS-G3-442', category: 'Sensing', price: 450, stock: 3, warehouse: 'Vault A', lastUpdated: '2024-03-21', image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=100&h=100&fit=crop' },
  { id: '3', name: 'Power Cell Alpha', sku: 'PC-A-90', category: 'Energy', price: 890, stock: 12, warehouse: 'Main Hub', lastUpdated: '2024-03-19', image: 'https://images.unsplash.com/photo-1617791160536-598cf3278827?w=100&h=100&fit=crop' },
  { id: '4', name: 'Liquid Cooling Kit', sku: 'LCK-01', category: 'Cooling', price: 299, stock: 0, warehouse: 'Backup Node', lastUpdated: '2024-03-18', image: 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=100&h=100&fit=crop' },
  { id: '5', name: 'Haptic Glove Pro', sku: 'HGP-X7', category: 'Hardware', price: 1500, stock: 8, warehouse: 'Vault B', lastUpdated: '2024-03-22', image: 'https://images.unsplash.com/photo-1593508512255-86ab42a8e620?w=100&h=100&fit=crop' },
  { id: '6', name: 'Encryption Key V4', sku: 'EK-V4-SEC', category: 'Security', price: 2500, stock: 2, warehouse: 'Central Registry', lastUpdated: '2024-03-15', image: 'https://images.unsplash.com/photo-1633265485768-30691f379654?w=100&h=100&fit=crop' },
  { id: '7', name: 'Quantum Processor', sku: 'QP-Q1-INF', category: 'Hardware', price: 12500, stock: 1, warehouse: 'Vault A', lastUpdated: '2024-03-10', image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=100&h=100&fit=crop' },
];

const MOCK_WAREHOUSES = [
  { name: 'Main Hub', used: 1240, capacity: 5000, status: 'Active' },
  { name: 'Vault A', used: 840, capacity: 1000, status: 'Near Capacity' },
  { name: 'Vault B', used: 210, capacity: 2000, status: 'Active' },
];

export const InventoryPage = () => {
  const { t, dir } = useLanguage();
  const router = useRouter();
  const [data, setData] = useState<Product[]>(MOCK_PRODUCTS);
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

  // --- Filtering ---

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

  // --- Stats ---

  const lowStockAlerts = useMemo(() => {
    return data.filter(p => p.stock <= 5 && p.stock > 0);
  }, [data]);

  const stats = [
    { label: t('inventory.total_items'), value: data.length.toString(), icon: Package, color: 'brand' as const, description: '+4% ' + t('common.this_month') },
    { label: t('inventory.low_stock'), value: lowStockAlerts.length.toString(), icon: AlertCircle, color: 'danger' as const, description: t('inventory.needs_review') },
    { label: t('inventory.warehouses'), value: '3', icon: Warehouse, color: 'info' as const, description: t('inventory.global_dist') },
    { label: t('inventory.total_value'), value: '$' + data.reduce((sum, p) => sum + (p.price * p.stock), 0).toLocaleString(), icon: TrendingUp, color: 'success' as const, description: '+12.4% vs LY' },
  ];

  // --- Table Configuration ---

  const columns: Column<Product>[] = [
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


  const rowActions: Action<Product>[] = [
    {
      label: t('common.view') || 'View Details',
      icon: Eye,
      onClick: (row) => console.log('View', row.id),
    },
    {
      label: t('common.edit') || 'Edit Metadata',
      icon: Edit,
      onClick: (row) => console.log('Edit', row.id),
    },
    {
      label: t('common.delete') || 'Wipe Entry',
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
          <Link href="/inventory/new">
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
        {/* Status Tabs */}
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
            {t('common.all') || 'الكل'}
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
            {t('inventory.stock_in_stock') || 'متوفر'}
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
            {t('inventory.stock_low') || 'منخفض'}
          </button>
        </div>

        {/* Search Input */}
        <div className="relative flex-1 max-w-sm w-full group">
          <Search className={cn(
            "absolute top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-muted group-focus-within:text-[var(--color-brand)] transition-colors",
            isRTL ? 'left-4' : 'right-4'
          )} />
          <AmberInput
            placeholder={t('inventory.search') || 'البحث في المخزون...'}
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
                       <p className="text-xs font-bold text-zinc-text uppercase tracking-tight italic truncate pr-4">
                        {alert.name}
                      </p>
                      <StatusBadge status="LOW" variant="warning" size="sm" />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex-1 pr-4">
                        <div className="h-1.5 bg-obsidian-outer rounded-full overflow-hidden mb-2">
                          <div className="h-full bg-[var(--color-danger)] animate-shimmer" style={{ width: `${(alert.stock / 5) * 100}%` }} />
                        </div>
                        <p className="text-[11px] font-black text-zinc-muted uppercase tracking-widest">
                          {alert.stock} / 5 UNITS REMAINING
                        </p>
                      </div>
                      <ChevronRight className={cn("w-4 h-4 text-zinc-muted opacity-0 group-hover:opacity-100 transition-all", isRTL ? "rotate-180" : "")} />
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-8 opacity-30 text-center">
                  <Package className="w-10 h-10 mb-2 stroke-1" />
                  <p className="text-xs font-black uppercase tracking-widest">All stock levels nominal</p>
                </div>
              )}
            </div>
          </Card>

          {/* Infrastructure Health / Warehouses */}
          <Card className="!p-6 bg-[var(--color-obsidian-card)] border border-[var(--color-border)] rounded-2xl shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <Warehouse className="w-5 h-5 text-[var(--color-info)]" />
              <h3 className="text-sm font-black text-zinc-text uppercase tracking-widest">
                {t('inventory.warehouses')}
              </h3>
            </div>
            
            <div className="space-y-6">
              {MOCK_WAREHOUSES.map((wh, i) => (
                <div key={i} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-black text-zinc-text uppercase tracking-tighter italic">{wh.name}</p>
                    <span className={cn(
                      "text-[10px] font-bold px-2 py-0.5 rounded-lg border uppercase tracking-widest shadow-sm",
                      wh.status === 'Near Capacity' ? 'bg-[var(--color-warning)]/10 text-[var(--color-warning)] border-[var(--color-warning)]/20' : 'bg-[var(--color-success)]/10 text-[var(--color-success)] border-[var(--color-success)]/20'
                    )}>
                      {wh.status}
                    </span>
                  </div>
                  <div className="relative h-2.5 bg-obsidian-outer rounded-full overflow-hidden shadow-inner border border-white/5">
                    <div 
                      className={cn(
                        "absolute top-0 left-0 h-full rounded-full transition-all duration-1000",
                        wh.used / wh.capacity > 0.85 ? 'bg-[var(--color-warning)]' : 'bg-[var(--color-info)]'
                      )} 
                      style={{ width: `${Math.min((wh.used / wh.capacity) * 100, 100)}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                     <p className="text-[11px] font-black text-zinc-muted uppercase tracking-widest">
                      {wh.used.toLocaleString()} <span className="opacity-40">/</span> {wh.capacity.toLocaleString()} SKUs
                    </p>
                    <span className="text-xs font-bold text-zinc-muted opacity-50">
                      {Math.round((wh.used / wh.capacity) * 100)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
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
              <label className="text-[10px] font-black text-zinc-text uppercase tracking-widest italic">
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
                  "w-full h-12 bg-obsidian-outer border border-white/5 rounded-sm shadow-inner focus:bg-obsidian-card text-xs font-bold text-zinc-text outline-none focus:border-brand/30 transition-all placeholder:text-zinc-muted/40 italic",
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
                <label className="text-[10px] font-black text-zinc-text uppercase tracking-widest italic">
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
                <label className="text-[10px] font-black text-zinc-text uppercase tracking-widest italic">
                  {t('inventory.table.category')}
                </label>
              </div>
              <AmberDropdown 
                options={[
                  { label: t('common.all') || 'All Categories', value: 'all' },
                  { label: 'Hardware', value: 'Hardware' },
                  { label: 'Energy', value: 'Energy' },
                  { label: 'Sensing', value: 'Sensing' },
                  { label: 'Security', value: 'Security' },
                  { label: 'Cooling', value: 'Cooling' },
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
            setData(prev => prev.filter(p => p.id !== deleteModal.id));
            setDeleteModal({ isOpen: false, id: null });
          }
        }}
        title={t('inventory.delete_title')}
        message={t('inventory.delete_message')}
      />
    </div>
  );
};
