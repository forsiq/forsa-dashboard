import React, { useEffect, useMemo, useState } from 'react';
import { Check, Loader2, Sparkles } from 'lucide-react';
import { useLanguage } from '@core/contexts/LanguageContext';
import { useDashboardRole } from '@core/hooks/useDashboardRole';
import { cn } from '@core/lib/utils/cn';
import { AmberInput } from '@core/components/AmberInput';
import type { AmazonProduct } from '@services/amazon/api/amazon-api';
import {
  deriveShortSubcategoryName,
  extractAmazonCategoryHints,
  suggestParentCategories,
} from '@services/amazon/utils/amazon-category-hints';
import type { ImportCategoryMode } from '@services/amazon/utils/resolve-import-category';
import {
  useCategoryHealthReport,
  useMainCategories,
  useCategoryChildren,
} from '@services/categories/hooks';
import { getLocalizedName } from '@services/categories/types';
import { isCategoryPickerSafe } from '@services/categories/lib/categoryHealth';

export interface AmazonImportCategoryState {
  parentId?: number;
  mode: ImportCategoryMode;
  subName: string;
  existingSubId?: number;
  isReady: boolean;
}

interface AmazonImportCategoryPanelProps {
  product: AmazonProduct;
  value: AmazonImportCategoryState;
  onChange: (next: AmazonImportCategoryState) => void;
  disabled?: boolean;
}

export function AmazonImportCategoryPanel({
  product,
  value,
  onChange,
  disabled = false,
}: AmazonImportCategoryPanelProps) {
  const { t, language } = useLanguage();
  const { canManageCategories } = useDashboardRole();
  const { data: mainCategories, isLoading: loadingMain } = useMainCategories();
  const { report: healthReport } = useCategoryHealthReport(language);

  const hints = useMemo(() => extractAmazonCategoryHints(product), [product]);
  const defaultSubName = useMemo(
    () => deriveShortSubcategoryName(product, hints),
    [product, hints],
  );

  const safeMainCategories = useMemo(
    () =>
      (mainCategories || []).filter((cat) =>
        isCategoryPickerSafe(String(cat.id), healthReport),
      ),
    [mainCategories, healthReport],
  );

  const suggestions = useMemo(
    () => suggestParentCategories(safeMainCategories, product, language, 3),
    [safeMainCategories, product, language],
  );

  const { data: children, isLoading: loadingChildren } = useCategoryChildren(
    value.parentId ?? null,
    !!value.parentId,
  );

  const safeChildren = useMemo(
    () =>
      (children || []).filter((cat) =>
        isCategoryPickerSafe(String(cat.id), healthReport),
      ),
    [children, healthReport],
  );

  // Auto-select top suggestion when product loads
  useEffect(() => {
    if (value.parentId || suggestions.length === 0) return;
    const top = suggestions[0]?.category;
    if (!top) return;
    onChange({
      ...value,
      parentId: Number(top.id),
      mode: 'auto_sub',
      subName: defaultSubName,
      existingSubId: undefined,
      isReady: true,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only seed once per product
  }, [product.asin, suggestions.length > 0 ? suggestions[0]?.category.id : null]);

  useEffect(() => {
    if (value.subName || !defaultSubName) return;
    onChange({ ...value, subName: defaultSubName });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultSubName, product.asin]);

  const selectParent = (parentId: number) => {
    onChange({
      parentId,
      mode: value.mode === 'existing_sub' ? 'existing_sub' : 'auto_sub',
      subName: value.subName || defaultSubName,
      existingSubId: undefined,
      isReady: true,
    });
  };

  const selectExistingSub = (subId: number) => {
    onChange({
      ...value,
      mode: 'existing_sub',
      existingSubId: subId,
      isReady: true,
    });
  };

  const setAutoSubMode = () => {
    onChange({
      ...value,
      mode: 'auto_sub',
      existingSubId: undefined,
      subName: value.subName || defaultSubName,
      isReady: !!value.parentId,
    });
  };

  return (
    <div className="space-y-4 rounded-xl border border-white/10 bg-obsidian-outer/60 p-4">
      <div className="space-y-1">
        <p className="text-[11px] font-black text-zinc-muted uppercase tracking-widest">
          {t('amazon.import.category_section') || 'Category placement'}
        </p>
        <p className="text-xs text-zinc-muted/80">
          {t('amazon.import.category_hint') ||
            'Pick a main category first. We create a short subcategory — never the full product title.'}
        </p>
      </div>

      {hints.length > 0 && (
        <p className="text-[11px] text-zinc-muted/70 px-1">
          {t('amazon.import.amazon_path') || 'Amazon path'}:{' '}
          <span className="text-zinc-text/80">{hints.map((h) => h.name).join(' › ')}</span>
        </p>
      )}

      <div className="space-y-2">
        <p className="text-[11px] font-black text-zinc-muted uppercase tracking-widest">
          {t('amazon.import.suggested_parents') || 'Suggested main categories'}
        </p>
        {loadingMain ? (
          <div className="flex items-center gap-2 py-2 text-sm text-zinc-muted">
            <Loader2 className="w-4 h-4 animate-spin" />
            {t('common.loading')}
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {suggestions.map(({ category, matchedHint }) => {
              const isSelected = value.parentId === Number(category.id);
              return (
                <button
                  key={category.id}
                  type="button"
                  disabled={disabled}
                  onClick={() => selectParent(Number(category.id))}
                  className={cn(
                    'inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition-all',
                    isSelected
                      ? 'bg-brand/15 border-brand/40 text-brand'
                      : 'bg-obsidian-card border-white/10 text-zinc-text hover:border-white/20',
                    disabled && 'opacity-50 pointer-events-none',
                  )}
                >
                  {isSelected ? (
                    <Check className="w-3.5 h-3.5 shrink-0" />
                  ) : (
                    <Sparkles className="w-3.5 h-3.5 shrink-0 text-brand/70" />
                  )}
                  <span>{getLocalizedName(category, language)}</span>
                  {matchedHint && !isSelected && (
                    <span className="text-[10px] text-zinc-muted font-medium hidden sm:inline">
                      ← {matchedHint}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div className="space-y-2">
        <p className="text-[11px] font-black text-zinc-muted uppercase tracking-widest">
          {t('amazon.import.other_parents') || 'Or choose another main category'}
        </p>
        <div className="flex flex-wrap gap-2 max-h-28 overflow-y-auto">
          {safeMainCategories
            .filter(
              (cat) =>
                !suggestions.some((s) => String(s.category.id) === String(cat.id)),
            )
            .map((cat) => {
              const isSelected = value.parentId === Number(cat.id);
              return (
                <button
                  key={cat.id}
                  type="button"
                  disabled={disabled}
                  onClick={() => selectParent(Number(cat.id))}
                  className={cn(
                    'px-3 py-1.5 rounded-lg text-xs font-bold border transition-all',
                    isSelected
                      ? 'bg-brand/15 border-brand/40 text-brand'
                      : 'bg-obsidian-card/80 border-white/5 text-zinc-muted hover:text-zinc-text hover:border-white/15',
                    disabled && 'opacity-50 pointer-events-none',
                  )}
                >
                  {getLocalizedName(cat, language)}
                </button>
              );
            })}
        </div>
      </div>

      {value.parentId && (
        <div className="space-y-3 pt-2 border-t border-white/5">
          <p className="text-[11px] font-black text-zinc-muted uppercase tracking-widest">
            {t('amazon.import.subcategory') || 'Subcategory'}
          </p>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={disabled}
              onClick={setAutoSubMode}
              className={cn(
                'px-3 py-2 rounded-xl text-xs font-bold border transition-all',
                value.mode === 'auto_sub'
                  ? 'bg-brand/15 border-brand/40 text-brand'
                  : 'border-white/10 text-zinc-muted hover:border-white/20',
                disabled && 'opacity-50 pointer-events-none',
              )}
            >
              {canManageCategories
                ? t('amazon.import.create_sub') || 'Create subcategory'
                : t('amazon.import.match_sub') || 'Match subcategory'}
            </button>
          </div>

          {value.mode === 'auto_sub' && (
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-zinc-muted">
                {t('amazon.import.sub_name') || 'Subcategory name (short)'}
              </label>
              <AmberInput
                value={value.subName}
                disabled={disabled}
                onChange={(e) =>
                  onChange({
                    ...value,
                    subName: e.target.value,
                    existingSubId: undefined,
                    isReady: !!value.parentId && e.target.value.trim().length > 0,
                  })
                }
                placeholder={defaultSubName}
              />
              {!canManageCategories && (
                <p className="text-[11px] text-zinc-muted/70 px-1">
                  {t('amazon.import.no_create_permission') ||
                    'If no match exists, the main category will be used until a moderator adds a subcategory.'}
                </p>
              )}
            </div>
          )}

          {loadingChildren ? (
            <div className="flex items-center gap-2 py-2 text-sm text-zinc-muted">
              <Loader2 className="w-4 h-4 animate-spin" />
              {t('common.loading')}
            </div>
          ) : safeChildren.length > 0 ? (
            <div className="space-y-1.5">
              <p className="text-[11px] font-bold text-zinc-muted">
                {t('amazon.import.existing_subs') || 'Or pick existing subcategory'}
              </p>
              <div className="flex flex-wrap gap-2">
                {safeChildren.map((sub) => {
                  const isSelected =
                    value.mode === 'existing_sub' &&
                    value.existingSubId === Number(sub.id);
                  return (
                    <button
                      key={sub.id}
                      type="button"
                      disabled={disabled}
                      onClick={() => selectExistingSub(Number(sub.id))}
                      className={cn(
                        'px-3 py-1.5 rounded-lg text-xs font-bold border transition-all',
                        isSelected
                          ? 'bg-brand/15 border-brand/40 text-brand'
                          : 'border-white/5 text-zinc-muted hover:text-zinc-text hover:border-white/15',
                        disabled && 'opacity-50 pointer-events-none',
                      )}
                    >
                      {getLocalizedName(sub, language)}
                    </button>
                  );
                })}
              </div>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}

export function createInitialCategoryState(): AmazonImportCategoryState {
  return {
    parentId: undefined,
    mode: 'auto_sub',
    subName: '',
    existingSubId: undefined,
    isReady: false,
  };
}
