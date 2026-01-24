
import React, { useState, useMemo } from 'react';
import { AmberCard } from '../../../amber-ui/components/AmberCard';
import { AmberButton } from '../../../amber-ui/components/AmberButton';
import { AmberSlideOver } from '../../../amber-ui/components/AmberSlideOver';
import { AmberInput } from '../../../amber-ui/components/AmberInput';
import { AmberDropdown } from '../../../amber-ui/components/AmberDropdown';
import { 
  Users, 
  Search, 
  Filter, 
  Plus, 
  Download, 
  MoreVertical, 
  CheckSquare, 
  Square, 
  Phone, 
  Mail, 
  Eye, 
  Edit, 
  Trash2, 
  AlertCircle,
  CheckCircle2,
  Clock,
  Briefcase,
  DollarSign,
  Calendar,
  X,
  User,
  Send,
  ArrowRight,
  FileText,
  History
} from 'lucide-react';
import { cn } from '../../../lib/cn';

// --- Types ---
type DebtorStatus = 'Active' | 'Overdue' | 'Paid' | 'Collection';

interface Payment {
    id: string;
    amount: number;
    date: string;
    method: string;
    reference: string;
}

interface Debtor {
  id: string;
  name: string;
  email: string;
  phone: string;
  totalDebt: number;
  paidAmount: number;
  status: DebtorStatus;
  lastPaymentDate: string | null;
  dueDate: string | null;
  notes: string;
  payments: Payment[];
}

// --- Mock Data ---
const MOCK_DEBTORS: Debtor[] = [
  { 
      id: 'DEB-1001', 
      name: 'TechNova Solutions', 
      email: 'finance@technova.com', 
      phone: '+1 555-0199', 
      totalDebt: 15000, 
      paidAmount: 2500, 
      status: 'Overdue', 
      lastPaymentDate: '2025-04-10', 
      dueDate: '2025-04-01',
      notes: 'Promised payment by end of week.',
      payments: [
          { id: 'pay1', amount: 2500, date: '2025-04-10', method: 'Wire', reference: 'TRX-9981' }
      ]
  },
  { 
      id: 'DEB-1002', 
      name: 'BlueSky Logistics', 
      email: 'ap@bluesky.io', 
      phone: '+1 555-3321', 
      totalDebt: 8400, 
      paidAmount: 0, 
      status: 'Active', 
      lastPaymentDate: null, 
      dueDate: '2025-06-15',
      notes: 'New account, Net 60 terms.',
      payments: []
  },
  { 
      id: 'DEB-1003', 
      name: 'Rapid Ventures', 
      email: 'accounting@rapid.co', 
      phone: '+44 20 7123 4567', 
      totalDebt: 3200, 
      paidAmount: 3200, 
      status: 'Paid', 
      lastPaymentDate: '2025-05-18', 
      dueDate: '2025-05-01',
      notes: 'Account cleared.',
      payments: [
          { id: 'pay2', amount: 3200, date: '2025-05-18', method: 'Credit Card', reference: 'CC-4242' }
      ]
  },
  { 
      id: 'DEB-1004', 
      name: 'Omega Corp', 
      email: 'billing@omega.net', 
      phone: '+1 555-9988', 
      totalDebt: 50000, 
      paidAmount: 10000, 
      status: 'Collection', 
      lastPaymentDate: '2025-01-15', 
      dueDate: '2025-02-01',
      notes: 'Sent to legal.',
      payments: [
          { id: 'pay3', amount: 10000, date: '2025-01-15', method: 'Check', reference: 'CHK-1004' }
      ]
  },
];

export const Debtors = () => {
  // State
  const [debtors, setDebtors] = useState<Debtor[]>(MOCK_DEBTORS);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  
  // Detail / Form State
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [selectedDebtor, setSelectedDebtor] = useState<Debtor | null>(null);
  
  // Add Form
  const [formData, setFormData] = useState<Partial<Debtor>>({
      name: '', email: '', phone: '', totalDebt: 0, status: 'Active', notes: ''
  });

  // Payment Form (inside Detail)
  const [paymentAmount, setPaymentAmount] = useState('');

  // --- Handlers ---
  const handleSelect = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedIds(newSet);
  };

  const handleSelectAll = () => {
    if (selectedIds.size === filteredDebtors.length) setSelectedIds(new Set());
    else setSelectedIds(new Set(filteredDebtors.map(d => d.id)));
  };

  const handleSaveDebtor = () => {
      const newDebtor: Debtor = {
          id: `DEB-${Math.floor(Math.random() * 10000)}`,
          name: formData.name || 'New Debtor',
          email: formData.email || '',
          phone: formData.phone || '',
          totalDebt: Number(formData.totalDebt) || 0,
          paidAmount: 0,
          status: (formData.status as DebtorStatus) || 'Active',
          lastPaymentDate: null,
          dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // +30 days
          notes: formData.notes || '',
          payments: []
      };
      setDebtors([...debtors, newDebtor]);
      setIsAddOpen(false);
      setFormData({ name: '', email: '', phone: '', totalDebt: 0, status: 'Active', notes: '' });
  };

  const handleRecordPayment = () => {
      if (!selectedDebtor || !paymentAmount) return;
      const amount = parseFloat(paymentAmount);
      
      const newPayment: Payment = {
          id: `pay_${Date.now()}`,
          amount,
          date: new Date().toISOString().split('T')[0],
          method: 'Manual Entry',
          reference: 'MANUAL'
      };

      const updatedDebtor = {
          ...selectedDebtor,
          paidAmount: selectedDebtor.paidAmount + amount,
          lastPaymentDate: newPayment.date,
          status: (selectedDebtor.paidAmount + amount) >= selectedDebtor.totalDebt ? 'Paid' : selectedDebtor.status,
          payments: [newPayment, ...selectedDebtor.payments]
      };

      setDebtors(prev => prev.map(d => d.id === selectedDebtor.id ? updatedDebtor as Debtor : d));
      setSelectedDebtor(updatedDebtor as Debtor);
      setPaymentAmount('');
  };

  const handleBulkAction = (action: string) => {
      alert(`${action} applied to ${selectedIds.size} debtors.`);
      setSelectedIds(new Set());
  };

  // --- Filtering ---
  const filteredDebtors = useMemo(() => {
      return debtors.filter(d => {
          const matchSearch = d.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                              d.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                              d.phone.includes(searchQuery);
          const matchStatus = statusFilter === 'All' || d.status === statusFilter;
          return matchSearch && matchStatus;
      });
  }, [debtors, searchQuery, statusFilter]);

  // --- Styles ---
  const getStatusColor = (status: string) => {
      switch(status) {
          case 'Active': return 'text-info bg-info/10 border-info/20';
          case 'Paid': return 'text-success bg-success/10 border-success/20';
          case 'Overdue': return 'text-warning bg-warning/10 border-warning/20';
          case 'Collection': return 'text-danger bg-danger/10 border-danger/20';
          default: return 'text-zinc-muted';
      }
  };

  return (
    <div className="h-[calc(100vh-100px)] flex flex-col space-y-6 animate-fade-up">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 shrink-0">
            <div>
                <div className="flex items-center gap-2 mb-1">
                    <Users className="w-5 h-5 text-brand" />
                    <h1 className="text-2xl font-black text-zinc-text uppercase italic tracking-tighter">Debtor Management</h1>
                </div>
                <p className="text-[10px] font-black text-zinc-muted uppercase tracking-[0.3em] mt-1">Track liabilities and collections</p>
            </div>
            <div className="flex gap-2">
                <AmberButton variant="ghost" size="sm">
                    <Download className="w-3.5 h-3.5 mr-2" /> Export
                </AmberButton>
                <AmberButton size="sm" onClick={() => setIsAddOpen(true)}>
                    <Plus className="w-3.5 h-3.5 mr-2" /> Add Debtor
                </AmberButton>
            </div>
        </div>

        {/* Filters */}
        <div className="bg-obsidian-panel border border-white/5 rounded-sm p-4 flex flex-col xl:flex-row gap-4 items-end shrink-0 relative z-20">
            <div className="flex-1 w-full">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-muted" />
                    <input 
                        type="text" 
                        placeholder="Search Name, ID, Phone..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full h-10 bg-obsidian-outer border border-white/5 rounded-sm pl-10 pr-4 text-xs font-bold text-zinc-text outline-none focus:border-brand/30 transition-all"
                    />
                </div>
            </div>
            <AmberDropdown 
                label="Status"
                options={['All', 'Active', 'Overdue', 'Paid', 'Collection'].map(s => ({label: s, value: s}))}
                value={statusFilter}
                onChange={setStatusFilter}
                className="w-full xl:w-48"
            />
            <button className="h-10 px-4 bg-obsidian-card border border-white/5 text-zinc-muted hover:text-zinc-text transition-all rounded-sm flex items-center justify-center hover:bg-white/5">
                <Filter className="w-4 h-4" />
            </button>
        </div>

        {/* Bulk Actions */}
        <div className={cn(
            "fixed bottom-6 left-1/2 -translate-x-1/2 bg-obsidian-card border border-white/10 shadow-2xl rounded-full px-6 py-3 flex items-center gap-6 z-40 transition-all duration-300",
            selectedIds.size > 0 ? "translate-y-0 opacity-100" : "translate-y-20 opacity-0 pointer-events-none"
        )}>
            <span className="text-[10px] font-black text-zinc-text uppercase tracking-widest border-r border-white/10 pr-6">
                {selectedIds.size} Selected
            </span>
            <div className="flex items-center gap-2">
                <button onClick={() => handleBulkAction('Reminder')} className="p-2 text-zinc-muted hover:text-brand transition-colors rounded-full hover:bg-white/5" title="Send Reminder">
                    <Mail className="w-4 h-4" />
                </button>
                <button onClick={() => handleBulkAction('Collection')} className="p-2 text-zinc-muted hover:text-danger transition-colors rounded-full hover:bg-white/5" title="Move to Collection">
                    <AlertCircle className="w-4 h-4" />
                </button>
                <button onClick={() => handleBulkAction('Archive')} className="p-2 text-zinc-muted hover:text-zinc-text transition-colors rounded-full hover:bg-white/5" title="Archive">
                    <Trash2 className="w-4 h-4" />
                </button>
            </div>
        </div>

        {/* Table */}
        <AmberCard noPadding className="flex-1 flex flex-col bg-obsidian-panel border-white/5 shadow-xl overflow-hidden">
            <div className="overflow-x-auto flex-1">
                <table className="w-full text-left min-w-[1000px]">
                    <thead className="bg-obsidian-outer/50 border-b border-white/5 text-[9px] font-black text-zinc-muted uppercase tracking-widest sticky top-0 z-10">
                        <tr>
                            <th className="w-12 px-6 py-4 text-center">
                                <button onClick={handleSelectAll} className="hover:text-brand transition-colors">
                                    {selectedIds.size > 0 && selectedIds.size === filteredDebtors.length ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
                                </button>
                            </th>
                            <th className="px-6 py-4">Debtor</th>
                            <th className="px-6 py-4">Contact</th>
                            <th className="px-6 py-4 text-right">Total Debt</th>
                            <th className="px-6 py-4 text-right">Paid</th>
                            <th className="px-6 py-4 text-right">Balance</th>
                            <th className="px-6 py-4 text-center">Status</th>
                            <th className="px-6 py-4 text-right">Last Payment</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.03]">
                        {filteredDebtors.map(d => (
                            <tr key={d.id} className={cn("hover:bg-white/[0.02] transition-colors group", selectedIds.has(d.id) && "bg-brand/[0.03]")}>
                                <td className="px-6 py-4 text-center">
                                    <button onClick={() => handleSelect(d.id)} className={cn("transition-colors", selectedIds.has(d.id) ? "text-brand" : "text-zinc-muted")}>
                                        {selectedIds.has(d.id) ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
                                    </button>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex flex-col">
                                        <span className="text-xs font-bold text-zinc-text cursor-pointer hover:text-brand transition-colors" onClick={() => { setSelectedDebtor(d); setIsDetailOpen(true); }}>
                                            {d.name}
                                        </span>
                                        <span className="text-[9px] font-mono text-zinc-muted">{d.id}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex flex-col gap-0.5">
                                        <span className="flex items-center gap-1.5 text-[10px] text-zinc-muted"><Mail className="w-3 h-3" /> {d.email}</span>
                                        <span className="flex items-center gap-1.5 text-[10px] text-zinc-muted"><Phone className="w-3 h-3" /> {d.phone}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-right font-mono text-xs font-bold text-zinc-text">${d.totalDebt.toLocaleString()}</td>
                                <td className="px-6 py-4 text-right font-mono text-xs text-success">${d.paidAmount.toLocaleString()}</td>
                                <td className="px-6 py-4 text-right font-mono text-xs font-black text-danger">${(d.totalDebt - d.paidAmount).toLocaleString()}</td>
                                <td className="px-6 py-4 text-center">
                                    <span className={cn("text-[9px] font-black px-2 py-0.5 rounded-sm border uppercase tracking-widest", getStatusColor(d.status))}>
                                        {d.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right text-[10px] text-zinc-muted">{d.lastPaymentDate || '-'}</td>
                                <td className="px-6 py-4 text-right">
                                    <button 
                                        onClick={() => { setSelectedDebtor(d); setIsDetailOpen(true); }}
                                        className="p-1.5 hover:bg-white/5 rounded-sm text-zinc-muted hover:text-zinc-text transition-colors"
                                    >
                                        <MoreVertical className="w-4 h-4" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </AmberCard>

        {/* Add Debtor SlideOver */}
        <AmberSlideOver
            isOpen={isAddOpen}
            onClose={() => setIsAddOpen(false)}
            title="Add Debtor"
            description="Register a new liability account."
            footer={
                <div className="flex justify-between w-full">
                    <AmberButton variant="ghost" onClick={() => setIsAddOpen(false)}>Cancel</AmberButton>
                    <AmberButton onClick={handleSaveDebtor}>Create Account</AmberButton>
                </div>
            }
        >
            <div className="space-y-6">
                <AmberInput label="Entity Name" placeholder="Full Name or Company" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} autoFocus />
                <div className="grid grid-cols-2 gap-4">
                    <AmberInput label="Email" type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
                    <AmberInput label="Phone" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} />
                </div>
                <AmberInput label="Total Debt ($)" type="number" value={formData.totalDebt} onChange={(e) => setFormData({...formData, totalDebt: parseFloat(e.target.value)})} />
                <div>
                    <label className="text-[9px] font-black text-zinc-muted uppercase tracking-widest px-1 mb-1.5 block">Initial Status</label>
                    <AmberDropdown 
                        options={['Active', 'Overdue', 'Paid', 'Collection'].map(s => ({label: s, value: s}))}
                        value={formData.status as string}
                        onChange={(val) => setFormData({...formData, status: val as any})}
                        className="w-full"
                    />
                </div>
                <AmberInput label="Notes" multiline rows={3} value={formData.notes} onChange={(e) => setFormData({...formData, notes: e.target.value})} />
            </div>
        </AmberSlideOver>

        {/* Detail SlideOver */}
        <AmberSlideOver
            isOpen={isDetailOpen}
            onClose={() => setIsDetailOpen(false)}
            title="Debtor Profile"
            description={selectedDebtor?.id}
            footer={
                <div className="flex justify-end gap-2 w-full">
                    <AmberButton variant="secondary" onClick={() => setIsDetailOpen(false)}>Close</AmberButton>
                </div>
            }
        >
            {selectedDebtor && (
                <div className="space-y-8">
                    {/* Header Card */}
                    <div className="p-5 bg-obsidian-outer border border-white/5 rounded-sm">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="text-lg font-black text-zinc-text">{selectedDebtor.name}</h3>
                                <div className="flex gap-4 text-[10px] text-zinc-muted mt-1">
                                    <span>{selectedDebtor.email}</span>
                                    <span>{selectedDebtor.phone}</span>
                                </div>
                            </div>
                            <span className={cn("text-[9px] font-black px-2 py-0.5 rounded-sm border uppercase tracking-widest", getStatusColor(selectedDebtor.status))}>
                                {selectedDebtor.status}
                            </span>
                        </div>
                        <div className="grid grid-cols-3 gap-4 border-t border-white/5 pt-4">
                            <div>
                                <p className="text-[9px] font-black text-zinc-muted uppercase tracking-widest">Total Debt</p>
                                <p className="text-sm font-bold text-zinc-text">${selectedDebtor.totalDebt.toLocaleString()}</p>
                            </div>
                            <div>
                                <p className="text-[9px] font-black text-zinc-muted uppercase tracking-widest">Paid</p>
                                <p className="text-sm font-bold text-success">${selectedDebtor.paidAmount.toLocaleString()}</p>
                            </div>
                            <div>
                                <p className="text-[9px] font-black text-zinc-muted uppercase tracking-widest">Balance</p>
                                <p className="text-sm font-bold text-danger">${(selectedDebtor.totalDebt - selectedDebtor.paidAmount).toLocaleString()}</p>
                            </div>
                        </div>
                    </div>

                    {/* Record Payment */}
                    <div className="space-y-4">
                        <h4 className="text-[10px] font-black text-zinc-text uppercase tracking-widest flex items-center gap-2">
                            <DollarSign className="w-3.5 h-3.5 text-brand" /> Record Payment
                        </h4>
                        <div className="flex gap-2">
                            <input 
                                type="number" 
                                placeholder="Amount..." 
                                value={paymentAmount} 
                                onChange={(e) => setPaymentAmount(e.target.value)}
                                className="flex-1 bg-obsidian-outer border border-white/10 rounded-sm px-3 text-sm text-zinc-text outline-none focus:border-brand/30"
                            />
                            <AmberButton size="sm" onClick={handleRecordPayment}>Save</AmberButton>
                        </div>
                    </div>

                    {/* History */}
                    <div className="space-y-4">
                        <h4 className="text-[10px] font-black text-zinc-text uppercase tracking-widest flex items-center gap-2">
                            <History className="w-3.5 h-3.5 text-info" /> Transaction History
                        </h4>
                        <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                            {selectedDebtor.payments.length > 0 ? (
                                selectedDebtor.payments.map((p) => (
                                    <div key={p.id} className="p-3 bg-white/[0.02] border border-white/5 rounded-sm flex justify-between items-center">
                                        <div>
                                            <p className="text-xs font-bold text-zinc-text">Payment Received</p>
                                            <p className="text-[9px] text-zinc-muted">{p.date} • {p.method} • {p.reference}</p>
                                        </div>
                                        <span className="text-xs font-bold text-success">+${p.amount.toLocaleString()}</span>
                                    </div>
                                ))
                            ) : (
                                <p className="text-[10px] text-zinc-muted italic text-center py-4">No payments recorded yet.</p>
                            )}
                        </div>
                    </div>

                    {/* Notes */}
                    <div className="space-y-2">
                         <h4 className="text-[10px] font-black text-zinc-text uppercase tracking-widest flex items-center gap-2">
                            <FileText className="w-3.5 h-3.5 text-zinc-muted" /> Notes
                        </h4>
                        <p className="text-xs text-zinc-secondary italic bg-obsidian-outer p-3 rounded-sm border border-white/5 leading-relaxed">
                            {selectedDebtor.notes || "No notes available."}
                        </p>
                    </div>
                </div>
            )}
        </AmberSlideOver>
    </div>
  );
};
