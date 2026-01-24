
import React from 'react';
import { AmberCard } from '../../../amber-ui/components/AmberCard';
import { AmberButton } from '../../../amber-ui/components/AmberButton';
import { 
  Wrench, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  DollarSign, 
  User, 
  Calendar, 
  Plus, 
  ArrowRight,
  TrendingUp,
  Cpu,
  Smartphone,
  Laptop
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
  Cell,
  Legend
} from 'recharts';
import { cn } from '../../../lib/cn';
import { useLanguage } from '../../../amber-ui/contexts/LanguageContext';

const REVENUE_DATA = [
  { name: 'Mon', revenue: 1200 },
  { name: 'Tue', revenue: 1800 },
  { name: 'Wed', revenue: 1500 },
  { name: 'Thu', revenue: 2200 },
  { name: 'Fri', revenue: 2600 },
  { name: 'Sat', revenue: 3100 },
  { name: 'Sun', revenue: 1900 },
];

const CATEGORY_DATA = [
  { name: 'Screen', value: 45, color: '#3B82F6' },
  { name: 'Battery', value: 25, color: '#10B981' },
  { name: 'Logic Board', value: 15, color: '#F59E0B' },
  { name: 'Water Damage', value: 10, color: '#EF4444' },
  { name: 'Other', value: 5, color: '#8B5CF6' },
];

const TECHNICIANS = [
  { id: 't1', name: 'Alex Morgan', status: 'Available', avatar: 'AM', skills: ['L3', 'Board'] },
  { id: 't2', name: 'Sarah Chen', status: 'Busy', avatar: 'SC', skills: ['Screen', 'Bat'] },
  { id: 't3', name: 'Mike Ross', status: 'Busy', avatar: 'MR', skills: ['L2'] },
  { id: 't4', name: 'Elena Fisher', status: 'Off', avatar: 'EF', skills: ['Software'] },
];

const PENDING_APPROVALS = [
  { id: 'REP-1024', device: 'MacBook Pro 16"', issue: 'Liquid Damage', estimate: '$850.00', customer: 'John Doe', time: '2h ago' },
  { id: 'REP-1025', device: 'iPhone 14', issue: 'Screen Crack', estimate: '$220.00', customer: 'Alice Smith', time: '4h ago' },
  { id: 'REP-1026', device: 'iPad Air', issue: 'No Power', estimate: '$150.00', customer: 'Bob Jones', time: '1d ago' },
];

export const RepairDashboard = () => {
  const { t } = useLanguage();

  return (
    <div className="space-y-8 animate-fade-up">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
             <Wrench className="w-5 h-5 text-brand" />
             <h1 className="text-2xl font-black text-zinc-text uppercase italic tracking-tighter">{t('repair.title')}</h1>
          </div>
          <p className="text-[10px] font-black text-zinc-muted uppercase tracking-[0.3em] mt-1">{t('repair.subtitle')}</p>
        </div>
        <div className="flex gap-2">
          <AmberButton variant="secondary" size="sm">
            <Calendar className="w-3.5 h-3.5 mr-2" /> View Schedule
          </AmberButton>
          <AmberButton variant="secondary" size="sm">
            <User className="w-3.5 h-3.5 mr-2" /> Assign Tech
          </AmberButton>
          <AmberButton size="sm">
            <Plus className="w-3.5 h-3.5 mr-2" /> New Repair
          </AmberButton>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: t('repair.open'), value: '18', sub: 'In Queue', icon: AlertCircle, color: 'text-brand', bg: 'bg-brand/10' },
          { label: t('repair.in_progress'), value: '8', sub: 'On Bench', icon: Wrench, color: 'text-info', bg: 'bg-info/10' },
          { label: t('repair.completed_today'), value: '12', sub: '+3 vs yesterday', icon: CheckCircle2, color: 'text-success', bg: 'bg-success/10' },
          { label: t('repair.pending_approval'), value: '5', sub: 'Waiting on Customer', icon: Clock, color: 'text-warning', bg: 'bg-warning/10' },
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

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
         
         <div className="xl:col-span-2 space-y-6">
            <AmberCard className="p-6 h-[350px] flex flex-col" glass>
               <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xs font-black text-zinc-text uppercase tracking-widest flex items-center gap-2">
                     <DollarSign className="w-4 h-4 text-brand" /> {t('repair.revenue_week')}
                  </h3>
                  <div className="text-right">
                     <p className="text-lg font-black text-zinc-text">$14,300</p>
                     <p className="text-[9px] font-bold text-success uppercase tracking-wide">+12% Growth</p>
                  </div>
               </div>
               <div className="flex-1 w-full text-xs" dir="ltr">
                  <ResponsiveContainer width="100%" height="100%">
                     <AreaChart data={REVENUE_DATA}>
                        <defs>
                           <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#10B981" stopOpacity={0.2}/>
                              <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                           </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94A3B8', fontSize: 10}} dy={10} />
                        <YAxis axisLine={false} tickLine={false} tick={{fill: '#94A3B8', fontSize: 10}} tickFormatter={(val) => `$${val}`} />
                        <Tooltip 
                           contentStyle={{ backgroundColor: '#161E36', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '4px', color: '#F1F5F9', fontSize: '11px' }}
                           formatter={(value: number) => [`$${value}`, 'Revenue']}
                        />
                        <Area type="monotone" dataKey="revenue" stroke="#10B981" strokeWidth={2} fillOpacity={1} fill="url(#colorRev)" />
                     </AreaChart>
                  </ResponsiveContainer>
               </div>
            </AmberCard>

            <AmberCard noPadding className="flex flex-col bg-obsidian-panel/50">
               <div className="p-5 border-b border-white/5 flex items-center justify-between bg-warning/5">
                  <h3 className="text-xs font-black text-warning uppercase tracking-widest flex items-center gap-2">
                     <AlertCircle className="w-4 h-4" /> {t('repair.pending_approvals')}
                  </h3>
                  <button className="text-[9px] font-bold text-warning hover:text-warning/80 uppercase tracking-widest">{t('common.view_all')}</button>
               </div>
               <div className="divide-y divide-white/5">
                  {PENDING_APPROVALS.map((item) => (
                     <div key={item.id} className="p-4 hover:bg-white/[0.02] transition-colors group flex items-center justify-between">
                        <div className="flex items-center gap-4">
                           <div className="w-10 h-10 bg-obsidian-outer border border-white/5 rounded-sm flex items-center justify-center text-zinc-muted">
                              {item.device.includes('iPhone') ? <Smartphone className="w-5 h-5" /> : 
                               item.device.includes('MacBook') ? <Laptop className="w-5 h-5" /> : 
                               <Cpu className="w-5 h-5" />}
                           </div>
                           <div>
                              <div className="flex items-center gap-2">
                                 <span className="text-sm font-bold text-zinc-text">{item.device}</span>
                                 <span className="text-[9px] font-mono text-zinc-muted bg-white/5 px-1.5 rounded">{item.id}</span>
                              </div>
                              <p className="text-[10px] text-zinc-muted mt-0.5">
                                 <span className="text-brand font-bold">{item.issue}</span> • {item.customer}
                              </p>
                           </div>
                        </div>
                        <div className="text-right flex flex-col items-end gap-1">
                           <p className="text-sm font-black text-zinc-text">{item.estimate}</p>
                           <p className="text-[9px] font-bold text-zinc-muted uppercase tracking-widest">{item.time}</p>
                        </div>
                     </div>
                  ))}
               </div>
            </AmberCard>
         </div>

         <div className="xl:col-span-1 space-y-6">
            <AmberCard className="p-5 bg-obsidian-panel/40">
               <h3 className="text-xs font-black text-zinc-text uppercase tracking-widest mb-5 flex items-center gap-2">
                  <User className="w-4 h-4 text-zinc-muted" /> {t('repair.tech_status')}
               </h3>
               <div className="space-y-4">
                  {TECHNICIANS.map(tech => (
                     <div key={tech.id} className="flex items-center justify-between p-3 bg-obsidian-outer border border-white/5 rounded-sm">
                        <div className="flex items-center gap-3">
                           <div className="relative">
                              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-bold text-zinc-text border border-white/5">
                                 {tech.avatar}
                              </div>
                              <div className={cn(
                                 "absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-obsidian-outer",
                                 tech.status === 'Available' ? "bg-success" : 
                                 tech.status === 'Busy' ? "bg-warning" : "bg-zinc-muted"
                              )} />
                           </div>
                           <div>
                              <p className="text-xs font-bold text-zinc-text">{tech.name}</p>
                              <div className="flex gap-1 mt-1">
                                 {tech.skills.map(skill => (
                                    <span key={skill} className="text-[8px] bg-white/5 px-1 rounded text-zinc-muted uppercase">{skill}</span>
                                 ))}
                              </div>
                           </div>
                        </div>
                        <span className={cn(
                           "text-[9px] font-black uppercase tracking-tight",
                           tech.status === 'Available' ? "text-success" : 
                           tech.status === 'Busy' ? "text-warning" : "text-zinc-muted"
                        )}>
                           {tech.status}
                        </span>
                     </div>
                  ))}
               </div>
            </AmberCard>

            <AmberCard className="p-6 h-[300px] flex flex-col" glass>
               <h3 className="text-xs font-black text-zinc-text uppercase tracking-widest mb-2">{t('repair.distribution')}</h3>
               <div className="flex-1 w-full relative">
                  <ResponsiveContainer width="100%" height="100%">
                     <PieChart>
                        <Pie
                           data={CATEGORY_DATA}
                           innerRadius={60}
                           outerRadius={80}
                           paddingAngle={5}
                           dataKey="value"
                        >
                           {CATEGORY_DATA.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                           ))}
                        </Pie>
                        <Tooltip 
                           contentStyle={{ backgroundColor: '#161E36', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '4px', color: '#F1F5F9', fontSize: '11px' }}
                        />
                        <Legend wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }} />
                     </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none mb-6">
                     <div className="text-center">
                        <span className="text-xl font-black text-zinc-text">100%</span>
                     </div>
                  </div>
               </div>
            </AmberCard>
         </div>
      </div>
    </div>
  );
};
