import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { AmberCard as Card } from '../../../core/components/AmberCard';
import { AmberButton } from '../../../core/components/AmberButton';
import { AmberInput } from '../../../core/components/AmberInput';
import { AmberDropdown } from '../../../core/components/AmberDropdown';
import { AmberAvatar } from '../../../core/components/AmberAvatar';
import { cn } from '../../../core/lib/utils/cn';
import { useLanguage } from '../../../core/contexts/LanguageContext';
import {
  User,
  Save,
  ArrowLeft,
  Loader2,
  AlertCircle,
  Building2,
  Mail,
  Phone,
  MapPin,
  ShieldCheck,
  UserPlus
} from 'lucide-react';
import { useGetCustomer, useCreateCustomer, useUpdateCustomer } from '../hooks';
import type { Customer } from '../types';

interface CustomerForm {
  name: string;
  email: string;
  phone: string;
  company: string;
  type: 'individual' | 'business';
  status: 'active' | 'inactive';
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
}

const INITIAL_FORM: CustomerForm = {
  name: '',
  email: '',
  phone: '',
  company: '',
  type: 'individual',
  status: 'active',
  address: {
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
  },
};

export function CustomerFormPage() {
  const { t, dir } = useLanguage();
  const router = useRouter();
  const { id } = router.query;
  const isEditMode = !!id && id !== 'new';
  const isRTL = dir === 'rtl';
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const [formData, setFormData] = useState<CustomerForm>(INITIAL_FORM);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { data: customer, isLoading: isFetching } = useGetCustomer((id as string) || '', isEditMode);

  const createMutation = useCreateCustomer();
  const updateMutation = useUpdateCustomer();

  const handleSubmit = async () => {
    if (!validate()) return;

    try {
      if (isEditMode) {
        await updateMutation.mutateAsync({ id: id as string, ...formData } as any);
        router.push(`/customers/${id}`);
      } else {
        await createMutation.mutateAsync(formData as any);
        router.push('/customers');
      }
    } catch (error) {
      console.error('Failed to save customer:', error);
    }
  };

  useEffect(() => {
    if (customer && isEditMode) {
      setFormData({
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        company: customer.company || '',
        type: customer.type as 'individual' | 'business',
        status: customer.status as 'active' | 'inactive',
        address: {
          street: customer.address?.street || '',
          city: customer.address?.city || '',
          state: customer.address?.state || '',
          zipCode: customer.address?.zipCode || '',
          country: customer.address?.country || '',
        },
      });
    }
  }, [customer, isEditMode]);

  const handleChange = (field: string, value: any) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...(prev as any)[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
    
    if (errors[field]) {
      const newErrors = { ...errors };
      delete newErrors[field];
      setErrors(newErrors);
    }
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!formData.name) e.name = t('error.required_fields') || 'Entity name required';
    if (!formData.email) e.email = t('error.required_fields') || 'Primary email required';

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  if (!isClient) return null;

  if (isEditMode && (isFetching || !router.isReady)) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-10 h-10 animate-spin text-[var(--color-brand)]" />
      </div>
    );
  }

  return (
    <div className="space-y-8 p-6 max-w-[1600px] mx-auto animate-in fade-in duration-700" dir={dir}>
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
              {isEditMode ? t('customer.edit') || 'Modify Node' : t('customer.add_new') || 'Initialize Node'}
            </h1>
            <p className="text-base text-zinc-secondary font-bold opacity-70">
              {isEditMode ? "Updating existing identity matrix" : "Broadcasting new regional account into registry"}
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
                {t('common.saving') || 'Syncing...'}
              </span>
            ) : (
              <>
                <Save className={cn("w-4 h-4", isRTL ? "ml-2" : "mr-2")} />
                {isEditMode ? t('common.save') || 'Commit' : t('common.create') || 'Deploy'}
              </>
            )}
          </AmberButton>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-8">
          {/* Identity Block */}
          <Card className="p-8 bg-[var(--color-obsidian-card)] border border-[var(--color-border)] rounded-2xl shadow-sm relative overflow-visible">
            <div className="flex items-center gap-3 mb-8 border-b border-[var(--color-border)] pb-6 relative z-10">
               <User className="w-5 h-5 text-[var(--color-brand)]" />
               <h3 className="text-sm font-black text-zinc-text uppercase tracking-widest">
                  {t('customer.identity_matrix') || 'Identity Matrix Specifications'}
               </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 relative z-10">
              <div className="md:col-span-2">
                <AmberInput
                  label={t('customer.name') || 'اسم العميل'}
                  value={formData.name}
                  onChange={e => handleChange('name', e.target.value)}
                  error={errors.name}
                  placeholder={t('customer.name') || 'اسم العميل'}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className={cn("text-[9px] font-black text-zinc-muted uppercase tracking-widest block px-1", isRTL ? "text-right" : "text-left")}>
                  {t('customer.type') || 'نوع العميل'}
                </label>
                <AmberDropdown 
                  options={[
                    { label: t('customer.individual') || 'عميل فردي', value: 'individual' },
                    { label: t('customer.business') || 'شركة', value: 'business' },
                  ]}
                  value={formData.type}
                  onChange={val => handleChange('type', val)}
                  className="w-full h-11"
                />
              </div>

              <AmberInput
                label={t('customer.company') || 'Organizational Umbrella'}
                value={formData.company}
                onChange={e => handleChange('company', e.target.value)}
                placeholder="N/A"
                disabled={formData.type === 'individual'}
              />

              <AmberInput
                label={t('customer.email') || 'Primary Comms Hook'}
                type="email"
                value={formData.email}
                onChange={e => handleChange('email', e.target.value)}
                error={errors.email}
                placeholder="nexus@protocol.io"
                required
              />

              <AmberInput
                label={t('customer.phone') || 'Mobile Frequency'}
                value={formData.phone}
                onChange={e => handleChange('phone', e.target.value)}
                placeholder="+00 0000 000 000"
              />
            </div>
          </Card>

          {/* Spatial Block */}
          <Card className="p-8 bg-[var(--color-obsidian-card)] border border-[var(--color-border)] rounded-2xl shadow-sm relative overflow-visible">
            <div className="flex items-center gap-3 mb-8 border-b border-[var(--color-border)] pb-6 relative z-10">
               <MapPin className="w-5 h-5 text-[var(--color-info)]" />
               <h3 className="text-sm font-black text-zinc-text uppercase tracking-widest">
                  {t('customer.spatial_matrix') || 'Geospatial Coordinates'}
               </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 relative z-10">
              <div className="md:col-span-2">
                <AmberInput
                  label={t('customer.address.street') || 'Vector Address'}
                  value={formData.address.street}
                  onChange={e => handleChange('address.street', e.target.value)}
                  placeholder="Sector-7, Cyber-Valley 101"
                />
              </div>

              <AmberInput
                label={t('customer.address.city') || 'Regional Hub'}
                value={formData.address.city}
                onChange={e => handleChange('address.city', e.target.value)}
                placeholder="Neo-Bahrain"
              />

              <AmberInput
                label={t('customer.address.state') || 'Administrative Zone'}
                value={formData.address.state}
                onChange={e => handleChange('address.state', e.target.value)}
                placeholder="ME-SOUTH-1"
              />

              <AmberInput
                label={t('customer.address.zip') || 'Grid Code'}
                value={formData.address.zipCode}
                onChange={e => handleChange('address.zipCode', e.target.value)}
                placeholder="00000"
              />

              <AmberInput
                label={t('customer.address.country') || 'Territorial Sovereign'}
                value={formData.address.country}
                onChange={e => handleChange('address.country', e.target.value)}
                placeholder="Kingdom of Bahrain"
              />
            </div>
          </Card>
        </div>

        {/* Sidebar / Logic */}
        <div className="lg:col-span-1 space-y-6">
          {/* Protocol State */}
          <Card className="p-8 bg-[var(--color-obsidian-card)] border border-[var(--color-border)] relative overflow-hidden rounded-2xl shadow-sm">
            <h3 className="text-sm font-black text-zinc-text tracking-widest mb-6 border-b border-[var(--color-border)] pb-4">
               {t('customer.protocol_state') || 'Protocol Integrity'}
            </h3>

            <div className="space-y-6">
              <div className="space-y-3">
                <label className={cn("text-xs font-black text-zinc-secondary uppercase tracking-[0.2em] block italic", isRTL ? "text-right" : "text-left")}>
                   {t('common.status') || 'Operational Status'}
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => handleChange('status', 'active')}
                    className={cn(
                      "h-12 rounded-xl border flex items-center justify-center gap-2 font-black uppercase text-xs tracking-widest transition-all",
                      formData.status === 'active' 
                        ? "bg-[var(--color-success)]/20 border-[var(--color-success)] text-[var(--color-success)] shadow-lg"
                        : "bg-white/[0.02] border-[var(--color-border)] text-zinc-muted hover:bg-[var(--color-obsidian-hover)]"
                    )}
                  >
                    <ShieldCheck className="w-4 h-4" />
                    {t('status.active') || 'Online'}
                  </button>
                  <button
                    onClick={() => handleChange('status', 'inactive')}
                    className={cn(
                      "h-12 rounded-xl border flex items-center justify-center gap-2 font-black uppercase text-xs tracking-widest transition-all",
                      formData.status === 'inactive' 
                        ? "bg-[var(--color-danger)]/20 border-[var(--color-danger)] text-[var(--color-danger)] shadow-lg"
                        : "bg-white/[0.02] border-[var(--color-border)] text-zinc-muted hover:bg-[var(--color-obsidian-hover)]"
                    )}
                  >
                    <AlertCircle className="w-4 h-4" />
                    {t('status.inactive') || 'Offline'}
                  </button>
                </div>
              </div>

              {/* Avatar Visualization */}
              <div className="pt-6 border-t border-[var(--color-border)]">
                 <div className="flex flex-col items-center gap-4 p-6 bg-obsidian-outer rounded-2xl border border-[var(--color-border)]">
                   <AmberAvatar fallback={formData.name || '?'} size="xl" className="ring-4 ring-[var(--color-brand)]/20 shadow-2xl" />
                   <div className="text-center">
                     <p className="text-xs font-bold text-zinc-muted">{formData.name || t('customer.name') || 'اسم العميل'}</p>
                   </div>
                 </div>
              </div>
            </div>
          </Card>

          {/* Validation Reminder */}
          <Card className="p-6 border-[var(--color-brand)]/20 bg-[var(--color-brand)]/[0.03] rounded-2xl relative overflow-hidden group">
             <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--color-brand)]/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-[var(--color-brand)]/10 transition-colors" />
             <div className="flex items-start gap-4 relative z-10">
                <UserPlus className="w-5 h-5 text-[var(--color-brand)] shrink-0" />
                <div className="space-y-1">
                   <h4 className="text-sm font-black text-[var(--color-brand)] uppercase tracking-widest">{t('customer.form_note_title') || 'ملاحظة'}</h4>
                   <p className="text-xs font-medium text-zinc-muted leading-relaxed">
                      {t('customer.form_note_desc') || 'تأكد من صحة جميع البيانات قبل الحفظ.'}
                   </p>
                </div>
             </div>
          </Card>

        </div>
      </div>
    </div>
  );
}

export default CustomerFormPage;
