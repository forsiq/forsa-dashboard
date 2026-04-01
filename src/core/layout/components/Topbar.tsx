
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Search, Bell, Menu, ChevronDown, User, LogOut, Moon, Sun, Laptop, Languages, HelpCircle, Settings, CreditCard, LifeBuoy, Grip, Package } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { AmberLogo } from '../../components/AmberLogo';
import { SearchModal, ServiceItem } from './SearchModal';
import { getServicesForTopbar, type QuickApp as ConfigQuickApp } from '../../../config/services';

export type Language = 'en' | 'ar' | 'ku';
export type Theme = 'light' | 'dark';

interface Notification {
  id: number;
  text: string;
  time: string;
  type: 'success' | 'info' | 'danger';
}

interface QuickApp {
  id: string;
  name: string;
  url: string;
  icon: any;
  color: string;
  bg: string;
}

// Use ConfigQuickApp from config
type QuickAppInput = ConfigQuickApp | QuickApp;

interface AmberTopbarProps {
  onOpenSidebar: () => void;
  // Language & Theme - passed from app's own context
  language: Language;
  setLanguage: (lang: Language) => void;
  theme: Theme;
  toggleTheme: () => void;
  t: (key: string) => string;
  dir: 'ltr' | 'rtl';
  // Optional user data
  user?: {
    name: string;
    email: string;
    role?: string;
    initials?: string;
  };
  notifications?: Notification[];
  appLabel?: string;
  showSearch?: boolean;
  showNotifications?: boolean;
  showServices?: boolean;
  services?: QuickApp[];
  servicesHref?: string;
}

// Default services configuration - loaded from config
// Can be overridden by props if needed

export const AmberTopbar: React.FC<AmberTopbarProps> = ({
  onOpenSidebar,
  language,
  setLanguage,
  theme,
  toggleTheme,
  t,
  dir,
  user,
  notifications = [
    { id: 1, text: 'Inventory Sync', time: '2m', type: 'success' },
    { id: 2, text: 'New Login', time: '14m', type: 'info' },
    { id: 3, text: 'Low Stock Alert', time: '1h', type: 'danger' },
  ],
  appLabel,
  showSearch = true,
  showNotifications = true,
  showServices = true,
  services: servicesProp,
  servicesHref = '/portal',
}) => {
  // Use services from config if not provided as prop
  const services = useMemo(() => {
    return servicesProp || getServicesForTopbar(t);
  }, [servicesProp, t]);
  const navigate = useNavigate();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<'notif' | 'profile' | 'apps' | null>(null);

  // Get user from localStorage if not provided as prop
  const [localUser] = useState<{ username: string; email?: string } | null>(() => {
    if (user) return { username: user.name, email: user.email };
    try {
      const stored = localStorage.getItem('user');
      return stored ? JSON.parse(stored) : null;
    } catch (e) {
      console.error('Failed to parse user from localStorage', e);
      return null;
    }
  });

  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleDropdown = (name: 'notif' | 'profile' | 'apps') => {
    setActiveDropdown(prev => prev === name ? null : name);
  };

  const handleLogout = () => {
    // Clear user from localStorage
    localStorage.removeItem('user');
    navigate('/login');
  };

  // Use localUser if user prop not provided
  const displayUser = user || {
    name: localUser?.username || 'Guest User',
    email: localUser?.email || '',
    role: 'User',
    initials: localUser?.username ? localUser.username.substring(0, 2).toUpperCase() : 'GU'
  };

  return (
    <header className="sticky top-0 z-[100] h-16 bg-obsidian-panel border-b border-white/5 px-6 flex items-center justify-between shadow-lg">
      <div className="flex items-center gap-6">
        <button
          onClick={onOpenSidebar}
          className="lg:hidden w-10 h-10 flex items-center justify-center text-zinc-muted hover:text-zinc-text transition-colors bg-white/5 rounded-sm"
        >
          <Menu className="w-5 h-5" />
        </button>
        <Link to="/" className="flex items-center gap-4 group">
          <div className="p-1.5 bg-white/5 rounded-sm border border-white/5 group-hover:border-brand/20 transition-all">
            <AmberLogo className="w-8 h-8 group-hover:scale-105 transition-transform" />
          </div>
          <div className="hidden sm:block">
            <span className="text-lg font-black tracking-tighter text-zinc-text uppercase brand-slant leading-none block">
              {appLabel || 'ZoneVast'}
            </span>
            <span className="text-[9px] font-bold text-brand/80 uppercase tracking-[0.4em] mt-1 block">
              {t('header.enterprise') || 'Enterprise Portal'}
            </span>
          </div>
        </Link>
      </div>

      <div className="flex-1 hidden lg:block" />

      <div className="flex items-center gap-4" ref={dropdownRef}>

        {showSearch && (
          <div className="hidden md:block">
            <button
              onClick={() => setIsSearchOpen(true)}
              className="w-10 h-10 flex items-center justify-center text-zinc-muted hover:text-zinc-text rounded-sm hover:bg-white/5 transition-all"
            >
              <Search className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Service Switcher (App Launcher) */}
        {showServices && (
          <div className="relative" ref={activeDropdown === 'apps' ? dropdownRef : null}>
            <button
              onClick={() => toggleDropdown('apps')}
              className={cn(
                "w-10 h-10 flex items-center justify-center text-zinc-muted hover:text-zinc-text relative transition-all rounded-sm",
                activeDropdown === 'apps' && "bg-obsidian-card text-brand border border-white/5"
              )}
              title="Switch Service"
            >
              <Grip className="w-5 h-5" />
            </button>

            {activeDropdown === 'apps' && (
              <div className={cn(
                "absolute top-full mt-2 w-[320px] bg-obsidian-card border border-white/5 rounded-sm shadow-2xl animate-in fade-in zoom-in-95 duration-100 z-50",
                dir === 'rtl' ? "left-0" : "right-0"
              )}>
                {services.length === 0 ? (
                  <div className="p-6 text-center">
                    <Package className="w-8 h-8 text-zinc-muted mx-auto mb-2 opacity-50" />
                    <p className="text-[10px] font-bold text-zinc-muted uppercase tracking-widest">No Services Available</p>
                  </div>
                ) : (
                  <div className="p-2 grid grid-cols-3 gap-1">
                    {services.map((app) => {
                      const IconComponent = app.icon;
                      return (
                        <a
                          key={app.id}
                          href={app.url}
                          onClick={(e) => {
                            setActiveDropdown(null);
                            // If it's a relative URL, use navigate instead
                            if (!app.url.startsWith('http')) {
                              e.preventDefault();
                              navigate(app.url);
                            }
                          }}
                          className="flex flex-col items-center justify-center p-3 hover:bg-white/5 rounded-sm transition-all group text-center gap-2"
                          target={app.url.startsWith('http') ? '_blank' : undefined}
                          rel={app.url.startsWith('http') ? 'noopener noreferrer' : undefined}
                        >
                          <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center border border-white/5 bg-obsidian-outer group-hover:scale-110 transition-transform", app.bg)}>
                            <IconComponent className={cn("w-5 h-5", app.color)} strokeWidth={1.5} />
                          </div>
                          <span className="text-[10px] font-bold text-zinc-muted group-hover:text-zinc-text leading-tight line-clamp-1">{app.name}</span>
                        </a>
                      );
                    })}
                  </div>
                )}
                {servicesHref && (
                  <Link
                    to={servicesHref}
                    onClick={() => setActiveDropdown(null)}
                    className="block border-t border-white/5 text-center text-[10px] font-black text-brand hover:underline uppercase tracking-widest py-3 hover:bg-white/5 transition-colors"
                  >
                    View Service Directory
                  </Link>
                )}
              </div>
            )}
          </div>
        )}

        {/* Notifications */}
        {showNotifications && (
          <div className="relative" ref={activeDropdown === 'notif' ? dropdownRef : null}>
            <button
              onClick={() => toggleDropdown('notif')}
              className={cn(
                "w-10 h-10 flex items-center justify-center text-zinc-muted hover:text-zinc-text relative transition-all rounded-sm",
                activeDropdown === 'notif' ? "bg-obsidian-card text-brand border border-white/5" : ""
              )}
              aria-label="View Notifications"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-brand rounded-full animate-pulse shadow-[0_0_10px_rgba(245,196,81,0.8)]"></span>
            </button>

            {activeDropdown === 'notif' && (
              <div className={cn(
                "absolute top-full mt-2 w-80 bg-obsidian-card border border-white/5 rounded-sm shadow-2xl py-1 animate-in fade-in zoom-in-95 duration-100 z-50",
                dir === 'rtl' ? "left-0" : "right-0"
              )}>
                <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                  <span className="text-[10px] font-black text-zinc-text uppercase tracking-[0.3em]">
                    {t('notif.title') || 'Signals & Tasks'}
                  </span>
                </div>
                <div className="max-h-[350px] overflow-y-auto">
                  {notifications.map(n => (
                    <div key={n.id} className="px-5 py-4 hover:bg-white/5 transition-colors cursor-pointer border-b border-white/[0.02]">
                      <p className="text-[11px] font-bold text-zinc-text uppercase tracking-tight leading-tight">{n.text}</p>
                      <span className="text-[9px] font-black text-zinc-muted uppercase mt-1.5 block opacity-60">{n.time} ago</span>
                    </div>
                  ))}
                </div>
                <Link to="/notifications" onClick={() => setActiveDropdown(null)} className="block w-full py-3 text-center text-[10px] font-black text-brand uppercase tracking-widest hover:bg-white/5 transition-colors">
                  View All Signals
                </Link>
              </div>
            )}
          </div>
        )}

        <div className="h-8 w-px bg-white/5 mx-1"></div>

        {/* Profile Dropdown */}
        <div className="relative" ref={activeDropdown === 'profile' ? dropdownRef : null}>
          <button
            onClick={() => toggleDropdown('profile')}
            className={cn(
              "flex items-center gap-4 h-12 px-3 rounded-sm hover:bg-white/5 transition-all group",
              activeDropdown === 'profile' ? "bg-obsidian-card border border-white/5" : ""
            )}
          >
            <div className="w-9 h-9 rounded-sm bg-obsidian-outer border border-white/5 flex items-center justify-center text-sm font-black text-brand group-hover:border-brand/40 transition-all shadow-inner brand-slant">
              {displayUser.initials}
            </div>
            <div className="hidden sm:block text-start leading-none space-y-1">
              <p className="text-sm font-bold text-zinc-text tracking-tight">{displayUser.name}</p>
              <p className="text-xs text-zinc-muted font-bold uppercase tracking-[0.2em] opacity-60">{displayUser.role}</p>
            </div>
            <ChevronDown className={cn("hidden sm:block w-4 h-4 text-zinc-muted transition-transform", activeDropdown === 'profile' && "rotate-180")} />
          </button>

          {activeDropdown === 'profile' && (
            <div className={cn(
              "absolute top-full mt-2 w-72 bg-obsidian-card border border-white/5 rounded-sm shadow-2xl animate-in fade-in zoom-in-95 duration-100 overflow-hidden z-50",
              dir === 'rtl' ? "left-0" : "right-0"
            )}>
              {/* User Header */}
              <div className="px-5 py-4 border-b border-white/5 bg-white/[0.02]">
                <p className="text-xs font-black text-zinc-text uppercase tracking-wide">{displayUser.name}</p>
                <p className="text-[10px] text-zinc-muted uppercase tracking-widest mt-1">{displayUser.email}</p>
              </div>

              {/* Preferences Section */}
              <div className="p-2 space-y-1 border-b border-white/5">
                <div className="flex items-center justify-between px-3 py-2 rounded-sm hover:bg-white/5 transition-colors group">
                  <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-zinc-muted group-hover:text-zinc-text">
                    <Laptop className="w-4 h-4" />
                    <span>Interface Theme</span>
                  </div>
                  <button
                    onClick={toggleTheme}
                    className="flex bg-obsidian-outer border border-white/10 rounded-sm p-0.5"
                  >
                    <div className={cn("p-1 rounded-sm transition-all", theme === 'light' ? "bg-white text-black shadow-sm" : "text-zinc-muted")}>
                      <Sun className="w-3 h-3" />
                    </div>
                    <div className={cn("p-1 rounded-sm transition-all", theme === 'dark' ? "bg-brand text-obsidian-outer shadow-sm" : "text-zinc-muted")}>
                      <Moon className="w-3 h-3" />
                    </div>
                  </button>
                </div>

                <div className="flex items-center justify-between px-3 py-2 rounded-sm hover:bg-white/5 transition-colors group">
                  <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-zinc-muted group-hover:text-zinc-text">
                    <Languages className="w-4 h-4" />
                    <span>Language</span>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => setLanguage('en')}
                      className={cn(
                        "text-[9px] font-black uppercase px-1.5 py-0.5 rounded-sm transition-colors border",
                        language === 'en' ? "bg-brand/10 border-brand/20 text-brand" : "border-transparent text-zinc-muted hover:text-zinc-text"
                      )}
                    >
                      EN
                    </button>
                    <button
                      onClick={() => setLanguage('ar')}
                      className={cn(
                        "text-[9px] font-black uppercase px-1.5 py-0.5 rounded-sm transition-colors border",
                        language === 'ar' ? "bg-brand/10 border-brand/20 text-brand" : "border-transparent text-zinc-muted hover:text-zinc-text"
                      )}
                    >
                      AR
                    </button>
                  </div>
                </div>
              </div>

              {/* Links Section */}
              <div className="p-2 border-b border-white/5">
                <Link
                  to="/profile"
                  onClick={() => setActiveDropdown(null)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 text-[10px] font-black uppercase tracking-widest text-zinc-muted hover:bg-white/5 hover:text-zinc-text rounded-sm transition-colors"
                >
                  <User className="w-4 h-4" />
                  {t('profile.account') || 'Account Profile'}
                </Link>
                <Link
                  to="/settings"
                  onClick={() => setActiveDropdown(null)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 text-[10px] font-black uppercase tracking-widest text-zinc-muted hover:bg-white/5 hover:text-zinc-text rounded-sm transition-colors"
                >
                  <Settings className="w-4 h-4" />
                  {t('nav.settings') || 'System Settings'}
                </Link>
                <Link
                  to="/billing"
                  onClick={() => setActiveDropdown(null)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 text-[10px] font-black uppercase tracking-widest text-zinc-muted hover:bg-white/5 hover:text-zinc-text rounded-sm transition-colors"
                >
                  <CreditCard className="w-4 h-4" />
                  Billing
                </Link>
                <Link
                  to="/support"
                  onClick={() => setActiveDropdown(null)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 text-[10px] font-black uppercase tracking-widest text-zinc-muted hover:bg-white/5 hover:text-zinc-text rounded-sm transition-colors"
                >
                  <LifeBuoy className="w-4 h-4" />
                  Support
                </Link>
                <Link
                  to="/help"
                  onClick={() => setActiveDropdown(null)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 text-[10px] font-black uppercase tracking-widest text-zinc-muted hover:bg-white/5 hover:text-zinc-text rounded-sm transition-colors"
                >
                  <HelpCircle className="w-4 h-4" />
                  {t('nav.help') || 'Help'}
                </Link>
              </div>

              {/* Footer */}
              <div className="p-2 bg-white/[0.02]">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-3 py-2.5 text-[10px] font-black uppercase tracking-widest text-danger/80 hover:bg-danger/5 hover:text-danger rounded-sm transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  {t('profile.logout') || 'Logout Session'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        suggestedServices={services.map(s => ({
          id: s.id,
          label: s.name,
          path: s.url,
          icon: s.icon,
          color: s.color,
          bg: s.bg
        }))}
        t={t}
        dir={dir}
      />
    </header>
  );
};

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ');
}
