import { Users } from 'lucide-react';
import { FormSection } from '@core/components/FormSection';
import { AmberInput } from '@core/components/AmberInput';
import { IqdSymbol } from '@core/components/IqdSymbol';
import { IqdPriceInput } from '@core/components/IqdPriceInput';
import { AuctionTemporalSection } from '../../auctions/components/AuctionTemporalSection';

interface WizardGroupBuyPricingStepProps {
  t: (key: string) => string;
  groupBuyPricing: {
    originalPrice: number;
    dealPrice: number;
    minParticipants: number;
    maxParticipants: number;
    startTime: string;
    endTime: string;
    durationDays: number;
  };
  setGroupBuyPricing: (
    updater: (prev: WizardGroupBuyPricingStepProps['groupBuyPricing']) => WizardGroupBuyPricingStepProps['groupBuyPricing'],
  ) => void;
  fieldErrors: Record<string, string>;
  setFieldErrors: (
    updater: (prev: Record<string, string>) => Record<string, string>,
  ) => void;
  groupBuyDurationDays: number;
  groupBuyUseDurationMode: boolean;
  groupBuyComputedEndTime: string;
  setGroupBuyDurationDays: (days: number) => void;
  setGroupBuyUseDurationMode: (mode: boolean) => void;
}

export function WizardGroupBuyPricingStep({
  t,
  groupBuyPricing,
  setGroupBuyPricing,
  fieldErrors,
  setFieldErrors,
  groupBuyDurationDays,
  groupBuyUseDurationMode,
  groupBuyComputedEndTime,
  setGroupBuyDurationDays,
  setGroupBuyUseDurationMode,
}: WizardGroupBuyPricingStepProps) {
  return (
    <FormSection icon={<Users className="w-5 h-5" />} iconBgColor="info" title={t('listing.deploy.group_buy_settings')}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <IqdPriceInput
          label={t('listing.deploy.original_price')}
          value={groupBuyPricing.originalPrice}
          onChange={(v) => {
            setFieldErrors((p) => {
              const n = { ...p };
              delete n.originalPrice;
              return n;
            });
            setGroupBuyPricing((p) => ({ ...p, originalPrice: v }));
          }}
          denomination="thousand"
          icon={<IqdSymbol />}
          error={fieldErrors.originalPrice}
        />
        <IqdPriceInput
          label={t('listing.deploy.deal_price')}
          value={groupBuyPricing.dealPrice}
          onChange={(v) => {
            setFieldErrors((p) => {
              const n = { ...p };
              delete n.dealPrice;
              return n;
            });
            setGroupBuyPricing((p) => ({ ...p, dealPrice: v }));
          }}
          denomination="thousand"
          error={fieldErrors.dealPrice}
        />
        <AmberInput
          label={t('listing.deploy.min_participants')}
          type="number"
          value={groupBuyPricing.minParticipants}
          onChange={(e) => {
            setFieldErrors((p) => {
              const n = { ...p };
              delete n.minParticipants;
              delete n.maxParticipants;
              return n;
            });
            setGroupBuyPricing((p) => ({ ...p, minParticipants: Number(e.target.value) }));
          }}
          error={fieldErrors.minParticipants}
        />
        <AmberInput
          label={t('listing.deploy.max_participants')}
          type="number"
          value={groupBuyPricing.maxParticipants}
          onChange={(e) => {
            setFieldErrors((p) => {
              const n = { ...p };
              delete n.minParticipants;
              delete n.maxParticipants;
              return n;
            });
            setGroupBuyPricing((p) => ({ ...p, maxParticipants: Number(e.target.value) }));
          }}
          error={fieldErrors.maxParticipants}
        />
      </div>

      <div className="mt-6">
        <AuctionTemporalSection
          labels={{
            section: t('listing.deploy.mode_schedule'),
            start: t('listing.deploy.start_time'),
            end: t('listing.deploy.end_time'),
            duration: t('listing.deploy.duration_days'),
          }}
          startTime={groupBuyPricing.startTime}
          endTime={groupBuyPricing.endTime}
          errors={fieldErrors}
          durationDays={groupBuyDurationDays}
          useDurationMode={groupBuyUseDurationMode}
          computedEndTime={groupBuyComputedEndTime}
          onStartTimeChange={(val) => {
            setFieldErrors((p) => {
              const n = { ...p };
              delete n.startTime;
              delete n.endTime;
              return n;
            });
            setGroupBuyPricing((prev) => ({ ...prev, startTime: val }));
          }}
          onEndTimeChange={(val) => {
            setFieldErrors((p) => {
              const n = { ...p };
              delete n.endTime;
              return n;
            });
            setGroupBuyPricing((prev) => ({ ...prev, endTime: val }));
          }}
          onDurationDaysChange={(days) => {
            setGroupBuyDurationDays(days);
            setGroupBuyPricing((prev) => ({ ...prev, durationDays: days }));
          }}
          onUseDurationModeChange={setGroupBuyUseDurationMode}
        />
      </div>
    </FormSection>
  );
}
