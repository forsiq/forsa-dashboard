
import React, { useState, useEffect, useMemo } from 'react';
import { AmberCard } from '../../../amber-ui/components/AmberCard';
import { AmberDropdown } from '../../../amber-ui/components/AmberDropdown';
import { 
  Package, 
  DollarSign, 
  Clock, 
  AlertCircle,
  Activity,
  ShieldCheck,
  Zap,
  FileText,
  RefreshCw,
  ArrowRight,
  Plus,
  ShoppingCart,
  Settings2,
  X,
  CheckCircle2,
  Circle,
  Database,
  Search,
  Users
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
import { cn } from '../../../lib/cn';
import { useNavigate } from 'react-router-dom';
import { paths } from '../../../routes/paths';

// --- Configuration Data ---

interface ActionItem {
  id: string;
  label: string;
  path: string;
  icon: any;
  category: 'Catalog' | 'Orders' | 'Analytics' | 'System' | 'Admin';
  color: string;
  bg: string;
  border: string;
}

const AVAILABLE_ACTIONS: ActionItem[] = [
  // Catalog
  { id: 'add_sku', label: 'Add SKU', path: '/catalog/new', icon: Plus, category: 'Catalog', color: 'text-brand', bg: 'bg-brand/10', border: 'border-brand/30' },
  { id: 'view_products', label: 'Browse Catalog', path: paths.catalog, icon: Package, category: 'Catalog', color: 'text-brand', bg: 'bg-brand/5', border: 'border-brand/20' },
  
  // Orders
  { id: 'new_order', label: 'New Order', path: paths.orders, icon: ShoppingCart, category: 'Orders', color: 'text-info', bg: 'bg-info/10', border: 'border-info/30' },
  { id: 'view_orders', label: 'Order History', path: paths.orders, icon: FileText, category: 'Orders', color: 'text-info', bg: 'bg-info/5', border: 'border-info/20' },
  
  // Analytics
  { id: 'view_reports', label: 'View Reports', path: paths.analytics, icon: Activity, category: 'Analytics', color: 'text-success', bg: 'bg-success/10', border: 'border-success/30' },
  
  // System
  { id: 'view_logs', label: 'Audit Logs', path: '/audit-logs', icon: ShieldCheck, category: 'System', color: 'text-zinc-text', bg: 'bg-white/5', border: 'border-white/20' },
  { id: 'db_records', label: 'Database Records', path: paths.records, icon: Database, category: 'System', color: 'text-zinc-text', bg: 'bg-white/5', border: 'border-white/20' },

  // Admin
  { id: 'manage_users', label: 'Manage Users', path: paths.adminUsers, icon: Users, category: 'Admin', color: 'text-zinc-text', bg: 'bg-white/5', border: 'border-white/20' },
];

const timelineData = [
  { name: 'Mon', enriched: 120, pending: 45 },
  { name: 'Tue', enriched: 150, pending: 30 },
  { name: 'Wed', enriched: 210, pending: 80 },
  { name: 'Thu', enriched: 180, pending: 50 },
  { name: 'Fri', enriched: 240, pending: 20 },
  { name: 'Sat', enriched: 90, pending: 10 },
  { name: 'Sun', enriched: 100, pending: 15 },
];

export const DashboardOverview = () => {
  const { t, language } = useLanguage();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const isDark = theme === 'dark';

  // --- State for Custom Actions ---
  const [activeActionIds, setActiveActionIds] = useState<string[]>(() => {
    const saved = localStorage.getItem('dashboard_actions');
    return saved ? JSON.parse(saved) : ['add_sku', 'new_order', 'view_reports', 'view_logs'];
  });
  
  const [isConfiguring, setIsConfiguring] = useState(false);
  const [timeRange, setTimeRange] = useState('7d');

  // Save to local storage whenever actions change
  useEffect(() => {
    localStorage.setItem('dashboard_actions', JSON.stringify(activeActionIds));
  }, [activeActionIds]);

  const toggleAction = (id: string) => {
    setActiveActionIds(prev => 
      prev.includes(id) 
        ? prev.filter(actionId => actionId !== id) 
        : [...prev, id]
    );
  };

  // Get the full action objects for the selected IDs
  const displayActions = useMemo(() => {
    return activeActionIds
      .map(id => AVAILABLE_ACTIONS.find(a => a.id === id))
      .filter(Boolean) as ActionItem[];
  }, [activeActionIds]);

  // Group actions for the configuration modal
  const groupedActions = useMemo(() => {
    const groups: Record<string, ActionItem[]> = {};
    AVAILABLE_ACTIONS.forEach(action => {
      if (!groups[action.category]) groups[action.category] = [];
      groups[action.category].push(action);
    });
    return groups;
  }, []);

  const timeOptions = [
    { label: language === 'ar' ? 'آخر 7 أيام' : 'Last 7 Days', value: '7d' },
    { label: language === 'ar' ? 'آخر 30 يوماً' : 'Last 30 Days', value: '30d' },
  ];

  return (
    <div className="page-transition w-full space-y-8 relative">
      
      {/* Header Section */}
      <section className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-sm bg-brand/10 flex items-center justify-center text-brand border border-brand/20 shadow-[0_0_15px_rgba(245,196,81,0.1)]">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-zinc-text tracking-tighter uppercase leading-none flex items-center gap-2">
              {t('dash.title').split(' ')[0]} <span className="text-brand/90">{t('dash.title').split(' ')[1]}</span>
            </h1>
          </div>
        </div>
      </section>

      {/* KPI Section */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: t('dash.total_skus'), value: '12,842', icon: Package, trend: '+42 Today', status: 'text-brand', bg: 'bg-brand/10' },
          { title: t('dash.valuation'), value: '$4.2M', icon: DollarSign, trend: '+2.4%', status: 'text-zinc-text', bg: 'bg-obsidian-hover' },
          { title: t('dash.pending'), value: '184', icon: Clock, trend: '-12%', status: 'text-warning', bg: 'bg-warning/10' },
          { title: t('dash.critical'), value: '3', icon: AlertCircle, trend: 'Action Req', status: 'text-danger', bg: 'bg-danger/10' },
        ].map((stat, i) => (
          <div key={i} className="bg-obsidian-panel border border-border p-6 rounded-xl hover:border-zinc-secondary/20 transition-all shadow-sm group">
            <div className="flex items-start justify-between mb-4">
              <div className={cn("p-2.5 rounded-lg transition-colors", stat.bg, stat.status)}>
                <stat.icon className="w-5 h-5" />
              </div>
              <span className={cn("text-xs font-medium px-2 py-1 rounded-md border border-border", stat.status)}>
                {stat.trend}
              </span>
            </div>
            <h3 className="text-2xl font-bold text-zinc-text mb-1 tracking-tight group-hover:text-brand transition-colors">{stat.value}</h3>
            <p className="text-xs font-medium text-zinc-muted uppercase tracking-wider">{stat.title}</p>
          </div>
        ))}
      </section>

      {/* Charts & Actions Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart */}
        <div className="lg:col-span-2 min-w-0">
          <AmberCard className="h-full flex flex-col">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-lg font-bold text-zinc-text">{t('dash.velocity_title')}</h3>
                <p className="text-sm text-zinc-muted">{t('dash.velocity_desc')}</p>
              </div>
              <div className="w-40">
                <AmberDropdown 
                  options={timeOptions}
                  value={timeRange}
                  onChange={setTimeRange}
                />
              </div>
            </div>
            <div className="h-[300px] w-full relative flex-1" dir="ltr">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={timelineData}>
                  <defs>
                    <linearGradient id="brandGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#F5C451" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#F5C451" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"} />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fontSize: 12, fill: isDark ? '#64748B' : '#94a3b8'}} 
                    dy={10} 
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fontSize: 12, fill: isDark ? '#64748B' : '#94a3b8'}} 
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: isDark ? '#1e293b' : '#ffffff', 
                      border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.1)', 
                      borderRadius: '8px', 
                      color: isDark ? '#F1F5F9' : '#0F172A', 
                      fontSize: '12px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                    itemStyle={{ color: '#F5C451' }}
                  />
                  <Area type="monotone" dataKey="enriched" stroke="#F5C451" strokeWidth={2} fillOpacity={1} fill="url(#brandGradient)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </AmberCard>
        </div>

        {/* Quick Actions Panel */}
        <div className="lg:col-span-1 min-w-0">
          <AmberCard className="h-full flex flex-col">
            <div className="flex items-center justify-between mb-6 border-b border-border pb-4">
              <h3 className="text-lg font-bold text-zinc-text">{t('label.actions') || 'Quick Actions'}</h3>
              <button 
                onClick={() => setIsConfiguring(true)}
                className="p-1.5 rounded-sm hover:bg-obsidian-outer text-zinc-muted hover:text-brand transition-all"
                title="Customize Actions"
              >
                <Settings2 className="w-4 h-4" />
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-3 mb-8">
               {displayActions.length > 0 ? (
                 displayActions.map((action) => (
                   <button 
                      key={action.id}
                      onClick={() => navigate(action.path)}
                      className="flex flex-col items-center justify-center gap-2 p-4 bg-obsidian-outer hover:bg-obsidian-hover border border-border rounded-lg transition-all group relative overflow-hidden"
                   >
                      <div className={cn("p-2 rounded-full transition-transform shadow-sm group-hover:scale-110", action.bg, action.color)}>
                        <action.icon className="w-5 h-5" />
                      </div>
                      <span className={cn("text-[10px] font-black text-zinc-text uppercase tracking-tight transition-colors group-hover:opacity-100 opacity-80", action.color)}>
                        {action.label}
                      </span>
                   </button>
                 ))
               ) : (
                 <div className="col-span-2 py-8 text-center border-2 border-dashed border-white/5 rounded-lg">
                    <p className="text-[10px] font-bold text-zinc-muted uppercase tracking-widest mb-2">No actions pinned</p>
                    <button onClick={() => setIsConfiguring(true)} className="text-brand hover:underline text-[10px] font-black uppercase">Configure</button>
                 </div>
               )}
            </div>

            <div className="flex-1 border-t border-border pt-6">
               <div className="flex items-center justify-between text-xs font-bold text-zinc-muted mb-4 uppercase tracking-wider">
                 <span>Recent Signals</span>
                 <button 
                    onClick={() => navigate('/notifications')}
                    className="text-brand hover:text-brand/80 flex items-center gap-1 transition-colors text-[10px]"
                 >
                    View All <ArrowRight className="w-3 h-3" />
                 </button>
               </div>
               <div className="space-y-3">
                  <div className="flex items-start gap-3 p-3 bg-white/[0.02] border border-border rounded-sm hover:bg-white/[0.04] transition-colors cursor-pointer group">
                     <AlertCircle className="w-4 h-4 text-warning shrink-0 mt-0.5" />
                     <div>
                        <p className="text-[11px] font-bold text-zinc-text leading-tight group-hover:text-brand transition-colors">Latency Spike: US-East-1</p>
                        <p className="text-[9px] text-zinc-muted mt-1 font-mono uppercase">2 minutes ago</p>
                     </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-white/[0.02] border border-border rounded-sm hover:bg-white/[0.04] transition-colors cursor-pointer group">
                     <ShieldCheck className="w-4 h-4 text-success shrink-0 mt-0.5" />
                     <div>
                        <p className="text-[11px] font-bold text-zinc-text leading-tight group-hover:text-brand transition-colors">Automated Backup Complete</p>
                        <p className="text-[9px] text-zinc-muted mt-1 font-mono uppercase">1 hour ago</p>
                     </div>
                  </div>
               </div>
            </div>
          </AmberCard>
        </div>
      </div>

      {/* --- CONFIGURATION MODAL --- */}
      {isConfiguring && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
           {/* Backdrop */}
           <div className="absolute inset-0 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setIsConfiguring(false)} />
           
           {/* Modal Content */}
           <div className="relative w-full max-w-2xl bg-obsidian-panel border border-white/10 rounded-lg shadow-2xl flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-300">
              {/* Modal Header */}
              <div className="flex items-center justify-between px-6 py-5 border-b border-white/5 bg-obsidian-outer/50">
                 <div>
                    <h2 className="text-lg font-black text-zinc-text uppercase italic tracking-tighter">Configure Actions</h2>
                    <p className="text-[10px] font-bold text-zinc-muted uppercase tracking-widest mt-1">Select shortcuts to pin to your dashboard</p>
                 </div>
                 <button onClick={() => setIsConfiguring(false)} className="p-2 hover:bg-white/5 rounded-full transition-colors text-zinc-muted hover:text-zinc-text">
                    <X className="w-5 h-5" />
                 </button>
              </div>

              {/* Modal Body (Scrollable) */}
              <div className="flex-1 overflow-y-auto p-6 space-y-8 scrollbar-hide">
                 {Object.entries(groupedActions).map(([category, actions]: [string, ActionItem[]]) => (
                    <div key={category} className="space-y-3">
                       <h3 className="text-[10px] font-black text-zinc-muted uppercase tracking-[0.3em] pl-1 flex items-center gap-2">
                          <span className="w-1 h-1 rounded-full bg-brand" /> {category}
                       </h3>
                       <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {actions.map(action => {
                             const isSelected = activeActionIds.includes(action.id);
                             return (
                                <button 
                                   key={action.id}
                                   onClick={() => toggleAction(action.id)}
                                   className={cn(
                                      "flex items-center justify-between p-3 rounded-sm border transition-all group text-left",
                                      isSelected 
                                         ? `bg-obsidian-card ${action.border} shadow-[inset_0_0_20px_rgba(0,0,0,0.2)]` 
                                         : "bg-transparent border-white/5 hover:border-white/10 hover:bg-white/[0.02]"
                                   )}
                                >
                                   <div className="flex items-center gap-3">
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

              {/* Modal Footer */}
              <div className="px-6 py-4 border-t border-white/5 bg-obsidian-outer/30 flex justify-between items-center">
                 <p className="text-[10px] font-bold text-zinc-muted uppercase tracking-widest">{activeActionIds.length} Actions Pinned</p>
                 <button 
                    onClick={() => setIsConfiguring(false)}
                    className="px-6 py-2 bg-brand text-obsidian-outer text-[10px] font-black uppercase tracking-widest rounded-sm hover:opacity-90 transition-opacity"
                 >
                    Save Changes
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};
