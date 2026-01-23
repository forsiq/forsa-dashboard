
import React, { useState, useMemo } from 'react';
import { AmberCard } from '../../../amber-ui/components/AmberCard';
import { AmberButton } from '../../../amber-ui/components/AmberButton';
import { AmberInput } from '../../../amber-ui/components/AmberInput';
import { AmberDropdown } from '../../../amber-ui/components/AmberDropdown';
import { AmberSlideOver } from '../../../amber-ui/components/AmberSlideOver';
import { 
  Store, 
  MapPin, 
  User, 
  Phone, 
  Mail, 
  MoreVertical, 
  Plus, 
  Search, 
  Filter,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Edit,
  Trash2,
  BarChart3
} from 'lucide-react';
import { cn } from '../../../lib/cn';

// --- Types ---
interface Warehouse {
  id: string;
  name: string;
  code: string;
  location: string;
  manager: string;
  contact: {
    phone: string;
    email: string;
  };
  capacity: number;
  currentStock: number;
  status: 'Active' | 'Maintenance' | 'Closed';
}

// --- Mock Data ---
const MOCK_WAREHOUSES: Warehouse[] = [
  { 
    id: 'WH-001', 
    name: 'US-East Distribution Center', 
    code: 'USE-NY', 
    location: 'New York, NY', 
    manager: 'Sarah Jenkins', 
    contact: { phone: '+1 555-0123', email: 'sarah.j@zonevast.com' },
    capacity: 50000, 
    currentStock: 32450, 
    status: 'Active' 
  },
  { 
    id: 'WH-002', 
    name: 'EU Central Hub', 
    code: 'EUC-BER', 
    location: 'Berlin, Germany', 
    manager: 'Hans Weber', 
    contact: { phone: '+49 30 123456', email: 'hans.w@zonevast.eu' },
    capacity: 30000, 
    currentStock: 28900, 
    status: 'Active' 
  },
  { 
    id: 'WH-003', 
    name: 'APAC Regional Node', 
    code: 'APR-TOK', 
    location: 'Tokyo, Japan', 
    manager: 'Kenji Sato', 
    contact: { phone: '+81 3 1234 5678', email: 'kenji.s@zonevast.jp' },
    capacity: 25000, 
    currentStock: 12000, 
    status: 'Maintenance' 
  },
  { 
    id: 'WH-004', 
    name: 'West Coast Annex', 
    code: 'USW-SF', 
    location: 'San Francisco, CA', 
    manager: 'Mike Chen', 
    contact: { phone: '+1 555-9876', email: 'mike.c@zonevast.com' },
    capacity: 15000, 
    currentStock: 14800, 
    status: 'Active' 
  },
];

export const Warehouses = () => {
  const [warehouses, setWarehouses] = useState<Warehouse[]>(MOCK_WAREHOUSES);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Warehouse>>({
    name: '',
    location: '',
    manager: '',
    capacity: 10000,
    status: 'Active',
    contact: { phone: '', email: '' }
  });

  // Filter Logic
  const filteredWarehouses = useMemo(() => {
    return warehouses.filter(wh => {
      const matchesSearch = wh.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            wh.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            wh.location.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'All' || wh.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [warehouses, searchQuery, statusFilter]);

  // Handlers
  const handleSave = () => {
    if (!formData.name) return;

    if (editingId) {
      setWarehouses(warehouses.map(wh => wh.id === editingId ? { ...wh, ...formData } as Warehouse : wh));
    } else {
      const newWh: Warehouse = {
        id: `WH-00${warehouses.length + 1}`,
        name: formData.name,
        code: formData.name.substring(0, 3).toUpperCase() + '-' + Math.floor(Math.random() * 100),
        location: formData.location || '',
        manager: formData.manager || 'Unassigned',
        contact: formData.contact || { phone: '', email: '' },
        capacity: formData.capacity || 10000,
        currentStock: 0,
        status: (formData.status as any) || 'Active'
      };
      setWarehouses([...warehouses, newWh]);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this warehouse?')) {
      setWarehouses(warehouses.filter(wh => wh.id !== id));
    }
  };

  const openAddModal = () => {
    setEditingId(null);
    setFormData({
      name: '',
      location: '',
      manager: '',
      capacity: 10000,
      status: 'Active',
      contact: { phone: '', email: '' }
    });
    setIsModalOpen(true);
  };

  const openEditModal = (wh: Warehouse) => {
    setEditingId(wh.id);
    setFormData({ ...wh });
    setIsModalOpen(true);
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'Active': return 'text-success bg-success/10 border-success/20';
      case 'Maintenance': return 'text-warning bg-warning/10 border-warning/20';
      case 'Closed': return 'text-danger bg-danger/10 border-danger/20';
      default: return 'text-zinc-muted';
    }
  };

  return (
    <div className="animate-fade-up space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
             <Store className="w-5 h-5 text-brand" />
             <h1 className="text-2xl font-black text-zinc-text uppercase italic tracking-tighter">Warehouses</h1>
          </div>
          <p className="text-[10px] font-black text-zinc-muted uppercase tracking-[0.3em] mt-1">Manage physical storage nodes</p>
        </div>
        <AmberButton size="sm" onClick={openAddModal}>
          <Plus className="w-4 h-4 mr-2" /> Add Warehouse
        </AmberButton>
      </div>

      {/* Toolbar */}
      <AmberCard noPadding className="p-4 flex flex-col lg:flex-row gap-4 items-center bg-obsidian-panel border-white/5">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-muted" />
          <input 
            type="text" 
            placeholder="Search warehouses..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-10 bg-obsidian-outer border border-white/5 rounded-sm pl-10 pr-4 text-xs font-bold text-zinc-text outline-none focus:border-brand/30 transition-all"
          />
        </div>
        <AmberDropdown 
          label="Status"
          options={[{label: 'All', value: 'All'}, {label: 'Active', value: 'Active'}, {label: 'Maintenance', value: 'Maintenance'}, {label: 'Closed', value: 'Closed'}]}
          value={statusFilter}
          onChange={setStatusFilter}
          className="w-full lg:w-48"
        />
      </AmberCard>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredWarehouses.map((wh) => {
          const usagePercent = Math.round((wh.currentStock / wh.capacity) * 100);
          
          return (
            <AmberCard key={wh.id} className="p-6 flex flex-col gap-6 hover:border-brand/20 transition-all group relative overflow-hidden">
              {/* Card Header */}
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-obsidian-outer border border-white/5 rounded-sm flex items-center justify-center text-zinc-muted group-hover:text-brand transition-colors">
                    <Store className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-zinc-text uppercase tracking-tight">{wh.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[9px] font-bold text-zinc-muted font-mono bg-white/5 px-1.5 py-0.5 rounded-sm">{wh.code}</span>
                      <span className={cn("text-[8px] font-black uppercase px-1.5 py-0.5 rounded-sm border", getStatusColor(wh.status))}>
                        {wh.status}
                      </span>
                    </div>
                  </div>
                </div>
                
                {/* Actions Menu */}
                <div className="relative group/menu">
                   <button className="p-2 text-zinc-muted hover:text-zinc-text hover:bg-white/5 rounded-sm transition-colors">
                      <MoreVertical className="w-4 h-4" />
                   </button>
                   <div className="absolute right-0 top-full mt-1 w-32 bg-obsidian-card border border-white/10 rounded-sm shadow-xl z-10 py-1 hidden group-hover/menu:block hover:block animate-in fade-in zoom-in-95">
                      <button onClick={() => openEditModal(wh)} className="w-full text-left px-3 py-2 text-[10px] font-bold text-zinc-text hover:bg-white/5 flex items-center gap-2">
                         <Edit className="w-3 h-3" /> Edit
                      </button>
                      <button onClick={() => handleDelete(wh.id)} className="w-full text-left px-3 py-2 text-[10px] font-bold text-danger hover:bg-danger/10 flex items-center gap-2">
                         <Trash2 className="w-3 h-3" /> Delete
                      </button>
                   </div>
                </div>
              </div>

              {/* Details */}
              <div className="space-y-3">
                 <div className="flex items-center gap-3 text-xs text-zinc-secondary">
                    <MapPin className="w-4 h-4 text-zinc-muted" />
                    <span>{wh.location}</span>
                 </div>
                 <div className="flex items-center gap-3 text-xs text-zinc-secondary">
                    <User className="w-4 h-4 text-zinc-muted" />
                    <span>{wh.manager}</span>
                 </div>
                 <div className="flex gap-4 pl-7 text-[10px] text-zinc-muted/60">
                    <span className="flex items-center gap-1 hover:text-zinc-muted transition-colors cursor-help" title={wh.contact.phone}><Phone className="w-3 h-3" /> Call</span>
                    <span className="flex items-center gap-1 hover:text-zinc-muted transition-colors cursor-help" title={wh.contact.email}><Mail className="w-3 h-3" /> Email</span>
                 </div>
              </div>

              {/* Capacity Bar */}
              <div className="pt-4 border-t border-white/5">
                 <div className="flex justify-between text-[10px] font-bold mb-2">
                    <span className="text-zinc-muted uppercase tracking-widest">Capacity Usage</span>
                    <span className={cn(usagePercent > 90 ? "text-danger" : "text-zinc-text")}>{usagePercent}%</span>
                 </div>
                 <div className="w-full h-2 bg-obsidian-outer rounded-full overflow-hidden border border-white/5">
                    <div 
                      className={cn("h-full transition-all duration-500", usagePercent > 90 ? "bg-danger" : usagePercent > 75 ? "bg-warning" : "bg-brand")} 
                      style={{ width: `${usagePercent}%` }} 
                    />
                 </div>
                 <div className="flex justify-between text-[9px] text-zinc-muted font-mono mt-1.5">
                    <span>{wh.currentStock.toLocaleString()} Units</span>
                    <span>{wh.capacity.toLocaleString()} Max</span>
                 </div>
              </div>
            </AmberCard>
          );
        })}
        
        {/* Add New Card */}
        <button 
          onClick={openAddModal}
          className="min-h-[300px] border-2 border-dashed border-white/10 rounded-xl flex flex-col items-center justify-center gap-4 text-zinc-muted hover:text-brand hover:border-brand/30 hover:bg-white/[0.02] transition-all group"
        >
           <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Plus className="w-8 h-8" />
           </div>
           <span className="text-xs font-black uppercase tracking-widest">Register New Node</span>
        </button>
      </div>

      {/* SlideOver Form */}
      <AmberSlideOver
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingId ? "Edit Warehouse" : "Add Warehouse"}
        description="Configure storage node details and capacity."
        footer={
           <>
              <AmberButton variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</AmberButton>
              <AmberButton onClick={handleSave}>Save Changes</AmberButton>
           </>
        }
      >
         <div className="space-y-6">
            <AmberInput 
               label="Warehouse Name"
               placeholder="e.g. North Regional Hub"
               value={formData.name}
               onChange={(e) => setFormData({ ...formData, name: e.target.value })}
               required
            />
            <AmberInput 
               label="Location Address"
               placeholder="City, State, Country"
               value={formData.location}
               onChange={(e) => setFormData({ ...formData, location: e.target.value })}
               icon={<MapPin className="w-4 h-4" />}
            />
            
            <div className="grid grid-cols-2 gap-4">
               <AmberInput 
                  label="Max Capacity (Units)"
                  type="number"
                  value={formData.capacity}
                  onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) })}
                  icon={<BarChart3 className="w-4 h-4" />}
               />
               <div>
                  <label className="text-[9px] font-black text-zinc-muted uppercase tracking-widest px-1 mb-1.5 block">Status</label>
                  <AmberDropdown 
                     options={[{label: 'Active', value: 'Active'}, {label: 'Maintenance', value: 'Maintenance'}, {label: 'Closed', value: 'Closed'}]}
                     value={formData.status || 'Active'}
                     onChange={(val) => setFormData({ ...formData, status: val as any })}
                     className="w-full"
                  />
               </div>
            </div>

            <div className="p-4 bg-obsidian-outer/50 border border-white/5 rounded-sm space-y-4">
               <h4 className="text-[10px] font-black text-zinc-text uppercase tracking-widest flex items-center gap-2">
                  <User className="w-3 h-3" /> Management Contact
               </h4>
               <AmberInput 
                  label="Manager Name"
                  placeholder="Full Name"
                  value={formData.manager}
                  onChange={(e) => setFormData({ ...formData, manager: e.target.value })}
               />
               <div className="grid grid-cols-2 gap-4">
                  <AmberInput 
                     label="Phone"
                     placeholder="+1..."
                     value={formData.contact?.phone}
                     onChange={(e) => setFormData({ ...formData, contact: { ...formData.contact!, phone: e.target.value } })}
                  />
                  <AmberInput 
                     label="Email"
                     placeholder="@zonevast.com"
                     value={formData.contact?.email}
                     onChange={(e) => setFormData({ ...formData, contact: { ...formData.contact!, email: e.target.value } })}
                  />
               </div>
            </div>
         </div>
      </AmberSlideOver>
    </div>
  );
};
