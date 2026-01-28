
import React, { useState, useMemo } from 'react';
import { AmberCard } from '../../../amber-ui/components/AmberCard';
import { AmberButton } from '../../../amber-ui/components/AmberButton';
import { AmberInput } from '../../../amber-ui/components/AmberInput';
import { AmberDropdown } from '../../../amber-ui/components/AmberDropdown';
import { AmberSlideOver } from '../../../amber-ui/components/AmberSlideOver';
import { DataTable, Column } from '../../../amber-ui/components/Data/DataTable';
import { StatusBadge, StatusVariant } from '../../../amber-ui/components/Data/StatusBadge';
import { 
  FolderTree, 
  Plus, 
  Search, 
  ChevronRight, 
  ChevronDown, 
  Edit, 
  Trash2, 
  Image as ImageIcon,
  GripVertical,
  Filter,
  Layers,
  Tag,
  Hash
} from 'lucide-react';
import { useLanguage } from '../../../amber-ui/contexts/LanguageContext';
import { cn } from '../../../lib/cn';

// --- Types ---

interface Category {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
  count: number;
  description: string;
  status: 'Active' | 'Inactive';
  order: number;
}

interface FlatNode extends Category {
  depth: number;
  hasChildren: boolean;
  isExpanded: boolean;
}

// --- Mock Data ---

const INITIAL_DATA: Category[] = [
  { id: '1', name: 'Electronics', slug: 'electronics', parentId: null, count: 1240, description: 'Gadgets and devices', status: 'Active', order: 0 },
  { id: '2', name: 'Computers', slug: 'computers', parentId: '1', count: 450, description: 'Laptops and Desktops', status: 'Active', order: 0 },
  { id: '3', name: 'Laptops', slug: 'laptops', parentId: '2', count: 200, description: 'Portable computers', status: 'Active', order: 0 },
  { id: '4', name: 'Components', slug: 'components', parentId: '2', count: 250, description: 'Parts and upgrades', status: 'Active', order: 1 },
  { id: '5', name: 'Audio', slug: 'audio', parentId: '1', count: 300, description: 'Headphones and speakers', status: 'Active', order: 1 },
  { id: '6', name: 'Home & Garden', slug: 'home-garden', parentId: null, count: 850, description: 'Furniture and decor', status: 'Active', order: 1 },
  { id: '7', name: 'Furniture', slug: 'furniture', parentId: '6', count: 400, description: 'Sofas, chairs, tables', status: 'Active', order: 0 },
  { id: '8', name: 'Office', slug: 'office-furniture', parentId: '7', count: 150, description: 'Workspaces', status: 'Active', order: 0 },
];

export const Categories = () => {
  const { t } = useLanguage();
  const [data, setData] = useState<Category[]>(INITIAL_DATA);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set(['1', '2', '6']));
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal / Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Category>>({
    name: '',
    slug: '',
    parentId: null,
    description: '',
    status: 'Active'
  });

  // --- Helpers ---

  const getChildCategories = (parentId: string | null) => {
    return data
      .filter(c => c.parentId === parentId)
      .sort((a, b) => a.order - b.order);
  };

  const flattenTree = (
    parentId: string | null = null, 
    depth = 0, 
    result: FlatNode[] = []
  ): FlatNode[] => {
    const children = getChildCategories(parentId);
    
    for (const child of children) {
      if (searchQuery && !child.name.toLowerCase().includes(searchQuery.toLowerCase()) && !child.slug.includes(searchQuery)) {
         // Skip if filtering and doesn't match
      } 

      const hasChildren = data.some(c => c.parentId === child.id);
      const isExpanded = expandedIds.has(child.id);

      if (searchQuery) {
         if (child.name.toLowerCase().includes(searchQuery.toLowerCase())) {
            result.push({ ...child, depth: 0, hasChildren, isExpanded: true });
         }
         flattenTree(child.id, 0, result);
      } else {
         result.push({ ...child, depth, hasChildren, isExpanded });
         if (isExpanded) {
            flattenTree(child.id, depth + 1, result);
         }
      }
    }
    return result;
  };

  const displayNodes = useMemo(() => {
    if (searchQuery) {
       return data.filter(c => 
         c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
         c.slug.includes(searchQuery.toLowerCase())
       ).map(c => ({...c, depth: 0, hasChildren: false, isExpanded: false}));
    }
    return flattenTree();
  }, [data, expandedIds, searchQuery]);

  // --- Actions ---

  const toggleExpand = (id: string) => {
    const newSet = new Set(expandedIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setExpandedIds(newSet);
  };

  const handleDelete = (row: FlatNode) => {
    if (window.confirm('Are you sure? This will delete the category and may affect products.')) {
      const hasChildren = data.some(c => c.parentId === row.id);
      if (hasChildren) {
        alert('Cannot delete category with subcategories. Please move or delete them first.');
        return;
      }
      setData(data.filter(c => c.id !== row.id));
    }
  };

  const openAddModal = () => {
    setEditingId(null);
    setFormData({ name: '', slug: '', parentId: null, description: '', status: 'Active' });
    setIsModalOpen(true);
  };

  const openEditModal = (cat: FlatNode) => {
    setEditingId(cat.id);
    setFormData({ ...cat });
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (!formData.name) return;

    if (editingId) {
      setData(data.map(c => c.id === editingId ? { ...c, ...formData } as Category : c));
    } else {
      const newId = `cat_${Date.now()}`;
      const siblings = getChildCategories(formData.parentId || null);
      const order = siblings.length > 0 ? siblings[siblings.length - 1].order + 1 : 0;
      
      const newCat: Category = {
        id: newId,
        name: formData.name || 'New Category',
        slug: formData.slug || formData.name?.toLowerCase().replace(/\s+/g, '-') || 'new-cat',
        parentId: formData.parentId || null,
        count: 0,
        description: formData.description || '',
        status: (formData.status as any) || 'Active',
        order
      };
      setData([...data, newCat]);
    }
    setIsModalOpen(false);
  };

  const getStatusVariant = (status: string): StatusVariant => {
     return status === 'Active' ? 'success' : 'inactive';
  };

  // --- Table Columns ---
  const columns: Column<FlatNode>[] = [
    {
      key: 'name',
      label: 'Category Name',
      render: (node) => (
        <div 
          className="flex items-center gap-2"
          style={{ paddingLeft: `${node.depth * 24}px` }}
        >
          <div className="text-zinc-muted hover:text-zinc-text cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-50 transition-opacity">
            <GripVertical className="w-4 h-4" />
          </div>
          
          <button 
            onClick={(e) => { e.stopPropagation(); toggleExpand(node.id); }}
            className={cn(
               "p-1 rounded-sm hover:bg-white/10 transition-colors",
               !node.hasChildren && "invisible"
            )}
          >
            {node.isExpanded ? <ChevronDown className="w-3.5 h-3.5 text-zinc-muted" /> : <ChevronRight className="w-3.5 h-3.5 text-zinc-muted" />}
          </button>
          
          <span className={cn(
             "text-sm font-bold truncate select-none",
             node.depth === 0 ? "text-zinc-text" : "text-zinc-secondary"
          )}>
             {node.name}
          </span>
        </div>
      )
    },
    {
      key: 'slug',
      label: 'Slug',
      render: (row) => (
        <span className="text-[10px] font-mono text-zinc-muted bg-white/5 px-1.5 py-0.5 rounded border border-white/5">
            /{row.slug}
        </span>
      )
    },
    {
      key: 'count',
      label: 'Products',
      render: (row) => <span className="text-xs font-bold text-zinc-text">{row.count}</span>,
      align: 'center'
    },
    {
      key: 'status',
      label: 'Status',
      render: (row) => (
        <StatusBadge status={row.status} variant={getStatusVariant(row.status)} size="sm" />
      )
    }
  ];

  return (
    <div className="animate-fade-up space-y-8">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
             <FolderTree className="w-5 h-5 text-brand" />
             <h1 className="text-2xl font-black text-zinc-text uppercase italic tracking-tighter">Taxonomy Manager</h1>
          </div>
          <p className="text-[10px] font-black text-zinc-muted uppercase tracking-[0.3em] mt-1">Organize product hierarchy and groups</p>
        </div>
        <AmberButton size="sm" onClick={openAddModal}>
          <Plus className="w-4 h-4 mr-2" /> Add Category
        </AmberButton>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <AmberCard className="p-5 flex items-center justify-between">
           <div>
              <p className="text-[9px] font-black text-zinc-muted uppercase tracking-widest">Total Categories</p>
              <p className="text-2xl font-black text-zinc-text">{data.length}</p>
           </div>
           <div className="p-3 bg-brand/10 rounded-full text-brand"><Layers className="w-6 h-6" /></div>
        </AmberCard>
        <AmberCard className="p-5 flex items-center justify-between">
           <div>
              <p className="text-[9px] font-black text-zinc-muted uppercase tracking-widest">Active Groups</p>
              <p className="text-2xl font-black text-zinc-text">{data.filter(c => c.status === 'Active').length}</p>
           </div>
           <div className="p-3 bg-success/10 rounded-full text-success"><Tag className="w-6 h-6" /></div>
        </AmberCard>
        <AmberCard className="p-5 flex items-center justify-between">
           <div>
              <p className="text-[9px] font-black text-zinc-muted uppercase tracking-widest">Total SKUs</p>
              <p className="text-2xl font-black text-zinc-text">5,902</p>
           </div>
           <div className="p-3 bg-info/10 rounded-full text-info"><Hash className="w-6 h-6" /></div>
        </AmberCard>
      </div>

      {/* Main List */}
      <AmberCard noPadding className="flex flex-col min-h-[600px] overflow-hidden bg-obsidian-panel/50 border-white/5">
        
        {/* Toolbar */}
        <div className="p-4 border-b border-white/5 bg-obsidian-panel flex gap-4">
           <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-muted" />
              <input 
                type="text" 
                placeholder="Filter categories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-10 bg-obsidian-outer border border-white/5 rounded-sm pl-10 pr-4 text-xs font-bold text-zinc-text outline-none focus:border-brand/30 transition-all"
              />
           </div>
           <button className="h-10 px-4 bg-obsidian-card border border-white/5 text-zinc-muted hover:text-zinc-text transition-all rounded-sm flex items-center justify-center hover:bg-white/5">
               <Filter className="w-4 h-4" />
           </button>
        </div>

        <DataTable
          columns={columns}
          data={displayNodes}
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
        title={editingId ? "Edit Category" : "New Category"}
        description={editingId ? "Modify taxonomy details." : "Create a new branch in the catalog tree."}
        footer={
           <>
              <AmberButton variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</AmberButton>
              <AmberButton onClick={handleSave}>{editingId ? 'Update Category' : 'Create Category'}</AmberButton>
           </>
        }
      >
         <div className="space-y-6">
            <AmberInput 
               label="Name" 
               placeholder="e.g. Smart Watches"
               value={formData.name}
               onChange={(e) => setFormData({ 
                  ...formData, 
                  name: e.target.value,
                  slug: !editingId ? e.target.value.toLowerCase().replace(/\s+/g, '-') : formData.slug 
               })}
               required
            />
            <AmberInput 
               label="Slug" 
               placeholder="url-friendly-id"
               value={formData.slug}
               onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
               className="font-mono text-xs"
            />
            <div className="space-y-1.5">
               <label className="text-[9px] font-black text-zinc-muted uppercase tracking-widest px-1">Parent Category</label>
               <select 
                  className="w-full h-11 bg-obsidian-outer border border-white/5 rounded-sm px-4 text-xs font-bold text-zinc-text outline-none focus:border-brand/30 appearance-none"
                  value={formData.parentId || ''}
                  onChange={(e) => setFormData({ ...formData, parentId: e.target.value || null })}
               >
                  <option value="">(None - Root Level)</option>
                  {data
                     .filter(c => c.id !== editingId)
                     .map(c => (
                     <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
               </select>
            </div>
            <div className="space-y-1.5">
               <label className="text-[9px] font-black text-zinc-muted uppercase tracking-widest px-1">Description</label>
               <textarea 
                  rows={4}
                  className="w-full bg-obsidian-outer border border-white/5 rounded-sm p-3 text-xs font-medium text-zinc-text outline-none resize-none focus:border-brand/30"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
               />
            </div>
            <div className="border border-dashed border-white/10 rounded-sm p-6 text-center hover:border-brand/30 hover:bg-white/[0.02] cursor-pointer transition-all">
               <ImageIcon className="w-6 h-6 mx-auto mb-2 text-zinc-muted" />
               <p className="text-[10px] font-bold text-zinc-text uppercase tracking-wide">Category Image</p>
               <p className="text-[9px] text-zinc-muted mt-1">Click to upload banner</p>
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
