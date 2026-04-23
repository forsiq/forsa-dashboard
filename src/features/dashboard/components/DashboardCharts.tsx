import React from 'react';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from 'recharts';
import { AmberCard } from '@core/components/AmberCard';
import { useLanguage } from '@core/contexts/LanguageContext';

interface DashboardChartsProps {
  salesData: any[];
  categoryData: any[];
}

export const DashboardCharts: React.FC<DashboardChartsProps> = ({ salesData, categoryData }) => {
  const { t } = useLanguage();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Sales Trend Chart */}
      <AmberCard className="!p-6 h-[400px] flex flex-col">
        <div className="flex items-center justify-between mb-6 border-b border-white/5 pb-4">
           <h3 className="text-xs font-black text-zinc-text uppercase tracking-[0.2em] border-l-2 border-brand pl-3">
             {t('dash.sales_trend') || 'Sales Trend (30 Days)'}
           </h3>
        </div>
        <div className="flex-1 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={salesData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-brand)" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="var(--color-brand)" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis 
                dataKey="date" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }}
                tickFormatter={(val) => val.split('-').slice(1).join('/')}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'var(--color-obsidian-card)', 
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '12px',
                  fontSize: '12px',
                  fontWeight: 'bold'
                }}
                itemStyle={{ color: 'var(--color-brand)' }}
              />
              <Area 
                type="monotone" 
                dataKey="revenue" 
                stroke="var(--color-brand)" 
                fillOpacity={1} 
                fill="url(#colorRevenue)" 
                strokeWidth={3}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </AmberCard>

      {/* Category Distribution Chart */}
      <AmberCard className="!p-6 h-[400px] flex flex-col">
        <div className="flex items-center justify-between mb-6 border-b border-white/5 pb-4">
           <h3 className="text-xs font-black text-zinc-text uppercase tracking-[0.2em] border-l-2 border-brand pl-3">
             {t('dash.category_distribution') || 'Top Categories'}
           </h3>
        </div>
        <div className="flex-1 w-full flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="orders"
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} stroke="rgba(0,0,0,0.2)" />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'var(--color-obsidian-card)', 
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '12px',
                  fontSize: '12px',
                  fontWeight: 'bold'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="w-1/3 space-y-3 pr-4">
             {categoryData.map((entry, index) => (
               <div key={index} className="flex items-center gap-2">
                 <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.fill }} />
                 <span className="text-[10px] font-semibold text-zinc-muted tracking-widest truncate">{entry.category}</span>
               </div>
             ))}
          </div>
        </div>
      </AmberCard>
    </div>
  );
};
