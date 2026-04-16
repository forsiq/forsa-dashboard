import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, AlertCircle } from 'lucide-react';
import { useLanguage } from '../../../core/contexts/LanguageContext';
import { cn } from '../../../core/lib/utils/cn';
import { AmberInput } from '../../../core/components/AmberInput';
import { AmberButton } from '../../../core/components/AmberButton';
import { AmberCard } from '../../../core/components/AmberCard';
import { AmberImageUpload } from '../../../core/components/AmberImageUpload';
import { AmberDropdown } from '../../../core/components/AmberDropdown';
import type { Category, CreateCategoryInput, UpdateCategoryInput } from '../types';

// --- Validation Schema ---

const categorySchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  nameAr: z.string().optional(),
  slug: z.string().optional(),
  description: z.string().optional(),
  parentId: z.string().optional(),
  status: z.enum(['active', 'inactive']),
  order: z.number().optional(),
  image: z.string().optional(),
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

/**
 * CategoryForm - Form for creating/editing categories
 *
 * @example
 * <CategoryForm
 *   initialData={category}
 *   onSubmit={async (data) => {
 *     await updateCategory(data);
 *   }}
 *   parentCategories={categories}
 * />
 */
export function CategoryForm({
  initialData,
  onSubmit,
  isLoading = false,
  parentCategories = [],
}: CategoryFormProps) {
  const { t, dir } = useLanguage();
  const navigate = useNavigate();
  const [errors, setErrors] = useState<Record<string, string>>({});

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
          nameAr: initialData.nameAr || '',
          slug: initialData.slug || '',
          description: initialData.description || '',
          parentId: initialData.parentId || '',
          status: initialData.status,
          order: initialData.order,
          image: initialData.image || '',
        }
      : {
          name: '',
          nameAr: '',
          slug: '',
          description: '',
          parentId: '',
          status: 'active',
          order: 0,
          image: '',
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
      await onSubmit(data);
    } catch (err: any) {
      if (err.details) {
        setErrors(err.details);
      } else {
        setErrors({ form: err.message || 'An error occurred' });
      }
    }
  };

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
            label={t('category.name_en')}
            placeholder={t('category.name_en_placeholder') || "Category name"}
            error={errors.name}
            required
            {...register('name')}
          />

          {/* Name (Arabic) */}
          <AmberInput
            label={t('category.name_ar')}
            placeholder={t('category.name_ar_placeholder') || "اسم التصنيف"}
            dir="rtl"
            {...register('nameAr')}
          />

          {/* Slug */}
          <AmberInput
            label={t('category.slug')}
            placeholder={t('category.slug_placeholder') || "category-url-slug"}
            error={errors.slug}
            {...register('slug')}
          />

          <AmberDropdown 
            label={t('category.status')}
            options={[
              { label: t('category.active'), value: 'active' },
              { label: t('category.inactive'), value: 'inactive' },
            ]}
            value={watch('status')}
            onChange={val => setValue('status', val as any)}
          />

          <AmberDropdown 
            label={t('category.parent')}
            options={[
              { label: t('category.no_parent'), value: '' },
              ...parentCategories
                .filter(c => c.id !== initialData?.id)
                .map(category => ({
                  label: category.name,
                  value: category.id
                }))
            ]}
            value={watch('parentId')}
            onChange={val => setValue('parentId', val)}
          />

          {/* Order */}
          <AmberInput
            type="number"
            label={t('category.order')}
            placeholder="0"
            {...register('order', { valueAsNumber: true })}
          />
        </div>

        <AmberInput 
          label={t('category.description')}
          multiline
          rows={3}
          placeholder={t('category.description_placeholder')}
          {...register('description')}
        />
      </AmberCard>

      {/* Image Upload */}
      <AmberCard>
        <div className="mb-6">
          <h3 className="text-sm font-black text-zinc-text uppercase tracking-widest">
            {t('category.image') || 'Category Image'}
          </h3>
        </div>
        <AmberImageUpload
          value={watch('image')}
          onChange={(files) => {
            // In a real app, you'd upload the file first
            const imageUrl = URL.createObjectURL(files[0]);
            setValue('image', imageUrl);
          }}
          onRemove={() => setValue('image', '')}
        />
      </AmberCard>

      {/* Form Note */}
      <div className="flex items-center gap-3 p-4 rounded-xl bg-brand/5 border border-brand/10">
        <div className="w-8 h-8 rounded-lg bg-brand/10 flex items-center justify-center text-brand">
          <AlertCircle className="w-4 h-4" />
        </div>
        <p className="text-[11px] font-bold text-zinc-muted tracking-tight uppercase">
          {t('category.form_note')}
        </p>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3">
        <AmberButton
          type="button"
          variant="outline"
          onClick={() => navigate(-1)}
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
}

export default CategoryForm;
