import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useLanguage } from '../../../core/contexts/LanguageContext';
import { CategoryForm } from '../components/CategoryForm';
import { useGetCategories, useCreateCategoryMutation } from '../hooks';

/**
 * CategoryAddPage - Add new category page
 *
 * URL: /categories/new
 */
export function CategoryAddPage() {
  const { t } = useLanguage();
  const navigate = useNavigate();

  // Fetch categories for parent selection
  const { data: categoriesData } = useGetCategories({
    limit: 100,
    status: 'active',
  });

  // Create mutation
  const createMutation = useCreateCategoryMutation({
    onSuccess: (data) => {
      navigate(`/categories/${data.id}`);
    },
    onError: (err) => {
      // Error is handled in the form
      console.error('Create category error:', err);
    },
  });

  const handleSubmit = async (data: any) => {
    await createMutation.mutateAsync(data);
  };

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-zinc-muted">
        <span>{t('category.categories') || 'Categories'}</span>
        <span>/</span>
        <span className="text-zinc-text">{t('category.add_new') || 'Add New Category'}</span>
      </div>

      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-black text-zinc-text uppercase tracking-tighter italic">
          {t('category.architecture')}
        </h1>
        <p className="text-sm text-zinc-muted font-bold tracking-tight uppercase mt-1">
          {t('category.architecture_desc')}
        </p>
      </div>

      {/* Form */}
      <CategoryForm
        onSubmit={handleSubmit}
        isLoading={createMutation.isPending}
        parentCategories={categoriesData?.categories || []}
      />
    </div>
  );
}

export default CategoryAddPage;
