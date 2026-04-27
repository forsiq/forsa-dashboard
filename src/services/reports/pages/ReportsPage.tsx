import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { BarChart3, ShoppingCart, DollarSign, Users, FileText } from 'lucide-react';
import { useLanguage } from '@core/contexts/LanguageContext';
import { cn } from '@core/lib/utils/cn';
import { AmberCard } from '@core/components/AmberCard';
import { useGetReports } from '../hooks';
import { ReportStatsCard } from '../components/ReportStatsCard';
import { formatCurrency } from '@core/lib/utils/formatCurrency';

/**
 * ReportsPage - Reports dashboard
 *
 * URL: /reports
 */
export function ReportsPage() {
  const { t, dir } = useLanguage();
  const isRTL = dir === 'rtl';
  const { data: report, isLoading } = useGetReports();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const reportCards = [
    {
      title: t('report.total_sales') || 'إجمالي المبيعات',
      value: report?.totalSales || 0,
      change: report?.growth || 0,
      icon: DollarSign,
      color: 'success',
    },
    {
      title: t('report.total_orders') || 'إجمالي الطلبات',
      value: report?.totalOrders || 0,
      change: 0,
      icon: ShoppingCart,
      color: 'primary',
    },
    {
      title: t('report.avg_order') || 'متوسط قيمة الطلب',
      value: report?.averageOrderValue || 0,
      change: 0,
      icon: BarChart3,
      color: 'warning',
    },
    {
      title: t('report.customers') || 'العملاء',
      value: report?.totalCustomers || 0,
      change: 0, // Should be from backend
      icon: Users,
      color: 'info',
    },
  ];

  if (!isClient) return null;

  return (
    <div className="space-y-8 p-6 max-w-[1600px] mx-auto animate-in fade-in duration-700" dir={dir}>
      {/* Header */}
      <div className={cn(
        "flex flex-col sm:flex-row sm:items-start justify-between gap-6",
        isRTL ? "text-right" : "text-left"
      )}>
        <div className="space-y-1">
          <h1 className="text-4xl font-black text-zinc-text tracking-tight leading-none">
            {t('report.title') || 'التقارير'}
          </h1>
          <p className="text-base text-zinc-secondary font-bold">
            {t('report.subtitle') || 'استعرض أداء أعمالك ومؤشراتك'}
          </p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {reportCards.map((card) => (
          <ReportStatsCard
            key={card.title}
            label={card.title}
            value={typeof card.value === 'number'
              ? formatCurrency(card.value)
              : card.value}
            change={`${card.change >= 0 ? '+' : ''}${card.change}%`}
            icon={card.icon}
            color={
              card.color === 'success' ? 'text-success' :
              card.color === 'primary' ? 'text-brand' :
              card.color === 'warning' ? 'text-warning' :
              'text-info'
            }
            isRTL={isRTL}
          />
        ))}
      </div>

      {/* Report Navigation Links */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <Link href="/reports/sales-overview" className="group">
          <AmberCard className="!p-6 bg-[var(--color-obsidian-card)] border border-[var(--color-border)] hover:border-[var(--color-brand)]/50 transition-all">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-[var(--color-brand)]/10 rounded-xl text-[var(--color-brand)] group-hover:scale-110 transition-transform">
                <BarChart3 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-black text-zinc-text">{t('report.sales_overview_section')}</h3>
                <p className="text-xs text-zinc-muted font-medium mt-0.5">{t('report.sales_overview_desc')}</p>
              </div>
            </div>
          </AmberCard>
        </Link>

        <Link href="/reports/auction-performance" className="group">
          <AmberCard className="!p-6 bg-[var(--color-obsidian-card)] border border-[var(--color-border)] hover:border-[var(--color-success)]/50 transition-all">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-[var(--color-success)]/10 rounded-xl text-[var(--color-success)] group-hover:scale-110 transition-transform">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-black text-zinc-text">{t('report.auction_performance')}</h3>
                <p className="text-xs text-zinc-muted font-medium mt-0.5">{t('report.auction_performance_desc')}</p>
              </div>
            </div>
          </AmberCard>
        </Link>

        <Link href="/reports/group-buying-analytics" className="group">
          <AmberCard className="!p-6 bg-[var(--color-obsidian-card)] border border-[var(--color-border)] hover:border-[var(--color-info)]/50 transition-all">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-[var(--color-info)]/10 rounded-xl text-[var(--color-info)] group-hover:scale-110 transition-transform">
                <ShoppingCart className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-black text-zinc-text">{t('report.group_buying_analytics')}</h3>
                <p className="text-xs text-zinc-muted font-medium mt-0.5">{t('report.group_buying_analytics_desc')}</p>
              </div>
            </div>
          </AmberCard>
        </Link>

        <Link href="/reports/customer-insights" className="group">
          <AmberCard className="!p-6 bg-[var(--color-obsidian-card)] border border-[var(--color-border)] hover:border-[var(--color-warning)]/50 transition-all">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-[var(--color-warning)]/10 rounded-xl text-[var(--color-warning)] group-hover:scale-110 transition-transform">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-black text-zinc-text">{t('report.customer_insights')}</h3>
                <p className="text-xs text-zinc-muted font-medium mt-0.5">{t('report.customer_insights_subtitle')}</p>
              </div>
            </div>
          </AmberCard>
        </Link>
      </div>
    </div>
  );
}

export default ReportsPage;
