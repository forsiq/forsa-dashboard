
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '../../../amber-ui/contexts/LanguageContext';
import { useProjects } from '../../../contexts/ProjectContext';
import { useNavigation } from '../../../contexts/NavigationContext';
import { 
  Briefcase, FileText, Users, ShieldCheck, 
  Plug, Cpu, Layers, ArrowRight, Settings as SettingsIcon,
  CheckCircle, CreditCard, Package, ExternalLink
} from 'lucide-react';
import { cn } from '../../../lib/cn';
import { Card } from '../../../components/ui/Card';
import { paths } from '../../../routes/paths';

export const PortalHome = () => {
  const { t } = useLanguage();
  const { activeProject } = useProjects();
  const { switchMode } = useNavigation();
  const navigate = useNavigate();

  const allModules = [
    { id: 'proj', label: t('nav.projects'), path: paths.projects, icon: Briefcase, color: 'text-brand', bg: 'bg-brand/10' },
    { id: 'recs', label: t('nav.records'), path: paths.records, icon: FileText, color: 'text-success', bg: 'bg-success/10' },
    { id: 'inv', label: t('nav.inventory'), path: paths.catalog, icon: Package, color: 'text-warning', bg: 'bg-warning/10', feature: 'enableInventory' },
    { id: 'users', label: t('nav.admin.users'), path: paths.adminUsers, icon: Users, color: 'text-zinc-text', bg: 'bg-white/5' },
    { id: 'roles', label: t('nav.admin.roles'), path: paths.adminRoles, icon: ShieldCheck, color: 'text-danger', bg: 'bg-danger/10' },
    { id: 'integ', label: t('nav.admin.integrations'), path: paths.adminIntegrations, icon: Plug, color: 'text-brand', bg: 'bg-brand/10' },
    { id: 'comp', label: t('nav.compute'), path: '/compute', icon: Cpu, color: 'text-info', bg: 'bg-info/10' },
    { id: 'anal', label: t('nav.analytics'), path: paths.analytics, icon: Layers, color: 'text-brand', bg: 'bg-brand/10', feature: 'enableAnalytics' },
  ];

  const availableModules = allModules.filter(m => {
    if (m.feature) {
      // @ts-ignore
      return activeProject?.features?.[m.feature];
    }
    return true;
  });

  const handleServiceEnter = () => {
    switchMode('generic');
  };

  if (!activeProject) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6">
        <Briefcase className="w-16 h-16 text-zinc-muted opacity-20" />
        <h2 className="text-2xl font-black text-zinc-text uppercase italic tracking-tighter">No Project Selected</h2>
        <p className="text-sm font-medium text-zinc-muted max-w-md">Please select a project from the top navigation dropdown to access portal services.</p>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-white/5">
        <div className="space-y-4">
           <div className="flex items-center gap-3">
              <h1 className="text-4xl font-black text-zinc-text uppercase italic tracking-tighter">{activeProject.name}</h1>
              <span className="px-2 py-0.5 rounded-sm bg-brand/10 text-brand border border-brand/20 text-[10px] font-black uppercase tracking-widest">{activeProject.plan}</span>
           </div>
           <div className="flex items-center gap-6 text-[10px] font-bold text-zinc-muted uppercase tracking-widest">
              <span className="flex items-center gap-2"><CheckCircle className="w-3.5 h-3.5 text-success" /> Status: {activeProject.status}</span>
              <span className="flex items-center gap-2"><CreditCard className="w-3.5 h-3.5" /> Billing: {activeProject.billing.amount}</span>
           </div>
        </div>
        <button 
          onClick={() => navigate(paths.projectSettings)}
          className="flex items-center gap-2 px-6 py-3 bg-brand text-obsidian-outer rounded-sm text-[10px] font-black uppercase tracking-widest hover:opacity-90 transition-all shadow-lg shadow-brand/10"
        >
          <SettingsIcon className="w-3.5 h-3.5" /> Configure Services
        </button>
      </div>

      {/* Modules Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {availableModules.map((mod) => (
          <Link 
            key={mod.id} 
            to={mod.path} 
            onClick={handleServiceEnter}
            className="group"
          >
            <Card className="h-40 p-6 flex flex-col items-center justify-center text-center gap-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl border-white/5 bg-obsidian-panel/60 hover:bg-obsidian-panel group-hover:border-brand/30 relative overflow-hidden" glass>
              <div className={cn(
                "w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110 shadow-inner",
                "bg-obsidian-outer border border-white/5",
                mod.bg
              )}>
                <mod.icon className={cn("w-6 h-6 transition-colors duration-300", mod.color)} strokeWidth={1.5} />
              </div>
              <h3 className="text-[10px] font-black text-zinc-text uppercase tracking-widest group-hover:text-brand transition-colors">
                {mod.label}
              </h3>
              
              {/* Enter Icon */}
              <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-300">
                 <ExternalLink className="w-3 h-3 text-zinc-muted group-hover:text-brand" />
              </div>
              
              {/* Hover Arrow */}
              <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                 <ArrowRight className="w-3.5 h-3.5 text-brand rtl:rotate-180" />
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
};
