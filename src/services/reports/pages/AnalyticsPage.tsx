import React, { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { TrendingUp, Users, ShoppingCart, DollarSign } from 'lucide-react';
import { useLanguage } from '@core/contexts/LanguageContext';
import { formatCurrency } from '@core/lib/utils/formatCurrency';
import { useGetAnalytics } from '../hooks';
import { ReportStatsCard } from '../components/ReportStatsCard';
import { ReportPanelCard } from '../components/ReportPanelCard';
import { hasChartValues } from '../utils/chartData';
import {
  chartMargin,
  getChartGridStroke,
  getChartTooltipStyle,
  getCategoryXAxisProps,
  getValueYAxisProps,
  reportHeaderSubtitleClass,
  reportHeaderTitleClass,
  reportKpiGridClass,
  reportPageClass,
} from '../utils/reportLayout';

const COLORS = [
  'var(--chart-3, #10B981)',
  'var(--chart-2, #3B82F6)',
  'var(--chart-1, #FFC000)',
  'var(--chart-4, #EF4444)',
  'var(--chart-5, #8B5CF6)',
];

export function AnalyticsPage() {
  const { t, dir } = useLanguage();
  const isRTL = dir === 'rtl';
  const { data: analytics, isLoading } = useGetAnalytics();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const salesSeries = analytics?.sales ?? [];
  const ordersSeries = analytics?.orders ?? [];
  const hasSalesData = hasChartValues(salesSeries, ['value']);
  const hasOrdersData = hasChartValues(ordersSeries, ['value']);

  const pieData: { name: string; value: number }[] = [];

  const summaryStats = [
    {
      label: t('report.total_revenue'),
      value: analytics?.totalRevenue != null ? formatCurrency(analytics.totalRevenue) : '--',
      change: analytics?.totalRevenueChange || undefined,
      icon: DollarSign,
      color: 'text-success',
    },
    {
      label: t('report.active_users'),
      value: analytics?.activeUsers != null ? analytics.activeUsers.toLocaleString() : '--',
      change: analytics?.activeUsersChange || undefined,
      icon: Users,
      color: 'text-info',
    },
    {
      label: t('report.avg_order'),
      value: analytics?.avgOrderValue != null ? formatCurrency(analytics.avgOrderValue) : '--',
      change: analytics?.avgOrderValueChange || undefined,
      icon: ShoppingCart,
      color: 'text-warning',
    },
    {
      label: t('report.conversion_rate'),
      value: analytics?.conversionRate != null ? `${analytics.conversionRate}%` : '--',
      change: analytics?.conversionRateChange || undefined,
      icon: TrendingUp,
      color: 'text-brand',
    },
  ];

  if (!isClient) return null;

  return (
    <div className={reportPageClass} dir={dir}>
      <div className="space-y-1 min-w-0 text-start">
        <h1 className={reportHeaderTitleClass}>
          {t('report.analytics') || 'التحليلات'}
        </h1>
        <p className={reportHeaderSubtitleClass}>
          {t('report.analytics_subtitle') || 'تتبع أداء الأعمال والمؤشرات الرئيسية'}
        </p>
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
        <>
          <div className={reportKpiGridClass}>
            {summaryStats.map((stat, i) => (
              <ReportStatsCard
                key={i}
                label={stat.label}
                value={stat.value}
                change={stat.change && stat.change !== '0%' && stat.change !== '+0%' ? stat.change : undefined}
                icon={stat.icon}
                color={stat.color}
                isRTL={isRTL}
              />
            ))}
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 md:gap-8 min-w-0">
            <ReportPanelCard
              title={t('report.sales_performance') || 'Sales Performance'}
              className="xl:col-span-2 min-w-0"
              isEmpty={!hasSalesData}
              bodyMinHeight="min-h-[320px]"
            >
              <div className="h-[320px] w-full min-w-0">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={salesSeries} margin={chartMargin}>
                    <defs>
                      <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke={getChartGridStroke()} vertical={false} />
                    <XAxis dataKey="date" {...getCategoryXAxisProps(isRTL)} />
                    <YAxis {...getValueYAxisProps()} />
                    <Tooltip contentStyle={getChartTooltipStyle()} itemStyle={{ fontSize: '12px', fontWeight: 700 }} />
                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke="var(--chart-3, #10B981)"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorSales)"
                      name="Revenue"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </ReportPanelCard>

            <ReportPanelCard
              title={t('report.inventory_dist') || 'Inventory Distribution'}
              isEmpty={pieData.length === 0}
              bodyMinHeight="min-h-[320px]"
            >
              <div className="h-[320px] w-full min-w-0 flex flex-col items-center">
                <ResponsiveContainer width="100%" height="80%">
                  <PieChart>
                    <Pie data={pieData} innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value">
                      {pieData.map((_entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                          stroke="var(--color-border-subtle, rgba(0,0,0,0.06))"
                          strokeWidth={2}
                        />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={getChartTooltipStyle()} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full px-2">
                  {pieData.map((d, i) => (
                    <div key={i} className="flex items-center gap-2 min-w-0">
                      <div className="w-2 h-2 shrink-0 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                      <span className="text-[11px] font-black text-zinc-muted uppercase tracking-tight truncate">{d.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </ReportPanelCard>
          </div>

          <ReportPanelCard
            title={t('report.orders_overview') || 'Orders Load Pattern'}
            isEmpty={!hasOrdersData}
            bodyMinHeight="min-h-[280px]"
          >
            <div className="h-[280px] w-full min-w-0">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={ordersSeries} margin={chartMargin} barCategoryGap="25%">
                  <CartesianGrid strokeDasharray="3 3" stroke={getChartGridStroke()} vertical={false} />
                  <XAxis dataKey="date" {...getCategoryXAxisProps(isRTL)} />
                  <YAxis {...getValueYAxisProps()} allowDecimals={false} />
                  <Tooltip contentStyle={getChartTooltipStyle()} />
                  <Bar dataKey="value" fill="var(--chart-2, #3B82F6)" radius={[4, 4, 0, 0]} maxBarSize={32} name="Orders" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </ReportPanelCard>
        </>
      )}
    </div>
  );
}

export default AnalyticsPage;
