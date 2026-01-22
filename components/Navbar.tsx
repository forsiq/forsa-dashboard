
import React from 'react';
import { Menu, Search, Bell, Sun, Moon, ChevronDown } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { Logo } from './Logo';

interface NavbarProps {
  onMenuClick: () => void;
  isDarkMode: boolean;
  toggleTheme: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onMenuClick, isDarkMode, toggleTheme }) => {
  const { t } = useLanguage();

  return (
    <header className="sticky top-0 z-20 h-16 bg-obsidian-panel border-b border-white/5 px-4 md:px-8 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <button 
          onClick={onMenuClick}
          className="p-2 -ms-2 text-zinc-muted hover:bg-obsidian-hover rounded-sm lg:hidden"
        >
          <Menu className="w-5 h-5 rtl:rotate-180" />
        </button>
        
        <div className="flex items-center gap-2 lg:hidden">
           <Logo className="w-6 h-6" />
        </div>

        <div className="hidden md:flex items-center relative group">
          <Search className="absolute left-3 rtl:left-auto rtl:right-3 w-4 h-4 text-zinc-muted group-focus-within:text-brand transition-colors" />
          <input 
            type="text" 
            placeholder={t('search.placeholder')} 
            className="h-9 pl-10 pr-4 rtl:pr-10 rtl:pl-4 rounded-sm bg-obsidian-outer border border-white/5 focus:border-white/10 text-sm w-96 text-zinc-text transition-all outline-none placeholder-zinc-muted"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Language switcher removed per user request */}

        <button 
          onClick={toggleTheme}
          className="p-2 text-zinc-muted hover:bg-obsidian-hover rounded-sm transition-all"
        >
          {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        <button className="p-2 text-zinc-muted hover:bg-obsidian-hover rounded-sm relative">
          <Bell className="w-4 h-4" />
          <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-danger rounded-full"></span>
        </button>

        <div className="h-6 w-px bg-white/5 mx-1 hidden sm:block"></div>

        <button className="flex items-center gap-2.5 p-1 rounded-sm hover:bg-obsidian-hover transition-all group">
          <div className="w-8 h-8 rounded-sm bg-obsidian-outer border border-white/5 flex items-center justify-center text-xs font-bold text-zinc-text">AM</div>
          <div className="hidden sm:block text-start">
            <p className="text-xs font-bold text-zinc-text leading-none">Alex Morgan</p>
            <p className="text-[10px] text-zinc-muted font-medium">Catalog Admin</p>
          </div>
          <ChevronDown className="w-3 h-3 text-zinc-muted group-hover:text-zinc-text transition-colors" />
        </button>
      </div>
    </header>
  );
};
