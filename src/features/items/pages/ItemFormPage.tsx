import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
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
import { useGetItem, useCreateItemMutation } from '../hooks/useItems';
import type { Item, ItemStatus } from '../types';

/**
 * ItemFormPage - Universal Form for Creating/Editing Items
 */
export const ItemFormPage: React.FC = () => {
  const { t, dir } = useLanguage();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;

  const { data: existingItem, isLoading: itemLoading } = useGetItem(id || '');
  const createMutation = useCreateItemMutation({
    onSuccess: () => navigate('/items')
  });

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
    if (!formData.name?.trim()) newErrors.name = 'Name is required';
    if (!formData.category) newErrors.category = 'Category is required';
    if (!formData.startingBid || formData.startingBid <= 0) newErrors.startingBid = 'Bid must be > 0';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    
    createMutation.mutate(formData);
  };

  if (isEdit && itemLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-brand" />
      </div>
    );
  }

  return (
    <div className="space-y-8 p-6 max-w-[1200px] mx-auto animate-in fade-in duration-700" dir={dir}>
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
                    {isEdit ? 'Modify Asset' : 'Initialize Asset'}
                </h1>
                <p className="text-sm text-zinc-secondary font-bold">
                    {isEdit ? 'Update metadata for system node ' + id : 'Phase 1: Configure new inventory unit'}
                </p>
             </div>
          </div>
        </div>
        <Link to="/items">
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
              <h2 className="text-xl font-black text-zinc-text uppercase tracking-tighter italic">Basic Specifications</h2>
            </div>

            <div className="space-y-6">
              <AmberInput 
                label="Item Designation"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="e.g., Quantum Processor V2"
                error={errors.name}
                required
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-[10px] font-black text-zinc-muted uppercase tracking-widest mb-2 px-1 italic">
                        Classification Category
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
                    label="Serial Access Key (SKU)"
                    value={formData.sku}
                    onChange={(e) => handleChange('sku', e.target.value)}
                    placeholder="SY-NODE-999"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-zinc-muted uppercase tracking-widest mb-2 px-1 italic">
                    Technical Abstract (Description)
                </label>
                <textarea 
                  value={formData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  className="w-full bg-obsidian-outer border border-border rounded-xl p-4 text-sm text-zinc-text placeholder:text-zinc-muted/30 min-h-[120px] focus:outline-none focus:border-brand/30 transition-all font-bold italic"
                  placeholder="Detail the item characteristics and origin..."
                />
              </div>
            </div>
          </Card>

          <Card className="!p-8 bg-obsidian-card border-border">
            <div className="flex items-center gap-3 mb-8 border-b border-border pb-4">
              <DollarSign className="w-5 h-5 text-brand" />
              <h2 className="text-xl font-black text-zinc-text uppercase tracking-tighter italic">Financial Protocol</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <AmberInput 
                  label="Baseline Bid (USD)"
                  type="number"
                  value={formData.startingBid}
                  onChange={(e) => handleChange('startingBid', Number(e.target.value))}
                  icon={<DollarSign className="w-4 h-4" />}
                  error={errors.startingBid}
                  required
               />
               <div>
                    <label className="block text-[10px] font-black text-zinc-muted uppercase tracking-widest mb-2 px-1 italic">
                        Network Status
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
              <h2 className="text-xl font-black text-zinc-text uppercase tracking-tighter italic">Technical Dimensions</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
               <AmberInput 
                  label="Dimensions"
                  placeholder="12 x 8 x 4 in"
                  icon={<Maximize className="w-4 h-4" />}
               />
               <AmberInput 
                  label="Net Weight"
                  placeholder="2.5 kg"
                  icon={<Scale className="w-4 h-4" />}
               />
               <AmberInput 
                  label="Origin Source"
                  placeholder="Switzerland"
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
              <h3 className="text-[10px] font-black text-zinc-muted uppercase tracking-[0.2em] italic">Actions</h3>
            </div>
            
            <AmberButton 
              type="submit" 
              className="w-full py-6 bg-brand hover:bg-brand text-black font-black uppercase tracking-widest flex items-center justify-center gap-3 shadow-lg"
              disabled={createMutation.isPending}
            >
              {createMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
              {isEdit ? 'Overwrite Node' : 'Deploy Asset'}
            </AmberButton>
            
            <Link to="/items">
              <AmberButton variant="outline" className="w-full mt-4 h-12 border-border font-bold">
                Abort
              </AmberButton>
            </Link>
          </Card>

          <Card className="!p-6 bg-obsidian-card border-border">
            <div className="flex items-center gap-3 mb-6">
               <Box className="w-4 h-4 text-brand" />
               <h3 className="text-[10px] font-black text-zinc-muted uppercase tracking-[0.2em] italic">Visual Identity</h3>
            </div>

            <div className="space-y-4">
              <label className="block text-[10px] font-black text-zinc-muted uppercase tracking-[0.2em] mb-2 px-1 italic">
                 Asset Visualization
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
               <span className="text-[10px] font-black uppercase tracking-widest italic">Deployment Strategy</span>
             </div>
             <p className="text-xs font-bold text-zinc-muted italic leading-relaxed">
               Ensure all technical specifications are audited before deployment. High-value assets require full origin documentation.
             </p>
          </Card>
        </div>
      </form>
    </div>
  );
};

export default ItemFormPage;
