
import React, { useState, useMemo, useEffect } from 'react';
import { AmberCard } from '../../../amber-ui/components/AmberCard';
import { AmberButton } from '../../../amber-ui/components/AmberButton';
import { AmberInput } from '../../../amber-ui/components/AmberInput';
import { AmberDropdown } from '../../../amber-ui/components/AmberDropdown';
import { AmberSlideOver } from '../../../amber-ui/components/AmberSlideOver';
import { 
  FolderTree, 
  Plus, 
  Search, 
  MoreHorizontal, 
  ChevronRight, 
  ChevronDown, 
  MoveUp, 
  MoveDown, 
  Edit, 
  Trash2, 
  Check, 
  X,
  Image as ImageIcon,
  GripVertical
} from 'lucide-react';
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

// --- Components ---

export const Categories = () => {
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

  // Drag State
  const [draggedId, setDraggedId] = useState<string | null>(null);

  // --- Helpers ---

  const getChildCategories = (parentId: string | null) => {
    return data
      .filter(c => c.parentId === parentId)
      .sort((a, b) => a.order - b.order);
  };

  // Flatten the tree for rendering while respecting expansion state
  const flattenTree = (
    parentId: string | null = null, 
    depth = 0, 
    result: FlatNode[] = []
  ): FlatNode[] => {
    const children = getChildCategories(parentId);
    
    for (const child of children) {
      // Basic Search Filter: If searching, ignore hierarchy and show matches
      if (searchQuery && !child.name.toLowerCase().includes(searchQuery.toLowerCase()) && !child.slug.includes(searchQuery)) {
         // If generic search match fails, check if children match? 
         // For simple UI, let's just flatten everything if searching, or keep hierarchy if not.
         // Let's stick to: search filters list flatly.
      } else {
         // Hierarchy Logic
      }

      const hasChildren = data.some(c => c.parentId === child.id);
      const isExpanded = expandedIds.has(child.id);

      // If Searching, show all matches flat
      if (searchQuery) {
         if (child.name.toLowerCase().includes(searchQuery.toLowerCase())) {
            result.push({ ...child, depth: 0, hasChildren, isExpanded: true });
         }
         flattenTree(child.id, 0, result); // Continue searching deep
      } else {
         // Standard Tree View
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
       // Simple flat filter
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

  const handleMove = (id: string, direction: 'up' | 'down') => {
    const item = data.find(c => c.id === id);
    if (!item) return;

    const siblings = getChildCategories(item.parentId);
    const index = siblings.findIndex(s => s.id === id);
    
    if (direction === 'up' && index > 0) {
      const prev = siblings[index - 1];
      // Swap orders
      const newOrder = prev.order;
      const prevOrder = item.order;
      
      const newData = data.map(c => {
        if (c.id === item.id) return { ...c, order: newOrder };
        if (c.id === prev.id) return { ...c, order: prevOrder };
        return c;
      });
      setData(newData);
    } else if (direction === 'down' && index < siblings.length - 1) {
      const next = siblings[index + 1];
      const newOrder = next.order;
      const nextOrder = item.order;

      const newData = data.map(c => {
        if (c.id === item.id) return { ...c, order: newOrder };
        if (c.id === next.id) return { ...c, order: nextOrder };
        return c;
      });
      setData(newData);
    }
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure? This will delete the category and may affect products.')) {
      // Basic check for children
      const hasChildren = data.some(c => c.parentId === id);
      if (hasChildren) {
        alert('Cannot delete category with subcategories. Please move or delete them first.');
        return;
      }
      setData(data.filter(c => c.id !== id));
    }
  };

  const openAddModal = () => {
    setEditingId(null);
    setFormData({
      name: '',
      slug: '',
      parentId: null,
      description: '',
      status: 'Active'
    });
    setIsModalOpen(true);
  };

  const openEditModal = (cat: Category) => {
    setEditingId(cat.id);
    setFormData({ ...cat });
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (!formData.name) return;

    if (editingId) {
      // Update
      setData(data.map(c => c.id === editingId ? { ...c, ...formData } as Category : c));
    } else {
      // Create
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

  // Drag & Drop Handlers
  const onDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.effectAllowed = 'move';
    setDraggedId(id);
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault(); // Necessary to allow dropping
  };

  const onDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!draggedId || draggedId === targetId) return;

    // Reparent logic: draggedId becomes child of targetId
    // Prevent cycles: ensure targetId is not a child of draggedId
    let current = data.find(c => c.id === targetId);
    while (current) {
        if (current.parentId === draggedId) return; // Cycle detected
        current = data.find(c => c.id === current?.parentId);
    }

    setData(data.map(c => {
        if (c.id === draggedId) {
            return { ...c, parentId: targetId };
        }
        return c;
    }));
    setDraggedId(null);
    setExpandedIds(new Set([...expandedIds, targetId])); // Expand target to show dropped item
  };

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

      {/* Main Card */}
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
        </div>

        {/* Tree Table */}
        <div className="flex-1 overflow-auto">
           <table className="w-full text-left border-collapse">
              <thead className="bg-obsidian-outer/50 text-[9px] font-black text-zinc-muted uppercase tracking-widest sticky top-0 z-10">
                 <tr>
                    <th className="px-6 py-3 w-[40%]">Category Name</th>
                    <th className="px-6 py-3 w-[20%]">Slug</th>
                    <th className="px-6 py-3 w-[10%] text-center">Products</th>
                    <th className="px-6 py-3 w-[10%]">Status</th>
                    <th className="px-6 py-3 w-[20%] text-right">Actions</th>
                 </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                 {displayNodes.map((node) => (
                    <tr 
                      key={node.id} 
                      className={cn(
                        "group hover:bg-white/[0.02] transition-colors",
                        draggedId === node.id && "opacity-50 bg-brand/5"
                      )}
                      draggable
                      onDragStart={(e) => onDragStart(e, node.id)}
                      onDragOver={onDragOver}
                      onDrop={(e) => onDrop(e, node.id)}
                    >
                       <td className="px-6 py-3">
                          <div 
                            className="flex items-center gap-2"
                            style={{ paddingLeft: `${node.depth * 24}px` }}
                          >
                             <div className="cursor-grab active:cursor-grabbing text-zinc-muted hover:text-zinc-text">
                                <GripVertical className="w-4 h-4 opacity-0 group-hover:opacity-50" />
                             </div>
                             
                             <button 
                                onClick={() => toggleExpand(node.id)}
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
                       </td>
                       <td className="px-6 py-3">
                          <span className="text-[10px] font-mono text-zinc-muted bg-white/5 px-1.5 py-0.5 rounded border border-white/5">
                             /{node.slug}
                          </span>
                       </td>
                       <td className="px-6 py-3 text-center">
                          <span className="text-xs font-bold text-zinc-text">{node.count}</span>
                       </td>
                       <td className="px-6 py-3">
                          <span className={cn(
                             "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-sm text-[9px] font-black uppercase tracking-widest border",
                             node.status === 'Active' ? "bg-success/5 border-success/20 text-success" : "bg-white/5 border-white/10 text-zinc-muted"
                          )}>
                             {node.status}
                          </span>
                       </td>
                       <td className="px-6 py-3 text-right">
                          <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                             {!searchQuery && (
                               <>
                                 <button onClick={() => handleMove(node.id, 'up')} className="p-1.5 hover:bg-white/5 rounded-sm text-zinc-muted hover:text-zinc-text" title="Move Up">
                                    <MoveUp className="w-3.5 h-3.5" />
                                 </button>
                                 <button onClick={() => handleMove(node.id, 'down')} className="p-1.5 hover:bg-white/5 rounded-sm text-zinc-muted hover:text-zinc-text" title="Move Down">
                                    <MoveDown className="w-3.5 h-3.5" />
                                 </button>
                                 <div className="w-px h-4 bg-white/10 mx-1" />
                               </>
                             )}
                             <button onClick={() => openEditModal(node)} className="p-1.5 hover:bg-white/5 rounded-sm text-zinc-muted hover:text-brand" title="Edit">
                                <Edit className="w-3.5 h-3.5" />
                             </button>
                             <button onClick={() => handleDelete(node.id)} className="p-1.5 hover:bg-white/5 rounded-sm text-zinc-muted hover:text-danger" title="Delete">
                                <Trash2 className="w-3.5 h-3.5" />
                             </button>
                          </div>
                       </td>
                    </tr>
                 ))}
              </tbody>
           </table>
           {displayNodes.length === 0 && (
              <div className="p-12 text-center text-zinc-muted opacity-50">
                 <p className="text-xs font-bold uppercase tracking-widest">No categories found</p>
              </div>
           )}
        </div>
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
                  // Auto-gen slug if creating and slug is pristine
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
                     .filter(c => c.id !== editingId) // Prevent self-parenting
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
               <div className="flex gap-2">
                  {['Active', 'Inactive'].map((s) => (
                     <button
                        key={s}
                        onClick={() => setFormData({ ...formData, status: s as any })}
                        className={cn(
                           "flex-1 py-2 rounded-sm text-[10px] font-black uppercase tracking-widest border transition-all",
                           formData.status === s 
                              ? "bg-brand/10 border-brand/30 text-brand" 
                              : "bg-obsidian-outer border-white/5 text-zinc-muted"
                        )}
                     >
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
