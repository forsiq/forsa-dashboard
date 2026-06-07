import React, { useMemo, useState } from 'react';
import { Plus, Loader2 } from 'lucide-react';
import { useLanguage } from '@core/contexts/LanguageContext';
import { AmberSlideOver } from '@core/components/AmberSlideOver';
import { AmberButton } from '@core/components/AmberButton';
import { FormBuilder } from '@core/components/Form/FormBuilder';
import { CategoryPicker } from '@services/categories/components/CategoryPicker';
import { useCreateListing } from '../api/listing-hooks';
import type { FormFieldConfig } from '@core/services/types';
import type { ProductListing, CreateListingInput } from '../../../types/services/listings.types';

const HISTORY_KEY = 'history_listing';

function readListingHistory(): Record<string, unknown> | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveListingHistory(data: Record<string, unknown>) {
  try {
    const existing = readListingHistory() || {};
    const updated = { ...existing };
    if (data.categoryId !== undefined && data.categoryId !== null && data.categoryId !== '') {
      updated.categoryId = data.categoryId;
    }
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
  } catch {
    // ignore
  }
}

interface QuickAddListingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (listing: ProductListing) => void;
}

export function QuickAddListingModal({ isOpen, onClose, onSuccess }: QuickAddListingModalProps) {
  const { t } = useLanguage();
  const createMutation = useCreateListing();
  const listingHistory = useMemo(() => readListingHistory(), []);
  const [categoryId, setCategoryId] = useState<number | undefined>(
    listingHistory?.categoryId ? Number(listingHistory.categoryId) : undefined,
  );

  const fields: FormFieldConfig[] = useMemo(() => [
    {
      name: 'title',
      label: t('listing.form.title') || 'Product Title',
      type: 'text',
      placeholder: t('listing.form.title_placeholder') || 'Enter product title',
      required: true,
    },
  ], [t]);

  const handleSubmit = async (data: Record<string, unknown>) => {
    try {
      const payload: CreateListingInput = {
        title: data.title as string,
        categoryId: categoryId ? Number(categoryId) : undefined,
      };
      saveListingHistory({ ...data, categoryId });
      const result = await createMutation.mutateAsync(payload);
      onClose();
      if (onSuccess) {
        onSuccess((result as { data?: ProductListing })?.data || (result as ProductListing));
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
      <div className="space-y-6">
        <div className="space-y-2">
          <label className="text-[11px] font-black text-zinc-muted uppercase tracking-widest">
            {t('listing.form.category') || 'Category'}
          </label>
          <CategoryPicker
            value={categoryId}
            onChange={(id) => setCategoryId(id || undefined)}
          />
        </div>
        <FormBuilder
          fields={fields}
          initialValues={{ title: '' }}
          onSubmit={handleSubmit}
          isLoading={createMutation.isPending}
          showActions={false}
        />
      </div>
    </AmberSlideOver>
  );
}
