
import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutGrid, 
  Database, 
  X,
  BarChart3,
  Store,
  Info,
  FilePlus,
  Settings,
  ShoppingCart,
  ChevronLeft,
  ChevronRight,
  LogOut,
  HelpCircle,
  Package
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useNavigation } from '../contexts/NavigationContext';
import { Logo } from './Logo';
import { paths } from '../routes/paths';

interface SidebarProps {
  isOpen: boolean;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, isCollapsed, onToggleCollapse, onClose }) => {
  const { t, dir } = useLanguage();
  const { activeMode, clearMode } = useNavigation();
  const navigate = useNavigate();

  const handleSwitchWorkspace = () => {
    clearMode();
    navigate('/');
  };

  const menuSections = [
    {
      title: t('sidebar.main_menu'),
      items: [
        { label: t('nav.dashboard'), path: '/dashboard', icon: LayoutGrid },
        { label: t('nav.catalog'), path: paths.catalog, icon: Package }, // Stock
        { label: t('nav.admin.stores'), path: paths.adminStores, icon: Store }, // Warehouses
      ]
    },
    {
      title: t('sidebar.operations'),
      items: [
        { label: t('nav.orders'), path: paths.orders, icon: ShoppingCart },
        { label: t('form.init_resource'), path: paths.templateForm, icon: FilePlus }, // Add Stock/Item
        { label: t('nav.analytics'), path: paths.analytics, icon: BarChart3 },
      ]
    },
    {
      title: t('sidebar.general'),
      items: [
        { label: t('nav.settings'), path: paths.settings, icon: Settings },
        { label: t('nav.about'), path: '/about', icon: Info },
      ]
    }
  ];

  return (
    <aside 
      className={`
        fixed inset-y-0 z-50 bg-obsidian-panel border-e border-border
        transform transition-all duration-300 ease-in-out
        ${isCollapsed ? 'w-20' : 'w-64'}
        ${isOpen 
          ? 'translate-x-0' 
          : dir === 'rtl' ? 'translate-x-full lg:translate-x-0' : '-translate-x-full lg:translate-x-0'
        }
        ${dir === 'rtl' ? 'right-0 border-s border-e-0' : 'left-0 border-e border-s-0'}
        lg:translate-x-0 shadow-xl lg:shadow-none
      `}
    >
      <div className="flex flex-col h-full">
        {/* Sidebar Header with Toggle */}
        <div className={`h-16 flex items-center border-b border-border transition-all ${isCollapsed ? 'justify-center px-0' : 'px-4 justify-between'}`}>
          {!isCollapsed ? (
            <>
              <div className="flex items-center gap-3 animate-in fade-in duration-300">
                <div className="flex items-center justify-center text-brand">
                  <Logo className="w-8 h-8" />
                </div>
                <div>
                  <span className="text-lg font-bold text-zinc-text leading-none block">ZoneVast</span>
                  <span className="text-[9px] font-black text-brand uppercase tracking-widest block">
                    {activeMode || 'Enterprise'}
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
          {menuSections.map((section, idx) => (
            <nav key={idx} className="space-y-1 mb-8">
              {!isCollapsed && (
                <p className="px-5 text-[10px] font-black text-zinc-muted/60 uppercase tracking-[0.2em] mb-3">
                  {section.title}
                </p>
              )}
              {section.items.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => { if(window.innerWidth < 1024) onClose(); }}
                  className={({ isActive }) => `
                    flex items-center group px-3 py-2.5 text-sm font-medium transition-all rounded-md mx-3
                    ${isActive 
                      ? 'bg-brand/10 text-brand shadow-sm' 
                      : 'text-zinc-muted hover:text-zinc-text hover:bg-white/5'
                    }
                    ${isCollapsed ? 'justify-center px-2 mx-2' : ''}
                  `}
                  title={isCollapsed ? item.label : undefined}
                >
                  {({ isActive }) => (
                    <>
                      <item.icon 
                        className={`w-5 h-5 transition-colors ${isActive ? 'text-brand' : 'text-zinc-muted group-hover:text-zinc-text'} ${!isCollapsed && (dir === 'rtl' ? 'ml-3' : 'mr-3')}`} 
                        strokeWidth={1.5} 
                      />
                      {!isCollapsed && (
                        <span className="flex-1 truncate tracking-wide text-[13px] font-bold">
                          {item.label}
                        </span>
                      )}
                    </>
                  )}
                </NavLink>
              ))}
            </nav>
          ))}
        </div>

        {/* Workspace Switcher Footer */}
        <div className="p-4 border-t border-border">
          <button 
            onClick={handleSwitchWorkspace}
            className={`w-full flex items-center p-2 text-zinc-muted hover:text-brand hover:bg-white/5 rounded-md transition-all group ${isCollapsed ? 'justify-center' : ''}`}
            title="Switch Workspace"
          >
            <LogOut className={`w-5 h-5 transition-transform group-hover:-translate-x-1 rtl:group-hover:translate-x-1 ${!isCollapsed ? (dir === 'rtl' ? 'ml-3' : 'mr-3') : ''}`} />
            {!isCollapsed && (
              <span className="text-xs font-black uppercase tracking-widest">Switch Area</span>
            )}
          </button>
        </div>
      </div>
    </aside>
  );
};
