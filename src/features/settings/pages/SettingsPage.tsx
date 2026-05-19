'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
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
} from 'lucide-react';
import { AmberCard } from '@core/components/AmberCard';
import { AmberButton } from '@core/components/AmberButton';
import { useLanguage } from '@yousef2001/core-ui/contexts';
import { cn } from '@core/lib/utils/cn';
import { GeneralTab } from '../components/GeneralTab';
import { AuctionTab } from '../components/AuctionTab';
import { PaymentsTab } from '../components/PaymentsTab';
import { ShippingTab } from '../components/ShippingTab';
import { NotificationsTab } from '../components/NotificationsTab';
import { NavigationTab } from '../components/NavigationTab';

type Tab = { id: string; label: string; icon: React.ComponentType<{ className?: string }> };

export function SettingsPage() {
  const { t, dir } = useLanguage();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('general');
  const [isSaving, setIsSaving] = useState(false);
  const [showSavedToast, setShowSavedToast] = useState(false);

  useEffect(() => {
    if (router.isReady && router.query.tab) {
      const tab = router.query.tab as string;
      const validTabs = ['general', 'auction', 'payments', 'shipping', 'notifications', 'navigation'];
      if (validTabs.includes(tab)) {
        setActiveTab(tab);
      }
    }
  }, [router.isReady, router.query.tab]);

  const tabs: Tab[] = [
    { id: 'general', label: t('settings.general'), icon: Settings2 },
    { id: 'auction', label: t('settings.auction'), icon: Gavel },
    { id: 'payments', label: t('settings.payments'), icon: CreditCard },
    { id: 'shipping', label: t('settings.shipping'), icon: Truck },
    { id: 'notifications', label: t('settings.notifications'), icon: Bell },
    { id: 'navigation', label: t('settings.navigation'), icon: LayoutDashboard },
  ];

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setShowSavedToast(true);
      setTimeout(() => setShowSavedToast(false), 3000);
    }, 1200);
  };

  const renderTab = () => {
    switch (activeTab) {
      case 'general': return <GeneralTab />;
      case 'auction': return <AuctionTab />;
      case 'payments': return <PaymentsTab />;
      case 'shipping': return <ShippingTab />;
      case 'notifications': return <NotificationsTab />;
      case 'navigation': return <NavigationTab />;
      default: return <GeneralTab />;
    }
  };

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
          {renderTab()}
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
