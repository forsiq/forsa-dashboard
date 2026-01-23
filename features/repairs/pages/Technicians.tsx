
import React, { useState, useMemo } from 'react';
import { AmberCard } from '../../../amber-ui/components/AmberCard';
import { AmberButton } from '../../../amber-ui/components/AmberButton';
import { AmberInput } from '../../../amber-ui/components/AmberInput';
import { AmberDropdown } from '../../../amber-ui/components/AmberDropdown';
import { AmberSlideOver } from '../../../amber-ui/components/AmberSlideOver';
import { 
  UserCog, 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  Star, 
  Wrench, 
  CheckCircle2, 
  XCircle, 
  Mail, 
  Phone,
  Calendar,
  Clock,
  Trash2,
  Edit,
  MessageSquare
} from 'lucide-react';
import { cn } from '../../../lib/cn';

// --- Types ---
interface Technician {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  status: 'Available' | 'Busy' | 'Off';
  role: 'Level 1' | 'Level 2' | 'Lead';
  activeJobs: number;
  completedJobs: number;
  rating: number;
  skills: string[];
  shift: string;
}

// --- Mock Data ---
const SKILLS_LIST = ['Screen Repair', 'Battery', 'Board Level', 'Soldering', 'Water Damage', 'Software', 'Console', 'Laptop'];

const MOCK_TECHNICIANS: Technician[] = [
  { 
    id: 'T-101', 
    name: 'Alex Morgan', 
    email: 'alex@zonevast.corp', 
    phone: '+1 555 0101', 
    avatar: 'AM', 
    status: 'Available', 
    role: 'Lead', 
    activeJobs: 3, 
    completedJobs: 142, 
    rating: 4.9, 
    skills: ['Board Level', 'Soldering', 'Laptop'], 
    shift: '09:00 - 17:00' 
  },
  { 
    id: 'T-102', 
    name: 'Sarah Chen', 
    email: 'sarah@zonevast.corp', 
    phone: '+1 555 0102', 
    avatar: 'SC', 
    status: 'Busy', 
    role: 'Level 2', 
    activeJobs: 5, 
    completedJobs: 98, 
    rating: 4.7, 
    skills: ['Screen Repair', 'Battery', 'Software'], 
    shift: '09:00 - 17:00' 
  },
  { 
    id: 'T-103', 
    name: 'Mike Ross', 
    email: 'mike@zonevast.corp', 
    phone: '+1 555 0103', 
    avatar: 'MR', 
    status: 'Off', 
    role: 'Level 1', 
    activeJobs: 0, 
    completedJobs: 45, 
    rating: 4.5, 
    skills: ['Screen Repair', 'Battery'], 
    shift: '12:00 - 20:00' 
  },
  { 
    id: 'T-104', 
    name: 'Elena Fisher', 
    email: 'elena@zonevast.corp', 
    phone: '+1 555 0104', 
    avatar: 'EF', 
    status: 'Available', 
    role: 'Level 2', 
    activeJobs: 2, 
    completedJobs: 82, 
    rating: 4.8, 
    skills: ['Console', 'Water Damage'], 
    shift: '12:00 - 20:00' 
  },
];

export const Technicians = () => {
  // State
  const [techs, setTechs] = useState<Technician[]>(MOCK_TECHNICIANS);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTech, setEditingTech] = useState<Technician | null>(null);
  
  // Form State
  const [formData, setFormData] = useState<Partial<Technician>>({
    name: '',
    email: '',
    phone: '',
    status: 'Available',
    role: 'Level 1',
    skills: [],
    shift: '09:00 - 17:00'
  });
  
  const [newSkill, setNewSkill] = useState('');

  // --- Handlers ---

  const handleSave = () => {
    if (!formData.name) return;

    if (editingTech) {
      setTechs(prev => prev.map(t => t.id === editingTech.id ? { ...t, ...formData } as Technician : t));
    } else {
      const newTech: Technician = {
        id: `T-${Math.floor(Math.random() * 10000)}`,
        name: formData.name,
        email: formData.email || '',
        phone: formData.phone || '',
        avatar: formData.name.substring(0, 2).toUpperCase(),
        status: (formData.status as any) || 'Available',
        role: (formData.role as any) || 'Level 1',
        activeJobs: 0,
        completedJobs: 0,
        rating: 5.0,
        skills: formData.skills || [],
        shift: formData.shift || '09:00 - 17:00'
      };
      setTechs([...techs, newTech]);
    }
    closeModal();
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to remove this technician?')) {
      setTechs(prev => prev.filter(t => t.id !== id));
    }
  };

  const openAddModal = () => {
    setEditingTech(null);
    setFormData({ name: '', email: '', phone: '', status: 'Available', role: 'Level 1', skills: [], shift: '09:00 - 17:00' });
    setIsModalOpen(true);
  };

  const openEditModal = (tech: Technician) => {
    setEditingTech(tech);
    setFormData({ ...tech });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingTech(null);
  };

  const addSkill = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && newSkill.trim()) {
      e.preventDefault();
      if (!formData.skills?.includes(newSkill)) {
        setFormData(prev => ({ ...prev, skills: [...(prev.skills || []), newSkill] }));
      }
      setNewSkill('');
    }
  };

  const removeSkill = (skill: string) => {
    setFormData(prev => ({ ...prev, skills: prev.skills?.filter(s => s !== skill) }));
  };

  // --- Filtering ---
  const filteredTechs = useMemo(() => {
    return techs.filter(t => {
      const matchesSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            t.skills.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesStatus = statusFilter === 'All' || t.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [techs, searchQuery, statusFilter]);

  // --- Render Helpers ---
  const getStatusColor = (status: string) => {
    switch(status) {
      case 'Available': return 'bg-success text-obsidian-outer border-success';
      case 'Busy': return 'bg-warning text-obsidian-outer border-warning';
      case 'Off': return 'bg-zinc-muted text-obsidian-outer border-white/20';
      default: return 'bg-zinc-muted text-obsidian-outer';
    }
  };

  const getStatusBadge = (status: string) => {
     switch(status) {
        case 'Available': return 'text-success bg-success/10 border-success/20';
        case 'Busy': return 'text-warning bg-warning/10 border-warning/20';
        case 'Off': return 'text-zinc-muted bg-white/5 border-white/10';
     }
  };

  return (
    <div className="animate-fade-up space-y-8">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
             <UserCog className="w-5 h-5 text-brand" />
             <h1 className="text-2xl font-black text-zinc-text uppercase italic tracking-tighter">Technicians</h1>
          </div>
          <p className="text-[10px] font-black text-zinc-muted uppercase tracking-[0.3em] mt-1">Manage repair workforce</p>
        </div>
        <AmberButton size="sm" onClick={openAddModal}>
          <Plus className="w-4 h-4 mr-2" /> Add Technician
        </AmberButton>
      </div>

      {/* Filter Bar */}
      <div className="p-4 bg-obsidian-panel border border-white/5 rounded-sm flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
           <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-muted" />
           <input 
             type="text" 
             placeholder="Search by name or skill..."
             value={searchQuery}
             onChange={(e) => setSearchQuery(e.target.value)}
             className="w-full h-10 bg-obsidian-outer border border-white/5 rounded-sm pl-10 pr-4 text-xs font-bold text-zinc-text outline-none focus:border-brand/30 transition-all"
           />
        </div>
        <AmberDropdown 
           label="Status"
           options={['All', 'Available', 'Busy', 'Off'].map(s => ({label: s, value: s}))}
           value={statusFilter}
           onChange={setStatusFilter}
           className="w-full md:w-48"
        />
        <button className="h-10 px-4 bg-obsidian-card border border-white/5 text-zinc-muted hover:text-zinc-text transition-all rounded-sm flex items-center justify-center hover:bg-white/5">
           <Filter className="w-4 h-4" />
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredTechs.map(tech => (
           <AmberCard key={tech.id} className="group relative overflow-hidden p-0 border-white/5 hover:border-brand/30 transition-all">
              {/* Header */}
              <div className="p-6 pb-0 flex justify-between items-start">
                 <div className="flex items-center gap-4">
                    <div className="relative">
                       <div className="w-14 h-14 rounded-full bg-obsidian-outer border border-white/10 flex items-center justify-center text-lg font-black text-brand shadow-lg">
                          {tech.avatar}
                       </div>
                       <div className={cn("absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-obsidian-panel", getStatusColor(tech.status))} />
                    </div>
                    <div>
                       <h3 className="text-lg font-black text-zinc-text uppercase italic tracking-tight">{tech.name}</h3>
                       <p className="text-[10px] font-bold text-zinc-muted uppercase tracking-widest">{tech.role}</p>
                    </div>
                 </div>
                 
                 <div className="relative">
                    <button className="p-2 text-zinc-muted hover:text-zinc-text rounded-sm hover:bg-white/5 transition-colors group/menu">
                       <MoreVertical className="w-4 h-4" />
                    </button>
                    {/* Simplified Menu for Demo (Actual implementation would handle focus/click-outside properly) */}
                    <div className="absolute right-0 top-full mt-1 w-32 bg-obsidian-card border border-white/10 rounded-sm shadow-xl z-20 hidden group-hover/menu:block hover:block">
                       <button onClick={() => openEditModal(tech)} className="w-full text-left px-3 py-2 text-[9px] font-black text-zinc-text hover:bg-white/5 flex items-center gap-2">
                          <Edit className="w-3 h-3" /> Edit
                       </button>
                       <button onClick={() => handleDelete(tech.id)} className="w-full text-left px-3 py-2 text-[9px] font-black text-danger hover:bg-danger/10 flex items-center gap-2">
                          <Trash2 className="w-3 h-3" /> Remove
                       </button>
                    </div>
                 </div>
              </div>

              {/* Stats */}
              <div className="p-6 grid grid-cols-3 gap-4 border-b border-white/5 mt-2">
                 <div className="text-center">
                    <p className="text-xl font-black text-zinc-text">{tech.activeJobs}</p>
                    <p className="text-[8px] font-bold text-zinc-muted uppercase tracking-wider">Active Jobs</p>
                 </div>
                 <div className="text-center border-x border-white/5 px-2">
                    <p className="text-xl font-black text-success">{tech.completedJobs}</p>
                    <p className="text-[8px] font-bold text-zinc-muted uppercase tracking-wider">Completed</p>
                 </div>
                 <div className="text-center flex flex-col items-center">
                    <div className="flex items-center gap-1 text-brand mb-1">
                       <Star className="w-3.5 h-3.5 fill-current" />
                       <span className="text-sm font-black">{tech.rating}</span>
                    </div>
                    <p className="text-[8px] font-bold text-zinc-muted uppercase tracking-wider">Rating</p>
                 </div>
              </div>

              {/* Details */}
              <div className="p-6 space-y-4">
                 <div className="space-y-2">
                    <p className="text-[9px] font-black text-zinc-muted uppercase tracking-widest flex items-center gap-2">
                       <Wrench className="w-3 h-3" /> Skills
                    </p>
                    <div className="flex flex-wrap gap-2">
                       {tech.skills.slice(0, 3).map(skill => (
                          <span key={skill} className="px-2 py-1 bg-white/5 rounded-sm border border-white/5 text-[9px] font-bold text-zinc-secondary uppercase">
                             {skill}
                          </span>
                       ))}
                       {tech.skills.length > 3 && (
                          <span className="px-2 py-1 text-[9px] font-bold text-zinc-muted">+{tech.skills.length - 3}</span>
                       )}
                    </div>
                 </div>

                 <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center gap-2 text-[10px] font-bold text-zinc-muted">
                       <Clock className="w-3 h-3" /> {tech.shift}
                    </div>
                    <span className={cn("text-[8px] font-black px-1.5 py-0.5 rounded border uppercase tracking-widest", getStatusBadge(tech.status))}>
                       {tech.status}
                    </span>
                 </div>
              </div>

              {/* Footer Actions */}
              <div className="p-3 bg-obsidian-outer/30 border-t border-white/5 flex gap-2">
                 <AmberButton variant="secondary" size="sm" className="flex-1 justify-center h-8 text-[9px]">
                    <Calendar className="w-3 h-3 mr-2" /> Schedule
                 </AmberButton>
                 <AmberButton size="sm" className="flex-1 justify-center h-8 text-[9px]">
                    <MessageSquare className="w-3 h-3 mr-2" /> Message
                 </AmberButton>
              </div>
           </AmberCard>
        ))}
      </div>

      {/* SlideOver */}
      <AmberSlideOver
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingTech ? "Edit Technician" : "Add Technician"}
        description="Manage staff profile and capabilities."
        footer={
           <div className="flex justify-between w-full">
              <AmberButton variant="ghost" onClick={closeModal}>Cancel</AmberButton>
              <AmberButton onClick={handleSave}>{editingTech ? 'Update Profile' : 'Add Technician'}</AmberButton>
           </div>
        }
      >
         <div className="space-y-6">
            <AmberInput 
               label="Full Name"
               placeholder="e.g. John Doe"
               value={formData.name}
               onChange={(e) => setFormData({...formData, name: e.target.value})}
               autoFocus
            />
            
            <div className="grid grid-cols-2 gap-4">
               <AmberInput 
                  label="Email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
               />
               <AmberInput 
                  label="Phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
               />
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div>
                  <label className="text-[9px] font-black text-zinc-muted uppercase tracking-widest px-1 mb-1.5 block">Role</label>
                  <AmberDropdown 
                     options={['Level 1', 'Level 2', 'Lead'].map(r => ({label: r, value: r}))}
                     value={formData.role || 'Level 1'}
                     onChange={(val) => setFormData({...formData, role: val as any})}
                     className="w-full"
                  />
               </div>
               <div>
                  <label className="text-[9px] font-black text-zinc-muted uppercase tracking-widest px-1 mb-1.5 block">Status</label>
                  <AmberDropdown 
                     options={['Available', 'Busy', 'Off'].map(s => ({label: s, value: s}))}
                     value={formData.status || 'Available'}
                     onChange={(val) => setFormData({...formData, status: val as any})}
                     className="w-full"
                  />
               </div>
            </div>

            <AmberInput 
               label="Shift Hours"
               placeholder="e.g. 09:00 - 17:00"
               value={formData.shift}
               onChange={(e) => setFormData({...formData, shift: e.target.value})}
            />

            <div>
               <label className="text-[9px] font-black text-zinc-muted uppercase tracking-widest px-1 mb-1.5 block">Skills</label>
               <div className="w-full bg-obsidian-outer border border-white/5 rounded-sm p-3 flex flex-wrap gap-2 min-h-[80px] focus-within:border-brand/30 transition-all">
                  {formData.skills?.map(skill => (
                     <span key={skill} className="inline-flex items-center gap-1.5 px-2 py-1 bg-white/5 border border-white/5 rounded-sm text-[10px] font-bold text-zinc-text">
                        {skill} 
                        <button onClick={() => removeSkill(skill)} className="hover:text-danger transition-colors"><XCircle className="w-3 h-3" /></button>
                     </span>
                  ))}
                  <input 
                     type="text" 
                     value={newSkill}
                     onChange={(e) => setNewSkill(e.target.value)}
                     onKeyDown={addSkill}
                     placeholder="Type skill & Enter..."
                     className="bg-transparent border-none outline-none text-[10px] font-bold text-zinc-text flex-1 min-w-[80px] placeholder:text-zinc-muted/40"
                  />
               </div>
               <div className="mt-2 flex flex-wrap gap-2">
                  <span className="text-[9px] text-zinc-muted uppercase tracking-widest mr-2">Suggested:</span>
                  {SKILLS_LIST.filter(s => !formData.skills?.includes(s)).slice(0, 4).map(s => (
                     <button 
                        key={s} 
                        onClick={() => setFormData(prev => ({ ...prev, skills: [...(prev.skills || []), s] }))}
                        className="text-[9px] text-brand hover:underline cursor-pointer"
                     >
                        + {s}
                     </button>
                  ))}
               </div>
            </div>
         </div>
      </AmberSlideOver>
    </div>
  );
};
