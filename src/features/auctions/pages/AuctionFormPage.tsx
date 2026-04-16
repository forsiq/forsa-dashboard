import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
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
import { useGetAuction, useCreateAuction, useUpdateAuction } from '../api';
import { uploadAttachmentAndGetId } from '../utils/auction-utils';

import { useList as useInventoryList } from '../../../services/inventory/hooks';
import type { AuctionCreateInput, AuctionUpdateInput } from '../types/auction.types';

/**
 * AuctionFormPage - Universal Creation and Modification Interface
 */
export const AuctionFormPage: React.FC = () => {
  const { t, dir } = useLanguage();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;
  const isRTL = dir === 'rtl';

  const { data: existingAuction, isLoading: auctionLoading } = useGetAuction(Number(id));
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      let uploadedAttachmentId: number | null = null;
      if (selectedImageFile) {
        uploadedAttachmentId = await uploadAttachmentAndGetId(selectedImageFile);
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
          id: Number(id)
        } as AuctionUpdateInput);
      } else {
        await createMutation.mutateAsync(payload as AuctionCreateInput);
      }
      navigate('/auctions');
    } catch (err) {
      console.error('Submission defect detected:', err);
    }
  };

  if (isEdit && auctionLoading) {
      return (
          <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
              <div className="w-12 h-12 border-4 border-brand border-t-transparent rounded-full animate-spin" />
              <p className="text-zinc-muted font-black uppercase tracking-widest italic animate-pulse">{t('auction.detail.scanning_core')}</p>
          </div>
      );
  }

  if (isEdit && !existingAuction && !auctionLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] space-y-8 animate-in fade-in zoom-in duration-500">
        <div className="relative">
          <div className="absolute inset-0 bg-brand/20 blur-3xl rounded-full scale-150 animate-pulse" />
          <AlertCircle className="w-24 h-24 text-brand relative z-10" />
        </div>
        <div className="text-center space-y-3 relative z-10">
          <h2 className="text-4xl font-black text-zinc-text">{t('auction.detail.node_desynchronization')}</h2>
          <p className="text-zinc-muted font-bold tracking-tight text-lg max-w-md mx-auto line-relaxed">
            {t('auction.detail.node_not_found')}
          </p>
        </div>
        <AmberButton onClick={() => navigate('/auctions')} variant="secondary" className="px-10 h-14 uppercase font-black tracking-widest bg-obsidian-card border-border hover:bg-obsidian-hover active:scale-95 transition-all">
          {t('auction.detail.return_infrastructure')}
        </AmberButton>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700" dir={dir}>
      {/* Dynamic Navigation Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <Link to="/auctions">
             <AmberButton variant="secondary" className="p-0 w-11 h-11 rounded-xl flex items-center justify-center active:scale-95 transition-all bg-obsidian-card border-border">
                <ChevronLeft className={cn("w-5 h-5", isRTL && "rotate-180")} />
             </AmberButton>
          </Link>
          <div>
            <h1 className="text-3xl font-black text-zinc-text tracking-tighter uppercase italic leading-none">
              {isEdit ? t('auction.form.modify_asset') : t('auction.form.deploy_new')}
            </h1>
            <p className="text-sm text-zinc-muted font-bold tracking-tight uppercase mt-1">
              {isEdit ? t('auction.form.sync_metrics').replace('{id}', id || '') : t('auction.form.init_protocol')}
            </p>
          </div>
        </div>
        <div className="flex gap-3">
           <AmberButton 
                variant="outline" 
                className="h-11 border-border font-bold rounded-xl px-6 hover:bg-obsidian-hover active:scale-95 transition-all"
                onClick={() => navigate('/auctions')}
           >
                {t('auction.form.abort_protocol')}
           </AmberButton>
           <AmberButton 
                className="h-11 bg-brand hover:bg-brand text-black font-black rounded-xl px-10 shadow-lg border-none active:scale-95 transition-all gap-2"
                onClick={handleSubmit}
                disabled={createMutation.isPending || updateMutation.isPending}
           >
                {(createMutation.isPending || updateMutation.isPending) ? (
                    <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                ) : (
                    <Save className="w-5 h-5" />
                )}
                <span>{isEdit ? t('auction.form.authorize_sync') : t('auction.form.execute_deployment')}</span>
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
                    <h3 className="text-sm font-black text-zinc-text uppercase tracking-[0.25em] italic">{t('auction.form.asset_core_specs')}</h3>
                </div>

                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <AmberDropdown 
                            label="Inventory Synchronization"
                            options={[
                                { label: 'Manual Configuration', value: '' },
                                ...inventoryItems.map((item: any) => ({
                                    label: item.name,
                                    value: String(item.id)
                                }))
                            ]}
                            value={String(formData.productId || '')}
                            onChange={(val) => handleChange('productId', val ? Number(val) : undefined)}
                        />
                        <div className="space-y-4">
                            <label className="block text-[10px] font-black text-zinc-muted uppercase tracking-[0.2em] mb-2 px-1 italic">
                                Tactical Category
                            </label>
                            <AmberDropdown 
                                options={[
                                    { label: 'General Asset', value: '1' },
                                    { label: 'Critical Hardware', value: '2' },
                                    { label: 'Strategic Resources', value: '3' },
                                ]}
                                value={String(formData.categoryId || 1)}
                                onChange={(val) => handleChange('categoryId', Number(val))}
                                className="w-full"
                            />
                        </div>
                    </div>

                    <AmberInput 
                        label={t('auction.form.title')}
                        placeholder={t('auction.form.title_placeholder')}
                        value={formData.title}
                        onChange={(e) => handleChange('title', e.target.value)}
                        error={errors.title}
                    />

                    <AmberInput 
                        label={t('auction.form.description')}
                        placeholder={t('auction.form.desc_placeholder')}
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
                    <h3 className="text-sm font-black text-zinc-text uppercase tracking-[0.25em] italic">{t('auction.form.fiscal_premium_thresholds')}</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <AmberInput 
                        label={t('auction.form.starting_premium')}
                        type="number"
                        value={formData.startPrice}
                        onChange={(e) => handleChange('startPrice', Number(e.target.value))}
                        icon={<TrendingUp className="w-4 h-4" />}
                        error={errors.startPrice}
                    />
                    <AmberInput 
                        label={t('auction.form.bid_progression')}
                        type="number"
                        value={formData.bidIncrement}
                        onChange={(e) => handleChange('bidIncrement', Number(e.target.value))}
                        icon={<Gavel className="w-4 h-4" />}
                    />
                    <AmberInput 
                        label={t('auction.form.buy_immediate_price')}
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
                        <p className="text-xs font-black text-emerald-400 uppercase italic">{t('auction.form.premium_note_title')}</p>
                        <p className="text-[11px] text-zinc-muted font-bold tracking-tight">{t('auction.form.premium_note_desc')}</p>
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
                    <h3 className="text-sm font-black text-zinc-text uppercase tracking-[0.25em] italic">{t('auction.form.asset_visualization')}</h3>
                </div>
                <div className="space-y-4">
                    <label className={cn("block text-[10px] font-black text-zinc-muted uppercase tracking-[0.2em] mb-2 px-1 italic", isRTL ? "text-right" : "text-left")}>
                        {t('auction.form.imagery_specs')}
                    </label>
                    <AmberImageUpload 
                        value={formData.images?.[0] || ''}
                        onChange={(files) => {
                            if (files?.[0]) {
                                const url = URL.createObjectURL(files[0]);
                                setSelectedImageFile(files[0]);
                                handleChange('images', [url]);
                            }
                        }}
                    />
                    <p className="text-[9px] text-zinc-muted font-bold text-center uppercase tracking-widest italic">Supports RAW, JPEG, PNG formats (max 5MB)</p>
                </div>
            </Card>

            {/* Deployment Window Control */}
            <Card className="!p-8 bg-obsidian-card border-border shadow-xl space-y-6">
                <div className="flex items-center gap-3 border-b border-white/[0.03] pb-6">
                   <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center text-warning border border-warning/20">
                      <Clock className="w-5 h-5" />
                   </div>
                    <h3 className="text-sm font-black text-zinc-text uppercase tracking-[0.25em] italic">{t('auction.form.temporal_infrastructure')}</h3>
                </div>
                <div className="space-y-6">
                    <AmberInput 
                        label={t('auction.form.strategic_deployment_start')}
                        type="datetime-local"
                        value={formData.startTime}
                        onChange={(e) => handleChange('startTime', e.target.value)}
                        icon={<Calendar className="w-4 h-4" />}
                        error={errors.startTime}
                    />
                    <AmberInput 
                        label={t('auction.form.liquidation_termination_window')}
                        type="datetime-local"
                        value={formData.endTime}
                        onChange={(e) => handleChange('endTime', e.target.value)}
                        icon={<Clock className="w-4 h-4" />}
                        error={errors.endTime}
                    />
                </div>
                <div className="p-4 rounded-xl bg-obsidian-panel/40 border border-white/5 space-y-3">
                     <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest">
                         <span className="text-zinc-muted">Cycle Duration</span>
                         <span className="text-warning italic">Synchronizing...</span>
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
                    disabled={updateMutation.isPending || createMutation.isPending}
                    onClick={handleSubmit}
                >
                    {(updateMutation.isPending || createMutation.isPending) && (
                        <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    )}
                    {isEdit ? t('auction.form.authorize_sync') : t('auction.form.execute_deployment')}
                </AmberButton>
                <AmberButton 
                    variant="secondary" 
                    className="w-full h-12 bg-obsidian-card font-black uppercase tracking-widest italic rounded-xl border border-white/5 active:scale-95 transition-all"
                    onClick={() => navigate('/auctions')}
                >
                    {t('auction.form.cancel_operations')}
                </AmberButton>
            </div>
        </div>
      </form>
    </div>
  );
};

export default AuctionFormPage;
