
import React, { useState } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useLanguage } from '../amber-ui/contexts/LanguageContext';
import { useTheme } from '../amber-ui/contexts/ThemeContext';
import { 
  User, 
  Bell, 
  Globe, 
  Moon, 
  Sun, 
  Laptop, 
  Check, 
  Sliders, 
  Clock,
  DollarSign,
  Monitor
} from 'lucide-react';
import { cn } from '../lib/cn';

type Tab = 'operational' | 'user';

export const Settings: React.FC = () => {
  const { t, setLanguage, language } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState<Tab>('operational');

  // Mock State for Operational Settings
  const [opsSettings, setOpsSettings] = useState({
    currency: 'USD',
    timezone: 'UTC-5 (Eastern Time)',
    refreshRate: '30s',
    lowStockThreshold: 10,
    soundAlerts: true,
    compactMode: false
  });

  return (
    <div className="space-y-8 max-w-5xl mx-auto animate-fade-up py-4 px-2">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/5 pb-6">
        <div>
          <h1 className="text-3xl font-black text-zinc-text uppercase italic tracking-tighter">{t('settings.title')}</h1>
          <p className="text-[10px] font-bold text-zinc-muted uppercase tracking-[0.2em] mt-1">
            Service Environment & Personal Preferences
          </p>
        </div>
      </div>

      {/* Main Tabs */}
      <div className="flex gap-4">
        <button
          onClick={() => setActiveTab('operational')}
          className={cn(
            "flex items-center gap-2 px-4 py-2 text-[10px] font-black uppercase tracking-[0.2em] transition-all rounded-sm border",
            activeTab === 'operational' 
              ? "bg-brand/10 border-brand/30 text-brand" 
              : "bg-obsidian-panel border-white/5 text-zinc-muted hover:text-zinc-text"
          )}
        >
          <Sliders className="w-4 h-4" />
          Operational Defaults
        </button>
        <button
          onClick={() => setActiveTab('user')}
          className={cn(
            "flex items-center gap-2 px-4 py-2 text-[10px] font-black uppercase tracking-[0.2em] transition-all rounded-sm border",
            activeTab === 'user' 
              ? "bg-brand/10 border-brand/30 text-brand" 
              : "bg-obsidian-panel border-white/5 text-zinc-muted hover:text-zinc-text"
          )}
        >
          <User className="w-4 h-4" />
          User Profile
        </button>
      </div>

      {/* Content Area */}
      <div className="min-h-[400px]">
        
        {/* TAB: OPERATIONAL SETTINGS (Service Template) */}
        {activeTab === 'operational' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            {/* General Context */}
            <Card className="p-6 space-y-6 bg-obsidian-panel/60" glass>
               <div className="flex items-center gap-2 pb-4 border-b border-white/5">
                  <Globe className="w-4 h-4 text-brand" />
                  <h3 className="text-xs font-black text-zinc-text uppercase tracking-widest">Regional Context</h3>
               </div>
               
               <div className="space-y-4">
                  <div className="space-y-1.5">
                     <label className="text-[9px] font-black text-zinc-muted uppercase tracking-widest px-1">Default Currency</label>
                     <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-muted" />
                        <select 
                          className="w-full h-10 bg-obsidian-outer border border-white/5 rounded-sm pl-10 pr-4 text-xs font-bold text-zinc-text outline-none focus:border-brand/30 transition-all appearance-none"
                          value={opsSettings.currency}
                          onChange={(e) => setOpsSettings({...opsSettings, currency: e.target.value})}
                        >
                           <option value="USD">USD - United States Dollar</option>
                           <option value="EUR">EUR - Euro</option>
                           <option value="GBP">GBP - British Pound</option>
                        </select>
                     </div>
                  </div>

                  <div className="space-y-1.5">
                     <label className="text-[9px] font-black text-zinc-muted uppercase tracking-widest px-1">Reporting Timezone</label>
                     <div className="relative">
                        <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-muted" />
                        <select 
                          className="w-full h-10 bg-obsidian-outer border border-white/5 rounded-sm pl-10 pr-4 text-xs font-bold text-zinc-text outline-none focus:border-brand/30 transition-all appearance-none"
                          value={opsSettings.timezone}
                          onChange={(e) => setOpsSettings({...opsSettings, timezone: e.target.value})}
                        >
                           <option value="UTC">UTC (Coordinated Universal Time)</option>
                           <option value="UTC-5">UTC-05:00 (Eastern Time)</option>
                           <option value="UTC+1">UTC+01:00 (Central European Time)</option>
                        </select>
                     </div>
                  </div>
               </div>
            </Card>

            {/* Workflow & UI */}
            <Card className="p-6 space-y-6 bg-obsidian-panel/60" glass>
               <div className="flex items-center gap-2 pb-4 border-b border-white/5">
                  <Monitor className="w-4 h-4 text-info" />
                  <h3 className="text-xs font-black text-zinc-text uppercase tracking-widest">Workflow Preferences</h3>
               </div>

               <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-obsidian-outer border border-white/5 rounded-sm">
                     <div>
                        <p className="text-[10px] font-black text-zinc-text uppercase tracking-widest">Live Data Refresh</p>
                        <p className="text-[9px] font-bold text-zinc-muted">Interval for dashboard widgets</p>
                     </div>
                     <select 
                        className="bg-obsidian-card border border-white/10 text-[9px] font-bold text-zinc-text rounded-sm px-2 py-1 outline-none"
                        value={opsSettings.refreshRate}
                        onChange={(e) => setOpsSettings({...opsSettings, refreshRate: e.target.value})}
                     >
                        <option value="15s">15s</option>
                        <option value="30s">30s</option>
                        <option value="60s">60s</option>
                     </select>
                  </div>

                  <div 
                    className="flex items-center justify-between p-3 bg-obsidian-outer border border-white/5 rounded-sm cursor-pointer hover:border-white/10 transition-colors"
                    onClick={() => setOpsSettings({...opsSettings, compactMode: !opsSettings.compactMode})}
                  >
                     <div>
                        <p className="text-[10px] font-black text-zinc-text uppercase tracking-widest">Compact Density</p>
                        <p className="text-[9px] font-bold text-zinc-muted">Reduce padding in data tables</p>
                     </div>
                     <div className={cn("w-4 h-4 border rounded-sm flex items-center justify-center transition-colors", opsSettings.compactMode ? "bg-brand border-brand" : "border-white/20")}>
                        {opsSettings.compactMode && <Check className="w-3 h-3 text-obsidian-outer" />}
                     </div>
                  </div>

                  <div 
                    className="flex items-center justify-between p-3 bg-obsidian-outer border border-white/5 rounded-sm cursor-pointer hover:border-white/10 transition-colors"
                    onClick={() => setOpsSettings({...opsSettings, soundAlerts: !opsSettings.soundAlerts})}
                  >
                     <div>
                        <p className="text-[10px] font-black text-zinc-text uppercase tracking-widest">Audible Alerts</p>
                        <p className="text-[9px] font-bold text-zinc-muted">Play sound on critical events</p>
                     </div>
                     <div className={cn("w-4 h-4 border rounded-sm flex items-center justify-center transition-colors", opsSettings.soundAlerts ? "bg-brand border-brand" : "border-white/20")}>
                        {opsSettings.soundAlerts && <Check className="w-3 h-3 text-obsidian-outer" />}
                     </div>
                  </div>
               </div>
            </Card>

            <div className="lg:col-span-2 flex justify-end">
               <Button>Save Operational Defaults</Button>
            </div>
          </div>
        )}

        {/* TAB: USER PREFERENCES */}
        {activeTab === 'user' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
             <Card className="p-8">
                <div className="flex items-center gap-2 pb-6 border-b border-white/5 mb-6">
                   <User className="w-4 h-4 text-brand" />
                   <h3 className="text-lg font-black text-zinc-text uppercase tracking-tight">{t('settings.profile')}</h3>
                </div>
                
                <form className="space-y-8" onSubmit={(e) => e.preventDefault()}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1.5">
                      <label className="block text-[9px] font-black text-zinc-muted uppercase tracking-widest px-1">{t('settings.fname')}</label>
                      <input 
                        type="text" 
                        defaultValue="Alex"
                        className="w-full h-11 bg-obsidian-outer border border-white/5 rounded-sm px-4 text-xs font-bold text-zinc-text outline-none focus:border-brand/30 transition-all"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-[9px] font-black text-zinc-muted uppercase tracking-widest px-1">{t('settings.lname')}</label>
                      <input 
                        type="text" 
                        defaultValue="Morgan"
                        className="w-full h-11 bg-obsidian-outer border border-white/5 rounded-sm px-4 text-xs font-bold text-zinc-text outline-none focus:border-brand/30 transition-all"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-1.5">
                    <label className="block text-[9px] font-black text-zinc-muted uppercase tracking-widest px-1">{t('settings.email')}</label>
                    <input 
                      type="email" 
                      defaultValue="alex.morgan@zonevast.com"
                      className="w-full h-11 bg-obsidian-outer border border-white/5 rounded-sm px-4 text-xs font-bold text-zinc-text outline-none focus:border-brand/30 transition-all"
                    />
                  </div>

                  <div className="h-px bg-white/5" />

                  <div className="space-y-4">
                     <h4 className="text-xs font-black text-zinc-muted uppercase tracking-widest">Interface Preferences</h4>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Theme Toggle */}
                        <div className="p-4 bg-obsidian-outer border border-white/5 rounded-sm flex items-center justify-between">
                           <span className="text-[10px] font-bold text-zinc-text uppercase tracking-wide">Appearance Mode</span>
                           <div className="flex bg-obsidian-card p-1 rounded-sm border border-white/5">
                              <button 
                                onClick={toggleTheme}
                                className={cn("p-1.5 rounded-sm transition-all", theme === 'light' ? "bg-white text-black" : "text-zinc-muted hover:text-zinc-text")}
                              >
                                 <Sun className="w-3.5 h-3.5" />
                              </button>
                              <button 
                                onClick={toggleTheme}
                                className={cn("p-1.5 rounded-sm transition-all", theme === 'dark' ? "bg-brand text-obsidian-outer" : "text-zinc-muted hover:text-zinc-text")}
                              >
                                 <Moon className="w-3.5 h-3.5" />
                              </button>
                           </div>
                        </div>

                        {/* Language Toggle */}
                        <div className="p-4 bg-obsidian-outer border border-white/5 rounded-sm flex items-center justify-between">
                           <span className="text-[10px] font-bold text-zinc-text uppercase tracking-wide">Language</span>
                           <div className="flex gap-2">
                              <button 
                                onClick={() => setLanguage('en')}
                                className={cn("px-2 py-1 text-[9px] font-black uppercase rounded-sm border transition-all", language === 'en' ? "bg-brand/10 border-brand/30 text-brand" : "bg-transparent border-transparent text-zinc-muted hover:text-zinc-text")}
                              >
                                 English
                              </button>
                              <button 
                                onClick={() => setLanguage('ar')}
                                className={cn("px-2 py-1 text-[9px] font-black uppercase rounded-sm border transition-all", language === 'ar' ? "bg-brand/10 border-brand/30 text-brand" : "bg-transparent border-transparent text-zinc-muted hover:text-zinc-text")}
                              >
                                العربية
                              </button>
                           </div>
                        </div>
                     </div>
                  </div>

                  <div className="pt-4 flex justify-end">
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
