'use client';

import { useState } from 'react';
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
} from 'lucide-react';
import { AmberCard } from '@core/components/AmberCard';
import { AmberButton } from '@core/components/AmberButton';
import { useLanguage } from '@yousef2001/core-ui/contexts';
import { cn } from '@core/lib/utils/cn';
import { useSidebarMode } from '@core/hooks/useSidebarMode';

type Tab = { id: string; label: string; icon: React.ComponentType<{ className?: string }> };

export default function SettingsPage() {
  const { t, dir } = useLanguage();
  const { mode, setMode } = useSidebarMode();
  const [activeTab, setActiveTab] = useState('general');
  const [isSaving, setIsSaving] = useState(false);
  const [showSavedToast, setShowSavedToast] = useState(false);

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
                    <p className="text-xs font-bold text-zinc-muted leading-relaxed uppercase">
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
                    <p className="text-xs font-bold text-zinc-muted leading-relaxed uppercase">
                      {t('settings.sidebar_unified_desc')}
                    </p>
                  </button>
                </div>
              </AmberCard>
            </div>
          )}

          {/* Placeholder for other tabs - rendered by core-ui behavior */}
          {activeTab !== 'navigation' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-end-4 duration-500">
              <AmberCard className="p-8 bg-[var(--color-obsidian-card)] border border-[var(--color-border)] rounded-2xl shadow-sm">
                <div className="flex items-center justify-center py-12 text-zinc-muted">
                  <p className="text-sm font-bold uppercase tracking-widest">
                    {activeTab} settings
                  </p>
                </div>
              </AmberCard>
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
