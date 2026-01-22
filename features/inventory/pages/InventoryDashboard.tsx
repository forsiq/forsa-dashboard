
import React, { useState } from 'react';
import { AmberCard } from '../../../amber-ui/components/AmberCard';
import { AmberButton } from '../../../amber-ui/components/AmberButton';
import { 
  Package, 
  AlertTriangle, 
  ArrowRightLeft, 
  Plus, 
  TrendingUp, 
  MapPin, 
  History,
  Box,
  DollarSign,
  Truck,
  ArrowUpRight,
  ArrowDownRight,
  ClipboardList,
  RefreshCw
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  Legend
} from 'recharts';
import { cn } from '../../../lib/cn';
import { useLanguage } from '../../../amber-ui/contexts/LanguageContext';

// --- Mock Data ---

const WAREHOUSE_DATA = [
  { name: 'US-East', stock: 12500, capacity: 15000 },
  { name: 'EU-Central', stock: 8200, capacity: 12000 },
  { name: 'APAC-Sing', stock: 4500, capacity: 8000 },
  { name: 'US-West', stock: 9800, capacity: 10000 },
];

const MOVEMENT_DATA = [
  { day: '1', in: 40, out: 24 },
  { day: '5', in: 30, out: 13 },
  { day: '10', in: 20, out: 58 },
  { day: '15', in: 27, out: 39 },
  { day: '20', in: 18, out: 48 },
  { day: '25', in: 23, out: 38 },
  { day: '30', in: 34, out: 43 },
];

const LOW_STOCK_ALERTS = [
  { id: 1, sku: 'SKU-8821', name: 'Wireless Headphones', warehouse: 'US-East', current: 5, min: 20 },
  { id: 2, sku: 'SKU-9902', name: 'Smart Watch Strap', warehouse: 'EU-Central', current: 12, min: 50 },
  { id: 3, sku: 'SKU-1120', name: 'USB-C Cable 2m', warehouse: 'US-West', current: 0, min: 100 },
];

const RECENT_MOVEMENTS = [
  { id: 'MV-902', type: 'OUT', qty: 120, sku: 'SKU-8821', ref: 'ORD-2025-001', date: '2 mins ago' },
  { id: 'MV-901', type: 'IN', qty: 500, sku: 'SKU-3321', ref: 'PO-9921', date: '1 hour ago' },
  { id: 'MV-900', type: 'ADJ', qty: -5, sku: 'SKU-1120', ref: 'Audit-Q2', date: '3 hours ago' },
  { id: 'MV-899', type: 'TRF', qty: 50, sku: 'SKU-9902', ref: 'TRF-US-EU', date: 'Yesterday' },
];

export const InventoryDashboard = () => {
  const { t } = useLanguage();

  return (
    <div className="animate-fade-up space-y-8">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
             <Box className="w-5 h-5 text-brand" />
             <h1 className="text-2xl font-black text-zinc-text uppercase italic tracking-tighter">Inventory Command</h1>
          </div>
          <p className="text-[10px] font-black text-zinc-muted uppercase tracking-[0.3em] mt-1">Real-time stock levels and logistics tracking</p>
        </div>
        <div className="flex gap-2">
          <AmberButton variant="secondary" size="sm">
            <ClipboardList className="w-3.5 h-3.5 mr-2" /> Audit
          </AmberButton>
          <AmberButton variant="secondary" size="sm">
            <ArrowRightLeft className="w-3.5 h-3.5 mr-2" /> Transfer
          </AmberButton>
          <AmberButton size="sm">
            <Plus className="w-3.5 h-3.5 mr-2" /> Add Stock
          </AmberButton>
        </div>
      </div>

      {/* KPI Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Valuation', value: '$4.2M', sub: '+12% vs last mo', icon: DollarSign, color: 'text-brand', bg: 'bg-brand/10' },
          { label: 'Low Stock Items', value: '15', sub: 'Action Required', icon: AlertTriangle, color: 'text-warning', bg: 'bg-warning/10' },
          { label: 'Total Units', value: '35,240', sub: 'Across 4 Nodes', icon: Package, color: 'text-info', bg: 'bg-info/10' },
          { label: 'Pending Transfers', value: '8', sub: 'In Transit', icon: Truck, color: 'text-success', bg: 'bg-success/10' },
        ].map((stat, i) => (
          <AmberCard key={i} className="p-5 flex items-center justify-between hover:border-brand/20 transition-all cursor-default">
            <div>
              <p className="text-[9px] font-black text-zinc-muted uppercase tracking-widest mb-1">{stat.label}</p>
              <p className="text-2xl font-black text-zinc-text tracking-tighter">{stat.value}</p>
              <p className="text-[9px] font-bold text-zinc-muted uppercase tracking-tight mt-1 opacity-70">{stat.sub}</p>
            </div>
            <div className={cn("p-2.5 rounded-sm", stat.bg, stat.color)}>
              <stat.icon className="w-5 h-5" />
            </div>
          </AmberCard>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Warehouse Distribution */}
        <AmberCard className="p-6 h-[350px] flex flex-col" glass>
          <div className="flex items-center justify-between mb-6">
             <h3 className="text-xs font-black text-zinc-text uppercase tracking-widest flex items-center gap-2">
                <MapPin className="w-4 h-4 text-info" /> Stock by Warehouse
             </h3>
          </div>
          <div className="flex-1 w-full text-xs">
             <ResponsiveContainer width="100%" height="100%">
                <BarChart data={WAREHOUSE_DATA} layout="vertical" margin={{ left: 20 }}>
                   <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(255,255,255,0.05)" />
                   <XAxis type="number" hide />
                   <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fill: '#94A3B8', fontSize: 10, fontWeight: 700}} width={80} />
                   <Tooltip 
                      cursor={{fill: 'rgba(255,255,255,0.05)'}}
                      contentStyle={{ backgroundColor: '#161E36', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '4px', color: '#F1F5F9', fontSize: '11px' }}
                   />
                   <Bar dataKey="stock" fill="#3B82F6" radius={[0, 4, 4, 0]} barSize={20} />
                </BarChart>
             </ResponsiveContainer>
          </div>
        </AmberCard>

        {/* Movement Trends */}
        <AmberCard className="p-6 h-[350px] flex flex-col" glass>
          <div className="flex items-center justify-between mb-6">
             <h3 className="text-xs font-black text-zinc-text uppercase tracking-widest flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-success" /> Movement Velocity (30d)
             </h3>
          </div>
          <div className="flex-1 w-full text-xs">
             <ResponsiveContainer width="100%" height="100%">
                <LineChart data={MOVEMENT_DATA}>
                   <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                   <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill: '#94A3B8', fontSize: 10}} />
                   <YAxis axisLine={false} tickLine={false} tick={{fill: '#94A3B8', fontSize: 10}} />
                   <Tooltip 
                      contentStyle={{ backgroundColor: '#161E36', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '4px', color: '#F1F5F9', fontSize: '11px' }}
                   />
                   <Legend wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }} />
                   <Line type="monotone" dataKey="in" name="Stock In" stroke="#10B981" strokeWidth={2} dot={false} />
                   <Line type="monotone" dataKey="out" name="Stock Out" stroke="#EF4444" strokeWidth={2} dot={false} />
                </LineChart>
             </ResponsiveContainer>
          </div>
        </AmberCard>
      </div>

      {/* Operational Layer */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         
         {/* Low Stock Alerts */}
         <AmberCard noPadding className="lg:col-span-1 overflow-hidden flex flex-col">
            <div className="p-5 border-b border-white/5 flex items-center justify-between bg-warning/5">
               <h3 className="text-xs font-black text-warning uppercase tracking-widest flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" /> Critical Levels
               </h3>
               <span className="text-[9px] font-bold bg-warning/20 text-warning px-1.5 py-0.5 rounded-sm">{LOW_STOCK_ALERTS.length}</span>
            </div>
            <div className="flex-1 divide-y divide-white/5 overflow-y-auto max-h-[300px]">
               {LOW_STOCK_ALERTS.map(alert => (
                  <div key={alert.id} className="p-4 hover:bg-white/[0.02] transition-colors group">
                     <div className="flex justify-between items-start mb-1">
                        <span className="text-xs font-bold text-zinc-text">{alert.name}</span>
                        <span className="text-[9px] font-black text-danger uppercase">{alert.current} Units</span>
                     </div>
                     <div className="flex justify-between items-center text-[10px] text-zinc-muted">
                        <span className="font-mono">{alert.sku}</span>
                        <span>{alert.warehouse}</span>
                     </div>
                     <div className="mt-2 w-full bg-obsidian-outer h-1 rounded-full overflow-hidden">
                        <div className="h-full bg-danger w-[20%]" />
                     </div>
                     <p className="text-[8px] text-zinc-muted mt-1 text-right">Threshold: {alert.min}</p>
                  </div>
               ))}
            </div>
            <div className="p-3 border-t border-white/5 bg-obsidian-outer/50">
               <AmberButton size="sm" variant="ghost" className="w-full text-zinc-muted hover:text-warning justify-center">Create Restock PO</AmberButton>
            </div>
         </AmberCard>

         {/* Recent Movements */}
         <AmberCard noPadding className="lg:col-span-2 overflow-hidden flex flex-col">
            <div className="p-5 border-b border-white/5 flex items-center justify-between">
               <h3 className="text-xs font-black text-zinc-text uppercase tracking-widest flex items-center gap-2">
                  <History className="w-4 h-4 text-brand" /> Recent Movements
               </h3>
               <button className="text-[9px] font-bold text-brand hover:underline uppercase tracking-widest">View All</button>
            </div>
            <div className="overflow-x-auto">
               <table className="w-full text-left">
                  <thead>
                     <tr className="bg-obsidian-outer/50 border-b border-white/5 text-[9px] font-black text-zinc-muted uppercase tracking-widest">
                        <th className="px-5 py-3">Type</th>
                        <th className="px-5 py-3">SKU</th>
                        <th className="px-5 py-3">Quantity</th>
                        <th className="px-5 py-3">Reference</th>
                        <th className="px-5 py-3 text-right">Time</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-xs font-medium">
                     {RECENT_MOVEMENTS.map(mv => (
                        <tr key={mv.id} className="hover:bg-white/[0.02] transition-colors">
                           <td className="px-5 py-3">
                              <span className={cn(
                                 "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-sm border text-[9px] font-black uppercase tracking-widest",
                                 mv.type === 'IN' ? "bg-success/5 border-success/20 text-success" :
                                 mv.type === 'OUT' ? "bg-danger/5 border-danger/20 text-danger" :
                                 mv.type === 'TRF' ? "bg-info/5 border-info/20 text-info" :
                                 "bg-warning/5 border-warning/20 text-warning"
                              )}>
                                 {mv.type === 'IN' ? <ArrowDownRight className="w-3 h-3" /> :
                                  mv.type === 'OUT' ? <ArrowUpRight className="w-3 h-3" /> :
                                  mv.type === 'TRF' ? <ArrowRightLeft className="w-3 h-3" /> : <RefreshCw className="w-3 h-3" />}
                                 {mv.type}
                              </span>
                           </td>
                           <td className="px-5 py-3 font-mono text-zinc-secondary">{mv.sku}</td>
                           <td className={cn("px-5 py-3 font-bold", mv.qty > 0 ? "text-success" : "text-danger")}>
                              {mv.qty > 0 ? '+' : ''}{mv.qty}
                           </td>
                           <td className="px-5 py-3 text-zinc-text">{mv.ref}</td>
                           <td className="px-5 py-3 text-right text-zinc-muted text-[10px] uppercase">{mv.date}</td>
                        </tr>
                     ))}
                  </tbody>
               </table>
            </div>
         </AmberCard>
      </div>
    </div>
  );
};
