import React from 'react';
import { ExternalLink, Plus, Trash2 } from 'lucide-react';
import { useLanguage } from '@core/contexts/LanguageContext';
import { AmberCard as Card } from '@core/components/AmberCard';
import { AmberButton } from '@core/components/AmberButton';
import { AmberInput } from '@core/components/AmberInput';
import type { Source, SourceType } from '../types/auction.types';

interface AuctionSourcesEditorProps {
  sources: Source[];
  onChange: (sources: Source[]) => void;
}

export const AuctionSourcesEditor: React.FC<AuctionSourcesEditorProps> = ({
  sources,
  onChange,
}) => {
  const { t } = useLanguage();

  return (
    <Card className="!p-8 bg-obsidian-card border-border shadow-xl space-y-8">
      <div className="flex items-center justify-between border-b border-white/[0.03] pb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-sky-500/10 flex items-center justify-center text-sky-400 border border-sky-500/20">
            <ExternalLink className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-black text-zinc-text uppercase tracking-[0.25em]">{t('auction.form.section.sources') || 'Sources & References'}</h3>
        </div>
        <AmberButton
          type="button"
          variant="outline"
          className="h-9 px-4 text-xs font-bold border-border rounded-lg gap-1.5"
          onClick={() => {
            const current = sources || [];
            onChange([...current, { label: '', url: '', type: 'generic' as const }]);
          }}
        >
          <Plus className="w-3.5 h-3.5" />
          {t('auction.form.add_source') || 'Add Source'}
        </AmberButton>
      </div>
      <div className="space-y-3">
        {(sources || []).length === 0 && (
          <p className="text-sm text-zinc-muted text-center py-4 uppercase tracking-widest font-bold">
            {t('auction.form.no_sources') || 'No sources added. Click "Add Source" to link product references.'}
          </p>
        )}
        {(sources || []).map((source, idx) => (
          <div key={idx} className="flex items-center gap-3 group">
            <AmberInput
              placeholder={t('auction.form.source_label') || 'Label (e.g. YouTube Review)'}
              value={source.label}
              onChange={(e) => {
                const updated = [...(sources || [])];
                updated[idx] = { ...updated[idx], label: e.target.value };
                onChange(updated);
              }}
              className="flex-1"
            />
            <AmberInput
              placeholder={t('auction.form.source_url') || 'URL (https://...)'}
              value={source.url}
              onChange={(e) => {
                const updated = [...(sources || [])];
                updated[idx] = { ...updated[idx], url: e.target.value };
                onChange(updated);
              }}
              className="flex-[2]"
            />
            <select
              value={source.type}
              onChange={(e) => {
                const updated = [...(sources || [])];
                updated[idx] = { ...updated[idx], type: e.target.value as SourceType };
                onChange(updated);
              }}
              className="h-11 px-3 rounded-xl bg-obsidian-panel border border-border text-sm text-zinc-text font-bold"
            >
              <option value="generic">Link</option>
              <option value="youtube">YouTube</option>
              <option value="alibaba">Alibaba</option>
              <option value="aws">AWS</option>
            </select>
            <button
              type="button"
              onClick={() => {
                const updated = [...(sources || [])];
                updated.splice(idx, 1);
                onChange(updated);
              }}
              className="p-2 text-zinc-muted hover:text-danger transition-colors opacity-0 group-hover:opacity-100"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </Card>
  );
};
