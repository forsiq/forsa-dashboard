
import React, { useState, useMemo } from 'react';
import { AmberCard } from '../../../amber-ui/components/AmberCard';
import { AmberButton } from '../../../amber-ui/components/AmberButton';
import { AmberInput } from '../../../amber-ui/components/AmberInput';
import { AmberDropdown } from '../../../amber-ui/components/AmberDropdown';
import { AmberSlideOver } from '../../../amber-ui/components/AmberSlideOver';
import { 
  Package, 
  Search, 
  Filter, 
  Download, 
  Printer, 
  ChevronDown, 
  ChevronRight, 
  MoreHorizontal, 
  CheckSquare, 
  Square,
  AlertTriangle,
  ArrowRightLeft,
  Edit,
  MapPin,
  RefreshCw,
  Trash2,
  X,
  Plus
} from 'lucide-react';
import { cn } from '../../../lib/cn';

// --- Types ---
interface WarehouseStock {
  id: string;
  name: string;
  quantity: number;
}

interface ProductStock {
  id: string;
  name: string;
  sku: string;
  category: string;
  image: string; // Color placeholder for now
  totalStock: number;
  minStock: number;
  status: 'In Stock' | 'Low Stock' | 'Out of Stock';
  breakdown: WarehouseStock[];
}

// --- Mock Data ---
const MOCK_INVENTORY: ProductStock[] = Array.from({ length: 30 }).map((_, i) => {
  const total = Math.floor(Math.random() * 200);
  const min = 20;
  const status = total === 0 ? 'Out of Stock' : total < min ? 'Low Stock' : 'In Stock';
  
  return {
    id: `SKU-${8000 + i}`,
    name: [
      'Neural-Link Adapter', 'Quantum Glass Screen', 'Haptic Feedback Gloves', 
      'Obsidian Keyboard Base', 'Ceramic Keycaps Set', 'Wireless Charging Pad',
      'Noise-Cancel Earpads', 'USB-C Braided Cable', 'Monitor Stand Aluminum'
    ][i % 9] + (i > 8 ? ` v${Math.floor(i / 9) + 1}` : ''),
    sku: `ZN-${1000 + i}`,
    category: ['Electronics', 'Accessories', 'Peripherals', 'Components'][i % 4],
    image: `hsl(${Math.random() * 360}, 60%, 25%)`,
    totalStock: total,
    minStock: min,
    status,
    breakdown: [
      { id: 'wh_1', name: 'US-East', quantity: Math.floor(total * 0.6) },
      { id: 'wh_2', name: 'EU-Central', quantity: Math.floor(total * 0.3) },
      { id: 'wh_3', name: 'APAC-Sing', quantity: total - Math.floor(total * 0.6) - Math.floor(total * 0.3) }
    ]
  };
});

export const StockOverview = () => {
  // -- State --
  const [items, setItems] = useState<ProductStock[]>(MOCK_INVENTORY);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [expandedRowIds, setExpandedRowIds] = useState<Set<string>>(new Set());
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  
  // SlideOver State
  const [isAdjustOpen, setIsAdjustOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<ProductStock | null>(null);

  // -- Pagination --
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // -- Filtering Logic --
  const filteredItems = useMemo(() => {
    return items.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            item.sku.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = categoryFilter === 'All' || item.category === categoryFilter;
      const matchesStatus = statusFilter === 'All' || item.status === statusFilter;
      
      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [items, searchQuery, categoryFilter, statusFilter]);

  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredItems.slice(start, start + itemsPerPage);
  }, [filteredItems, currentPage]);

  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);

  // -- Handlers --
  const toggleRow = (id: string) => {
    const newSet = new Set(expandedRowIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setExpandedRowIds(newSet);
  };

  const toggleSelect = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedIds(newSet);
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === paginatedItems.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(paginatedItems.map(i => i.id)));
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'In Stock': return 'text-success bg-success/10 border-success/20';
      case 'Low Stock': return 'text-warning bg-warning/10 border-warning/20';
      case 'Out of Stock': return 'text-danger bg-danger/10 border-danger/20';
      default: return 'text-zinc-muted';
    }
  };

  return (
    <div className="animate-fade-up space-y-6 min-h-[calc(100vh-100px)] flex flex-col relative">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
             <Package className="w-5 h-5 text-brand" />
             <h1 className="text-2xl font-black text-zinc-text uppercase italic tracking-tighter">Stock Overview</h1>
          </div>
          <p className="text-[10px] font-black text-zinc-muted uppercase tracking-[0.3em] mt-1">Multi-location inventory tracking</p>
        </div>
        <div className="flex gap-2">
          <AmberButton variant="ghost" size="sm">
            <Printer className="w-3.5 h-3.5 mr-2" /> Print Labels
          </AmberButton>
          <AmberButton size="sm">
            <Download className="w-3.5 h-3.5 mr-2" /> Export CSV
          </AmberButton>
        </div>
      </div>

      {/* Filter Bar */}
      <AmberCard noPadding className="p-4 flex flex-col lg:flex-row gap-4 items-end bg-obsidian-panel border-white/5 shadow-lg relative z-20">
        <div className="flex-1 w-full">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-muted" />
            <input 
              type="text" 
              placeholder="Search by Name or SKU..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 bg-obsidian-outer border border-white/5 rounded-sm pl-10 pr-4 text-xs font-bold text-zinc-text outline-none focus:border-brand/30 transition-all placeholder:text-zinc-muted/50"
            />
          </div>
        </div>
        
        <AmberDropdown 
          label="Category"
          options={['All', 'Electronics', 'Accessories', 'Peripherals', 'Components'].map(c => ({label: c, value: c}))}
          value={categoryFilter}
          onChange={setCategoryFilter}
          className="w-full lg:w-48"
        />

        <AmberDropdown 
          label="Stock Status"
          options={['All', 'In Stock', 'Low Stock', 'Out of Stock'].map(s => ({label: s, value: s}))}
          value={statusFilter}
          onChange={setStatusFilter}
          className="w-full lg:w-48"
        />
        
        <button className="h-10 px-4 bg-obsidian-card border border-white/5 text-zinc-muted hover:text-zinc-text transition-all rounded-sm flex items-center justify-center hover:bg-white/5">
          <Filter className="w-4 h-4" />
        </button>
      </AmberCard>

      {/* Bulk Actions Bar */}
      <div className={cn(
         "fixed bottom-6 left-1/2 -translate-x-1/2 bg-obsidian-card border border-white/10 shadow-2xl rounded-full px-6 py-3 flex items-center gap-6 z-40 transition-all duration-300",
         selectedIds.size > 0 ? "translate-y-0 opacity-100" : "translate-y-20 opacity-0 pointer-events-none"
      )}>
         <span className="text-[10px] font-black text-zinc-text uppercase tracking-widest border-r border-white/10 pr-6">
            {selectedIds.size} Selected
         </span>
         <div className="flex items-center gap-2">
            <button className="p-2 text-zinc-muted hover:text-brand transition-colors rounded-full hover:bg-white/5" title="Bulk Update">
               <Edit className="w-4 h-4" />
            </button>
            <button className="p-2 text-zinc-muted hover:text-info transition-colors rounded-full hover:bg-white/5" title="Transfer">
               <ArrowRightLeft className="w-4 h-4" />
            </button>
            <div className="w-px h-4 bg-white/10 mx-1" />
            <button className="p-2 text-zinc-muted hover:text-danger transition-colors rounded-full hover:bg-white/5" title="Delete">
               <Trash2 className="w-4 h-4" />
            </button>
         </div>
         <button onClick={() => setSelectedIds(new Set())} className="ml-2 p-1 bg-white/10 rounded-full text-zinc-muted hover:bg-white/20 transition-colors">
            <X className="w-3 h-3" />
         </button>
      </div>

      {/* Data Table */}
      <AmberCard noPadding className="flex-1 flex flex-col bg-obsidian-panel border-white/5 shadow-xl overflow-hidden">
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left min-w-[900px]">
            <thead className="bg-obsidian-outer/50 border-b border-white/5 text-[9px] font-black text-zinc-muted uppercase tracking-widest sticky top-0 z-10">
              <tr>
                <th className="w-12 px-6 py-4 text-center">
                  <button onClick={toggleSelectAll} className="hover:text-brand transition-colors">
                    {selectedIds.size > 0 && selectedIds.size === paginatedItems.length ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
                  </button>
                </th>
                <th className="w-12"></th>
                <th className="px-6 py-4">Product</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Total Stock</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.03]">
              {paginatedItems.map((item) => (
                <React.Fragment key={item.id}>
                  <tr className={cn(
                    "hover:bg-white/[0.02] transition-colors group",
                    expandedRowIds.has(item.id) && "bg-white/[0.02]",
                    selectedIds.has(item.id) && "bg-brand/[0.03]"
                  )}>
                    <td className="px-6 py-4 text-center">
                      <button onClick={() => toggleSelect(item.id)} className={cn("transition-colors", selectedIds.has(item.id) ? "text-brand" : "text-zinc-muted")}>
                        {selectedIds.has(item.id) ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
                      </button>
                    </td>
                    <td className="px-2 py-4 text-center">
                      <button 
                        onClick={() => toggleRow(item.id)}
                        className={cn(
                          "p-1 rounded-sm text-zinc-muted hover:text-brand hover:bg-white/5 transition-all",
                          expandedRowIds.has(item.id) && "text-brand rotate-90"
                        )}
                      >
                        <ChevronRight className="w-4 h-4 transition-transform" />
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div 
                          className="w-10 h-10 rounded-sm bg-obsidian-outer border border-white/5 shrink-0" 
                          style={{ backgroundColor: item.image }}
                        />
                        <div>
                          <p className="text-xs font-bold text-zinc-text truncate max-w-[200px]">{item.name}</p>
                          <p className="text-[9px] font-bold text-zinc-muted font-mono mt-0.5">{item.sku}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-[10px] font-bold text-zinc-secondary bg-white/5 px-2 py-1 rounded-sm border border-white/5">
                        {item.category}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-bold text-zinc-text">{item.totalStock} <span className="text-[9px] text-zinc-muted font-medium">Units</span></span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "text-[9px] font-black px-2 py-0.5 rounded-sm border uppercase tracking-widest inline-flex items-center gap-1.5",
                        getStatusColor(item.status)
                      )}>
                        {item.status === 'Low Stock' && <AlertTriangle className="w-3 h-3" />}
                        {item.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-1">
                        <button 
                          className="p-1.5 text-zinc-muted hover:text-brand hover:bg-white/5 rounded-sm transition-colors"
                          onClick={() => { setSelectedProduct(item); setIsAdjustOpen(true); }}
                          title="Adjust Stock"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button className="p-1.5 text-zinc-muted hover:text-zinc-text hover:bg-white/5 rounded-sm transition-colors">
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                  
                  {/* Expanded Row Details */}
                  {expandedRowIds.has(item.id) && (
                    <tr className="bg-obsidian-outer/30 shadow-inner">
                      <td colSpan={7} className="px-6 py-4">
                        <div className="ml-14 grid grid-cols-1 md:grid-cols-3 gap-4">
                          {item.breakdown.map(wh => (
                            <div key={wh.id} className="p-3 bg-obsidian-panel border border-white/5 rounded-sm flex items-center justify-between">
                               <div className="flex items-center gap-3">
                                  <div className="p-1.5 bg-obsidian-outer rounded-sm text-zinc-muted">
                                     <MapPin className="w-3.5 h-3.5" />
                                  </div>
                                  <span className="text-[10px] font-bold text-zinc-text uppercase tracking-wide">{wh.name}</span>
                               </div>
                               <span className="text-xs font-mono font-bold text-brand">{wh.quantity}</span>
                            </div>
                          ))}
                          <div className="flex items-center justify-center p-3 border border-dashed border-white/10 rounded-sm hover:border-brand/30 hover:bg-brand/5 cursor-pointer transition-all group">
                             <span className="text-[9px] font-bold text-zinc-muted group-hover:text-brand uppercase tracking-widest flex items-center gap-2">
                                <Plus className="w-3 h-3" /> Add Warehouse
                             </span>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 border-t border-white/5 bg-obsidian-outer/30 flex justify-between items-center">
           <p className="text-[10px] font-black text-zinc-muted uppercase tracking-[0.2em]">Showing {(currentPage - 1) * itemsPerPage + 1}-{Math.min(currentPage * itemsPerPage, filteredItems.length)} of {filteredItems.length}</p>
           <div className="flex gap-2">
              <button 
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                className="px-4 py-1.5 bg-obsidian-card border border-white/5 rounded-sm text-[10px] font-black text-zinc-muted hover:text-zinc-text uppercase tracking-widest disabled:opacity-50 transition-all"
              >
                Previous
              </button>
              <button 
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                className="px-4 py-1.5 bg-obsidian-card border border-white/5 rounded-sm text-[10px] font-black text-zinc-muted hover:text-zinc-text uppercase tracking-widest disabled:opacity-50 transition-all"
              >
                Next
              </button>
           </div>
        </div>
      </AmberCard>

      {/* Adjust Stock Modal */}
      <AmberSlideOver
        isOpen={isAdjustOpen}
        onClose={() => setIsAdjustOpen(false)}
        title="Adjust Stock Levels"
        description={`Modify inventory counts for ${selectedProduct?.name}`}
        footer={
           <>
              <AmberButton variant="ghost" onClick={() => setIsAdjustOpen(false)}>Cancel</AmberButton>
              <AmberButton onClick={() => setIsAdjustOpen(false)}>Save Changes</AmberButton>
           </>
        }
      >
         <div className="space-y-6">
            {selectedProduct?.breakdown.map(wh => (
               <div key={wh.id} className="space-y-1.5">
                  <div className="flex justify-between items-center px-1">
                     <label className="text-[9px] font-black text-zinc-muted uppercase tracking-widest">{wh.name}</label>
                     <span className="text-[9px] font-bold text-zinc-secondary">Current: {wh.quantity}</span>
                  </div>
                  <div className="flex gap-2">
                     <AmberInput 
                        type="number" 
                        defaultValue={0} 
                        className="font-mono"
                     />
                     <div className="flex gap-1">
                        <button className="px-3 bg-success/10 border border-success/20 text-success rounded-sm hover:bg-success/20 transition-colors font-bold">+</button>
                        <button className="px-3 bg-danger/10 border border-danger/20 text-danger rounded-sm hover:bg-danger/20 transition-colors font-bold">-</button>
                     </div>
                  </div>
               </div>
            ))}
            <div className="p-4 bg-obsidian-outer border border-white/5 rounded-sm">
               <h4 className="text-[10px] font-black text-zinc-text uppercase tracking-widest mb-2 flex items-center gap-2">
                  <RefreshCw className="w-3 h-3" /> Reason for Adjustment
               </h4>
               <AmberDropdown 
                  options={[
                     { label: 'Stock Correction', value: 'correction' },
                     { label: 'Damaged Goods', value: 'damaged' },
                     { label: 'Return Restock', value: 'return' },
                     { label: 'Received Shipment', value: 'received' },
                  ]}
                  value="correction"
                  onChange={() => {}}
                  className="w-full"
               />
            </div>
         </div>
      </AmberSlideOver>
    </div>
  );
};
