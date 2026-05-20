import React, { useState } from 'react';
import { useLanguage } from '@core/contexts/LanguageContext';
import { AdminListPageShell } from '@core/components/Layout';
import { AmberButton } from '@core/components/AmberButton';
import { cn } from '@core/lib/utils/cn';
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  MessageSquareWarning,
  Clock,
  Tag,
  User,
  Package,
  Gavel,
  Inbox,
} from 'lucide-react';
import dayjs from 'dayjs';
import {
  usePendingItems,
  useApproveListing,
  useRejectListing,
  useRequestChangesListing,
  useApproveAuction,
  useRejectAuction,
  useRequestChangesAuction,
} from '../hooks/useModeration';
import type { PendingItem } from '../services/moderationService';

type TabValue = 'listings' | 'auctions';
type ModalAction = 'reject' | 'request_changes';

interface ModalState {
  open: boolean;
  action: ModalAction;
  type: 'listing' | 'auction';
  item: PendingItem | null;
}

function ApprovalQueuePage() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<TabValue>('listings');
  const [reasonModal, setReasonModal] = useState<ModalState>({
    open: false,
    action: 'reject',
    type: 'listing',
    item: null,
  });
  const [reasonText, setReasonText] = useState('');

  const { data: pendingData, isPending, isFetching } = usePendingItems();

  const approveListing = useApproveListing();
  const rejectListing = useRejectListing();
  const requestChangesListing = useRequestChangesListing();
  const approveAuction = useApproveAuction();
  const rejectAuction = useRejectAuction();
  const requestChangesAuction = useRequestChangesAuction();

  const listings = pendingData?.listings || [];
  const auctions = pendingData?.auctions || [];
  const currentItems = activeTab === 'listings' ? listings : auctions;
  const activeType: 'listing' | 'auction' = activeTab === 'listings' ? 'listing' : 'auction';

  const isMutating =
    approveListing.isPending ||
    rejectListing.isPending ||
    requestChangesListing.isPending ||
    approveAuction.isPending ||
    rejectAuction.isPending ||
    requestChangesAuction.isPending;

  const openReasonModal = (action: ModalAction, type: 'listing' | 'auction', item: PendingItem) => {
    setReasonText('');
    setReasonModal({ open: true, action, type, item });
  };

  const closeReasonModal = () => {
    setReasonModal({ open: false, action: 'reject', type: 'listing', item: null });
    setReasonText('');
  };

  const handleReasonSubmit = () => {
    if (!reasonModal.item || !reasonText.trim()) return;

    const { action, type, item } = reasonModal;
    const reason = reasonText.trim();

    if (type === 'listing') {
      if (action === 'reject') {
        rejectListing.mutate({ id: item.id, reason }, { onSettled: closeReasonModal });
      } else {
        requestChangesListing.mutate({ id: item.id, reason }, { onSettled: closeReasonModal });
      }
    } else {
      if (action === 'reject') {
        rejectAuction.mutate({ id: item.id, reason }, { onSettled: closeReasonModal });
      } else {
        requestChangesAuction.mutate({ id: item.id, reason }, { onSettled: closeReasonModal });
      }
    }
  };

  const handleApprove = (type: 'listing' | 'auction', item: PendingItem) => {
    if (type === 'listing') {
      approveListing.mutate(item.id);
    } else {
      approveAuction.mutate(item.id);
    }
  };

  return (
    <AdminListPageShell
      title={t('moderation.approval.title') || 'Approval Queue'}
      description={t('moderation.approval.subtitle') || 'Review and approve pending listings and auctions'}
      icon={ShieldCheck}
      stats={[
        {
          label: t('moderation.approval.pending_listings') || 'Pending Listings',
          value: listings.length.toString(),
          icon: Package,
          color: 'warning',
        },
        {
          label: t('moderation.approval.pending_auctions') || 'Pending Auctions',
          value: auctions.length.toString(),
          icon: Gavel,
          color: 'brand',
        },
      ]}
      statsColumns={2}
    >
      {/* Fetching overlay */}
      {isFetching && !isPending && (
        <div className="absolute top-2 left-1/2 -translate-x-1/2 z-[80] flex items-center gap-2 bg-[var(--color-obsidian-card)]/80 backdrop-blur-sm border border-white/[0.05] rounded-lg px-3 py-1.5">
          <div className="w-3 h-3 border-2 border-[var(--color-brand)] border-t-transparent rounded-full animate-spin" />
          <span className="text-[11px] font-black uppercase tracking-widest text-zinc-muted">Refreshing...</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center bg-[var(--color-obsidian-card)] border border-[var(--color-border)] p-1 rounded-xl shadow-sm w-fit">
        {([
          { key: 'listings' as TabValue, label: t('moderation.approval.tabs.listings') || 'Listings', icon: Package, count: listings.length },
          { key: 'auctions' as TabValue, label: t('moderation.approval.tabs.auctions') || 'Auctions', icon: Gavel, count: auctions.length },
        ]).map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              'flex items-center gap-2 px-4 py-2.5 text-xs font-bold transition-colors rounded-lg whitespace-nowrap',
              activeTab === tab.key
                ? 'bg-[var(--color-brand)] text-black shadow-sm'
                : 'text-zinc-muted hover:text-zinc-text hover:bg-white/[0.02]',
            )}
          >
            <tab.icon className="w-3.5 h-3.5" />
            {tab.label}
            <span className={cn(
              'text-[10px] font-black px-1.5 py-0.5 rounded-full',
              activeTab === tab.key ? 'bg-black/20' : 'bg-white/[0.05]',
            )}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Content */}
      {isPending ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-[var(--color-obsidian-card)] border border-[var(--color-border)] rounded-2xl p-5 animate-pulse">
              <div className="flex gap-4">
                <div className="w-14 h-14 rounded-xl bg-[var(--color-obsidian-outer)]" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-[var(--color-obsidian-outer)] rounded w-3/4" />
                  <div className="h-2 bg-[var(--color-obsidian-outer)] rounded w-1/2" />
                  <div className="h-2 bg-[var(--color-obsidian-outer)] rounded w-1/3" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : currentItems.length === 0 ? (
        <div className="bg-[var(--color-obsidian-card)] border border-[var(--color-border)] rounded-2xl p-16 text-center">
          <Inbox className="w-12 h-12 text-zinc-muted mx-auto mb-4" />
          <p className="text-sm text-zinc-muted font-bold">
            {t('moderation.approval.empty') || 'No pending items to review'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {currentItems.map((item) => (
            <PendingItemCard
              key={`${activeTab}-${item.id}`}
              item={item}
              type={activeType}
              onApprove={() => handleApprove(activeType, item)}
              onReject={() => openReasonModal('reject', activeType, item)}
              onRequestChanges={() => openReasonModal('request_changes', activeType, item)}
              isApproving={
                activeType === 'listing' ? approveListing.isPending : approveAuction.isPending
              }
              isMutating={isMutating}
              t={t}
            />
          ))}
        </div>
      )}

      {/* Reason Modal */}
      {reasonModal.open && reasonModal.item && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-[var(--color-obsidian-card)] border border-[var(--color-border)] rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className={cn(
                'w-10 h-10 rounded-full flex items-center justify-center',
                reasonModal.action === 'reject' ? 'bg-red-500/10' : 'bg-amber-500/10',
              )}>
                {reasonModal.action === 'reject'
                  ? <XCircle className="w-5 h-5 text-red-400" />
                  : <MessageSquareWarning className="w-5 h-5 text-amber-400" />
                }
              </div>
              <div>
                <h3 className="text-sm font-black text-zinc-text uppercase tracking-widest">
                  {reasonModal.action === 'reject'
                    ? (t('moderation.approval.reject_title') || 'Reject Item')
                    : (t('moderation.approval.request_changes_title') || 'Request Changes')
                  }
                </h3>
                <p className="text-[13px] text-zinc-muted font-bold truncate max-w-[280px]">
                  {reasonModal.item.title}
                </p>
              </div>
            </div>

            <textarea
              value={reasonText}
              onChange={(e) => setReasonText(e.target.value)}
              placeholder={reasonModal.action === 'reject'
                ? (t('moderation.approval.reject_placeholder') || 'Provide a reason for rejection...')
                : (t('moderation.approval.request_changes_placeholder') || 'Describe what changes are needed...')
              }
              className="w-full bg-[var(--color-obsidian-outer)] border border-[var(--color-border)] rounded-xl p-3 text-sm text-zinc-text font-medium resize-none h-28 focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)]/20 mb-4"
              autoFocus
            />

            <div className="flex items-center justify-end gap-3">
              <AmberButton
                variant="outline"
                className="h-10 px-6 font-bold uppercase tracking-wider text-xs"
                onClick={closeReasonModal}
                disabled={isMutating}
              >
                {t('common.cancel') || 'Cancel'}
              </AmberButton>
              <AmberButton
                className={cn(
                  'h-10 px-6 font-bold uppercase tracking-wider text-xs border-none',
                  reasonModal.action === 'reject'
                    ? 'bg-red-500 text-white hover:bg-red-600'
                    : 'bg-amber-500 text-black hover:bg-amber-600',
                )}
                onClick={handleReasonSubmit}
                disabled={!reasonText.trim() || isMutating}
              >
                {isMutating
                  ? (t('common.processing') || 'Processing...')
                  : reasonModal.action === 'reject'
                    ? (t('moderation.approval.reject') || 'Reject')
                    : (t('moderation.approval.request_changes') || 'Request Changes')
                }
              </AmberButton>
            </div>
          </div>
        </div>
      )}
    </AdminListPageShell>
  );
}

function PendingItemCard({
  item,
  type,
  onApprove,
  onReject,
  onRequestChanges,
  isApproving,
  isMutating,
  t,
}: {
  item: PendingItem;
  type: 'listing' | 'auction';
  onApprove: () => void;
  onReject: () => void;
  onRequestChanges: () => void;
  isApproving: boolean;
  isMutating: boolean;
  t: (key: string) => string;
}) {
  return (
    <div className="bg-[var(--color-obsidian-card)] border border-[var(--color-border)] rounded-2xl p-5 hover:border-[var(--color-brand)]/30 transition-all duration-200 group">
      <div className="flex items-start gap-4">
        {/* Image / Icon */}
        <div className="flex-shrink-0 w-14 h-14 rounded-xl overflow-hidden bg-[var(--color-obsidian-outer)] flex items-center justify-center">
          {item.imageUrl ? (
            <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
          ) : (
            type === 'listing'
              ? <Package className="w-6 h-6 text-zinc-muted" />
              : <Gavel className="w-6 h-6 text-zinc-muted" />
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-sm text-zinc-text truncate">{item.title}</h3>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1.5">
            {/* Merchant */}
            <div className="flex items-center gap-1">
              <User className="w-3 h-3 text-zinc-muted" />
              <span className="text-[12px] text-zinc-muted">{item.merchantName}</span>
            </div>

            {/* Category */}
            <div className="flex items-center gap-1">
              <Tag className="w-3 h-3 text-zinc-muted" />
              <span className="text-[12px] text-zinc-muted">{item.category}</span>
            </div>

            {/* Submitted date */}
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-zinc-muted" />
              <span className="text-[12px] text-zinc-muted">
                {dayjs(item.submittedAt).format('MMM D, YYYY')}
              </span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <AmberButton
            className="h-8 px-3 text-[11px] font-black uppercase tracking-widest bg-green-500/10 border border-green-500/20 text-green-400 hover:bg-green-500/20 rounded-lg transition-all"
            onClick={onApprove}
            disabled={isMutating}
          >
            <CheckCircle2 className="w-3 h-3 me-1" />
            {t('moderation.approval.approve') || 'Approve'}
          </AmberButton>

          <AmberButton
            className="h-8 px-3 text-[11px] font-black uppercase tracking-widest bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 rounded-lg transition-all"
            onClick={onReject}
            disabled={isMutating}
          >
            <XCircle className="w-3 h-3 me-1" />
            {t('moderation.approval.reject') || 'Reject'}
          </AmberButton>

          <AmberButton
            className="h-8 px-3 text-[11px] font-black uppercase tracking-widest bg-amber-500/10 border border-amber-500/20 text-amber-400 hover:bg-amber-500/20 rounded-lg transition-all"
            onClick={onRequestChanges}
            disabled={isMutating}
          >
            <MessageSquareWarning className="w-3 h-3 me-1" />
            {t('moderation.approval.request_changes') || 'Changes'}
          </AmberButton>
        </div>
      </div>
    </div>
  );
}

export { ApprovalQueuePage };
