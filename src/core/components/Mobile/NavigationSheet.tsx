'use client';

import React, { useMemo } from 'react';
import {
  Heart,
  Package,
  Users,
  Tag,
  BarChart2,
  Settings,
  HelpCircle,
  LogOut,
  Smartphone,
  Sun,
  Moon,
  Languages,
  ChevronRight,
} from 'lucide-react';
import Link from 'next/link';
import { useFeatureConfig } from '@yousef2001/core-ui/contexts';
import { useTheme } from '@core/contexts/ThemeContext';
import { useLanguage } from '@core/contexts/LanguageContext';
import { isPathAllowedForRole } from '@core/auth/navRoleAccess';
import { useDashboardRole } from '@core/hooks/useDashboardRole';
import { useTopbarUser } from '@core/hooks/useTopbarUser';
import { useAuth } from '@features/auth/hooks/useAuth';
import { usePwaInstallContext } from '@core/contexts/PwaInstallContext';
import { cn } from '@core/lib/utils/cn';
import { OVERLAY_TRANSITION_MS } from '@core/hooks/useOverlayPortal';
import { ForsaDrawer } from '@core/components/Mobile/ForsaDrawer';

interface NavigationSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

const NAV_ITEMS = [
  { icon: Heart, labelKey: 'mobile.nav.watchlist', path: '/watchlist', feature: 'auctions' },
  { icon: Package, labelKey: 'mobile.nav.inventory', path: '/inventory', feature: 'inventory' },
  { icon: Users, labelKey: 'mobile.nav.customers', path: '/customers', feature: 'customers' },
  { icon: Tag, labelKey: 'mobile.nav.categories', path: '/categories', feature: 'categories' },
  { icon: BarChart2, labelKey: 'mobile.nav.reports', path: '/reports', feature: 'reports' },
  { icon: Settings, labelKey: 'mobile.nav.settings', path: '/settings', feature: 'settings' },
  { icon: HelpCircle, labelKey: 'mobile.nav.help', path: '/help' },
];

export function NavigationSheet({ isOpen, onClose }: NavigationSheetProps) {
  const { t, dir, language, setLanguage } = useLanguage();
  const { openInstallSheet, canInstall } = usePwaInstallContext();
  const { logout } = useAuth();
  const { role } = useDashboardRole();
  const topbarUser = useTopbarUser();
  const { isFeatureEnabled } = useFeatureConfig();
  const { theme, toggleTheme } = useTheme();
  const isRTL = dir === 'rtl';

  const visibleNavItems = useMemo(
    () =>
      NAV_ITEMS.filter((item) => {
        if (!isPathAllowedForRole(item.path, role)) return false;
        if (item.feature && !isFeatureEnabled(item.feature)) return false;
        return true;
      }),
    [role, isFeatureEnabled],
  );

  const displayName = topbarUser?.name || 'User';
  const initials = topbarUser?.initials || displayName.slice(0, 2).toUpperCase() || 'U';
  const roleLabel = t(`roles.${role}`) || t('mobile.nav.merchant') || 'Merchant';

  const handleOpenInstall = () => {
    onClose();
    window.setTimeout(() => openInstallSheet(), OVERLAY_TRANSITION_MS);
  };

  return (
    <ForsaDrawer open={isOpen} onClose={onClose} dir={dir} showClose={false} bodyClassName="pt-0">
      <div className="space-y-4">
        <Link
          href="/profile"
          onClick={onClose}
          className={cn(
            'flex items-center gap-3 p-3 rounded-xl bg-obsidian-outer hover:bg-white/5 transition-colors',
            isRTL && 'flex-row-reverse',
          )}
        >
          <div className="w-10 h-10 rounded-full bg-brand/20 flex items-center justify-center text-brand font-black text-sm">
            {initials}
          </div>
          <div className={cn('flex-1 min-w-0', isRTL ? 'text-right' : 'text-left')}>
            <p className="text-sm font-bold text-zinc-text truncate">{displayName}</p>
            <p className="text-[10px] text-zinc-muted uppercase tracking-widest">{roleLabel}</p>
          </div>
          <ChevronRight className={cn('w-4 h-4 text-zinc-muted', isRTL && 'rotate-180')} />
        </Link>

        <div className="h-px bg-white/5" />

        <div className="space-y-1">
          {visibleNavItems.map((item) => (
            <Link
              key={item.path}
              href={item.path}
              onClick={onClose}
              className={cn(
                'flex items-center gap-3 px-3 py-3 rounded-xl transition-colors',
                'hover:bg-white/5',
                isRTL && 'flex-row-reverse',
              )}
            >
              <item.icon className="w-5 h-5 text-zinc-muted" />
              <span
                className={cn(
                  'flex-1 text-sm font-bold text-zinc-text',
                  isRTL && 'text-right',
                )}
              >
                {t(item.labelKey) || item.labelKey.split('.').pop()}
              </span>
            </Link>
          ))}
        </div>

        {canInstall && (
          <>
            <div className="h-px bg-white/5" />
            <button
              type="button"
              onClick={handleOpenInstall}
              className={cn(
                'w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-colors',
                'bg-brand/10 border border-brand/20 hover:bg-brand/15',
                isRTL && 'flex-row-reverse',
              )}
            >
              <Smartphone className="w-5 h-5 text-brand shrink-0" />
              <span
                className={cn(
                  'flex-1 text-sm font-bold text-brand',
                  isRTL ? 'text-right' : 'text-left',
                )}
              >
                {t('mobile.nav.download_app')}
              </span>
            </button>
          </>
        )}

        <div className="h-px bg-white/5" />

        <div className="space-y-1">
          <div
            className={cn(
              'flex items-center gap-3 px-3 py-3 rounded-xl',
              isRTL && 'flex-row-reverse',
            )}
          >
            <Languages className="w-5 h-5 text-zinc-muted shrink-0" />
            <span className={cn('flex-1 text-sm font-bold text-zinc-text', isRTL && 'text-right')}>
              {t('mobile.controls.language')}
            </span>
            <div className="flex gap-1">
              {(['en', 'ar'] as const).map((lang) => (
                <button
                  key={lang}
                  type="button"
                  onClick={() => setLanguage(lang)}
                  className={cn(
                    'px-3 py-1 rounded-lg text-xs font-black uppercase tracking-wider transition-colors',
                    language === lang
                      ? 'bg-brand text-brand-text'
                      : 'bg-white/5 text-zinc-muted hover:text-zinc-text hover:bg-white/10',
                  )}
                >
                  {lang === 'en' ? 'EN' : 'AR'}
                </button>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={toggleTheme}
            className={cn(
              'w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-colors hover:bg-white/5',
              isRTL && 'flex-row-reverse',
            )}
          >
            {theme === 'dark' ? (
              <Sun className="w-5 h-5 text-zinc-muted shrink-0" />
            ) : (
              <Moon className="w-5 h-5 text-zinc-muted shrink-0" />
            )}
            <span
              className={cn(
                'flex-1 text-sm font-bold text-zinc-text text-left',
                isRTL && 'text-right',
              )}
            >
              {t('mobile.controls.theme')}
            </span>
            <span className="text-xs font-bold text-zinc-muted uppercase tracking-wider">
              {theme === 'dark' ? t('mobile.controls.dark') : t('mobile.controls.light')}
            </span>
          </button>
        </div>

        <div className="h-px bg-white/5" />

        <button
          type="button"
          onClick={() => {
            onClose();
            void logout();
          }}
          className={cn(
            'w-full flex items-center gap-3 px-3 py-3 rounded-xl text-danger hover:bg-danger/5 transition-colors',
            isRTL && 'flex-row-reverse',
          )}
        >
          <LogOut className={cn('w-5 h-5', isRTL && 'rotate-180')} />
          <span className="flex-1 text-start text-sm font-bold">
            {t('profile.logout') || 'Logout'}
          </span>
        </button>
      </div>
    </ForsaDrawer>
  );
}
