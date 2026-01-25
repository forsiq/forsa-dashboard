
import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Briefcase, 
  ChevronDown, 
  Search, 
  Bell, 
  Check, 
  Plus, 
  LogOut, 
  Settings,
  LayoutGrid,
  User,
  Laptop,
  Sun,
  Moon,
  Languages,
  HelpCircle,
  CreditCard,
  LifeBuoy
} from 'lucide-react';
import { useLanguage } from '../../../amber-ui/contexts/LanguageContext';
import { useTheme } from '../../../amber-ui/contexts/ThemeContext';
import { useProjects } from '../../../contexts/ProjectContext';
import { AmberLogo } from '../../../amber-ui/components/AmberLogo';
import { SearchModal } from '../../../components/SearchModal';
import { cn } from '../../../lib/cn';
import { paths } from '../../../routes/paths';

export const PortalHeader = () => {
  const { t, dir, language, setLanguage } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const { projects, activeProject, selectProject } = useProjects();
  const navigate = useNavigate();
  
  const [activeDropdown, setActiveDropdown] = useState<'notif' | 'profile' | 'project' | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleDropdown = (key: 'notif' | 'profile' | 'project') => {
    setActiveDropdown(prev => prev === key ? null : key);
  };

  const handleProjectSwitch = (id: string) => {
    selectProject(id);
    setActiveDropdown(null);
    navigate(paths.dashboard);
  };

  const notifications = [
    { id: 1, text: 'Inventory Sync', time: '2m', type: 'success' },
    { id: 2, text: 'New Login', time: '14m', type: 'info' },
    { id: 3, text: 'Low Stock Alert', time: '1h', type: 'danger' },
  ];

  return (
    <header ref={containerRef} className="sticky top-0 z-40 h-16 bg-obsidian-panel/80 backdrop-blur-md border-b border-white/5 px-6 flex items-center justify-between">
      {/* Left: Brand & Project Switcher */}
      <div className="flex items-center gap-6">
        <Link to="/portal" className="flex items-center gap-3 group">
          <AmberLogo className="w-8 h-8 group-hover:scale-105 transition-transform" />
          <div className="hidden sm:block">
            <span className="text-lg font-black text-zinc-text uppercase italic tracking-tighter leading-none block">{t('app.name')}</span>
            <span className="text-[9px] font-bold text-brand/80 uppercase tracking-[0.4em] mt-1 block">{t('portal.title')}</span>
          </div>
        </Link>

        {/* Divider */}
        <div className="hidden md:block h-8 w-px bg-white/5" />

        {/* Project Switcher */}
        <div className="relative hidden md:block">
            <button 
              onClick={() => toggleDropdown('project')}
              className={cn(
                "w-60 h-10 flex items-center justify-between gap-3 px-4 bg-obsidian-outer border border-white/5 rounded-sm hover:border-brand/30 hover:bg-white/[0.02] transition-all group",
                activeDropdown === 'project' && "border-brand/40 ring-1 ring-brand/10"
              )}
            >
              <div className="flex items-center gap-3 overflow-hidden">
                 <div className="p-1 bg-white/5 rounded-sm text-brand">
                    <Briefcase className="w-3.5 h-3.5" />
                 </div>
                 <div className="flex flex-col items-start truncate">
                    <span className="text-[9px] font-black text-zinc-muted uppercase tracking-widest">{t('portal.header.current_project')}</span>
                    <span className="text-xs font-bold text-zinc-text truncate w-32 text-left">{activeProject?.name || t('portal.header.select_project')}</span>
                 </div>
              </div>
              <ChevronDown className={cn("w-3.5 h-3.5 text-zinc-muted transition-transform", activeDropdown === 'project' && "rotate-180")} />
            </button>

            {activeDropdown === 'project' && (
              <div className="absolute top-full left-0 w-80 mt-2 bg-obsidian-card border border-white/10 rounded-sm shadow-2xl py-1 animate-in fade-in zoom-in-95 duration-100 z-50">
                 <div className="px-3 py-2 text-[9px] font-black text-zinc-muted uppercase tracking-widest border-b border-white/5 mb-1">
                    {t('portal.header.active_projects')}
                 </div>
                 <div className="max-h-[300px] overflow-y-auto">
                    {projects.map(proj => (
                       <button 
                         key={proj.id}
                         onClick={() => handleProjectSwitch(proj.id)}
                         className={cn(
                            "w-full flex items-center justify-between px-4 py-2.5 hover:bg-white/5 transition-colors group",
                            activeProject?.id === proj.id && "bg-brand/5"
                         )}
                       >
                          <div className="text-left">
                             <p className={cn("text-xs font-bold uppercase tracking-tight", activeProject?.id === proj.id ? "text-brand" : "text-zinc-text")}>{proj.name}</p>
                             <p className="text-[9px] text-zinc-muted uppercase">{proj.plan}</p>
                          </div>
                          {activeProject?.id === proj.id && <Check className="w-3.5 h-3.5 text-brand" />}
                       </button>
                    ))}
                 </div>
                 <div className="border-t border-white/5 mt-1 pt-1">
                    <Link to="/portal" className="flex items-center gap-2 px-4 py-2.5 text-[10px] font-black text-zinc-muted hover:text-brand hover:bg-white/5 uppercase tracking-widest transition-colors">
                       <Plus className="w-3.5 h-3.5" /> {t('portal.header.new_project')}
                    </Link>
                 </div>
              </div>
            )}
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-4">
         <div className="relative hidden md:block group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-muted group-focus-within:text-brand transition-colors" />
            <input 
              type="text" 
              placeholder={t('portal.header.search_placeholder')}
              className="h-9 w-64 bg-obsidian-outer border border-white/5 rounded-sm pl-10 pr-4 text-xs font-bold text-zinc-text outline-none focus:border-brand/30 transition-all placeholder:text-zinc-muted/50 cursor-pointer"
              readOnly
              onClick={() => setIsSearchOpen(true)}
            />
         </div>

         {/* Notifications Dropdown */}
         <div className="relative">
            <button 
              onClick={() => toggleDropdown('notif')}
              className={cn(
                "relative p-2 rounded-sm transition-all",
                activeDropdown === 'notif' ? "bg-obsidian-card text-brand border border-white/10" : "text-zinc-muted hover:text-zinc-text hover:bg-white/5"
              )}
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-brand rounded-full animate-pulse" />
            </button>

            {activeDropdown === 'notif' && (
              <div className={cn(
                "absolute top-full mt-2 w-80 bg-obsidian-card border border-white/10 rounded-sm shadow-2xl py-1 animate-in fade-in zoom-in-95 duration-100 z-50",
                dir === 'rtl' ? "left-0" : "right-0"
              )}>
                <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
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
                   {t('common.view_all')}
                </Link>
              </div>
            )}
         </div>

         <div className="h-6 w-px bg-white/10 mx-1" />

         {/* Profile Dropdown */}
         <div className="relative">
            <button 
              onClick={() => toggleDropdown('profile')}
              className={cn(
                "flex items-center gap-3 p-1 rounded-sm transition-all group",
                activeDropdown === 'profile' ? "bg-obsidian-card border border-white/10" : "hover:bg-white/5"
              )}
            >
               <div className="w-8 h-8 rounded-sm bg-obsidian-outer border border-white/10 flex items-center justify-center text-xs font-black text-zinc-text shadow-sm">
                  AM
               </div>
               <div className="hidden sm:block text-left">
                  <p className="text-xs font-bold text-zinc-text leading-none">Alex Morgan</p>
                  <p className="text-[9px] text-zinc-muted uppercase tracking-wide mt-0.5">Admin</p>
               </div>
               <ChevronDown className={cn("w-3.5 h-3.5 text-zinc-muted transition-transform", activeDropdown === 'profile' && "rotate-180")} />
            </button>

            {activeDropdown === 'profile' && (
              <div className={cn(
                "absolute top-full mt-2 w-72 bg-obsidian-card border border-white/10 rounded-sm shadow-2xl animate-in fade-in zoom-in-95 duration-100 overflow-hidden z-50",
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
                    to={paths.billing}
                    onClick={() => setActiveDropdown(null)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 text-[10px] font-black uppercase tracking-widest text-zinc-muted hover:bg-white/5 hover:text-zinc-text rounded-sm transition-colors"
                  >
                    <CreditCard className="w-4 h-4" />
                    Billing
                  </Link>
                  <Link 
                    to={paths.support}
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
