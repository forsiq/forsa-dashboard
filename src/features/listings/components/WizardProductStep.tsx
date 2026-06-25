import { useState } from 'react';
import { Package, ChevronDown, ScanBarcode } from 'lucide-react';
import { cn } from '@core/lib/utils/cn';
import { AmberButton } from '@core/components/AmberButton';
import { AmberInput } from '@core/components/AmberInput';
import { AmberAutocomplete } from '@core/components/AmberAutocomplete';
import { FormSection } from '@core/components/FormSection';
import { FormBuilder } from '@core/components/Form/FormBuilder';
import { CategoryPicker } from '../../../services/categories/components/CategoryPicker';
import type { FormFieldConfig } from '@core/services/types';
import { BarcodeFoundDialog } from './BarcodeFoundDialog';
import { saveBrandToLocalStorage } from '../hooks/useBrands';
import type { ProductListing, ListingSpec, ListingSource } from '../../../types/services/listings.types';

interface WizardProductStepProps {
  t: (key: string) => string;
  isRTL: boolean;
  isMobile: boolean;
  catalog: {
    title: string;
    description: string;
    categoryId: number | undefined;
    brand: string;
    model: string;
    condition: string;
    authenticity: string;
    sku: string;
    barcode: string;
    specs: ListingSpec[];
    sources: ListingSource[];
  };
  setCatalog: React.Dispatch<React.SetStateAction<WizardProductStepProps['catalog']>>;
  fieldErrors: Record<string, string>;
  setFieldErrors: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  essentialFields: FormFieldConfig[];
  advancedFields: FormFieldConfig[];
  basicFields: FormFieldConfig[];
  brands: string[];
  barcodeFoundListing: ProductListing | null;
  shouldRenderBarcodeDialog: boolean;
  closeBarcodeDialog: () => void;
  onViewBarcodeProduct: (id: string | number) => void;
  onBarcodeLookup: (barcode: string) => Promise<void>;
  isBarcodeLookupPending: boolean;
}

export function WizardProductStep({
  t,
  isRTL,
  isMobile,
  catalog,
  setCatalog,
  fieldErrors,
  setFieldErrors,
  essentialFields,
  advancedFields,
  basicFields,
  brands,
  barcodeFoundListing,
  shouldRenderBarcodeDialog,
  closeBarcodeDialog,
  onViewBarcodeProduct,
  onBarcodeLookup,
  isBarcodeLookupPending,
}: WizardProductStepProps) {
  const [showMoreDetails, setShowMoreDetails] = useState(false);

  const catalogFormValues = {
    title: catalog.title,
    categoryId: catalog.categoryId ? String(catalog.categoryId) : '',
    brand: catalog.brand,
    model: catalog.model,
    condition: catalog.condition,
    authenticity: catalog.authenticity,
    sku: catalog.sku,
    barcode: catalog.barcode,
  };

  const handleCatalogChange = (_data: Record<string, unknown>, field: string, value: unknown) => {
    setCatalog((prev) => ({
      ...prev,
      [field]: field === 'categoryId' ? (value ? Number(value) : undefined) : value,
    }));
    setFieldErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const handleBrandChange = (val: string) => {
    setCatalog((prev) => ({ ...prev, brand: val }));
    saveBrandToLocalStorage(val);
    if (fieldErrors.brand) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next.brand;
        return next;
      });
    }
  };

  return (
    <div className="space-y-8">
      <FormSection icon={<Package className="w-5 h-5" />} iconBgColor="brand" title={t('listing.wizard.step.product')}>
        <div className="mb-6 space-y-2">
          <label className="text-[11px] font-black text-zinc-muted uppercase tracking-widest">
            {t('listing.form.category') || 'Category'}
          </label>
          <CategoryPicker
            value={catalog.categoryId}
            onChange={(id) => {
              setCatalog((prev) => ({ ...prev, categoryId: id || undefined }));
              if (fieldErrors.categoryId) {
                setFieldErrors((prev) => {
                  const next = { ...prev };
                  delete next.categoryId;
                  return next;
                });
              }
            }}
          />
          {fieldErrors.categoryId ? (
            <p className="text-[13px] text-danger font-medium px-1">{fieldErrors.categoryId}</p>
          ) : null}
        </div>
        <FormBuilder
          fields={isMobile ? essentialFields : basicFields}
          initialValues={catalogFormValues}
          onSubmit={() => {}}
          showActions={false}
          layout="vertical"
          onChange={handleCatalogChange}
        />
        {!isMobile && (
          <AmberAutocomplete
            label={t('listing.form.brand') || 'Brand'}
            placeholder={t('listing.form.brand_placeholder') || 'Brand name'}
            value={catalog.brand}
            onChange={handleBrandChange}
            suggestions={brands}
            dir={isRTL ? 'rtl' : 'ltr'}
          />
        )}
        <div className="mt-6 space-y-2">
          <label className="text-[11px] font-black text-zinc-muted uppercase tracking-widest">
            {t('listing.form.description')}
          </label>
          <textarea
            className={cn(
              'w-full rounded-xl bg-obsidian-panel border border-border p-4 text-sm text-zinc-text font-medium',
              isMobile ? 'min-h-[120px]' : 'min-h-[160px]',
            )}
            placeholder={t('listing.form.description_placeholder')}
            value={catalog.description}
            onChange={(e) => setCatalog((p) => ({ ...p, description: e.target.value }))}
          />
        </div>

        <div className="mt-6 space-y-2">
          <label className="text-[11px] font-black text-zinc-muted uppercase tracking-widest">
            {t('listing.form.barcode') || 'Barcode'}
          </label>
          <div className="flex gap-2">
            <AmberInput
              placeholder={t('listing.form.barcode_placeholder') || 'Scan or enter barcode...'}
              value={catalog.barcode}
              onChange={(e) => {
                setCatalog((p) => ({ ...p, barcode: e.target.value }));
                if (fieldErrors.barcode) {
                  setFieldErrors((prev) => { const n = { ...prev }; delete n.barcode; return n; });
                }
              }}
              error={fieldErrors.barcode}
            />
            <AmberButton
              variant="outline"
              className="h-11 px-4 shrink-0 rounded-xl border-border"
              disabled={!catalog.barcode.trim() || isBarcodeLookupPending}
              onClick={() => void onBarcodeLookup(catalog.barcode.trim())}
            >
              {isBarcodeLookupPending ? (
                <div className="w-4 h-4 border-2 border-zinc-muted border-t-transparent rounded-full animate-spin" />
              ) : (
                <ScanBarcode className="w-4 h-4" />
              )}
            </AmberButton>
          </div>
          <p className="text-[10px] text-zinc-muted">
            {t('listing.form.barcode_hint') || 'Enter EAN/UPC barcode to check for existing products'}
          </p>
        </div>

        <BarcodeFoundDialog
          listing={barcodeFoundListing}
          shouldRender={shouldRenderBarcodeDialog}
          onClose={closeBarcodeDialog}
          onViewProduct={onViewBarcodeProduct}
          t={t}
        />

        {isMobile && (
          <>
            <button
              type="button"
              onClick={() => setShowMoreDetails((open) => !open)}
              className={cn(
                'mt-6 w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl border border-white/10 bg-white/[0.02] hover:bg-white/5 transition-colors',
                isRTL && 'flex-row-reverse',
              )}
            >
              <span className="text-[11px] font-black text-zinc-muted uppercase tracking-widest">
                {t('listing.wizard.more_details')}
              </span>
              <ChevronDown
                className={cn(
                  'w-4 h-4 text-zinc-muted transition-transform',
                  showMoreDetails && 'rotate-180',
                )}
              />
            </button>

            {showMoreDetails && (
              <div className="mt-4 pt-4 border-t border-white/5">
                <AmberAutocomplete
                  label={t('listing.form.brand') || 'Brand'}
                  placeholder={t('listing.form.brand_placeholder') || 'Brand name'}
                  value={catalog.brand}
                  onChange={handleBrandChange}
                  suggestions={brands}
                  dir={isRTL ? 'rtl' : 'ltr'}
                />
                <FormBuilder
                  fields={advancedFields}
                  initialValues={catalogFormValues}
                  onSubmit={() => {}}
                  showActions={false}
                  layout="vertical"
                  onChange={handleCatalogChange}
                />
              </div>
            )}
          </>
        )}
      </FormSection>
    </div>
  );
}
