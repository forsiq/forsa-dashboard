
import React, { useState } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { AmberDropdown } from '../amber-ui/components/AmberDropdown';
import { AmberAutocomplete } from '../amber-ui/components/AmberAutocomplete';
import { AmberInput } from '../amber-ui/components/AmberInput';
import { useForm } from '../hooks/useForm';
import { 
  ArrowLeft, 
  Save, 
  X, 
  Package, 
  DollarSign, 
  BarChart, 
  Image as ImageIcon,
  UploadCloud,
  Layers,
  Plus,
  Check,
  Tag,
  ScanBarcode,
  AlertCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../amber-ui/contexts/LanguageContext';
import { cn } from '../lib/cn';

interface ProductFormState {
  name: string;
  sku: string;
  barcode: string;
  description: string;
  basePrice: string;
  costPrice: string;
  stock: number;
  trackStock: boolean;
  status: string;
  category: string;
  tags: string[];
}

export const AddProduct = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [tagInput, setTagInput] = useState('');

  // Validation Logic
  const validate = (values: ProductFormState) => {
    const errors: Partial<Record<keyof ProductFormState, string>> = {};
    
    if (!values.name.trim()) errors.name = "Required";
    if (!values.barcode.trim()) errors.barcode = "Required";
    
    if (!values.basePrice) {
        errors.basePrice = "Required";
    } else if (isNaN(parseFloat(values.basePrice)) || parseFloat(values.basePrice) <= 0) {
        errors.basePrice = "Invalid Price";
    }

    if (!values.costPrice) {
        errors.costPrice = "Required";
    } else if (isNaN(parseFloat(values.costPrice)) || parseFloat(values.costPrice) < 0) {
        errors.costPrice = "Invalid Cost";
    }

    if (values.trackStock && values.stock < 0) {
        errors.stock = "Cannot be negative";
    }

    if (values.category === '') errors.category = "Required";

    return errors;
  };

  // Initialize Form
  const { values, errors, handleChange, setFieldValue, handleSubmit } = useForm<ProductFormState>({
    name: '',
    sku: 'AUTO-GENERATED',
    barcode: '',
    description: '',
    basePrice: '',
    costPrice: '',
    stock: 0,
    trackStock: true,
    status: 'draft',
    category: 'electronics',
    tags: ['New Arrival']
  }, validate);

  const categories = [
    { label: 'Electronics', value: 'electronics' },
    { label: 'Luxury Goods', value: 'luxury' },
    { label: 'Home & Office', value: 'home_office' },
    { label: 'Fashion / Boutique', value: 'boutique' },
    { label: 'Computing & Data', value: 'computing' },
    { label: 'Networking Equipment', value: 'networking' },
    { label: 'Industrial Tools', value: 'industrial' },
    { label: 'Automotive Parts', value: 'automotive' },
  ];

  const statusOptions = [
    { label: 'Draft (Hidden)', value: 'draft' },
    { label: 'Active (Public)', value: 'active' },
    { label: 'Archived', value: 'archived' },
  ];

  // Handlers
  const handleAddTag = () => {
    if (tagInput.trim() && !values.tags.includes(tagInput.trim())) {
      setFieldValue('tags', [...values.tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFieldValue('tags', values.tags.filter(tag => tag !== tagToRemove));
  };

  const onSave = (data: ProductFormState) => {
    console.log("Form Submitted Successfully:", data);
    // Simulate API call
    navigate(-1);
  };

  return (
    <div className="animate-fade-up max-w-6xl mx-auto py-4 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/5 pb-6">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate(-1)}
            className="p-2 bg-obsidian-card border border-white/5 rounded-sm text-zinc-muted hover:text-zinc-text transition-all hover:bg-white/5"
          >
            <ArrowLeft className="w-4 h-4 rtl:rotate-180" />
          </button>
          <div>
            <h1 className="text-2xl font-black text-zinc-text uppercase tracking-tighter italic">Initialize SKU</h1>
            <p className="text-[10px] font-black text-zinc-muted uppercase tracking-[0.3em] mt-1">Create a new product record</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
            <X className="w-3.5 h-3.5 me-2" /> Cancel
          </Button>
          <Button 
            size="sm" 
            className="bg-brand text-black hover:bg-brand/90 shadow-[0_0_15px_rgba(255,192,0,0.1)]"
            onClick={() => handleSubmit(onSave)}
          >
            <Save className="w-3.5 h-3.5 me-2" /> Save Product
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Column */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6 space-y-6 bg-obsidian-panel/50 backdrop-blur-sm">
             <div className="flex items-center gap-2 mb-2 pb-2 border-b border-white/5">
                <Package className="w-4 h-4 text-brand" />
                <h3 className="text-xs font-black text-zinc-text uppercase tracking-widest">General Information</h3>
             </div>
             
             <div className="space-y-5">
                <AmberInput 
                    label="Product Name"
                    placeholder="e.g. Neural-Link Audio Interface"
                    value={values.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    error={errors.name}
                    required
                />
                
                <div className="grid grid-cols-2 gap-4">
                   <AmberInput 
                      label="SKU (Stock Keeping Unit)"
                      value={values.sku}
                      readOnly
                      className="bg-obsidian-outer/50 cursor-not-allowed"
                   />
                   <AmberInput 
                      label="Barcode / GTIN"
                      placeholder="Scan or enter..."
                      value={values.barcode}
                      onChange={(e) => handleChange('barcode', e.target.value)}
                      error={errors.barcode}
                      required
                      rightElement={<ScanBarcode className="w-4 h-4" />}
                   />
                </div>

                <AmberInput 
                   label="Description"
                   multiline
                   rows={5}
                   value={values.description}
                   onChange={(e) => handleChange('description', e.target.value)}
                   placeholder="Enter detailed product specifications and marketing copy..."
                />
             </div>
          </Card>

          <Card className="p-6 space-y-6 bg-obsidian-panel/50">
             <div className="flex items-center gap-2 mb-2 pb-2 border-b border-white/5">
                <ImageIcon className="w-4 h-4 text-info" />
                <h3 className="text-xs font-black text-zinc-text uppercase tracking-widest">Media Assets</h3>
             </div>

             <div className="border-2 border-dashed border-white/10 rounded-lg p-10 flex flex-col items-center justify-center text-center hover:bg-white/[0.02] hover:border-brand/30 transition-all cursor-pointer group bg-obsidian-outer/20">
                <div className="w-14 h-14 rounded-full bg-obsidian-outer border border-white/10 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:border-brand/30 transition-all shadow-lg">
                   <UploadCloud className="w-6 h-6 text-zinc-muted group-hover:text-brand transition-colors" />
                </div>
                <p className="text-xs font-bold text-zinc-text uppercase tracking-tight">Drop high-res images here</p>
                <p className="text-[9px] font-bold text-zinc-muted uppercase tracking-widest mt-1">Supported formats: PNG, JPG, WEBP</p>
             </div>
          </Card>

          <Card className="p-6 space-y-6 bg-obsidian-panel/50">
             <div className="flex items-center gap-2 mb-2 pb-2 border-b border-white/5">
                <DollarSign className="w-4 h-4 text-success" />
                <h3 className="text-xs font-black text-zinc-text uppercase tracking-widest">Pricing & Valuation</h3>
             </div>
             
             <div className="grid grid-cols-3 gap-4">
                <AmberInput 
                   label="Base Price"
                   type="number"
                   value={values.basePrice}
                   onChange={(e) => handleChange('basePrice', e.target.value)}
                   error={errors.basePrice}
                   placeholder="0.00"
                   required
                   icon={<span className="text-zinc-muted font-bold">$</span>}
                />
                <AmberInput 
                   label="Cost Per Item"
                   type="number"
                   value={values.costPrice}
                   onChange={(e) => handleChange('costPrice', e.target.value)}
                   error={errors.costPrice}
                   placeholder="0.00"
                   required
                   icon={<span className="text-zinc-muted font-bold">$</span>}
                />
                <div className="space-y-1.5 w-full">
                   <label className="text-[9px] font-black text-zinc-muted uppercase tracking-widest px-1">Profit Margin</label>
                   <input 
                     type="text" 
                     placeholder="-"
                     disabled
                     value={values.basePrice && values.costPrice ? `${((parseFloat(values.basePrice) - parseFloat(values.costPrice)) / parseFloat(values.basePrice) * 100).toFixed(1)}%` : '-'}
                     className="w-full h-11 bg-obsidian-outer/30 border border-white/5 rounded-sm px-4 text-sm font-bold text-success outline-none"
                   />
                </div>
             </div>
          </Card>
        </div>

        {/* Sidebar Column */}
        <div className="space-y-6">
           <Card className="p-5 space-y-5 bg-obsidian-panel/50 backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-2 pb-2 border-b border-white/5">
                 <Layers className="w-4 h-4 text-warning" />
                 <h3 className="text-xs font-black text-zinc-text uppercase tracking-widest">Organization</h3>
              </div>

              <div className="space-y-5">
                 <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-zinc-muted uppercase tracking-widest px-1">Status</label>
                    <AmberDropdown 
                        options={statusOptions}
                        value={values.status}
                        onChange={(val) => handleChange('status', val)}
                        className="w-full"
                    />
                 </div>

                 <div className="space-y-1.5">
                    <label className={cn("text-[9px] font-black uppercase tracking-widest px-1 flex justify-between", errors.category ? "text-danger" : "text-zinc-muted")}>
                       <span>Category <span className="text-brand">*</span></span>
                       {errors.category && <span className="italic normal-case opacity-90">{errors.category}</span>}
                    </label>
                    <AmberAutocomplete 
                      options={categories} 
                      value={values.category} 
                      onChange={(val) => handleChange('category', val)}
                      placeholder="Search Categories..."
                      className="w-full"
                    />
                 </div>

                 <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-zinc-muted uppercase tracking-widest px-1 flex items-center gap-2">
                        Tags <Tag className="w-3 h-3 text-zinc-muted" />
                    </label>
                    <div className="w-full bg-obsidian-outer border border-white/5 rounded-sm p-2 flex flex-wrap gap-2 min-h-[44px] focus-within:border-brand/30 focus-within:ring-1 focus-within:ring-brand/10 transition-all">
                       {values.tags.map(tag => (
                           <span key={tag} className="inline-flex items-center gap-1.5 px-2 py-1 bg-white/5 border border-white/5 rounded-sm text-[10px] font-bold text-zinc-text animate-in fade-in zoom-in duration-200 group">
                              {tag} 
                              <button 
                                onClick={() => handleRemoveTag(tag)}
                                className="hover:text-danger transition-colors p-0.5 rounded-full hover:bg-white/10"
                              >
                                <X className="w-3 h-3" />
                              </button>
                           </span>
                       ))}
                       <div className="flex-1 min-w-[80px] flex items-center">
                           <Plus className="w-3 h-3 text-zinc-muted mr-1.5 opacity-50" />
                           <input 
                               type="text" 
                               value={tagInput}
                               onChange={(e) => setTagInput(e.target.value)}
                               onKeyDown={handleTagKeyDown}
                               placeholder="Add tag..."
                               className="bg-transparent border-none outline-none text-[10px] font-bold text-zinc-text w-full placeholder:text-zinc-muted/40 h-full"
                           />
                       </div>
                    </div>
                 </div>
              </div>
           </Card>

           <Card className="p-5 space-y-5 animate-in fade-in slide-in-from-right-4 duration-300 bg-obsidian-panel/50">
                <div className="flex items-center gap-2 mb-2 pb-2 border-b border-white/5">
                   <BarChart className="w-4 h-4 text-brand" />
                   <h3 className="text-xs font-black text-zinc-text uppercase tracking-widest">Inventory</h3>
                </div>

                <div className="space-y-4">
                   <div 
                        className={cn(
                            "flex items-center justify-between p-3 border rounded-sm cursor-pointer transition-all group",
                            values.trackStock 
                                ? "bg-brand/5 border-brand/20 shadow-[inset_0_0_10px_rgba(245,196,81,0.05)]" 
                                : "bg-obsidian-outer border-white/5 hover:border-white/10"
                        )}
                        onClick={() => handleChange('trackStock', !values.trackStock)}
                   >
                      <label className="text-[10px] font-bold text-zinc-text uppercase cursor-pointer pointer-events-none group-hover:text-brand transition-colors">Track Quantity</label>
                      <div className={cn(
                          "w-4 h-4 border rounded-sm flex items-center justify-center transition-all", 
                          values.trackStock 
                            ? "bg-brand border-brand" 
                            : "border-white/20 bg-obsidian-outer"
                        )}>
                          {values.trackStock && <Check className="w-3 h-3 text-black" />}
                      </div>
                   </div>
                   
                   {values.trackStock && (
                       <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                          <AmberInput 
                             label="Available Stock"
                             type="number"
                             value={values.stock}
                             onChange={(e) => handleChange('stock', parseInt(e.target.value) || 0)}
                             error={errors.stock}
                             icon={<Package className="w-3.5 h-3.5" />}
                          />
                       </div>
                   )}
                </div>
             </Card>
             
             {/* Validation Summary (Only visible if errors exist) */}
             {Object.keys(errors).length > 0 && (
                <div className="bg-danger/10 border border-danger/20 rounded-sm p-4 animate-in fade-in slide-in-from-bottom-2">
                    <div className="flex items-center gap-2 text-danger mb-2">
                        <AlertCircle className="w-4 h-4" />
                        <h4 className="text-[10px] font-black uppercase tracking-widest">Validation Errors</h4>
                    </div>
                    <ul className="list-disc list-inside space-y-1">
                        {Object.entries(errors).map(([field, msg]) => (
                            <li key={field} className="text-[10px] font-bold text-zinc-muted">
                                <span className="capitalize text-zinc-text">{field.replace(/([A-Z])/g, ' $1').trim()}:</span> {msg}
                            </li>
                        ))}
                    </ul>
                </div>
             )}
        </div>
      </div>
    </div>
  );
};
