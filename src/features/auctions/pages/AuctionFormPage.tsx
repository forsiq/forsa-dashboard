import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { 
  Gavel, 
  TrendingUp, 
  Clock, 
  ImageIcon,
  Save,
  X,
  ChevronLeft,
  AlertCircle,
  Info,
  Package,
  Calendar,
  History,
  Copy,
  Plus,
  Trash2,
  ExternalLink,
  FileText,
} from 'lucide-react';
import { useLanguage } from '@core/contexts/LanguageContext';
import { cn } from '@core/lib/utils/cn';
import { AmberCard as Card } from '@core/components/AmberCard';
import { AmberButton } from '@core/components/AmberButton';
import { AmberInput } from '@core/components/AmberInput';
import { AmberDatePicker } from '@core/components/AmberDatePicker';
import { AmberDropdown } from '@core/components/AmberDropdown';
import { AmberImageUpload } from '@core/components/AmberImageUpload';
import { AmberFormSkeleton } from '@core/components/Loading/AmberFormSkeleton';
import { FormSection } from '@core/components/FormSection';
import { IqdSymbol } from '@core/components/IqdSymbol';
import { useFileUpload } from '@core/hooks/useFileUpload';
import { useFormUX } from '@core/hooks/useFormUX';
import { useMapApiValidationError } from '@core/hooks/useMapApiValidationError';
import { useGetAuction, useCreateAuction, useUpdateAuction } from '../api';
import { zodIssuesToFieldMap } from '@core/validation/zodIssuesToFieldMap';
import { createAuctionFormPageSchema } from '../validation/auctionFormPageSchema';

import { useList as useInventoryList } from '../../../services/inventory/hooks';
import { useList as useCategories } from '../../../services/categories/hooks';
import { getLocalizedName } from '../../../services/categories/types';
import type { AuctionCreateInput, AuctionUpdateInput, Spec, Source } from '../types/auction.types';

const HISTORY_KEY = 'history_auction';

function readAuctionHistory(): Record<string, any> | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/**
 * Normalize fields that may come as JSON strings from the backend.
 * The backend sometimes returns arrays as serialized JSON strings (e.g. `'["url"]'`).
 */
const normalize = (val: unknown, fallback: unknown[] = []): unknown[] => {
  if (Array.isArray(val)) return val;
  if (typeof val === 'string') {
    try {
      const parsed = JSON.parse(val);
      return Array.isArray(parsed) ? parsed : fallback;
    } catch {
      return fallback;
    }
  }
  return fallback;
};

/**
 * AuctionFormPage - Universal Creation and Modification Interface
 */
export const AuctionFormPage: React.FC = () => {
  const { t, dir, language } = useLanguage();
  const mapApiError = useMapApiValidationError();
  const router = useRouter();
  const { id } = router.query;
  const isClone = router.pathname.includes('/clone/');
  const isEdit = !!id && !isClone;
  const cloneSourceId = isClone ? Number(id) : undefined;
  const isRTL = dir === 'rtl';
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const auctionId = Number(id);
  const { data: existingAuction, isLoading: auctionLoading } = useGetAuction(isClone ? cloneSourceId! : auctionId);
  const { data: inventoryData } = useInventoryList();
  const { data: categoriesData } = useCategories({ limit: 100 });
  const inventoryItems = (inventoryData as any)?.items || [];
  const categoryOptions = (categoriesData as any)?.categories?.map((c: any) => ({
    label: getLocalizedName(c, language) || c.name || c.slug,
    value: String(c.id)
  })) || [];

  const createMutation = useCreateAuction();
  const updateMutation = useUpdateAuction();

  const [durationDays, setDurationDays] = useState<number>(() => {
    const h = readAuctionHistory();
    return h?.durationDays ?? 7;
  });
  const [useDurationMode, setUseDurationMode] = useState<boolean>(true);

  const [formData, setFormData] = useState<Partial<AuctionCreateInput> & { productId?: number; durationDays?: number }>(() => {
    const h = readAuctionHistory();
    const now = new Date();
    now.setHours(now.getHours() + 1, 0, 0, 0);
    const end = new Date();
    end.setDate(end.getDate() + (h?.durationDays ?? 7));
    end.setHours(end.getHours() + 1, 0, 0, 0);
    return {
      title: '',
      description: '',
      startPrice: h?.startPrice ?? 0,
      reservePrice: undefined,
      startTime: now.toISOString().slice(0, 16),
      endTime: end.toISOString().slice(0, 16),
      bidIncrement: h?.bidIncrement ?? 5000,
      categoryId: h?.categoryId ?? 1,
      durationDays: h?.durationDays ?? 7,
      images: [],
      productId: undefined,
      specs: [],
      sources: [],
    };
  });

  const initialFormData: Partial<AuctionCreateInput> & { productId?: number } = {
    title: '',
    description: '',
    startPrice: 0,
    reservePrice: undefined,
    startTime: (() => {
      const now = new Date();
      now.setHours(now.getHours() + 1, 0, 0, 0);
      return now.toISOString().slice(0, 16);
    })(),
    endTime: (() => {
      const end = new Date();
      end.setDate(end.getDate() + 7);
      end.setHours(end.getHours() + 1, 0, 0, 0);
      return end.toISOString().slice(0, 16);
    })(),
    bidIncrement: 5000,
    categoryId: 1,
    images: [],
    productId: undefined,
    specs: [],
    sources: [],
  };

  // Compute endTime from startTime + durationDays
  const computedEndTime = formData.startTime
    ? (() => {
        const start = new Date(formData.startTime);
        start.setDate(start.getDate() + durationDays);
        return start.toISOString().slice(0, 16);
      })()
    : '';

  const { isDirty, markClean } = useFormUX({
    values: formData,
    initialValues: initialFormData,
    isSubmitting: createMutation.isPending || updateMutation.isPending,
    storageKey: isEdit ? `auction-draft-${auctionId}` : 'auction-draft-new',
    historyKey: HISTORY_KEY,
    historyFields: ['categoryId', 'bidIncrement', 'durationDays', 'startPrice'],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);

  // File upload hook with presigned URL flow
  const { upload: uploadFile, isUploading, progress: uploadProgress, error: uploadError, reset: resetUpload } = useFileUpload();

  // Sync with existing auction if editing or cloning
  useEffect(() => {
    if (existingAuction) {
      const titleSuffix = isClone ? ' (Copy)' : '';
      const startTime = isClone ? '' : existingAuction.startTime?.split('Z')[0];
      const endTime = isClone ? '' : existingAuction.endTime?.split('Z')[0];
      let durationDaysFromAuction = 7;
      // Calculate duration in days from existing auction
      if (startTime && endTime) {
        const diffMs = new Date(endTime).getTime() - new Date(startTime).getTime();
        durationDaysFromAuction = Math.max(1, Math.round(diffMs / (1000 * 60 * 60 * 24)));
        setDurationDays(durationDaysFromAuction);
      }
      setFormData({
        title: existingAuction.title + titleSuffix,
        description: existingAuction.description,
        startPrice: existingAuction.startPrice,
        reservePrice: existingAuction.reservePrice,
        startTime,
        endTime,
        bidIncrement: existingAuction.bidIncrement,
        categoryId: existingAuction.categoryId,
        durationDays: durationDaysFromAuction,
        images: normalize(existingAuction.images) as string[],
        specs: normalize(existingAuction.specs) as Spec[],
        sources: normalize(existingAuction.sources) as Source[],
      });
    }
  }, [isEdit, isClone, existingAuction]);

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }

    // Auto-fill from inventory if choosing a product
    if (field === 'productId' && value) {
        const item = inventoryItems.find((i: any) => String(i.id) === value);
        if (item) {
            setFormData(prev => ({
                ...prev,
                title: item.name,
                description: item.description || '',
                startPrice: item.price || 0,
                images: item.image_url ? [item.image_url] : prev.images
            }));
        }
    }
  };

  const validate = () => {
    const finalEndTime = useDurationMode ? computedEndTime : formData.endTime;
    const resRaw = formData.reservePrice;
    const parsed = createAuctionFormPageSchema(t).safeParse({
      title: formData.title ?? '',
      startPrice: Number(formData.startPrice),
      bidIncrement: Number(formData.bidIncrement),
      categoryId: Number(formData.categoryId),
      startTime: formData.startTime ?? '',
      endTime: finalEndTime ?? '',
      reservePrice:
        resRaw !== undefined &&
        resRaw !== null &&
        Number.isFinite(Number(resRaw)) &&
        Number(resRaw) > 0
          ? Number(resRaw)
          : undefined,
    });
    if (!parsed.success) {
      setErrors(zodIssuesToFieldMap(parsed.error));
      return false;
    }
    setErrors({});
    return true;
  };

  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setSubmitError(null);
      let uploadedAttachmentId: number | null = null;
      if (selectedImageFile) {
        uploadedAttachmentId = await uploadFile(selectedImageFile);
        if (!uploadedAttachmentId) {
          setSubmitError(uploadError || t('auction.validation.upload_failed') || 'Image upload failed.');
          return;
        }
      }
      // Remove productId from payload - it's only used for auto-fill, not accepted by backend DTO
      const { productId, durationDays: _durationDays, ...formPayload } = formData;
      const finalEndTime = useDurationMode ? computedEndTime : formData.endTime;
      const payload: any = {
        ...formPayload,
        images: normalize(formPayload.images) as string[],
        specs: normalize(formPayload.specs) as Spec[],
        sources: normalize(formPayload.sources) as Source[],
        endTime: finalEndTime ? new Date(finalEndTime).toISOString() : undefined,
      };
      if (uploadedAttachmentId) {
        payload.mainAttachmentId = uploadedAttachmentId;
        payload.attachmentIds = [uploadedAttachmentId];
      }

      if (isEdit) {
        await updateMutation.mutateAsync({
          ...payload,
          id: auctionId
        } as AuctionUpdateInput);
      } else {
        // Create (also handles clone - always creates new auction)
        await createMutation.mutateAsync(payload as AuctionCreateInput);
      }
      markClean();
      router.push('/auctions');
    } catch (err: any) {
      const mapped = mapApiError(err);
      const errorMessage =
        mapped ||
        err?.message ||
        err?.details?.[0] ||
        t('auction.validation.submit_failed') ||
        'Submission failed. Please check your data and try again.';
      setSubmitError(typeof errorMessage === 'string' ? errorMessage : String(errorMessage));
    }
  };

  if (!isClient) return null;

  if ((isEdit || isClone) && (auctionLoading || !router.isReady)) {
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
          <p className="text-sm text-danger font-medium whitespace-pre-line">{submitError}</p>
          <button onClick={() => setSubmitError(null)} className="ml-auto text-danger/60 hover:text-danger">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
      {/* Dynamic Navigation Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <AmberButton variant="secondary" className="p-0 w-11 h-11 rounded-xl flex items-center justify-center active:scale-95 transition-all bg-obsidian-card border-border" onClick={() => router.push('/auctions')}>
                <ChevronLeft className={cn("w-5 h-5", isRTL && "rotate-180")} />
             </AmberButton>
          <div>
            <h1 className="text-3xl font-black text-zinc-text tracking-tighter uppercase leading-none">
              {isClone ? (t('auction.form.header.clone') || 'Clone Auction') : isEdit ? t('auction.form.header.edit') : t('auction.form.header.create')}
            </h1>
            <p className="text-sm text-zinc-muted font-bold tracking-tight uppercase mt-1">
              {isClone ? (t('auction.form.subtitle.clone') || `Duplicating auction #${id}`).replace('{id}', String(id)) : isEdit ? t('auction.form.subtitle.edit', { id: String(id) }) : t('auction.form.subtitle.create')}
            </p>
          </div>
        </div>
        <div className="flex gap-3">
            <AmberButton 
                 variant="outline" 
                 className="h-11 border-border font-bold rounded-xl px-6 hover:bg-obsidian-hover active:scale-95 transition-all"
                 onClick={() => router.push('/auctions')}
            >
                 {t('auction.form.action.abort')}
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
                 <span>{isClone ? (t('auction.form.action.clone') || 'Clone Auction') : isEdit ? t('auction.form.action.sync') : t('auction.form.action.deploy')}</span>
           </AmberButton>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Primary Data Cluster */}
        <div className="lg:col-span-2 space-y-8">
            <FormSection icon={<Gavel className="w-5 h-5" />} iconBgColor="brand" title={t('auction.form.section.core')}>
                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="w-full">
                            <AmberDropdown 
                                label={t('auction.form.inventory_sync')}
                                options={[
                                    { label: t('auction.form.manual_config'), value: '' },
                                    ...inventoryItems.map((item: any) => ({
                                        label: item.name,
                                        value: String(item.id)
                                    }))
                                ]}
                                value={String(formData.productId || '')}
                                onChange={(val) => handleChange('productId', val ? Number(val) : undefined)}
                            />
                        </div>
                        <div className="w-full">
                            <AmberDropdown 
                                label={t('auction.form.tactical_category')}
                                options={[
                                    { label: t('auction.form.manual_select') || 'Select Category...', value: '' },
                                    ...categoryOptions
                                ]}
                                value={String(formData.categoryId || '')}
                                onChange={(val) => handleChange('categoryId', val ? Number(val) : undefined)}
                            />
                            {errors.categoryId ? (
                              <p className="text-xs text-danger font-medium mt-1.5 px-1">{errors.categoryId}</p>
                            ) : null}
                        </div>
                    </div>

                    <AmberInput 
                        label={t('auction.form.fields.title_label')}
                        placeholder={t('auction.form.fields.title_placeholder')}
                        value={formData.title}
                        onChange={(e) => handleChange('title', e.target.value)}
                        error={errors.title}
                    />

                    <AmberInput 
                        label={t('auction.form.fields.desc_label')}
                        placeholder={t('auction.form.fields.desc_placeholder')}
                        value={formData.description}
                        onChange={(e) => handleChange('description', e.target.value)}
                        multiline
                        rows={6}
                    />
                </div>
            </FormSection>

            {/* Premium Multi-tier Pricing */}
            <FormSection icon={<IqdSymbol className="text-sm" />} iconBgColor="success" title={t('auction.form.section.pricing')}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <AmberInput
                        label={t('auction.form.fields.start_price')}
                        type="number"
                        value={formData.startPrice}
                        onChange={(e) => handleChange('startPrice', Number(e.target.value))}
                        icon={<TrendingUp className="w-4 h-4" />}
                        error={errors.startPrice}
                    />
                    <AmberInput
                        label={t('auction.form.fields.bid_increment')}
                        type="number"
                        value={formData.bidIncrement}
                        onChange={(e) => handleChange('bidIncrement', Number(e.target.value))}
                        icon={<Gavel className="w-4 h-4" />}
                        error={errors.bidIncrement}
                    />
                    <AmberInput
                        label={t('auction.form.fields.reserve_price') || 'Reserve Price'}
                        type="number"
                        value={formData.reservePrice || ''}
                        onChange={(e) => handleChange('reservePrice', Number(e.target.value))}
                        icon={<History className="w-4 h-4" />}
                        error={errors.reservePrice}
                    />
                </div>

                <div className="p-5 rounded-2xl bg-emerald-500/[0.02] border border-emerald-500/10 flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0">
                         <Info className="w-4 h-4 text-emerald-400" />
                    </div>
                    <div className="space-y-1">
                         <p className="text-xs font-black text-emerald-400 uppercase">{t('auction.form.pricing_note_title')}</p>
                         <p className="text-[11px] text-zinc-muted font-bold tracking-tight">{t('auction.form.pricing_note_desc')}</p>
                    </div>
                </div>
            </FormSection>

            {/* Product Specifications */}
            <Card className="!p-8 bg-obsidian-card border-border shadow-xl space-y-8">
                <div className="flex items-center justify-between border-b border-white/[0.03] pb-6">
                   <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-violet-500/10 flex items-center justify-center text-violet-400 border border-violet-500/20">
                         <FileText className="w-5 h-5" />
                      </div>
                      <h3 className="text-sm font-black text-zinc-text uppercase tracking-[0.25em]">{t('auction.form.section.specs') || 'Product Specifications'}</h3>
                   </div>
                   <AmberButton
                      type="button"
                      variant="outline"
                      className="h-9 px-4 text-xs font-bold border-border rounded-lg gap-1.5"
                      onClick={() => {
                        const current = formData.specs || [];
                        handleChange('specs', [...current, { label: '', value: '' }]);
                      }}
                   >
                      <Plus className="w-3.5 h-3.5" />
                      {t('auction.form.add_spec') || 'Add Spec'}
                   </AmberButton>
                </div>
                <div className="space-y-3">
                  {(formData.specs || []).length === 0 && (
                    <p className="text-xs text-zinc-muted text-center py-4 uppercase tracking-widest font-bold">
                      {t('auction.form.no_specs') || 'No specifications added. Click "Add Spec" to add product details.'}
                    </p>
                  )}
                  {(formData.specs || []).map((spec, idx) => (
                    <div key={idx} className="flex items-center gap-3 group">
                      <AmberInput
                        placeholder={t('auction.form.spec_label') || 'Label (e.g. Screen)'}
                        value={spec.label}
                        onChange={(e) => {
                          const updated = [...(formData.specs || [])];
                          updated[idx] = { ...updated[idx], label: e.target.value };
                          handleChange('specs', updated);
                        }}
                        className="flex-1"
                      />
                      <AmberInput
                        placeholder={t('auction.form.spec_value') || 'Value (e.g. 6.7" AMOLED)'}
                        value={spec.value}
                        onChange={(e) => {
                          const updated = [...(formData.specs || [])];
                          updated[idx] = { ...updated[idx], value: e.target.value };
                          handleChange('specs', updated);
                        }}
                        className="flex-1"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const updated = [...(formData.specs || [])];
                          updated.splice(idx, 1);
                          handleChange('specs', updated);
                        }}
                        className="p-2 text-zinc-muted hover:text-danger transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
            </Card>

            {/* External Sources & References */}
            <Card className="!p-8 bg-obsidian-card border-border shadow-xl space-y-8">
                <div className="flex items-center justify-between border-b border-white/[0.03] pb-6">
                   <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-sky-500/10 flex items-center justify-center text-sky-400 border border-sky-500/20">
                         <ExternalLink className="w-5 h-5" />
                      </div>
                      <h3 className="text-sm font-black text-zinc-text uppercase tracking-[0.25em]">{t('auction.form.section.sources') || 'Sources & References'}</h3>
                   </div>
                   <AmberButton
                      type="button"
                      variant="outline"
                      className="h-9 px-4 text-xs font-bold border-border rounded-lg gap-1.5"
                      onClick={() => {
                        const current = formData.sources || [];
                        handleChange('sources', [...current, { label: '', url: '', type: 'generic' as const }]);
                      }}
                   >
                      <Plus className="w-3.5 h-3.5" />
                      {t('auction.form.add_source') || 'Add Source'}
                   </AmberButton>
                </div>
                <div className="space-y-3">
                  {(formData.sources || []).length === 0 && (
                    <p className="text-xs text-zinc-muted text-center py-4 uppercase tracking-widest font-bold">
                      {t('auction.form.no_sources') || 'No sources added. Click "Add Source" to link product references.'}
                    </p>
                  )}
                  {(formData.sources || []).map((source, idx) => (
                    <div key={idx} className="flex items-center gap-3 group">
                      <AmberInput
                        placeholder={t('auction.form.source_label') || 'Label (e.g. YouTube Review)'}
                        value={source.label}
                        onChange={(e) => {
                          const updated = [...(formData.sources || [])];
                          updated[idx] = { ...updated[idx], label: e.target.value };
                          handleChange('sources', updated);
                        }}
                        className="flex-1"
                      />
                      <AmberInput
                        placeholder={t('auction.form.source_url') || 'URL (https://...)'}
                        value={source.url}
                        onChange={(e) => {
                          const updated = [...(formData.sources || [])];
                          updated[idx] = { ...updated[idx], url: e.target.value };
                          handleChange('sources', updated);
                        }}
                        className="flex-[2]"
                      />
                      <select
                        value={source.type}
                        onChange={(e) => {
                          const updated = [...(formData.sources || [])];
                          updated[idx] = { ...updated[idx], type: e.target.value as any };
                          handleChange('sources', updated);
                        }}
                        className="h-11 px-3 rounded-xl bg-obsidian-panel border border-border text-sm text-zinc-text font-bold"
                      >
                        <option value="generic">Link</option>
                        <option value="youtube">YouTube</option>
                        <option value="alibaba">Alibaba</option>
                        <option value="aws">AWS</option>
                      </select>
                      <button
                        type="button"
                        onClick={() => {
                          const updated = [...(formData.sources || [])];
                          updated.splice(idx, 1);
                          handleChange('sources', updated);
                        }}
                        className="p-2 text-zinc-muted hover:text-danger transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
            </Card>
        </div>

        {/* Temporal & Visual Logistics */}
        <div className="space-y-8">
            {/* Visual Identity Ingestion */}
            <FormSection icon={<ImageIcon className="w-5 h-5" />} iconBgColor="info" title={t('auction.form.section.visualization')}>
                <div className="space-y-4">
                    <label className="block text-[10px] font-black text-zinc-muted uppercase tracking-[0.2em] mb-2 px-1">
                        {t('auction.form.imagery_specs')}
                    </label>
                    <AmberImageUpload 
                        value={formData.images || []}
                        onChange={(files) => {
                            if (files?.[0]) {
                                const url = URL.createObjectURL(files[0]);
                                setSelectedImageFile(files[0]);
                                handleChange('images', [...(formData.images || []), url]);
                            }
                        }}
                        onRemove={(index) => {
                          const newImages = [...(formData.images || [])];
                          newImages.splice(index, 1);
                          handleChange('images', newImages);
                          if (index === 0) setSelectedImageFile(null);
                        }}
                        onReorder={(newOrder) => handleChange('images', newOrder)}
                        multiple={true}
                        sortable={true}
                        disabled={isUploading}
                        isUploading={isUploading}
                        uploadProgress={uploadProgress}
                        uploadError={uploadError}
                    />
                    <p className="text-[10px] text-zinc-muted font-bold text-center uppercase tracking-widest">{t('auction.form.imagery_format_note')}</p>
                </div>
            </FormSection>

            {/* Deployment Window Control */}
            <Card className="!p-8 bg-obsidian-card border-border shadow-xl space-y-6">
                <div className="flex items-center justify-between border-b border-white/[0.03] pb-6">
                   <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center text-warning border border-warning/20">
                         <Clock className="w-5 h-5" />
                      </div>
                      <h3 className="text-sm font-black text-zinc-text uppercase tracking-[0.25em]">{t('auction.form.section.temporal')}</h3>
                   </div>
                   {/* Mode toggle in header */}
                   <div className="flex items-center gap-1 bg-white/[0.02] rounded-lg p-0.5 border border-white/5">
                        <button
                            type="button"
                            onClick={() => setUseDurationMode(true)}
                            title={t('auction.form.cycle_duration') || 'Duration'}
                            className={cn(
                                "p-1.5 rounded-md transition-all",
                                useDurationMode
                                    ? "bg-brand/15 text-brand border border-brand/30"
                                    : "text-zinc-muted hover:text-zinc-text"
                            )}
                        >
                            <Clock className="w-3.5 h-3.5" />
                        </button>
                        <button
                            type="button"
                            onClick={() => setUseDurationMode(false)}
                            title={t('auction.form.temporal_end') || 'Manual Date'}
                            className={cn(
                                "p-1.5 rounded-md transition-all",
                                !useDurationMode
                                    ? "bg-brand/15 text-brand border border-brand/30"
                                    : "text-zinc-muted hover:text-zinc-text"
                            )}
                        >
                            <Calendar className="w-3.5 h-3.5" />
                        </button>
                    </div>
                </div>
                <div className="space-y-6">
                    <AmberDatePicker
                        label={t('auction.form.temporal_start')}
                        value={formData.startTime}
                        onChange={(val) => handleChange('startTime', val)}
                        error={errors.startTime}
                        icon={<Calendar className="w-4 h-4" />}
                    />

                    {useDurationMode ? (
                        /* Duration mode: number of days */
                        <>
                            <AmberInput
                                label={t('auction.form.cycle_duration') || 'Duration (Days)'}
                                type="number"
                                value={durationDays}
                                onChange={(e) => {
                                  const val = Math.max(1, Math.min(90, Number(e.target.value) || 1));
                                  setDurationDays(val);
                                  setFormData(prev => ({ ...prev, durationDays: val }));
                                }}
                                icon={<Clock className="w-4 h-4" />}
                                min={1}
                                max={90}
                            />
                            <div className="p-4 rounded-xl bg-obsidian-panel/40 border border-white/5 space-y-3">
                                <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest">
                                    <span className="text-zinc-muted">{t('auction.form.temporal_end')}</span>
                                    <span className="text-success font-mono text-xs">
                                        {computedEndTime
                                            ? new Date(computedEndTime).toLocaleDateString(dir === 'rtl' ? 'ar-IQ' : 'en-US', {
                                                month: 'short', day: 'numeric', year: 'numeric',
                                                hour: '2-digit', minute: '2-digit'
                                            })
                                            : '-'
                                        }
                                    </span>
                                </div>
                                <div className="h-1 bg-white/[0.03] rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-warning rounded-full transition-all duration-500"
                                        style={{ width: `${Math.min((durationDays / 30) * 100, 100)}%` }}
                                    />
                                </div>
                                <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest mt-1">
                                    <span className="text-zinc-muted">{durationDays} {durationDays === 1 ? 'day' : 'days'}</span>
                                    <span className="text-warning">{Math.round((durationDays / 30) * 100)}%</span>
                                </div>
                                {errors.endTime ? (
                                  <p className="text-xs text-danger font-medium pt-2">{errors.endTime}</p>
                                ) : null}
                            </div>
                        </>
                    ) : (
                        /* Manual mode: pick exact end date */
                        <AmberDatePicker
                            label={t('auction.form.temporal_end')}
                            value={formData.endTime}
                            onChange={(val) => handleChange('endTime', val)}
                            error={errors.endTime}
                            icon={<Clock className="w-4 h-4" />}
                        />
                    )}
                </div>
            </Card>

            {/* Deployment Control Surface */}
            <div className="space-y-3">
                <AmberButton 
                    className="w-full h-14 bg-brand hover:bg-brand text-black font-black uppercase tracking-[0.2em] rounded-2xl shadow-xl active:scale-95 transition-all text-sm gap-3"
                    disabled={updateMutation.isPending || createMutation.isPending || isUploading}
                    onClick={handleSubmit}
                >
                    {(updateMutation.isPending || createMutation.isPending || isUploading) && (
                        <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    )}
                    {isClone ? (t('auction.form.action.clone') || 'Clone Auction') : isEdit ? t('auction.form.authorize_sync') : t('auction.form.execute_deployment')}
                </AmberButton>
                <AmberButton 
                    variant="secondary" 
                    className="w-full h-12 bg-obsidian-card font-black uppercase tracking-widest rounded-xl border border-white/5 active:scale-95 transition-all"
                    onClick={() => router.push('/auctions')}
                >
                    {t('auction.form.cancel')}
                </AmberButton>
            </div>
        </div>
      </form>
    </div>
  );
};

export default AuctionFormPage;
