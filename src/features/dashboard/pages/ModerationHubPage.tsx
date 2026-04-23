import React, { useState, useMemo } from 'react';
import { useAllBids, useVoidBid, useSuspendUser } from '../../auctions/api/auction-hooks';
import { useConfirmModal } from '@core/components/Feedback/AmberConfirmModal';
import { useLanguage } from '@core/contexts/LanguageContext';
import type { AllBidsItem } from '../../auctions/api/auction-api';

function bidStatusColor(status: string): string {
  switch (status) {
    case 'winning': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
    case 'active': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
    case 'outbid': return 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20';
    case 'cancelled': return 'bg-red-500/10 text-red-400 border-red-500/20';
    default: return 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20';
  }
}

function maskId(id: string): string {
  return id.substring(0, 8) + '...';
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export const ModerationHubPage = () => {
  const { t } = useLanguage();
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [bidderFilter, setBidderFilter] = useState('');
  const [expandedRow, setExpandedRow] = useState<number | null>(null);

  const { data: bidsData, isLoading } = useAllBids({
    page,
    limit: 20,
    status: statusFilter || undefined,
    bidderId: bidderFilter || undefined,
  });

  const voidBid = useVoidBid();
  const suspendUser = useSuspendUser();
  const { openConfirm, ConfirmModal: ConfirmModalComponent } = useConfirmModal();

  const items = bidsData?.items || [];
  const total = bidsData?.total || 0;
  const totalPages = bidsData?.totalPages || 1;

  const stats = useMemo(() => {
    return {
      totalBids: total,
      flagged: items.filter((i) => Number(i.amount) > 1000000).length,
      voided: items.filter((i) => i.status === 'cancelled').length,
    };
  }, [items, total]);

  return (
    <div className="space-y-8 p-6 max-w-[1600px] mx-auto animate-in fade-in duration-700">
      <ConfirmModalComponent />

      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-4xl font-black text-zinc-text tracking-tight leading-none uppercase">
          Moderation Hub
        </h1>
        <p className="text-sm text-zinc-secondary font-bold uppercase tracking-tight">
          Bid voiding, user management &amp; suspicious activity monitoring
        </p>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Bids', value: stats.totalBids, color: 'text-zinc-text' },
          { label: 'Flagged (>1M)', value: stats.flagged, color: 'text-amber-400' },
          { label: 'Voided', value: stats.voided, color: 'text-red-400' },
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

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-end">
        <div className="space-y-1">
          <label className="text-[10px] font-black uppercase tracking-widest text-zinc-muted">
            Status
          </label>
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="bg-obsidian-card border border-white/10 rounded-lg px-3 py-2 text-xs text-zinc-text font-bold focus:outline-none focus:border-white/20"
          >
            <option value="">All Statuses</option>
            <option value="winning">Winning</option>
            <option value="active">Active</option>
            <option value="outbid">Outbid</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-black uppercase tracking-widest text-zinc-muted">
            Bidder ID
          </label>
          <input
            type="text"
            value={bidderFilter}
            onChange={(e) => { setBidderFilter(e.target.value); setPage(1); }}
            placeholder="Enter bidder ID..."
            className="bg-obsidian-card border border-white/10 rounded-lg px-3 py-2 text-xs text-zinc-text font-bold focus:outline-none focus:border-white/20 w-48"
          />
        </div>
        {(statusFilter || bidderFilter) && (
          <button
            onClick={() => { setStatusFilter(''); setBidderFilter(''); setPage(1); }}
            className="px-3 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-colors"
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* DataTable */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-white/20 border-t-white/80 rounded-full animate-spin" />
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-20 text-zinc-muted text-sm font-bold">
          No bids found
        </div>
      ) : (
        <div className="bg-obsidian-card border border-white/5 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/5">
                  {['Bid ID', 'Auction', 'Bidder', 'Amount', 'Status', 'Time', 'Actions'].map((h) => (
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
                {items.map((item: AllBidsItem) => (
                  <React.Fragment key={item.id}>
                    <tr
                      className="hover:bg-white/[0.02] transition-colors cursor-pointer"
                      onClick={() => setExpandedRow(expandedRow === item.id ? null : item.id)}
                    >
                      <td className="px-5 py-4 text-sm font-mono text-zinc-secondary">
                        #{item.id}
                      </td>
                      <td className="px-5 py-4 text-sm text-zinc-text max-w-[200px] truncate">
                        {item.auction?.title || `Auction #${item.auctionId}`}
                      </td>
                      <td className="px-5 py-4 text-sm font-mono text-zinc-secondary">
                        {maskId(item.bidderId)}
                      </td>
                      <td className="px-5 py-4 text-sm font-black text-zinc-text">
                        {Number(item.amount).toLocaleString()} <span className="text-zinc-muted font-normal text-xs">IQD</span>
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-full border ${bidStatusColor(
                            item.status,
                          )}`}
                        >
                          {item.status}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-sm text-zinc-secondary">
                        {timeAgo(item.createdAt)}
                      </td>
                      <td className="px-5 py-4" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center gap-2">
                          {item.status !== 'cancelled' && (
                            <button
                              onClick={() =>
                                openConfirm({
                                  title: 'Void Bid',
                                  message: `Void bid #${item.id} for ${Number(item.amount).toLocaleString()} IQD? ${
                                    item.status === 'winning'
                                      ? 'This was a WINNING bid — the auction will be recalculated.'
                                      : ''
                                  }`,
                                  confirmText: 'Void Bid',
                                  variant: 'danger',
                                  onConfirm: () => voidBid.mutate(item.id),
                                })
                              }
                              className="px-3 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-colors"
                            >
                              Void
                            </button>
                          )}
                          <button
                            onClick={() =>
                              openConfirm({
                                title: 'Freeze User',
                                message: `Suspend user ${maskId(item.bidderId)}? They will not be able to bid until reactivated.`,
                                confirmText: 'Freeze User',
                                variant: 'danger',
                                onConfirm: () => suspendUser.mutate(item.bidderId),
                              })
                            }
                            className="px-3 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-lg bg-orange-500/10 text-orange-400 border border-orange-500/20 hover:bg-orange-500/20 transition-colors"
                          >
                            Freeze
                          </button>
                        </div>
                      </td>
                    </tr>

                    {/* Expandable detail row */}
                    {expandedRow === item.id && (
                      <tr className="bg-white/[0.02]">
                        <td colSpan={7} className="px-5 py-4">
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                            <div>
                              <p className="text-[10px] font-black uppercase tracking-widest text-zinc-muted mb-1">
                                Full Bidder ID
                              </p>
                              <p className="font-mono text-zinc-text break-all">{item.bidderId}</p>
                            </div>
                            <div>
                              <p className="text-[10px] font-black uppercase tracking-widest text-zinc-muted mb-1">
                                Auto Bid
                              </p>
                              <p className="text-zinc-text">{item.isAutoBid ? 'Yes' : 'No'}</p>
                            </div>
                            <div>
                              <p className="text-[10px] font-black uppercase tracking-widest text-zinc-muted mb-1">
                                Max Amount
                              </p>
                              <p className="text-zinc-text">
                                {item.maxAmount ? `${Number(item.maxAmount).toLocaleString()} IQD` : 'N/A'}
                              </p>
                            </div>
                            <div>
                              <p className="text-[10px] font-black uppercase tracking-widest text-zinc-muted mb-1">
                                Created At
                              </p>
                              <p className="text-zinc-text">{new Date(item.createdAt).toLocaleString()}</p>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
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
