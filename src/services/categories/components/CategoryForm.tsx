import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, AlertCircle } from 'lucide-react';
import { useLanguage } from '@core/contexts/LanguageContext';
import { cn } from '@core/lib/utils/cn';
import { AmberInput } from '@core/components/AmberInput';
import { AmberButton } from '@core/components/AmberButton';
import { AmberCard } from '@core/components/AmberCard';
import { AmberDropdown } from '@core/components/AmberDropdown';
import { IconPicker } from '@core/components/IconPicker';
import type { Category, CreateCategoryInput, UpdateCategoryInput } from '../types';

// --- Validation Schema ---
// Must match auction-service CreateCategoryDto / UpdateCategoryDto

const categorySchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  nameAr: z.string().optional(),
  slug: z.string().optional(),
  description: z.string().optional(),
  icon: z.string().optional(),
  sortOrder: z.number().optional(),
  isActive: z.boolean().optional(),
});

export type CategoryFormData = z.infer<typeof categorySchema>;

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
  parentCategories = [],
}: CategoryFormProps) {
  const { t, dir } = useLanguage();
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    setIsClient(true);
  }, []);

  const {
    register,
    handleSubmit,
    formState: { isSubmitting, isValid },
    watch,
    setValue,
  } = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema as any),
    defaultValues: initialData
      ? {
          name: initialData.name,
          nameAr: initialData.nameAr || initialData.translations?.ar?.name || '',
          slug: initialData.slug || '',
          description: initialData.description || '',
          icon: initialData.icon || '',
          sortOrder: initialData.sortOrder ?? 0,
          isActive: initialData.isActive ?? true,
        }
      : {
          name: '',
          nameAr: '',
          slug: '',
          description: '',
          icon: '',
          sortOrder: 0,
          isActive: true,
        },
  });

  const watchedName = watch('name');

  // Auto-generate slug from name
  useEffect(() => {
    if (!initialData && watchedName) {
      const slug = watchedName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
      setValue('slug', slug);
    }
  }, [watchedName, setValue, initialData]);

  const handleFormSubmit = async (data: CategoryFormData) => {
    try {
      setErrors({});
      // Build payload matching backend CreateCategoryDto exactly
      const payload: any = {
        name: data.name,
        slug: data.slug || undefined,
        description: data.description || undefined,
        icon: data.icon || undefined,
        sortOrder: data.sortOrder ?? 0,
        isActive: data.isActive ?? true,
      };

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

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* Form Error */}
      {errors.form && (
        <div className="flex items-start gap-3 p-4 rounded-lg bg-danger/10 border border-danger/20">
          <AlertCircle className="w-5 h-5 text-danger shrink-0 mt-0.5" />
          <p className="text-sm text-danger">{errors.form}</p>
        </div>
      )}

      {/* Basic Information */}
      <AmberCard>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-sm font-black text-zinc-text uppercase tracking-widest">
              {t('category.basic_info') || 'Basic Information'}
            </h3>
            <p className="text-xs text-zinc-muted mt-1">
              {t('category.basic_info_desc') || 'Basic category information'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Name (English) */}
          <AmberInput
            label={t('category.name_en') || 'Name (English)'}
            placeholder="Category name"
            error={errors.name}
            required
            {...register('name')}
          />

          {/* Name (Arabic) */}
          <AmberInput
            label={t('category.name_ar') || 'Name (Arabic)'}
            placeholder="اسم التصنيف"
            dir="rtl"
            {...register('nameAr')}
          />

          {/* Slug */}
          <AmberInput
            label={t('category.slug') || 'Slug'}
            placeholder="category-url-slug"
            error={errors.slug}
            {...register('slug')}
          />

          {/* Status (mapped to isActive) */}
          <AmberDropdown
            label={t('category.status') || 'Status'}
            options={[
              { label: t('status.active') || 'نشط', value: 'active' },
              { label: t('status.inactive') || 'غير نشط', value: 'inactive' },
            ]}
            value={watch('isActive') ? 'active' : 'inactive'}
            onChange={val => setValue('isActive', val === 'active')}
          />

          {/* Sort Order */}
          <AmberInput
            type="number"
            label={t('category.order') || 'Display Order'}
            placeholder="0"
            {...register('sortOrder', { valueAsNumber: true })}
          />

          {/* Icon */}
          <IconPicker
            value={watch('icon') || ''}
            onChange={val => setValue('icon', val)}
            label={t('category.icon') || 'Icon'}
            placeholder={t('category.icon_placeholder') || 'Select an icon'}
            searchPlaceholder={t('category.icon_search') || 'Search icons...'}
          />
        </div>

        {/* Description */}
        <div className="mt-6">
          <AmberInput
            label={t('category.description') || 'Description'}
            multiline
            rows={3}
            placeholder={t('category.description_placeholder') || 'وصف التصنيف...'}
            {...register('description')}
          />
        </div>
      </AmberCard>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3">
        <AmberButton
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isSubmitting || isLoading}
          className="h-11 px-6 rounded-xl border-[var(--color-border)] font-bold"
        >
          {t('common.cancel') || 'إلغاء'}
        </AmberButton>
        <AmberButton
          type="submit"
          disabled={isSubmitting || isLoading}
          className="h-11 px-8 bg-[var(--color-brand)] hover:bg-[var(--color-brand)] text-black font-bold rounded-xl shadow-sm transition-all border-none"
        >
          {isSubmitting || isLoading ? (
            <span className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              {t('common.saving') || 'جاري الحفظ...'}
            </span>
          ) : initialData ? (
            t('common.update') || 'تحديث'
          ) : (
            t('common.create') || 'إنشاء'
          )}
        </AmberButton>
      </div>
    </form>
  );
};

export default CategoryForm;
