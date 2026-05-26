/**
 * Category Select Component
 *
 * Hierarchical category picker for group buying form.
 * Wraps CategoryPicker to maintain backward-compatible string API.
 */

import { useLanguage } from '@core/contexts/LanguageContext';
import { CategoryPicker } from '@services/categories/components/CategoryPicker';

interface CategorySelectProps {
  value?: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export function CategorySelect({
  value,
  onChange,
  disabled = false,
}: CategorySelectProps) {
  const { t } = useLanguage();

  return (
    <div className={disabled ? 'opacity-50 pointer-events-none' : ''}>
      <label className="text-[11px] font-black text-zinc-muted uppercase tracking-widest mb-2 block">
        {t('groupBuying.category') || 'Category'}
      </label>
      <CategoryPicker
        value={value ? Number(value) : undefined}
        onChange={(id) => onChange(String(id))}
        showSuggest={false}
      />
    </div>
  );
}

export default CategorySelect;
