import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { AmberCard as Card } from '../../../core/components/AmberCard';
import { AmberButton } from '../../../core/components/AmberButton';
import { AmberAvatar } from '../../../core/components/AmberAvatar';
import { cn } from '../../../core/lib/utils/cn';
import { useLanguage } from '../../../core/contexts/LanguageContext';
import { 
  Building2, 
  Mail, 
  Phone, 
  MapPin, 
  Edit3, 
  History, 
  CreditCard, 
  ArrowLeft,
  Loader2,
  Calendar,
  Globe
} from 'lucide-react';
import { useGetCustomer } from '../hooks';
import { StatusBadge } from '../../../core/components/Data/StatusBadge';

export function CustomerDetailPage() {
  const { t, dir } = useLanguage();
  const router = useRouter();
  const { id } = router.query;
  const isRTL = dir === 'rtl';
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const { data: customer, isLoading, error } = useGetCustomer((id as string) || '');

  if (!isClient) return null;

  if (isLoading || !router.isReady) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-10 h-10 animate-spin text-[var(--color-brand)]" />
      </div>
    );
  }

  if (error || !customer) {
    return (
      <div className="p-12 text-center space-y-4">
        <p className="text-[var(--color-danger)] font-black uppercase tracking-widest">
          {t('customer.error_not_found') || 'IDENTITY NOT FOUND IN REGISTRY'}
        </p>
        <AmberButton variant="outline" onClick={() => router.push('/customers')}>
          {t('customer.back_to_list') || 'Return to Registry'}
        </AmberButton>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-6 max-w-[1600px] mx-auto animate-in fade-in duration-700" dir={dir}>
      {/* Dynamic Header */}
      <div className={cn(
        "flex flex-col sm:flex-row sm:items-start justify-between gap-6",
        isRTL ? "text-right" : "text-left"
      )}>
        <div className="flex items-start gap-6">
          <AmberButton 
            variant="ghost" 
            onClick={() => router.push('/customers')} 
            className="group p-2.5 h-11 w-11 border-[var(--color-border)] rounded-xl hover:bg-[var(--color-obsidian-hover)]"
          >
             <ArrowLeft className={cn("w-5 h-5 transition-transform group-hover:-translate-x-1", isRTL && "rotate-180 group-hover:translate-x-1")} />
          </AmberButton>
          
          <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
            <AmberAvatar 
              src={customer.avatar} 
              fallback={customer.name} 
              size="xl" 
              className="ring-4 ring-[var(--color-brand)]/20 shadow-2xl"
            />
            <div className="space-y-2 text-center md:text-left">
              <div className="flex items-center gap-3 justify-center md:justify-start">
                <h1 className="text-4xl font-black text-zinc-text tracking-tight leading-tight uppercase">
                  {customer.name}
                </h1>
                <StatusBadge 
                  status={(customer.status || 'unknown').toUpperCase()} 
                  variant={customer.status === 'active' ? 'success' : 'inactive'}
                  className="h-6 px-3"
                />
              </div>
              <p className="text-base text-zinc-secondary font-bold flex items-center gap-2 justify-center md:justify-start opacity-70">
                <Building2 className="w-4 h-4 text-[var(--color-brand)]" />
                {customer.company || 'INDEPENDENT OPERATOR'}
              </p>
            </div>
          </div>
        </div>
        
        <Link href={`/customers/${id}/edit`}>
          <AmberButton className="gap-2 px-8 h-11 bg-[var(--color-brand)] hover:bg-[var(--color-brand)] text-black font-bold rounded-xl shadow-sm transition-all border-none active:scale-95">
            <Edit3 className="w-4 h-4" />
            <span>{t('customer.modify_identity') || 'Modify Identity'}</span>
          </AmberButton>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Core Stats / Data */}
        <div className="lg:col-span-2 space-y-8">
          {/* Detailed Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-6 bg-[var(--color-obsidian-card)] border border-[var(--color-border)] relative overflow-hidden group">
               <div className="flex items-center gap-4 relative z-10">
                 <div className="p-3 rounded-xl bg-[var(--color-brand)]/10 text-[var(--color-brand)]">
                    <Mail className="w-5 h-5" />
                 </div>
                 <div className="space-y-1">
                    <span className="text-[10px] font-black text-zinc-muted uppercase tracking-[0.2em]">{t('customer.email') || 'Comms Channel'}</span>
                    <p className="text-sm font-bold text-zinc-text">{customer.email}</p>
                 </div>
               </div>
            </Card>

            <Card className="p-6 bg-[var(--color-obsidian-card)] border border-[var(--color-border)] relative overflow-hidden group">
               <div className="flex items-center gap-4 relative z-10">
                 <div className="p-3 rounded-xl bg-[var(--color-info)]/10 text-[var(--color-info)]">
                    <Phone className="w-5 h-5" />
                 </div>
                 <div className="space-y-1">
                    <span className="text-[10px] font-black text-zinc-muted uppercase tracking-[0.2em]">{t('customer.phone') || 'Mobile Frequency'}</span>
                    <p className="text-sm font-bold text-zinc-text">{customer.phone || 'N/A'}</p>
                 </div>
               </div>
            </Card>

            <Card className="p-6 bg-[var(--color-obsidian-card)] border border-[var(--color-border)] relative overflow-hidden group">
               <div className="flex items-center gap-4 relative z-10">
                 <div className="p-3 rounded-xl bg-[var(--color-warning)]/10 text-[var(--color-warning)]">
                    <Calendar className="w-5 h-5" />
                 </div>
                 <div className="space-y-1">
                    <span className="text-[10px] font-black text-zinc-muted uppercase tracking-[0.2em]">{t('customer.registered') || 'Node Initialization'}</span>
                    <p className="text-sm font-bold text-zinc-text">
                      {customer.createdAt ? new Date(customer.createdAt).toLocaleDateString() : 'UNKNOWN'}
                    </p>
                 </div>
               </div>
            </Card>

            <Card className="p-6 bg-[var(--color-obsidian-card)] border border-[var(--color-border)] relative overflow-hidden group">
               <div className="flex items-center gap-4 relative z-10">
                 <div className="p-3 rounded-xl bg-purple-500/10 text-purple-400">
                    <Globe className="w-5 h-5" />
                 </div>
                 <div className="space-y-1">
                    <span className="text-[10px] font-black text-zinc-muted uppercase tracking-[0.2em]">{t('customer.timezone') || 'Temporal Zone'}</span>
                    <p className="text-sm font-bold text-zinc-text">GMT +3 (Bahrain)</p>
                 </div>
               </div>
            </Card>
          </div>

          {/* Spatial Matrix */}
          <Card className="p-8 bg-[var(--color-obsidian-card)] border border-[var(--color-border)] rounded-2xl relative overflow-hidden">
             <div className="flex items-center gap-3 mb-8 border-b border-[var(--color-border)] pb-6">
                <MapPin className="w-5 h-5 text-[var(--color-brand)]" />
                <h3 className="text-sm font-black text-zinc-text uppercase tracking-widest">{t('customer.spatial_matrix') || 'Geospatial Matrix'}</h3>
             </div>
             <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
                <div className="space-y-1">
                   <span className="text-[10px] font-black text-zinc-muted uppercase tracking-widest">{t('customer.street') || 'Address'}</span>
                   <p className="text-sm font-bold text-zinc-text line-clamp-1">{customer.address?.street || '-'}</p>
                </div>
                <div className="space-y-1">
                   <span className="text-[10px] font-black text-zinc-muted uppercase tracking-widest">{t('customer.city') || 'Hub'}</span>
                   <p className="text-sm font-bold text-zinc-text">{customer.address?.city || '-'}</p>
                </div>
                <div className="space-y-1">
                   <span className="text-[10px] font-black text-zinc-muted uppercase tracking-widest">{t('customer.country') || 'Sovereign'}</span>
                   <p className="text-sm font-bold text-zinc-text">{customer.address?.country || '-'}</p>
                </div>
             </div>
          </Card>
        </div>

        {/* Sidebar Intelligence */}
        <div className="space-y-8">
           {/* Transactional Insights */}
           <Card className="p-8 bg-obsidian-outer border border-[var(--color-border)] rounded-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--color-brand)]/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-[var(--color-brand)]/10 transition-colors" />
              <div className="flex items-center gap-3 mb-8 pb-4 border-b border-white/5">
                <CreditCard className="w-5 h-5 text-[var(--color-brand)]" />
                <h3 className="text-sm font-black text-zinc-text uppercase tracking-widest">Market Intelligence</h3>
              </div>
              
              <div className="space-y-6">
                 <div className="flex justify-between items-end">
                    <span className="text-xs font-bold text-zinc-muted uppercase">Thread Volume</span>
                    <span className="text-2xl font-black text-zinc-text tabular-nums italic leading-none">{customer.totalOrders || 0}</span>
                 </div>
                 <div className="flex justify-between items-end">
                    <span className="text-xs font-bold text-zinc-muted uppercase">Total Expenditure</span>
                    <span className="text-2xl font-black text-[var(--color-brand)] tabular-nums italic leading-none">BHD {(customer.totalSpent || 0).toLocaleString()}</span>
                 </div>
                 <div className="flex justify-between items-end">
                    <span className="text-xs font-bold text-zinc-muted uppercase">Reliability Index</span>
                    <span className="text-2xl font-black text-[var(--color-success)] tabular-nums italic leading-none">98.4%</span>
                 </div>
              </div>
           </Card>

           {/* Quick Actions */}
           <Card className="p-8 bg-[var(--color-obsidian-card)] border border-[var(--color-border)] rounded-2xl space-y-4">
              <h3 className="text-sm font-black text-zinc-text uppercase tracking-widest mb-2">Protocol Actions</h3>
              <AmberButton variant="outline" className="w-full justify-start gap-4 h-12 border-white/5 hover:bg-white/5 rounded-xl font-bold text-zinc-text">
                 <History className="w-4 h-4 text-zinc-muted" />
                 View Audit Logs
              </AmberButton>
              <AmberButton variant="outline" className="w-full justify-start gap-4 h-12 border-white/5 hover:bg-white/5 rounded-xl font-bold text-zinc-text">
                 <CreditCard className="w-4 h-4 text-zinc-muted" />
                 Transaction Snapshot
              </AmberButton>
           </Card>
        </div>
      </div>
    </div>
  );
}

export default CustomerDetailPage;
