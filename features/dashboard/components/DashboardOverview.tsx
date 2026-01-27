
import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { AmberCard } from '../../../amber-ui/components/AmberCard';
import { AmberButton } from '../../../amber-ui/components/AmberButton';
import { 
  Package, 
  ShoppingCart, 
  Users, 
  DollarSign, 
  Settings, 
  Plus, 
  ExternalLink,
  X,
  CheckCircle2,
  Circle,
  Clock,
  AlertCircle,
  Activity,
  CreditCard,
  FileText,
  Database,
  ShieldCheck,
  Search,
  LayoutGrid,
  ArrowRight,
  Box
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer
} from 'recharts';
import { useLanguage } from '../../../amber-ui/contexts/LanguageContext';
import { useTheme } from '../../../amber-ui/contexts/ThemeContext';
import { useProjects } from '../../../contexts/ProjectContext';
import { useNavigate } from 'react-router-dom';
import { cn } from '../../../lib/cn';
import { paths } from '../../../routes/paths';

// --- Configuration Data ---

interface ActionDef {
  id: string;
  label: string;
  path: string;
  icon: any;
  color: string; // Text color
  bg: string;    // Background color for icon container or card
  border: string;
}

const ACTION_DEFINITIONS: Record<string, ActionDef> = {
  add_product: { 
    id: 'add_product', label: 'Add Product', path: '/catalog/new', 
    icon: Plus, color: 'text-brand', bg: 'bg-brand/10', border: 'border-brand/20' 
  },
  master_catalog: { 
    id: 'master_catalog', label: 'Master Catalog', path: paths.catalog, 
    icon: Package, color: 'text-zinc-text', bg: 'bg-white/5', border: 'border-white/10' 
  },
  inventory_hub: { 
    id: 'inventory_hub', label: 'Inventory Hub', path: paths.inventory, 
    icon: Box, color: 'text-info', bg: 'bg-info/10', border: 'border-info/20' 
  },
  create_order: { 
    id: 'create_order', label: 'Create Order', path: paths.pos, 
    icon: ShoppingCart, color: 'text-info', bg: 'bg-info/10', border: 'border-info/20' 
  },
  order_mgmt: { 
    id: 'order_mgmt', label: 'Order Management', path: paths.orders, 
    icon: FileText, color: 'text-zinc-text', bg: 'bg-white/5', border: 'border-white/10' 
  },
  analytics: { 
    id: 'analytics', label: 'Analytics Hub', path: paths.analytics, 
    icon: Activity, color: 'text-success', bg: 'bg-success/10', border: 'border-success/20' 
  },
  billing: { 
    id: 'billing', label: 'Billing & Plan', path: paths.billing, 
    icon: CreditCard, color: 'text-brand', bg: 'bg-brand/10', border: 'border-brand/20' 
  },
  audit: { 
    id: 'audit', label: 'Audit Vault', path: '/audit-logs', 
    icon: ShieldCheck, color: 'text-zinc-text', bg: 'bg-white/5', border: 'border-white/10' 
  },
  records: { 
    id: 'records', label: 'Records', path: paths.records, 
    icon: Database, color: 'text-zinc-text', bg: 'bg-white/5', border: 'border-white/10' 
  },
  users: { 
    id: 'users', label: 'User Directory', path: paths.adminUsers, 
    icon: Users, color: 'text-zinc-text', bg: 'bg-white/5', border: 'border-white/10' 
  }
};

const CATEGORIES = {
  'CATALOG': ['add_product', 'master_catalog', 'inventory_hub'],
  'OPERATIONS': ['create_order', 'order_mgmt', 'analytics'],
  'GENERAL': ['billing', 'audit', 'records'],
  'ADMIN': ['users']
};

const STATS = [
  { label: 'Total Products', value: '12,842', trend: '+42 Today', icon: Package, color: 'text-brand', bg: 'bg-brand/10' },
  { label: 'Inventory Value', value: '$4.2M', trend: '+2.4%', icon: DollarSign, color: 'text-zinc-text', bg: 'bg-obsidian-outer' },
  { label: 'Pending Orders', value: '184', trend: '-12%', icon: Clock, color: 'text-warning', bg: 'bg-warning/10' },
  { label: 'Critical Issues', value: '3', trend: 'Action Req', icon: AlertCircle, color: 'text-danger', bg: 'bg-danger/10' },
];

const CHART_DATA = [
  { name: 'Mon', value: 120 },
  { name: 'Tue', value: 132 },
  { name: 'Wed', value: 145 },
  { name: 'Thu', value: 160 },
  { name: 'Fri', value: 190 },
  { name: 'Sat', value: 170 },
  { name: 'Sun', value: 185 },
];

export const DashboardOverview = () => {
  const { t } = useLanguage();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const { activeProject } = useProjects();
  const isDark = theme === 'dark';
  
  const [isConfiguring, setIsConfiguring] = useState(false);
  const [activeActionIds, setActiveActionIds] = useState<string[]>([
    'add_product', 'create_order', 'analytics', 'billing'
  ]);

  const toggleAction = (id: string) => {
    if (activeActionIds.includes(id)) {
      setActiveActionIds(prev => prev.filter(a => a !== id));
    } else {
      if (activeActionIds.length >= 6) {
        alert("Maximum 6 shortcuts allowed.");
        return;
      }
      setActiveActionIds(prev => [...prev, id]);
    }
  };

  return (
    <div className="space-y-8 animate-fade-up">
      
      {/* Header */}
      <div className="flex items-center gap-3">
         <div className="p-2 bg-brand/10 rounded-sm text-brand border border-brand/20">
            <LayoutGrid className="w-5 h-5" />
         </div>
         <h1 className="text-2xl font-black text-zinc-text uppercase italic tracking-tighter">DASHBOARD</h1>
      </div>

      {/* 1. Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
         {STATS.map((stat, i) => (
            <AmberCard key={i} className="p-6 flex flex-col justify-between hover:border-zinc-secondary/20 transition-all cursor-default">
               <div className="flex justify-between items-start mb-4">
                  <div className={cn("p-3 rounded-lg", stat.bg, stat.color)}>
                     <stat.icon className="w-5 h-5" />
                  </div>
                  <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-wide", stat.color.replace('text-', 'text-').replace('text-', 'border-').replace('text-', 'bg-').replace('500', '500/10').replace('text-zinc-text', 'border-zinc-muted/20 bg-white/5'))}>
                     {stat.trend}
                  </span>
               </div>
               <div>
                  <h3 className="text-3xl font-black text-zinc-text tracking-tighter mb-1">{stat.value}</h3>
                  <p className="text-[10px] font-bold text-zinc-muted uppercase tracking-widest">{stat.label}</p>
               </div>
            </AmberCard>
         ))}
      </div>

      {/* 2. Main Content: Chart (Left) & Actions (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         
         {/* Left Column: Performance Chart */}
         <AmberCard className="lg:col-span-2 p-8 flex flex-col min-h-[500px]" glass>
            <div className="flex items-center justify-between mb-8">
               <div>
                  <h3 className="text-lg font-black text-zinc-text uppercase tracking-tight">Performance Trend</h3>
                  <p className="text-xs font-medium text-zinc-muted mt-1">Daily transaction volume</p>
               </div>
               <select className="bg-obsidian-outer border border-white/10 rounded-sm px-3 py-1.5 text-[10px] font-bold text-zinc-muted uppercase tracking-widest outline-none hover:text-zinc-text cursor-pointer transition-colors">
                  <option>Last 7 Days</option>
                  <option>Last 30 Days</option>
                  <option>This Quarter</option>
               </select>
            </div>
            
            <div className="flex-1 w-full" dir="ltr">
               <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={CHART_DATA}>
                     <defs>
                        <linearGradient id="colorChart" x1="0" y1="0" x2="0" y2="1">
                           <stop offset="5%" stopColor="#FFC000" stopOpacity={0.2}/>
                           <stop offset="95%" stopColor="#FFC000" stopOpacity={0}/>
                        </linearGradient>
                     </defs>
                     <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"} />
                     <XAxis 
                        dataKey="name" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{fill: isDark ? '#64748B' : '#94a3b8', fontSize: 10, fontWeight: 700}} 
                        dy={10} 
                     />
                     <YAxis 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{fill: isDark ? '#64748B' : '#94a3b8', fontSize: 10}} 
                     />
                     <Tooltip 
                        contentStyle={{ 
                           backgroundColor: isDark ? '#161E36' : '#ffffff', 
                           border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.1)', 
                           borderRadius: '4px',
                           fontSize: '11px',
                           fontWeight: 'bold',
                           color: isDark ? '#F1F5F9' : '#0F172A',
                           boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                        }}
                     />
                     <Area type="monotone" dataKey="value" stroke="#FFC000" strokeWidth={3} fill="url(#colorChart)" />
                  </AreaChart>
               </ResponsiveContainer>
            </div>
         </AmberCard>

         {/* Right Column: Quick Actions & Signals */}
         <div className="space-y-6">
            
            {/* Quick Actions Panel */}
            <AmberCard className="p-6">
               <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-black text-zinc-text uppercase tracking-widest">Quick Actions</h3>
                  <button 
                     onClick={() => setIsConfiguring(true)}
                     className="text-zinc-muted hover:text-zinc-text transition-colors p-1"
                  >
                     <Settings className="w-3.5 h-3.5" />
                  </button>
               </div>
               
               <div className="grid grid-cols-2 gap-3">
                  {activeActionIds.map(id => {
                     const action = ACTION_DEFINITIONS[id];
                     if (!action) return null;
                     return (
                        <button
                           key={id}
                           onClick={() => navigate(action.path)}
                           className={cn(
                              "flex flex-col items-center justify-center p-4 rounded-lg border transition-all duration-300 group relative overflow-hidden",
                              "hover:shadow-lg hover:-translate-y-1",
                              "bg-obsidian-outer border-white/5" 
                           )}
                        >
                           {/* Highlight Bg on Hover */}
                           <div className={cn("absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity", action.bg)} />
                           
                           <div className={cn("mb-2 p-2 rounded-full", action.bg, action.color)}>
                              <action.icon className="w-5 h-5" />
                           </div>
                           <span className={cn("text-[9px] font-black uppercase tracking-wider text-center leading-tight", action.color === 'text-zinc-text' ? 'text-zinc-muted group-hover:text-zinc-text' : 'text-zinc-text')}>
                              {action.label}
                           </span>
                        </button>
                     );
                  })}
                  {activeActionIds.length < 6 && (
                     <button
                        onClick={() => setIsConfiguring(true)}
                        className="flex flex-col items-center justify-center p-4 rounded-lg border border-dashed border-white/10 hover:border-zinc-muted/50 hover:bg-white/[0.02] transition-all text-zinc-muted/50 hover:text-zinc-muted"
                     >
                        <Plus className="w-6 h-6 mb-1" />
                        <span className="text-[9px] font-bold uppercase tracking-widest">Add</span>
                     </button>
                  )}
               </div>
            </AmberCard>

            {/* Recent Signals Panel */}
            <AmberCard className="p-0 overflow-hidden">
               <div className="px-6 py-4 border-b border-white/5 flex justify-between items-center">
                  <h3 className="text-[10px] font-black text-zinc-muted uppercase tracking-[0.2em]">{t('dash.recent_signals')}</h3>
                  <button onClick={() => navigate('/notifications')} className="text-[9px] font-bold text-brand hover:underline flex items-center gap-1">
                     View All <ArrowRight className="w-3 h-3" />
                  </button>
               </div>
               <div className="divide-y divide-white/5">
                  {[
                     { msg: 'Latency Spike: US-East-1', time: '2 minutes ago', type: 'warning' },
                     { msg: 'Order #2241 Failed Payment', time: '14 minutes ago', type: 'danger' },
                     { msg: 'Inventory Sync Complete', time: '1 hour ago', type: 'success' },
                  ].map((sig, i) => (
                     <div key={i} className="px-6 py-4 hover:bg-white/[0.02] transition-colors flex items-start gap-3">
                        {sig.type === 'warning' && <AlertCircle className="w-4 h-4 text-warning shrink-0 mt-0.5" />}
                        {sig.type === 'danger' && <X className="w-4 h-4 text-danger shrink-0 mt-0.5" />}
                        {sig.type === 'success' && <CheckCircle2 className="w-4 h-4 text-success shrink-0 mt-0.5" />}
                        <div>
                           <p className="text-xs font-bold text-zinc-text leading-tight">{sig.msg}</p>
                           <p className="text-[9px] font-medium text-zinc-muted mt-1 uppercase tracking-wider">{sig.time}</p>
                        </div>
                     </div>
                  ))}
               </div>
            </AmberCard>

         </div>
      </div>

      {/* Configure Actions Modal */}
      {isConfiguring && createPortal(
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
           <div className="absolute inset-0 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setIsConfiguring(false)} />
           
           <div className="relative w-full max-w-2xl bg-obsidian-panel border border-white/10 rounded-lg shadow-2xl flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-300">
              <div className="flex items-center justify-between px-8 py-6 border-b border-white/5 bg-obsidian-outer/50">
                 <div>
                    <h2 className="text-xl font-black text-zinc-text uppercase italic tracking-tighter">Configure Actions</h2>
                    <p className="text-[10px] font-bold text-zinc-muted uppercase tracking-[0.2em] mt-1">Select shortcuts to pin to your dashboard</p>
                 </div>
                 <button onClick={() => setIsConfiguring(false)} className="p-2 hover:bg-white/5 rounded-full transition-colors text-zinc-muted hover:text-zinc-text">
                    <X className="w-5 h-5" />
                 </button>
              </div>

              <div className="flex-1 overflow-y-auto p-8 space-y-8 scrollbar-hide">
                 {Object.entries(CATEGORIES).map(([category, actionIds]) => (
                    <div key={category} className="space-y-4">
                       <h3 className="text-[10px] font-black text-zinc-muted uppercase tracking-[0.3em] flex items-center gap-2 pl-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-brand" /> {category}
                       </h3>
                       <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {actionIds.map(id => {
                             const action = ACTION_DEFINITIONS[id];
                             if (!action) return null;
                             const isSelected = activeActionIds.includes(id);
                             return (
                                <button 
                                   key={id}
                                   onClick={() => toggleAction(id)}
                                   className={cn(
                                      "flex items-center justify-between p-3 rounded-sm border transition-all group text-left",
                                      isSelected 
                                         ? `bg-obsidian-card ${action.border} ring-1 ring-brand/10 shadow-lg` 
                                         : "bg-transparent border-white/5 hover:border-white/10 hover:bg-white/[0.02]"
                                   )}
                                >
                                   <div className="flex items-center gap-4">
                                      <div className={cn("p-2 rounded-sm transition-colors", isSelected ? action.bg + ' ' + action.color : "bg-obsidian-outer text-zinc-muted")}>
                                         <action.icon className="w-4 h-4" />
                                      </div>
                                      <span className={cn("text-[11px] font-bold uppercase tracking-tight", isSelected ? "text-zinc-text" : "text-zinc-secondary")}>
                                         {action.label}
                                      </span>
                                   </div>
                                   <div className={cn("transition-colors", isSelected ? "text-brand" : "text-zinc-muted/30 group-hover:text-zinc-muted")}>
                                      {isSelected ? <CheckCircle2 className="w-4 h-4 fill-brand/10" /> : <Circle className="w-4 h-4" />}
                                   </div>
                                </button>
                             );
                          })}
                       </div>
                    </div>
                 ))}
              </div>

              <div className="px-8 py-5 border-t border-white/5 bg-obsidian-outer/30 flex justify-between items-center">
                 <p className="text-[10px] font-bold text-zinc-muted uppercase tracking-widest">{activeActionIds.length} Actions Pinned</p>
                 <button 
                    onClick={() => setIsConfiguring(false)}
                    className="px-8 py-2.5 bg-brand text-obsidian-outer text-[10px] font-black uppercase tracking-widest rounded-sm hover:opacity-90 transition-opacity shadow-lg shadow-brand/10"
                 >
                    {t('common.save')}
                 </button>
              </div>
           </div>
        </div>,
        document.body
      )}
    </div>
  );
};
