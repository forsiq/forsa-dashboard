
import React from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { 
  BarChart3, 
  TrendingUp, 
  Calendar, 
  Download, 
  Filter,
  ArrowUpRight,
  Zap,
  Cpu,
  Globe
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
  Bar,
  Cell
} from 'recharts';
import { useTheme } from '../../amber-ui/contexts/ThemeContext';

const performanceData = [
  { name: '00:00', throughput: 400, errors: 12 },
  { name: '04:00', throughput: 300, errors: 5 },
  { name: '08:00', throughput: 600, errors: 8 },
  { name: '12:00', throughput: 800, errors: 22 },
  { name: '16:00', throughput: 500, errors: 14 },
  { name: '20:00', throughput: 900, errors: 6 },
  { name: '23:59', throughput: 1100, errors: 4 },
];

const nodeLoad = [
  { name: 'US-East-1', load: 88 },
  { name: 'EU-West-2', load: 42 },
  { name: 'AP-South-1', load: 67 },
  { name: 'SA-East-1', load: 31 },
];

export const AnalyticsTemplate = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <div className="animate-fade-up max-w-[1800px] mx-auto py-4 space-y-8">
      {/* Precision Telemetry Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-border pb-6">
        <div>
          <h1 className="text-2xl font-black text-zinc-text uppercase italic tracking-tighter flex items-center gap-3">
             <BarChart3 className="w-6 h-6 text-brand" /> Telemetry Intelligence Hub
          </h1>
          <p className="text-[10px] font-black text-zinc-muted uppercase tracking-[0.3em] mt-1 italic">Real-time throughput and performance breakdown</p>
        </div>
        <div className="flex items-center gap-3">
           <div className="flex items-center gap-2 px-4 py-2 bg-obsidian-card border border-border rounded-sm text-[10px] font-black text-zinc-muted uppercase tracking-widest cursor-pointer">
              <Calendar className="w-3.5 h-3.5" /> LAST 24 HOURS
           </div>
           <Button variant="secondary" size="sm"><Filter className="w-3.5 h-3.5 mr-2" /> Global Filter</Button>
           <Button size="sm"><Download className="w-3.5 h-3.5 mr-2" /> Generate Report</Button>
        </div>
      </div>

      {/* Hero Analytics Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main Performance Graph */}
        <Card className="lg:col-span-8 p-8 flex flex-col" glass>
          <div className="flex items-center justify-between mb-10">
            <div>
               <h3 className="text-xs font-black text-zinc-text uppercase tracking-[0.4em] mb-1">Data Velocity Throughput</h3>
               <p className="text-[9px] font-bold text-zinc-muted uppercase tracking-widest italic">Monitoring bits/second across the primary mesh</p>
            </div>
            <div className="flex items-center gap-4">
               <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-brand" />
                  <span className="text-[9px] font-black text-zinc-muted uppercase tracking-widest">Throughput</span>
               </div>
               <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-danger opacity-50" />
                  <span className="text-[9px] font-black text-zinc-muted uppercase tracking-widest">Error Spike</span>
               </div>
            </div>
          </div>
          <div className="h-[350px] w-full" dir="ltr">
            <ResponsiveContainer width="100%" height="100%">
               <AreaChart data={performanceData}>
                  <defs>
                    <linearGradient id="chartGradBlue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#F5C451" stopOpacity={0.15}/>
                      <stop offset="95%" stopColor="#F5C451" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.03)"} />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fontSize: 9, fontWeight: 700, fill: isDark ? '#5C6370' : '#94a3b8'}} 
                    dy={10} 
                  />
                  <YAxis hide />
                  <Tooltip 
                    cursor={{ stroke: 'rgba(245, 196, 81, 0.2)', strokeWidth: 2 }}
                    contentStyle={{ 
                      backgroundColor: isDark ? '#0F1218' : '#FFFFFF', 
                      border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.1)', 
                      color: isDark ? '#E1E4E8' : '#0F172A', 
                      fontSize: '11px', 
                      fontWeight: 'bold',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Area type="monotone" dataKey="throughput" stroke="#F5C451" strokeWidth={3} fill="url(#chartGradBlue)" />
                  <Area type="monotone" dataKey="errors" stroke="#E06C75" strokeWidth={1} fill="#E06C75" fillOpacity={0.05} />
               </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Regional Load Bar Chart */}
        <Card className="lg:col-span-4 p-8 flex flex-col" glass>
          <div className="flex items-center justify-between mb-8">
             <h3 className="text-xs font-black text-zinc-text uppercase tracking-[0.4em]">Node Load Bias</h3>
             <Globe className="w-4 h-4 text-brand" />
          </div>
          <div className="flex-1" dir="ltr">
            <ResponsiveContainer width="100%" height="100%">
               <BarChart data={nodeLoad} layout="vertical">
                  <XAxis type="number" hide />
                  <YAxis 
                    dataKey="name" 
                    type="category" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fontSize: 10, fontWeight: 800, fill: isDark ? '#E1E4E8' : '#334155'}} 
                    width={80} 
                  />
                  <Tooltip 
                    cursor={{fill: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)'}}
                    contentStyle={{ 
                      backgroundColor: isDark ? '#0F1218' : '#FFFFFF', 
                      border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.1)', 
                      color: isDark ? '#E1E4E8' : '#0F172A', 
                      fontSize: '11px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Bar dataKey="load" radius={[0, 2, 2, 0]} barSize={12}>
                     {nodeLoad.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.load > 80 ? '#E06C75' : '#F5C451'} />
                     ))}
                  </Bar>
               </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-8 pt-6 border-t border-border">
             <div className="flex items-center justify-between">
                <span className="text-[10px] font-black text-zinc-muted uppercase tracking-widest">Average Utilization</span>
                <span className="text-sm font-black text-zinc-text tracking-tighter">57.0%</span>
             </div>
          </div>
        </Card>
      </div>

      {/* Detailed Telemetry Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 border-border hover:border-brand/20 transition-all group">
           <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-obsidian-outer border border-border text-info rounded-sm group-hover:bg-info/10 transition-colors">
                 <Zap className="w-5 h-5" />
              </div>
              <div className="text-right">
                 <p className="text-[10px] font-black text-zinc-muted uppercase tracking-widest">Compute Intensity</p>
                 <p className="text-lg font-black text-zinc-text tracking-tighter">4.2 TFLOPs</p>
              </div>
           </div>
           <p className="text-[10px] font-bold text-zinc-muted uppercase italic leading-relaxed">System processing power utilization is currently within optimal cluster constraints.</p>
        </Card>

        <Card className="p-6 border-border hover:border-brand/20 transition-all group">
           <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-obsidian-outer border border-border text-success rounded-sm group-hover:bg-success/10 transition-colors">
                 <TrendingUp className="w-5 h-5" />
              </div>
              <div className="text-right">
                 <p className="text-[10px] font-black text-zinc-muted uppercase tracking-widest">Sync Consistency</p>
                 <p className="text-lg font-black text-zinc-text tracking-tighter">99.98%</p>
              </div>
           </div>
           <p className="text-[10px] font-bold text-zinc-muted uppercase italic leading-relaxed">State propagation across the 14 regional clusters is synchronized and validated.</p>
        </Card>

        <Card className="p-6 border-border hover:border-brand/20 transition-all group">
           <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-obsidian-outer border border-border text-brand rounded-sm group-hover:bg-brand/10 transition-colors">
                 <Cpu className="w-5 h-5" />
              </div>
              <div className="text-right">
                 <p className="text-[10px] font-black text-zinc-muted uppercase tracking-widest">Active Threads</p>
                 <p className="text-lg font-black text-zinc-text tracking-tighter">1,284 Unitized</p>
              </div>
           </div>
           <p className="text-[10px] font-bold text-zinc-muted uppercase italic leading-relaxed">Current concurrent operations are executing with a thread pool health of nominal.</p>
        </Card>
      </div>
    </div>
  );
};
