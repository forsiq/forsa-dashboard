
import React from 'react';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
// Import missing cn utility from the root lib directory
import { cn } from '../../../lib/cn';
import { 
  Plus, 
  Search, 
  Filter, 
  ArrowUpRight,
  MoreHorizontal
} from 'lucide-react';

const mockProducts = [
  { id: 'ZV-X900', name: 'Neural-Link Audio Transceiver', category: 'High-Tech', price: '$4,299', stock: 12, health: 98 },
  { id: 'ZV-P442', name: 'Tactical Obsidian Keyboard', category: 'Peripherals', price: '$249', stock: 450, health: 100 },
  { id: 'ZV-K110', name: 'Bio-Metric Secure Keycard', category: 'Security', price: '$89', stock: 1200, health: 85 },
];

export const ProductsPage = () => {
  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-zinc-text uppercase italic tracking-tight">Master Catalog</h1>
          <p className="text-zinc-muted text-sm font-medium">Authoritative data source for 12,842 active SKUs.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm">Export Schema</Button>
          <Button size="sm">
            <Plus className="w-4 h-4 mr-2" /> Add SKU
          </Button>
        </div>
      </div>

      <div className="flex gap-4 p-4 bg-obsidian-panel border border-white/5 rounded-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-muted" />
          <input 
            type="text" 
            placeholder="Search Global Catalog..."
            className="w-full bg-obsidian-outer border border-white/5 rounded-sm pl-10 pr-4 py-2.5 text-sm outline-none focus:border-brand/30 transition-all"
          />
        </div>
        <Button variant="secondary" className="px-3"><Filter className="w-4 h-4" /></Button>
      </div>

      <Card className="p-0 overflow-hidden" glass>
        <table className="w-full text-left">
          <thead>
            <tr className="bg-white/5 border-b border-white/5">
              <th className="px-6 py-4 text-[10px] font-bold text-zinc-muted uppercase tracking-[0.2em]">Identifier</th>
              <th className="px-6 py-4 text-[10px] font-bold text-zinc-muted uppercase tracking-[0.2em]">Product Name</th>
              <th className="px-6 py-4 text-[10px] font-bold text-zinc-muted uppercase tracking-[0.2em]">Inventory</th>
              <th className="px-6 py-4 text-[10px] font-bold text-zinc-muted uppercase tracking-[0.2em]">Status</th>
              <th className="px-6 py-4"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {mockProducts.map((p) => (
              <tr key={p.id} className="hover:bg-white/5 transition-colors group">
                <td className="px-6 py-5">
                  <span className="font-mono text-xs text-brand font-bold">{p.id}</span>
                </td>
                <td className="px-6 py-5">
                  <p className="text-sm font-bold text-zinc-text uppercase tracking-tight italic">{p.name}</p>
                  <p className="text-[10px] text-zinc-muted font-bold uppercase mt-1">{p.category}</p>
                </td>
                <td className="px-6 py-5">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-zinc-text">{p.stock} <span className="text-[10px] text-zinc-muted">Units</span></span>
                  </div>
                </td>
                <td className="px-6 py-5">
                  <div className="flex items-center gap-2">
                    <div className={cn("w-1.5 h-1.5 rounded-full", p.health > 90 ? "bg-success" : "bg-warning")} />
                    <span className="text-[10px] font-bold text-zinc-muted uppercase tracking-widest">{p.health}% Validated</span>
                  </div>
                </td>
                <td className="px-6 py-5 text-right">
                  <div className="flex justify-end gap-2">
                    <button className="p-2 text-zinc-muted hover:text-brand transition-all"><ArrowUpRight className="w-4 h-4" /></button>
                    <button className="p-2 text-zinc-muted hover:text-zinc-text transition-all"><MoreHorizontal className="w-4 h-4" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="p-4 bg-obsidian-outer/50 border-t border-white/5 flex justify-between items-center">
          <span className="text-[10px] font-bold text-zinc-muted uppercase tracking-widest">Showing 3 of 12,842 Product Records</span>
          <div className="flex gap-2">
            <Button size="sm" variant="ghost" disabled>Prev</Button>
            <Button size="sm" variant="ghost">Next</Button>
          </div>
        </div>
      </Card>
    </div>
  );
};