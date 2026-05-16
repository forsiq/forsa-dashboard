import React from 'react';
import { Plus, Trash2, ExternalLink } from 'lucide-react';
import { useLanguage } from '@core/contexts/LanguageContext';
import { AmberButton } from '@core/components/AmberButton';
import { AmberInput } from '@core/components/AmberInput';
import { FormSection } from '@core/components/FormSection';
import type { ListingSource } from '../../../types/services/listings.types';

interface ListingSourcesEditorProps {
  sources: ListingSource[];
  onChange: (sources: ListingSource[]) => void;
}

export function ListingSourcesEditor({ sources, onChange }: ListingSourcesEditorProps) {
  const { t } = useLanguage();

  const addSource = () =>
    onChange([...sources, { label: '', url: '', type: 'generic' }]);

  const updateSource = (index: number, patch: Partial<ListingSource>) => {
    const updated = [...sources];
    updated[index] = { ...updated[index], ...patch };
    onChange(updated);
  };

  const removeSource = (index: number) => {
    const updated = [...sources];
    updated.splice(index, 1);
    onChange(updated);
  };

  return (
    <FormSection
      icon={<ExternalLink className="w-5 h-5" />}
      iconBgColor="info"
      title={t('auction.form.section.sources') || 'Sources & References'}
    >
      <div className="space-y-4">
        <div className="flex justify-end">
          <AmberButton
            type="button"
            variant="outline"
            className="h-9 px-4 text-xs font-bold border-border rounded-lg gap-1.5"
            onClick={addSource}
          >
            <Plus className="w-3.5 h-3.5" />
            {t('auction.form.add_source') || 'Add Source'}
          </AmberButton>
        </div>
        {sources.length === 0 ? (
          <p className="text-xs text-zinc-muted text-center py-4 uppercase tracking-widest font-bold">
            {t('auction.form.no_sources') || 'No sources added.'}
          </p>
        ) : (
          <div className="space-y-3">
            {sources.map((source, idx) => (
              <div key={idx} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 group">
                <AmberInput
                  placeholder={t('auction.form.source_label') || 'Label'}
                  value={source.label}
                  onChange={(e) => updateSource(idx, { label: e.target.value })}
                  className="flex-1"
                />
                <AmberInput
                  placeholder={t('auction.form.source_url') || 'URL'}
                  value={source.url}
                  onChange={(e) => updateSource(idx, { url: e.target.value })}
                  className="flex-[2]"
                />
                <select
                  value={source.type}
                  onChange={(e) => updateSource(idx, { type: e.target.value })}
                  className="h-11 px-3 rounded-xl bg-obsidian-panel border border-border text-sm text-zinc-text font-bold"
                >
                  <option value="generic">Link</option>
                  <option value="youtube">YouTube</option>
                  <option value="alibaba">Alibaba</option>
                  <option value="aws">AWS</option>
                </select>
                <button
                  type="button"
                  onClick={() => removeSource(idx)}
                  className="p-2 text-zinc-muted hover:text-danger transition-colors self-center"
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
