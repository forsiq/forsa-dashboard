import React, { useEffect, useMemo, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, AlertCircle, ChevronDown, X } from 'lucide-react';
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
} from '../lib';

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
  const { data: mainCategories } = useMainCategories();

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
  }, [open, defaultParentId, reset]);

  const handleFormSubmit = async (data: CategoryFormData) => {
    try {
      const payload = toCreateCategoryPayload(data);
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
        <div className="flex items-center justify-between p-6 border-b border-white/5">
          <div>
            <h2 className="text-lg font-black text-zinc-text uppercase tracking-tight">
              {t('category.add_new') || 'Add new category'}
            </h2>
            <p className="text-xs text-zinc-muted mt-1">
              {t('category.add_modal_desc') ||
                'Create a category without leaving this form'}
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

        <form onSubmit={handleSubmit(handleFormSubmit)} className="p-6 space-y-5">
          {formErrors.root?.message && (
            <div className="flex items-start gap-3 p-3 rounded-lg bg-danger/10 border border-danger/20">
              <AlertCircle className="w-4 h-4 text-danger shrink-0 mt-0.5" />
              <p className="text-xs text-danger">{formErrors.root.message}</p>
            </div>
          )}

          <AmberInput
            label={t('category.name') || 'Name'}
            placeholder={t('category.name') || 'Name'}
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
              {t('category.add_english_name') || 'Add English name'}
            </span>
            <ChevronDown
              className={cn(
                'w-4 h-4 shrink-0 text-zinc-muted transition-transform',
                showSecondaryLang && 'rotate-180',
              )}
            />
          </button>

          {showSecondaryLang && (
            <AmberInput
              label={t('category.name_en') || 'Name (English)'}
              placeholder="Category name"
              error={formErrors.nameAr?.message ? t(formErrors.nameAr.message) : undefined}
              {...register('nameAr')}
            />
          )}

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

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/5">
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
    </div>
  );
}
