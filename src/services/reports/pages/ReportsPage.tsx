import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { BarChart3, ShoppingCart, DollarSign, Users, FileText } from 'lucide-react';
import { useLanguage } from '@core/contexts/LanguageContext';
import { cn } from '@core/lib/utils/cn';
import { AmberCard } from '@core/components/AmberCard';
import { useGetReports } from '../hooks';
import { ReportStatsCard } from '../components/ReportStatsCard';
import {
  formatReportMetric,
  reportPageClass,
  reportKpiGridClass,
  reportHeaderTitleClass,
  reportHeaderSubtitleClass,
  type MetricFormat,
} from '../utils/reportLayout';

/**
 * ReportsPage - Reports dashboard
 *
 * URL: /reports
 */
export function ReportsPage() {
  const { t, dir } = useLanguage();
  const isRTL = dir === 'rtl';
  const { data: report } = useGetReports();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const reportCards: {
    title: string;
    value: number;
    change: number;
    icon: typeof DollarSign;
    color: 'success' | 'primary' | 'warning' | 'info';
    format: MetricFormat;
  }[] = [
    {
      title: t('report.total_sales') || 'إجمالي المبيعات',
      value: report?.totalSales || 0,
      change: report?.growth || 0,
      icon: DollarSign,
      color: 'success',
      format: 'currency',
    },
    {
      title: t('report.total_orders') || 'إجمالي الطلبات',
      value: report?.totalOrders || 0,
      change: 0,
      icon: ShoppingCart,
      color: 'primary',
      format: 'number',
    },
    {
      title: t('report.avg_order') || 'متوسط قيمة الطلب',
      value: report?.averageOrderValue || 0,
      change: 0,
      icon: BarChart3,
      color: 'warning',
      format: 'currency',
    },
    {
      title: t('report.customers') || 'العملاء',
      value: report?.totalCustomers || 0,
      change: 0,
      icon: Users,
      color: 'info',
      format: 'number',
    },
  ];

  const reportLinks = [
    {
      href: '/reports/sales-overview',
      title: t('report.sales_overview_section'),
      description: t('report.sales_overview_desc'),
      icon: BarChart3,
      hoverBorder: 'hover:border-[var(--color-brand)]/50',
      iconWrap: 'bg-[var(--color-brand)]/10 text-[var(--color-brand)]',
    },
    {
      href: '/reports/auction-performance',
      title: t('report.auction_performance'),
      description: t('report.auction_performance_desc'),
      icon: FileText,
      hoverBorder: 'hover:border-[var(--color-success)]/50',
      iconWrap: 'bg-[var(--color-success)]/10 text-[var(--color-success)]',
    },
    {
      href: '/reports/group-buying-analytics',
      title: t('report.group_buying_analytics'),
      description: t('report.group_buying_analytics_desc'),
      icon: ShoppingCart,
      hoverBorder: 'hover:border-[var(--color-info)]/50',
      iconWrap: 'bg-[var(--color-info)]/10 text-[var(--color-info)]',
    },
    {
      href: '/reports/customer-insights',
      title: t('report.customer_insights'),
      description: t('report.customer_insights_subtitle'),
      icon: Users,
      hoverBorder: 'hover:border-[var(--color-warning)]/50',
      iconWrap: 'bg-[var(--color-warning)]/10 text-[var(--color-warning)]',
    },
  ];

  if (!isClient) return null;

  return (
    <div className={reportPageClass} dir={dir}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 md:gap-6 min-w-0">
        <div className="space-y-1 min-w-0">
          <h1 className={reportHeaderTitleClass}>
            {t('report.title') || 'التقارير'}
          </h1>
          <p className={reportHeaderSubtitleClass}>
            {t('report.subtitle') || 'استعرض أداء أعمالك ومؤشراتك'}
          </p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className={reportKpiGridClass}>
        {reportCards.map((card) => (
          <ReportStatsCard
            key={card.title}
            label={card.title}
            value={formatReportMetric(card.value, card.format)}
            change={card.change !== 0 ? `${card.change >= 0 ? '+' : ''}${card.change}%` : undefined}
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
      <div className={reportKpiGridClass}>
        {reportLinks.map((item) => {
          const Icon = item.icon;
          return (
            <Link key={item.href} href={item.href} className="group min-w-0">
              <AmberCard className={cn(
                '!p-5 md:!p-6 h-full bg-[var(--color-obsidian-card)] border border-[var(--color-border)] transition-all min-w-0',
                item.hoverBorder,
              )}>
                <div className="flex items-start gap-4 min-w-0">
                  <div className={cn(
                    'p-3 shrink-0 rounded-xl group-hover:scale-110 transition-transform',
                    item.iconWrap,
                  )}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="min-w-0 flex-1 text-start space-y-1">
                    <h3 className="text-sm font-black text-zinc-text leading-snug break-words">
                      {item.title}
                    </h3>
                    <p className="text-[13px] text-zinc-muted font-medium leading-relaxed line-clamp-2">
                      {item.description}
                    </p>
                  </div>
                </div>
              </AmberCard>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export default ReportsPage;
