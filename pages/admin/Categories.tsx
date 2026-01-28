
import React, { useState, useMemo } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { AmberSlideOver } from '../../amber-ui/components/AmberSlideOver';
import { AmberInput } from '../../amber-ui/components/AmberInput';
import { AmberDropdown } from '../../amber-ui/components/AmberDropdown';
import { DataTable, Column } from '../../amber-ui/components/Data/DataTable';
import { StatusBadge } from '../../amber-ui/components/Data/StatusBadge';
import { 
  Tag, 
  Plus, 
  Layers, 
  Hash, 
  Save,
  Search,
  Filter,
  RotateCcw,
  Edit,
  Trash2
} from 'lucide-react';
import { useLanguage } from '../../amber-ui/contexts/LanguageContext';
import { cn } from '../../lib/cn';

interface Category {
  id: string;
  name: string;
  slug: string;
  products: number;
  status: 'Active' | 'Hidden' | 'Archived';
}

const initialCategories: Category[] = [
  { id: 'CAT-001', name: 'Electronics', slug: 'electronics', products: 1242, status: 'Active' },
  { id: 'CAT-002', name: 'Luxury Goods', slug: 'luxury-goods', products: 450, status: 'Active' },
  { id: 'CAT-003', name: 'Home & Office', slug: 'home-office', products: 890, status: 'Active' },
  { id: 'CAT-004', name: 'Fashion', slug: 'fashion', products: 3200, status: 'Active' },
  { id: 'CAT-005', name: 'Automotive', slug: 'automotive', products: 120, status: 'Hidden' },
];

export const Categories = () => {
  const { t } = useLanguage();
  const [categories, setCategories] = useState(initialCategories);
  
  // -- View State --
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  
  // -- Advanced Filter State --
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [productRange, setProductRange] = useState({ min: '', max: '' });

  // -- Add State --
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newCategory, setNewCategory] = useState({
    name: '',
    slug: '',
    status: 'Active'
  });

  const handleSave = () => {
    if (!newCategory.name) return;

    if (editingId) {
        setCategories(categories.map(c => c.id === editingId ? { ...c, ...newCategory } as Category : c));
    } else {
        setCategories([...categories, {
        id: `CAT-${Math.floor(Math.random() * 10000)}`,
        name: newCategory.name,
        slug: newCategory.slug,
        products: 0,
        status: newCategory.status as any
        }]);
    }
    setIsAddOpen(false);
    setNewCategory({ name: '', slug: '', status: 'Active' });
    setEditingId(null);
  };

  const handleDelete = (cat: Category) => {
    if (confirm(`Delete ${cat.name}?`)) {
        setCategories(prev => prev.filter(c => c.id !== cat.id));
    }
  };

  const openEdit = (cat: Category) => {
    setEditingId(cat.id);
    setNewCategory({ name: cat.name, slug: cat.slug, status: cat.status });
    setIsAddOpen(true);
  };

  const openAdd = () => {
      setEditingId(null);
      setNewCategory({ name: '', slug: '', status: 'Active' });
      setIsAddOpen(true);
  };

  // Reorder logic for Drag and Drop
  const handleReorder = (sourceIndex: number, destinationIndex: number) => {
    const newItems = [...categories];
    const [removed] = newItems.splice(sourceIndex, 1);
    newItems.splice(destinationIndex, 0, removed);
    setCategories(newItems);
  };

  const processedCategories = useMemo(() => {
    return categories.filter(cat => {
        const matchesSearch = cat.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                              cat.slug.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === 'All' || cat.status === statusFilter;
        
        // Advanced Filters
        const matchesMinProducts = productRange.min ? cat.products >= parseInt(productRange.min) : true;
        const matchesMaxProducts = productRange.max ? cat.products <= parseInt(productRange.max) : true;

        return matchesSearch && matchesStatus && matchesMinProducts && matchesMaxProducts;
    });
  }, [categories, searchQuery, statusFilter, productRange]);

  const resetFilters = () => {
      setProductRange({ min: '', max: '' });
      setStatusFilter('All');
      setSearchQuery('');
  };

  const filterOptions = [
    { label: 'All Status', value: 'All' },
    { label: 'Active', value: 'Active' },
    { label: 'Hidden', value: 'Hidden' },
    { label: 'Archived', value: 'Archived' },
  ];

  // Columns definition
  const columns: Column<Category>[] = [
    {
        key: 'name',
        label: 'Category Name',
        render: (row) => (
            <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-sm bg-obsidian-outer border border-white/5 flex items-center justify-center text-zinc-muted group-hover:text-brand transition-colors">
                    <Tag className="w-5 h-5" />
                </div>
                <div>
                    <p className="text-sm font-black text-zinc-text uppercase tracking-tight italic">{row.name}</p>
                    <p className="text-[9px] font-bold text-zinc-muted uppercase font-mono">{row.id}</p>
                </div>
            </div>
        )
    },
    {
        key: 'slug',
        label: 'Slug',
        render: (row) => <span className="text-xs font-mono text-zinc-secondary">{row.slug}</span>
    },
    {
        key: 'products',
        label: 'Items',
        render: (row) => <span className="text-xs font-bold text-zinc-text">{row.products}</span>,
        align: 'center'
    },
    {
        key: 'status',
        label: 'Status',
        render: (row) => (
            <StatusBadge 
                status={row.status} 
                variant={row.status === 'Active' ? 'success' : row.status === 'Hidden' ? 'warning' : 'inactive'} 
                size="sm"
            />
        )
    }
  ];

  return (
    <div className="animate-fade-up space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-zinc-text tracking-tighter uppercase italic">{t('cats.title')}</h1>
          <p className="text-[10px] font-black text-zinc-muted uppercase tracking-[0.3em] mt-1 italic">{t('cats.subtitle')}</p>
        </div>
        <Button size="sm" onClick={openAdd}>
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
                label="Filter Status"
                options={filterOptions}
                value={statusFilter}
                onChange={setStatusFilter}
                className="w-full lg:w-48"
           />

           <button 
             onClick={() => setIsFilterOpen(true)}
             className="h-10 px-4 bg-obsidian-card border border-white/5 text-zinc-muted hover:text-zinc-text transition-all rounded-sm flex items-center justify-center hover:bg-white/5"
             title="Advanced Filters"
           >
              <Filter className="w-4 h-4" />
           </button>
        </div>

        <DataTable
            columns={columns}
            data={processedCategories}
            draggable={true}
            onRowReorder={handleReorder}
            rowActions={[
                { label: 'Edit', icon: Edit, onClick: openEdit },
                { label: 'Delete', icon: Trash2, onClick: handleDelete, variant: 'danger' }
            ]}
        />
      </Card>

      {/* Advanced Filter SlideOver */}
      <AmberSlideOver
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        title="Filter Categories"
        description="Filter taxonomy by product count and metadata."
        footer={
            <>
                <Button variant="ghost" onClick={resetFilters}>
                    <RotateCcw className="w-3.5 h-3.5 mr-2" /> Reset
                </Button>
                <Button onClick={() => setIsFilterOpen(false)}>
                    Show {processedCategories.length} Categories
                </Button>
            </>
        }
      >
        <div className="space-y-6">
            <section className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-white/5">
                    <Hash className="w-4 h-4 text-brand" />
                    <h3 className="text-xs font-black text-zinc-text uppercase tracking-widest">Product Count Range</h3>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <AmberInput 
                        label="Min Items"
                        type="number"
                        placeholder="0"
                        value={productRange.min}
                        onChange={(e) => setProductRange({...productRange, min: e.target.value})}
                    />
                    <AmberInput 
                        label="Max Items"
                        type="number"
                        placeholder="Any"
                        value={productRange.max}
                        onChange={(e) => setProductRange({...productRange, max: e.target.value})}
                    />
                </div>
            </section>
        </div>
      </AmberSlideOver>

      {/* Add Category SlideOver */}
      <AmberSlideOver
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title={editingId ? "Edit Category" : t('cats.add')}
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
              onChange={(val) => setNewCategory({...newCategory, status: val as any})}
              className="w-full"
            />
          </div>
        </div>
      </AmberSlideOver>
    </div>
  );
};
