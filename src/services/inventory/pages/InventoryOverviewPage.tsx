import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import {
  Package,
  AlertCircle,
  Warehouse,
  TrendingUp,
  Search,
  Plus,
  History as HistoryIcon,
  SlidersHorizontal,
  Eye,
  Edit,
  Trash2,
  Box,
  Layers,
  ArrowRight
} from 'lucide-react';
import { useLanguage } from '@core/contexts/LanguageContext';
import { cn } from '@core/lib/utils/cn';
import { AmberCard as Card } from '@core/components/AmberCard';
import { AmberButton } from '@core/components/AmberButton';
import { AmberInput } from '@core/components/AmberInput';
import { DataTable, Column } from '@core/components/Data/DataTable';
import { AmberSlideOver } from '@core/components/AmberSlideOver';
import { AmberDropdown } from '@core/components/AmberDropdown';
import { AmberProgress } from '@core/components/AmberProgress';
import { StatusBadge } from '@core/components/Data/StatusBadge';
import { useList, useStats } from '../hooks';

/**
 * InventoryOverviewPage - Advanced Asset Monitoring Dashboard
 */
export const InventoryOverviewPage: React.FC = () => {
  const { t, dir } = useLanguage();
  const router = useRouter();
  const isRTL = dir === 'rtl';

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const { data: inventoryData, isLoading: itemsLoading } = useList();
  const products = (inventoryData as any)?.items || [];

  // Mock warehouse data (to match original depth)
  const warehouses = [
    { name: 'Central Hub - Dubai', used: 850, capacity: 1000, status: 'Active' },
    { name: 'Satellite Vault A', used: 120, capacity: 500, status: 'Active' },
    { name: 'Secure Storage B', used: 450, capacity: 500, status: 'Near Capacity' },
  ];

  const lowStockThreshold = 10;
  const lowStockItems = products.filter((p: any) => (p.inventory_quantity || p.stock || 0) <= lowStockThreshold);

  // --- Table Configuration ---
  const columns: Column<any>[] = [
    {
      key: 'item',
      label: t('inventory.table.item') || 'ASSET IDENTIFIER',
      render: (row) => (
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-obsidian-outer border border-border rounded-xl flex items-center justify-center text-xl overflow-hidden shrink-0">
             {row.image_url ? (
               <img src={row.image_url} alt={row.name} className="w-full h-full object-cover" />
             ) : (
               <Package className="w-5 h-5 text-zinc-muted" />
             )}
          </div>
          <div className="space-y-0.5">
            <p className="text-sm font-black text-zinc-text tracking-tight uppercase">
              {row.name}
            </p>
            <p className="text-[10px] font-mono text-zinc-muted font-bold tracking-tight">{row.sku || 'NO-SKU-ID'}</p>
          </div>
        </div>
      ),
      sortable: true,
      width: '40%'
    },
    {
      key: 'stock',
      label: t('inventory.stock_level') || 'UNITS',
      render: (row) => {
        const qty = row.inventory_quantity || row.stock || 0;
        return (
          <div className="flex flex-col items-center">
            <span className={cn(
              "text-sm font-black tabular-nums tracking-tighter",
              qty <= lowStockThreshold ? "text-danger" : "text-zinc-text"
            )}>
              {qty}
            </span>
          </div>
        );
      },
      sortable: true,
      align: 'center'
    },
    {
        key: 'status',
        label: 'PROTOCOLS',
        render: (row) => {
          const qty = row.inventory_quantity || row.stock || 0;
          return (
            <StatusBadge 
              status={qty === 0 ? 'DEPLETED' : qty <= lowStockThreshold ? 'CRITICAL' : 'REPLENISHED'} 
              variant={qty === 0 ? 'failed' : qty <= lowStockThreshold ? 'warning' : 'success'}
              size="sm"
            />
          );
        },
        sortable: true,
        align: 'center'
    },
    {
      key: 'warehouse',
      label: 'STORAGE NODE',
      render: () => (
        <span className="text-[10px] font-black text-zinc-muted uppercase tracking-widest">
          {t('inventory.default_warehouse') || 'Primary Vault'}
        </span>
      ),
      align: 'center'
    },
  ];

  if (!isClient) return null;

  return (
    <div className="space-y-8 p-6 max-w-[1600px] mx-auto animate-in fade-in duration-700" dir={dir}>
      {/* Page Header */}
      <div className={cn(
        "flex flex-col lg:flex-row lg:items-start justify-between gap-6",
        isRTL ? "text-right" : "text-left"
      )}>
        <div className="space-y-1">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-sm bg-brand/10 flex items-center justify-center text-brand border border-brand/20 shadow-[0_0_15px_rgba(245,196,81,0.1)]">
                <Warehouse className="w-5 h-5" />
             </div>
             <div>
                <h1 className="text-4xl font-black text-zinc-text tracking-tight leading-none uppercase">
                    {t('inventory.overview') || 'Inventory Management'}
                </h1>
                <p className="text-base text-zinc-secondary font-bold tracking-tight uppercase mt-1">
                    {t('inventory.overview_subtitle') || 'Strategic logistics and asset allocation infrastructure'}
                </p>
             </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
            <AmberButton
                variant="outline"
                className="gap-2 h-11 border-border font-bold rounded-xl active:scale-95 transition-all hover:bg-obsidian-hover"
                onClick={() => setIsFilterOpen(true)}
            >
                <SlidersHorizontal className="w-4 h-4" />
                {t('inventory.filters') || 'Configuration'}
            </AmberButton>
            <Link href="/inventory/add">
                <AmberButton className="gap-2 h-11 bg-brand hover:bg-brand text-black font-black rounded-xl shadow-sm transition-all border-none active:scale-95 px-8">
                    <Plus className="w-5 h-5" />
                    <span>{t('inventory.add_item') || 'Ingest Asset'}</span>
                </AmberButton>
            </Link>
            <Link href="/inventory/transactions">
                <AmberButton variant="outline" className="gap-2 h-11 border-border font-bold rounded-xl hover:bg-obsidian-hover active:scale-95">
                    <HistoryIcon className="w-4 h-4" />
                    <span>{t('inventory.transactions') || 'Ledger'}</span>
                </AmberButton>
            </Link>
        </div>
      </div>

      {/* Strategic Metrics Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="!p-5 bg-obsidian-card border-border hover:border-brand/30 transition-all cursor-default relative overflow-hidden group">
            <div className="flex items-start justify-between mb-2">
                <div className="space-y-1">
                    <span className="text-[10px] font-black text-zinc-muted uppercase tracking-widest">
                      {t('inventory.global_units') || 'Global Inventory Units'}
                    </span>
                    <h3 className="text-3xl font-black text-zinc-text tracking-tighter tabular-nums">{products.length}</h3>
                </div>
                <div className="p-3 bg-brand/10 text-brand rounded-xl border border-brand/20">
                    <Package className="w-5 h-5" />
                </div>
            </div>
            <div className="flex items-center gap-2 text-[10px] font-bold text-success mt-4">
                <TrendingUp className="w-3 h-3" />
                <span>+12.8% Since Previous Cycle</span>
            </div>
          </Card>

          <Card className="!p-5 bg-obsidian-card border-border hover:border-danger/30 transition-all cursor-default relative overflow-hidden group">
            <div className="flex items-start justify-between mb-2">
                <div className="space-y-1">
                    <span className="text-[10px] font-black text-danger uppercase tracking-widest">
                      {t('inventory.critical_alert') || 'Critical Supply Alert'}
                    </span>
                    <h3 className="text-3xl font-black text-danger tracking-tighter tabular-nums">{lowStockItems.length}</h3>
                </div>
                <div className="p-3 bg-danger/10 text-danger rounded-xl border border-danger/20">
                    <AlertCircle className="w-5 h-5" />
                </div>
            </div>
            <div className="flex items-center gap-2 text-[10px] font-bold text-danger mt-4">
                <ArrowRight className="w-3 h-3" />
                <span>Requires Immediate Procurement</span>
            </div>
          </Card>

          <Card className="!p-5 bg-obsidian-card border-border hover:border-info/30 transition-all cursor-default relative overflow-hidden group">
            <div className="flex items-start justify-between mb-2">
                <div className="space-y-1">
                    <span className="text-[10px] font-black text-info uppercase tracking-widest">Active Logistics Nodes</span>
                    <h3 className="text-3xl font-black text-info tracking-tighter tabular-nums">{warehouses.length}</h3>
                </div>
                <div className="p-3 bg-info/10 text-info rounded-xl border border-info/20">
                    <Warehouse className="w-5 h-5" />
                </div>
            </div>
            <div className="flex items-center gap-2 text-[10px] font-bold text-zinc-muted mt-4">
                <span>94% Operational Efficiency</span>
            </div>
          </Card>

          <Card className="!p-5 bg-obsidian-card border-border hover:border-success/30 transition-all cursor-default relative overflow-hidden group">
            <div className="flex items-start justify-between mb-2">
                <div className="space-y-1">
                    <span className="text-[10px] font-black text-success uppercase tracking-widest">Aggregated Fiscal Value</span>
                    <h3 className="text-3xl font-black text-success tracking-tighter tabular-nums">
                        ${products.reduce((sum: number, p: any) => sum + ((p.price || 0) * (p.inventory_quantity || 0)), 0).toLocaleString()}
                    </h3>
                </div>
                <div className="p-3 bg-success/10 text-success rounded-xl border border-success/20">
                    <TrendingUp className="w-5 h-5" />
                </div>
            </div>
            <div className="flex items-center gap-2 text-[10px] font-bold text-success mt-4">
                <span>Equity Optimization High</span>
            </div>
          </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Resource Matrix (DataTable) */}
        <div className="xl:col-span-2 space-y-4">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-sm font-black text-zinc-muted uppercase tracking-[0.2em] flex items-center gap-2">
               <Layers className="w-4 h-4" /> Global Resource Distribution
            </h2>
            <div className="relative group min-w-[280px]">
                <Search className={cn(
                    "absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-muted/50 group-focus-within:text-brand transition-colors",
                    isRTL ? 'right-4' : 'left-4'
                )} />
                <AmberInput 
                    placeholder="Search allocation identifiers..." 
                    className="h-10 bg-obsidian-card border-border pl-10 pr-4 text-[11px] font-bold"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>
          </div>
          <div className="bg-obsidian-card border border-border rounded-2xl shadow-lg overflow-hidden">
             <DataTable 
               columns={columns}
               data={products}
               pagination
               pageSize={15}
               selectable
               onRowClick={(row) => router.push(`/inventory/details/${row.id}`)}
             />
          </div>
        </div>

        {/* Intelligence Sidebars */}
        <div className="space-y-8">
           {/* Logistics Alert Cluster */}
           <Card className="!p-6 bg-obsidian-panel/20 border-danger/20 shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-5">
                   <AlertCircle className="w-24 h-24 text-danger rotate-12" />
                </div>
                <div className="flex items-center justify-between mb-6 relative z-10">
                    <h3 className="text-xs font-black text-zinc-text uppercase tracking-[0.15em] flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-danger animate-pulse" /> Critical Depletion Alerts
                    </h3>
                    <span className="text-[10px] font-black text-danger bg-danger/10 px-3 py-1 rounded-full border border-danger/30">
                        {lowStockItems.length} DETECTED
                    </span>
                </div>
                <div className="space-y-4 max-h-[440px] overflow-y-auto custom-scrollbar pr-2 relative z-10">
                    {lowStockItems.length > 0 ? lowStockItems.map((item: any, i: number) => (
                        <div key={i} className="p-4 bg-obsidian-card border border-border rounded-xl hover:border-danger/30 transition-all group">
                            <div className="flex items-start justify-between">
                                <div className="space-y-1">
                                    <p className="text-xs font-black text-zinc-text uppercase tracking-tight group-hover:text-danger transition-colors">{item.name}</p>
                                    <p className="text-[10px] font-bold text-zinc-muted uppercase">Protocol: High Urgency Procurement</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-black text-danger leading-none">{item.inventory_quantity || 0}</p>
                                    <p className="text-[8px] font-black text-zinc-muted uppercase mt-1">Remaining</p>
                                </div>
                            </div>
                        </div>
                    )) : (
                        <div className="py-12 text-center space-y-3 opacity-40">
                             <Box className="w-8 h-8 mx-auto text-zinc-muted" />
                             <p className="text-[10px] font-black uppercase tracking-widest">
                               {t('inventory.all_stocks_nominal') || 'All stocks within nominal parameters'}
                             </p>
                        </div>
                    )}
                </div>
                <AmberButton variant="outline" className="w-full mt-6 h-11 border-danger/20 text-danger hover:bg-danger/5 font-black uppercase text-[10px] tracking-widest">
                    {t('inventory.generate_procurement_order') || 'Generate Procurement Order'}
                </AmberButton>
           </Card>

           {/* Facility Capacity Index */}
           <Card className="!p-6 bg-obsidian-card border-border shadow-lg">
                <div className="flex items-center gap-3 mb-8">
                   <Warehouse className="w-4 h-4 text-brand" />
                   <h3 className="text-xs font-black text-zinc-text uppercase tracking-[0.15em]">Facility Capacity Index</h3>
                </div>
                <div className="space-y-10">
                   {warehouses.map((wh, i) => (
                       <div key={i} className="group cursor-default">
                           <div className="flex items-center justify-between mb-3 text-[10px] font-black uppercase tracking-widest">
                               <span className="text-zinc-text group-hover:text-brand transition-colors">{wh.name}</span>
                               <span className={cn(
                                   "px-2 py-0.5 rounded border",
                                   wh.used / wh.capacity > 0.8 ? "bg-warning/10 text-warning border-warning/30" : "bg-brand/10 text-brand border-brand/30"
                               )}>
                                   {wh.status}
                               </span>
                           </div>
                           <AmberProgress 
                                value={(wh.used / wh.capacity) * 100} 
                                variant={wh.used / wh.capacity > 0.8 ? 'warning' : 'primary'}
                                className="h-2"
                           />
                           <div className="flex items-center justify-between mt-3 text-[10px] font-black text-zinc-muted uppercase tracking-[0.2em]">
                               <span>Allocated: {wh.used} units</span>
                               <span>Capacity: {wh.capacity} units</span>
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
        title="Inventory Matrix Configuration"
        description="Filter resource allocation by status, category, and storage node identifiers."
      >
          <div className="space-y-8 py-4">
              <div className="space-y-3">
                  <label className="text-[10px] font-black text-zinc-muted uppercase tracking-widest">Global Search</label>
                  <AmberInput 
                    placeholder="Scan per name or SKU..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="h-12"
                  />
              </div>

              <div className="h-px bg-white/5" />

              <div className="space-y-6">
                <div className="space-y-3">
                    <label className="text-[10px] font-black text-zinc-muted uppercase tracking-widest">Operational Status</label>
                    <AmberDropdown 
                        options={[
                            { label: 'All Protocols', value: 'all' },
                            { label: 'Sufficient Stock', value: 'in_stock' },
                            { label: 'Depleting Resources', value: 'low_stock' },
                            { label: 'Exhausted Units', value: 'out_of_stock' },
                        ]}
                        value={statusFilter}
                        onChange={setStatusFilter}
                        className="h-12 w-full"
                    />
                </div>
              </div>
              
              <div className="pt-8">
                  <AmberButton className="w-full h-12 bg-zinc-text text-black font-black uppercase tracking-widest" onClick={() => setIsFilterOpen(false)}>
                      Apply Configuration
                  </AmberButton>
              </div>
          </div>
      </AmberSlideOver>
    </div>
  );
};

export default InventoryOverviewPage;
