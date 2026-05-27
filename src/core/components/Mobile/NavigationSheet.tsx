'use client';

import React, { useMemo } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  Heart,
  Package,
  Users,
  Tag,
  BarChart2,
  TrendingUp,
  Settings,
  HelpCircle,
  LogOut,
  Smartphone,
} from 'lucide-react';
import Link from 'next/link';
import { useFeatureConfig } from '@yousef2001/core-ui/contexts';
import { useLanguage } from '@core/contexts/LanguageContext';
import { isPathAllowedForRole } from '@core/auth/navRoleAccess';
import { useDashboardRole } from '@core/hooks/useDashboardRole';
import { useTopbarUser } from '@core/hooks/useTopbarUser';
import { useAuth } from '@features/auth/hooks/useAuth';
import { usePwaInstallContext } from '@core/contexts/PwaInstallContext';
import { cn } from '@core/lib/utils/cn';
import {
  getOverlayPortalRoot,
  OVERLAY_TRANSITION_MS,
  useOverlayPortal,
} from '@core/hooks/useOverlayPortal';

interface NavigationSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

const NAV_ITEMS = [
  { icon: Heart, labelKey: 'mobile.nav.watchlist', path: '/watchlist', feature: 'auctions' },
  { icon: TrendingUp, labelKey: 'mobile.nav.my_bids', path: '/my-bids', feature: 'bidding' },
  { icon: Package, labelKey: 'mobile.nav.inventory', path: '/inventory', feature: 'inventory' },
  { icon: Users, labelKey: 'mobile.nav.customers', path: '/customers', feature: 'customers' },
  { icon: Tag, labelKey: 'mobile.nav.categories', path: '/categories', feature: 'categories' },
  { icon: BarChart2, labelKey: 'mobile.nav.reports', path: '/reports', feature: 'reports' },
  { icon: Settings, labelKey: 'mobile.nav.settings', path: '/settings', feature: 'settings' },
  { icon: HelpCircle, labelKey: 'mobile.nav.help', path: '/help' },
];

export function NavigationSheet({ isOpen, onClose }: NavigationSheetProps) {
  const { t, dir } = useLanguage();
  const { openInstallSheet, canInstall } = usePwaInstallContext();
  const { logout } = useAuth();
  const { role } = useDashboardRole();
  const topbarUser = useTopbarUser();
  const { isFeatureEnabled } = useFeatureConfig();
  const isRTL = dir === 'rtl';
  const { shouldRender, isOpen: isSheetOpen } = useOverlayPortal(isOpen, onClose);

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
    // Wait for this sheet's portal exit before mounting InstallPromptSheet's BottomSheet.
    window.setTimeout(() => openInstallSheet(), OVERLAY_TRANSITION_MS);
  };

  if (!shouldRender) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center"
      role="dialog"
      aria-modal="true"
    >
      <div
        className={cn(
          'absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300',
          isSheetOpen ? 'opacity-100' : 'opacity-0',
        )}
        onClick={onClose}
      />
      <div
        className={cn(
          'relative w-full max-w-lg bg-obsidian-card border-t border-white/10 rounded-t-2xl shadow-2xl transition-transform duration-300 ease-out',
          isSheetOpen ? 'translate-y-0' : 'translate-y-full',
        )}
        dir={dir}
      >
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-white/20" />
        </div>
        <button
          onClick={onClose}
          className={cn(
            'absolute top-3 p-2 rounded-lg text-zinc-muted hover:text-zinc-text hover:bg-white/10 transition-colors',
            isRTL ? 'left-3' : 'right-3',
          )}
        >
          <X className="w-5 h-5" />
        </button>

        <div className="px-6 pb-8 pt-2 space-y-4">
          <div
            className={cn(
              'flex items-center gap-3 p-3 rounded-xl bg-obsidian-outer',
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
          </div>

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

          <button
            onClick={() => {
              onClose();
              void logout();
            }}
            className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-danger hover:bg-danger/5 transition-colors"
          >
            <LogOut className={`w-5 h-5 ${isRTL ? 'rotate-180' : ''}`} />
            <span className="flex-1 text-start text-sm font-bold">
              {t('profile.logout') || 'Logout'}
            </span>
          </button>
        </div>
      </div>
    </div>,
    getOverlayPortalRoot(),
  );
}
