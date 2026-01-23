
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

  // Map internal mode IDs to display labels
  const getModeLabel = (mode: string | null) => {
    if (mode === 'generic') return 'Product Suite';
    if (mode === 'admin') return 'Administration';
    if (mode === 'portal') return 'Service Portal';
    return 'Product Suite';
  };

  const handleExitToPortal = () => {
    switchMode('portal');
    navigate('/portal');
  };

  const menuSections = [
    {
      title: "Dashboards",
      items: [
        { label: t('nav.dashboard'), path: '/dashboard', icon: LayoutGrid },
        { label: 'Catalog Analytics', path: paths.catalogDashboard, icon: PieChart }, 
      ]
    },
    {
      title: "Service & Repairs",
      items: [
        { label: 'Repair Center', path: paths.repairDashboard, icon: Wrench },
        { label: 'Schedule', path: paths.repairCalendar, icon: Calendar },
        { label: 'Service Catalog', path: paths.serviceCatalog, icon: BookOpen },
        { label: 'Technicians', path: paths.repairTechnicians, icon: UserCog },
        { label: 'New Ticket', path: paths.newRepair, icon: PlusCircle },
      ]
    },
    {
      title: "Finance",
      items: [
        { label: 'Debt Control', path: paths.debtDashboard, icon: Wallet },
        { label: 'Debtors', path: paths.debtors, icon: UserMinus },
        { label: 'Invoices', path: paths.invoices, icon: FileText },
        { label: 'Payment Schedule', path: paths.paymentSchedule, icon: CalendarClock },
        { label: 'Record Payment', path: paths.recordPayment, icon: CreditCard },
      ]
    },
    {
      title: "CRM",
      items: [
        { label: 'CRM Command', path: paths.crm, icon: Users },
        { label: 'Leads Pipeline', path: paths.crmPipeline, icon: Kanban },
        { label: 'Deals', path: paths.crmDeals, icon: Target },
        { label: 'Campaigns', path: paths.crmCampaigns, icon: Megaphone },
        { label: 'Tasks', path: paths.crmTasks, icon: ListTodo },
        { label: 'Customers', path: paths.crmCustomers, icon: Contact },
      ]
    },
    {
      title: "Catalog",
      items: [
        { label: t('nav.catalog'), path: paths.catalog, icon: Package }, 
        { label: t('nav.admin.categories'), path: paths.adminCategories, icon: Tags }, 
        { label: 'Brands', path: paths.adminBrands, icon: Briefcase },
        { label: 'Media Library', path: paths.mediaLibrary, icon: Image }, 
      ]
    },
    {
      title: t('nav.inventory'),
      items: [
        { label: 'Command Center', path: paths.inventory, icon: Box },
        { label: 'Stock Overview', path: paths.stockOverview, icon: ClipboardList },
        { label: 'Stock Movements', path: paths.movements, icon: ArrowRightLeft },
        { label: 'Stock Take', path: paths.stockTake, icon: ClipboardCheck },
        { label: 'Barcoding', path: paths.barcoding, icon: ScanBarcode },
        { label: 'Warehouses', path: paths.warehouses, icon: MapPin },
        { label: 'Vendors', path: paths.vendors, icon: Truck },
      ]
    },
    {
      title: t('sidebar.operations'),
      items: [
        { label: 'Point of Sale', path: paths.pos, icon: Calculator },
        { label: 'Orders Dashboard', path: paths.ordersDashboard, icon: LayoutDashboard },
        { label: t('nav.orders'), path: paths.orders, icon: ShoppingCart },
        { label: 'Returns', path: paths.returns, icon: RotateCcw },
        { label: t('form.init_resource'), path: paths.templateForm, icon: FilePlus }, 
        { label: t('nav.analytics'), path: paths.analytics, icon: BarChart3 },
      ]
    },
    {
      title: t('sidebar.general'),
      items: [
        { label: 'Service Settings', path: paths.serviceSettings, icon: Sliders }, 
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
        {/* Sidebar Header with Toggle */}
        <div className={`h-16 flex items-center border-b border-border transition-all ${isCollapsed ? 'justify-center px-0' : 'px-4 justify-between'}`}>
          {!isCollapsed ? (
            <>
              <div className="flex items-center gap-3 animate-in fade-in duration-300">
                <div className="flex items-center justify-center text-brand">
                  <AmberLogo className="w-8 h-8" />
                </div>
                <div>
                  <span className="text-lg font-bold text-zinc-text leading-none block">Product Suite</span>
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

        {/* Exit to Portal Footer */}
        <div className="p-4 border-t border-border mt-auto">
          <button 
            onClick={handleExitToPortal}
            className={`
              w-full flex items-center px-3 py-2.5 rounded-md transition-all group
              border border-transparent hover:border-brand/30 hover:bg-white/5
              ${isCollapsed ? 'justify-center' : ''}
            `}
            title="Back to Portal"
          >
            <div className={`p-1 bg-white/5 rounded-sm text-zinc-muted group-hover:text-brand transition-colors ${!isCollapsed ? (dir === 'rtl' ? 'ml-3' : 'mr-3') : ''}`}>
               <LogOut className={`w-4 h-4 ${dir === 'rtl' ? 'rotate-180' : ''}`} />
            </div>
            {!isCollapsed && (
              <div className="flex flex-col items-start text-left">
                 <span className="text-[10px] font-black text-zinc-muted uppercase tracking-widest group-hover:text-zinc-text transition-colors">Exit Service</span>
                 <span className="text-[9px] font-bold text-zinc-muted/60 uppercase tracking-tight group-hover:text-brand transition-colors">Back to Portal</span>
              </div>
            )}
          </button>
        </div>
      </div>
    </aside>
  );
};
