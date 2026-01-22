
import React, { useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { 
  ArrowLeft, 
  LayoutGrid, 
  Database, 
  FilePlus, 
  Info, 
  Settings2, 
  Zap, 
  LineChart, 
  History,
  Activity,
  Download,
  Share2,
  ChevronRight,
  MoreVertical,
  ShieldCheck
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '../../lib/cn';
import { useLanguage } from '../../amber-ui/contexts/LanguageContext';

// Sub-page component imports
import { ListTemplate } from './ListTemplate';
import { FormTemplate } from './FormTemplate';
import { DetailsTemplate } from './DetailsTemplate';
import { AnalyticsTemplate } from './AnalyticsTemplate';
import { AutomationTemplate } from './AutomationTemplate';
import { AuditLogs } from '../core/AuditLogs';

type TabType = 'overview' | 'records' | 'make' | 'details' | 'automation' | 'analytics' | 'activity' | 'settings';

export const ServiceHub = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<TabType>('overview');

  const tabs: { id: TabType; label: string; icon: any }[] = [
    { id: 'overview', label: t('hub.tab.hud'), icon: LayoutGrid },
    { id: 'records', label: t('hub.tab.records'), icon: Database },
    { id: 'make', label: t('hub.tab.factory'), icon: FilePlus },
    { id: 'details', label: t('hub.tab.analysis'), icon: Info },
    { id: 'automation', label: t('hub.tab.flow'), icon: Zap },
    { id: 'analytics', label: t('hub.tab.telemetry'), icon: LineChart },
    { id: 'activity', label: t('hub.tab.vault'), icon: History },
    { id: 'settings', label: t('hub.tab.governance'), icon: Settings2 },
  ];

  return (
    <div className="animate-fade-up w-full space-y-6">
      {/* 1. Master Service Header */}
      <section className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-white/5 pb-8">
        <div className="flex items-center gap-6">
          <button 
            onClick={() => navigate('/')}
            className="p-3 bg-obsidian-card border border-white/5 rounded-sm text-zinc-muted hover:text-zinc-text hover:border-brand/20 transition-all shadow-xl"
          >
            <ArrowLeft className="w-5 h-5 rtl:rotate-180" />
          </button>
          <div>
            <div className="flex items-center gap-3 mb-1.5">
               <h1 className="text-3xl font-black text-zinc-text uppercase italic tracking-tighter leading-none">{t('hub.title')}</h1>
               <span className="text-[10px] font-black px-2.5 py-0.5 rounded-sm bg-success/5 text-success border border-success/20 uppercase tracking-widest flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 bg-success rounded-full animate-pulse" /> {t('hub.nominal')}
               </span>
            </div>
            <p className="text-[11px] font-black text-zinc-muted uppercase tracking-[0.4em] italic opacity-60">{t('hub.subtitle')}: US-EAST-CLUSTER-01</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
           <Button variant="secondary" size="sm">
              <Download className="w-3.5 h-3.5 mr-2 rtl:ml-2 rtl:mr-0" /> Global Export
           </Button>
           <Button size="sm">
              <Share2 className="w-3.5 h-3.5 mr-2 rtl:ml-2 rtl:mr-0" /> Dispatch Uplink
           </Button>
           <div className="w-px h-8 bg-white/5 mx-2 hidden lg:block" />
           <button className="p-3 text-zinc-muted hover:text-zinc-text transition-all"><MoreVertical className="w-5 h-5" /></button>
        </div>
      </section>

      {/* 2. Primary Navigation HUD */}
      <nav className="flex gap-1 border-b border-white/5 overflow-x-auto scrollbar-hide bg-obsidian-panel/20 p-1 rounded-sm">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex items-center gap-2.5 px-6 py-4 text-[11px] font-black uppercase tracking-[0.2em] transition-all relative whitespace-nowrap rounded-sm",
              activeTab === tab.id 
                ? "bg-brand/5 text-brand shadow-[inset_0_0_10px_rgba(245,196,81,0.05)]" 
                : "text-zinc-muted hover:text-zinc-text hover:bg-white/[0.02]"
            )}
          >
            <tab.icon className={cn("w-4 h-4 transition-transform duration-300", activeTab === tab.id && "scale-110")} />
            {tab.label}
            {activeTab === tab.id && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand animate-in fade-in slide-in-from-bottom-1 duration-300" />
            )}
          </button>
        ))}
      </nav>

      {/* 3. Content Switcher */}
      <div className="min-h-[600px] py-4">
        {activeTab === 'overview' && (
           <div className="space-y-8 animate-in fade-in duration-500">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                 <Card className="lg:col-span-2 p-8 space-y-8" glass>
                    <div className="flex items-center justify-between border-b border-white/5 pb-4">
                       <h3 className="text-xs font-black text-zinc-text uppercase tracking-[0.4em] flex items-center gap-3 italic">
                          <Activity className="w-4 h-4 text-brand" /> {t('hub.core_summary')}
                       </h3>
                       <span className="text-[10px] font-bold text-zinc-muted font-mono">NODE_HASH: 0x4f...921</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 text-[11px] font-bold text-zinc-secondary leading-relaxed uppercase italic">
                       <p>
                          "The Global Inventory v4 service acts as the definitive authority for all SKU lifecycle events across the primary mesh network. It manages data propagation, state validation, and regional stock synchronization with a sub-14ms latency profile."
                       </p>
                       <ul className="space-y-3">
                          <li className="flex items-center justify-between border-b border-white/5 pb-1">
                             <span className="text-zinc-muted">Active Clusters</span>
                             <span className="text-zinc-text tracking-tighter">14 Regional Nodes</span>
                          </li>
                          <li className="flex items-center justify-between border-b border-white/5 pb-1">
                             <span className="text-zinc-muted">Sync Consistency</span>
                             <span className="text-success tracking-tighter">99.998% High-Avail</span>
                          </li>
                          <li className="flex items-center justify-between">
                             <span className="text-zinc-muted">Authority Level</span>
                             <span className="text-brand tracking-tighter">MASTER_ROOT</span>
                          </li>
                       </ul>
                    </div>
                 </Card>

                 <Card className="p-6 bg-obsidian-card/40 flex flex-col">
                    <h3 className="text-xs font-black text-zinc-muted uppercase tracking-widest mb-6 italic border-b border-white/5 pb-2">{t('hub.resource_load')}</h3>
                    <div className="space-y-6 flex-1">
                       {[
                         { label: 'DB Write Throughput', val: 82, color: 'bg-brand' },
                         { label: 'Memory Persistence', val: 44, color: 'bg-info' },
                         { label: 'Async Queue Length', val: 12, color: 'bg-success' },
                       ].map((bar, i) => (
                         <div key={i} className="space-y-2">
                            <div className="flex justify-between text-[10px] font-black text-zinc-muted uppercase tracking-widest">
                               <span>{bar.label}</span>
                               <span>{bar.val}%</span>
                            </div>
                            <div className="h-2 bg-obsidian-outer rounded-full border border-white/5 overflow-hidden p-0.5">
                               <div className={cn("h-full rounded-full transition-all duration-1000", bar.color)} style={{ width: `${bar.val}%` }} />
                            </div>
                         </div>
                       ))}
                    </div>
                 </Card>
              </div>
           </div>
        )}

        {activeTab === 'records' && <ListTemplate />}
        {activeTab === 'make' && <FormTemplate />}
        {activeTab === 'details' && <DetailsTemplate />}
        {activeTab === 'automation' && <AutomationTemplate />}
        {activeTab === 'analytics' && <AnalyticsTemplate />}
        {activeTab === 'activity' && <AuditLogs />}
        
        {activeTab === 'settings' && (
           <Card className="max-w-4xl mx-auto p-8 space-y-12 animate-in fade-in duration-500" glass>
              <section className="space-y-6">
                 <div>
                    <h3 className="text-xs font-black text-brand uppercase tracking-[0.4em] mb-1 italic">Service Governance</h3>
                    <p className="text-[10px] font-bold text-zinc-muted uppercase tracking-widest italic opacity-60">Authoritative configuration for service behavior.</p>
                 </div>
                 <div className="space-y-4">
                    {[
                      { label: 'Public Accessibility', desc: 'Allow unauthenticated read access to non-sensitive records.', checked: false },
                      { label: 'Strict Schema Enforcement', desc: 'Reject any payload that does not 100% match the defined JSON schema.', checked: true },
                      { label: 'Auto-Scaling Clusters', desc: 'Enable dynamic node provisioning based on latency spikes.', checked: true },
                    ].map((set, i) => (
                      <div key={i} className="flex items-center justify-between p-4 bg-obsidian-outer/40 border border-white/5 rounded-sm">
                         <div>
                            <p className="text-[11px] font-black text-zinc-text uppercase tracking-widest mb-1 italic">{set.label}</p>
                            <p className="text-[9px] font-bold text-zinc-muted uppercase tracking-tight italic">{set.desc}</p>
                         </div>
                         <label className="relative inline-flex items-center cursor-pointer group">
                           <input type="checkbox" defaultChecked={set.checked} className="sr-only peer" />
                           <div className="w-10 h-5 bg-obsidian-outer border border-white/10 rounded-full peer-checked:bg-brand/20 peer-checked:border-brand transition-all after:content-[''] after:absolute after:top-[3px] after:left-[3px] after:bg-zinc-muted after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:after:translate-x-5 peer-checked:after:bg-brand" />
                         </label>
                      </div>
                    ))}
                 </div>
              </section>
           </Card>
        )}
      </div>

      {/* 4. Service Utility Footer */}
      <footer className="pt-10 flex flex-col md:flex-row items-center justify-between gap-6 border-t border-white/5 opacity-50 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-700 group">
         <div className="flex items-center gap-10">
            <div className="flex flex-col">
               <span className="text-[8px] font-black text-zinc-muted uppercase tracking-[0.4em]">Service Version</span>
               <span className="text-[10px] font-black text-zinc-text tracking-tighter uppercase italic">v4.12.8-STABLE</span>
            </div>
            <div className="flex flex-col">
               <span className="text-[8px] font-black text-zinc-muted uppercase tracking-[0.4em]">Engineered By</span>
               <span className="text-[10px] font-black text-brand tracking-tighter uppercase italic">ZoneVast Labs</span>
            </div>
         </div>
         <div className="flex items-center gap-4 text-[9px] font-black text-zinc-muted uppercase tracking-[0.2em] italic">
            <span>Protocol: Secure_Sync_V2</span>
            <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-transform rtl:rotate-180" />
            <span>Node_Status: Nominal</span>
         </div>
      </footer>
    </div>
  );
};
