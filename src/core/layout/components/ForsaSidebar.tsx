'use client';

/**
 * App-specific sidebar (not the generic core-ui sidebar): Next.js routing, `getActiveSidebarItemPath`
 * for query-aware links, `useFeatureConfig` gating, and portal exit. Prefer extending this file over
 * patching `node_modules/@yousef2001/core-ui` so upgrades stay predictable.
 */

import React, { Fragment, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { ChevronLeft, ChevronRight, LogOut, X } from 'lucide-react';
import { AmberLogo } from '@yousef2001/core-ui/components';
import { useFeatureConfig, useLanguage, useNavigation } from '@yousef2001/core-ui/contexts';
import type { MenuSection } from '@config/navigation';
import { resolveIcon } from '@config/navigation';
import { getActiveSidebarItemPath, getNavPathBase } from '@core/utils/isNavItemActive';

const DEFAULT_PORTAL_PATHS = ['/portal', '/'];

interface ForsaSidebarProps {
  isOpen: boolean;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  onClose: () => void;
  menuSections?: MenuSection[];
  appLabel?: string;
  showExitButton?: boolean;
  portalPaths?: string[];
  sidebarLoader?: (path: string, view?: string) => Promise<MenuSection[]>;
}

export const ForsaSidebar: React.FC<ForsaSidebarProps> = ({
  isOpen,
  isCollapsed,
  onToggleCollapse,
  onClose,
  menuSections,
  appLabel,
  showExitButton = true,
  portalPaths = DEFAULT_PORTAL_PATHS,
  sidebarLoader,
}) => {
  const { t, dir } = useLanguage();
  const { activeMode, sidebarView, switchMode } = useNavigation();
  const { isFeatureEnabled, enabledFeatures } = useFeatureConfig();
  const router = useRouter();
  const [dynamicSections, setDynamicSections] = useState<MenuSection[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const isPortal = portalPaths.includes(router.pathname);

  useEffect(() => {
    const loadSidebar = async () => {
      if (isPortal) {
        setDynamicSections([]);
        return;
      }
      if (menuSections && menuSections.length > 0) {
        setDynamicSections(menuSections);
        return;
      }
      if (!sidebarLoader) {
        setDynamicSections([]);
        return;
      }
      setIsLoading(true);
      try {
        const sections = await sidebarLoader(router.pathname, sidebarView);
        const resolvedSections = sections.map(section => ({
          ...section,
          items: section.items.map(item => ({
            ...item,
            icon: resolveIcon(item.icon),
          })),
        }));
        setDynamicSections(resolvedSections);
      } catch (error) {
        console.error('Failed to load sidebar:', error);
        setDynamicSections([]);
      } finally {
        setIsLoading(false);
      }
    };
    void loadSidebar();
  }, [router.pathname, menuSections, sidebarView, enabledFeatures, isPortal, sidebarLoader]);

  const getFeatureForPath = (path: string): string | null => {
    const base = getNavPathBase(path);
    const featureMap: Record<string, string> = {
      '/auctions': 'auctions',
      '/bidding': 'bidding',
      '/group-buying': 'sales',
      '/sales': 'sales',
      '/orders': 'orders',
      '/categories': 'categories',
      '/customers': 'customers',
      '/inventory': 'inventory',
      '/users': 'users',
      '/reports': 'reports',
      '/settings': 'settings',
      '/my-bids': 'bidding',
      '/watchlist': 'auctions',
    };
    for (const [prefix, feature] of Object.entries(featureMap)) {
      if (base === prefix || base.startsWith(`${prefix}/`)) return feature;
    }
    return null;
  };

  const filteredSections = dynamicSections
    .map(section => ({
      ...section,
      items: section.items.filter(item => {
        const feature = getFeatureForPath(item.path);
        if (!feature) return true;
        return isFeatureEnabled(feature);
      }),
    }))
    .filter(section => section.items.length > 0);

  if (isPortal) {
    return null;
  }

  const getModeLabel = (mode: string) => {
    if (mode === 'generic') return t('app.suite');
    if (mode === 'admin') return 'Administration';
    if (mode === 'portal') return 'Service Portal';
    return t('app.suite');
  };

  const handleExitToPortal = () => {
    switchMode('portal');
    void router.push('/portal');
  };

  const firstSectionTitleKey = dynamicSections[0]?.title || '';

  if (isLoading) {
    return null;
  }

  const allPaths = filteredSections.flatMap(s => s.items.map(i => i.path));
  const activePath =
    router.isReady && allPaths.length > 0
      ? getActiveSidebarItemPath(router.pathname, router.query, allPaths)
      : null;

  return (
    <aside
      className={`
        fixed inset-y-0 z-[110] bg-obsidian-panel
        transform transition-all duration-300 ease-in-out
        ${isCollapsed ? 'w-20' : 'w-64'}
        ${
          isOpen
            ? 'translate-x-0'
            : dir === 'rtl'
              ? 'translate-x-full lg:translate-x-0'
              : '-translate-x-full lg:translate-x-0'
        }
        ${dir === 'rtl' ? 'right-0' : 'left-0'}
        lg:translate-x-0 shadow-xl lg:shadow-none
      `}
    >
      <div className="flex flex-col h-full">
        <div
          className={`h-16 flex items-center gap-2 transition-all min-h-16 ${
            isCollapsed ? 'justify-center px-0' : 'px-4 justify-between'
          }`}
        >
          {!isCollapsed ? (
            <Fragment>
              <div className="flex items-center gap-3 animate-in fade-in duration-300 min-w-0 flex-1">
                <div className="flex items-center justify-center text-brand shrink-0">
                  <AmberLogo className="w-8 h-8" />
                </div>
                <div className="min-w-0">
                  <span className="text-lg font-black text-white leading-none block uppercase tracking-wider truncate">
                    {t('app.name')}
                  </span>
                  <span className="text-xs font-black text-brand uppercase tracking-widest block truncate">
                    {appLabel || (firstSectionTitleKey ? t(firstSectionTitleKey) : getModeLabel(activeMode))}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={onToggleCollapse}
                className="p-1.5 text-zinc-muted hover:text-zinc-text hover:bg-white/5 rounded-sm transition-all hidden lg:block shrink-0"
              >
                {dir === 'rtl' ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
              </button>
            </Fragment>
          ) : (
            <button
              type="button"
              onClick={onToggleCollapse}
              className="p-2 text-zinc-muted hover:text-brand transition-all hidden lg:block animate-in zoom-in-75 duration-300"
            >
              {dir === 'rtl' ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
            </button>
          )}
          <div className={`flex items-center shrink-0 ${isCollapsed ? 'hidden' : 'lg:hidden'}`}>
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-zinc-muted hover:text-zinc-text"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 py-6 overflow-y-auto px-0 scrollbar-hide">
          {filteredSections.map((section, idx) => (
            <nav key={idx} className="space-y-1 mb-8">
              {!isCollapsed && section.items.length > 0 && (
                <p className="px-5 text-xs font-black text-zinc-muted/60 uppercase tracking-[0.2em] mb-3">
                  {t(section.title) || section.title}
                </p>
              )}
              {section.items.map(item => {
                const Icon = resolveIcon(item.icon);
                const isActive = activePath !== null && item.path === activePath;
                const labelText = t(item.label) || item.label;
                return (
                  <Link
                    key={item.path}
                    href={item.path}
                    onClick={() => {
                      if (typeof window !== 'undefined' && window.innerWidth < 1024) onClose();
                    }}
                    className={`
                      flex items-center group px-3 py-2.5 text-sm font-medium transition-all rounded-md mx-3
                      ${
                        isActive
                          ? 'bg-brand/10 text-brand shadow-sm'
                          : 'text-zinc-muted hover:text-zinc-text hover:bg-white/5'
                      }
                      ${isCollapsed ? 'justify-center px-2 mx-2' : ''}
                    `}
                    title={isCollapsed ? labelText : undefined}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    <Icon
                      className={`w-5 h-5 shrink-0 transition-colors ${
                        isActive ? 'text-brand' : 'text-zinc-muted group-hover:text-zinc-text'
                      } ${!isCollapsed && (dir === 'rtl' ? 'ml-3' : 'mr-3')}`}
                    />
                    {!isCollapsed && (
                      <>
                        <span className="flex-1 truncate tracking-wide text-[13px] font-bold">{labelText}</span>
                        {(() => {
                          const b = item.badge;
                          if (b === undefined || b === null || b === '') return null;
                          if (typeof b === 'number' && b <= 0) return null;
                          if (typeof b === 'string' && (b === '0' || b === '00')) return null;
                          return (
                            <span className="ms-2 min-w-[1.25rem] rounded-full bg-brand/20 px-1.5 py-0.5 text-center text-[10px] font-black text-brand">
                              {b}
                            </span>
                          );
                        })()}
                      </>
                    )}
                  </Link>
                );
              })}
            </nav>
          ))}
        </div>

        {showExitButton && (
          <div className="p-4 mt-auto">
            <button
              type="button"
              onClick={handleExitToPortal}
              className={`
                w-full flex items-center px-3 py-2.5 rounded-md transition-all group
                border border-transparent hover:border-brand/30 hover:bg-white/5
                ${isCollapsed ? 'justify-center' : ''}
              `}
              title={t('sidebar.back_portal')}
            >
              <div
                className={`p-1 bg-white/5 rounded-sm text-zinc-muted group-hover:text-brand transition-colors ${
                  !isCollapsed ? (dir === 'rtl' ? 'ml-3' : 'mr-3') : ''
                }`}
              >
                <LogOut className={`w-4 h-4 ${dir === 'rtl' ? 'rotate-180' : ''}`} />
              </div>
              {!isCollapsed && (
                <div className="flex flex-col items-start text-left">
                  <span className="text-xs font-black text-zinc-muted uppercase tracking-widest group-hover:text-zinc-text transition-colors">
                    {t('sidebar.exit')}
                  </span>
                  <span className="text-[10px] font-bold text-zinc-muted/60 uppercase tracking-tight group-hover:text-brand transition-colors">
                    {t('sidebar.back_portal')}
                  </span>
                </div>
              )}
            </button>
          </div>
        )}
      </div>
    </aside>
  );
};
