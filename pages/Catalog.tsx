
import React, { useState, useEffect } from 'react';
import { Card } from '../components/Card';
import { Dropdown } from '../components/ui/Dropdown';
import { Link } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  MoreHorizontal, 
  Package,
  Eye,
  Lock,
  Download,
  Edit,
  Trash2,
  TrendingUp,
  ArrowRight,
  ExternalLink
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { cn } from '../lib/cn';

const productsData = [
  { id: 'SKU-8821', name: 'Premium Wireless Headphones v2', category: 'cat.luxury', price: '$299.00', stock: 482, variants: 4, status: 'status.validated', isPrivate: true },
  { id: 'SKU-1022', name: 'Minimalist Leather Desk Pad', category: 'cat.home_office', price: '$45.00', stock: 1205, variants: 2, status: 'status.validated', isPrivate: false },
  { id: 'SKU-0092', name: 'Ergonomic Standing Desk Frame', category: 'cat.home_office', price: '$399.00', stock: 12, variants: 1, status: 'status.draft', isPrivate: true },
  { id: 'SKU-4412', name: 'Recycled Ocean Plastic Jacket', category: 'cat.boutique', price: '$189.00', stock: 89, variants: 12, status: 'status.validated', isPrivate: false },
  { id: 'SKU-9921', name: '4K Ultra-Thin Design Monitor', category: 'cat.electronics', price: '$849.00', stock: 5, variants: 3, status: 'status.low_stock', isPrivate: false },
];

export const Catalog: React.FC = () => {
  const { t } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [quickViewId, setQuickViewId] = useState<string | null>(null);

  const categories = [
    { label: t('label.all'), value: 'all' },
    { label: t('cat.electronics'), value: 'cat.electronics' },
    { label: t('cat.luxury'), value: 'cat.luxury' },
    { label: t('cat.home_office'), value: 'cat.home_office' },
    { label: t('cat.boutique'), value: 'cat.boutique' },
  ];

  const statuses = [
    { label: t('label.all'), value: 'all' },
    { label: t('status.validated'), value: 'status.validated' },
    { label: t('status.draft'), value: 'status.draft' },
    { label: t('status.low_stock'), value: 'status.low_stock' },
  ];

  // Handle click outside to close menus
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('[data-dropdown-trigger]') && !target.closest('[data-dropdown-content]')) {
        setOpenMenuId(null);
        setQuickViewId(null);
      }
    };

    if (openMenuId || quickViewId) {
      document.addEventListener('click', handleClickOutside);
    }
    return () => document.removeEventListener('click', handleClickOutside);
  }, [openMenuId, quickViewId]);

  const filteredProducts = productsData.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          product.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    const matchesStatus = selectedStatus === 'all' || product.status === selectedStatus;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <div className="space-y-10 animate-fade-up relative">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
        <div>
          <h1 className="text-2xl font-black text-zinc-text uppercase tracking-tighter italic">{t('prod.title')}</h1>
          <p className="text-sm text-zinc-muted font-medium mt-1">{t('prod.desc')}</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-transparent rounded-sm text-[10px] font-bold text-zinc-muted hover:text-zinc-text transition-all uppercase tracking-widest">
            <Download className="w-3.5 h-3.5" /> {t('prod.export')}
          </button>
          <Link to="/catalog/new" className="flex items-center gap-2 px-5 py-2 bg-brand text-obsidian-outer rounded-sm text-[11px] font-bold shadow-sm hover:opacity-90 transition-all uppercase tracking-widest">
            <Plus className="w-4 h-4" /> {t('prod.add_sku')}
          </Link>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-obsidian-panel border border-white/10 rounded-sm p-4 flex flex-col lg:flex-row gap-4 items-end relative z-10">
        <div className="flex-1 w-full self-stretch">
          <label className="block text-[10px] font-black text-zinc-muted uppercase tracking-widest mb-1.5 px-1">
            Global SKU Query
          </label>
          <div className="relative">
            <Search className="absolute left-3 rtl:left-auto rtl:right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-muted" />
            <input 
              type="text" 
              placeholder={t('prod.search_placeholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-obsidian-outer border border-white/5 rounded-sm pl-10 pr-4 rtl:pr-10 rtl:pl-4 py-2.5 text-sm focus:border-brand/30 outline-none transition-all placeholder-zinc-muted h-[40px]"
            />
          </div>
        </div>
        
        <Dropdown 
          label={t('label.category')} 
          options={categories} 
          value={selectedCategory} 
          onChange={setSelectedCategory}
          className="w-full lg:w-48"
        />
        <Dropdown 
          label={t('label.status')} 
          options={statuses} 
          value={selectedStatus} 
          onChange={setSelectedStatus}
          className="w-full lg:w-48"
        />
      </div>

      {/* Main Table Content */}
      <Card noPadding className="border-white/10 shadow-2xl bg-obsidian-panel">
        <div className="overflow-x-auto">
          <table className="w-full text-start border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-obsidian-outer/30 border-b border-white/5">
                <th className="px-6 py-4 text-start text-[10px] font-black text-zinc-muted uppercase tracking-widest">{t('prod.table.asset')}</th>
                <th className="px-6 py-4 text-start text-[10px] font-black text-zinc-muted uppercase tracking-widest">{t('prod.table.info')}</th>
                <th className="px-6 py-4 text-start text-[10px] font-black text-zinc-muted uppercase tracking-widest">{t('prod.table.valuation')}</th>
                <th className="px-6 py-4 text-start text-[10px] font-black text-zinc-muted uppercase tracking-widest">{t('prod.table.inventory')}</th>
                <th className="px-6 py-4 text-start text-[10px] font-black text-zinc-muted uppercase tracking-widest">{t('prod.table.lifecycle')}</th>
                <th className="px-6 py-4 text-end"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.03]">
              {filteredProducts.map((p) => (
                <tr key={p.id} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="px-6 py-3">
                    <div className="w-10 h-10 bg-obsidian-outer rounded-sm border border-white/5 flex items-center justify-center group-hover:border-brand/20 transition-colors">
                      <Package className="w-5 h-5 text-zinc-muted group-hover:text-brand transition-colors" strokeWidth={1.5} />
                    </div>
                  </td>
                  <td className="px-6 py-3">
                    <div className="flex items-center gap-2">
                       <span className="text-sm font-bold text-zinc-text group-hover:text-brand transition-colors">{p.name}</span>
                       {p.isPrivate && <span className="bg-brand/10 text-brand p-1 rounded-sm" title="Proprietary"><Lock className="w-3 h-3" /></span>}
                    </div>
                    <div className="flex items-center gap-3 mt-1.5">
                      <span className="font-mono text-[10px] font-bold text-zinc-muted uppercase tracking-widest bg-white/[0.02] px-1.5 py-0.5 rounded-sm border border-white/5">{p.id}</span>
                      <span className="text-[10px] font-black text-zinc-muted/60 uppercase tracking-tight">{t(p.category)}</span>
                    </div>
                  </td>
                  <td className="px-6 py-3">
                    <span className="text-sm font-bold text-zinc-text">{p.price}</span>
                    <p className="text-[9px] text-zinc-muted font-black uppercase tracking-widest mt-0.5">MSRP</p>
                  </td>
                  <td className="px-6 py-3">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`text-sm font-bold ${p.stock < 20 ? 'text-danger' : 'text-zinc-text'}`}>{p.stock}</span>
                      <span className="text-[10px] text-zinc-muted font-bold uppercase">{t('prod.units')}</span>
                    </div>
                    <div className="w-32 h-1 bg-obsidian-outer rounded-full border border-white/5 overflow-hidden">
                       <div 
                         className={`h-full transition-all duration-1000 ${p.stock < 20 ? 'bg-danger shadow-[0_0_8px_rgba(224,108,117,0.4)]' : p.stock < 100 ? 'bg-warning shadow-[0_0_8px_rgba(245,196,81,0.4)]' : 'bg-success shadow-[0_0_8px_rgba(69,196,144,0.4)]'}`} 
                         style={{ width: `${Math.min(100, (p.stock/1500)*100)}%` }}
                       ></div>
                    </div>
                  </td>
                  <td className="px-6 py-3">
                    <span className={cn(
                      "text-[9px] font-black px-2.5 py-1 rounded-sm border uppercase tracking-[0.15em]",
                      p.status === 'status.validated' ? 'bg-success/5 text-success border-success/20 shadow-[0_0_10px_rgba(69,196,144,0.05)]' : 
                      p.status === 'status.draft' ? 'bg-zinc-muted/5 text-zinc-muted border-white/10' : 
                      'bg-warning/5 text-warning border-warning/20 shadow-[0_0_10px_rgba(245,196,81,0.05)]'
                    )}>
                      {t(p.status)}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-end relative">
                    <div className="flex items-center justify-end gap-1.5 relative">
                       {/* Quick View Dropdown Trigger */}
                       <div className="relative">
                          <button 
                            data-dropdown-trigger
                            onClick={(e) => {
                                e.stopPropagation();
                                setOpenMenuId(null); 
                                setQuickViewId(quickViewId === p.id ? null : p.id);
                            }}
                            className={cn(
                                "p-2 rounded-sm transition-all relative z-40",
                                quickViewId === p.id ? "bg-white/10 text-brand" : "text-zinc-muted hover:text-brand hover:bg-white/5"
                            )}
                          >
                            <Eye className="w-4.5 h-4.5" />
                          </button>

                          {quickViewId === p.id && (
                              <div data-dropdown-content className="absolute right-0 top-full mt-1 w-56 bg-obsidian-card border border-white/10 rounded-sm shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)] z-50 py-2 animate-in fade-in zoom-in-95 duration-200 text-left">
                                  <div className="px-4 py-2 border-b border-white/5 mb-1">
                                      <p className="text-[9px] font-black text-zinc-muted uppercase tracking-widest">Quick Snapshot</p>
                                      <p className="text-xs font-bold text-zinc-text mt-1 truncate">{p.name}</p>
                                  </div>
                                  <Link to="/templates/details" className="w-full text-left px-4 py-2 text-[10px] font-bold text-zinc-text hover:bg-white/5 uppercase tracking-widest flex items-center justify-between group transition-colors">
                                      View Full Details <ArrowRight className="w-3.5 h-3.5 text-zinc-muted group-hover:text-brand rtl:rotate-180" />
                                  </Link>
                                  <button className="w-full text-left px-4 py-2 text-[10px] font-bold text-zinc-text hover:bg-white/5 uppercase tracking-widest flex items-center justify-between group transition-colors">
                                      Preview Storefront <ExternalLink className="w-3.5 h-3.5 text-zinc-muted group-hover:text-info" />
                                  </button>
                              </div>
                          )}
                       </div>

                       {/* More Actions Dropdown */}
                       <div className="relative">
                           <button 
                                data-dropdown-trigger
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setQuickViewId(null); 
                                    setOpenMenuId(openMenuId === p.id ? null : p.id);
                                }}
                                className={cn(
                                    "p-2 rounded-sm transition-all relative z-40",
                                    openMenuId === p.id ? "bg-white/10 text-brand" : "text-zinc-muted hover:text-zinc-text hover:bg-white/5"
                                )}
                           >
                                <MoreHorizontal className="w-4.5 h-4.5" />
                           </button>

                           {openMenuId === p.id && (
                                <div data-dropdown-content className="absolute right-0 top-full mt-1 w-40 bg-obsidian-card border border-white/10 rounded-sm shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)] z-50 py-1 animate-in fade-in zoom-in-95 duration-200">
                                    <button className="w-full text-left px-4 py-2.5 text-[10px] font-bold text-zinc-text hover:bg-white/5 uppercase tracking-widest flex items-center gap-2 group transition-colors">
                                        <Edit className="w-3.5 h-3.5 text-zinc-muted group-hover:text-brand" /> Edit SKU
                                    </button>
                                    <button className="w-full text-left px-4 py-2.5 text-[10px] font-bold text-zinc-text hover:bg-white/5 uppercase tracking-widest flex items-center gap-2 group transition-colors">
                                        <TrendingUp className="w-3.5 h-3.5 text-zinc-muted group-hover:text-info" /> Analytics
                                    </button>
                                    <div className="h-px bg-white/5 my-1" />
                                    <button className="w-full text-left px-4 py-2.5 text-[10px] font-bold text-danger hover:bg-danger/10 uppercase tracking-widest flex items-center gap-2 transition-colors">
                                        <Trash2 className="w-3.5 h-3.5" /> Archive
                                    </button>
                                </div>
                           )}
                       </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Footer */}
        <div className="bg-obsidian-outer/30 px-6 py-4 border-t border-white/5 flex items-center justify-between">
           <p className="text-[10px] text-zinc-muted font-black uppercase tracking-[0.2em]">{t('prod.page_info')}</p>
           <div className="flex gap-2">
             <button disabled className="px-4 py-1.5 text-[10px] font-black text-zinc-muted bg-obsidian-card border border-white/5 rounded-sm opacity-50 uppercase tracking-widest">{t('prod.prev')}</button>
             <button className="px-4 py-1.5 text-[10px] font-black text-zinc-text bg-obsidian-card border border-white/5 rounded-sm hover:bg-obsidian-hover hover:border-brand/30 transition-all uppercase tracking-widest">{t('prod.next')}</button>
           </div>
        </div>
      </Card>
    </div>
  );
};
