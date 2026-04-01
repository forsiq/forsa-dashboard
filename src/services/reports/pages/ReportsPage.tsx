import { Link } from 'react-router-dom';
import { TrendingUp, TrendingDown, BarChart3, ShoppingCart, DollarSign, Users, FileText } from 'lucide-react';
import { useLanguage } from '../../../core/contexts/LanguageContext';
import { cn } from '../../../core/lib/utils/cn';
import { AmberCard } from '../../../core/components/AmberCard';
import { useGetReports } from '../hooks';

/**
 * ReportsPage - Reports dashboard
 *
 * URL: /reports
 */
export function ReportsPage() {
  const { t, dir } = useLanguage();
  const isRTL = dir === 'rtl';
  const { data: report, isLoading } = useGetReports();

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
      change: 8.2,
      icon: ShoppingCart,
      color: 'primary',
    },
    {
      title: t('report.avg_order') || 'متوسط قيمة الطلب',
      value: report?.averageOrderValue || 0,
      change: -2.4,
      icon: BarChart3,
      color: 'warning',
    },
    {
      title: t('report.customers') || 'العملاء',
      value: 2840,
      change: 15.3,
      icon: Users,
      color: 'info',
    },
  ];

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
          <AmberCard key={card.title} className="!p-5 bg-[var(--color-obsidian-card)] border border-[var(--color-border)] shadow-sm hover:border-[var(--color-brand)]/30 transition-all cursor-default group overflow-hidden relative">
            <div className="flex items-center justify-between gap-4">
              <div className="flex flex-col flex-1">
                <span className="text-xs font-bold text-zinc-muted uppercase tracking-wider mb-1">
                  {card.title}
                </span>
                <span className="text-3xl font-black text-zinc-text tracking-tight tabular-nums leading-none">
                  {typeof card.value === 'number' && card.value > 1000
                    ? `$${(card.value / 1000).toFixed(1)}k`
                    : card.value}
                </span>
                <div className={cn(
                  'flex items-center gap-1 text-[11px] font-bold mt-2',
                  card.change >= 0 ? 'text-[var(--color-success)]' : 'text-[var(--color-danger)]'
                )}>
                  {card.change >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  <span>{Math.abs(card.change)}%</span>
                  <span className="text-zinc-muted">{t('report.vs_last_month') || 'vs last month'}</span>
                </div>
              </div>
              <div className={cn('p-3 rounded-xl shadow-sm', {
                'bg-[var(--color-success)]/10 text-[var(--color-success)]': card.color === 'success',
                'bg-[var(--color-brand)]/10 text-[var(--color-brand)]': card.color === 'primary',
                'bg-[var(--color-warning)]/10 text-[var(--color-warning)]': card.color === 'warning',
                'bg-[var(--color-info)]/10 text-[var(--color-info)]': card.color === 'info',
              })}>
                <card.icon className="w-6 h-6 stroke-[2.5]" />
              </div>
            </div>
          </AmberCard>
        ))}
      </div>

      {/* Report Navigation Links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link to="/reports/analytics" className="group">
          <AmberCard className="!p-6 bg-[var(--color-obsidian-card)] border border-[var(--color-border)] hover:border-[var(--color-brand)]/50 transition-all">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-[var(--color-brand)]/10 rounded-xl text-[var(--color-brand)] group-hover:scale-110 transition-transform">
                <BarChart3 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-black text-zinc-text">{t('report.analytics') || 'التحليلات'}</h3>
                <p className="text-xs text-zinc-muted font-medium mt-0.5">{t('report.analytics_desc') || 'عرض التحليلات التفصيلية'}</p>
              </div>
            </div>
          </AmberCard>
        </Link>

        <Link to="/reports/sales" className="group">
          <AmberCard className="!p-6 bg-[var(--color-obsidian-card)] border border-[var(--color-border)] hover:border-[var(--color-success)]/50 transition-all">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-[var(--color-success)]/10 rounded-xl text-[var(--color-success)] group-hover:scale-110 transition-transform">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-black text-zinc-text">{t('report.sales_report') || 'تقرير المبيعات'}</h3>
                <p className="text-xs text-zinc-muted font-medium mt-0.5">{t('report.sales_desc') || 'تحميل تقارير المبيعات'}</p>
              </div>
            </div>
          </AmberCard>
        </Link>

        <Link to="/reports/customers" className="group">
          <AmberCard className="!p-6 bg-[var(--color-obsidian-card)] border border-[var(--color-border)] hover:border-[var(--color-warning)]/50 transition-all">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-[var(--color-warning)]/10 rounded-xl text-[var(--color-warning)] group-hover:scale-110 transition-transform">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-black text-zinc-text">{t('report.customer_report') || 'تقرير العملاء'}</h3>
                <p className="text-xs text-zinc-muted font-medium mt-0.5">{t('report.customer_desc') || 'تحليل بيانات العملاء'}</p>
              </div>
            </div>
          </AmberCard>
        </Link>
      </div>
    </div>
  );
}

export default ReportsPage;
