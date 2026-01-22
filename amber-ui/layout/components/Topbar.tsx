
import React, { useState, useRef, useEffect } from 'react';
import { Search, Bell, Menu, ChevronDown, User, LogOut, Moon, Sun, Laptop, Languages, HelpCircle, Settings } from 'lucide-react';
import { AmberLogo } from '../../components/AmberLogo';
import { Link, useNavigate } from 'react-router-dom';
import { paths } from '../../../routes/paths';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useProjects } from '../../../contexts/ProjectContext'; 
import { SearchModal } from '../../../components/SearchModal';
import { cn } from '../../../lib/cn';

export const AmberTopbar = ({ onOpenSidebar }: { onOpenSidebar: () => void }) => {
  const { language, setLanguage, t, dir } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const { activeProject } = useProjects();
  const navigate = useNavigate();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<'notif' | 'profile' | null>(null);
  
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

  const toggleDropdown = (name: 'notif' | 'profile') => {
    setActiveDropdown(prev => prev === name ? null : name);
  };

  const notifications = [
    { id: 1, text: 'Inventory Sync', time: '2m', type: 'success' },
    { id: 2, text: 'New Login', time: '14m', type: 'info' },
    { id: 3, text: 'Low Stock Alert', time: '1h', type: 'danger' },
  ];

  return (
    <header className="sticky top-0 z-40 h-16 bg-obsidian-panel border-b border-border px-6 flex items-center justify-between shadow-lg">
      <div className="flex items-center gap-6">
        <button 
          onClick={onOpenSidebar} 
          className="lg:hidden w-10 h-10 flex items-center justify-center text-zinc-muted hover:text-zinc-text transition-colors bg-white/5 rounded-sm"
        >
          <Menu className="w-5 h-5" />
        </button>
        <Link to={paths.root} className="flex items-center gap-4 group">
          <div className="p-1.5 bg-white/5 rounded-sm border border-border group-hover:border-brand/20 transition-all">
            <AmberLogo className="w-8 h-8 group-hover:scale-105 transition-transform" />
          </div>
          <div className="hidden sm:block">
            <span className="text-lg font-black tracking-tighter text-zinc-text uppercase brand-slant leading-none block">ZoneVast</span>
            <span className="text-[9px] font-bold text-brand/80 uppercase tracking-[0.4em] mt-1 block">{t('header.enterprise')}</span>
          </div>
        </Link>
      </div>

      <div className="flex-1 hidden lg:block" />

      <div className="flex items-center gap-4" ref={dropdownRef}>
        
        <div className="hidden md:block">
           <button 
             onClick={() => setIsSearchOpen(true)}
             className="w-10 h-10 flex items-center justify-center text-zinc-muted hover:text-zinc-text rounded-sm hover:bg-white/5 transition-all"
           >
             <Search className="w-5 h-5" />
           </button>
        </div>

        {/* Notifications */}
        <div className="relative">
          <button 
            onClick={() => toggleDropdown('notif')}
            className={cn(
              "w-10 h-10 flex items-center justify-center text-zinc-muted hover:text-zinc-text relative transition-all rounded-sm",
              activeDropdown === 'notif' && "bg-obsidian-card text-brand border border-border"
            )}
            aria-label="View Notifications"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-brand rounded-full animate-pulse shadow-[0_0_10px_rgba(245,196,81,0.8)]"></span>
          </button>

          {activeDropdown === 'notif' && (
            <div className={cn(
              "absolute top-full mt-2 w-80 bg-obsidian-card border border-border rounded-sm shadow-2xl py-1 animate-in fade-in zoom-in-95 duration-100",
              dir === 'rtl' ? "left-0" : "right-0"
            )}>
              <div className="px-5 py-4 border-b border-border flex items-center justify-between bg-white/[0.02]">
                <span className="text-[10px] font-black text-zinc-text uppercase tracking-[0.3em]">{t('notif.title')}</span>
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

        <div className="h-8 w-px bg-white/10 mx-1"></div>
        
        {/* Profile Dropdown */}
        <div className="relative">
          <button 
            onClick={() => toggleDropdown('profile')}
            className={cn(
              "flex items-center gap-4 h-12 px-3 rounded-sm hover:bg-white/5 transition-all group",
              activeDropdown === 'profile' && "bg-obsidian-card border border-border"
            )}
          >
            <div className="w-9 h-9 rounded-sm bg-obsidian-outer border border-border flex items-center justify-center text-sm font-black text-brand group-hover:border-brand/40 transition-all shadow-inner brand-slant">
              AM
            </div>
            <div className="hidden sm:block text-start leading-none space-y-1">
              <p className="text-sm font-bold text-zinc-text tracking-tight">Alex Morgan</p>
              <p className="text-xs text-zinc-muted font-bold uppercase tracking-[0.2em] opacity-60">Admin_S_Node</p>
            </div>
            <ChevronDown className={cn("hidden sm:block w-4 h-4 text-zinc-muted transition-transform", activeDropdown === 'profile' && "rotate-180")} />
          </button>

          {activeDropdown === 'profile' && (
            <div className={cn(
              "absolute top-full mt-2 w-72 bg-obsidian-card border border-border rounded-sm shadow-2xl animate-in fade-in zoom-in-95 duration-100 overflow-hidden",
              dir === 'rtl' ? "left-0" : "right-0"
            )}>
              {/* User Header */}
              <div className="px-5 py-4 border-b border-white/5 bg-white/[0.02]">
                <p className="text-xs font-black text-zinc-text uppercase tracking-wide">Alex Morgan</p>
                <p className="text-[10px] text-zinc-muted uppercase tracking-widest mt-1">alex.morgan@zonevast.corp</p>
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
                  to={paths.profile} 
                  onClick={() => setActiveDropdown(null)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 text-[10px] font-black uppercase tracking-widest text-zinc-muted hover:bg-white/5 hover:text-zinc-text rounded-sm transition-colors"
                >
                  <User className="w-4 h-4" />
                  {t('profile.account')}
                </Link>
                <Link 
                  to={paths.settings} 
                  onClick={() => setActiveDropdown(null)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 text-[10px] font-black uppercase tracking-widest text-zinc-muted hover:bg-white/5 hover:text-zinc-text rounded-sm transition-colors"
                >
                  <Settings className="w-4 h-4" />
                  {t('nav.settings')}
                </Link>
                <Link 
                  to="/help" 
                  onClick={() => setActiveDropdown(null)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 text-[10px] font-black uppercase tracking-widest text-zinc-muted hover:bg-white/5 hover:text-zinc-text rounded-sm transition-colors"
                >
                  <HelpCircle className="w-4 h-4" />
                  {t('nav.help')}
                </Link>
              </div>

              {/* Footer */}
              <div className="p-2 bg-white/[0.02]">
                <button className="w-full flex items-center gap-3 px-3 py-2.5 text-[10px] font-black uppercase tracking-widest text-danger/80 hover:bg-danger/5 hover:text-danger rounded-sm transition-colors">
                  <LogOut className="w-4 h-4" />
                  {t('profile.logout')}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </header>
  );
};
