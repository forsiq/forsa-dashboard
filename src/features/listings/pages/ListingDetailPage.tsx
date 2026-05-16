import React, { useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import {
  ChevronLeft,
  Package,
  Edit,
  Trash2,
  Gavel,
  Users,
  Image as ImageIcon,
  Info,
  ExternalLink,
  Rocket,
  Clock,
  Calendar,
  Timer,
  CheckCircle,
  AlertCircle,
  Plus,
} from 'lucide-react';
import { useLanguage } from '@core/contexts/LanguageContext';
import { cn } from '@core/lib/utils/cn';
import { AmberCard as Card } from '@core/components/AmberCard';
import { AmberButton } from '@core/components/AmberButton';
import { StatusBadge } from '@core/components/Data/StatusBadge';
import { useGetListing, useGetListingAuctions, useGetListingDeals, useDeleteListing } from '../api/listing-hooks';
import { useConfirmModal } from '@core/components/Feedback/AmberConfirmModal';
import { ListingImage } from '../components/ListingImage';
import { isSafePathResourceId } from '@core/utils/safeRouteId';
import { DetailPageSkeleton } from '@core/loading';
import { useRouteParam } from '@core/hooks/useRouteParam';
import { getCountdown } from '@core/utils/countdown';
import { EmptyState } from '@core/components/EmptyState';
import { useIsClient } from '@core/hooks/useIsClient';

export const ListingDetailPage: React.FC = () => {
  const { t, dir } = useLanguage();
  const router = useRouter();
  const listingId = useRouteParam('id', { parse: 'number' });
  const isRTL = dir === 'rtl';
  const isClient = useIsClient();

  const { data: listing, isPending } = useGetListing(listingId!, !!listingId);
  const { data: auctionsData } = useGetListingAuctions(listingId!, !!listingId);
  const { data: dealsData } = useGetListingDeals(listingId!, !!listingId);
  const deleteMutation = useDeleteListing();
  const { openConfirm, ConfirmModal } = useConfirmModal();

  const auctions = auctionsData || [];
  const deals = dealsData || [];

  // Compute overall publish status from linked auctions/deals
  const publishStatus = useMemo(() => {
    const allItems = [
      ...auctions.map((a: any) => a.status),
      ...deals.map((d: any) => d.status),
    ];
    if (allItems.length === 0) return 'not_published';
    if (allItems.includes('active')) return 'published';
    if (allItems.some((s: string) => s === 'scheduled' || s === 'draft' || s === 'paused')) return 'scheduled';
    return 'ended';
  }, [auctions, deals]);

  const publishStatusLabel: Record<string, string> = {
    published: t('listing.detail.publish_status.published') || 'Published',
    scheduled: t('listing.detail.publish_status.scheduled') || 'Scheduled',
    ended: t('listing.detail.publish_status.ended') || 'Ended',
    not_published: t('listing.detail.publish_status.not_published') || 'Not Published',
  };

  const publishStatusVariant: Record<string, 'success' | 'warning' | 'info' | 'inactive'> = {
    published: 'success',
    scheduled: 'warning',
    ended: 'info',
    not_published: 'inactive',
  };

  // Helper: format countdown
  const getCountdown = (endTimeStr: string) => {
    if (!endTimeStr) return '';
    const end = new Date(endTimeStr);
    const diff = end.getTime() - Date.now();
    if (diff <= 0) return t('TIME.ENDED') || 'Ended';
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${mins}m`;
    return `${mins}m`;
  };

  // Helper: format starts in
  const getStartsIn = (startTimeStr: string) => {
    if (!startTimeStr) return '';
    const start = new Date(startTimeStr);
    const diff = start.getTime() - Date.now();
    if (diff <= 0) return '';
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${mins}m`;
    return `${mins}m`;
  };

  // Sort linked items: active > scheduled/draft/paused > ended/cancelled
  const statusOrder: Record<string, number> = { active: 0, paused: 1, scheduled: 2, draft: 3, ended: 4, cancelled: 5 };
  const sortedAuctions = useMemo(() =>
    [...auctions].sort((a: any, b: any) => (statusOrder[a.status] ?? 9) - (statusOrder[b.status] ?? 9)),
    [auctions]
  );
  const sortedDeals = useMemo(() =>
    [...deals].sort((a: any, b: any) => (statusOrder[a.status] ?? 9) - (statusOrder[b.status] ?? 9)),
    [deals]
  );

  // Compute next schedule info for Quick Deploy Card context
  const nextScheduleInfo = useMemo(() => {
    const activeAuction = auctions.find((a: any) => a.status === 'active');
    const scheduledAuction = auctions.find((a: any) => a.status === 'scheduled' || a.status === 'draft');
    const activeDeal = deals.find((d: any) => d.status === 'active');
    if (activeAuction) return { type: 'ending' as const, time: activeAuction.endTime };
    if (activeDeal) return { type: 'ending' as const, time: activeDeal.endTime };
    if (scheduledAuction) return { type: 'starting' as const, time: scheduledAuction.startTime };
    return null;
  }, [auctions, deals]);

  const attachmentCount = useMemo(() => {
    if (!listing) return 0;
    return listing.attachmentIds?.length || listing.images?.length || 0;
  }, [listing]);

  if (!isClient || !listingId || isPending) return <DetailPageSkeleton />;

  if (!listing) {
    return (
      <EmptyState
        icon={Package}
        title={t('listing.detail.not_found') || 'Not Found'}
        actionLabel={t('listing.form.cancel') || 'Back'}
        onAction={() => router.push('/listings')}
      />
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700" dir={dir}>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <AmberButton variant="secondary" className="p-0 w-11 h-11 rounded-xl flex items-center justify-center active:scale-95 transition-all bg-obsidian-card border-border" onClick={() => router.push('/listings')}>
              <ChevronLeft className={cn("w-5 h-5", isRTL && "rotate-180")} />
          </AmberButton>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-black text-zinc-text tracking-tighter uppercase leading-none">
                {listing.title}
              </h1>
              <StatusBadge
                status={publishStatusLabel[publishStatus]}
                variant={publishStatusVariant[publishStatus]}
                size="sm"
              />
            </div>
            <p className="text-sm text-zinc-muted font-bold tracking-tight uppercase mt-1">
              {listing.brand ? `${listing.brand}${listing.model ? ` ${listing.model}` : ''}` : ''}
              {listing.condition ? ` - ${listing.condition}` : ''}
              {listing.sku ? ` | SKU: ${listing.sku}` : ''}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          <AmberButton variant="outline" className="h-11 border-border font-bold rounded-xl px-6 gap-2 active:scale-95 transition-all" onClick={() => router.push(`/listings/${listingId}/edit`)}>
              <Edit className="w-4 h-4" />
              {t('listing.edit')}
          </AmberButton>
          <AmberButton
            variant="secondary"
            className="h-11 text-danger border-danger/20 hover:bg-danger/10 rounded-xl px-4 gap-2 active:scale-95 transition-all"
            onClick={() => openConfirm({
              title: t('listing.delete') || 'Delete Listing',
              message: t('listing.delete_confirm') || 'Are you sure?',
              onConfirm: () => { deleteMutation.mutate(Number(listingId)); router.push('/listings'); },
              variant: 'danger',
            })}
          >
            <Trash2 className="w-4 h-4" />
          </AmberButton>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Images Column */}
        <div className="lg:col-span-1 space-y-8">
          {/* Media Card */}
          <Card className="!p-8 bg-obsidian-card border-border shadow-xl space-y-6">
            <div className="flex items-center gap-3 border-b border-white/[0.03] pb-6">
              <div className="w-10 h-10 rounded-lg bg-info/10 flex items-center justify-center text-info border border-info/20">
                <ImageIcon className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-black text-zinc-text uppercase tracking-[0.25em]">{t('listing.detail.media')}</h3>
            </div>
            {attachmentCount > 0 ? (
              <div className="space-y-2">
                <ListingImage listing={listing} className="aspect-square rounded-lg overflow-hidden border border-white/5" />
                {listing.attachmentIds?.length > 1 && (
                  <p className="text-[10px] text-zinc-muted font-bold text-center">
                    {listing.attachmentIds.length} {t('listing.detail.media') || 'photos'}
                  </p>
                )}
              </div>
            ) : (
              <div className="aspect-square bg-obsidian-outer rounded-lg flex items-center justify-center border border-white/5">
                <Package className="w-10 h-10 text-zinc-muted/30" />
              </div>
            )}
          </Card>

          {/* Quick Deploy Card */}
          <div className="p-5 rounded-2xl bg-brand/[0.02] border border-brand/10 flex items-start gap-4">
            <div className="w-8 h-8 rounded-full bg-brand/10 flex items-center justify-center shrink-0">
              <Rocket className="w-4 h-4 text-brand" />
            </div>
            <div className="space-y-1">
              <p className="text-xs font-black text-brand uppercase">{t('listing.deploy.title')}</p>
              {nextScheduleInfo ? (
                <p className="text-[11px] text-zinc-muted font-bold tracking-tight">
                  {nextScheduleInfo.type === 'ending'
                    ? `${t('listing.detail.next_ending')}: ${(() => { const r = getCountdown(nextScheduleInfo.time); return r === 'ENDED' ? (t('TIME.ENDED') || 'Ended') : r; })()}`
                    : `${t('listing.detail.next_starting')}: ${getStartsIn(nextScheduleInfo.time)}`
                  }
                </p>
              ) : (
                <p className="text-[11px] text-zinc-muted font-bold tracking-tight">
                  {t('listing.deploy.choose')}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Details Column */}
        <div className="lg:col-span-2 space-y-8">
          {/* Product Info Card */}
          <Card className="!p-8 bg-obsidian-card border-border shadow-xl space-y-8">
            <div className="flex items-center gap-3 border-b border-white/[0.03] pb-6">
              <div className="w-10 h-10 rounded-lg bg-brand/10 flex items-center justify-center text-brand border border-brand/20">
                <Package className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-black text-zinc-text uppercase tracking-[0.25em]">{t('listing.detail.product_info')}</h3>
            </div>

            <p className="text-zinc-muted text-sm leading-relaxed">{listing.description || t('listing.detail.no_description')}</p>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              {listing.brand && <DetailField label={t('listing.form.brand')} value={listing.brand} />}
              {listing.model && <DetailField label={t('listing.form.model')} value={listing.model} />}
              {listing.condition && (
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-zinc-muted uppercase tracking-widest">{t('listing.form.condition')}</p>
                  <StatusBadge
                    status={listing.condition}
                    variant={listing.condition === 'new' ? 'success' : listing.condition === 'used' ? 'warning' : 'info'}
                    size="sm"
                  />
                </div>
              )}
              {listing.authenticity && <DetailField label={t('listing.form.authenticity')} value={listing.authenticity} />}
              {listing.color && <DetailField label={t('common.color') || 'Color'} value={listing.color} />}
              {listing.sku && <DetailField label={t('listing.form.sku')} value={listing.sku} />}
              {listing.warranty && <DetailField label={t('common.warranty') || 'Warranty'} value={listing.warranty} />}
              {listing.manufacturer && <DetailField label={t('common.manufacturer') || 'Manufacturer'} value={listing.manufacturer} />}
              {listing.origin && <DetailField label={t('common.origin') || 'Origin'} value={listing.origin} />}
            </div>
          </Card>

          {listing.specs && listing.specs.length > 0 && (
            <Card className="!p-8 bg-obsidian-card border-border shadow-xl space-y-4">
              <h3 className="text-sm font-black text-zinc-text uppercase tracking-[0.25em]">
                {t('auction.detail.specifications')}
              </h3>
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {listing.specs.map((spec, idx) => (
                  <div key={idx} className="space-y-1">
                    <dt className="text-[10px] font-black text-zinc-muted uppercase tracking-widest">{spec.label}</dt>
                    <dd className="text-sm font-bold text-zinc-text">{spec.value}</dd>
                  </div>
                ))}
              </dl>
            </Card>
          )}

          {listing.sources && listing.sources.length > 0 && (
            <Card className="!p-8 bg-obsidian-card border-border shadow-xl space-y-4">
              <h3 className="text-sm font-black text-zinc-text uppercase tracking-[0.25em]">
                {t('auction.detail.sources')}
              </h3>
              <ul className="space-y-2">
                {listing.sources.map((source, idx) => (
                  <li key={idx}>
                    <a
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-bold text-brand hover:underline flex items-center gap-2"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      {source.label || source.url}
                    </a>
                  </li>
                ))}
              </ul>
            </Card>
          )}

          {/* Publish Channels Grid */}
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center text-success border border-success/20">
                <Rocket className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-black text-zinc-text uppercase tracking-[0.25em]">{t('listing.channels.title')}</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Auction Channel Card */}
              <Card className="!p-6 bg-obsidian-card border-border shadow-xl space-y-5">
                <div className="flex items-center gap-3 border-b border-white/[0.03] pb-4">
                  <div className="w-9 h-9 rounded-lg bg-brand/10 flex items-center justify-center text-brand border border-brand/20">
                    <Gavel className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-zinc-text uppercase tracking-wider">{t('listing.channels.auction')}</h4>
                    <p className="text-[10px] text-zinc-muted font-bold tracking-tight">
                      {sortedAuctions.length > 0
                        ? [
                            sortedAuctions.filter((a: any) => a.status === 'active').length > 0 ? t('listing.channels.active_count').replace('{count}', String(sortedAuctions.filter((a: any) => a.status === 'active').length)) : '',
                            sortedAuctions.filter((a: any) => a.status === 'scheduled' || a.status === 'draft').length > 0 ? t('listing.channels.scheduled_count').replace('{count}', String(sortedAuctions.filter((a: any) => a.status === 'scheduled' || a.status === 'draft').length)) : '',
                            sortedAuctions.filter((a: any) => a.status === 'ended' || a.status === 'cancelled').length > 0 ? t('listing.channels.ended_count').replace('{count}', String(sortedAuctions.filter((a: any) => a.status === 'ended' || a.status === 'cancelled').length)) : '',
                          ].filter(Boolean).join(' · ')
                        : t('listing.channels.not_published')
                      }
                    </p>
                  </div>
                </div>

                {sortedAuctions.length > 0 ? (
                  <div className="space-y-2 max-h-[320px] overflow-y-auto">
                    {sortedAuctions.map((auction: any) => {
                      const isActive = auction.status === 'active';
                      const isScheduled = auction.status === 'scheduled' || auction.status === 'draft';
                      const row = (
                        <div className="flex items-center gap-3 p-3 rounded-xl bg-obsidian-outer border border-white/5 hover:border-brand/20 transition-all cursor-pointer group">
                          <Gavel className="w-4 h-4 text-brand shrink-0" />
                          <div className="flex-1 min-w-0">
                            <span className="text-sm text-zinc-text font-bold truncate block">{auction.title}</span>
                            {(auction.startTime || auction.endTime) && (
                              <div className="flex items-center gap-3 mt-1">
                                {auction.startTime && (
                                  <span className="text-[10px] text-zinc-muted font-bold flex items-center gap-1">
                                    <Calendar className="w-2.5 h-2.5" />
                                    {new Date(auction.startTime).toLocaleDateString(dir === 'rtl' ? 'ar-IQ' : 'en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                  </span>
                                )}
                                {isActive && auction.endTime && (
                                  <span className="text-[10px] text-danger font-black flex items-center gap-1">
                                    <Timer className="w-2.5 h-2.5" />
                                    {(() => { const r = getCountdown(auction.endTime); return r === 'ENDED' ? (t('TIME.ENDED') || 'Ended') : r; })()}
                                  </span>
                                )}
                                {isScheduled && auction.startTime && getStartsIn(auction.startTime) && (
                                  <span className="text-[10px] text-warning font-black flex items-center gap-1">
                                    <Clock className="w-2.5 h-2.5" />
                                    {t('listing.detail.starts_in')}: {getStartsIn(auction.startTime)}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                          <StatusBadge
                            status={auction.status}
                            variant={auction.status === 'active' ? 'success' : auction.status === 'ended' || auction.status === 'cancelled' ? 'failed' : 'warning'}
                            size="sm"
                          />
                          <ExternalLink className="w-3 h-3 text-zinc-muted group-hover:text-brand transition-colors shrink-0" />
                        </div>
                      );
                      return isSafePathResourceId(auction.id) ? (
                        <Link key={auction.id} href={`/auctions/${auction.id}`}>
                          {row}
                        </Link>
                      ) : (
                        <div key={String(auction.id ?? auction.title)} className="opacity-80">
                          {row}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <div className="w-12 h-12 rounded-full bg-white/[0.02] flex items-center justify-center mx-auto border border-white/[0.05]">
                      <Gavel className="w-6 h-6 text-zinc-muted/20" />
                    </div>
                  </div>
                )}

                {!sortedAuctions.some((a: any) => a.status === 'active') && (
                  <AmberButton
                    className="w-full h-10 bg-brand text-black font-black rounded-xl px-6 gap-2 border-none active:scale-95 transition-all"
                    onClick={() => router.push(`/listings/${listingId}/publish?type=auction`)}
                  >
                    <Plus className="w-4 h-4" />
                    {t('listing.channels.new_auction')}
                  </AmberButton>
                )}
              </Card>

              {/* Group Buy Channel Card */}
              <Card className="!p-6 bg-obsidian-card border-border shadow-xl space-y-5">
                <div className="flex items-center gap-3 border-b border-white/[0.03] pb-4">
                  <div className="w-9 h-9 rounded-lg bg-info/10 flex items-center justify-center text-info border border-info/20">
                    <Users className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-zinc-text uppercase tracking-wider">{t('listing.channels.group_buy')}</h4>
                    <p className="text-[10px] text-zinc-muted font-bold tracking-tight">
                      {sortedDeals.length > 0
                        ? [
                            sortedDeals.filter((d: any) => d.status === 'active').length > 0 ? t('listing.channels.active_count').replace('{count}', String(sortedDeals.filter((d: any) => d.status === 'active').length)) : '',
                            sortedDeals.filter((d: any) => d.status === 'scheduled' || d.status === 'draft').length > 0 ? t('listing.channels.scheduled_count').replace('{count}', String(sortedDeals.filter((d: any) => d.status === 'scheduled' || d.status === 'draft').length)) : '',
                            sortedDeals.filter((d: any) => d.status === 'ended' || d.status === 'cancelled').length > 0 ? t('listing.channels.ended_count').replace('{count}', String(sortedDeals.filter((d: any) => d.status === 'ended' || d.status === 'cancelled').length)) : '',
                          ].filter(Boolean).join(' · ')
                        : t('listing.channels.not_published')
                      }
                    </p>
                  </div>
                </div>

                {sortedDeals.length > 0 ? (
                  <div className="space-y-2 max-h-[320px] overflow-y-auto">
                    {sortedDeals.map((deal: any) => {
                      const isActive = deal.status === 'active';
                      const isScheduled = deal.status === 'scheduled' || deal.status === 'draft';
                      const row = (
                        <div className="flex items-center gap-3 p-3 rounded-xl bg-obsidian-outer border border-white/5 hover:border-info/20 transition-all cursor-pointer group">
                          <Users className="w-4 h-4 text-info shrink-0" />
                          <div className="flex-1 min-w-0">
                            <span className="text-sm text-zinc-text font-bold truncate block">{deal.title}</span>
                            {(deal.startTime || deal.endTime) && (
                              <div className="flex items-center gap-3 mt-1">
                                {deal.startTime && (
                                  <span className="text-[10px] text-zinc-muted font-bold flex items-center gap-1">
                                    <Calendar className="w-2.5 h-2.5" />
                                    {new Date(deal.startTime).toLocaleDateString(dir === 'rtl' ? 'ar-IQ' : 'en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                  </span>
                                )}
                                {isActive && deal.endTime && (
                                  <span className="text-[10px] text-danger font-black flex items-center gap-1">
                                    <Timer className="w-2.5 h-2.5" />
                                    {(() => { const r = getCountdown(deal.endTime); return r === 'ENDED' ? (t('TIME.ENDED') || 'Ended') : r; })()}
                                  </span>
                                )}
                                {isScheduled && deal.startTime && getStartsIn(deal.startTime) && (
                                  <span className="text-[10px] text-warning font-black flex items-center gap-1">
                                    <Clock className="w-2.5 h-2.5" />
                                    {t('listing.detail.starts_in')}: {getStartsIn(deal.startTime)}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                          <StatusBadge
                            status={deal.status}
                            variant={deal.status === 'active' ? 'success' : 'warning'}
                            size="sm"
                          />
                          <ExternalLink className="w-3 h-3 text-zinc-muted group-hover:text-info transition-colors shrink-0" />
                        </div>
                      );
                      return isSafePathResourceId(deal.id) ? (
                        <Link key={deal.id} href={`/group-buying/${deal.id}`}>
                          {row}
                        </Link>
                      ) : (
                        <div key={String(deal.id ?? deal.title)} className="opacity-80">
                          {row}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <div className="w-12 h-12 rounded-full bg-white/[0.02] flex items-center justify-center mx-auto border border-white/[0.05]">
                      <Users className="w-6 h-6 text-zinc-muted/20" />
                    </div>
                  </div>
                )}

                {!sortedDeals.some((d: any) => d.status === 'active') && (
                  <AmberButton
                    className="w-full h-10 bg-info text-white font-black rounded-xl px-6 gap-2 border-none active:scale-95 transition-all"
                    onClick={() => router.push(`/listings/${listingId}/publish?type=group-buy`)}
                  >
                    <Plus className="w-4 h-4" />
                    {t('listing.channels.new_deal')}
                  </AmberButton>
                )}
              </Card>
            </div>
          </div>
        </div>
      </div>
      <ConfirmModal />
    </div>
  );
};

function DetailField({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1">
      <p className="text-[10px] font-black text-zinc-muted uppercase tracking-widest">{label}</p>
      <p className="text-sm text-zinc-text font-bold">{value}</p>
    </div>
  );
}

export default ListingDetailPage;
