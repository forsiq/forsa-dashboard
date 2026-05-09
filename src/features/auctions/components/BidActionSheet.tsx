import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Clock, Gavel, TrendingUp, ArrowUpRight } from 'lucide-react';
import { useRouter } from 'next/router';
import { useLanguage } from '@core/contexts/LanguageContext';
import { cn } from '@core/lib/utils/cn';
import { formatCurrency } from '@core/lib/utils/formatCurrency';
import { StatusBadge } from '@core/components/Data/StatusBadge';
import type { BidDisplayStatus } from '../types/auction.types';

interface BidActionSheetBid {
  id: number;
  auctionId: number;
  auctionTitle: string;
  auctionImage?: string;
  amount: number;
  currentBid?: number;
  displayStatus: BidDisplayStatus;
  endTime?: string;
  auctionStatus?: string;
}

interface BidActionSheetProps {
  isOpen: boolean;
  onClose: () => void;
  bid: BidActionSheetBid | null;
}

function getCountdown(endTimeStr: string, t: (key: string) => string | undefined): string {
  const end = new Date(endTimeStr);
  const diff = end.getTime() - Date.now();
  if (diff <= 0) return t('TIME.ENDED') || 'ENDED';
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${mins}m`;
  return `${mins}m`;
}

const STATUS_CONFIG: Record<BidDisplayStatus, { variant: 'success' | 'warning' | 'error' | 'info'; labelKey: string; fallback: string }> = {
  winning: { variant: 'success', labelKey: 'auction.bid_status.winning', fallback: 'Winning' },
  outbid: { variant: 'warning', labelKey: 'auction.bid_status.outbid', fallback: 'Outbid' },
  won: { variant: 'success', labelKey: 'auction.bid_status.won', fallback: 'Won' },
  lost: { variant: 'error', labelKey: 'auction.bid_status.lost', fallback: 'Lost' },
  active: { variant: 'info', labelKey: 'auction.bid_status.active', fallback: 'Active' },
  cancelled: { variant: 'error', labelKey: 'auction.bid_status.cancelled', fallback: 'Cancelled' },
};

export const BidActionSheet: React.FC<BidActionSheetProps> = ({ isOpen, onClose, bid }) => {
  const { t, dir } = useLanguage();
  const router = useRouter();
  const [currentTime, setCurrentTime] = useState(Date.now());

  useEffect(() => {
    if (!isOpen) return;
    const timer = setInterval(() => setCurrentTime(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  if (!bid) return null;

  const statusConfig = STATUS_CONFIG[bid.displayStatus] || STATUS_CONFIG.active;
  const isAuctionEnded = bid.auctionStatus === 'ended' || bid.auctionStatus === 'sold';
  const isEnded = bid.displayStatus === 'won' || bid.displayStatus === 'lost' || isAuctionEnded;

  const handleBidAgain = () => {
    onClose();
    router.push(`/auctions/${bid.auctionId}`);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-end justify-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />

          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="relative w-full max-w-lg bg-obsidian-card border-t border-white/10 rounded-t-2xl shadow-2xl"
            dir={dir}
          >
            {/* Handle bar */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full bg-white/20" />
            </div>

            {/* Close button */}
            <button
              onClick={onClose}
              className={cn(
                'absolute top-3 p-2 rounded-lg text-zinc-muted hover:text-zinc-text hover:bg-white/10 transition-colors',
                dir === 'rtl' ? 'left-3' : 'right-3'
              )}
            >
              <X className="w-5 h-5" />
            </button>

            <div className="px-6 pb-8 pt-2 space-y-5">
              {/* Header - Auction info */}
              <div className={cn('flex items-center gap-4', dir === 'rtl' && 'flex-row-reverse')}>
                <div className="w-14 h-14 rounded-xl bg-brand/10 border border-brand/20 flex items-center justify-center shrink-0 overflow-hidden">
                  {bid.auctionImage ? (
                    <img src={bid.auctionImage} alt="" className="w-full h-full object-cover rounded-xl" />
                  ) : (
                    <Gavel className="w-6 h-6 text-brand" />
                  )}
                </div>
                <div className={cn('flex-1 min-w-0', dir === 'rtl' ? 'text-right' : 'text-left')}>
                  <h3 className="text-base font-black text-zinc-text uppercase tracking-tight truncate">
                    {bid.auctionTitle}
                  </h3>
                  <p className="text-[10px] font-bold text-zinc-muted uppercase tracking-widest mt-0.5">
                    #{bid.auctionId}
                  </p>
                </div>
              </div>

              <div className="h-px bg-white/5" />

              {/* Status + Price row */}
              <div className={cn('flex items-center justify-between gap-4', dir === 'rtl' && 'flex-row-reverse')}>
                <div className={cn('space-y-1', dir === 'rtl' ? 'text-right' : 'text-left')}>
                  <p className="text-[10px] font-black text-zinc-muted uppercase tracking-widest">
                    {t('auction.sheet.your_status') || 'Your Status'}
                  </p>
                  <StatusBadge
                    status={t(statusConfig.labelKey) || statusConfig.fallback}
                    variant={statusConfig.variant}
                    size="md"
                  />
                </div>

                <div className={cn('space-y-1 text-right', dir === 'rtl' ? 'text-left' : 'text-right')}>
                  <p className="text-[10px] font-black text-zinc-muted uppercase tracking-widest">
                    {t('auction.sheet.your_bid') || 'Your Bid'}
                  </p>
                  <p className="text-xl font-black text-brand tabular-nums tracking-tight">
                    {formatCurrency(bid.amount)}
                  </p>
                </div>
              </div>

              {/* Current bid + Time remaining */}
              <div className="grid grid-cols-2 gap-3">
                {bid.currentBid != null && (
                  <div className={cn(
                    'flex items-center gap-2 px-4 py-3 rounded-xl',
                    'bg-obsidian-outer border border-white/5',
                    dir === 'rtl' && 'flex-row-reverse'
                  )}>
                    <TrendingUp className="w-4 h-4 text-success shrink-0" />
                    <div className={cn('min-w-0', dir === 'rtl' ? 'text-right' : 'text-left')}>
                      <p className="text-[9px] font-black text-zinc-muted uppercase tracking-widest">
                        {t('auction.sheet.current_bid') || 'Current Bid'}
                      </p>
                      <p className="text-sm font-black text-zinc-text tabular-nums">
                        {formatCurrency(bid.currentBid)}
                      </p>
                    </div>
                  </div>
                )}

                {bid.endTime && !isEnded && (
                  <div className={cn(
                    'flex items-center gap-2 px-4 py-3 rounded-xl',
                    'bg-obsidian-outer border border-white/5',
                    !bid.currentBid && bid.endTime ? 'col-span-2' : '',
                    dir === 'rtl' && 'flex-row-reverse'
                  )}>
                    <Clock className="w-4 h-4 text-warning shrink-0" />
                    <div className={cn('min-w-0', dir === 'rtl' ? 'text-right' : 'text-left')}>
                      <p className="text-[9px] font-black text-zinc-muted uppercase tracking-widest">
                        {t('auction.sheet.time_left') || 'Time Left'}
                      </p>
                      <p className="text-sm font-black text-warning tabular-nums">
                        {getCountdown(bid.endTime, t)}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className="h-px bg-white/5" />

              {/* Action button */}
              <button
                onClick={handleBidAgain}
                className={cn(
                  'w-full flex items-center justify-center gap-2',
                  'h-12 rounded-xl font-black uppercase tracking-widest text-sm',
                  'bg-brand text-black border-none',
                  'active:scale-[0.98] transition-all',
                  isEnded ? 'opacity-60' : ''
                )}
              >
                <ArrowUpRight className="w-4 h-4" />
                {isEnded
                  ? (t('auction.sheet.view_auction') || 'View Auction')
                  : (t('auction.sheet.bid_again') || 'Bid Again')
                }
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
