import React, { useState, useEffect } from 'react';
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
import { AmberInput } from '@core/components/AmberInput';
import { AmberDropdown } from '@core/components/AmberDropdown';
import { AmberImageUpload } from '@core/components/AmberImageUpload';
import { AmberFormSkeleton } from '@core/components/Loading/AmberFormSkeleton';
import { useFileUpload } from '@core/hooks/useFileUpload';
import { useCreateListing, useUpdateListing, useGetListing } from '../api/listing-hooks';
import { useList as useCategories } from '../../../services/categories/hooks';
import type { CreateListingInput } from '../../../types/services/listings.types';

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
  const categoryOptions = (categoriesData as any)?.categories?.map((c: any) => ({
    label: c.name,
    value: String(c.id),
  })) || [];

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

  const [errors, setErrors] = useState<Record<string, string>>({});
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

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => { const n = { ...prev }; delete n[field]; return n; });
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.title?.trim()) newErrors.title = t('listing.form.title_required') || 'Title is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

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
            onClick={handleSubmit}
            disabled={createMutation.isPending || updateMutation.isPending || isUploading}
          >
            {(createMutation.isPending || updateMutation.isPending || isUploading) ? (
              <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
            ) : (
              <Save className="w-5 h-5" />
            )}
            <span>{t('listing.form.save')}</span>
          </AmberButton>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Product Info Section */}
        <div className="lg:col-span-2 space-y-8">
          <Card className="!p-8 bg-obsidian-card border-border shadow-xl space-y-8">
            <div className="flex items-center gap-3 border-b border-white/[0.03] pb-6">
              <div className="w-10 h-10 rounded-lg bg-brand/10 flex items-center justify-center text-brand border border-brand/20">
                <Package className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-black text-zinc-text uppercase tracking-[0.25em]">{t('listing.form.section.product_info')}</h3>
            </div>

            <div className="space-y-6">
              <AmberInput
                label={t('listing.form.title')}
                placeholder={t('listing.form.title_placeholder')}
                value={formData.title}
                onChange={(e) => handleChange('title', e.target.value)}
                error={errors.title}
              />

              <AmberInput
                label={t('listing.form.description')}
                placeholder={t('listing.form.description_placeholder')}
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                multiline
                rows={4}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <AmberDropdown
                  label={t('listing.form.category')}
                  options={[{ label: t('common.select') || 'Select...', value: '' }, ...categoryOptions]}
                  value={String(formData.categoryId || '')}
                  onChange={(val) => handleChange('categoryId', val ? Number(val) : undefined)}
                />
                <AmberInput
                  label={t('listing.form.brand')}
                  placeholder={t('listing.form.brand_placeholder')}
                  value={formData.brand || ''}
                  onChange={(e) => handleChange('brand', e.target.value)}
                />
                <AmberInput
                  label={t('listing.form.model')}
                  placeholder={t('listing.form.model_placeholder')}
                  value={formData.model || ''}
                  onChange={(e) => handleChange('model', e.target.value)}
                />
                <AmberDropdown
                  label={t('listing.form.condition')}
                  options={[
                    { label: t('common.select') || 'Select...', value: '' },
                    { label: t('common.condition_new') || 'New', value: 'new' },
                    { label: t('common.condition_used') || 'Used', value: 'used' },
                    { label: t('common.condition_open_box') || 'Open Box', value: 'open_box' },
                    { label: t('common.condition_refurbished') || 'Refurbished', value: 'refurbished' },
                  ]}
                  value={formData.condition || ''}
                  onChange={(val) => handleChange('condition', val)}
                />
                <AmberDropdown
                  label={t('listing.form.authenticity')}
                  options={[
                    { label: t('common.select') || 'Select...', value: '' },
                    { label: t('common.authenticity_original') || 'Original', value: 'original' },
                    { label: t('common.authenticity_copy') || 'Copy', value: 'copy' },
                    { label: t('common.authenticity_high_copy') || 'High Copy', value: 'high_copy' },
                  ]}
                  value={formData.authenticity || ''}
                  onChange={(val) => handleChange('authenticity', val)}
                />
                <AmberInput
                  label={t('listing.form.sku')}
                  placeholder={t('listing.form.sku_placeholder')}
                  value={formData.sku || ''}
                  onChange={(e) => handleChange('sku', e.target.value)}
                />
              </div>
            </div>
          </Card>
        </div>

        {/* Images & Actions Sidebar */}
        <div className="space-y-8">
          {/* Image Upload Card */}
          <Card className="!p-8 bg-obsidian-card border-border shadow-xl space-y-6">
            <div className="flex items-center gap-3 border-b border-white/[0.03] pb-6">
              <div className="w-10 h-10 rounded-lg bg-info/10 flex items-center justify-center text-info border border-info/20">
                <ImageIcon className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-black text-zinc-text uppercase tracking-[0.25em]">{t('listing.form.section.media')}</h3>
            </div>
            <div className="space-y-4">
              <AmberImageUpload
                value={formData.images || []}
                onChange={(files) => {
                  if (files?.[0]) {
                    setSelectedImageFile(files[0]);
                    handleChange('images', [...(formData.images || []), URL.createObjectURL(files[0])]);
                  }
                }}
                onRemove={(index) => {
                  const newImages = [...(formData.images || [])];
                  newImages.splice(index, 1);
                  handleChange('images', newImages);
                }}
                onReorder={(newOrder) => handleChange('images', newOrder)}
                multiple={true}
                sortable={true}
                disabled={isUploading}
                isUploading={isUploading}
                uploadProgress={uploadProgress}
                uploadError={uploadError}
              />
              <p className="text-[10px] text-zinc-muted font-bold text-center uppercase tracking-widest">
                {t('common.image_upload_hint') || 'PNG, JPG up to 10MB'}
              </p>
            </div>
          </Card>

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
              disabled={updateMutation.isPending || createMutation.isPending || isUploading}
              onClick={handleSubmit}
            >
              {(updateMutation.isPending || createMutation.isPending || isUploading) && (
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
      </form>
    </div>
  );
};

export default ListingFormPage;
