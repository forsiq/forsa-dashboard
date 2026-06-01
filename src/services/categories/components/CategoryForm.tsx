import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, AlertCircle, ChevronDown } from 'lucide-react';
import { useLanguage } from '@core/contexts/LanguageContext';
import { cn } from '@core/lib/utils/cn';
import { AmberInput } from '@core/components/AmberInput';
import { AmberButton } from '@core/components/AmberButton';
import { AmberCard } from '@core/components/AmberCard';
import { AmberDropdown } from '@core/components/AmberDropdown';
import { IconPicker } from '@core/components/IconPicker';
import { AmberToggle } from '@core/components/AmberToggle';
import { useFormUX } from '@core/hooks/useFormUX';
import type { Category, CreateCategoryInput, UpdateCategoryInput } from '../types';
import { getLocalizedName } from '../types';
import { useMainCategories } from '../hooks';

// --- Validation Schema ---
// Must match auction-service CreateCategoryDto / UpdateCategoryDto (visible fields only)

const categorySchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  nameAr: z.string().optional(),
  description: z.string().optional(),
  icon: z.string().optional(),
  isActive: z.boolean().optional(),
  parentId: z.string().optional(),
});

export type CategoryFormData = z.infer<typeof categorySchema>;

function slugifyName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function hasManualSecondaryName(category?: Category): boolean {
  if (!category) return false;
  return Boolean(
    category.nameAr?.trim() || category.translations?.ar?.name?.trim(),
  );
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
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showSecondaryLang, setShowSecondaryLang] = useState(() =>
    hasManualSecondaryName(initialData),
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
    setShowSecondaryLang(hasManualSecondaryName(initialData));
  }, [initialData]);

  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
    watch,
    setValue,
  } = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema as any),
    defaultValues,
  });

  const watchedValues = watch();

  useFormUX({
    values: watchedValues as any,
    initialValues: defaultValues,
    isSubmitting: isSubmitting || isLoading,
  });

  const handleFormSubmit = async (data: CategoryFormData) => {
    try {
      setErrors({});
      const watchedParentId = watch('parentId');

      const slug = initialData?.slug ?? slugifyName(data.name);

      const payload: CreateCategoryInput & { id?: string } = {
        name: data.name,
        slug: slug || undefined,
        description: data.description || undefined,
        icon: data.icon || undefined,
        isActive: data.isActive ?? true,
        parentId: watchedParentId ? Number(watchedParentId) : null,
      };

      if (initialData) {
        payload.sortOrder = initialData.sortOrder ?? 0;
      }

      if (data.nameAr?.trim()) {
        payload.nameAr = data.nameAr.trim();
      }

      if (initialData) {
        await onSubmit({ ...payload, id: initialData.id });
      } else {
        await onSubmit(payload as CreateCategoryInput);
      }
    } catch (err: any) {
      if (err.details) {
        setErrors(err.details);
      } else {
        setErrors({ form: err.message || 'An error occurred' });
      }
    }
  };

  if (!isClient) return null;

  const sectionTitleClass =
    'text-sm font-black text-zinc-text uppercase tracking-widest';

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {errors.form && (
        <div className="flex items-start gap-3 p-4 rounded-lg bg-danger/10 border border-danger/20">
          <AlertCircle className="w-5 h-5 text-danger shrink-0 mt-0.5" />
          <p className="text-sm text-danger">{errors.form}</p>
        </div>
      )}

      {/* Section: Content */}
      <AmberCard>
        <h3 className={cn(sectionTitleClass, 'mb-6')}>
          {t('category.section_content')}
        </h3>

        <AmberInput
          label={t('category.name')}
          placeholder={t('category.name')}
          error={errors.name}
          required
          {...register('name')}
        />

        <p className="text-[13px] text-zinc-muted mt-2">
          {t('category.auto_translate_hint')}
        </p>

        <button
          type="button"
          dir={dir}
          onClick={() => setShowSecondaryLang((open) => !open)}
          className="mt-4 w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl border border-white/10 bg-white/[0.02] hover:bg-white/5 transition-colors"
        >
          <span className="text-[11px] font-black text-zinc-muted uppercase tracking-widest text-start">
            {t('category.add_english_name')}
          </span>
          <ChevronDown
            className={cn(
              'w-4 h-4 shrink-0 text-zinc-muted transition-transform',
              showSecondaryLang && 'rotate-180',
            )}
          />
        </button>

        {showSecondaryLang && (
          <div className="mt-4">
            <AmberInput
              label={t('category.name_en')}
              placeholder="Category name"
              {...register('nameAr')}
            />
          </div>
        )}

        <div className="mt-6">
          <AmberInput
            label={t('category.description')}
            multiline
            rows={3}
            placeholder={t('category.description_placeholder')}
            {...register('description')}
          />
        </div>
      </AmberCard>

      {/* Section: Placement — single row: parent + icon */}
      <AmberCard>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <AmberDropdown
            label={t('category.parent')}
            options={parentOptions}
            value={watch('parentId') || ''}
            onChange={(val) => setValue('parentId', val)}
            placeholder={t('category.select_parent')}
          />

          <IconPicker
            value={watch('icon') || ''}
            onChange={(val) => setValue('icon', val)}
            label={t('category.icon')}
            placeholder={t('category.icon_placeholder')}
            searchPlaceholder={t('category.icon_search')}
          />
        </div>
      </AmberCard>

      {/* Section: Visibility — toggle switch */}
      <AmberCard>
        <div className="flex items-center justify-between">
          <span className={cn(sectionTitleClass)}>
            {t('category.active')}
          </span>
          <AmberToggle
            enabled={watch('isActive') ?? true}
            onToggle={(val) => setValue('isActive', val)}
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
