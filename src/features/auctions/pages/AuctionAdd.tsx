/**
 * Create Auction Page
 *
 * Form for creating a new auction
 */

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/router';
import { ArrowLeft, Upload, Plus, X, AlertCircle } from 'lucide-react';
import { useCreateAuction } from '../api';
import { useList as useCategories } from '../../../services/categories/hooks';

import type { AuctionCreateInput } from '../types/auction.types';
import { useLanguage } from '@core/contexts/LanguageContext';

import { AmberInput } from '../../../core/components/AmberInput';
import { AmberCard as Card } from '../../../core/components/AmberCard';
import { AmberButton as Button } from '../../../core/components/AmberButton';
import { AmberDropdown } from '../../../core/components/AmberDropdown';

export const AuctionAdd = () => {
  const router = useRouter();
  const { t, dir } = useLanguage();
  const createAuction = useCreateAuction();

  const [formData, setFormData] = useState<Partial<AuctionCreateInput>>({
    title: '',
    description: '',
    startPrice: 0,
    buyNowPrice: undefined,
    reservePrice: undefined,
    startTime: '',
    endTime: '',
    bidIncrement: 1,
    categoryId: 1,
    images: [],
  });
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const { data: categoriesData } = useCategories({ limit: 100 });
  const categories = useMemo(() => {
    const items = (categoriesData as any)?.items || [];
    if (items.length > 0) {
      return items.map((cat: any) => ({
        id: cat.id,
        name: cat.name || cat.title || '',
        key: cat.slug || String(cat.id),
      }));
    }
    return [{ id: 1, name: t('auction.category.other') || 'Other', key: 'other' }];
  }, [categoriesData, t]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      // In a real app, this would upload to a server
      // For now, we'll use object URLs for preview
      const newImages = Array.from(files).map(file => URL.createObjectURL(file));
      setUploadedImages(prev => [...prev, ...newImages]);
    }
  };

  const removeImage = (index: number) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title?.trim()) newErrors.title = t('auction.validation.title_required') || 'Title is required';
    if (!formData.description?.trim()) newErrors.description = t('auction.validation.desc_required') || 'Description is required';
    if (!formData.startPrice || formData.startPrice <= 0)
      newErrors.startPrice = t('auction.validation.start_price_gt_0') || 'Starting price must be greater than 0';
    if (!formData.startTime) newErrors.startTime = t('auction.validation.start_time_required') || 'Start time is required';
    if (!formData.endTime) newErrors.endTime = t('auction.validation.end_time_required') || 'End time is required';
    if (formData.buyNowPrice && formData.buyNowPrice <= formData.startPrice)
      newErrors.buyNowPrice = t('auction.validation.buy_now_gt_start') || 'Buy now price must be greater than starting price';
    if (uploadedImages.length === 0) newErrors.images = t('auction.validation.image_required') || 'At least one image is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    try {
      setSubmitError(null);
      await createAuction.mutateAsync({
        ...formData,
        images: uploadedImages,
      } as AuctionCreateInput);
      router.push('/auctions');
    } catch (err: any) {
      const errorMessage = err?.message || err?.details?.[0] || t('auction.validation.submit_failed') || 'Failed to create auction. Please try again.';
      setSubmitError(errorMessage);
    }
  };

  const isRTL = dir === 'rtl';

  if (!isClient) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-6" dir={dir}>
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
      {/* Header */}
      <div className={`flex items-center gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
        <Button
          variant="ghost"
          className="p-2"
          onClick={() => router.push('/auctions')}
        >
          <ArrowLeft size={20} className={isRTL ? 'rotate-180' : ''} />
        </Button>
        <div className={isRTL ? 'text-right' : 'text-left'}>
          <h1 className="text-2xl font-bold text-white">{t('auction.create_auction') || 'Create Auction'}</h1>
          <p className="text-zinc-400">{t('auction.list_item_desc') || 'List an item for auction'}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card className="p-6 space-y-4">
          <h2 className={`text-lg font-semibold text-white ${isRTL ? 'text-right' : 'text-left'}`}>{t('auction.basic_info') || 'Basic Information'}</h2>

          <AmberInput
            label={t('auction.form.title')}
            value={formData.title}
            onChange={(e) => handleInputChange('title', e.target.value)}
            error={errors.title}
            placeholder={t('auction.form.title_placeholder')}
            dir={dir}
          />

          <AmberInput
            multiline
            rows={4}
            label={t('auction.form.description')}
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            error={errors.description}
            placeholder={t('auction.form.desc_placeholder')}
            dir={dir}
          />

          <AmberDropdown
            label={t('auction.form.category')}
            value={String(formData.categoryId)}
            onChange={(val) => handleInputChange('categoryId', parseInt(val))}
            options={categories.map(cat => ({ value: String(cat.id), label: cat.name }))}
          />
        </Card>

        {/* Images */}
        <Card className="p-6 space-y-4">
          <h2 className={`text-lg font-semibold text-white ${isRTL ? 'text-right' : 'text-left'}`}>{t('auction.form.images') || 'Images'}</h2>

          <div className="border-2 border-dashed border-white/10 rounded-lg p-8 text-center hover:border-brand/50 transition-colors">
            <Upload size={32} className="mx-auto text-zinc-500 mb-2" />
            <p className="text-zinc-400 mb-4">{t('auction.form.drag_drop') || 'Drag images here or click to upload'}</p>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
              id="image-upload"
            />
            <label
              htmlFor="image-upload"
              className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-white cursor-pointer"
            >
              <Plus size={18} />
              {t('auction.form.select_images') || 'Select Images'}
            </label>
          </div>

          {errors.images && <span className={`text-sm text-red-400 block ${isRTL ? 'text-right' : 'text-left'}`}>{errors.images}</span>}

          {uploadedImages.length > 0 && (
            <div className="grid grid-cols-4 gap-4">
              {uploadedImages.map((image, index) => (
                <div key={index} className="relative group">
                  <img
                    src={image}
                    alt={`Upload ${index + 1}`}
                    className="w-full h-24 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-1 right-1 p-1 bg-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X size={14} className="text-white" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Pricing */}
        <Card className="p-6 space-y-4">
          <h2 className={`text-lg font-semibold text-white ${isRTL ? 'text-right' : 'text-left'}`}>{t('auction.form.pricing') || 'Pricing'}</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <AmberInput
              label={t('auction.form.start_price')}
              type="number"
              min="0"
              value={formData.startPrice}
              onChange={(e) => handleInputChange('startPrice', parseFloat(e.target.value) || 0)}
              error={errors.startPrice}
              dir={dir}
            />

            <AmberInput
              label={`${t('auction.form.reserve_price')} - ${t('auction.form.optional')}`}
              type="number"
              min="0"
              value={formData.reservePrice || ''}
              onChange={(e) => handleInputChange('reservePrice', parseFloat(e.target.value) || undefined)}
              error={errors.reservePrice}
              dir={dir}
            />

            <AmberInput
              label={`${t('auction.form.buy_now_price')} - ${t('auction.form.optional')}`}
              type="number"
              min="0"
              value={formData.buyNowPrice || ''}
              onChange={(e) => handleInputChange('buyNowPrice', parseFloat(e.target.value) || undefined)}
              error={errors.buyNowPrice}
              dir={dir}
            />
          </div>

          <AmberInput
            label={t('auction.form.bid_increment')}
            type="number"
            min="1"
            value={formData.bidIncrement}
            onChange={(e) => handleInputChange('bidIncrement', parseFloat(e.target.value) || 1)}
            dir={dir}
          />
        </Card>

        {/* Timing */}
        <Card className="p-6 space-y-4">
          <h2 className={`text-lg font-semibold text-white ${isRTL ? 'text-right' : 'text-left'}`}>{t('auction.auction_schedule') || 'Auction Schedule'}</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AmberInput
              label={t('auction.form.start_time')}
              type="datetime-local"
              value={formData.startTime}
              onChange={(e) => handleInputChange('startTime', e.target.value)}
              error={errors.startTime}
              dir={dir}
            />

            <AmberInput
              label={t('auction.form.end_time')}
              type="datetime-local"
              value={formData.endTime}
              onChange={(e) => handleInputChange('endTime', e.target.value)}
              error={errors.endTime}
              dir={dir}
            />
          </div>
        </Card>

        {/* Submit */}
        <div className={`flex items-center justify-end gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
          <Button
            type="button"
            variant="ghost"
            className="text-zinc-400 hover:text-white"
            onClick={() => router.push('/auctions')}
          >
            {t('common.cancel')}
          </Button>
          <Button
            type="submit"
            className="bg-brand hover:bg-brand/90 text-white"
            disabled={createAuction.isPending}
          >
            {createAuction.isPending ? t('auction.form.creating') : t('auction.create_auction')}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AuctionAdd;
