import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Package,
  Search,
  Plus,
  Eye,
  Edit,
  Trash2,
  Grid3x3,
  List,
  Filter,
  TrendingUp,
  Tag,
  AlertCircle,
  Download
} from 'lucide-react';
import { useLanguage } from '@core/contexts/LanguageContext';
import { cn } from '@core/lib/utils/cn';
import { AmberCard as Card } from '@core/components/AmberCard';
import { AmberButton } from '@core/components/AmberButton';
import { AmberInput } from '@core/components/AmberInput';
import { DataTable, Column, Action } from '@core/components/Data/DataTable';
import { StatusBadge } from '@core/components/Data/StatusBadge';
import { useGetItems, useDeleteItemMutation } from '../hooks/useItems';
import type { Item, ItemStatus } from '../types';
import { DeleteCardConfirmation } from '@core/components/Feedback/DeleteCardConfirmation';

/**
 * ItemsListPage - Premium Items Management
 */
export const ItemsListPage: React.FC = () => {
  const { t, dir } = useLanguage();
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState<ItemStatus | 'all'>('all');
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; id: string | null }>({
    isOpen: false,
    id: null
  });

  const isRTL = dir === 'rtl';

  const { data: items = [], isLoading, refetch } = useGetItems({
    search: searchQuery,
    category: categoryFilter,
    status: statusFilter
  });

  const deleteMutation = useDeleteItemMutation({
    onSuccess: () => {
      refetch();
      setDeleteModal({ isOpen: false, id: null });
    }
  });

  const categories = useMemo(() => {
    return ['All', ...Array.from(new Set(items.map(i => i.category)))];
  }, [items]);

  // --- Table Configuration ---
  const columns: Column<Item>[] = [
    {
      key: 'item',
      label: t('items.table.item') || 'Item Detail',
      render: (row) => (
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-obsidian-outer border border-border rounded-xl flex items-center justify-center text-2xl overflow-hidden shrink-0">
             {row.image || <Package className="w-5 h-5 text-zinc-muted" />}
          </div>
          <div className="space-y-0.5">
            <p className="text-sm font-black text-zinc-text tracking-tight uppercase">
              {row.name}
            </p>
            <p className="text-xs font-bold text-zinc-muted italic truncate max-w-[200px]">{row.description}</p>
          </div>
        </div>
      ),
      sortable: true,
      width: '35%'
    },
    {
      key: 'category',
      label: t('items.table.category') || 'Class',
      render: (row) => (
        <span className="text-[10px] font-black text-zinc-muted uppercase tracking-widest px-2 py-0.5 bg-obsidian-hover rounded border border-border">
          {row.category}
        </span>
      ),
      sortable: true,
      align: 'center'
    },
    {
      key: 'bid',
      label: t('items.table.bid') || 'Value',
      render: (row) => (
        <div className="flex flex-col items-center">
            <span className="text-sm font-black text-brand tabular-nums tracking-tighter italic">
                ${(row.currentBid || row.startingBid).toLocaleString()}
            </span>
            <span className="text-[9px] font-bold text-zinc-muted uppercase">
                {row.currentBid ? 'Current' : 'Starting'}
            </span>
        </div>
      ),
      sortable: true,
      align: 'center'
    },
    {
      key: 'status',
      label: t('items.table.status') || 'Protocol',
      render: (row) => (
        <StatusBadge 
          status={row.status.toUpperCase()} 
          variant={row.status === 'available' ? 'success' : row.status === 'in-auction' ? 'warning' : row.status === 'sold' ? 'failed' : 'inactive'}
          size="sm"
        />
      ),
      sortable: true,
      align: 'center'
    },
  ];

  const rowActions: Action<Item>[] = [
    {
      label: t('common.view') || 'Inspect',
      icon: Eye,
      onClick: (row) => navigate(`/auctions/${row.id}`), // Adjust link as needed
    },
    {
      label: t('common.edit') || 'Modify',
      icon: Edit,
      onClick: (row) => navigate(`/items/edit/${row.id}`),
    },
    {
      label: t('common.delete') || 'Wipe',
      icon: Trash2,
      variant: 'danger',
      onClick: (row) => setDeleteModal({ isOpen: true, id: row.id }),
    },
  ];

  return (
    <div className="space-y-8 p-6 max-w-[1600px] mx-auto animate-in fade-in duration-700" dir={dir}>
      {/* Page Header */}
      <div className={cn(
        "flex flex-col sm:flex-row sm:items-start justify-between gap-6",
        isRTL ? "text-right" : "text-left"
      )}>
        <div className="space-y-1">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-sm bg-brand/10 flex items-center justify-center text-brand border border-brand/20 shadow-[0_0_15px_rgba(245,196,81,0.1)]">
                <Package className="w-5 h-5" />
             </div>
             <div>
                <h1 className="text-4xl font-black text-zinc-text tracking-tight leading-none uppercase">
                    {t('items.title') || 'Items Laboratory'}
                </h1>
                <p className="text-base text-zinc-secondary font-bold">
                    {t('items.subtitle') || 'Manage assets and auction inventory catalog'}
                </p>
             </div>
          </div>
        </div>
        <div className="flex gap-3">
           <AmberButton variant="outline" className="gap-2 px-6 h-11 border-border text-zinc-text font-bold rounded-xl active:scale-95 transition-all hover:bg-obsidian-hover">
                <Download className="w-4 h-4" />
                {t('common.export') || 'Export Protocol'}
           </AmberButton>
           <Link to="/items/add">
            <AmberButton className="gap-2 px-8 h-11 bg-brand hover:bg-brand text-black font-bold rounded-xl shadow-sm transition-all border-none active:scale-95">
                <Plus className="w-5 h-5" />
                <span>{t('items.add') || 'Initialize Asset'}</span>
            </AmberButton>
          </Link>
        </div>
      </div>

      {/* Quick Analysis Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="!p-5 bg-obsidian-card border border-border shadow-sm hover:border-brand/30 transition-all cursor-default group overflow-hidden relative">
            <div className="space-y-1 relative z-10">
              <span className="text-xs font-bold text-zinc-muted uppercase tracking-wider block">
                 {t('items.total') || 'Aggregated Total'}
              </span>
              <span className="text-3xl font-black text-zinc-text tracking-tight italic tabular-nums leading-none">
                {items.length}
              </span>
            </div>
            <div className="absolute top-0 right-0 w-24 h-24 bg-brand/5 rounded-full blur-3xl -mr-12 -mt-12 group-hover:bg-brand/10 transition-colors" />
            <Package className="absolute bottom-2 right-2 w-12 h-12 text-zinc-muted/10 -rotate-12 transition-transform group-hover:scale-110" />
          </Card>

          <Card className="!p-5 bg-obsidian-card border border-border shadow-sm hover:border-info/30 transition-all cursor-default group overflow-hidden relative">
            <div className="space-y-1 relative z-10">
              <span className="text-xs font-bold text-zinc-muted uppercase tracking-wider block">
                 {t('items.in_auction') || 'Active Deployments'}
              </span>
              <span className="text-3xl font-black text-info tracking-tight italic tabular-nums leading-none">
                {items.filter(i => i.status === 'in-auction').length}
              </span>
            </div>
          </Card>

          <Card className="!p-5 bg-obsidian-card border border-border shadow-sm hover:border-brand/30 transition-all cursor-default group overflow-hidden relative">
            <div className="space-y-1 relative z-10">
              <span className="text-xs font-bold text-zinc-muted uppercase tracking-wider block">
                 {t('items.available') || 'Standing Stock'}
              </span>
              <span className="text-3xl font-black text-brand tracking-tight italic tabular-nums leading-none">
                {items.filter(i => i.status === 'available').length}
              </span>
            </div>
          </Card>

          <Card className="!p-5 bg-obsidian-card border border-border shadow-sm hover:border-success/30 transition-all cursor-default group overflow-hidden relative">
            <div className="space-y-1 relative z-10">
              <span className="text-xs font-bold text-zinc-muted uppercase tracking-wider block">
                 {t('items.total_value') || 'Asset Evaluation'}
              </span>
              <span className="text-3xl font-black text-success tracking-tight italic tabular-nums leading-none">
                ${items.reduce((sum, i) => sum + (i.currentBid || i.startingBid), 0).toLocaleString()}
              </span>
            </div>
          </Card>
      </div>

      {/* Integration Controls */}
      <div className="flex flex-col md:flex-row items-center gap-4 pt-2">
        {/* Status Protocol Tabs */}
        <div className="flex items-center bg-obsidian-card border border-border p-1.5 rounded-xl shadow-sm">
          <button
            onClick={() => setStatusFilter('all')}
            className={cn(
              'px-6 py-2.5 text-sm font-bold transition-colors rounded-lg',
              statusFilter === 'all'
                ? 'bg-brand text-black shadow-sm'
                : 'text-zinc-muted hover:text-zinc-text hover:bg-obsidian-hover'
            )}
          >
            {t('common.all') || 'Aggregated'}
          </button>
          <button
            onClick={() => setStatusFilter('available')}
            className={cn(
              'px-6 py-2.5 text-sm font-bold transition-colors rounded-lg',
              statusFilter === 'available'
                ? 'bg-brand text-black shadow-sm'
                : 'text-zinc-muted hover:text-zinc-text hover:bg-obsidian-hover'
            )}
          >
            {t('items.available') || 'Available'}
          </button>
          <button
            onClick={() => setStatusFilter('in-auction')}
            className={cn(
              'px-6 py-2.5 text-sm font-bold transition-colors rounded-lg',
              statusFilter === 'in-auction'
                ? 'bg-brand text-black shadow-sm'
                : 'text-zinc-muted hover:text-zinc-text hover:bg-obsidian-hover'
            )}
          >
            {t('items.in_auction') || 'In Auction'}
          </button>
        </div>

        {/* View Toggle */}
        <div className="flex items-center bg-obsidian-card border border-border p-1.5 rounded-xl shadow-sm ml-auto">
            <button
                onClick={() => setViewMode('grid')}
                className={cn(
                    "p-2.5 rounded-lg transition-all",
                    viewMode === 'grid' ? "bg-brand/10 text-brand shadow-inner" : "text-zinc-muted hover:text-zinc-text hover:bg-obsidian-hover"
                )}
            >
                <Grid3x3 className="w-4 h-4" />
            </button>
            <button
                onClick={() => setViewMode('list')}
                className={cn(
                    "p-2.5 rounded-lg transition-all",
                    viewMode === 'list' ? "bg-brand/10 text-brand shadow-inner" : "text-zinc-muted hover:text-zinc-text hover:bg-obsidian-hover"
                )}
            >
                <List className="w-4 h-4" />
            </button>
        </div>

        {/* Search Input */}
        <div className="relative flex-1 max-w-sm w-full group">
          <Search className={cn(
            "absolute top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-muted group-focus-within:text-brand transition-colors",
            isRTL ? 'left-4' : 'right-4'
          )} />
          <AmberInput
            placeholder={t('items.search_placeholder') || 'Scan assets...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={cn(
              "bg-obsidian-card border-border shadow-sm h-11 focus:ring-brand/20",
              isRTL ? 'pl-4 pr-10' : 'pr-4 pl-10'
            )}
          />
        </div>
      </div>

      {/* Results Matrix */}
      {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
            {[1, 2, 3].map(i => <div key={i} className="h-[300px] bg-obsidian-card border border-border rounded-2xl" />)}
          </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((item) => (
                <Card key={item.id} className="group hover:border-zinc-secondary/30 bg-obsidian-card border-border shadow-md transition-all overflow-hidden p-0">
                    <div className="p-6 space-y-4">
                        {/* Placeholder Visual Component */}
                        <div className="w-full aspect-square bg-obsidian-outer border border-border rounded-xl flex items-center justify-center text-5xl group-hover:bg-white/[0.02] transition-all relative overflow-hidden">
                            {item.image || <Package className="w-10 h-10 text-zinc-muted/20" />}
                            <div className="absolute top-2 right-2">
                                <StatusBadge 
                                    status={item.status.toUpperCase()} 
                                    variant={item.status === 'available' ? 'success' : item.status === 'in-auction' ? 'warning' : 'failed'}
                                    size="sm"
                                />
                            </div>
                        </div>

                        <div>
                            <div className="flex items-start justify-between gap-4 mb-2">
                                <div className="flex-1 min-w-0">
                                    <span className="text-[10px] font-black text-brand uppercase tracking-[0.2em]">{item.category}</span>
                                    <h3 className="text-lg font-black text-zinc-text truncate tracking-tight group-hover:text-brand transition-colors">
                                        {item.name}
                                    </h3>
                                </div>
                            </div>
                            <p className="text-xs font-bold text-zinc-muted italic line-clamp-2 min-h-[32px]">{item.description}</p>
                        </div>

                        <div className="pt-4 border-t border-border flex items-center justify-between">
                            <div>
                                <p className="text-[9px] font-bold text-zinc-muted uppercase tracking-[0.1em] mb-1">
                                    {item.currentBid ? 'Current Bid Protocol' : 'Evaluation Baseline'}
                                </p>
                                <p className="text-xl font-black text-brand tabular-nums tracking-tighter italic leading-none">
                                    ${(item.currentBid || item.startingBid).toLocaleString()}
                                </p>
                            </div>
                            <div className="flex items-center gap-2">
                                <AmberButton 
                                    variant="outline" 
                                    size="sm" 
                                    className="p-2 border-border h-9"
                                    onClick={() => navigate(`/auctions/${item.id}`)}
                                >
                                    <Eye className="w-4 h-4" />
                                </AmberButton>
                                <AmberButton 
                                    variant="outline" 
                                    size="sm" 
                                    className="p-2 border-border h-9"
                                    onClick={() => navigate(`/items/edit/${item.id}`)}
                                >
                                    <Edit className="w-4 h-4" />
                                </AmberButton>
                            </div>
                        </div>

                        <div className="flex items-center justify-between text-[10px] font-black text-zinc-muted uppercase tracking-widest pt-1">
                            <div className="flex items-center gap-1.5">
                                <Tag className="w-3 h-3" />
                                <span>{item.sku}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <TrendingUp className="w-3 h-3" />
                                <span>{item.auctionCount} Iterations</span>
                            </div>
                        </div>
                    </div>
                </Card>
            ))}
        </div>
      ) : (
        <div className="bg-obsidian-card border border-border rounded-2xl shadow-sm overflow-hidden">
            <DataTable
                columns={columns}
                data={items}
                pagination
                pageSize={10}
                selectable
                rowActions={rowActions}
                onRowClick={(row) => navigate(`/items/edit/${row.id}`)}
            />
        </div>
      )}

      {/* Delete Execution Matrix */}
      <DeleteCardConfirmation 
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, id: null })}
        onConfirm={() => {
          if (deleteModal.id) {
            deleteMutation.mutate(deleteModal.id);
          }
        }}
        title={t('items.delete_title') || 'Terminate Asset Entry'}
        message={t('items.delete_message') || 'Are you sure you want to permanently wipe this asset record from the central repository?'}
      />
    </div>
  );
};

export default ItemsListPage;
