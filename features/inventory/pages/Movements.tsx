
import React, { useState, useMemo } from 'react';
import { AmberCard } from '../../../amber-ui/components/AmberCard';
import { AmberButton } from '../../../amber-ui/components/AmberButton';
import { AmberInput } from '../../../amber-ui/components/AmberInput';
import { AmberDropdown } from '../../../amber-ui/components/AmberDropdown';
import { AmberSlideOver } from '../../../amber-ui/components/AmberSlideOver';
import { AmberAutocomplete } from '../../../amber-ui/components/AmberAutocomplete';
import { 
  ArrowRightLeft,
  ArrowDownRight,
  ArrowUpRight,
  RefreshCw,
  Search,
  Filter,
  Download,
  Plus,
  Calendar,
  Box,
  ChevronRight,
  ChevronDown
} from 'lucide-react';
import { cn } from '../../../lib/cn';

// --- Types ---
type MovementType = 'In' | 'Out' | 'Transfer' | 'Adjustment';

interface Movement {
  id: string;
  reference: string;
  type: MovementType;
  date: string;
  productName: string;
  sku: string;
  warehouseFrom?: string;
  warehouseTo?: string;
  quantity: number;
  user: string;
  notes?: string;
}

// --- Mock Data ---
const MOCK_PRODUCTS = [
  { label: 'Neural-Link Adapter (SKU-8001)', value: 'SKU-8001' },
  { label: 'Quantum Glass Screen (SKU-8002)', value: 'SKU-8002' },
  { label: 'Haptic Gloves (SKU-8003)', value: 'SKU-8003' },
  { label: 'Wireless Charger (SKU-8005)', value: 'SKU-8005' },
];

const MOCK_WAREHOUSES = [
  { label: 'US-East Distribution Center', value: 'WH-001' },
  { label: 'EU Central Hub', value: 'WH-002' },
  { label: 'APAC Regional Node', value: 'WH-003' },
  { label: 'West Coast Annex', value: 'WH-004' },
];

const INITIAL_MOVEMENTS: Movement[] = [
  { id: 'MV-1001', reference: 'PO-9921', type: 'In', date: '2025-05-20', productName: 'Neural-Link Adapter', sku: 'SKU-8001', warehouseTo: 'US-East Distribution Center', quantity: 500, user: 'System' },
  { id: 'MV-1002', reference: 'ORD-2025-001', type: 'Out', date: '2025-05-20', productName: 'Quantum Glass Screen', sku: 'SKU-8002', warehouseFrom: 'US-East Distribution Center', quantity: 12, user: 'Alex Morgan' },
  { id: 'MV-1003', reference: 'TRF-US-EU-01', type: 'Transfer', date: '2025-05-19', productName: 'Haptic Gloves', sku: 'SKU-8003', warehouseFrom: 'US-East Distribution Center', warehouseTo: 'EU Central Hub', quantity: 50, user: 'Sarah Jenkins' },
  { id: 'MV-1004', reference: 'AUDIT-Q2', type: 'Adjustment', date: '2025-05-18', productName: 'Wireless Charger', sku: 'SKU-8005', warehouseFrom: 'APAC Regional Node', quantity: -5, user: 'Admin', notes: 'Damaged goods found during audit' },
  { id: 'MV-1005', reference: 'PO-9922', type: 'In', date: '2025-05-18', productName: 'Wireless Charger', sku: 'SKU-8005', warehouseTo: 'APAC Regional Node', quantity: 200, user: 'System' },
];

export const Movements = () => {
  // -- State --
  const [movements, setMovements] = useState<Movement[]>(INITIAL_MOVEMENTS);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [warehouseFilter, setWarehouseFilter] = useState('All');
  
  // SlideOver State
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [formData, setFormData] = useState({
    type: 'In' as MovementType,
    date: new Date().toISOString().split('T')[0],
    productSku: '',
    warehouseFrom: '',
    warehouseTo: '',
    quantity: 0,
    reference: '',
    notes: ''
  });

  // Expanded Row State
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // -- Pagination --
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // -- Helpers --
  const handleSave = () => {
    // Basic Validation
    if (!formData.productSku || !formData.quantity || !formData.reference) return;
    
    // Logic to determine From/To based on type
    let finalFrom = undefined;
    let finalTo = undefined;

    if (formData.type === 'Transfer') {
      finalFrom = MOCK_WAREHOUSES.find(w => w.value === formData.warehouseFrom)?.label;
      finalTo = MOCK_WAREHOUSES.find(w => w.value === formData.warehouseTo)?.label;
    } else if (formData.type === 'In') {
      finalTo = MOCK_WAREHOUSES.find(w => w.value === formData.warehouseTo)?.label;
    } else if (formData.type === 'Out') {
      finalFrom = MOCK_WAREHOUSES.find(w => w.value === formData.warehouseFrom)?.label;
    } else if (formData.type === 'Adjustment') {
      // Adjustment logic: if negative, 'from', if positive 'to' - simplistic approach for now
      // Or just assign to a location
      finalFrom = MOCK_WAREHOUSES.find(w => w.value === formData.warehouseFrom)?.label; 
    }

    const productLabel = MOCK_PRODUCTS.find(p => p.value === formData.productSku)?.label || '';
    const productName = productLabel.split(' (')[0];

    const newMovement: Movement = {
      id: `MV-${Math.floor(Date.now() / 1000)}`,
      reference: formData.reference,
      type: formData.type,
      date: formData.date,
      productName,
      sku: formData.productSku,
      warehouseFrom: finalFrom,
      warehouseTo: finalTo,
      quantity: formData.type === 'Out' || (formData.type === 'Adjustment' && formData.quantity < 0) ? Math.abs(formData.quantity) : formData.quantity,
      user: 'Current User', // Mock user
      notes: formData.notes
    };

    setMovements([newMovement, ...movements]);
    setIsCreateOpen(false);
    
    // Reset Form
    setFormData({
      type: 'In',
      date: new Date().toISOString().split('T')[0],
      productSku: '',
      warehouseFrom: '',
      warehouseTo: '',
      quantity: 0,
      reference: '',
      notes: ''
    });
  };

  // Filter Logic
  const filteredMovements = useMemo(() => {
    return movements.filter(m => {
      const matchesSearch = m.reference.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            m.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            m.sku.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = typeFilter === 'All' || m.type === typeFilter;
      const matchesWarehouse = warehouseFilter === 'All' || 
                               m.warehouseFrom === warehouseFilter || 
                               m.warehouseTo === warehouseFilter;
      
      return matchesSearch && matchesType && matchesWarehouse;
    });
  }, [movements, searchQuery, typeFilter, warehouseFilter]);

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredMovements.slice(start, start + itemsPerPage);
  }, [filteredMovements, currentPage]);

  const totalPages = Math.ceil(filteredMovements.length / itemsPerPage);

  const getIconForType = (type: MovementType) => {
    switch(type) {
      case 'In': return <ArrowDownRight className="w-3.5 h-3.5" />;
      case 'Out': return <ArrowUpRight className="w-3.5 h-3.5" />;
      case 'Transfer': return <ArrowRightLeft className="w-3.5 h-3.5" />;
      case 'Adjustment': return <RefreshCw className="w-3.5 h-3.5" />;
    }
  };

  const getColorForType = (type: MovementType) => {
    switch(type) {
      case 'In': return 'text-success bg-success/10 border-success/20';
      case 'Out': return 'text-danger bg-danger/10 border-danger/20';
      case 'Transfer': return 'text-info bg-info/10 border-info/20';
      case 'Adjustment': return 'text-warning bg-warning/10 border-warning/20';
    }
  };

  return (
    <div className="animate-fade-up space-y-8 min-h-[calc(100vh-100px)] flex flex-col">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
             <ArrowRightLeft className="w-5 h-5 text-brand" />
             <h1 className="text-2xl font-black text-zinc-text uppercase italic tracking-tighter">Stock Movements</h1>
          </div>
          <p className="text-[10px] font-black text-zinc-muted uppercase tracking-[0.3em] mt-1">Track inventory flow across all nodes</p>
        </div>
        <div className="flex gap-2">
          <AmberButton variant="ghost" size="sm">
            <Download className="w-3.5 h-3.5 mr-2" /> Export Log
          </AmberButton>
          <AmberButton size="sm" onClick={() => setIsCreateOpen(true)}>
            <Plus className="w-4 h-4 mr-2" /> New Movement
          </AmberButton>
        </div>
      </div>

      {/* Filter Bar */}
      <AmberCard noPadding className="p-4 flex flex-col lg:flex-row gap-4 items-end bg-obsidian-panel border-white/5 relative z-10">
        <div className="flex-1 w-full">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-muted" />
            <input 
              type="text" 
              placeholder="Search by Reference, Product, SKU..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 bg-obsidian-outer border border-white/5 rounded-sm pl-10 pr-4 text-xs font-bold text-zinc-text outline-none focus:border-brand/30 transition-all placeholder:text-zinc-muted/50"
            />
          </div>
        </div>
        
        <AmberDropdown 
          label="Type"
          options={['All', 'In', 'Out', 'Transfer', 'Adjustment'].map(t => ({label: t, value: t}))}
          value={typeFilter}
          onChange={setTypeFilter}
          className="w-full lg:w-48"
        />

        <AmberDropdown 
          label="Warehouse"
          options={[{label: 'All Locations', value: 'All'}, ...MOCK_WAREHOUSES.map(w => ({label: w.label, value: w.label}))]}
          value={warehouseFilter}
          onChange={setWarehouseFilter}
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
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Reference</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Product</th>
                <th className="px-6 py-4">From / To</th>
                <th className="px-6 py-4 text-right">Qty</th>
                <th className="w-12"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.03]">
              {paginatedData.map((m) => (
                <React.Fragment key={m.id}>
                  <tr 
                    className={cn(
                      "hover:bg-white/[0.02] transition-colors group cursor-pointer",
                      expandedId === m.id && "bg-white/[0.02]"
                    )}
                    onClick={() => setExpandedId(expandedId === m.id ? null : m.id)}
                  >
                    <td className="px-6 py-4 text-[10px] font-bold text-zinc-muted">{m.date}</td>
                    <td className="px-6 py-4 font-mono text-[10px] font-bold text-zinc-text group-hover:text-brand transition-colors">{m.reference}</td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-sm border text-[9px] font-black uppercase tracking-widest",
                        getColorForType(m.type)
                      )}>
                        {getIconForType(m.type)}
                        {m.type}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-zinc-text">{m.productName}</span>
                        <span className="text-[9px] font-mono text-zinc-muted">{m.sku}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-[10px]">
                      {m.type === 'Transfer' ? (
                        <div className="flex flex-col gap-1">
                          <span className="text-zinc-muted flex items-center gap-1"><Box className="w-3 h-3" /> {m.warehouseFrom}</span>
                          <span className="text-zinc-text flex items-center gap-1"><ArrowDownRight className="w-3 h-3" /> {m.warehouseTo}</span>
                        </div>
                      ) : m.type === 'In' ? (
                        <span className="text-zinc-text flex items-center gap-1"><Box className="w-3 h-3" /> {m.warehouseTo}</span>
                      ) : (
                        <span className="text-zinc-muted flex items-center gap-1"><Box className="w-3 h-3" /> {m.warehouseFrom}</span>
                      )}
                    </td>
                    <td className={cn(
                      "px-6 py-4 text-right font-bold text-xs",
                      m.type === 'In' ? 'text-success' : m.type === 'Out' ? 'text-danger' : 'text-zinc-text'
                    )}>
                      {m.type === 'In' ? '+' : m.type === 'Out' ? '-' : ''}{Math.abs(m.quantity)}
                    </td>
                    <td className="px-2 py-4 text-center">
                      <ChevronRight className={cn("w-4 h-4 text-zinc-muted transition-transform", expandedId === m.id && "rotate-90")} />
                    </td>
                  </tr>
                  
                  {/* Expanded Details */}
                  {expandedId === m.id && (
                    <tr className="bg-obsidian-outer/30 shadow-inner">
                      <td colSpan={7} className="px-6 py-4">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-[10px]">
                           <div>
                              <p className="font-black text-zinc-muted uppercase tracking-widest mb-1">Movement ID</p>
                              <p className="font-mono text-zinc-text">{m.id}</p>
                           </div>
                           <div>
                              <p className="font-black text-zinc-muted uppercase tracking-widest mb-1">Initiated By</p>
                              <p className="text-zinc-text">{m.user}</p>
                           </div>
                           <div className="col-span-2">
                              <p className="font-black text-zinc-muted uppercase tracking-widest mb-1">Notes</p>
                              <p className="text-zinc-secondary italic">{m.notes || 'No notes provided.'}</p>
                           </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="px-6 py-4 border-t border-white/5 bg-obsidian-outer/30 flex justify-between items-center">
           <p className="text-[10px] font-black text-zinc-muted uppercase tracking-[0.2em]">
             Showing {(currentPage - 1) * itemsPerPage + 1}-{Math.min(currentPage * itemsPerPage, filteredMovements.length)} of {filteredMovements.length}
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

      {/* New Movement SlideOver */}
      <AmberSlideOver
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Record Movement"
        description="Manually log inventory changes or transfers."
        footer={
           <>
              <AmberButton variant="ghost" onClick={() => setIsCreateOpen(false)}>Cancel</AmberButton>
              <AmberButton onClick={handleSave}>Confirm Movement</AmberButton>
           </>
        }
      >
         <div className="space-y-6">
            <div>
               <label className="text-[9px] font-black text-zinc-muted uppercase tracking-widest mb-1.5 block px-1">Movement Type</label>
               <AmberDropdown 
                  options={['In', 'Out', 'Transfer', 'Adjustment'].map(t => ({label: t, value: t}))}
                  value={formData.type}
                  onChange={(val) => setFormData({...formData, type: val as MovementType})}
                  className="w-full"
               />
            </div>

            <div className="grid grid-cols-2 gap-4">
               <AmberInput 
                  label="Date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({...formData, date: e.target.value})}
               />
               <AmberInput 
                  label="Reference No."
                  placeholder="e.g. PO-1234"
                  value={formData.reference}
                  onChange={(e) => setFormData({...formData, reference: e.target.value})}
               />
            </div>

            <div className="p-4 bg-obsidian-outer/50 border border-white/5 rounded-sm space-y-4">
               <h4 className="text-[10px] font-black text-zinc-text uppercase tracking-widest flex items-center gap-2">
                  <Box className="w-3 h-3" /> Logistics Details
               </h4>
               
               {/* Location Logic based on Type */}
               {formData.type === 'Transfer' && (
                  <div className="grid grid-cols-2 gap-4">
                     <div>
                        <label className="text-[9px] font-black text-zinc-muted uppercase tracking-widest mb-1.5 block px-1">From Source</label>
                        <AmberDropdown 
                           options={MOCK_WAREHOUSES}
                           value={formData.warehouseFrom}
                           onChange={(val) => setFormData({...formData, warehouseFrom: val})}
                           className="w-full"
                           placeholder="Select Warehouse"
                        />
                     </div>
                     <div>
                        <label className="text-[9px] font-black text-zinc-muted uppercase tracking-widest mb-1.5 block px-1">To Destination</label>
                        <AmberDropdown 
                           options={MOCK_WAREHOUSES}
                           value={formData.warehouseTo}
                           onChange={(val) => setFormData({...formData, warehouseTo: val})}
                           className="w-full"
                           placeholder="Select Warehouse"
                        />
                     </div>
                  </div>
               )}

               {(formData.type === 'In' || (formData.type === 'Adjustment' && formData.quantity > 0)) && (
                  <div>
                     <label className="text-[9px] font-black text-zinc-muted uppercase tracking-widest mb-1.5 block px-1">Destination Warehouse</label>
                     <AmberDropdown 
                        options={MOCK_WAREHOUSES}
                        value={formData.warehouseTo}
                        onChange={(val) => setFormData({...formData, warehouseTo: val})}
                        className="w-full"
                        placeholder="Select Receiving Location"
                     />
                  </div>
               )}

               {(formData.type === 'Out' || (formData.type === 'Adjustment' && formData.quantity < 0)) && (
                  <div>
                     <label className="text-[9px] font-black text-zinc-muted uppercase tracking-widest mb-1.5 block px-1">Source Warehouse</label>
                     <AmberDropdown 
                        options={MOCK_WAREHOUSES}
                        value={formData.warehouseFrom}
                        onChange={(val) => setFormData({...formData, warehouseFrom: val})}
                        className="w-full"
                        placeholder="Select Source Location"
                     />
                  </div>
               )}

               {/* Product & Qty */}
               <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-zinc-muted uppercase tracking-widest px-1">Product SKU</label>
                  <AmberAutocomplete 
                     options={MOCK_PRODUCTS}
                     value={formData.productSku}
                     onChange={(val) => setFormData({...formData, productSku: val})}
                     placeholder="Search product catalog..."
                  />
               </div>

               <AmberInput 
                  label="Quantity"
                  type="number"
                  value={formData.quantity}
                  onChange={(e) => setFormData({...formData, quantity: parseInt(e.target.value)})}
                  placeholder="0"
               />
            </div>

            <AmberInput 
               label="Internal Notes"
               multiline
               rows={3}
               placeholder="Reason for movement..."
               value={formData.notes}
               onChange={(e) => setFormData({...formData, notes: e.target.value})}
            />
         </div>
      </AmberSlideOver>
    </div>
  );
};
