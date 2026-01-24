
import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutGrid, 
  BarChart3,
  Store,
  Info,
  FilePlus,
  Settings,
  ShoppingCart,
  ChevronLeft,
  ChevronRight,
  Package,
  X,
  LogOut, 
  Tags,
  Sliders,
  PieChart,
  Briefcase,
  Image,
  Box,
  ClipboardList,
  MapPin,
  ArrowRightLeft,
  ClipboardCheck,
  Truck,
  ScanBarcode,
  LayoutDashboard,
  Calculator,
  RotateCcw,
  Users,
  Contact,
  Kanban,
  Target,
  ListTodo,
  Megaphone,
  Wallet,
  UserMinus,
  CreditCard,
  CalendarClock,
  FileText,
  Wrench,
  PlusCircle,
  Calendar,
  UserCog,
  BookOpen
} from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useNavigation } from '../../contexts/NavigationContext';
import { AmberLogo } from '../../components/AmberLogo';
import { paths } from '../../../routes/paths';

interface SidebarProps {
  isOpen: boolean;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  onClose: () => void;
}

export const AmberSidebar: React.FC<SidebarProps> = ({ isOpen, isCollapsed, onToggleCollapse, onClose }) => {
  const { t, dir } = useLanguage();
  const { activeMode, switchMode } = useNavigation();
  const navigate = useNavigate();

  const getModeLabel = (mode: string | null) => {
    if (mode === 'generic') return t('app.suite');
    if (mode === 'admin') return 'Administration';
    if (mode === 'portal') return 'Service Portal';
    return t('app.suite');
  };

  const handleExitToPortal = () => {
    switchMode('portal');
    navigate('/portal');
  };

  const menuSections = [
    {
      title: t('sidebar.dashboards'),
      items: [
        { label: t('nav.dashboard'), path: '/dashboard', icon: LayoutGrid },
        { label: t('nav.catalog_analytics'), path: paths.catalogDashboard, icon: PieChart }, 
      ]
    },
    {
      title: t('sidebar.service_repairs'),
      items: [
        { label: t('nav.repair_center'), path: paths.repairDashboard, icon: Wrench },
        { label: t('nav.schedule'), path: paths.repairCalendar, icon: Calendar },
        { label: t('nav.service_catalog'), path: paths.serviceCatalog, icon: BookOpen },
        { label: t('nav.technicians'), path: paths.repairTechnicians, icon: UserCog },
        { label: t('nav.new_ticket'), path: paths.newRepair, icon: PlusCircle },
      ]
    },
    {
      title: t('sidebar.finance'),
      items: [
        { label: t('nav.debt_control'), path: paths.debtDashboard, icon: Wallet },
        { label: t('nav.debtors'), path: paths.debtors, icon: UserMinus },
        { label: t('nav.invoices'), path: paths.invoices, icon: FileText },
        { label: t('nav.payment_schedule'), path: paths.paymentSchedule, icon: CalendarClock },
        { label: t('nav.record_payment'), path: paths.recordPayment, icon: CreditCard },
      ]
    },
    {
      title: t('sidebar.crm'),
      items: [
        { label: t('nav.crm_command'), path: paths.crm, icon: Users },
        { label: t('nav.leads'), path: paths.crmPipeline, icon: Kanban },
        { label: t('nav.deals'), path: paths.crmDeals, icon: Target },
        { label: t('nav.campaigns'), path: paths.crmCampaigns, icon: Megaphone },
        { label: t('nav.tasks'), path: paths.crmTasks, icon: ListTodo },
        { label: t('nav.customers'), path: paths.crmCustomers, icon: Contact },
      ]
    },
    {
      title: t('sidebar.catalog'),
      items: [
        { label: t('nav.catalog'), path: paths.catalog, icon: Package }, 
        { label: t('nav.categories'), path: paths.adminCategories, icon: Tags }, 
        { label: t('nav.brands'), path: paths.adminBrands, icon: Briefcase },
        { label: t('nav.media'), path: paths.mediaLibrary, icon: Image }, 
      ]
    },
    {
      title: t('sidebar.inventory'),
      items: [
        { label: t('nav.inv_command'), path: paths.inventory, icon: Box },
        { label: t('nav.stock_overview'), path: paths.stockOverview, icon: ClipboardList },
        { label: t('nav.movements'), path: paths.movements, icon: ArrowRightLeft },
        { label: t('nav.stock_take'), path: paths.stockTake, icon: ClipboardCheck },
        { label: t('nav.barcoding'), path: paths.barcoding, icon: ScanBarcode },
        { label: t('nav.warehouses'), path: paths.warehouses, icon: MapPin },
        { label: t('nav.vendors'), path: paths.vendors, icon: Truck },
      ]
    },
    {
      title: t('sidebar.operations'),
      items: [
        { label: t('nav.pos'), path: paths.pos, icon: Calculator },
        { label: t('nav.orders_dash'), path: paths.ordersDashboard, icon: LayoutDashboard },
        { label: t('nav.orders'), path: paths.orders, icon: ShoppingCart },
        { label: t('nav.returns'), path: paths.returns, icon: RotateCcw },
        { label: t('nav.analytics'), path: paths.analytics, icon: BarChart3 },
      ]
    },
    {
      title: t('sidebar.general'),
      items: [
        { label: t('nav.settings'), path: paths.serviceSettings, icon: Sliders }, 
        { label: t('nav.about'), path: '/about', icon: Info },
      ]
    }
  ];

  return (
    <aside 
      className={`
        fixed inset-y-0 z-[110] bg-obsidian-panel border-e border-border
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
        <div className={`h-16 flex items-center border-b border-border transition-all ${isCollapsed ? 'justify-center px-0' : 'px-4 justify-between'}`}>
          {!isCollapsed ? (
            <>
              <div className="flex items-center gap-3 animate-in fade-in duration-300">
                <div className="flex items-center justify-center text-brand">
                  <AmberLogo className="w-8 h-8" />
                </div>
                <div>
                  <span className="text-lg font-bold text-zinc-text leading-none block">{t('app.name')}</span>
                  <span className="text-[9px] font-black text-brand uppercase tracking-widest block">
                    {getModeLabel(activeMode)}
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

        <div className="p-4 border-t border-border mt-auto">
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
                 <span className="text-[10px] font-black text-zinc-muted uppercase tracking-widest group-hover:text-zinc-text transition-colors">{t('sidebar.exit')}</span>
                 <span className="text-[9px] font-bold text-zinc-muted/60 uppercase tracking-tight group-hover:text-brand transition-colors">{t('sidebar.back_portal')}</span>
              </div>
            )}
          </button>
        </div>
      </div>
    </aside>
  );
};
