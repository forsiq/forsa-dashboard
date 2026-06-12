'use client';

import React from 'react';
import { Gavel } from 'lucide-react';
import { useLanguage } from '@core/contexts/LanguageContext';
import { cn } from '@core/lib/utils/cn';
import { formatCurrency } from '@core/lib/utils/formatCurrency';
import { useCountdown } from '@core/hooks/useCountdown';
import { StatusBadge, type StatusVariant } from '@core/components/Data/StatusBadge';
import { AuctionImage } from './AuctionImage';
import { WatchlistToggleButton } from './WatchlistToggleButton';
import type { Auction, AuctionStatus } from '../types/auction.types';

const STATUS_VARIANT_MAP: Record<string, StatusVariant> = {
  draft: 'inactive',
  scheduled: 'pending',
  active: 'active',
  paused: 'warning',
  ended: 'completed',
  cancelled: 'cancelled',
};

interface MobileAuctionCardProps {
  auction: Auction;
  onClick?: () => void;
  categoryMap?: Map<string, string>;
}

export const MobileAuctionCard: React.FC<MobileAuctionCardProps> = ({ auction, onClick, categoryMap }) => {
  const { t, dir } = useLanguage();
  const countdownLabel = useCountdown(auction.endTime);
  const isLive = auction.status === 'active';

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick?.();
    }
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      className={cn(
        'w-full text-start bg-obsidian-card rounded-xl border border-white/5 overflow-hidden',
        'hover:border-white/10 transition-all active:scale-[0.98]',
      )}
      dir={dir}
    >
      {/* Image section */}
      <div className="relative aspect-[4/3] w-full bg-obsidian-outer">
        <AuctionImage
          auction={auction}
          alt={auction.title}
          className="w-full h-full"
        />

        {/* Status badge - top left */}
        <div className="absolute top-2 start-2">
          <StatusBadge
            status={auction.status}
            variant={STATUS_VARIANT_MAP[auction.status] || 'info'}
            labelKey={`auction.status.${auction.status}`}
            size="sm"
            translate
          />
        </div>

        {/* Watchlist heart - top right */}
        <WatchlistToggleButton
          auctionId={auction.id}
          isWatched={auction.isWatched ?? false}
          variant="thumbnail"
        />
      </div>

      {/* Content section */}
      <div className="p-3 space-y-1.5">
        {/* Title */}
        <h3 className="text-sm font-bold text-zinc-text line-clamp-2 leading-tight">
          {auction.title}
        </h3>

        {/* Category */}
        {(categoryMap?.get(String(auction.categoryId)) || auction.categoryName) && (
          <p className="text-[10px] font-black text-zinc-muted uppercase tracking-widest">
            {categoryMap?.get(String(auction.categoryId)) || auction.categoryName}
          </p>
        )}

        {/* Price + Time */}
        <div className={cn('flex items-center justify-between gap-2', dir === 'rtl' && 'flex-row-reverse')}>
          <span className="text-sm font-black text-brand">
            {formatCurrency(auction.currentBid || auction.startPrice)}
          </span>
          {isLive && auction.endTime && (
            <span className="text-xs font-bold text-warning">
              {countdownLabel === 'ENDED' ? (t('TIME.ENDED') || 'ENDED') : countdownLabel}
            </span>
          )}
        </div>

        {/* Bids count + Status */}
        <div className={cn('flex items-center justify-between gap-2', dir === 'rtl' && 'flex-row-reverse')}>
          <span className="text-[10px] text-zinc-muted flex items-center gap-1">
            <Gavel className="w-3 h-3" />
            {auction.totalBids} {t('auction.bids') || 'bids'}
          </span>
          {isLive && (
            <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">
              {t('auction.status.live') || 'Live'}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
