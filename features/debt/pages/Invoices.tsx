
import React, { useState, useMemo } from 'react';
import { AmberCard } from '../../../amber-ui/components/AmberCard';
import { AmberButton } from '../../../amber-ui/components/AmberButton';
import { AmberSlideOver } from '../../../amber-ui/components/AmberSlideOver';
import { AmberInput } from '../../../amber-ui/components/AmberInput';
import { AmberDropdown } from '../../../amber-ui/components/AmberDropdown';
import { AmberAutocomplete } from '../../../amber-ui/components/AmberAutocomplete';
import { 
  FileText, 
  Search, 
  Filter, 
  Plus, 
  Download, 
  MoreVertical, 
  CheckSquare, 
  Square, 
  Printer, 
  Mail, 
  Eye, 
  Edit, 
  Trash2, 
  CheckCircle2, 
  AlertCircle, 
  XCircle, 
  Clock,
  Calendar,
  CreditCard,
  DollarSign
} from 'lucide-react';
import { cn } from '../../../lib/cn';

// --- Types ---
type InvoiceStatus = 'Paid' | 'Pending' | 'Overdue' | 'Cancelled';

interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
}

interface Invoice {
  id: string;
  customerName: string;
  customerId: string;
  email: string;
  issueDate: string;
  dueDate: string;
  items: InvoiceItem[];
  subtotal: number;
  tax: number;
  total: number;
  status: InvoiceStatus;
  notes: string;
}

// --- Mock Data ---
const MOCK_INVOICES: Invoice[] = [
  {
    id: 'INV-2025-001',
    customerName: 'TechNova Solutions',
    customerId: 'DEB-1001',
    email: 'finance@technova.com',
    issueDate: '2025-05-01',
    dueDate: '2025-05-15',
    items: [
      { id: '1', description: 'Consulting Services', quantity: 10, unitPrice: 150 },
      { id: '2', description: 'Software License', quantity: 1, unitPrice: 2500 }
    ],
    subtotal: 4000,
    tax: 320,
    total: 4320,
    status: 'Overdue',
    notes: 'Please remit payment to account ending 8821.'
  },
  {
    id: 'INV-2025-002',
    customerName: 'BlueSky Logistics',
    customerId: 'DEB-1002',
    email: 'ap@bluesky.io',
    issueDate: '2025-05-18',
    dueDate: '2025-06-01',
    items: [
      { id: '1', description: 'Hardware Equipment', quantity: 5, unitPrice: 1200 }
    ],
    subtotal: 6000,
    tax: 480,
    total: 6480,
    status: 'Pending',
    notes: ''
  },
  {
    id: 'INV-2025-003',
    customerName: 'Rapid Ventures',
    customerId: 'DEB-1003',
    email: 'accounting@rapid.co',
    issueDate: '2025-04-20',
    dueDate: '2025-05-04',
    items: [
      { id: '1', description: 'Q1 Retainer', quantity: 1, unitPrice: 5000 }
    ],
    subtotal: 5000,
    tax: 0,
    total: 5000,
    status: 'Paid',
    notes: 'Thank you for your business.'
  }
];

const CUSTOMERS = [
  { label: 'TechNova Solutions', value: 'DEB-1001' },
  { label: 'BlueSky Logistics', value: 'DEB-1002' },
  { label: 'Rapid Ventures', value: 'DEB-1003' },
  { label: 'Omega Corp', value: 'DEB-1004' }
];

export const Invoices = () => {
  // State
  const [invoices, setInvoices] = useState<Invoice[]>(MOCK_INVOICES);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // SlideOver State
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  // Create Form State
  const [formData, setFormData] = useState({
    customerId: '',
    invoiceNumber: `INV-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000)}`,
    issueDate: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
    items: [{ id: 'item_1', description: '', quantity: 1, unitPrice: 0 }],
    notes: '',
    taxRate: 8 // %
  });

  // --- Helpers ---
  
  const calculateTotals = (items: InvoiceItem[]) => {
    const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    const tax = subtotal * (formData.taxRate / 100);
    return { subtotal, tax, total: subtotal + tax };
  };

  const handleAddItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { id: `item_${Date.now()}`, description: '', quantity: 1, unitPrice: 0 }]
    }));
  };

  const handleRemoveItem = (id: string) => {
    if (formData.items.length === 1) return;
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter(i => i.id !== id)
    }));
  };

  const updateItem = (id: string, field: keyof InvoiceItem, value: any) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.map(i => i.id === id ? { ...i, [field]: value } : i)
    }));
  };

  const handleSaveInvoice = () => {
    const customer = CUSTOMERS.find(c => c.value === formData.customerId);
    const { subtotal, tax, total } = calculateTotals(formData.items);
    
    const newInvoice: Invoice = {
      id: formData.invoiceNumber,
      customerName: customer?.label || 'Unknown',
      customerId: formData.customerId,
      email: 'customer@example.com', // Mock
      issueDate: formData.issueDate,
      dueDate: formData.dueDate,
      items: formData.items,
      subtotal,
      tax,
      total,
      status: 'Pending',
      notes: formData.notes
    };

    setInvoices([newInvoice, ...invoices]);
    setIsCreateOpen(false);
    // Reset Form
    setFormData({
        customerId: '',
        invoiceNumber: `INV-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000)}`,
        issueDate: new Date().toISOString().split('T')[0],
        dueDate: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
        items: [{ id: 'item_1', description: '', quantity: 1, unitPrice: 0 }],
        notes: '',
        taxRate: 8
    });
  };

  const handleMarkPaid = () => {
      if (!selectedInvoice) return;
      setInvoices(prev => prev.map(inv => inv.id === selectedInvoice.id ? { ...inv, status: 'Paid' } : inv));
      setSelectedInvoice(prev => prev ? { ...prev, status: 'Paid' } : null);
  };

  const handleBulkAction = (action: string) => {
      if (action === 'Delete') {
          if (confirm(`Delete ${selectedIds.size} invoices?`)) {
              setInvoices(prev => prev.filter(i => !selectedIds.has(i.id)));
              setSelectedIds(new Set());
          }
      } else {
          alert(`${action} triggered for ${selectedIds.size} invoices.`);
          setSelectedIds(new Set());
      }
  };

  const handleSelect = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedIds(newSet);
  };

  const handleSelectAll = () => {
    if (selectedIds.size === filteredInvoices.length) setSelectedIds(new Set());
    else setSelectedIds(new Set(filteredInvoices.map(i => i.id)));
  };

  // --- Filters ---
  const filteredInvoices = useMemo(() => {
    return invoices.filter(inv => {
      const matchSearch = inv.id.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          inv.customerName.toLowerCase().includes(searchQuery.toLowerCase());
      const matchStatus = statusFilter === 'All' || inv.status === statusFilter;
      
      const invDate = new Date(inv.issueDate).getTime();
      const matchStart = dateRange.start ? invDate >= new Date(dateRange.start).getTime() : true;
      const matchEnd = dateRange.end ? invDate <= new Date(dateRange.end).getTime() : true;

      return matchSearch && matchStatus && matchStart && matchEnd;
    });
  }, [invoices, searchQuery, statusFilter, dateRange]);

  const getStatusColor = (status: InvoiceStatus) => {
      switch(status) {
          case 'Paid': return 'text-success bg-success/10 border-success/20';
          case 'Pending': return 'text-info bg-info/10 border-info/20';
          case 'Overdue': return 'text-danger bg-danger/10 border-danger/20';
          case 'Cancelled': return 'text-zinc-muted bg-white/5 border-white/10';
      }
  };

  return (
    <div className="h-[calc(100vh-100px)] flex flex-col space-y-6 animate-fade-up">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 shrink-0">
            <div>
                <div className="flex items-center gap-2 mb-1">
                    <FileText className="w-5 h-5 text-brand" />
                    <h1 className="text-2xl font-black text-zinc-text uppercase italic tracking-tighter">Invoices</h1>
                </div>
                <p className="text-[10px] font-black text-zinc-muted uppercase tracking-[0.3em] mt-1">Billing and payment requests</p>
            </div>
            <div className="flex gap-2">
                <AmberButton variant="ghost" size="sm">
                    <Download className="w-3.5 h-3.5 mr-2" /> Export
                </AmberButton>
                <AmberButton size="sm" onClick={() => setIsCreateOpen(true)}>
                    <Plus className="w-3.5 h-3.5 mr-2" /> Create Invoice
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
                        placeholder="Search Invoice #, Customer..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full h-10 bg-obsidian-outer border border-white/5 rounded-sm pl-10 pr-4 text-xs font-bold text-zinc-text outline-none focus:border-brand/30 transition-all"
                    />
                </div>
            </div>
            <AmberDropdown 
                label="Status"
                options={['All', 'Paid', 'Pending', 'Overdue', 'Cancelled'].map(s => ({label: s, value: s}))}
                value={statusFilter}
                onChange={setStatusFilter}
                className="w-full xl:w-40"
            />
            <div className="flex gap-2 w-full xl:w-auto">
               <div className="space-y-1.5 flex-1">
                  <label className="text-[9px] font-black text-zinc-muted uppercase tracking-widest px-1">From</label>
                  <input type="date" className="h-10 w-full bg-obsidian-outer border border-white/5 rounded-sm px-3 text-xs font-bold text-zinc-text outline-none focus:border-brand/30" value={dateRange.start} onChange={(e) => setDateRange({...dateRange, start: e.target.value})} />
               </div>
               <div className="space-y-1.5 flex-1">
                  <label className="text-[9px] font-black text-zinc-muted uppercase tracking-widest px-1">To</label>
                  <input type="date" className="h-10 w-full bg-obsidian-outer border border-white/5 rounded-sm px-3 text-xs font-bold text-zinc-text outline-none focus:border-brand/30" value={dateRange.end} onChange={(e) => setDateRange({...dateRange, end: e.target.value})} />
               </div>
            </div>
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
                <button onClick={() => handleBulkAction('Remind')} className="p-2 text-zinc-muted hover:text-brand transition-colors rounded-full hover:bg-white/5" title="Send Reminder">
                    <Mail className="w-4 h-4" />
                </button>
                <button onClick={() => handleBulkAction('Print')} className="p-2 text-zinc-muted hover:text-info transition-colors rounded-full hover:bg-white/5" title="Print">
                    <Printer className="w-4 h-4" />
                </button>
                <button onClick={() => handleBulkAction('Delete')} className="p-2 text-zinc-muted hover:text-danger transition-colors rounded-full hover:bg-white/5" title="Delete">
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
                                    {selectedIds.size > 0 && selectedIds.size === filteredInvoices.length ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
                                </button>
                            </th>
                            <th className="px-6 py-4">Invoice #</th>
                            <th className="px-6 py-4">Customer</th>
                            <th className="px-6 py-4">Issue Date</th>
                            <th className="px-6 py-4">Due Date</th>
                            <th className="px-6 py-4 text-right">Amount</th>
                            <th className="px-6 py-4 text-center">Status</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.03]">
                        {filteredInvoices.map(inv => (
                            <tr key={inv.id} className={cn("hover:bg-white/[0.02] transition-colors group", selectedIds.has(inv.id) && "bg-brand/[0.03]")}>
                                <td className="px-6 py-4 text-center">
                                    <button onClick={() => handleSelect(inv.id)} className={cn("transition-colors", selectedIds.has(inv.id) ? "text-brand" : "text-zinc-muted")}>
                                        {selectedIds.has(inv.id) ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
                                    </button>
                                </td>
                                <td className="px-6 py-4">
                                    <span 
                                        className="text-xs font-mono font-bold text-zinc-text group-hover:text-brand transition-colors cursor-pointer"
                                        onClick={() => { setSelectedInvoice(inv); setIsDetailOpen(true); }}
                                    >
                                        {inv.id}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex flex-col">
                                        <span className="text-xs font-bold text-zinc-text">{inv.customerName}</span>
                                        <span className="text-[9px] font-mono text-zinc-muted">{inv.customerId}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-[10px] font-bold text-zinc-muted">{inv.issueDate}</td>
                                <td className={cn("px-6 py-4 text-[10px] font-bold", inv.status === 'Overdue' ? "text-danger" : "text-zinc-secondary")}>
                                    {inv.dueDate}
                                </td>
                                <td className="px-6 py-4 text-right font-mono text-xs font-bold text-zinc-text">${inv.total.toLocaleString()}</td>
                                <td className="px-6 py-4 text-center">
                                    <span className={cn("text-[9px] font-black px-2 py-0.5 rounded-sm border uppercase tracking-widest", getStatusColor(inv.status))}>
                                        {inv.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button onClick={() => { setSelectedInvoice(inv); setIsDetailOpen(true); }} className="p-1.5 hover:bg-white/5 rounded-sm text-zinc-muted hover:text-zinc-text transition-colors">
                                        <MoreVertical className="w-4 h-4" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </AmberCard>

        {/* Create Invoice SlideOver */}
        <AmberSlideOver
            isOpen={isCreateOpen}
            onClose={() => setIsCreateOpen(false)}
            title="Create Invoice"
            description="Draft a new billing document."
            footer={
                <div className="flex justify-between w-full">
                    <AmberButton variant="ghost" onClick={() => setIsCreateOpen(false)}>Cancel</AmberButton>
                    <AmberButton onClick={handleSaveInvoice}>Save Invoice</AmberButton>
                </div>
            }
        >
            <div className="space-y-6">
                <div>
                    <label className="text-[9px] font-black text-zinc-muted uppercase tracking-widest px-1 mb-1.5 block">Customer</label>
                    <AmberAutocomplete 
                        options={CUSTOMERS}
                        value={formData.customerId}
                        onChange={(val) => setFormData({...formData, customerId: val})}
                        placeholder="Search Debtor..."
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <AmberInput 
                        label="Invoice Number"
                        value={formData.invoiceNumber}
                        onChange={(e) => setFormData({...formData, invoiceNumber: e.target.value})}
                    />
                     <div>
                        <label className="text-[9px] font-black text-zinc-muted uppercase tracking-widest px-1 mb-1.5 block">Due Date</label>
                        <input type="date" className="h-11 w-full bg-obsidian-outer border border-white/5 rounded-sm px-4 text-xs font-bold text-zinc-text outline-none focus:border-brand/30" value={formData.dueDate} onChange={(e) => setFormData({...formData, dueDate: e.target.value})} />
                     </div>
                </div>

                <div className="space-y-3 pt-4 border-t border-white/5">
                    <div className="flex justify-between items-center">
                        <h4 className="text-[10px] font-black text-zinc-text uppercase tracking-widest">Line Items</h4>
                        <button onClick={handleAddItem} className="text-[9px] font-bold text-brand hover:underline uppercase tracking-widest">+ Add Item</button>
                    </div>
                    {formData.items.map((item, idx) => (
                        <div key={item.id} className="p-3 bg-obsidian-outer border border-white/5 rounded-sm space-y-2">
                            <div className="flex justify-between items-center mb-1">
                                <span className="text-[9px] font-black text-zinc-muted uppercase">Item {idx + 1}</span>
                                {formData.items.length > 1 && (
                                    <button onClick={() => handleRemoveItem(item.id)} className="text-zinc-muted hover:text-danger"><XCircle className="w-3.5 h-3.5" /></button>
                                )}
                            </div>
                            <input 
                                type="text" 
                                placeholder="Description" 
                                className="w-full bg-transparent border-b border-white/10 text-xs font-medium text-zinc-text outline-none pb-1 mb-2 focus:border-brand/30"
                                value={item.description}
                                onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                            />
                            <div className="flex gap-4">
                                <div className="flex-1">
                                    <label className="text-[8px] font-bold text-zinc-muted uppercase block">Qty</label>
                                    <input 
                                        type="number" 
                                        className="w-full bg-transparent border-b border-white/10 text-xs font-mono text-zinc-text outline-none focus:border-brand/30"
                                        value={item.quantity}
                                        onChange={(e) => updateItem(item.id, 'quantity', parseInt(e.target.value))}
                                    />
                                </div>
                                <div className="flex-1">
                                    <label className="text-[8px] font-bold text-zinc-muted uppercase block">Price</label>
                                    <input 
                                        type="number" 
                                        className="w-full bg-transparent border-b border-white/10 text-xs font-mono text-zinc-text outline-none focus:border-brand/30"
                                        value={item.unitPrice}
                                        onChange={(e) => updateItem(item.id, 'unitPrice', parseFloat(e.target.value))}
                                    />
                                </div>
                                <div className="text-right w-20">
                                    <label className="text-[8px] font-bold text-zinc-muted uppercase block">Total</label>
                                    <span className="text-xs font-bold text-zinc-text">${(item.quantity * item.unitPrice).toFixed(2)}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="flex justify-end pt-4 border-t border-white/5">
                    <div className="w-48 space-y-2 text-right">
                        <div className="flex justify-between text-xs text-zinc-secondary">
                            <span>Subtotal</span>
                            <span>${calculateTotals(formData.items).subtotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-xs text-zinc-secondary">
                            <span>Tax ({formData.taxRate}%)</span>
                            <span>${calculateTotals(formData.items).tax.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm font-black text-zinc-text border-t border-white/10 pt-2">
                            <span>Total</span>
                            <span>${calculateTotals(formData.items).total.toFixed(2)}</span>
                        </div>
                    </div>
                </div>

                <AmberInput 
                   label="Notes"
                   multiline
                   rows={3}
                   placeholder="Payment instructions..."
                   value={formData.notes}
                   onChange={(e) => setFormData({...formData, notes: e.target.value})}
                />
            </div>
        </AmberSlideOver>

        {/* Invoice Detail SlideOver */}
        <AmberSlideOver
            isOpen={isDetailOpen}
            onClose={() => setIsDetailOpen(false)}
            title={selectedInvoice ? `Invoice ${selectedInvoice.id}` : ''}
            description={selectedInvoice ? `For ${selectedInvoice.customerName}` : ''}
            footer={
                <div className="flex justify-between w-full">
                    <AmberButton variant="ghost" onClick={() => setIsDetailOpen(false)}>Close</AmberButton>
                    <div className="flex gap-2">
                        <AmberButton variant="secondary" onClick={() => alert('Download PDF')}><Download className="w-3.5 h-3.5 mr-2" /> PDF</AmberButton>
                        {selectedInvoice && selectedInvoice.status !== 'Paid' && (
                            <AmberButton onClick={handleMarkPaid}>Mark as Paid</AmberButton>
                        )}
                    </div>
                </div>
            }
        >
            {selectedInvoice && (
                <div className="space-y-8">
                    {/* Status Banner */}
                    <div className={cn("p-4 border rounded-sm flex items-center justify-between", getStatusColor(selectedInvoice.status))}>
                        <div className="flex items-center gap-2">
                            {selectedInvoice.status === 'Paid' ? <CheckCircle2 className="w-5 h-5" /> : 
                             selectedInvoice.status === 'Overdue' ? <AlertCircle className="w-5 h-5" /> : 
                             <Clock className="w-5 h-5" />}
                            <span className="text-sm font-black uppercase tracking-tight">{selectedInvoice.status}</span>
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-widest">Due {selectedInvoice.dueDate}</span>
                    </div>

                    <div className="p-4 bg-obsidian-outer border border-white/5 rounded-sm flex justify-between items-start">
                        <div>
                            <p className="text-[9px] font-black text-zinc-muted uppercase tracking-widest mb-1">Billed To</p>
                            <p className="text-sm font-bold text-zinc-text">{selectedInvoice.customerName}</p>
                            <p className="text-xs text-zinc-secondary">{selectedInvoice.email}</p>
                        </div>
                        <div className="text-right">
                             <p className="text-[9px] font-black text-zinc-muted uppercase tracking-widest mb-1">Issue Date</p>
                             <p className="text-xs font-mono text-zinc-text">{selectedInvoice.issueDate}</p>
                        </div>
                    </div>

                    <div>
                        <h4 className="text-[10px] font-black text-zinc-text uppercase tracking-widest border-b border-white/5 pb-2 mb-4">Line Items</h4>
                        <div className="space-y-2">
                            {selectedInvoice.items.map(item => (
                                <div key={item.id} className="flex justify-between items-center p-3 bg-white/[0.02] border border-white/5 rounded-sm">
                                    <div>
                                        <p className="text-xs font-bold text-zinc-text">{item.description}</p>
                                        <p className="text-[9px] text-zinc-muted">Qty: {item.quantity} x ${item.unitPrice}</p>
                                    </div>
                                    <p className="text-sm font-bold text-zinc-text font-mono">${(item.quantity * item.unitPrice).toFixed(2)}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex justify-end pt-4 border-t border-white/5">
                        <div className="w-48 space-y-2 text-right">
                            <div className="flex justify-between text-xs text-zinc-secondary">
                                <span>Subtotal</span>
                                <span>${selectedInvoice.subtotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-xs text-zinc-secondary">
                                <span>Tax</span>
                                <span>${selectedInvoice.tax.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-lg font-black text-zinc-text border-t border-white/10 pt-2">
                                <span>Total</span>
                                <span>${selectedInvoice.total.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>

                    {selectedInvoice.notes && (
                        <div className="p-4 bg-yellow-500/5 border border-yellow-500/10 rounded-sm">
                            <h4 className="text-[9px] font-black text-yellow-500 uppercase tracking-widest mb-1">Notes</h4>
                            <p className="text-xs text-zinc-secondary italic">{selectedInvoice.notes}</p>
                        </div>
                    )}
                </div>
            )}
        </AmberSlideOver>
    </div>
  );
};
