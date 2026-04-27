import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useQuery } from '@tanstack/react-query';
import { Loader2, AlertCircle } from 'lucide-react';
import { useLanguage } from '@core/contexts/LanguageContext';
import { AmberButton } from '@core/components/AmberButton';
import { CategoryForm } from '../components/CategoryForm';
import { useGetCategories, useGetCategory, useUpdateCategoryMutation } from '../hooks';

/**
 * CategoryEditPage - Edit existing category page
 *
 * URL: /categories/:id/edit
 */
export function CategoryEditPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const { id } = router.query;
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Fetch category
  const { data: category, isLoading, error } = useGetCategory((id as string) || '', true);

  // Fetch categories for parent selection
  const { data: categoriesData } = useGetCategories({
    limit: 100,
  });

  // Update mutation
  const updateMutation = useUpdateCategoryMutation({
    onSuccess: (data) => {
      router.push(`/categories/${data.id}`);
    },
  });

  const handleSubmit = async (data: any) => {
    await updateMutation.mutateAsync({
      id: (id as string)!,
      ...data,
    });
  };

  if (!isClient) return null;

  if (isLoading || !router.isReady) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-brand" />
      </div>
    );
  }

  if (error || !category) {
    return (
      <div className="max-w-md mx-auto p-6 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-danger mx-auto" />
        <h2 className="text-lg font-bold text-zinc-text">
          {t('category.not_found') || 'Category not found'}
        </h2>
        <p className="text-sm text-zinc-muted">
          {t('category.not_found_desc') || 'The category you are looking for does not exist.'}
        </p>
        <AmberButton onClick={() => router.push('/categories')}>
          {t('common.back') || 'Back to Categories'}
        </AmberButton>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-zinc-muted">
        <span onClick={() => router.push('/categories')} className="hover:text-zinc-text cursor-pointer">
          {t('category.categories') || 'Categories'}
        </span>
        <span>/</span>
        <span onClick={() => router.push(`/categories/${category.id}`)} className="hover:text-zinc-text cursor-pointer">
          {category.name}
        </span>
        <span>/</span>
        <span className="text-zinc-text">{t('common.edit') || 'Edit'}</span>
      </div>

      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-zinc-text">
          {t('category.edit') || 'Edit Category'}
        </h1>
        <p className="text-sm text-zinc-muted mt-1">
          {category.name}
        </p>
      </div>

      {/* Form */}
      <CategoryForm
        initialData={category}
        onSubmit={handleSubmit}
        isLoading={updateMutation.isPending}
        parentCategories={categoriesData?.categories || []}
      />
    </div>
  );
}

export default CategoryEditPage;
