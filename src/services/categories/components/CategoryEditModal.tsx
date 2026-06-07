import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, AlertCircle, ChevronDown, X } from 'lucide-react';
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

interface CategoryEditModalProps {
  category: Category;
  open: boolean;
  onClose: () => void;
}

export function CategoryEditModal({ category, open, onClose }: CategoryEditModalProps) {
  const { t, dir, language } = useLanguage();
  const updateMutation = useUpdate();
  const [showSecondaryLang, setShowSecondaryLang] = useState(
    Boolean(category.nameAr?.trim() || category.translations?.ar?.name?.trim()),
  );
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

  const handleFormSubmit = async (data: CategoryFormData) => {
    try {
      const payload = toUpdateCategoryPayload(data, {
        id: category.id,
        existingSlug: category.slug,
        sortOrder: category.sortOrder ?? 0,
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

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div
        className={cn(
          'relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl',
          'bg-obsidian-card border border-white/10 shadow-2xl',
        )}
        dir={dir}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/5">
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
        <form onSubmit={handleSubmit(handleFormSubmit)} className="p-6 space-y-5">
          {formErrors.root?.message && (
            <div className="flex items-start gap-3 p-3 rounded-lg bg-danger/10 border border-danger/20">
              <AlertCircle className="w-4 h-4 text-danger shrink-0 mt-0.5" />
              <p className="text-xs text-danger">{formErrors.root.message}</p>
            </div>
          )}

          <AmberInput
            label={t('category.name')}
            placeholder={t('category.name')}
            error={formErrors.name?.message ? t(formErrors.name.message) : undefined}
            required
            {...register('name')}
          />

          <button
            type="button"
            dir={dir}
            onClick={() => setShowSecondaryLang((v) => !v)}
            className="w-full flex items-center justify-between gap-3 px-4 py-2.5 rounded-xl border border-white/10 bg-white/[0.02] hover:bg-white/5 transition-colors"
          >
            <span className="text-[11px] font-black text-zinc-muted uppercase tracking-widest">
              {t('category.add_english_name')}
            </span>
            <ChevronDown
              className={cn('w-4 h-4 shrink-0 text-zinc-muted transition-transform', showSecondaryLang && 'rotate-180')}
            />
          </button>

          {showSecondaryLang && (
            <AmberInput
              label={t('category.name_en')}
              placeholder="Category name"
              error={formErrors.nameAr?.message ? t(formErrors.nameAr.message) : undefined}
              {...register('nameAr')}
            />
          )}

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

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/5">
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
        </form>
      </div>
    </div>
  );
}
