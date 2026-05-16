'use client';

/**
 * App-specific sidebar (not the generic core-ui sidebar): Next.js routing, `getActiveSidebarItemPath`
 * for query-aware links, `useFeatureConfig` gating, unified-mode collapsible module headers, and portal exit.
 * Prefer extending this file over patching `node_modules/@yousef2001/core-ui` so upgrades stay predictable.
 */

import React, { Fragment, useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { ChevronDown, ChevronLeft, ChevronRight, LogOut, X } from 'lucide-react';
import { AmberLogo } from '@yousef2001/core-ui/components';
import { useFeatureConfig, useLanguage, useNavigation } from '@yousef2001/core-ui/contexts';
import type { MenuSection } from '@config/navigation';
import { resolveIcon } from '@config/navigation';
import { getActiveSidebarItemPath, getNavPathBase } from '@core/utils/isNavItemActive';
import { prefetchRouteData } from '@core/query/prefetch';

const DEFAULT_PORTAL_PATHS = ['/portal', '/'];

const FEATURE_MAP: Record<string, string> = {
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

// ── Per-module collapse state (unified mode) ──────────────────────────

const MODULE_COLLAPSE_PREFIX = 'forsa-module-collapsed-';
const moduleCollapseListeners = new Set<() => void>();
const MODULE_IDS = ['dashboard', 'marketplace', 'sales', 'reports'] as const;

function readModuleCollapsedFromStorage(moduleId: string): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return window.localStorage.getItem(`${MODULE_COLLAPSE_PREFIX}${moduleId}`) === 'true';
  } catch {
    return false;
  }
}

function writeModuleCollapsed(moduleId: string, collapsed: boolean) {
  try {
    window.localStorage.setItem(`${MODULE_COLLAPSE_PREFIX}${moduleId}`, collapsed ? 'true' : 'false');
  } catch {
    /* ignore */
  }
  moduleCollapseListeners.forEach(fn => fn());
}

function subscribeModuleCollapse(onChange: () => void) {
  moduleCollapseListeners.add(onChange);
  return () => {
    moduleCollapseListeners.delete(onChange);
  };
}

/**
 * Uses useState + subscription to keep module collapse state reactive
 * without creating new object references on every call (which breaks useSyncExternalStore).
 */
function useModuleCollapseState(): {
  collapseMap: Record<string, boolean>;
  toggleModule: (moduleId: string) => void;
} {
  const [collapseMap, setCollapseMap] = useState<Record<string, boolean>>(() => {
    const map: Record<string, boolean> = {};
    for (const id of MODULE_IDS) {
      map[id] = readModuleCollapsedFromStorage(id);
    }
    return map;
  });

  useEffect(() => {
    const refresh = () => {
      const map: Record<string, boolean> = {};
      for (const id of MODULE_IDS) {
        map[id] = readModuleCollapsedFromStorage(id);
      }
      setCollapseMap(map);
    };

    moduleCollapseListeners.add(refresh);
    return () => {
      moduleCollapseListeners.delete(refresh);
    };
  }, []);

  const toggleModule = useCallback((moduleId: string) => {
    writeModuleCollapsed(moduleId, !readModuleCollapsedFromStorage(moduleId));
  }, []);

  return { collapseMap, toggleModule };
}

// ── Per-section collapse state (unified mode) ─────────────────────────

const SECTION_COLLAPSE_PREFIX = 'forsa-section-collapsed-';
const sectionCollapseListeners = new Set<() => void>();

/** Stable key for localStorage: module + translation key (title). */
function getSectionCollapseKey(section: MenuSection): string {
  return `${section.moduleId || 'standalone'}-${section.title}`;
}

function readSectionCollapsedFromStorage(sectionKey: string): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return window.localStorage.getItem(`${SECTION_COLLAPSE_PREFIX}${sectionKey}`) === 'true';
  } catch {
    return false;
  }
}

function writeSectionCollapsed(sectionKey: string, collapsed: boolean) {
  try {
    window.localStorage.setItem(`${SECTION_COLLAPSE_PREFIX}${sectionKey}`, collapsed ? 'true' : 'false');
  } catch {
    /* ignore */
  }
  sectionCollapseListeners.forEach(fn => fn());
}

function useSectionCollapseState(): {
  isSectionCollapsed: (sectionKey: string) => boolean;
  toggleSection: (sectionKey: string) => void;
} {
  const [, setTick] = useState(0);

  useEffect(() => {
    const refresh = () => setTick(n => n + 1);
    sectionCollapseListeners.add(refresh);
    return () => {
      sectionCollapseListeners.delete(refresh);
    };
  }, []);

  const isSectionCollapsed = useCallback(
    (sectionKey: string) => readSectionCollapsedFromStorage(sectionKey),
    [],
  );

  const toggleSection = useCallback((sectionKey: string) => {
    writeSectionCollapsed(sectionKey, !readSectionCollapsedFromStorage(sectionKey));
  }, []);

  return { isSectionCollapsed, toggleSection };
}

// ── Accent border colors per module ───────────────────────────────────

const MODULE_ACCENT: Record<string, string> = {
  dashboard: 'border-s-purple-500',
  marketplace: 'border-s-blue-500',
  sales: 'border-s-amber-500',
  reports: 'border-s-emerald-500',
};

const MODULE_ACCENT_RTL: Record<string, string> = {
  dashboard: 'border-e-purple-500',
  marketplace: 'border-e-blue-500',
  sales: 'border-e-amber-500',
  reports: 'border-e-emerald-500',
};

const MODULE_ICON_BG: Record<string, string> = {
  dashboard: 'bg-purple-500/15 text-purple-400',
  marketplace: 'bg-blue-500/15 text-blue-400',
  sales: 'bg-amber-500/15 text-amber-400',
  reports: 'bg-emerald-500/15 text-emerald-400',
};

// ── Props ─────────────────────────────────────────────────────────────

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

// ── Module Header Component ───────────────────────────────────────────

const ModuleHeader: React.FC<{
  section: MenuSection;
  isCollapsed: boolean;
  dir: string;
  t: (key: string) => string;
  isModuleCollapsed: boolean;
  onToggle: () => void;
}> = ({ section, isCollapsed, dir, t, isModuleCollapsed, onToggle }) => {
  const moduleId = section.moduleId || '';

  const moduleIcon = (section as any).moduleIcon as string | undefined;
  const ModuleIcon = moduleIcon ? resolveIcon(moduleIcon) : null;
  const labelText = t(section.title) || section.title;
  const isRTL = dir === 'rtl';

  if (isCollapsed) {
    return ModuleIcon ? (
      <div className="flex justify-center py-2 mb-1">
        <div className={`p-2 rounded-lg ${MODULE_ICON_BG[moduleId] || 'bg-white/5 text-zinc-muted'}`}>
          <ModuleIcon className="w-4 h-4" />
        </div>
      </div>
    ) : null;
  }

  return (
    <button
      type="button"
      onClick={onToggle}
      className={`
        w-full flex items-center gap-3 px-5 py-2.5 mb-1 transition-all group
        border-s-2 ${isRTL ? (MODULE_ACCENT_RTL[moduleId] || 'border-e-white/10') : (MODULE_ACCENT[moduleId] || 'border-s-white/10')}
        hover:bg-white/5
      `}
    >
      {ModuleIcon && (
        <div className={`p-1.5 rounded-md shrink-0 ${MODULE_ICON_BG[moduleId] || 'bg-white/5 text-zinc-muted'}`}>
          <ModuleIcon className="w-3.5 h-3.5" />
        </div>
      )}
      <span className="flex-1 text-xs font-black text-zinc-text uppercase tracking-widest text-start truncate">
        {labelText}
      </span>
      <ChevronDown
        className={`w-3.5 h-3.5 text-zinc-muted transition-transform duration-200 shrink-0 ${
          isModuleCollapsed ? '-rotate-90' : ''
        }`}
      />
    </button>
  );
};

// ── Section Header Component (collapsible group label) ────────────────

const SectionHeader: React.FC<{
  section: MenuSection;
  isSectionCollapsed: boolean;
  onToggle: () => void;
  t: (key: string) => string;
}> = ({ section, isSectionCollapsed, onToggle, t }) => {
  const labelText = t(section.title) || section.title;

  return (
    <button
      type="button"
      onClick={onToggle}
      className="w-full flex items-center gap-2 px-5 py-1 mb-3 group hover:bg-white/5 transition-all rounded-sm"
    >
      <span className="flex-1 text-xs font-black text-zinc-muted/60 uppercase tracking-[0.2em] text-start truncate">
        {labelText}
      </span>
      <ChevronDown
        className={`w-3 h-3 text-zinc-muted/60 transition-transform duration-200 shrink-0 ${
          isSectionCollapsed ? '-rotate-90' : ''
        }`}
      />
    </button>
  );
};

// ── Main Sidebar Component ────────────────────────────────────────────

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

  // Read all module / section collapse states
  const { collapseMap, toggleModule } = useModuleCollapseState();
  const { isSectionCollapsed, toggleSection } = useSectionCollapseState();

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
    for (const [prefix, feature] of Object.entries(FEATURE_MAP)) {
      if (base === prefix || base.startsWith(`${prefix}/`)) return feature;
    }
    return null;
  };

  // Filter sections: module headers pass through even with 0 items
  const filteredSections = dynamicSections
    .map(section => {
      if (section.isModuleHeader) return section;
      return {
        ...section,
        items: section.items.filter(item => {
          const feature = getFeatureForPath(item.path);
          if (!feature) return true;
          return isFeatureEnabled(feature);
        }),
      };
    })
    .filter(section => section.isModuleHeader || section.items.length > 0);

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

  const allPaths = filteredSections
    .filter(s => !s.isModuleHeader)
    .flatMap(s => s.items.map(i => i.path));
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
          {/* Precompute section counts per module to avoid O(n^2) per-section lookups */}
          {(() => {
            const moduleSectionCounts: Record<string, number> = {};
            for (const s of filteredSections) {
              if (!s.isModuleHeader && s.moduleId) {
                moduleSectionCounts[s.moduleId] = (moduleSectionCounts[s.moduleId] || 0) + 1;
              }
            }
            return filteredSections.map((section, idx) => {
            // ── Module Header (unified mode) ──
            if (section.isModuleHeader) {
              const mid = section.moduleId || '';
              return (
                <ModuleHeader
                  key={`module-${mid}`}
                  section={section}
                  isCollapsed={isCollapsed}
                  dir={dir}
                  t={t}
                  isModuleCollapsed={!!collapseMap[mid]}
                  onToggle={() => toggleModule(mid)}
                />
              );
            }

            // ── Regular section ──
            // In unified mode, check if parent module is collapsed
            const moduleCollapsed = section.moduleId ? !!collapseMap[section.moduleId] : false;

            if (moduleCollapsed && !isCollapsed) {
              return null;
            }

            const isSingleSectionInModule = section.moduleId
              ? (moduleSectionCounts[section.moduleId] ?? 0) <= 1
              : false;

            const sectionKey = getSectionCollapseKey(section);
            const sectionCollapsed = isSectionCollapsed(sectionKey);
            const showSectionHeader =
              !isCollapsed && section.items.length > 0 && !isSingleSectionInModule;

            return (
              <nav key={sectionKey} className="space-y-1 mb-8">
                {showSectionHeader && (
                  <SectionHeader
                    section={section}
                    isSectionCollapsed={sectionCollapsed}
                    onToggle={() => toggleSection(sectionKey)}
                    t={t}
                  />
                )}
                {!sectionCollapsed &&
                  section.items.map(item => {
                  const Icon = resolveIcon(item.icon);
                  const isActive = activePath !== null && item.path === activePath;
                  const labelText = t(item.label) || item.label;
                  return (
                    <Link
                      key={item.path}
                      href={item.path}
                      onMouseEnter={() => prefetchRouteData(item.path)}
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
            );
          });
          })()}
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
