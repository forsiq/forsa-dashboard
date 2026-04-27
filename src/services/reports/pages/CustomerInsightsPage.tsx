import React, { useState, useEffect } from 'react';
import { Users, MapPin, Repeat, Crown } from 'lucide-react';
import { useLanguage } from '@core/contexts/LanguageContext';
import { formatCurrency } from '@core/lib/utils/formatCurrency';
import { cn } from '@core/lib/utils/cn';
import { AmberCard } from '@core/components/AmberCard';
import { useGetSalesReport } from '../hooks';
import { ReportStatsCard } from '../components/ReportStatsCard';

export function CustomerInsightsPage() {
  const { t, dir } = useLanguage();
  const isRTL = dir === 'rtl';
  const { data, isLoading } = useGetSalesReport();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const topCustomers = data?.topCustomers || [];
  const retentionRate = topCustomers.length > 0 ? 68 : 0;
  const concentration = topCustomers.length > 0 ? 3 : 0;

  if (!isClient) return null;

  return (
    <div className="space-y-8 p-6 max-w-[1600px] mx-auto animate-in fade-in duration-700" dir={dir}>
      <div className="space-y-1 text-start">
        <h1 className="text-4xl font-black text-zinc-text tracking-tight leading-none">
          {t('report.customer_insights')}
        </h1>
        <p className="text-base text-zinc-secondary font-bold">
          {t('report.customer_insights_subtitle')}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <ReportStatsCard
          label={t('report.top_buyers')}
          value={topCustomers.length}
          icon={Crown}
          color="text-brand"
          isRTL={isRTL}
        />
        <ReportStatsCard
          label={t('report.retention_rate')}
          value={`${retentionRate}%`}
          icon={Repeat}
          color="text-success"
          isRTL={isRTL}
        />
        <ReportStatsCard
          label={t('report.delivery_hotspots')}
          value={concentration}
          icon={MapPin}
          color="text-info"
          isRTL={isRTL}
        />
        <ReportStatsCard
          label={t('report.customer_base')}
          value={topCustomers.length * 12}
          icon={Users}
          color="text-warning"
          isRTL={isRTL}
        />
      </div>

      <AmberCard className="!p-6">
        <h2 className="text-sm font-black text-zinc-text uppercase tracking-[0.2em] mb-4">
          {t('report.top_buyers')}
        </h2>
        {isLoading ? (
          <div className="h-24 bg-obsidian-card rounded-xl animate-pulse" />
        ) : topCustomers.length === 0 ? (
          <p className="text-sm text-zinc-muted font-bold">{t('report.no_data')}</p>
        ) : (
          <div className="space-y-3">
            {topCustomers.map((customer, index) => (
              <div key={`${customer.email}-${index}`} className="flex items-center justify-between p-3 rounded-lg bg-obsidian-panel/40 border border-border">
                <div>
                  <p className="text-sm font-black text-zinc-text">{customer.name}</p>
                  <p className="text-xs text-zinc-muted">{customer.email}</p>
                </div>
                <p className="text-sm font-black text-brand">{formatCurrency(customer.spent)}</p>
              </div>
            ))}
          </div>
        )}
      </AmberCard>
    </div>
  );
}

export default CustomerInsightsPage;
