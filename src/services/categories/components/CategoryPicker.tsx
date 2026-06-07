import React, { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/router';
import { Lightbulb, Loader2, Check, X, Search, Plus } from 'lucide-react';
import { useLanguage } from '@core/contexts/LanguageContext';
import { useDashboardRole } from '@core/hooks/useDashboardRole';
import { cn } from '@core/lib/utils/cn';
import { getIconByName } from '@core/components/IconPicker';
import { AmberButton } from '@core/components/AmberButton';
import { AmberInput } from '@core/components/AmberInput';
import { AmberDropdown } from '@core/components/AmberDropdown';
import { getLocalizedName } from '../types';
import type { Category, SuggestCategoryInput } from '../types';

import {
  useMainCategories,
  useCategoryChildren,
  useSuggestCategory,
  useById,
} from '../hooks';

import {
  suggestCategorySchema,
  type SuggestCategoryFormData,
  toSuggestCategoryPayload,
  NAME_MAX,
  DESC_MAX,
} from '../lib';

interface CategoryPickerProps {
  value?: number;
  onChange: (id: number) => void;
  showSuggest?: boolean;
  showManageLink?: boolean;
  language?: string;
}

function filterCategories(categories: Category[], query: string, language: string): Category[] {
  const q = query.trim().toLowerCase();
  if (!q) return categories;
  return categories.filter((cat) =>
    getLocalizedName(cat, language).toLowerCase().includes(q),
  );
}

function CategoryIconPreview({ icon }: { icon?: string }) {
  const Icon = icon ? getIconByName(icon) : null;
  if (!Icon) return null;
  return (
    <span className="w-6 h-6 rounded-lg bg-brand/10 border border-brand/20 flex items-center justify-center shrink-0">
      <Icon className="w-3.5 h-3.5 text-brand" />
    </span>
  );
}

export function CategoryPicker({
  value,
  onChange,
  showSuggest = true,
  showManageLink = true,
}: CategoryPickerProps) {
  const { t, language, dir, isRTL } = useLanguage();
  const router = useRouter();
  const { canManageCategories } = useDashboardRole();
  const [selectedMainId, setSelectedMainId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestForm, setShowSuggestForm] = useState(false);
  const [suggestSuccess, setSuggestSuccess] = useState(false);

  const {
    register: registerSuggest,
    handleSubmit: handleSuggestSubmit,
    formState: { errors: suggestErrors },
    reset: resetSuggestForm,
    watch: watchSuggest,
  } = useForm<SuggestCategoryFormData>({
    resolver: zodResolver(suggestCategorySchema as any),
    defaultValues: { name: '', description: '', parentId: '' },
    mode: 'onBlur',
    reValidateMode: 'onChange',
  });

  const suggestParentId = watchSuggest('parentId');

  const { data: mainCategories, isLoading: loadingMain } = useMainCategories();
  const { data: selectedCategoryDetail } = useById(
    value ? String(value) : '',
    !!value,
  );

  const resolvedMainId = useMemo(() => {
    if (selectedMainId) return selectedMainId;
    if (!selectedCategoryDetail || !value) return null;
    if (selectedCategoryDetail.parentId) {
      return String(selectedCategoryDetail.parentId);
    }
    return String(selectedCategoryDetail.id);
  }, [selectedMainId, selectedCategoryDetail, value]);

  const { data: children, isLoading: loadingChildren } = useCategoryChildren(
    resolvedMainId || null,
    !!resolvedMainId,
  );

  const suggestMutation = useSuggestCategory();

  const allCategories = useMemo(() => {
    const main = mainCategories || [];
    const sub = children || [];
    return [...main, ...sub];
  }, [mainCategories, children]);

  const selectedCategory =
    selectedCategoryDetail ??
    allCategories.find((c) => String(c.id) === String(value));

  const handleSelectMain = (category: Category) => {
    setSelectedMainId(String(category.id));
    onChange(Number(category.id));
  };

  const handleSelectChild = (category: Category) => {
    onChange(Number(category.id));
  };

  const onSuggestValid = (data: SuggestCategoryFormData) => {
    const input: SuggestCategoryInput = toSuggestCategoryPayload(data);

    suggestMutation.mutate(input, {
      onSuccess: () => {
        setSuggestSuccess(true);
        resetSuggestForm();
        setTimeout(() => {
          setSuggestSuccess(false);
          setShowSuggestForm(false);
        }, 3000);
      },
    });
  };

  const mainCats = filterCategories(mainCategories || [], searchQuery, language);
  const childCats = filterCategories(children || [], searchQuery, language);

  return (
    <div className="space-y-4" dir={dir}>
      {value && selectedCategory && (
        <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand/[0.06] border border-brand/20">
          <Check className={cn('w-4 h-4 text-brand shrink-0')} />
          <CategoryIconPreview icon={selectedCategory.icon} />
          <span className="text-sm font-bold text-zinc-text">
            {getLocalizedName(selectedCategory, language)}
          </span>
          <button
            type="button"
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

      <AmberInput
        placeholder={t('category.picker_search') || 'Search categories…'}
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        icon={<Search className="w-4 h-4" />}
      />

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
        ) : mainCats.length === 0 ? (
          <p className="text-sm text-zinc-muted py-2">
            {t('category.no_results') || 'No categories match your search'}
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {mainCats.map((cat) => {
              const isSelected = String(value) === String(cat.id);

              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => handleSelectMain(cat)}
                  className={cn(
                    'inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all border',
                    isSelected
                      ? 'bg-brand text-black border-brand shadow-sm'
                      : 'bg-obsidian-card text-zinc-text border-border hover:border-brand/40 hover:bg-brand/[0.04]',
                  )}
                >
                  <CategoryIconPreview icon={cat.icon} />
                  {getLocalizedName(cat, language)}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {resolvedMainId && (children || []).length > 0 && (
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
          ) : childCats.length === 0 ? (
            <p className="text-sm text-zinc-muted py-2">
              {t('category.no_results') || 'No categories match your search'}
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {childCats.map((cat) => {
                const isSelected = String(value) === String(cat.id);
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => handleSelectChild(cat)}
                    className={cn(
                      'inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all border',
                      isSelected
                        ? 'bg-brand/20 text-brand border-brand/40'
                        : 'bg-white/[0.02] text-zinc-text border-white/[0.06] hover:border-brand/30 hover:bg-brand/[0.03]',
                    )}
                  >
                    <CategoryIconPreview icon={cat.icon} />
                    {getLocalizedName(cat, language)}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      <div className={cn('flex flex-wrap items-center gap-4 mt-2', isRTL && 'flex-row-reverse')}>
        {showSuggest && !showSuggestForm && (
          <button
            type="button"
            onClick={() => setShowSuggestForm(true)}
            className="flex items-center gap-2 text-sm font-medium text-brand/70 hover:text-brand transition-colors"
          >
            <Lightbulb className="w-4 h-4" />
            <span>
              {t('category.suggest_new') || "Don't see your category? Suggest one"}
            </span>
          </button>
        )}

        {showManageLink && canManageCategories && (
          <button
            type="button"
            onClick={() => router.push('/categories/new')}
            className="flex items-center gap-2 text-sm font-medium text-zinc-muted hover:text-brand transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>{t('category.add_new') || 'Add new category'}</span>
          </button>
        )}
      </div>

      {showSuggest && showSuggestForm && (
        <div className="p-5 rounded-xl bg-obsidian-card border border-border space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-black text-zinc-text uppercase tracking-widest">
              {t('category.suggest_title') || 'Suggest a Category'}
            </h4>
            <button
              type="button"
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
            <form onSubmit={handleSuggestSubmit(onSuggestValid)} className="space-y-4">
              <AmberInput
                label={t('category.suggest_name') || 'Category Name'}
                placeholder={
                  t('category.suggest_name_placeholder') || 'Enter category name'
                }
                maxLength={NAME_MAX}
                error={suggestErrors.name?.message ? t(suggestErrors.name.message) : undefined}
                required
                {...registerSuggest('name')}
              />

              <AmberInput
                label={
                  t('category.suggest_description') || 'Description (Optional)'
                }
                placeholder={
                  t('category.suggest_description_placeholder') ||
                  'Brief description of the category'
                }
                maxLength={DESC_MAX}
                error={suggestErrors.description?.message ? t(suggestErrors.description.message) : undefined}
                multiline
                rows={2}
                {...registerSuggest('description')}
              />

              <AmberDropdown
                label={t('category.suggest_parent') || 'Parent Category (Optional)'}
                options={[
                  { label: t('category.no_parent') || 'None (Main Category)', value: '' },
                  ...(mainCategories || []).map((cat) => ({
                    label: getLocalizedName(cat, language),
                    value: String(cat.id),
                  })),
                ]}
                value={suggestParentId || ''}
                onChange={(val: string) => {
                  registerSuggest('parentId').onChange({ target: { value: val, name: 'parentId' } } as any);
                }}
                placeholder={
                  t('category.select_parent_placeholder') || 'Select parent...'
                }
              />

              <div className="flex items-center gap-3 pt-2">
                <AmberButton
                  type="submit"
                  disabled={suggestMutation.isPending}
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
                  type="button"
                  variant="outline"
                  onClick={() => setShowSuggestForm(false)}
                  className="h-10 px-6 rounded-xl font-bold"
                >
                  {t('common.cancel') || 'Cancel'}
                </AmberButton>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
}

export default CategoryPicker;
