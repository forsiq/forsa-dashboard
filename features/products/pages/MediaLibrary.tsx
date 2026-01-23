
import React, { useState, useMemo, useRef } from 'react';
import { AmberCard } from '../../../amber-ui/components/AmberCard';
import { AmberButton } from '../../../amber-ui/components/AmberButton';
import { AmberInput } from '../../../amber-ui/components/AmberInput';
import { AmberDropdown } from '../../../amber-ui/components/AmberDropdown';
import { AmberSlideOver } from '../../../amber-ui/components/AmberSlideOver';
import { 
  Image as ImageIcon, 
  UploadCloud, 
  Search, 
  Filter, 
  MoreVertical, 
  Check, 
  Trash2, 
  Download, 
  Tag, 
  Link as LinkIcon, 
  X,
  FileText,
  Grid,
  List,
  CheckSquare,
  Square,
  ZoomIn,
  Info
} from 'lucide-react';
import { cn } from '../../../lib/cn';

// --- Types ---
interface MediaItem {
  id: string;
  name: string;
  url: string; // In a real app, this would be a URL. Here we use colors/placeholders.
  type: 'product' | 'category' | 'brand' | 'uncategorized';
  size: string;
  dimensions: string;
  date: string;
  tags: string[];
  selected: boolean;
}

// --- Mock Data ---
const INITIAL_MEDIA: MediaItem[] = Array.from({ length: 24 }).map((_, i) => ({
  id: `img_${i}`,
  name: `product_shot_${1000 + i}.jpg`,
  url: `hsl(${Math.random() * 360}, 70%, 20%)`, // Placeholder color
  type: i % 4 === 0 ? 'product' : i % 4 === 1 ? 'brand' : i % 4 === 2 ? 'category' : 'uncategorized',
  size: `${(Math.random() * 2 + 0.5).toFixed(1)} MB`,
  dimensions: '2048x2048',
  date: '2025-05-18',
  tags: i % 3 === 0 ? ['hero', 'summer'] : ['detail'],
  selected: false
}));

export const MediaLibrary = () => {
  const [items, setItems] = useState<MediaItem[]>(INITIAL_MEDIA);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<string>('All');
  const [sortConfig, setSortConfig] = useState('date_desc');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  // Selection State
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  
  // Modal State
  const [previewItem, setPreviewItem] = useState<MediaItem | null>(null);
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- Handlers ---

  const handleSelect = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedIds(newSet);
  };

  const handleSelectAll = () => {
    if (selectedIds.size === filteredItems.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredItems.map(i => i.id)));
    }
  };

  const handleDelete = () => {
    if (confirm(`Delete ${selectedIds.size} items? This cannot be undone.`)) {
      setItems(items.filter(i => !selectedIds.has(i.id)));
      setSelectedIds(new Set());
    }
  };

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Mock upload
    if (e.target.files && e.target.files.length > 0) {
      const newItems: MediaItem[] = Array.from(e.target.files).map((file: any, i) => ({
        id: `new_${Date.now()}_${i}`,
        name: file.name,
        url: 'hsl(200, 50%, 20%)',
        type: 'uncategorized',
        size: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
        dimensions: 'Unknown',
        date: new Date().toISOString().split('T')[0],
        tags: ['new'],
        selected: false
      }));
      setItems([...newItems, ...items]);
      setIsUploadOpen(false);
    }
  };

  // --- Filtering ---

  const filteredItems = useMemo(() => {
    return items.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFilter = activeFilter === 'All' || item.type.toLowerCase() === activeFilter.toLowerCase();
      return matchesSearch && matchesFilter;
    }).sort((a, b) => {
      if (sortConfig === 'name_asc') return a.name.localeCompare(b.name);
      if (sortConfig === 'size_desc') return parseFloat(b.size) - parseFloat(a.size);
      return 0; // Default date sort implied by order
    });
  }, [items, searchQuery, activeFilter, sortConfig]);

  return (
    <div className="animate-fade-up space-y-6 min-h-[calc(100vh-100px)] flex flex-col">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
             <ImageIcon className="w-5 h-5 text-brand" />
             <h1 className="text-2xl font-black text-zinc-text uppercase italic tracking-tighter">Media Library</h1>
          </div>
          <p className="text-[10px] font-black text-zinc-muted uppercase tracking-[0.3em] mt-1">Digital Asset Management System</p>
        </div>
        <AmberButton size="sm" onClick={() => setIsUploadOpen(!isUploadOpen)}>
          <UploadCloud className="w-4 h-4 mr-2" /> Upload Assets
        </AmberButton>
      </div>

      {/* Upload Dropzone (Collapsible) */}
      {isUploadOpen && (
        <div 
          className="border-2 border-dashed border-brand/30 bg-brand/5 rounded-lg p-10 flex flex-col items-center justify-center text-center animate-in fade-in slide-in-from-top-4 duration-300 cursor-pointer hover:bg-brand/10 transition-colors"
          onClick={() => fileInputRef.current?.click()}
        >
           <input 
             type="file" 
             multiple 
             className="hidden" 
             ref={fileInputRef} 
             onChange={handleUpload}
           />
           <div className="w-16 h-16 rounded-full bg-brand/10 flex items-center justify-center mb-4 text-brand">
              <UploadCloud className="w-8 h-8" />
           </div>
           <h3 className="text-lg font-bold text-zinc-text">Drag & Drop files here</h3>
           <p className="text-xs text-zinc-muted mt-2">Supports JPG, PNG, WEBP, SVG (Max 50MB)</p>
           <div className="mt-6">
              <AmberButton size="sm" variant="secondary" onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}>
                 Browse Files
              </AmberButton>
           </div>
        </div>
      )}

      {/* Toolbar */}
      <AmberCard noPadding className="sticky top-0 z-20 bg-obsidian-panel/90 backdrop-blur-md border-white/10 shadow-lg">
         <div className="p-4 flex flex-col lg:flex-row gap-4 items-center justify-between">
            
            {/* Left: Filter & Search */}
            <div className="flex flex-1 w-full lg:w-auto gap-4 items-center">
               <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-muted" />
                  <input 
                    type="text" 
                    placeholder="Search filename..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full h-10 bg-obsidian-outer border border-white/5 rounded-sm pl-10 pr-4 text-xs font-bold text-zinc-text outline-none focus:border-brand/30 transition-all"
                  />
               </div>
               
               <div className="hidden md:flex bg-obsidian-outer rounded-sm p-1 border border-white/5">
                  {['All', 'Product', 'Brand', 'Category'].map(f => (
                     <button
                        key={f}
                        onClick={() => setActiveFilter(f)}
                        className={cn(
                           "px-3 py-1.5 text-[9px] font-black uppercase tracking-widest rounded-sm transition-all",
                           activeFilter === f ? "bg-white/10 text-zinc-text" : "text-zinc-muted hover:text-zinc-secondary"
                        )}
                     >
                        {f}
                     </button>
                  ))}
               </div>
            </div>

            {/* Right: Actions & Sort */}
            <div className="flex items-center gap-3 w-full lg:w-auto justify-end">
               <button 
                 onClick={handleSelectAll}
                 className="flex items-center gap-2 px-3 py-2 text-[10px] font-bold text-zinc-muted hover:text-zinc-text transition-colors"
               >
                  {selectedIds.size > 0 && selectedIds.size === filteredItems.length ? <CheckSquare className="w-4 h-4 text-brand" /> : <Square className="w-4 h-4" />}
                  <span className="hidden sm:inline">Select All</span>
               </button>
               
               <AmberDropdown 
                  options={[
                     { label: 'Date: Newest', value: 'date_desc' },
                     { label: 'Name: A-Z', value: 'name_asc' },
                     { label: 'Size: Large-Small', value: 'size_desc' },
                  ]}
                  value={sortConfig}
                  onChange={setSortConfig}
                  className="w-40"
               />

               <div className="flex bg-obsidian-outer rounded-sm p-1 border border-white/5">
                  <button onClick={() => setViewMode('grid')} className={cn("p-1.5 rounded-sm transition-colors", viewMode === 'grid' ? "bg-white/10 text-zinc-text" : "text-zinc-muted")}>
                     <Grid className="w-4 h-4" />
                  </button>
                  <button onClick={() => setViewMode('list')} className={cn("p-1.5 rounded-sm transition-colors", viewMode === 'list' ? "bg-white/10 text-zinc-text" : "text-zinc-muted")}>
                     <List className="w-4 h-4" />
                  </button>
               </div>
            </div>
         </div>
         
         {/* Filter Tags Mobile Scroll */}
         <div className="md:hidden overflow-x-auto p-2 border-t border-white/5 flex gap-2">
            {['All', 'Product', 'Brand', 'Category'].map(f => (
               <button
                  key={f}
                  onClick={() => setActiveFilter(f)}
                  className={cn(
                     "px-3 py-1.5 text-[9px] font-black uppercase tracking-widest rounded-sm transition-all border shrink-0",
                     activeFilter === f ? "bg-brand/10 border-brand/30 text-brand" : "bg-obsidian-outer border-white/5 text-zinc-muted"
                  )}
               >
                  {f}
               </button>
            ))}
         </div>
      </AmberCard>

      {/* Grid Content */}
      <div className={cn(
         "grid gap-4",
         viewMode === 'grid' ? "grid-cols-2 md:grid-cols-4 lg:grid-cols-6" : "grid-cols-1"
      )}>
         {filteredItems.map((item) => (
            <div 
               key={item.id} 
               className={cn(
                  "group relative rounded-sm border transition-all cursor-pointer overflow-hidden bg-obsidian-panel",
                  selectedIds.has(item.id) 
                     ? "border-brand ring-1 ring-brand/50" 
                     : "border-white/5 hover:border-white/20"
               )}
               onClick={() => setPreviewItem(item)}
            >
               {viewMode === 'grid' ? (
                  <>
                     {/* Thumbnail */}
                     <div className="aspect-square w-full relative bg-obsidian-outer flex items-center justify-center overflow-hidden">
                        <div className="absolute inset-0 opacity-80" style={{ backgroundColor: item.url }} />
                        <ImageIcon className="w-8 h-8 text-white/20 relative z-10" />
                        
                        {/* Overlay */}
                        <div className={cn(
                           "absolute inset-0 bg-black/40 transition-opacity flex flex-col justify-between p-2",
                           selectedIds.has(item.id) ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                        )}>
                           <div className="flex justify-between items-start">
                              <button 
                                 onClick={(e) => { e.stopPropagation(); handleSelect(item.id); }}
                                 className={cn(
                                    "w-5 h-5 rounded-sm border flex items-center justify-center transition-colors",
                                    selectedIds.has(item.id) ? "bg-brand border-brand text-obsidian-outer" : "bg-black/50 border-white/30 text-transparent hover:border-white"
                                 )}
                              >
                                 <Check className="w-3.5 h-3.5" />
                              </button>
                              <button className="p-1 rounded-sm bg-black/50 text-white hover:bg-white hover:text-black transition-colors">
                                 <MoreVertical className="w-3.5 h-3.5" />
                              </button>
                           </div>
                        </div>
                     </div>
                     
                     {/* Footer */}
                     <div className="p-3">
                        <p className="text-[10px] font-bold text-zinc-text truncate mb-1" title={item.name}>{item.name}</p>
                        <div className="flex justify-between items-center text-[9px] text-zinc-muted font-medium">
                           <span>{item.size}</span>
                           <span className="uppercase tracking-wide">{item.type.substring(0, 3)}</span>
                        </div>
                     </div>
                  </>
               ) : (
                  // List View
                  <div className="flex items-center gap-4 p-3">
                     <div 
                        className="w-12 h-12 rounded-sm shrink-0 flex items-center justify-center text-white/50"
                        style={{ backgroundColor: item.url }}
                     >
                        <ImageIcon className="w-5 h-5" />
                     </div>
                     <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-zinc-text truncate">{item.name}</p>
                        <p className="text-[10px] text-zinc-muted uppercase tracking-widest">{item.dimensions} • {item.size}</p>
                     </div>
                     <div className="flex items-center gap-4">
                        <span className="text-[9px] font-black bg-white/5 px-2 py-1 rounded text-zinc-secondary uppercase">{item.type}</span>
                        <button 
                           onClick={(e) => { e.stopPropagation(); handleSelect(item.id); }}
                           className={cn(
                              "w-5 h-5 rounded-sm border flex items-center justify-center transition-colors",
                              selectedIds.has(item.id) ? "bg-brand border-brand text-obsidian-outer" : "border-white/20 text-transparent hover:border-white/50"
                           )}
                        >
                           <Check className="w-3.5 h-3.5" />
                        </button>
                     </div>
                  </div>
               )}
            </div>
         ))}
      </div>

      {filteredItems.length === 0 && (
         <div className="flex-1 flex flex-col items-center justify-center text-zinc-muted opacity-50 py-20">
            <Search className="w-12 h-12 mb-4 stroke-1" />
            <p className="text-xs uppercase tracking-widest">No assets found</p>
         </div>
      )}

      {/* Bulk Actions Bar */}
      <div className={cn(
         "fixed bottom-6 left-1/2 -translate-x-1/2 bg-obsidian-card border border-white/10 shadow-2xl rounded-full px-6 py-3 flex items-center gap-6 z-40 transition-all duration-300",
         selectedIds.size > 0 ? "translate-y-0 opacity-100" : "translate-y-20 opacity-0 pointer-events-none"
      )}>
         <span className="text-[10px] font-black text-zinc-text uppercase tracking-widest border-r border-white/10 pr-6">
            {selectedIds.size} Selected
         </span>
         <div className="flex items-center gap-2">
            <button className="p-2 text-zinc-muted hover:text-brand transition-colors rounded-full hover:bg-white/5" title="Download">
               <Download className="w-4 h-4" />
            </button>
            <button className="p-2 text-zinc-muted hover:text-info transition-colors rounded-full hover:bg-white/5" title="Tag">
               <Tag className="w-4 h-4" />
            </button>
            <button className="p-2 text-zinc-muted hover:text-warning transition-colors rounded-full hover:bg-white/5" title="Assign">
               <LinkIcon className="w-4 h-4" />
            </button>
            <div className="w-px h-4 bg-white/10 mx-1" />
            <button onClick={handleDelete} className="p-2 text-zinc-muted hover:text-danger transition-colors rounded-full hover:bg-white/5" title="Delete">
               <Trash2 className="w-4 h-4" />
            </button>
         </div>
         <button onClick={() => setSelectedIds(new Set())} className="ml-2 p-1 bg-white/10 rounded-full text-zinc-muted hover:bg-white/20 transition-colors">
            <X className="w-3 h-3" />
         </button>
      </div>

      {/* Detail SlideOver */}
      <AmberSlideOver
         isOpen={!!previewItem}
         onClose={() => setPreviewItem(null)}
         title="Asset Details"
         description="Metadata and file information."
      >
         {previewItem && (
            <div className="space-y-8">
               {/* Preview */}
               <div className="aspect-square w-full rounded-sm overflow-hidden bg-obsidian-outer relative flex items-center justify-center border border-white/5">
                  <div className="absolute inset-0 opacity-50" style={{ backgroundColor: previewItem.url }} />
                  <ImageIcon className="w-16 h-16 text-white/20 relative z-10" />
                  <div className="absolute bottom-4 right-4 flex gap-2">
                     <button className="p-2 bg-black/50 backdrop-blur-sm rounded-sm text-white hover:bg-white hover:text-black transition-colors">
                        <ZoomIn className="w-4 h-4" />
                     </button>
                     <button className="p-2 bg-black/50 backdrop-blur-sm rounded-sm text-white hover:bg-brand hover:text-black transition-colors">
                        <Download className="w-4 h-4" />
                     </button>
                  </div>
               </div>

               {/* Meta Data */}
               <div className="space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b border-white/5">
                     <Info className="w-4 h-4 text-brand" />
                     <h3 className="text-xs font-black text-zinc-text uppercase tracking-widest">File Metadata</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                     <div className="space-y-1">
                        <p className="text-[9px] font-black text-zinc-muted uppercase tracking-widest">Filename</p>
                        <p className="text-xs font-bold text-zinc-text break-all">{previewItem.name}</p>
                     </div>
                     <div className="space-y-1">
                        <p className="text-[9px] font-black text-zinc-muted uppercase tracking-widest">File Size</p>
                        <p className="text-xs font-bold text-zinc-text">{previewItem.size}</p>
                     </div>
                     <div className="space-y-1">
                        <p className="text-[9px] font-black text-zinc-muted uppercase tracking-widest">Dimensions</p>
                        <p className="text-xs font-bold text-zinc-text">{previewItem.dimensions}</p>
                     </div>
                     <div className="space-y-1">
                        <p className="text-[9px] font-black text-zinc-muted uppercase tracking-widest">Uploaded</p>
                        <p className="text-xs font-bold text-zinc-text">{previewItem.date}</p>
                     </div>
                  </div>
               </div>

               {/* Organization */}
               <div className="space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b border-white/5">
                     <Tag className="w-4 h-4 text-info" />
                     <h3 className="text-xs font-black text-zinc-text uppercase tracking-widest">Organization</h3>
                  </div>
                  <AmberInput 
                     label="Asset Type" 
                     value={previewItem.type} 
                     readOnly 
                     className="capitalize"
                  />
                  <div className="space-y-1.5">
                     <label className="text-[9px] font-black text-zinc-muted uppercase tracking-widest px-1">Tags</label>
                     <div className="flex flex-wrap gap-2">
                        {previewItem.tags.map(tag => (
                           <span key={tag} className="px-2 py-1 bg-white/5 border border-white/10 rounded-sm text-[10px] font-bold text-zinc-text flex items-center gap-1">
                              {tag} <button className="hover:text-danger"><X className="w-3 h-3" /></button>
                           </span>
                        ))}
                        <button className="px-2 py-1 border border-dashed border-white/20 rounded-sm text-[10px] text-zinc-muted hover:text-brand hover:border-brand/30 transition-colors">
                           + Add
                        </button>
                     </div>
                  </div>
               </div>

               <div className="pt-6 border-t border-white/5 flex gap-3">
                  <AmberButton className="flex-1">Update Details</AmberButton>
                  <button className="p-3 rounded-sm bg-danger/10 text-danger border border-danger/20 hover:bg-danger/20 transition-colors">
                     <Trash2 className="w-4 h-4" />
                  </button>
               </div>
            </div>
         )}
      </AmberSlideOver>
    </div>
  );
};
