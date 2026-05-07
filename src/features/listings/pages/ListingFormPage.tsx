import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import {
  Package,
  Save,
  ChevronLeft,
  X,
  AlertCircle,
  Image as ImageIcon,
  Info,
} from 'lucide-react';
import { useLanguage } from '@core/contexts/LanguageContext';
import { cn } from '@core/lib/utils/cn';
import { AmberCard as Card } from '@core/components/AmberCard';
import { AmberButton } from '@core/components/AmberButton';
import { AmberImageUpload } from '@core/components/AmberImageUpload';
import { AmberFormSkeleton } from '@core/components/Loading/AmberFormSkeleton';
import { FormBuilder } from '@core/components/Form/FormBuilder';
import { FormSection } from '@core/components/FormSection';
import { useFormUX } from '@core/hooks/useFormUX';
import { useFileUpload } from '@core/hooks/useFileUpload';
import { useCreateListing, useUpdateListing, useGetListing } from '../api/listing-hooks';
import { useList as useCategories } from '../../../services/categories/hooks';
import type { CreateListingInput } from '../../../types/services/listings.types';
import type { FormFieldConfig } from '@core/services/types';

export const ListingFormPage: React.FC = () => {
  const { t, dir } = useLanguage();
  const router = useRouter();
  const { id } = router.query;
  const isEdit = !!id;
  const isRTL = dir === 'rtl';
  const [isClient, setIsClient] = useState(false);

  useEffect(() => { setIsClient(true); }, []);

  const { data: existingListing, isLoading } = useGetListing(Number(id), isEdit);
  const { data: categoriesData } = useCategories({ limit: 100 });
  const categoryOptions = useMemo(() =>
    (categoriesData as any)?.categories?.map((c: any) => ({
      label: c.name,
      value: String(c.id),
    })) || []
  , [categoriesData]);

  const createMutation = useCreateListing();
  const updateMutation = useUpdateListing();

  const [formData, setFormData] = useState<Partial<CreateListingInput>>({
    title: '',
    description: '',
    categoryId: undefined,
    brand: '',
    model: '',
    condition: '',
    authenticity: '',
    sku: '',
    images: [],
  });

  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const { upload: uploadFile, isUploading, progress: uploadProgress, error: uploadError } = useFileUpload();
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (isEdit && existingListing) {
      setFormData({
        title: existingListing.title,
        description: existingListing.description,
        categoryId: existingListing.categoryId,
        brand: existingListing.brand || '',
        model: existingListing.model || '',
        condition: existingListing.condition || '',
        authenticity: existingListing.authenticity || '',
        sku: existingListing.sku || '',
        images: existingListing.images || [],
      });
    }
  }, [isEdit, existingListing]);

  const isSubmitting = createMutation.isPending || updateMutation.isPending || isUploading;

  // Unsaved changes warning
  const { isDirty, markClean } = useFormUX({
    values: formData,
    initialValues: isEdit && existingListing ? {
      title: existingListing.title,
      description: existingListing.description,
      categoryId: existingListing.categoryId,
      brand: existingListing.brand || '',
      model: existingListing.model || '',
      condition: existingListing.condition || '',
      authenticity: existingListing.authenticity || '',
      sku: existingListing.sku || '',
      images: existingListing.images || [],
    } : {
      title: '',
      description: '',
      categoryId: undefined,
      brand: '',
      model: '',
      condition: '',
      authenticity: '',
      sku: '',
      images: [],
    },
    isSubmitting,
    storageKey: isEdit ? `draft-listing-${id}` : 'draft-listing-new',
  });

  // Form fields config for FormBuilder
  const formFields: FormFieldConfig[] = useMemo(() => [
    {
      name: 'title',
      label: t('listing.form.title') || 'Title',
      type: 'text',
      placeholder: t('listing.form.title_placeholder') || 'Enter product title',
      required: true,
    },
    {
      name: 'description',
      label: t('listing.form.description') || 'Description',
      type: 'textarea',
      placeholder: t('listing.form.description_placeholder') || 'Describe your product',
    },
    {
      name: 'categoryId',
      label: t('listing.form.category') || 'Category',
      type: 'select',
      placeholder: t('common.select') || 'Select...',
      options: categoryOptions,
    },
    {
      name: 'brand',
      label: t('listing.form.brand') || 'Brand',
      type: 'text',
      placeholder: t('listing.form.brand_placeholder') || 'Brand name',
    },
    {
      name: 'model',
      label: t('listing.form.model') || 'Model',
      type: 'text',
      placeholder: t('listing.form.model_placeholder') || 'Model name',
    },
    {
      name: 'condition',
      label: t('listing.form.condition') || 'Condition',
      type: 'select',
      placeholder: t('common.select') || 'Select...',
      options: [
        { label: t('common.condition_new') || 'New', value: 'new' },
        { label: t('common.condition_used') || 'Used', value: 'used' },
        { label: t('common.condition_open_box') || 'Open Box', value: 'open_box' },
        { label: t('common.condition_refurbished') || 'Refurbished', value: 'refurbished' },
      ],
    },
    {
      name: 'authenticity',
      label: t('listing.form.authenticity') || 'Authenticity',
      type: 'select',
      placeholder: t('common.select') || 'Select...',
      options: [
        { label: t('common.authenticity_original') || 'Original', value: 'original' },
        { label: t('common.authenticity_copy') || 'Copy', value: 'copy' },
        { label: t('common.authenticity_high_copy') || 'High Copy', value: 'high_copy' },
      ],
    },
    {
      name: 'sku',
      label: t('listing.form.sku') || 'SKU',
      type: 'text',
      placeholder: t('listing.form.sku_placeholder') || 'SKU number',
    },
  ], [t, categoryOptions]);

  const handleFormChange = (data: Record<string, unknown>, field: string, value: unknown) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (data: Record<string, unknown>) => {
    try {
      setSubmitError(null);
      let uploadedAttachmentId: number | null = null;
      if (selectedImageFile) {
        uploadedAttachmentId = await uploadFile(selectedImageFile);
      }

      const payload: any = {
        ...formData,
        categoryId: formData.categoryId ? Number(formData.categoryId) : undefined,
      };
      if (uploadedAttachmentId) {
        payload.mainAttachmentId = uploadedAttachmentId;
        payload.attachmentIds = [uploadedAttachmentId];
      }

      if (isEdit) {
        await updateMutation.mutateAsync({ id: Number(id), data: payload });
      } else {
        await createMutation.mutateAsync(payload);
      }
      markClean();
      router.push('/listings');
    } catch (err: any) {
      setSubmitError(err?.message || t('common.error_occurred') || 'Submission failed');
    }
  };

  if (!isClient) return null;

  if (isEdit && (isLoading || !router.isReady)) {
    return (
      <div className="max-w-6xl mx-auto p-6 space-y-8">
        <AmberFormSkeleton fields={8} header actions layout="grid" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700" dir={dir}>
      {/* Submission Error Banner */}
      {submitError && (
        <div className="bg-danger/10 border border-danger/20 p-4 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
          <AlertCircle className="w-5 h-5 text-danger shrink-0" />
          <p className="text-sm text-danger font-medium">{submitError}</p>
          <button onClick={() => setSubmitError(null)} className="ml-auto text-danger/60 hover:text-danger">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Dynamic Navigation Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <Link href="/listings">
            <AmberButton variant="secondary" className="p-0 w-11 h-11 rounded-xl flex items-center justify-center active:scale-95 transition-all bg-obsidian-card border-border">
              <ChevronLeft className={cn("w-5 h-5", isRTL && "rotate-180")} />
            </AmberButton>
          </Link>
          <div>
            <h1 className="text-3xl font-black text-zinc-text tracking-tighter uppercase leading-none">
              {isEdit ? t('listing.form.header.edit') : t('listing.form.header.create')}
            </h1>
            <p className="text-sm text-zinc-muted font-bold tracking-tight uppercase mt-1">
              {isEdit ? t('listing.form.header.editing') : t('listing.form.create_listing')}
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <AmberButton
            variant="outline"
            className="h-11 border-border font-bold rounded-xl px-6 hover:bg-obsidian-hover active:scale-95 transition-all"
            onClick={() => router.push('/listings')}
          >
            {t('listing.form.cancel')}
          </AmberButton>
          <AmberButton
            className="h-11 bg-brand hover:bg-brand text-black font-black rounded-xl px-10 shadow-lg border-none active:scale-95 transition-all gap-2"
            onClick={() => {
              const form = document.querySelector('form');
              if (form) form.requestSubmit();
            }}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
            ) : (
              <Save className="w-5 h-5" />
            )}
            <span>{t('listing.form.save')}</span>
          </AmberButton>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Product Info Section */}
        <div className="lg:col-span-2">
          <FormSection
            icon={<Package className="w-5 h-5" />}
            iconBgColor="brand"
            title={t('listing.form.section.product_info') || 'Product Information'}
          >
            <FormBuilder
              fields={formFields}
              initialValues={formData as Record<string, unknown>}
              onSubmit={handleSubmit}
              isLoading={isSubmitting}
              showActions={false}
              layout="vertical"
              onChange={handleFormChange}
            />
          </FormSection>
        </div>

        {/* Images & Actions Sidebar */}
        <div className="space-y-8">
          {/* Image Upload Card */}
          <FormSection
            icon={<ImageIcon className="w-5 h-5" />}
            iconBgColor="info"
            title={t('listing.form.section.media') || 'Media'}
          >
            <AmberImageUpload
              value={formData.images || []}
              onChange={(files) => {
                if (files?.[0]) {
                  setSelectedImageFile(files[0]);
                  setFormData(prev => ({
                    ...prev,
                    images: [...(prev.images || []), URL.createObjectURL(files[0])],
                  }));
                }
              }}
              onRemove={(index) => {
                const newImages = [...(formData.images || [])];
                newImages.splice(index, 1);
                setFormData(prev => ({ ...prev, images: newImages }));
              }}
              onReorder={(newOrder) => setFormData(prev => ({ ...prev, images: newOrder }))}
              multiple={true}
              sortable={true}
              disabled={isUploading}
              isUploading={isUploading}
              uploadProgress={uploadProgress}
              uploadError={uploadError}
            />
            <p className="text-[10px] text-zinc-muted font-bold text-center uppercase tracking-widest mt-4">
              {t('common.image_upload_hint') || 'PNG, JPG up to 10MB'}
            </p>
          </FormSection>

          {/* Info Note */}
          <div className="p-5 rounded-2xl bg-brand/[0.02] border border-brand/10 flex items-start gap-4">
            <div className="w-8 h-8 rounded-full bg-brand/10 flex items-center justify-center shrink-0">
              <Info className="w-4 h-4 text-brand" />
            </div>
            <div className="space-y-1">
              <p className="text-xs font-black text-brand uppercase">{t('listing.form.create_listing')}</p>
              <p className="text-[11px] text-zinc-muted font-bold tracking-tight">
                {t('listing.description')}
              </p>
            </div>
          </div>

          {/* Submit Actions */}
          <div className="space-y-3">
            <AmberButton
              className="w-full h-14 bg-brand hover:bg-brand text-black font-black uppercase tracking-[0.2em] rounded-2xl shadow-xl active:scale-95 transition-all text-sm gap-3"
              disabled={isSubmitting}
              onClick={() => {
                const form = document.querySelector('form');
                if (form) form.requestSubmit();
              }}
            >
              {isSubmitting && (
                <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
              )}
              {t('listing.form.save')}
            </AmberButton>
            <AmberButton
              variant="secondary"
              className="w-full h-12 bg-obsidian-card font-black uppercase tracking-widest rounded-xl border border-white/5 active:scale-95 transition-all"
              onClick={() => router.push('/listings')}
            >
              {t('listing.form.cancel')}
            </AmberButton>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ListingFormPage;
