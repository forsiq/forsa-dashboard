

import React, { useState, useMemo } from 'react';
import { AmberCard } from '../../../amber-ui/components/AmberCard';
import { AmberButton } from '../../../amber-ui/components/AmberButton';
import { AmberInput } from '../../../amber-ui/components/AmberInput';
import { AmberDropdown } from '../../../amber-ui/components/AmberDropdown';
import { AmberSlideOver } from '../../../amber-ui/components/AmberSlideOver';
import { 
  BookOpen, 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  Edit, 
  Trash2, 
  Zap, 
  Smartphone, 
  Monitor, 
  Cpu, 
  Clock, 
  DollarSign, 
  Hammer,
  FileText,
  Activity,
  X
} from 'lucide-react';
import { cn } from '../../../lib/cn';

// --- Types ---
type ServiceCategory = 'Screen' | 'Battery' | 'Software' | 'Diagnostic' | 'Board Level' | 'Other';

interface Service {
  id: string;
  name: string;
  category: ServiceCategory;
  description: string;
  price: number;
  timeEstimate: string;
  skills: string[];
  usageCount: number;
}

// --- Mock Data ---
const CATEGORIES: { id: ServiceCategory; icon: any; color: string }[] = [
  { id: 'Screen', icon: Smartphone, color: 'text-info' },
  { id: 'Battery', icon: Zap, color: 'text-warning' },
  { id: 'Software', icon: Monitor, color: 'text-purple-500' },
  { id: 'Diagnostic', icon: Activity, color: 'text-success' },
  { id: 'Board Level', icon: Cpu, color: 'text-danger' },
  { id: 'Other', icon: Hammer, color: 'text-zinc-muted' }
];

const INITIAL_SERVICES: Service[] = [
  { id: 'S-101', name: 'iPhone 13 Screen Replacement', category: 'Screen', description: 'Full assembly replacement including digitizer.', price: 189.00, timeEstimate: '45m', skills: ['Screen Repair', 'Apple'], usageCount: 142 },
  { id: 'S-102', name: 'MacBook Battery Swap', category: 'Battery', description: 'Original OEM battery replacement.', price: 220.00, timeEstimate: '1h 30m', skills: ['Laptop', 'Battery'], usageCount: 85 },
  { id: 'S-103', name: 'Data Recovery (Tier 1)', category: 'Software', description: 'Software-based recovery for accidental deletion.', price: 150.00, timeEstimate: '24h', skills: ['Software', 'Data Recovery'], usageCount: 32 },
  { id: 'S-104', name: 'Water Damage Cleaning', category: 'Board Level', description: 'Ultrasonic cleaning and board inspection.', price: 99.00, timeEstimate: '3h', skills: ['Water Damage', 'Soldering'], usageCount: 18 },
  { id: 'S-105', name: 'Diagnostic Service', category: 'Diagnostic', description: 'Full hardware and software diagnostic report.', price: 49.00, timeEstimate: '30m', skills: ['L1 Diagnostic'], usageCount: 410 },
  { id: 'S-106', name: 'PS5 HDMI Port Repair', category: 'Board Level', description: 'HDMI port replacement with reinforcement.', price: 120.00, timeEstimate: '2h', skills: ['Soldering', 'Console'], usageCount: 65 },
];

export const ServiceCatalog = () => {
  // State
  const [services, setServices] = useState<Service[]>(INITIAL_SERVICES);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [formData, setFormData] = useState<Partial<Service>>({
    name: '',
    category: 'Screen',
    description: '',
    price: 0,
    timeEstimate: '1h',
    skills: []
  });

  const [skillInput, setSkillInput] = useState('');

  // --- Handlers ---

  const handleSave = () => {
    if (!formData.name || !formData.price) return;

    if (editingService) {
      setServices(prev => prev.map(s => s.id === editingService.id ? { ...s, ...formData } as Service : s));
    } else {
      const newService: Service = {
        id: `S-${Math.floor(Date.now() / 1000)}`,
        name: formData.name,
        category: (formData.category as ServiceCategory) || 'Other',
        description: formData.description || '',
        price: Number(formData.price),
        timeEstimate: formData.timeEstimate || '1h',
        skills: formData.skills || [],
        usageCount: 0
      };
      setServices([newService, ...services]);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this service?')) {
      setServices(prev => prev.filter(s => s.id !== id));
    }
  };

  const openAddModal = () => {
    setEditingService(null);
    setFormData({ name: '', category: 'Screen', description: '', price: 0, timeEstimate: '1h', skills: [] });
    setIsModalOpen(true);
  };

  const openEditModal = (svc: Service) => {
    setEditingService(svc);
    setFormData({ ...svc });
    setIsModalOpen(true);
  };

  const addSkill = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && skillInput.trim()) {
      e.preventDefault();
      if (!formData.skills?.includes(skillInput.trim())) {
        setFormData(prev => ({ ...prev, skills: [...(prev.skills || []), skillInput.trim()] }));
      }
      setSkillInput('');
    }
  };

  // --- Filtering ---
  const filteredServices = useMemo(() => {
    return services.filter(s => {
      const matchSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchCat = categoryFilter === 'All' || s.category === categoryFilter;
      return matchSearch && matchCat;
    });
  }, [services, searchQuery, categoryFilter]);

  // --- Render Helpers ---
  const getCategoryIcon = (cat: ServiceCategory) => {
    const found = CATEGORIES.find(c => c.id === cat);
    const Icon = found ? found.icon : Hammer;
    return <Icon className="w-5 h-5" />;
  };

  const getCategoryColor = (cat: ServiceCategory) => {
    const found = CATEGORIES.find(c => c.id === cat);
    return found ? found.color : 'text-zinc-muted';
  };

  return (
    <div className="animate-fade-up space-y-8 min-h-[calc(100vh-100px)] flex flex-col">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
             <BookOpen className="w-5 h-5 text-brand" />
             <h1 className="text-2xl font-black text-zinc-text uppercase italic tracking-tighter">Service Catalog</h1>
          </div>
          <p className="text-[10px] font-black text-zinc-muted uppercase tracking-[0.3em] mt-1">Manage standard repair offerings</p>
        </div>
        <AmberButton size="sm" onClick={openAddModal}>
          <Plus className="w-4 h-4 mr-2" /> Add Service
        </AmberButton>
      </div>

      {/* Filter Bar */}
      <div className="bg-obsidian-panel border border-white/5 rounded-sm p-4 flex flex-col sm:flex-row gap-4 items-center">
         <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-muted" />
            <input 
              type="text" 
              placeholder="Search services..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 bg-obsidian-outer border border-white/5 rounded-sm pl-10 pr-4 text-xs font-bold text-zinc-text outline-none focus:border-brand/30 transition-all"
            />
         </div>
         <AmberDropdown 
            label="Category"
            options={[{label: 'All Categories', value: 'All'}, ...CATEGORIES.map(c => ({label: c.id, value: c.id}))]}
            value={categoryFilter}
            onChange={setCategoryFilter}
            className="w-full sm:w-48"
         />
         <button className="h-10 px-4 bg-obsidian-card border border-white/5 text-zinc-muted hover:text-zinc-text transition-all rounded-sm flex items-center justify-center hover:bg-white/5">
            <Filter className="w-4 h-4" />
         </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
         {filteredServices.map(svc => (
            <AmberCard key={svc.id} className="p-6 flex flex-col h-full hover:border-brand/30 transition-all group relative overflow-hidden">
               <div className="flex justify-between items-start mb-4">
                  <div className={cn("w-12 h-12 rounded-sm bg-obsidian-outer border border-white/5 flex items-center justify-center", getCategoryColor(svc.category))}>
                     {getCategoryIcon(svc.category)}
                  </div>
                  <div className="flex items-center gap-2">
                     <span className="text-[10px] font-black bg-white/5 px-2 py-0.5 rounded text-zinc-muted uppercase tracking-widest">{svc.timeEstimate}</span>
                     <button className="p-1 text-zinc-muted hover:text-zinc-text group/menu relative">
                        <MoreVertical className="w-4 h-4" />
                        {/* Simple Hover Menu for demo */}
                        <div className="absolute right-0 top-full mt-1 w-24 bg-obsidian-card border border-white/10 rounded-sm shadow-xl z-20 hidden group-hover/menu:block">
                           <button onClick={(e) => { e.stopPropagation(); openEditModal(svc); }} className="w-full text-left px-3 py-2 text-[9px] font-bold hover:bg-white/5 flex items-center gap-2">
                              <Edit className="w-3 h-3" /> Edit
                           </button>
                           <button onClick={(e) => { e.stopPropagation(); handleDelete(svc.id); }} className="w-full text-left px-3 py-2 text-[9px] font-bold text-danger hover:bg-danger/10 flex items-center gap-2">
                              <Trash2 className="w-3 h-3" /> Delete
                           </button>
                        </div>
                     </button>
                  </div>
               </div>
               
               <h3 className="text-lg font-black text-zinc-text uppercase tracking-tight italic mb-2">{svc.name}</h3>
               <p className="text-xs text-zinc-secondary leading-relaxed mb-6 flex-1">{svc.description}</p>
               
               <div className="space-y-4">
                  <div className="flex flex-wrap gap-1.5">
                     {svc.skills.map(skill => (
                        <span key={skill} className="text-[8px] font-bold bg-white/5 border border-white/5 px-1.5 py-0.5 rounded text-zinc-muted uppercase">
                           {skill}
                        </span>
                     ))}
                  </div>
                  
                  <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                     <div className="flex flex-col">
                        <span className="text-[10px] font-black text-zinc-muted uppercase tracking-widest mb-0.5">Base Price</span>
                        <span className="text-lg font-black text-zinc-text">${svc.price.toFixed(2)}</span>
                     </div>
                     <AmberButton size="sm" variant="secondary" onClick={() => alert(`Created estimate for ${svc.name}`)}>
                        <FileText className="w-3.5 h-3.5 mr-2" /> Estimate
                     </AmberButton>
                  </div>
               </div>
               
               <div className="absolute top-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-[8px] font-bold text-zinc-muted bg-obsidian-outer px-2 py-1 rounded-sm border border-white/10">Used {svc.usageCount}x</span>
               </div>
            </AmberCard>
         ))}
      </div>

      {/* SlideOver */}
      <AmberSlideOver
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingService ? "Edit Service" : "Add Service"}
        description="Define service parameters and pricing."
        footer={
           <div className="flex justify-between w-full">
              <AmberButton variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</AmberButton>
              <AmberButton onClick={handleSave}>{editingService ? 'Update Service' : 'Create Service'}</AmberButton>
           </div>
        }
      >
         <div className="space-y-6">
            <AmberInput 
               label="Service Name"
               placeholder="e.g. Battery Replacement"
               value={formData.name}
               onChange={(e) => setFormData({...formData, name: e.target.value})}
               autoFocus
            />
            
            <div className="grid grid-cols-2 gap-4">
               <div>
                  <label className="text-[9px] font-black text-zinc-muted uppercase tracking-widest px-1 mb-1.5 block">Category</label>
                  <AmberDropdown 
                     options={CATEGORIES.map(c => ({label: c.id, value: c.id}))}
                     value={formData.category as string}
                     onChange={(val) => setFormData({...formData, category: val as ServiceCategory})}
                     className="w-full"
                  />
               </div>
               <AmberInput 
                  label="Time Estimate"
                  placeholder="e.g. 1h 30m"
                  value={formData.timeEstimate}
                  onChange={(e) => setFormData({...formData, timeEstimate: e.target.value})}
               />
            </div>

            <AmberInput 
               label="Base Price ($)"
               type="number"
               value={formData.price}
               onChange={(e) => setFormData({...formData, price: parseFloat(e.target.value)})}
            />

            <AmberInput 
               label="Description"
               multiline
               rows={3}
               placeholder="Details about the service..."
               value={formData.description}
               onChange={(e) => setFormData({...formData, description: e.target.value})}
            />

            <div>
               <label className="text-[9px] font-black text-zinc-muted uppercase tracking-widest px-1 mb-1.5 block">Required Skills</label>
               <div className="w-full bg-obsidian-outer border border-white/5 rounded-sm p-3 flex flex-wrap gap-2 min-h-[50px] focus-within:border-brand/30 transition-all">
                  {formData.skills?.map(skill => (
                     <span key={skill} className="inline-flex items-center gap-1.5 px-2 py-1 bg-white/5 border border-white/5 rounded-sm text-[10px] font-bold text-zinc-text">
                        {skill} 
                        <button onClick={() => setFormData(prev => ({...prev, skills: prev.skills?.filter(s => s !== skill)}))} className="hover:text-danger transition-colors"><X className="w-3 h-3" /></button>
                     </span>
                  ))}
                  <input 
                     type="text" 
                     value={skillInput}
                     onChange={(e) => setSkillInput(e.target.value)}
                     onKeyDown={addSkill}
                     placeholder="Type skill & Enter..."
                     className="bg-transparent border-none outline-none text-[10px] font-bold text-zinc-text flex-1 min-w-[80px] placeholder:text-zinc-muted/40"
                  />
               </div>
            </div>
         </div>
      </AmberSlideOver>
    </div>
  );
};
