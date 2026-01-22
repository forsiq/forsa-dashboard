
import React, { useState, useMemo } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { AmberSlideOver } from '../../amber-ui/components/AmberSlideOver';
import { AmberInput } from '../../amber-ui/components/AmberInput';
import { AmberDropdown } from '../../amber-ui/components/AmberDropdown';
import { 
  Tag, 
  Plus, 
  MoreHorizontal, 
  Layers, 
  Hash, 
  Save,
  Search,
  Filter
} from 'lucide-react';
import { useLanguage } from '../../amber-ui/contexts/LanguageContext';
import { cn } from '../../lib/cn';

const initialCategories = [
  { id: 'CAT-001', name: 'Electronics', slug: 'electronics', products: 1242, status: 'Active' },
  { id: 'CAT-002', name: 'Luxury Goods', slug: 'luxury-goods', products: 450, status: 'Active' },
  { id: 'CAT-003', name: 'Home & Office', slug: 'home-office', products: 890, status: 'Active' },
  { id: 'CAT-004', name: 'Fashion', slug: 'fashion', products: 3200, status: 'Active' },
  { id: 'CAT-005', name: 'Automotive', slug: 'automotive', products: 120, status: 'Hidden' },
];

export const Categories = () => {
  const { t } = useLanguage();
  const [categories, setCategories] = useState(initialCategories);
  const [isAddOpen, setIsAddOpen] = useState(false);
  
  // View State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sortConfig, setSortConfig] = useState('name_asc');
  
  // Add State
  const [newCategory, setNewCategory] = useState({
    name: '',
    slug: '',
    status: 'Active'
  });

  const handleSave = () => {
    setCategories([...categories, {
      id: `CAT-${Math.floor(Math.random() * 10000)}`,
      name: newCategory.name,
      slug: newCategory.slug,
      products: 0,
      status: newCategory.status
    }]);
    setIsAddOpen(false);
    setNewCategory({ name: '', slug: '', status: 'Active' });
  };

  const processedCategories = useMemo(() => {
    let result = categories.filter(cat => {
        const matchesSearch = cat.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                              cat.slug.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === 'All' || cat.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    return result.sort((a, b) => {
        switch (sortConfig) {
            case 'name_asc':
                return a.name.localeCompare(b.name);
            case 'name_desc':
                return b.name.localeCompare(a.name);
            case 'count_high':
                return b.products - a.products;
            case 'count_low':
                return a.products - b.products;
            default:
                return 0;
        }
    });
  }, [categories, searchQuery, statusFilter, sortConfig]);

  const sortOptions = [
    { label: 'Name (A-Z)', value: 'name_asc' },
    { label: 'Name (Z-A)', value: 'name_desc' },
    { label: 'Items (High-Low)', value: 'count_high' },
    { label: 'Items (Low-High)', value: 'count_low' },
  ];

  const filterOptions = [
    { label: 'All Status', value: 'All' },
    { label: 'Active', value: 'Active' },
    { label: 'Hidden', value: 'Hidden' },
    { label: 'Archived', value: 'Archived' },
  ];

  return (
    <div className="animate-fade-up space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-zinc-text tracking-tighter uppercase italic">{t('cats.title')}</h1>
          <p className="text-[10px] font-black text-zinc-muted uppercase tracking-[0.3em] mt-1 italic">{t('cats.subtitle')}</p>
        </div>
        <Button size="sm" onClick={() => setIsAddOpen(true)}>
          <Plus className="w-4 h-4 mr-2 rtl:ml-2 rtl:mr-0" /> {t('cats.add')}
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-5 flex items-center justify-between">
           <div>
              <p className="text-[9px] font-black text-zinc-muted uppercase tracking-widest">Total Categories</p>
              <p className="text-2xl font-black text-zinc-text">{categories.length}</p>
           </div>
           <div className="p-3 bg-brand/10 rounded-full text-brand"><Layers className="w-6 h-6" /></div>
        </Card>
        <Card className="p-5 flex items-center justify-between">
           <div>
              <p className="text-[9px] font-black text-zinc-muted uppercase tracking-widest">Active Groups</p>
              <p className="text-2xl font-black text-zinc-text">{categories.filter(c => c.status === 'Active').length}</p>
           </div>
           <div className="p-3 bg-success/10 rounded-full text-success"><Tag className="w-6 h-6" /></div>
        </Card>
        <Card className="p-5 flex items-center justify-between">
           <div>
              <p className="text-[9px] font-black text-zinc-muted uppercase tracking-widest">Total SKUs</p>
              <p className="text-2xl font-black text-zinc-text">5,902</p>
           </div>
           <div className="p-3 bg-info/10 rounded-full text-info"><Hash className="w-6 h-6" /></div>
        </Card>
      </div>

      {/* Main List */}
      <Card noPadding className="bg-obsidian-panel/30 border-white/[0.03]" glass>
        {/* Toolbar */}
        <div className="p-4 border-b border-white/5 flex flex-col lg:flex-row gap-4 items-end">
           <div className="flex-1 w-full">
                <label className="block text-[10px] font-black text-zinc-muted uppercase tracking-widest mb-1.5 px-1">
                    Search
                </label>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-muted" />
                    <input 
                    type="text" 
                    placeholder="Search categories..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full h-10 bg-obsidian-outer border border-white/5 rounded-sm pl-10 pr-4 text-xs font-bold text-zinc-text outline-none focus:border-brand/30 transition-all"
                    />
                </div>
           </div>
           
           <AmberDropdown 
                label="Sort Order"
                options={sortOptions}
                value={sortConfig}
                onChange={setSortConfig}
                className="w-full lg:w-48"
           />

           <AmberDropdown 
                label="Filter Status"
                options={filterOptions}
                value={statusFilter}
                onChange={setStatusFilter}
                className="w-full lg:w-48"
           />

           <button className="h-10 px-4 bg-obsidian-card border border-white/5 text-zinc-muted hover:text-zinc-text transition-all rounded-sm flex items-center justify-center hover:bg-white/5">
              <Filter className="w-4 h-4" />
           </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-start">
            <thead>
              <tr className="bg-white/[0.02] border-b border-white/5">
                <th className="px-6 py-4 text-start text-[9px] font-black text-zinc-muted uppercase tracking-widest italic">{t('cats.table.name')}</th>
                <th className="px-6 py-4 text-start text-[9px] font-black text-zinc-muted uppercase tracking-widest italic">{t('cats.table.slug')}</th>
                <th className="px-6 py-4 text-start text-[9px] font-black text-zinc-muted uppercase tracking-widest italic">{t('cats.table.count')}</th>
                <th className="px-6 py-4 text-start text-[9px] font-black text-zinc-muted uppercase tracking-widest italic">{t('cats.table.status')}</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.03]">
              {processedCategories.length > 0 ? (
                processedCategories.map((cat) => (
                  <tr key={cat.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-sm bg-obsidian-outer border border-white/5 flex items-center justify-center text-zinc-muted group-hover:text-brand transition-colors">
                           <Tag className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-sm font-black text-zinc-text uppercase tracking-tight italic">{cat.name}</p>
                          <p className="text-[9px] font-bold text-zinc-muted uppercase font-mono">{cat.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-3">
                       <span className="text-xs font-mono text-zinc-secondary">{cat.slug}</span>
                    </td>
                    <td className="px-6 py-3">
                       <span className="text-xs font-bold text-zinc-text">{cat.products} <span className="text-[9px] text-zinc-muted uppercase">Items</span></span>
                    </td>
                    <td className="px-6 py-3">
                       <span className={cn(
                          "text-[9px] font-black px-2 py-0.5 rounded-sm border uppercase tracking-widest",
                          cat.status === 'Active' ? 'bg-success/5 text-success border-success/20' : 'bg-zinc-muted/5 text-zinc-muted border-white/10'
                       )}>
                          {cat.status}
                       </span>
                    </td>
                    <td className="px-6 py-3 text-end">
                       <button className="p-2 text-zinc-muted hover:text-brand transition-colors"><MoreHorizontal className="w-4 h-4" /></button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-zinc-muted text-xs italic">
                    No categories found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Add SlideOver */}
      <AmberSlideOver
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title={t('cats.add')}
        description="Define a new product taxonomy group."
        footer={
          <>
            <Button variant="ghost" onClick={() => setIsAddOpen(false)}>Cancel</Button>
            <Button onClick={handleSave}>
              <Save className="w-4 h-4 mr-2" /> Save Category
            </Button>
          </>
        }
      >
        <div className="space-y-6">
          <AmberInput 
            label="Category Name"
            placeholder="e.g. Smart Wearables"
            value={newCategory.name}
            onChange={(e) => setNewCategory({
                ...newCategory, 
                name: e.target.value,
                slug: e.target.value.toLowerCase().replace(/\s+/g, '-')
            })}
          />
          <AmberInput 
            label="URL Slug"
            placeholder="auto-generated"
            value={newCategory.slug}
            onChange={(e) => setNewCategory({...newCategory, slug: e.target.value})}
            className="font-mono text-xs"
          />
          <div>
            <label className="text-[9px] font-black text-zinc-muted uppercase tracking-widest mb-1.5 block">Visibility Status</label>
            <AmberDropdown 
              options={[
                { label: 'Active', value: 'Active' },
                { label: 'Hidden', value: 'Hidden' },
                { label: 'Archived', value: 'Archived' }
              ]}
              value={newCategory.status}
              onChange={(val) => setNewCategory({...newCategory, status: val})}
              className="w-full"
            />
          </div>
        </div>
      </AmberSlideOver>
    </div>
  );
};
