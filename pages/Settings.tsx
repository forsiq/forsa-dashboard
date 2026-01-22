
import React, { useState } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useLanguage } from '../amber-ui/contexts/LanguageContext';
import { useTheme } from '../amber-ui/contexts/ThemeContext';
import { useProjects } from '../contexts/ProjectContext';
import { 
  AlertCircle, Shield, Settings as SettingsIcon
} from 'lucide-react';
import { cn } from '../lib/cn';
import { ProjectConfiguration } from '../features/project/components/ProjectConfiguration';

type Tab = 'project' | 'profile';

export const Settings: React.FC = () => {
  const { t } = useLanguage();
  const { activeProject } = useProjects();
  const [activeTab, setActiveTab] = useState<Tab>('project');

  if (!activeProject) {
    return (
      <div className="text-center py-20 animate-fade-up">
        <div className="inline-flex p-4 bg-warning/10 rounded-full text-warning mb-4">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-black text-zinc-text uppercase italic tracking-tighter">No Active Project</h2>
        <p className="text-sm text-zinc-muted mt-2">Please select a project from the top menu to configure settings.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto animate-fade-up py-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-zinc-text uppercase italic tracking-tighter">{t('settings.title')}</h1>
          <p className="text-xs font-bold text-zinc-muted uppercase tracking-[0.2em] mt-1">Control Center for <span className="text-brand">{activeProject.name}</span></p>
        </div>
      </div>

      {/* Main Tabs */}
      <div className="flex gap-1 border-b border-white/5">
        <button
          onClick={() => setActiveTab('project')}
          className={cn(
            "flex items-center gap-2 px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] transition-all relative",
            activeTab === 'project' 
              ? "text-brand" 
              : "text-zinc-muted hover:text-zinc-text"
          )}
        >
          <SettingsIcon className="w-4 h-4" />
          Project Settings
          {activeTab === 'project' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand" />}
        </button>
        <button
          onClick={() => setActiveTab('profile')}
          className={cn(
            "flex items-center gap-2 px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] transition-all relative",
            activeTab === 'profile' 
              ? "text-brand" 
              : "text-zinc-muted hover:text-zinc-text"
          )}
        >
          <Shield className="w-4 h-4" />
          User Profile
          {activeTab === 'profile' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand" />}
        </button>
      </div>

      {/* Content */}
      <div className="min-h-[400px]">
        {activeTab === 'project' && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <ProjectConfiguration />
          </div>
        )}

        {activeTab === 'profile' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
             <Card className="p-8">
                <h3 className="text-lg font-black text-zinc-text uppercase tracking-tight mb-6">{t('settings.profile')}</h3>
                <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-[9px] font-black text-zinc-muted uppercase tracking-widest mb-2 px-1">{t('settings.fname')}</label>
                      <input 
                        type="text" 
                        defaultValue="Alex"
                        className="w-full h-11 bg-obsidian-outer border border-white/5 rounded-sm px-4 text-sm font-medium text-zinc-text outline-none focus:border-brand/30 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-black text-zinc-muted uppercase tracking-widest mb-2 px-1">{t('settings.lname')}</label>
                      <input 
                        type="text" 
                        defaultValue="Morgan"
                        className="w-full h-11 bg-obsidian-outer border border-white/5 rounded-sm px-4 text-sm font-medium text-zinc-text outline-none focus:border-brand/30 transition-all"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-[9px] font-black text-zinc-muted uppercase tracking-widest mb-2 px-1">{t('settings.email')}</label>
                    <input 
                      type="email" 
                      defaultValue="alex.morgan@zonevast.com"
                      className="w-full h-11 bg-obsidian-outer border border-white/5 rounded-sm px-4 text-sm font-medium text-zinc-text outline-none focus:border-brand/30 transition-all"
                    />
                  </div>

                  <div className="pt-2">
                    <Button>{t('settings.save')}</Button>
                  </div>
                </form>
             </Card>
          </div>
        )}
      </div>
    </div>
  );
};
