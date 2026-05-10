import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/router';
import { Plus, Loader2 } from 'lucide-react';
import { useLanguage } from '@core/contexts/LanguageContext';
import { AmberSlideOver } from '@core/components/AmberSlideOver';
import { AmberButton } from '@core/components/AmberButton';
import { FormBuilder } from '@core/components/Form/FormBuilder';
import { useCreateListing } from '../api/listing-hooks';
import { useList as useCategories } from '../../../services/categories/hooks';
import { getLocalizedName } from '../../../services/categories/types';
import type { FormFieldConfig } from '@core/services/types';

interface QuickAddListingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function QuickAddListingModal({ isOpen, onClose }: QuickAddListingModalProps) {
  const { t, language } = useLanguage();
  const router = useRouter();
  const createMutation = useCreateListing();
  const { data: categoriesData } = useCategories({ limit: 100 });

  const categoryOptions = useMemo(() =>
    (categoriesData as any)?.categories?.map((c: any) => ({
      label: getLocalizedName(c, language) || c.name || c.slug,
      value: String(c.id),
    })) || []
  , [categoriesData, language]);

  const fields: FormFieldConfig[] = useMemo(() => [
    {
      name: 'title',
      label: t('listing.form.title') || 'Product Title',
      type: 'text',
      placeholder: t('listing.form.title_placeholder') || 'Enter product title',
      required: true,
    },
    {
      name: 'categoryId',
      label: t('listing.form.category') || 'Category',
      type: 'select',
      placeholder: t('common.select') || 'Select category...',
      options: categoryOptions,
    },
  ], [t, categoryOptions]);

  const handleSubmit = async (data: Record<string, unknown>) => {
    try {
      const payload: any = {
        title: data.title as string,
        categoryId: data.categoryId ? Number(data.categoryId) : undefined,
      };
      const result = await createMutation.mutateAsync(payload);
      onClose();
      const listingId = (result as any)?.data?.id || (result as any)?.id;
      if (listingId) {
        router.push(`/listings/${listingId}/edit`);
      } else {
        router.push('/listings');
      }
    } catch {
      // Error handled by mutation
    }
  };

  return (
    <AmberSlideOver
      isOpen={isOpen}
      onClose={onClose}
      title={t('listing.quick_add.title') || 'Quick Add Product'}
      description={t('listing.quick_add.description') || 'Create a product listing in seconds. You can edit details later.'}
      footer={
        <div className="flex gap-3">
          <AmberButton
            variant="ghost"
            onClick={onClose}
            className="flex-1 h-11 rounded-xl font-bold"
          >
            {t('common.cancel') || 'Cancel'}
          </AmberButton>
          <AmberButton
            className="flex-1 h-11 bg-brand text-black font-black rounded-xl gap-2"
            onClick={() => {
              const form = document.querySelector('form');
              if (form) form.requestSubmit();
            }}
            disabled={createMutation.isPending}
          >
            {createMutation.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Plus className="w-4 h-4" />
            )}
            {t('listing.quick_add.create') || 'Create & Edit'}
          </AmberButton>
        </div>
      }
    >
      <FormBuilder
        fields={fields}
        initialValues={{ title: '', categoryId: '' }}
        onSubmit={handleSubmit}
        isLoading={createMutation.isPending}
        showActions={false}
      />
    </AmberSlideOver>
  );
}
