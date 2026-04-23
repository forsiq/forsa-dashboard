import React, { useState, useEffect } from 'react';
import { Clock, ArrowUp, Square, AlertTriangle } from 'lucide-react';
import { AmberCard } from '@core/components/AmberCard';
import { cn } from '@core/lib/utils/cn';
import { useCriticalAuctions, useExtendAuction, useEndAuction } from '../../auctions/api/auction-hooks';
import { useConfirmModal } from '@core/components/Feedback/AmberConfirmModal';

function formatTimeRemaining(endTime: string): string {
  const now = Date.now();
  const end = new Date(endTime).getTime();
  const diff = end - now;

  if (diff <= 0) return 'Ended';

  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  if (hours > 0) return `${hours}h ${minutes}m ${seconds}s`;
  if (minutes > 0) return `${minutes}m ${seconds}s`;
  return `${seconds}s`;
}

export const CriticalNodes: React.FC = () => {
  const { data: auctions, isLoading } = useCriticalAuctions();
  const extendAuction = useExtendAuction();
  const endAuction = useEndAuction();
  const { openConfirm, ConfirmModal } = useConfirmModal();

  const criticalAuctions = (auctions || []).slice(0, 3);

  if (isLoading) {
    return (
      <AmberCard className="border-warning/10 shadow-lg">
        <div className="flex items-center gap-2 mb-4 border-l-2 border-warning pl-3">
          <AlertTriangle className="w-3.5 h-3.5 text-warning" />
          <h3 className="text-xs font-black text-zinc-text uppercase tracking-[0.2em]">
            Critical Nodes
          </h3>
        </div>
        <div className="flex items-center justify-center h-20">
          <div className="w-6 h-6 border-2 border-warning border-t-transparent rounded-full animate-spin" />
        </div>
      </AmberCard>
    );
  }

  if (criticalAuctions.length === 0) {
    return (
      <AmberCard className="border-success/10 shadow-lg">
        <div className="flex items-center gap-2 mb-4 border-l-2 border-success pl-3">
          <Clock className="w-3.5 h-3.5 text-success" />
          <h3 className="text-xs font-black text-zinc-text uppercase tracking-[0.2em]">
            Critical Nodes
          </h3>
        </div>
        <div className="flex flex-col items-center justify-center py-6 text-center">
          <p className="text-sm text-zinc-muted/50 font-bold">
            No critical auctions
          </p>
          <p className="text-[10px] text-zinc-muted/30 uppercase tracking-widest mt-1">
            All auctions have more than 60 minutes remaining
          </p>
        </div>
      </AmberCard>
    );
  }

  return (
    <AmberCard className="border-warning/10 shadow-lg">
      <div className="flex items-center justify-between mb-4 border-l-2 border-warning pl-3">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-3.5 h-3.5 text-warning" />
          <h3 className="text-xs font-black text-zinc-text uppercase tracking-[0.2em]">
            Critical Nodes
          </h3>
        </div>
        <span className="text-[10px] text-warning font-mono uppercase tracking-widest">
          {criticalAuctions.length} ending soon
        </span>
      </div>

      <div className="space-y-3">
        {criticalAuctions.map((auction) => (
          <CriticalNodeCard
            key={auction.id}
            id={auction.id}
            title={auction.title}
            currentBid={auction.currentBid}
            totalBids={auction.totalBids}
            endTime={auction.endTime}
            onExtend={() => {
              openConfirm({
                title: 'Extend Auction',
                message: `Extend "${auction.title}" by 15 minutes?`,
                confirmText: 'Extend 15m',
                variant: 'warning',
                onConfirm: () => extendAuction.mutate({ id: auction.id, minutes: 15 }),
              });
            }}
            onEnd={() => {
              openConfirm({
                title: 'End Auction',
                message: `End "${auction.title}" now? This cannot be undone.`,
                confirmText: 'End Now',
                variant: 'danger',
                onConfirm: () => endAuction.mutate(auction.id),
              });
            }}
          />
        ))}
      </div>

      <ConfirmModal />
    </AmberCard>
  );
};

interface CriticalNodeCardProps {
  id: number;
  title: string;
  currentBid: number;
  totalBids: number;
  endTime: string;
  onExtend: () => void;
  onEnd: () => void;
}

const CriticalNodeCard: React.FC<CriticalNodeCardProps> = ({
  title,
  currentBid,
  totalBids,
  endTime,
  onExtend,
  onEnd,
}) => {
  const [timeStr, setTimeStr] = useState(formatTimeRemaining(endTime));

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeStr(formatTimeRemaining(endTime));
    }, 1000);
    return () => clearInterval(interval);
  }, [endTime]);

  const diff = new Date(endTime).getTime() - Date.now();
  const minutesLeft = diff / (1000 * 60);
  const isUrgent = minutesLeft <= 5;

  return (
    <div
      className={cn(
        'rounded-xl border p-3 transition-all',
        isUrgent
          ? 'border-danger/30 bg-danger/5'
          : 'border-warning/20 bg-warning/5',
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span
              className={cn(
                'w-2 h-2 rounded-full animate-pulse shrink-0',
                isUrgent ? 'bg-danger' : 'bg-warning',
              )}
            />
            <p className="text-xs font-bold text-zinc-text truncate">
              {title}
            </p>
          </div>
          <div className="flex items-center gap-3 mt-1.5 ml-4">
            <span className="text-sm font-black text-zinc-text tracking-tight">
              {Number(currentBid || 0).toLocaleString()} IQD
            </span>
            <span className="text-[10px] text-zinc-muted font-mono">
              {totalBids} bids
            </span>
          </div>
        </div>

        <div className="flex flex-col items-end gap-2 shrink-0">
          <span
            className={cn(
              'text-[10px] font-black font-mono uppercase tracking-wider flex items-center gap-1',
              isUrgent ? 'text-danger' : 'text-warning',
            )}
          >
            <Clock className="w-3 h-3" />
            {timeStr}
          </span>
          <div className="flex items-center gap-1.5">
            <button
              onClick={onExtend}
              className="flex items-center gap-1 px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-widest bg-warning/10 text-warning border border-warning/20 hover:bg-warning/20 transition-colors"
            >
              <ArrowUp className="w-2.5 h-2.5" />
              +15m
            </button>
            <button
              onClick={onEnd}
              className="flex items-center gap-1 px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-widest bg-danger/10 text-danger border border-danger/20 hover:bg-danger/20 transition-colors"
            >
              <Square className="w-2.5 h-2.5" />
              End
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
