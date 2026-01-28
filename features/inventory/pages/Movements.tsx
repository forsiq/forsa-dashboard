
import React, { useState, useMemo } from 'react';
import { AmberCard } from '../../../amber-ui/components/AmberCard';
import { AmberButton } from '../../../amber-ui/components/AmberButton';
import { AmberInput } from '../../../amber-ui/components/AmberInput';
import { AmberDropdown } from '../../../amber-ui/components/AmberDropdown';
import { AmberSlideOver } from '../../../amber-ui/components/AmberSlideOver';
import { AmberAutocomplete } from '../../../amber-ui/components/AmberAutocomplete';
import { DataTable, Column } from '../../../amber-ui/components/Data/DataTable';
import { StatusBadge } from '../../../amber-ui/components/Data/StatusBadge';
import { 
  ArrowRightLeft,
  ArrowDownRight,
  ArrowUpRight,
  RefreshCw,
  Search,
  Filter,
  Download,
  Plus,
  Box
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
      user: 'Current User',
      notes: formData.notes
    };

    setMovements([newMovement, ...movements]);
    setIsCreateOpen(false);
    
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

  // --- Table Columns ---
  const columns: Column<Movement>[] = [
    {
      key: 'date',
      label: 'Date',
      render: (row) => <span className="text-[10px] font-bold text-zinc-muted">{row.date}</span>,
      sortable: true
    },
    {
      key: 'reference',
      label: 'Reference',
      render: (row) => <span className="font-mono text-[10px] font-bold text-zinc-text group-hover:text-brand transition-colors">{row.reference}</span>,
      sortable: true
    },
    {
      key: 'type',
      label: 'Type',
      render: (row) => {
        let variant: any = 'info';
        if (row.type === 'In') variant = 'success';
        if (row.type === 'Out') variant = 'error';
        if (row.type === 'Adjustment') variant = 'warning';

        return (
          <StatusBadge status={row.type} variant={variant} size="sm" showDot />
        );
      },
      sortable: true
    },
    {
      key: 'product',
      label: 'Product',
      render: (row) => (
        <div className="flex flex-col">
          <span className="text-xs font-bold text-zinc-text">{row.productName}</span>
          <span className="text-[9px] font-mono text-zinc-muted">{row.sku}</span>
        </div>
      ),
      sortable: true
    },
    {
      key: 'location',
      label: 'From / To',
      render: (row) => (
        <div className="text-[10px]">
          {row.type === 'Transfer' ? (
            <div className="flex flex-col gap-1">
              <span className="text-zinc-muted flex items-center gap-1"><Box className="w-3 h-3" /> {row.warehouseFrom}</span>
              <span className="text-zinc-text flex items-center gap-1"><ArrowRightLeft className="w-3 h-3" /> {row.warehouseTo}</span>
            </div>
          ) : row.type === 'In' ? (
            <span className="text-zinc-text flex items-center gap-1"><Box className="w-3 h-3" /> {row.warehouseTo}</span>
          ) : (
            <span className="text-zinc-muted flex items-center gap-1"><Box className="w-3 h-3" /> {row.warehouseFrom}</span>
          )}
        </div>
      )
    },
    {
      key: 'quantity',
      label: 'Qty',
      align: 'right',
      render: (row) => (
        <span className={cn(
          "font-bold text-xs",
          row.type === 'In' ? 'text-success' : row.type === 'Out' ? 'text-danger' : 'text-zinc-text'
        )}>
          {row.type === 'In' ? '+' : row.type === 'Out' ? '-' : ''}{Math.abs(row.quantity)}
        </span>
      ),
      sortable: true
    }
  ];

  // Details expand component
  const renderDetails = (row: Movement) => (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-[10px]">
       <div>
          <p className="font-black text-zinc-muted uppercase tracking-widest mb-1">Movement ID</p>
          <p className="font-mono text-zinc-text">{row.id}</p>
       </div>
       <div>
          <p className="font-black text-zinc-muted uppercase tracking-widest mb-1">Initiated By</p>
          <p className="text-zinc-text">{row.user}</p>
       </div>
       <div className="col-span-2">
          <p className="font-black text-zinc-muted uppercase tracking-widest mb-1">Notes</p>
          <p className="text-zinc-secondary italic">{row.notes || 'No notes provided.'}</p>
       </div>
    </div>
  );

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

      {/* Shared Data Table */}
      <AmberCard noPadding className="flex-1 border-white/5 shadow-xl overflow-hidden">
        <DataTable
          columns={columns}
          data={filteredMovements}
          expandable
          expandComponent={renderDetails}
          pagination
          pageSize={10}
          emptyMessage="No stock movements found."
        />
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
