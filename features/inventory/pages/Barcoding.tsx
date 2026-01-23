
import React, { useState, useMemo } from 'react';
import { AmberCard } from '../../../amber-ui/components/AmberCard';
import { AmberButton } from '../../../amber-ui/components/AmberButton';
import { AmberInput } from '../../../amber-ui/components/AmberInput';
import { AmberDropdown } from '../../../amber-ui/components/AmberDropdown';
import { AmberAutocomplete } from '../../../amber-ui/components/AmberAutocomplete';
import { 
  ScanBarcode, 
  Printer, 
  Download, 
  Trash2, 
  Plus, 
  Settings, 
  FileText,
  Copy,
  RotateCcw,
  Check
} from 'lucide-react';
import { cn } from '../../../lib/cn';

// --- Types ---
interface PrintQueueItem {
  id: string;
  sku: string;
  name: string;
  price: string;
  quantity: number;
}

interface PrintJob {
  id: string;
  date: string;
  items: number;
  template: string;
  status: 'Completed' | 'Failed';
}

// --- Mock Data ---
const MOCK_PRODUCTS = [
  { label: 'Neural-Link Adapter (SKU-8001)', value: 'SKU-8001', subtext: '$45.00' },
  { label: 'Quantum Glass Screen (SKU-8002)', value: 'SKU-8002', subtext: '$120.00' },
  { label: 'Haptic Gloves (SKU-8003)', value: 'SKU-8003', subtext: '$89.99' },
  { label: 'Wireless Charger (SKU-8005)', value: 'SKU-8005', subtext: '$29.50' },
  { label: 'Obsidian Keyboard (SKU-9921)', value: 'SKU-9921', subtext: '$249.00' },
];

const TEMPLATES = [
  { label: 'Standard Label (4" x 6")', value: '4x6' },
  { label: 'Shelf Tag (2" x 1")', value: '2x1' },
  { label: 'Product Sticker (1" x 1")', value: '1x1' },
  { label: 'A4 Sheet (30 per page)', value: 'a4_30' },
];

const PRINTERS = [
  { label: 'Main Office - Zebra ZD420', value: 'zebra_main' },
  { label: 'Warehouse A - Rollo', value: 'rollo_wh_a' },
  { label: 'PDF Export Only', value: 'pdf' },
];

const MOCK_HISTORY: PrintJob[] = [
  { id: 'JOB-1001', date: '2025-05-20 10:30', items: 150, template: '4x6', status: 'Completed' },
  { id: 'JOB-1002', date: '2025-05-19 14:15', items: 45, template: '2x1', status: 'Completed' },
  { id: 'JOB-1003', date: '2025-05-18 09:00', items: 300, template: 'a4_30', status: 'Completed' },
];

// --- Simple Barcode Visual Component ---
const BarcodeVisual = ({ sku }: { sku: string }) => (
  <div className="flex flex-col items-center gap-1 w-full">
    <div className="h-12 w-full flex justify-center gap-[2px] overflow-hidden">
      {sku.split('').map((char, i) => {
        // Generate pseudo-random bar widths based on char code to look like a barcode
        const code = char.charCodeAt(0);
        return (
          <React.Fragment key={i}>
             <div className="h-full bg-black" style={{ width: (code % 3) + 1 + 'px' }} />
             <div className="h-full bg-transparent" style={{ width: ((code + 1) % 2) + 1 + 'px' }} />
             <div className="h-full bg-black" style={{ width: ((code + 2) % 4) + 1 + 'px' }} />
          </React.Fragment>
        );
      })}
      {/* Filler bars */}
      {Array.from({length: 20}).map((_, i) => (
         <div key={`fill_${i}`} className="h-full bg-black" style={{ width: ((i % 3) === 0 ? 3 : 1) + 'px', opacity: (i % 2) ? 0 : 1 }} />
      ))}
    </div>
    <span className="font-mono text-[10px] font-bold tracking-[0.2em]">{sku}</span>
  </div>
);

export const Barcoding = () => {
  // -- State --
  const [activeTab, setActiveTab] = useState<'generator' | 'history'>('generator');
  
  // Generator State
  const [selectedProductSku, setSelectedProductSku] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [template, setTemplate] = useState('4x6');
  const [printer, setPrinter] = useState('pdf');
  const [queue, setQueue] = useState<PrintQueueItem[]>([]);

  // -- Derived --
  const currentProduct = MOCK_PRODUCTS.find(p => p.value === selectedProductSku);

  // -- Handlers --
  const addToQueue = () => {
    if (!currentProduct) return;
    const newItem: PrintQueueItem = {
      id: `item_${Date.now()}`,
      sku: currentProduct.value,
      name: currentProduct.label.split(' (')[0],
      price: currentProduct.subtext || '$0.00',
      quantity: quantity
    };
    setQueue([...queue, newItem]);
    setQuantity(1);
    setSelectedProductSku(''); // Reset selection
  };

  const removeFromQueue = (id: string) => {
    setQueue(queue.filter(i => i.id !== id));
  };

  const clearQueue = () => setQueue([]);

  const handlePrint = () => {
    if (queue.length === 0) return;
    alert(`Sending ${queue.reduce((acc, i) => acc + i.quantity, 0)} labels to ${PRINTERS.find(p => p.value === printer)?.label}`);
    // Simulate job completion
    clearQueue();
  };

  return (
    <div className="animate-fade-up space-y-8 min-h-[calc(100vh-100px)] flex flex-col">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
             <ScanBarcode className="w-5 h-5 text-brand" />
             <h1 className="text-2xl font-black text-zinc-text uppercase italic tracking-tighter">Barcode Management</h1>
          </div>
          <p className="text-[10px] font-black text-zinc-muted uppercase tracking-[0.3em] mt-1">Generate and print product labels</p>
        </div>
        <div className="flex gap-2">
          <AmberButton 
            variant={activeTab === 'generator' ? 'primary' : 'ghost'} 
            size="sm" 
            onClick={() => setActiveTab('generator')}
          >
            Label Generator
          </AmberButton>
          <AmberButton 
            variant={activeTab === 'history' ? 'primary' : 'ghost'} 
            size="sm" 
            onClick={() => setActiveTab('history')}
          >
            Print History
          </AmberButton>
        </div>
      </div>

      {activeTab === 'generator' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 flex-1 min-h-0">
          
          {/* LEFT COLUMN: Controls & Preview */}
          <div className="lg:col-span-5 space-y-6">
             {/* Configuration Card */}
             <AmberCard className="p-6 space-y-6">
                <div className="flex items-center gap-2 pb-2 border-b border-white/5">
                   <Settings className="w-4 h-4 text-brand" />
                   <h3 className="text-xs font-black text-zinc-text uppercase tracking-widest">Print Settings</h3>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                   <div>
                      <label className="text-[9px] font-black text-zinc-muted uppercase tracking-widest mb-1.5 block px-1">Template Size</label>
                      <AmberDropdown 
                         options={TEMPLATES}
                         value={template}
                         onChange={setTemplate}
                         className="w-full"
                      />
                   </div>
                   <div>
                      <label className="text-[9px] font-black text-zinc-muted uppercase tracking-widest mb-1.5 block px-1">Target Printer</label>
                      <AmberDropdown 
                         options={PRINTERS}
                         value={printer}
                         onChange={setPrinter}
                         className="w-full"
                      />
                   </div>
                </div>
             </AmberCard>

             {/* Add to Queue Card */}
             <AmberCard className="p-6 space-y-6 bg-obsidian-panel/60" glass>
                <div className="flex items-center gap-2 pb-2 border-b border-white/5">
                   <Plus className="w-4 h-4 text-success" />
                   <h3 className="text-xs font-black text-zinc-text uppercase tracking-widest">Add Product</h3>
                </div>

                <div className="space-y-4">
                   <div className="space-y-1.5">
                      <label className="text-[9px] font-black text-zinc-muted uppercase tracking-widest px-1">Product SKU</label>
                      <AmberAutocomplete 
                         options={MOCK_PRODUCTS}
                         value={selectedProductSku}
                         onChange={setSelectedProductSku}
                         placeholder="Search by name or SKU..."
                      />
                   </div>
                   <div className="space-y-1.5">
                      <label className="text-[9px] font-black text-zinc-muted uppercase tracking-widest px-1">Label Quantity</label>
                      <AmberInput 
                         type="number"
                         value={quantity}
                         onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value)))}
                         className="font-mono"
                      />
                   </div>
                   <AmberButton className="w-full" onClick={addToQueue} disabled={!selectedProductSku}>
                      Add to Queue
                   </AmberButton>
                </div>
             </AmberCard>

             {/* Live Preview */}
             <div className="p-6 bg-white/5 border border-white/10 rounded-xl flex flex-col items-center justify-center text-center relative overflow-hidden group">
                <div className="absolute top-2 left-2 text-[9px] font-black text-zinc-muted uppercase tracking-widest">Preview</div>
                {currentProduct ? (
                   <div className="bg-white text-black p-4 rounded-sm shadow-xl w-48 h-32 flex flex-col items-center justify-center gap-2 mt-4 transform group-hover:scale-105 transition-transform duration-300">
                      <p className="text-[8px] font-bold uppercase truncate w-full text-center">{currentProduct.label.split(' (')[0]}</p>
                      <BarcodeVisual sku={currentProduct.value} />
                      <p className="text-sm font-black">{currentProduct.subtext}</p>
                   </div>
                ) : (
                   <div className="h-32 flex items-center justify-center text-zinc-muted/40 italic text-xs mt-4">
                      Select a product to preview
                   </div>
                )}
             </div>
          </div>

          {/* RIGHT COLUMN: Queue */}
          <div className="lg:col-span-7 flex flex-col h-full min-h-[500px]">
             <AmberCard noPadding className="flex-1 flex flex-col overflow-hidden bg-obsidian-panel/50">
                <div className="p-4 border-b border-white/5 flex items-center justify-between bg-obsidian-panel">
                   <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-info" />
                      <h3 className="text-xs font-black text-zinc-text uppercase tracking-widest">Print Queue ({queue.length})</h3>
                   </div>
                   <div className="flex gap-2">
                      <button onClick={clearQueue} className="p-2 hover:bg-white/5 rounded-sm text-zinc-muted hover:text-danger transition-colors" title="Clear All">
                         <Trash2 className="w-4 h-4" />
                      </button>
                   </div>
                </div>

                <div className="flex-1 overflow-y-auto p-0">
                   {queue.length > 0 ? (
                      <table className="w-full text-left">
                         <thead className="bg-white/5 text-[9px] font-black text-zinc-muted uppercase tracking-widest sticky top-0 backdrop-blur-md">
                            <tr>
                               <th className="px-4 py-3">Product Name</th>
                               <th className="px-4 py-3">SKU</th>
                               <th className="px-4 py-3 text-center">Qty</th>
                               <th className="px-4 py-3 text-right">Actions</th>
                            </tr>
                         </thead>
                         <tbody className="divide-y divide-white/5">
                            {queue.map((item) => (
                               <tr key={item.id} className="hover:bg-white/[0.02]">
                                  <td className="px-4 py-3 text-xs font-bold text-zinc-text">{item.name}</td>
                                  <td className="px-4 py-3 text-[10px] font-mono text-zinc-secondary">{item.sku}</td>
                                  <td className="px-4 py-3 text-center font-bold text-brand">{item.quantity}</td>
                                  <td className="px-4 py-3 text-right">
                                     <button onClick={() => removeFromQueue(item.id)} className="text-zinc-muted hover:text-danger transition-colors">
                                        <Trash2 className="w-3.5 h-3.5" />
                                     </button>
                                  </td>
                               </tr>
                            ))}
                         </tbody>
                      </table>
                   ) : (
                      <div className="flex flex-col items-center justify-center h-full text-zinc-muted opacity-50">
                         <ScanBarcode className="w-12 h-12 mb-3 stroke-1" />
                         <p className="text-xs uppercase tracking-widest">Queue is empty</p>
                      </div>
                   )}
                </div>

                <div className="p-4 border-t border-white/5 bg-obsidian-outer/30 flex justify-between items-center">
                   <div className="text-[10px] font-bold text-zinc-muted uppercase tracking-widest">
                      Total Labels: <span className="text-zinc-text">{queue.reduce((acc, i) => acc + i.quantity, 0)}</span>
                   </div>
                   <div className="flex gap-2">
                      <AmberButton variant="secondary" size="sm">
                         <Download className="w-3.5 h-3.5 mr-2" /> PDF
                      </AmberButton>
                      <AmberButton size="sm" onClick={handlePrint} disabled={queue.length === 0}>
                         <Printer className="w-3.5 h-3.5 mr-2" /> Print Now
                      </AmberButton>
                   </div>
                </div>
             </AmberCard>
          </div>
        </div>
      ) : (
        // HISTORY TAB
        <AmberCard noPadding className="flex-1 bg-obsidian-panel border-white/5">
           <div className="p-4 border-b border-white/5 flex items-center justify-between">
              <h3 className="text-xs font-black text-zinc-text uppercase tracking-widest flex items-center gap-2">
                 <RotateCcw className="w-4 h-4 text-zinc-muted" /> Recent Jobs
              </h3>
              <div className="relative w-64">
                 <input 
                    type="text" 
                    placeholder="Search history..." 
                    className="w-full bg-obsidian-outer border border-white/5 rounded-sm px-3 py-1.5 text-[10px] font-bold text-zinc-text outline-none focus:border-brand/30"
                 />
              </div>
           </div>
           <table className="w-full text-left">
              <thead className="bg-white/5 text-[9px] font-black text-zinc-muted uppercase tracking-widest">
                 <tr>
                    <th className="px-6 py-4">Job ID</th>
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4">Total Items</th>
                    <th className="px-6 py-4">Template</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                 </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                 {MOCK_HISTORY.map((job) => (
                    <tr key={job.id} className="hover:bg-white/[0.02]">
                       <td className="px-6 py-4 font-mono text-[10px] text-zinc-secondary">{job.id}</td>
                       <td className="px-6 py-4 text-xs font-bold text-zinc-text">{job.date}</td>
                       <td className="px-6 py-4 text-xs">{job.items} Labels</td>
                       <td className="px-6 py-4 text-[10px] font-bold text-zinc-muted uppercase">{job.template}</td>
                       <td className="px-6 py-4">
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-sm bg-success/10 text-success border border-success/20 text-[9px] font-black uppercase tracking-widest">
                             <Check className="w-3 h-3" /> {job.status}
                          </span>
                       </td>
                       <td className="px-6 py-4 text-right">
                          <button className="p-2 text-zinc-muted hover:text-brand transition-colors bg-white/5 rounded-sm" title="Re-print">
                             <Copy className="w-3.5 h-3.5" />
                          </button>
                       </td>
                    </tr>
                 ))}
              </tbody>
           </table>
        </AmberCard>
      )}
    </div>
  );
};
