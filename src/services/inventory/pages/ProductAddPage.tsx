import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { AmberCard as Card } from '@core/components/AmberCard';
import { AmberButton } from '@core/components/AmberButton';
import { AmberInput } from '@core/components/AmberInput';
import { AmberDropdown } from '@core/components/AmberDropdown';
import { cn } from '@core/lib/utils/cn';
import { useLanguage } from '@core/contexts/LanguageContext';
import {
  Package,
  Save,
  X,
  Upload,
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

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const fileArray = Array.from(files);
    fileArray.forEach(file => {
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
          <button onClick={() => setComingSoonShown(false)} className="ml-auto text-info/60 hover:text-info">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
      {/* Header */}
      <div className={cn(
        "flex flex-col sm:flex-row sm:items-start justify-between gap-6",
        isRTL ? "text-right" : "text-left"
      )}>
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
                <Save className={cn("w-4 h-4", isRTL ? "ml-2" : "mr-2")} />
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
                <label className={cn("text-[9px] font-black uppercase tracking-widest px-1 flex justify-between", errors.category ? "text-danger" : "text-zinc-muted")}>
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
                <label className="text-[9px] font-black uppercase tracking-widest px-1 text-zinc-muted block">
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
                label={t('prod.add.price') || 'السعر الأساسي (USD)'}
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
                <label className="text-[9px] font-black uppercase tracking-widest px-1 text-zinc-muted block">
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

            <div className="space-y-4">
              <label className={cn(
                "flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-xl cursor-pointer transition-all relative overflow-hidden group",
                formData.images.length >= 5 
                  ? "border-[var(--color-border)] bg-black/20 cursor-not-allowed opacity-50" 
                  : "border-[var(--color-border)] bg-white/[0.02] hover:bg-[var(--color-obsidian-hover)] hover:border-[var(--color-brand)]/30"
              )}>
                <input 
                  type="file" 
                  className="hidden" 
                  onChange={handleImageUpload} 
                  multiple 
                  disabled={formData.images.length >= 5}
                  accept="image/*"
                />
                
                <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center px-4 relative z-10">
                  <Upload className="w-10 h-10 mb-3 text-zinc-muted group-hover:text-[var(--color-brand)] transition-colors" />
                  <p className="text-sm font-bold text-zinc-text uppercase tracking-tight mb-1.5">
                    {formData.images.length >= 5 
                      ? (t('prod.add.limit_reached') || 'تم الوصول للحد الأقصى')
                      : (t('prod.add.upload') || 'رفع الصور')}
                  </p>
                  <p className="text-xs text-zinc-muted font-medium">
                    {formData.images.length < 5 
                      ? (t('prod.add.image_hint') || 'PNG، JPG حتى 10MB (الحد الأقصى 5 صور)')
                      : (t('prod.add.image_limit_hint') || 'تم رفع الحد الأقصى من الصور')}
                  </p>
                </div>
              </label>

              {/* Image Previews */}
              <div className="grid grid-cols-2 gap-3 mt-6">
                {formData.images.length > 0 ? (
                  formData.images.map((img, idx) => (
                    <div 
                      key={idx} 
                      className={cn(
                        "relative group rounded-xl overflow-hidden border border-[var(--color-border)] bg-[var(--color-obsidian-card)] shadow-xl aspect-square",
                        idx === 0 && "col-span-2 aspect-video mb-2"
                      )}
                    >
                      <img src={img} alt={`${t('prod.add.primary_image') || 'صورة'} ${idx + 1}`} className="w-full h-full object-cover text-xs" />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <button 
                          onClick={(e) => { e.preventDefault(); removeImage(idx); }}
                          className="w-10 h-10 bg-[var(--color-danger)] text-white rounded-full flex items-center justify-center hover:scale-110 active:scale-95 transition-all shadow-lg"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                      {idx === 0 && (
                        <div className="absolute top-3 left-3 px-3 py-1 bg-[var(--color-brand)] text-black rounded-lg text-xs font-black uppercase tracking-widest shadow-lg">
                          {t('prod.add.primary_image') || 'الصورة الرئيسية'}
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="col-span-2 py-10 flex flex-col items-center justify-center bg-white/[0.01] border border-[var(--color-border)] rounded-xl opacity-20">
                     <ImageIcon className="w-12 h-12 mb-3 stroke-1" />
                     <p className="text-sm font-black uppercase tracking-widest">{t('prod.add.no_images') || 'لا توجد صور بعد'}</p>
                  </div>
                )}
              </div>
            </div>
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
