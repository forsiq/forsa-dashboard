
import React, { useState } from 'react';
import { AmberCard } from '../../../amber-ui/components/AmberCard';
import { AmberButton } from '../../../amber-ui/components/AmberButton';
import { 
  DollarSign, 
  Wallet, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  ArrowUpRight, 
  TrendingUp, 
  Download, 
  Plus, 
  Mail,
  MoreVertical,
  Calendar
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  BarChart, 
  Bar 
} from 'recharts';
import { cn } from '../../../lib/cn';

// --- Mock Data ---
const COLLECTION_DATA = [
  { month: 'Jan', collected: 24000, outstanding: 120000 },
  { month: 'Feb', collected: 45000, outstanding: 110000 },
  { month: 'Mar', collected: 32000, outstanding: 105000 },
  { month: 'Apr', collected: 68000, outstanding: 85000 },
  { month: 'May', collected: 52000, outstanding: 92000 },
  { month: 'Jun', collected: 12000, outstanding: 125000 }, // Current month partial
];

const OVERDUE_ALERTS = [
  { id: 'AL-1', debtor: 'TechNova Solutions', amount: 12500, daysOverdue: 45, status: 'Critical' },
  { id: 'AL-2', debtor: 'BlueSky Logistics', amount: 8400, daysOverdue: 15, status: 'Warning' },
  { id: 'AL-3', debtor: 'Rapid Ventures', amount: 3200, daysOverdue: 62, status: 'Critical' },
];

const TOP_DEBTORS = [
  { id: 'D-1', name: 'TechNova Solutions', totalDebt: 45200, status: 'High Risk' },
  { id: 'D-2', name: 'Global Corp', totalDebt: 28000, status: 'Medium' },
  { id: 'D-3', name: 'Stark Industries', totalDebt: 15500, status: 'Low' },
  { id: 'D-4', name: 'Wayne Enterprises', totalDebt: 12000, status: 'Low' },
];

const RECENT_PAYMENTS = [
  { id: 'PAY-882', debtor: 'Acme Corp', amount: 5000, date: 'Today, 10:42 AM', method: 'Wire' },
  { id: 'PAY-881', debtor: 'Cyberdyne', amount: 1250, date: 'Yesterday', method: 'Stripe' },
  { id: 'PAY-880', debtor: 'Initech', amount: 8900, date: 'May 18, 2025', method: 'Check' },
];

export const DebtDashboard = () => {
  return (
    <div className="space-y-8 animate-fade-up">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
             <Wallet className="w-5 h-5 text-brand" />
             <h1 className="text-2xl font-black text-zinc-text uppercase italic tracking-tighter">Debt Command Center</h1>
          </div>
          <p className="text-[10px] font-black text-zinc-muted uppercase tracking-[0.3em] mt-1">Receivables & Collection Analytics</p>
        </div>
        <div className="flex gap-2">
          <AmberButton variant="ghost" size="sm">
             <Download className="w-3.5 h-3.5 mr-2" /> Export Report
          </AmberButton>
          <AmberButton size="sm">
             <Plus className="w-3.5 h-3.5 mr-2" /> Record Payment
          </AmberButton>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Outstanding Debt', value: '$1.25M', sub: '+8% vs last month', icon: AlertTriangle, color: 'text-danger', bg: 'bg-danger/10', border: 'border-danger/20' },
          { label: 'Collected (MTD)', value: '$64K', sub: 'Target: $120K', icon: CheckCircle2, color: 'text-success', bg: 'bg-success/10', border: 'border-success/20' },
          { label: 'Pending Processing', value: '$12.5K', sub: 'In Clearing', icon: Clock, color: 'text-info', bg: 'bg-info/10', border: 'border-info/20' },
          { label: 'At Risk (>90 Days)', value: '14', sub: 'Accounts Critical', icon: TrendingUp, color: 'text-warning', bg: 'bg-warning/10', border: 'border-warning/20' },
        ].map((stat, i) => (
          <AmberCard key={i} className={cn("p-5 flex flex-col justify-between hover:border-white/20 transition-all cursor-default group", stat.border)}>
             <div className="flex justify-between items-start">
                <div>
                   <p className="text-[10px] font-black text-zinc-muted uppercase tracking-widest mb-1">{stat.label}</p>
                   <p className="text-2xl font-black text-zinc-text tracking-tighter">{stat.value}</p>
                </div>
                <div className={cn("p-2.5 rounded-sm", stat.bg, stat.color)}>
                   <stat.icon className="w-5 h-5" />
                </div>
             </div>
             <div className="mt-4 pt-3 border-t border-white/5 flex items-center gap-2">
                <span className={cn("text-[9px] font-bold uppercase tracking-tight opacity-80", stat.color)}>{stat.sub}</span>
             </div>
          </AmberCard>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
         
         {/* Left Column (2/3) */}
         <div className="xl:col-span-2 space-y-6">
            
            {/* Collection Chart */}
            <AmberCard className="p-6 h-[350px] flex flex-col" glass>
               <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xs font-black text-zinc-text uppercase tracking-widest flex items-center gap-2">
                     <TrendingUp className="w-4 h-4 text-brand" /> Collection Velocity (6 Months)
                  </h3>
               </div>
               <div className="flex-1 w-full text-xs">
                  <ResponsiveContainer width="100%" height="100%">
                     <AreaChart data={COLLECTION_DATA}>
                        <defs>
                           <linearGradient id="colorCollected" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#10B981" stopOpacity={0.2}/>
                              <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                           </linearGradient>
                           <linearGradient id="colorOutstanding" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#EF4444" stopOpacity={0.1}/>
                              <stop offset="95%" stopColor="#EF4444" stopOpacity={0}/>
                           </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                        <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#94A3B8', fontSize: 10}} dy={10} />
                        <YAxis axisLine={false} tickLine={false} tick={{fill: '#94A3B8', fontSize: 10}} tickFormatter={(val) => `$${val/1000}k`} />
                        <Tooltip 
                           contentStyle={{ backgroundColor: '#161E36', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '4px', color: '#F1F5F9', fontSize: '11px' }}
                        />
                        <Area type="monotone" dataKey="collected" stroke="#10B981" strokeWidth={2} fillOpacity={1} fill="url(#colorCollected)" name="Collected" />
                        <Area type="monotone" dataKey="outstanding" stroke="#EF4444" strokeWidth={2} fillOpacity={1} fill="url(#colorOutstanding)" name="Outstanding" />
                     </AreaChart>
                  </ResponsiveContainer>
               </div>
            </AmberCard>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               {/* Overdue Alerts */}
               <AmberCard className="flex flex-col h-[350px] p-0 overflow-hidden bg-obsidian-panel/50">
                  <div className="p-5 border-b border-white/5 bg-danger/5 flex justify-between items-center">
                     <h3 className="text-xs font-black text-danger uppercase tracking-widest flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4" /> Priority Alerts
                     </h3>
                     <span className="bg-danger/20 text-danger text-[9px] font-bold px-1.5 py-0.5 rounded-sm">{OVERDUE_ALERTS.length}</span>
                  </div>
                  <div className="flex-1 overflow-y-auto p-4 space-y-3">
                     {OVERDUE_ALERTS.map(alert => (
                        <div key={alert.id} className="p-3 bg-obsidian-outer border border-white/5 rounded-sm flex flex-col gap-2 group hover:border-danger/30 transition-all">
                           <div className="flex justify-between items-start">
                              <span className="text-xs font-bold text-zinc-text">{alert.debtor}</span>
                              <span className="text-[10px] font-black text-danger uppercase tracking-widest">{alert.daysOverdue} Days Late</span>
                           </div>
                           <div className="flex justify-between items-end">
                              <span className="text-lg font-black text-zinc-text">${alert.amount.toLocaleString()}</span>
                              <AmberButton size="sm" variant="secondary" className="h-7 text-[9px] px-3 border-danger/20 hover:bg-danger/10 text-danger">
                                 Remind
                              </AmberButton>
                           </div>
                        </div>
                     ))}
                  </div>
               </AmberCard>

               {/* Recent Payments */}
               <AmberCard className="flex flex-col h-[350px] p-0 overflow-hidden bg-obsidian-panel/50">
                  <div className="p-5 border-b border-white/5 bg-success/5 flex justify-between items-center">
                     <h3 className="text-xs font-black text-success uppercase tracking-widest flex items-center gap-2">
                        <DollarSign className="w-4 h-4" /> Recent Payments
                     </h3>
                  </div>
                  <div className="flex-1 overflow-y-auto p-0">
                     <table className="w-full text-left">
                        <tbody className="divide-y divide-white/5">
                           {RECENT_PAYMENTS.map(pay => (
                              <tr key={pay.id} className="hover:bg-white/[0.02]">
                                 <td className="px-5 py-3">
                                    <p className="text-[10px] font-bold text-zinc-text">{pay.debtor}</p>
                                    <p className="text-[9px] text-zinc-muted">{pay.date}</p>
                                 </td>
                                 <td className="px-5 py-3 text-right">
                                    <p className="text-xs font-bold text-success">+${pay.amount.toLocaleString()}</p>
                                    <p className="text-[9px] text-zinc-muted uppercase">{pay.method}</p>
                                 </td>
                              </tr>
                           ))}
                        </tbody>
                     </table>
                  </div>
                  <div className="p-3 border-t border-white/5 bg-obsidian-outer/30 text-center">
                     <button className="text-[9px] font-bold text-zinc-muted hover:text-brand uppercase tracking-widest">View All Transactions</button>
                  </div>
               </AmberCard>
            </div>
         </div>

         {/* Right Column (1/3) */}
         <div className="xl:col-span-1 space-y-6">
            
            {/* Top Debtors */}
            <AmberCard className="p-0 overflow-hidden flex flex-col h-full max-h-[400px]">
               <div className="p-5 border-b border-white/5">
                  <h3 className="text-xs font-black text-zinc-text uppercase tracking-widest">Top Debtors</h3>
               </div>
               <div className="flex-1 overflow-y-auto p-0">
                  <table className="w-full text-left">
                     <thead className="bg-white/[0.02] text-[9px] font-black text-zinc-muted uppercase tracking-widest">
                        <tr>
                           <th className="px-5 py-3">Entity</th>
                           <th className="px-5 py-3 text-right">Total Owed</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-white/5">
                        {TOP_DEBTORS.map((debtor, i) => (
                           <tr key={debtor.id} className="hover:bg-white/[0.02]">
                              <td className="px-5 py-3">
                                 <p className="text-[10px] font-bold text-zinc-text">{debtor.name}</p>
                                 <span className={cn(
                                    "text-[8px] font-black uppercase px-1.5 py-0.5 rounded-sm inline-block mt-1",
                                    debtor.status === 'High Risk' ? 'bg-danger/20 text-danger' : 'bg-warning/10 text-warning'
                                 )}>
                                    {debtor.status}
                                 </span>
                              </td>
                              <td className="px-5 py-3 text-right text-xs font-mono font-bold text-zinc-text">
                                 ${debtor.totalDebt.toLocaleString()}
                              </td>
                           </tr>
                        ))}
                     </tbody>
                  </table>
               </div>
               <div className="p-4 border-t border-white/5 bg-obsidian-outer/30">
                  <AmberButton variant="secondary" size="sm" className="w-full justify-center">View All Debtors</AmberButton>
               </div>
            </AmberCard>

            {/* Payment Schedule */}
            <AmberCard className="p-5 bg-obsidian-panel/40 border-brand/10">
               <h3 className="text-xs font-black text-brand uppercase tracking-widest mb-4 flex items-center gap-2">
                  <Calendar className="w-4 h-4" /> Expected Payments
               </h3>
               <div className="space-y-4 relative pl-3 before:absolute before:left-[9px] before:top-2 before:bottom-2 before:w-px before:bg-white/10">
                  <div className="relative pl-8">
                     <div className="absolute left-0 top-1 w-5 h-5 rounded-full bg-obsidian-outer border border-brand/30 flex items-center justify-center text-[9px] font-bold text-brand">1</div>
                     <div className="flex justify-between items-start">
                        <div>
                           <p className="text-[10px] font-bold text-zinc-text">Wayne Enterprises</p>
                           <p className="text-[9px] text-zinc-muted">Invoice #INV-2044</p>
                        </div>
                        <span className="text-[10px] font-bold text-zinc-text">$4,200</span>
                     </div>
                     <span className="text-[9px] font-mono text-zinc-muted uppercase mt-1 block">Due Tomorrow</span>
                  </div>
                  <div className="relative pl-8">
                     <div className="absolute left-0 top-1 w-5 h-5 rounded-full bg-obsidian-outer border border-white/10 flex items-center justify-center text-[9px] font-bold text-zinc-muted">2</div>
                     <div className="flex justify-between items-start">
                        <div>
                           <p className="text-[10px] font-bold text-zinc-text">Cyberdyne Systems</p>
                           <p className="text-[9px] text-zinc-muted">Retainer Fee</p>
                        </div>
                        <span className="text-[10px] font-bold text-zinc-text">$1,500</span>
                     </div>
                     <span className="text-[9px] font-mono text-zinc-muted uppercase mt-1 block">Due in 3 Days</span>
                  </div>
               </div>
            </AmberCard>

            {/* Quick Actions */}
            <div className="space-y-2">
               <AmberButton className="w-full justify-between group">
                  <span className="flex items-center gap-2"><Mail className="w-4 h-4" /> Send Bulk Reminders</span>
                  <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
               </AmberButton>
            </div>
         </div>
      </div>
    </div>
  );
};
