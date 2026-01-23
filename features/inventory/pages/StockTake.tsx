
import React, { useState, useMemo } from 'react';
import { AmberCard } from '../../../amber-ui/components/AmberCard';
import { AmberButton } from '../../../amber-ui/components/AmberButton';
import { AmberInput } from '../../../amber-ui/components/AmberInput';
import { AmberDropdown } from '../../../amber-ui/components/AmberDropdown';
import { AmberSlideOver } from '../../../amber-ui/components/AmberSlideOver';
import { 
  ClipboardCheck, 
  Plus, 
  Search, 
  Filter, 
  Download, 
  Check, 
  X, 
  ArrowRight, 
  ChevronRight,
  ChevronLeft,
  Calendar,
  AlertTriangle,
  FileText,
  MapPin,
  Save,
  CheckCircle2,
  MoreVertical
} from 'lucide-react';
import { cn } from '../../../lib/cn';

// --- Types ---
interface StockTakeSession {
  id: string;
  reference: string;
  date: string;
  warehouse: string;
  status: 'Draft' | 'In Progress' | 'Completed' | 'Cancelled';
  createdBy: string;
  totalItems: number;
  variance: number;
}

interface StockTakeItem {
  id: string;
  sku: string;
  name: string;
  expectedQty: number;
  countedQty: number | string; // Allow empty string for input
  status: 'Matched' | 'Discrepancy' | 'Pending';
}

// --- Mock Data ---
const MOCK_SESSIONS: StockTakeSession[] = [
  { id: 'ST-1001', reference: 'Q2-Audit-US-East', date: '2025-05-15', warehouse: 'US-East Distribution Center', status: 'Completed', createdBy: 'Alex Morgan', totalItems: 142, variance: -12 },
  { id: 'ST-1002', reference: 'Monthly-Spot-Check', date: '2025-05-20', warehouse: 'EU Central Hub', status: 'In Progress', createdBy: 'Sarah Jenkins', totalItems: 45, variance: 0 },
  { id: 'ST-1003', reference: 'Annual-Full-Count', date: '2025-05-21', warehouse: 'APAC Regional Node', status: 'Draft', createdBy: 'Kenji Sato', totalItems: 850, variance: 0 },
];

const MOCK_ITEMS: StockTakeItem[] = Array.from({ length: 20 }).map((_, i) => ({
  id: `item_${i}`,
  sku: `SKU-${1000 + i}`,
  name: `Sample Product ${i + 1}`,
  expectedQty: 50 + i * 2,
  countedQty: '',
  status: 'Pending'
}));

export const StockTake = () => {
  // View State
  const [sessions, setSessions] = useState<StockTakeSession[]>(MOCK_SESSIONS);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  
  // Wizard State
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [draftSession, setDraftSession] = useState({
    warehouse: '',
    date: new Date().toISOString().split('T')[0],
    notes: '',
    items: [...MOCK_ITEMS] as StockTakeItem[]
  });

  // --- Filter Logic ---
  const filteredSessions = useMemo(() => {
    return sessions.filter(s => {
      const matchesSearch = s.reference.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            s.warehouse.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'All' || s.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [sessions, searchQuery, statusFilter]);

  // --- Wizard Logic ---
  const handleNextStep = () => {
    if (currentStep === 1 && !draftSession.warehouse) {
      alert("Please select a warehouse");
      return;
    }
    if (currentStep < 4) setCurrentStep(c => c + 1);
  };

  const handlePrevStep = () => {
    if (currentStep > 1) setCurrentStep(c => c - 1);
  };

  const updateCount = (itemId: string, val: string) => {
    const newItems = draftSession.items.map(item => {
      if (item.id === itemId) {
        const counted = val === '' ? '' : parseInt(val);
        const status = counted === '' ? 'Pending' : counted === item.expectedQty ? 'Matched' : 'Discrepancy';
        return { ...item, countedQty: counted, status };
      }
      return item;
    });
    setDraftSession({ ...draftSession, items: newItems as any });
  };

  const calculateDiscrepancies = () => {
    let totalExpected = 0;
    let totalCounted = 0;
    let discrepancies = 0;
    let pending = 0;

    draftSession.items.forEach(i => {
      totalExpected += i.expectedQty;
      if (typeof i.countedQty === 'number') {
        totalCounted += i.countedQty;
        if (i.countedQty !== i.expectedQty) discrepancies++;
      } else {
        pending++;
      }
    });

    return { totalExpected, totalCounted, discrepancies, pending, netVariance: totalCounted - totalExpected };
  };

  const finishSession = () => {
    const { netVariance } = calculateDiscrepancies();
    const newSession: StockTakeSession = {
      id: `ST-${Math.floor(Date.now() / 1000)}`,
      reference: `Audit-${draftSession.date}`,
      date: draftSession.date,
      warehouse: draftSession.warehouse || 'Unknown',
      status: 'Completed',
      createdBy: 'Current User',
      totalItems: draftSession.items.length,
      variance: netVariance
    };
    setSessions([newSession, ...sessions]);
    setIsWizardOpen(false);
    setCurrentStep(1);
    setDraftSession({ warehouse: '', date: '', notes: '', items: [...MOCK_ITEMS] });
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'Completed': return 'text-success bg-success/10 border-success/20';
      case 'In Progress': return 'text-warning bg-warning/10 border-warning/20';
      case 'Draft': return 'text-zinc-muted bg-white/5 border-white/10';
      case 'Cancelled': return 'text-danger bg-danger/10 border-danger/20';
      default: return 'text-zinc-muted';
    }
  };

  return (
    <div className="animate-fade-up space-y-8 min-h-[calc(100vh-100px)] flex flex-col">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
             <ClipboardCheck className="w-5 h-5 text-brand" />
             <h1 className="text-2xl font-black text-zinc-text uppercase italic tracking-tighter">Stock Take</h1>
          </div>
          <p className="text-[10px] font-black text-zinc-muted uppercase tracking-[0.3em] mt-1">Audit and reconcile inventory levels</p>
        </div>
        <AmberButton size="sm" onClick={() => setIsWizardOpen(true)}>
          <Plus className="w-4 h-4 mr-2" /> Start Stock Take
        </AmberButton>
      </div>

      {/* Filter Bar */}
      <AmberCard noPadding className="p-4 flex flex-col lg:flex-row gap-4 items-end bg-obsidian-panel border-white/5 relative z-10">
        <div className="flex-1 w-full">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-muted" />
            <input 
              type="text" 
              placeholder="Search by Reference, Warehouse..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 bg-obsidian-outer border border-white/5 rounded-sm pl-10 pr-4 text-xs font-bold text-zinc-text outline-none focus:border-brand/30 transition-all placeholder:text-zinc-muted/50"
            />
          </div>
        </div>
        
        <AmberDropdown 
          label="Status"
          options={['All', 'Draft', 'In Progress', 'Completed', 'Cancelled'].map(s => ({label: s, value: s}))}
          value={statusFilter}
          onChange={setStatusFilter}
          className="w-full lg:w-48"
        />
        
        <button className="h-10 px-4 bg-obsidian-card border border-white/5 text-zinc-muted hover:text-zinc-text transition-all rounded-sm flex items-center justify-center hover:bg-white/5">
          <Filter className="w-4 h-4" />
        </button>
      </AmberCard>

      {/* Data Table */}
      <AmberCard noPadding className="flex-1 flex flex-col bg-obsidian-panel border-white/5 shadow-xl overflow-hidden">
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left min-w-[1000px]">
            <thead className="bg-obsidian-outer/50 border-b border-white/5 text-[9px] font-black text-zinc-muted uppercase tracking-widest sticky top-0 z-10">
              <tr>
                <th className="px-6 py-4">Reference</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Warehouse</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-center">Items</th>
                <th className="px-6 py-4 text-right">Variance</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.03]">
              {filteredSessions.map((session) => (
                <tr key={session.id} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                       <span className="text-xs font-bold text-zinc-text">{session.reference}</span>
                       <span className="text-[9px] font-mono text-zinc-muted">{session.id}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-[10px] font-bold text-zinc-muted">{session.date}</td>
                  <td className="px-6 py-4 text-[10px] font-bold text-zinc-secondary">
                     <span className="flex items-center gap-1.5"><MapPin className="w-3 h-3" /> {session.warehouse}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-sm border text-[9px] font-black uppercase tracking-widest",
                      getStatusColor(session.status)
                    )}>
                      {session.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center font-mono text-xs">{session.totalItems}</td>
                  <td className={cn(
                    "px-6 py-4 text-right font-bold text-xs",
                    session.variance === 0 ? "text-zinc-muted" : session.variance < 0 ? "text-danger" : "text-success"
                  )}>
                    {session.variance > 0 ? '+' : ''}{session.variance}
                  </td>
                  <td className="px-6 py-4 text-right">
                     <button className="p-2 text-zinc-muted hover:text-zinc-text hover:bg-white/5 rounded-sm transition-colors">
                        <MoreVertical className="w-4 h-4" />
                     </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </AmberCard>

      {/* Stock Take Wizard SlideOver */}
      <AmberSlideOver
        isOpen={isWizardOpen}
        onClose={() => setIsWizardOpen(false)}
        title="Conduct Stock Take"
        description={`Step ${currentStep} of 4: ${currentStep === 1 ? 'Setup' : currentStep === 2 ? 'Scope' : currentStep === 3 ? 'Count' : 'Review'}`}
        footer={
           <div className="flex justify-between w-full">
              {currentStep > 1 ? (
                 <AmberButton variant="ghost" onClick={handlePrevStep}><ChevronLeft className="w-3.5 h-3.5 mr-2" /> Back</AmberButton>
              ) : (
                 <AmberButton variant="ghost" onClick={() => setIsWizardOpen(false)}>Cancel</AmberButton>
              )}
              
              {currentStep < 4 ? (
                 <AmberButton onClick={handleNextStep}>Next <ChevronRight className="w-3.5 h-3.5 ml-2" /></AmberButton>
              ) : (
                 <AmberButton onClick={finishSession} className="bg-success text-white hover:bg-success/90 border-transparent">Finalize Audit <CheckCircle2 className="w-3.5 h-3.5 ml-2" /></AmberButton>
              )}
           </div>
        }
      >
         <div className="space-y-6">
            {/* Step Indicators */}
            <div className="flex gap-2 mb-6">
               {[1, 2, 3, 4].map(s => (
                  <div key={s} className={cn(
                     "h-1 flex-1 rounded-full transition-all",
                     s <= currentStep ? "bg-brand" : "bg-white/10"
                  )} />
               ))}
            </div>

            {/* Step 1: Setup */}
            {currentStep === 1 && (
               <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                  <AmberDropdown 
                     label="Select Warehouse"
                     options={[{label: 'US-East Distribution Center', value: 'US-East'}, {label: 'EU Central Hub', value: 'EU-Central'}]}
                     value={draftSession.warehouse}
                     onChange={(val) => setDraftSession({...draftSession, warehouse: val})}
                     className="w-full"
                  />
                  <AmberInput 
                     label="Audit Date"
                     type="date"
                     value={draftSession.date}
                     onChange={(e) => setDraftSession({...draftSession, date: e.target.value})}
                  />
                  <AmberInput 
                     label="Internal Notes"
                     multiline
                     rows={3}
                     placeholder="Reason for audit, assigned team, etc..."
                     value={draftSession.notes}
                     onChange={(e) => setDraftSession({...draftSession, notes: e.target.value})}
                  />
               </div>
            )}

            {/* Step 2: Scope */}
            {currentStep === 2 && (
               <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                  <div className="p-4 bg-obsidian-outer/50 border border-white/5 rounded-sm">
                     <h3 className="text-sm font-bold text-zinc-text mb-2">Scope Selection</h3>
                     <p className="text-xs text-zinc-muted mb-4">Choose which products to include in this count session.</p>
                     
                     <div className="space-y-2">
                        <label className="flex items-center gap-3 p-3 border border-brand/30 bg-brand/5 rounded-sm cursor-pointer">
                           <input type="radio" name="scope" defaultChecked className="accent-brand" />
                           <div>
                              <span className="text-xs font-bold text-brand block uppercase tracking-wide">All Inventory</span>
                              <span className="text-[10px] text-zinc-muted">Include all products currently tracked in this warehouse.</span>
                           </div>
                        </label>
                        <label className="flex items-center gap-3 p-3 border border-white/10 bg-white/[0.02] rounded-sm cursor-pointer hover:bg-white/5">
                           <input type="radio" name="scope" className="accent-brand" />
                           <div>
                              <span className="text-xs font-bold text-zinc-text block uppercase tracking-wide">By Category</span>
                              <span className="text-[10px] text-zinc-muted">Select specific product categories to audit.</span>
                           </div>
                        </label>
                     </div>
                  </div>
                  
                  <div className="flex items-center gap-2 text-[10px] text-zinc-muted italic">
                     <InfoIcon className="w-3 h-3" />
                     <span>{draftSession.items.length} items will be added to the count sheet.</span>
                  </div>
               </div>
            )}

            {/* Step 3: Counting */}
            {currentStep === 3 && (
               <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
                  <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-zinc-muted px-2">
                     <span>Product</span>
                     <span>Counted / Expected</span>
                  </div>
                  <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                     {draftSession.items.map(item => (
                        <div key={item.id} className="flex items-center justify-between p-3 bg-obsidian-outer border border-white/5 rounded-sm">
                           <div className="flex-1">
                              <p className="text-xs font-bold text-zinc-text">{item.name}</p>
                              <p className="text-[9px] font-mono text-zinc-muted">{item.sku}</p>
                           </div>
                           <div className="flex items-center gap-3">
                              <input 
                                 type="number" 
                                 value={item.countedQty}
                                 onChange={(e) => updateCount(item.id, e.target.value)}
                                 placeholder="-"
                                 className={cn(
                                    "w-20 h-8 bg-black/20 border rounded-sm px-2 text-right font-mono text-sm outline-none focus:border-brand/50 transition-colors",
                                    item.status === 'Matched' ? "border-success/30 text-success" :
                                    item.status === 'Discrepancy' ? "border-danger/30 text-danger" :
                                    "border-white/10 text-zinc-text"
                                 )}
                              />
                              <span className="text-xs text-zinc-muted w-8 text-right">/ {item.expectedQty}</span>
                           </div>
                        </div>
                     ))}
                  </div>
               </div>
            )}

            {/* Step 4: Review */}
            {currentStep === 4 && (
               <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                  {(() => {
                     const stats = calculateDiscrepancies();
                     return (
                        <>
                           <div className="grid grid-cols-2 gap-4">
                              <div className="p-4 bg-obsidian-outer border border-white/5 rounded-sm text-center">
                                 <p className="text-[9px] font-black text-zinc-muted uppercase tracking-widest mb-1">Total Counted</p>
                                 <p className="text-2xl font-black text-zinc-text">{stats.totalCounted}</p>
                              </div>
                              <div className="p-4 bg-obsidian-outer border border-white/5 rounded-sm text-center">
                                 <p className="text-[9px] font-black text-zinc-muted uppercase tracking-widest mb-1">Net Variance</p>
                                 <p className={cn("text-2xl font-black", stats.netVariance === 0 ? "text-zinc-muted" : stats.netVariance < 0 ? "text-danger" : "text-success")}>
                                    {stats.netVariance > 0 ? '+' : ''}{stats.netVariance}
                                 </p>
                              </div>
                           </div>

                           {stats.discrepancies > 0 ? (
                              <div className="p-4 bg-warning/5 border border-warning/20 rounded-sm">
                                 <h4 className="text-xs font-black text-warning uppercase tracking-widest flex items-center gap-2 mb-3">
                                    <AlertTriangle className="w-4 h-4" /> Discrepancies Found ({stats.discrepancies})
                                 </h4>
                                 <div className="space-y-2 max-h-[200px] overflow-y-auto">
                                    {draftSession.items.filter(i => i.status === 'Discrepancy' && typeof i.countedQty === 'number').map(i => (
                                       <div key={i.id} className="flex justify-between text-[10px] border-b border-warning/10 pb-1 last:border-0">
                                          <span className="font-bold text-zinc-text">{i.sku}</span>
                                          <span className="font-mono text-danger">{Number(i.countedQty) - i.expectedQty}</span>
                                       </div>
                                    ))}
                                 </div>
                              </div>
                           ) : (
                              <div className="p-6 bg-success/5 border border-success/20 rounded-sm text-center">
                                 <CheckCircle2 className="w-8 h-8 text-success mx-auto mb-2" />
                                 <p className="text-xs font-bold text-success uppercase tracking-widest">Perfect Match</p>
                                 <p className="text-[10px] text-zinc-muted mt-1">All counted items match expected system levels.</p>
                              </div>
                           )}

                           {stats.pending > 0 && (
                              <p className="text-[10px] text-zinc-muted italic text-center">
                                 Note: {stats.pending} items have not been counted and will be marked as missing if finalized.
                              </p>
                           )}
                        </>
                     );
                  })()}
               </div>
            )}
         </div>
      </AmberSlideOver>
    </div>
  );
};

// Helper Icon
const InfoIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
);
