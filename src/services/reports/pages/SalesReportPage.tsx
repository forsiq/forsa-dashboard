import React, { useState } from 'react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Download } from 'lucide-react';
import { useLanguage } from '@core/contexts/LanguageContext';
import { formatCurrency } from '@core/lib/utils/formatCurrency';
import { cn } from '@core/lib/utils/cn';
import { AmberButton } from '@core/components/AmberButton';
import { AmberExcelExport } from '@core/components/Data/AmberExcelExport';
import { useGetSalesReport } from '../hooks';
import { ReportStatsCard } from '../components/ReportStatsCard';
import { ReportPanelCard } from '../components/ReportPanelCard';
import { hasChartValues } from '../utils/chartData';
import {
  chartAxisTick,
  chartGridStroke,
  chartMargin,
  chartTooltipStyle,
  getCategoryXAxisProps,
  getValueYAxisProps,
  reportChartGridClass,
  reportHeaderSubtitleClass,
  reportHeaderTitleClass,
  reportKpiGridClass,
  reportPageClass,
} from '../utils/reportLayout';

/**
 * SalesReportPage - Detailed sales report
 */
export function SalesReportPage() {
  const { t, dir } = useLanguage();
  const isRTL = dir === 'rtl';
  const [timeframe, setTimeframe] = useState('month');
  const { data: report, isLoading } = useGetSalesReport({
    queryKey: [`sales-report-${timeframe}`],
    queryFn: () => import('../api/reports').then((m) => m.getSalesReport(timeframe)),
  });

  const products = report?.products ?? [];
  const hasProductChartData = hasChartValues(products, ['revenue', 'sales']);

  const kpis = [
    {
      label: t('report.gross_sales'),
      value: report != null ? formatCurrency(report.grossSales ?? 0) : '--',
      change: report?.grossSalesChange || undefined,
      color: 'text-brand',
    },
    {
      label: t('report.net_profit'),
      value: report != null ? formatCurrency(report.netProfit ?? 0) : '--',
      change: report?.netProfitChange || undefined,
      color: 'text-success',
    },
    {
      label: t('report.tax_collected'),
      value: report != null ? formatCurrency(report.taxCollected ?? 0) : '--',
      change: report?.taxCollectedChange || undefined,
      color: 'text-warning',
    },
    {
      label: t('report.shipping'),
      value: report != null ? formatCurrency(report.shipping ?? 0) : '--',
      change: report?.shippingChange || undefined,
      color: 'text-info',
    },
  ];

  const periodComparisonData = hasProductChartData
    ? products.map((p) => ({ ...p, goal: (p.revenue ?? 0) * 0.85 }))
    : [];

  return (
    <div className={reportPageClass} dir={dir}>
      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 md:gap-6 min-w-0 text-start">
        <div className="space-y-1 min-w-0">
          <h1 className={reportHeaderTitleClass}>{t('report.sales_report') || 'تقرير المبيعات'}</h1>
          <p className={reportHeaderSubtitleClass}>{t('report.sales_subtitle') || 'تفصيل شامل للمبيعات والفئات والأرباح'}</p>
        </div>

        <div className="flex flex-wrap items-center gap-2 md:gap-3">
          <div className="flex flex-wrap items-center bg-obsidian-card border border-white/5 p-1 rounded-xl shadow-inner">
            {['day', 'week', 'month', 'year'].map((t_frame) => (
              <button
                key={t_frame}
                type="button"
                onClick={() => setTimeframe(t_frame)}
                className={cn(
                  'px-3 md:px-4 py-2 min-h-[36px] text-[10px] md:text-xs font-black uppercase tracking-widest rounded-lg transition-all',
                  timeframe === t_frame
                    ? 'bg-brand text-black shadow-lg'
                    : 'text-zinc-muted hover:text-zinc-text hover:bg-white/5'
                )}
              >
                {t(`report.timeframe.${t_frame}`)}
              </button>
            ))}
          </div>

          <AmberExcelExport
            data={products}
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
          <div className={reportKpiGridClass}>
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-28 bg-obsidian-card rounded-xl animate-pulse" />
            ))}
          </div>
          <div className="h-96 bg-obsidian-card rounded-xl animate-pulse" />
        </div>
      ) : (
        <div className="space-y-6 md:space-y-8">
          <div className={reportKpiGridClass}>
            {kpis.map((kpi, i) => (
              <ReportStatsCard
                key={i}
                label={kpi.label}
                value={kpi.value}
                change={kpi.change && kpi.change !== '0%' && kpi.change !== '+0%' ? kpi.change : undefined}
                color={kpi.color}
                isRTL={isRTL}
              />
            ))}
          </div>

          <div className={reportChartGridClass}>
            <ReportPanelCard
              title={t('report.product_performance') || 'Product Revenue Contribution'}
              isEmpty={!hasProductChartData}
              bodyMinHeight="min-h-[320px]"
            >
              <div className="h-[320px] w-full min-w-0">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={products} layout="vertical" margin={{ ...chartMargin, left: 8 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={chartGridStroke} horizontal={false} />
                    <XAxis type="number" {...getValueYAxisProps()} />
                    <YAxis
                      type="category"
                      dataKey="name"
                      tick={chartAxisTick}
                      width={88}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      contentStyle={chartTooltipStyle}
                      formatter={(value: string | number | (string | number)[]) =>
                        formatCurrency(Array.isArray(value) ? value[0] : value)
                      }
                    />
                    <Bar dataKey="revenue" fill="#3b82f6" radius={[0, 4, 4, 0]} maxBarSize={28} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </ReportPanelCard>

            <ReportPanelCard
              title={t('report.period_comparison') || 'Revenue vs Goal'}
              isEmpty={!hasProductChartData}
              bodyMinHeight="min-h-[320px]"
            >
              <div className="h-[320px] w-full min-w-0">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={periodComparisonData} margin={chartMargin}>
                    <CartesianGrid strokeDasharray="3 3" stroke={chartGridStroke} vertical={false} />
                    <XAxis dataKey="name" {...getCategoryXAxisProps(isRTL)} />
                    <YAxis {...getValueYAxisProps()} />
                    <Tooltip contentStyle={chartTooltipStyle} />
                    <Area type="monotone" dataKey="revenue" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.1} strokeWidth={2} />
                    <Area type="monotone" dataKey="goal" stroke="#71717a" fill="transparent" strokeDasharray="5 5" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </ReportPanelCard>
          </div>
        </div>
      )}
    </div>
  );
}

export default SalesReportPage;
