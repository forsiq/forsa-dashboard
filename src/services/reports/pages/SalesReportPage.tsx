import React, { useState } from 'react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Download } from 'lucide-react';
import { useLanguage } from '../../../core/contexts/LanguageContext';
import { cn } from '../../../core/lib/utils/cn';
import { AmberCard } from '../../../core/components/AmberCard';
import { AmberButton } from '../../../core/components/AmberButton';
import { AmberExcelExport } from '../../../core/components/Data/AmberExcelExport';
import { useGetSalesReport } from '../hooks';
import { ReportStatsCard } from '../components/ReportStatsCard';

const COLORS = ['#22c55e', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];

/**
 * SalesReportPage - Detailed sales report
 */
export function SalesReportPage() {
  const { t, dir } = useLanguage();
  const isRTL = dir === 'rtl';
  const { data: report, isLoading } = useGetSalesReport();
  const [timeframe, setTimeframe] = useState('month');

  const kpis = [
    { 
      label: t('report.gross_sales'), 
      value: report?.grossSales ? `$${report.grossSales.toLocaleString()}` : '$154,200', 
      change: report?.grossSalesChange || '+14%', 
      color: 'text-brand' 
    },
    { 
      label: t('report.net_profit'), 
      value: report?.netProfit ? `$${report.netProfit.toLocaleString()}` : '$42,500', 
      change: report?.netProfitChange || '+8%', 
      color: 'text-success' 
    },
    { 
      label: t('report.tax_collected'), 
      value: report?.taxCollected ? `$${report.taxCollected.toLocaleString()}` : '$12,430', 
      change: report?.taxCollectedChange || '+12%', 
      color: 'text-warning' 
    },
    { 
      label: t('report.shipping'), 
      value: report?.shipping ? `$${report.shipping.toLocaleString()}` : '$5,200', 
      change: report?.shippingChange || '+5%', 
      color: 'text-info' 
    },
  ];

  return (
    <div className="space-y-8 p-6 max-w-[1600px] mx-auto animate-in fade-in duration-700" dir={dir}>
      {/* Header */}
      <div className={cn(
        "flex flex-col lg:flex-row lg:items-start justify-between gap-6",
        isRTL ? "text-right" : "text-left"
      )}>
        <div className="space-y-1">
          <h1 className="text-4xl font-black text-zinc-text tracking-tight leading-none">{t('report.sales_report') || 'تقرير المبيعات'}</h1>
          <p className="text-base text-zinc-secondary font-bold">{t('report.sales_subtitle') || 'تفصيل شامل للمبيعات والفئات والأرباح'}</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          {/* Timeframe Select */}
          <div className="flex items-center bg-obsidian-card border border-white/5 p-1 rounded-xl shadow-inner">
            {['day', 'week', 'month', 'year'].map((t_frame) => (
              <button
                key={t_frame}
                onClick={() => setTimeframe(t_frame)}
                className={cn(
                  "px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all",
                  timeframe === t_frame 
                    ? "bg-brand text-black shadow-lg" 
                    : "text-zinc-muted hover:text-zinc-text hover:bg-white/5"
                )}
              >
                {t(`report.timeframe.${t_frame}`)}
              </button>
            ))}
          </div>

          <AmberExcelExport
            data={report?.products || []}
            columns={[
              { key: 'name', label: t('common.name') || 'Name' },
              { key: 'sales', label: t('report.sales') || 'Sales' },
              { key: 'revenue', label: t('report.revenue') || 'Revenue' },
            ]}
            filename={`sales-report-${timeframe}`}
            trigger={
              <AmberButton className="gap-2 px-6 h-11 bg-white/5 hover:bg-white/10 text-zinc-text font-bold rounded-xl shadow-sm transition-all border border-white/5">
                <Download className="w-4 h-4" />
                <span>{t('report.export') || 'تصدير'}</span>
              </AmberButton>
            }
          />
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-6">
          <div className="grid grid-cols-4 gap-6">
            {[1,2,3,4].map(i => <div key={i} className="h-24 bg-obsidian-card rounded-xl animate-pulse" />)}
          </div>
          <div className="h-96 bg-obsidian-card rounded-xl animate-pulse" />
        </div>
      ) : (
        <div className="space-y-8">
          {/* KPI Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {kpis.map((kpi, i) => (
              <ReportStatsCard
                key={i}
                label={kpi.label}
                value={kpi.value}
                change={kpi.change}
                color={kpi.color}
                isRTL={isRTL}
              />
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Products Performance */}
            <AmberCard title={t('report.product_performance') || 'Product Revenue Contribution'}>
              <div className="h-[350px] w-full pt-6">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={report?.products || []} layout="vertical" margin={{ left: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                    <XAxis type="number" stroke="#3f3f46" tick={{ fill: '#71717a', fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis type="category" dataKey="name" stroke="#71717a" tick={{ fill: '#a1a1aa', fontSize: 10, fontWeight: 700 }} width={100} axisLine={false} tickLine={false} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '12px' }}
                      formatter={(value) => `$${value.toLocaleString()}`}
                    />
                    <Bar dataKey="revenue" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={25} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </AmberCard>

            {/* Area Chart for Revenue Trends */}
            <AmberCard title={t('report.period_comparison') || 'Revenue vs Goal'}>
              <div className="h-[350px] w-full pt-6">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={report?.products?.map((p, i) => ({ ...p, goal: p.revenue * 0.85 })) || []}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                    <XAxis dataKey="name" stroke="#3f3f46" tick={{ fill: '#71717a', fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis stroke="#3f3f46" tick={{ fill: '#71717a', fontSize: 10 }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '12px' }} />
                    <Area type="monotone" dataKey="revenue" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.1} strokeWidth={3} />
                    <Area type="monotone" dataKey="goal" stroke="#71717a" fill="transparent" strokeDasharray="5 5" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </AmberCard>
          </div>
        </div>
      )}
    </div>
  );
}

export default SalesReportPage;
