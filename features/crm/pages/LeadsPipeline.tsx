
import React, { useState, useMemo } from 'react';
import { AmberCard } from '../../../amber-ui/components/AmberCard';
import { AmberButton } from '../../../amber-ui/components/AmberButton';
import { AmberSlideOver } from '../../../amber-ui/components/AmberSlideOver';
import { AmberInput } from '../../../amber-ui/components/AmberInput';
import { AmberDropdown } from '../../../amber-ui/components/AmberDropdown';
import { 
  Kanban, 
  Plus, 
  MoreVertical, 
  Search, 
  Filter, 
  Star, 
  Building2, 
  DollarSign, 
  User, 
  Calendar,
  ChevronRight,
  MoveRight,
  UserPlus,
  Trash2
} from 'lucide-react';
import { cn } from '../../../lib/cn';

// --- Types ---
type Stage = 'New' | 'Contacted' | 'Qualified' | 'Proposal' | 'Negotiation' | 'Won' | 'Lost';

interface Lead {
  id: string;
  name: string;
  company: string;
  email: string;
  stage: Stage;
  value: number;
  source: string;
  rating: number; // 1-5
  owner: string; // User ID or Name
  createdAt: string;
}

// --- Mock Data ---
const STAGES: { id: Stage; color: string }[] = [
  { id: 'New', color: 'bg-zinc-500' },
  { id: 'Contacted', color: 'bg-info' },
  { id: 'Qualified', color: 'bg-brand' },
  { id: 'Proposal', color: 'bg-purple-500' },
  { id: 'Negotiation', color: 'bg-orange-500' },
  { id: 'Won', color: 'bg-success' },
  { id: 'Lost', color: 'bg-danger' },
];

const MOCK_LEADS: Lead[] = [
  { id: 'L-101', name: 'John Smith', company: 'TechNova', email: 'john@technova.io', stage: 'New', value: 12500, source: 'Website', rating: 4, owner: 'Alex Morgan', createdAt: '2025-05-18' },
  { id: 'L-102', name: 'Emily Davis', company: 'GreenEarth', email: 'emily@ge.org', stage: 'Qualified', value: 45000, source: 'Referral', rating: 5, owner: 'Sarah Chen', createdAt: '2025-05-15' },
  { id: 'L-103', name: 'Michael Brown', company: 'RapidLogistics', email: 'mb@rapid.com', stage: 'Proposal', value: 8500, source: 'LinkedIn', rating: 3, owner: 'Alex Morgan', createdAt: '2025-05-20' },
  { id: 'L-104', name: 'Sophia Wilson', company: 'BlueSky Inc', email: 'sophia@bluesky.net', stage: 'Negotiation', value: 120000, source: 'Event', rating: 5, owner: 'Sarah Chen', createdAt: '2025-05-10' },
  { id: 'L-105', name: 'David Lee', company: 'StartUp Hub', email: 'david@hub.co', stage: 'Contacted', value: 2000, source: 'Website', rating: 2, owner: 'James Wilson', createdAt: '2025-05-19' },
  { id: 'L-106', name: 'Chris Evans', company: 'Shield Systems', email: 'cevans@shield.gov', stage: 'Won', value: 500000, source: 'Partner', rating: 5, owner: 'Alex Morgan', createdAt: '2025-04-01' },
];

export const LeadsPipeline = () => {
  // State
  const [leads, setLeads] = useState<Lead[]>(MOCK_LEADS);
  const [draggedLeadId, setDraggedLeadId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [ownerFilter, setOwnerFilter] = useState('All');
  
  // SlideOver State
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // New Lead Form
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newLeadForm, setNewLeadForm] = useState<Partial<Lead>>({ stage: 'New', rating: 3 });

  // --- Handlers ---

  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedLeadId(id);
    e.dataTransfer.effectAllowed = 'move';
    // Transparent drag image hack if needed, but default is usually fine
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault(); // Necessary to allow dropping
  };

  const handleDrop = (e: React.DragEvent, stage: Stage) => {
    e.preventDefault();
    if (!draggedLeadId) return;

    setLeads(prev => prev.map(l => 
      l.id === draggedLeadId ? { ...l, stage } : l
    ));
    setDraggedLeadId(null);
  };

  const handleLeadClick = (lead: Lead) => {
    setSelectedLead(lead);
    setIsEditing(false);
    setIsDetailOpen(true);
  };

  const handleAddLead = () => {
    const lead: Lead = {
      id: `L-${Math.floor(Math.random() * 10000)}`,
      name: newLeadForm.name || 'New Lead',
      company: newLeadForm.company || 'Unknown',
      email: newLeadForm.email || '',
      stage: newLeadForm.stage || 'New',
      value: newLeadForm.value || 0,
      source: newLeadForm.source || 'Direct',
      rating: newLeadForm.rating || 1,
      owner: 'Current User',
      createdAt: new Date().toISOString().split('T')[0]
    };
    setLeads([...leads, lead]);
    setIsAddOpen(false);
    setNewLeadForm({ stage: 'New', rating: 3 });
  };

  const handleDeleteLead = (id: string) => {
    if (confirm('Delete this lead?')) {
      setLeads(leads.filter(l => l.id !== id));
      setIsDetailOpen(false);
    }
  };

  // --- Filtering ---
  const filteredLeads = useMemo(() => {
    return leads.filter(l => {
      const matchesSearch = l.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            l.company.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesOwner = ownerFilter === 'All' || l.owner === ownerFilter;
      return matchesSearch && matchesOwner;
    });
  }, [leads, searchQuery, ownerFilter]);

  // Group by stage
  const leadsByStage = useMemo(() => {
    const groups: Record<Stage, Lead[]> = {
      New: [], Contacted: [], Qualified: [], Proposal: [], Negotiation: [], Won: [], Lost: []
    };
    filteredLeads.forEach(l => {
      if (groups[l.stage]) groups[l.stage].push(l);
    });
    return groups;
  }, [filteredLeads]);

  const getStageTotal = (stageLeads: Lead[]) => stageLeads.reduce((sum, l) => sum + l.value, 0);

  return (
    <div className="h-[calc(100vh-100px)] flex flex-col space-y-6 animate-fade-up">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 shrink-0">
        <div>
          <div className="flex items-center gap-2 mb-1">
             <Kanban className="w-5 h-5 text-brand" />
             <h1 className="text-2xl font-black text-zinc-text uppercase italic tracking-tighter">Leads Pipeline</h1>
          </div>
          <p className="text-[10px] font-black text-zinc-muted uppercase tracking-[0.3em] mt-1">Manage deal flow and conversion</p>
        </div>
        <div className="flex gap-2">
          <AmberButton size="sm" onClick={() => setIsAddOpen(true)}>
            <Plus className="w-3.5 h-3.5 mr-2" /> Add Lead
          </AmberButton>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-obsidian-panel border border-white/5 rounded-sm p-4 flex flex-col sm:flex-row gap-4 items-center shrink-0">
         <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-muted" />
            <input 
              type="text" 
              placeholder="Search leads..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-9 bg-obsidian-outer border border-white/5 rounded-sm pl-10 pr-4 text-xs font-bold text-zinc-text outline-none focus:border-brand/30"
            />
         </div>
         <AmberDropdown 
            label="Owner"
            options={['All', 'Alex Morgan', 'Sarah Chen', 'James Wilson'].map(o => ({label: o, value: o}))}
            value={ownerFilter}
            onChange={setOwnerFilter}
            className="w-full sm:w-48"
         />
         <button className="h-9 px-4 bg-obsidian-card border border-white/5 text-zinc-muted hover:text-zinc-text transition-all rounded-sm flex items-center justify-center hover:bg-white/5">
            <Filter className="w-4 h-4" />
         </button>
      </div>

      {/* Kanban Board */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden pb-4">
         <div className="flex gap-4 h-full min-w-max px-1">
            {STAGES.map(stage => {
               const stageLeads = leadsByStage[stage.id];
               const totalValue = getStageTotal(stageLeads);
               
               return (
                  <div 
                    key={stage.id}
                    className="w-80 flex flex-col h-full bg-obsidian-panel/30 border border-white/5 rounded-lg overflow-hidden shrink-0"
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, stage.id)}
                  >
                     {/* Column Header */}
                     <div className="p-3 border-b border-white/5 bg-obsidian-panel shrink-0 group">
                        <div className="flex justify-between items-center mb-1">
                           <div className="flex items-center gap-2">
                              <div className={cn("w-2 h-2 rounded-full", stage.color)} />
                              <h3 className="text-xs font-black text-zinc-text uppercase tracking-widest">{stage.id}</h3>
                           </div>
                           <span className="text-[10px] font-bold text-zinc-muted bg-white/5 px-1.5 rounded">{stageLeads.length}</span>
                        </div>
                        <div className="flex justify-between items-center">
                           <p className="text-[10px] font-bold text-zinc-muted">${totalValue.toLocaleString()}</p>
                           <button onClick={() => { setNewLeadForm({ ...newLeadForm, stage: stage.id }); setIsAddOpen(true); }} className="opacity-0 group-hover:opacity-100 transition-opacity text-zinc-muted hover:text-brand">
                              <Plus className="w-3.5 h-3.5" />
                           </button>
                        </div>
                     </div>

                     {/* Column Body */}
                     <div className="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar bg-obsidian-outer/20">
                        {stageLeads.map(lead => (
                           <div
                              key={lead.id}
                              draggable
                              onDragStart={(e) => handleDragStart(e, lead.id)}
                              onClick={() => handleLeadClick(lead)}
                              className={cn(
                                 "p-3 bg-obsidian-card border border-white/5 rounded-sm hover:border-brand/30 cursor-pointer transition-all shadow-sm group active:cursor-grabbing",
                                 draggedLeadId === lead.id ? "opacity-50 border-dashed border-white/20" : ""
                              )}
                           >
                              <div className="flex justify-between items-start mb-2">
                                 <h4 className="text-xs font-bold text-zinc-text group-hover:text-brand transition-colors truncate">{lead.name}</h4>
                                 <div className="flex items-center gap-0.5 text-brand/80 text-[8px]">
                                    {lead.rating >= 4 && <Star className="w-2.5 h-2.5 fill-current" />}
                                    {lead.rating === 5 && <Star className="w-2.5 h-2.5 fill-current" />}
                                 </div>
                              </div>
                              <p className="text-[10px] text-zinc-muted truncate mb-3 flex items-center gap-1">
                                 <Building2 className="w-3 h-3" /> {lead.company}
                              </p>
                              
                              <div className="flex items-center justify-between mt-auto pt-2 border-t border-white/5">
                                 <div className="flex items-center gap-2">
                                    <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-[9px] font-bold text-zinc-text">
                                       {lead.owner.charAt(0)}
                                    </div>
                                    <span className="text-[9px] font-black bg-white/5 px-1.5 rounded text-zinc-secondary uppercase">{lead.source}</span>
                                 </div>
                                 <span className="text-[10px] font-bold text-zinc-text">${lead.value.toLocaleString()}</span>
                              </div>
                           </div>
                        ))}
                        {stageLeads.length === 0 && (
                           <div className="h-20 border-2 border-dashed border-white/5 rounded-sm flex items-center justify-center text-zinc-muted/30 text-[10px] uppercase font-bold tracking-widest">
                              Empty
                           </div>
                        )}
                     </div>
                  </div>
               );
            })}
         </div>
      </div>

      {/* Lead Detail SlideOver */}
      <AmberSlideOver
         isOpen={isDetailOpen}
         onClose={() => setIsDetailOpen(false)}
         title={selectedLead ? selectedLead.name : "Lead Details"}
         description={selectedLead ? selectedLead.company : ""}
         footer={
            selectedLead && (
               <div className="flex justify-between w-full">
                  <div className="flex gap-2">
                     <AmberButton variant="ghost" onClick={() => handleDeleteLead(selectedLead.id)} className="text-danger hover:bg-danger/10"><Trash2 className="w-3.5 h-3.5" /></AmberButton>
                  </div>
                  <div className="flex gap-2">
                     <AmberButton variant="secondary" onClick={() => setIsDetailOpen(false)}>Close</AmberButton>
                     <AmberButton className="bg-success text-white hover:bg-success/90 border-transparent">
                        Convert to Customer <MoveRight className="w-3.5 h-3.5 ml-2" />
                     </AmberButton>
                  </div>
               </div>
            )
         }
      >
         {selectedLead && (
            <div className="space-y-6">
               <div className="flex items-center justify-between p-4 bg-obsidian-outer/50 border border-white/5 rounded-sm">
                  <div className="flex items-center gap-4">
                     <div className="w-12 h-12 rounded-full bg-brand/10 flex items-center justify-center text-brand font-black text-sm border border-brand/20">
                        {selectedLead.name.substring(0, 2).toUpperCase()}
                     </div>
                     <div>
                        <h3 className="text-sm font-bold text-zinc-text">{selectedLead.name}</h3>
                        <p className="text-[10px] text-zinc-muted">{selectedLead.email}</p>
                     </div>
                  </div>
                  <div className="text-right">
                     <p className="text-[10px] font-black text-zinc-muted uppercase tracking-widest">Potential Value</p>
                     <p className="text-lg font-black text-success">${selectedLead.value.toLocaleString()}</p>
                  </div>
               </div>

               <div className="grid grid-cols-2 gap-4">
                  <AmberInput label="Company" value={selectedLead.company} readOnly />
                  <AmberInput label="Source" value={selectedLead.source} readOnly />
                  <div className="col-span-2">
                     <label className="text-[9px] font-black text-zinc-muted uppercase tracking-widest px-1 mb-1.5 block">Stage</label>
                     <div className="p-3 bg-obsidian-outer border border-white/5 rounded-sm flex items-center gap-2">
                        <div className={cn("w-2 h-2 rounded-full", STAGES.find(s => s.id === selectedLead.stage)?.color)} />
                        <span className="text-xs font-bold text-zinc-text">{selectedLead.stage}</span>
                     </div>
                  </div>
               </div>

               <div className="pt-4 border-t border-white/5">
                  <h4 className="text-[10px] font-black text-zinc-text uppercase tracking-widest mb-4">Activity Log</h4>
                  <div className="space-y-4 pl-2 border-l border-white/10 ml-2">
                     <div className="relative pl-4">
                        <div className="absolute -left-[5px] top-1.5 w-2.5 h-2.5 rounded-full bg-zinc-muted border-2 border-obsidian-panel" />
                        <p className="text-xs font-bold text-zinc-text">Lead Created</p>
                        <p className="text-[9px] text-zinc-muted">{selectedLead.createdAt}</p>
                     </div>
                  </div>
               </div>
            </div>
         )}
      </AmberSlideOver>

      {/* Add Lead SlideOver */}
      <AmberSlideOver
         isOpen={isAddOpen}
         onClose={() => setIsAddOpen(false)}
         title="New Lead"
         description="Add a potential customer to the pipeline."
         footer={
            <>
               <AmberButton variant="ghost" onClick={() => setIsAddOpen(false)}>Cancel</AmberButton>
               <AmberButton onClick={handleAddLead}>Create Lead</AmberButton>
            </>
         }
      >
         <div className="space-y-6">
            <AmberInput 
               label="Full Name" 
               placeholder="e.g. Jane Doe"
               value={newLeadForm.name} 
               onChange={(e) => setNewLeadForm({...newLeadForm, name: e.target.value})}
            />
            <AmberInput 
               label="Company" 
               placeholder="Company Inc."
               value={newLeadForm.company} 
               onChange={(e) => setNewLeadForm({...newLeadForm, company: e.target.value})}
            />
            <AmberInput 
               label="Email" 
               type="email"
               placeholder="jane@company.com"
               value={newLeadForm.email} 
               onChange={(e) => setNewLeadForm({...newLeadForm, email: e.target.value})}
            />
            <div className="grid grid-cols-2 gap-4">
               <AmberInput 
                  label="Estimated Value" 
                  type="number"
                  placeholder="0.00"
                  value={newLeadForm.value} 
                  onChange={(e) => setNewLeadForm({...newLeadForm, value: parseFloat(e.target.value)})}
               />
               <div>
                  <label className="text-[9px] font-black text-zinc-muted uppercase tracking-widest px-1 mb-1.5 block">Stage</label>
                  <AmberDropdown 
                     options={STAGES.map(s => ({label: s.id, value: s.id}))}
                     value={newLeadForm.stage || 'New'}
                     onChange={(val) => setNewLeadForm({...newLeadForm, stage: val as Stage})}
                     className="w-full"
                  />
               </div>
            </div>
            <div>
               <label className="text-[9px] font-black text-zinc-muted uppercase tracking-widest px-1 mb-1.5 block">Source</label>
               <AmberDropdown 
                  options={['Website', 'Referral', 'LinkedIn', 'Event', 'Partner', 'Direct'].map(s => ({label: s, value: s}))}
                  value={newLeadForm.source || 'Direct'}
                  onChange={(val) => setNewLeadForm({...newLeadForm, source: val})}
                  className="w-full"
               />
            </div>
         </div>
      </AmberSlideOver>
    </div>
  );
};
