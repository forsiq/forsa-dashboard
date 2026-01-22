
import React, { useState } from 'react';
import { Card } from '../components/ui/Card';
import { 
  Package, 
  DollarSign, 
  Clock, 
  Activity, 
  ShieldCheck, 
  AlertCircle,
  ExternalLink,
  Database,
  Server,
  Cpu,
  Cloud
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
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import { cn } from '../lib/cn';

const timelineData = [
  { name: 'Mon', enriched: 120, pending: 45 },
  { name: 'Tue', enriched: 150, pending: 30 },
  { name: 'Wed', enriched: 210, pending: 80 },
  { name: 'Thu', enriched: 180, pending: 50 },
  { name: 'Fri', enriched: 240, pending: 20 },
  { name: 'Sat', enriched: 90, pending: 10 },
  { name: 'Sun', enriched: 100, pending: 15 },
];

export const HomePage = () => {
  const { t, language } = useLanguage();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [statusView, setStatusView] = useState<'channels' | 'systems'>('channels');

  return (
    <div className="page-transition w-full space-y-8">
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
            <p className="text-[10px] text-zinc-muted font-bold uppercase tracking-[0.4em] mt-1.5 flex items-center gap-2">
              {t('label.status')}: <span className="text-success font-black">ONLINE / OPTIMAL</span>
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-8">
          <div className="flex flex-col items-end">
            <span className="text-[9px] font-black text-zinc-muted uppercase tracking-widest">{t('dash.global_velocity')}</span>
            <span className="text-sm font-black text-success tracking-tight">8.4 GB/S</span>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-[9px] font-black text-zinc-muted uppercase tracking-widest">{t('dash.connectivity')}</span>
            <span className="text-sm font-black text-info tracking-tight">{t('dash.sync_active')}</span>
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

      {/* Charts & Status Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 min-w-0">
          <Card className="h-full flex flex-col">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-lg font-bold text-zinc-text">{t('dash.velocity_title')}</h3>
                <p className="text-sm text-zinc-muted">{t('dash.velocity_desc')}</p>
              </div>
              <select className="bg-obsidian-outer border border-border text-xs font-medium text-zinc-text rounded-lg px-3 py-1.5 outline-none cursor-pointer hover:bg-obsidian-hover transition-colors">
                <option>{language === 'ar' ? 'آخر 7 أيام' : 'Last 7 Days'}</option>
                <option>{language === 'ar' ? 'آخر 30 يوماً' : 'Last 30 Days'}</option>
              </select>
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
          </Card>
        </div>

        <div className="lg:col-span-1 min-w-0">
          <Card className="h-full flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <div className="flex gap-4 items-baseline">
                 <button
                   onClick={() => setStatusView('channels')}
                   className={cn(
                     "text-lg font-bold transition-all uppercase tracking-tight",
                     statusView === 'channels' 
                       ? "text-zinc-text border-b-2 border-brand pb-0.5" 
                       : "text-zinc-muted hover:text-zinc-secondary"
                   )}
                 >
                   {t('dash.sync_title')}
                 </button>
                 <button
                   onClick={() => setStatusView('systems')}
                   className={cn(
                     "text-lg font-bold transition-all uppercase tracking-tight",
                     statusView === 'systems' 
                       ? "text-zinc-text border-b-2 border-brand pb-0.5" 
                       : "text-zinc-muted hover:text-zinc-secondary"
                   )}
                 >
                   Infrastructure
                 </button>
              </div>
              <Activity className="w-5 h-5 text-zinc-muted" />
            </div>
            
            <div className="space-y-6 flex-1">
              {statusView === 'channels' ? (
                <>
                  {[
                    { name: 'Shopify Storefront', health: 100, status: language === 'ar' ? 'متصل' : 'Connected' },
                    { name: 'Amazon US-Market', health: 98, status: language === 'ar' ? 'متصل' : 'Connected' },
                    { name: 'Global POS Node', health: 65, status: language === 'ar' ? 'جاري إعادة الفهرسة' : 'Indexing' },
                    { name: 'Retail API Gateway', health: 100, status: language === 'ar' ? 'متصل' : 'Connected' },
                  ].map((channel, idx) => (
                    <div key={idx} className="animate-in fade-in slide-in-from-right-4 duration-300" style={{ animationDelay: `${idx * 100}ms` }}>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-zinc-secondary">{channel.name}</span>
                        <span className={`text-xs font-bold ${channel.health < 90 ? 'text-warning' : 'text-success'}`}>{channel.status}</span>
                      </div>
                      <div className="h-1.5 bg-obsidian-outer rounded-full overflow-hidden border border-border">
                        <div 
                          className={`h-full rounded-full transition-all duration-1000 ${channel.health < 90 ? 'bg-warning' : 'bg-success'}`} 
                          style={{ width: `${channel.health}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </>
              ) : (
                <>
                  {[
                    { name: 'Primary DB Cluster', load: 45, status: 'Healthy', icon: Database, color: 'text-brand' },
                    { name: 'Redis Cache Layer', load: 82, status: 'High Load', icon: Server, color: 'text-warning' },
                    { name: 'Search Indexer', load: 12, status: 'Idle', icon: Activity, color: 'text-success' },
                    { name: 'CDN Edge Network', load: 99, status: 'Optimal', icon: Cloud, color: 'text-info' },
                  ].map((sys, idx) => (
                    <div key={idx} className="flex items-center gap-4 animate-in fade-in slide-in-from-right-4 duration-300" style={{ animationDelay: `${idx * 100}ms` }}>
                       <div className={cn("p-2.5 rounded-sm bg-obsidian-outer border border-white/5", sys.color)}>
                          <sys.icon className="w-4 h-4" />
                       </div>
                       <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-center mb-1">
                             <span className="text-sm font-bold text-zinc-text">{sys.name}</span>
                             <span className={cn("text-[10px] font-black uppercase tracking-widest", sys.color.replace('text-', 'text-'))}>{sys.status}</span>
                          </div>
                          <div className="w-full h-1 bg-obsidian-outer rounded-full overflow-hidden">
                             <div className={cn("h-full rounded-full", sys.color.replace('text-', 'bg-'))} style={{ width: `${sys.load}%` }}></div>
                          </div>
                       </div>
                    </div>
                  ))}
                </>
              )}
            </div>

            <div className="mt-8 pt-6 border-t border-border">
               <div className="flex items-center justify-between text-xs font-bold text-zinc-muted mb-4 uppercase tracking-wider">
                 <span>{t('dash.recent_logs')}</span>
                 <button className="text-brand hover:text-brand/80 flex items-center gap-1 transition-colors">
                    {t('dash.view_terminal')} <ExternalLink className="w-3 h-3 rtl:rotate-180" />
                 </button>
               </div>
               <div className="space-y-2">
                  {[
                    { event: 'Inventory Uplink', time: '12:04', res: 'SUCCESS' },
                    { event: 'Cache Purge', time: '11:58', res: 'SUCCESS' },
                  ].map((log, i) => (
                    <div key={i} className="flex items-center justify-between text-xs bg-obsidian-outer p-3 rounded-md hover:bg-obsidian-hover border border-border transition-colors cursor-default">
                      <span className="text-zinc-secondary font-medium">{log.event}</span>
                      <span className="text-zinc-muted font-mono">{log.time}</span>
                    </div>
                  ))}
               </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
