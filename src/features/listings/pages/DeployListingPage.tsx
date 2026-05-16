import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useRouter } from 'next/router';
import {
  ChevronLeft,
  Rocket,
  Gavel,
  Users,
  AlertCircle,
  X,
  Package,
  TrendingUp,
  Calendar,
  Clock,
  Zap,
  FileText,
} from 'lucide-react';
import { useLanguage } from '@core/contexts/LanguageContext';
import { cn } from '@core/lib/utils/cn';
import { AmberButton } from '@core/components/AmberButton';
import { AmberInput } from '@core/components/AmberInput';
import { AmberDatePicker } from '@core/components/AmberDatePicker';
import { AmberFormSkeleton } from '@core/components/Loading/AmberFormSkeleton';
import { FormSection } from '@core/components/FormSection';
import { IqdSymbol } from '@core/components/IqdSymbol';
import { useFormUX } from '@core/hooks/useFormUX';
import { useMapApiValidationError } from '@core/hooks/useMapApiValidationError';
import {
  parseBidIncrement,
  parseOptionalListingPrice,
  parseRequiredListingPrice,
} from '@core/utils/listingDeployPrices';
import { useGetListing, useDeployAsAuction, useDeployAsGroupBuy } from '../api/listing-hooks';
import { zodIssuesToFieldMap } from '@core/validation/zodIssuesToFieldMap';
import { deployAuctionFormSchema, deployGroupBuyFormSchema } from '../validation/deployListingSchemas';
import { getListingPrimaryImageUrl } from '../utils/listing-media';
import { FieldHelpHint } from '../components/FieldHelpHint';
import { EmptyState } from '@core/components/EmptyState';
import {
  computeDefaultScheduleEndTime,
  shouldAutoSetScheduleEnd,
} from '@core/utils/scheduleDatetime';

type DeployType = 'auction' | 'group_buy' | null;
type DeployMode = 'now' | 'schedule' | 'draft';

export const DeployListingPage: React.FC = () => {
  const { t, dir } = useLanguage();
  const mapApiError = useMapApiValidationError();
  const router = useRouter();
  const { id } = router.query;
  const isRTL = dir === 'rtl';
  const [isClient, setIsClient] = useState(false);

  // Read deploy type from URL query
  const queryType = router.query.type as string;
  const initialType: DeployType = queryType === 'group-buy' ? 'group_buy' : queryType === 'auction' ? 'auction' : null;
  const [deployType, setDeployType] = useState<DeployType>(initialType);
  const [deployMode, setDeployMode] = useState<DeployMode>('schedule');
  const [durationDays, setDurationDays] = useState(7);

  useEffect(() => { setIsClient(true); }, []);

  // Update deploy type when URL query changes
  useEffect(() => {
    if (queryType === 'group-buy') setDeployType('group_buy');
    else if (queryType === 'auction') setDeployType('auction');
  }, [queryType]);

  const { data: listing, isLoading } = useGetListing(Number(id), !!id);
  const deployAuctionMutation = useDeployAsAuction();
  const deployGroupBuyMutation = useDeployAsGroupBuy();

  const [auctionForm, setAuctionForm] = useState({
    startPrice: 0,
    reservePrice: '',
    bidIncrement: 5000,
    startTime: '',
    endTime: '',
  });

  const [groupBuyForm, setGroupBuyForm] = useState({
    originalPrice: 0,
    dealPrice: 0,
    minParticipants: 2,
    maxParticipants: 100,
    startTime: '',
    endTime: '',
    autoCreateOrder: true,
  });

  const [submitError, setSubmitError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const auctionEndTimeAutoRef = useRef(true);
  const groupBuyEndTimeAutoRef = useRef(true);

  const applyScheduleStartTime = <T extends { startTime: string; endTime: string }>(
    startTime: string,
    prev: T,
    endAutoRef: React.MutableRefObject<boolean>,
  ): T => {
    if (!startTime) {
      endAutoRef.current = true;
      return { ...prev, startTime };
    }
    const next = { ...prev, startTime };
    if (shouldAutoSetScheduleEnd(startTime, prev.endTime, endAutoRef.current)) {
      next.endTime = computeDefaultScheduleEndTime(startTime);
      endAutoRef.current = true;
    }
    return next;
  };

  // useFormUX: unsaved-changes warning + draft auto-save
  const currentValues = deployType === 'auction' ? auctionForm : groupBuyForm;
  const initialValues = useMemo(() =>
    deployType === 'auction'
      ? { startPrice: 0, reservePrice: '', bidIncrement: 5000, startTime: '', endTime: '' }
      : { originalPrice: 0, dealPrice: 0, minParticipants: 2, maxParticipants: 100, startTime: '', endTime: '', autoCreateOrder: true },
    [deployType]
  );

  const { isDirty, markClean } = useFormUX({
    values: currentValues,
    initialValues,
    isSubmitting: deployAuctionMutation.isPending || deployGroupBuyMutation.isPending,
    storageKey: 'draft-deploy-listing',
  });

  const clearFieldError = (key: string) => {
    setFieldErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const handleSubmit = async () => {
    setSubmitError(null);
    setFieldErrors({});
    try {
      if (deployType === 'auction') {
        // Validate pricing fields (always required)
        if (!auctionForm.startPrice || auctionForm.startPrice < 1) {
          setFieldErrors({ startPrice: 'Start price must be at least 1' });
          return;
        }
        if (!auctionForm.bidIncrement || auctionForm.bidIncrement < 1) {
          setFieldErrors({ bidIncrement: 'Bid increment must be at least 1' });
          return;
        }

        const reservePrice = parseOptionalListingPrice(auctionForm.reservePrice);
        const basePayload: Record<string, any> = {
          startPrice: parseRequiredListingPrice(auctionForm.startPrice),
          ...(reservePrice !== undefined ? { reservePrice } : {}),
          bidIncrement: parseBidIncrement(auctionForm.bidIncrement, 5000),
        };

        if (deployMode === 'now') {
          const startTime = new Date();
          startTime.setMinutes(startTime.getMinutes() + 1);
          const endTime = new Date(startTime);
          endTime.setDate(endTime.getDate() + durationDays);
          basePayload.startTime = startTime.toISOString();
          basePayload.endTime = endTime.toISOString();
        } else if (deployMode === 'schedule') {
          const parsed = deployAuctionFormSchema.safeParse(auctionForm);
          if (!parsed.success) {
            setFieldErrors(zodIssuesToFieldMap(parsed.error));
            return;
          }
          basePayload.startTime = new Date(auctionForm.startTime).toISOString();
          basePayload.endTime = new Date(auctionForm.endTime).toISOString();
        }
        // draft mode: no startTime/endTime

        await deployAuctionMutation.mutateAsync({
          id: Number(id),
          data: basePayload,
        });
      } else if (deployType === 'group_buy') {
        // Validate pricing fields
        if (!groupBuyForm.originalPrice || groupBuyForm.originalPrice < 1) {
          setFieldErrors({ originalPrice: 'Original price must be at least 1' });
          return;
        }
        if (!groupBuyForm.dealPrice || groupBuyForm.dealPrice < 1) {
          setFieldErrors({ dealPrice: 'Deal price must be at least 1' });
          return;
        }

        const basePayload: Record<string, any> = {
          originalPrice: Number(groupBuyForm.originalPrice),
          dealPrice: Number(groupBuyForm.dealPrice),
          minParticipants: Number(groupBuyForm.minParticipants),
          maxParticipants: Number(groupBuyForm.maxParticipants),
          autoCreateOrder: groupBuyForm.autoCreateOrder,
        };

        if (deployMode === 'now') {
          const startTime = new Date();
          startTime.setMinutes(startTime.getMinutes() + 1);
          const endTime = new Date(startTime);
          endTime.setDate(endTime.getDate() + durationDays);
          basePayload.startTime = startTime.toISOString();
          basePayload.endTime = endTime.toISOString();
        } else if (deployMode === 'schedule') {
          const parsed = deployGroupBuyFormSchema.safeParse(groupBuyForm);
          if (!parsed.success) {
            setFieldErrors(zodIssuesToFieldMap(parsed.error));
            return;
          }
          basePayload.startTime = new Date(groupBuyForm.startTime).toISOString();
          basePayload.endTime = new Date(groupBuyForm.endTime).toISOString();
        }
        // draft mode: no startTime/endTime

        await deployGroupBuyMutation.mutateAsync({
          id: Number(id),
          data: basePayload,
        });
      }
      markClean();
      if (deployType === 'auction') {
        router.push('/auctions');
      } else {
        router.push('/group-buying');
      }
    } catch (err: unknown) {
      const mapped = mapApiError(err, { firstOnly: false });
      const errMsg = typeof (err as { message?: string })?.message === 'string' ? (err as { message: string }).message.trim() : '';
      setSubmitError(mapped?.trim() || errMsg || t('listing.deploy.error_reason_unknown'));
    }
  };

  if (!isClient) return null;

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-6 space-y-8">
        <AmberFormSkeleton fields={6} header actions layout="grid" />
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="max-w-4xl mx-auto p-6" dir={dir}>
        <EmptyState
          icon={Package}
          title={t('listing.detail.not_found') || 'Not Found'}
        />
      </div>
    );
  }

  const listingCoverUrl = getListingPrimaryImageUrl(listing);

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700" dir={dir}>
      {/* Error Banner */}
      {submitError && (
        <div className="bg-danger/10 border border-danger/20 p-4 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
          <AlertCircle className="w-5 h-5 text-danger shrink-0" />
          <p className="text-sm text-danger font-medium whitespace-pre-line">{submitError}</p>
          <button onClick={() => setSubmitError(null)} className="ml-auto text-danger/60 hover:text-danger">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <AmberButton variant="secondary" className="p-0 w-11 h-11 rounded-xl flex items-center justify-center active:scale-95 transition-all bg-obsidian-card border-border" onClick={() => router.push(`/listings/${id}`)}>
              <ChevronLeft className={cn("w-5 h-5", isRTL && "rotate-180")} />
          </AmberButton>
          <div>
            <h1 className="text-3xl font-black text-zinc-text tracking-tighter uppercase leading-none">
              {t('listing.deploy.title')}
            </h1>
            <p className="text-sm text-zinc-muted font-bold tracking-tight uppercase mt-1">
              {listing.title}
            </p>
          </div>
        </div>
      </div>

      {/* Listing Summary */}
      <div className="p-5 rounded-2xl bg-brand/[0.02] border border-brand/10 flex items-center gap-4">
        <div className="w-12 h-12 rounded-lg bg-obsidian-outer border border-white/5 flex items-center justify-center overflow-hidden shrink-0">
          {listingCoverUrl ? (
            <img src={listingCoverUrl} alt="" className="w-full h-full object-cover" />
          ) : (
            <Package className="w-6 h-6 text-zinc-muted/40" />
          )}
        </div>
        <div className="space-y-0.5">
          <p className="text-sm font-black text-zinc-text uppercase tracking-tight">{listing.title}</p>
          <p className="text-[10px] text-zinc-muted font-bold uppercase tracking-widest">
            {listing.brand ? `${listing.brand}${listing.model ? ` ${listing.model}` : ''}` : ''}
            {listing.condition ? ` | ${listing.condition}` : ''}
          </p>
        </div>
      </div>

      {/* Sale Type Selector */}
      {!deployType ? (
        <div className="space-y-4">
          <p className="text-sm font-black text-zinc-muted uppercase tracking-[0.25em]">{t('listing.deploy.choose')}</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <button
              onClick={() => {
                setFieldErrors({});
                setDeployType('auction');
              }}
              className="p-8 rounded-2xl bg-obsidian-card border border-white/5 hover:border-brand/30 transition-all text-left group"
            >
              <div className="w-14 h-14 rounded-xl bg-brand/10 flex items-center justify-center text-brand border border-brand/20 mb-6 group-hover:scale-110 transition-transform">
                <Gavel className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-black text-zinc-text uppercase tracking-tight">{t('listing.deploy.as_auction')}</h3>
              <p className="text-sm text-zinc-muted mt-2">{t('listing.deploy.as_auction_desc')}</p>
            </button>

            <button
              onClick={() => {
                setFieldErrors({});
                setDeployType('group_buy');
              }}
              className="p-8 rounded-2xl bg-obsidian-card border border-white/5 hover:border-info/30 transition-all text-left group"
            >
              <div className="w-14 h-14 rounded-xl bg-info/10 flex items-center justify-center text-info border border-info/20 mb-6 group-hover:scale-110 transition-transform">
                <Users className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-black text-zinc-text uppercase tracking-tight">{t('listing.deploy.as_group_buy')}</h3>
              <p className="text-sm text-zinc-muted mt-2">{t('listing.deploy.as_group_buy_desc')}</p>
            </button>
          </div>
        </div>
      ) : (
        <FormSection
          icon={deployType === 'auction' ? <Gavel className="w-5 h-5" /> : <Users className="w-5 h-5" />}
          iconBgColor={deployType === 'auction' ? 'brand' : 'info'}
          title={deployType === 'auction' ? t('listing.deploy.auction_settings') : t('listing.deploy.group_buy_settings')}
        >

          {deployType === 'auction' && (
            <div className="space-y-6">
              <AmberInput
                label={t('listing.deploy.start_price')}
                type="number"
                value={auctionForm.startPrice}
                onChange={(e) => {
                  clearFieldError('startPrice');
                  setAuctionForm(p => ({ ...p, startPrice: Number(e.target.value) }));
                }}
                icon={<IqdSymbol />}
                error={fieldErrors.startPrice}
                rightElement={<FieldHelpHint text={t('listing.deploy.hint.start_price')} />}
              />
              <AmberInput
                label={t('listing.deploy.reserve_price')}
                type="number"
                value={auctionForm.reservePrice}
                onChange={(e) => {
                  clearFieldError('reservePrice');
                  setAuctionForm(p => ({ ...p, reservePrice: e.target.value }));
                }}
                icon={<IqdSymbol />}
                error={fieldErrors.reservePrice}
                rightElement={<FieldHelpHint text={t('listing.deploy.hint.reserve_price')} />}
              />
              <AmberInput
                label={t('listing.deploy.bid_increment')}
                type="number"
                value={auctionForm.bidIncrement}
                onChange={(e) => {
                  clearFieldError('bidIncrement');
                  setAuctionForm(p => ({ ...p, bidIncrement: Number(e.target.value) }));
                }}
                icon={<Gavel className="w-4 h-4" />}
                error={fieldErrors.bidIncrement}
                rightElement={<FieldHelpHint text={t('listing.deploy.hint.bid_increment')} />}
              />

              {/* Deploy Mode Selector */}
              <div className="space-y-3 pt-2">
                <p className="text-[10px] font-black text-zinc-muted uppercase tracking-widest">
                  {t('listing.deploy.choose')}
                </p>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => { setDeployMode('now'); setFieldErrors({}); }}
                    className={cn(
                      "flex flex-col items-center gap-2 p-4 rounded-xl border transition-all text-center",
                      deployMode === 'now'
                        ? "bg-brand/10 border-brand/30 text-brand"
                        : "bg-obsidian-panel border-white/5 text-zinc-muted hover:border-white/10"
                    )}
                  >
                    <Zap className="w-5 h-5" />
                    <span className="text-[10px] font-black uppercase tracking-widest">{t('listing.deploy.mode_now')}</span>
                    <span className="text-[9px] font-bold opacity-70">{t('listing.deploy.mode_now_desc')}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => { setDeployMode('schedule'); setFieldErrors({}); }}
                    className={cn(
                      "flex flex-col items-center gap-2 p-4 rounded-xl border transition-all text-center",
                      deployMode === 'schedule'
                        ? "bg-warning/10 border-warning/30 text-warning"
                        : "bg-obsidian-panel border-white/5 text-zinc-muted hover:border-white/10"
                    )}
                  >
                    <Calendar className="w-5 h-5" />
                    <span className="text-[10px] font-black uppercase tracking-widest">{t('listing.deploy.mode_schedule')}</span>
                    <span className="text-[9px] font-bold opacity-70">{t('listing.deploy.mode_schedule_desc')}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => { setDeployMode('draft'); setFieldErrors({}); }}
                    className={cn(
                      "flex flex-col items-center gap-2 p-4 rounded-xl border transition-all text-center",
                      deployMode === 'draft'
                        ? "bg-info/10 border-info/30 text-info"
                        : "bg-obsidian-panel border-white/5 text-zinc-muted hover:border-white/10"
                    )}
                  >
                    <FileText className="w-5 h-5" />
                    <span className="text-[10px] font-black uppercase tracking-widest">{t('listing.deploy.mode_draft')}</span>
                    <span className="text-[9px] font-bold opacity-70">{t('listing.deploy.mode_draft_desc')}</span>
                  </button>
                </div>
              </div>

              {/* Schedule: Date Pickers */}
              {deployMode === 'schedule' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <AmberDatePicker
                    label={t('listing.deploy.start_time')}
                    labelEndSlot={<FieldHelpHint text={t('listing.deploy.hint.start_time')} />}
                    value={auctionForm.startTime}
                    onChange={(val) => {
                      clearFieldError('startTime');
                      setAuctionForm(p => {
                        const next = applyScheduleStartTime(val, p, auctionEndTimeAutoRef);
                        if (next.endTime !== p.endTime) clearFieldError('endTime');
                        return next;
                      });
                    }}
                    icon={<Calendar className="w-4 h-4" />}
                    error={fieldErrors.startTime}
                  />
                  <AmberDatePicker
                    label={t('listing.deploy.end_time')}
                    labelEndSlot={<FieldHelpHint text={t('listing.deploy.hint.end_time')} />}
                    value={auctionForm.endTime}
                    onChange={(val) => {
                      clearFieldError('endTime');
                      auctionEndTimeAutoRef.current = false;
                      setAuctionForm(p => ({ ...p, endTime: val }));
                    }}
                    icon={<Calendar className="w-4 h-4" />}
                    error={fieldErrors.endTime}
                  />
                </div>
              )}

              {/* Publish Now: Duration Picker */}
              {deployMode === 'now' && (
                <div className="space-y-4">
                  <AmberInput
                    label={t('listing.deploy.duration_days') || 'Duration (Days)'}
                    type="number"
                    value={durationDays}
                    onChange={(e) => setDurationDays(Math.max(1, Math.min(90, Number(e.target.value) || 1)))}
                    icon={<Clock className="w-4 h-4" />}
                    min={1}
                    max={90}
                  />
                  <div className="p-4 rounded-xl bg-brand/[0.03] border border-brand/10">
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest">
                      <Zap className="w-3 h-3 text-brand" />
                      <span className="text-brand">{t('listing.deploy.mode_now')}</span>
                    </div>
                    <p className="text-[11px] text-zinc-muted font-bold mt-1">
                      {(() => {
                        const start = new Date();
                        start.setMinutes(start.getMinutes() + 1);
                        const end = new Date(start);
                        end.setDate(end.getDate() + durationDays);
                        return `${start.toLocaleDateString(dir === 'rtl' ? 'ar-IQ' : 'en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })} → ${end.toLocaleDateString(dir === 'rtl' ? 'ar-IQ' : 'en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}`;
                      })()}
                    </p>
                  </div>
                </div>
              )}

              {/* Draft: Info Banner */}
              {deployMode === 'draft' && (
                <div className="p-4 rounded-xl bg-info/[0.03] border border-info/10 flex items-start gap-3">
                  <FileText className="w-4 h-4 text-info shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-black text-info uppercase">{t('listing.deploy.mode_draft')}</p>
                    <p className="text-[11px] text-zinc-muted font-bold mt-1">{t('listing.deploy.mode_draft_desc')}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {deployType === 'group_buy' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <AmberInput
                  label={t('listing.deploy.original_price')}
                  type="number"
                  value={groupBuyForm.originalPrice}
                  onChange={(e) => {
                    clearFieldError('originalPrice');
                    setGroupBuyForm(p => ({ ...p, originalPrice: Number(e.target.value) }));
                  }}
                  icon={<IqdSymbol />}
                  error={fieldErrors.originalPrice}
                  rightElement={<FieldHelpHint text={t('listing.deploy.hint.original_price')} />}
                />
                <AmberInput
                  label={t('listing.deploy.deal_price')}
                  type="number"
                  value={groupBuyForm.dealPrice}
                  onChange={(e) => {
                    clearFieldError('dealPrice');
                    setGroupBuyForm(p => ({ ...p, dealPrice: Number(e.target.value) }));
                  }}
                  icon={<TrendingUp className="w-4 h-4" />}
                  error={fieldErrors.dealPrice}
                  rightElement={<FieldHelpHint text={t('listing.deploy.hint.deal_price')} />}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <AmberInput
                  label={t('listing.deploy.min_participants')}
                  type="number"
                  value={groupBuyForm.minParticipants}
                  onChange={(e) => {
                    clearFieldError('minParticipants');
                    setGroupBuyForm(p => ({ ...p, minParticipants: Number(e.target.value) }));
                  }}
                  icon={<Users className="w-4 h-4" />}
                  error={fieldErrors.minParticipants}
                  rightElement={<FieldHelpHint text={t('listing.deploy.hint.min_participants')} />}
                />
                <AmberInput
                  label={t('listing.deploy.max_participants')}
                  type="number"
                  value={groupBuyForm.maxParticipants}
                  onChange={(e) => {
                    clearFieldError('maxParticipants');
                    setGroupBuyForm(p => ({ ...p, maxParticipants: Number(e.target.value) }));
                  }}
                  icon={<Users className="w-4 h-4" />}
                  error={fieldErrors.maxParticipants}
                  rightElement={<FieldHelpHint text={t('listing.deploy.hint.max_participants')} />}
                />
              </div>

              {/* Deploy Mode Selector */}
              <div className="space-y-3 pt-2">
                <p className="text-[10px] font-black text-zinc-muted uppercase tracking-widest">
                  {t('listing.deploy.choose')}
                </p>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => { setDeployMode('now'); setFieldErrors({}); }}
                    className={cn(
                      "flex flex-col items-center gap-2 p-4 rounded-xl border transition-all text-center",
                      deployMode === 'now'
                        ? "bg-brand/10 border-brand/30 text-brand"
                        : "bg-obsidian-panel border-white/5 text-zinc-muted hover:border-white/10"
                    )}
                  >
                    <Zap className="w-5 h-5" />
                    <span className="text-[10px] font-black uppercase tracking-widest">{t('listing.deploy.mode_now')}</span>
                    <span className="text-[9px] font-bold opacity-70">{t('listing.deploy.mode_now_desc')}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => { setDeployMode('schedule'); setFieldErrors({}); }}
                    className={cn(
                      "flex flex-col items-center gap-2 p-4 rounded-xl border transition-all text-center",
                      deployMode === 'schedule'
                        ? "bg-warning/10 border-warning/30 text-warning"
                        : "bg-obsidian-panel border-white/5 text-zinc-muted hover:border-white/10"
                    )}
                  >
                    <Calendar className="w-5 h-5" />
                    <span className="text-[10px] font-black uppercase tracking-widest">{t('listing.deploy.mode_schedule')}</span>
                    <span className="text-[9px] font-bold opacity-70">{t('listing.deploy.mode_schedule_desc')}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => { setDeployMode('draft'); setFieldErrors({}); }}
                    className={cn(
                      "flex flex-col items-center gap-2 p-4 rounded-xl border transition-all text-center",
                      deployMode === 'draft'
                        ? "bg-info/10 border-info/30 text-info"
                        : "bg-obsidian-panel border-white/5 text-zinc-muted hover:border-white/10"
                    )}
                  >
                    <FileText className="w-5 h-5" />
                    <span className="text-[10px] font-black uppercase tracking-widest">{t('listing.deploy.mode_draft')}</span>
                    <span className="text-[9px] font-bold opacity-70">{t('listing.deploy.mode_draft_desc')}</span>
                  </button>
                </div>
              </div>

              {/* Schedule: Date Pickers */}
              {deployMode === 'schedule' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <AmberDatePicker
                    label={t('listing.deploy.start_time')}
                    labelEndSlot={<FieldHelpHint text={t('listing.deploy.hint.start_time')} />}
                    value={groupBuyForm.startTime}
                    onChange={(val) => {
                      clearFieldError('startTime');
                      setGroupBuyForm(p => {
                        const next = applyScheduleStartTime(val, p, groupBuyEndTimeAutoRef);
                        if (next.endTime !== p.endTime) clearFieldError('endTime');
                        return next;
                      });
                    }}
                    icon={<Calendar className="w-4 h-4" />}
                    error={fieldErrors.startTime}
                  />
                  <AmberDatePicker
                    label={t('listing.deploy.end_time')}
                    labelEndSlot={<FieldHelpHint text={t('listing.deploy.hint.end_time')} />}
                    value={groupBuyForm.endTime}
                    onChange={(val) => {
                      clearFieldError('endTime');
                      groupBuyEndTimeAutoRef.current = false;
                      setGroupBuyForm(p => ({ ...p, endTime: val }));
                    }}
                    icon={<Calendar className="w-4 h-4" />}
                    error={fieldErrors.endTime}
                  />
                </div>
              )}

              {/* Publish Now: Duration Picker */}
              {deployMode === 'now' && (
                <div className="space-y-4">
                  <AmberInput
                    label={t('listing.deploy.duration_days') || 'Duration (Days)'}
                    type="number"
                    value={durationDays}
                    onChange={(e) => setDurationDays(Math.max(1, Math.min(90, Number(e.target.value) || 1)))}
                    icon={<Clock className="w-4 h-4" />}
                    min={1}
                    max={90}
                  />
                  <div className="p-4 rounded-xl bg-brand/[0.03] border border-brand/10">
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest">
                      <Zap className="w-3 h-3 text-brand" />
                      <span className="text-brand">{t('listing.deploy.mode_now')}</span>
                    </div>
                    <p className="text-[11px] text-zinc-muted font-bold mt-1">
                      {(() => {
                        const start = new Date();
                        start.setMinutes(start.getMinutes() + 1);
                        const end = new Date(start);
                        end.setDate(end.getDate() + durationDays);
                        return `${start.toLocaleDateString(dir === 'rtl' ? 'ar-IQ' : 'en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })} → ${end.toLocaleDateString(dir === 'rtl' ? 'ar-IQ' : 'en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}`;
                      })()}
                    </p>
                  </div>
                </div>
              )}

              {/* Draft: Info Banner */}
              {deployMode === 'draft' && (
                <div className="p-4 rounded-xl bg-info/[0.03] border border-info/10 flex items-start gap-3">
                  <FileText className="w-4 h-4 text-info shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-black text-info uppercase">{t('listing.deploy.mode_draft')}</p>
                    <p className="text-[11px] text-zinc-muted font-bold mt-1">{t('listing.deploy.mode_draft_desc')}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <AmberButton
              variant="outline"
              className="h-11 border-border rounded-xl px-6 active:scale-95 transition-all"
              onClick={() => {
                setFieldErrors({});
                setDeployType(null);
              }}
            >
              {t('listing.deploy.back')}
            </AmberButton>
            <AmberButton
              className={cn(
                "h-11 font-black rounded-xl px-10 gap-2 border-none active:scale-95 transition-all shadow-lg",
                deployType === 'auction'
                  ? "bg-brand text-black"
                  : "bg-info text-white"
              )}
              onClick={handleSubmit}
              disabled={deployAuctionMutation.isPending || deployGroupBuyMutation.isPending}
            >
              {(deployAuctionMutation.isPending || deployGroupBuyMutation.isPending) ? (
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : (
                <Rocket className="w-4 h-4" />
              )}
              {t('listing.deploy.deploy')}
            </AmberButton>
          </div>
        </FormSection>
      )}
    </div>
  );
};

export default DeployListingPage;
