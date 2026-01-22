
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '../amber-ui/contexts/LanguageContext';
import { useTheme } from '../amber-ui/contexts/ThemeContext';
import { useProjects } from '../contexts/ProjectContext';
import { 
  Briefcase,
  PlayCircle,
  FileText,
  Users,
  ShieldCheck,
  Plug,
  Cpu,
  ShieldAlert,
  Search,
  ArrowRight,
  Database,
  Terminal,
  Layers,
  History,
  LogOut,
  Sun,
  Moon,
  CreditCard,
  CheckCircle,
  Package,
  LayoutGrid,
  Plus,
  Settings as SettingsIcon
} from 'lucide-react';
import { cn } from '../lib/cn';
import { Card } from '../components/ui/Card';
import { paths } from '../routes/paths';
import { AmberLogo } from '../amber-ui/components/AmberLogo';

export const CommandCenter = () => {
  const { t, dir } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const { projects, activeProject, selectProject } = useProjects();
  const navigate = useNavigate();

  const allModules = [
    // Core Modules
    { id: 'proj', label: t('nav.projects'), path: paths.projects, icon: Briefcase, color: 'text-brand', bg: 'bg-brand/10' },
    { id: 'acts', label: t('nav.actions'), path: paths.actions, icon: PlayCircle, color: 'text-info', bg: 'bg-info/10' },
    { id: 'recs', label: t('nav.records'), path: paths.records, icon: FileText, color: 'text-success', bg: 'bg-success/10' },
    
    // Inventory (Conditional)
    { id: 'inv', label: t('nav.inventory'), path: paths.catalog, icon: Package, color: 'text-warning', bg: 'bg-warning/10', feature: 'enableInventory' },
    
    // Admin & Infrastructure
    { id: 'users', label: t('nav.admin.users'), path: paths.adminUsers, icon: Users, color: 'text-zinc-text', bg: 'bg-white/5' },
    { id: 'roles', label: t('nav.admin.roles'), path: paths.adminRoles, icon: ShieldCheck, color: 'text-danger', bg: 'bg-danger/10' },
    { id: 'integ', label: t('nav.admin.integrations'), path: paths.adminIntegrations, icon: Plug, color: 'text-brand', bg: 'bg-brand/10' },
    { id: 'comp', label: t('nav.compute'), path: '/compute', icon: Cpu, color: 'text-info', bg: 'bg-info/10' },
    
    // Analytics (Conditional)
    { id: 'anal', label: t('nav.analytics'), path: paths.analytics, icon: Layers, color: 'text-brand', bg: 'bg-brand/10', feature: 'enableAnalytics' },
  ];

  // Filter modules based on active project features
  const availableModules = allModules.filter(m => {
    if (m.feature) {
      // @ts-ignore - Dynamic access to feature flags
      return activeProject?.features?.[m.feature];
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-obsidian-outer flex flex-col relative overflow-hidden" dir={dir}>
      {/* Background Decor */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-brand/5 via-obsidian-outer to-obsidian-outer pointer-events-none" />

      {/* Header */}
      <header className="relative z-20 w-full px-6 py-4 flex items-center justify-between border-b border-white/5 bg-obsidian-panel/80 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <Link to="/" className="flex items-center gap-3 group">
            <AmberLogo className="w-8 h-8 group-hover:scale-105 transition-transform" />
            <div className="hidden sm:block">
              <span className="text-lg font-black text-zinc-text uppercase italic tracking-tighter leading-none block">ZoneVast</span>
              <span className="text-[9px] font-bold text-brand/80 uppercase tracking-[0.4em] mt-1 block">Portal</span>
            </div>
          </Link>
        </div>

        <div className="flex items-center gap-4">
           {/* Theme Toggle */}
           <button 
             onClick={toggleTheme}
             className="p-2 text-zinc-muted hover:bg-white/5 rounded-sm transition-all"
           >
             {theme === 'dark' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
           </button>

           <div className="h-6 w-px bg-white/10 hidden sm:block" />

           {/* User Profile */}
           <div className="flex items-center gap-3 pl-2">
              <div className="text-right hidden sm:block">
                 <p className="text-xs font-bold text-zinc-text">Alex Morgan</p>
                 <p className="text-[9px] font-medium text-zinc-muted uppercase tracking-wider">Admin_S_Node</p>
              </div>
              <div className="w-9 h-9 rounded-sm bg-brand/10 border border-brand/20 flex items-center justify-center text-xs font-black text-brand">
                 AM
              </div>
              <Link to="/" className="p-2 text-zinc-muted hover:text-danger hover:bg-danger/10 rounded-sm transition-all" title="Logout">
                 <LogOut className="w-4 h-4 rtl:rotate-180" />
              </Link>
           </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-start p-6 md:p-10 relative z-10 animate-fade-up overflow-y-auto">
        <div className="max-w-7xl w-full space-y-10">
          
          {/* Project Selection / Hero */}
          <div className="flex flex-col items-center text-center space-y-6 py-6">
            {!activeProject ? (
              <>
                <h1 className="text-3xl md:text-4xl font-black text-zinc-text uppercase tracking-tighter italic">Select Workspace</h1>
                <p className="text-xs font-bold text-zinc-muted uppercase tracking-[0.3em] mt-2">Choose a project to access its services</p>
              </>
            ) : (
              <>
                <div className="flex items-center gap-3">
                   <h1 className="text-3xl md:text-4xl font-black text-zinc-text uppercase tracking-tighter italic">{activeProject.name}</h1>
                   <span className="px-2 py-0.5 rounded-sm bg-brand/10 text-brand border border-brand/20 text-[10px] font-black uppercase tracking-widest">{activeProject.plan}</span>
                </div>
                <div className="flex items-center gap-6 text-[10px] font-bold text-zinc-muted uppercase tracking-widest">
                   <span className="flex items-center gap-2"><CheckCircle className="w-3.5 h-3.5 text-success" /> Status: {activeProject.status}</span>
                   <span className="flex items-center gap-2"><CreditCard className="w-3.5 h-3.5" /> Billing: {activeProject.billing.amount}</span>
                </div>
                <div className="flex gap-4 mt-4">
                  <button 
                    onClick={() => selectProject(null)}
                    className="text-[10px] font-black text-zinc-muted hover:text-zinc-text uppercase tracking-widest flex items-center gap-2 px-4 py-2 border border-white/5 rounded-sm hover:bg-white/5 transition-all"
                  >
                    <LayoutGrid className="w-3.5 h-3.5" /> Switch Project
                  </button>
                  <button 
                    onClick={() => navigate(paths.projectSettings)}
                    className="text-[10px] font-black text-brand uppercase tracking-widest flex items-center gap-2 px-4 py-2 border border-brand/20 bg-brand/5 rounded-sm hover:bg-brand/10 transition-all"
                  >
                    <SettingsIcon className="w-3.5 h-3.5" /> Configure Project
                  </button>
                </div>
              </>
            )}
          </div>

          {/* VIEW 1: Project Grid (If no active project) */}
          {!activeProject && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((proj) => (
                <button
                  key={proj.id}
                  onClick={() => selectProject(proj.id)}
                  className="text-left group"
                >
                  <Card className="h-full p-6 hover:border-brand/30 transition-all duration-300 relative overflow-hidden bg-obsidian-panel/60 hover:bg-obsidian-panel border-white/5">
                    <div className="flex justify-between items-start mb-4">
                       <div className="p-3 bg-obsidian-outer border border-white/5 rounded-sm group-hover:text-brand transition-colors">
                          <Briefcase className="w-6 h-6" />
                       </div>
                       <span className={cn(
                         "px-2 py-1 rounded-sm text-[9px] font-black uppercase tracking-widest border",
                         proj.plan === 'Enterprise' ? "bg-brand/10 text-brand border-brand/20" : "bg-white/5 text-zinc-muted border-white/10"
                       )}>
                         {proj.plan}
                       </span>
                    </div>
                    
                    <h3 className="text-lg font-black text-zinc-text uppercase tracking-tight italic mb-2 group-hover:text-brand transition-colors">{proj.name}</h3>
                    <p className="text-xs font-medium text-zinc-muted mb-6 line-clamp-2 min-h-[2.5em]">{proj.description}</p>
                    
                    <div className="pt-6 border-t border-white/5 flex items-center justify-between">
                       <div className="flex flex-col">
                          <span className="text-[8px] font-black text-zinc-muted uppercase tracking-widest">Next Bill</span>
                          <span className="text-[10px] font-bold text-zinc-text uppercase">{proj.billing.nextDue}</span>
                       </div>
                       <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-brand group-hover:text-obsidian-outer transition-colors">
                          <ArrowRight className="w-4 h-4 rtl:rotate-180" />
                       </div>
                    </div>
                  </Card>
                </button>
              ))}
              
              {/* Add Project Placeholder */}
              <button className="h-full min-h-[200px] border-2 border-dashed border-white/10 rounded-xl flex flex-col items-center justify-center gap-3 text-zinc-muted hover:text-brand hover:border-brand/30 hover:bg-white/[0.02] transition-all">
                 <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center">
                    <Plus className="w-6 h-6" />
                 </div>
                 <span className="text-xs font-black uppercase tracking-widest">Create New Project</span>
              </button>
            </div>
          )}

          {/* VIEW 2: Service Modules (If active project) */}
          {activeProject && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="relative group w-full max-w-xl mx-auto mb-10">
                <Search className="absolute left-4 rtl:left-auto rtl:right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-muted group-focus-within:text-brand transition-colors" />
                <input 
                  type="text" 
                  placeholder={`Search ${activeProject.name} resources...`}
                  className="w-full h-14 bg-obsidian-panel border border-white/10 rounded-sm pl-12 pr-4 text-sm font-medium text-zinc-text outline-none focus:border-brand/50 focus:ring-1 focus:ring-brand/20 transition-all placeholder-zinc-muted shadow-2xl"
                />
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                {availableModules.map((mod) => (
                  <Link 
                    key={mod.id} 
                    to={mod.path} 
                    className="group"
                  >
                    <Card 
                      className="h-40 p-4 flex flex-col items-center justify-center text-center gap-3 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl border-white/5 bg-obsidian-panel/60 hover:bg-obsidian-panel group-hover:border-brand/30 relative overflow-hidden" 
                      glass
                    >
                      <div className={cn(
                        "w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110 shadow-inner mb-1",
                        "bg-obsidian-outer border border-white/5",
                        mod.bg
                      )}>
                        <mod.icon 
                          className={cn("w-6 h-6 transition-colors duration-300", mod.color)} 
                          strokeWidth={1.5}
                        />
                      </div>
                      
                      <div className="space-y-0.5 z-10">
                        <h3 className="text-[10px] font-black text-zinc-text uppercase tracking-widest group-hover:text-brand transition-colors">
                          {mod.label}
                        </h3>
                      </div>

                      {/* Hover Decoration */}
                      <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/0 to-white/[0.03] opacity-0 group-hover:opacity-100 transition-opacity" />
                      <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                         <ArrowRight className="w-3 h-3 text-zinc-muted group-hover:text-brand rtl:rotate-180" />
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Footer Info */}
          <div className="text-center pt-10 pb-6 border-t border-white/5">
            <p className="text-[9px] text-zinc-muted font-bold uppercase tracking-[0.3em] opacity-40">
              ZoneVast Enterprise Portal • v4.12.8
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
