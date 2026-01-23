
import React, { useState, useMemo } from 'react';
import { AmberCard } from '../../../amber-ui/components/AmberCard';
import { AmberButton } from '../../../amber-ui/components/AmberButton';
import { AmberInput } from '../../../amber-ui/components/AmberInput';
import { AmberDropdown } from '../../../amber-ui/components/AmberDropdown';
import { AmberSlideOver } from '../../../amber-ui/components/AmberSlideOver';
import { 
  Truck, 
  Search, 
  Filter, 
  Plus, 
  MoreVertical, 
  Edit, 
  Trash2, 
  Phone, 
  Mail, 
  MapPin, 
  Building2,
  FileText,
  CreditCard
} from 'lucide-react';
import { cn } from '../../../lib/cn';

// --- Types ---
interface Vendor {
  id: string;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  taxId: string;
  paymentTerms: string;
  productsCount: number;
  status: 'Active' | 'Inactive' | 'On Hold';
  notes?: string;
}

// --- Mock Data ---
const MOCK_VENDORS: Vendor[] = [
  { id: 'V-001', name: 'Global Electronics Supply', contactPerson: 'John Smith', email: 'orders@globalelec.com', phone: '+1 555-0192', address: '123 Tech Blvd, San Jose, CA', taxId: 'TAX-9921-X', paymentTerms: 'Net 30', productsCount: 142, status: 'Active' },
  { id: 'V-002', name: 'Fabric World Inc.', contactPerson: 'Maria Rodriguez', email: 'maria@fabricworld.com', phone: '+1 555-3341', address: '45 Fashion Ave, New York, NY', taxId: 'TAX-3321-Y', paymentTerms: 'Net 60', productsCount: 85, status: 'Active' },
  { id: 'V-003', name: 'Precision Components Ltd', contactPerson: 'David Chen', email: 'd.chen@precision.io', phone: '+86 21 5555 1234', address: '88 Industry Rd, Shanghai', taxId: 'CN-8821', paymentTerms: 'Immediate', productsCount: 310, status: 'On Hold' },
  { id: 'V-004', name: 'Office Depot Partners', contactPerson: 'Sarah Connor', email: 's.connor@officedepot.corp', phone: '+1 555-9988', address: '900 Business Pkwy, Austin, TX', taxId: 'TAX-1100-Z', paymentTerms: 'Net 30', productsCount: 24, status: 'Inactive' },
];

export const Vendors = () => {
  // -- State --
  const [vendors, setVendors] = useState<Vendor[]>(MOCK_VENDORS);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  
  // SlideOver State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Vendor>>({
    name: '',
    contactPerson: '',
    email: '',
    phone: '',
    address: '',
    taxId: '',
    paymentTerms: 'Net 30',
    status: 'Active',
    notes: ''
  });

  // -- Pagination --
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // -- Helpers --
  const filteredVendors = useMemo(() => {
    return vendors.filter(v => {
      const matchesSearch = v.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            v.contactPerson.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'All' || v.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [vendors, searchQuery, statusFilter]);

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredVendors.slice(start, start + itemsPerPage);
  }, [filteredVendors, currentPage]);

  const totalPages = Math.ceil(filteredVendors.length / itemsPerPage);

  const handleSave = () => {
    if (!formData.name) return;

    if (editingId) {
      setVendors(vendors.map(v => v.id === editingId ? { ...v, ...formData } as Vendor : v));
    } else {
      const newVendor: Vendor = {
        id: `V-${Math.floor(Math.random() * 10000)}`,
        name: formData.name,
        contactPerson: formData.contactPerson || '',
        email: formData.email || '',
        phone: formData.phone || '',
        address: formData.address || '',
        taxId: formData.taxId || '',
        paymentTerms: formData.paymentTerms || 'Net 30',
        productsCount: 0,
        status: (formData.status as any) || 'Active',
        notes: formData.notes
      };
      setVendors([newVendor, ...vendors]);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this vendor? This action cannot be undone.')) {
      setVendors(vendors.filter(v => v.id !== id));
    }
  };

  const openAddModal = () => {
    setEditingId(null);
    setFormData({
      name: '',
      contactPerson: '',
      email: '',
      phone: '',
      address: '',
      taxId: '',
      paymentTerms: 'Net 30',
      status: 'Active',
      notes: ''
    });
    setIsModalOpen(true);
  };

  const openEditModal = (vendor: Vendor) => {
    setEditingId(vendor.id);
    setFormData({ ...vendor });
    setIsModalOpen(true);
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'Active': return 'text-success bg-success/10 border-success/20';
      case 'On Hold': return 'text-warning bg-warning/10 border-warning/20';
      case 'Inactive': return 'text-zinc-muted bg-white/5 border-white/10';
      default: return 'text-zinc-muted';
    }
  };

  return (
    <div className="animate-fade-up space-y-8 min-h-[calc(100vh-100px)] flex flex-col">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
             <Truck className="w-5 h-5 text-brand" />
             <h1 className="text-2xl font-black text-zinc-text uppercase italic tracking-tighter">Vendors</h1>
          </div>
          <p className="text-[10px] font-black text-zinc-muted uppercase tracking-[0.3em] mt-1">Manage suppliers and partnerships</p>
        </div>
        <AmberButton size="sm" onClick={openAddModal}>
          <Plus className="w-4 h-4 mr-2" /> Add Vendor
        </AmberButton>
      </div>

      {/* Filter Bar */}
      <AmberCard noPadding className="p-4 flex flex-col lg:flex-row gap-4 items-end bg-obsidian-panel border-white/5 relative z-10">
        <div className="flex-1 w-full">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-muted" />
            <input 
              type="text" 
              placeholder="Search Vendors or Contacts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 bg-obsidian-outer border border-white/5 rounded-sm pl-10 pr-4 text-xs font-bold text-zinc-text outline-none focus:border-brand/30 transition-all placeholder:text-zinc-muted/50"
            />
          </div>
        </div>
        
        <AmberDropdown 
          label="Status"
          options={['All', 'Active', 'On Hold', 'Inactive'].map(s => ({label: s, value: s}))}
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
                <th className="px-6 py-4">Vendor Profile</th>
                <th className="px-6 py-4">Contact Person</th>
                <th className="px-6 py-4">Contact Info</th>
                <th className="px-6 py-4 text-center">Products</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.03]">
              {paginatedData.map((vendor) => (
                <tr key={vendor.id} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                       <div className="w-10 h-10 rounded-full bg-obsidian-outer border border-white/5 flex items-center justify-center text-xs font-black text-zinc-muted">
                          {vendor.name.substring(0, 2).toUpperCase()}
                       </div>
                       <div>
                          <p className="text-sm font-bold text-zinc-text group-hover:text-brand transition-colors">{vendor.name}</p>
                          <p className="text-[9px] font-mono text-zinc-muted mt-0.5">{vendor.taxId}</p>
                       </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-xs font-bold text-zinc-secondary">
                     {vendor.contactPerson}
                  </td>
                  <td className="px-6 py-4">
                     <div className="flex flex-col gap-1">
                        <span className="flex items-center gap-1.5 text-[10px] text-zinc-muted"><Mail className="w-3 h-3" /> {vendor.email}</span>
                        <span className="flex items-center gap-1.5 text-[10px] text-zinc-muted"><Phone className="w-3 h-3" /> {vendor.phone}</span>
                     </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                     <span className="text-xs font-bold text-zinc-text">{vendor.productsCount}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-sm border text-[9px] font-black uppercase tracking-widest",
                      getStatusColor(vendor.status)
                    )}>
                      {vendor.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                     <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => openEditModal(vendor)} className="p-2 bg-white/5 rounded-sm text-zinc-muted hover:text-brand transition-colors">
                           <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => handleDelete(vendor.id)} className="p-2 bg-white/5 rounded-sm text-zinc-muted hover:text-danger transition-colors">
                           <Trash2 className="w-3.5 h-3.5" />
                        </button>
                     </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="px-6 py-4 border-t border-white/5 bg-obsidian-outer/30 flex justify-between items-center">
           <p className="text-[10px] font-black text-zinc-muted uppercase tracking-[0.2em]">
             Showing {(currentPage - 1) * itemsPerPage + 1}-{Math.min(currentPage * itemsPerPage, filteredVendors.length)} of {filteredVendors.length}
           </p>
           <div className="flex gap-2">
              <button 
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                className="px-4 py-1.5 bg-obsidian-card border border-white/5 rounded-sm text-[10px] font-black text-zinc-muted hover:text-zinc-text uppercase tracking-widest disabled:opacity-50 transition-all"
              >
                Previous
              </button>
              <button 
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                className="px-4 py-1.5 bg-obsidian-card border border-white/5 rounded-sm text-[10px] font-black text-zinc-muted hover:text-zinc-text uppercase tracking-widest disabled:opacity-50 transition-all"
              >
                Next
              </button>
           </div>
        </div>
      </AmberCard>

      {/* Vendor Form SlideOver */}
      <AmberSlideOver
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingId ? "Edit Vendor" : "Add Vendor"}
        description="Manage supplier information and agreements."
        footer={
           <>
              <AmberButton variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</AmberButton>
              <AmberButton onClick={handleSave}>{editingId ? 'Save Changes' : 'Create Vendor'}</AmberButton>
           </>
        }
      >
         <div className="space-y-6">
            <AmberInput 
               label="Company Name"
               placeholder="e.g. Acme Supplies Ltd."
               value={formData.name}
               onChange={(e) => setFormData({...formData, name: e.target.value})}
               icon={<Building2 className="w-4 h-4" />}
               required
            />

            <div className="grid grid-cols-2 gap-4">
               <AmberInput 
                  label="Contact Person"
                  placeholder="Full Name"
                  value={formData.contactPerson}
                  onChange={(e) => setFormData({...formData, contactPerson: e.target.value})}
               />
               <AmberInput 
                  label="Tax ID / VAT"
                  placeholder="Optional"
                  value={formData.taxId}
                  onChange={(e) => setFormData({...formData, taxId: e.target.value})}
               />
            </div>

            <div className="p-4 bg-obsidian-outer/50 border border-white/5 rounded-sm space-y-4">
               <h4 className="text-[10px] font-black text-zinc-text uppercase tracking-widest flex items-center gap-2">
                  <Mail className="w-3 h-3" /> Contact Details
               </h4>
               <div className="grid grid-cols-2 gap-4">
                  <AmberInput 
                     label="Email"
                     type="email"
                     placeholder="vendor@example.com"
                     value={formData.email}
                     onChange={(e) => setFormData({...formData, email: e.target.value})}
                  />
                  <AmberInput 
                     label="Phone"
                     placeholder="+1..."
                     value={formData.phone}
                     onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  />
               </div>
               <AmberInput 
                  label="Address"
                  placeholder="Street, City, Country"
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  icon={<MapPin className="w-4 h-4" />}
               />
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div>
                  <label className="text-[9px] font-black text-zinc-muted uppercase tracking-widest px-1 mb-1.5 block">Payment Terms</label>
                  <AmberDropdown 
                     options={[{label: 'Net 30', value: 'Net 30'}, {label: 'Net 60', value: 'Net 60'}, {label: 'Immediate', value: 'Immediate'}, {label: 'Prepaid', value: 'Prepaid'}]}
                     value={formData.paymentTerms || 'Net 30'}
                     onChange={(val) => setFormData({...formData, paymentTerms: val})}
                     className="w-full"
                  />
               </div>
               <div>
                  <label className="text-[9px] font-black text-zinc-muted uppercase tracking-widest px-1 mb-1.5 block">Status</label>
                  <AmberDropdown 
                     options={[{label: 'Active', value: 'Active'}, {label: 'On Hold', value: 'On Hold'}, {label: 'Inactive', value: 'Inactive'}]}
                     value={formData.status || 'Active'}
                     onChange={(val) => setFormData({...formData, status: val as any})}
                     className="w-full"
                  />
               </div>
            </div>

            <AmberInput 
               label="Internal Notes"
               multiline
               rows={3}
               placeholder="Payment details, agreements, etc..."
               value={formData.notes}
               onChange={(e) => setFormData({...formData, notes: e.target.value})}
            />
         </div>
      </AmberSlideOver>
    </div>
  );
};
