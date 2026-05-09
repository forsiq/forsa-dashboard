import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/router';
import { Gavel, TrendingUp, Trophy, AlertTriangle, Clock } from 'lucide-react';
import { useLanguage } from '@core/contexts/LanguageContext';
import { cn } from '@core/lib/utils/cn';
import { formatCurrency } from '@core/lib/utils/formatCurrency';
import { AmberCard as Card } from '@core/components/AmberCard';
import { StatusBadge } from '@core/components/Data/StatusBadge';
import { DataTable, Column } from '@core/components/Data/DataTable';
import { useGetMyBids } from '../api';
import { BidActionSheet } from '../components/BidActionSheet';
import { computeBidDisplayStatus, type BidDisplayStatus } from '../types/auction.types';

interface BidRow {
  id: number;
  auctionId: number;
  auctionTitle: string;
  amount: number;
  status: string;
  createdAt: string;
  auctionStatus?: string;
  currentBid?: number;
  endTime?: string;
  auctionImage?: string;
  displayStatus: BidDisplayStatus;
}

type BidTab = 'all' | 'winning' | 'outbid' | 'ended';

const TAB_CONFIG: { key: BidTab; labelKey: string; fallback: string; icon: React.ElementType }[] = [
  { key: 'all', labelKey: 'auction.tabs.all', fallback: 'All', icon: Gavel },
  { key: 'winning', labelKey: 'auction.tabs.winning', fallback: 'Winning', icon: Trophy },
  { key: 'outbid', labelKey: 'auction.tabs.outbid', fallback: 'Outbid', icon: AlertTriangle },
  { key: 'ended', labelKey: 'auction.tabs.ended', fallback: 'Ended', icon: Clock },
];

const DISPLAY_STATUS_VARIANT: Record<BidDisplayStatus, 'success' | 'warning' | 'error' | 'info'> = {
  winning: 'success',
  outbid: 'warning',
  won: 'success',
  lost: 'error',
  active: 'info',
  cancelled: 'error',
};

const DISPLAY_STATUS_LABEL: Record<BidDisplayStatus, { key: string; fallback: string }> = {
  winning: { key: 'auction.bid_status.winning', fallback: 'Winning' },
  outbid: { key: 'auction.bid_status.outbid', fallback: 'Outbid' },
  won: { key: 'auction.bid_status.won', fallback: 'Won' },
  lost: { key: 'auction.bid_status.lost', fallback: 'Lost' },
  active: { key: 'auction.bid_status.active', fallback: 'Active' },
  cancelled: { key: 'auction.bid_status.cancelled', fallback: 'Cancelled' },
};

export const MyBidsPage: React.FC = () => {
  const { t, dir } = useLanguage();
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  const [activeTab, setActiveTab] = useState<BidTab>('all');
  const [selectedBid, setSelectedBid] = useState<BidRow | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const { data: bidsData, isLoading } = useGetMyBids();

  const bids: BidRow[] = useMemo(() => {
    const raw = (bidsData?.data || []) as any[];
    return raw.map((bid: any) => {
      const auction = bid.auction || {};
      const auctionStatus = auction.status || '';
      const displayStatus = computeBidDisplayStatus(bid.status, auctionStatus);

      return {
        id: bid.id,
        auctionId: bid.auctionId || auction.id,
        auctionTitle: auction.title || bid.auctionTitle || `Auction #${bid.auctionId}`,
        amount: Number(bid.amount),
        status: bid.status,
        createdAt: bid.createdAt,
        auctionStatus,
        currentBid: auction.currentBid ? Number(auction.currentBid) : undefined,
        endTime: auction.endTime,
        auctionImage: Array.isArray(auction.images) && auction.images.length > 0 ? auction.images[0] : undefined,
        displayStatus,
      };
    });
  }, [bidsData]);

  const filteredBids = useMemo(() => {
    switch (activeTab) {
      case 'winning':
        return bids.filter((b) => b.displayStatus === 'winning');
      case 'outbid':
        return bids.filter((b) => b.displayStatus === 'outbid');
      case 'ended':
        return bids.filter((b) => b.displayStatus === 'won' || b.displayStatus === 'lost');
      default:
        return bids;
    }
  }, [bids, activeTab]);

  const tabCounts = useMemo(() => ({
    all: bids.length,
    winning: bids.filter((b) => b.displayStatus === 'winning').length,
    outbid: bids.filter((b) => b.displayStatus === 'outbid').length,
    ended: bids.filter((b) => b.displayStatus === 'won' || b.displayStatus === 'lost').length,
  }), [bids]);

  const columns: Column<BidRow>[] = [
    {
      key: 'auctionTitle',
      label: t('auction.table.identification') || 'Auction',
      cardTitle: true,
      render: (bid) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-brand/10 flex items-center justify-center shrink-0 overflow-hidden">
            {bid.auctionImage ? (
              <img src={bid.auctionImage} alt="" className="w-full h-full object-cover rounded-lg" />
            ) : (
              <Gavel className="w-4 h-4 text-brand" />
            )}
          </div>
          <div>
            <p className="text-sm font-black text-zinc-text uppercase tracking-tight">{bid.auctionTitle}</p>
            <p className="text-[10px] font-bold text-zinc-muted uppercase tracking-widest mt-0.5">#{bid.auctionId}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'amount',
      label: t('auction.table.premium_value') || 'Bid Amount',
      render: (bid) => (
        <span className="text-base font-black text-brand tabular-nums leading-none tracking-tight">
          {formatCurrency(bid.amount)}
        </span>
      ),
      sortable: true,
      align: 'right',
    },
    {
      key: 'status',
      label: t('auction.table.state') || 'Status',
      cardBadge: true,
      render: (bid) => {
        const cfg = DISPLAY_STATUS_LABEL[bid.displayStatus] || DISPLAY_STATUS_LABEL.active;
        return (
          <StatusBadge
            status={t(cfg.key) || cfg.fallback}
            variant={DISPLAY_STATUS_VARIANT[bid.displayStatus] || 'info'}
            size="sm"
          />
        );
      },
      align: 'center',
    },
    {
      key: 'createdAt',
      label: t('common.date') || 'Date',
      render: (bid) => {
        const date = new Date(bid.createdAt);
        return (
          <span className="text-sm text-zinc-muted">
            {!isNaN(date.getTime()) ? date.toLocaleDateString() : '-'}
          </span>
        );
      },
      align: 'center',
    },
  ];

  const handleRowClick = (row: BidRow) => {
    setSelectedBid(row);
    setSheetOpen(true);
  };

  if (!isClient) return null;

  return (
    <div className="space-y-8 p-6 max-w-[1600px] mx-auto animate-in fade-in duration-700" dir={dir}>
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-sm bg-brand/10 flex items-center justify-center text-brand border border-brand/20 shadow-[0_0_15px_rgba(245,196,81,0.1)]">
          <TrendingUp className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-4xl font-black text-zinc-text tracking-tighter leading-none uppercase">
            {t('auction.my_bids') || 'My Bids'}
          </h1>
          <p className="text-base text-zinc-muted font-bold tracking-tight uppercase mt-1">
            {t('auction.bidding_history') || 'Track your bidding activity'}
          </p>
        </div>
      </div>

      {/* Tabs */}
      {!isLoading && bids.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {TAB_CONFIG.map((tab) => {
            const Icon = tab.icon;
            const count = tabCounts[tab.key];
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={cn(
                  'flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-black uppercase tracking-widest whitespace-nowrap transition-all',
                  isActive
                    ? 'bg-brand/15 text-brand border border-brand/30'
                    : 'bg-obsidian-outer text-zinc-muted border border-white/5 hover:text-zinc-text hover:border-white/10'
                )}
              >
                <Icon className="w-3.5 h-3.5" />
                {t(tab.labelKey) || tab.fallback}
                <span className={cn(
                  'ml-1 px-1.5 py-0.5 rounded text-[9px] tabular-nums',
                  isActive ? 'bg-brand/20 text-brand' : 'bg-white/5 text-zinc-muted'
                )}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* Table */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 rounded-xl bg-white/[0.02] border border-white/[0.05] animate-pulse" />
          ))}
        </div>
      ) : filteredBids.length === 0 ? (
        <Card className="!p-24 text-center space-y-6 bg-obsidian-card/40">
          <div className="w-20 h-20 rounded-full bg-white/[0.02] flex items-center justify-center mx-auto border border-white/[0.05]">
            <Gavel className="w-10 h-10 text-zinc-muted/30" />
          </div>
          <div className="max-w-md mx-auto space-y-2">
            <h3 className="text-xl font-black text-zinc-text uppercase tracking-widest">
              {t('auction.no_bids') || 'No Bids Yet'}
            </h3>
            <p className="text-sm text-zinc-muted font-bold tracking-tight">
              {t('auction.no_bids_desc') || "You haven't placed any bids yet. Start bidding on auctions!"}
            </p>
          </div>
        </Card>
      ) : (
        <div className="bg-[var(--color-obsidian-card)] border border-[var(--color-border)] rounded-2xl shadow-sm overflow-hidden">
          <DataTable
            columns={columns}
            data={filteredBids}
            keyField="id"
            onRowClick={handleRowClick}
            pagination
            pageSize={10}
          />
        </div>
      )}

      {/* Bottom Sheet */}
      <BidActionSheet
        isOpen={sheetOpen}
        onClose={() => setSheetOpen(false)}
        bid={selectedBid ? {
          id: selectedBid.id,
          auctionId: selectedBid.auctionId,
          auctionTitle: selectedBid.auctionTitle,
          auctionImage: selectedBid.auctionImage,
          amount: selectedBid.amount,
          currentBid: selectedBid.currentBid,
          displayStatus: selectedBid.displayStatus,
          endTime: selectedBid.endTime,
          auctionStatus: selectedBid.auctionStatus,
        } : null}
      />
    </div>
  );
};

export default MyBidsPage;
