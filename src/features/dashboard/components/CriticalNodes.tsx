import React, { useState, useEffect } from 'react';
import { Clock, AlertTriangle } from 'lucide-react';
import { AmberCard } from '@core/components/AmberCard';
import { cn } from '@core/lib/utils/cn';
import { useLanguage } from '@core/contexts/LanguageContext';
import { useCriticalAuctions } from '../../auctions/api/auction-hooks';

function formatTimeRemaining(endTime: string, now: number, t: (key: string) => string): string {
  const end = new Date(endTime).getTime();
  const diff = end - now;

  if (diff <= 0) return t('critical.ended');

  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  if (hours > 0) return `${hours}h ${minutes}m ${seconds}s`;
  if (minutes > 0) return `${minutes}m ${seconds}s`;
  return `${seconds}s`;
}

export const CriticalNodes: React.FC = () => {
  const { t } = useLanguage();
  const { data: auctions, isLoading } = useCriticalAuctions();

  const criticalAuctions = (auctions || []).slice(0, 3);

  // Single timer for all cards
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  if (isLoading) {
    return (
      <AmberCard className="border-warning/10 shadow-lg">
        <div className="flex items-center gap-2 mb-4 border-s-2 border-warning ps-3">
          <AlertTriangle className="w-3.5 h-3.5 text-warning" />
          <h3 className="text-xs font-black text-zinc-text uppercase tracking-[0.2em]">
            {t('critical.title')}
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
        <div className="flex items-center gap-2 mb-4 border-s-2 border-success ps-3">
          <Clock className="w-3.5 h-3.5 text-success" />
          <h3 className="text-xs font-black text-zinc-text uppercase tracking-[0.2em]">
            {t('critical.title')}
          </h3>
        </div>
        <div className="flex flex-col items-center justify-center py-6 text-center">
          <p className="text-sm text-zinc-muted/50 font-bold">
            {t('critical.empty')}
          </p>
          <p className="text-[10px] text-zinc-muted/30 uppercase tracking-widest mt-1">
            {t('critical.all_safe')}
          </p>
        </div>
      </AmberCard>
    );
  }

  return (
    <AmberCard className="border-warning/10 shadow-lg">
      <div className="flex items-center justify-between mb-4 border-s-2 border-warning ps-3">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-3.5 h-3.5 text-warning" />
          <h3 className="text-xs font-black text-zinc-text uppercase tracking-[0.2em]">
            {t('critical.title')}
          </h3>
        </div>
        <span className="text-[10px] text-warning font-mono uppercase tracking-widest">
          {criticalAuctions.length} {t('critical.ending_soon')}
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
            now={now}
          />
        ))}
      </div>
    </AmberCard>
  );
};

interface CriticalNodeCardProps {
  id: number;
  title: string;
  currentBid: number;
  totalBids: number;
  endTime: string;
  now: number;
}

const CriticalNodeCard: React.FC<CriticalNodeCardProps> = ({
  title,
  currentBid,
  totalBids,
  endTime,
  now,
}) => {
  const { t } = useLanguage();
  const timeStr = formatTimeRemaining(endTime, now, t);

  const diff = new Date(endTime).getTime() - now;
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
          <div className="flex items-center gap-3 mt-1.5 ms-4">
            <span className="text-sm font-black text-zinc-text tracking-tight">
              {Number(currentBid || 0).toLocaleString()} IQD
            </span>
            <span className="text-[10px] text-zinc-muted font-mono">
              {totalBids} {t('critical.bids')}
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
        </div>
      </div>
    </div>
  );
};
