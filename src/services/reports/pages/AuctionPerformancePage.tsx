import React, { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Gavel, CheckCircle, DollarSign, Users } from 'lucide-react';
import { useLanguage } from '@core/contexts/LanguageContext';
import { formatCurrency } from '@core/lib/utils/formatCurrency';
import { cn } from '@core/lib/utils/cn';
import { ReportStatsCard } from '../components/ReportStatsCard';
import { ReportPanelCard } from '../components/ReportPanelCard';
import { hasChartValues } from '../utils/chartData';
import { useGetAuctions, useGetAuctionStats } from '../../../features/auctions/api/auction-hooks';
import type { Auction } from '../../../features/auctions/types/auction.types';

/**
 * AuctionPerformancePage - Dedicated auction analytics
 */
export function AuctionPerformancePage() {
  const { t, dir } = useLanguage();
  const isRTL = dir === 'rtl';
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const { data: stats, isLoading: statsLoading } = useGetAuctionStats();
  const { data: auctionsData, isLoading: auctionsLoading } = useGetAuctions({ limit: 100 });

  const auctions = auctionsData?.data || [];

  const isLoading = statsLoading || auctionsLoading;

  const activeAuctions = stats?.activeAuctions || 0;
  const completedAuctions = (stats?.endedAuctions || 0) + (stats?.soldAuctions || 0);
  const totalRevenue = stats?.totalRevenue || 0;
  const avgFinalPrice = completedAuctions > 0 ? totalRevenue / completedAuctions : 0;
  const totalBids = stats?.totalBids || 0;
  const totalAuctions = stats?.totalAuctions || 0;
  const participationRate = totalAuctions > 0 ? Math.round((totalBids / totalAuctions) * 100) / 100 : 0;

  const kpis = [
    {
      label: t('report.active_auctions') || 'Active Auctions',
      value: activeAuctions,
      icon: Gavel,
      color: 'text-brand',
    },
    {
      label: t('report.completed_auctions') || 'Completed Auctions',
      value: completedAuctions,
      icon: CheckCircle,
      color: 'text-success',
    },
    {
      label: t('report.avg_final_price') || 'Avg Final Price',
      value: formatCurrency(avgFinalPrice),
      icon: DollarSign,
      color: 'text-warning',
    },
    {
      label: t('report.participation_rate') || 'Participation Rate',
      value: participationRate > 0 ? `${participationRate} bids/auction` : 'N/A',
      icon: Users,
      color: 'text-info',
    },
  ];

  const statusData = [
    { name: t('auction.status.active') || 'Active', value: stats?.activeAuctions || 0 },
    { name: t('auction.status.ended') || 'Ended', value: stats?.endedAuctions || 0 },
    { name: t('auction.status.cancelled') || 'Cancelled', value: stats?.cancelledAuctions || 0 },
    { name: t('auction.status.draft') || 'Draft', value: stats?.draftAuctions || 0 },
    { name: t('auction.status.scheduled') || 'Scheduled', value: stats?.scheduledAuctions || 0 },
    { name: t('auction.status.paused') || 'Paused', value: stats?.pausedAuctions || 0 },
  ].filter((d) => d.value > 0);

  const bidActivityData = auctions
    .filter((a: Auction) => a.createdAt)
    .sort((a: Auction, b: Auction) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
    .slice(-14)
    .map((a: Auction) => ({
      name: new Date(a.createdAt).toLocaleDateString('en', { month: 'short', day: 'numeric' }),
      bids: a.totalBids || 0,
    }));

  const topAuctions = [...auctions]
    .sort((a: Auction, b: Auction) => (b.totalBids || 0) - (a.totalBids || 0))
    .slice(0, 10);

  const hasStatusChartData = statusData.length > 0;
  const hasBidActivityData = hasChartValues(bidActivityData, ['bids']);

  if (!isClient) return null;

  return (
    <div className="space-y-8 p-6 max-w-[1600px] mx-auto animate-in fade-in duration-700" dir={dir}>
      {/* Header */}
      <div className="space-y-1 text-start">
        <h1 className="text-4xl font-black text-zinc-text tracking-tight leading-none">
          {t('report.auction_performance') || 'Auction Performance'}
        </h1>
        <p className="text-base text-zinc-secondary font-bold">
          {t('report.auction_performance_desc') || 'Detailed analytics for auction activity and results'}
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
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
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
            <ReportPanelCard
              title={t('report.auctions_by_status') || 'Auctions by Status'}
              isEmpty={!hasStatusChartData}
              bodyMinHeight="min-h-[350px]"
            >
              <div className="h-[350px] w-full">
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
            </ReportPanelCard>

            <ReportPanelCard
              title={t('report.bid_activity') || 'Bid Activity Over Time'}
              isEmpty={!hasBidActivityData}
              bodyMinHeight="min-h-[350px]"
            >
              <div className="h-[350px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={bidActivityData}>
                    <defs>
                      <linearGradient id="colorBids" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                      </linearGradient>
                    </defs>
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
                    <Area
                      type="monotone"
                      dataKey="bids"
                      stroke="#22c55e"
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#colorBids)"
                      name="Bids"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </ReportPanelCard>
          </div>

          <ReportPanelCard title={t('report.top_auctions') || 'Top Performing Auctions'}>
            <div className="overflow-x-auto">
              <table className="w-full text-start">
                <thead>
                  <tr className="border-b border-[var(--color-border)]">
                    <th className="pb-3 text-[11px] font-black text-zinc-muted uppercase tracking-widest">
                      {t('auction.table.identification') || 'Auction'}
                    </th>
                    <th className="pb-3 text-[11px] font-black text-zinc-muted uppercase tracking-widest text-end">
                      {t('report.final_price') || 'Final Price'}
                    </th>
                    <th className="pb-3 text-[11px] font-black text-zinc-muted uppercase tracking-widest text-end">
                      {t('report.bid_count') || 'Bids'}
                    </th>
                    <th className="pb-3 text-[11px] font-black text-zinc-muted uppercase tracking-widest text-center">
                      {t('auction.table.state') || 'Status'}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {topAuctions.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-zinc-muted text-sm font-bold">
                        {t('report.no_data') || 'No data available'}
                      </td>
                    </tr>
                  ) : (
                    topAuctions.map((auction) => (
                      <tr
                        key={auction.id}
                        className="border-b border-[var(--color-border)] last:border-0 hover:bg-white/[0.02] transition-colors"
                      >
                        <td className="py-3">
                          <span className="text-sm font-bold text-zinc-text">{auction.title}</span>
                        </td>
                        <td className="py-3 text-end">
                          <span className="text-sm font-black text-brand tabular-nums">
                            {formatCurrency(auction.currentBid || auction.startPrice)}
                          </span>
                        </td>
                        <td className="py-3 text-end">
                          <span className="text-sm font-bold text-zinc-text tabular-nums">
                            {auction.totalBids || 0}
                          </span>
                        </td>
                        <td className="py-3 text-center">
                          <span
                            className={cn(
                              'inline-flex px-2.5 py-1 rounded-full text-[11px] font-black uppercase tracking-wider',
                              auction.status === 'active'
                                ? 'bg-success/10 text-success'
                                : auction.status === 'ended'
                                  ? 'bg-zinc-500/10 text-zinc-400'
                                  : 'bg-warning/10 text-warning'
                            )}
                          >
                            {auction.status}
                          </span>
                        </td>
                      </tr>
                    ))
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

export default AuctionPerformancePage;
