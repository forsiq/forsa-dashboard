import React, { useState } from 'react';
import { Lightbulb, Loader2, Check, X, ChevronDown } from 'lucide-react';
import { useLanguage } from '@core/contexts/LanguageContext';
import { cn } from '@core/lib/utils/cn';
import { AmberButton } from '@core/components/AmberButton';
import { AmberInput } from '@core/components/AmberInput';
import { AmberDropdown } from '@core/components/AmberDropdown';
import { getLocalizedName } from '../types';
import type { Category, SuggestCategoryInput } from '../types';

// These hooks are added by the concurrent agent
import {
  useMainCategories,
  useCategoryChildren,
  useSuggestCategory,
} from '../hooks';

interface CategoryPickerProps {
  value?: number;
  onChange: (id: number) => void;
  showSuggest?: boolean;
  language?: string;
}

export function CategoryPicker({
  value,
  onChange,
  showSuggest = true,
}: CategoryPickerProps) {
  const { t, language, dir, isRTL } = useLanguage();
  const [selectedMainId, setSelectedMainId] = useState<string | null>(null);
  const [showSuggestForm, setShowSuggestForm] = useState(false);
  const [suggestName, setSuggestName] = useState('');
  const [suggestDescription, setSuggestDescription] = useState('');
  const [suggestParentId, setSuggestParentId] = useState<string>('');
  const [suggestSuccess, setSuggestSuccess] = useState(false);

  // Fetch main categories
  const { data: mainCategories, isLoading: loadingMain } = useMainCategories();

  // Fetch children of selected main category
  const { data: children, isLoading: loadingChildren } = useCategoryChildren(
    selectedMainId || null,
    !!selectedMainId,
  );

  // Suggest mutation
  const suggestMutation = useSuggestCategory();

  // Resolve the selected value to show current selection label
  const allCategories = React.useMemo(() => {
    const main = mainCategories || [];
    const sub = children || [];
    return [...main, ...sub];
  }, [mainCategories, children]);

  const selectedCategory = allCategories.find(
    (c) => String(c.id) === String(value),
  );

  const handleSelectMain = (category: Category) => {
    setSelectedMainId(String(category.id));
    onChange(Number(category.id));
  };

  const handleSelectChild = (category: Category) => {
    onChange(Number(category.id));
  };

  const handleSuggestSubmit = () => {
    if (!suggestName.trim()) return;

    const input: SuggestCategoryInput = {
      name: suggestName.trim(),
      description: suggestDescription.trim() || undefined,
      parentId: suggestParentId ? Number(suggestParentId) : undefined,
    };

    suggestMutation.mutate(input, {
      onSuccess: () => {
        setSuggestSuccess(true);
        setSuggestName('');
        setSuggestDescription('');
        setSuggestParentId('');
        setTimeout(() => {
          setSuggestSuccess(false);
          setShowSuggestForm(false);
        }, 3000);
      },
    });
  };

  const mainCats = mainCategories || [];
  const childCats = children || [];

  return (
    <div className="space-y-4" dir={dir}>
      {/* Current Selection Display */}
      {value && selectedCategory && (
        <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand/[0.06] border border-brand/20">
          <Check className={cn('w-4 h-4 text-brand shrink-0')} />
          <span className="text-sm font-bold text-zinc-text">
            {getLocalizedName(selectedCategory, language)}
          </span>
          <button
            onClick={() => onChange(0)}
            className={cn(
              'p-1 rounded-lg hover:bg-white/10 transition-colors',
              isRTL ? 'mr-auto' : 'ml-auto',
            )}
          >
            <X className="w-3.5 h-3.5 text-zinc-muted" />
          </button>
        </div>
      )}

      {/* Main Categories */}
      <div>
        <p className="text-[11px] font-black text-zinc-muted uppercase tracking-widest mb-3">
          {t('category.select_main') || 'Select Category'}
        </p>
        {loadingMain ? (
          <div className="flex items-center gap-2 py-4">
            <Loader2 className="w-4 h-4 animate-spin text-zinc-muted" />
            <span className="text-sm text-zinc-muted">
              {t('common.loading') || 'Loading...'}
            </span>
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {mainCats.map((cat) => {
              const isSelected = String(value) === String(cat.id);
              const isExpanded = selectedMainId === String(cat.id);

              return (
                <button
                  key={cat.id}
                  onClick={() => handleSelectMain(cat)}
                  className={cn(
                    'px-4 py-2.5 rounded-xl text-sm font-bold transition-all border',
                    isSelected
                      ? 'bg-brand text-black border-brand shadow-sm'
                      : 'bg-obsidian-card text-zinc-text border-border hover:border-brand/40 hover:bg-brand/[0.04]',
                  )}
                >
                  {getLocalizedName(cat, language)}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Sub-categories (shown when main category is expanded) */}
      {selectedMainId && childCats.length > 0 && (
        <div>
          <p className="text-[11px] font-black text-zinc-muted uppercase tracking-widest mb-3">
            {t('category.select_sub') || 'Select Sub-Category (Optional)'}
          </p>
          {loadingChildren ? (
            <div className="flex items-center gap-2 py-4">
              <Loader2 className="w-4 h-4 animate-spin text-zinc-muted" />
              <span className="text-sm text-zinc-muted">
                {t('common.loading') || 'Loading...'}
              </span>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {childCats.map((cat) => {
                const isSelected = String(value) === String(cat.id);
                return (
                  <button
                    key={cat.id}
                    onClick={() => handleSelectChild(cat)}
                    className={cn(
                      'px-3.5 py-2 rounded-lg text-sm font-medium transition-all border',
                      isSelected
                        ? 'bg-brand/20 text-brand border-brand/40'
                        : 'bg-white/[0.02] text-zinc-text border-white/[0.06] hover:border-brand/30 hover:bg-brand/[0.03]',
                    )}
                  >
                    {getLocalizedName(cat, language)}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Suggest Category Link */}
      {showSuggest && !showSuggestForm && (
        <button
          onClick={() => setShowSuggestForm(true)}
          className="flex items-center gap-2 text-sm font-medium text-brand/70 hover:text-brand transition-colors mt-2"
        >
          <Lightbulb className="w-4 h-4" />
          <span>
            {t('category.suggest_new') || "Don't see your category? Suggest one"}
          </span>
        </button>
      )}

      {/* Suggest Category Form */}
      {showSuggest && showSuggestForm && (
        <div className="p-5 rounded-xl bg-obsidian-card border border-border space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-black text-zinc-text uppercase tracking-widest">
              {t('category.suggest_title') || 'Suggest a Category'}
            </h4>
            <button
              onClick={() => setShowSuggestForm(false)}
              className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
            >
              <X className="w-4 h-4 text-zinc-muted" />
            </button>
          </div>

          {suggestSuccess ? (
            <div className="flex items-center gap-2 py-3 px-4 rounded-lg bg-success/10 border border-success/20">
              <Check className="w-4 h-4 text-success" />
              <span className="text-sm font-medium text-success">
                {t('category.suggest_success') ||
                  'Your suggestion has been submitted for review'}
              </span>
            </div>
          ) : (
            <>
              <AmberInput
                label={t('category.suggest_name') || 'Category Name'}
                placeholder={
                  t('category.suggest_name_placeholder') || 'Enter category name'
                }
                value={suggestName}
                onChange={(e) => setSuggestName(e.target.value)}
                required
              />

              <AmberInput
                label={
                  t('category.suggest_description') || 'Description (Optional)'
                }
                placeholder={
                  t('category.suggest_description_placeholder') ||
                  'Brief description of the category'
                }
                value={suggestDescription}
                onChange={(e) => setSuggestDescription(e.target.value)}
                multiline
                rows={2}
              />

              <AmberDropdown
                label={t('category.suggest_parent') || 'Parent Category (Optional)'}
                options={[
                  { label: t('category.no_parent') || 'None (Main Category)', value: '' },
                  ...(mainCats || []).map((cat) => ({
                    label: getLocalizedName(cat, language),
                    value: String(cat.id),
                  })),
                ]}
                value={suggestParentId}
                onChange={setSuggestParentId}
                placeholder={
                  t('category.select_parent_placeholder') || 'Select parent...'
                }
              />

              <div className="flex items-center gap-3 pt-2">
                <AmberButton
                  onClick={handleSuggestSubmit}
                  disabled={!suggestName.trim() || suggestMutation.isPending}
                  className="h-10 px-6 bg-brand hover:bg-brand text-black font-bold rounded-xl border-none"
                >
                  {suggestMutation.isPending ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      {t('common.submitting') || 'Submitting...'}
                    </span>
                  ) : (
                    t('common.submit') || 'Submit'
                  )}
                </AmberButton>
                <AmberButton
                  variant="outline"
                  onClick={() => setShowSuggestForm(false)}
                  className="h-10 px-6 rounded-xl font-bold"
                >
                  {t('common.cancel') || 'Cancel'}
                </AmberButton>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default CategoryPicker;
