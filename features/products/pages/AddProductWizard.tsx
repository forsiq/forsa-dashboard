import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Check, 
  ChevronRight, 
  ArrowLeft, 
  Save, 
  X, 
  Plus, 
  Trash2, 
  Image as ImageIcon, 
  UploadCloud, 
  Type, 
  DollarSign, 
  Layers, 
  Tag, 
  Search, 
  AlertCircle,
  FileText,
  Package,
  Settings,
  RefreshCw,
  MoreVertical
} from 'lucide-react';
import { AmberCard } from '../../../amber-ui/components/AmberCard';
import { AmberButton } from '../../../amber-ui/components/AmberButton';
import { AmberInput } from '../../../amber-ui/components/AmberInput';
import { AmberDropdown } from '../../../amber-ui/components/AmberDropdown';
import { AmberAutocomplete } from '../../../amber-ui/components/AmberAutocomplete';
import { cn } from '../../../lib/cn';
import { paths } from '../../../routes/paths';

// --- Mock Data ---
const CATEGORIES = [
  { label: 'Electronics', value: 'electronics' },
  { label: 'Clothing', value: 'clothing' },
  { label: 'Home & Garden', value: 'home' },
  { label: 'Sports', value: 'sports' }
];

const BRANDS = [
  { label: 'ZoneVast Basics', value: 'zonevast' },
  { label: 'TechCore', value: 'techcore' },
  { label: 'LuxeLife', value: 'luxelife' }
];

const ATTRIBUTE_TYPES = [
  { label: 'Size', value: 'Size' },
  { label: 'Color', value: 'Color' },
  { label: 'Material', value: 'Material' },
  { label: 'Style', value: 'Style' }
];

// --- Types ---
interface Attribute {
  id: string;
  name: string;
  values: string[];
}

interface Variant {
  id: string;
  name: string;
  sku: string;
  price: string;
  stock: number;
}

interface FormData {
  // Step 1
  name: string;
  sku: string;
  category: string;
  brand: string;
  description: string;
  shortDescription: string;
  
  // Step 2
  hasVariants: boolean;
  basePrice: string;
  costPrice: string;
  comparePrice: string;
  taxClass: string;
  stock: number;
  stockStatus: string;
  attributes: Attribute[];
  variants: Variant[];

  // Step 3
  images: string[]; // URLs or base64
  metaTitle: string;
  metaDescription: string;
  tags: string[];
  status: 'Draft' | 'Active' | 'Archived';
}

const STEPS = [
  { id: 1, title: 'Basic Information', desc: 'Product identity & categorization', icon: FileText },
  { id: 2, title: 'Pricing & Inventory', desc: 'Variants, costs & stock levels', icon: DollarSign },
  { id: 3, title: 'Media & SEO', desc: 'Images, tags & search visibility', icon: ImageIcon },
];

export const AddProductWizard = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [tagInput, setTagInput] = useState('');
  const [attrInput, setAttrInput] = useState<Record<string, string>>({}); // Helper for attribute value inputs

  const [formData, setFormData] = useState<FormData>({
    name: '',
    sku: '',
    category: '',
    brand: '',
    description: '',
    shortDescription: '',
    hasVariants: false,
    basePrice: '',
    costPrice: '',
    comparePrice: '',
    taxClass: 'Standard',
    stock: 0,
    stockStatus: 'In Stock',
    attributes: [],
    variants: [],
    images: [],
    metaTitle: '',
    metaDescription: '',
    tags: [],
    status: 'Draft'
  });

  // --- Helpers ---

  const generateSku = () => {
    const prefix = formData.category ? formData.category.substring(0, 3).toUpperCase() : 'PRD';
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    updateField('sku', `${prefix}-${random}`);
  };

  const updateField = (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateStep = (step: number) => {
    if (step === 1) {
      return formData.name.trim() !== '' && formData.category !== '';
    }
    if (step === 2) {
      if (formData.hasVariants) {
        return formData.attributes.length > 0;
      }
      return formData.basePrice !== '';
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 3));
    } else {
      // Could add toast here
      alert("Please fill in all required fields.");
    }
  };

  const handleBack = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  // --- Variant Logic ---

  const addAttribute = () => {
    const newAttr: Attribute = {
      id: `attr_${Date.now()}`,
      name: 'Size',
      values: []
    };
    updateField('attributes', [...formData.attributes, newAttr]);
  };

  const removeAttribute = (id: string) => {
    updateField('attributes', formData.attributes.filter(a => a.id !== id));
  };

  const addAttributeValue = (attrId: string, value: string) => {
    if (!value.trim()) return;
    const updatedAttrs = formData.attributes.map(a => {
      if (a.id === attrId && !a.values.includes(value)) {
        return { ...a, values: [...a.values, value] };
      }
      return a;
    });
    updateField('attributes', updatedAttrs);
    setAttrInput({ ...attrInput, [attrId]: '' });
    
    // Regenerate variants (simplified logic: just Cartesian product if needed, 
    // but for now let's keep variants empty until explicitly generated or simplistic add)
  };

  const removeAttributeValue = (attrId: string, value: string) => {
    const updatedAttrs = formData.attributes.map(a => {
      if (a.id === attrId) {
        return { ...a, values: a.values.filter(v => v !== value) };
      }
      return a;
    });
    updateField('attributes', updatedAttrs);
  };

  const generateVariants = () => {
    // Simplified variant generation based on first attribute for demo
    if (formData.attributes.length === 0) return;
    
    // In a real app, calculate cartesian product of all attribute values
    const primaryAttr = formData.attributes[0]; 
    const newVariants: Variant[] = primaryAttr.values.map((val, idx) => ({
      id: `var_${idx}`,
      name: `${primaryAttr.name}: ${val}`,
      sku: `${formData.sku || 'SKU'}-${val.toUpperCase()}`,
      price: formData.basePrice,
      stock: 10
    }));
    
    updateField('variants', newVariants);
  };

  // --- Tag Logic ---
  const addTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      if (!formData.tags.includes(tagInput.trim())) {
        updateField('tags', [...formData.tags, tagInput.trim()]);
      }
      setTagInput('');
    }
  };

  const removeTag = (tag: string) => {
    updateField('tags', formData.tags.filter(t => t !== tag));
  };

  return (
    <div className="animate-fade-up max-w-6xl mx-auto py-6 space-y-8">
      
      {/* Top Navigation */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-6">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 bg-white/5 rounded-sm hover:bg-white/10 text-zinc-muted transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-black text-zinc-text uppercase italic tracking-tighter">Add Product</h1>
            <p className="text-[10px] font-black text-zinc-muted uppercase tracking-[0.3em] mt-1">Create New Catalog Item</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <AmberButton variant="ghost" size="sm">Save Draft</AmberButton>
          {currentStep === 3 ? (
            <AmberButton size="sm" onClick={() => navigate(paths.catalog)}>
              <Save className="w-4 h-4 mr-2" /> Publish Product
            </AmberButton>
          ) : (
            <AmberButton size="sm" onClick={handleNext}>
              Next Step <ChevronRight className="w-4 h-4 ml-2" />
            </AmberButton>
          )}
        </div>
      </div>

      {/* Stepper */}
      <div className="grid grid-cols-3 gap-4 relative">
        <div className="absolute top-1/2 left-0 w-full h-0.5 bg-white/5 -z-10 -translate-y-1/2 rounded-full" />
        {STEPS.map((step, idx) => {
          const isActive = currentStep === step.id;
          const isCompleted = currentStep > step.id;
          
          return (
            <div key={step.id} className="flex flex-col items-center gap-3 relative group cursor-default">
              <div className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all z-10",
                isActive ? "bg-brand text-obsidian-outer border-brand scale-110 shadow-[0_0_20px_rgba(255,192,0,0.3)]" : 
                isCompleted ? "bg-success text-obsidian-outer border-success" : 
                "bg-obsidian-outer border-white/10 text-zinc-muted"
              )}>
                {isCompleted ? <Check className="w-5 h-5" /> : <step.icon className="w-5 h-5" />}
              </div>
              <div className="text-center">
                <p className={cn("text-[10px] font-black uppercase tracking-widest mb-0.5", isActive ? "text-brand" : isCompleted ? "text-success" : "text-zinc-muted")}>
                  Step 0{step.id}
                </p>
                <p className={cn("text-xs font-bold", isActive ? "text-zinc-text" : "text-zinc-secondary")}>{step.title}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Content Area */}
      <div className="min-h-[500px]">
        
        {/* STEP 1: BASIC INFO */}
        {currentStep === 1 && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-right-4 duration-300">
            <AmberCard className="lg:col-span-2 p-6 space-y-6" glass>
              <div className="flex items-center gap-2 pb-2 border-b border-white/5 mb-2">
                <Type className="w-4 h-4 text-brand" />
                <h3 className="text-xs font-black text-zinc-text uppercase tracking-widest">Product Details</h3>
              </div>
              
              <div className="space-y-5">
                <AmberInput 
                  label="Product Name" 
                  placeholder="e.g. Wireless Noise-Cancelling Headphones"
                  value={formData.name}
                  onChange={(e) => updateField('name', e.target.value)}
                  required
                />
                
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-zinc-muted uppercase tracking-widest px-1">Description</label>
                  {/* Rich Text Toolbar Simulation */}
                  <div className="w-full bg-obsidian-outer border border-white/5 rounded-sm overflow-hidden focus-within:border-brand/30 transition-all">
                    <div className="flex items-center gap-1 p-2 border-b border-white/5 bg-white/[0.02]">
                      {['B', 'I', 'U', 'List', 'Link'].map(tool => (
                        <button key={tool} className="w-6 h-6 flex items-center justify-center text-[10px] font-bold text-zinc-muted hover:bg-white/5 hover:text-zinc-text rounded-sm">
                          {tool.charAt(0)}
                        </button>
                      ))}
                    </div>
                    <textarea 
                      rows={8}
                      className="w-full bg-transparent p-4 text-xs font-medium text-zinc-text outline-none resize-none placeholder:text-zinc-muted/40"
                      placeholder="Detailed product description..."
                      value={formData.description}
                      onChange={(e) => updateField('description', e.target.value)}
                    />
                  </div>
                </div>

                <AmberInput 
                  label="Short Description" 
                  placeholder="Summary for list views (max 150 chars)"
                  value={formData.shortDescription}
                  onChange={(e) => updateField('shortDescription', e.target.value)}
                  multiline
                  rows={2}
                />
              </div>
            </AmberCard>

            <div className="space-y-6">
              <AmberCard className="p-6 space-y-5">
                <div className="flex items-center gap-2 pb-2 border-b border-white/5 mb-2">
                  <Layers className="w-4 h-4 text-info" />
                  <h3 className="text-xs font-black text-zinc-text uppercase tracking-widest">Organization</h3>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-zinc-muted uppercase tracking-widest px-1">Category <span className="text-brand">*</span></label>
                    <AmberAutocomplete 
                      options={CATEGORIES}
                      value={formData.category}
                      onChange={(val) => updateField('category', val)}
                      placeholder="Select Category..."
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-zinc-muted uppercase tracking-widest px-1">Brand</label>
                    <AmberDropdown 
                      options={BRANDS}
                      value={formData.brand}
                      onChange={(val) => updateField('brand', val)}
                      className="w-full"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-zinc-muted uppercase tracking-widest px-1">SKU</label>
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        value={formData.sku}
                        onChange={(e) => updateField('sku', e.target.value)}
                        placeholder="Generate or enter..."
                        className="flex-1 h-10 bg-obsidian-outer border border-white/5 rounded-sm px-3 text-xs font-bold text-zinc-text outline-none focus:border-brand/30 uppercase"
                      />
                      <button 
                        onClick={generateSku}
                        className="px-3 bg-white/5 border border-white/10 rounded-sm text-zinc-muted hover:text-zinc-text hover:bg-white/10 transition-all"
                        title="Generate Random SKU"
                      >
                        <RefreshCw className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </AmberCard>
            </div>
          </div>
        )}

        {/* STEP 2: PRICING & INVENTORY */}
        {currentStep === 2 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <AmberCard className="p-6">
              <div className="flex items-center justify-between pb-4 border-b border-white/5 mb-6">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-success" />
                  <h3 className="text-xs font-black text-zinc-text uppercase tracking-widest">Base Pricing</h3>
                </div>
                <div className="flex items-center gap-3">
                  <label className="text-[10px] font-bold text-zinc-muted uppercase">Taxable Product</label>
                  <button className="w-8 h-4 rounded-full bg-brand relative"><div className="absolute right-0.5 top-0.5 w-3 h-3 bg-obsidian-outer rounded-full" /></button>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <AmberInput 
                  label="Selling Price" 
                  icon={<span className="text-zinc-muted font-bold">$</span>}
                  type="number"
                  value={formData.basePrice}
                  onChange={(e) => updateField('basePrice', e.target.value)}
                  placeholder="0.00"
                />
                <AmberInput 
                  label="Compare At Price" 
                  icon={<span className="text-zinc-muted font-bold">$</span>}
                  type="number"
                  value={formData.comparePrice}
                  onChange={(e) => updateField('comparePrice', e.target.value)}
                  placeholder="0.00"
                />
                <AmberInput 
                  label="Cost Price" 
                  icon={<span className="text-zinc-muted font-bold">$</span>}
                  type="number"
                  value={formData.costPrice}
                  onChange={(e) => updateField('costPrice', e.target.value)}
                  placeholder="0.00"
                />
              </div>
            </AmberCard>

            <AmberCard className="p-6">
              <div className="flex items-center justify-between pb-4 border-b border-white/5 mb-6">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-warning" />
                  <h3 className="text-xs font-black text-zinc-text uppercase tracking-widest">Product Variants</h3>
                </div>
                <button 
                  onClick={() => updateField('hasVariants', !formData.hasVariants)}
                  className={cn(
                    "flex items-center gap-2 px-3 py-1.5 rounded-sm border transition-all",
                    formData.hasVariants ? "bg-brand/10 border-brand/30 text-brand" : "bg-obsidian-outer border-white/10 text-zinc-muted"
                  )}
                >
                  {formData.hasVariants ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                  <span className="text-[9px] font-black uppercase tracking-widest">Enable Variants</span>
                </button>
              </div>

              {!formData.hasVariants ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <AmberInput 
                    label="Stock Quantity"
                    type="number"
                    value={formData.stock}
                    onChange={(e) => updateField('stock', parseInt(e.target.value) || 0)}
                  />
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-zinc-muted uppercase tracking-widest px-1">Stock Status</label>
                    <AmberDropdown 
                      options={[{label: 'In Stock', value: 'In Stock'}, {label: 'Out of Stock', value: 'Out of Stock'}, {label: 'Backorder', value: 'Backorder'}]}
                      value={formData.stockStatus}
                      onChange={(val) => updateField('stockStatus', val)}
                      className="w-full"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Attribute Builder */}
                  <div className="space-y-4">
                    {formData.attributes.map((attr, idx) => (
                      <div key={attr.id} className="p-4 bg-obsidian-outer/50 border border-white/5 rounded-sm">
                        <div className="flex items-end gap-4 mb-4">
                          <div className="w-48">
                            <label className="text-[9px] font-black text-zinc-muted uppercase tracking-widest mb-1 block">Option Name</label>
                            <AmberAutocomplete 
                              options={ATTRIBUTE_TYPES}
                              value={attr.name}
                              onChange={(val) => {
                                const newAttrs = [...formData.attributes];
                                newAttrs[idx].name = val;
                                updateField('attributes', newAttrs);
                              }}
                            />
                          </div>
                          <div className="flex-1">
                            <label className="text-[9px] font-black text-zinc-muted uppercase tracking-widest mb-1 block">Option Values</label>
                            <div className="flex gap-2">
                              <input 
                                type="text"
                                placeholder="Type value & Enter (e.g., Red, Small)"
                                className="flex-1 h-10 bg-obsidian-panel border border-white/5 rounded-sm px-3 text-xs text-zinc-text outline-none focus:border-brand/30"
                                value={attrInput[attr.id] || ''}
                                onChange={(e) => setAttrInput({...attrInput, [attr.id]: e.target.value})}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    e.preventDefault();
                                    addAttributeValue(attr.id, attrInput[attr.id]);
                                  }
                                }}
                              />
                            </div>
                          </div>
                          <button onClick={() => removeAttribute(attr.id)} className="p-2.5 bg-white/5 rounded-sm text-zinc-muted hover:text-danger hover:bg-danger/10 transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {attr.values.map(val => (
                            <span key={val} className="inline-flex items-center gap-1.5 px-2 py-1 bg-white/5 border border-white/5 rounded-sm text-[10px] font-bold text-zinc-text">
                              {val}
                              <button onClick={() => removeAttributeValue(attr.id, val)} className="hover:text-danger"><X className="w-3 h-3" /></button>
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                    <AmberButton variant="secondary" size="sm" onClick={addAttribute}>
                      <Plus className="w-3.5 h-3.5 mr-2" /> Add Another Option
                    </AmberButton>
                  </div>

                  {/* Generated Variants Preview */}
                  {formData.attributes.length > 0 && formData.attributes[0].values.length > 0 && (
                    <div className="pt-6 border-t border-white/5">
                      <div className="flex justify-between items-end mb-4">
                        <h4 className="text-[10px] font-black text-zinc-text uppercase tracking-widest">Preview Variants</h4>
                        <button onClick={generateVariants} className="text-[9px] font-bold text-brand hover:underline uppercase tracking-widest">Generate Configurations</button>
                      </div>
                      <div className="overflow-x-auto border border-white/5 rounded-sm">
                        <table className="w-full text-left">
                          <thead className="bg-white/5">
                            <tr>
                              <th className="px-4 py-2 text-[9px] font-black text-zinc-muted uppercase">Variant</th>
                              <th className="px-4 py-2 text-[9px] font-black text-zinc-muted uppercase">Price</th>
                              <th className="px-4 py-2 text-[9px] font-black text-zinc-muted uppercase">Stock</th>
                              <th className="px-4 py-2 text-[9px] font-black text-zinc-muted uppercase">SKU</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-white/5">
                            {formData.variants.length > 0 ? formData.variants.map((v) => (
                              <tr key={v.id}>
                                <td className="px-4 py-2 text-xs font-bold text-zinc-text">{v.name}</td>
                                <td className="px-4 py-2"><input type="text" defaultValue={v.price} className="w-20 bg-transparent border-b border-white/10 text-xs text-zinc-text outline-none focus:border-brand" /></td>
                                <td className="px-4 py-2"><input type="number" defaultValue={v.stock} className="w-16 bg-transparent border-b border-white/10 text-xs text-zinc-text outline-none focus:border-brand" /></td>
                                <td className="px-4 py-2"><input type="text" defaultValue={v.sku} className="w-32 bg-transparent border-b border-white/10 text-xs text-zinc-text outline-none focus:border-brand font-mono" /></td>
                              </tr>
                            )) : (
                              <tr><td colSpan={4} className="px-4 py-8 text-center text-zinc-muted text-[10px] italic">Click Generate to create variants based on attributes.</td></tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </AmberCard>
          </div>
        )}

        {/* STEP 3: MEDIA & SEO */}
        {currentStep === 3 && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="lg:col-span-2 space-y-6">
              <AmberCard className="p-6">
                <div className="flex items-center gap-2 pb-2 border-b border-white/5 mb-4">
                  <ImageIcon className="w-4 h-4 text-info" />
                  <h3 className="text-xs font-black text-zinc-text uppercase tracking-widest">Media Gallery</h3>
                </div>
                
                <div className="border-2 border-dashed border-white/10 rounded-lg p-8 flex flex-col items-center justify-center text-center hover:bg-white/[0.02] hover:border-brand/30 transition-all cursor-pointer group bg-obsidian-outer/20 min-h-[200px]">
                  <div className="w-12 h-12 rounded-full bg-obsidian-outer border border-white/10 flex items-center justify-center mb-3 group-hover:scale-110 group-hover:border-brand/30 transition-all">
                    <UploadCloud className="w-5 h-5 text-zinc-muted group-hover:text-brand transition-colors" />
                  </div>
                  <p className="text-xs font-bold text-zinc-text uppercase tracking-tight">Drag & drop product images</p>
                  <p className="text-[9px] font-bold text-zinc-muted uppercase tracking-widest mt-1">or click to browse files</p>
                </div>

                {/* Mock Image List */}
                <div className="grid grid-cols-4 gap-4 mt-6">
                  {[1, 2].map((i) => (
                    <div key={i} className="aspect-square bg-obsidian-outer rounded-sm border border-white/5 relative group">
                      <div className="absolute inset-0 flex items-center justify-center text-[9px] font-black text-zinc-muted uppercase tracking-widest">Img {i}</div>
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <button className="p-1.5 bg-white/10 rounded-full hover:bg-brand hover:text-black"><MoreVertical className="w-3 h-3" /></button>
                        <button className="p-1.5 bg-white/10 rounded-full hover:bg-danger hover:text-white"><Trash2 className="w-3 h-3" /></button>
                      </div>
                    </div>
                  ))}
                </div>
              </AmberCard>

              <AmberCard className="p-6">
                <div className="flex items-center gap-2 pb-2 border-b border-white/5 mb-4">
                  <Search className="w-4 h-4 text-brand" />
                  <h3 className="text-xs font-black text-zinc-text uppercase tracking-widest">Search Engine Optimization</h3>
                </div>
                
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <div className="flex justify-between">
                      <label className="text-[9px] font-black text-zinc-muted uppercase tracking-widest px-1">Meta Title</label>
                      <span className="text-[9px] font-bold text-zinc-muted">{formData.metaTitle.length} / 60</span>
                    </div>
                    <AmberInput 
                      placeholder="Product Page Title"
                      value={formData.metaTitle}
                      onChange={(e) => updateField('metaTitle', e.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex justify-between">
                      <label className="text-[9px] font-black text-zinc-muted uppercase tracking-widest px-1">Meta Description</label>
                      <span className="text-[9px] font-bold text-zinc-muted">{formData.metaDescription.length} / 160</span>
                    </div>
                    <textarea 
                      rows={3}
                      className="w-full bg-obsidian-outer border border-white/5 rounded-sm p-3 text-xs font-medium text-zinc-text outline-none resize-none focus:border-brand/30"
                      placeholder="Brief description for search results..."
                      value={formData.metaDescription}
                      onChange={(e) => updateField('metaDescription', e.target.value)}
                    />
                  </div>
                  
                  {/* SEO Preview */}
                  <div className="p-4 bg-obsidian-outer/50 border border-white/5 rounded-sm mt-2">
                    <p className="text-[10px] font-bold text-zinc-muted uppercase tracking-widest mb-2">Search Preview</p>
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-brand truncate">{formData.metaTitle || formData.name || 'Product Title'}</p>
                      <p className="text-[10px] text-success">https://store.zonevast.com/products/{formData.name.toLowerCase().replace(/\s+/g, '-')}</p>
                      <p className="text-[11px] text-zinc-secondary line-clamp-2">{formData.metaDescription || formData.description || 'Product description will appear here...'}</p>
                    </div>
                  </div>
                </div>
              </AmberCard>
            </div>

            <div className="space-y-6">
              <AmberCard className="p-6 space-y-5">
                <div className="flex items-center gap-2 pb-2 border-b border-white/5 mb-2">
                  <Tag className="w-4 h-4 text-brand" />
                  <h3 className="text-xs font-black text-zinc-text uppercase tracking-widest">Organization</h3>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-zinc-muted uppercase tracking-widest px-1">Visibility</label>
                  <AmberDropdown 
                    options={[{label: 'Draft', value: 'Draft'}, {label: 'Active', value: 'Active'}, {label: 'Archived', value: 'Archived'}]}
                    value={formData.status}
                    onChange={(val) => updateField('status', val)}
                    className="w-full"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-zinc-muted uppercase tracking-widest px-1">Product Tags</label>
                  <div className="w-full bg-obsidian-outer border border-white/5 rounded-sm p-2 flex flex-wrap gap-2 min-h-[80px] focus-within:border-brand/30 transition-all">
                    {formData.tags.map(tag => (
                      <span key={tag} className="inline-flex items-center gap-1.5 px-2 py-1 bg-white/5 border border-white/5 rounded-sm text-[10px] font-bold text-zinc-text animate-in fade-in zoom-in duration-200">
                        {tag} 
                        <button onClick={() => removeTag(tag)} className="hover:text-danger transition-colors"><X className="w-3 h-3" /></button>
                      </span>
                    ))}
                    <input 
                      type="text" 
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={addTag}
                      placeholder="Type tag & Enter..."
                      className="bg-transparent border-none outline-none text-[10px] font-bold text-zinc-text flex-1 min-w-[80px] placeholder:text-zinc-muted/40"
                    />
                  </div>
                </div>
              </AmberCard>
              
              <div className="p-4 rounded-sm border border-brand/20 bg-brand/5">
                <div className="flex gap-3">
                  <AlertCircle className="w-5 h-5 text-brand shrink-0" />
                  <div>
                    <h4 className="text-[10px] font-black text-brand uppercase tracking-widest mb-1">Pre-flight Check</h4>
                    <p className="text-[9px] text-zinc-muted leading-relaxed">Ensure all variant pricing is final before publishing. Mass updates can be done later via CSV import.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Bottom Actions */}
      <div className="flex justify-between items-center pt-6 border-t border-white/5">
        <AmberButton variant="ghost" disabled={currentStep === 1} onClick={handleBack}>
          Back
        </AmberButton>
        <div className="flex gap-3">
          <AmberButton variant="outline" className="border-white/10 text-zinc-muted hover:text-zinc-text">Cancel</AmberButton>
          {currentStep === 3 ? (
            <AmberButton onClick={() => navigate(paths.catalog)}>Publish Product</AmberButton>
          ) : (
            <AmberButton onClick={handleNext}>Continue to Next Step</AmberButton>
          )}
        </div>
      </div>
    </div>
  );
};