
import React, { useState, useMemo, useEffect } from 'react';
import { AmberCard } from '../amber-ui/components/AmberCard';
import { AmberButton } from '../amber-ui/components/AmberButton';
import { AmberDropdown } from '../amber-ui/components/AmberDropdown';
import { AmberInput } from '../amber-ui/components/AmberInput';
import { AmberSlideOver } from '../amber-ui/components/AmberSlideOver';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  MoreVertical, 
  Package, 
  Eye, 
  Lock, 
  Download, 
  Edit, 
  Trash2, 
  TrendingUp, 
  ArrowRight, 
  ExternalLink,
  Filter,
  CheckSquare,
  Square,
  ArrowUpDown,
  RotateCcw,
  SlidersHorizontal,
  Copy,
  Tag,
  Archive,
  DollarSign,
  Layers
} from 'lucide-react';
import { useLanguage } from '../amber-ui/contexts/LanguageContext';
import { cn } from '../lib/cn';

// Enhanced Mock Data
const MOCK_PRODUCTS = Array.from({ length: 45 }).map((_, i) => ({
  id: `SKU-${8000 + i}`,
  name: [
    'Neural-Link Audio Transceiver', 'Obsidian Tactile Keyboard', 'Quantum Glass Display', 
    'Bio-Metric Secure Keycard', 'Holographic Desk Mat', 'Zero-G Ergonomic Chair',
    'Nano-Fiber Hoodie', 'Stealth Noise-Cancelling Buds', 'Modular Power Bank'
  ][i % 9] + (i > 8 ? ` v${Math.floor(i / 9) + 1}` : ''),
  category: ['Electronics', 'Luxury', 'Home & Office', 'Fashion', 'Security'][i % 5],
  brand: ['ZoneVast', 'TechCore', 'LuxeLife', 'SecureSys'][i % 4],
  price: (Math.random() * 500 + 50).toFixed(2),
  stock: Math.floor(Math.random() * 200),
  status: ['Active', 'Draft', 'Low Stock', 'Archived'][i % 4],
  isPrivate: i % 7 === 0,
  image: null // Placeholder for now
}));

export const Catalog = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();

  // -- State --
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  
  // Filters
  const [filters, setFilters] = useState({
    category: 'All',
    status: 'All',
    brand: 'All',
    stockMin: '',
    stockMax: '',
    priceMin: '',
    priceMax: ''
  });

  // Sorting
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' }>({ 
    key: 'name', 
    direction: 'asc' 
  });

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Actions Menu State
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  // -- Derived Data --
  const filteredProducts = useMemo(() => {
    return MOCK_PRODUCTS.filter(p => {
      const matchesSearch = 
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        p.id.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory = filters.category === 'All' || p.category === filters.category;
      const matchesStatus = filters.status === 'All' || p.status === filters.status;
      const matchesBrand = filters.brand === 'All' || p.brand === filters.brand;
      
      const price = parseFloat(p.price);
      const matchesPrice = 
        (!filters.priceMin || price >= parseFloat(filters.priceMin)) &&
        (!filters.priceMax || price <= parseFloat(filters.priceMax));

      const matchesStock = 
        (!filters.stockMin || p.stock >= parseInt(filters.stockMin)) &&
        (!filters.stockMax || p.stock <= parseInt(filters.stockMax));

      return matchesSearch && matchesCategory && matchesStatus && matchesBrand && matchesPrice && matchesStock;
    }).sort((a, b) => {
      const aValue = a[sortConfig.key as keyof typeof a];
      const bValue = b[sortConfig.key as keyof typeof b];
      
      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [searchQuery, filters, sortConfig]);

  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredProducts.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredProducts, currentPage]);

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

  // -- Handlers --

  const handleSelectAll = () => {
    if (selectedIds.size === paginatedProducts.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(paginatedProducts.map(p => p.id)));
    }
  };

  const handleSelectRow = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const handleSort = (key: string) => {
    setSortConfig(current => ({
      key,
      direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handleBulkAction = (action: string) => {
    console.log(`Bulk Action: ${action} on ${selectedIds.size} items`);
    // Implement bulk action logic here
    setSelectedIds(new Set());
  };

  const resetFilters = () => {
    setFilters({
      category: 'All',
      status: 'All',
      brand: 'All',
      stockMin: '',
      stockMax: '',
      priceMin: '',
      priceMax: ''
    });
    setSearchQuery('');
  };

  // Close menus on click outside
  useEffect(() => {
    const handleClickOutside = () => setActiveMenuId(null);
    if (activeMenuId) window.addEventListener('click', handleClickOutside);
    return () => window.removeEventListener('click', handleClickOutside);
  }, [activeMenuId]);

  return (
    <div className="space-y-6 animate-fade-up min-h-[calc(100vh-100px)] flex flex-col">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-zinc-text uppercase italic tracking-tighter">{t('prod.title')}</h1>
          <p className="text-[10px] font-black text-zinc-muted uppercase tracking-[0.3em] mt-1">{t('prod.desc')}</p>
        </div>
        <div className="flex gap-2">
          <AmberButton variant="ghost" size="sm">
            <Download className="w-3.5 h-3.5 mr-2" /> {t('prod.export')}
          </AmberButton>
          <AmberButton size="sm" onClick={() => navigate('/catalog/new')}>
            <Plus className="w-3.5 h-3.5 mr-2" /> {t('prod.add_sku')}
          </AmberButton>
        </div>
      </div>

      {/* Bulk Actions Bar (Conditional) */}
      {selectedIds.size > 0 && (
        <div className="bg-brand/10 border border-brand/20 rounded-sm p-3 flex items-center justify-between animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-3">
            <span className="bg-brand text-obsidian-outer text-[10px] font-black px-2 py-0.5 rounded-sm">
              {selectedIds.size} Selected
            </span>
            <span className="text-[10px] font-bold text-zinc-text uppercase tracking-wide">
              Bulk Actions Available
            </span>
          </div>
          <div className="flex gap-2">
            <AmberButton size="sm" variant="ghost" className="hover:bg-brand/20 hover:text-brand" onClick={() => handleBulkAction('status')}>
              Change Status
            </AmberButton>
            <AmberButton size="sm" variant="ghost" className="hover:bg-brand/20 hover:text-brand" onClick={() => handleBulkAction('price')}>
              Update Price
            </AmberButton>
            <div className="w-px h-6 bg-brand/20 mx-1" />
            <AmberButton size="sm" variant="ghost" className="text-danger hover:bg-danger/10" onClick={() => handleBulkAction('delete')}>
              <Trash2 className="w-3.5 h-3.5 mr-2" /> Delete
            </AmberButton>
          </div>
        </div>
      )}

      {/* Main Content Card */}
      <AmberCard noPadding className="flex-1 flex flex-col overflow-hidden bg-obsidian-panel border-white/10 shadow-2xl">
        
        {/* Toolbar */}
        <div className="p-4 border-b border-white/5 flex flex-col lg:flex-row gap-4 items-end bg-obsidian-outer/30">
          <div className="flex-1 w-full">
            <div className="relative">
              <Search className="absolute left-3 rtl:left-auto rtl:right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-muted" />
              <input 
                type="text" 
                placeholder="Search by Name, SKU..."
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                className="w-full h-10 bg-obsidian-outer border border-white/5 rounded-sm pl-10 pr-4 text-xs font-bold text-zinc-text outline-none focus:border-brand/30 transition-all placeholder:text-zinc-muted/50"
              />
            </div>
          </div>
          
          <AmberDropdown 
            label="Category" 
            options={['All', 'Electronics', 'Luxury', 'Home & Office', 'Fashion', 'Security'].map(c => ({ label: c, value: c }))} 
            value={filters.category} 
            onChange={(val) => setFilters({...filters, category: val})}
            className="w-full lg:w-40"
          />
          
          <AmberDropdown 
            label="Status" 
            options={['All', 'Active', 'Draft', 'Low Stock', 'Archived'].map(s => ({ label: s, value: s }))} 
            value={filters.status} 
            onChange={(val) => setFilters({...filters, status: val})}
            className="w-full lg:w-40"
          />

          <button 
            onClick={() => setIsFilterOpen(true)}
            className={cn(
              "h-10 px-4 border border-white/5 text-zinc-muted hover:text-zinc-text transition-all rounded-sm flex items-center justify-center hover:bg-white/5",
              isFilterOpen && "bg-white/5 text-brand border-brand/30"
            )}
            title="Advanced Filters"
          >
            <SlidersHorizontal className="w-4 h-4" />
          </button>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-start border-collapse min-w-[1000px]">
            <thead className="sticky top-0 z-10 bg-obsidian-panel border-b border-white/5 shadow-sm">
              <tr>
                <th className="w-12 px-6 py-4 text-center">
                  <button 
                    onClick={handleSelectAll} 
                    className="text-zinc-muted hover:text-brand transition-colors"
                  >
                    {selectedIds.size > 0 && selectedIds.size === paginatedProducts.length ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
                  </button>
                </th>
                {[
                  { key: 'image', label: '', sortable: false, width: 'w-16' },
                  { key: 'name', label: t('prod.table.asset'), sortable: true },
                  { key: 'category', label: t('label.category'), sortable: true },
                  { key: 'price', label: t('prod.table.valuation'), sortable: true },
                  { key: 'stock', label: t('prod.table.inventory'), sortable: true },
                  { key: 'status', label: t('prod.table.lifecycle'), sortable: true },
                ].map((col, i) => (
                  <th 
                    key={i} 
                    className={cn(
                      "px-6 py-4 text-start text-[10px] font-black text-zinc-muted uppercase tracking-widest cursor-pointer select-none group",
                      col.width
                    )}
                    onClick={() => col.sortable && handleSort(col.key)}
                  >
                    <div className="flex items-center gap-1.5">
                      {col.label}
                      {col.sortable && (
                        <ArrowUpDown className={cn(
                          "w-3 h-3 transition-colors",
                          sortConfig.key === col.key ? "text-brand opacity-100" : "opacity-0 group-hover:opacity-30"
                        )} />
                      )}
                    </div>
                  </th>
                ))}
                <th className="px-6 py-4 text-end"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.03]">
              {paginatedProducts.length > 0 ? (
                paginatedProducts.map((p) => (
                  <tr 
                    key={p.id} 
                    className={cn(
                      "transition-colors group",
                      selectedIds.has(p.id) ? "bg-brand/[0.02]" : "hover:bg-white/[0.02]"
                    )}
                  >
                    <td className="px-6 py-3 text-center">
                      <button onClick={() => handleSelectRow(p.id)} className={cn("transition-colors", selectedIds.has(p.id) ? "text-brand" : "text-zinc-muted")}>
                        {selectedIds.has(p.id) ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
                      </button>
                    </td>
                    <td className="px-6 py-3">
                      <div className="w-10 h-10 bg-obsidian-outer rounded-sm border border-white/5 flex items-center justify-center group-hover:border-brand/20 transition-colors">
                        <Package className="w-5 h-5 text-zinc-muted group-hover:text-brand transition-colors" strokeWidth={1.5} />
                      </div>
                    </td>
                    <td className="px-6 py-3">
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                           <span className="text-sm font-bold text-zinc-text group-hover:text-brand transition-colors truncate max-w-[200px]">{p.name}</span>
                           {p.isPrivate && <Lock className="w-3 h-3 text-brand/70" />}
                        </div>
                        <span className="font-mono text-[9px] font-bold text-zinc-muted uppercase tracking-widest mt-0.5">{p.id}</span>
                      </div>
                    </td>
                    <td className="px-6 py-3">
                      <span className="text-[10px] font-black text-zinc-secondary bg-white/5 px-2 py-0.5 rounded-sm uppercase tracking-wide">{p.category}</span>
                    </td>
                    <td className="px-6 py-3">
                      <span className="text-xs font-bold text-zinc-text">${p.price}</span>
                    </td>
                    <td className="px-6 py-3">
                      <div className={cn(
                        "text-[10px] font-bold uppercase tracking-wide flex items-center gap-2",
                        p.stock < 10 ? "text-danger" : p.stock < 50 ? "text-warning" : "text-success"
                      )}>
                        {p.stock} <span className="text-zinc-muted opacity-60">Units</span>
                      </div>
                    </td>
                    <td className="px-6 py-3">
                      <span className={cn(
                        "text-[9px] font-black px-2 py-0.5 rounded-sm border uppercase tracking-widest",
                        p.status === 'Active' ? 'bg-success/5 text-success border-success/20' : 
                        p.status === 'Draft' ? 'bg-zinc-muted/5 text-zinc-muted border-white/10' : 
                        p.status === 'Low Stock' ? 'bg-warning/5 text-warning border-warning/20' :
                        'bg-danger/5 text-danger border-danger/20'
                      )}>
                        {p.status}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-end relative">
                      <button 
                        onClick={(e) => { e.stopPropagation(); setActiveMenuId(activeMenuId === p.id ? null : p.id); }}
                        className={cn(
                          "p-2 rounded-sm transition-all",
                          activeMenuId === p.id ? "bg-white/10 text-zinc-text" : "text-zinc-muted hover:text-zinc-text hover:bg-white/5"
                        )}
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>
                      
                      {activeMenuId === p.id && (
                        <div className="absolute right-8 top-8 w-40 bg-obsidian-card border border-white/10 rounded-sm shadow-xl z-50 py-1 animate-in fade-in zoom-in-95 duration-100 origin-top-right">
                          <button className="w-full text-left px-4 py-2 text-[10px] font-bold text-zinc-text hover:bg-white/5 uppercase tracking-widest flex items-center gap-2">
                            <Edit className="w-3.5 h-3.5" /> Edit
                          </button>
                          <button className="w-full text-left px-4 py-2 text-[10px] font-bold text-zinc-text hover:bg-white/5 uppercase tracking-widest flex items-center gap-2">
                            <Copy className="w-3.5 h-3.5" /> Duplicate
                          </button>
                          <button className="w-full text-left px-4 py-2 text-[10px] font-bold text-zinc-text hover:bg-white/5 uppercase tracking-widest flex items-center gap-2">
                            <TrendingUp className="w-3.5 h-3.5" /> Analytics
                          </button>
                          <div className="h-px bg-white/5 my-1" />
                          <button className="w-full text-left px-4 py-2 text-[10px] font-bold text-danger hover:bg-danger/10 uppercase tracking-widest flex items-center gap-2">
                            <Trash2 className="w-3.5 h-3.5" /> Delete
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="px-6 py-20 text-center text-zinc-muted opacity-50">
                    <Package className="w-12 h-12 mx-auto mb-3 stroke-1" />
                    <p className="text-xs uppercase tracking-widest">No products found matching filters</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="bg-obsidian-outer/30 px-6 py-4 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
           <p className="text-[10px] text-zinc-muted font-black uppercase tracking-[0.2em]">
             Showing {(currentPage - 1) * itemsPerPage + 1}-{Math.min(currentPage * itemsPerPage, filteredProducts.length)} of {filteredProducts.length}
           </p>
           <div className="flex gap-2">
             <button 
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                className="px-4 py-1.5 text-[10px] font-black text-zinc-muted bg-obsidian-card border border-white/5 rounded-sm hover:bg-obsidian-hover hover:border-brand/20 disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-widest transition-all"
             >
                Previous
             </button>
             <div className="flex items-center gap-1 px-2">
                {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => (
                   <button
                      key={i}
                      onClick={() => setCurrentPage(i + 1)}
                      className={cn(
                         "w-6 h-6 flex items-center justify-center rounded-sm text-[10px] font-bold transition-all",
                         currentPage === i + 1 ? "bg-brand text-obsidian-outer" : "text-zinc-muted hover:bg-white/5"
                      )}
                   >
                      {i + 1}
                   </button>
                ))}
             </div>
             <button 
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                className="px-4 py-1.5 text-[10px] font-black text-zinc-text bg-obsidian-card border border-white/5 rounded-sm hover:bg-obsidian-hover hover:border-brand/20 disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-widest transition-all"
             >
                Next
             </button>
           </div>
        </div>
      </AmberCard>

      {/* Advanced Filter SlideOver */}
      <AmberSlideOver
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        title="Advanced Filters"
        description="Refine catalog view with granular parameters."
        footer={
            <>
                <AmberButton variant="ghost" onClick={resetFilters}>
                    <RotateCcw className="w-3.5 h-3.5 mr-2" /> Reset
                </AmberButton>
                <AmberButton onClick={() => setIsFilterOpen(false)}>
                    View Results
                </AmberButton>
            </>
        }
      >
        <div className="space-y-8">
            {/* Price Range */}
            <section className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-white/5">
                    <DollarSign className="w-4 h-4 text-brand" />
                    <h3 className="text-xs font-black text-zinc-text uppercase tracking-widest">Price Range</h3>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <AmberInput 
                        label="Min Price"
                        type="number"
                        placeholder="0.00"
                        value={filters.priceMin}
                        onChange={(e) => setFilters({...filters, priceMin: e.target.value})}
                    />
                    <AmberInput 
                        label="Max Price"
                        type="number"
                        placeholder="Any"
                        value={filters.priceMax}
                        onChange={(e) => setFilters({...filters, priceMax: e.target.value})}
                    />
                </div>
            </section>

            {/* Stock Levels */}
            <section className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-white/5">
                    <Layers className="w-4 h-4 text-brand" />
                    <h3 className="text-xs font-black text-zinc-text uppercase tracking-widest">Stock Levels</h3>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <AmberInput 
                        label="Min Units"
                        type="number"
                        placeholder="0"
                        value={filters.stockMin}
                        onChange={(e) => setFilters({...filters, stockMin: e.target.value})}
                    />
                    <AmberInput 
                        label="Max Units"
                        type="number"
                        placeholder="Any"
                        value={filters.stockMax}
                        onChange={(e) => setFilters({...filters, stockMax: e.target.value})}
                    />
                </div>
            </section>

            {/* Brand Filter */}
            <section className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-white/5">
                    <Tag className="w-4 h-4 text-brand" />
                    <h3 className="text-xs font-black text-zinc-text uppercase tracking-widest">Brand</h3>
                </div>
                <AmberDropdown 
                    options={['All', 'ZoneVast', 'TechCore', 'LuxeLife', 'SecureSys'].map(b => ({ label: b, value: b }))}
                    value={filters.brand}
                    onChange={(val) => setFilters({...filters, brand: val})}
                    className="w-full"
                />
            </section>
        </div>
      </AmberSlideOver>
    </div>
  );
};
