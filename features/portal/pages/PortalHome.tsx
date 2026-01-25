
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '../../../amber-ui/contexts/LanguageContext';
import { useProjects } from '../../../contexts/ProjectContext';
import { useNavigation } from '../../../contexts/NavigationContext';
import { 
  Briefcase, FileText, Users, ShieldCheck, 
  Plug, Cpu, Layers, ArrowRight, Settings as SettingsIcon,
  CheckCircle, CreditCard, Package, ExternalLink,
  Image, Megaphone, CheckSquare, Book, Sliders
} from 'lucide-react';
import { cn } from '../../../lib/cn';
import { Card } from '../../../components/ui/Card';
import { paths } from '../../../routes/paths';
import { AmberLogo } from '../../../amber-ui/components/AmberLogo';

export const PortalHome = () => {
  const { t } = useLanguage();
  const { activeProject } = useProjects();
  const { switchMode } = useNavigation();
  const navigate = useNavigate();

  const allModules = [
    // Core Ops
    { id: 'proj', label: t('nav.projects'), path: paths.projects, icon: Briefcase, color: 'text-brand', bg: 'bg-brand/10' },
    { id: 'recs', label: t('nav.records'), path: paths.records, icon: FileText, color: 'text-success', bg: 'bg-success/10' },
    { id: 'inv', label: t('nav.inventory'), path: paths.catalog, icon: Package, color: 'text-warning', bg: 'bg-warning/10', feature: 'enableInventory' },
    
    // Tools
    { id: 'media', label: 'Media Library', path: paths.mediaLibrary, icon: Image, color: 'text-purple-500', bg: 'bg-purple-500/10' },
    { id: 'marketing', label: 'Campaigns', path: paths.crmCampaigns, icon: Megaphone, color: 'text-pink-500', bg: 'bg-pink-500/10' },
    { id: 'tasks', label: 'My Tasks', path: paths.crmTasks, icon: CheckSquare, color: 'text-info', bg: 'bg-info/10' },

    // Admin & Infrastructure
    { id: 'users', label: t('nav.admin.users'), path: paths.adminUsers, icon: Users, color: 'text-zinc-text', bg: 'bg-white/5' },
    { id: 'roles', label: t('nav.admin.roles'), path: paths.adminRoles, icon: ShieldCheck, color: 'text-danger', bg: 'bg-danger/10' },
    { id: 'integ', label: t('nav.admin.integrations'), path: paths.adminIntegrations, icon: Plug, color: 'text-brand', bg: 'bg-brand/10' },
    { id: 'comp', label: t('nav.compute'), path: '/compute', icon: Cpu, color: 'text-info', bg: 'bg-info/10' },
    
    // System
    { id: 'docs', label: 'Documentation', path: '/help', icon: Book, color: 'text-zinc-400', bg: 'bg-white/5' },
    { id: 'config', label: 'Service Config', path: paths.serviceSettings, icon: Sliders, color: 'text-zinc-400', bg: 'bg-white/5' },

    // Analytics (Conditional)
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
        <h2 className="text-2xl font-black text-zinc-text uppercase italic tracking-tighter">{t('portal.home.no_project')}</h2>
        <p className="text-sm font-medium text-zinc-muted max-w-md">{t('portal.home.select_prompt')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {/* Hero Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-white/5">
        <div className="space-y-4">
           <div className="flex items-center gap-3">
              <h1 className="text-3xl font-black text-zinc-text uppercase italic tracking-tighter">{activeProject.name}</h1>
              <span className="px-2 py-0.5 rounded-sm bg-brand/10 text-brand border border-brand/20 text-[10px] font-black uppercase tracking-widest">{activeProject.plan}</span>
           </div>
           <div className="flex items-center gap-6 text-[10px] font-bold text-zinc-muted uppercase tracking-widest">
              <span className="flex items-center gap-2"><CheckCircle className="w-3.5 h-3.5 text-success" /> {t('portal.home.status')}: {activeProject.status}</span>
              <span className="flex items-center gap-2"><CreditCard className="w-3.5 h-3.5" /> {t('portal.home.billing')}: {activeProject.billing.amount}</span>
           </div>
        </div>
        <button 
          onClick={() => navigate(paths.projectSettings)}
          className="flex items-center gap-2 px-6 py-3 bg-brand text-obsidian-outer rounded-sm text-[10px] font-black uppercase tracking-widest hover:opacity-90 transition-all shadow-lg shadow-brand/10"
        >
          <SettingsIcon className="w-3.5 h-3.5" /> {t('portal.home.configure')}
        </button>
      </div>

      {/* Modules Grid - Denser Layout */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
        {availableModules.map((mod) => (
          <Link 
            key={mod.id} 
            to={mod.path} 
            onClick={handleServiceEnter}
            className="group"
          >
            <Card className="h-32 p-4 flex flex-col items-center justify-center text-center gap-3 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg border-white/5 bg-obsidian-panel/60 hover:bg-obsidian-panel group-hover:border-brand/30 relative overflow-hidden" glass>
              <div className={cn(
                "w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-300 group-hover:scale-110 shadow-inner",
                "bg-obsidian-outer border border-white/5",
                mod.bg
              )}>
                <mod.icon className={cn("w-5 h-5 transition-colors duration-300", mod.color)} strokeWidth={1.5} />
              </div>
              <h3 className="text-[10px] font-black text-zinc-text uppercase tracking-widest group-hover:text-brand transition-colors leading-tight">
                {mod.label}
              </h3>
              
              {/* Enter Icon */}
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
                 <ExternalLink className="w-3 h-3 text-zinc-muted group-hover:text-brand" />
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
};
