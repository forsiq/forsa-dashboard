import React, { useState, useMemo } from 'react';
import { useSettlements, useUpdatePaymentStatus, useNudgeWinner, useOfferToUnderbidder } from '../../auctions/api/auction-hooks';
import { useConfirmModal } from '@core/components/Feedback/AmberConfirmModal';
import { useLanguage } from '@core/contexts/LanguageContext';
import { PageHeader } from '@core/components/Layout/PageHeader';
import { StatsGrid } from '@core/components/Layout/StatsGrid';
import { StatusBadge } from '@core/components/Data/StatusBadge';
import { DataTable, Column, Action } from '@core/components/Data/DataTable';
import { AmberTableSkeleton } from '@core/components/Loading/AmberTableSkeleton';
import { cn } from '@core/lib/utils/cn';
import { AuctionImage } from '../../auctions/components/AuctionImage';
import { DollarSign, Clock, AlertTriangle, Bell, UserCheck, XCircle, Receipt } from 'lucide-react';
import type { SettlementItem } from '../../auctions/api/auction-api';

function maskId(id: string | null): string {
  if (!id) return '-';
  return id.substring(0, 8) + '...';
}

function paymentStatusVariant(status: string): 'warning' | 'pending' | 'success' | 'failed' | 'inactive' {
  switch (status) {
    case 'paid': return 'success';
    case 'unpaid': return 'warning';
    case 'pending': return 'pending';
    case 'failed': return 'failed';
    case 'refunded': return 'inactive';
    default: return 'inactive';
  }
}

function paymentStatusLabel(status: string, t: (key: string) => string): string {
  const map: Record<string, string> = {
    unpaid: t('settlement.unpaid'),
    pending: t('settlement.pending'),
    paid: t('settlement.paid'),
    failed: t('settlement.failed'),
    refunded: t('settlement.refunded'),
  };
  return map[status] || status;
}

function timeSince(dateStr: string, t: (key: string) => string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const hours = Math.floor(diff / 3600000);
  if (hours < 1) return `${Math.floor(diff / 60000)}${t('settlement.time_m')}`;
  if (hours < 24) return `${hours}${t('settlement.time_h')}`;
  return `${Math.floor(hours / 24)}${t('settlement.time_d')}`;
}

export const SettlementDeskPage = () => {
  const { t, dir } = useLanguage();
  const isRTL = dir === 'rtl';
  const [activeTab, setActiveTab] = useState('');
  const [page, setPage] = useState(1);

  const { data: settlementsData, isLoading } = useSettlements({
    status: activeTab || undefined,
    page,
    limit: 20,
  });

  const updatePaymentStatus = useUpdatePaymentStatus();
  const nudgeWinner = useNudgeWinner();
  const offerToUnderbidder = useOfferToUnderbidder();
  const { openConfirm, ConfirmModal: ConfirmModalComponent } = useConfirmModal();

  const items = settlementsData?.items || [];
  const total = settlementsData?.total || 0;

  const stats = useMemo(() => {
    const all = items;
    return {
      unpaid: all.filter((i) => i.paymentStatus === 'unpaid').length,
      totalRevenue: all
        .filter((i) => i.paymentStatus === 'paid')
        .reduce((sum, i) => sum + Number(i.finalPrice || 0), 0),
      pending: all.filter((i) => i.paymentStatus === 'pending').length,
      overdue: all.filter((i) => {
        if (i.paymentStatus !== 'unpaid' || !i.endTime) return false;
        return Date.now() - new Date(i.endTime).getTime() > 24 * 3600000;
      }).length,
    };
  }, [items]);

  const columns: Column<SettlementItem>[] = [
    {
      key: 'title',
      label: t('settlement.auction'),
      cardTitle: true,
      render: (item) => {
        return (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg overflow-hidden border border-white/10">
            <AuctionImage
              auction={{
                imageUrl: item.image,
                mainAttachmentId: item.mainAttachmentId ?? null,
                attachmentIds: item.attachmentIds ?? null,
                images: item.images ?? null,
              }}
              alt=""
              className="w-10 h-10"
              fallbackClassName="w-full h-full"
            >
              {(url) => (
                <img
                  src={url}
                  alt=""
                  className="w-full h-full object-cover"
                />
              )}
            </AuctionImage>
          </div>
          <div>
            <p className="text-sm font-bold text-zinc-text line-clamp-1 max-w-[200px]">
              {item.title}
            </p>
            <p className="text-xs text-zinc-muted">#{item.id}</p>
          </div>
        </div>
        );
      },
    },
    {
      key: 'winnerId',
      label: t('settlement.winner'),
      cardSubtitle: true,
      render: (item) => (
        <span className="font-mono text-zinc-secondary text-sm">{maskId(item.winnerId)}</span>
      ),
    },
    {
      key: 'finalPrice',
      label: t('settlement.final_price'),
      render: (item) => (
        <span className="text-zinc-text font-black tabular-nums">
          {Number(item.finalPrice || 0).toLocaleString()} <span className="text-zinc-muted font-normal text-xs">IQD</span>
        </span>
      ),
      align: 'center',
    },
    {
      key: 'paymentStatus',
      label: t('settlement.payment_status'),
      cardBadge: true,
      render: (item) => (
        <StatusBadge
          status={paymentStatusLabel(item.paymentStatus, t)}
          variant={paymentStatusVariant(item.paymentStatus)}
          showDot
          size="sm"
          className="font-black"
        />
      ),
      align: 'center',
    },
    {
      key: 'endTime',
      label: t('settlement.time_since_ended'),
      render: (item) => (
        <span className="text-zinc-muted text-sm font-medium">
          {item.endTime ? timeSince(item.endTime, t) : '-'}
        </span>
      ),
      align: 'center',
    },
  ];

  const rowActions: Action<SettlementItem>[] = [
    {
      label: (item) => item.winnerId ? t('settlement.nudge') : null,
      icon: Bell,
      onClick: (item) =>
        openConfirm({
          title: t('settlement.nudge_title'),
          message: `${t('settlement.nudge_confirm')} "${item.title}"?`,
          confirmText: t('settlement.send_nudge'),
          variant: 'warning',
          onConfirm: () => nudgeWinner.mutate(item.id),
        }),
    },
    {
      label: (item) => item.winningBid ? t('settlement.offer_2nd') : null,
      icon: UserCheck,
      onClick: (item) =>
        openConfirm({
          title: t('settlement.offer_title'),
          message: `${t('settlement.offer_confirm')} "${item.title}"?`,
          confirmText: t('settlement.send_offer'),
          variant: 'warning',
          onConfirm: () => offerToUnderbidder.mutate(item.id),
        }),
    },
    {
      label: (item) => item.paymentStatus !== 'paid' ? t('settlement.mark_paid') : null,
      icon: DollarSign,
      onClick: (item) =>
        openConfirm({
          title: t('settlement.mark_paid_title'),
          message: `${t('settlement.mark_paid_confirm')} "${item.title}"?`,
          confirmText: t('settlement.mark_paid'),
          variant: 'success',
          onConfirm: () => updatePaymentStatus.mutate({ id: item.id, paymentStatus: 'paid' }),
        }),
    },
    {
      label: (item) => item.paymentStatus === 'paid' ? t('settlement.mark_failed') : null,
      icon: XCircle,
      variant: 'danger',
      onClick: (item) =>
        openConfirm({
          title: t('settlement.mark_failed_title'),
          message: `${t('settlement.mark_failed_confirm')} "${item.title}"?`,
          confirmText: t('settlement.mark_failed'),
          variant: 'danger',
          onConfirm: () => updatePaymentStatus.mutate({ id: item.id, paymentStatus: 'failed' }),
        }),
    },
  ];

  return (
    <div className="flex flex-col gap-4 p-4 pt-0" dir={dir}>
      <ConfirmModalComponent />

      {/* Page Header */}
      <PageHeader
        title={t('settlement.title')}
        description={t('settlement.subtitle')}
      />

      {/* Stats Grid */}
      <StatsGrid
        stats={[
          { label: t('settlement.unpaid'), value: stats.unpaid.toString(), icon: Clock, color: 'warning' },
          { label: t('settlement.total_revenue'), value: `${stats.totalRevenue.toLocaleString()} IQD`, icon: DollarSign, color: 'success' },
          { label: t('settlement.pending'), value: stats.pending.toString(), icon: Receipt, color: 'info' },
          { label: t('settlement.overdue'), value: stats.overdue.toString(), icon: AlertTriangle, color: 'danger' },
        ]}
        columns={4}
      />

      {/* Status Tabs */}
      <div className="flex flex-wrap items-center gap-2">
        {[
          { key: '', label: t('settlement.all') },
          { key: 'unpaid', label: t('settlement.unpaid') },
          { key: 'pending', label: t('settlement.pending') },
          { key: 'paid', label: t('settlement.paid') },
          { key: 'failed', label: t('settlement.failed') },
          { key: 'refunded', label: t('settlement.refunded') },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => { setActiveTab(tab.key); setPage(1); }}
            className={cn(
              'px-4 py-2.5 text-xs font-black uppercase tracking-widest rounded-xl transition-all',
              activeTab === tab.key
                ? 'bg-[var(--color-brand)] text-black shadow-sm'
                : 'text-zinc-muted hover:text-zinc-text hover:bg-white/5 border border-white/5'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-[var(--color-obsidian-card)] border border-[var(--color-border)] rounded-2xl shadow-sm overflow-hidden">
        {isLoading ? (
          <AmberTableSkeleton rows={8} columns={5} />
        ) : (
          <DataTable
            columns={columns}
            data={items}
            keyField="id"
            rowActions={rowActions}
            pagination
            pageSize={20}
            totalItems={total}
            currentPage={page}
            onPageChange={setPage}
            emptyMessage={t('settlement.no_settlements')}
          />
        )}
      </div>
    </div>
  );
};
