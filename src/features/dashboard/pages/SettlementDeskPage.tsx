import React, { useState, useMemo } from 'react';
import { useSettlements, useUpdatePaymentStatus, useNudgeWinner, useOfferToUnderbidder } from '../../auctions/api/auction-hooks';
import { useConfirmModal } from '@core/components/Feedback/AmberConfirmModal';
import { useLanguage } from '@core/contexts/LanguageContext';
import type { SettlementItem } from '../../auctions/api/auction-api';

const PAYMENT_STATUS_TABS = [
  { key: '', label: 'All' },
  { key: 'unpaid', label: 'Unpaid' },
  { key: 'pending', label: 'Pending' },
  { key: 'paid', label: 'Paid' },
  { key: 'failed', label: 'Failed' },
  { key: 'refunded', label: 'Refunded' },
] as const;

function timeSince(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const hours = Math.floor(diff / 3600000);
  if (hours < 1) return `${Math.floor(diff / 60000)}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

function maskId(id: string | null): string {
  if (!id) return '-';
  return id.substring(0, 8) + '...';
}

function statusBadgeColor(status: string): string {
  switch (status) {
    case 'paid': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
    case 'unpaid': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
    case 'pending': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
    case 'failed': return 'bg-red-500/10 text-red-400 border-red-500/20';
    case 'refunded': return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
    default: return 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20';
  }
}

export const SettlementDeskPage = () => {
  const { t } = useLanguage();
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
  const totalPages = settlementsData?.totalPages || 1;

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

  return (
    <div className="space-y-8 p-6 max-w-[1600px] mx-auto animate-in fade-in duration-700">
      <ConfirmModalComponent />

      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-4xl font-black text-zinc-text tracking-tight leading-none uppercase">
          Settlement Desk
        </h1>
        <p className="text-sm text-zinc-secondary font-bold uppercase tracking-tight">
          Post-auction financial settlement &amp; payment tracking
        </p>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Unpaid', value: stats.unpaid, color: 'text-amber-400' },
          { label: 'Total Revenue', value: `${stats.totalRevenue.toLocaleString()} IQD`, color: 'text-emerald-400' },
          { label: 'Pending', value: stats.pending, color: 'text-blue-400' },
          { label: 'Overdue (>24h)', value: stats.overdue, color: 'text-red-400' },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-obsidian-card border border-white/5 rounded-2xl p-5 space-y-2"
          >
            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-muted">
              {stat.label}
            </p>
            <p className={`text-2xl font-black ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Status Tabs */}
      <div className="flex gap-2 border-b border-white/5 pb-3">
        {PAYMENT_STATUS_TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => { setActiveTab(tab.key); setPage(1); }}
            className={`px-4 py-2 text-xs font-black uppercase tracking-widest rounded-xl transition-all ${
              activeTab === tab.key
                ? 'bg-white/10 text-zinc-text'
                : 'text-zinc-muted hover:text-zinc-text hover:bg-white/5'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* DataTable */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-white/20 border-t-white/80 rounded-full animate-spin" />
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-20 text-zinc-muted text-sm font-bold">
          No settlements found
        </div>
      ) : (
        <div className="bg-obsidian-card border border-white/5 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/5">
                  {['Auction', 'Winner', 'Final Price', 'Payment Status', 'Time Since Ended', 'Actions'].map((h) => (
                    <th
                      key={h}
                      className="px-5 py-4 text-[10px] font-black uppercase tracking-widest text-zinc-muted"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {items.map((item: SettlementItem) => (
                  <tr
                    key={item.id}
                    className="hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        {item.image ? (
                          <img
                            src={item.image}
                            alt=""
                            className="w-10 h-10 rounded-lg object-cover border border-white/10"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-xs text-zinc-muted">
                            N/A
                          </div>
                        )}
                        <div>
                          <p className="text-sm font-bold text-zinc-text line-clamp-1 max-w-[200px]">
                            {item.title}
                          </p>
                          <p className="text-[10px] text-zinc-muted">#{item.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-sm font-mono text-zinc-secondary">
                      {maskId(item.winnerId)}
                    </td>
                    <td className="px-5 py-4 text-sm font-black text-zinc-text">
                      {Number(item.finalPrice || 0).toLocaleString()} <span className="text-zinc-muted font-normal text-xs">IQD</span>
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-full border ${statusBadgeColor(
                          item.paymentStatus,
                        )}`}
                      >
                        {item.paymentStatus}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-sm text-zinc-secondary">
                      {item.endTime ? timeSince(item.endTime) : '-'}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        {item.winnerId && (
                          <button
                            onClick={() =>
                              openConfirm({
                                title: 'Nudge Winner',
                                message: `Send a push notification to the winner of "${item.title}"?`,
                                confirmText: 'Send Nudge',
                                variant: 'warning',
                                onConfirm: () => nudgeWinner.mutate(item.id),
                              })
                            }
                            className="px-3 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 hover:bg-amber-500/20 transition-colors"
                          >
                            Nudge
                          </button>
                        )}
                        {item.winningBid && (
                          <button
                            onClick={() =>
                              openConfirm({
                                title: 'Offer to Underbidder',
                                message: `Send an offer to the second-highest bidder for "${item.title}"?`,
                                confirmText: 'Send Offer',
                                variant: 'warning',
                                onConfirm: () => offerToUnderbidder.mutate(item.id),
                              })
                            }
                            className="px-3 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20 hover:bg-blue-500/20 transition-colors"
                          >
                            Offer 2nd
                          </button>
                        )}
                        {item.paymentStatus !== 'paid' && (
                          <button
                            onClick={() =>
                              openConfirm({
                                title: 'Mark as Paid',
                                message: `Mark "${item.title}" as paid?`,
                                confirmText: 'Mark Paid',
                                variant: 'success',
                                onConfirm: () => updatePaymentStatus.mutate({ id: item.id, paymentStatus: 'paid' }),
                              })
                            }
                            className="px-3 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition-colors"
                          >
                            Paid
                          </button>
                        )}
                        {item.paymentStatus === 'paid' && (
                          <button
                            onClick={() =>
                              openConfirm({
                                title: 'Mark as Failed',
                                message: `Mark "${item.title}" payment as failed?`,
                                confirmText: 'Mark Failed',
                                variant: 'danger',
                                onConfirm: () => updatePaymentStatus.mutate({ id: item.id, paymentStatus: 'failed' }),
                              })
                            }
                            className="px-3 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-colors"
                          >
                            Failed
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-5 py-4 border-t border-white/5">
              <p className="text-xs text-zinc-muted">
                Page {page} of {totalPages} — {total} total
              </p>
              <div className="flex gap-2">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="px-3 py-1.5 text-xs font-bold rounded-lg bg-white/5 border border-white/10 text-zinc-text disabled:opacity-30 hover:bg-white/10 transition-colors"
                >
                  Prev
                </button>
                <button
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  className="px-3 py-1.5 text-xs font-bold rounded-lg bg-white/5 border border-white/10 text-zinc-text disabled:opacity-30 hover:bg-white/10 transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
