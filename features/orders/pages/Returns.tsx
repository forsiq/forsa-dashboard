
import React, { useState, useMemo } from 'react';
import { AmberCard } from '../../../amber-ui/components/AmberCard';
import { AmberButton } from '../../../amber-ui/components/AmberButton';
import { AmberInput } from '../../../amber-ui/components/AmberInput';
import { AmberDropdown } from '../../../amber-ui/components/AmberDropdown';
import { AmberSlideOver } from '../../../amber-ui/components/AmberSlideOver';
import { 
  RotateCcw, 
  Search, 
  Filter, 
  Download, 
  Plus, 
  MoreVertical, 
  CheckSquare, 
  Square,
  Package, 
  AlertCircle,
  CheckCircle2,
  XCircle,
  DollarSign,
  User,
  Calendar,
  Eye,
  Trash2,
  Receipt,
  ArrowRight,
  X
} from 'lucide-react';
import { cn } from '../../../lib/cn';

// --- Types ---
interface ReturnItem {
  id: string;
  name: string;
  sku: string;
  qty: number;
  price: number;
}

interface ReturnRequest {
  id: string;
  orderId: string;
  customer: {
    name: string;
    email: string;
    avatar: string;
  };
  date: string;
  items: ReturnItem[];
  reason: string;
  condition: string;
  resolution: 'Refund' | 'Exchange' | 'Store Credit';
  status: 'Requested' | 'Approved' | 'Rejected' | 'Refunded';
  refundAmount: number;
}

// --- Mock Data ---
const MOCK_RETURNS: ReturnRequest[] = Array.from({ length: 12 }).map((_, i) => ({
  id: `RET-${5000 + i}`,
  orderId: `ORD-${2025000 + i}`,
  customer: {
    name: ['Alex Morgan', 'Sarah Chen', 'James Wilson', 'Maria Garcia'][i % 4],
    email: `customer${i}@example.com`,
    avatar: ['AM', 'SC', 'JW', 'MG'][i % 4]
  },
  date: new Date(Date.now() - i * 48000000).toISOString().split('T')[0],
  items: [
    { id: `item-${i}`, name: 'Wireless Headphones', sku: 'SKU-8001', qty: 1, price: 129.00 }
  ],
  reason: ['Damaged', 'Wrong Item', 'Size/Fit', 'Changed Mind'][i % 4],
  condition: ['Unopened', 'Opened', 'Damaged'][i % 3],
  resolution: ['Refund', 'Exchange', 'Store Credit'][i % 3] as any,
  status: ['Requested', 'Approved', 'Rejected', 'Refunded'][i % 4] as any,
  refundAmount: 129.00
}));

export const Returns = () => {
  // State
  const [returns, setReturns] = useState<ReturnRequest[]>(MOCK_RETURNS);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  
  // SlideOver State
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedReturn, setSelectedReturn] = useState<ReturnRequest | null>(null);
  
  // Create Form State
  const [createForm, setCreateForm] = useState({
    orderId: '',
    reason: 'Changed Mind',
    condition: 'Unopened',
    resolution: 'Refund',
    notes: ''
  });

  // Derived Data
  const filteredReturns = useMemo(() => {
    return returns.filter(ret => {
      const matchesSearch = 
        ret.id.toLowerCase().includes(searchQuery.toLowerCase()) || 
        ret.orderId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ret.customer.name.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = statusFilter === 'All' || ret.status === statusFilter;
      
      const retDate = new Date(ret.date).getTime();
      const matchesDateStart = dateRange.start ? retDate >= new Date(dateRange.start).getTime() : true;
      const matchesDateEnd = dateRange.end ? retDate <= new Date(dateRange.end).getTime() : true;

      return matchesSearch && matchesStatus && matchesDateStart && matchesDateEnd;
    });
  }, [returns, searchQuery, statusFilter, dateRange]);

  // Handlers
  const toggleSelect = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedIds(newSet);
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredReturns.length) setSelectedIds(new Set());
    else setSelectedIds(new Set(filteredReturns.map(r => r.id)));
  };

  const handleCreate = () => {
    // Mock Create Logic
    const newReturn: ReturnRequest = {
        id: `RET-${Math.floor(Math.random() * 10000)}`,
        orderId: createForm.orderId || 'ORD-UNKNOWN',
        customer: { name: 'Guest User', email: 'guest@example.com', avatar: 'GU' },
        date: new Date().toISOString().split('T')[0],
        items: [{ id: 'new-item', name: 'Sample Product', sku: 'SKU-SAMPLE', qty: 1, price: 50.00 }],
        reason: createForm.reason,
        condition: createForm.condition,
        resolution: createForm.resolution as any,
        status: 'Requested',
        refundAmount: 50.00
    };
    setReturns([newReturn, ...returns]);
    setIsCreateOpen(false);
    setCreateForm({ orderId: '', reason: 'Changed Mind', condition: 'Unopened', resolution: 'Refund', notes: '' });
  };

  const handleUpdateStatus = (id: string, status: ReturnRequest['status']) => {
    setReturns(prev => prev.map(r => r.id === id ? { ...r, status } : r));
    if (selectedReturn?.id === id) {
        setSelectedReturn(prev => prev ? { ...prev, status } : null);
    }
  };

  const handleBulkAction = (action: string) => {
    if (action === 'Approve') {
        setReturns(prev => prev.map(r => selectedIds.has(r.id) ? { ...r, status: 'Approved' } : r));
    } else if (action === 'Reject') {
        setReturns(prev => prev.map(r => selectedIds.has(r.id) ? { ...r, status: 'Rejected' } : r));
    }
    setSelectedIds(new Set());
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'Requested': return 'bg-warning/10 text-warning border-warning/20';
      case 'Approved': return 'bg-info/10 text-info border-info/20';
      case 'Refunded': return 'bg-success/10 text-success border-success/20';
      case 'Rejected': return 'bg-danger/10 text-danger border-danger/20';
      default: return 'bg-white/5 text-zinc-muted';
    }
  };

  return (
    <div className="animate-fade-up space-y-6 min-h-[calc(100vh-100px)] flex flex-col">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
             <RotateCcw className="w-5 h-5 text-brand" />
             <h1 className="text-2xl font-black text-zinc-text uppercase italic tracking-tighter">Returns Management</h1>
          </div>
          <p className="text-[10px] font-black text-zinc-muted uppercase tracking-[0.3em] mt-1">Process refunds and exchanges</p>
        </div>
        <div className="flex gap-2">
          <AmberButton variant="ghost" size="sm">
            <Download className="w-3.5 h-3.5 mr-2" /> Export
          </AmberButton>
          <AmberButton size="sm" onClick={() => setIsCreateOpen(true)}>
            <Plus className="w-3.5 h-3.5 mr-2" /> Create Return
          </AmberButton>
        </div>
      </div>

      {/* Filter Bar */}
      <AmberCard noPadding className="p-4 flex flex-col xl:flex-row gap-4 items-end bg-obsidian-panel border-white/5 relative z-20">
        <div className="flex-1 w-full">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-muted" />
            <input 
              type="text" 
              placeholder="Search Return ID, Order ID, Customer..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 bg-obsidian-outer border border-white/5 rounded-sm pl-10 pr-4 text-xs font-bold text-zinc-text outline-none focus:border-brand/30 transition-all placeholder:text-zinc-muted/50"
            />
          </div>
        </div>
        
        <AmberDropdown 
          label="Status"
          options={['All', 'Requested', 'Approved', 'Refunded', 'Rejected'].map(s => ({label: s, value: s}))}
          value={statusFilter}
          onChange={setStatusFilter}
          className="w-full xl:w-48"
        />

        <div className="flex gap-2 w-full xl:w-auto">
           <div className="space-y-1.5 flex-1">
              <label className="text-[9px] font-black text-zinc-muted uppercase tracking-widest px-1">Start Date</label>
              <input type="date" className="h-10 w-full bg-obsidian-outer border border-white/5 rounded-sm px-3 text-xs font-bold text-zinc-text outline-none focus:border-brand/30" value={dateRange.start} onChange={(e) => setDateRange({...dateRange, start: e.target.value})} />
           </div>
           <div className="space-y-1.5 flex-1">
              <label className="text-[9px] font-black text-zinc-muted uppercase tracking-widest px-1">End Date</label>
              <input type="date" className="h-10 w-full bg-obsidian-outer border border-white/5 rounded-sm px-3 text-xs font-bold text-zinc-text outline-none focus:border-brand/30" value={dateRange.end} onChange={(e) => setDateRange({...dateRange, end: e.target.value})} />
           </div>
        </div>
        
        <button className="h-10 px-4 bg-obsidian-card border border-white/5 text-zinc-muted hover:text-zinc-text transition-all rounded-sm flex items-center justify-center hover:bg-white/5">
          <Filter className="w-4 h-4" />
        </button>
      </AmberCard>

      {/* Bulk Actions */}
      <div className={cn(
         "fixed bottom-6 left-1/2 -translate-x-1/2 bg-obsidian-card border border-white/10 shadow-2xl rounded-full px-6 py-3 flex items-center gap-6 z-40 transition-all duration-300",
         selectedIds.size > 0 ? "translate-y-0 opacity-100" : "translate-y-20 opacity-0 pointer-events-none"
      )}>
         <span className="text-[10px] font-black text-zinc-text uppercase tracking-widest border-r border-white/10 pr-6">
            {selectedIds.size} Selected
         </span>
         <div className="flex items-center gap-2">
            <button onClick={() => handleBulkAction('Approve')} className="p-2 text-zinc-muted hover:text-success transition-colors rounded-full hover:bg-white/5" title="Approve">
               <CheckCircle2 className="w-4 h-4" />
            </button>
            <button onClick={() => handleBulkAction('Reject')} className="p-2 text-zinc-muted hover:text-danger transition-colors rounded-full hover:bg-white/5" title="Reject">
               <XCircle className="w-4 h-4" />
            </button>
            <button onClick={() => handleBulkAction('Archive')} className="p-2 text-zinc-muted hover:text-warning transition-colors rounded-full hover:bg-white/5" title="Archive">
               <Trash2 className="w-4 h-4" />
            </button>
         </div>
         <button onClick={() => setSelectedIds(new Set())} className="ml-2 p-1 bg-white/10 rounded-full text-zinc-muted hover:bg-white/20 transition-colors">
            <X className="w-3 h-3" />
         </button>
      </div>

      {/* Data Table */}
      <AmberCard noPadding className="flex-1 flex flex-col bg-obsidian-panel border-white/5 shadow-xl overflow-hidden">
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left min-w-[1000px]">
            <thead className="bg-obsidian-outer/50 border-b border-white/5 text-[9px] font-black text-zinc-muted uppercase tracking-widest sticky top-0 z-10">
              <tr>
                <th className="w-12 px-6 py-4 text-center">
                  <button onClick={toggleSelectAll} className="hover:text-brand transition-colors">
                    {selectedIds.size > 0 && selectedIds.size === filteredReturns.length ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
                  </button>
                </th>
                <th className="px-6 py-4">Return ID</th>
                <th className="px-6 py-4">Order Ref</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4 text-center">Items</th>
                <th className="px-6 py-4">Reason</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Refund</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.03]">
              {filteredReturns.map((ret) => (
                <tr key={ret.id} className={cn("hover:bg-white/[0.02] transition-colors group", selectedIds.has(ret.id) && "bg-brand/[0.03]")}>
                  <td className="px-6 py-4 text-center">
                    <button onClick={() => toggleSelect(ret.id)} className={cn("transition-colors", selectedIds.has(ret.id) ? "text-brand" : "text-zinc-muted")}>
                      {selectedIds.has(ret.id) ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
                    </button>
                  </td>
                  <td className="px-6 py-4">
                     <span className="font-mono text-[10px] font-bold text-zinc-text group-hover:text-brand transition-colors cursor-pointer" onClick={() => setSelectedReturn(ret)}>
                        {ret.id}
                     </span>
                  </td>
                  <td className="px-6 py-4">
                     <span className="text-[10px] font-mono text-zinc-muted hover:underline cursor-pointer">{ret.orderId}</span>
                  </td>
                  <td className="px-6 py-4">
                     <div className="flex items-center gap-3">
                        <div className="w-6 h-6 rounded-full bg-obsidian-outer border border-white/10 flex items-center justify-center text-[9px] font-bold text-zinc-muted">
                           {ret.customer.avatar}
                        </div>
                        <div>
                           <p className="text-xs font-bold text-zinc-text">{ret.customer.name}</p>
                        </div>
                     </div>
                  </td>
                  <td className="px-6 py-4 text-center text-xs font-bold text-zinc-text">{ret.items.reduce((a, b) => a + b.qty, 0)}</td>
                  <td className="px-6 py-4 text-[10px] font-bold text-zinc-muted">{ret.reason}</td>
                  <td className="px-6 py-4">
                     <span className={cn("text-[9px] font-black px-2 py-0.5 rounded-sm border uppercase tracking-widest", getStatusStyle(ret.status))}>
                        {ret.status}
                     </span>
                  </td>
                  <td className="px-6 py-4 text-right text-xs font-bold text-zinc-text">${ret.refundAmount.toFixed(2)}</td>
                  <td className="px-6 py-4 text-right">
                     <button onClick={() => setSelectedReturn(ret)} className="p-1.5 text-zinc-muted hover:text-zinc-text hover:bg-white/5 rounded-sm transition-colors">
                        <MoreVertical className="w-4 h-4" />
                     </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </AmberCard>

      {/* Create Modal */}
      <AmberSlideOver
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Create Return"
        description="Initiate a return request for a customer order."
        footer={
           <>
              <AmberButton variant="ghost" onClick={() => setIsCreateOpen(false)}>Cancel</AmberButton>
              <AmberButton onClick={handleCreate}>Create Request</AmberButton>
           </>
        }
      >
         <div className="space-y-6">
            <AmberInput 
               label="Order Number"
               placeholder="e.g. ORD-2025001"
               value={createForm.orderId}
               onChange={(e) => setCreateForm({...createForm, orderId: e.target.value})}
               icon={<Search className="w-4 h-4" />}
            />
            <div className="p-4 bg-obsidian-outer/50 border border-white/5 rounded-sm flex items-center justify-center text-zinc-muted text-[10px] italic h-32">
               Search order to select items...
            </div>
            <div className="grid grid-cols-2 gap-4">
               <div>
                  <label className="text-[9px] font-black text-zinc-muted uppercase tracking-widest mb-1.5 block px-1">Reason</label>
                  <AmberDropdown 
                     options={['Damaged', 'Wrong Item', 'Size/Fit', 'Changed Mind'].map(v => ({label: v, value: v}))}
                     value={createForm.reason}
                     onChange={(val) => setCreateForm({...createForm, reason: val})}
                     className="w-full"
                  />
               </div>
               <div>
                  <label className="text-[9px] font-black text-zinc-muted uppercase tracking-widest mb-1.5 block px-1">Condition</label>
                  <AmberDropdown 
                     options={['Unopened', 'Opened', 'Damaged'].map(v => ({label: v, value: v}))}
                     value={createForm.condition}
                     onChange={(val) => setCreateForm({...createForm, condition: val})}
                     className="w-full"
                  />
               </div>
            </div>
            <div>
                <label className="text-[9px] font-black text-zinc-muted uppercase tracking-widest mb-1.5 block px-1">Resolution</label>
                <AmberDropdown 
                    options={['Refund', 'Exchange', 'Store Credit'].map(v => ({label: v, value: v}))}
                    value={createForm.resolution}
                    onChange={(val) => setCreateForm({...createForm, resolution: val})}
                    className="w-full"
                />
            </div>
            <AmberInput 
               label="Internal Notes"
               multiline
               rows={3}
               value={createForm.notes}
               onChange={(e) => setCreateForm({...createForm, notes: e.target.value})}
            />
         </div>
      </AmberSlideOver>

      {/* Detail SlideOver */}
      <AmberSlideOver
        isOpen={!!selectedReturn}
        onClose={() => setSelectedReturn(null)}
        title={selectedReturn ? `Return ${selectedReturn.id}` : ''}
        description={selectedReturn ? `For Order ${selectedReturn.orderId}` : ''}
        footer={
           <div className="flex justify-between w-full">
              <AmberButton variant="ghost" onClick={() => setSelectedReturn(null)}>Close</AmberButton>
              {selectedReturn && selectedReturn.status === 'Requested' && (
                 <div className="flex gap-2">
                    <button onClick={() => handleUpdateStatus(selectedReturn.id, 'Rejected')} className="px-4 py-2 bg-danger/10 text-danger border border-danger/20 rounded-sm text-[10px] font-black uppercase tracking-widest hover:bg-danger/20 transition-all">Reject</button>
                    <button onClick={() => handleUpdateStatus(selectedReturn.id, 'Approved')} className="px-4 py-2 bg-success/10 text-success border border-success/20 rounded-sm text-[10px] font-black uppercase tracking-widest hover:bg-success/20 transition-all">Approve</button>
                 </div>
              )}
              {selectedReturn && selectedReturn.status === 'Approved' && (
                 <AmberButton onClick={() => handleUpdateStatus(selectedReturn.id, 'Refunded')}>Process Refund</AmberButton>
              )}
           </div>
        }
      >
         {selectedReturn && (
            <div className="space-y-8">
               {/* Status Banner */}
               <div className={cn("p-4 border rounded-sm flex items-center justify-between", getStatusStyle(selectedReturn.status))}>
                  <div className="flex items-center gap-2">
                     {selectedReturn.status === 'Approved' || selectedReturn.status === 'Refunded' ? <CheckCircle2 className="w-5 h-5" /> : 
                      selectedReturn.status === 'Rejected' ? <XCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                     <span className="text-sm font-black uppercase tracking-tight">{selectedReturn.status}</span>
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-widest">{selectedReturn.resolution}</span>
               </div>

               {/* Customer */}
               <div className="flex items-center gap-4 p-4 bg-obsidian-outer border border-white/5 rounded-sm">
                  <div className="w-12 h-12 rounded-full bg-brand/10 border border-brand/20 flex items-center justify-center text-brand font-black text-sm">
                     {selectedReturn.customer.avatar}
                  </div>
                  <div>
                     <p className="text-sm font-bold text-zinc-text">{selectedReturn.customer.name}</p>
                     <p className="text-[10px] text-zinc-muted">{selectedReturn.customer.email}</p>
                  </div>
               </div>

               {/* Items */}
               <div className="space-y-4">
                  <h4 className="text-[10px] font-black text-zinc-text uppercase tracking-widest border-b border-white/5 pb-2">Returned Items</h4>
                  {selectedReturn.items.map(item => (
                     <div key={item.id} className="flex items-center justify-between p-3 bg-obsidian-outer/30 border border-white/5 rounded-sm">
                        <div className="flex items-center gap-3">
                           <div className="w-10 h-10 bg-white/5 rounded-sm flex items-center justify-center"><Package className="w-4 h-4 text-zinc-muted" /></div>
                           <div>
                              <p className="text-xs font-bold text-zinc-text">{item.name}</p>
                              <p className="text-[9px] font-mono text-zinc-muted">{item.sku}</p>
                           </div>
                        </div>
                        <div className="text-right">
                           <p className="text-xs font-bold text-zinc-text">${item.price.toFixed(2)}</p>
                           <p className="text-[9px] text-zinc-muted">Qty: {item.qty}</p>
                        </div>
                     </div>
                  ))}
               </div>

               {/* Details */}
               <div className="grid grid-cols-2 gap-4 text-[10px]">
                  <div className="p-3 bg-white/[0.02] border border-white/5 rounded-sm">
                     <p className="font-black text-zinc-muted uppercase mb-1">Reason</p>
                     <p className="font-bold text-zinc-text">{selectedReturn.reason}</p>
                  </div>
                  <div className="p-3 bg-white/[0.02] border border-white/5 rounded-sm">
                     <p className="font-black text-zinc-muted uppercase mb-1">Condition</p>
                     <p className="font-bold text-zinc-text">{selectedReturn.condition}</p>
                  </div>
               </div>

               {/* Timeline */}
               <div className="space-y-4 pt-4 border-t border-white/5">
                  <h4 className="text-[10px] font-black text-zinc-text uppercase tracking-widest">History</h4>
                  <div className="space-y-4 relative pl-3 before:absolute before:left-1 before:top-1 before:bottom-1 before:w-px before:bg-white/10">
                     <div className="relative pl-6">
                        <div className="absolute left-0 top-1 w-2 h-2 rounded-full bg-brand" />
                        <p className="text-[10px] font-bold text-zinc-text">Return Requested</p>
                        <p className="text-[9px] text-zinc-muted">{selectedReturn.date}</p>
                     </div>
                     {selectedReturn.status !== 'Requested' && (
                        <div className="relative pl-6">
                           <div className="absolute left-0 top-1 w-2 h-2 rounded-full bg-zinc-text" />
                           <p className="text-[10px] font-bold text-zinc-text">Status Updated: {selectedReturn.status}</p>
                           <p className="text-[9px] text-zinc-muted">Today</p>
                        </div>
                     )}
                  </div>
               </div>
            </div>
         )}
      </AmberSlideOver>
    </div>
  );
};
