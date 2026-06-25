import { Rocket } from 'lucide-react';
import { FormSection } from '@core/components/FormSection';
import { AmberImageGallery } from '@core/components/AmberImageGallery';

type DeployChannel = 'auction' | 'group_buy' | null;

interface WizardPublishReviewProps {
  t: (key: string) => string;
  dir: 'ltr' | 'rtl';
  catalogTitle: string;
  deployChannel: DeployChannel;
  wizardGalleryImages: string[];
  auctionPricing: {
    startPrice: number;
    originalPrice: string;
    startTime: string;
    endTime: string;
  };
  groupBuyPricing: {
    originalPrice: number;
    dealPrice: number;
    minParticipants: number;
    maxParticipants: number;
    startTime: string;
    endTime: string;
  };
  auctionUseDurationMode: boolean;
  auctionComputedEndTime: string;
  groupBuyUseDurationMode: boolean;
  groupBuyComputedEndTime: string;
}

export function WizardPublishReview({
  t,
  dir,
  catalogTitle,
  deployChannel,
  wizardGalleryImages,
  auctionPricing,
  groupBuyPricing,
  auctionUseDurationMode,
  auctionComputedEndTime,
  groupBuyUseDurationMode,
  groupBuyComputedEndTime,
}: WizardPublishReviewProps) {
  const locale = dir === 'rtl' ? 'ar-IQ' : 'en-US';

  return (
    <FormSection icon={<Rocket className="w-5 h-5" />} iconBgColor="brand" title={t('listing.wizard.step.publish')}>
      <div className="space-y-6 text-sm">
        {wizardGalleryImages.length > 0 && (
          <AmberImageGallery
            images={wizardGalleryImages}
            alt={catalogTitle}
            height="h-[180px] md:h-[220px]"
            thumbnailCols="grid-cols-5 sm:grid-cols-6"
          />
        )}
        <div>
          <p className="text-[11px] font-black text-zinc-muted uppercase tracking-widest">{t('listing.form.title')}</p>
          <p className="font-bold text-zinc-text">{catalogTitle}</p>
        </div>
        <div>
          <p className="text-[11px] font-black text-zinc-muted uppercase tracking-widest">{t('listing.wizard.step.channel')}</p>
          <p className="font-bold text-zinc-text">
            {deployChannel === 'auction' ? t('listing.deploy.as_auction') : t('listing.deploy.as_group_buy')}
          </p>
        </div>
        {deployChannel === 'auction' && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-[11px] text-zinc-muted uppercase">{t('listing.deploy.start_price')}</p>
              <p className="font-black">{auctionPricing.startPrice}</p>
            </div>
            {auctionPricing.originalPrice && (
              <div>
                <p className="text-[11px] text-zinc-muted uppercase">{t('listing.deploy.auction_original_price')}</p>
                <p className="font-black">{auctionPricing.originalPrice}</p>
              </div>
            )}
            <div>
              <p className="text-[11px] text-zinc-muted uppercase">{t('listing.deploy.start_time')}</p>
              <p className="font-black text-xs sm:text-sm">
                {auctionPricing.startTime
                  ? new Date(auctionPricing.startTime).toLocaleString(locale)
                  : '—'}
              </p>
            </div>
            <div>
              <p className="text-[11px] text-zinc-muted uppercase">{t('listing.deploy.end_time')}</p>
              <p className="font-black text-xs sm:text-sm">
                {(auctionUseDurationMode ? auctionComputedEndTime : auctionPricing.endTime)
                  ? new Date(auctionUseDurationMode ? auctionComputedEndTime : auctionPricing.endTime).toLocaleString(locale)
                  : '—'}
              </p>
            </div>
          </div>
        )}
        {deployChannel === 'group_buy' && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-[11px] text-zinc-muted uppercase">{t('listing.deploy.original_price')}</p>
              <p className="font-black">{groupBuyPricing.originalPrice}</p>
            </div>
            <div>
              <p className="text-[11px] text-zinc-muted uppercase">{t('listing.deploy.deal_price')}</p>
              <p className="font-black">{groupBuyPricing.dealPrice}</p>
            </div>
            <div>
              <p className="text-[11px] text-zinc-muted uppercase">{t('listing.deploy.min_participants')}</p>
              <p className="font-black">{groupBuyPricing.minParticipants} – {groupBuyPricing.maxParticipants}</p>
            </div>
            <div>
              <p className="text-[11px] text-zinc-muted uppercase">{t('listing.deploy.start_time')}</p>
              <p className="font-black text-xs sm:text-sm">
                {groupBuyPricing.startTime
                  ? new Date(groupBuyPricing.startTime).toLocaleString(locale)
                  : '—'}
              </p>
            </div>
            <div>
              <p className="text-[11px] text-zinc-muted uppercase">{t('listing.deploy.end_time')}</p>
              <p className="font-black text-xs sm:text-sm">
                {(groupBuyUseDurationMode ? groupBuyComputedEndTime : groupBuyPricing.endTime)
                  ? new Date(groupBuyUseDurationMode ? groupBuyComputedEndTime : groupBuyPricing.endTime).toLocaleString(locale)
                  : '—'}
              </p>
            </div>
          </div>
        )}
        <p className="text-[11px] text-zinc-muted font-bold">{t('listing.wizard.review_publish_active')}</p>
      </div>
    </FormSection>
  );
}
