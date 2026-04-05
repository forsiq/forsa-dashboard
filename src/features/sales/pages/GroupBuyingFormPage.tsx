import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { 
  Users, 
  DollarSign, 
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
import { AmberDropdown } from '@core/components/AmberDropdown';
import { AmberImageUpload } from '@core/components/AmberImageUpload';
import { 
  useGetGroupBuying, 
  useCreateGroupBuying, 
  useUpdateGroupBuying 
} from '../graphql';
import { useList as useInventoryList } from '../../../services/inventory/hooks';

/**
 * GroupBuyingFormPage - Professional-grade Campaign Lifecycle Management
 */
export const GroupBuyingFormPage: React.FC = () => {
  const { t, dir } = useLanguage();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;
  const isRTL = dir === 'rtl';

  const { data: existingCampaign, isLoading: campaignLoading } = useGetGroupBuying(id || '', isEdit);
  const { data: inventoryData } = useInventoryList();
  const inventoryItems = (inventoryData as any)?.items || [];

  const createMutation = useCreateGroupBuying();
  const updateMutation = useUpdateGroupBuying();

  const [formData, setFormData] = useState({
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
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

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
    if (!formData.title?.trim()) newErrors.title = 'Protocol identifier required';
    if (!formData.productId) newErrors.productId = 'Asset node allocation required';
    if (!formData.startTime) newErrors.startTime = 'Deployment window required';
    if (!formData.endTime) newErrors.endTime = 'Termination window required';
    if (formData.dealPrice >= formData.originalPrice) newErrors.dealPrice = 'Consolidated price must be below base';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      const input = {
          ...formData,
          productId: Number(formData.productId),
          originalPrice: Number(formData.originalPrice),
          dealPrice: Number(formData.dealPrice),
          minParticipants: Number(formData.minParticipants),
          maxParticipants: Number(formData.maxParticipants),
          startTime: new Date(formData.startTime).toISOString(),
          endTime: new Date(formData.endTime).toISOString(),
      };

      if (isEdit) {
        await updateMutation.mutateAsync({ id, ...input });
      } else {
        await createMutation.mutateAsync(input);
      }
      navigate('/group-buying');
    } catch (err) {
      console.error('Campaign synchronization defect:', err);
    }
  };

  if (isEdit && campaignLoading) {
      return (
          <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
              <div className="w-16 h-16 border-4 border-brand border-t-transparent rounded-full animate-spin" />
              <p className="text-zinc-muted font-black uppercase tracking-[0.3em] italic animate-pulse">Syncing campaign node...</p>
          </div>
      );
  }

  const discount = formData.originalPrice > 0 
      ? Math.round((1 - formData.dealPrice / formData.originalPrice) * 100) 
      : 0;

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8 animate-in fade-in duration-700" dir={dir}>
      {/* Strategic Header Cluster */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <Link to="/group-buying">
             <AmberButton variant="secondary" className="p-0 w-12 h-12 rounded-xl flex items-center justify-center active:scale-95 transition-all bg-obsidian-card border-border shadow-lg">
                <ChevronLeft className={cn("w-5 h-5", isRTL && "rotate-180")} />
             </AmberButton>
          </Link>
          <div>
            <h1 className="text-3xl font-black text-zinc-text tracking-tighter uppercase italic leading-none">
              {isEdit ? 'Authorize Campaign Modification' : 'Initialize Asset Consolidation'}
            </h1>
            <p className="text-sm text-zinc-muted font-bold tracking-tight uppercase mt-1">
              {isEdit ? `Node Protocol ID: ${id}` : 'Configure multi-node participation and collective acquisition logic'}
            </p>
          </div>
        </div>
        <div className="flex gap-3">
           <AmberButton 
                variant="outline" 
                className="h-12 border-border font-bold rounded-xl px-6 hover:bg-obsidian-hover active:scale-95 transition-all uppercase italic text-xs tracking-widest"
                onClick={() => navigate('/group-buying')}
           >
                Abort Matrix
           </AmberButton>
           <AmberButton 
                className="h-12 bg-brand hover:bg-brand text-black font-black rounded-xl px-10 shadow-[0_10px_40px_rgba(245,196,81,0.1)] border-none active:scale-95 transition-all gap-3"
                onClick={handleSubmit}
                disabled={createMutation.isPending || updateMutation.isPending}
           >
                {(createMutation.isPending || updateMutation.isPending) ? (
                    <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                ) : (
                    <Save className="w-5 h-5" />
                )}
                <span className="uppercase italic tracking-widest">Execute Node Sync</span>
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
                   <h3 className="text-sm font-black text-zinc-text uppercase tracking-[0.25em] italic">Campaign Identification Node</h3>
                </div>

                <div className="space-y-7 relative pt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-3">
                             <label className="text-[10px] font-black text-zinc-muted uppercase tracking-[0.2em] px-1 italic">Asset Allocation Scan</label>
                             <AmberDropdown 
                                options={[
                                    { label: 'Manual Asset Protocol', value: '' },
                                    ...inventoryItems.map((item: any) => ({
                                        label: item.name,
                                        value: String(item.id)
                                    }))
                                ]}
                                value={String(formData.productId || '')}
                                onChange={(val) => handleChange('productId', val)}
                                className="h-12 w-full bg-obsidian-outer border-border rounded-xl"
                             />
                             {errors.productId && <p className="text-[10px] text-danger font-black uppercase italic px-1">{errors.productId}</p>}
                        </div>
                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-zinc-muted uppercase tracking-[0.2em] px-1 italic">Tactical Division</label>
                            <AmberDropdown 
                                options={[
                                    { label: 'General Consolidation', value: '1' },
                                    { label: 'Enterprise Acquisition', value: '2' },
                                    { label: 'Bulk Scaling Protocol', value: '3' },
                                ]}
                                value={formData.categoryId || '1'}
                                onChange={(val) => handleChange('categoryId', val)}
                                className="h-12 w-full bg-obsidian-outer border-border rounded-xl"
                            />
                        </div>
                    </div>

                    <AmberInput 
                        label="Campaign Protocol Nomenclature"
                        placeholder="Define listing identify..."
                        value={formData.title}
                        onChange={(e) => handleChange('title', e.target.value)}
                        error={errors.title}
                        className="h-12 italic"
                    />

                    <AmberInput 
                        label="Strategic Campaign Narrative"
                        placeholder="Elaborate on consolidation logic and asset advantages..."
                        value={formData.description}
                        onChange={(e) => handleChange('description', e.target.value)}
                        multiline
                        rows={6}
                        className="italic"
                    />
                </div>
            </Card>

            {/* Threshold & Participation Metrics */}
            <Card className="!p-8 bg-obsidian-card border-border shadow-2xl space-y-8">
                <div className="flex items-center gap-3 border-b border-white/[0.03] pb-6">
                   <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20 shadow-inner">
                      <Users className="w-5 h-5" />
                   </div>
                   <h3 className="text-sm font-black text-zinc-text uppercase tracking-[0.25em] italic">Reach & Participation thresholds</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <AmberInput 
                        label="Minimum Activation Reach"
                        type="number"
                        value={formData.minParticipants}
                        onChange={(e) => handleChange('minParticipants', Number(e.target.value))}
                        icon={<Zap className="w-4 h-4" />}
                        className="h-12 italic tabular-nums"
                    />
                    <AmberInput 
                        label="Maximum Node Capacity"
                        type="number"
                        value={formData.maxParticipants}
                        onChange={(e) => handleChange('maxParticipants', Number(e.target.value))}
                        icon={<Users className="w-4 h-4" />}
                        className="h-12 italic tabular-nums"
                    />
                </div>

                <div className="p-6 rounded-2xl bg-primary/[0.02] border border-primary/10 flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0 shadow-inner">
                         <Info className="w-5 h-5 text-primary" />
                    </div>
                    <div className="space-y-1">
                        <p className="text-xs font-black text-primary uppercase italic tracking-widest">Reach Protocol Insight</p>
                        <p className="text-[11px] text-zinc-muted font-bold tracking-tight uppercase">Minmum reach is required for campaign activation. Scaling beyond node capacity triggers automatic asset reallocation.</p>
                    </div>
                </div>
            </Card>
        </div>

        {/* Temporal & Fiscal Logistics */}
        <div className="space-y-8">
            {/* Value Logic Matrix */}
            <Card className="!p-8 bg-obsidian-card border-border shadow-2xl space-y-7 h-fit">
                <div className="flex items-center gap-3 border-b border-white/[0.03] pb-6">
                   <div className="w-11 h-11 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/20 shadow-inner">
                      <Calculator className="w-5 h-5" />
                   </div>
                   <h3 className="text-sm font-black text-zinc-text uppercase tracking-[0.25em] italic">Fiscal Optimization</h3>
                </div>
                
                <div className="space-y-6">
                    <AmberInput 
                        label="Asset Base Premium ($)"
                        type="number"
                        value={formData.originalPrice}
                        onChange={(e) => handleChange('originalPrice', Number(e.target.value))}
                        icon={<DollarSign className="w-4 h-4" />}
                        className="h-12 italic tabular-nums"
                    />
                    <AmberInput 
                        label="Consolidated Deal Price ($)"
                        type="number"
                        value={formData.dealPrice}
                        onChange={(e) => handleChange('dealPrice', Number(e.target.value))}
                        icon={<TrendingDown className="w-4 h-4" />}
                        error={errors.dealPrice}
                        className="h-12 italic tabular-nums"
                    />

                    <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between shadow-inner">
                         <p className="text-[11px] font-black text-emerald-400 uppercase italic">Applied Scalability Discount</p>
                         <span className="text-3xl font-black text-emerald-400 italic tabular-nums tracking-tighter leading-none">{discount}%</span>
                    </div>
                </div>
            </Card>

            {/* Deployment Spectrum Control */}
            <Card className="!p-8 bg-obsidian-card border-border shadow-2xl space-y-7 h-fit">
                <div className="flex items-center gap-3 border-b border-white/[0.03] pb-6">
                   <div className="w-11 h-11 rounded-xl bg-warning/10 flex items-center justify-center text-warning border border-warning/20 shadow-inner">
                      <Clock className="w-5 h-5" />
                   </div>
                   <h3 className="text-sm font-black text-zinc-text uppercase tracking-[0.25em] italic">Temporal Spectrum</h3>
                </div>
                <div className="space-y-6">
                    <AmberInput 
                        label="Node Initialization start"
                        type="datetime-local"
                        value={formData.startTime}
                        onChange={(e) => handleChange('startTime', e.target.value)}
                        icon={<Calendar className="w-4 h-4" />}
                        error={errors.startTime}
                        className="h-12 italic"
                    />
                    <AmberInput 
                        label="Protocol Termination Window"
                        type="datetime-local"
                        value={formData.endTime}
                        onChange={(e) => handleChange('endTime', e.target.value)}
                        icon={<Clock className="w-4 h-4" />}
                        error={errors.endTime}
                        className="h-12 italic"
                    />
                </div>
                {/* Dynamic Duration Logic Mask */}
                <div className="p-6 rounded-2xl bg-obsidian-panel/60 border border-white/5 space-y-4 shadow-inner">
                     <div className="flex items-center justify-between text-[11px] font-black uppercase tracking-widest">
                         <span className="text-zinc-muted italic">Campaign cycle duration</span>
                         <span className="text-brand tabular-nums shadow-sm">Calculating...</span>
                     </div>
                     <div className="h-1.5 bg-white/[0.05] rounded-full overflow-hidden shadow-inner">
                         <div className="h-full bg-brand w-[45%] shadow-[0_0_10px_rgba(245,196,81,0.5)]" />
                     </div>
                </div>
            </Card>

            {/* Strategy Control Node */}
            <div className="space-y-4">
                <AmberButton 
                    className="w-full h-16 bg-brand hover:bg-brand text-black font-black uppercase tracking-[0.3em] italic rounded-[2rem] shadow-[0_15px_50px_rgba(245,196,81,0.15)] active:scale-95 transition-all text-sm group"
                    onClick={handleSubmit}
                    disabled={createMutation.isPending || updateMutation.isPending}
                >
                    <span className="group-hover:tracking-[0.4em] transition-all duration-500">Commence Protocol Execution</span>
                </AmberButton>
                
                <AmberButton 
                    variant="secondary" 
                    className="w-full h-14 bg-obsidian-card font-black uppercase tracking-widest italic rounded-2xl border border-white/5 active:scale-95 transition-all opacity-80 hover:opacity-100"
                    onClick={() => navigate('/group-buying')}
                >
                    Discard Configuration
                </AmberButton>
            </div>
        </div>
      </form>
    </div>
  );
};

export default GroupBuyingFormPage;
