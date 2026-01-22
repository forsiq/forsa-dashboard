
import React, { useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { 
  ArrowLeft, 
  Settings, 
  MoreVertical, 
  Clock, 
  Activity, 
  Database, 
  ShieldCheck, 
  History,
  FileText,
  Share2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '../../lib/cn';
import { useLanguage } from '../../amber-ui/contexts/LanguageContext';

export const DetailsTemplate = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('overview');

  const tabs = [
    { id: 'overview', label: t('details.tab.hud'), icon: Activity },
    { id: 'timeline', label: t('details.tab.history'), icon: History },
    { id: 'metadata', label: t('details.tab.schema'), icon: Database },
    { id: 'attachments', label: t('details.tab.assets'), icon: FileText },
  ];

  return (
    <div className="animate-fade-up max-w-7xl mx-auto py-4 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 border-b border-white/5 pb-8">
        <div className="flex items-center gap-6">
          <button 
            onClick={() => navigate(-1)}
            className="p-3 bg-obsidian-card border border-white/5 rounded-sm text-zinc-muted hover:text-zinc-text transition-all"
          >
            <ArrowLeft className="w-5 h-5 rtl:rotate-180" />
          </button>
          <div>
            <div className="flex items-center gap-3 mb-1">
               <h1 className="text-3xl font-black text-zinc-text uppercase italic tracking-tighter leading-none">Resource_Alpha_X9</h1>
               <span className="text-[9px] font-black px-2 py-0.5 rounded-sm bg-success/5 text-success border border-success/20 uppercase tracking-widest">{t('label.active')}</span>
            </div>
            <div className="flex items-center gap-4 text-[10px] font-black text-zinc-muted uppercase tracking-[0.3em] italic">
               <span>{t('details.uuid')}: 4412-X-9921</span>
               <span className="w-1 h-1 bg-white/20 rounded-full" />
               <span>{t('details.last_indexed')}: 2m ago</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
           <Button variant="secondary" size="sm"><Share2 className="w-3.5 h-3.5 mr-2 rtl:ml-2 rtl:mr-0" /> {t('label.export')}</Button>
           <Button variant="secondary" size="sm"><Settings className="w-3.5 h-3.5 mr-2 rtl:ml-2 rtl:mr-0" /> Configure</Button>
           <div className="w-px h-6 bg-white/10 mx-2" />
           <button className="p-2 text-zinc-muted hover:text-zinc-text transition-colors"><MoreVertical className="w-5 h-5" /></button>
        </div>
      </div>

      {/* KPI Ribbon */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: t('details.kpi.uptime'), value: '99.98%', icon: Activity, color: 'text-success' },
          { label: t('details.kpi.latency'), value: '14ms', icon: Clock, color: 'text-info' },
          { label: t('details.kpi.data'), value: '8.4 GB', icon: Database, color: 'text-brand' },
          { label: t('details.kpi.security'), value: 'Alpha-5', icon: ShieldCheck, color: 'text-warning' },
        ].map((kpi, i) => (
          <Card key={i} className="p-5 flex items-center justify-between hover:border-brand/20 transition-all cursor-default">
            <div>
              <p className="text-[9px] font-black text-zinc-muted uppercase tracking-[0.2em] mb-1">{kpi.label}</p>
              <p className="text-xl font-black text-zinc-text tracking-tighter">{kpi.value}</p>
            </div>
            <kpi.icon className={cn("w-6 h-6 opacity-30", kpi.color)} />
          </Card>
        ))}
      </div>

      {/* Tabbed Content Area */}
      <div className="space-y-6">
        <div className="flex gap-1 border-b border-white/5 overflow-x-auto scrollbar-hide">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center gap-2 px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] transition-all relative whitespace-nowrap",
                activeTab === tab.id 
                  ? "text-brand" 
                  : "text-zinc-muted hover:text-zinc-text"
              )}
            >
              <tab.icon className="w-3.5 h-3.5" />
              {tab.label}
              {activeTab === tab.id && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand animate-in fade-in slide-in-from-bottom-1 duration-300" />
              )}
            </button>
          ))}
        </div>

        <div className="min-h-[400px]">
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in duration-500">
              <div className="lg:col-span-2 space-y-6">
                <Card className="p-8 space-y-8" glass>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                     <section className="space-y-4">
                        <h4 className="text-xs font-black text-zinc-muted uppercase tracking-widest border-b border-white/5 pb-2">{t('details.specs')}</h4>
                        <div className="space-y-4">
                           <div className="flex flex-col">
                              <span className="text-[9px] font-black text-zinc-muted uppercase tracking-widest">Protocol</span>
                              <span className="text-xs font-bold text-zinc-text italic">Secure_Sync_v4.2</span>
                           </div>
                           <div className="flex flex-col">
                              <span className="text-[9px] font-black text-zinc-muted uppercase tracking-widest">Encryption</span>
                              <span className="text-xs font-bold text-zinc-text italic">AES-256-GCM (Auth)</span>
                           </div>
                        </div>
                     </section>
                     <section className="space-y-4">
                        <h4 className="text-xs font-black text-zinc-muted uppercase tracking-widest border-b border-white/5 pb-2">{t('details.topology')}</h4>
                        <div className="space-y-4">
                           <div className="flex flex-col">
                              <span className="text-[9px] font-black text-zinc-muted uppercase tracking-widest">Region Allocation</span>
                              <span className="text-xs font-bold text-zinc-text italic">Global Mesh Network</span>
                           </div>
                        </div>
                     </section>
                  </div>
                  <section className="space-y-4 pt-4">
                     <h4 className="text-xs font-black text-zinc-muted uppercase tracking-widest border-b border-white/5 pb-2">{t('details.logs')}</h4>
                     <p className="text-xs font-bold text-zinc-secondary leading-relaxed uppercase italic opacity-70">
                        "The resource was initialized via CLI-Auth on 2025-05-14. Since then, it has maintained a 99.9% heartbeat consistency across the US-East and EU-West clusters."
                     </p>
                  </section>
                </Card>
              </div>
              <div className="space-y-6">
                <Card className="p-6">
                   <h3 className="text-xs font-black text-zinc-text uppercase tracking-widest mb-4 italic">{t('details.allocation')}</h3>
                   <div className="space-y-6">
                      {[
                        { label: 'Compute Power', val: 84 },
                        { label: 'Bandwidth Pool', val: 62 },
                        { label: 'Storage Cluster', val: 28 },
                      ].map((bar, i) => (
                        <div key={i} className="space-y-2">
                           <div className="flex justify-between text-[10px] font-black text-zinc-muted uppercase tracking-widest">
                             <span>{bar.label}</span>
                             <span>{bar.val}%</span>
                           </div>
                           <div className="h-1.5 bg-obsidian-outer rounded-full border border-white/5 overflow-hidden">
                              <div className="h-full bg-brand" style={{ width: `${bar.val}%` }} />
                           </div>
                        </div>
                      ))}
                   </div>
                </Card>
                <Card className="p-6 bg-obsidian-panel/40" glass>
                   <h3 className="text-xs font-black text-zinc-text uppercase tracking-widest mb-4 italic">{t('details.peers')}</h3>
                   <div className="space-y-3">
                      {['NODE_GAMMA_11', 'EDGE_CLUSTER_V4', 'CORE_BACKBONE_2'].map(node => (
                        <div key={node} className="p-3 bg-white/[0.02] border border-white/5 rounded-sm flex items-center justify-between">
                           <span className="text-[10px] font-black text-zinc-secondary italic">{node}</span>
                           <div className="w-1.5 h-1.5 bg-success rounded-full shadow-[0_0_8px_rgba(69,196,144,0.4)]" />
                        </div>
                      ))}
                   </div>
                </Card>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
