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
  Area,
  BarChart,
  Bar
} from 'recharts';
import { AmberCard } from '@core/components/AmberCard';
import { useLanguage } from '@core/contexts/LanguageContext';
import { formatCurrency } from '@core/lib/utils/formatCurrency';

interface DashboardChartsProps {
  salesData: any[];
  categoryData: any[];
}

const CHART_COLORS = [
  'var(--chart-1)',
  'var(--chart-2)',
  'var(--chart-3)',
  'var(--chart-4)',
  'var(--chart-5)',
];

export const DashboardCharts: React.FC<DashboardChartsProps> = ({ salesData, categoryData }) => {
  const { t } = useLanguage();

  const hasCategoryData = categoryData.some((d: any) => (d.orders || 0) > 0);
  const hasSalesData = salesData.some((d: any) => (d.revenue || 0) > 0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Sales Trend Chart */}
      <AmberCard className="!p-6 h-[400px] flex flex-col">
        <div className="flex items-center justify-between mb-6 border-b border-white/5 pb-4">
           <h3 className="text-xs font-black text-zinc-text uppercase tracking-[0.2em] border-l-2 border-brand pl-3">
             {t('dash.sales_trend') || 'Sales Trend (30 Days)'}
           </h3>
           {hasSalesData && (
             <span className="text-[10px] font-semibold text-zinc-muted">
               {salesData.length > 0 && `${salesData.filter((d: any) => d.orders > 0).length} ${t('dash.active_days') || 'active days'}`}
             </span>
           )}
        </div>
        <div className="flex-1 w-full">
          {hasSalesData ? (
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
                  tickFormatter={(val) => {
                    const parts = val.split('-');
                    return `${parts[1]}/${parts[2]}`;
                  }}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }}
                  tickFormatter={(val) => formatCurrency(val)}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'var(--color-obsidian-card)', 
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: 'bold'
                  }}
                  formatter={(value: number, name: string) => {
                    if (name === 'revenue') return [formatCurrency(value), t('dash.revenue') || 'Revenue'];
                    return [value, t('dash.orders') || 'Orders'];
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="var(--color-brand)" 
                  fillOpacity={1} 
                  fill="url(#colorRevenue)" 
                  strokeWidth={2.5}
                  dot={false}
                  activeDot={{ r: 4, fill: 'var(--color-brand)', stroke: 'var(--color-obsidian-card)', strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center">
              <div className="text-center space-y-2">
                <p className="text-sm font-semibold text-zinc-muted">{t('dash.no_sales_data') || 'No sales data yet'}</p>
                <p className="text-[10px] text-zinc-muted/50">{t('dash.sales_data_hint') || 'Sales data will appear here when orders are placed'}</p>
              </div>
            </div>
          )}
        </div>
      </AmberCard>

      {/* Category Distribution Chart */}
      <AmberCard className="!p-6 h-[400px] flex flex-col">
        <div className="flex items-center justify-between mb-6 border-b border-white/5 pb-4">
           <h3 className="text-xs font-black text-zinc-text uppercase tracking-[0.2em] border-l-2 border-brand pl-3">
             {t('dash.category_distribution') || 'Top Categories'}
           </h3>
        </div>
        <div className="flex-1 w-full flex items-center">
          {hasCategoryData ? (
            <>
              <div className="flex-1 h-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={65}
                      outerRadius={105}
                      paddingAngle={3}
                      dataKey="orders"
                      stroke="none"
                    >
                      {categoryData.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
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
                      formatter={(value: number) => [value, t('dash.products') || 'Products']}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="w-2/5 space-y-3 pr-2">
                {categoryData.map((entry: any, index: number) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }} />
                    <span className="text-xs font-semibold text-zinc-text truncate flex-1">{entry.category}</span>
                    <span className="text-[10px] font-bold text-zinc-muted tabular-nums">{entry.orders}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-center space-y-2">
                <p className="text-sm font-semibold text-zinc-muted">{t('dash.no_category_data') || 'No category data'}</p>
                <p className="text-[10px] text-zinc-muted/50">{t('dash.category_data_hint') || 'Add products to categories to see distribution'}</p>
              </div>
            </div>
          )}
        </div>
      </AmberCard>
    </div>
  );
};
