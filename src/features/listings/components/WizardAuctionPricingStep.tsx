import { ChevronDown, Gavel } from 'lucide-react';
import { cn } from '@core/lib/utils/cn';
import { FormSection } from '@core/components/FormSection';
import { IqdSymbol } from '@core/components/IqdSymbol';
import { IqdPriceInput } from '@core/components/IqdPriceInput';
import { FieldHelpHint } from './FieldHelpHint';
import { AuctionTemporalSection } from '../../auctions/components/AuctionTemporalSection';

interface WizardAuctionPricingStepProps {
  t: (key: string) => string;
  isRTL: boolean;
  isMobile: boolean;
  showAdvancedPricing: boolean;
  setShowAdvancedPricing: (updater: (open: boolean) => boolean) => void;
  auctionPricing: {
    startPrice: number;
    originalPrice: string;
    bidIncrement: number;
    startTime: string;
    endTime: string;
    durationDays: number;
  };
  setAuctionPricing: (
    updater: (prev: WizardAuctionPricingStepProps['auctionPricing']) => WizardAuctionPricingStepProps['auctionPricing'],
  ) => void;
  fieldErrors: Record<string, string>;
  setFieldErrors: (
    updater: (prev: Record<string, string>) => Record<string, string>,
  ) => void;
  auctionDurationDays: number;
  auctionUseDurationMode: boolean;
  auctionComputedEndTime: string;
  setAuctionDurationDays: (days: number) => void;
  setAuctionUseDurationMode: (mode: boolean) => void;
}

export function WizardAuctionPricingStep({
  t,
  isRTL,
  isMobile,
  showAdvancedPricing,
  setShowAdvancedPricing,
  auctionPricing,
  setAuctionPricing,
  fieldErrors,
  setFieldErrors,
  auctionDurationDays,
  auctionUseDurationMode,
  auctionComputedEndTime,
  setAuctionDurationDays,
  setAuctionUseDurationMode,
}: WizardAuctionPricingStepProps) {
  return (
    <FormSection icon={<Gavel className="w-5 h-5" />} iconBgColor="brand" title={t('listing.deploy.auction_settings')}>
      <div className="space-y-6">
        <IqdPriceInput
          label={t('listing.deploy.start_price')}
          value={auctionPricing.startPrice}
          onChange={(v) => {
            setFieldErrors((p) => {
              const n = { ...p };
              delete n.startPrice;
              return n;
            });
            setAuctionPricing((prev) => ({ ...prev, startPrice: v }));
          }}
          denomination="thousand"
          icon={<IqdSymbol />}
          error={fieldErrors.startPrice}
          rightElement={<FieldHelpHint text={t('listing.deploy.hint.start_price')} />}
        />

        {isMobile ? (
          <>
            <button
              type="button"
              onClick={() => setShowAdvancedPricing((open) => !open)}
              className={cn(
                'w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl border border-white/10 bg-white/[0.02] hover:bg-white/5 transition-colors',
                isRTL && 'flex-row-reverse',
              )}
            >
              <span className="text-[11px] font-black text-zinc-muted uppercase tracking-widest">
                {t('listing.wizard.advanced_pricing')}
              </span>
              <ChevronDown
                className={cn(
                  'w-4 h-4 text-zinc-muted transition-transform',
                  showAdvancedPricing && 'rotate-180',
                )}
              />
            </button>

            {showAdvancedPricing && (
              <div className="space-y-6 pt-2 border-t border-white/5">
                <AdvancedAuctionFields
                  t={t}
                  auctionPricing={auctionPricing}
                  setAuctionPricing={setAuctionPricing}
                  fieldErrors={fieldErrors}
                  setFieldErrors={setFieldErrors}
                />
              </div>
            )}
          </>
        ) : (
          <AdvancedAuctionFields
            t={t}
            auctionPricing={auctionPricing}
            setAuctionPricing={setAuctionPricing}
            fieldErrors={fieldErrors}
            setFieldErrors={setFieldErrors}
          />
        )}
      </div>

      <div className="mt-6">
        <AuctionTemporalSection
          labels={{
            section: t('listing.deploy.mode_schedule'),
            start: t('listing.deploy.start_time'),
            end: t('listing.deploy.end_time'),
            duration: t('listing.deploy.duration_days'),
          }}
          startTime={auctionPricing.startTime}
          endTime={auctionPricing.endTime}
          errors={fieldErrors}
          durationDays={auctionDurationDays}
          useDurationMode={auctionUseDurationMode}
          computedEndTime={auctionComputedEndTime}
          onStartTimeChange={(val) => {
            setFieldErrors((p) => {
              const n = { ...p };
              delete n.startTime;
              delete n.endTime;
              return n;
            });
            setAuctionPricing((prev) => ({ ...prev, startTime: val }));
          }}
          onEndTimeChange={(val) => {
            setFieldErrors((p) => {
              const n = { ...p };
              delete n.endTime;
              return n;
            });
            setAuctionPricing((prev) => ({ ...prev, endTime: val }));
          }}
          onDurationDaysChange={(days) => {
            setAuctionDurationDays(days);
            setAuctionPricing((prev) => ({ ...prev, durationDays: days }));
          }}
          onUseDurationModeChange={setAuctionUseDurationMode}
        />
      </div>
    </FormSection>
  );
}

interface AdvancedAuctionFieldsProps {
  t: (key: string) => string;
  auctionPricing: WizardAuctionPricingStepProps['auctionPricing'];
  setAuctionPricing: WizardAuctionPricingStepProps['setAuctionPricing'];
  fieldErrors: Record<string, string>;
  setFieldErrors: WizardAuctionPricingStepProps['setFieldErrors'];
}

function AdvancedAuctionFields({
  t,
  auctionPricing,
  setAuctionPricing,
  fieldErrors,
  setFieldErrors,
}: AdvancedAuctionFieldsProps) {
  return (
    <>
      <IqdPriceInput
        label={t('listing.deploy.auction_original_price')}
        value={auctionPricing.originalPrice ? Number(auctionPricing.originalPrice) : 0}
        onChange={(v) => {
          setFieldErrors((p) => {
            const n = { ...p };
            delete n.originalPrice;
            return n;
          });
          setAuctionPricing((prev) => ({ ...prev, originalPrice: String(v) }));
        }}
        denomination="thousand"
        icon={<IqdSymbol />}
        error={fieldErrors.originalPrice}
        rightElement={<FieldHelpHint text={t('listing.deploy.hint.auction_original_price')} />}
      />
      <IqdPriceInput
        label={t('listing.deploy.bid_increment')}
        value={auctionPricing.bidIncrement}
        onChange={(v) => {
          setFieldErrors((p) => {
            const n = { ...p };
            delete n.bidIncrement;
            return n;
          });
          setAuctionPricing((prev) => ({ ...prev, bidIncrement: v }));
        }}
        denomination="unit"
        icon={<Gavel className="w-4 h-4" />}
        error={fieldErrors.bidIncrement}
        rightElement={<FieldHelpHint text={t('listing.deploy.hint.bid_increment')} />}
      />
    </>
  );
}
