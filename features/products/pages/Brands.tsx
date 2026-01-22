
import React, { useState, useMemo } from 'react';
import { AmberCard } from '../../../amber-ui/components/AmberCard';
import { AmberButton } from '../../../amber-ui/components/AmberButton';
import { AmberInput } from '../../../amber-ui/components/AmberInput';
import { AmberDropdown } from '../../../amber-ui/components/AmberDropdown';
import { AmberSlideOver } from '../../../amber-ui/components/AmberSlideOver';
import { 
  Tag, 
  Plus, 
  MoreVertical, 
  Globe, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  ExternalLink,
  Image as ImageIcon,
  CheckCircle2,
  XCircle,
  Briefcase
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

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this brand? This action cannot be undone.')) {
      setBrands(brands.filter(b => b.id !== id));
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
                options={[
                  { label: 'Name (A-Z)', value: 'name_asc' },
                  { label: 'Name (Z-A)', value: 'name_desc' },
                  { label: 'Products (High-Low)', value: 'count_high' },
                ]}
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
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-start">
            <thead>
              <tr className="bg-white/[0.02] border-b border-white/5">
                <th className="px-6 py-4 text-start text-[9px] font-black text-zinc-muted uppercase tracking-widest italic">Brand Name</th>
                <th className="px-6 py-4 text-start text-[9px] font-black text-zinc-muted uppercase tracking-widest italic">Website</th>
                <th className="px-6 py-4 text-start text-[9px] font-black text-zinc-muted uppercase tracking-widest italic">Products</th>
                <th className="px-6 py-4 text-start text-[9px] font-black text-zinc-muted uppercase tracking-widest italic">Status</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.03]">
              {processedBrands.length > 0 ? (
                processedBrands.map((brand) => (
                  <tr key={brand.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-sm bg-obsidian-outer border border-white/5 flex items-center justify-center text-zinc-muted font-black text-xs uppercase group-hover:border-brand/30 transition-colors">
                           {brand.logo ? <img src={brand.logo} className="w-full h-full object-cover rounded-sm" /> : brand.name.substring(0, 2)}
                        </div>
                        <div>
                          <p className="text-sm font-black text-zinc-text uppercase tracking-tight italic">{brand.name}</p>
                          <p className="text-[9px] font-bold text-zinc-muted uppercase font-mono">{brand.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-3">
                       {brand.website ? (
                         <a href={brand.website} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-xs font-bold text-zinc-secondary hover:text-brand transition-colors">
                            {brand.website.replace('https://', '')} <ExternalLink className="w-3 h-3" />
                         </a>
                       ) : (
                         <span className="text-xs text-zinc-muted">-</span>
                       )}
                    </td>
                    <td className="px-6 py-3">
                       <span className="text-xs font-bold text-zinc-text">{brand.productCount}</span>
                    </td>
                    <td className="px-6 py-3">
                       <span className={cn(
                          "text-[9px] font-black px-2 py-0.5 rounded-sm border uppercase tracking-widest inline-flex items-center gap-1.5",
                          brand.status === 'Active' ? 'bg-success/5 text-success border-success/20' : 'bg-white/5 text-zinc-muted border-white/10'
                       )}>
                          {brand.status === 'Active' && <div className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />}
                          {brand.status}
                       </span>
                    </td>
                    <td className="px-6 py-3 text-end">
                       <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => openEditModal(brand)} className="p-2 text-zinc-muted hover:text-brand transition-colors bg-white/5 rounded-sm"><Edit className="w-3.5 h-3.5" /></button>
                          <button onClick={() => handleDelete(brand.id)} className="p-2 text-zinc-muted hover:text-danger transition-colors bg-white/5 rounded-sm"><Trash2 className="w-3.5 h-3.5" /></button>
                       </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-zinc-muted text-xs italic">
                    No brands found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
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
               <div className="flex gap-2">
                  {['Active', 'Inactive'].map((s) => (
                     <button
                        key={s}
                        onClick={() => setFormData({ ...formData, status: s as any })}
                        className={cn(
                           "flex-1 py-2.5 rounded-sm text-[10px] font-black uppercase tracking-widest border transition-all flex items-center justify-center gap-2",
                           formData.status === s 
                              ? "bg-brand/10 border-brand/30 text-brand" 
                              : "bg-obsidian-outer border-white/5 text-zinc-muted hover:text-zinc-text"
                        )}
                     >
                        {s === 'Active' ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                        {s}
                     </button>
                  ))}
               </div>
            </div>
         </div>
      </AmberSlideOver>
    </div>
  );
};
