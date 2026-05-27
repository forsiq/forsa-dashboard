import React from 'react';
import { TrendingUp, Gavel, History, Info } from 'lucide-react';
import { useLanguage } from '@core/contexts/LanguageContext';
import { FormSection } from '@core/components/FormSection';
import { IqdSymbol } from '@core/components/IqdSymbol';
import { IqdPriceInput } from '@core/components/IqdPriceInput';

interface AuctionPricingFieldsProps {
  startPrice: number | undefined;
  bidIncrement: number | undefined;
  reservePrice: number | undefined;
  errors: Record<string, string>;
  onChange: (field: string, value: any) => void;
}

export const AuctionPricingFields: React.FC<AuctionPricingFieldsProps> = ({
  startPrice,
  bidIncrement,
  reservePrice,
  errors,
  onChange,
}) => {
  const { t } = useLanguage();

  return (
    <FormSection icon={<IqdSymbol className="text-sm" />} iconBgColor="success" title={t('auction.form.section.pricing')}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <IqdPriceInput
          label={t('auction.form.fields.start_price')}
          value={startPrice ?? 0}
          onChange={(v) => onChange('startPrice', v)}
          denomination="thousand"
          icon={<TrendingUp className="w-4 h-4" />}
          error={errors.startPrice}
        />
        <IqdPriceInput
          label={t('auction.form.fields.bid_increment')}
          value={bidIncrement ?? 0}
          onChange={(v) => onChange('bidIncrement', v)}
          denomination="unit"
          icon={<Gavel className="w-4 h-4" />}
          error={errors.bidIncrement}
        />
        <IqdPriceInput
          label={t('auction.form.fields.reserve_price') || 'Reserve Price'}
          value={reservePrice ?? 0}
          onChange={(v) => onChange('reservePrice', v || undefined)}
          denomination="thousand"
          icon={<History className="w-4 h-4" />}
          error={errors.reservePrice}
        />
      </div>

      <div className="p-5 rounded-2xl bg-emerald-500/[0.02] border border-emerald-500/10 flex items-start gap-4">
        <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0">
          <Info className="w-4 h-4 text-emerald-400" />
        </div>
        <div className="space-y-1">
          <p className="text-sm font-black text-emerald-400 uppercase">{t('auction.form.pricing_note_title')}</p>
          <p className="text-[11px] text-zinc-muted font-bold tracking-tight">{t('auction.form.pricing_note_desc')}</p>
        </div>
      </div>
    </FormSection>
  );
};
