import React, { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Lightbulb, Loader2, Check, X, Plus } from 'lucide-react';
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
  useCategoryTree,
  useSuggestCategory,
  useById,
  useCategoryHealthReport,
} from '../hooks';
import { isCategoryPickerSafe } from '../lib/categoryHealth';

import {
  suggestCategorySchema,
  type SuggestCategoryFormData,
  toSuggestCategoryPayload,
  NAME_MAX,
  DESC_MAX,
} from '../lib';
import { CategoryAddModal } from './CategoryAddModal';

interface CategoryPickerProps {
  value?: number;
  onChange: (id: number) => void;
  showSuggest?: boolean;
  showManageLink?: boolean;
  language?: string;
}

function mainHasChildren(tree: Category[], mainId: string): boolean {
  const main = tree.find((item) => String(item.id) === mainId);
  return (main?.children?.length ?? 0) > 0;
}

function CategoryIconPreview({ icon, size = 'sm' }: { icon?: string; size?: 'sm' | 'md' }) {
  const Icon = icon ? getIconByName(icon) : null;
  if (!Icon) return null;
  return (
    <span
      className={cn(
        'rounded-lg bg-brand/10 border border-brand/20 flex items-center justify-center shrink-0',
        size === 'md' ? 'w-8 h-8 rounded-xl bg-brand/15 border-brand/25' : 'w-6 h-6',
      )}
    >
      <Icon className={cn('text-brand', size === 'md' ? 'w-4 h-4' : 'w-3.5 h-3.5')} />
    </span>
  );
}

export function CategoryPicker({
  value,
  onChange,
  showSuggest = true,
  showManageLink = true,
}: CategoryPickerProps) {
  const { t, language, dir } = useLanguage();
  const { canManageCategories } = useDashboardRole();
  const [selectedMainId, setSelectedMainId] = useState<string | null>(null);
  const [showSuggestForm, setShowSuggestForm] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [suggestSuccess, setSuggestSuccess] = useState(false);
  const [suggestParentLocked, setSuggestParentLocked] = useState(false);

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
  const { data: categoryTree } = useCategoryTree();
  const { report: healthReport } = useCategoryHealthReport(language);
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

  const {
    data: children,
    isLoading: loadingChildren,
    error: childrenError,
  } = useCategoryChildren(
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
    const mainId = String(category.id);
    setSelectedMainId(mainId);
  };

  const handleSelectChild = (category: Category) => {
    onChange(Number(category.id));
  };

  const selectedPath = useMemo(() => {
    if (!selectedCategory) return null;
    const tree = categoryTree?.tree || [];

    if (!selectedCategory.parentId) {
      return { parent: null as Category | null, category: selectedCategory };
    }

    const parent =
      tree.find((main) => String(main.id) === String(selectedCategory.parentId)) ?? null;
    return { parent, category: selectedCategory };
  }, [selectedCategory, categoryTree?.tree]);

  const onSuggestValid = (data: SuggestCategoryFormData) => {
    const input: SuggestCategoryInput = toSuggestCategoryPayload(data);

    suggestMutation.mutate(input, {
      onSuccess: () => {
        setSuggestSuccess(true);
        resetSuggestForm();
        setTimeout(() => {
          setSuggestSuccess(false);
          setShowSuggestForm(false);
          setSuggestParentLocked(false);
        }, 3000);
      },
    });
  };

  const safeMainCategories = useMemo(
    () =>
      (mainCategories || []).filter((cat) =>
        isCategoryPickerSafe(String(cat.id), healthReport),
      ),
    [mainCategories, healthReport],
  );

  const safeChildren = useMemo(
    () =>
      (children || []).filter((cat) =>
        isCategoryPickerSafe(String(cat.id), healthReport),
      ),
    [children, healthReport],
  );

  const hiddenCategoryCount = useMemo(() => {
    const all = categoryTree?.tree || [];
    let total = 0;
    for (const main of all) {
      if (!isCategoryPickerSafe(String(main.id), healthReport)) total += 1;
      for (const child of main.children || []) {
        if (!isCategoryPickerSafe(String(child.id), healthReport)) total += 1;
      }
    }
    return total;
  }, [categoryTree?.tree, healthReport]);

  const hiddenChildrenCount = useMemo(() => {
    if (!resolvedMainId) return 0;
    return (children || []).filter(
      (cat) => !isCategoryPickerSafe(String(cat.id), healthReport),
    ).length;
  }, [children, healthReport, resolvedMainId]);

  const selectedMainCategory = useMemo(() => {
    if (!resolvedMainId) return null;
    return (
      safeMainCategories.find((cat) => String(cat.id) === resolvedMainId) ??
      categoryTree?.tree?.find((cat) => String(cat.id) === resolvedMainId) ??
      null
    );
  }, [resolvedMainId, safeMainCategories, categoryTree?.tree]);

  const mainHasSubs = useMemo(() => {
    if (!resolvedMainId) return false;
    return (
      mainHasChildren(categoryTree?.tree || [], resolvedMainId) ||
      (children?.length ?? 0) > 0
    );
  }, [resolvedMainId, categoryTree?.tree, children]);

  const isSelectionComplete = useMemo(() => {
    if (!value || !resolvedMainId) return false;
    const selectedIsMain = String(value) === resolvedMainId;
    if (mainHasSubs) {
      // If value is a child of the resolved main, selection is complete.
      // If value is the main itself (user clicked "Use main category"), also complete.
      // But NOT complete just because mainHasSubs is true and value happens to be set
      // from a previous selection of a different main.
      if (selectedIsMain) return true; // "Use main category" was clicked
      // Check if value is a child of resolvedMainId
      const isChildInTree = (categoryTree?.tree || [])
        .find((item) => String(item.id) === resolvedMainId)
        ?.children?.some((child) => String(child.id) === String(value));
      const isChildInApi = (children || []).some(
        (child) => String(child.id) === String(value),
      );
      return isChildInTree || isChildInApi;
    }
    return selectedIsMain;
  }, [value, resolvedMainId, mainHasSubs, categoryTree?.tree, children]);

  useEffect(() => {
    if (!value) {
      setSelectedMainId(null);
    }
  }, [value]);

  // Validate current value when switching main categories or children load
  useEffect(() => {
    if (!resolvedMainId || !selectedMainId) return;
    if (loadingChildren) return;
    if (value && String(value) !== resolvedMainId) {
      const isChildInTree = (categoryTree?.tree || [])
        .find((item) => String(item.id) === resolvedMainId)
        ?.children?.some((child) => String(child.id) === String(value));
      const isChildInApi = (children || []).some(
        (child) => String(child.id) === String(value),
      );
      if (!isChildInTree && !isChildInApi) {
        onChange(0);
      }
    }
  }, [resolvedMainId, selectedMainId, loadingChildren, children, categoryTree?.tree]);

  const openSuggestSubCategory = () => {
    if (!resolvedMainId) return;
    resetSuggestForm({ name: '', description: '', parentId: resolvedMainId });
    setSuggestParentLocked(true);
    setShowSuggestForm(true);
  };

  const openSuggestMainCategory = () => {
    resetSuggestForm({ name: '', description: '', parentId: '' });
    setSuggestParentLocked(false);
    setShowSuggestForm(true);
  };

  const handleClearSelection = () => {
    onChange(0);
    setSelectedMainId(null);
  };

  return (
    <div className="space-y-4" dir={dir}>
      {isSelectionComplete && selectedCategory && selectedPath && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-brand/10 border border-brand/30 shadow-[0_0_0_1px_rgba(var(--brand-rgb,212,175,55),0.08)]">
          {selectedCategory.icon ? (
            <CategoryIconPreview icon={selectedCategory.icon} size="md" />
          ) : (
            <span className="w-8 h-8 rounded-xl bg-brand/15 border border-brand/25 flex items-center justify-center shrink-0">
              <Check className="w-4 h-4 text-brand" />
            </span>
          )}
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-black text-brand/80 uppercase tracking-widest mb-0.5">
              {t('category.picker_selected') || 'Selected category'}
            </p>
            <p className="text-sm font-bold text-zinc-text line-clamp-2 break-words">
              {selectedPath.parent ? (
                <>
                  <span className="text-zinc-muted font-medium">
                    {getLocalizedName(selectedPath.parent, language)}
                  </span>
                  <span className="mx-1.5 text-brand/60">›</span>
                  <span>{getLocalizedName(selectedPath.category, language)}</span>
                </>
              ) : (
                getLocalizedName(selectedPath.category, language)
              )}
            </p>
          </div>
          <button
            type="button"
            onClick={handleClearSelection}
            className="p-1.5 rounded-lg hover:bg-white/10 transition-colors shrink-0"
            aria-label={t('category.picker_clear') || 'Clear category'}
          >
            <X className="w-4 h-4 text-zinc-muted" />
          </button>
        </div>
      )}

      <div className="rounded-xl border border-border bg-obsidian-card/50 overflow-hidden">
        {canManageCategories && hiddenCategoryCount > 0 && (
          <p className="text-xs border-b border-white/5 px-4 py-2.5 text-amber-700 dark:text-warning/90 bg-[var(--color-warning-bg)] border-[var(--color-warning-border)]">
            {t('category.picker_hidden_note') ||
              'Some categories are hidden from selection because they need admin review.'}
          </p>
        )}

        <section className="px-4 py-4 space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[11px] font-black text-zinc-muted uppercase tracking-widest">
                {t('category.select_main') || 'Main category'}
              </p>
              <p className="text-xs text-zinc-muted mt-1">
                {t('category.picker_step_main_hint') ||
                  'Choose the main category that best fits your product'}
              </p>
            </div>
            {resolvedMainId && selectedMainCategory && (
              <button
                type="button"
                onClick={handleClearSelection}
                className="text-xs font-bold text-brand hover:text-brand/80 shrink-0"
              >
                {t('category.picker_change_main') || 'Change'}
              </button>
            )}
          </div>

          {loadingMain ? (
            <div className="flex items-center gap-2 py-4">
              <Loader2 className="w-4 h-4 animate-spin text-zinc-muted" />
              <span className="text-sm text-zinc-muted">{t('common.loading') || 'Loading...'}</span>
            </div>
          ) : safeMainCategories.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border px-4 py-5 space-y-3">
              <p className="text-sm text-zinc-muted">
                {t('category.no_results') || 'No categories found'}
              </p>
              {showSuggest && (
                <button
                  type="button"
                  onClick={openSuggestMainCategory}
                  className="flex items-center gap-2 text-sm font-medium text-zinc-secondary hover:text-amber-600 dark:text-brand/70 dark:hover:text-brand transition-colors"
                >
                  <Lightbulb className="w-4 h-4" />
                  <span>{t('category.suggest_new') || "Don't see your category? Suggest one"}</span>
                </button>
              )}
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {safeMainCategories.map((cat) => {
                const isSelected = String(resolvedMainId) === String(cat.id);
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
        </section>

        {resolvedMainId && selectedMainCategory && !loadingChildren && (
          <section className="px-4 py-4 border-t border-white/5 space-y-3">
            <div>
              <p className="text-[11px] font-black text-zinc-muted uppercase tracking-widest">
                {t('category.select_sub') || 'Sub-category (optional)'}
              </p>
              <p className="text-xs text-zinc-muted mt-1">
                {t('category.picker_step_sub_hint') || 'Choose a sub-category under'}{' '}
                <span className="font-bold text-zinc-text">
                  {getLocalizedName(selectedMainCategory, language)}
                </span>
              </p>
            </div>

            {loadingChildren ? (
              <div className="flex items-center gap-2 py-4">
                <Loader2 className="w-4 h-4 animate-spin text-zinc-muted" />
                <span className="text-sm text-zinc-muted">
                  {t('common.loading') || 'Loading...'}
                </span>
              </div>
            ) : childrenError ? (
              <div className="rounded-lg border border-red-500/20 bg-red-500/5 px-4 py-3">
                <p className="text-sm text-red-400">
                  {t('category.picker_children_error') ||
                    'Failed to load sub-categories. You can still use the main category.'}
                </p>
                <button
                  type="button"
                  onClick={() => onChange(Number(resolvedMainId))}
                  className="mt-2 text-xs font-bold text-brand hover:text-brand/80"
                >
                  {t('category.use_main_category') || 'Use main category'}
                </button>
              </div>
            ) : safeChildren.length > 0 ? (
              <div className="space-y-3">
                {hiddenChildrenCount > 0 && (
                  <p className="text-xs text-amber-600 dark:text-warning/80">
                    {(t('category.picker_hidden_subs') || '{count} sub-category(ies) hidden due to quality issues.').replace(
                      '{count}',
                      String(hiddenChildrenCount),
                    )}
                  </p>
                )}
                <div className="flex flex-wrap gap-2">
                  {safeChildren.map((cat) => {
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
                <button
                  type="button"
                  onClick={() => onChange(Number(resolvedMainId))}
                  className={cn(
                    'inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all border',
                    String(value) === resolvedMainId
                      ? 'bg-brand/20 text-brand border-brand/40'
                      : 'text-zinc-muted border-dashed border-white/[0.06] hover:border-brand/30 hover:text-brand',
                  )}
                >
                  {t('category.use_main_category') || 'Use main category'}
                </button>
              </div>
            ) : (
              <div className="rounded-lg border border-dashed border-border bg-white/[0.02] px-4 py-5 space-y-4">
                <p className="text-sm text-zinc-text font-medium">
                  {t('category.picker_no_subcategories') ||
                    'No sub-categories are available under this main category yet.'}
                </p>
                <div className="flex flex-wrap items-center gap-4">
                  <button
                    type="button"
                    onClick={() => onChange(Number(resolvedMainId))}
                    className={cn(
                      'inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all border',
                      String(value) === resolvedMainId
                        ? 'bg-brand/20 text-brand border-brand/40'
                        : 'text-zinc-muted border-dashed border-white/[0.06] hover:border-brand/30 hover:text-brand',
                    )}
                  >
                    {t('category.use_main_category') || 'Use main category'}
                  </button>
                  {showSuggest && (
                    <button
                      type="button"
                      onClick={openSuggestSubCategory}
                      className="flex items-center gap-2 text-sm font-medium text-zinc-secondary hover:text-amber-600 dark:text-brand/70 dark:hover:text-brand transition-colors"
                    >
                      <Lightbulb className="w-4 h-4" />
                      <span>
                        {t('category.picker_suggest_sub') || 'Suggest a new sub-category'}
                      </span>
                    </button>
                  )}
                  {showManageLink && canManageCategories && (
                    <button
                      type="button"
                      onClick={() => setShowAddModal(true)}
                      className="flex items-center gap-2 text-sm font-medium text-zinc-muted hover:text-brand transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      <span>{t('category.picker_add_sub') || 'Add sub-category'}</span>
                    </button>
                  )}
                </div>
              </div>
            )}
          </section>
        )}
      </div>

      {showSuggest && !showSuggestForm && !resolvedMainId && safeMainCategories.length > 0 && (
        <button
          type="button"
          onClick={openSuggestMainCategory}
          className="flex items-center gap-2 text-sm font-medium text-zinc-secondary hover:text-amber-600 dark:text-brand/70 dark:hover:text-brand transition-colors"
        >
          <Lightbulb className="w-4 h-4" />
          <span>{t('category.suggest_new') || "Don't see your category? Suggest one"}</span>
        </button>
      )}

      {showManageLink && canManageCategories && !resolvedMainId && (
        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 text-sm font-medium text-zinc-muted hover:text-brand transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>{t('category.add_new') || 'Add new category'}</span>
        </button>
      )}

      {canManageCategories && (
        <CategoryAddModal
          open={showAddModal}
          onClose={() => setShowAddModal(false)}
          defaultParentId={resolvedMainId}
          onSuccess={(category) => {
            if (category.parentId) {
              setSelectedMainId(String(category.parentId));
            } else {
              setSelectedMainId(String(category.id));
            }
            onChange(Number(category.id));
          }}
        />
      )}

      {showSuggest && showSuggestForm && (
        <div className="p-5 rounded-xl bg-obsidian-card border border-border space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-black text-zinc-text uppercase tracking-widest">
              {t('category.suggest_title') || 'Suggest a Category'}
            </h4>
            <button
              type="button"
              onClick={() => {
                setShowSuggestForm(false);
                setSuggestParentLocked(false);
              }}
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

              {suggestParentLocked && selectedMainCategory ? (
                <div className="space-y-1.5">
                  <p className="text-xs font-bold text-zinc-muted uppercase tracking-widest">
                    {t('category.suggest_parent') || 'Parent category'}
                  </p>
                  <p className="text-sm font-medium text-zinc-text rounded-xl border border-border bg-white/[0.02] px-4 py-3">
                    {getLocalizedName(selectedMainCategory, language)}
                  </p>
                </div>
              ) : (
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
                    registerSuggest('parentId').onChange({
                      target: { value: val, name: 'parentId' },
                    } as any);
                  }}
                  placeholder={
                    t('category.select_parent_placeholder') || 'Select parent...'
                  }
                />
              )}

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
                  onClick={() => {
                    setShowSuggestForm(false);
                    setSuggestParentLocked(false);
                  }}
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
