import React, { useMemo } from 'react';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { ShoppingCart, CheckCircle, Percent, Users } from 'lucide-react';
import { useLanguage } from '@core/contexts/LanguageContext';
import { resolveStatusLabel } from '@core/lib/utils/resolveStatusLabel';
import { StatusBadge } from '@core/components/Data/StatusBadge';
import { ReportStatsCard } from '../components/ReportStatsCard';
import { ReportPanelCard } from '../components/ReportPanelCard';
import { ReportChartFrame } from '../components/ReportChartFrame';
import { hasChartValues } from '../utils/chartData';
import {
  chartGridStroke,
  chartMargin,
  chartTooltipStyle,
  formatReportMetric,
  getCategoryYAxisProps,
  getIntegerXAxisProps,
  reportChartGridClass,
  reportHeaderSubtitleClass,
  reportHeaderTitleClass,
  reportKpiGridClass,
  reportPageClass,
} from '../utils/reportLayout';
import { useGetGroupBuyings, useGetGroupBuyingStats } from '../../../features/sales/api/group-buying-hooks';
import type { GroupBuying } from '../../../features/sales/types';

const COLORS = ['#22c55e', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];

/**
 * GroupBuyingAnalyticsPage - Group buying deal analytics
 */
export function GroupBuyingAnalyticsPage() {
  const { t, dir } = useLanguage();
  const isRTL = dir === 'rtl';

  const { data: stats, isLoading: statsLoading } = useGetGroupBuyingStats();
  const { data: dealsData, isLoading: dealsLoading } = useGetGroupBuyings({ limit: 100 });

  const deals = dealsData?.groupBuyings || [];

  const isLoading = statsLoading || dealsLoading;

  const activeDeals = stats?.activeCampaigns || 0;
  const completedDeals = stats?.completedCampaigns || 0;
  const totalParticipants = stats?.totalParticipants || 0;

  const avgDiscount = useMemo(() => {
    const withOriginal = deals.filter(
      (d: GroupBuying) => d.originalPrice > 0 && d.dealPrice > 0 && d.originalPrice > d.dealPrice
    );
    if (withOriginal.length === 0) return 0;
    const totalPct = withOriginal.reduce(
      (sum: number, d: GroupBuying) => sum + ((d.originalPrice - d.dealPrice) / d.originalPrice) * 100,
      0
    );
    return Math.round((totalPct / withOriginal.length) * 10) / 10;
  }, [deals]);

  const kpis = [
    {
      label: t('report.active_deals') || 'Active Deals',
      value: formatReportMetric(activeDeals, 'number'),
      icon: ShoppingCart,
      color: 'text-brand',
    },
    {
      label: t('report.completed_deals') || 'Completed Deals',
      value: formatReportMetric(completedDeals, 'number'),
      icon: CheckCircle,
      color: 'text-success',
    },
    {
      label: t('report.avg_discount') || 'Average Discount %',
      value: avgDiscount > 0 ? formatReportMetric(avgDiscount, 'percent') : '—',
      icon: Percent,
      color: 'text-warning',
    },
    {
      label: t('report.total_participants') || 'Total Participants',
      value: formatReportMetric(totalParticipants, 'number'),
      icon: Users,
      color: 'text-info',
    },
  ];

  const statusData = useMemo(() => {
    const counts: Record<string, number> = {};
    deals.forEach((d: GroupBuying) => {
      counts[d.status] = (counts[d.status] || 0) + 1;
    });
    return Object.entries(counts).map(([status, value]) => ({
      status,
      name: resolveStatusLabel(status, t, `groupBuying.status.${status.toLowerCase()}`),
      value,
    }));
  }, [deals, t]);

  const pieData = useMemo(() => {
    const counts: Record<string, number> = {};
    deals.forEach((d: GroupBuying) => {
      counts[d.status] = (counts[d.status] || 0) + 1;
    });
    return Object.entries(counts)
      .filter(([, value]) => value > 0)
      .map(([status, value]) => ({
        status,
        name: resolveStatusLabel(status, t, `groupBuying.status.${status.toLowerCase()}`),
        value,
      }));
  }, [deals, t]);

  const topDeals = useMemo(
    () =>
      [...deals]
        .sort((a: GroupBuying, b: GroupBuying) => (b.currentParticipants || 0) - (a.currentParticipants || 0))
        .slice(0, 10),
    [deals]
  );

  const hasStatusChartData = hasChartValues(statusData, ['value']);
  const hasPieData = pieData.length > 0;

  return (
    <div className={reportPageClass} dir={dir}>
      <div className="space-y-1 min-w-0 text-start">
        <h1 className={reportHeaderTitleClass}>
          {t('report.group_buying_analytics') || 'Group Buying Analytics'}
        </h1>
        <p className={reportHeaderSubtitleClass}>
          {t('report.group_buying_analytics_desc') || 'Track deal performance, participation, and completion rates'}
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-6">
          <div className={reportKpiGridClass}>
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 bg-obsidian-card rounded-xl animate-pulse" />
            ))}
          </div>
          <div className="h-96 bg-obsidian-card rounded-xl animate-pulse" />
        </div>
      ) : (
        <>
          <div className={reportKpiGridClass}>
            {kpis.map((kpi, i) => (
              <ReportStatsCard
                key={i}
                label={kpi.label}
                value={kpi.value}
                icon={kpi.icon}
                color={kpi.color}
                isRTL={isRTL}
              />
            ))}
          </div>

          <div className={reportChartGridClass}>
            <ReportPanelCard
              title={t('report.deals_by_status') || 'Deals by Status'}
              isEmpty={!hasStatusChartData}
              bodyMinHeight="min-h-[300px]"
            >
              <ReportChartFrame heightClass="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    layout="vertical"
                    data={statusData}
                    margin={{ ...chartMargin, left: 4, right: 16 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke={chartGridStroke} horizontal={false} />
                    <XAxis type="number" {...getIntegerXAxisProps()} />
                    <YAxis dataKey="name" {...getCategoryYAxisProps(isRTL ? 80 : 72)} />
                    <Tooltip contentStyle={chartTooltipStyle} />
                    <Bar dataKey="value" fill="#3b82f6" radius={[0, 4, 4, 0]} maxBarSize={36} />
                  </BarChart>
                </ResponsiveContainer>
              </ReportChartFrame>
            </ReportPanelCard>

            <ReportPanelCard
              title={t('report.deal_completion_rate') || 'Deal Completion Rate'}
              isEmpty={!hasPieData}
              bodyMinHeight="min-h-[300px]"
            >
              <ReportChartFrame heightClass="h-[300px]" className="flex flex-col">
                <div className="flex-1 min-h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={pieData} innerRadius={56} outerRadius={92} paddingAngle={4} dataKey="value">
                        {pieData.map((_entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                            stroke="rgba(255,255,255,0.05)"
                            strokeWidth={2}
                          />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={chartTooltipStyle} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full px-1 pt-2 shrink-0">
                  {pieData.map((d, i) => (
                    <div key={d.status} className="flex items-center gap-2 min-w-0">
                      <div
                        className="w-2 h-2 shrink-0 rounded-full"
                        style={{ backgroundColor: COLORS[i % COLORS.length] }}
                      />
                      <span className="text-[11px] font-black text-zinc-muted tracking-tight truncate">
                        {d.name} ({d.value})
                      </span>
                    </div>
                  ))}
                </div>
              </ReportChartFrame>
            </ReportPanelCard>
          </div>

          <ReportPanelCard title={t('report.top_deals') || 'Top Deals'}>
            <div className="overflow-x-auto min-w-0">
              <table className="w-full min-w-[640px] table-fixed border-collapse text-start">
                <colgroup>
                  <col className="w-[42%]" />
                  <col className="w-[18%]" />
                  <col className="w-[18%]" />
                  <col className="w-[22%]" />
                </colgroup>
                <thead>
                  <tr className="border-b border-[var(--color-border)]">
                    <th className="pb-3 pe-3 text-[11px] font-black text-zinc-muted uppercase tracking-widest text-start">
                      {t('groupBuying.title') || t('report.deal_title') || 'Deal'}
                    </th>
                    <th className="pb-3 px-2 text-[11px] font-black text-zinc-muted uppercase tracking-widest text-center whitespace-nowrap">
                      {t('report.participants') || 'Participants'}
                    </th>
                    <th className="pb-3 px-2 text-[11px] font-black text-zinc-muted uppercase tracking-widest text-center whitespace-nowrap">
                      {t('report.discount_pct') || 'Discount %'}
                    </th>
                    <th className="pb-3 ps-2 text-[11px] font-black text-zinc-muted uppercase tracking-widest text-center whitespace-nowrap">
                      {t('auction.table.state') || 'Status'}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {topDeals.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-zinc-muted text-sm font-bold">
                        {t('report.no_data') || 'No data available'}
                      </td>
                    </tr>
                  ) : (
                    topDeals.map((deal) => {
                      const discountPct =
                        deal.originalPrice > 0
                          ? Math.round(((deal.originalPrice - deal.dealPrice) / deal.originalPrice) * 100)
                          : 0;
                      return (
                        <tr
                          key={deal.id}
                          className="border-b border-[var(--color-border)] last:border-0 hover:bg-white/[0.02] transition-colors align-middle"
                        >
                          <td className="py-3 pe-3 min-w-0">
                            <span className="text-sm font-bold text-zinc-text line-clamp-2 break-words leading-snug" title={deal.title}>
                              {deal.title}
                            </span>
                          </td>
                          <td className="py-3 px-2 text-center">
                            <span className="text-sm font-bold text-zinc-text tabular-nums whitespace-nowrap">
                              {deal.currentParticipants || 0}/{deal.minParticipants || 0}
                            </span>
                          </td>
                          <td className="py-3 px-2 text-center">
                            <span className="text-sm font-black text-success tabular-nums whitespace-nowrap">
                              {discountPct > 0 ? `${discountPct}%` : '—'}
                            </span>
                          </td>
                          <td className="py-3 ps-2 text-center">
                            <StatusBadge
                              status={deal.status}
                              labelKey={`groupBuying.status.${deal.status.toLowerCase()}`}
                              variant={
                                deal.status === 'active'
                                  ? 'success'
                                  : deal.status === 'completed'
                                    ? 'warning'
                                    : deal.status === 'expired'
                                      ? 'pending'
                                      : 'failed'
                              }
                              size="sm"
                              className="font-black"
                            />
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </ReportPanelCard>
        </>
      )}
    </div>
  );
}

export default GroupBuyingAnalyticsPage;
