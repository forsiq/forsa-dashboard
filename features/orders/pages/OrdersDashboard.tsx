
import React from 'react';
import { AmberCard } from '../../../amber-ui/components/AmberCard';
import { AmberButton } from '../../../amber-ui/components/AmberButton';
import { 
  ShoppingCart, 
  Package, 
  DollarSign, 
  Truck, 
  Plus, 
  ArrowRight, 
  Download, 
  CheckCircle2, 
  Clock, 
  AlertTriangle,
  ChevronRight,
  TrendingUp,
  MoreVertical
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
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
const revenueData = [
  { name: 'Mon', revenue: 4200 },
  { name: 'Tue', revenue: 3800 },
  { name: 'Wed', revenue: 5100 },
  { name: 'Thu', revenue: 4800 },
  { name: 'Fri', revenue: 6200 },
  { name: 'Sat', revenue: 7400 },
  { name: 'Sun', revenue: 6800 },
];

const statusData = [
  { name: 'Fulfilled', value: 65, color: '#10B981' },
  { name: 'Processing', value: 25, color: '#3B82F6' },
  { name: 'Pending', value: 8, color: '#F59E0B' },
  { name: 'Failed', value: 2, color: '#EF4444' },
];

const pendingActions = [
  { id: 1, title: 'Order #2004 Requires Shipping', time: '10m ago', type: 'urgent' },
  { id: 2, title: 'Return Request #882 for Review', time: '45m ago', type: 'warning' },
  { id: 3, title: 'Verify Payment for Order #1998', time: '2h ago', type: 'info' },
];

const recentOrders = [
  { id: 'ORD-2025-001', customer: 'Acme Corp', amount: '$4,290.00', status: 'Fulfilled', date: '2 hrs ago' },
  { id: 'ORD-2025-002', customer: 'Globex Inc', amount: '$1,150.00', status: 'Processing', date: '4 hrs ago' },
  { id: 'ORD-2025-003', customer: 'Soylent Corp', amount: '$890.50', status: 'Pending', date: '6 hrs ago' },
  { id: 'ORD-2025-004', customer: 'Initech', amount: '$12,400.00', status: 'Fulfilled', date: 'Yesterday' },
];

export const OrdersDashboard = () => {
  const navigate = useNavigate();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Fulfilled': return 'text-success bg-success/10 border-success/20';
      case 'Processing': return 'text-info bg-info/10 border-info/20';
      case 'Pending': return 'text-warning bg-warning/10 border-warning/20';
      case 'Failed': return 'text-danger bg-danger/10 border-danger/20';
      default: return 'text-zinc-muted';
    }
  };

  return (
    <div className="space-y-8 animate-fade-up">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
             <ShoppingCart className="w-5 h-5 text-brand" />
             <h1 className="text-2xl font-black text-zinc-text uppercase italic tracking-tighter">Orders Command</h1>
          </div>
          <p className="text-[10px] font-black text-zinc-muted uppercase tracking-[0.3em] mt-1">Transaction processing and fulfillment center</p>
        </div>
        <div className="flex gap-2">
          <AmberButton variant="ghost" size="sm">
            <Download className="w-3.5 h-3.5 mr-2" /> Export Report
          </AmberButton>
          <AmberButton size="sm" onClick={() => navigate(paths.orders)}>
            <Plus className="w-3.5 h-3.5 mr-2" /> Create Order
          </AmberButton>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Orders', value: '1,240', sub: '+12% this week', icon: Package, color: 'text-brand', bg: 'bg-brand/10' },
          { label: 'Pending Fulfillment', value: '45', sub: 'Action Required', icon: Clock, color: 'text-warning', bg: 'bg-warning/10' },
          { label: "Today's Revenue", value: '$12,400', sub: '+8% vs yesterday', icon: DollarSign, color: 'text-success', bg: 'bg-success/10' },
          { label: 'Ready to Ship', value: '12', sub: 'Awaiting Pickup', icon: Truck, color: 'text-info', bg: 'bg-info/10' },
        ].map((stat, i) => (
          <AmberCard key={i} className="p-5 flex items-center justify-between hover:border-brand/20 transition-all cursor-default">
            <div>
              <p className="text-[9px] font-black text-zinc-muted uppercase tracking-widest mb-1">{stat.label}</p>
              <p className="text-2xl font-black text-zinc-text tracking-tighter">{stat.value}</p>
              <p className="text-[9px] font-bold text-zinc-muted uppercase tracking-tight mt-1 opacity-70 flex items-center gap-1">
                 <TrendingUp className="w-3 h-3" /> {stat.sub}
              </p>
            </div>
            <div className={cn("p-2.5 rounded-sm", stat.bg, stat.color)}>
              <stat.icon className="w-5 h-5" />
            </div>
          </AmberCard>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column (2/3) */}
        <div className="lg:col-span-2 space-y-6">
           
           {/* Revenue Chart */}
           <AmberCard className="p-6 h-[350px] flex flex-col" glass>
              <div className="flex items-center justify-between mb-6">
                 <h3 className="text-xs font-black text-zinc-text uppercase tracking-widest flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-brand" /> Revenue Trends (7 Days)
                 </h3>
              </div>
              <div className="flex-1 w-full text-xs">
                 <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={revenueData}>
                       <defs>
                          <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                             <stop offset="5%" stopColor="#FFC000" stopOpacity={0.2}/>
                             <stop offset="95%" stopColor="#FFC000" stopOpacity={0}/>
                          </linearGradient>
                       </defs>
                       <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                       <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94A3B8', fontSize: 10}} />
                       <YAxis axisLine={false} tickLine={false} tick={{fill: '#94A3B8', fontSize: 10}} tickFormatter={(val) => `$${val}`} />
                       <Tooltip 
                          contentStyle={{ backgroundColor: '#161E36', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '4px', color: '#F1F5F9', fontSize: '11px' }}
                          formatter={(value: number) => [`$${value}`, 'Revenue']}
                       />
                       <Area type="monotone" dataKey="revenue" stroke="#FFC000" strokeWidth={2} fillOpacity={1} fill="url(#colorRev)" />
                    </AreaChart>
                 </ResponsiveContainer>
              </div>
           </AmberCard>

           {/* Recent Orders */}
           <AmberCard noPadding className="flex flex-col overflow-hidden">
              <div className="p-5 border-b border-white/5 flex items-center justify-between">
                 <h3 className="text-xs font-black text-zinc-text uppercase tracking-widest flex items-center gap-2">
                    <ShoppingCart className="w-4 h-4 text-zinc-muted" /> Recent Orders
                 </h3>
                 <button 
                    onClick={() => navigate(paths.orders)}
                    className="text-[10px] font-bold text-brand hover:underline uppercase tracking-widest flex items-center gap-1"
                 >
                    View All <ArrowRight className="w-3 h-3" />
                 </button>
              </div>
              <div className="overflow-x-auto">
                 <table className="w-full text-left">
                    <thead>
                       <tr className="bg-white/[0.02] border-b border-white/5 text-[9px] font-black text-zinc-muted uppercase tracking-widest">
                          <th className="px-5 py-3">Order ID</th>
                          <th className="px-5 py-3">Customer</th>
                          <th className="px-5 py-3">Amount</th>
                          <th className="px-5 py-3">Status</th>
                          <th className="px-5 py-3 text-right">Date</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-xs font-medium">
                       {recentOrders.map((order) => (
                          <tr key={order.id} className="hover:bg-white/[0.02] transition-colors">
                             <td className="px-5 py-3 font-mono text-[10px] text-zinc-secondary">{order.id}</td>
                             <td className="px-5 py-3 font-bold text-zinc-text">{order.customer}</td>
                             <td className="px-5 py-3 text-zinc-text">{order.amount}</td>
                             <td className="px-5 py-3">
                                <span className={cn(
                                   "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-sm border text-[9px] font-black uppercase tracking-widest",
                                   getStatusColor(order.status)
                                )}>
                                   {order.status}
                                </span>
                             </td>
                             <td className="px-5 py-3 text-right text-zinc-muted text-[10px] uppercase">{order.date}</td>
                          </tr>
                       ))}
                    </tbody>
                 </table>
              </div>
           </AmberCard>
        </div>

        {/* Right Column (1/3) */}
        <div className="lg:col-span-1 space-y-6">
           
           {/* Status Breakdown */}
           <AmberCard className="p-6 h-[300px] flex flex-col" glass>
              <h3 className="text-xs font-black text-zinc-text uppercase tracking-widest mb-4">Status Breakdown</h3>
              <div className="flex-1 w-full relative">
                 <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                       <Pie
                          data={statusData}
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                       >
                          {statusData.map((entry, index) => (
                             <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                          ))}
                       </Pie>
                       <Tooltip 
                          contentStyle={{ backgroundColor: '#161E36', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '4px', color: '#F1F5F9', fontSize: '11px' }}
                       />
                    </PieChart>
                 </ResponsiveContainer>
                 {/* Center Label */}
                 <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="text-center">
                       <span className="text-2xl font-black text-zinc-text">100%</span>
                       <p className="text-[9px] font-bold text-zinc-muted uppercase">Distribution</p>
                    </div>
                 </div>
              </div>
              <div className="flex flex-wrap gap-3 justify-center mt-2">
                 {statusData.map((entry, index) => (
                    <div key={index} className="flex items-center gap-1.5">
                       <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                       <span className="text-[9px] font-bold text-zinc-muted uppercase">{entry.name}</span>
                    </div>
                 ))}
              </div>
           </AmberCard>

           {/* Pending Actions */}
           <AmberCard className="p-0 overflow-hidden flex flex-col bg-obsidian-panel/50">
              <div className="p-5 border-b border-white/5 bg-warning/5">
                 <h3 className="text-xs font-black text-warning uppercase tracking-widest flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" /> Pending Actions
                 </h3>
              </div>
              <div className="flex-1 divide-y divide-white/5">
                 {pendingActions.map(action => (
                    <div key={action.id} className="p-4 hover:bg-white/[0.02] transition-colors group">
                       <div className="flex justify-between items-start mb-1">
                          <p className="text-xs font-bold text-zinc-text leading-tight">{action.title}</p>
                          <span className="text-[9px] font-black text-zinc-muted uppercase whitespace-nowrap">{action.time}</span>
                       </div>
                       <div className="flex justify-end gap-2 mt-3 opacity-60 group-hover:opacity-100 transition-opacity">
                          <button className="px-3 py-1 bg-white/5 hover:bg-brand/10 border border-white/10 hover:border-brand/30 rounded-sm text-[9px] font-black text-zinc-muted hover:text-brand uppercase tracking-widest transition-all">
                             Review
                          </button>
                          <button className="px-3 py-1 bg-brand text-obsidian-outer rounded-sm text-[9px] font-black uppercase tracking-widest hover:opacity-90 transition-all">
                             Process
                          </button>
                       </div>
                    </div>
                 ))}
              </div>
           </AmberCard>

           {/* Quick Link */}
           <button 
             onClick={() => navigate(paths.orders)}
             className="w-full py-4 border-2 border-dashed border-white/10 rounded-xl flex flex-col items-center justify-center gap-2 text-zinc-muted hover:text-brand hover:border-brand/30 hover:bg-white/[0.02] transition-all group"
           >
              <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                 <CheckCircle2 className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest">Process Batch Orders</span>
           </button>
        </div>
      </div>
    </div>
  );
};
