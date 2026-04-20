import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import {
  Package,
  Save,
  X,
  DollarSign,
  Tag,
  FileText,
  AlertCircle,
  Loader2,
  Settings2,
  Box,
  Globe,
  Scale,
  Maximize
} from 'lucide-react';
import { useLanguage } from '@core/contexts/LanguageContext';
import { cn } from '@core/lib/utils/cn';
import { AmberCard as Card } from '@core/components/AmberCard';
import { AmberButton } from '@core/components/AmberButton';
import { AmberInput } from '@core/components/AmberInput';
import { AmberDropdown } from '@core/components/AmberDropdown';
import { AmberImageUpload } from '@core/components/AmberImageUpload';
import { useGetItem, useCreateItemMutation, useUpdateItemMutation } from '../hooks/useItems';
import type { Item, ItemStatus } from '../types';

/**
 * ItemFormPage - Universal Form for Creating/Editing Items
 */
export const ItemFormPage: React.FC = () => {
  const { t, dir } = useLanguage();
  const router = useRouter();
  const { id } = router.query;
  const isEdit = !!id;
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const { data: existingItem, isLoading: itemLoading } = useGetItem((id as string) || '');
  const createMutation = useCreateItemMutation();
  const updateMutation = useUpdateItemMutation();

  const [formData, setFormData] = useState<Partial<Item>>({
    name: '',
    description: '',
    category: '',
    sku: '',
    startingBid: 0,
    status: 'available',
    image: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const isRTL = dir === 'rtl';

  useEffect(() => {
    if (existingItem) {
      setFormData(existingItem);
    }
  }, [existingItem]);

  const handleChange = (field: keyof Item, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name?.trim()) newErrors.name = t('items.form.name_required');
    if (!formData.category) newErrors.category = t('items.form.category_required');
    if (!formData.startingBid || formData.startingBid <= 0) newErrors.startingBid = t('items.form.bid_gt_0');
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    
    try {
      setSubmitError(null);
      if (isEdit && id) {
        await updateMutation.mutateAsync({ id: id as string, input: formData });
      } else {
        await createMutation.mutateAsync(formData);
      }
      router.push('/items');
    } catch (err: any) {
      const errorMessage = err?.message || err?.details?.[0] || t('error.save_failed') || 'Failed to save. Please try again.';
      setSubmitError(errorMessage);
    }
  };

  if (!isClient) return null;

  if (isEdit && (itemLoading || !router.isReady)) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-brand" />
      </div>
    );
  }

  return (
    <div className="space-y-8 p-6 max-w-[1200px] mx-auto animate-in fade-in duration-700" dir={dir}>
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
      {/* Page Header */}
      <div className={cn(
        "flex flex-col sm:flex-row sm:items-start justify-between gap-6",
        isRTL ? "text-right" : "text-left"
      )}>
        <div className="space-y-1">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-sm bg-brand/10 flex items-center justify-center text-brand border border-brand/20">
                <Package className="w-5 h-5" />
             </div>
             <div>
                <h1 className="text-3xl font-black text-zinc-text tracking-tight uppercase">
                    {isEdit ? t('items.form.modify_asset') : t('items.form.initialize_asset')}
                </h1>
                <p className="text-sm text-zinc-secondary font-bold">
                    {isEdit ? `${t('items.form.update_metadata')} ${id}` : t('items.form.configure_new_unit')}
                </p>
             </div>
          </div>
        </div>
        <Link href="/items">
            <AmberButton variant="outline" className="h-10 border-border">
                <X className="w-4 h-4 mr-2" /> {t('common.cancel')}
            </AmberButton>
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Logic Layer */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="!p-8 bg-obsidian-card border-border">
            <div className="flex items-center gap-3 mb-8 border-b border-border pb-4">
              <FileText className="w-5 h-5 text-brand" />
              <h2 className="text-xl font-black text-zinc-text uppercase tracking-tighter italic">{t('items.form.basic_specs')}</h2>
            </div>

            <div className="space-y-6">
              <AmberInput 
                label={t('items.form.item_designation')}
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder={t('items.form.item_designation_placeholder')}
                error={errors.name}
                required
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-[10px] font-black text-zinc-muted uppercase tracking-widest mb-2 px-1 italic">
                        {t('items.form.classification_category')}
                    </label>
                    <AmberDropdown 
                        options={[
                            { label: 'Hardware', value: 'Hardware' },
                            { label: 'Sensing', value: 'Sensing' },
                            { label: 'Security', value: 'Security' },
                            { label: 'Energy', value: 'Energy' },
                            { label: 'Collectibles', value: 'Collectibles' },
                        ]}
                        value={formData.category || ''}
                        onChange={(val) => handleChange('category', val)}
                        className="h-12"
                    />
                </div>
                <AmberInput 
                    label={t('items.form.serial_access_key')}
                    value={formData.sku}
                    onChange={(e) => handleChange('sku', e.target.value)}
                    placeholder="SY-NODE-999"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-zinc-muted uppercase tracking-widest mb-2 px-1 italic">
                    {t('items.form.technical_abstract')}
                </label>
                <textarea 
                  value={formData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  className="w-full bg-obsidian-outer border border-border rounded-xl p-4 text-sm text-zinc-text placeholder:text-zinc-muted/30 min-h-[120px] focus:outline-none focus:border-brand/30 transition-all font-bold italic"
                  placeholder={t('items.form.technical_abstract_placeholder')}
                />
              </div>
            </div>
          </Card>

          <Card className="!p-8 bg-obsidian-card border-border">
            <div className="flex items-center gap-3 mb-8 border-b border-border pb-4">
              <DollarSign className="w-5 h-5 text-brand" />
              <h2 className="text-xl font-black text-zinc-text uppercase tracking-tighter italic">{t('items.form.financial_protocol')}</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <AmberInput 
                  label={t('items.form.baseline_bid')}
                  type="number"
                  value={formData.startingBid}
                  onChange={(e) => handleChange('startingBid', Number(e.target.value))}
                  icon={<DollarSign className="w-4 h-4" />}
                  error={errors.startingBid}
                  required
               />
               <div>
                    <label className="block text-[10px] font-black text-zinc-muted uppercase tracking-widest mb-2 px-1 italic">
                        {t('items.form.network_status')}
                    </label>
                    <AmberDropdown 
                        options={[
                            { label: 'Available for Auction', value: 'available' },
                            { label: 'Active in Bidding', value: 'in-auction' },
                            { label: 'Sold / Finalized', value: 'sold' },
                            { label: 'Draft Mode', value: 'draft' },
                        ]}
                        value={formData.status || 'available'}
                        onChange={(val) => handleChange('status', val)}
                        className="h-12"
                    />
               </div>
            </div>
          </Card>

          {/* New Technical Section based on old ItemAdd */}
          <Card className="!p-8 bg-obsidian-card border-border">
            <div className="flex items-center gap-3 mb-8 border-b border-border pb-4">
              <Maximize className="w-5 h-5 text-brand" />
              <h2 className="text-xl font-black text-zinc-text uppercase tracking-tighter italic">{t('items.form.technical_dimensions')}</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
               <AmberInput 
                  label={t('items.form.dimensions')}
                  placeholder={t('items.form.dimensions_placeholder')}
                  icon={<Maximize className="w-4 h-4" />}
               />
               <AmberInput 
                  label={t('items.form.net_weight')}
                  placeholder={t('items.form.net_weight_placeholder')}
                  icon={<Scale className="w-4 h-4" />}
               />
               <AmberInput 
                  label={t('items.form.origin_source')}
                  placeholder={t('items.form.origin_source_placeholder')}
                  icon={<Globe className="w-4 h-4" />}
               />
            </div>
          </Card>
        </div>

        {/* Sidebar Controls */}
        <div className="space-y-6">
          <Card className="!p-6 bg-obsidian-card border-border">
            <div className="flex items-center gap-3 mb-6">
              <Settings2 className="w-4 h-4 text-brand" />
              <h3 className="text-[10px] font-black text-zinc-muted uppercase tracking-[0.2em] italic">{t('items.form.actions')}</h3>
            </div>
            
            <AmberButton 
              type="submit" 
              className="w-full py-6 bg-brand hover:bg-brand text-black font-black uppercase tracking-widest flex items-center justify-center gap-3 shadow-lg"
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              {(createMutation.isPending || updateMutation.isPending) ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
              {isEdit ? t('items.form.overwrite_node') : t('items.form.deploy_asset')}
            </AmberButton>
            
            <Link href="/items">
              <AmberButton variant="outline" className="w-full mt-4 h-12 border-border font-bold">
                {t('items.form.abort')}
              </AmberButton>
            </Link>
          </Card>

          <Card className="!p-6 bg-obsidian-card border-border">
            <div className="flex items-center gap-3 mb-6">
               <Box className="w-4 h-4 text-brand" />
               <h3 className="text-[10px] font-black text-zinc-muted uppercase tracking-[0.2em] italic">{t('items.form.visual_identity')}</h3>
            </div>

            <div className="space-y-4">
              <label className="block text-[10px] font-black text-zinc-muted uppercase tracking-[0.2em] mb-2 px-1 italic">
                 {t('items.form.asset_visualization')}
              </label>
              <AmberImageUpload 
                value={formData.image || ''}
                onChange={(files) => {
                  if (files && files[0]) {
                    // Create a preview URL for the selected file
                    const url = URL.createObjectURL(files[0]);
                    handleChange('image', url);
                  }
                }}
              />
            </div>
          </Card>

          <Card className="bg-info/5 border-info/20 !p-6 shadow-sm">
             <div className="flex items-center gap-2 mb-4 text-info">
               <AlertCircle className="w-4 h-4" />
               <span className="text-[10px] font-black uppercase tracking-widest italic">{t('items.form.deployment_strategy')}</span>
             </div>
             <p className="text-xs font-bold text-zinc-muted italic leading-relaxed">
               {t('items.form.deployment_strategy_desc')}
             </p>
          </Card>
        </div>
      </form>
    </div>
  );
};

export default ItemFormPage;
