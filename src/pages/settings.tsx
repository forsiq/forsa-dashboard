'use client';

import { useState, useEffect } from 'react';
import { RoleGuard } from '@core/components/RoleGuard';
import {
  Settings2,
  CreditCard,
  Truck,
  Gavel,
  Save,
  Bell,
  CheckCircle,
  Loader2,
  LayoutDashboard,
  PanelLeft,
  Layers,
  Sun,
  Moon,
  DollarSign,
  Wallet,
  Banknote,
  Globe,
  Package,
  TruckIcon,
  Mail,
  MessageSquare,
  Smartphone,
  Megaphone,
  Clock,
} from 'lucide-react';
import { AmberCard } from '@core/components/AmberCard';
import { AmberButton } from '@core/components/AmberButton';
import { AmberInput } from '@core/components/AmberInput';
import { AmberToggle } from '@core/components';
import { useLanguage } from '@yousef2001/core-ui/contexts';
import { useTheme } from '@core/contexts/ThemeContext';
import { cn } from '@core/lib/utils/cn';
import { useSidebarMode } from '@core/hooks/useSidebarMode';
import { useToast } from '@core/contexts/ToastContext';
import { FormSection } from '@core/components/FormSection';
import { ShippingProvidersPage } from '@features/shipping/pages/ShippingProvidersPage';

type Tab = { id: string; label: string; icon: React.ComponentType<{ className?: string }> };

const SETTINGS_KEY = 'forsa_settings';

function loadSettings(): Record<string, any> {
  if (typeof window === 'undefined') return {};
  try {
    const stored = localStorage.getItem(SETTINGS_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
}

function saveSettings(settings: Record<string, any>) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch {
    // ignore
  }
}

export default function SettingsPage() {
  return (
    <RoleGuard allowedRoles={['admin']}>
      <SettingsPageContent />
    </RoleGuard>
  );
}

function SettingsPageContent() {
  const { t, dir } = useLanguage();
  const { mode, setMode } = useSidebarMode();
  const { theme, toggleTheme } = useTheme();
  const toast = useToast();
  const [activeTab, setActiveTab] = useState('general');
  const [isSaving, setIsSaving] = useState(false);
  const [showSavedToast, setShowSavedToast] = useState(false);

  // Settings state
  const [settings, setSettings] = useState<Record<string, any>>({});

  useEffect(() => {
    setSettings(loadSettings());
  }, []);

  const updateSetting = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      saveSettings(settings);
      setIsSaving(false);
      setShowSavedToast(true);
      toast.success(t('settings.saved') || 'Settings saved successfully');
      setTimeout(() => setShowSavedToast(false), 3000);
    }, 800);
  };

  const tabs: Tab[] = [
    { id: 'general', label: t('settings.general'), icon: Settings2 },
    { id: 'auction', label: t('settings.auction'), icon: Gavel },
    { id: 'payments', label: t('settings.payments'), icon: CreditCard },
    { id: 'shipping', label: t('settings.shipping'), icon: Truck },
    { id: 'notifications', label: t('settings.notifications'), icon: Bell },
    { id: 'navigation', label: t('settings.navigation'), icon: LayoutDashboard },
  ];

  return (
    <div
      className="space-y-8 p-6 max-w-[1600px] mx-auto animate-in fade-in slide-in-from-bottom-2 duration-700"
      dir={dir}
    >
      {/* Header */}
      <div className={cn('flex flex-col sm:flex-row sm:items-start justify-between gap-6 text-start')}>
        <div className="space-y-1">
          <h1 className="text-4xl font-black text-zinc-text tracking-tight leading-none">
            {t('settings.page.title')}
          </h1>
          <p className="text-base text-zinc-secondary font-bold">{t('settings.page.subtitle')}</p>
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
                <Save className={cn('w-4 h-4 text-black me-2')} />
                <span className="text-black">{t('settings.save')}</span>
              </>
            )}
          </AmberButton>
        </div>
      </div>

      {/* Body */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Tabs */}
        <div className="lg:col-span-1 space-y-4">
          <AmberCard
            className={cn(
              'p-2 bg-[var(--color-obsidian-card)] border border-[var(--color-border)] rounded-2xl shadow-sm text-start',
            )}
          >
            <nav className="space-y-1.5 font-cairo">
              {tabs.map(tab => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      'w-full flex items-center gap-3 px-5 py-3.5 rounded-xl transition-all duration-300 relative group overflow-hidden',
                      isActive
                        ? 'bg-[var(--color-brand)] text-black shadow-lg shadow-[var(--color-brand)]/10'
                        : 'text-zinc-muted hover:text-zinc-text hover:bg-[var(--color-obsidian-hover)] border border-transparent',
                    )}
                  >
                    <tab.icon
                      className={cn(
                        'w-5 h-5 shrink-0 transition-transform group-hover:scale-110',
                        isActive ? 'text-black' : 'text-zinc-muted',
                      )}
                    />
                    <span
                      className={cn(
                        'text-sm font-bold uppercase tracking-tight',
                        isActive ? 'text-black' : 'text-zinc-muted',
                      )}
                    >
                      {tab.label}
                    </span>
                  </button>
                );
              })}
            </nav>
          </AmberCard>
        </div>

        {/* Content Area */}
        <div className="lg:col-span-3 space-y-6">
          {/* Navigation Tab */}
          {activeTab === 'navigation' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-end-4 duration-500">
              <AmberCard className="p-8 bg-[var(--color-obsidian-card)] border border-[var(--color-border)] rounded-2xl shadow-sm overflow-visible">
                <h3 className="text-sm font-black text-zinc-text uppercase tracking-[0.2em] mb-8 pb-4 border-b border-[var(--color-border)]">
                  {t('settings.sidebar_mode')}
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Modular Option */}
                  <button
                    type="button"
                    onClick={() => setMode('modular')}
                    className={cn(
                      'relative p-6 rounded-2xl border-2 transition-all text-start group',
                      mode === 'modular'
                        ? 'border-[var(--color-brand)] bg-[var(--color-brand)]/5 shadow-lg shadow-[var(--color-brand)]/10'
                        : 'border-[var(--color-border)] bg-[var(--color-obsidian-card)] hover:border-white/20',
                    )}
                  >
                    {mode === 'modular' && (
                      <div className="absolute top-4 end-4">
                        <CheckCircle className="w-5 h-5 text-[var(--color-brand)]" />
                      </div>
                    )}
                    <div className="flex items-center gap-3 mb-4">
                      <div
                        className={cn(
                          'p-2.5 rounded-xl',
                          mode === 'modular' ? 'bg-[var(--color-brand)]/15' : 'bg-white/5',
                        )}
                      >
                        <PanelLeft
                          className={cn(
                            'w-5 h-5',
                            mode === 'modular' ? 'text-[var(--color-brand)]' : 'text-zinc-muted',
                          )}
                        />
                      </div>
                      <h4 className="text-sm font-black text-zinc-text uppercase tracking-widest">
                        {t('settings.sidebar_modular')}
                      </h4>
                    </div>
                    <p className="text-[13px] font-bold text-zinc-muted leading-relaxed uppercase">
                      {t('settings.sidebar_modular_desc')}
                    </p>
                  </button>

                  {/* Unified Option */}
                  <button
                    type="button"
                    onClick={() => setMode('unified')}
                    className={cn(
                      'relative p-6 rounded-2xl border-2 transition-all text-start group',
                      mode === 'unified'
                        ? 'border-[var(--color-brand)] bg-[var(--color-brand)]/5 shadow-lg shadow-[var(--color-brand)]/10'
                        : 'border-[var(--color-border)] bg-[var(--color-obsidian-card)] hover:border-white/20',
                    )}
                  >
                    {mode === 'unified' && (
                      <div className="absolute top-4 end-4">
                        <CheckCircle className="w-5 h-5 text-[var(--color-brand)]" />
                      </div>
                    )}
                    <div className="flex items-center gap-3 mb-4">
                      <div
                        className={cn(
                          'p-2.5 rounded-xl',
                          mode === 'unified' ? 'bg-[var(--color-brand)]/15' : 'bg-white/5',
                        )}
                      >
                        <Layers
                          className={cn(
                            'w-5 h-5',
                            mode === 'unified' ? 'text-[var(--color-brand)]' : 'text-zinc-muted',
                          )}
                        />
                      </div>
                      <h4 className="text-sm font-black text-zinc-text uppercase tracking-widest">
                        {t('settings.sidebar_unified')}
                      </h4>
                    </div>
                    <p className="text-[13px] font-bold text-zinc-muted leading-relaxed uppercase">
                      {t('settings.sidebar_unified_desc')}
                    </p>
                  </button>
                </div>
              </AmberCard>
            </div>
          )}

          {/* General Tab */}
          {activeTab === 'general' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-end-4 duration-500">
              <AmberCard className="p-8 bg-[var(--color-obsidian-card)] border border-[var(--color-border)] rounded-2xl shadow-sm">
                <h3 className="text-sm font-black text-zinc-text uppercase tracking-[0.2em] mb-8 pb-4 border-b border-[var(--color-border)]">
                  {t('settings.general_info') || 'General Information'}
                </h3>

                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="text-[11px] font-black text-zinc-muted uppercase tracking-widest block mb-2 text-start">
                        {t('settings.project_name') || 'Project Name'}
                      </label>
                      <div className="h-11 px-4 flex items-center bg-[var(--color-obsidian-outer)] border border-[var(--color-border)] rounded-xl text-sm text-zinc-text font-bold">
                        Forsa Auctions
                      </div>
                    </div>
                    <div>
                      <label className="text-[11px] font-black text-zinc-muted uppercase tracking-widest block mb-2 text-start">
                        {t('settings.project_id') || 'Project ID'}
                      </label>
                      <div className="h-11 px-4 flex items-center bg-[var(--color-obsidian-outer)] border border-[var(--color-border)] rounded-xl text-sm text-zinc-text font-bold">
                        11
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-black text-zinc-muted uppercase tracking-widest block mb-2 text-start">
                      {t('settings.description') || 'Description'}
                    </label>
                    <div className="px-4 py-3 bg-[var(--color-obsidian-outer)] border border-[var(--color-border)] rounded-xl text-sm text-zinc-text font-medium leading-relaxed">
                      Forsa is a real-time auction platform for managing and participating in live auctions.
                    </div>
                  </div>
                </div>
              </AmberCard>
            </div>
          )}

          {/* Appearance / Auction Tab */}
          {activeTab === 'auction' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-end-4 duration-500">
              <AmberCard className="p-8 bg-[var(--color-obsidian-card)] border border-[var(--color-border)] rounded-2xl shadow-sm">
                <h3 className="text-sm font-black text-zinc-text uppercase tracking-[0.2em] mb-8 pb-4 border-b border-[var(--color-border)]">
                  {t('settings.appearance') || 'Appearance'}
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Light Mode Option */}
                  <button
                    type="button"
                    onClick={() => { if (theme === 'dark') toggleTheme(); }}
                    className={cn(
                      'relative p-6 rounded-2xl border-2 transition-all text-start group',
                      theme !== 'dark'
                        ? 'border-[var(--color-brand)] bg-[var(--color-brand)]/5 shadow-lg shadow-[var(--color-brand)]/10'
                        : 'border-[var(--color-border)] bg-[var(--color-obsidian-card)] hover:border-white/20',
                    )}
                  >
                    {theme !== 'dark' && (
                      <div className="absolute top-4 end-4">
                        <CheckCircle className="w-5 h-5 text-[var(--color-brand)]" />
                      </div>
                    )}
                    <div className="flex items-center gap-3 mb-4">
                      <div className={cn(
                        'p-2.5 rounded-xl',
                        theme !== 'dark' ? 'bg-[var(--color-brand)]/15' : 'bg-white/5',
                      )}>
                        <Sun className={cn(
                          'w-5 h-5',
                          theme !== 'dark' ? 'text-[var(--color-brand)]' : 'text-zinc-muted',
                        )} />
                      </div>
                      <h4 className="text-sm font-black text-zinc-text uppercase tracking-widest">
                        {t('settings.light_mode') || 'Light Mode'}
                      </h4>
                    </div>
                    <p className="text-[13px] font-bold text-zinc-muted leading-relaxed uppercase">
                      {t('settings.light_mode_desc') || 'Clean and bright interface'}
                    </p>
                  </button>

                  {/* Dark Mode Option */}
                  <button
                    type="button"
                    onClick={() => { if (theme !== 'dark') toggleTheme(); }}
                    className={cn(
                      'relative p-6 rounded-2xl border-2 transition-all text-start group',
                      theme === 'dark'
                        ? 'border-[var(--color-brand)] bg-[var(--color-brand)]/5 shadow-lg shadow-[var(--color-brand)]/10'
                        : 'border-[var(--color-border)] bg-[var(--color-obsidian-card)] hover:border-white/20',
                    )}
                  >
                    {theme === 'dark' && (
                      <div className="absolute top-4 end-4">
                        <CheckCircle className="w-5 h-5 text-[var(--color-brand)]" />
                      </div>
                    )}
                    <div className="flex items-center gap-3 mb-4">
                      <div className={cn(
                        'p-2.5 rounded-xl',
                        theme === 'dark' ? 'bg-[var(--color-brand)]/15' : 'bg-white/5',
                      )}>
                        <Moon className={cn(
                          'w-5 h-5',
                          theme === 'dark' ? 'text-[var(--color-brand)]' : 'text-zinc-muted',
                        )} />
                      </div>
                      <h4 className="text-sm font-black text-zinc-text uppercase tracking-widest">
                        {t('settings.dark_mode') || 'Dark Mode'}
                      </h4>
                    </div>
                    <p className="text-[13px] font-bold text-zinc-muted leading-relaxed uppercase">
                      {t('settings.dark_mode_desc') || 'Easy on the eyes, designed for extended use'}
                    </p>
                  </button>
                </div>
              </AmberCard>
            </div>
          )}

          {/* Payments Tab */}
          {activeTab === 'payments' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-end-4 duration-500">
              <FormSection
                icon={<DollarSign className="w-5 h-5" />}
                iconBgColor="brand"
                title={t('settings.payment_currency') || 'Currency & Tax'}
              >
                <div className="space-y-6">
                  <div>
                    <label className="text-[11px] font-black text-zinc-muted uppercase tracking-widest block mb-2 text-start">
                      {t('settings.currency') || 'Default Currency'}
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                      <button
                        type="button"
                        onClick={() => updateSetting('currency', 'IQD')}
                        className={cn(
                          'p-4 rounded-xl border-2 transition-all text-center',
                          settings.currency !== 'USD'
                            ? 'border-brand bg-brand/5'
                            : 'border-border bg-obsidian-card hover:border-white/20'
                        )}
                      >
                        <span className="text-sm font-black text-zinc-text">IQD</span>
                        <p className="text-[11px] text-zinc-muted mt-1">Iraqi Dinar</p>
                      </button>
                      <button
                        type="button"
                        onClick={() => updateSetting('currency', 'USD')}
                        className={cn(
                          'p-4 rounded-xl border-2 transition-all text-center',
                          settings.currency === 'USD'
                            ? 'border-brand bg-brand/5'
                            : 'border-border bg-obsidian-card hover:border-white/20'
                        )}
                      >
                        <span className="text-sm font-black text-zinc-text">USD</span>
                        <p className="text-[11px] text-zinc-muted mt-1">US Dollar</p>
                      </button>
                    </div>
                  </div>

                  <AmberInput
                    label={t('settings.tax_rate') || 'Tax Rate (%)'}
                    type="number"
                    placeholder="0"
                    value={settings.taxRate ?? ''}
                    onChange={(e) => updateSetting('taxRate', e.target.value)}
                  />
                </div>
              </FormSection>

              <FormSection
                icon={<Wallet className="w-5 h-5" />}
                iconBgColor="success"
                title={t('settings.payment_methods') || 'Payment Methods'}
              >
                <div className="space-y-5">
                  <div className="flex items-center justify-between p-4 rounded-xl bg-obsidian-panel/30 border border-white/5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                        <Banknote className="w-4 h-4 text-emerald-400" />
                      </div>
                      <div>
                        <span className="text-sm font-bold text-zinc-text">{t('settings.cash_payment') || 'Cash on Delivery'}</span>
                        <p className="text-[11px] text-zinc-muted">{t('settings.cash_payment_desc') || 'Accept cash payments'}</p>
                      </div>
                    </div>
                    <AmberToggle enabled={settings.cashPayment !== false} onChange={(v) => updateSetting('cashPayment', v)} label="Cash payment" />
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-xl bg-obsidian-panel/30 border border-white/5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                        <CreditCard className="w-4 h-4 text-blue-400" />
                      </div>
                      <div>
                        <span className="text-sm font-bold text-zinc-text">{t('settings.card_payment') || 'Card Payment'}</span>
                        <p className="text-[11px] text-zinc-muted">{t('settings.card_payment_desc') || 'Accept credit/debit cards'}</p>
                      </div>
                    </div>
                    <AmberToggle enabled={settings.cardPayment === true} onChange={(v) => updateSetting('cardPayment', v)} label="Card payment" />
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-xl bg-obsidian-panel/30 border border-white/5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-violet-500/10 flex items-center justify-center">
                        <Globe className="w-4 h-4 text-violet-400" />
                      </div>
                      <div>
                        <span className="text-sm font-bold text-zinc-text">{t('settings.online_payment') || 'Online Payment'}</span>
                        <p className="text-[11px] text-zinc-muted">{t('settings.online_payment_desc') || 'Accept online payment gateways'}</p>
                      </div>
                    </div>
                    <AmberToggle enabled={settings.onlinePayment === true} onChange={(v) => updateSetting('onlinePayment', v)} label="Online payment" />
                  </div>
                </div>
              </FormSection>
            </div>
          )}

          {/* Shipping Tab — Al-Waseet (API-backed) */}
          {activeTab === 'shipping' && <ShippingProvidersPage />}

          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-end-4 duration-500">
              <FormSection
                icon={<Bell className="w-5 h-5" />}
                iconBgColor="warning"
                title={t('settings.notification_channels') || 'Notification Channels'}
              >
                <div className="space-y-5">
                  <div className="flex items-center justify-between p-4 rounded-xl bg-obsidian-panel/30 border border-white/5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                        <Mail className="w-4 h-4 text-blue-400" />
                      </div>
                      <div>
                        <span className="text-sm font-bold text-zinc-text">{t('settings.email_notifications') || 'Email Notifications'}</span>
                        <p className="text-[11px] text-zinc-muted">{t('settings.email_notifications_desc') || 'Receive updates via email'}</p>
                      </div>
                    </div>
                    <AmberToggle enabled={settings.emailNotifications !== false} onChange={(v) => updateSetting('emailNotifications', v)} label="Email notifications" />
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-xl bg-obsidian-panel/30 border border-white/5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                        <Megaphone className="w-4 h-4 text-emerald-400" />
                      </div>
                      <div>
                        <span className="text-sm font-bold text-zinc-text">{t('settings.push_notifications') || 'Push Notifications'}</span>
                        <p className="text-[11px] text-zinc-muted">{t('settings.push_notifications_desc') || 'Browser and mobile push alerts'}</p>
                      </div>
                    </div>
                    <AmberToggle enabled={settings.pushNotifications !== false} onChange={(v) => updateSetting('pushNotifications', v)} label="Push notifications" />
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-xl bg-obsidian-panel/30 border border-white/5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-violet-500/10 flex items-center justify-center">
                        <Smartphone className="w-4 h-4 text-violet-400" />
                      </div>
                      <div>
                        <span className="text-sm font-bold text-zinc-text">{t('settings.sms_notifications') || 'SMS Notifications'}</span>
                        <p className="text-[11px] text-zinc-muted">{t('settings.sms_notifications_desc') || 'Receive text message alerts'}</p>
                      </div>
                    </div>
                    <AmberToggle enabled={settings.smsNotifications === true} onChange={(v) => updateSetting('smsNotifications', v)} label="SMS notifications" />
                  </div>
                </div>
              </FormSection>

              <FormSection
                icon={<Clock className="w-5 h-5" />}
                iconBgColor="danger"
                title={t('settings.auction_alerts') || 'Auction Alerts'}
              >
                <div className="space-y-5">
                  <div className="flex items-center justify-between p-4 rounded-xl bg-obsidian-panel/30 border border-white/5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
                        <Gavel className="w-4 h-4 text-amber-400" />
                      </div>
                      <div>
                        <span className="text-sm font-bold text-zinc-text">{t('settings.bid_alerts') || 'Bid Alerts'}</span>
                        <p className="text-[11px] text-zinc-muted">{t('settings.bid_alerts_desc') || 'Notify when outbid on auctions'}</p>
                      </div>
                    </div>
                    <AmberToggle enabled={settings.bidAlerts !== false} onChange={(v) => updateSetting('bidAlerts', v)} label="Bid alerts" />
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-xl bg-obsidian-panel/30 border border-white/5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-rose-500/10 flex items-center justify-center">
                        <Clock className="w-4 h-4 text-rose-400" />
                      </div>
                      <div>
                        <span className="text-sm font-bold text-zinc-text">{t('settings.auction_reminders') || 'Auction Reminders'}</span>
                        <p className="text-[11px] text-zinc-muted">{t('settings.auction_reminders_desc') || 'Remind before auction ends'}</p>
                      </div>
                    </div>
                    <AmberToggle enabled={settings.auctionReminders !== false} onChange={(v) => updateSetting('auctionReminders', v)} label="Auction reminders" />
                  </div>
                </div>
              </FormSection>
            </div>
          )}
        </div>
      </div>

      {/* Saved Toast */}
      {showSavedToast && (
        <div
          className={cn(
            'fixed bottom-8 flex items-center gap-3 px-6 py-4 bg-brand text-slate-900 rounded-lg shadow-2xl shadow-brand/30 animate-in slide-in-from-bottom-10 h-auto z-[200] font-black uppercase tracking-widest text-xs',
            'end-8',
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
}
