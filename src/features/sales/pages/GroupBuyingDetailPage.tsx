import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import {
  Users,
  Clock,
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
  Zap,
  Target,
  Package,
  Lock,
  Unlock,
  Play,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { useLanguage } from '@core/contexts/LanguageContext';
import { cn } from '@core/lib/utils/cn';
import { formatCurrency } from '@core/lib/utils/formatCurrency';
import { AmberCard as Card } from '@core/components/AmberCard';
import { AmberButton } from '@core/components/AmberButton';
import { AmberProgress } from '@core/components/AmberProgress';
import { StatusBadge } from '@core/components/Data/StatusBadge';
import {
  useGetGroupBuying,
  useGetGroupBuyingParticipants,
  useJoinGroupBuying,
  useCancelGroupBuying,
  useStartGroupBuying,
  useCompleteGroupBuying,
} from '../api';
import { useConfirmModal } from '@core/components/Feedback/AmberConfirmModal';
import { AuctionImage } from '../../auctions/components/AuctionImage';
import { AmberImageGallery } from '@core/components/AmberImageGallery';
import { getAuctionImageUrls, getAuctionAttachmentIds } from '../../auctions/utils/auction-utils';
import { useAttachmentUrls } from '@core/hooks/useAttachmentUrls';
import { DetailPageSkeleton } from '@core/loading';
import { useRouteParam } from '@core/hooks/useRouteParam';
import { useCountdown } from '@core/hooks/useCountdown';
import { useIsMobile } from '@core/hooks/useIsMobile';

function formatDateTime(dateStr: string, locale: string): string {
  try {
    const date = new Date(dateStr);
    if (Number.isNaN(date.getTime())) return '—';
    return date.toLocaleString(locale === 'ar' ? 'ar-IQ' : 'en-US', {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return '—';
  }
}

export const GroupBuyingDetailPage: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;
  const { t, dir, language } = useLanguage();
  const isRTL = dir === 'rtl';
  const { isMobile } = useIsMobile();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const campaignId = useRouteParam('id', { parse: 'string' }) || '';
  const { data: campaign, isPending: campaignLoading } = useGetGroupBuying(campaignId, !!campaignId);
  const { data: participantsData } = useGetGroupBuyingParticipants(campaignId);
  const joinMutation = useJoinGroupBuying();
  const cancelDeal = useCancelGroupBuying();
  const startDeal = useStartGroupBuying();
  const completeDeal = useCompleteGroupBuying();
  const { openConfirm, ConfirmModal } = useConfirmModal();

  const [joinQuantity, setJoinQuantity] = useState(1);

  // Resolve attachment IDs to CloudFront URLs
  const galleryItem = campaign ? {
    imageUrl: (campaign.item as any)?.imageUrl || (campaign as any).imageUrl,
    images: (campaign.item as any)?.images || (campaign as any).images,
    mainAttachmentId: (campaign.item as any)?.mainAttachmentId || (campaign as any).mainAttachmentId,
    attachmentIds: (campaign.item as any)?.attachmentIds || (campaign as any).attachmentIds,
  } : null;
  const directImageUrls = galleryItem ? getAuctionImageUrls(galleryItem) : [];
  const attachmentIds = galleryItem ? getAuctionAttachmentIds(galleryItem) : [];
  const { data: attachmentUrlMap } = useAttachmentUrls(
    directImageUrls.length === 0 ? attachmentIds : []
  );

  const campaignImages = (() => {
    if (directImageUrls.length > 0) return directImageUrls;
    if (!attachmentUrlMap || attachmentIds.length === 0) return [];
    return attachmentIds
      .map(id => attachmentUrlMap.get(id))
      .filter((url): url is string => url != null);
  })();

  const countdown = useCountdown(campaign?.endTime);

  const handleJoin = async () => {
    try {
      await joinMutation.mutateAsync({ id: campaignId, quantity: joinQuantity });
    } catch (err) {
      console.error('Join failed:', err);
    }
  };

  if (!isClient || !campaignId || campaignLoading || !router.isReady) {
    return <DetailPageSkeleton />;
  }

  if (!campaign) {
    return (
      <Card className="max-w-2xl mx-auto !p-12 text-center space-y-6 bg-obsidian-card border-danger/20">
        <AlertCircle className="w-16 h-16 text-danger mx-auto" />
        <div className="space-y-2">
          <h2 className="text-2xl font-black text-zinc-text uppercase tracking-tighter">{t('groupBuying.node_desync')}</h2>
          <p className="text-zinc-muted font-bold uppercase tracking-tight text-sm">{t('groupBuying.node_desync_desc')}</p>
        </div>
        <Link href="/group-buying">
          <AmberButton variant="secondary" className="px-8 h-12 uppercase font-black">
            {t('common.back') || 'Back'}
          </AmberButton>
        </Link>
      </Card>
    );
  }

  const participants = participantsData?.participants || [];
  const progress = campaign.maxParticipants > 0 ? (campaign.currentParticipants / campaign.maxParticipants) * 100 : 0;
  const isUnlocked = campaign.currentParticipants >= campaign.minParticipants;
  const isEndingSoon = new Date(campaign.endTime).getTime() - Date.now() < 1000 * 60 * 30;

  const detailRows = [
    { icon: Calendar, label: t('groupBuying.node_initialization') || 'Start', value: formatDateTime(campaign.startTime, language), isDate: true },
    { icon: Clock, label: t('groupBuying.temporal_termination') || 'End', value: formatDateTime(campaign.endTime, language), isDate: true },
    { icon: Package, label: t('groupBuying.asset_identifier') || 'Product ID', value: campaign.productId ? String(campaign.productId) : '—' },
    { icon: Target, label: t('groupBuying.min_threshold') || 'Min Threshold', value: `${campaign.minParticipants} ${t('groupBuying.participants_count') || 'participants'}` },
  ];

  return (
    <>
      <div className="max-w-[1600px] mx-auto p-3 md:p-6 space-y-4 md:space-y-6 animate-in fade-in duration-700" dir={dir}>
      {/* Header */}
      <div className="flex w-full min-w-0 flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex min-w-0 w-full flex-1 items-center gap-4">
          <Link href="/group-buying">
            <button
              type="button"
              className="h-10 w-10 shrink-0 rounded-lg bg-obsidian-card border border-white/5 flex items-center justify-center text-zinc-muted hover:text-brand hover:border-brand/30 transition-all active:scale-95"
            >
              <ArrowLeft className={cn("w-4 h-4", isRTL && "rotate-180")} />
            </button>
          </Link>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge
                status={campaign.status}
                labelKey={`groupBuying.status.${campaign.status.toLowerCase()}`}
                variant={campaign.status === 'active' ? 'success' : campaign.status === 'completed' ? 'warning' : 'info'}
                size="sm"
              />
              <span className="text-[11px] font-bold text-zinc-muted uppercase tracking-widest">#{campaign.id}</span>
            </div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-zinc-text tracking-tight leading-tight mt-1 min-w-0 break-words">
              {campaign.title}
            </h1>
          </div>
        </div>
        <div className={cn(
          'flex w-full min-w-0 flex-wrap items-center gap-2',
          isRTL ? 'justify-end' : 'justify-start',
          'lg:ms-auto lg:w-auto lg:shrink-0',
        )}>
          {/* Start Campaign - draft/scheduled */}
          {['draft', 'scheduled'].includes(campaign?.status) && (
            <AmberButton
              className="h-10 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold uppercase tracking-wider rounded-lg px-6 hover:bg-emerald-500/20 hover:border-emerald-500/30 active:scale-95 transition-all text-xs gap-2"
              onClick={() => openConfirm({
                title: t('groupBuying.lifecycle.start_title') || 'Start Campaign',
                message: t('groupBuying.lifecycle.start_confirm') || 'Are you sure you want to start this campaign? It will become visible to users.',
                onConfirm: () => startDeal.mutate(String(campaign.id)),
                variant: 'warning',
              })}
              disabled={startDeal.isPending}
            >
              <Play className="w-3.5 h-3.5" />
              {t('groupBuying.lifecycle.start') || 'Start'}
            </AmberButton>
          )}

          {/* Complete Campaign - active/unlocked when min threshold reached */}
          {['active', 'unlocked'].includes(campaign?.status) && campaign.currentParticipants >= campaign.minParticipants && (
            <AmberButton
              className="h-10 bg-brand/10 border border-brand/20 text-brand font-bold uppercase tracking-wider rounded-lg px-6 hover:bg-brand/20 hover:border-brand/30 active:scale-95 transition-all text-xs gap-2"
              onClick={() => openConfirm({
                title: t('groupBuying.lifecycle.complete_title') || 'Complete Campaign',
                message: t('groupBuying.lifecycle.complete_confirm') || 'Are you sure you want to mark this campaign as completed? Orders will be created for all participants.',
                onConfirm: () => completeDeal.mutate(String(campaign.id)),
                variant: 'warning',
              })}
              disabled={completeDeal.isPending}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              {t('groupBuying.lifecycle.complete') || 'Complete'}
            </AmberButton>
          )}

          {/* Cancel - any active status */}
          {!['completed', 'cancelled', 'expired'].includes(campaign?.status) && (
            <AmberButton
              className="h-10 bg-obsidian-card border border-white/10 text-zinc-muted font-bold uppercase tracking-wider rounded-lg px-6 hover:text-danger hover:border-danger/30 active:scale-95 transition-all text-xs gap-2"
              onClick={() => openConfirm({
                title: t('groupBuying.lifecycle.cancel_title') || 'Cancel Campaign',
                message: t('groupBuying.lifecycle.cancel_confirm') || 'Are you sure you want to cancel this campaign? This action cannot be undone.',
                onConfirm: () => cancelDeal.mutate(String(campaign.id)),
                variant: 'danger',
              })}
              disabled={cancelDeal.isPending}
            >
              <XCircle className="w-3.5 h-3.5" />
              {t('groupBuying.lifecycle.cancel') || 'Cancel'}
            </AmberButton>
          )}

          <button className="w-10 h-10 rounded-lg bg-obsidian-card border border-white/5 flex items-center justify-center text-zinc-muted hover:text-zinc-text hover:border-white/10 transition-all">
            <Share2 className="w-4 h-4" />
          </button>
          <Link href={`/group-buying/${campaign.id}/edit`}>
            <AmberButton className="h-10 bg-brand text-black font-bold uppercase tracking-wider rounded-lg px-6 hover:bg-brand/90 active:scale-95 transition-all border-none text-xs">
                {t('common.edit') || 'Edit'}
            </AmberButton>
          </Link>
        </div>
      </div>

      <div className={cn("grid grid-cols-1 xl:grid-cols-3 gap-4 md:gap-6", isMobile && "pb-24")}>
        {/* Main Column - Image + Progress + Participants */}
        <div className="xl:col-span-2 space-y-4 md:space-y-6 min-w-0 order-2 xl:order-1">

          {/* Image Gallery */}
          {campaignImages.length > 0 ? (
          <AmberImageGallery
            images={campaignImages}
            alt={campaign.title}
            height="h-[220px] sm:h-[280px] md:h-[320px] xl:h-[400px]"
            overlay={
              <>
                <div className="absolute top-4 start-4 flex items-center gap-2">
                  <div className="bg-black/50 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded-lg flex items-center gap-2">
                    {isUnlocked ? <Unlock className="w-3.5 h-3.5 text-emerald-400" /> : <Lock className="w-3.5 h-3.5 text-warning" />}
                    <span className="text-xs font-bold text-white uppercase tracking-wider">
                      {isUnlocked ? (t('groupBuying.unlocked') || 'Unlocked') : (t('groupBuying.locked') || 'Locked')}
                    </span>
                  </div>
                </div>
                <div className="absolute bottom-0 inset-x-0 p-6 bg-gradient-to-t from-black/90 via-black/40 to-transparent">
                  <span className="text-[11px] font-bold text-brand uppercase tracking-widest">{campaign.category?.name || 'General'}</span>
                  <h2 className="text-lg font-bold text-white leading-snug line-clamp-2 mt-1">{campaign.description}</h2>
                </div>
              </>
            }
          />
          ) : (
            <div className="w-full min-h-[160px] sm:min-h-[200px] max-h-[240px] sm:max-h-[280px] bg-obsidian-outer rounded-xl border border-white/5 flex items-center justify-center">
              <AuctionImage auction={galleryItem || {}} className="max-h-[240px] max-w-full object-contain rounded-lg" alt={campaign.title} />
            </div>
          )}

          {/* Progress Section */}
          <div className="bg-[var(--color-obsidian-card)] border border-white/5 rounded-xl p-4 md:p-6 space-y-4 md:space-y-5 min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-white/5 pb-3 md:pb-4">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 shrink-0 rounded-lg bg-brand/10 flex items-center justify-center text-brand">
                  <Target className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-black text-zinc-text uppercase tracking-widest">{t('groupBuying.participation_progress') || 'Participation Progress'}</h3>
              </div>
              <div className="flex flex-wrap items-center gap-4 sm:gap-6">
                <div className="text-start sm:text-end">
                  <span className="text-[11px] font-bold text-zinc-muted uppercase tracking-widest">{t('groupBuying.core_nodes') || 'Joined'}</span>
                  <p className="text-lg font-bold text-zinc-text leading-none mt-0.5 tabular-nums">{campaign.currentParticipants}</p>
                </div>
                <div className="hidden sm:block w-px h-8 bg-white/5" />
                <div className="text-start sm:text-end">
                  <span className="text-[11px] font-bold text-zinc-muted uppercase tracking-widest">{t('groupBuying.target') || 'Target'}</span>
                  <p className="text-lg font-bold text-brand leading-none mt-0.5 tabular-nums">{campaign.maxParticipants}</p>
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="py-2">
              <AmberProgress
                value={progress}
                variant={isUnlocked ? 'success' : 'primary'}
                className="h-3 bg-white/[0.03] rounded-full border border-white/5"
              />
              <div className="flex items-center justify-between mt-2">
                <span className="text-[11px] font-bold text-zinc-muted uppercase tracking-widest">0</span>
                <span className={cn(
                  "text-[11px] font-bold uppercase tracking-widest",
                  isUnlocked ? "text-emerald-400" : "text-warning"
                )}>
                  {t('groupBuying.min_reach') || 'Min'}: {campaign.minParticipants}
                </span>
                <span className="text-[11px] font-bold text-zinc-muted uppercase tracking-widest">{campaign.maxParticipants}</span>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-1.5">
                <div className="flex items-center gap-1.5">
                  <Users className="w-3 h-3 text-brand" />
                  <span className="text-[11px] font-bold text-zinc-muted uppercase tracking-widest">{t('groupBuying.core_nodes') || 'Joined'}</span>
                </div>
                <p className="text-lg font-bold text-zinc-text tabular-nums">{campaign.currentParticipants}</p>
              </div>
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-1.5">
                <div className="flex items-center gap-1.5">
                  <Zap className="w-3 h-3 text-emerald-400" />
                  <span className="text-[11px] font-bold text-zinc-muted uppercase tracking-widest">{t('groupBuying.min_reach') || 'Min'}</span>
                </div>
                <p className="text-lg font-bold text-zinc-text tabular-nums">{campaign.minParticipants}</p>
              </div>
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-1.5">
                <div className="flex items-center gap-1.5">
                  <Activity className="w-3 h-3 text-info" />
                  <span className="text-[11px] font-bold text-zinc-muted uppercase tracking-widest">{t('groupBuying.capacity_cap') || 'Max'}</span>
                </div>
                <p className="text-lg font-bold text-zinc-text tabular-nums">{campaign.maxParticipants}</p>
              </div>
            </div>
          </div>

          {/* Participants List */}
          <div className="bg-[var(--color-obsidian-card)] border border-white/5 rounded-xl p-4 md:p-6 space-y-4 md:space-y-5 min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-white/5 pb-3 md:pb-4">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 shrink-0 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                  <History className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-black text-zinc-text uppercase tracking-widest">{t('groupBuying.participants') || 'Participants'}</h3>
              </div>
              <div className="text-start sm:text-end">
                <span className="text-[11px] font-bold text-zinc-muted uppercase tracking-widest">{t('groupBuying.node_participation') || 'Total'}</span>
                <p className="text-lg font-bold text-zinc-text leading-none mt-0.5 tabular-nums">{participants.length}</p>
              </div>
            </div>

            {!participantsData ? (
              <div className="py-12 text-center">
                <div className="w-6 h-6 border-2 border-brand border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-[11px] text-zinc-muted font-semibold tracking-widest mt-3">Loading...</p>
              </div>
            ) : participants.length === 0 ? (
              <div className="py-12 text-center space-y-3 bg-white/[0.02] rounded-xl border border-dashed border-white/5">
                <Users className="w-10 h-10 text-zinc-muted/20 mx-auto" />
                <p className="text-xs font-semibold text-zinc-muted tracking-widest">{t('groupBuying.no_active_nodes') || 'No participants yet'}</p>
              </div>
            ) : (
              <div className="space-y-3">
                {participants.map((p, index) => (
                  <div
                    key={p.id}
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
                        {p.userName?.[0] || 'U'}
                      </div>
                      <div>
                        <span className="text-sm font-semibold text-zinc-text tracking-tight">{p.userName || 'Anonymous'}</span>
                        <div className="flex items-center gap-1.5 text-[11px] font-semibold text-zinc-muted tracking-widest mt-0.5">
                          <Clock className="w-3 h-3" />
                          {new Date(p.joinedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>
                    <div className="text-end">
                      <div className="flex items-center gap-1.5 justify-end">
                        <Package className="w-3.5 h-3.5 text-brand" />
                        <span className="text-sm font-bold text-zinc-text tabular-nums">x{p.quantity}</span>
                      </div>
                      <p className="text-[11px] font-semibold text-emerald-400 tracking-widest mt-0.5">#{participants.length - index}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar - Join + Info */}
        <div className="space-y-4 md:space-y-6 min-w-0 order-1 xl:order-2">

          {/* Join Panel */}
          <div className="bg-[var(--color-obsidian-card)] border border-white/5 rounded-xl p-4 md:p-6 space-y-4 md:space-y-5 relative overflow-hidden min-w-0">
            {isEndingSoon && <div className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-transparent via-danger to-transparent" />}

            {/* Price + Timer */}
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 pb-4 border-b border-white/5">
              <div className="space-y-1 min-w-0 flex-1">
                <span className="text-[11px] font-bold text-zinc-muted uppercase tracking-widest">{t('groupBuying.deal_price') || 'Deal Price'}</span>
                <p className="text-2xl sm:text-3xl font-bold text-brand tabular-nums leading-none tracking-tight">
                  {formatCurrency(campaign.dealPrice)}
                </p>
              </div>
              <div className="space-y-1 sm:text-end min-w-0 flex-1">
                <span className="text-[11px] font-bold text-zinc-muted uppercase tracking-widest">{t('groupBuying.original_price') || 'Original'}</span>
                <p className="text-lg sm:text-xl font-bold text-zinc-muted line-through tabular-nums leading-none tracking-tight mt-1">
                  {formatCurrency(campaign.originalPrice)}
                </p>
              </div>
            </div>

            {/* Savings */}
            <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/10 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-zinc-muted uppercase tracking-widest">{t('groupBuying.savings') || 'Savings'}</span>
                <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
              </div>
              <p className="text-xl font-bold text-emerald-400 tabular-nums leading-none">
                {formatCurrency((campaign.originalPrice - campaign.dealPrice) || 0)}
              </p>
            </div>

            {/* Timer */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-obsidian-panel/40 border border-white/5">
              <div className="flex items-center gap-2">
                <Timer className="w-4 h-4 text-warning" />
                <span className="text-[11px] font-bold text-zinc-muted uppercase tracking-widest">{t('groupBuying.time_left') || 'Time Left'}</span>
              </div>
              <span className={cn(
                "text-lg font-bold tabular-nums leading-none tracking-tight",
                isEndingSoon ? "text-danger animate-pulse" : "text-warning"
              )}>
                {countdown === 'ENDED' ? (t('TIME.ENDED') || 'ENDED') : countdown}
              </span>
            </div>

            {/* Join Button with Quantity Selection */}
            <div className="space-y-3">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold text-zinc-text uppercase tracking-widest">{t('groupBuying.join_quantity') || 'Quantity'}</label>
                  <select
                    value={joinQuantity}
                    onChange={(e) => setJoinQuantity(Number(e.target.value))}
                    className="h-10 px-3 bg-obsidian-outer border-white/5 text-zinc-text text-sm font-bold rounded-lg focus:ring-2 focus:ring-brand focus:ring-offset-1"
                  >
                    {Array.from({ length: Math.min(campaign.maxParticipants - (campaign.currentParticipants || 0), 10) }, (_, i) => (
                      <option key={i + 1} value={i + 1}>{i + 1}</option>
                    ))}
                  </select>
                </div>
                <div className="text-[11px] text-zinc-muted font-semibold">
                  {t('groupBuying.available_slots') || 'Available'}: {Math.max(0, campaign.maxParticipants - (campaign.currentParticipants || 0))}
                </div>
              </div>
              <AmberButton
                className="w-full h-11 bg-brand hover:bg-brand text-black font-bold uppercase tracking-wider rounded-xl active:scale-95 transition-all text-xs whitespace-normal leading-snug px-3"
                disabled={campaign.status !== 'active' || joinMutation.isPending || (campaign.maxParticipants > 0 && campaign.currentParticipants >= campaign.maxParticipants)}
                onClick={handleJoin}
              >
                {joinMutation.isPending ? (
                  <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin mx-auto" />
                ) : (
                  t('groupBuying.join_campaign') || 'Join Campaign'
                )}
              </AmberButton>
            </div>

            {/* Trust */}
            <div className="flex items-center gap-2.5 p-3 rounded-lg bg-obsidian-panel/40 border border-white/5">
              <ShieldCheck className="w-4 h-4 text-zinc-muted shrink-0" />
              <span className="text-[11px] font-semibold text-zinc-muted tracking-wider">{t('groupBuying.secure_transaction') || 'Secure Transaction'}</span>
            </div>
          </div>

          {/* Info Panel */}
          <div className="bg-[var(--color-obsidian-card)] border border-white/5 rounded-xl p-4 md:p-6 space-y-3 md:space-y-4 min-w-0">
            <div className="flex items-center gap-2.5 border-b border-white/5 pb-3 md:pb-4">
                <div className="w-8 h-8 shrink-0 rounded-lg bg-brand/10 flex items-center justify-center text-brand">
                    <Package className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-zinc-text uppercase tracking-widest">{t('groupBuying.details') || 'Details'}</h3>
            </div>

            <div className="space-y-3.5">
              {detailRows.map((item, i) => (
                <div key={i} className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-1.5 sm:gap-3 group/row min-w-0">
                  <div className="flex items-center gap-2.5 shrink-0">
                    <item.icon className="w-4 h-4 text-zinc-muted group-hover/row:text-brand transition-colors" />
                    <span className="text-[13px] font-semibold text-zinc-muted tracking-wide">{item.label}</span>
                  </div>
                  <span
                    className={cn(
                      'text-sm font-bold text-zinc-text sm:text-end break-words',
                      item.isDate && 'tabular-nums',
                    )}
                    dir={item.isDate ? 'ltr' : undefined}
                  >
                    {item.value}
                  </span>
                </div>
              ))}
            </div>

            <AmberButton variant="outline" className="w-full gap-2 font-bold uppercase tracking-wider text-xs h-9 bg-obsidian-panel border-white/10 text-zinc-text hover:text-brand active:scale-95 transition-all rounded-xl mt-2">
              {t('groupBuying.download_report') || 'Download Report'}
            </AmberButton>
          </div>

          {/* Activation Alert */}
          {!isUnlocked && (
            <div className="p-5 rounded-xl bg-warning/5 border border-warning/10 space-y-3">
              <div className="flex items-center gap-2 text-warning">
                <AlertCircle className="w-4 h-4" />
                <h4 className="text-[11px] font-bold tracking-widest">{t('groupBuying.activation_pending') || 'Activation Pending'}</h4>
              </div>
              <p className="text-[11px] text-warning/70 font-bold leading-relaxed">
                {t('groupBuying.activation_desc', { amount: campaign.minParticipants - campaign.currentParticipants }) || `${campaign.minParticipants - campaign.currentParticipants} more participants needed to unlock the deal.`}
              </p>
            </div>
          )}
        </div>
      </div>
      <ConfirmModal />
    </div>
    </>
  );
};

export default GroupBuyingDetailPage;
