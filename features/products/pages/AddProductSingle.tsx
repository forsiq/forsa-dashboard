
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
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
  RefreshCw,
  MoreVertical,
  CheckCircle2,
  Box
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
  name: string;
  sku: string;
  category: string;
  brand: string;
  description: string;
  shortDescription: string;
  hasVariants: boolean;
  basePrice: string;
  costPrice: string;
  comparePrice: string;
  taxClass: string;
  stock: number;
  stockStatus: string;
  attributes: Attribute[];
  variants: Variant[];
  images: string[];
  metaTitle: string;
  metaDescription: string;
  tags: string[];
  status: 'Draft' | 'Active' | 'Archived';
}

export const AddProductSingle = () => {
  const navigate = useNavigate();
  const [tagInput, setTagInput] = useState('');
  const [attrInput, setAttrInput] = useState<Record<string, string>>({});

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
    status: 'Active'
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
    if (formData.attributes.length === 0) return;
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
    <div className="animate-fade-up max-w-[1600px] mx-auto py-6 space-y-8">
      
      {/* Header Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-6">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 bg-white/5 rounded-sm hover:bg-white/10 text-zinc-muted transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-black text-zinc-text uppercase italic tracking-tighter">Add Product</h1>
            <p className="text-[10px] font-black text-zinc-muted uppercase tracking-[0.3em] mt-1">Single View Editor</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <AmberButton variant="ghost" size="sm">Discard</AmberButton>
          <AmberButton size="sm" onClick={() => navigate(paths.catalog)}>
            <Save className="w-4 h-4 mr-2" /> Publish Product
          </AmberButton>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* Left Column - Main Content */}
        <div className="xl:col-span-2 space-y-8">
          
          {/* General Info */}
          <AmberCard className="p-6 space-y-6" glass>
            <div className="flex items-center gap-2 pb-2 border-b border-white/5 mb-2">
                <FileText className="w-4 h-4 text-brand" />
                <h3 className="text-xs font-black text-zinc-text uppercase tracking-widest">General Information</h3>
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
                  <div className="w-full bg-obsidian-outer border border-white/5 rounded-sm overflow-hidden focus-within:border-brand/30 transition-all">
                    <div className="flex items-center gap-1 p-2 border-b border-white/5 bg-white/[0.02]">
                      {['B', 'I', 'U', 'List'].map(tool => (
                        <button key={tool} className="w-6 h-6 flex items-center justify-center text-[10px] font-bold text-zinc-muted hover:bg-white/5 hover:text-zinc-text rounded-sm">
                          {tool.charAt(0)}
                        </button>
                      ))}
                    </div>
                    <textarea 
                      rows={6}
                      className="w-full bg-transparent p-4 text-xs font-medium text-zinc-text outline-none resize-none placeholder:text-zinc-muted/40"
                      placeholder="Detailed product description..."
                      value={formData.description}
                      onChange={(e) => updateField('description', e.target.value)}
                    />
                  </div>
                </div>
            </div>
          </AmberCard>

          {/* Media */}
          <AmberCard className="p-6 space-y-6">
            <div className="flex items-center gap-2 pb-2 border-b border-white/5 mb-2">
                <ImageIcon className="w-4 h-4 text-info" />
                <h3 className="text-xs font-black text-zinc-text uppercase tracking-widest">Media</h3>
            </div>
            <div className="border-2 border-dashed border-white/10 rounded-lg p-8 flex flex-col items-center justify-center text-center hover:bg-white/[0.02] hover:border-brand/30 transition-all cursor-pointer group bg-obsidian-outer/20 min-h-[150px]">
                <div className="w-10 h-10 rounded-full bg-obsidian-outer border border-white/10 flex items-center justify-center mb-3 group-hover:scale-110 group-hover:border-brand/30 transition-all">
                <UploadCloud className="w-5 h-5 text-zinc-muted group-hover:text-brand transition-colors" />
                </div>
                <p className="text-xs font-bold text-zinc-text uppercase tracking-tight">Click to upload or drag and drop</p>
            </div>
            <div className="grid grid-cols-4 gap-4">
                {[1, 2].map((i) => (
                <div key={i} className="aspect-square bg-obsidian-outer rounded-sm border border-white/5 relative group">
                    <div className="absolute inset-0 flex items-center justify-center text-[9px] font-black text-zinc-muted uppercase tracking-widest">Img {i}</div>
                    <div className="absolute top-1 right-1 p-1 bg-black/50 rounded-sm opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-white hover:bg-danger">
                        <Trash2 className="w-3 h-3" />
                    </div>
                </div>
                ))}
            </div>
          </AmberCard>

          {/* Pricing & Inventory */}
          <AmberCard className="p-6 space-y-6">
            <div className="flex items-center gap-2 pb-2 border-b border-white/5 mb-2">
                <DollarSign className="w-4 h-4 text-success" />
                <h3 className="text-xs font-black text-zinc-text uppercase tracking-widest">Pricing</h3>
            </div>
            <div className="grid grid-cols-3 gap-6">
                <AmberInput 
                  label="Price" 
                  icon={<span className="text-zinc-muted">$</span>}
                  type="number"
                  value={formData.basePrice}
                  onChange={(e) => updateField('basePrice', e.target.value)}
                />
                <AmberInput 
                  label="Compare At" 
                  icon={<span className="text-zinc-muted">$</span>}
                  type="number"
                  value={formData.comparePrice}
                  onChange={(e) => updateField('comparePrice', e.target.value)}
                />
                <AmberInput 
                  label="Cost per Item" 
                  icon={<span className="text-zinc-muted">$</span>}
                  type="number"
                  value={formData.costPrice}
                  onChange={(e) => updateField('costPrice', e.target.value)}
                />
            </div>
            
            <div className="pt-4 border-t border-white/5">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xs font-black text-zinc-text uppercase tracking-widest flex items-center gap-2">
                        <Box className="w-4 h-4 text-warning" /> Inventory & Variants
                    </h3>
                    <button 
                        onClick={() => updateField('hasVariants', !formData.hasVariants)}
                        className={cn(
                            "flex items-center gap-2 px-3 py-1.5 rounded-sm border transition-all",
                            formData.hasVariants ? "bg-brand/10 border-brand/30 text-brand" : "bg-obsidian-outer border-white/10 text-zinc-muted"
                        )}
                    >
                        {formData.hasVariants ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                        <span className="text-[9px] font-black uppercase tracking-widest">Variants</span>
                    </button>
                </div>

                {!formData.hasVariants ? (
                    <div className="grid grid-cols-2 gap-6">
                        <AmberInput 
                            label="SKU (Stock Keeping Unit)" 
                            value={formData.sku}
                            onChange={(e) => updateField('sku', e.target.value)}
                            rightElement={<button onClick={generateSku} className="p-1 hover:text-brand"><RefreshCw className="w-3 h-3" /></button>}
                        />
                        <AmberInput 
                            label="Stock Quantity"
                            type="number"
                            value={formData.stock}
                            onChange={(e) => updateField('stock', parseInt(e.target.value))}
                        />
                    </div>
                ) : (
                    <div className="space-y-4 bg-obsidian-outer/30 p-4 rounded-sm border border-white/5">
                        {formData.attributes.map((attr, idx) => (
                            <div key={attr.id} className="space-y-2">
                                <div className="flex gap-4">
                                    <div className="w-1/3">
                                        <AmberAutocomplete 
                                            placeholder="Option Name"
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
                                        <input 
                                            type="text"
                                            placeholder="Values (comma separated or enter)"
                                            className="w-full h-10 bg-obsidian-panel border border-white/5 rounded-sm px-3 text-xs text-zinc-text outline-none focus:border-brand/30"
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
                                    <button onClick={() => removeAttribute(attr.id)} className="p-2 text-zinc-muted hover:text-danger"><Trash2 className="w-4 h-4" /></button>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {attr.values.map(val => (
                                        <span key={val} className="inline-flex items-center gap-1 bg-white/5 px-2 py-1 rounded-sm text-[10px] font-bold">
                                            {val} <button onClick={() => removeAttributeValue(attr.id, val)}><X className="w-3 h-3" /></button>
                                        </span>
                                    ))}
                                </div>
                            </div>
                        ))}
                        <AmberButton variant="ghost" size="sm" onClick={addAttribute} className="w-full border border-dashed border-white/10">
                            + Add Option
                        </AmberButton>
                        {formData.attributes.length > 0 && (
                            <div className="pt-2">
                                <AmberButton size="sm" onClick={generateVariants} className="w-full">Generate Variant Combinations</AmberButton>
                            </div>
                        )}
                        {formData.variants.length > 0 && (
                            <div className="mt-4 border border-white/5 rounded-sm overflow-hidden">
                                <table className="w-full text-left">
                                    <thead className="bg-white/5 text-[9px] font-black uppercase text-zinc-muted">
                                        <tr>
                                            <th className="px-3 py-2">Variant</th>
                                            <th className="px-3 py-2">Price</th>
                                            <th className="px-3 py-2">Stock</th>
                                            <th className="px-3 py-2">SKU</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5 text-xs font-medium">
                                        {formData.variants.map(v => (
                                            <tr key={v.id}>
                                                <td className="px-3 py-2">{v.name}</td>
                                                <td className="px-3 py-2 text-zinc-muted">{v.price}</td>
                                                <td className="px-3 py-2 text-zinc-muted">{v.stock}</td>
                                                <td className="px-3 py-2 font-mono text-[10px]">{v.sku}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}
            </div>
          </AmberCard>

          {/* Search Engine Optimization */}
          <AmberCard className="p-6 space-y-6">
             <div className="flex items-center gap-2 pb-2 border-b border-white/5 mb-2">
                <Search className="w-4 h-4 text-brand" />
                <h3 className="text-xs font-black text-zinc-text uppercase tracking-widest">Search Engine Optimization</h3>
             </div>
             <div className="space-y-4">
                <div className="space-y-1.5">
                    <div className="flex justify-between">
                      <label className="text-[9px] font-black text-zinc-muted uppercase tracking-widest px-1">Page Title</label>
                      <span className="text-[9px] font-bold text-zinc-muted">{formData.metaTitle.length} / 70</span>
                    </div>
                    <AmberInput 
                      placeholder={formData.name || "Product Page Title"}
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
             </div>
          </AmberCard>
        </div>

        {/* Right Column - Organization & Status (Sticky) */}
        <div className="xl:col-span-1 space-y-6">
           <AmberCard className="p-6 space-y-5 sticky top-24">
              <div className="flex items-center gap-2 pb-2 border-b border-white/5 mb-2">
                 <CheckCircle2 className="w-4 h-4 text-success" />
                 <h3 className="text-xs font-black text-zinc-text uppercase tracking-widest">Status</h3>
              </div>
              <AmberDropdown 
                 label="Availability"
                 options={[{label: 'Active', value: 'Active'}, {label: 'Draft', value: 'Draft'}, {label: 'Archived', value: 'Archived'}]}
                 value={formData.status}
                 onChange={(val) => updateField('status', val)}
                 className="w-full"
              />
              
              <div className="pt-4 border-t border-white/5">
                 <div className="flex items-center gap-2 pb-2 mb-2">
                    <Layers className="w-4 h-4 text-brand" />
                    <h3 className="text-xs font-black text-zinc-text uppercase tracking-widest">Organization</h3>
                 </div>
                 <div className="space-y-4">
                    <div className="space-y-1.5">
                        <label className="text-[9px] font-black text-zinc-muted uppercase tracking-widest px-1">Category</label>
                        <AmberAutocomplete 
                            options={CATEGORIES}
                            value={formData.category}
                            onChange={(val) => updateField('category', val)}
                            placeholder="Search..."
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
                        <label className="text-[9px] font-black text-zinc-muted uppercase tracking-widest px-1">Tags</label>
                        <div className="w-full bg-obsidian-outer border border-white/5 rounded-sm p-2 flex flex-wrap gap-2 min-h-[40px] focus-within:border-brand/30 transition-all">
                            {formData.tags.map(tag => (
                            <span key={tag} className="inline-flex items-center gap-1.5 px-2 py-1 bg-white/5 border border-white/5 rounded-sm text-[10px] font-bold text-zinc-text">
                                {tag} 
                                <button onClick={() => removeTag(tag)} className="hover:text-danger transition-colors"><X className="w-3 h-3" /></button>
                            </span>
                            ))}
                            <input 
                            type="text" 
                            value={tagInput}
                            onChange={(e) => setTagInput(e.target.value)}
                            onKeyDown={addTag}
                            placeholder="Add tags..."
                            className="bg-transparent border-none outline-none text-[10px] font-bold text-zinc-text flex-1 min-w-[60px] placeholder:text-zinc-muted/40"
                            />
                        </div>
                    </div>
                 </div>
              </div>
           </AmberCard>
        </div>

      </div>
    </div>
  );
};
