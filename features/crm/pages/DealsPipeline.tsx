
import React, { useState, useMemo } from 'react';
import { AmberCard } from '../../../amber-ui/components/AmberCard';
import { AmberButton } from '../../../amber-ui/components/AmberButton';
import { AmberSlideOver } from '../../../amber-ui/components/AmberSlideOver';
import { AmberInput } from '../../../amber-ui/components/AmberInput';
import { AmberDropdown } from '../../../amber-ui/components/AmberDropdown';
import { 
  Target, 
  Plus, 
  Search, 
  Filter, 
  Calendar, 
  User, 
  Trash2, 
  Building2,
  AlertCircle,
  TrendingUp,
  DollarSign
} from 'lucide-react';
import { cn } from '../../../lib/cn';

// --- Types ---
type DealStage = 'Prospect' | 'Qualified' | 'Proposal' | 'Negotiation' | 'Won' | 'Lost';

interface Deal {
  id: string;
  name: string;
  customer: string;
  amount: number;
  stage: DealStage;
  probability: number; // 0-100
  closeDate: string;
  owner: string;
  createdAt: string;
}

// --- Constants ---
const STAGES: { id: DealStage; label: string; prob: number; color: string }[] = [
  { id: 'Prospect', label: 'Prospect', prob: 10, color: 'bg-zinc-500' },
  { id: 'Qualified', label: 'Qualified', prob: 30, color: 'bg-info' },
  { id: 'Proposal', label: 'Proposal', prob: 60, color: 'bg-purple-500' },
  { id: 'Negotiation', label: 'Negotiation', prob: 80, color: 'bg-warning' },
  { id: 'Won', label: 'Closed Won', prob: 100, color: 'bg-success' },
  { id: 'Lost', label: 'Closed Lost', prob: 0, color: 'bg-danger' },
];

const MOCK_DEALS: Deal[] = [
  { id: 'D-101', name: 'Q4 Software Expansion', customer: 'Acme Corp', amount: 45000, stage: 'Negotiation', probability: 80, closeDate: '2025-06-15', owner: 'Alex Morgan', createdAt: '2025-05-01' },
  { id: 'D-102', name: 'Hardware Refresh', customer: 'Globex Inc', amount: 12000, stage: 'Proposal', probability: 60, closeDate: '2025-06-20', owner: 'Sarah Chen', createdAt: '2025-05-05' },
  { id: 'D-103', name: 'Enterprise License', customer: 'Soylent Corp', amount: 150000, stage: 'Qualified', probability: 30, closeDate: '2025-07-01', owner: 'James Wilson', createdAt: '2025-05-10' },
  { id: 'D-104', name: 'Consulting Retainer', customer: 'Initech', amount: 8500, stage: 'Prospect', probability: 10, closeDate: '2025-06-30', owner: 'Alex Morgan', createdAt: '2025-05-12' },
  { id: 'D-105', name: 'Q3 Upgrade', customer: 'Stark Ind', amount: 75000, stage: 'Won', probability: 100, closeDate: '2025-05-15', owner: 'Sarah Chen', createdAt: '2025-04-20' },
  { id: 'D-106', name: 'Beta Pilot', customer: 'Cyberdyne', amount: 5000, stage: 'Lost', probability: 0, closeDate: '2025-05-01', owner: 'James Wilson', createdAt: '2025-04-10' },
];

export const DealsPipeline = () => {
  // State
  const [deals, setDeals] = useState<Deal[]>(MOCK_DEALS);
  const [draggedDealId, setDraggedDealId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [ownerFilter, setOwnerFilter] = useState('All');

  // Modal State
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
  
  // Form State
  const [form, setForm] = useState<Partial<Deal>>({
    stage: 'Prospect',
    probability: 10,
    closeDate: new Date().toISOString().split('T')[0]
  });

  // --- Handlers ---

  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedDealId(id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, stage: DealStage) => {
    e.preventDefault();
    if (!draggedDealId) return;

    // Find default probability for new stage
    const defaultProb = STAGES.find(s => s.id === stage)?.prob || 0;

    setDeals(prev => prev.map(d => 
      d.id === draggedDealId 
        ? { ...d, stage, probability: defaultProb } 
        : d
    ));
    setDraggedDealId(null);
  };

  const handleSaveDeal = () => {
    if (!form.name || !form.customer || !form.amount) return;

    if (selectedDeal && isDetailOpen) {
        // Update existing
        setDeals(prev => prev.map(d => d.id === selectedDeal.id ? { ...d, ...form } as Deal : d));
        setIsDetailOpen(false);
    } else {
        // Create new
        const newDeal: Deal = {
            id: `D-${Math.floor(Date.now() / 1000)}`,
            name: form.name,
            customer: form.customer,
            amount: Number(form.amount),
            stage: (form.stage as DealStage) || 'Prospect',
            probability: Number(form.probability),
            closeDate: form.closeDate || '',
            owner: 'Current User',
            createdAt: new Date().toISOString().split('T')[0]
        };
        setDeals([...deals, newDeal]);
        setIsCreateOpen(false);
    }
    setForm({ stage: 'Prospect', probability: 10, closeDate: new Date().toISOString().split('T')[0] });
    setSelectedDeal(null);
  };

  const deleteDeal = (id: string) => {
    if (confirm('Are you sure you want to delete this deal?')) {
        setDeals(prev => prev.filter(d => d.id !== id));
        setIsDetailOpen(false);
    }
  };

  const openDetail = (deal: Deal) => {
    setSelectedDeal(deal);
    setForm({ ...deal });
    setIsDetailOpen(true);
  };

  // --- Calculations ---

  const filteredDeals = useMemo(() => {
    return deals.filter(d => {
      const matchSearch = d.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          d.customer.toLowerCase().includes(searchQuery.toLowerCase());
      const matchOwner = ownerFilter === 'All' || d.owner === ownerFilter;
      return matchSearch && matchOwner;
    });
  }, [deals, searchQuery, ownerFilter]);

  const dealsByStage = useMemo(() => {
    const groups: Record<string, Deal[]> = {};
    STAGES.forEach(s => groups[s.id] = []);
    filteredDeals.forEach(d => {
        if (groups[d.stage]) groups[d.stage].push(d);
    });
    return groups;
  }, [filteredDeals]);

  const getStageTotals = (stageDeals: Deal[]) => {
    const total = stageDeals.reduce((acc, d) => acc + d.amount, 0);
    const weighted = stageDeals.reduce((acc, d) => acc + (d.amount * (d.probability / 100)), 0);
    return { total, weighted };
  };

  const getProbColor = (prob: number) => {
      if (prob >= 70) return 'text-success bg-success/10 border-success/20';
      if (prob >= 30) return 'text-warning bg-warning/10 border-warning/20';
      return 'text-danger bg-danger/10 border-danger/20';
  };

  return (
    <div className="h-[calc(100vh-100px)] flex flex-col space-y-6 animate-fade-up">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 shrink-0">
        <div>
          <div className="flex items-center gap-2 mb-1">
             <Target className="w-5 h-5 text-brand" />
             <h1 className="text-2xl font-black text-zinc-text uppercase italic tracking-tighter">Deals Pipeline</h1>
          </div>
          <p className="text-[10px] font-black text-zinc-muted uppercase tracking-[0.3em] mt-1">Manage opportunities and revenue forecast</p>
        </div>
        <div className="flex gap-2">
          <AmberButton size="sm" onClick={() => { setSelectedDeal(null); setForm({ stage: 'Prospect', probability: 10 }); setIsCreateOpen(true); }}>
            <Plus className="w-3.5 h-3.5 mr-2" /> Add Deal
          </AmberButton>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-obsidian-panel border border-white/5 rounded-sm p-4 flex flex-col sm:flex-row gap-4 items-center shrink-0">
         <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-muted" />
            <input 
              type="text" 
              placeholder="Search deals..."
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
               const stageDeals = dealsByStage[stage.id];
               const { total, weighted } = getStageTotals(stageDeals);
               
               return (
                  <div 
                    key={stage.id}
                    className="w-80 flex flex-col h-full bg-obsidian-panel/30 border border-white/5 rounded-lg overflow-hidden shrink-0"
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, stage.id)}
                  >
                     {/* Column Header */}
                     <div className="p-3 border-b border-white/5 bg-obsidian-panel shrink-0">
                        <div className="flex justify-between items-center mb-1">
                           <div className="flex items-center gap-2">
                              <div className={cn("w-2 h-2 rounded-full", stage.color)} />
                              <h3 className="text-xs font-black text-zinc-text uppercase tracking-widest">{stage.label}</h3>
                           </div>
                           <span className="text-[9px] font-bold text-zinc-muted bg-white/5 px-1.5 rounded">{stageDeals.length}</span>
                        </div>
                        <div className="flex flex-col gap-0.5">
                           <div className="flex justify-between items-center text-[10px]">
                               <span className="font-bold text-zinc-text">${total.toLocaleString()}</span>
                               <span className="text-zinc-muted uppercase text-[9px]">Total</span>
                           </div>
                           <div className="flex justify-between items-center text-[9px]">
                               <span className="font-bold text-zinc-muted">${Math.round(weighted).toLocaleString()}</span>
                               <span className="text-zinc-muted/60 uppercase text-[8px]">Weighted</span>
                           </div>
                        </div>
                     </div>

                     {/* Column Body */}
                     <div className="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar bg-obsidian-outer/20">
                        {stageDeals.map(deal => (
                           <div
                              key={deal.id}
                              draggable
                              onDragStart={(e) => handleDragStart(e, deal.id)}
                              onClick={() => openDetail(deal)}
                              className={cn(
                                 "p-3 bg-obsidian-card border border-white/5 rounded-sm hover:border-brand/30 cursor-pointer transition-all shadow-sm group active:cursor-grabbing flex flex-col gap-2",
                                 draggedDealId === deal.id ? "opacity-50 border-dashed border-white/20" : ""
                              )}
                           >
                              <div>
                                 <h4 className="text-xs font-bold text-zinc-text group-hover:text-brand transition-colors truncate">{deal.name}</h4>
                                 <p className="text-[10px] text-zinc-muted truncate flex items-center gap-1 mt-0.5">
                                    <Building2 className="w-3 h-3" /> {deal.customer}
                                 </p>
                              </div>
                              
                              <div className="flex items-center justify-between py-2 border-t border-b border-white/[0.03]">
                                  <span className="text-sm font-black text-zinc-text">${deal.amount.toLocaleString()}</span>
                                  <div className="flex items-center gap-1 text-[9px] text-zinc-muted">
                                      <Calendar className="w-3 h-3" />
                                      {new Date(deal.closeDate).toLocaleDateString(undefined, {month:'short', day:'numeric'})}
                                  </div>
                              </div>
                              
                              <div className="flex items-center justify-between">
                                 <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-[9px] font-bold text-zinc-text border border-white/5">
                                    {deal.owner.charAt(0)}
                                 </div>
                                 <span className={cn("text-[9px] font-black px-1.5 py-0.5 rounded border uppercase tracking-tight", getProbColor(deal.probability))}>
                                     {deal.probability}% Prob
                                 </span>
                              </div>
                           </div>
                        ))}
                        {stageDeals.length === 0 && (
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

      {/* SlideOver (Add / Edit) */}
      <AmberSlideOver
         isOpen={isCreateOpen || isDetailOpen}
         onClose={() => { setIsCreateOpen(false); setIsDetailOpen(false); setSelectedDeal(null); }}
         title={selectedDeal ? "Deal Details" : "New Deal"}
         description={selectedDeal ? "Manage deal information and stage." : "Create a new sales opportunity."}
         footer={
            <div className="flex justify-between w-full">
                {selectedDeal ? (
                    <AmberButton variant="ghost" onClick={() => deleteDeal(selectedDeal.id)} className="text-danger hover:bg-danger/10">
                        <Trash2 className="w-3.5 h-3.5 mr-2" /> Delete
                    </AmberButton>
                ) : (
                    <AmberButton variant="ghost" onClick={() => setIsCreateOpen(false)}>Cancel</AmberButton>
                )}
                <AmberButton onClick={handleSaveDeal}>
                    {selectedDeal ? 'Update Deal' : 'Create Deal'}
                </AmberButton>
            </div>
         }
      >
         <div className="space-y-6">
            <AmberInput 
               label="Deal Name" 
               placeholder="e.g. Q4 Expansion"
               value={form.name} 
               onChange={(e) => setForm({...form, name: e.target.value})}
            />
            <AmberInput 
               label="Customer" 
               placeholder="Company Name"
               value={form.customer} 
               onChange={(e) => setForm({...form, customer: e.target.value})}
            />
            
            <div className="grid grid-cols-2 gap-4">
                <AmberInput 
                   label="Amount ($)" 
                   type="number"
                   value={form.amount} 
                   onChange={(e) => setForm({...form, amount: parseFloat(e.target.value)})}
                />
                <AmberInput 
                   label="Expected Close Date" 
                   type="date"
                   value={form.closeDate} 
                   onChange={(e) => setForm({...form, closeDate: e.target.value})}
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div>
                  <label className="text-[9px] font-black text-zinc-muted uppercase tracking-widest px-1 mb-1.5 block">Stage</label>
                  <AmberDropdown 
                     options={STAGES.map(s => ({label: s.label, value: s.id}))}
                     value={form.stage || 'Prospect'}
                     onChange={(val) => {
                         const prob = STAGES.find(s => s.id === val)?.prob || 0;
                         setForm({...form, stage: val as DealStage, probability: prob});
                     }}
                     className="w-full"
                  />
               </div>
               <AmberInput 
                   label="Probability (%)" 
                   type="number"
                   min={0} max={100}
                   value={form.probability} 
                   onChange={(e) => setForm({...form, probability: parseInt(e.target.value)})}
                />
            </div>

            {selectedDeal && (
                <div className="pt-4 border-t border-white/5">
                    <h4 className="text-[10px] font-black text-zinc-text uppercase tracking-widest mb-4 flex items-center gap-2">
                        <TrendingUp className="w-3 h-3" /> Insights
                    </h4>
                    <div className="p-4 bg-obsidian-outer border border-white/5 rounded-sm space-y-2">
                        <div className="flex justify-between text-xs">
                            <span className="text-zinc-muted">Created</span>
                            <span className="text-zinc-text">{selectedDeal.createdAt}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                            <span className="text-zinc-muted">Days in Stage</span>
                            <span className="text-zinc-text">12 Days</span>
                        </div>
                        <div className="flex justify-between text-xs">
                            <span className="text-zinc-muted">Weighted Value</span>
                            <span className="text-brand font-bold">${Math.round((form.amount || 0) * ((form.probability || 0) / 100)).toLocaleString()}</span>
                        </div>
                    </div>
                </div>
            )}
         </div>
      </AmberSlideOver>
    </div>
  );
};
