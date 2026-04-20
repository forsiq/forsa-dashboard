import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { 
  Gavel, 
  TrendingUp, 
  DollarSign,
  Clock, 
  ImageIcon, 
  Save, 
  X, 
  ChevronLeft,
  AlertCircle,
  Info,
  Package,
  Calendar,
  History
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
import { useGetAuction, useCreateAuction, useUpdateAuction } from '../api';

import { useList as useInventoryList } from '../../../services/inventory/hooks';
import type { AuctionCreateInput, AuctionUpdateInput } from '../types/auction.types';

/**
 * AuctionFormPage - Universal Creation and Modification Interface
 */
export const AuctionFormPage: React.FC = () => {
  const { t, dir } = useLanguage();
  const router = useRouter();
  const { id } = router.query;
  const isEdit = !!id;
  const isRTL = dir === 'rtl';
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const auctionId = Number(id);
  const { data: existingAuction, isLoading: auctionLoading } = useGetAuction(auctionId);
  const { data: inventoryData } = useInventoryList();
  const inventoryItems = (inventoryData as any)?.items || [];

  const createMutation = useCreateAuction();
  const updateMutation = useUpdateAuction();

  const [formData, setFormData] = useState<Partial<AuctionCreateInput>>({
    title: '',
    description: '',
    startPrice: 0,
    buyNowPrice: undefined,
    reservePrice: undefined,
    startTime: '',
    endTime: '',
    bidIncrement: 10,
    categoryId: 1,
    images: [],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);

  // File upload hook with presigned URL flow
  const { upload: uploadFile, isUploading, progress: uploadProgress, error: uploadError, reset: resetUpload } = useFileUpload();

  // Sync with existing auction if editing
  useEffect(() => {
    if (isEdit && existingAuction) {
      setFormData({
        title: existingAuction.title,
        description: existingAuction.description,
        startPrice: existingAuction.startPrice,
        buyNowPrice: existingAuction.buyNowPrice,
        reservePrice: existingAuction.reservePrice,
        startTime: existingAuction.startTime?.split('Z')[0], // Format for datetime-local
        endTime: existingAuction.endTime?.split('Z')[0],
        bidIncrement: existingAuction.bidIncrement,
        categoryId: existingAuction.categoryId,
        images: existingAuction.images || [],
      });
    }
  }, [isEdit, existingAuction]);

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
    const newErrors: Record<string, string> = {};
    if (!formData.title?.trim()) newErrors.title = t('auction.validation.title_required');
    if (!formData.startTime) newErrors.startTime = t('auction.validation.start_time_required');
    if (!formData.endTime) newErrors.endTime = t('auction.validation.end_time_required');
    if ((formData.startPrice || 0) <= 0) newErrors.startPrice = t('auction.validation.start_price_gt_0');
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
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
      const payload: any = {
        ...formData,
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
        await createMutation.mutateAsync(payload as AuctionCreateInput);
      }
      router.push('/auctions');
    } catch (err: any) {
      const errorMessage = err?.message || err?.details?.[0] || t('auction.validation.submit_failed') || 'Submission failed. Please check your data and try again.';
      setSubmitError(errorMessage);
    }
  };

  if (!isClient) return null;

  if (isEdit && (auctionLoading || !router.isReady)) {
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
          <Link href="/auctions">
             <AmberButton variant="secondary" className="p-0 w-11 h-11 rounded-xl flex items-center justify-center active:scale-95 transition-all bg-obsidian-card border-border">
                <ChevronLeft className={cn("w-5 h-5", isRTL && "rotate-180")} />
             </AmberButton>
          </Link>
          <div>
            <h1 className="text-3xl font-black text-zinc-text tracking-tighter uppercase italic leading-none">
              {isEdit ? t('auction.form.header.edit') : t('auction.form.header.create')}
            </h1>
            <p className="text-sm text-zinc-muted font-bold tracking-tight uppercase mt-1">
              {isEdit ? t('auction.form.subtitle.edit', { id: String(id) }) : t('auction.form.subtitle.create')}
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
                 <span>{isEdit ? t('auction.form.action.sync') : t('auction.form.action.deploy')}</span>
           </AmberButton>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Primary Data Cluster */}
        <div className="lg:col-span-2 space-y-8">
            <Card className="!p-8 bg-obsidian-card border-border shadow-xl space-y-8">
                <div className="flex items-center gap-3 border-b border-white/[0.03] pb-6">
                   <div className="w-10 h-10 rounded-lg bg-brand/10 flex items-center justify-center text-brand border border-brand/20">
                      <Gavel className="w-5 h-5" />
                   </div>
                    <h3 className="text-sm font-black text-zinc-text uppercase tracking-[0.25em] italic">{t('auction.form.section.core')}</h3>
                </div>

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
                                    { label: t('auction.form.general_asset'), value: '1' },
                                    { label: t('auction.form.critical_hardware'), value: '2' },
                                    { label: t('auction.form.strategic_resources'), value: '3' },
                                ]}
                                value={String(formData.categoryId || 1)}
                                onChange={(val) => handleChange('categoryId', Number(val))}
                            />
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
            </Card>

            {/* Premium Multi-tier Pricing */}
            <Card className="!p-8 bg-obsidian-card border-border shadow-xl space-y-8">
                <div className="flex items-center gap-3 border-b border-white/[0.03] pb-6">
                   <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/20">
                      <DollarSign className="w-5 h-5" />
                   </div>
                    <h3 className="text-sm font-black text-zinc-text uppercase tracking-[0.25em] italic">{t('auction.form.section.pricing')}</h3>
                </div>

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
                    />
                    <AmberInput 
                        label={t('auction.form.fields.buy_now')}
                        type="number"
                        value={formData.buyNowPrice || ''}
                        onChange={(e) => handleChange('buyNowPrice', Number(e.target.value))}
                        icon={<DollarSign className="w-4 h-4" />}
                    />
                </div>

                <div className="p-5 rounded-2xl bg-emerald-500/[0.02] border border-emerald-500/10 flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0">
                         <Info className="w-4 h-4 text-emerald-400" />
                    </div>
                    <div className="space-y-1">
                         <p className="text-xs font-black text-emerald-400 uppercase italic">{t('auction.form.pricing_note_title')}</p>
                         <p className="text-[11px] text-zinc-muted font-bold tracking-tight">{t('auction.form.pricing_note_desc')}</p>
                    </div>
                </div>
            </Card>
        </div>

        {/* Temporal & Visual Logistics */}
        <div className="space-y-8">
            {/* Visual Identity Ingestion */}
            <Card className="!p-8 bg-obsidian-card border-border shadow-xl space-y-6">
                <div className="flex items-center gap-3 border-b border-white/[0.03] pb-6">
                   <div className="w-10 h-10 rounded-lg bg-info/10 flex items-center justify-center text-info border border-info/20">
                      <ImageIcon className="w-5 h-5" />
                   </div>
                    <h3 className="text-sm font-black text-zinc-text uppercase tracking-[0.25em] italic">{t('auction.form.section.visualization')}</h3>
                </div>
                <div className="space-y-4">
                    <label className="block text-[10px] font-black text-zinc-muted uppercase tracking-[0.2em] mb-2 px-1 italic">
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
                        multiple={true}
                        disabled={isUploading}
                        isUploading={isUploading}
                        uploadProgress={uploadProgress}
                        uploadError={uploadError}
                    />
                    <p className="text-[9px] text-zinc-muted font-bold text-center uppercase tracking-widest italic">{t('auction.form.imagery_format_note')}</p>
                </div>
            </Card>

            {/* Deployment Window Control */}
            <Card className="!p-8 bg-obsidian-card border-border shadow-xl space-y-6">
                <div className="flex items-center gap-3 border-b border-white/[0.03] pb-6">
                   <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center text-warning border border-warning/20">
                      <Clock className="w-5 h-5" />
                   </div>
                   <h3 className="text-sm font-black text-zinc-text uppercase tracking-[0.25em] italic">{t('auction.form.section.temporal')}</h3>
                </div>
                <div className="space-y-6">
                    <AmberInput 
                        label={t('auction.form.temporal_start')}
                        type="datetime-local"
                        value={formData.startTime}
                        onChange={(e) => handleChange('startTime', e.target.value)}
                        icon={<Calendar className="w-4 h-4" />}
                        error={errors.startTime}
                    />
                    <AmberInput 
                        label={t('auction.form.temporal_end')}
                        type="datetime-local"
                        value={formData.endTime}
                        onChange={(e) => handleChange('endTime', e.target.value)}
                        icon={<Clock className="w-4 h-4" />}
                        error={errors.endTime}
                    />
                </div>
                <div className="p-4 rounded-xl bg-obsidian-panel/40 border border-white/5 space-y-3">
                     <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest">
                         <span className="text-zinc-muted">{t('auction.form.cycle_duration')}</span>
                         <span className="text-warning italic">{t('auction.form.syncing')}</span>
                     </div>
                     <div className="h-1 bg-white/[0.03] rounded-full overflow-hidden">
                         <div className="h-full bg-warning w-[65%]" />
                     </div>
                </div>
            </Card>

            {/* Deployment Control Surface */}
            <div className="space-y-3">
                <AmberButton 
                    className="w-full h-14 bg-brand hover:bg-brand text-black font-black uppercase tracking-[0.2em] italic rounded-2xl shadow-xl active:scale-95 transition-all text-sm gap-3"
                    disabled={updateMutation.isPending || createMutation.isPending || isUploading}
                    onClick={handleSubmit}
                >
                    {(updateMutation.isPending || createMutation.isPending || isUploading) && (
                        <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    )}
                    {isEdit ? t('auction.form.authorize_sync') : t('auction.form.execute_deployment')}
                </AmberButton>
                <AmberButton 
                    variant="secondary" 
                    className="w-full h-12 bg-obsidian-card font-black uppercase tracking-widest italic rounded-xl border border-white/5 active:scale-95 transition-all"
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
