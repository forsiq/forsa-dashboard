import React, { useState, useEffect } from 'react';
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
} from 'lucide-react';
import { useLanguage } from '@core/contexts/LanguageContext';
import { cn } from '@core/lib/utils/cn';
import { AmberCard as Card } from '@core/components/AmberCard';
import { AmberButton } from '@core/components/AmberButton';
import { StatusBadge } from '@core/components/Data/StatusBadge';
import { useGetListing, useGetListingAuctions, useGetListingDeals, useDeleteListing } from '../api/listing-hooks';
import { useConfirmModal } from '@core/components/Feedback/AmberConfirmModal';

export const ListingDetailPage: React.FC = () => {
  const { t, dir } = useLanguage();
  const router = useRouter();
  const { id } = router.query;
  const isRTL = dir === 'rtl';
  const [isClient, setIsClient] = useState(false);

  useEffect(() => { setIsClient(true); }, []);

  const { data: listing, isLoading } = useGetListing(Number(id), !!id);
  const { data: auctionsData } = useGetListingAuctions(Number(id), !!id);
  const { data: dealsData } = useGetListingDeals(Number(id), !!id);
  const deleteMutation = useDeleteListing();
  const { openConfirm, ConfirmModal } = useConfirmModal();

  const auctions = auctionsData || [];
  const deals = dealsData || [];

  if (!isClient || isLoading) return null;

  if (!listing) {
    return (
      <div className="max-w-6xl mx-auto p-6 text-center py-20" dir={dir}>
        <div className="w-20 h-20 rounded-full bg-white/[0.02] flex items-center justify-center mx-auto border border-white/[0.05]">
          <Package className="w-10 h-10 text-zinc-muted/30" />
        </div>
        <h3 className="text-xl font-black text-zinc-text uppercase tracking-widest mt-6">{t('listing.detail.not_found')}</h3>
        <AmberButton className="mt-6 h-11 px-8 rounded-xl bg-brand text-black font-black uppercase active:scale-95 transition-all" onClick={() => router.push('/listings')}>
            {t('listing.form.cancel')}
        </AmberButton>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700" dir={dir}>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <AmberButton variant="secondary" className="p-0 w-11 h-11 rounded-xl flex items-center justify-center active:scale-95 transition-all bg-obsidian-card border-border" onClick={() => router.push('/listings')}>
              <ChevronLeft className={cn("w-5 h-5", isRTL && "rotate-180")} />
          </AmberButton>
          <div>
            <h1 className="text-3xl font-black text-zinc-text tracking-tighter uppercase leading-none">
              {listing.title}
            </h1>
            <p className="text-sm text-zinc-muted font-bold tracking-tight uppercase mt-1">
              {listing.brand ? `${listing.brand}${listing.model ? ` ${listing.model}` : ''}` : ''}
              {listing.condition ? ` - ${listing.condition}` : ''}
              {listing.sku ? ` | SKU: ${listing.sku}` : ''}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          <AmberButton variant="outline" className="h-11 border-border font-bold rounded-xl px-6 gap-2 active:scale-95 transition-all" onClick={() => router.push(`/listings/${id}/edit`)}>
              <Edit className="w-4 h-4" />
              {t('listing.edit')}
          </AmberButton>
          <AmberButton className="h-11 bg-brand hover:bg-brand text-black font-black rounded-xl px-6 gap-2 border-none active:scale-95 transition-all" onClick={() => router.push(`/listings/${id}/deploy?type=auction`)}>
              <Gavel className="w-4 h-4" />
              {t('listing.detail.deploy_auction')}
          </AmberButton>
          <AmberButton className="h-11 bg-info hover:bg-info text-white font-black rounded-xl px-6 gap-2 border-none active:scale-95 transition-all" onClick={() => router.push(`/listings/${id}/deploy?type=group-buy`)}>
              <Users className="w-4 h-4" />
              {t('listing.detail.deploy_group_buy')}
          </AmberButton>
          <AmberButton
            variant="secondary"
            className="h-11 text-danger border-danger/20 hover:bg-danger/10 rounded-xl px-4 gap-2 active:scale-95 transition-all"
            onClick={() => openConfirm({
              title: t('listing.delete') || 'Delete Listing',
              message: t('listing.delete_confirm') || 'Are you sure?',
              onConfirm: () => { deleteMutation.mutate(Number(id)); router.push('/listings'); },
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
            {listing.images?.length > 0 ? (
              <div className="grid grid-cols-2 gap-2">
                {listing.images.map((img, idx) => (
                  <div key={idx} className="aspect-square rounded-lg overflow-hidden border border-white/5">
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </div>
                ))}
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
              <p className="text-[11px] text-zinc-muted font-bold tracking-tight">
                {t('listing.deploy.choose')}
              </p>
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

          {/* Deployed Sales Card */}
          <Card className="!p-8 bg-obsidian-card border-border shadow-xl space-y-8">
            <div className="flex items-center gap-3 border-b border-white/[0.03] pb-6">
              <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center text-success border border-success/20">
                <Gavel className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-black text-zinc-text uppercase tracking-[0.25em]">{t('listing.detail.deployed_sales')}</h3>
            </div>

            {auctions.length === 0 && deals.length === 0 ? (
              <div className="text-center py-8 space-y-4">
                <div className="w-16 h-16 rounded-full bg-white/[0.02] flex items-center justify-center mx-auto border border-white/[0.05]">
                  <Rocket className="w-8 h-8 text-zinc-muted/20" />
                </div>
                <p className="text-sm text-zinc-muted font-bold">{t('listing.detail.no_sales')}</p>
                <div className="flex gap-3 justify-center">
                  <AmberButton className="h-10 bg-brand text-black font-black rounded-xl px-6 gap-2 border-none active:scale-95 transition-all" onClick={() => router.push(`/listings/${id}/deploy?type=auction`)}>
                      <Gavel className="w-4 h-4" />
                      {t('listing.detail.deploy_auction')}
                  </AmberButton>
                  <AmberButton className="h-10 bg-info text-white font-black rounded-xl px-6 gap-2 border-none active:scale-95 transition-all" onClick={() => router.push(`/listings/${id}/deploy?type=group-buy`)}>
                      <Users className="w-4 h-4" />
                      {t('listing.detail.deploy_group_buy')}
                  </AmberButton>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {/* Linked Auctions */}
                {auctions.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-[10px] font-black text-zinc-muted uppercase tracking-widest flex items-center gap-2">
                      <Gavel className="w-3 h-3 text-brand" /> {t('listing.detail.linked_auctions')}
                    </h4>
                    {auctions.map((auction: any) => (
                      <Link key={auction.id} href={`/auctions/${auction.id}`}>
                        <div className="flex items-center gap-3 p-3 rounded-xl bg-obsidian-outer border border-white/5 hover:border-brand/20 transition-all cursor-pointer group">
                          <Gavel className="w-4 h-4 text-brand" />
                          <span className="text-sm text-zinc-text font-bold">{auction.title}</span>
                          <StatusBadge
                            status={auction.status}
                            variant={auction.status === 'active' ? 'success' : auction.status === 'ended' ? 'failed' : 'warning'}
                            size="sm"
                          />
                          <ExternalLink className="w-3 h-3 text-zinc-muted group-hover:text-brand transition-colors ml-auto" />
                        </div>
                      </Link>
                    ))}
                  </div>
                )}

                {/* Linked Deals */}
                {deals.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-[10px] font-black text-zinc-muted uppercase tracking-widest flex items-center gap-2">
                      <Users className="w-3 h-3 text-info" /> {t('listing.detail.linked_deals')}
                    </h4>
                    {deals.map((deal: any) => (
                      <Link key={deal.id} href={`/group-buying/${deal.id}`}>
                        <div className="flex items-center gap-3 p-3 rounded-xl bg-obsidian-outer border border-white/5 hover:border-info/20 transition-all cursor-pointer group">
                          <Users className="w-4 h-4 text-info" />
                          <span className="text-sm text-zinc-text font-bold">{deal.title}</span>
                          <StatusBadge
                            status={deal.status}
                            variant={deal.status === 'active' ? 'success' : 'warning'}
                            size="sm"
                          />
                          <ExternalLink className="w-3 h-3 text-zinc-muted group-hover:text-info transition-colors ml-auto" />
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}
          </Card>
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
