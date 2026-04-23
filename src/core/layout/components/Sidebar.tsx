import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import {
  ChevronLeft,
  ChevronRight,
  X,
  LogOut,
} from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useNavigation } from '../../contexts/NavigationContext';
import { useFeatureConfig } from '../../contexts/FeatureContext';
import { AmberLogo } from '../../components/AmberLogo';
import { getSidebarForPath, getServiceIdFromPath, isPortalPath } from '../../../config/sidebarLoader';
import { resolveIcon } from '../../../config/navigation';

export interface MenuItem {
  label: string;
  path: string;
  icon: any;
  badge?: string | number;
}

export interface MenuSection {
  title: string;
  items: MenuItem[];
}

interface SidebarProps {
  isOpen: boolean;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  onClose: () => void;
  menuSections?: MenuSection[];
  appLabel?: string;
  showExitButton?: boolean;
}

export const AmberSidebar: React.FC<SidebarProps> = ({
  isOpen,
  isCollapsed,
  onToggleCollapse,
  onClose,
  menuSections,
  appLabel,
  showExitButton = true
}) => {
  const { t, dir } = useLanguage();
  const { activeMode, switchMode } = useNavigation();
  const { isFeatureEnabled } = useFeatureConfig();
  const router = useRouter();
  const [dynamicSections, setDynamicSections] = useState<MenuSection[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Load sidebar based on current path
  useEffect(() => {
    const loadSidebar = async () => {
      // Check if portal - don't show sidebar
      if (isPortalPath(router.pathname)) {
        setDynamicSections([]);
        return;
      }

      // If menuSections provided as prop, use them
      if (menuSections && menuSections.length > 0) {
        setDynamicSections(menuSections);
        return;
      }

      // Otherwise load dynamically based on path
      setIsLoading(true);
      try {
        const sections = await getSidebarForPath(router.pathname);
        // Resolve icon strings to components
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

    loadSidebar();
  }, [router.pathname, menuSections]);

  const sections = dynamicSections;

  /**
   * Filter sidebar sections based on feature flags.
   * Maps path prefixes to feature names in zvs.config.json.
   */
  const getFeatureForPath = (path: string): string | null => {
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
      if (path === prefix || path.startsWith(prefix + '/')) return feature;
    }
    // Core pages (dashboard, auth) always visible
    return null;
  };

  const filteredSections = sections.map(section => ({
    ...section,
    items: section.items.filter(item => {
      const feature = getFeatureForPath(item.path);
      // If no feature mapping, show the item (e.g. dashboard)
      if (!feature) return true;
      return isFeatureEnabled(feature);
    }),
  })).filter(section => section.items.length > 0);

  // Don't render sidebar on portal or if no sections
  if (isPortalPath(router.pathname)) {
    return null;
  }

  const getModeLabel = (mode: string | null) => {
    if (mode === 'generic') return t('app.suite');
    if (mode === 'admin') return 'Administration';
    if (mode === 'portal') return 'Service Portal';
    return t('app.suite');
  };

  const handleExitToPortal = () => {
    switchMode('portal');
    router.push('/portal');
  };

  // Get current service ID for label
  const currentServiceId = getServiceIdFromPath(router.pathname);

  if (isLoading) {
    return null; // Or show skeleton
  }

  return (
    <aside
      className={`
        fixed inset-y-0 z-[110] bg-obsidian-panel
        transform transition-all duration-300 ease-in-out
        ${isCollapsed ? 'w-20' : 'w-64'}
        ${isOpen
          ? 'translate-x-0'
          : dir === 'rtl' ? 'translate-x-full lg:translate-x-0' : '-translate-x-full lg:translate-x-0'
        }
        ${dir === 'rtl' ? 'right-0' : 'left-0'}
        lg:translate-x-0 shadow-xl lg:shadow-none
      `}
    >
      <div className="flex flex-col h-full">
        <div className={`h-16 flex items-center transition-all ${isCollapsed ? 'justify-center px-0' : 'px-4 justify-between'}`}>
          {!isCollapsed ? (
            <>
              <div className="flex items-center gap-3 animate-in fade-in duration-300">
                <div className="flex items-center justify-center text-brand">
                  <AmberLogo className="w-8 h-8" />
                </div>
                <div>
                  <span className="text-lg font-black text-white leading-none block uppercase tracking-wider">{t('app.name')}</span>
                  <span className="text-xs font-black text-brand uppercase tracking-widest block">
                    {appLabel || (currentServiceId ? t(`service.${currentServiceId}.name`) : getModeLabel(activeMode))}
                  </span>
                </div>
              </div>
              <button
                onClick={onToggleCollapse}
                className="p-1.5 text-zinc-muted hover:text-zinc-text hover:bg-white/5 rounded-sm transition-all hidden lg:block"
              >
                {dir === 'rtl' ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
              </button>
            </>
          ) : (
            <button
              onClick={onToggleCollapse}
              className="p-2 text-zinc-muted hover:text-brand transition-all hidden lg:block animate-in zoom-in-75 duration-300"
            >
              {dir === 'rtl' ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
            </button>
          )}

          <div className={`flex items-center ${isCollapsed ? 'hidden' : 'lg:hidden ms-auto'}`}>
             <button onClick={onClose} className="p-2 text-zinc-muted hover:text-zinc-text">
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
              {section.items.map((item) => {
                const isActive = router.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    href={item.path}
                    onClick={() => { if(window.innerWidth < 1024) onClose(); }}
                    className={`
                      flex items-center group px-3 py-2.5 text-sm font-medium transition-all rounded-md mx-3
                      ${isActive
                        ? 'bg-brand/10 text-brand shadow-sm'
                        : 'text-zinc-muted hover:text-zinc-text hover:bg-white/5'
                      }
                      ${isCollapsed ? 'justify-center px-2 mx-2' : ''}
                    `}
                    title={isCollapsed ? item.label : undefined}
                  >
                    <item.icon
                      className={`w-5 h-5 transition-colors ${isActive ? 'text-brand' : 'text-zinc-muted group-hover:text-zinc-text'} ${!isCollapsed && (dir === 'rtl' ? 'ml-3' : 'mr-3')}`}
                    />
                    {!isCollapsed && (
                      <span className="flex-1 truncate tracking-wide text-[13px] font-bold">
                        {t(item.label) || item.label}
                      </span>
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
              onClick={handleExitToPortal}
              className={`
                w-full flex items-center px-3 py-2.5 rounded-md transition-all group
                border border-transparent hover:border-brand/30 hover:bg-white/5
                ${isCollapsed ? 'justify-center' : ''}
              `}
              title={t('sidebar.back_portal')}
            >
              <div className={`p-1 bg-white/5 rounded-sm text-zinc-muted group-hover:text-brand transition-colors ${!isCollapsed ? (dir === 'rtl' ? 'ml-3' : 'mr-3') : ''}`}>
                 <LogOut className={`w-4 h-4 ${dir === 'rtl' ? 'rotate-180' : ''}`} />
              </div>
              {!isCollapsed && (
                <div className="flex flex-col items-start text-left">
                   <span className="text-xs font-black text-zinc-muted uppercase tracking-widest group-hover:text-zinc-text transition-colors">{t('sidebar.exit')}</span>
                   <span className="text-[10px] font-bold text-zinc-muted/60 uppercase tracking-tight group-hover:text-brand transition-colors">{t('sidebar.back_portal')}</span>
                </div>
              )}
            </button>
          </div>
        )}
      </div>
    </aside>
  );
};

// Export as Sidebar for compatibility
export { AmberSidebar as Sidebar };
