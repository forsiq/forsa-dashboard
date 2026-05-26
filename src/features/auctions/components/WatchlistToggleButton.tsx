import React from 'react';
import { Heart } from 'lucide-react';
import { useLanguage } from '@core/contexts/LanguageContext';
import { cn } from '@core/lib/utils/cn';
import { useToggleWatch } from '../api';

export type WatchlistToggleVariant = 'toolbar' | 'thumbnail';

interface WatchlistToggleButtonProps {
  auctionId: number;
  isWatched: boolean;
  variant?: WatchlistToggleVariant;
  className?: string;
  onClick?: (e: React.MouseEvent) => void;
}

export const WatchlistToggleButton: React.FC<WatchlistToggleButtonProps> = ({
  auctionId,
  isWatched,
  variant = 'toolbar',
  className,
  onClick,
}) => {
  const { t } = useLanguage();
  const toggleWatch = useToggleWatch();

  const title = isWatched
    ? t('auction.watchlist.remove')
    : t('auction.watchlist.add');

  const handleClick = (e: React.MouseEvent) => {
    onClick?.(e);
    if (e.defaultPrevented) return;
    toggleWatch.mutate({ auctionId, isLiked: isWatched });
  };

  const iconClass = cn(
    variant === 'thumbnail' ? 'w-3 h-3' : 'w-4 h-4',
    isWatched ? 'fill-red-400 text-red-400' : undefined,
  );

  const buttonClass =
    variant === 'thumbnail'
      ? cn(
          'absolute top-0.5 end-0.5 p-1 rounded-full transition-all',
          isWatched
            ? 'bg-red-500/30 text-red-400'
            : 'bg-black/40 text-zinc-muted hover:bg-black/60 hover:text-red-400',
          toggleWatch.isPending && 'opacity-60 pointer-events-none',
          className,
        )
      : cn(
          'w-10 h-10 rounded-lg flex items-center justify-center transition-all',
          isWatched
            ? 'bg-red-500/10 border border-red-400/40 text-red-400 hover:border-red-400/60'
            : 'bg-obsidian-card border border-white/5 text-zinc-muted hover:text-red-400 hover:border-red-400/30',
          toggleWatch.isPending && 'opacity-60 pointer-events-none',
          className,
        );

  return (
    <button
      type="button"
      className={buttonClass}
      onClick={handleClick}
      title={title}
      aria-label={title}
      aria-pressed={isWatched}
      disabled={toggleWatch.isPending}
    >
      <Heart className={iconClass} />
    </button>
  );
};
