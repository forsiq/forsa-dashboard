import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import { AmberCard as Card } from '@core/components/AmberCard';
import { AmberButton } from '@core/components/AmberButton';
import { AmberInput } from '@core/components/AmberInput';
import { AmberDropdown } from '@core/components/AmberDropdown';
import { AmberImageUpload } from '@core/components/AmberImageUpload';
import { AmberFormSkeleton } from '@core/components/Loading/AmberFormSkeleton';
import { cn } from '@core/lib/utils/cn';
import { useLanguage } from '@core/contexts/LanguageContext';
import {
  Package,
  Save,
  X,
  TrendingUp,
  ArrowLeft,
  Loader2,
  AlertCircle,
} from 'lucide-react';

import { useRouteParam } from '@core/hooks/useRouteParam';
import { usePendingImageFiles } from '@core/hooks/usePendingImageFiles';
import { useAttachmentUrls } from '@core/hooks/useAttachmentUrls';
import { uploadAttachmentAndGetId, parseAttachmentIds } from '@features/auctions/utils/auction-utils';
import { useById, useUpdate } from '../hooks';
import type { Product } from '../types';

// --- Types ---

interface ProductForm {
  name: string;
  nameAr: string;
  nameKu: string;
  sku: string;
  barcode: string;
  categoryId: string;
  description: string;
  descriptionAr: string;
  descriptionKu: string;
  costPrice: string;
  sellingPrice: string;
  taxRate: string;
  stockQuantity: string;
  isActive: boolean;
}

const INITIAL_FORM: ProductForm = {
  name: '',
  nameAr: '',
  nameKu: '',
  sku: '',
  barcode: '',
  categoryId: '',
  description: '',
  descriptionAr: '',
  descriptionKu: '',
  costPrice: '',
  sellingPrice: '',
  taxRate: '',
  stockQuantity: '',
  isActive: true,
};

// --- Component ---

export const ProductEditPage = () => {
  const { t, dir } = useLanguage();
  const router = useRouter();
  const isRTL = dir === 'rtl';

  const id = useRouteParam('id', { parse: 'string' });

  const [formData, setFormData] = useState<ProductForm>(INITIAL_FORM);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isClient, setIsClient] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const imageUpload = usePendingImageFiles();
  const [retainedAttachmentIds, setRetainedAttachmentIds] = useState<number[]>([]);

  // Fetch existing product
  const { data: productData, isLoading: productLoading } = useById(id!, { enabled: !!id });
  const product = productData as Product | undefined;

  // Resolve existing attachment URLs
  const existingAttachmentIds = product
    ? parseAttachmentIds(product.attachmentIds)
    : [];

  const { data: attachmentUrlMap } = useAttachmentUrls(existingAttachmentIds);

  const updateMutation = useUpdate();

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Sync product data into form when loaded
  useEffect(() => {
    if (!product) return;

    setFormData({
      name: product.name || '',
      nameAr: product.nameAr || '',
      nameKu: product.nameKu || '',
      sku: product.sku || '',
      barcode: product.barcode || '',
      categoryId: product.categoryId || '',
      description: product.description || '',
      descriptionAr: product.descriptionAr || '',
      descriptionKu: product.descriptionKu || '',
      costPrice: product.costPrice != null ? String(product.costPrice) : '',
      sellingPrice: product.sellingPrice != null ? String(product.sellingPrice) : '',
      taxRate: product.taxRate != null ? String(product.taxRate) : '',
      stockQuantity: product.stockQuantity != null ? String(product.stockQuantity) : '',
      isActive: product.isActive ?? true,
    });

    // Parse and store retained attachment IDs
    const parsedIds = parseAttachmentIds(product.attachmentIds);
    setRetainedAttachmentIds(parsedIds);
  }, [product]);

  // Reset image previews when attachment URLs are resolved
  useEffect(() => {
    if (!attachmentUrlMap || !product) return;

    const ids = parseAttachmentIds(product.attachmentIds);
    const resolvedUrls = ids
      .map((attId) => attachmentUrlMap.get(attId))
      .filter((url): url is string => !!url);

    if (resolvedUrls.length > 0) {
      imageUpload.resetFromServer(resolvedUrls);
    }
  }, [attachmentUrlMap, product]);

  // --- Handlers ---

  const handleChange = useCallback((field: keyof ProductForm, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  }, [errors]);

  const handleRemoveExisting = useCallback((index: number) => {
    const existingCount = imageUpload.previewUrls.length - imageUpload.pendingFiles.length;
    if (index < existingCount) {
      setRetainedAttachmentIds(prev => prev.filter((_, i) => i !== index));
    }
    imageUpload.removeAt(index);
  }, [imageUpload]);

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!formData.name) e.name = t('error.required_fields') || 'الحقل مطلوب';
    if (!formData.sku) e.sku = t('error.required_fields') || 'الحقل مطلوب';
    if (!formData.costPrice) e.costPrice = t('error.required_fields') || 'الحقل مطلوب';
    if (!formData.sellingPrice) e.sellingPrice = t('error.required_fields') || 'الحقل مطلوب';

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    if (!id) return;

    setSubmitError(null);

    try {
      // Upload pending files
      const newAttachmentIds: number[] = [];
      for (const file of imageUpload.pendingFiles) {
        const attachmentId = await uploadAttachmentAndGetId(file);
        newAttachmentIds.push(attachmentId);
      }

      // Merge retained + new
      const allAttachmentIds = [...retainedAttachmentIds, ...newAttachmentIds];

      const payload: Record<string, any> = {
        id,
        name: formData.name,
        sku: formData.sku,
        costPrice: Number(formData.costPrice),
        sellingPrice: Number(formData.sellingPrice),
        isActive: formData.isActive,
      };

      // Optional fields
      if (formData.nameAr) payload.nameAr = formData.nameAr;
      if (formData.nameKu) payload.nameKu = formData.nameKu;
      if (formData.barcode) payload.barcode = formData.barcode;
      if (formData.categoryId) payload.categoryId = formData.categoryId;
      if (formData.description) payload.description = formData.description;
      if (formData.descriptionAr) payload.descriptionAr = formData.descriptionAr;
      if (formData.descriptionKu) payload.descriptionKu = formData.descriptionKu;
      if (formData.taxRate) payload.taxRate = Number(formData.taxRate);

      // Attachments
      if (allAttachmentIds.length > 0) {
        payload.mainAttachmentId = allAttachmentIds[0];
        payload.attachmentIds = allAttachmentIds;
      }

      await updateMutation.mutateAsync(payload);
      router.push('/inventory');
    } catch (err: any) {
      setSubmitError(err?.message || 'Failed to update product');
    }
  };

  if (!isClient) return null;

  if (productLoading || !id) {
    return <AmberFormSkeleton fields={8} header actions layout="grid" />;
  }

  return (
    <div className="space-y-8 p-6 max-w-[1600px] mx-auto animate-in fade-in duration-700" dir={dir}>
      {/* Error Banner */}
      {submitError && (
        <div className="bg-danger/10 border border-danger/20 p-4 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
          <AlertCircle className="w-5 h-5 text-danger shrink-0" />
          <p className="text-sm text-danger font-medium">{submitError}</p>
          <button onClick={() => setSubmitError(null)} className="ms-auto text-danger/60 hover:text-danger">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 text-start">
        <div className="flex items-center gap-4">
          <AmberButton
            variant="ghost"
            onClick={() => router.back()}
            className="group p-2.5 h-11 w-11 border-[var(--color-border)] rounded-xl hover:bg-[var(--color-obsidian-hover)]"
          >
            <ArrowLeft className={cn("w-5 h-5 transition-transform group-hover:-translate-x-1", isRTL && "rotate-180 group-hover:translate-x-1")} />
          </AmberButton>
          <div className="space-y-1">
            <h1 className="text-4xl font-black text-zinc-text tracking-tight leading-none">
              {t('common.edit') || 'تعديل المنتج'}
            </h1>
            <p className="text-base text-zinc-secondary font-bold">
              {t('prod.add.subtitle_edit') || 'تعديل بيانات المنتج الحالي'}
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <AmberButton
            variant="outline"
            className="px-6 h-11 border-[var(--color-border)] text-zinc-text font-bold rounded-xl active:scale-95 transition-all hover:bg-[var(--color-obsidian-hover)]"
            onClick={() => router.back()}
            disabled={updateMutation.isPending}
          >
            {t('common.cancel')}
          </AmberButton>
          <AmberButton
            className="px-6 h-11 bg-[var(--color-brand)] hover:bg-[var(--color-brand)] text-black font-bold rounded-xl shadow-sm transition-all border-none active:scale-95"
            onClick={handleSubmit}
            disabled={updateMutation.isPending}
          >
            {updateMutation.isPending ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-black" />
                {t('common.saving') || 'جاري الحفظ...'}
              </span>
            ) : (
              <>
                <Save className={cn("w-4 h-4", "me-2")} />
                {t('common.save')}
              </>
            )}
          </AmberButton>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info Card */}
          <Card className="p-8 bg-[var(--color-obsidian-card)] border border-[var(--color-border)] rounded-2xl shadow-sm overflow-visible">
            <div className="flex items-center gap-3 mb-8 border-b border-[var(--color-border)] pb-6">
              <Package className="w-5 h-5 text-[var(--color-brand)]" />
              <h3 className="text-sm font-black text-zinc-text uppercase tracking-widest">
                {t('prod.add.basic_info') || 'المعلومات الأساسية'}
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              <div className="md:col-span-2">
                <AmberInput
                  label={t('prod.add.name') || 'اسم المنتج'}
                  value={formData.name}
                  onChange={e => handleChange('name', e.target.value)}
                  error={errors.name}
                  placeholder={t('prod.add.name') || 'اسم المنتج'}
                  required
                />
              </div>

              <AmberInput
                label={t('prod.add.name_ar') || 'اسم المنتج (عربي)'}
                value={formData.nameAr}
                onChange={e => handleChange('nameAr', e.target.value)}
                placeholder="اسم المنتج بالعربي"
                dir="rtl"
              />

              <AmberInput
                label={t('prod.add.name_ku') || 'اسم المنتج (كردي)'}
                value={formData.nameKu}
                onChange={e => handleChange('nameKu', e.target.value)}
                placeholder="ناوی کالا (کوردی)"
                dir="rtl"
              />

              <AmberInput
                label={t('prod.add.sku') || 'رمز المنتج (SKU)'}
                value={formData.sku}
                onChange={e => handleChange('sku', e.target.value)}
                error={errors.sku}
                placeholder="SKU-XXXX-XXXX"
                required
              />

              <AmberInput
                label={t('prod.add.barcode') || 'الباركود'}
                value={formData.barcode}
                onChange={e => handleChange('barcode', e.target.value)}
                placeholder=" Barcode"
              />

              <AmberInput
                label={t('inventory.stock_level') || 'مستوى المخزون'}
                type="number"
                value={formData.stockQuantity}
                onChange={e => handleChange('stockQuantity', e.target.value)}
                placeholder="0"
                min="0"
                readOnly
                className="opacity-60 cursor-not-allowed"
              />

              <div className="md:col-span-2">
                <AmberInput
                  label={t('prod.add.description') || 'وصف المنتج'}
                  multiline
                  rows={4}
                  value={formData.description}
                  onChange={e => handleChange('description', e.target.value)}
                  placeholder={t('prod.add.description_placeholder') || 'أدخل وصفاً تفصيلياً للمنتج...'}
                />
              </div>

              <div className="md:col-span-2">
                <AmberInput
                  label={t('prod.add.description_ar') || 'وصف المنتج (عربي)'}
                  multiline
                  rows={3}
                  value={formData.descriptionAr}
                  onChange={e => handleChange('descriptionAr', e.target.value)}
                  placeholder="وصف تفصيلي بالعربي..."
                  dir="rtl"
                />
              </div>

              <div className="md:col-span-2">
                <AmberInput
                  label={t('prod.add.description_ku') || 'وصف المنتج (كردي)'}
                  multiline
                  rows={3}
                  value={formData.descriptionKu}
                  onChange={e => handleChange('descriptionKu', e.target.value)}
                  placeholder="وەسفی کالا (کوردی)..."
                  dir="rtl"
                />
              </div>

              {/* Active Toggle */}
              <div className="md:col-span-2 flex items-center gap-3 pt-2">
                <button
                  type="button"
                  role="switch"
                  aria-checked={formData.isActive}
                  onClick={() => handleChange('isActive', !formData.isActive)}
                  className={cn(
                    'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                    formData.isActive ? 'bg-[var(--color-brand)]' : 'bg-[var(--color-border)]'
                  )}
                >
                  <span
                    className={cn(
                      'inline-block h-4 w-4 rounded-full bg-white transition-transform',
                      formData.isActive ? 'translate-x-6' : 'translate-x-1'
                    )}
                  />
                </button>
                <span className="text-sm font-bold text-zinc-text">
                  {formData.isActive ? (t('common.active') || 'نشط') : (t('common.inactive') || 'غير نشط')}
                </span>
              </div>
            </div>
          </Card>

          {/* Pricing Card */}
          <Card className="p-8 bg-[var(--color-obsidian-card)] border border-[var(--color-border)] rounded-2xl shadow-sm overflow-visible">
            <div className="flex items-center gap-3 mb-8 border-b border-[var(--color-border)] pb-6">
              <TrendingUp className="w-5 h-5 text-[var(--color-success)]" />
              <h3 className="text-sm font-black text-zinc-text uppercase tracking-widest">
                {t('prod.add.auction_settings') || 'التسعير والتقييم'}
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              <AmberInput
                label={t('prod.add.cost_price') || 'سعر التكلفة'}
                type="number"
                value={formData.costPrice}
                onChange={e => handleChange('costPrice', e.target.value)}
                error={errors.costPrice}
                placeholder="0.00"
                required
                min="0"
                step="0.01"
              />

              <AmberInput
                label={t('prod.add.selling_price') || 'سعر البيع'}
                type="number"
                value={formData.sellingPrice}
                onChange={e => handleChange('sellingPrice', e.target.value)}
                error={errors.sellingPrice}
                placeholder="0.00"
                required
                min="0"
                step="0.01"
              />

              <AmberInput
                label={t('prod.add.tax_rate') || 'نسبة الضريبة (%)'}
                type="number"
                value={formData.taxRate}
                onChange={e => handleChange('taxRate', e.target.value)}
                placeholder="0"
                min="0"
                max="100"
                step="0.01"
              />
            </div>
          </Card>
        </div>

        {/* Sidebar / Images */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="p-8 bg-[var(--color-obsidian-card)] border border-[var(--color-border)] relative overflow-hidden rounded-2xl shadow-sm">
            <h3 className="text-sm font-black text-zinc-text uppercase tracking-widest mb-6 border-b border-[var(--color-border)] pb-4">
              {t('prod.add.images') || 'صور المنتج'}
            </h3>

            <AmberImageUpload
              value={imageUpload.previewUrls}
              onChange={imageUpload.appendFiles}
              onRemove={handleRemoveExisting}
              onReorder={imageUpload.reorder}
              multiple={true}
              sortable={true}
              maxFiles={5}
              maxSize={10 * 1024 * 1024}
            />
          </Card>

          {/* Note Card */}
          <Card className="p-6 border-[var(--color-brand)]/20 bg-[var(--color-brand)]/[0.03] rounded-2xl">
            <div className="flex items-start gap-4">
              <AlertCircle className="w-5 h-5 text-[var(--color-brand)] shrink-0 mt-0.5" />
              <div className="space-y-1.5">
                <h4 className="text-sm font-black text-[var(--color-brand)] uppercase tracking-widest">
                  {t('prod.add.note_title') || 'ملاحظة مهمة'}
                </h4>
                <p className="text-[13px] font-medium text-zinc-muted leading-relaxed">
                  {t('prod.add.note_desc') || 'تأكد من دقة جميع الأرقام التسلسلية والتقييمات. بعض الحقول تتطلب موافقة إدارية للتعديل.'}
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
