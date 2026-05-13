import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { 
  Users, 
  Clock, 
  Image as ImageIcon, 
  Save, 
  X, 
  ChevronLeft,
  AlertCircle,
  TrendingDown,
  Info,
  Package,
  Calendar,
  Zap,
  Target,
  Calculator
} from 'lucide-react';
import { useLanguage } from '@core/contexts/LanguageContext';
import { cn } from '@core/lib/utils/cn';
import { AmberCard as Card } from '@core/components/AmberCard';
import { AmberButton } from '@core/components/AmberButton';
import { AmberInput } from '@core/components/AmberInput';
import { AmberDatePicker } from '@core/components/AmberDatePicker';
import { AmberDropdown } from '@core/components/AmberDropdown';
import { AmberImageUpload } from '@core/components/AmberImageUpload';
import { useFileUpload } from '@core/hooks/useFileUpload';
import { FormSection } from '@core/components/FormSection';
import { IqdSymbol } from '@core/components/IqdSymbol';
import { useFormUX } from '@core/hooks/useFormUX';
import { useMapApiValidationError } from '@core/hooks/useMapApiValidationError';
import { 
  useGetGroupBuying, 
  useCreateGroupBuying, 
  useUpdateGroupBuying 
} from '../api';

import { useList as useInventoryList } from '../../../services/inventory/hooks';
import { useList as useCategories } from '../../../services/categories/hooks';
import { getLocalizedName } from '../../../services/categories/types';
import type { GroupBuyingCreateInput, GroupBuyingUpdateInput } from '../types';

const HISTORY_KEY = 'history_group_buying';

function readGroupBuyingHistory(): Record<string, any> | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export const GroupBuyingFormPage: React.FC = () => {
  const { t, dir, language } = useLanguage();
  const mapApiError = useMapApiValidationError();
  const router = useRouter();
  const { id } = router.query;
  const isEdit = !!id;
  const isRTL = dir === 'rtl';
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const campaignId = id as string;
  const { data: existingCampaign, isLoading: campaignLoading } = useGetGroupBuying(campaignId || '', isEdit);
  const { data: inventoryData } = useInventoryList();
  const { data: categoriesData } = useCategories({ limit: 100 });
  const inventoryItems = (inventoryData as any)?.items || [];
  const categoryOptions = (categoriesData as any)?.categories?.map((c: any) => ({
    label: getLocalizedName(c, language) || c.name || c.slug,
    value: String(c.id)
  })) || [];

  const createMutation = useCreateGroupBuying();
  const updateMutation = useUpdateGroupBuying();

  const [formData, setFormData] = useState(() => {
    const h = readGroupBuyingHistory();
    return {
      title: '',
      description: '',
      categoryId: h?.categoryId ?? '',
      productId: '',
      originalPrice: 0,
      dealPrice: 0,
      minParticipants: h?.minParticipants ?? 2,
      maxParticipants: h?.maxParticipants ?? 100,
      startTime: '',
      endTime: '',
      autoCreateOrder: true,
    };
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const { upload: uploadFile, isUploading, progress: uploadProgress, error: uploadError } = useFileUpload();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const isSubmitting = createMutation.isPending || updateMutation.isPending || isUploading;

  // useFormUX: unsaved-changes warning + dirty tracking
  const { isDirty, markClean } = useFormUX({
    values: formData,
    initialValues: isEdit && existingCampaign ? {
      title: existingCampaign.title || '',
      description: existingCampaign.description || '',
      categoryId: existingCampaign.categoryId?.toString() || '',
      productId: existingCampaign.productId?.toString() || '',
      originalPrice: existingCampaign.originalPrice || 0,
      dealPrice: existingCampaign.dealPrice || 0,
      minParticipants: existingCampaign.minParticipants || 2,
      maxParticipants: existingCampaign.maxParticipants || 100,
      startTime: existingCampaign.startTime ? new Date(existingCampaign.startTime).toISOString().slice(0, 16) : '',
      endTime: existingCampaign.endTime ? new Date(existingCampaign.endTime).toISOString().slice(0, 16) : '',
      autoCreateOrder: existingCampaign.autoCreateOrder ?? true,
    } : {
      title: '',
      description: '',
      categoryId: '',
      productId: '',
      originalPrice: 0,
      dealPrice: 0,
      minParticipants: 2,
      maxParticipants: 100,
      startTime: '',
      endTime: '',
      autoCreateOrder: true,
    },
    isSubmitting,
    storageKey: isEdit ? `draft-group-buying-${id}` : 'draft-group-buying-new',
    historyKey: HISTORY_KEY,
    historyFields: ['categoryId', 'minParticipants', 'maxParticipants'],
  });

  // Sync when editing
  useEffect(() => {
    if (isEdit && existingCampaign) {
      setFormData({
        title: existingCampaign.title || '',
        description: existingCampaign.description || '',
        categoryId: existingCampaign.categoryId?.toString() || '',
        productId: existingCampaign.productId?.toString() || '',
        originalPrice: existingCampaign.originalPrice || 0,
        dealPrice: existingCampaign.dealPrice || 0,
        minParticipants: existingCampaign.minParticipants || 2,
        maxParticipants: existingCampaign.maxParticipants || 100,
        startTime: existingCampaign.startTime ? new Date(existingCampaign.startTime).toISOString().slice(0, 16) : '',
        endTime: existingCampaign.endTime ? new Date(existingCampaign.endTime).toISOString().slice(0, 16) : '',
        autoCreateOrder: existingCampaign.autoCreateOrder ?? true,
      });
    }
  }, [isEdit, existingCampaign]);

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }

    // Auto-fill from inventory
    if (field === 'productId' && value) {
        const item = inventoryItems.find((i: any) => String(i.id) === value);
        if (item) {
            setFormData(prev => ({
                ...prev,
                title: item.name,
                description: item.description || '',
                originalPrice: item.price || 0,
                dealPrice: Math.round((item.price || 0) * 0.8), // Default 20% discount
            }));
        }
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.title?.trim()) newErrors.title = t('groupBuying.validation.protocol_identifier_req');
    if (!formData.productId) newErrors.productId = t('groupBuying.validation.asset_node_req');
    if (!formData.startTime) newErrors.startTime = t('groupBuying.validation.deployment_window_req');
    if (!formData.endTime) newErrors.endTime = t('groupBuying.validation.termination_window_req');
    if (formData.dealPrice >= formData.originalPrice) newErrors.dealPrice = t('groupBuying.validation.consolidated_price_below_base');
    
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
        if (!uploadedAttachmentId) {
          return;
        }
      }
      // Remove productId from payload - it's only used for auto-fill, not accepted by backend DTO
      const { productId, ...formPayload } = formData;
      const input = {
          ...formPayload,
          categoryId: formPayload.categoryId ? Number(formPayload.categoryId) : undefined,
          originalPrice: Number(formPayload.originalPrice),
          dealPrice: Number(formPayload.dealPrice),
          minParticipants: Number(formPayload.minParticipants),
          maxParticipants: Number(formPayload.maxParticipants),
          startTime: new Date(formPayload.startTime).toISOString(),
          endTime: new Date(formPayload.endTime).toISOString(),
      } as any;
      if (uploadedAttachmentId) {
        input.mainAttachmentId = uploadedAttachmentId;
        input.attachmentIds = [uploadedAttachmentId];
      }

      if (isEdit) {
        await updateMutation.mutateAsync({ id: campaignId, ...input });
      } else {
        await createMutation.mutateAsync(input);
      }
      markClean();
      router.push('/group-buying');
    } catch (err: any) {
      const mapped = mapApiError(err);
      const errorMessage =
        mapped ||
        err?.message ||
        err?.details?.[0] ||
        t('error.save_failed') ||
        'Submission failed. Please try again.';
      setSubmitError(typeof errorMessage === 'string' ? errorMessage : String(errorMessage));
    }
  };

  if (!isClient) return null;

  if (isEdit && (campaignLoading || !router.isReady)) {
      return (
          <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
              <div className="w-16 h-16 border-4 border-brand border-t-transparent rounded-full animate-spin" />
              <p className="text-zinc-muted font-black uppercase tracking-[0.3em] animate-pulse">{t('groupBuying.form.syncing_node')}</p>
          </div>
      );
  }

  const discount = formData.originalPrice > 0 
      ? Math.round((1 - formData.dealPrice / formData.originalPrice) * 100) 
      : 0;

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8 animate-in fade-in duration-700" dir={dir}>
      {/* Submission Error Banner */}
      {submitError && (
        <div className="bg-danger/10 border border-danger/20 p-4 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
          <AlertCircle className="w-5 h-5 text-danger shrink-0" />
          <p className="text-sm text-danger font-medium whitespace-pre-line">{submitError}</p>
          <button onClick={() => setSubmitError(null)} className="ms-auto text-danger/60 hover:text-danger">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
      {/* Strategic Header Cluster */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <AmberButton variant="secondary" className="p-0 w-12 h-12 rounded-xl flex items-center justify-center active:scale-95 transition-all bg-obsidian-card border-border shadow-lg" onClick={() => router.push('/group-buying')}>
                <ChevronLeft className={cn("w-5 h-5", isRTL && "rotate-180")} />
          </AmberButton>
          <div>
            <h1 className="text-3xl font-black text-zinc-text tracking-tighter uppercase leading-none">
              {isEdit ? t('groupBuying.form.authorize_mod') : t('groupBuying.form.init_consolidation')}
            </h1>
            <p className="text-sm text-zinc-muted font-bold tracking-tight uppercase mt-1">
              {isEdit ? `${t('groupBuying.form.node_protocol_id')}: ${id}` : t('groupBuying.form.init_desc')}
            </p>
          </div>
        </div>
        <div className="flex gap-3">
           <AmberButton 
                variant="outline" 
                className="h-12 border-border font-bold rounded-xl px-6 hover:bg-obsidian-hover active:scale-95 transition-all uppercase text-xs tracking-widest"
                onClick={() => router.push('/group-buying')}
           >
                {t('common.cancel')}
           </AmberButton>
           <AmberButton 
                className="h-12 bg-brand hover:bg-brand text-black font-black rounded-xl px-10 shadow-[0_10px_40px_rgba(245,196,81,0.1)] border-none active:scale-95 transition-all gap-3"
                onClick={handleSubmit}
                disabled={createMutation.isPending || updateMutation.isPending || isUploading}
           >
                {(createMutation.isPending || updateMutation.isPending || isUploading) ? (
                    <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                ) : (
                    <Save className="w-5 h-5" />
                )}
                <span className="uppercase tracking-widest">{t('groupBuying.form.execute_sync')}</span>
           </AmberButton>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Coverage Logic Stack */}
        <div className="lg:col-span-2 space-y-8">
            <Card className="!p-8 bg-obsidian-card border-border shadow-2xl relative overflow-hidden group">
                {/* Visual Identity Marker */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-brand/5 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2 group-focus-within:bg-brand/10 transition-all duration-1000" />
                
                <div className="flex items-center gap-3 border-b border-white/[0.03] pb-6 relative">
                   <div className="w-11 h-11 rounded-xl bg-brand/10 flex items-center justify-center text-brand border border-brand/20 shadow-inner">
                      <Target className="w-5 h-5" />
                   </div>
                   <h3 className="text-sm font-black text-zinc-text uppercase tracking-[0.25em]">{t('groupBuying.form.id_node_title')}</h3>
                </div>

                <div className="space-y-7 relative pt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-3">
                             <label className={`text-[10px] font-black text-zinc-muted uppercase tracking-[0.2em] px-1 text-start block`}>{t('groupBuying.form.asset_scan_label')}</label>
                             <AmberDropdown 
                                options={[
                                    { label: t('groupBuying.form.manual_asset_protocol'), value: '' },
                                    ...inventoryItems.map((item: any) => ({
                                        label: item.name,
                                        value: String(item.id)
                                    }))
                                ]}
                                value={String(formData.productId || '')}
                                onChange={(val) => handleChange('productId', val)}
                             />
                             {errors.productId && <p className={`text-[10px] text-danger font-black uppercase px-1 text-start`}>{errors.productId}</p>}
                        </div>
                        <div className="space-y-3">
                            <label className={`text-[10px] font-black text-zinc-muted uppercase tracking-[0.2em] px-1 text-start block`}>{t('groupBuying.form.tactical_division')}</label>
                            <AmberDropdown 
                                options={[
                                    { label: t('groupBuying.form.manual_select') || 'Select Category...', value: '' },
                                    ...categoryOptions
                                ]}
                                value={formData.categoryId || ''}
                                onChange={(val) => handleChange('categoryId', val)}
                            />
                        </div>
                    </div>

                    <AmberInput 
                        label={t('groupBuying.form.protocol_nomenclature')}
                        placeholder={t('groupBuying.form.define_identify')}
                        value={formData.title}
                        onChange={(e) => handleChange('title', e.target.value)}
                        error={errors.title}
                        className="h-12"
                        dir={dir}
                    />

                    <AmberInput 
                        label={t('groupBuying.form.strat_narrative')}
                        placeholder={t('groupBuying.form.elaborate_narrative')}
                        value={formData.description}
                        onChange={(e) => handleChange('description', e.target.value)}
                        multiline
                        rows={6}
                        dir={dir}
                    />
                </div>
            </Card>

            {/* Threshold & Participation Metrics */}
            <Card className="!p-8 bg-obsidian-card border-border shadow-2xl space-y-8">
                <div className="flex items-center gap-3 border-b border-white/[0.03] pb-6">
                    <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20 shadow-inner">
                      <Users className="w-5 h-5" />
                   </div>
                   <h3 className="text-sm font-black text-zinc-text uppercase tracking-[0.25em]">{t('groupBuying.form.threshold_reach_title')}</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <AmberInput 
                        label={t('groupBuying.form.min_activation_reach')}
                        type="number"
                        value={formData.minParticipants}
                        onChange={(e) => handleChange('minParticipants', Number(e.target.value))}
                        icon={<Zap className="w-4 h-4" />}
                        className="h-12 tabular-nums"
                        dir={dir}
                    />
                    <AmberInput 
                        label={t('groupBuying.form.max_node_capacity')}
                        type="number"
                        value={formData.maxParticipants}
                        onChange={(e) => handleChange('maxParticipants', Number(e.target.value))}
                        icon={<Users className="w-4 h-4" />}
                        className="h-12 tabular-nums"
                        dir={dir}
                    />
                </div>

                <div className="p-6 rounded-2xl bg-primary/[0.02] border border-primary/10 flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0 shadow-inner">
                         <Info className="w-5 h-5 text-primary" />
                    </div>
                    <div className="space-y-1">
                        <p className="text-xs font-black text-primary uppercase tracking-widest">{t('groupBuying.form.reach_insight_title')}</p>
                        <p className="text-[11px] text-zinc-muted font-bold tracking-tight uppercase">{t('groupBuying.form.reach_insight_desc')}</p>
                    </div>
                </div>

                <div className="h-px bg-white/[0.03]" />

                <div className="flex items-center gap-4 p-4 rounded-xl bg-obsidian-outer border border-white/5 group/toggle cursor-pointer" onClick={() => handleChange('autoCreateOrder', !formData.autoCreateOrder)}>
                    <div className={cn(
                        "w-12 h-6 rounded-full p-1 transition-all duration-300 relative",
                        formData.autoCreateOrder ? "bg-brand" : "bg-zinc-800"
                    )}>
                        <div className={cn(
                            "w-4 h-4 rounded-full bg-white shadow-sm transition-all duration-300",
                            formData.autoCreateOrder ? (isRTL ? "-translate-x-6" : "translate-x-6") : "translate-x-0"
                        )} />
                    </div>
                    <div className="space-y-0.5">
                        <p className="text-xs font-black text-zinc-text uppercase tracking-widest">{t('groupBuying.form.auto_create_order') || 'Auto-Create Orders'}</p>
                        <p className="text-[10px] text-zinc-muted font-bold tracking-tight">{t('groupBuying.form.auto_create_order_desc') || 'Automatically generate orders when campaign succeeds'}</p>
                    </div>
                </div>
            </Card>
        </div>

        {/* Temporal & Fiscal Logistics */}
        <div className="space-y-8">
            <Card className="!p-8 bg-obsidian-card border-border shadow-2xl space-y-6">
                <div className="flex items-center gap-3 border-b border-white/[0.03] pb-6">
                   <div className="w-11 h-11 rounded-xl bg-info/10 flex items-center justify-center text-info border border-info/20 shadow-inner">
                      <ImageIcon className="w-5 h-5" />
                   </div>
                   <h3 className="text-sm font-black text-zinc-text uppercase tracking-[0.25em]">{t('groupBuying.form.campaign_imagery')}</h3>
                </div>
                <AmberImageUpload
                  value=""
                  onChange={(files) => {
                    if (files?.[0]) {
                      setSelectedImageFile(files[0]);
                    }
                  }}
                  isUploading={isUploading}
                  uploadProgress={uploadProgress}
                  uploadError={uploadError}
                  disabled={createMutation.isPending || updateMutation.isPending}
                />
            </Card>

            {/* Value Logic Matrix */}
            <Card className="!p-8 bg-obsidian-card border-border shadow-2xl space-y-7 h-fit">
                <div className="flex items-center gap-3 border-b border-white/[0.03] pb-6">
                   <div className="w-11 h-11 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/20 shadow-inner">
                      <Calculator className="w-5 h-5" />
                   </div>
                   <h3 className="text-sm font-black text-zinc-text uppercase tracking-[0.25em]">{t('groupBuying.form.fiscal_opt')}</h3>
                </div>
                
                <div className="space-y-6">
                    <AmberInput 
                        label={t('groupBuying.form.asset_base_premium')}
                        type="number"
                        value={formData.originalPrice}
                        onChange={(e) => handleChange('originalPrice', Number(e.target.value))}
                        icon={<IqdSymbol />}
                        className="h-12 tabular-nums"
                        dir={dir}
                    />
                    <AmberInput 
                        label={t('groupBuying.form.consolidated_deal_price')}
                        type="number"
                        value={formData.dealPrice}
                        onChange={(e) => handleChange('dealPrice', Number(e.target.value))}
                        icon={<TrendingDown className="w-4 h-4" />}
                        error={errors.dealPrice}
                        className="h-12 tabular-nums"
                        dir={dir}
                    />

                    <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between shadow-inner">
                         <p className="text-[11px] font-black text-emerald-400 uppercase">{t('groupBuying.form.applied_discount')}</p>
                         <span className="text-3xl font-black text-emerald-400 tabular-nums tracking-tighter leading-none">{discount}%</span>
                    </div>
                </div>
            </Card>

            {/* Deployment Spectrum Control */}
            <Card className="!p-8 bg-obsidian-card border-border shadow-2xl space-y-7 h-fit">
                <div className="flex items-center gap-3 border-b border-white/[0.03] pb-6">
                   <div className="w-11 h-11 rounded-xl bg-warning/10 flex items-center justify-center text-warning border border-warning/20 shadow-inner">
                      <Clock className="w-5 h-5" />
                   </div>
                   <h3 className="text-sm font-black text-zinc-text uppercase tracking-[0.25em]">{t('groupBuying.form.temporal_spectrum')}</h3>
                </div>
                <div className="space-y-6">
                    <AmberDatePicker
                        label={t('groupBuying.form.node_init_start')}
                        value={formData.startTime}
                        onChange={(val) => handleChange('startTime', val)}
                        icon={<Calendar className="w-4 h-4" />}
                        error={errors.startTime}
                    />
                    <AmberDatePicker
                        label={t('groupBuying.form.protocol_termination_window')}
                        value={formData.endTime}
                        onChange={(val) => handleChange('endTime', val)}
                        icon={<Clock className="w-4 h-4" />}
                        error={errors.endTime}
                    />
                </div>
                {/* Dynamic Duration Logic Mask */}
                <div className="p-6 rounded-2xl bg-obsidian-panel/60 border border-white/5 space-y-4 shadow-inner">
                     <div className="flex items-center justify-between text-[11px] font-black uppercase tracking-widest">
                         <span className="text-zinc-muted">{t('groupBuying.form.cycle_duration')}</span>
                         <span className="text-brand tabular-nums shadow-sm">{t('groupBuying.form.calculating')}</span>
                     </div>
                     <div className="h-1.5 bg-white/[0.05] rounded-full overflow-hidden shadow-inner">
                         <div className="h-full bg-brand w-[45%] shadow-[0_0_10px_rgba(245,196,81,0.5)]" />
                     </div>
                </div>
            </Card>

            {/* Strategy Control Node */}
            <div className="space-y-4">
                <AmberButton 
                    className="w-full h-16 bg-brand hover:bg-brand text-black font-black uppercase tracking-[0.3em] rounded-[2rem] shadow-[0_15px_50px_rgba(245,196,81,0.15)] active:scale-95 transition-all text-sm group"
                    onClick={handleSubmit}
                    disabled={createMutation.isPending || updateMutation.isPending || isUploading}
                >
                    <span className="group-hover:tracking-[0.4em] transition-all duration-500">{t('groupBuying.form.commence_execution')}</span>
                </AmberButton>
                
                <AmberButton 
                    variant="secondary" 
                    className="w-full h-14 bg-obsidian-card font-black uppercase tracking-widest rounded-2xl border border-white/5 active:scale-95 transition-all opacity-80 hover:opacity-100"
                    onClick={() => router.push('/group-buying')}
                >
                    {t('common.cancel')}
                </AmberButton>
            </div>
        </div>
      </form>
    </div>
  );
};

export default GroupBuyingFormPage;
