import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { getOverlayPortalRoot, useOverlayPortal } from '@core/hooks/useOverlayPortal';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, AlertCircle, X } from 'lucide-react';
import { useLanguage } from '@core/contexts/LanguageContext';
import { cn } from '@core/lib/utils/cn';
import { AmberInput } from '@core/components/AmberInput';
import { AmberButton } from '@core/components/AmberButton';
import { AmberDropdown } from '@core/components/AmberDropdown';
import { IconPicker } from '@core/components/IconPicker';
import { AmberToggle } from '@core/components';
import { useUpdate, useMainCategories } from '../hooks';
import type { Category, UpdateCategoryInput } from '../types';
import { getLocalizedName } from '../types';
import {
  categoryFormSchema,
  type CategoryFormData,
  toUpdateCategoryPayload,
  mapCategoryApiError,
} from '../lib';
import { CategoryNameFields } from './CategoryNameFields';

interface CategoryEditModalProps {
  category: Category;
  open: boolean;
  onClose: () => void;
}

export function CategoryEditModal({ category, open, onClose }: CategoryEditModalProps) {
  const { t, dir, language } = useLanguage();
  const updateMutation = useUpdate();
  const [showSecondaryLang, setShowSecondaryLang] = useState(() => {
    const hasAr = Boolean(category.nameAr?.trim() || category.translations?.ar?.name?.trim());
    const hasEn = Boolean(category.name?.trim());
    if (language === 'ar') return hasEn;
    return hasAr;
  });
  const { data: mainCategories } = useMainCategories();

  const parentOptions = (mainCategories || [])
    .filter((c: Category) => String(c.id) !== String(category.id))
    .map((c: Category) => ({
      label: getLocalizedName(c, language),
      value: String(c.id),
    }));
  parentOptions.unshift({ label: t('category.no_parent') || 'None (Main Category)', value: '' });

  const {
    register,
    handleSubmit,
    formState: { isSubmitting, errors: formErrors },
    control,
    setError,
  } = useForm<CategoryFormData>({
    resolver: zodResolver(categoryFormSchema as any),
    defaultValues: {
      name: category.name,
      nameAr: category.nameAr || category.translations?.ar?.name || '',
      description: category.description || '',
      icon: category.icon || '',
      isActive: category.isActive ?? true,
      parentId: category.parentId ? String(category.parentId) : '',
    },
    mode: 'onBlur',
    reValidateMode: 'onChange',
  });

  const { shouldRender } = useOverlayPortal(open, onClose);

  const handleFormSubmit = async (data: CategoryFormData) => {
    try {
      const payload = toUpdateCategoryPayload(data, {
        id: category.id,
        existingSlug: category.slug,
        sortOrder: category.sortOrder ?? 0,
        primaryLanguage: language,
      });
      await updateMutation.mutateAsync(payload as UpdateCategoryInput);
      onClose();
    } catch (err: any) {
      const fieldErrors = mapCategoryApiError(err);
      for (const [field, message] of Object.entries(fieldErrors)) {
        setError(field as keyof CategoryFormData, { type: 'server', message });
      }
    }
  };

  if (!shouldRender || typeof document === 'undefined') return null;

  return createPortal(
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
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-white/5 p-6">
          <div>
            <h2 className="text-lg font-black text-zinc-text uppercase tracking-tight">
              {t('common.edit') || 'Edit'} {getLocalizedName(category, language)}
            </h2>
            <p className="text-xs text-zinc-muted mt-1">
              {t('category.edit_desc') || 'Update category details'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-zinc-muted hover:text-zinc-text transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(handleFormSubmit)} className="flex min-h-0 flex-1 flex-col">
          <div className="flex-1 min-h-0 space-y-5 overflow-y-auto overscroll-contain p-6">
          {formErrors.root?.message && (
            <div className="flex items-start gap-3 p-3 rounded-lg bg-danger/10 border border-danger/20">
              <AlertCircle className="w-4 h-4 text-danger shrink-0 mt-0.5" />
              <p className="text-xs text-danger">{t(formErrors.root.message)}</p>
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

          <AmberInput
            label={t('category.description')}
            multiline
            rows={2}
            placeholder={t('category.description_placeholder')}
            error={formErrors.description?.message ? t(formErrors.description.message) : undefined}
            {...register('description')}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Controller
              name="parentId"
              control={control}
              render={({ field }) => (
                <AmberDropdown
                  label={t('category.parent')}
                  options={parentOptions}
                  value={field.value || ''}
                  onChange={field.onChange}
                  placeholder={t('category.select_parent')}
                />
              )}
            />

            <Controller
              name="icon"
              control={control}
              render={({ field }) => (
                <IconPicker
                  value={field.value || ''}
                  onChange={field.onChange}
                  label={t('category.icon')}
                  placeholder={t('category.icon_placeholder')}
                  searchPlaceholder={t('category.icon_search')}
                />
              )}
            />
          </div>

          <div className="flex items-center justify-between py-2">
            <span className="text-sm font-black text-zinc-muted uppercase tracking-widest">
              {t('category.active')}
            </span>
            <Controller
              name="isActive"
              control={control}
              render={({ field }) => (
                <AmberToggle
                  enabled={field.value ?? true}
                  onToggle={() => field.onChange(!(field.value ?? true))}
                />
              )}
            />
          </div>

          </div>

          {/* Footer */}
          <div className="flex shrink-0 items-center justify-between border-t border-white/5 p-6 pt-4">
            <a
              href={`/categories/${category.id}/edit`}
              className="text-[11px] font-black text-zinc-muted uppercase tracking-widest hover:text-brand transition-colors"
            >
              {t('category.advanced_edit') || 'Advanced edit'} →
            </a>
            <div className="flex items-center gap-3">
              <AmberButton
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isSubmitting || updateMutation.isPending}
                className="h-10 px-5 rounded-xl border-border font-bold text-xs"
              >
                {t('common.cancel')}
              </AmberButton>
              <AmberButton
                type="submit"
                disabled={isSubmitting || updateMutation.isPending}
                className="h-10 px-6 bg-brand text-black font-bold rounded-xl border-none text-xs"
              >
                {isSubmitting || updateMutation.isPending ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    {t('common.saving')}
                  </span>
                ) : (
                  t('common.update')
                )}
              </AmberButton>
            </div>
          </div>
        </form>
      </div>
    </div>,
    getOverlayPortalRoot(),
  );
}
