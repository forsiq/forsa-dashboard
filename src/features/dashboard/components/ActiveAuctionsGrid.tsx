import React, { useState, useEffect } from 'react';
import {
  Clock,
  Gavel,
  Pause,
  Square,
  ArrowUp,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { AmberCard } from '@core/components/AmberCard';
import { cn } from '@core/lib/utils/cn';
import { useGetAuctions, useEndAuction, usePauseAuction, useExtendAuction } from '../../auctions/api/auction-hooks';
import type { Auction } from '../../auctions/types/auction.types';
import { useToast } from '@core/contexts/ToastContext';
import { useConfirmModal } from '@core/components/Feedback/AmberConfirmModal';

export const ActiveAuctionsGrid: React.FC = () => {
  const { data: auctionsData, isLoading } = useGetAuctions({
    status: 'active',
    limit: 20,
    sortBy: 'endTime',
    sortOrder: 'asc',
  });
  const endAuction = useEndAuction();
  const pauseAuction = usePauseAuction();
  const extendAuction = useExtendAuction();
  const toast = useToast();
  const { confirm, ConfirmModalComponent } = useConfirmModal();

  const auctions = auctionsData?.data || [];

  function formatTimeRemaining(endTime: string): string {
    const now = Date.now();
    const end = new Date(endTime).getTime();
    const diff = end - now;

    if (diff <= 0) return 'Ended';

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    if (hours > 0) return `${hours}h ${minutes}m`;
    if (minutes > 0) return `${minutes}m ${seconds}s`;
    return `${seconds}s`;
  }

  const getUrgencyClass = (endTime: string) => {
    const diff = new Date(endTime).getTime() - Date.now();
    const minutesLeft = diff / (1000 * 60);

    if (minutesLeft <= 5) return 'border-danger/30 bg-danger/5';
    if (minutesLeft <= 15) return 'border-warning/30 bg-warning/5';
    return 'border-success/20 bg-success/5';
  };

  const getUrgencyDot = (endTime: string) => {
    const diff = new Date(endTime).getTime() - Date.now();
    const minutesLeft = diff / (1000 * 60);

    if (minutesLeft <= 5) return 'bg-danger';
    if (minutesLeft <= 15) return 'bg-warning';
    return 'bg-success';
  };

  return (
    <AmberCard className="border-white/5 shadow-lg bg-obsidian-panel/80 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 border-l-2 border-warning pl-3">
        <h3 className="text-xs font-black text-zinc-text uppercase tracking-[0.2em]">
          Active Auctions
        </h3>
        <span className="text-[10px] text-zinc-muted font-mono uppercase tracking-widest">
          {auctions.length} live
        </span>
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-y-auto space-y-2 pr-1 min-h-0 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent"
        style={{ maxHeight: 'calc(100vh - 380px)' }}
      >
        {isLoading ? (
          <div className="flex items-center justify-center h-40">
            <div className="w-8 h-8 border-3 border-brand border-t-transparent rounded-full animate-spin" />
          </div>
        ) : auctions.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-center">
            <Gavel className="w-8 h-8 text-zinc-muted/30 mb-3" />
            <p className="text-sm text-zinc-muted/50 font-bold">
              No active auctions
            </p>
          </div>
        ) : (
          auctions.map((auction) => (
            <AuctionCard
              key={auction.id}
              auction={auction}
              getUrgencyClass={getUrgencyClass}
              getUrgencyDot={getUrgencyDot}
              formatTimeRemaining={formatTimeRemaining}
              onEnd={async () => {
                const ok = await confirm({
                  title: 'End Auction',
                  message: `End "${auction.title}" now? This cannot be undone.`,
                  confirmText: 'End Now',
                  variant: 'danger',
                });
                if (ok) endAuction.mutate(auction.id);
              }}
              onPause={() => pauseAuction.mutate(auction.id)}
              onExtend={async () => {
                const ok = await confirm({
                  title: 'Extend Auction',
                  message: `Extend "${auction.title}" by 15 minutes?`,
                  confirmText: 'Extend 15m',
                  variant: 'warning',
                });
                if (ok) extendAuction.mutate({ id: auction.id, minutes: 15 });
              }}
            />
          ))
        )}
      </div>

      {ConfirmModalComponent}
    </AmberCard>
  );
};

interface AuctionCardProps {
  auction: Auction;
  getUrgencyClass: (endTime: string) => string;
  getUrgencyDot: (endTime: string) => string;
  formatTimeRemaining: (endTime: string) => string;
  onEnd: () => void;
  onPause: () => void;
  onExtend: () => void;
}

const AuctionCard: React.FC<AuctionCardProps> = ({
  auction,
  getUrgencyClass,
  getUrgencyDot,
  formatTimeRemaining,
  onEnd,
  onPause,
  onExtend,
}) => {
  const [expanded, setExpanded] = useState(false);
  const [timeStr, setTimeStr] = useState(formatTimeRemaining(auction.endTime));

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeStr(formatTimeRemaining(auction.endTime));
    }, 1000);
    return () => clearInterval(interval);
  }, [auction.endTime, formatTimeRemaining]);

  return (
    <div
      className={cn(
        'rounded-xl border p-3 transition-all',
        getUrgencyClass(auction.endTime),
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span
              className={cn(
                'w-2 h-2 rounded-full animate-pulse shrink-0',
                getUrgencyDot(auction.endTime),
              )}
            />
            <p className="text-xs font-bold text-zinc-text truncate">
              {auction.title}
            </p>
          </div>
          <div className="flex items-center gap-3 mt-1.5 ml-4">
            <span className="text-sm font-black text-zinc-text tracking-tight">
              {(auction.currentBid || auction.startPrice).toLocaleString()} IQD
            </span>
            <span className="text-[10px] text-zinc-muted font-mono">
              {auction.totalBids} bids
            </span>
          </div>
        </div>

        <div className="flex flex-col items-end shrink-0">
          <span className="text-[10px] font-black font-mono text-zinc-muted uppercase tracking-wider flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {timeStr}
          </span>
          <button
            onClick={() => setExpanded(!expanded)}
            className="mt-1 text-[9px] text-zinc-muted/60 hover:text-zinc-text uppercase tracking-widest font-bold transition-colors flex items-center gap-0.5"
          >
            actions
            {expanded ? (
              <ChevronUp className="w-3 h-3" />
            ) : (
              <ChevronDown className="w-3 h-3" />
            )}
          </button>
        </div>
      </div>

      {expanded && (
        <div className="flex items-center gap-2 mt-3 pt-2 border-t border-white/5 ml-4 animate-in fade-in slide-in-from-top-1 duration-200">
          <button
            onClick={onExtend}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest bg-warning/10 text-warning border border-warning/20 hover:bg-warning/20 transition-colors"
          >
            <ArrowUp className="w-3 h-3" />
            +15m
          </button>
          <button
            onClick={onPause}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest bg-info/10 text-info border border-info/20 hover:bg-info/20 transition-colors"
          >
            <Pause className="w-3 h-3" />
            Pause
          </button>
          <button
            onClick={onEnd}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest bg-danger/10 text-danger border border-danger/20 hover:bg-danger/20 transition-colors"
          >
            <Square className="w-3 h-3" />
            End
          </button>
        </div>
      )}
    </div>
  );
};
