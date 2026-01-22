
import React from 'react';
import { AmberCard } from '../../../amber-ui/components/AmberCard';
import { AmberButton } from '../../../amber-ui/components/AmberButton';
import { 
  Package, 
  AlertTriangle, 
  Layers, 
  Tag, 
  Plus, 
  Download, 
  Upload, 
  TrendingUp,
  MoreVertical,
  ArrowRight
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { useNavigate } from 'react-router-dom';
import { cn } from '../../../lib/cn';
import { paths } from '../../../routes/paths';

// Mock Data
const categoryData = [
  { name: 'Electronics', count: 420 },
  { name: 'Fashion', count: 350 },
  { name: 'Home', count: 210 },
  { name: 'Beauty', count: 180 },
  { name: 'Sports', count: 150 },
];

const brandData = [
  { name: 'Nike', value: 30 },
  { name: 'Adidas', value: 25 },
  { name: 'Puma', value: 20 },
  { name: 'Reebok', value: 15 },
  { name: 'Other', value: 10 },
];

const recentProducts = [
  { id: 'SKU-9001', name: 'Wireless Headphones', category: 'Electronics', price: '$129.00', stock: 45, status: 'Active' },
  { id: 'SKU-9002', name: 'Running Shoes', category: 'Fashion', price: '$89.00', stock: 120, status: 'Active' },
  { id: 'SKU-9003', name: 'Coffee Maker', category: 'Home', price: '$49.00', stock: 15, status: 'Low Stock' },
  { id: 'SKU-9004', name: 'Face Cream', category: 'Beauty', price: '$29.00', stock: 200, status: 'Active' },
  { id: 'SKU-9005', name: 'Yoga Mat', category: 'Sports', price: '$35.00', stock: 8, status: 'Critical' },
];

const lowStockAlerts = [
  { id: 1, name: 'Yoga Mat', stock: 8, threshold: 10 },
  { id: 2, name: 'Coffee Maker', stock: 15, threshold: 20 },
  { id: 3, name: 'Gaming Mouse', stock: 2, threshold: 5 },
];

const COLORS = ['#FFC000', '#10B981', '#3B82F6', '#EF4444', '#8B5CF6'];

export const ProductsDashboard = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-8 animate-fade-up">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-zinc-text uppercase italic tracking-tighter">Products Dashboard</h1>
          <p className="text-[10px] font-black text-zinc-muted uppercase tracking-[0.3em] mt-1">Catalog Overview & Performance</p>
        </div>
        <div className="flex gap-2">
          <AmberButton variant="ghost" size="sm">
            <Upload className="w-3.5 h-3.5 mr-2" /> Import
          </AmberButton>
          <AmberButton variant="ghost" size="sm">
            <Download className="w-3.5 h-3.5 mr-2" /> Export
          </AmberButton>
          <AmberButton size="sm" onClick={() => navigate('/catalog/new')}>
            <Plus className="w-3.5 h-3.5 mr-2" /> Add Product
          </AmberButton>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Products', value: '1,248', icon: Package, color: 'text-brand', bg: 'bg-brand/10' },
          { label: 'Low Stock', value: '15', icon: AlertTriangle, color: 'text-warning', bg: 'bg-warning/10' },
          { label: 'Categories', value: '12', icon: Layers, color: 'text-info', bg: 'bg-info/10' },
          { label: 'Active Brands', value: '24', icon: Tag, color: 'text-success', bg: 'bg-success/10' },
        ].map((stat, i) => (
          <AmberCard key={i} className="p-5 flex items-center justify-between hover:border-brand/20 transition-all">
            <div>
              <p className="text-[9px] font-black text-zinc-muted uppercase tracking-widest mb-1">{stat.label}</p>
              <p className="text-2xl font-black text-zinc-text tracking-tighter">{stat.value}</p>
            </div>
            <div className={cn("p-2.5 rounded-sm", stat.bg, stat.color)}>
              <stat.icon className="w-5 h-5" />
            </div>
          </AmberCard>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <AmberCard className="lg:col-span-2 p-6" glass>
          <h3 className="text-xs font-black text-zinc-text uppercase tracking-widest mb-6">Products by Category</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData} barSize={40}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748B', fontSize: 10, fontWeight: 700}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748B', fontSize: 10}} />
                <Tooltip 
                  cursor={{fill: 'rgba(255,255,255,0.05)'}}
                  contentStyle={{ backgroundColor: '#161E36', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '4px', color: '#F1F5F9' }}
                />
                <Bar dataKey="count" fill="#FFC000" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </AmberCard>

        <AmberCard className="p-6" glass>
          <h3 className="text-xs font-black text-zinc-text uppercase tracking-widest mb-6">Brand Distribution</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={brandData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {brandData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                  ))}
                </Pie>
                <Tooltip 
                   contentStyle={{ backgroundColor: '#161E36', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '4px', color: '#F1F5F9' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap gap-2 justify-center mt-4">
            {brandData.map((entry, index) => (
              <div key={index} className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                <span className="text-[9px] font-bold text-zinc-muted uppercase">{entry.name}</span>
              </div>
            ))}
          </div>
        </AmberCard>
      </div>

      {/* Bottom Row: Recent Products & Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Products Table */}
        <AmberCard noPadding className="lg:col-span-2 overflow-hidden">
          <div className="p-5 border-b border-white/5 flex justify-between items-center">
            <h3 className="text-xs font-black text-zinc-text uppercase tracking-widest">Recent Products</h3>
            <button 
              onClick={() => navigate(paths.catalog)}
              className="text-[10px] font-bold text-brand uppercase tracking-widest hover:underline flex items-center gap-1"
            >
              View All <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-white/[0.02] border-b border-white/5">
                  <th className="px-5 py-3 text-[9px] font-black text-zinc-muted uppercase tracking-widest">SKU</th>
                  <th className="px-5 py-3 text-[9px] font-black text-zinc-muted uppercase tracking-widest">Name</th>
                  <th className="px-5 py-3 text-[9px] font-black text-zinc-muted uppercase tracking-widest">Category</th>
                  <th className="px-5 py-3 text-[9px] font-black text-zinc-muted uppercase tracking-widest">Stock</th>
                  <th className="px-5 py-3 text-[9px] font-black text-zinc-muted uppercase tracking-widest">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {recentProducts.map((p) => (
                  <tr key={p.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-5 py-3 font-mono text-[10px] text-zinc-secondary">{p.id}</td>
                    <td className="px-5 py-3 text-xs font-bold text-zinc-text">{p.name}</td>
                    <td className="px-5 py-3 text-[10px] font-medium text-zinc-muted">{p.category}</td>
                    <td className="px-5 py-3 text-[10px] font-bold text-zinc-text">{p.stock}</td>
                    <td className="px-5 py-3">
                      <span className={cn(
                        "text-[9px] font-black px-2 py-0.5 rounded-sm border uppercase tracking-widest",
                        p.status === 'Active' ? "bg-success/10 text-success border-success/20" :
                        p.status === 'Low Stock' ? "bg-warning/10 text-warning border-warning/20" :
                        "bg-danger/10 text-danger border-danger/20"
                      )}>{p.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </AmberCard>

        {/* Low Stock Alerts */}
        <AmberCard className="p-0 overflow-hidden flex flex-col">
          <div className="p-5 border-b border-white/5">
            <h3 className="text-xs font-black text-zinc-text uppercase tracking-widest flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-warning" /> Low Stock Alerts
            </h3>
          </div>
          <div className="flex-1 p-4 space-y-3">
            {lowStockAlerts.map(item => (
              <div key={item.id} className="flex items-center justify-between p-3 bg-obsidian-outer border border-white/5 rounded-sm hover:border-warning/30 transition-all group">
                <div>
                  <p className="text-xs font-bold text-zinc-text">{item.name}</p>
                  <p className="text-[9px] font-medium text-zinc-muted mt-0.5">
                    Stock: <span className="text-warning font-bold">{item.stock}</span> <span className="opacity-50">/ {item.threshold}</span>
                  </p>
                </div>
                <button className="p-1.5 bg-white/5 rounded-sm text-zinc-muted hover:text-brand transition-colors group-hover:bg-white/10">
                  <TrendingUp className="w-4 h-4" />
                </button>
              </div>
            ))}
            {lowStockAlerts.length === 0 && (
              <div className="text-center py-8 text-zinc-muted text-[10px] italic">No low stock items.</div>
            )}
          </div>
          <div className="p-4 border-t border-white/5 bg-white/[0.02]">
            <AmberButton size="sm" variant="secondary" className="w-full justify-center">Restock Planner</AmberButton>
          </div>
        </AmberCard>
      </div>
    </div>
  );
};
