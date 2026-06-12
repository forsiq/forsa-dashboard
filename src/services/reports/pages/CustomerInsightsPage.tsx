import React, { useState, useEffect } from 'react';
import { Users, MapPin, Repeat, Crown } from 'lucide-react';
import { useLanguage } from '@core/contexts/LanguageContext';
import { formatCurrency } from '@core/lib/utils/formatCurrency';
import { useGetSalesReport } from '../hooks';
import { ReportStatsCard } from '../components/ReportStatsCard';
import { ReportPanelCard } from '../components/ReportPanelCard';
import {
  formatReportMetric,
  reportHeaderSubtitleClass,
  reportHeaderTitleClass,
  reportKpiGridClass,
  reportPageClass,
} from '../utils/reportLayout';

export function CustomerInsightsPage() {
  const { t, dir } = useLanguage();
  const isRTL = dir === 'rtl';
  const { data, isLoading } = useGetSalesReport();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const topCustomers = data?.topCustomers || [];
  const retentionRate = topCustomers.length > 0
    ? Math.round(
        (topCustomers.filter((c: any) => (c.orders ?? 0) > 1).length / Math.max(topCustomers.length, 1)) * 100
      )
    : 0;
  const concentration = topCustomers.length > 0
    ? new Set(topCustomers.map((c: any) => c.city).filter(Boolean)).size
    : 0;

  if (!isClient) return null;

  return (
    <div className={reportPageClass} dir={dir}>
      <div className="space-y-1 min-w-0 text-start">
        <h1 className={reportHeaderTitleClass}>
          {t('report.customer_insights')}
        </h1>
        <p className={reportHeaderSubtitleClass}>
          {t('report.customer_insights_subtitle')}
        </p>
      </div>

      <div className={reportKpiGridClass}>
        <ReportStatsCard
          label={t('report.top_buyers')}
          value={formatReportMetric(topCustomers.length, 'number')}
          icon={Crown}
          color="text-brand"
          isRTL={isRTL}
        />
        <ReportStatsCard
          label={t('report.retention_rate')}
          value={formatReportMetric(retentionRate, 'percent')}
          icon={Repeat}
          color="text-success"
          isRTL={isRTL}
        />
        <ReportStatsCard
          label={t('report.delivery_hotspots')}
          value={formatReportMetric(concentration, 'number')}
          icon={MapPin}
          color="text-info"
          isRTL={isRTL}
        />
        <ReportStatsCard
          label={t('report.customer_base')}
          value={topCustomers.length > 0 ? formatReportMetric(topCustomers.length, 'number') : '—'}
          icon={Users}
          color="text-warning"
          isRTL={isRTL}
        />
      </div>

      <ReportPanelCard title={t('report.top_buyers')}>
        {isLoading ? (
          <div className="h-24 bg-obsidian-card rounded-xl animate-pulse" />
        ) : topCustomers.length === 0 ? (
          <p className="text-sm text-zinc-muted font-semibold text-center py-6">{t('report.no_data')}</p>
        ) : (
          <div className="space-y-3">
            {topCustomers.map((customer, index) => (
              <div key={`${customer.email}-${index}`} className="flex items-center justify-between gap-3 p-3 rounded-lg bg-obsidian-panel/40 border border-border min-w-0">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-black text-zinc-text truncate">{customer.name}</p>
                  <p className="text-xs text-zinc-muted truncate">{customer.email}</p>
                </div>
                <p className="text-sm font-black text-brand tabular-nums shrink-0 whitespace-nowrap">
                  {formatCurrency(customer.spent)}
                </p>
              </div>
            ))}
          </div>
        )}
      </ReportPanelCard>
    </div>
  );
}

export default CustomerInsightsPage;
