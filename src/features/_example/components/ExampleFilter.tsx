import React from 'react';
import { Search, Filter, X } from 'lucide-react';
import { AmberInput } from '@core/components/AmberInput';
import { AmberButton } from '@core/components/AmberButton';
import { AmberCard } from '@core/components/AmberCard';
import { ExampleFilter as FilterType } from '../types';

interface ExampleFilterProps {
  filter: FilterType;
  onFilterChange: (filter: FilterType) => void;
}

import { useLanguage } from '@core/contexts/LanguageContext';

export const ExampleFilter: React.FC<ExampleFilterProps> = ({ filter, onFilterChange }) => {
  const { t } = useLanguage();
  
  const updateFilter = (key: keyof FilterType, value: unknown) => {
    onFilterChange({ ...filter, [key]: value });
  };

  const clearFilters = () => {
    onFilterChange({});
  };

  const hasActiveFilters = Object.values(filter).some((v) => v !== undefined && v !== '');

  return (
    <AmberCard className="border-white/5 shadow-lg">
      <div className="flex items-center gap-3 mb-6 italic border-brand">
        <div className="p-1.5 bg-brand/10 rounded-lg">
          <Filter className="w-3.5 h-3.5 text-brand" />
        </div>
        <h3 className="text-xs font-black text-zinc-text uppercase tracking-[0.2em]">
          {t('common.filter')}
        </h3>
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="ml-auto text-[10px] font-black text-danger hover:text-danger/80 uppercase tracking-widest flex items-center gap-1.5 transition-all"
          >
            <X className="w-3 h-3" />
            {t('common.clear')}
          </button>
        )}
      </div>

      <div className="space-y-4">
        <AmberInput
          placeholder={t('common.search')}
          icon={<Search className="w-4 h-4" />}
          value={filter.search || ''}
          onChange={(e) => updateFilter('search', e.target.value)}
          className="h-12 bg-white/5 border-white/5"
        />

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest px-1 text-zinc-muted/60">
              {t('common.status')}
            </label>
            <select
              className="w-full bg-white/5 border border-white/5 rounded-xl text-xs font-bold text-zinc-text outline-none h-12 px-4 focus:border-brand/30 transition-all cursor-pointer hover:bg-white/10"
              value={filter.status || ''}
              onChange={(e) => updateFilter('status', e.target.value || undefined)}
            >
              <option value="" className="bg-obsidian-panel italic">{t('common.all')}</option>
              <option value="active" className="bg-obsidian-panel font-bold">{t('status.active')}</option>
              <option value="inactive" className="bg-obsidian-panel font-bold">{t('status.inactive')}</option>
              <option value="pending" className="bg-obsidian-panel font-bold">{t('status.pending')}</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest px-1 text-zinc-muted/60">
              {t('rec.table.module')}
            </label>
            <select
              className="w-full bg-white/5 border border-white/5 rounded-xl text-xs font-bold text-zinc-text outline-none h-12 px-4 focus:border-brand/30 transition-all cursor-pointer hover:bg-white/10"
              value={filter.category || ''}
              onChange={(e) => updateFilter('category', e.target.value || undefined)}
            >
              <option value="" className="bg-obsidian-panel italic">{t('common.all')}</option>
              <option value="Category A" className="bg-obsidian-panel font-bold">Category A</option>
              <option value="Category B" className="bg-obsidian-panel font-bold">Category B</option>
              <option value="Category C" className="bg-obsidian-panel font-bold">Category C</option>
              <option value="Category D" className="bg-obsidian-panel font-bold">Category D</option>
            </select>
          </div>
        </div>
      </div>
    </AmberCard>
  );
};
