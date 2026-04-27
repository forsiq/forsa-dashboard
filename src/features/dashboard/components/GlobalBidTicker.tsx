import React, { useRef, useState, useEffect } from 'react';
import {
  Gavel,
  Trophy,
  XCircle,
  AlertTriangle,
  ArrowUp,
} from 'lucide-react';
import { AmberCard } from '@core/components/AmberCard';
import { cn } from '@core/lib/utils/cn';
import { useLanguage } from '@core/contexts/LanguageContext';
import type { TickerEvent } from '../../bidding/types/ticker.types';

interface GlobalBidTickerProps {
  events: TickerEvent[];
  isConnected: boolean;
  onClear: () => void;
}

const eventTypeConfig: Record<
  string,
  {
    icon: React.ComponentType<{ className?: string }>;
    color: string;
    bg: string;
    border: string;
    labelKey: string;
  }
> = {
  bid_placed: {
    icon: Gavel,
    color: 'text-success',
    bg: 'bg-success/5',
    border: 'border-success/10',
    labelKey: 'live.bid',
  },
  auction_sold: {
    icon: Trophy,
    color: 'text-brand',
    bg: 'bg-brand/5',
    border: 'border-brand/10',
    labelKey: 'live.sold',
  },
  auction_ended: {
    icon: XCircle,
    color: 'text-danger',
    bg: 'bg-danger/5',
    border: 'border-danger/10',
    labelKey: 'live.ended',
  },
  auction_ending: {
    icon: AlertTriangle,
    color: 'text-warning',
    bg: 'bg-warning/5',
    border: 'border-warning/10',
    labelKey: 'live.ending',
  },
  auction_cancelled: {
    icon: XCircle,
    color: 'text-zinc-muted',
    bg: 'bg-white/5',
    border: 'border-white/5',
    labelKey: 'live.cancelled',
  },
  auction_updated: {
    icon: ArrowUp,
    color: 'text-info',
    bg: 'bg-info/5',
    border: 'border-info/10',
    labelKey: 'live.updated',
  },
};

function formatTimeAgo(timestamp: string, t: (key: string) => string): string {
  const now = Date.now();
  const then = new Date(timestamp).getTime();
  const diffMs = now - then;
  const diffSec = Math.floor(diffMs / 1000);

  if (diffSec < 5) return t('live.justNow');
  if (diffSec < 60) return `${diffSec}${t('live.ago')}`;
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ${t('live.ago')}`;
  const diffHr = Math.floor(diffMin / 60);
  return `${diffHr}h ${t('live.ago')}`;
}

function maskBidderId(id?: string): string {
  if (!id) return 'Anonymous';
  if (id.length <= 8) return id;
  return `${id.slice(0, 4)}...${id.slice(-4)}`;
}

export const GlobalBidTicker: React.FC<GlobalBidTickerProps> = ({
  events,
  isConnected,
  onClear,
}) => {
  const { t } = useLanguage();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!isPaused && scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
  }, [events.length, isPaused]);

  return (
    <AmberCard className="border-white/5 shadow-lg bg-obsidian-panel/80 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 border-s-2 border-brand ps-3">
        <div className="flex items-center gap-2">
          <h3 className="text-xs font-black text-zinc-text uppercase tracking-[0.2em]">
            {t('live.liveBidTicker')}
          </h3>
          <span
            className={cn(
              'inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest',
              isConnected
                ? 'bg-success/10 text-success border border-success/20'
                : 'bg-danger/10 text-danger border border-danger/20',
            )}
          >
            <span
              className={cn(
                'w-1.5 h-1.5 rounded-full',
                isConnected ? 'bg-success animate-pulse' : 'bg-danger',
              )}
            />
            {isConnected ? t('live.liveStatus') : t('live.offline')}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsPaused(!isPaused)}
            className={cn(
              'text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-lg transition-colors',
              isPaused
                ? 'text-warning bg-warning/10 hover:bg-warning/20'
                : 'text-zinc-muted hover:text-zinc-text',
            )}
          >
            {isPaused ? t('live.paused') : t('live.pause')}
          </button>
          <button
            onClick={onClear}
            className="text-[10px] font-black uppercase tracking-widest text-zinc-muted hover:text-zinc-text px-2 py-1 rounded-lg transition-colors"
          >
            {t('live.clear')}
          </button>
        </div>
      </div>

      {/* Ticker Feed */}
      <div
        ref={scrollRef}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        className="flex-1 overflow-y-auto space-y-2 pe-1 min-h-0 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent"
        style={{ maxHeight: 'calc(100vh - 380px)' }}
      >
        {events.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-center">
            <Gavel className="w-8 h-8 text-zinc-muted/30 mb-3" />
            <p className="text-sm text-zinc-muted/50 font-bold">
              {t('live.waitingForBids')}
            </p>
            <p className="text-[10px] text-zinc-muted/30 uppercase tracking-widest mt-1">
              {t('live.eventsWillAppear')}
            </p>
          </div>
        ) : (
          events.map((event, idx) => {
            const config = eventTypeConfig[event.type] || eventTypeConfig.bid_placed;
            const Icon = config.icon;

            return (
              <div
                key={`${event.auctionId}-${event.timestamp}-${idx}`}
                className={cn(
                  'flex items-center gap-3 p-3 rounded-xl border transition-all',
                  config.bg,
                  config.border,
                  idx === 0 && 'animate-in fade-in slide-in-from-top-2 duration-300',
                )}
              >
                <div
                  className={cn(
                    'shrink-0 p-1.5 rounded-lg bg-white/5',
                  )}
                >
                  <Icon className={cn('w-3.5 h-3.5', config.color)} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        'text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded',
                        config.bg,
                        config.color,
                      )}
                    >
                      {t(config.labelKey)}
                    </span>
                    <p className="text-xs font-bold text-zinc-text truncate">
                      {event.auctionTitle || `Auction #${event.auctionId}`}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 mt-1">
                    {event.amount !== undefined && (
                      <span className="text-sm font-black text-zinc-text tracking-tight">
                        {event.amount.toLocaleString()} IQD
                      </span>
                    )}
                    {event.previousBid !== undefined && event.previousBid > 0 && (
                      <span className="text-[10px] text-zinc-muted font-mono">
                        {t('live.from')} {event.previousBid.toLocaleString()}
                      </span>
                    )}
                    {event.bidderId && (
                      <span className="text-[10px] text-zinc-muted/60 font-mono">
                        {t('live.by')} {maskBidderId(event.bidderId)}
                      </span>
                    )}
                    {event.minutesLeft !== undefined && (
                      <span className="text-[10px] text-warning font-bold">
                        {event.minutesLeft}m {t('live.left')}
                      </span>
                    )}
                  </div>
                </div>

                <span className="shrink-0 text-[9px] text-zinc-muted/40 font-mono uppercase tracking-wider">
                  {formatTimeAgo(event.timestamp, t)}
                </span>
              </div>
            );
          })
        )}
      </div>

      {/* Footer */}
      {events.length > 0 && (
        <div className="flex items-center justify-between pt-3 mt-3 border-t border-white/5">
          <span className="text-[10px] text-zinc-muted/50 font-mono uppercase tracking-widest">
            {events.length} {t('live.events')}
          </span>
        </div>
      )}
    </AmberCard>
  );
};
