import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { AmberCard as Card } from '@core/components/AmberCard';
import { AmberButton } from '@core/components/AmberButton';
import { AmberAvatar } from '@core/components/AmberAvatar';
import { cn } from '@core/lib/utils/cn';
import { formatCurrency } from '@core/lib/utils/formatCurrency';
import { StatValue } from '@core/components/Data/StatValue';
import { formatPhone } from '@core/lib/utils/formatPhone';
import { useLanguage } from '@core/contexts/LanguageContext';
import {
  Building2,
  Phone,
  MapPin,
  Edit3,
  History,
  CreditCard,
  ArrowLeft,
  Loader2,
  Calendar,
  Globe,
  Trophy,
  Target,
  TrendingUp,
  Gavel,
  Image as ImageIcon,
  Clock,
} from 'lucide-react';
import { useGetCustomer, useGetCustomerBids } from '../hooks';
import { StatusBadge } from '@core/components/Data/StatusBadge';
import { DetailPageSkeleton } from '@core/loading';
import { useRouteParam } from '@core/hooks/useRouteParam';
import { useIsClient } from '@core/hooks/useIsClient';

export function CustomerDetailPage() {
  const { t, dir } = useLanguage();
  const router = useRouter();
  const [customerId, paramReady] = useRouteParam('id', { parse: 'string', safe: true });
  const isRTL = dir === 'rtl';
  const isClient = useIsClient();

  const { data: customer, isPending, error } = useGetCustomer(customerId || '', paramReady && !!customerId);
  const { data: bidsData } = useGetCustomerBids(customerId || '');

  if (!isClient || !paramReady || !customerId || isPending) {
    return <DetailPageSkeleton />;
  }

  if (error || !customer) {
    return (
      <div className="p-12 text-center space-y-4">
        <p className="text-[var(--color-danger)] font-black uppercase tracking-widest">
          {t('customer.error_not_found') || 'IDENTITY NOT FOUND IN REGISTRY'}
        </p>
        <AmberButton variant="outline" onClick={() => router.push('/customers')}>
          {t('customer.back_to_list') || 'Return to Registry'}
        </AmberButton>
      </div>
    );
  }

  const summary = bidsData?.summary;
  const bids = bidsData?.data || [];

  const getBidStatusColor = (status: string) => {
    switch (status) {
      case 'winning':
        return 'text-emerald-400 bg-emerald-400/10';
      case 'outbid':
        return 'text-amber-400 bg-amber-400/10';
      case 'cancelled':
        return 'text-red-400 bg-red-400/10';
      default:
        return 'text-zinc-muted bg-zinc-muted/10';
    }
  };

  const getBidStatusLabel = (status: string) => {
    switch (status) {
      case 'winning':
        return t('customer.bid_status_winning') || 'فائز';
      case 'outbid':
        return t('customer.bid_status_outbid') || 'تم التفوق';
      case 'cancelled':
        return t('customer.bid_status_cancelled') || 'ملغي';
      case 'active':
        return t('customer.bid_status_active') || 'نشط';
      default:
        return status;
    }
  };

  const activityCards = [
    {
      label: t('customer.activity_total_bids') || 'إجمالي المزايدات',
      value: summary?.totalBids ?? customer.totalOrders ?? 0,
      icon: Gavel,
      color: 'text-blue-400',
      bgColor: 'bg-blue-400/10',
    },
    {
      label: t('customer.activity_auctions') || 'المزادات المشتركة',
      value: summary?.totalAuctions ?? 0,
      icon: Target,
      color: 'text-purple-400',
      bgColor: 'bg-purple-400/10',
    },
    {
      label: t('customer.activity_win_rate') || 'نسبة الفوز',
      value: `${summary?.winRate ?? 0}%`,
      icon: Trophy,
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-400/10',
    },
    {
      label: t('customer.activity_total_spent') || 'إجمالي الإنفاق',
      value: formatCurrency(summary?.totalSpent ?? customer.totalSpent ?? 0),
      icon: TrendingUp,
      color: 'text-[var(--color-brand)]',
      bgColor: 'bg-[var(--color-brand)]/10',
    },
  ];

  return (
    <div className="space-y-8 p-6 max-w-[1600px] mx-auto animate-in fade-in duration-700" dir={dir}>
      {/* Dynamic Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 text-start">
        <div className="flex items-start gap-6">
          <AmberButton
            variant="ghost"
            onClick={() => router.push('/customers')}
            className="group p-2.5 h-11 w-11 border-[var(--color-border)] rounded-xl hover:bg-[var(--color-obsidian-hover)]"
          >
            <ArrowLeft className={cn("w-5 h-5 transition-transform group-hover:-translate-x-1", isRTL && "rotate-180 group-hover:translate-x-1")} />
          </AmberButton>

          <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
            <AmberAvatar
              src={customer.avatar}
              fallback={customer.name}
              size="xl"
              className="shadow-2xl"
            />
            <div className="space-y-2 text-center md:text-start">
              <div className="flex items-center gap-3 justify-center md:justify-start">
                <h1 className="text-4xl font-black text-zinc-text tracking-tight leading-tight uppercase">
                  {customer.name}
                </h1>
                <StatusBadge
                  status={(customer.status || 'unknown').toUpperCase()}
                  variant={customer.status === 'active' ? 'success' : 'inactive'}
                  className="h-6 px-3"
                />
              </div>
              <p className="text-base text-zinc-secondary font-bold flex items-center gap-2 justify-center md:justify-start opacity-70">
                <Building2 className="w-4 h-4 text-[var(--color-brand)]" />
                {customer.company || t('customer.independent') || 'مشغل مستقل'}
              </p>
            </div>
          </div>
        </div>

        <AmberButton className="gap-2 px-8 h-11 bg-[var(--color-brand)] hover:bg-[var(--color-brand)] text-black font-bold rounded-xl shadow-sm transition-all border-none active:scale-95" onClick={() => router.push(`/customers/${customerId}/edit`)}>
          <Edit3 className="w-4 h-4" />
          <span>{t('customer.modify_identity') || 'Modify Identity'}</span>
        </AmberButton>
      </div>

      {/* Activity Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {activityCards.map((card) => (
          <Card
            key={card.label}
            className="p-5 bg-[var(--color-obsidian-card)] border border-[var(--color-border)] relative overflow-hidden group"
          >
            <div className="flex items-center gap-3">
              <div className={cn('p-2.5 rounded-xl', card.bgColor)}>
                <card.icon className={cn('w-4 h-4', card.color)} />
              </div>
              <div className="space-y-0.5 min-w-0">
                <span className="text-[10px] font-black text-zinc-muted uppercase tracking-[0.15em] block truncate">
                  {card.label}
                </span>
                <p className={cn('text-lg font-black tabular-nums leading-tight', card.color)}>
                  {card.value}
                </p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Recent Bids Table */}
          <Card className="bg-[var(--color-obsidian-card)] border border-[var(--color-border)] rounded-2xl overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-[var(--color-border)]">
              <div className="flex items-center gap-3">
                <History className="w-5 h-5 text-[var(--color-brand)]" />
                <h3 className="text-sm font-black text-zinc-text uppercase tracking-widest">
                  {t('customer.recent_bids') || 'المزايدات الأخيرة'}
                </h3>
              </div>
              {bidsData?.total > 20 && (
                <span className="text-xs text-zinc-muted font-bold">
                  {t('customer.showing_latest') || 'أحدث 20'} / {bidsData.total}
                </span>
              )}
            </div>

            {!bidsData ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="w-6 h-6 animate-spin text-[var(--color-brand)]" />
              </div>
            ) : bids.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <Gavel className="w-10 h-10 text-zinc-muted/30 mb-3" />
                <p className="text-sm text-zinc-muted font-bold">
                  {t('customer.no_bids_yet') || 'لا توجد مزايدات بعد'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[var(--color-border)]">
                      <th className="text-start px-6 py-3 text-[10px] font-black text-zinc-muted uppercase tracking-[0.15em]">
                        {t('customer.bid_auction') || 'المزاد'}
                      </th>
                      <th className="text-start px-6 py-3 text-[10px] font-black text-zinc-muted uppercase tracking-[0.15em]">
                        {t('customer.bid_amount') || 'المبلغ'}
                      </th>
                      <th className="text-start px-6 py-3 text-[10px] font-black text-zinc-muted uppercase tracking-[0.15em]">
                        {t('customer.bid_status') || 'الحالة'}
                      </th>
                      <th className="text-start px-6 py-3 text-[10px] font-black text-zinc-muted uppercase tracking-[0.15em]">
                        {t('customer.bid_date') || 'التاريخ'}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {bids.map((bid) => (
                      <tr
                        key={bid.id}
                        className="border-b border-[var(--color-border)] last:border-b-0 hover:bg-white/[0.02] transition-colors cursor-pointer"
                        onClick={() => router.push(`/auctions/${bid.auctionId}`)}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            {bid.auctionImage ? (
                              <div className="w-9 h-9 rounded-lg overflow-hidden flex-shrink-0 bg-white/5">
                                <img
                                  src={bid.auctionImage}
                                  alt=""
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            ) : (
                              <div className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0">
                                <ImageIcon className="w-4 h-4 text-zinc-muted" />
                              </div>
                            )}
                            <div className="min-w-0">
                              <p className="text-sm font-bold text-zinc-text truncate max-w-[200px]">
                                {bid.auctionTitle || `Auction #${bid.auctionId}`}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm font-black text-[var(--color-brand)] tabular-nums">
                            {formatCurrency(bid.amount)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={cn(
                              'inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-black uppercase tracking-wider',
                              getBidStatusColor(bid.status),
                            )}
                          >
                            {getBidStatusLabel(bid.status)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1.5 text-zinc-muted">
                            <Clock className="w-3.5 h-3.5" />
                            <span className="text-xs font-bold tabular-nums">
                              {bid.createdAt
                                ? new Date(bid.createdAt).toLocaleDateString(isRTL ? 'ar-IQ' : 'en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric',
                                  })
                                : '--'}
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>

          {/* Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {customer.phone && (
              <Card className="p-6 bg-[var(--color-obsidian-card)] border border-[var(--color-border)] relative overflow-hidden group">
                <div className="flex items-center gap-4 relative z-10">
                  <div className="p-3 rounded-xl bg-[var(--color-info)]/10 text-[var(--color-info)]">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] font-black text-zinc-muted uppercase tracking-[0.2em]">{t('customer.phone') || 'رقم الهاتف'}</span>
                    <p dir="ltr" className="text-sm font-bold text-zinc-text text-end">{formatPhone(customer.phone)}</p>
                  </div>
                </div>
              </Card>
            )}

            <Card className="p-6 bg-[var(--color-obsidian-card)] border border-[var(--color-border)] relative overflow-hidden group">
              <div className="flex items-center gap-4 relative z-10">
                <div className="p-3 rounded-xl bg-[var(--color-warning)]/10 text-[var(--color-warning)]">
                  <Calendar className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-black text-zinc-muted uppercase tracking-[0.2em]">{t('customer.registered') || 'Node Initialization'}</span>
                  <p className="text-sm font-bold text-zinc-text">
                    {(customer.createdAt || customer.joinDate) ? new Date(customer.createdAt || customer.joinDate).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-[var(--color-obsidian-card)] border border-[var(--color-border)] relative overflow-hidden group">
              <div className="flex items-center gap-4 relative z-10">
                <div className="p-3 rounded-xl bg-purple-500/10 text-purple-400">
                  <Globe className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-black text-zinc-muted uppercase tracking-[0.2em]">{t('customer.timezone') || 'Temporal Zone'}</span>
                  <p className="text-sm font-bold text-zinc-text">GMT +3 (Iraq)</p>
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-[var(--color-obsidian-card)] border border-[var(--color-border)] relative overflow-hidden group">
              <div className="flex items-center gap-4 relative z-10">
                <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400">
                  <Trophy className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-black text-zinc-muted uppercase tracking-[0.2em]">{t('customer.activity_win_rate') || 'نسبة الفوز'}</span>
                  <p className="text-sm font-bold text-zinc-text">{summary?.winRate ?? 0}%</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Address */}
          {customer.address && (customer.address.street || customer.address.city || customer.address.country) && (
            <Card className="p-8 bg-[var(--color-obsidian-card)] border border-[var(--color-border)] rounded-2xl relative overflow-hidden">
              <div className="flex items-center gap-3 mb-8 border-b border-[var(--color-border)] pb-6">
                <MapPin className="w-5 h-5 text-[var(--color-brand)]" />
                <h3 className="text-sm font-black text-zinc-text uppercase tracking-widest">{t('customer.spatial_matrix') || 'العنوان'}</h3>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
                <div className="space-y-1">
                  <span className="text-[10px] font-black text-zinc-muted uppercase tracking-widest">{t('customer.street') || 'الشارع'}</span>
                  <p className="text-sm font-bold text-zinc-text line-clamp-1">{customer.address?.street || '-'}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-black text-zinc-muted uppercase tracking-widest">{t('customer.city') || 'المدينة'}</span>
                  <p className="text-sm font-bold text-zinc-text">{customer.address?.city || '-'}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-black text-zinc-muted uppercase tracking-widest">{t('customer.country') || 'الدولة'}</span>
                  <p className="text-sm font-bold text-zinc-text">{customer.address?.country || '-'}</p>
                </div>
              </div>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-8">
          {/* Market Intelligence */}
          <Card className="p-8 bg-obsidian-outer border border-[var(--color-border)] rounded-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--color-brand)]/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-[var(--color-brand)]/10 transition-colors" />
            <div className="flex items-center gap-3 mb-8 pb-4 border-b border-white/5">
              <CreditCard className="w-5 h-5 text-[var(--color-brand)]" />
              <h3 className="text-sm font-black text-zinc-text uppercase tracking-widest">{t('customer.market_intelligence') || 'Market Intelligence'}</h3>
            </div>

            <div className="space-y-6">
              <div className="flex justify-between items-end">
                <span className="text-xs font-bold text-zinc-muted uppercase">{t('customer.bids_count') || 'عدد المزايدات'}</span>
                <StatValue value={summary?.totalBids ?? customer.totalOrders ?? 0} className="!text-2xl" />
              </div>
              <div className="flex justify-between items-end">
                <span className="text-xs font-bold text-zinc-muted uppercase">{t('customer.activity_auctions') || 'المزادات'}</span>
                <StatValue value={summary?.totalAuctions ?? 0} className="!text-2xl !text-purple-400" />
              </div>
              <div className="flex justify-between items-end">
                <span className="text-xs font-bold text-zinc-muted uppercase">{t('customer.activity_winning_bids') || 'مزايدات فائزة'}</span>
                <StatValue value={summary?.winningBids ?? 0} className="!text-2xl !text-emerald-400" />
              </div>
              <div className="flex justify-between items-end">
                <span className="text-xs font-bold text-zinc-muted uppercase">{t('customer.total_spent') || 'إجمالي الإنفاق'}</span>
                <StatValue value={formatCurrency(summary?.totalSpent ?? customer.totalSpent ?? 0)} className="!text-2xl !text-[var(--color-brand)]" />
              </div>
            </div>
          </Card>

          {/* Quick Actions */}
          <Card className="p-8 bg-[var(--color-obsidian-card)] border border-[var(--color-border)] rounded-2xl space-y-4">
            <h3 className="text-sm font-black text-zinc-text uppercase tracking-widest mb-2">{t('customer.actions') || 'إجراءات'}</h3>
            <AmberButton variant="outline" className="w-full justify-start gap-4 h-12 border-white/5 hover:bg-white/5 rounded-xl font-bold text-zinc-text">
              <History className="w-4 h-4 text-zinc-muted" />
              {t('customer.view_audit_logs') || 'عرض سجل النشاط'}
            </AmberButton>
            <AmberButton variant="outline" className="w-full justify-start gap-4 h-12 border-white/5 hover:bg-white/5 rounded-xl font-bold text-zinc-text">
              <CreditCard className="w-4 h-4 text-zinc-muted" />
              {t('customer.transaction_snapshot') || 'لقطة المعاملات'}
            </AmberButton>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default CustomerDetailPage;
