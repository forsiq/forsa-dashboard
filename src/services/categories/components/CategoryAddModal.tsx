import React, { useEffect, useMemo, useState } from 'react';
import ReactDOM from 'react-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, AlertCircle, X, Lock } from 'lucide-react';
import { useLanguage } from '@core/contexts/LanguageContext';
import { cn } from '@core/lib/utils/cn';
import { AmberInput } from '@core/components/AmberInput';
import { AmberButton } from '@core/components/AmberButton';
import { AmberDropdown } from '@core/components/AmberDropdown';
import { useCreateCategoryMutation, useMainCategories } from '../hooks';
import type { Category, CreateCategoryInput } from '../types';
import { getLocalizedName } from '../types';
import {
  categoryFormSchema,
  type CategoryFormData,
  toCreateCategoryPayload,
  mapCategoryApiError,
  classifyCategoryApiError,
  suggestAlternativeCategoryName,
  resolveCategoryNamesForApi,
} from '../lib';
import { CategoryNameFields } from './CategoryNameFields';

interface CategoryAddModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (category: Category) => void;
  defaultParentId?: string | null;
}

export function CategoryAddModal({
  open,
  onClose,
  onSuccess,
  defaultParentId,
}: CategoryAddModalProps) {
  const { t, dir, language } = useLanguage();
  const createMutation = useCreateCategoryMutation();
  const [showSecondaryLang, setShowSecondaryLang] = useState(false);
  const [suggestedName, setSuggestedName] = useState<string | null>(null);
  const { data: mainCategories } = useMainCategories();

  const lockedParent = defaultParentId
    ? (mainCategories || []).find((c: Category) => String(c.id) === defaultParentId)
    : null;

  const parentOptions = useMemo(() => {
    const cats = mainCategories || [];
    return [
      { label: t('category.no_parent') || 'None (Main Category)', value: '' },
      ...cats.map((c: Category) => ({
        label: getLocalizedName(c, language),
        value: String(c.id),
      })),
    ];
  }, [mainCategories, language, t]);

  const {
    register,
    handleSubmit,
    formState: { isSubmitting, errors: formErrors },
    control,
    setError,
    reset,
    setValue,
  } = useForm<CategoryFormData>({
    resolver: zodResolver(categoryFormSchema as any),
    defaultValues: {
      name: '',
      nameAr: '',
      description: '',
      icon: '',
      isActive: true,
      parentId: defaultParentId || '',
    },
    mode: 'onBlur',
    reValidateMode: 'onChange',
  });

  useEffect(() => {
    if (!open) return;
    reset({
      name: '',
      nameAr: '',
      description: '',
      icon: '',
      isActive: true,
      parentId: defaultParentId || '',
    });
    setShowSecondaryLang(false);
    setSuggestedName(null);
  }, [open, defaultParentId, reset]);

  useEffect(() => {
    if (!open) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [open]);

  const handleFormSubmit = async (data: CategoryFormData) => {
    try {
      const payload = toCreateCategoryPayload(data, { primaryLanguage: language });
      const created = await createMutation.mutateAsync(
        payload as unknown as CreateCategoryInput,
      );
      onSuccess(created);
      onClose();
    } catch (err: unknown) {
      const fieldErrors = mapCategoryApiError(err);
      for (const [field, message] of Object.entries(fieldErrors)) {
        setError(field as keyof CategoryFormData, { type: 'server', message });
      }
      if (classifyCategoryApiError(err) === 'slug_conflict') {
        const resolved = resolveCategoryNamesForApi(data, language);
        setSuggestedName(suggestAlternativeCategoryName(resolved.name));
      } else {
        setSuggestedName(null);
      }
    }
  };

  const primaryNameField = language === 'ar' ? 'nameAr' : 'name';

  if (!open || typeof document === 'undefined') return null;

  return ReactDOM.createPortal(
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4 overflow-hidden"
      role="dialog"
      aria-modal="true"
    >
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-md"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        className={cn(
          'relative flex w-full max-w-lg flex-col',
          'max-h-[min(90dvh,calc(100vh-2rem))]',
          'rounded-2xl bg-obsidian-card border border-white/10 shadow-2xl',
        )}
        dir={dir}
      >
        <div className="flex shrink-0 items-center justify-between border-b border-white/5 p-6">
          <div>
            <h2 className="text-lg font-black text-zinc-text uppercase tracking-tight">
              {lockedParent
                ? t('category.add_subcategory') || 'Add subcategory'
                : t('category.add_new') || 'Add new category'}
            </h2>
            <p className="text-xs text-zinc-muted mt-1">
              {lockedParent
                ? `${t('category.add_modal_desc') || 'Create a category without leaving this form'} — ${getLocalizedName(lockedParent, language)}`
                : t('category.add_modal_desc') || 'Create a category without leaving this form'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-zinc-muted hover:text-zinc-text transition-colors"
            aria-label={t('common.close') || 'Close'}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="flex min-h-0 flex-1 flex-col">
          <div className="flex-1 min-h-0 space-y-5 overflow-y-auto overscroll-contain p-6">
          {formErrors.root?.message && (
            <div className="flex items-start gap-3 p-3 rounded-lg bg-danger/10 border border-danger/20">
              <AlertCircle className="w-4 h-4 text-danger shrink-0 mt-0.5" />
              <div className="space-y-2">
                <p className="text-xs text-danger">{t(formErrors.root.message)}</p>
                {suggestedName && (
                  <button
                    type="button"
                    onClick={() => {
                      setValue(primaryNameField, suggestedName, { shouldValidate: true });
                      setSuggestedName(null);
                    }}
                    className="text-xs font-bold text-brand hover:underline"
                  >
                    {t('category.slug_suggest.apply', { name: suggestedName })}
                  </button>
                )}
              </div>
            </div>
          )}

          <CategoryNameFields
            language={language}
            dir={dir}
            t={t}
            register={register}
            formErrors={formErrors}
            showSecondaryLang={showSecondaryLang}
            setShowSecondaryLang={setShowSecondaryLang}
          />

          {lockedParent ? (
            <div className="flex items-center gap-2 px-4 py-3 rounded-xl border border-white/10 bg-white/[0.02]">
              <Lock className="w-3.5 h-3.5 text-zinc-muted shrink-0" />
              <span className="text-[11px] font-black text-zinc-muted uppercase tracking-widest">
                {t('category.parent') || 'Parent'}:
              </span>
              <span className="text-xs font-bold text-zinc-text">
                {getLocalizedName(lockedParent, language)}
              </span>
            </div>
          ) : (
            <Controller
              name="parentId"
              control={control}
              render={({ field }) => (
                <AmberDropdown
                  label={t('category.parent') || 'Parent category'}
                  options={parentOptions}
                  value={field.value || ''}
                  onChange={field.onChange}
                  placeholder={t('category.select_parent') || 'Select parent...'}
                />
              )}
            />
          )}

          </div>

          <div className="flex shrink-0 items-center justify-end gap-3 border-t border-white/5 p-6 pt-4">
            <AmberButton
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting || createMutation.isPending}
              className="h-10 px-5 rounded-xl border-border font-bold text-xs"
            >
              {t('common.cancel') || 'Cancel'}
            </AmberButton>
            <AmberButton
              type="submit"
              disabled={isSubmitting || createMutation.isPending}
              className="h-10 px-6 bg-brand text-black font-bold rounded-xl border-none text-xs"
            >
              {isSubmitting || createMutation.isPending ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  {t('common.creating') || t('common.saving') || 'Creating...'}
                </span>
              ) : (
                t('category.add_new') || 'Add category'
              )}
            </AmberButton>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  );
}
