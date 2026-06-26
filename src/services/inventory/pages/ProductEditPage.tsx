import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import { AmberCard as Card } from '@core/components/AmberCard';
import { AmberButton } from '@core/components/AmberButton';
import { AmberInput } from '@core/components/AmberInput';
import { AmberToggle } from '@core/components';
import { AmberFormSkeleton } from '@core/components/Loading/AmberFormSkeleton';
import { cn } from '@core/lib/utils/cn';
import { useLanguage } from '@core/contexts/LanguageContext';
import {
  Package,
  Save,
  X,
  ArrowLeft,
  Loader2,
  AlertCircle,
} from 'lucide-react';

import { useRouteParam } from '@core/hooks/useRouteParam';
import { useById, useUpdate } from '../hooks';

interface WarehouseItemForm {
  sku: string;
  barcode: string;
  costPrice: string;
  sellingPrice: string;
  unit: string;
  lowStockThreshold: string;
  isActive: boolean;
  notes: string;
}

const INITIAL_FORM: WarehouseItemForm = {
  sku: '',
  barcode: '',
  costPrice: '',
  sellingPrice: '',
  unit: 'piece',
  lowStockThreshold: '5',
  isActive: true,
  notes: '',
};

export const ProductEditPage = () => {
  const { t, dir } = useLanguage();
  const router = useRouter();
  const isRTL = dir === 'rtl';

  const id = useRouteParam('id', { parse: 'string' });

  const [formData, setFormData] = useState<WarehouseItemForm>(INITIAL_FORM);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isClient, setIsClient] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const { data: productData, isLoading: productLoading } = useById(id!, {
    enabled: !!id,
  });
  const product = productData as any;

  const updateMutation = useUpdate();

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!product) return;

    setFormData({
      sku: product.sku || '',
      barcode: product.barcode || '',
      costPrice: product.costPrice != null ? String(product.costPrice) : '',
      sellingPrice:
        product.sellingPrice != null ? String(product.sellingPrice) : '',
      unit: product.unit || 'piece',
      lowStockThreshold:
        product.lowStockThreshold != null
          ? String(product.lowStockThreshold)
          : '5',
      isActive: product.isActive ?? true,
      notes: product.notes || '',
    });
  }, [product]);

  const handleChange = useCallback(
    (field: keyof WarehouseItemForm, value: any) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
      if (errors[field]) {
        setErrors((prev) => {
          const next = { ...prev };
          delete next[field];
          return next;
        });
      }
    },
    [errors],
  );

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!formData.sku) e.sku = t('error.required_fields') || 'Required';
    if (!formData.costPrice)
      e.costPrice = t('error.required_fields') || 'Required';
    if (!formData.sellingPrice)
      e.sellingPrice = t('error.required_fields') || 'Required';

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    if (!id) return;

    setSubmitError(null);

    try {
      const payload: Record<string, any> = {
        id,
        sku: formData.sku,
        costPrice: Number(formData.costPrice),
        sellingPrice: Number(formData.sellingPrice),
        unit: formData.unit,
        lowStockThreshold: Number(formData.lowStockThreshold) || 5,
        isActive: formData.isActive,
      };

      if (formData.barcode) payload.barcode = formData.barcode;
      if (formData.notes) payload.notes = formData.notes;

      await updateMutation.mutateAsync(payload);
      router.push('/inventory');
    } catch (err: any) {
      setSubmitError(err?.message || 'Failed to update item');
    }
  };

  if (!isClient) return null;

  if (productLoading || !id) {
    return <AmberFormSkeleton fields={8} header actions layout="grid" />;
  }

  const listingTitle = product?.listing?.title || product?.sku || '';

  return (
    <div
      className="space-y-8 p-6 max-w-[1600px] mx-auto animate-in fade-in duration-700"
      dir={dir}
    >
      {submitError && (
        <div className="bg-danger/10 border border-danger/20 p-4 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
          <AlertCircle className="w-5 h-5 text-danger shrink-0" />
          <p className="text-sm text-danger font-medium">{submitError}</p>
          <button
            onClick={() => setSubmitError(null)}
            className="ms-auto text-danger/60 hover:text-danger"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 text-start">
        <div className="flex items-center gap-4">
          <AmberButton
            variant="ghost"
            onClick={() => router.back()}
            className="group p-2.5 h-11 w-11 border-[var(--color-border)] rounded-xl hover:bg-[var(--color-obsidian-hover)]"
          >
            <ArrowLeft
              className={cn(
                'w-5 h-5 transition-transform group-hover:-translate-x-1',
                isRTL && 'rotate-180 group-hover:translate-x-1',
              )}
            />
          </AmberButton>
          <div className="space-y-1">
            <h1 className="text-4xl font-black text-zinc-text tracking-tight leading-none">
              {t('common.edit') || 'Edit Item'}
            </h1>
            <p className="text-base text-zinc-secondary font-bold">
              {listingTitle}
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
                {t('common.saving') || 'Saving...'}
              </span>
            ) : (
              <>
                <Save className={cn('w-4 h-4', 'me-2')} />
                {t('common.save')}
              </>
            )}
          </AmberButton>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-8 bg-[var(--color-obsidian-card)] border border-[var(--color-border)] rounded-2xl shadow-sm overflow-visible">
            <div className="flex items-center gap-3 mb-8 border-b border-[var(--color-border)] pb-6">
              <Package className="w-5 h-5 text-[var(--color-brand)]" />
              <h3 className="text-sm font-black text-zinc-text uppercase tracking-widest">
                {t('prod.add.basic_info') || 'Warehouse Item'}
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              <AmberInput
                label={t('prod.add.sku') || 'SKU'}
                value={formData.sku}
                onChange={(e) => handleChange('sku', e.target.value)}
                error={errors.sku}
                placeholder="SKU-XXXX-XXXX"
                required
              />

              <AmberInput
                label={t('prod.add.barcode') || 'Barcode'}
                value={formData.barcode}
                onChange={(e) => handleChange('barcode', e.target.value)}
                placeholder="Barcode"
              />

              <AmberInput
                label={t('inventory.detail.cost_price') || 'Cost Price'}
                type="number"
                value={formData.costPrice}
                onChange={(e) => handleChange('costPrice', e.target.value)}
                error={errors.costPrice}
                placeholder="0"
                min="0"
                required
              />

              <AmberInput
                label={t('inventory.detail.selling_price') || 'Selling Price'}
                type="number"
                value={formData.sellingPrice}
                onChange={(e) => handleChange('sellingPrice', e.target.value)}
                error={errors.sellingPrice}
                placeholder="0"
                min="0"
                required
              />

              <AmberInput
                label={t('inventory.detail.unit') || 'Unit'}
                value={formData.unit}
                onChange={(e) => handleChange('unit', e.target.value)}
                placeholder="piece"
              />

              <AmberInput
                label={
                  t('inventory.detail.low_stock_threshold') ||
                  'Low Stock Threshold'
                }
                type="number"
                value={formData.lowStockThreshold}
                onChange={(e) =>
                  handleChange('lowStockThreshold', e.target.value)
                }
                placeholder="5"
                min="0"
              />

              <div className="md:col-span-2">
                <AmberInput
                  label={t('inventory.detail.notes') || 'Notes'}
                  multiline
                  rows={3}
                  value={formData.notes}
                  onChange={(e) => handleChange('notes', e.target.value)}
                  placeholder={
                    t('inventory.detail.notes_placeholder') || 'Optional notes'
                  }
                />
              </div>

              <div className="md:col-span-2 flex items-center gap-3 pt-2">
                <AmberToggle
                  enabled={formData.isActive}
                  onChange={(value) => handleChange('isActive', value)}
                  activeColor="bg-[var(--color-brand)]"
                  inactiveColor="bg-[var(--color-border)]"
                  label={
                    formData.isActive
                      ? t('common.active') || 'Active'
                      : t('common.inactive') || 'Inactive'
                  }
                />
              </div>
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="p-6 bg-[var(--color-obsidian-card)] border border-[var(--color-border)] rounded-2xl">
            <h3 className="text-sm font-black text-zinc-text uppercase tracking-widest mb-4">
              {t('inventory.detail.stock_info') || 'Stock Info'}
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-zinc-muted">
                  {t('inventory.detail.quantity') || 'Quantity'}
                </span>
                <span className="text-sm font-bold text-zinc-text">
                  {product?.stockQuantity ?? 0} {product?.unit || ''}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-zinc-muted">
                  {t('inventory.detail.stock_status') || 'Status'}
                </span>
                <span className="text-sm font-bold text-zinc-text">
                  {product?.stockStatus || 'in_stock'}
                </span>
              </div>
              <p className="text-xs text-zinc-muted mt-4">
                {t('inventory.edit.stock_note') ||
                  'Use the Adjust Stock action to change quantity.'}
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ProductEditPage;
