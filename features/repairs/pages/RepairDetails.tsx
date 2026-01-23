
import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AmberCard } from '../../../amber-ui/components/AmberCard';
import { AmberButton } from '../../../amber-ui/components/AmberButton';
import { 
  ArrowLeft, 
  Printer, 
  MoreVertical, 
  User, 
  Smartphone, 
  Wrench, 
  DollarSign, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  FileText, 
  Calendar, 
  Image as ImageIcon,
  Plus,
  Trash2,
  Save,
  Send,
  Download,
  AlertCircle
} from 'lucide-react';
import { cn } from '../../../lib/cn';
import { paths } from '../../../routes/paths';

// --- Types ---
interface Part {
  id: string;
  name: string;
  sku: string;
  quantity: number;
  unitPrice: number;
}

interface TimelineEvent {
  id: string;
  type: 'status' | 'note' | 'part' | 'system';
  title: string;
  description: string;
  date: string;
  user: string;
}

// --- Mock Data ---
const MOCK_REPAIR = {
  id: 'REP-1024',
  status: 'In Progress',
  priority: 'High',
  createdDate: 'May 18, 2025',
  technician: { name: 'Alex Morgan', avatar: 'AM' },
  customer: {
    name: 'Sarah Chen',
    email: 'sarah.chen@example.com',
    phone: '+1 (555) 012-3456',
    address: '123 Tech Blvd, San Francisco, CA'
  },
  device: {
    type: 'Laptop',
    brand: 'Apple',
    model: 'MacBook Pro 16" (2023)',
    serial: 'C02XYZ1234',
    passcode: '1234',
    accessories: ['Charger', 'Sleeve']
  },
  issue: {
    title: 'Liquid Damage - No Power',
    description: 'Customer spilled coffee on the keyboard. Device shut down immediately and does not turn on. MagSafe light blinks orange.',
    troubleshooting: ['SMC Reset (No Response)', 'Battery Disconnect (No Response)']
  },
  parts: [
    { id: 'p1', name: 'Logic Board (M2 Pro)', sku: 'APL-LB-M2P', quantity: 1, unitPrice: 650.00 },
    { id: 'p2', name: 'Top Case w/ Keyboard', sku: 'APL-TC-16', quantity: 1, unitPrice: 220.00 }
  ],
  labor: {
    hours: 2.5,
    rate: 90.00
  },
  timeline: [
    { id: 'e1', type: 'system', title: 'Ticket Created', description: 'Repair ticket opened via portal.', date: 'May 18, 10:00 AM', user: 'System' },
    { id: 'e2', type: 'status', title: 'Status Updated', description: 'Changed from Open to In Progress', date: 'May 18, 10:15 AM', user: 'Alex Morgan' },
    { id: 'e3', type: 'note', title: 'Initial Inspection', description: 'Confirmed liquid corrosion near charging IC. Logic board replacement required.', date: 'May 18, 11:30 AM', user: 'Alex Morgan' }
  ]
};

export const RepairDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState<'overview' | 'parts' | 'timeline' | 'media' | 'notes'>('overview');
  
  // State for interactive elements
  const [parts, setParts] = useState<Part[]>(MOCK_REPAIR.parts);
  const [laborHours, setLaborHours] = useState(MOCK_REPAIR.labor.hours);
  const [noteInput, setNoteInput] = useState('');
  const [status, setStatus] = useState(MOCK_REPAIR.status);
  const [timeline, setTimeline] = useState<TimelineEvent[]>(MOCK_REPAIR.timeline as any);

  // Calculations
  const partsTotal = parts.reduce((sum, p) => sum + (p.quantity * p.unitPrice), 0);
  const laborTotal = laborHours * MOCK_REPAIR.labor.rate;
  const grandTotal = partsTotal + laborTotal;

  // Handlers
  const handleAddNote = () => {
    if (!noteInput.trim()) return;
    const newNote: TimelineEvent = {
        id: `e_${Date.now()}`,
        type: 'note',
        title: 'Note Added',
        description: noteInput,
        date: 'Just now',
        user: 'You'
    };
    setTimeline([newNote, ...timeline]);
    setNoteInput('');
  };

  const handleAddPart = () => {
    // Mock adding a generic part
    const newPart: Part = {
        id: `p_${Date.now()}`,
        name: 'Generic Component',
        sku: 'GEN-001',
        quantity: 1,
        unitPrice: 0.00
    };
    setParts([...parts, newPart]);
  };

  const updatePart = (id: string, field: keyof Part, value: any) => {
    setParts(parts.map(p => p.id === id ? { ...p, [field]: value } : p));
  };

  const removePart = (id: string) => {
      setParts(parts.filter(p => p.id !== id));
  };

  const handleStatusChange = () => {
      const newStatus = status === 'In Progress' ? 'Completed' : 'In Progress';
      setStatus(newStatus);
      setTimeline([{
          id: `e_${Date.now()}`,
          type: 'status',
          title: 'Status Updated',
          description: `Changed to ${newStatus}`,
          date: 'Just now',
          user: 'You'
      }, ...timeline]);
  };

  const getStatusColor = (s: string) => {
      switch(s) {
          case 'Completed': return 'bg-success/10 text-success border-success/20';
          case 'In Progress': return 'bg-info/10 text-info border-info/20';
          case 'Pending': return 'bg-warning/10 text-warning border-warning/20';
          default: return 'bg-zinc-muted/10 text-zinc-muted border-white/10';
      }
  };

  return (
    <div className="animate-fade-up max-w-[1600px] mx-auto py-6 space-y-8 min-h-[calc(100vh-100px)] flex flex-col">
      
      {/* 1. Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-white/5 pb-6">
         <div className="flex items-start gap-4">
            <button onClick={() => navigate(paths.repairDashboard)} className="p-2 bg-white/5 rounded-sm hover:bg-white/10 text-zinc-muted transition-colors mt-1">
               <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
               <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl font-black text-zinc-text uppercase italic tracking-tighter leading-none">{MOCK_REPAIR.id}</h1>
                  <span className={cn("text-[9px] font-black px-2 py-0.5 rounded-sm border uppercase tracking-widest", getStatusColor(status))}>
                     {status}
                  </span>
               </div>
               <div className="flex items-center gap-4 text-[10px] font-bold text-zinc-muted uppercase tracking-widest">
                  <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {MOCK_REPAIR.createdDate}</span>
                  <span className={cn("flex items-center gap-1", MOCK_REPAIR.priority === 'High' ? "text-danger" : "text-zinc-muted")}>
                     <AlertCircle className="w-3 h-3" /> {MOCK_REPAIR.priority} Priority
                  </span>
               </div>
            </div>
         </div>

         <div className="flex items-center gap-2">
            <AmberButton variant="secondary" size="sm" onClick={() => window.print()}>
               <Printer className="w-3.5 h-3.5 mr-2" /> Print Ticket
            </AmberButton>
            <AmberButton size="sm" onClick={handleStatusChange} className={status === 'Completed' ? "bg-zinc-muted cursor-not-allowed" : "bg-success hover:bg-success/90 text-white border-transparent"}>
               {status === 'Completed' ? 'Reopen Job' : 'Complete Repair'}
            </AmberButton>
            <div className="w-px h-8 bg-white/10 mx-2" />
            <button className="p-2.5 text-zinc-muted hover:text-zinc-text bg-white/5 hover:bg-white/10 rounded-sm transition-all border border-white/5">
               <MoreVertical className="w-4 h-4" />
            </button>
         </div>
      </div>

      {/* 2. Tab Navigation */}
      <div className="border-b border-white/5">
         <div className="flex gap-8 overflow-x-auto scrollbar-hide">
            {[
                { id: 'overview', label: 'Overview', icon: FileText },
                { id: 'parts', label: 'Parts & Labor', icon: Wrench },
                { id: 'timeline', label: 'Timeline', icon: Clock },
                { id: 'media', label: 'Photos', icon: ImageIcon },
                { id: 'notes', label: 'Notes', icon: FileText }
            ].map(tab => (
               <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={cn(
                     "flex items-center gap-2 pb-4 text-[10px] font-black uppercase tracking-[0.2em] transition-all relative whitespace-nowrap",
                     activeTab === tab.id ? "text-brand" : "text-zinc-muted hover:text-zinc-text"
                  )}
               >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                  {activeTab === tab.id && (
                     <div className="absolute bottom-0 left-0 w-full h-0.5 bg-brand animate-in fade-in zoom-in duration-300" />
                  )}
               </button>
            ))}
         </div>
      </div>

      {/* 3. Content Area */}
      <div className="flex-1 min-h-[500px]">
         
         {/* OVERVIEW TAB */}
         {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-right-4">
               {/* Left Column */}
               <div className="lg:col-span-2 space-y-6">
                  {/* Issue Card */}
                  <AmberCard className="p-6 border-l-2 border-l-brand">
                     <h3 className="text-xs font-black text-zinc-text uppercase tracking-widest mb-2 flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-brand" /> Reported Issue
                     </h3>
                     <h2 className="text-lg font-bold text-zinc-text mb-2">{MOCK_REPAIR.issue.title}</h2>
                     <p className="text-sm text-zinc-secondary leading-relaxed">{MOCK_REPAIR.issue.description}</p>
                     
                     <div className="mt-4 pt-4 border-t border-white/5">
                        <p className="text-[10px] font-bold text-zinc-muted uppercase tracking-widest mb-2">Troubleshooting Steps</p>
                        <div className="flex flex-wrap gap-2">
                           {MOCK_REPAIR.issue.troubleshooting.map((step, i) => (
                              <span key={i} className="px-2 py-1 bg-white/5 rounded-sm text-[10px] text-zinc-text border border-white/10">{step}</span>
                           ))}
                        </div>
                     </div>
                  </AmberCard>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     {/* Customer Card */}
                     <AmberCard className="p-6">
                        <h3 className="text-xs font-black text-zinc-text uppercase tracking-widest mb-4 flex items-center gap-2">
                           <User className="w-4 h-4 text-zinc-muted" /> Customer
                        </h3>
                        <div className="space-y-3 text-sm">
                           <p className="font-bold text-zinc-text">{MOCK_REPAIR.customer.name}</p>
                           <p className="text-zinc-muted">{MOCK_REPAIR.customer.email}</p>
                           <p className="text-zinc-muted">{MOCK_REPAIR.customer.phone}</p>
                           <p className="text-zinc-secondary text-xs mt-2">{MOCK_REPAIR.customer.address}</p>
                        </div>
                     </AmberCard>

                     {/* Device Card */}
                     <AmberCard className="p-6">
                        <h3 className="text-xs font-black text-zinc-text uppercase tracking-widest mb-4 flex items-center gap-2">
                           <Smartphone className="w-4 h-4 text-zinc-muted" /> Device
                        </h3>
                        <div className="space-y-3 text-sm">
                           <p className="font-bold text-zinc-text">{MOCK_REPAIR.device.brand} {MOCK_REPAIR.device.model}</p>
                           <div className="flex justify-between border-b border-white/5 pb-1">
                              <span className="text-[10px] text-zinc-muted uppercase">Serial</span>
                              <span className="font-mono text-xs">{MOCK_REPAIR.device.serial}</span>
                           </div>
                           <div className="flex justify-between border-b border-white/5 pb-1">
                              <span className="text-[10px] text-zinc-muted uppercase">Passcode</span>
                              <span className="font-mono text-xs text-brand">{MOCK_REPAIR.device.passcode}</span>
                           </div>
                           <div className="text-[10px] text-zinc-muted mt-2">
                              Accs: {MOCK_REPAIR.device.accessories.join(', ')}
                           </div>
                        </div>
                     </AmberCard>
                  </div>
               </div>

               {/* Right Column: Financials */}
               <div className="space-y-6">
                  <AmberCard className="p-6 bg-obsidian-panel/60 border-brand/20" glass>
                     <h3 className="text-xs font-black text-zinc-text uppercase tracking-widest mb-6 flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-success" /> Estimate
                     </h3>
                     <div className="space-y-3 text-xs">
                        <div className="flex justify-between text-zinc-secondary">
                           <span>Parts Subtotal</span>
                           <span>${partsTotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-zinc-secondary">
                           <span>Labor ({laborHours}h @ ${MOCK_REPAIR.labor.rate}/h)</span>
                           <span>${laborTotal.toFixed(2)}</span>
                        </div>
                        <div className="h-px bg-white/10 my-2" />
                        <div className="flex justify-between text-lg font-black text-zinc-text uppercase tracking-wide">
                           <span>Total</span>
                           <span>${grandTotal.toFixed(2)}</span>
                        </div>
                     </div>
                     <div className="mt-6 pt-4 border-t border-white/5">
                        <div className="flex items-center gap-3">
                           <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-bold text-zinc-text">
                              {MOCK_REPAIR.technician.avatar}
                           </div>
                           <div>
                              <p className="text-[9px] font-black text-zinc-muted uppercase tracking-widest">Assigned Tech</p>
                              <p className="text-xs font-bold text-zinc-text">{MOCK_REPAIR.technician.name}</p>
                           </div>
                        </div>
                     </div>
                  </AmberCard>
                  
                  <AmberCard className="p-0 overflow-hidden bg-obsidian-outer/30">
                     <div className="p-4 border-b border-white/5">
                        <h4 className="text-[10px] font-black text-zinc-muted uppercase tracking-widest">Recent Activity</h4>
                     </div>
                     <div className="p-4 space-y-4">
                        {timeline.slice(0, 3).map(e => (
                           <div key={e.id} className="relative pl-4 border-l border-white/10">
                              <div className="absolute -left-[5px] top-1 w-2.5 h-2.5 rounded-full bg-brand" />
                              <p className="text-[10px] font-bold text-zinc-text">{e.title}</p>
                              <p className="text-[9px] text-zinc-muted">{e.date}</p>
                           </div>
                        ))}
                     </div>
                  </AmberCard>
               </div>
            </div>
         )}

         {/* PARTS TAB */}
         {activeTab === 'parts' && (
            <div className="animate-in fade-in slide-in-from-right-4">
               <AmberCard noPadding>
                  <div className="px-6 py-4 border-b border-white/5 flex justify-between items-center bg-obsidian-outer/30">
                     <h3 className="text-xs font-black text-zinc-text uppercase tracking-widest">Parts & Materials</h3>
                     <AmberButton size="sm" onClick={handleAddPart}>
                        <Plus className="w-3.5 h-3.5 mr-2" /> Add Part
                     </AmberButton>
                  </div>
                  <table className="w-full text-left">
                     <thead className="bg-white/[0.02] text-[9px] font-black text-zinc-muted uppercase tracking-widest border-b border-white/5">
                        <tr>
                           <th className="px-6 py-3">Part Name</th>
                           <th className="px-6 py-3">SKU</th>
                           <th className="px-6 py-3 text-center">Qty</th>
                           <th className="px-6 py-3 text-right">Unit Price</th>
                           <th className="px-6 py-3 text-right">Total</th>
                           <th className="px-6 py-3 text-right">Action</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-white/5">
                        {parts.map(part => (
                           <tr key={part.id} className="hover:bg-white/[0.02]">
                              <td className="px-6 py-3">
                                 <input 
                                    className="bg-transparent border-none outline-none text-sm font-bold text-zinc-text w-full placeholder-zinc-muted/50"
                                    value={part.name}
                                    onChange={(e) => updatePart(part.id, 'name', e.target.value)}
                                 />
                              </td>
                              <td className="px-6 py-3 text-xs font-mono text-zinc-muted">{part.sku}</td>
                              <td className="px-6 py-3 text-center">
                                 <input 
                                    type="number"
                                    className="bg-white/5 border border-white/10 rounded-sm w-12 text-center text-xs font-bold text-zinc-text outline-none focus:border-brand/50"
                                    value={part.quantity}
                                    onChange={(e) => updatePart(part.id, 'quantity', parseInt(e.target.value))}
                                 />
                              </td>
                              <td className="px-6 py-3 text-right text-xs text-zinc-secondary">
                                 <input 
                                    type="number"
                                    className="bg-transparent border-none outline-none text-right w-full"
                                    value={part.unitPrice}
                                    onChange={(e) => updatePart(part.id, 'unitPrice', parseFloat(e.target.value))}
                                 />
                              </td>
                              <td className="px-6 py-3 text-right text-xs font-bold text-zinc-text">${(part.quantity * part.unitPrice).toFixed(2)}</td>
                              <td className="px-6 py-3 text-right">
                                 <button onClick={() => removePart(part.id)} className="p-1.5 text-zinc-muted hover:text-danger rounded-sm hover:bg-white/5 transition-colors">
                                    <Trash2 className="w-4 h-4" />
                                 </button>
                              </td>
                           </tr>
                        ))}
                     </tbody>
                  </table>
                  <div className="p-6 bg-obsidian-outer/20 border-t border-white/5">
                     <div className="flex justify-end gap-12 items-center">
                         <div className="flex items-center gap-4">
                            <label className="text-[10px] font-black text-zinc-muted uppercase tracking-widest">Labor Hours</label>
                            <input 
                               type="number" 
                               value={laborHours}
                               onChange={(e) => setLaborHours(parseFloat(e.target.value))}
                               className="w-16 h-8 bg-white/5 border border-white/10 rounded-sm px-2 text-center font-bold text-zinc-text outline-none focus:border-brand/30"
                            />
                         </div>
                         <div className="text-right">
                            <p className="text-[10px] font-black text-zinc-muted uppercase tracking-widest mb-1">Grand Total</p>
                            <p className="text-2xl font-black text-brand">${grandTotal.toFixed(2)}</p>
                         </div>
                     </div>
                  </div>
               </AmberCard>
            </div>
         )}

         {/* TIMELINE TAB */}
         {activeTab === 'timeline' && (
            <AmberCard className="p-8 animate-in fade-in slide-in-from-right-4">
               <h3 className="text-xs font-black text-zinc-text uppercase tracking-widest mb-8 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-zinc-muted" /> Event History
               </h3>
               <div className="space-y-8 relative pl-3 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-px before:bg-white/10">
                  {timeline.map((event) => (
                     <div key={event.id} className="relative pl-10">
                        <div className={cn(
                           "absolute left-0 top-0 w-6 h-6 rounded-full border-2 border-obsidian-panel flex items-center justify-center z-10",
                           event.type === 'status' ? "bg-brand text-obsidian-outer" : 
                           event.type === 'note' ? "bg-info text-white" : 
                           "bg-obsidian-outer text-zinc-muted"
                        )}>
                           <div className="w-1.5 h-1.5 rounded-full bg-current" />
                        </div>
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1">
                           <p className="text-sm font-bold text-zinc-text">{event.title}</p>
                           <span className="text-[10px] font-mono text-zinc-muted uppercase">{event.date}</span>
                        </div>
                        <p className="text-xs text-zinc-secondary mt-1">{event.description}</p>
                        <p className="text-[9px] text-zinc-muted mt-1 italic">By {event.user}</p>
                     </div>
                  ))}
               </div>
            </AmberCard>
         )}

         {/* MEDIA TAB */}
         {activeTab === 'media' && (
             <div className="animate-in fade-in slide-in-from-right-4 space-y-6">
                <div className="grid grid-cols-2 gap-6">
                   <AmberCard className="p-6">
                      <div className="flex items-center justify-between mb-4">
                         <h3 className="text-xs font-black text-zinc-text uppercase tracking-widest">Before Repair</h3>
                         <button className="text-[9px] text-brand hover:underline font-bold uppercase"><Plus className="w-3 h-3 inline mr-1" /> Add Photo</button>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                         <div className="aspect-square bg-obsidian-outer border border-white/5 rounded-sm flex items-center justify-center text-zinc-muted">
                            <ImageIcon className="w-8 h-8" />
                         </div>
                         <div className="aspect-square bg-obsidian-outer border border-white/5 rounded-sm flex items-center justify-center text-zinc-muted opacity-50 border-dashed">
                            <span className="text-[9px] font-bold">Empty</span>
                         </div>
                      </div>
                   </AmberCard>
                   <AmberCard className="p-6">
                      <div className="flex items-center justify-between mb-4">
                         <h3 className="text-xs font-black text-zinc-text uppercase tracking-widest">After Repair</h3>
                         <button className="text-[9px] text-brand hover:underline font-bold uppercase"><Plus className="w-3 h-3 inline mr-1" /> Add Photo</button>
                      </div>
                      <div className="aspect-video bg-obsidian-outer border border-white/5 rounded-sm flex items-center justify-center text-zinc-muted opacity-50 border-dashed">
                         <span className="text-[10px] font-bold uppercase">No photos uploaded yet</span>
                      </div>
                   </AmberCard>
                </div>
             </div>
         )}

         {/* NOTES TAB */}
         {activeTab === 'notes' && (
            <div className="animate-in fade-in slide-in-from-right-4 space-y-4">
               <AmberCard className="p-0 overflow-hidden flex flex-col min-h-[400px]">
                  <div className="flex-1 p-6 space-y-4 bg-obsidian-outer/20 overflow-y-auto">
                     {timeline.filter(e => e.type === 'note').map(note => (
                        <div key={note.id} className="p-4 bg-obsidian-panel border border-white/5 rounded-sm shadow-sm">
                           <div className="flex justify-between items-start mb-2">
                              <span className="text-xs font-bold text-zinc-text">{note.user}</span>
                              <span className="text-[9px] text-zinc-muted">{note.date}</span>
                           </div>
                           <p className="text-sm text-zinc-secondary leading-relaxed">{note.description}</p>
                        </div>
                     ))}
                     {timeline.filter(e => e.type === 'note').length === 0 && (
                        <div className="text-center py-10 text-zinc-muted opacity-50 text-xs italic">No notes yet.</div>
                     )}
                  </div>
                  <div className="p-4 border-t border-white/5 bg-obsidian-panel">
                     <div className="relative">
                        <textarea 
                           className="w-full bg-obsidian-outer border border-white/10 rounded-sm p-4 pr-12 text-sm text-zinc-text outline-none focus:border-brand/30 min-h-[100px] resize-none"
                           placeholder="Type an internal note..."
                           value={noteInput}
                           onChange={(e) => setNoteInput(e.target.value)}
                        />
                        <button 
                           onClick={handleAddNote}
                           disabled={!noteInput.trim()}
                           className="absolute bottom-4 right-4 p-2 bg-brand text-obsidian-outer rounded-sm hover:opacity-90 disabled:opacity-50 transition-all"
                        >
                           <Send className="w-4 h-4 rtl:rotate-180" />
                        </button>
                     </div>
                  </div>
               </AmberCard>
            </div>
         )}
         
      </div>
    </div>
  );
};
