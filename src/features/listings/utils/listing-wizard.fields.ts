import { useMemo } from 'react';
import type { FormFieldConfig } from '@core/services/types';

export function useWizardFormFields(t: (key: string) => string) {
  const essentialFields: FormFieldConfig[] = useMemo(
    () => [
      {
        name: 'title',
        label: t('listing.form.title') || 'Title',
        type: 'text',
        placeholder: t('listing.form.title_placeholder'),
        required: true,
      },
    ],
    [t],
  );

  const advancedFields: FormFieldConfig[] = useMemo(
    () => [
      {
        name: 'model',
        label: t('listing.form.model') || 'Model',
        type: 'text',
        placeholder: t('listing.form.model_placeholder'),
      },
      {
        name: 'condition',
        label: t('listing.form.condition') || 'Condition',
        type: 'select',
        placeholder: t('common.select'),
        options: [
          { label: t('common.condition_new') || 'New', value: 'new' },
          { label: t('common.condition_used') || 'Used', value: 'used' },
          { label: t('common.condition_open_box') || 'Open Box', value: 'open_box' },
          { label: t('common.condition_refurbished') || 'Refurbished', value: 'refurbished' },
        ],
      },
      {
        name: 'authenticity',
        label: t('listing.form.authenticity') || 'Authenticity',
        type: 'select',
        placeholder: t('common.select'),
        options: [
          { label: t('common.authenticity_original') || 'Original', value: 'original' },
          { label: t('common.authenticity_copy') || 'Copy', value: 'copy' },
          { label: t('common.authenticity_high_copy') || 'High Copy', value: 'high_copy' },
        ],
      },
      {
        name: 'sku',
        label: t('listing.form.sku') || 'SKU',
        type: 'text',
        placeholder: t('listing.form.sku_placeholder'),
      },
    ],
    [t],
  );

  const basicFields: FormFieldConfig[] = useMemo(
    () => [...essentialFields, ...advancedFields],
    [essentialFields, advancedFields],
  );

  return { essentialFields, advancedFields, basicFields };
}
