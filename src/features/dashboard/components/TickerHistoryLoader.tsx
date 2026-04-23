import React from 'react';
import { Gavel } from 'lucide-react';
import { AmberCard } from '@core/components/AmberCard';
import { useTickerHistory } from '../../auctions/api/auction-hooks';
import { cn } from '@core/lib/utils/cn';

export const TickerHistoryLoader: React.FC = () => {
  const { data: history, isLoading } = useTickerHistory(50);

  return (
    <AmberCard className="border-white/5 shadow-lg bg-obsidian-panel/80 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4 border-l-2 border-brand pl-3">
        <div className="flex items-center gap-2">
          <h3 className="text-xs font-black text-zinc-text uppercase tracking-[0.2em]">
            Recent Bids
          </h3>
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest bg-warning/10 text-warning border border-warning/20">
            Loading...
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-2 pr-1 min-h-0 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent"
        style={{ maxHeight: 'calc(100vh - 380px)' }}
      >
        {isLoading ? (
          <div className="flex items-center justify-center h-40">
            <div className="w-8 h-8 border-3 border-brand border-t-transparent rounded-full animate-spin" />
          </div>
        ) : !history || history.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-center">
            <Gavel className="w-8 h-8 text-zinc-muted/30 mb-3" />
            <p className="text-sm text-zinc-muted/50 font-bold">
              No recent bids
            </p>
            <p className="text-[10px] text-zinc-muted/30 uppercase tracking-widest mt-1">
              Connect to see live events
            </p>
          </div>
        ) : (
          history.map((item, idx) => (
            <div
              key={`${item.bidId}-${idx}`}
              className="flex items-center gap-3 p-3 rounded-xl border bg-success/5 border-success/10"
            >
              <div className="shrink-0 p-1.5 rounded-lg bg-white/5">
                <Gavel className="w-3.5 h-3.5 text-success" />
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-zinc-text truncate">
                  {item.auctionTitle || `Auction #${item.auctionId}`}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-sm font-black text-zinc-text tracking-tight">
                    {Number(item.amount).toLocaleString()} IQD
                  </span>
                  {item.bidderId && (
                    <span className="text-[10px] text-zinc-muted/60 font-mono">
                      by {item.bidderId.slice(0, 8)}...
                    </span>
                  )}
                </div>
              </div>

              <span className="shrink-0 text-[9px] text-zinc-muted/40 font-mono uppercase tracking-wider">
                {new Date(item.timestamp).toLocaleTimeString()}
              </span>
            </div>
          ))
        )}
      </div>
    </AmberCard>
  );
};
