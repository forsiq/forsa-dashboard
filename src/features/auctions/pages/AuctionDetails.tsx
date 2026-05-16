import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import {
  Clock,
  Users,
  DollarSign,
  ArrowLeft,
  Share2,
  TrendingUp,
  ShieldCheck,
  AlertCircle,
  History,
  Timer,
  Eye,
  Activity,
  Calendar,
  Gavel,
  User,
  Tag,
  Copy,
  FileText,
  ExternalLink
} from 'lucide-react';
import { useLanguage } from '@core/contexts/LanguageContext';
import { cn } from '@core/lib/utils/cn';
import { formatCurrency } from '@core/lib/utils/formatCurrency';
import { AmberCard as Card } from '@core/components/AmberCard';
import { AmberButton } from '@core/components/AmberButton';
import { AmberInput } from '@core/components/AmberInput';
import { StatusBadge } from '@core/components/Data/StatusBadge';
import { useGetAuction, useGetAuctionBids, usePlaceBid, useStartAuction, usePauseAuction, useResumeAuction, useEndAuction, useCancelAuction } from '../api';
import { useConfirmModal } from '@core/components/Feedback/AmberConfirmModal';
import { AuctionImage } from '../components/AuctionImage';
import { AmberImageGallery } from '@core/components/AmberImageGallery';
import { getAuctionImageUrls } from '../utils/auction-utils';
import { isSafePathResourceId } from '@core/utils/safeRouteId';
import { DetailPageSkeleton } from '@core/loading';
import { useRouteParam } from '@core/hooks/useRouteParam';

/**
 * AuctionDetails - Unified Detail Layout
 */
export const AuctionDetails: React.FC = () => {
  const router = useRouter();
  const { t, dir } = useLanguage();
  const isRTL = dir === 'rtl';

  const auctionId = useRouteParam('id', { parse: 'number' });
  const { data: auction, isPending: auctionLoading } = useGetAuction(auctionId!, !!auctionId);
  const { data: bidsResponse } = useGetAuctionBids(auctionId!);
  const bids = bidsResponse?.data || [];
  const placeBid = usePlaceBid();
  const startAuction = useStartAuction();
  const pauseAuction = usePauseAuction();
  const resumeAuction = useResumeAuction();
  const endAuction = useEndAuction();
  const cancelAuction = useCancelAuction();
  const { openConfirm, ConfirmModal } = useConfirmModal();

  const [bidAmount, setBidAmount] = useState<string>('');
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handlePlaceBid = async () => {
    const amount = parseFloat(bidAmount);
    const minBid = currentBid || startPrice;
    if (amount && amount > minBid) {
      try {
        await placeBid.mutateAsync({ auctionId, amount });
        setBidAmount('');
      } catch (err) {
        console.error('Bid failed:', err);
      }
    }
  };

  const getCountdown = (endTimeStr: string) => {
    if (!endTimeStr) return 'TBD';
    const end = new Date(endTimeStr);
    const diff = end.getTime() - currentTime.getTime();
    if (diff <= 0) return t('TIME.ENDED') || 'ENDED';
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const secs = Math.floor((diff % (1000 * 60)) / 1000);
    if (days > 0) return `${days}d ${hours}h ${mins}m`;
    return `${hours}:${mins}:${secs < 10 ? '0' + secs : secs}`;
  };

  if (!auctionId || auctionLoading || !router.isReady) {
    return <DetailPageSkeleton />;
  }

  if (!auction) {
    return (
      <Card className="max-w-2xl mx-auto !p-12 text-center space-y-6 bg-obsidian-card border-danger/20">
        <AlertCircle className="w-16 h-16 text-danger mx-auto" />
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-zinc-text tracking-tighter">{t('auction.detail.node_not_found')}</h2>
          <p className="text-zinc-muted font-semibold tracking-tight text-sm">{t('auction.detail.not_found_text')}</p>
        </div>
        <AmberButton onClick={() => router.push('/auctions')} variant="secondary" className="px-8 h-12 uppercase font-bold">
          {t('common.back') || 'Back'}
        </AmberButton>
      </Card>
    );
  }

  const currentBid = Number(auction.currentBid) || 0;
  const startPrice = Number(auction.startPrice) || 0;
  const bidIncrement = Number(auction.bidIncrement) || 0;
  const nextMinBid = (currentBid || startPrice) + bidIncrement;
  const isEndingSoon = new Date(auction.endTime).getTime() - currentTime.getTime() < 1000 * 60 * 30;

  // Detail rows data
  const detailRows = [
    { icon: DollarSign, label: currentBid > 0 ? (t('auction.detail.current_bid') || 'Current Bid') : (t('auction.detail.start_price') || 'Start Price'), value: formatCurrency(currentBid || startPrice) },
    { icon: Calendar, label: t('auction.detail.temporal_start') || 'Start', value: new Date(auction.startTime).toLocaleString() },
    { icon: Clock, label: t('auction.detail.node_termination') || 'End', value: new Date(auction.endTime).toLocaleString() },
    { icon: TrendingUp, label: t('auction.detail.progression_delta') || 'Bid Increment', value: formatCurrency(bidIncrement) },
    { icon: Tag, label: t('auction.detail.category'), value: auction.categoryName || t('auction.detail.general') },
    { icon: User, label: t('auction.detail.winner'), value: auction.winnerName || t('auction.detail.no_winner') },
  ];

  if (auction.reservePrice != null && Number(auction.reservePrice) > 0) {
    detailRows.push({ icon: ShieldCheck, label: t('auction.detail.reserve_price') || 'Reserve Price', value: formatCurrency(auction.reservePrice) });
  }

  if (auction.createdAt) {
    detailRows.push({ icon: History, label: t('auction.detail.created_at') || 'Created At', value: new Date(auction.createdAt).toLocaleString() });
  }

  return (
    <div className="max-w-[1600px] mx-auto p-6 space-y-6 animate-in fade-in duration-700" dir={dir}>
      {/* Header */}
      <div className="flex w-full min-w-0 flex-col gap-4 lg:flex-row lg:items-start">
        <div className="flex min-w-0 w-full flex-1 items-center gap-4">
          <button
            type="button"
            onClick={() => router.push('/auctions')}
            className="h-10 w-10 shrink-0 rounded-lg bg-obsidian-card border border-white/5 flex items-center justify-center text-zinc-muted hover:text-brand hover:border-brand/30 transition-all active:scale-95"
          >
            <ArrowLeft className={cn("w-4 h-4", isRTL && "rotate-180")} />
          </button>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <StatusBadge
                status={t(`auction.status.${auction.status.toLowerCase()}`) || auction.status}
                variant={auction.status === 'active' ? 'success' : auction.status === 'ended' ? 'failed' : 'warning'}
                size="sm"
              />
              <span className="text-[10px] font-semibold text-zinc-muted tracking-widest">#{auction.id}</span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-bold text-zinc-text tracking-tight leading-tight mt-1 min-w-0 break-words lg:truncate">
              {auction.title}
            </h1>
          </div>
        </div>
        <div
          className={cn(
            'flex w-full min-w-0 flex-wrap items-center gap-2',
            isRTL ? 'justify-end' : 'justify-start',
            'lg:ms-auto lg:w-auto lg:shrink-0 lg:flex-nowrap',
          )}
        >
          {/* Lifecycle Buttons */}
          {auction?.status === 'draft' || auction?.status === 'scheduled' ? (
            <AmberButton
              className="h-10 bg-emerald-600 text-white font-bold uppercase tracking-wider rounded-lg px-6 hover:bg-emerald-700 active:scale-95 transition-all border-none text-xs"
              onClick={() => openConfirm({
                title: t('auction.lifecycle.start_title') || 'Start Auction',
                message: t('auction.lifecycle.start_confirm') || 'Are you sure you want to start this auction?',
                onConfirm: () => startAuction.mutate(auction.id),
                variant: 'success',
              })}
              disabled={startAuction.isPending}
            >
              {startAuction.isPending ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Gavel className="w-3.5 h-3.5 me-1.5" />}
              {t('auction.lifecycle.start') || 'Start'}
            </AmberButton>
          ) : null}
          {auction?.status === 'active' ? (
            <>
              <AmberButton
                className="h-10 bg-yellow-600 text-white font-bold uppercase tracking-wider rounded-lg px-6 hover:bg-yellow-700 active:scale-95 transition-all border-none text-xs"
                onClick={() => openConfirm({
                  title: t('auction.lifecycle.pause_title') || 'Pause Auction',
                  message: t('auction.lifecycle.pause_confirm') || 'Are you sure you want to pause this auction?',
                  onConfirm: () => pauseAuction.mutate(auction.id),
                  variant: 'warning',
                })}
                disabled={pauseAuction.isPending}
              >
                {t('auction.lifecycle.pause') || 'Pause'}
              </AmberButton>
              <AmberButton
                className="h-10 bg-red-600 text-white font-bold uppercase tracking-wider rounded-lg px-6 hover:bg-red-700 active:scale-95 transition-all border-none text-xs"
                onClick={() => openConfirm({
                  title: t('auction.lifecycle.end_title') || 'End Auction',
                  message: t('auction.lifecycle.end_confirm') || 'Are you sure you want to end this auction?',
                  onConfirm: () => endAuction.mutate(auction.id),
                  variant: 'danger',
                })}
                disabled={endAuction.isPending}
              >
                {t('auction.lifecycle.end') || 'End'}
              </AmberButton>
            </>
          ) : null}
          {auction?.status === 'paused' ? (
            <AmberButton
              className="h-10 bg-emerald-600 text-white font-bold uppercase tracking-wider rounded-lg px-6 hover:bg-emerald-700 active:scale-95 transition-all border-none text-xs"
              onClick={() => openConfirm({
                title: t('auction.lifecycle.resume_title') || 'Resume Auction',
                message: t('auction.lifecycle.resume_confirm') || 'Are you sure you want to resume this auction?',
                onConfirm: () => resumeAuction.mutate(auction.id),
                variant: 'success',
              })}
              disabled={resumeAuction.isPending}
            >
              {t('auction.lifecycle.resume') || 'Resume'}
            </AmberButton>
          ) : null}
          {!['ended', 'sold', 'cancelled'].includes(auction?.status) ? (
            <AmberButton
              className="h-10 bg-obsidian-card border border-white/10 text-zinc-muted font-bold uppercase tracking-wider rounded-lg px-6 hover:text-danger hover:border-danger/30 active:scale-95 transition-all text-xs"
              onClick={() => openConfirm({
                title: t('auction.lifecycle.cancel_title') || 'Cancel Auction',
                message: t('auction.lifecycle.cancel_confirm') || 'Are you sure you want to cancel this auction? This action cannot be undone.',
                onConfirm: () => cancelAuction.mutate(auction.id),
                variant: 'danger',
              })}
              disabled={cancelAuction.isPending}
            >
              {t('auction.lifecycle.cancel') || 'Cancel'}
            </AmberButton>
          ) : null}

          <button className="w-10 h-10 rounded-lg bg-obsidian-card border border-white/5 flex items-center justify-center text-zinc-muted hover:text-zinc-text hover:border-white/10 transition-all">
            <Share2 className="w-4 h-4" />
          </button>
          <AmberButton className="h-10 bg-obsidian-card border border-white/10 text-zinc-muted font-bold uppercase tracking-wider rounded-lg px-6 hover:text-brand hover:border-brand/30 active:scale-95 transition-all text-xs gap-1.5" onClick={() => {
            if (!isSafePathResourceId(auction.id)) return;
            void router.push(`/auctions/clone/${auction.id}`);
          }}>
              <Copy className="w-3.5 h-3.5" />
              {t('auction.detail.clone') || 'Clone'}
          </AmberButton>
          <AmberButton className="h-10 bg-brand text-black font-bold uppercase tracking-wider rounded-lg px-6 hover:bg-brand/90 active:scale-95 transition-all border-none text-xs" onClick={() => {
            if (!isSafePathResourceId(auction.id)) return;
            void router.push(`/auctions/edit/${auction.id}`);
          }}>
              {t('common.edit') || 'Edit'}
          </AmberButton>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Image + Bids */}
        <div className="lg:col-span-2 space-y-6">

          {/* Image Gallery */}
          <AmberImageGallery
            images={getAuctionImageUrls(auction)}
            alt={auction.title}
            height="h-[300px] lg:h-[460px]"
            overlay={
              <>
                <div className="absolute top-4 start-4 flex items-center gap-2">
                  <div className="bg-black/50 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded-lg flex items-center gap-2">
                    <Eye className="w-3.5 h-3.5 text-brand" />
                    <span className="text-[10px] font-semibold text-white tracking-wider">{t('auction.detail.live_monitoring') || 'Live'}</span>
                  </div>
                </div>
                <div className="absolute bottom-0 inset-x-0 p-6 bg-gradient-to-t from-black/90 via-black/40 to-transparent">
                  <span className="text-[10px] font-semibold text-brand tracking-widest">{auction.categoryName || t('auction.detail.general')}</span>
                  <h2 className="text-lg font-bold text-white leading-snug line-clamp-2 mt-1">{auction.description}</h2>
                </div>
              </>
            }
          />

          {/* Bid History */}
          <div className="bg-[var(--color-obsidian-card)] border border-white/5 rounded-xl p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                  <History className="w-4 h-4" />
                </div>
                <h3 className="text-xs font-bold text-zinc-text uppercase tracking-widest">{t('auction.detail.high_frequency_telemetry') || 'Bid History'}</h3>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-end">
                  <span className="text-[10px] font-semibold text-zinc-muted tracking-widest">{currentBid > 0 ? (t('auction.detail.current_bid') || 'Current Bid') : (t('auction.detail.start_price') || 'Start Price')}</span>
                  <p className="text-lg font-bold text-brand leading-none mt-0.5 tabular-nums">{formatCurrency(currentBid || startPrice)}</p>
                </div>
                <div className="w-px h-8 bg-white/5" />
                <div className="text-end">
                  <span className="text-[10px] font-semibold text-zinc-muted tracking-widest">{t('auction.detail.total_bids')}</span>
                  <p className="text-lg font-bold text-zinc-text leading-none mt-0.5">{auction.totalBids || 0}</p>
                </div>
              </div>
            </div>

            {!bidsResponse ? (
              <div className="py-12 text-center">
                <div className="w-6 h-6 border-2 border-brand border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-[10px] text-zinc-muted font-semibold tracking-widest mt-3">{t('auction.detail.loading')}</p>
              </div>
            ) : bids?.length === 0 ? (
              <div className="py-12 text-center space-y-3 bg-white/[0.02] rounded-xl border border-dashed border-white/5">
                <Activity className="w-10 h-10 text-zinc-muted/20 mx-auto" />
                <p className="text-xs font-semibold text-zinc-muted tracking-widest">{t('auction.detail.no_interactions') || 'No bids yet'}</p>
              </div>
            ) : (
              <div className="space-y-3">
                {bids?.map((bid, index) => (
                  <div
                    key={bid.id}
                    className={cn(
                      "flex items-center justify-between p-4 rounded-xl border transition-all hover:bg-white/[0.02]",
                      index === 0 ? "bg-brand/5 border-brand/10" : "bg-obsidian-panel/30 border-white/5"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-10 h-10 rounded-full border flex items-center justify-center text-sm font-bold",
                        index === 0 ? "bg-brand text-black border-none" : "bg-obsidian-outer border-white/10 text-zinc-text"
                      )}>
                        {bid.bidderName?.[0] || 'A'}
                      </div>
                      <div>
                        <span className="text-sm font-bold text-zinc-text tracking-tight">{bid.bidderName || t('auction.detail.anonymous') || 'Anonymous'}</span>
                        <div className="flex items-center gap-1.5 text-[10px] font-semibold text-zinc-muted tracking-widest mt-0.5">
                          <Clock className="w-3 h-3" />
                          {new Date(bid.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>
                    <div className="text-end">
                      <span className="text-lg font-bold text-zinc-text tracking-tight tabular-nums">
                        {formatCurrency(bid.amount)}
                      </span>
                      <p className="text-[10px] font-semibold text-brand tracking-widest mt-0.5">#{bids.length - index}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Specifications */}
          {auction.specs && auction.specs.length > 0 && (
            <div className="bg-[var(--color-obsidian-card)] border border-white/5 rounded-xl p-6 space-y-5">
              <div className="flex items-center gap-2.5 border-b border-white/5 pb-4">
                <div className="w-8 h-8 rounded-lg bg-violet-500/10 flex items-center justify-center text-violet-400">
                  <FileText className="w-4 h-4" />
                </div>
                <h3 className="text-xs font-bold text-zinc-text uppercase tracking-widest">{t('auction.detail.specifications') || 'Specifications'}</h3>
              </div>
              <div className="space-y-0">
                {auction.specs.map((spec, i) => (
                  <div key={i} className={cn(
                    "flex items-center justify-between py-3 gap-4",
                    i < auction.specs!.length - 1 && "border-b border-white/5"
                  )}>
                    <span className="text-xs font-semibold text-zinc-muted tracking-wide">{spec.label}</span>
                    <span className="text-sm font-bold text-zinc-text text-end">{spec.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Sources & References */}
          {auction.sources && auction.sources.length > 0 && (
            <div className="bg-[var(--color-obsidian-card)] border border-white/5 rounded-xl p-6 space-y-5">
              <div className="flex items-center gap-2.5 border-b border-white/5 pb-4">
                <div className="w-8 h-8 rounded-lg bg-sky-500/10 flex items-center justify-center text-sky-400">
                  <ExternalLink className="w-4 h-4" />
                </div>
                <h3 className="text-xs font-bold text-zinc-text uppercase tracking-widest">{t('auction.detail.sources') || 'Sources & References'}</h3>
              </div>
              <div className="space-y-2">
                {auction.sources.map((source, i) => (
                  <a
                    key={i}
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 rounded-xl bg-obsidian-panel/30 border border-white/5 hover:border-brand/20 hover:bg-brand/5 transition-all group"
                  >
                    <div className={cn(
                      "w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold",
                      source.type === 'youtube' ? 'bg-red-500/10 text-red-400' :
                      source.type === 'alibaba' ? 'bg-orange-500/10 text-orange-400' :
                      source.type === 'aws' ? 'bg-amber-500/10 text-amber-400' :
                      'bg-sky-500/10 text-sky-400'
                    )}>
                      {source.type === 'youtube' ? 'YT' :
                       source.type === 'alibaba' ? 'AB' :
                       source.type === 'aws' ? 'AW' : 'LK'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-sm font-bold text-zinc-text tracking-tight group-hover:text-brand transition-colors">{source.label}</span>
                      <p className="text-[10px] text-zinc-muted truncate mt-0.5">{source.url}</p>
                    </div>
                    <ExternalLink className="w-3.5 h-3.5 text-zinc-muted group-hover:text-brand transition-colors shrink-0" />
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Bidding + Info */}
        <div className="space-y-6">

          {/* Bidding Panel */}
          <div className="bg-[var(--color-obsidian-card)] border border-white/5 rounded-xl p-6 space-y-5 relative overflow-hidden">
            {isEndingSoon && <div className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-transparent via-danger to-transparent" />}

            {/* Price + Timer */}
            <div className="flex flex-row items-end justify-between gap-3 pb-4 border-b border-white/5">
              <div className="space-y-1 min-w-0 flex-1">
                <span className="text-[10px] font-semibold text-zinc-muted tracking-widest">
                  {currentBid > 0 ? (t('auction.detail.current_bid') || 'Current Bid') : (t('auction.detail.start_price') || 'Start Price')}
                </span>
                <p className="text-2xl sm:text-3xl font-bold text-brand tabular-nums leading-none tracking-tight">
                  {formatCurrency(currentBid || startPrice)}
                </p>
              </div>
              <div className="space-y-1 text-end min-w-0 flex-1">
                <span className="text-[10px] font-semibold text-zinc-muted tracking-widest">{t('auction.table.protocol_duration') || 'Time Left'}</span>
                <p className={cn(
                  "text-xl sm:text-2xl font-bold tabular-nums leading-none tracking-tight",
                  isEndingSoon ? "text-danger animate-pulse" : "text-warning"
                )}>
                  {getCountdown(auction.endTime)}
                </p>
              </div>
            </div>

            {/* Bid Input */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-semibold text-zinc-muted tracking-widest">{t('auction.detail.base_progression') || 'Your Bid'}</label>
                <span className="text-[10px] font-semibold text-zinc-muted tracking-wider">Min: {formatCurrency(nextMinBid)}</span>
              </div>
              <div className="relative group">
                <DollarSign className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-muted group-focus-within:text-brand transition-colors" />
                <AmberInput
                  type="number"
                  placeholder={`${nextMinBid.toLocaleString()}+`}
                  className="h-11 bg-obsidian-outer border-white/5 ps-9 pe-4 text-base font-bold tabular-nums placeholder:text-zinc-muted/30"
                  value={bidAmount}
                  onChange={(e) => setBidAmount(e.target.value)}
                  disabled={auction.status !== 'active' || placeBid.isPending}
                />
              </div>

              <AmberButton
                className="w-full h-11 bg-brand hover:bg-brand text-black font-bold uppercase tracking-wider rounded-xl active:scale-95 transition-all text-xs"
                disabled={auction.status !== 'active' || placeBid.isPending || !bidAmount || parseFloat(bidAmount) < nextMinBid}
                onClick={handlePlaceBid}
              >
                {placeBid.isPending ? (
                  <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin mx-auto" />
                ) : (
                  t('auction.detail.authorize_bid') || 'Place Bid'
                )}
              </AmberButton>
            </div>

            {/* Trust */}
            <div className="flex items-center gap-2.5 p-3 rounded-lg bg-obsidian-panel/40 border border-white/5">
              <ShieldCheck className="w-4 h-4 text-zinc-muted shrink-0" />
              <span className="text-[10px] font-semibold text-zinc-muted tracking-wider">{t('auction.detail.encrypted_infrastructure') || 'Secure Transaction'}</span>
            </div>
          </div>

          {/* Info Panel */}
          <div className="bg-[var(--color-obsidian-card)] border border-white/5 rounded-xl p-6 space-y-4">
            <div className="flex items-center gap-2.5 border-b border-white/5 pb-4">
              <div className="w-8 h-8 rounded-lg bg-brand/10 flex items-center justify-center text-brand">
                <Gavel className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-zinc-text uppercase tracking-widest">{t('auction.detail.infrastructure_logistics') || 'Details'}</h3>
            </div>

            <div className="space-y-3.5">
              {detailRows.map((item, i) => (
                <div key={i} className="flex items-start justify-between gap-3 group/row">
                  <div className="flex items-center gap-2.5 shrink-0">
                    <item.icon className="w-4 h-4 text-zinc-muted group-hover/row:text-brand transition-colors" />
                    <span className="text-xs font-semibold text-zinc-muted tracking-wide">{item.label}</span>
                  </div>
                  <span className="text-sm font-bold text-zinc-text text-end break-words">{item.value}</span>
                </div>
              ))}
            </div>

            <AmberButton variant="outline" className="w-full gap-2 font-bold uppercase tracking-wider text-[10px] h-9 bg-obsidian-panel border-white/5 active:scale-95 transition-all rounded-xl mt-2">
              {t('auction.detail.download_manifest') || 'Download Report'}
            </AmberButton>
          </div>
        </div>
      </div>
      <ConfirmModal />
    </div>
  );
};

export default AuctionDetails;
