import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Lightbulb, Loader2, Check, X, Search, Plus, ChevronDown } from 'lucide-react';
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
import type { CategoryHealthReport } from '../lib/categoryHealth';
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

interface DropdownCategoryItem {
  category: Category;
  parent?: Category;
  depth: number;
}

function buildDropdownItems(
  tree: Category[],
  query: string,
  language: string,
  report?: CategoryHealthReport,
  parentScopeId?: string | null,
): DropdownCategoryItem[] {
  const q = query.trim().toLowerCase();
  const items: DropdownCategoryItem[] = [];
  const scopedMains = parentScopeId
    ? tree.filter((main) => String(main.id) === parentScopeId)
    : tree;

  for (const main of scopedMains) {
    if (report && !isCategoryPickerSafe(String(main.id), report)) continue;

    const mainName = getLocalizedName(main, language).toLowerCase();
    const mainMatches = !q || mainName.includes(q);
    const safeChildren = (main.children || []).filter(
      (child) => !report || isCategoryPickerSafe(String(child.id), report),
    );

    if (parentScopeId) {
      if (mainMatches || (!q && safeChildren.length > 0)) {
        items.push({ category: main, depth: 0 });
      }

      for (const child of safeChildren) {
        const childName = getLocalizedName(child, language).toLowerCase();
        const childMatches = !q || childName.includes(q) || mainName.includes(q);
        if (childMatches) {
          items.push({ category: child, parent: main, depth: 1 });
        }
      }
      continue;
    }

    if (mainMatches) {
      items.push({ category: main, depth: 0 });
    }

    for (const child of safeChildren) {
      const childName = getLocalizedName(child, language).toLowerCase();
      const childMatches = !q || childName.includes(q) || mainName.includes(q);

      if (childMatches) {
        items.push({ category: child, parent: main, depth: 1 });
      }
    }
  }

  return items;
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
  const { t, language, dir, isRTL } = useLanguage();
  const { canManageCategories } = useDashboardRole();
  const [selectedMainId, setSelectedMainId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showSuggestForm, setShowSuggestForm] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [suggestSuccess, setSuggestSuccess] = useState(false);
  const [browseExpanded, setBrowseExpanded] = useState(!value);
  const searchRef = useRef<HTMLDivElement>(null);

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
  const { data: categoryTree, isLoading: loadingTree } = useCategoryTree();
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
    const mainId = String(category.id);
    setSelectedMainId(mainId);
    const tree = categoryTree?.tree || [];
    const hasChildren = mainHasChildren(tree, mainId);

    if (!hasChildren) {
      onChange(Number(category.id));
      setBrowseExpanded(false);
      return;
    }

    if (!value) return;

    const currentIsMain = String(value) === mainId;
    const mainInTree = tree.find((item) => String(item.id) === mainId);
    const currentIsChildOfMain = (mainInTree?.children || []).some(
      (child) => String(child.id) === String(value),
    );

    if (!currentIsMain && !currentIsChildOfMain) {
      onChange(0);
    }
  };

  const handleSelectChild = (category: Category) => {
    onChange(Number(category.id));
    setBrowseExpanded(false);
  };

  const handleSelectFromDropdown = (category: Category, parent?: Category) => {
    if (parent) {
      setSelectedMainId(String(parent.id));
      onChange(Number(category.id));
      setBrowseExpanded(false);
    } else {
      const tree = categoryTree?.tree || [];
      const hasChildren = mainHasChildren(tree, String(category.id));
      setSelectedMainId(String(category.id));
      if (!hasChildren) {
        onChange(Number(category.id));
        setBrowseExpanded(false);
      } else if (String(value) !== String(category.id)) {
        onChange(0);
      }
    }
    setIsDropdownOpen(false);
    setSearchQuery('');
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

  const dropdownItems = useMemo(
    () =>
      buildDropdownItems(
        categoryTree?.tree || [],
        searchQuery,
        language,
        healthReport,
        resolvedMainId,
      ),
    [categoryTree?.tree, searchQuery, language, healthReport, resolvedMainId],
  );

  const hasCategories = (categoryTree?.tree?.length ?? 0) > 0 || (mainCategories?.length ?? 0) > 0;

  useEffect(() => {
    if (!isDropdownOpen) return;
    const onDoc = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [isDropdownOpen]);

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

  useEffect(() => {
    setBrowseExpanded(!value);
    if (!value) {
      setSelectedMainId(null);
    }
  }, [value]);

  const handleToggleBrowse = () => {
    setBrowseExpanded((prev) => {
      const next = !prev;
      if (next && value && selectedCategoryDetail?.parentId) {
        setSelectedMainId(String(selectedCategoryDetail.parentId));
      } else if (next && value && selectedCategoryDetail && !selectedCategoryDetail.parentId) {
        setSelectedMainId(String(selectedCategoryDetail.id));
      }
      return next;
    });
  };

  return (
    <div className="space-y-4" dir={dir}>
      {value && selectedCategory && selectedPath && (
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
            onClick={() => onChange(0)}
            className={cn(
              'p-1.5 rounded-lg hover:bg-white/10 transition-colors shrink-0',
            )}
            aria-label={t('category.picker_clear') || 'Clear category'}
          >
            <X className="w-4 h-4 text-zinc-muted" />
          </button>
        </div>
      )}

      <div ref={searchRef} className="relative space-y-1.5">
        <AmberInput
          placeholder={t('category.picker_search') || 'Search categories…'}
          value={searchQuery}
          onFocus={() => setIsDropdownOpen(true)}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setIsDropdownOpen(true);
          }}
          icon={<Search className="w-4 h-4" />}
          aria-expanded={isDropdownOpen}
          aria-haspopup="listbox"
          role="combobox"
        />
        <p className="text-xs text-zinc-muted px-1">
          {resolvedMainId
            ? t('category.picker_search_hint_scoped') ||
              'Search within the selected main category, or browse below'
            : t('category.picker_search_hint') ||
              'Type to search, or browse categories below'}
        </p>

        {isDropdownOpen && hasCategories && (
          <div
            role="listbox"
            className={cn(
              'absolute top-full z-[80] mt-1.5 w-full max-h-64 overflow-y-auto rounded-xl border border-white/10 bg-obsidian-card shadow-xl',
            )}
          >
            {loadingTree ? (
              <div className="flex items-center gap-2 px-4 py-3">
                <Loader2 className="w-4 h-4 animate-spin text-zinc-muted" />
                <span className="text-sm text-zinc-muted">
                  {t('common.loading') || 'Loading...'}
                </span>
              </div>
            ) : dropdownItems.length === 0 ? (
              <p className="px-4 py-3 text-sm text-zinc-muted">
                {t('category.no_results') || 'No categories match your search'}
              </p>
            ) : (
              <ul className="py-1">
                {dropdownItems.map((item) => {
                  const isSelected = String(value) === String(item.category.id);
                  const parentName = item.parent
                    ? getLocalizedName(item.parent, language)
                    : null;
                  const categoryName = getLocalizedName(item.category, language);

                  return (
                    <li key={item.category.id}>
                      <button
                        type="button"
                        role="option"
                        aria-selected={isSelected}
                        onClick={() => handleSelectFromDropdown(item.category, item.parent)}
                        className={cn(
                          'flex w-full items-center gap-2.5 px-4 py-2.5 text-sm font-medium transition-colors text-start',
                          item.depth > 0 && (isRTL ? 'pr-8' : 'pl-8'),
                          isSelected
                            ? 'bg-brand/[0.12] text-brand'
                            : 'text-zinc-text hover:bg-white/[0.04]',
                        )}
                      >
                        <CategoryIconPreview icon={item.category.icon} />
                        <span className="min-w-0 flex-1 line-clamp-2 break-words">
                          {parentName ? (
                            <>
                              <span className="text-zinc-muted">{parentName}</span>
                              <span className="mx-1.5 text-zinc-muted/60">›</span>
                              <span className="font-bold">{categoryName}</span>
                            </>
                          ) : (
                            <span className="font-bold">{categoryName}</span>
                          )}
                        </span>
                        {isSelected && <Check className="w-3.5 h-3.5 shrink-0 text-brand" />}
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        )}
      </div>

      {canManageCategories && hiddenCategoryCount > 0 && (
        <p className="text-xs text-warning/80 px-1">
          {t('category.picker_hidden_note') ||
            'Some categories are hidden from selection because they need admin review.'}
        </p>
      )}

      <div className="rounded-xl border border-border bg-obsidian-card/50 overflow-hidden">
        <button
          type="button"
          onClick={handleToggleBrowse}
          className="flex w-full items-center justify-between gap-3 px-4 py-3 text-start hover:bg-white/[0.02] transition-colors"
          aria-expanded={browseExpanded}
        >
          <span className="text-[11px] font-black text-zinc-muted uppercase tracking-widest">
            {value
              ? t('category.picker_change') || 'Change category'
              : t('category.picker_browse') || 'Browse categories'}
          </span>
          <ChevronDown
            className={cn(
              'w-4 h-4 text-zinc-muted transition-transform duration-200 shrink-0',
              browseExpanded && 'rotate-180',
            )}
          />
        </button>

        {browseExpanded && (
          <div className="px-4 pb-4 space-y-4 border-t border-white/5">
            <div>
              <p className="text-[11px] font-black text-zinc-muted uppercase tracking-widest mb-3 pt-3">
                {t('category.select_main') || 'Main category'}
              </p>
              {loadingMain ? (
                <div className="flex items-center gap-2 py-4">
                  <Loader2 className="w-4 h-4 animate-spin text-zinc-muted" />
                  <span className="text-sm text-zinc-muted">
                    {t('common.loading') || 'Loading...'}
                  </span>
                </div>
              ) : safeMainCategories.length === 0 ? (
                <p className="text-sm text-zinc-muted py-2">
                  {t('category.no_results') || 'No categories match your search'}
                </p>
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
            </div>

            {resolvedMainId && safeChildren.length > 0 && (
              <div>
                <p className="text-[11px] font-black text-zinc-muted uppercase tracking-widest mb-3">
                  {t('category.select_sub') || 'Sub-category (optional)'}
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
                )}
              </div>
            )}
          </div>
        )}
      </div>

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
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 text-sm font-medium text-zinc-muted hover:text-brand transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>{t('category.add_new') || 'Add new category'}</span>
          </button>
        )}
      </div>

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
            setBrowseExpanded(false);
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
