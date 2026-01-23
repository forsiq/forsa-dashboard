
import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { AmberCard } from '../../../amber-ui/components/AmberCard';
import { AmberButton } from '../../../amber-ui/components/AmberButton';
import { AmberInput } from '../../../amber-ui/components/AmberInput';
import { AmberDropdown } from '../../../amber-ui/components/AmberDropdown';
import { AmberSlideOver } from '../../../amber-ui/components/AmberSlideOver';
import { 
  Users, 
  Search, 
  Filter, 
  Download, 
  Plus, 
  MoreVertical, 
  CheckSquare, 
  Square,
  Mail,
  Phone,
  Building2,
  Trash2,
  Tag,
  Briefcase,
  History,
  FileText,
  Calendar,
  DollarSign,
  X,
  Edit,
  ArrowRight,
  Eye,
  UploadCloud
} from 'lucide-react';
import { cn } from '../../../lib/cn';
import { paths } from '../../../routes/paths';

// --- Types ---
interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  status: 'Active' | 'Lead' | 'Inactive' | 'Churned';
  segment: 'Enterprise' | 'SMB' | 'Partner';
  ltv: number;
  lastContact: string;
  avatar: string;
  tags: string[];
}

// --- Mock Data ---
const MOCK_CUSTOMERS: Customer[] = Array.from({ length: 18 }).map((_, i) => ({
  id: `CUST-${1000 + i}`,
  name: ['Alex Morgan', 'Sarah Chen', 'James Wilson', 'Maria Garcia', 'David Kim', 'Emma Watson'][i % 6],
  email: `contact${i}@example.com`,
  phone: `+1 (555) 012-${3450 + i}`,
  company: ['Acme Corp', 'Globex Inc', 'Soylent Corp', 'Initech', 'Stark Ind'][i % 5],
  status: ['Active', 'Lead', 'Active', 'Inactive', 'Churned'][i % 5] as any,
  segment: ['Enterprise', 'SMB', 'Partner'][i % 3] as any,
  ltv: Math.floor(Math.random() * 50000) + 1000,
  lastContact: new Date(Date.now() - Math.floor(Math.random() * 1000000000)).toISOString().split('T')[0],
  avatar: ['AM', 'SC', 'JW', 'MG', 'DK', 'EW'][i % 6],
  tags: i % 2 === 0 ? ['VIP', 'New'] : ['Recurring']
}));

export const Customers = () => {
  const navigate = useNavigate();
  // State
  const [customers, setCustomers] = useState<Customer[]>(MOCK_CUSTOMERS);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [segmentFilter, setSegmentFilter] = useState('All');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  
  // SlideOver State
  const [isSlideOpen, setIsSlideOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'deals' | 'history'>('overview');
  
  // Create Form State
  const [createForm, setCreateForm] = useState<Partial<Customer>>({
    name: '',
    email: '',
    company: '',
    status: 'Lead',
    segment: 'SMB'
  });

  // Derived Data
  const filteredCustomers = useMemo(() => {
    return customers.filter(c => {
      const matchesSearch = 
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.company.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = statusFilter === 'All' || c.status === statusFilter;
      const matchesSegment = segmentFilter === 'All' || c.segment === segmentFilter;

      return matchesSearch && matchesStatus && matchesSegment;
    });
  }, [customers, searchQuery, statusFilter, segmentFilter]);

  // Handlers
  const toggleSelect = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedIds(newSet);
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredCustomers.length) setSelectedIds(new Set());
    else setSelectedIds(new Set(filteredCustomers.map(c => c.id)));
  };

  const handleCreate = () => {
    const newCust: Customer = {
        id: `CUST-${Math.floor(Math.random() * 10000)}`,
        name: createForm.name || 'New Customer',
        email: createForm.email || '',
        phone: '',
        company: createForm.company || '',
        status: (createForm.status as any) || 'Lead',
        segment: (createForm.segment as any) || 'SMB',
        ltv: 0,
        lastContact: new Date().toISOString().split('T')[0],
        avatar: (createForm.name || 'NC').substring(0, 2).toUpperCase(),
        tags: []
    };
    setCustomers([newCust, ...customers]);
    setIsSlideOpen(false);
    setCreateForm({ name: '', email: '', company: '', status: 'Lead', segment: 'SMB' });
  };

  const handleBulkAction = (action: string) => {
    if (action === 'Delete') {
        if (confirm(`Delete ${selectedIds.size} customers?`)) {
            setCustomers(prev => prev.filter(c => !selectedIds.has(c.id)));
            setSelectedIds(new Set());
        }
    } else {
        alert(`${action} applied to ${selectedIds.size} customers.`);
        setSelectedIds(new Set());
    }
  };

  const openCreate = () => {
      setSelectedCustomer(null);
      setIsSlideOpen(true);
  };

  const openDetails = (c: Customer) => {
      setSelectedCustomer(c);
      setActiveTab('overview');
      setIsSlideOpen(true);
  };

  const navigateToFullDetails = (id: string) => {
      navigate(`/crm/customers/${id}`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'text-success bg-success/10 border-success/20';
      case 'Lead': return 'text-info bg-info/10 border-info/20';
      case 'Inactive': return 'text-zinc-muted bg-white/5 border-white/10';
      case 'Churned': return 'text-danger bg-danger/10 border-danger/20';
      default: return 'text-zinc-muted';
    }
  };

  return (
    <div className="animate-fade-up space-y-6 min-h-[calc(100vh-100px)] flex flex-col">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
             <Users className="w-5 h-5 text-brand" />
             <h1 className="text-2xl font-black text-zinc-text uppercase italic tracking-tighter">Customer Base</h1>
          </div>
          <p className="text-[10px] font-black text-zinc-muted uppercase tracking-[0.3em] mt-1">Manage relationships and accounts</p>
        </div>
        <div className="flex gap-2">
          <AmberButton variant="ghost" size="sm" onClick={() => navigate(paths.crmImport)}>
            <UploadCloud className="w-3.5 h-3.5 mr-2" /> Import
          </AmberButton>
          <AmberButton variant="ghost" size="sm">
            <Download className="w-3.5 h-3.5 mr-2" /> Export
          </AmberButton>
          <AmberButton size="sm" onClick={openCreate}>
            <Plus className="w-3.5 h-3.5 mr-2" /> Add Customer
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
              placeholder="Search Name, Email, Company..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 bg-obsidian-outer border border-white/5 rounded-sm pl-10 pr-4 text-xs font-bold text-zinc-text outline-none focus:border-brand/30 transition-all placeholder:text-zinc-muted/50"
            />
          </div>
        </div>
        
        <AmberDropdown 
          label="Status"
          options={['All', 'Active', 'Lead', 'Inactive', 'Churned'].map(s => ({label: s, value: s}))}
          value={statusFilter}
          onChange={setStatusFilter}
          className="w-full xl:w-40"
        />

        <AmberDropdown 
          label="Segment"
          options={['All', 'Enterprise', 'SMB', 'Partner'].map(s => ({label: s, value: s}))}
          value={segmentFilter}
          onChange={setSegmentFilter}
          className="w-full xl:w-40"
        />
        
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
            <button onClick={() => handleBulkAction('Tag')} className="p-2 text-zinc-muted hover:text-info transition-colors rounded-full hover:bg-white/5" title="Add Tag">
               <Tag className="w-4 h-4" />
            </button>
            <button onClick={() => handleBulkAction('Email')} className="p-2 text-zinc-muted hover:text-brand transition-colors rounded-full hover:bg-white/5" title="Email">
               <Mail className="w-4 h-4" />
            </button>
            <button onClick={() => handleBulkAction('Delete')} className="p-2 text-zinc-muted hover:text-danger transition-colors rounded-full hover:bg-white/5" title="Delete">
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
                    {selectedIds.size > 0 && selectedIds.size === filteredCustomers.length ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
                  </button>
                </th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Contact</th>
                <th className="px-6 py-4">Company</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">LTV</th>
                <th className="px-6 py-4">Last Contact</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.03]">
              {filteredCustomers.map((c) => (
                <tr key={c.id} className={cn("hover:bg-white/[0.02] transition-colors group", selectedIds.has(c.id) && "bg-brand/[0.03]")}>
                  <td className="px-6 py-4 text-center">
                    <button onClick={() => toggleSelect(c.id)} className={cn("transition-colors", selectedIds.has(c.id) ? "text-brand" : "text-zinc-muted")}>
                      {selectedIds.has(c.id) ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
                    </button>
                  </td>
                  <td className="px-6 py-4">
                     <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigateToFullDetails(c.id)}>
                        <div className="w-8 h-8 rounded-full bg-obsidian-outer border border-white/10 flex items-center justify-center text-xs font-black text-zinc-muted">
                           {c.avatar}
                        </div>
                        <div>
                           <p className="text-xs font-bold text-zinc-text group-hover:text-brand transition-colors">{c.name}</p>
                           <p className="text-[9px] text-zinc-muted">{c.segment}</p>
                        </div>
                     </div>
                  </td>
                  <td className="px-6 py-4">
                     <div className="flex flex-col gap-1">
                        <span className="flex items-center gap-1.5 text-[10px] text-zinc-muted"><Mail className="w-3 h-3" /> {c.email}</span>
                        <span className="flex items-center gap-1.5 text-[10px] text-zinc-muted"><Phone className="w-3 h-3" /> {c.phone}</span>
                     </div>
                  </td>
                  <td className="px-6 py-4">
                     <div className="flex items-center gap-1.5 text-[10px] font-bold text-zinc-text">
                        <Building2 className="w-3.5 h-3.5 text-zinc-muted" /> {c.company}
                     </div>
                  </td>
                  <td className="px-6 py-4">
                     <span className={cn("text-[9px] font-black px-2 py-0.5 rounded-sm border uppercase tracking-widest", getStatusColor(c.status))}>
                        {c.status}
                     </span>
                  </td>
                  <td className="px-6 py-4 text-xs font-bold text-zinc-text">${c.ltv.toLocaleString()}</td>
                  <td className="px-6 py-4 text-[10px] font-mono text-zinc-muted">{c.lastContact}</td>
                  <td className="px-6 py-4 text-right">
                     <button onClick={() => openDetails(c)} className="p-1.5 text-zinc-muted hover:text-zinc-text hover:bg-white/5 rounded-sm transition-colors">
                        <MoreVertical className="w-4 h-4" />
                     </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </AmberCard>

      {/* Details SlideOver */}
      <AmberSlideOver
        isOpen={isSlideOpen}
        onClose={() => setIsSlideOpen(false)}
        title={selectedCustomer ? selectedCustomer.name : "New Customer"}
        description={selectedCustomer ? selectedCustomer.company : "Add a new record to the database."}
        footer={
           selectedCustomer ? (
              <div className="flex gap-2 justify-end w-full">
                 <AmberButton variant="secondary" onClick={() => setIsSlideOpen(false)}>Close</AmberButton>
                 <AmberButton onClick={() => navigateToFullDetails(selectedCustomer.id)}>
                    <Eye className="w-3.5 h-3.5 mr-2" /> View Full Profile
                 </AmberButton>
              </div>
           ) : (
              <div className="flex gap-2 justify-end w-full">
                 <AmberButton variant="ghost" onClick={() => setIsSlideOpen(false)}>Cancel</AmberButton>
                 <AmberButton onClick={handleCreate}>Create Record</AmberButton>
              </div>
           )
        }
      >
         {selectedCustomer ? (
            <div className="space-y-6">
               {/* Quick Info Card */}
               <div className="p-4 bg-obsidian-outer/50 border border-white/5 rounded-sm flex flex-col gap-4">
                  <div className="flex justify-between items-start">
                     <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-brand/10 border border-brand/20 flex items-center justify-center text-lg font-black text-brand">
                           {selectedCustomer.avatar}
                        </div>
                        <div>
                           <h3 className="text-sm font-black text-zinc-text uppercase tracking-tight">{selectedCustomer.name}</h3>
                           <p className="text-[10px] font-bold text-zinc-muted uppercase tracking-widest">{selectedCustomer.company} • {selectedCustomer.segment}</p>
                        </div>
                     </div>
                     <span className={cn("text-[9px] font-black px-2 py-0.5 rounded-sm border uppercase tracking-widest", getStatusColor(selectedCustomer.status))}>
                        {selectedCustomer.status}
                     </span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 pt-2 border-t border-white/5">
                     <div className="text-[10px]">
                        <span className="text-zinc-muted block uppercase tracking-wider mb-0.5">Email</span>
                        <span className="text-zinc-text font-bold">{selectedCustomer.email}</span>
                     </div>
                     <div className="text-[10px]">
                        <span className="text-zinc-muted block uppercase tracking-wider mb-0.5">Phone</span>
                        <span className="text-zinc-text font-bold">{selectedCustomer.phone}</span>
                     </div>
                  </div>
               </div>

               {/* Tabs */}
               <div className="flex border-b border-white/5 gap-6">
                  {['overview', 'deals', 'history'].map(tab => (
                     <button
                        key={tab}
                        onClick={() => setActiveTab(tab as any)}
                        className={cn(
                           "pb-3 text-[10px] font-black uppercase tracking-widest transition-all border-b-2 capitalize",
                           activeTab === tab ? "border-brand text-brand" : "border-transparent text-zinc-muted hover:text-zinc-text"
                        )}
                     >
                        {tab}
                     </button>
                  ))}
               </div>

               {/* Tab Content */}
               <div className="min-h-[200px]">
                  {activeTab === 'overview' && (
                     <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
                        <div className="grid grid-cols-2 gap-4">
                           <div className="p-4 bg-white/[0.02] border border-white/5 rounded-sm">
                              <p className="text-[9px] font-black text-zinc-muted uppercase tracking-widest mb-1">Lifetime Value</p>
                              <p className="text-xl font-black text-success">${selectedCustomer.ltv.toLocaleString()}</p>
                           </div>
                           <div className="p-4 bg-white/[0.02] border border-white/5 rounded-sm">
                              <p className="text-[9px] font-black text-zinc-muted uppercase tracking-widest mb-1">Last Contact</p>
                              <p className="text-sm font-bold text-zinc-text">{selectedCustomer.lastContact}</p>
                           </div>
                        </div>
                        <div className="space-y-2">
                           <h4 className="text-[10px] font-black text-zinc-text uppercase tracking-widest flex items-center gap-2"><Tag className="w-3 h-3" /> Tags</h4>
                           <div className="flex flex-wrap gap-2">
                              {selectedCustomer.tags.map(tag => (
                                 <span key={tag} className="px-2 py-1 bg-brand/10 border border-brand/20 text-brand rounded-sm text-[9px] font-bold uppercase">{tag}</span>
                              ))}
                              <button className="px-2 py-1 border border-dashed border-white/10 text-zinc-muted rounded-sm text-[9px] hover:text-zinc-text hover:border-white/20 transition-all">+ Add</button>
                           </div>
                        </div>
                     </div>
                  )}

                  {activeTab === 'deals' && (
                     <div className="space-y-3 animate-in fade-in slide-in-from-right-4">
                        <div className="flex items-center justify-between p-3 bg-white/[0.02] border border-white/5 rounded-sm">
                           <div className="flex items-center gap-3">
                              <div className="p-2 bg-brand/10 rounded-sm text-brand"><Briefcase className="w-4 h-4" /></div>
                              <div>
                                 <p className="text-xs font-bold text-zinc-text">Q3 Expansion Contract</p>
                                 <p className="text-[9px] text-zinc-muted">Closed Won • $45,000</p>
                              </div>
                           </div>
                           <ArrowRight className="w-4 h-4 text-zinc-muted" />
                        </div>
                     </div>
                  )}

                  {activeTab === 'history' && (
                     <div className="space-y-4 animate-in fade-in slide-in-from-right-4 pl-2">
                        <div className="relative pl-6 pb-4 border-l border-white/10">
                           <div className="absolute left-[-5px] top-0 w-2.5 h-2.5 rounded-full bg-brand border-2 border-obsidian-panel" />
                           <p className="text-xs font-bold text-zinc-text">Email Sent</p>
                           <p className="text-[10px] text-zinc-muted mt-0.5">Follow-up on proposal #4421</p>
                           <span className="text-[9px] font-mono text-zinc-muted/60 mt-1 block">2 hours ago</span>
                        </div>
                        <div className="relative pl-6 pb-4 border-l border-white/10">
                           <div className="absolute left-[-5px] top-0 w-2.5 h-2.5 rounded-full bg-zinc-muted border-2 border-obsidian-panel" />
                           <p className="text-xs font-bold text-zinc-text">Meeting Scheduled</p>
                           <p className="text-[10px] text-zinc-muted mt-0.5">Demo with engineering team</p>
                           <span className="text-[9px] font-mono text-zinc-muted/60 mt-1 block">Yesterday</span>
                        </div>
                     </div>
                  )}
               </div>
            </div>
         ) : (
            // Create Form
            <div className="space-y-6">
               <AmberInput 
                  label="Full Name"
                  placeholder="e.g. John Doe"
                  value={createForm.name}
                  onChange={(e) => setCreateForm({...createForm, name: e.target.value})}
               />
               <AmberInput 
                  label="Email Address"
                  placeholder="john@company.com"
                  value={createForm.email}
                  onChange={(e) => setCreateForm({...createForm, email: e.target.value})}
               />
               <AmberInput 
                  label="Company"
                  placeholder="Company Inc."
                  value={createForm.company}
                  onChange={(e) => setCreateForm({...createForm, company: e.target.value})}
               />
               <div className="grid grid-cols-2 gap-4">
                  <div>
                     <label className="text-[9px] font-black text-zinc-muted uppercase tracking-widest px-1 mb-1.5 block">Status</label>
                     <AmberDropdown 
                        options={['Lead', 'Active', 'Inactive'].map(v => ({label: v, value: v}))}
                        value={createForm.status as string}
                        onChange={(val) => setCreateForm({...createForm, status: val as any})}
                        className="w-full"
                     />
                  </div>
                  <div>
                     <label className="text-[9px] font-black text-zinc-muted uppercase tracking-widest px-1 mb-1.5 block">Segment</label>
                     <AmberDropdown 
                        options={['SMB', 'Enterprise', 'Partner'].map(v => ({label: v, value: v}))}
                        value={createForm.segment as string}
                        onChange={(val) => setCreateForm({...createForm, segment: val as any})}
                        className="w-full"
                     />
                  </div>
               </div>
            </div>
         )}
      </AmberSlideOver>
    </div>
  );
};
