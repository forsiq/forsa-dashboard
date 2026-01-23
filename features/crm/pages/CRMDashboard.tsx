
import React from 'react';
import { AmberCard } from '../../../amber-ui/components/AmberCard';
import { AmberButton } from '../../../amber-ui/components/AmberButton';
import { 
  Users, 
  UserPlus, 
  Briefcase, 
  DollarSign, 
  TrendingUp, 
  ArrowRight,
  Plus, 
  MoreVertical,
  Calendar,
  CheckCircle2,
  Clock,
  Phone,
  Mail,
  MessageSquare
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart, 
  Area
} from 'recharts';
import { cn } from '../../../lib/cn';

// Mock Data
const pipelineData = [
  { stage: 'Lead', count: 45, value: 45000 },
  { stage: 'Qualified', count: 28, value: 84000 },
  { stage: 'Proposal', count: 12, value: 120000 },
  { stage: 'Negotiation', count: 5, value: 95000 },
  { stage: 'Closed Won', count: 18, value: 240000 },
];

const leadGrowthData = [
  { name: 'Mon', leads: 4 },
  { name: 'Tue', leads: 7 },
  { name: 'Wed', leads: 5 },
  { name: 'Thu', leads: 12 },
  { name: 'Fri', leads: 8 },
  { name: 'Sat', leads: 3 },
  { name: 'Sun', leads: 2 },
];

const activities = [
  { id: 1, user: 'Sarah Chen', action: 'emailed', target: 'Acme Corp', desc: 'Sent proposal v2.1', time: '10m ago', icon: Mail, color: 'text-info' },
  { id: 2, user: 'Alex Morgan', action: 'called', target: 'John Doe', desc: 'Discussed renewal terms', time: '1h ago', icon: Phone, color: 'text-success' },
  { id: 3, user: 'System', action: 'created deal', target: 'Big Tech Merger', desc: '$1.2M potential value', time: '3h ago', icon: Briefcase, color: 'text-brand' },
  { id: 4, user: 'James Wilson', action: 'noted', target: 'Stark Ind', desc: 'Meeting scheduled for Friday', time: '5h ago', icon: MessageSquare, color: 'text-warning' },
];

const tasks = [
  { id: 1, title: 'Follow up with Wayne Ent.', due: 'Today', priority: 'High', color: 'text-danger' },
  { id: 2, title: 'Prepare Q3 Report', due: 'Tomorrow', priority: 'Medium', color: 'text-warning' },
  { id: 3, title: 'Update Client Database', due: 'May 28', priority: 'Low', color: 'text-info' },
];

export const CRMDashboard = () => {
  return (
    <div className="space-y-8 animate-fade-up">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
             <Users className="w-5 h-5 text-brand" />
             <h1 className="text-2xl font-black text-zinc-text uppercase italic tracking-tighter">CRM Command</h1>
          </div>
          <p className="text-[10px] font-black text-zinc-muted uppercase tracking-[0.3em] mt-1">Customer Relationships & Pipeline</p>
        </div>
        <div className="flex gap-2">
          <AmberButton variant="secondary" size="sm">
            <Plus className="w-3.5 h-3.5 mr-2" /> Add Lead
          </AmberButton>
          <AmberButton size="sm">
            <Briefcase className="w-3.5 h-3.5 mr-2" /> Create Deal
          </AmberButton>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Customers', value: '1,842', sub: '+12% vs last mo', icon: Users, color: 'text-brand', bg: 'bg-brand/10' },
          { label: 'New Leads', value: '145', sub: 'This Month', icon: UserPlus, color: 'text-info', bg: 'bg-info/10' },
          { label: 'Open Deals', value: '34', sub: '$4.2M Pipeline', icon: Briefcase, color: 'text-warning', bg: 'bg-warning/10' },
          { label: 'Conversion Rate', value: '24%', sub: '+2.4% Increase', icon: TrendingUp, color: 'text-success', bg: 'bg-success/10' },
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

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Col: Pipeline Chart */}
        <AmberCard className="lg:col-span-2 p-6 flex flex-col h-[400px]" glass>
           <div className="flex items-center justify-between mb-6">
              <h3 className="text-xs font-black text-zinc-text uppercase tracking-widest flex items-center gap-2">
                 <DollarSign className="w-4 h-4 text-brand" /> Sales Pipeline Value
              </h3>
           </div>
           <div className="flex-1 w-full text-xs">
              <ResponsiveContainer width="100%" height="100%">
                 <BarChart data={pipelineData} barSize={40}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="stage" axisLine={false} tickLine={false} tick={{fill: '#94A3B8', fontSize: 10, fontWeight: 700}} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#94A3B8', fontSize: 10}} tickFormatter={(val) => `$${val/1000}k`} />
                    <Tooltip 
                       cursor={{fill: 'rgba(255,255,255,0.05)'}}
                       contentStyle={{ backgroundColor: '#161E36', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '4px', color: '#F1F5F9' }}
                       formatter={(val: number) => [`$${val.toLocaleString()}`, 'Value']}
                    />
                    <Bar dataKey="value" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                 </BarChart>
              </ResponsiveContainer>
           </div>
        </AmberCard>

        {/* Right Col: Lead Growth */}
        <AmberCard className="lg:col-span-1 p-6 flex flex-col h-[400px]" glass>
           <div className="flex items-center justify-between mb-6">
              <h3 className="text-xs font-black text-zinc-text uppercase tracking-widest flex items-center gap-2">
                 <TrendingUp className="w-4 h-4 text-success" /> Lead Acquisition
              </h3>
           </div>
           <div className="flex-1 w-full text-xs">
              <ResponsiveContainer width="100%" height="100%">
                 <AreaChart data={leadGrowthData}>
                    <defs>
                       <linearGradient id="colorLeads" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10B981" stopOpacity={0.2}/>
                          <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                       </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94A3B8', fontSize: 10}} dy={10} />
                    <YAxis hide />
                    <Tooltip 
                       contentStyle={{ backgroundColor: '#161E36', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '4px', color: '#F1F5F9' }}
                    />
                    <Area type="monotone" dataKey="leads" stroke="#10B981" strokeWidth={3} fillOpacity={1} fill="url(#colorLeads)" />
                 </AreaChart>
              </ResponsiveContainer>
           </div>
           <div className="mt-4 pt-4 border-t border-white/5 flex justify-between items-center">
              <span className="text-[10px] font-bold text-zinc-muted uppercase tracking-widest">Weekly Total</span>
              <span className="text-xl font-black text-zinc-text">41 Leads</span>
           </div>
        </AmberCard>
      </div>

      {/* Bottom Grid: Activity & Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
         
         {/* Recent Activity */}
         <AmberCard noPadding className="flex flex-col h-full bg-obsidian-panel border-white/5">
            <div className="p-5 border-b border-white/5 flex items-center justify-between">
               <h3 className="text-xs font-black text-zinc-text uppercase tracking-widest flex items-center gap-2">
                  <Clock className="w-4 h-4 text-zinc-muted" /> Recent Activity
               </h3>
               <button className="text-[9px] font-bold text-brand hover:underline uppercase tracking-widest">View All</button>
            </div>
            <div className="flex-1 p-0">
               {activities.map((act, i) => (
                  <div key={act.id} className="flex items-start gap-4 p-4 border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors">
                     <div className={cn("mt-1 w-8 h-8 rounded-full border border-white/10 flex items-center justify-center shrink-0", act.color.replace('text-', 'bg-').replace('500', '500/10'))}>
                        <act.icon className={cn("w-4 h-4", act.color)} />
                     </div>
                     <div className="flex-1 min-w-0">
                        <p className="text-xs text-zinc-text">
                           <span className="font-bold">{act.user}</span> {act.action} <span className="font-bold text-brand">{act.target}</span>
                        </p>
                        <p className="text-[10px] text-zinc-muted mt-0.5">{act.desc}</p>
                     </div>
                     <span className="text-[9px] font-mono text-zinc-muted whitespace-nowrap">{act.time}</span>
                  </div>
               ))}
            </div>
         </AmberCard>

         {/* Upcoming Tasks */}
         <AmberCard noPadding className="flex flex-col h-full bg-obsidian-panel border-white/5">
            <div className="p-5 border-b border-white/5 flex items-center justify-between bg-obsidian-outer/30">
               <h3 className="text-xs font-black text-zinc-text uppercase tracking-widest flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-zinc-muted" /> Tasks Due Soon
               </h3>
               <button className="p-1.5 rounded-sm hover:bg-white/5 text-zinc-muted hover:text-zinc-text transition-colors">
                  <MoreVertical className="w-4 h-4" />
               </button>
            </div>
            <div className="flex-1 p-4 space-y-3">
               {tasks.map((task) => (
                  <div key={task.id} className="flex items-center justify-between p-3 bg-obsidian-outer border border-white/5 rounded-sm hover:border-brand/20 transition-all group cursor-pointer">
                     <div className="flex items-center gap-3">
                        <div className={cn("w-2 h-2 rounded-full", task.color.replace('text-', 'bg-'))} />
                        <div>
                           <p className="text-xs font-bold text-zinc-text group-hover:text-brand transition-colors">{task.title}</p>
                           <p className="text-[9px] text-zinc-muted mt-0.5 uppercase tracking-wide">Due: {task.due}</p>
                        </div>
                     </div>
                     <span className={cn("text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-sm border bg-white/5", task.color.replace('text-', 'border-').replace('500', '500/20'))}>
                        {task.priority}
                     </span>
                  </div>
               ))}
               <button className="w-full py-2 border border-dashed border-white/10 rounded-sm text-[10px] font-bold text-zinc-muted hover:text-brand hover:border-brand/30 transition-all flex items-center justify-center gap-2">
                  <Plus className="w-3 h-3" /> Add Task
               </button>
            </div>
         </AmberCard>
      </div>
    </div>
  );
};
