import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, AlertCircle } from 'lucide-react';
import { useLanguage } from '@core/contexts/LanguageContext';
import { cn } from '@core/lib/utils/cn';
import { AmberInput } from '@core/components/AmberInput';
import { AmberButton } from '@core/components/AmberButton';
import { AmberCard } from '@core/components/AmberCard';
import { AmberDropdown } from '@core/components/AmberDropdown';
import { IconPicker } from '@core/components/IconPicker';
import { AmberToggle } from '@core/components';
import { useFormUX } from '@core/hooks/useFormUX';
import type { Category, CreateCategoryInput, UpdateCategoryInput } from '../types';
import { getLocalizedName } from '../types';
import { useMainCategories } from '../hooks';
import {
  categoryFormSchema,
  type CategoryFormData,
  toCreateCategoryPayload,
  toUpdateCategoryPayload,
  mapCategoryApiError,
} from '../lib';
import { CategoryNameFields } from './CategoryNameFields';

// --- Helpers ---

function hasSecondaryLangContent(category: Category | undefined, language: string): boolean {
  if (!category) return false;
  const hasAr = Boolean(category.nameAr?.trim() || category.translations?.ar?.name?.trim());
  const hasEn = Boolean(category.name?.trim());
  if (language === 'ar') return hasEn;
  return hasAr;
}

function buildFormValues(category?: Category): CategoryFormData {
  if (!category) {
    return {
      name: '',
      nameAr: '',
      description: '',
      icon: '',
      isActive: true,
      parentId: '',
    };
  }
  return {
    name: category.name,
    nameAr: category.nameAr || category.translations?.ar?.name || '',
    description: category.description || '',
    icon: category.icon || '',
    isActive: category.isActive ?? true,
    parentId: category.parentId ? String(category.parentId) : '',
  };
}

// --- Props ---

interface CategoryFormProps {
  initialData?: Category;
  onSubmit: (data: CreateCategoryInput | UpdateCategoryInput) => Promise<void>;
  isLoading?: boolean;
  parentCategories?: Category[];
}

// --- Form Component ---

export function CategoryForm({
  initialData,
  onSubmit,
  isLoading = false,
}: CategoryFormProps) {
  const { t, dir, language } = useLanguage();
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  const [showSecondaryLang, setShowSecondaryLang] = useState(() =>
    hasSecondaryLangContent(initialData, language),
  );

  const { data: mainCategories } = useMainCategories();

  const parentOptions = useMemo(() => {
    const cats = mainCategories || [];
    return [
      { label: t('category.no_parent') || 'None (Main Category)', value: '' },
      ...cats
        .filter((c: Category) => {
          if (initialData) return String(c.id) !== String(initialData.id);
          return true;
        })
        .map((c: Category) => ({
          label: getLocalizedName(c, language),
          value: String(c.id),
        })),
    ];
  }, [mainCategories, language, initialData, t]);

  const defaultValues = useMemo(
    () => buildFormValues(initialData),
    [initialData],
  );

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    setShowSecondaryLang(hasSecondaryLangContent(initialData, language));
  }, [initialData, language]);

  const {
    register,
    handleSubmit,
    formState: { isSubmitting, errors: formErrors },
    watch,
    control,
    setError,
  } = useForm<CategoryFormData>({
    resolver: zodResolver(categoryFormSchema as any),
    defaultValues,
    mode: 'onBlur',
    reValidateMode: 'onChange',
  });

  const watchedValues = watch();

  useFormUX({
    values: watchedValues as any,
    initialValues: defaultValues,
    isSubmitting: isSubmitting || isLoading,
  });

  const handleFormSubmit = async (data: CategoryFormData) => {
    try {
      if (initialData) {
        const payload = toUpdateCategoryPayload(data, {
          id: initialData.id,
          existingSlug: initialData.slug,
          sortOrder: initialData.sortOrder ?? 0,
          primaryLanguage: language,
        });
        await onSubmit(payload as UpdateCategoryInput);
      } else {
        const payload = toCreateCategoryPayload(data, { primaryLanguage: language });
        await onSubmit(payload as unknown as CreateCategoryInput);
      }
    } catch (err: any) {
      const fieldErrors = mapCategoryApiError(err);
      for (const [field, message] of Object.entries(fieldErrors)) {
        setError(field as keyof CategoryFormData, {
          type: 'server',
          message,
        });
      }
    }
  };

  if (!isClient) return null;

  const sectionTitleClass =
    'text-sm font-black text-zinc-text uppercase tracking-widest';

  // Collect root-level error message (from mapCategoryApiError's 'root' key)
  const rootError = formErrors.root?.message;

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {rootError && (
        <div className="flex items-start gap-3 p-4 rounded-lg bg-danger/10 border border-danger/20">
          <AlertCircle className="w-5 h-5 text-danger shrink-0 mt-0.5" />
          <p className="text-sm text-danger">{t(rootError)}</p>
        </div>
      )}

      {/* Section: Content */}
      <AmberCard>
        <h3 className={cn(sectionTitleClass, 'mb-6')}>
          {t('category.section_content')}
        </h3>

        <CategoryNameFields
          language={language}
          dir={dir}
          t={t}
          register={register}
          formErrors={formErrors}
          showSecondaryLang={showSecondaryLang}
          setShowSecondaryLang={setShowSecondaryLang}
          nameValue={watchedValues.name}
          nameArValue={watchedValues.nameAr}
        />

        <div className="mt-6">
          <AmberInput
            label={t('category.description')}
            multiline
            rows={3}
            placeholder={t('category.description_placeholder')}
            error={formErrors.description?.message ? t(formErrors.description.message) : undefined}
            {...register('description')}
          />
        </div>
      </AmberCard>

      {/* Section: Placement — single row: parent + icon */}
      <AmberCard>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Controller
            name="parentId"
            control={control}
            render={({ field }) => (
              <div>
                <AmberDropdown
                  label={t('category.parent')}
                  options={parentOptions}
                  value={field.value || ''}
                  onChange={field.onChange}
                  placeholder={t('category.select_parent')}
                />
                {formErrors.parentId?.message && (
                  <p className="text-xs text-danger mt-1">
                    {t(formErrors.parentId.message)}
                  </p>
                )}
              </div>
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
      </AmberCard>

      {/* Section: Visibility — toggle switch */}
      <AmberCard>
        <div className="flex items-center justify-between">
          <span className={cn(sectionTitleClass)}>
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
      </AmberCard>

      <div className="flex items-center justify-end gap-3">
        <AmberButton
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isSubmitting || isLoading}
          className="h-11 px-6 rounded-xl border-[var(--color-border)] font-bold"
        >
          {t('common.cancel')}
        </AmberButton>
        <AmberButton
          type="submit"
          disabled={isSubmitting || isLoading}
          className="h-11 px-8 bg-[var(--color-brand)] hover:bg-[var(--color-brand)] text-black font-bold rounded-xl shadow-sm transition-all border-none"
        >
          {isSubmitting || isLoading ? (
            <span className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              {t('common.saving')}
            </span>
          ) : initialData ? (
            t('common.update')
          ) : (
            t('common.create')
          )}
        </AmberButton>
      </div>
    </form>
  );
}

export default CategoryForm;
