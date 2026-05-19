import React from 'react';
import { FileText, Plus, Trash2 } from 'lucide-react';
import { useLanguage } from '@core/contexts/LanguageContext';
import { AmberCard as Card } from '@core/components/AmberCard';
import { AmberButton } from '@core/components/AmberButton';
import { AmberInput } from '@core/components/AmberInput';
import type { Spec } from '../types/auction.types';

interface AuctionSpecsEditorProps {
  specs: Spec[];
  onChange: (specs: Spec[]) => void;
}

export const AuctionSpecsEditor: React.FC<AuctionSpecsEditorProps> = ({
  specs,
  onChange,
}) => {
  const { t } = useLanguage();

  return (
    <Card className="!p-8 bg-obsidian-card border-border shadow-xl space-y-8">
      <div className="flex items-center justify-between border-b border-white/[0.03] pb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-violet-500/10 flex items-center justify-center text-violet-400 border border-violet-500/20">
            <FileText className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-black text-zinc-text uppercase tracking-[0.25em]">{t('auction.form.section.specs') || 'Product Specifications'}</h3>
        </div>
        <AmberButton
          type="button"
          variant="outline"
          className="h-9 px-4 text-xs font-bold border-border rounded-lg gap-1.5"
          onClick={() => {
            const current = specs || [];
            onChange([...current, { label: '', value: '' }]);
          }}
        >
          <Plus className="w-3.5 h-3.5" />
          {t('auction.form.add_spec') || 'Add Spec'}
        </AmberButton>
      </div>
      <div className="space-y-3">
        {(specs || []).length === 0 && (
          <p className="text-sm text-zinc-muted text-center py-4 uppercase tracking-widest font-bold">
            {t('auction.form.no_specs') || 'No specifications added. Click "Add Spec" to add product details.'}
          </p>
        )}
        {(specs || []).map((spec, idx) => (
          <div key={idx} className="flex items-center gap-3 group">
            <AmberInput
              placeholder={t('auction.form.spec_label') || 'Label (e.g. Screen)'}
              value={spec.label}
              onChange={(e) => {
                const updated = [...(specs || [])];
                updated[idx] = { ...updated[idx], label: e.target.value };
                onChange(updated);
              }}
              className="flex-1"
            />
            <AmberInput
              placeholder={t('auction.form.spec_value') || 'Value (e.g. 6.7" AMOLED)'}
              value={spec.value}
              onChange={(e) => {
                const updated = [...(specs || [])];
                updated[idx] = { ...updated[idx], value: e.target.value };
                onChange(updated);
              }}
              className="flex-1"
            />
            <button
              type="button"
              onClick={() => {
                const updated = [...(specs || [])];
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
