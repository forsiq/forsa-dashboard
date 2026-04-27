import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { AmberCard as Card } from '@core/components/AmberCard';
import { AmberButton } from '@core/components/AmberButton';
import { AmberInput } from '@core/components/AmberInput';
import { AmberDropdown } from '@core/components/AmberDropdown';
import { AmberImageUpload } from '@core/components/AmberImageUpload';
import { cn } from '@core/lib/utils/cn';
import { useLanguage } from '@core/contexts/LanguageContext';
import {
  Package,
  Save,
  X,
  Image as ImageIcon,
  TrendingUp,
  ArrowLeft,
  Loader2,
  AlertCircle,
} from 'lucide-react';

// --- Types ---

interface ProductForm {
  name: string;
  sku: string;
  category: string;
  condition: string;
  price: string;
  stockQuantity: string;
  description: string;
  startingBid: string;
  buyNowPrice: string;
  duration: string;
  images: string[];
}

const INITIAL_FORM: ProductForm = {
  name: '',
  sku: '',
  category: '',
  condition: 'New',
  price: '',
  stockQuantity: '',
  description: '',
  startingBid: '',
  buyNowPrice: '',
  duration: '7',
  images: [],
};

// --- Component ---

export const ProductAddPage = () => {
  const { t, dir } = useLanguage();
  const router = useRouter();
  const { id } = router.query;
  const isEditMode = !!id;
  const isRTL = dir === 'rtl';

  const [formData, setFormData] = useState<ProductForm>(INITIAL_FORM);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [comingSoonShown, setComingSoonShown] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // --- Handlers ---

  const handleChange = (field: keyof ProductForm, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      const newErrors = { ...errors };
      delete newErrors[field];
      setErrors(newErrors);
    }
  };

  const handleImageUpload = (files: File[]) => {
    const remaining = 5 - formData.images.length;
    const toProcess = files.slice(0, remaining);
    toProcess.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          images: [...prev.images, reader.result as string].slice(0, 5)
        }));
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const reorderImages = (newOrder: string[]) => {
    setFormData(prev => ({ ...prev, images: newOrder }));
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!formData.name) e.name = t('error.required_fields') || 'الحقل مطلوب';
    if (!formData.sku) e.sku = t('error.required_fields') || 'الحقل مطلوب';
    if (!formData.category) e.category = t('error.required_fields') || 'الحقل مطلوب';
    if (!formData.price) e.price = t('error.required_fields') || 'الحقل مطلوب';
    if (!formData.stockQuantity) e.stockQuantity = t('error.required_fields') || 'الحقل مطلوب';
    
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    
    // Backend POST /inventory endpoint does not exist yet
    setIsSubmitting(true);
    setComingSoonShown(true);
    setTimeout(() => {
      setIsSubmitting(false);
    }, 1500);
  };

  if (!isClient) return null;

  return (
    <div className="space-y-8 p-6 max-w-[1600px] mx-auto animate-in fade-in duration-700" dir={dir}>
      {/* Coming Soon Banner */}
      {comingSoonShown && (
        <div className="bg-info/10 border border-info/20 p-4 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
          <AlertCircle className="w-5 h-5 text-info shrink-0" />
          <p className="text-sm text-info font-medium">{t('common.coming_soon') || 'This feature is coming soon. Backend endpoint is not available yet.'}</p>
          <button onClick={() => setComingSoonShown(false)} className="ms-auto text-info/60 hover:text-info">
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
              {isEditMode ? t('common.edit') : t('inventory.add_item')}
            </h1>
            <p className="text-base text-zinc-secondary font-bold">
              {isEditMode ? t('prod.add.subtitle_edit') || 'تعديل بيانات المنتج الحالي' : t('prod.add.subtitle_add') || 'إضافة منتج جديد إلى المخزون'}
            </p>
          </div>
        </div>
        
        <div className="flex gap-3">
          <AmberButton 
            variant="outline" 
            className="px-6 h-11 border-[var(--color-border)] text-zinc-text font-bold rounded-xl active:scale-95 transition-all hover:bg-[var(--color-obsidian-hover)]"
            onClick={() => router.back()}
            disabled={isSubmitting}
          >
            {t('common.cancel')}
          </AmberButton>
          <AmberButton
            className="px-6 h-11 bg-[var(--color-brand)] hover:bg-[var(--color-brand)] text-black font-bold rounded-xl shadow-sm transition-all border-none active:scale-95"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-black" />
                {t('common.saving') || 'جاري الحفظ...'}
              </span>
            ) : (
              <>
                <Save className={cn("w-4 h-4", "me-2")} />
                {isEditMode ? t('common.save') : t('common.create')}
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
                label={t('prod.add.sku') || 'رمز المنتج (SKU)'}
                value={formData.sku}
                onChange={e => handleChange('sku', e.target.value)}
                error={errors.sku}
                placeholder="SKU-XXXX-XXXX"
                required
              />

              <div className="space-y-1.5">
                <label className={cn("text-[10px] font-black uppercase tracking-widest px-1 flex justify-between", errors.category ? "text-danger" : "text-zinc-muted")}>
                  <span>{t('inventory.table.category') || 'الفئة'} <span className="text-[var(--color-danger)]">*</span></span>
                  {errors.category && <span className="italic normal-case opacity-90">{errors.category}</span>}
                </label>
                <AmberDropdown 
                  options={[
                    { label: t('prod.add.category_hardware') || 'عتاد', value: 'Hardware' },
                    { label: t('prod.add.category_energy') || 'طاقة', value: 'Energy' },
                    { label: t('prod.add.category_sensing') || 'استشعار', value: 'Sensing' },
                    { label: t('prod.add.category_security') || 'أمان', value: 'Security' },
                    { label: t('prod.add.category_cooling') || 'تبريد', value: 'Cooling' },
                  ]}
                  value={formData.category}
                  onChange={val => handleChange('category', val)}
                  placeholder={t('common.select') || 'اختر...'}
                  className="w-full h-11"
                />
              </div>

              <AmberInput
                label={t('inventory.stock_level') || 'مستوى المخزون'}
                type="number"
                value={formData.stockQuantity}
                onChange={e => handleChange('stockQuantity', e.target.value)}
                error={errors.stockQuantity}
                placeholder="0"
                required
                min="0"
              />

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest px-1 text-zinc-muted block">
                  {t('prod.add.condition') || 'حالة المنتج'}
                </label>
                <AmberDropdown 
                  options={[
                    { label: t('prod.add.condition_new') || 'جديد', value: 'New' },
                    { label: t('prod.add.condition_refurbished') || 'مُجدَّد', value: 'Refurbished' },
                    { label: t('prod.add.condition_used') || 'مستعمل', value: 'Used' },
                  ]}
                  value={formData.condition}
                  onChange={val => handleChange('condition', val)}
                  className="w-full h-11"
                />
              </div>

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
                label={t('prod.add.price') || 'السعر الأساسي (IQD)'}
                type="number"
                value={formData.price}
                onChange={e => handleChange('price', e.target.value)}
                error={errors.price}
                placeholder="0.00"
                required
                min="0"
                step="0.01"
              />

              <AmberInput
                label={t('prod.add.buy_now') || 'سعر الشراء الفوري'}
                type="number"
                value={formData.buyNowPrice}
                onChange={e => handleChange('buyNowPrice', e.target.value)}
                placeholder="0.00"
                min="0"
                step="0.01"
              />

              <AmberInput
                label={t('prod.add.starting_bid') || 'سعر المزايدة الابتدائي'}
                type="number"
                value={formData.startingBid}
                onChange={e => handleChange('startingBid', e.target.value)}
                placeholder="0.00"
                min="0"
                step="0.01"
              />

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest px-1 text-zinc-muted block">
                  {t('prod.add.duration') || 'مدة العرض (أيام)'}
                </label>
                <AmberDropdown 
                  options={[
                    { label: t('prod.add.duration_3') || '3 أيام', value: '3' },
                    { label: t('prod.add.duration_7') || '7 أيام', value: '7' },
                    { label: t('prod.add.duration_14') || '14 يوماً', value: '14' },
                    { label: t('prod.add.duration_30') || '30 يوماً', value: '30' },
                  ]}
                  value={formData.duration}
                  onChange={val => handleChange('duration', val)}
                  className="w-full h-11"
                />
              </div>
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
              value={formData.images}
              onChange={handleImageUpload}
              onRemove={removeImage}
              onReorder={reorderImages}
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
                   <p className="text-xs font-medium text-zinc-muted leading-relaxed">
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
