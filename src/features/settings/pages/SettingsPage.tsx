import React, { useState } from 'react';
import { 
  Settings, 
  Settings2, 
  CreditCard, 
  Truck, 
  Gavel, 
  Save, 
  Bell, 
  Shield, 
  Globe, 
  Smartphone,
  CheckCircle,
  AlertCircle,
  Info,
  Loader2
} from 'lucide-react';
import { AmberCard as Card } from '@core/components/AmberCard';
import { AmberButton } from '@core/components/AmberButton';
import { AmberInput } from '@core/components/AmberInput';
import { AmberDropdown } from '@core/components/AmberDropdown';
import { useLanguage } from '@core/contexts/LanguageContext';
import { cn } from '@core/lib/utils/cn';

// --- Types ---

type TabId = 'general' | 'auction' | 'payments' | 'shipping' | 'notifications';

interface Tab {
  id: TabId;
  label: string;
  icon: React.ElementType;
}

export const SettingsPage = () => {
  const { t, dir } = useLanguage();
  const [activeTab, setActiveTab] = useState<TabId>('general');
  const [isSaving, setIsSaving] = useState(false);
  const [showSavedToast, setShowSavedToast] = useState(false);

  const isRTL = dir === 'rtl';

  const tabs: Tab[] = [
    { id: 'general', label: t('settings.general'), icon: Settings2 },
    { id: 'auction', label: t('settings.auction'), icon: Gavel },
    { id: 'payments', label: t('settings.payments'), icon: CreditCard },
    { id: 'shipping', label: t('settings.shipping'), icon: Truck },
    { id: 'notifications', label: t('settings.notifications'), icon: Bell },
  ];

  const handleSave = () => {
    setIsSaving(true);
    // Simulate API persistence
    setTimeout(() => {
      setIsSaving(false);
      setShowSavedToast(true);
      setTimeout(() => setShowSavedToast(false), 3000);
    }, 1200);
  };

  return (
    <div className="space-y-8 p-6 max-w-[1600px] mx-auto animate-in fade-in slide-in-from-bottom-2 duration-700" dir={dir}>
      {/* Page Header */}
      <div className={cn(
        "flex flex-col sm:flex-row sm:items-start justify-between gap-6",
        isRTL ? "text-right" : "text-left"
      )}>
        <div className="space-y-1">
          <h1 className="text-4xl font-black text-zinc-text tracking-tight leading-none">
            {t('settings.page.title')}
          </h1>
          <p className="text-base text-zinc-secondary font-bold">
            {t('settings.page.subtitle')}
          </p>
        </div>
        <div>
          <AmberButton
            size="sm"
            onClick={handleSave}
            disabled={isSaving}
            className="px-8 h-11 bg-[var(--color-brand)] hover:bg-[var(--color-brand)] text-black font-bold rounded-xl shadow-sm transition-all border-none active:scale-95"
          >
            {isSaving ? (
              <span className="flex items-center gap-2 text-black">
                <Loader2 className="w-4 h-4 animate-spin" />
                {t('common.saving')}
              </span>
            ) : (
              <>
                <Save className={cn("w-4 h-4 text-black", isRTL ? "ml-2" : "mr-2")} />
                <span className="text-black">{t('settings.save')}</span>
              </>
            )}
          </AmberButton>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Tab Sidebar */}
        <div className="lg:col-span-1 space-y-4">
          <Card className={cn("p-2 bg-[var(--color-obsidian-card)] border border-[var(--color-border)] rounded-2xl shadow-sm", isRTL ? "text-right" : "text-left")}>
            <nav className="space-y-1.5 font-cairo">
              {tabs.map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      "w-full flex items-center gap-3 px-5 py-3.5 rounded-xl transition-all duration-300 relative group overflow-hidden",
                      isActive 
                        ? "bg-[var(--color-brand)] text-black shadow-lg shadow-[var(--color-brand)]/10" 
                        : "text-zinc-muted hover:text-zinc-text hover:bg-[var(--color-obsidian-hover)] border border-transparent"
                    )}
                  >
                    <tab.icon className={cn("w-5 h-5 shrink-0 transition-transform group-hover:scale-110", isActive ? "text-black" : "text-zinc-muted")} />
                    <span className={cn("text-sm font-bold uppercase tracking-tight", isActive ? "text-black" : "text-zinc-muted")}>
                      {tab.label}
                    </span>
                  </button>
                );
              })}
            </nav>
          </Card>

          {/* Help Card */}
          <Card className="!p-6 bg-[var(--color-obsidian-card)] border border-[var(--color-border)] relative overflow-hidden group rounded-2xl shadow-sm">
            <div className="absolute top-0 right-0 w-24 h-24 bg-[var(--color-brand)]/10 rounded-full blur-2xl -mr-12 -mt-12 group-hover:bg-[var(--color-brand)]/20 transition-colors" />
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-[var(--color-brand)]/10 rounded-lg">
                <Info className="w-5 h-5 text-[var(--color-brand)]" />
              </div>
              <h4 className="text-sm font-black text-zinc-text uppercase tracking-widest">{t('settings.protocol_support')}</h4>
            </div>
            <p className="text-xs font-bold text-zinc-muted leading-relaxed uppercase italic">
              {t('settings.protocol_support_desc')}
            </p>
            <button className="mt-4 text-xs font-black text-[var(--color-brand)] uppercase tracking-widest hover:underline transition-all">
              {t('settings.documentation')} →
            </button>
          </Card>
        </div>

        {/* Tab Content */}
        <div className="lg:col-span-3 space-y-6">
          {activeTab === 'general' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
              <Card className="p-8 bg-[var(--color-obsidian-card)] border border-[var(--color-border)] rounded-2xl shadow-sm overflow-visible">
                <h3 className="text-sm font-black text-zinc-text uppercase tracking-[0.2em] mb-8 pb-4 border-b border-[var(--color-border)]">
                  {t('settings.instance_identity')}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <AmberInput label={t('settings.domain_display_name')} defaultValue="ZoneVast Neural Base" />
                  <AmberInput label={t('settings.technical_contact_email')} defaultValue="admin@zonevast.systems" />
                  <div className="space-y-2">
                    <label className={cn("text-xs font-bold text-zinc-secondary uppercase tracking-wider block", isRTL ? "text-right" : "text-left")}>
                      {t('settings.regional_locale')}
                    </label>
                    <AmberDropdown
                      options={[
                        { label: 'Global (EN-US)', value: 'en' },
                        { label: 'Middle East (AR-SA)', value: 'ar' },
                      ]}
                      value="en"
                      onChange={() => {}}
                      className="w-full h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className={cn("text-xs font-bold text-zinc-secondary uppercase tracking-wider block", isRTL ? "text-right" : "text-left")}>
                      {t('settings.base_currency_unit')}
                    </label>
                    <AmberDropdown
                      options={[
                        { label: 'Universal (USD)', value: 'usd' },
                        { label: 'Regional (SAR)', value: 'sar' },
                        { label: 'Regional (AED)', value: 'aed' },
                      ]}
                      value="usd"
                      onChange={() => {}}
                      className="w-full h-11"
                    />
                  </div>
                </div>
              </Card>

              <Card className="p-8 bg-[var(--color-obsidian-card)] border border-[var(--color-border)] rounded-2xl shadow-sm">
                <h3 className="text-sm font-black text-zinc-text uppercase tracking-[0.2em] mb-8 pb-4 border-b border-[var(--color-border)]">
                   {t('settings.system_diagnostics')}
                </h3>
                <div className="space-y-6">
                   <div className="flex items-center justify-between p-5 bg-[var(--color-obsidian-hover)]/30 border border-[var(--color-border)] rounded-xl">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-[var(--color-success)]/10 rounded-xl">
                          <Globe className="w-6 h-6 text-[var(--color-success)]" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-zinc-text uppercase tracking-tight">{t('settings.protocol_response')}</p>
                          <p className="text-xs font-medium text-zinc-secondary uppercase">{t('settings.protocol_latency')}</p>
                        </div>
                      </div>
                      <div className="h-2.5 w-2.5 rounded-full bg-[var(--color-success)] animate-pulse shadow-lg shadow-[var(--color-success)]/50" />
                   </div>
                   <div className="flex items-center justify-between p-5 bg-[var(--color-obsidian-hover)]/30 border border-[var(--color-border)] rounded-xl opacity-50 grayscale hover:grayscale-0 hover:opacity-100 transition-all">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-[var(--color-info)]/10 rounded-xl">
                          <Smartphone className="w-6 h-6 text-[var(--color-info)]" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-zinc-text uppercase tracking-tight">{t('settings.mobile_sync_protocol')}</p>
                          <p className="text-xs font-medium text-zinc-secondary uppercase">{t('settings.mobile_sync_version')}</p>
                        </div>
                      </div>
                      <div className="h-2.5 w-2.5 rounded-full bg-[var(--color-info)] shadow-lg shadow-[var(--color-info)]/50" />
                   </div>
                </div>
              </Card>
            </div>
          )}

          {activeTab === 'auction' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
               <Card className="p-8 bg-[var(--color-obsidian-card)] border border-[var(--color-border)] rounded-2xl shadow-sm overflow-visible">
                <h3 className="text-sm font-black text-zinc-text uppercase tracking-[0.2em] mb-8 pb-4 border-b border-[var(--color-border)]">
                  {t('settings.engine_calibration')}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <AmberInput label={t('settings.global_min_bid_increment')} type="number" defaultValue="50" rightElement={<span className="text-sm font-bold text-zinc-muted px-3">USD</span>} />
                  <AmberInput label={t('settings.anti_sniper_buffer')} type="number" defaultValue="30" rightElement={<span className="text-sm font-bold text-zinc-muted px-3">SEC</span>} />
                  <AmberInput label={t('settings.bid_cooldown_period')} type="number" defaultValue="5" rightElement={<span className="text-sm font-bold text-zinc-muted px-3">SEC</span>} />
                  <div className="space-y-2">
                    <label className={cn("text-xs font-bold text-zinc-secondary uppercase tracking-wider block", isRTL ? "text-right" : "text-left")}>
                      {t('settings.verification_requirement')}
                    </label>
                    <AmberDropdown
                      options={[
                        { label: 'Minimum (Email Only)', value: 'email' },
                        { label: 'Standard (Identity Sync)', value: 'id' },
                        { label: 'Bespoke (Manual Audit)', value: 'manual' },
                      ]}
                      value="id"
                      onChange={() => {}}
                      className="w-full h-11"
                    />
                  </div>
                </div>
              </Card>

              <Card className="!p-6 bg-[var(--color-danger)]/[0.03] border border-[var(--color-danger)]/20 rounded-2xl shadow-sm">
                <div className="flex items-start gap-5">
                   <div className="p-4 bg-[var(--color-danger)]/10 rounded-xl border border-[var(--color-danger)]/20">
                      <AlertCircle className="w-7 h-7 text-[var(--color-danger)]" />
                   </div>
                   <div className="space-y-2">
                       <h4 className="text-sm font-black text-[var(--color-danger)] uppercase tracking-widest italic">{t('settings.critical_safety')}</h4>
                       <p className="text-xs font-bold text-zinc-muted leading-relaxed uppercase italic">
                          {t('settings.critical_safety_desc')}
                       </p>
                       <button className="text-xs font-black text-[var(--color-danger)] uppercase tracking-widest border-b-2 border-[var(--color-danger)]/30 pb-0.5 hover:text-[var(--color-danger)] hover:border-[var(--color-danger)] transition-all mt-3">
                          {t('settings.request_sync_auth')}
                       </button>
                   </div>
                </div>
              </Card>
            </div>
          )}

          {activeTab === 'payments' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
               <Card className="p-8 bg-[var(--color-obsidian-card)] border border-[var(--color-border)] rounded-2xl shadow-sm overflow-visible">
                <h3 className="text-sm font-black text-zinc-text uppercase tracking-[0.2em] mb-8 pb-4 border-b border-[var(--color-border)]">
                  {t('settings.financial_bridge')}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className={cn("text-xs font-bold text-zinc-secondary uppercase tracking-wider block", isRTL ? "text-right" : "text-left")}>
                      {t('settings.active_gateway_profile')}
                    </label>
                    <AmberDropdown
                      options={[
                        { label: 'Node-Stripe v3', value: 'stripe' },
                        { label: 'Node-PayPal v2', value: 'paypal' },
                        { label: 'Custom Protocol (REST)', value: 'custom' },
                      ]}
                      value="stripe"
                      onChange={() => {}}
                      className="w-full h-11"
                    />
                  </div>
                  <AmberInput label={t('settings.global_protocol_fee')} type="number" defaultValue="2.5" />
                  <AmberInput label={t('settings.min_payout_threshold')} type="number" defaultValue="500" rightElement={<span className="text-sm font-bold text-zinc-muted px-3">USD</span>} />
                  <AmberInput label={t('settings.dispute_cooldown')} type="number" defaultValue="7" rightElement={<span className="text-sm font-bold text-zinc-muted px-3">DAYS</span>} />
                </div>
              </Card>
              
              <Card className="!p-6 bg-[var(--color-brand)]/[0.03] border border-[var(--color-brand)]/20 rounded-2xl shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-5">
                    <div className="p-3 bg-[var(--color-brand)]/20 rounded-xl shadow-lg shadow-[var(--color-brand)]/10">
                      <Shield className="w-6 h-6 text-[var(--color-brand)]" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-zinc-text uppercase tracking-tight">{t('settings.tls_encryption')}</p>
                      <p className="text-xs font-medium text-zinc-secondary uppercase italic tracking-tight">{t('settings.tls_encryption_desc')}</p>
                    </div>
                  </div>
                  <CheckCircle className="w-6 h-6 text-[var(--color-success)]" />
                </div>
              </Card>
            </div>
          )}

          {activeTab === 'shipping' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
               <Card className="p-8 bg-[var(--color-obsidian-card)] border border-[var(--color-border)] rounded-2xl shadow-sm overflow-visible">
                <h3 className="text-sm font-black text-zinc-text uppercase tracking-[0.2em] mb-8 pb-4 border-b border-[var(--color-border)]">
                  {t('settings.logistics_routing')}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   <div className="space-y-2">
                    <label className={cn("text-xs font-bold text-zinc-secondary uppercase tracking-wider block", isRTL ? "text-right" : "text-left")}>
                      {t('settings.primary_fulfilment_node')}
                    </label>
                    <AmberDropdown
                      options={[
                        { label: 'Global Express (DHL)', value: 'dhl' },
                        { label: 'Regional Priority (Aramex)', value: 'aramex' },
                        { label: 'Bespoke Logistics (Private)', value: 'private' },
                      ]}
                      value="dhl"
                      onChange={() => {}}
                      className="w-full h-11"
                    />
                  </div>
                  <AmberInput label={t('settings.auto_tracking_sync')} defaultValue="https://api.zonevast.track/v1" />
                  <AmberInput label={t('settings.avg_lead_time_min')} type="number" defaultValue="3" rightElement={<span className="text-sm font-bold text-zinc-muted px-3">DAYS</span>} />
                  <AmberInput label={t('settings.avg_lead_time_max')} type="number" defaultValue="7" rightElement={<span className="text-sm font-bold text-zinc-muted px-3">DAYS</span>} />
                </div>
              </Card>
            </div>
          )}

        </div>
      </div>

      {/* Persistence Notification (Toast) */}
      {showSavedToast && (
        <div 
          className={cn(
            "fixed bottom-8 flex items-center gap-3 px-6 py-4 bg-brand text-slate-900 rounded-lg shadow-2xl shadow-brand/30 animate-in slide-in-from-bottom-10 h-auto z-[200] font-black uppercase tracking-widest text-xs italic",
            isRTL ? "left-8" : "right-8"
          )}
        >
          <div className="bg-white/20 p-1.5 rounded-full ring-4 ring-white/5">
            <CheckCircle className="w-5 h-5" />
          </div>
          {t('settings.saved')}
        </div>
      )}
    </div>
  );
};
