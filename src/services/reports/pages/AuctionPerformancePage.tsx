import React, { useId } from 'react';
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
import { ReportChartFrame } from '../components/ReportChartFrame';
import { hasChartValues } from '../utils/chartData';
import {
  chartMargin,
  formatReportMetric,
  getChartGridStroke,
  getChartTooltipStyle,
  getCategoryXAxisProps,
  getValueYAxisProps,
  reportChartGridClass,
  reportHeaderSubtitleClass,
  reportHeaderTitleClass,
  reportKpiGridClass,
  reportPageClass,
} from '../utils/reportLayout';
import { useGetAuctions, useGetAuctionStats } from '../../../features/auctions/api/auction-hooks';
import type { Auction } from '../../../features/auctions/types/auction.types';

/**
 * AuctionPerformancePage - Dedicated auction analytics
 */
export function AuctionPerformancePage() {
  const { t, dir } = useLanguage();
  const isRTL = dir === 'rtl';
  const bidsGradientId = useId().replace(/:/g, '');

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
  const participationRate = totalAuctions > 0 ? Math.round((totalBids / totalAuctions) * 10) / 10 : 0;

  const kpis = [
    {
      label: t('report.active_auctions') || 'Active Auctions',
      value: formatReportMetric(activeAuctions, 'number'),
      icon: Gavel,
      color: 'text-brand',
    },
    {
      label: t('report.completed_auctions') || 'Completed Auctions',
      value: formatReportMetric(completedAuctions, 'number'),
      icon: CheckCircle,
      color: 'text-success',
    },
    {
      label: t('report.avg_final_price') || 'Avg Final Price',
      value: formatReportMetric(avgFinalPrice, 'currency'),
      icon: DollarSign,
      color: 'text-warning',
    },
    {
      label: t('report.participation_rate') || 'Participation Rate',
      value: totalAuctions > 0
        ? `${formatReportMetric(participationRate, 'number')} ${t('report.bids_per_auction') || 'bids/auction'}`
        : '—',
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
      name: new Date(a.createdAt).toLocaleDateString(dir === 'rtl' ? 'ar-IQ' : 'en-US', {
        month: 'short',
        day: 'numeric',
      }),
      bids: a.totalBids || 0,
    }));

  const topAuctions = [...auctions]
    .sort((a: Auction, b: Auction) => (b.totalBids || 0) - (a.totalBids || 0))
    .slice(0, 10);

  const hasStatusChartData = statusData.length > 0;
  const hasBidActivityData = hasChartValues(bidActivityData, ['bids']);

  return (
    <div className={reportPageClass} dir={dir}>
      <div className="space-y-1 min-w-0 text-start">
        <h1 className={reportHeaderTitleClass}>
          {t('report.auction_performance') || 'Auction Performance'}
        </h1>
        <p className={reportHeaderSubtitleClass}>
          {t('report.auction_performance_desc') || 'Detailed analytics for auction activity and results'}
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
              title={t('report.auctions_by_status') || 'Auctions by Status'}
              isEmpty={!hasStatusChartData}
              bodyMinHeight="min-h-[320px]"
            >
              <ReportChartFrame heightClass="h-[320px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={statusData} margin={chartMargin} barCategoryGap="25%">
                    <CartesianGrid strokeDasharray="3 3" stroke={getChartGridStroke()} vertical={false} />
                    <XAxis dataKey="name" {...getCategoryXAxisProps(isRTL)} />
                    <YAxis {...getValueYAxisProps()} allowDecimals={false} />
                    <Tooltip contentStyle={getChartTooltipStyle()} />
                    <Bar dataKey="value" fill="var(--chart-2, #3B82F6)" radius={[4, 4, 0, 0]} maxBarSize={48} />
                  </BarChart>
                </ResponsiveContainer>
              </ReportChartFrame>
            </ReportPanelCard>

            <ReportPanelCard
              title={t('report.bid_activity') || 'Bid Activity Over Time'}
              isEmpty={!hasBidActivityData}
              bodyMinHeight="min-h-[320px]"
            >
              <ReportChartFrame heightClass="h-[320px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={bidActivityData} margin={chartMargin}>
                    <defs>
                      <linearGradient id={bidsGradientId} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--chart-3, #10B981)" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="var(--chart-3, #10B981)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke={getChartGridStroke()} vertical={false} />
                    <XAxis dataKey="name" {...getCategoryXAxisProps(isRTL)} />
                    <YAxis {...getValueYAxisProps()} allowDecimals={false} />
                    <Tooltip contentStyle={getChartTooltipStyle()} />
                    <Area
                      type="monotone"
                      dataKey="bids"
                      stroke="var(--chart-3, #10B981)"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill={`url(#${bidsGradientId})`}
                      name={t('report.bid_count') || 'Bids'}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </ReportChartFrame>
            </ReportPanelCard>
          </div>

          <ReportPanelCard title={t('report.top_auctions') || 'Top Performing Auctions'}>
            <div className="overflow-x-auto min-w-0">
              <table className="w-full min-w-[640px] text-start border-collapse">
                <thead>
                  <tr className="border-b border-[var(--color-border)]">
                    <th className="pb-3 pe-4 text-[11px] font-black text-zinc-muted uppercase tracking-widest text-start">
                      {t('auction.table.identification') || 'Auction'}
                    </th>
                    <th className="pb-3 px-4 text-[11px] font-black text-zinc-muted uppercase tracking-widest text-center whitespace-nowrap">
                      {t('report.final_price') || 'Final Price'}
                    </th>
                    <th className="pb-3 px-4 text-[11px] font-black text-zinc-muted uppercase tracking-widest text-center whitespace-nowrap">
                      {t('report.bid_count') || 'Bids'}
                    </th>
                    <th className="pb-3 ps-4 text-[11px] font-black text-zinc-muted uppercase tracking-widest text-center whitespace-nowrap">
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
                        <td className="py-3 pe-4 max-w-[240px]">
                          <span className="text-sm font-bold text-zinc-text break-words line-clamp-2">
                            {auction.title}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className="text-sm font-black text-brand tabular-nums whitespace-nowrap">
                            {formatCurrency(auction.currentBid || auction.startPrice)}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className="text-sm font-bold text-zinc-text tabular-nums">
                            {auction.totalBids || 0}
                          </span>
                        </td>
                        <td className="py-3 ps-4 text-center">
                          <span
                            className={cn(
                              'inline-flex px-2.5 py-1 rounded-full text-[11px] font-black uppercase tracking-wider whitespace-nowrap',
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
