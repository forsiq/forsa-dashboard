
import React, { useState, useMemo } from 'react';
import { AmberCard } from '../../../amber-ui/components/AmberCard';
import { AmberButton } from '../../../amber-ui/components/AmberButton';
import { AmberInput } from '../../../amber-ui/components/AmberInput';
import { AmberDropdown } from '../../../amber-ui/components/AmberDropdown';
import { AmberSlideOver } from '../../../amber-ui/components/AmberSlideOver';
import { DataTable, Column } from '../../../amber-ui/components/Data/DataTable';
import { StatusBadge, StatusVariant } from '../../../amber-ui/components/Data/StatusBadge';
import { 
  Tag, 
  Plus, 
  Briefcase, 
  CheckCircle2, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  ExternalLink,
  Image as ImageIcon,
  Globe
} from 'lucide-react';
import { useLanguage } from '../../../amber-ui/contexts/LanguageContext';
import { cn } from '../../../lib/cn';

// --- Types ---
interface Brand {
  id: string;
  name: string;
  logo: string | null;
  productCount: number;
  website: string;
  description: string;
  status: 'Active' | 'Inactive';
}

// --- Mock Data ---
const INITIAL_DATA: Brand[] = [
  { id: 'BR-001', name: 'ZoneVast Basics', logo: null, productCount: 420, website: 'https://zonevast.com', description: 'In-house essentials brand.', status: 'Active' },
  { id: 'BR-002', name: 'TechCore', logo: null, productCount: 150, website: 'https://techcore.io', description: 'High-performance electronics.', status: 'Active' },
  { id: 'BR-003', name: 'LuxeLife', logo: null, productCount: 85, website: 'https://luxelife.style', description: 'Premium lifestyle accessories.', status: 'Active' },
  { id: 'BR-004', name: 'Urban Wear', logo: null, productCount: 0, website: '', description: 'Streetwear fashion line.', status: 'Inactive' },
];

export const Brands = () => {
  const { t } = useLanguage();
  const [brands, setBrands] = useState<Brand[]>(INITIAL_DATA);
  
  // -- View State --
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sortConfig, setSortConfig] = useState('name_asc');

  // -- Modal State --
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Brand>>({
    name: '',
    website: '',
    description: '',
    status: 'Active'
  });

  // -- Handlers --
  const handleSave = () => {
    if (!formData.name) return;

    if (editingId) {
      setBrands(brands.map(b => b.id === editingId ? { ...b, ...formData } as Brand : b));
    } else {
      const newBrand: Brand = {
        id: `BR-${Math.floor(Math.random() * 10000)}`,
        name: formData.name,
        logo: null,
        productCount: 0,
        website: formData.website || '',
        description: formData.description || '',
        status: (formData.status as any) || 'Active'
      };
      setBrands([...brands, newBrand]);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (brand: Brand) => {
    if (window.confirm('Are you sure you want to delete this brand? This action cannot be undone.')) {
      setBrands(brands.filter(b => b.id !== brand.id));
    }
  };

  const openAddModal = () => {
    setEditingId(null);
    setFormData({ name: '', website: '', description: '', status: 'Active' });
    setIsModalOpen(true);
  };

  const openEditModal = (brand: Brand) => {
    setEditingId(brand.id);
    setFormData({ ...brand });
    setIsModalOpen(true);
  };

  const processedBrands = useMemo(() => {
    let result = brands.filter(b => {
      const matchesSearch = b.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'All' || b.status === statusFilter;
      return matchesSearch && matchesStatus;
    });

    return result.sort((a, b) => {
        switch (sortConfig) {
            case 'name_asc': return a.name.localeCompare(b.name);
            case 'name_desc': return b.name.localeCompare(a.name);
            case 'count_high': return b.productCount - a.productCount;
            case 'count_low': return a.productCount - b.productCount;
            default: return 0;
        }
    });
  }, [brands, searchQuery, statusFilter, sortConfig]);

  const getStatusVariant = (status: string): StatusVariant => {
    return status === 'Active' ? 'success' : 'inactive';
  };

  const sortOptions = [
    { label: 'Name (A-Z)', value: 'name_asc' },
    { label: 'Name (Z-A)', value: 'name_desc' },
    { label: 'Products (High)', value: 'count_high' },
    { label: 'Products (Low)', value: 'count_low' },
  ];

  // --- Table Columns ---
  const columns: Column<Brand>[] = [
    {
      key: 'name',
      label: 'Brand Name',
      render: (row) => (
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-sm bg-obsidian-outer border border-white/5 flex items-center justify-center text-zinc-muted font-black text-xs uppercase group-hover:border-brand/30 transition-colors">
              {row.logo ? <img src={row.logo} className="w-full h-full object-cover rounded-sm" /> : row.name.substring(0, 2)}
          </div>
          <div>
            <p className="text-sm font-black text-zinc-text uppercase tracking-tight italic">{row.name}</p>
            <p className="text-[9px] font-bold text-zinc-muted uppercase font-mono">{row.id}</p>
          </div>
        </div>
      ),
      sortable: true
    },
    {
      key: 'website',
      label: 'Website',
      render: (row) => row.website ? (
        <a href={row.website} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-xs font-bold text-zinc-secondary hover:text-brand transition-colors">
          {row.website.replace('https://', '')} <ExternalLink className="w-3 h-3" />
        </a>
      ) : <span className="text-xs text-zinc-muted">-</span>,
      sortable: true
    },
    {
      key: 'productCount',
      label: 'Products',
      render: (row) => <span className="text-xs font-bold text-zinc-text">{row.productCount}</span>,
      sortable: true,
      align: 'center'
    },
    {
      key: 'status',
      label: 'Status',
      render: (row) => (
         <StatusBadge status={row.status} variant={getStatusVariant(row.status)} showDot size="sm" />
      ),
      sortable: true
    }
  ];

  return (
    <div className="animate-fade-up space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-zinc-text tracking-tighter uppercase italic">Brand Manager</h1>
          <p className="text-[10px] font-black text-zinc-muted uppercase tracking-[0.3em] mt-1 italic">Manage manufacturers and product lines</p>
        </div>
        <AmberButton size="sm" onClick={openAddModal}>
          <Plus className="w-4 h-4 mr-2" /> Add Brand
        </AmberButton>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <AmberCard className="p-5 flex items-center justify-between">
           <div>
              <p className="text-[9px] font-black text-zinc-muted uppercase tracking-widest">Total Brands</p>
              <p className="text-2xl font-black text-zinc-text">{brands.length}</p>
           </div>
           <div className="p-3 bg-brand/10 rounded-full text-brand"><Briefcase className="w-6 h-6" /></div>
        </AmberCard>
        <AmberCard className="p-5 flex items-center justify-between">
           <div>
              <p className="text-[9px] font-black text-zinc-muted uppercase tracking-widest">Active Lines</p>
              <p className="text-2xl font-black text-zinc-text">{brands.filter(b => b.status === 'Active').length}</p>
           </div>
           <div className="p-3 bg-success/10 rounded-full text-success"><CheckCircle2 className="w-6 h-6" /></div>
        </AmberCard>
        <AmberCard className="p-5 flex items-center justify-between">
           <div>
              <p className="text-[9px] font-black text-zinc-muted uppercase tracking-widest">Linked Products</p>
              <p className="text-2xl font-black text-zinc-text">{brands.reduce((acc, b) => acc + b.productCount, 0)}</p>
           </div>
           <div className="p-3 bg-info/10 rounded-full text-info"><Tag className="w-6 h-6" /></div>
        </AmberCard>
      </div>

      {/* Main List */}
      <AmberCard noPadding className="bg-obsidian-panel/30 border-white/[0.03]" glass>
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
                      placeholder="Search brands..."
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
                label="Status"
                options={[
                  { label: 'All', value: 'All' },
                  { label: 'Active', value: 'Active' },
                  { label: 'Inactive', value: 'Inactive' },
                ]}
                value={statusFilter}
                onChange={setStatusFilter}
                className="w-full lg:w-48"
           />
           
           <button className="h-10 px-4 bg-obsidian-card border border-white/5 text-zinc-muted hover:text-zinc-text transition-all rounded-sm flex items-center justify-center hover:bg-white/5">
               <Filter className="w-4 h-4" />
           </button>
        </div>

        <DataTable
          columns={columns}
          data={processedBrands}
          sortable={true}
          rowActions={[
            { label: 'Edit', icon: Edit, onClick: openEditModal },
            { label: 'Delete', icon: Trash2, onClick: handleDelete, variant: 'danger' }
          ]}
        />
      </AmberCard>

      {/* Form SlideOver */}
      <AmberSlideOver
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingId ? "Edit Brand" : "Add Brand"}
        description={editingId ? "Update brand details and settings." : "Register a new manufacturer or product line."}
        footer={
           <>
              <AmberButton variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</AmberButton>
              <AmberButton onClick={handleSave}>{editingId ? 'Update Brand' : 'Create Brand'}</AmberButton>
           </>
        }
      >
         <div className="space-y-6">
            <div className="flex items-center gap-4">
               <div className="w-20 h-20 bg-obsidian-outer border border-dashed border-white/10 rounded-sm flex flex-col items-center justify-center text-zinc-muted cursor-pointer hover:border-brand/30 hover:text-zinc-text transition-all">
                  <ImageIcon className="w-6 h-6 mb-1" />
                  <span className="text-[8px] font-black uppercase tracking-widest">Logo</span>
               </div>
               <div className="flex-1">
                  <AmberInput 
                     label="Brand Name" 
                     placeholder="e.g. Acme Corp"
                     value={formData.name}
                     onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                     required
                  />
               </div>
            </div>
            
            <AmberInput 
               label="Website URL" 
               placeholder="https://example.com"
               value={formData.website}
               onChange={(e) => setFormData({ ...formData, website: e.target.value })}
               icon={<Globe className="w-4 h-4" />}
            />
            
            <div className="space-y-1.5">
               <label className="text-[9px] font-black text-zinc-muted uppercase tracking-widest px-1">Description</label>
               <textarea 
                  rows={4}
                  className="w-full bg-obsidian-outer border border-white/5 rounded-sm p-3 text-xs font-medium text-zinc-text outline-none resize-none focus:border-brand/30"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Internal notes or public description..."
               />
            </div>

            <div>
               <label className="text-[9px] font-black text-zinc-muted uppercase tracking-widest px-1 mb-1.5 block">Status</label>
               <AmberDropdown 
                  options={[{ label: 'Active', value: 'Active' }, { label: 'Inactive', value: 'Inactive' }]}
                  value={formData.status || 'Active'}
                  onChange={(val) => setFormData({ ...formData, status: val as any })}
                  className="w-full"
               />
            </div>
         </div>
      </AmberSlideOver>
    </div>
  );
};
