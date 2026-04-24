import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
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
  Unlock
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
  useStartGroupBuying,
  useCancelGroupBuying,
  useCompleteGroupBuying
} from '../api';
import { useConfirmModal } from '@core/components/Feedback/AmberConfirmModal';
import { AuctionImage } from '../../auctions/components/AuctionImage';
import { AmberImageGallery } from '@core/components/AmberImageGallery';
import { getAuctionImageUrls } from '../../auctions/utils/auction-utils';

export const GroupBuyingDetailPage: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;
  const { t, dir } = useLanguage();
  const isRTL = dir === 'rtl';
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const campaignId = (id as string) || '';
  const { data: campaign, isLoading: campaignLoading } = useGetGroupBuying(campaignId, true);
  const { data: participantsData, isLoading: participantsLoading } = useGetGroupBuyingParticipants(campaignId);
  const joinMutation = useJoinGroupBuying();
  const startDeal = useStartGroupBuying();
  const cancelDeal = useCancelGroupBuying();
  const completeDeal = useCompleteGroupBuying();
  const { openConfirm, ConfirmModal } = useConfirmModal();

  const [currentTime, setCurrentTime] = useState(new Date());
  const [joinQuantity, setJoinQuantity] = useState(1);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleJoin = async () => {
    try {
      await joinMutation.mutateAsync({ id: campaignId, quantity: joinQuantity });
    } catch (err) {
      console.error('Join failed:', err);
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

  if (!isClient) return null;

  if (campaignLoading || !router.isReady) {
    return (
      <div className="max-w-[1600px] mx-auto p-6 space-y-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-white/5 rounded w-1/3" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 h-[500px] bg-white/[0.02] rounded-xl border border-white/[0.05]" />
            <div className="space-y-4">
              <div className="h-40 bg-white/[0.02] rounded-xl border border-white/[0.05]" />
              <div className="h-40 bg-white/[0.02] rounded-xl border border-white/[0.05]" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!campaign) {
    return (
      <Card className="max-w-2xl mx-auto !p-12 text-center space-y-6 bg-obsidian-card border-danger/20">
        <AlertCircle className="w-16 h-16 text-danger mx-auto" />
        <div className="space-y-2">
          <h2 className="text-2xl font-black text-zinc-text uppercase tracking-tighter">{t('groupBuying.node_desync')}</h2>
          <p className="text-zinc-muted font-bold uppercase tracking-tight text-sm">{t('groupBuying.node_desync_desc')}</p>
        </div>
        <AmberButton onClick={() => router.push('/group-buying')} variant="secondary" className="px-8 h-12 uppercase font-black">
          {t('common.back') || 'Back'}
        </AmberButton>
      </Card>
    );
  }

  const participants = participantsData?.participants || [];
  const progress = campaign.maxParticipants > 0 ? (campaign.currentParticipants / campaign.maxParticipants) * 100 : 0;
  const isUnlocked = campaign.currentParticipants >= campaign.minParticipants;
  const isEndingSoon = new Date(campaign.endTime).getTime() - currentTime.getTime() < 1000 * 60 * 30;

  const detailRows = [
    { icon: Calendar, label: t('groupBuying.node_initialization') || 'Start', value: new Date(campaign.startTime).toLocaleString() },
    { icon: Clock, label: t('groupBuying.temporal_termination') || 'End', value: new Date(campaign.endTime).toLocaleString() },
    { icon: Package, label: t('groupBuying.asset_identifier') || 'Product ID', value: `#${campaign.productId || 'N/A'}` },
    { icon: Target, label: t('groupBuying.min_threshold') || 'Min Threshold', value: `${campaign.minParticipants} participants` },
    ];

  return (
    <>
      <div className="max-w-[1600px] mx-auto p-6 space-y-6 animate-in fade-in duration-700" dir={dir}>
      {/* Header */}
      <div className="flex flex-col lg:flex-row items-start justify-between gap-4">
        <div className="flex items-center gap-4 w-full">
          <button
            onClick={() => router.push('/group-buying')}
            className="w-10 h-10 rounded-lg bg-obsidian-card border border-white/5 flex items-center justify-center text-zinc-muted hover:text-brand hover:border-brand/30 transition-all active:scale-95"
          >
            <ArrowLeft className={cn("w-4 h-4", isRTL && "rotate-180")} />
          </button>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <StatusBadge
                status={t(`groupBuying.status.${campaign.status.toLowerCase()}`) || campaign.status}
                variant={campaign.status === 'active' ? 'success' : campaign.status === 'completed' ? 'warning' : 'info'}
                size="sm"
              />
              <span className="text-[10px] font-bold text-zinc-muted uppercase tracking-widest">#{campaign.id}</span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-black text-zinc-text tracking-tight leading-tight mt-1 truncate">
              {campaign.title}
            </h1>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          {/* Lifecycle Buttons */}
          {campaign?.status === 'draft' || campaign?.status === 'scheduled' ? (
            <AmberButton
              className="h-10 bg-emerald-600 text-white font-bold uppercase tracking-wider rounded-lg px-6 hover:bg-emerald-700 active:scale-95 transition-all border-none text-xs"
              onClick={() => openConfirm({
                title: t('groupBuying.lifecycle.start_title') || 'Start Campaign',
                message: t('groupBuying.lifecycle.start_confirm') || 'Are you sure you want to start this campaign?',
                onConfirm: () => startDeal.mutate(String(campaign.id)),
                variant: 'success',
              })}
              disabled={startDeal.isPending}
            >
              {t('groupBuying.lifecycle.start') || 'Start'}
            </AmberButton>
          ) : null}
          {(campaign?.status === 'unlocked' || campaign?.status === 'active') ? (
            <AmberButton
              className="h-10 bg-emerald-600 text-white font-bold uppercase tracking-wider rounded-lg px-6 hover:bg-emerald-700 active:scale-95 transition-all border-none text-xs"
              onClick={() => openConfirm({
                title: t('groupBuying.lifecycle.complete_title') || 'Complete Campaign',
                message: t('groupBuying.lifecycle.complete_confirm') || 'Are you sure you want to mark this campaign as completed?',
                onConfirm: () => completeDeal.mutate(String(campaign.id)),
                variant: 'success',
              })}
              disabled={completeDeal.isPending}
            >
              {t('groupBuying.lifecycle.complete') || 'Complete'}
            </AmberButton>
          ) : null}
          {!['completed', 'cancelled'].includes(campaign?.status) ? (
            <AmberButton
              className="h-10 bg-obsidian-card border border-white/10 text-zinc-muted font-bold uppercase tracking-wider rounded-lg px-6 hover:text-danger hover:border-danger/30 active:scale-95 transition-all text-xs"
              onClick={() => openConfirm({
                title: t('groupBuying.lifecycle.cancel_title') || 'Cancel Campaign',
                message: t('groupBuying.lifecycle.cancel_confirm') || 'Are you sure you want to cancel this campaign? This action cannot be undone.',
                onConfirm: () => cancelDeal.mutate(String(campaign.id)),
                variant: 'danger',
              })}
              disabled={cancelDeal.isPending}
            >
              {t('groupBuying.lifecycle.cancel') || 'Cancel'}
            </AmberButton>
          ) : null}

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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Image + Participants */}
        <div className="lg:col-span-2 space-y-6">

          {/* Image Gallery */}
          <AmberImageGallery
            images={getAuctionImageUrls({
              imageUrl: (campaign.item as any)?.imageUrl || (campaign as any).imageUrl,
              images: (campaign.item as any)?.images || (campaign as any).images,
              mainAttachmentId: (campaign.item as any)?.mainAttachmentId || (campaign as any).mainAttachmentId,
              attachmentIds: (campaign.item as any)?.attachmentIds || (campaign as any).attachmentIds,
            })}
            alt={campaign.title}
            height="h-[300px] lg:h-[460px]"
            overlay={
              <>
                <div className="absolute top-4 start-4 flex items-center gap-2">
                  <div className="bg-black/50 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded-lg flex items-center gap-2">
                    {isUnlocked ? <Unlock className="w-3.5 h-3.5 text-emerald-400" /> : <Lock className="w-3.5 h-3.5 text-warning" />}
                    <span className="text-[10px] font-bold text-white uppercase tracking-wider">
                      {isUnlocked ? (t('groupBuying.unlocked') || 'Unlocked') : (t('groupBuying.locked') || 'Locked')}
                    </span>
                  </div>
                </div>
                <div className="absolute bottom-0 inset-x-0 p-6 bg-gradient-to-t from-black/90 via-black/40 to-transparent">
                  <span className="text-[10px] font-bold text-brand uppercase tracking-widest">{campaign.category?.name || 'General'}</span>
                  <h2 className="text-lg font-bold text-white leading-snug line-clamp-2 mt-1">{campaign.description}</h2>
                </div>
              </>
            }
          />

          {/* Progress Section */}
          <div className="bg-[var(--color-obsidian-card)] border border-white/5 rounded-xl p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-brand/10 flex items-center justify-center text-brand">
                  <Target className="w-4 h-4" />
                </div>
                <h3 className="text-xs font-black text-zinc-text uppercase tracking-widest">{t('groupBuying.participation_progress') || 'Participation Progress'}</h3>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-end">
                  <span className="text-[10px] font-bold text-zinc-muted uppercase tracking-widest">{t('groupBuying.core_nodes') || 'Joined'}</span>
                  <p className="text-lg font-bold text-zinc-text leading-none mt-0.5">{campaign.currentParticipants}</p>
                </div>
                <div className="w-px h-8 bg-white/5" />
                <div className="text-end">
                  <span className="text-[10px] font-bold text-zinc-muted uppercase tracking-widest">{t('groupBuying.target') || 'Target'}</span>
                  <p className="text-lg font-bold text-brand leading-none mt-0.5">{campaign.maxParticipants}</p>
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
                <span className="text-[10px] font-bold text-zinc-muted uppercase tracking-widest">0</span>
                <span className={cn(
                  "text-[10px] font-bold uppercase tracking-widest",
                  isUnlocked ? "text-emerald-400" : "text-warning"
                )}>
                  {t('groupBuying.min_reach') || 'Min'}: {campaign.minParticipants}
                </span>
                <span className="text-[10px] font-bold text-zinc-muted uppercase tracking-widest">{campaign.maxParticipants}</span>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-1.5">
                <div className="flex items-center gap-1.5">
                  <Users className="w-3 h-3 text-brand" />
                  <span className="text-[10px] font-bold text-zinc-muted uppercase tracking-widest">{t('groupBuying.core_nodes') || 'Joined'}</span>
                </div>
                <p className="text-lg font-bold text-zinc-text tabular-nums">{campaign.currentParticipants}</p>
              </div>
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-1.5">
                <div className="flex items-center gap-1.5">
                  <Zap className="w-3 h-3 text-emerald-400" />
                  <span className="text-[10px] font-bold text-zinc-muted uppercase tracking-widest">{t('groupBuying.min_reach') || 'Min'}</span>
                </div>
                <p className="text-lg font-bold text-zinc-text tabular-nums">{campaign.minParticipants}</p>
              </div>
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-1.5">
                <div className="flex items-center gap-1.5">
                  <Activity className="w-3 h-3 text-info" />
                  <span className="text-[10px] font-bold text-zinc-muted uppercase tracking-widest">{t('groupBuying.capacity_cap') || 'Max'}</span>
                </div>
                <p className="text-lg font-bold text-zinc-text tabular-nums">{campaign.maxParticipants}</p>
              </div>
            </div>
          </div>

          {/* Participants List */}
          <div className="bg-[var(--color-obsidian-card)] border border-white/5 rounded-xl p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                  <History className="w-4 h-4" />
                </div>
                <h3 className="text-xs font-black text-zinc-text uppercase tracking-widest">{t('groupBuying.participants') || 'Participants'}</h3>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-end">
                  <span className="text-[10px] font-bold text-zinc-muted uppercase tracking-widest">{t('groupBuying.node_participation') || 'Total'}</span>
                  <p className="text-lg font-bold text-zinc-text leading-none mt-0.5">{participants.length}</p>
                </div>
              </div>
            </div>

            {participantsLoading ? (
              <div className="py-12 text-center">
                <div className="w-6 h-6 border-2 border-brand border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-[10px] text-zinc-muted font-semibold tracking-widest mt-3">Loading...</p>
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
                        <div className="flex items-center gap-1.5 text-[10px] font-semibold text-zinc-muted tracking-widest mt-0.5">
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
                      <p className="text-[10px] font-semibold text-emerald-400 tracking-widest mt-0.5">#{participants.length - index}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Join + Info */}
        <div className="space-y-6">

          {/* Join Panel */}
          <div className="bg-[var(--color-obsidian-card)] border border-white/5 rounded-xl p-6 space-y-5 relative overflow-hidden">
            {isEndingSoon && <div className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-transparent via-danger to-transparent" />}

            {/* Price + Timer */}
            <div className="flex flex-row items-end justify-between gap-3 pb-4 border-b border-white/5">
              <div className="space-y-1 min-w-0 flex-1">
                <span className="text-[10px] font-bold text-zinc-muted uppercase tracking-widest">{t('groupBuying.deal_price') || 'Deal Price'}</span>
                <p className="text-2xl sm:text-3xl font-bold text-brand tabular-nums leading-none tracking-tight">
                  {formatCurrency(campaign.dealPrice)}
                </p>
              </div>
              <div className="space-y-1 text-end min-w-0 flex-1">
                <span className="text-[10px] font-bold text-zinc-muted uppercase tracking-widest">{t('groupBuying.original_price') || 'Original'}</span>
                <p className="text-lg sm:text-xl font-bold text-zinc-muted line-through tabular-nums leading-none tracking-tight mt-1">
                  {formatCurrency(campaign.originalPrice)}
                </p>
              </div>
            </div>

            {/* Savings */}
            <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/10 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-zinc-muted uppercase tracking-widest">{t('groupBuying.savings') || 'Savings'}</span>
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
                <span className="text-[10px] font-bold text-zinc-muted uppercase tracking-widest">{t('groupBuying.time_left') || 'Time Left'}</span>
              </div>
              <span className={cn(
                "text-lg font-bold tabular-nums leading-none tracking-tight",
                isEndingSoon ? "text-danger animate-pulse" : "text-warning"
              )}>
                {getCountdown(campaign.endTime)}
              </span>
            </div>

            {/* Join Button with Quantity Selection */}
            <div className="space-y-3">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-bold text-zinc-text uppercase tracking-widest">{t('groupBuying.join_quantity') || 'Quantity'}</label>
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
                <div className="text-[10px] text-zinc-muted font-semibold">
                  {t('groupBuying.available_slots') || 'Available'}: {Math.max(0, campaign.maxParticipants - (campaign.currentParticipants || 0))}
                </div>
              </div>
              <AmberButton
                className="w-full h-11 bg-brand hover:bg-brand text-black font-bold uppercase tracking-wider rounded-xl active:scale-95 transition-all text-xs"
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
              <span className="text-[10px] font-semibold text-zinc-muted tracking-wider">{t('groupBuying.secure_transaction') || 'Secure Transaction'}</span>
            </div>
          </div>

          {/* Info Panel */}
          <div className="bg-[var(--color-obsidian-card)] border border-white/5 rounded-xl p-6 space-y-4">
            <div className="flex items-center gap-2.5 border-b border-white/5 pb-4">
              <div className="w-8 h-8 rounded-lg bg-brand/10 flex items-center justify-center text-brand">
                <Package className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-zinc-text uppercase tracking-widest">{t('groupBuying.details') || 'Details'}</h3>
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
              {t('groupBuying.download_report') || 'Download Report'}
            </AmberButton>
          </div>

          {/* Activation Alert */}
          {!isUnlocked && (
            <div className="p-5 rounded-xl bg-warning/5 border border-warning/10 space-y-3">
              <div className="flex items-center gap-2 text-warning">
                <AlertCircle className="w-4 h-4" />
                <h4 className="text-[10px] font-bold tracking-widest">{t('groupBuying.activation_pending') || 'Activation Pending'}</h4>
              </div>
              <p className="text-[10px] text-warning/70 font-bold leading-relaxed">
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
