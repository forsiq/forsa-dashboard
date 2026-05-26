import React from 'react';
import { Gavel } from 'lucide-react';
import { useLanguage } from '@core/contexts/LanguageContext';
import { AmberInput } from '@core/components/AmberInput';
import { AmberDropdown } from '@core/components/AmberDropdown';
import { FormSection } from '@core/components/FormSection';
import { CategoryPicker } from '@services/categories/components/CategoryPicker';
import type { FormData } from '../hooks/useAuctionFormState';

interface AuctionCoreFieldsProps {
  formData: FormData;
  errors: Record<string, string>;
  onChange: (field: string, value: any, inventoryItems?: any[]) => void;
  inventoryItems: any[];
  categoryOptions: { label: string; value: string }[];
}

export const AuctionCoreFields: React.FC<AuctionCoreFieldsProps> = ({
  formData,
  errors,
  onChange,
  inventoryItems,
  categoryOptions,
}) => {
  const { t } = useLanguage();

  return (
    <FormSection icon={<Gavel className="w-5 h-5" />} iconBgColor="brand" title={t('auction.form.section.core')}>
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="w-full">
            <AmberDropdown
              label={t('auction.form.inventory_sync')}
              options={[
                { label: t('auction.form.manual_config'), value: '' },
                ...inventoryItems.map((item: any) => ({
                  label: item.name,
                  value: String(item.id),
                })),
              ]}
              value={String(formData.productId || '')}
              onChange={(val) => onChange('productId', val ? Number(val) : undefined)}
            />
          </div>
          <div className="w-full">
            <label className="text-[11px] font-black text-zinc-muted uppercase tracking-widest mb-2 block">
              {t('auction.form.tactical_category') || 'Category'}
            </label>
            <CategoryPicker
              value={formData.categoryId}
              onChange={(id) => onChange('categoryId', id || undefined)}
            />
            {errors.categoryId ? (
              <p className="text-[13px] text-danger font-medium mt-1.5 px-1">{errors.categoryId}</p>
            ) : null}
          </div>
        </div>

        <AmberInput
          label={t('auction.form.fields.title_label')}
          placeholder={t('auction.form.fields.title_placeholder')}
          value={formData.title}
          onChange={(e) => onChange('title', e.target.value)}
          error={errors.title}
        />

        <AmberInput
          label={t('auction.form.fields.desc_label')}
          placeholder={t('auction.form.fields.desc_placeholder')}
          value={formData.description}
          onChange={(e) => onChange('description', e.target.value)}
          multiline
          rows={6}
        />
      </div>
    </FormSection>
  );
};
