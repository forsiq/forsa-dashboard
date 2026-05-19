import React, { useState, useEffect, useMemo } from 'react';
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
import { formatCurrency } from '@core/lib/utils/formatCurrency';
import { cn } from '@core/lib/utils/cn';
import { AmberCard } from '@core/components/AmberCard';
import { ReportStatsCard } from '../components/ReportStatsCard';
import { useGetGroupBuyings, useGetGroupBuyingStats } from '../../../features/sales/api/group-buying-hooks';
import type { GroupBuying } from '../../../features/sales/types';

const COLORS = ['#22c55e', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];

/**
 * GroupBuyingAnalyticsPage - Group buying deal analytics
 */
export function GroupBuyingAnalyticsPage() {
  const { t, dir } = useLanguage();
  const isRTL = dir === 'rtl';
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

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
      value: activeDeals,
      icon: ShoppingCart,
      color: 'text-brand',
    },
    {
      label: t('report.completed_deals') || 'Completed Deals',
      value: completedDeals,
      icon: CheckCircle,
      color: 'text-success',
    },
    {
      label: t('report.avg_discount') || 'Average Discount %',
      value: avgDiscount > 0 ? `${avgDiscount}%` : 'N/A',
      icon: Percent,
      color: 'text-warning',
    },
    {
      label: t('report.total_participants') || 'Total Participants',
      value: totalParticipants,
      icon: Users,
      color: 'text-info',
    },
  ];

  const statusData = useMemo(() => {
    const counts: Record<string, number> = {};
    deals.forEach((d: GroupBuying) => {
      counts[d.status] = (counts[d.status] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [deals]);

  const pieData = useMemo(() => {
    const completed = deals.filter((d: GroupBuying) => d.status === 'completed').length;
    const expired = deals.filter((d: GroupBuying) => d.status === 'expired').length;
    const cancelled = deals.filter((d: GroupBuying) => d.status === 'cancelled').length;
    const result: { name: string; value: number }[] = [];
    if (completed > 0) result.push({ name: 'Completed', value: completed });
    if (expired > 0) result.push({ name: 'Expired', value: expired });
    if (cancelled > 0) result.push({ name: 'Cancelled', value: cancelled });
    return result;
  }, [deals]);

  const topDeals = useMemo(
    () =>
      [...deals]
        .sort((a: GroupBuying, b: GroupBuying) => (b.currentParticipants || 0) - (a.currentParticipants || 0))
        .slice(0, 10),
    [deals]
  );

  if (!isClient) return null;

  return (
    <div className="space-y-8 p-6 max-w-[1600px] mx-auto animate-in fade-in duration-700" dir={dir}>
      {/* Header */}
      <div className="space-y-1 text-start">
        <h1 className="text-4xl font-black text-zinc-text tracking-tight leading-none">
          {t('report.group_buying_analytics') || 'Group Buying Analytics'}
        </h1>
        <p className="text-base text-zinc-secondary font-bold">
          {t('report.group_buying_analytics_desc') || 'Track deal performance, participation, and completion rates'}
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 bg-obsidian-card rounded-xl animate-pulse" />
            ))}
          </div>
          <div className="h-96 bg-obsidian-card rounded-xl animate-pulse" />
        </div>
      ) : (
        <>
          {/* KPI Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
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

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Deals by Status */}
            <AmberCard title={t('report.deals_by_status') || 'Deals by Status'}>
              <div className="h-[350px] w-full pt-6">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={statusData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                    <XAxis
                      dataKey="name"
                      stroke="#3f3f46"
                      tick={{ fill: '#71717a', fontSize: 11, fontWeight: 700 }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      stroke="#3f3f46"
                      tick={{ fill: '#71717a', fontSize: 11, fontWeight: 700 }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#18181b',
                        border: '1px solid #27272a',
                        borderRadius: '12px',
                      }}
                    />
                    <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </AmberCard>

            {/* Deal Completion Rate Pie Chart */}
            <AmberCard title={t('report.deal_completion_rate') || 'Deal Completion Rate'}>
              <div className="h-[350px] w-full flex flex-col items-center pt-4">
                {pieData.length === 0 ? (
                  <p className="text-sm text-zinc-muted font-bold py-12">
                    {t('report.no_data') || 'No data available'}
                  </p>
                ) : (
                  <>
                    <ResponsiveContainer width="100%" height="80%">
                      <PieChart>
                        <Pie
                          data={pieData}
                          innerRadius={60}
                          outerRadius={100}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {pieData.map((_entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={COLORS[index % COLORS.length]}
                              stroke="rgba(255,255,255,0.05)"
                              strokeWidth={2}
                            />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#18181b',
                            border: '1px solid #27272a',
                            borderRadius: '12px',
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="grid grid-cols-3 gap-4 w-full px-4">
                      {pieData.map((d, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <div
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: COLORS[i % COLORS.length] }}
                          />
                          <span className="text-[11px] font-black text-zinc-muted uppercase tracking-tight">
                            {d.name} ({d.value})
                          </span>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </AmberCard>
          </div>

          {/* Top Deals Table */}
          <AmberCard title={t('report.top_deals') || 'Top Deals'}>
            <div className="overflow-x-auto">
              <table className="w-full text-start">
                <thead>
                  <tr className="border-b border-[var(--color-border)]">
                    <th className="pb-3 text-[11px] font-black text-zinc-muted uppercase tracking-widest">
                      {t('group_buying.title') || 'Deal'}
                    </th>
                    <th className="pb-3 text-[11px] font-black text-zinc-muted uppercase tracking-widest text-end">
                      {t('report.participants') || 'Participants'}
                    </th>
                    <th className="pb-3 text-[11px] font-black text-zinc-muted uppercase tracking-widest text-end">
                      {t('report.discount_pct') || 'Discount %'}
                    </th>
                    <th className="pb-3 text-[11px] font-black text-zinc-muted uppercase tracking-widest text-center">
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
                          className="border-b border-[var(--color-border)] last:border-0 hover:bg-white/[0.02] transition-colors"
                        >
                          <td className="py-3">
                            <span className="text-sm font-bold text-zinc-text">{deal.title}</span>
                          </td>
                          <td className="py-3 text-end">
                            <span className="text-sm font-bold text-zinc-text tabular-nums">
                              {deal.currentParticipants || 0}/{deal.minParticipants || 0}
                            </span>
                          </td>
                          <td className="py-3 text-end">
                            <span className="text-sm font-black text-success tabular-nums">
                              {discountPct > 0 ? `${discountPct}%` : 'N/A'}
                            </span>
                          </td>
                          <td className="py-3 text-center">
                            <span
                              className={cn(
                                'inline-flex px-2.5 py-1 rounded-full text-[11px] font-black uppercase tracking-wider',
                                deal.status === 'active'
                                  ? 'bg-success/10 text-success'
                                  : deal.status === 'completed'
                                    ? 'bg-brand/10 text-brand'
                                    : deal.status === 'expired'
                                      ? 'bg-warning/10 text-warning'
                                      : 'bg-zinc-500/10 text-zinc-400'
                              )}
                            >
                              {deal.status}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </AmberCard>
        </>
      )}
    </div>
  );
}

export default GroupBuyingAnalyticsPage;
