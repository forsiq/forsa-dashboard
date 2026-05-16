import React from 'react';
import { Plus, Trash2, FileText } from 'lucide-react';
import { useLanguage } from '@core/contexts/LanguageContext';
import { AmberButton } from '@core/components/AmberButton';
import { AmberInput } from '@core/components/AmberInput';
import { FormSection } from '@core/components/FormSection';
import type { ListingSpec } from '../../../types/services/listings.types';

interface ListingSpecsEditorProps {
  specs: ListingSpec[];
  onChange: (specs: ListingSpec[]) => void;
}

export function ListingSpecsEditor({ specs, onChange }: ListingSpecsEditorProps) {
  const { t } = useLanguage();

  const addSpec = () => onChange([...specs, { label: '', value: '' }]);

  const updateSpec = (index: number, patch: Partial<ListingSpec>) => {
    const updated = [...specs];
    updated[index] = { ...updated[index], ...patch };
    onChange(updated);
  };

  const removeSpec = (index: number) => {
    const updated = [...specs];
    updated.splice(index, 1);
    onChange(updated);
  };

  return (
    <FormSection
      icon={<FileText className="w-5 h-5" />}
      iconBgColor="info"
      title={t('auction.form.section.specs') || 'Product Specifications'}
    >
      <div className="space-y-4">
        <div className="flex justify-end">
          <AmberButton
            type="button"
            variant="outline"
            className="h-9 px-4 text-xs font-bold border-border rounded-lg gap-1.5"
            onClick={addSpec}
          >
            <Plus className="w-3.5 h-3.5" />
            {t('auction.form.add_spec') || 'Add Spec'}
          </AmberButton>
        </div>
        {specs.length === 0 ? (
          <p className="text-xs text-zinc-muted text-center py-4 uppercase tracking-widest font-bold">
            {t('auction.form.no_specs') || 'No specifications added.'}
          </p>
        ) : (
          <div className="space-y-3">
            {specs.map((spec, idx) => (
              <div key={idx} className="flex items-center gap-3 group">
                <AmberInput
                  placeholder={t('auction.form.spec_label') || 'Label'}
                  value={spec.label}
                  onChange={(e) => updateSpec(idx, { label: e.target.value })}
                  className="flex-1"
                />
                <AmberInput
                  placeholder={t('auction.form.spec_value') || 'Value'}
                  value={spec.value}
                  onChange={(e) => updateSpec(idx, { value: e.target.value })}
                  className="flex-1"
                />
                <button
                  type="button"
                  onClick={() => removeSpec(idx)}
                  className="p-2 text-zinc-muted hover:text-danger transition-colors"
                  aria-label={t('common.delete') || 'Delete'}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </FormSection>
  );
}
