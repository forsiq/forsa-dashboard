
import React, { useState, useEffect, useMemo } from 'react';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { useLanguage } from '../../../amber-ui/contexts/LanguageContext';
import { useProjects } from '../../../contexts/ProjectContext';
import { 
  Package, Layers, Zap, CreditCard, 
  Settings as SettingsIcon, Search, 
  ToggleLeft, ToggleRight,
  Database, Globe, Server, Activity, ShieldCheck, 
  MessageSquare, Box, Cloud, Lock
} from 'lucide-react';
import { cn } from '../../../lib/cn';

// Service Registry (Same as before)
const SERVICE_REGISTRY = [
  { id: 'enableInventory', name: 'Inventory Service', cat: 'Core', desc: 'Stock tracking, unit management, and warehouse synchronization.', icon: Package, core: true },
  { id: 'enableAnalytics', name: 'Analytics Engine', cat: 'Core', desc: 'Advanced reporting, velocity charts, and telemetry intelligence.', icon: Layers, core: true },
  { id: 'enableAutomation', name: 'Automation Workflow', cat: 'Core', desc: 'Trigger-based actions and logic pipelines.', icon: Zap, core: true },
  { id: 'svc_ai_recs', name: 'AI Recommendation Node', cat: 'AI', desc: 'Predictive product suggestions based on user behavior.', icon: MessageSquare, core: false },
  { id: 'svc_vector_db', name: 'Vector Database', cat: 'Data', desc: 'High-dimensional storage for semantic search operations.', icon: Database, core: false },
  { id: 'svc_edge_cdn', name: 'Global Edge CDN', cat: 'Infrastructure', desc: 'Content delivery network across 140+ PoPs.', icon: Globe, core: false },
  { id: 'svc_auth_guard', name: 'Auth Guard Pro', cat: 'Security', desc: 'Advanced MFA and anomaly detection for user sessions.', icon: ShieldCheck, core: false },
  { id: 'svc_blockchain', name: 'Ledger Audit', cat: 'Compliance', desc: 'Immutable blockchain recording for transaction history.', icon: Lock, core: false },
  { id: 'svc_3d_render', name: '3D Asset Renderer', cat: 'Media', desc: 'Real-time 3D model processing for storefronts.', icon: Box, core: false },
  { id: 'svc_compute_x', name: 'Elastic Compute X', cat: 'Infrastructure', desc: 'Auto-scaling serverless functions.', icon: Server, core: false },
  { id: 'svc_health_mon', name: 'Health Monitor', cat: 'DevOps', desc: 'Uptime tracking and latency alerts.', icon: Activity, core: false },
  { id: 'svc_backup_cold', name: 'Cold Storage Archive', cat: 'Data', desc: 'Long-term data retention for compliance.', icon: Cloud, core: false },
];

export const PortalSettings = () => {
  const { t } = useLanguage();
  const { activeProject, toggleProjectFeature, updateProject } = useProjects();
  
  const [selectedSection, setSelectedSection] = useState<string>('enableInventory');
  const [searchQuery, setSearchQuery] = useState('');
  const [projectName, setProjectName] = useState(activeProject?.name || '');
  const [projectDesc, setProjectDesc] = useState(activeProject?.description || '');

  useEffect(() => {
    if (activeProject) {
      setProjectName(activeProject.name);
      setProjectDesc(activeProject.description);
    }
  }, [activeProject]);

  if (!activeProject) return null;

  const isServiceEnabled = (id: string) => {
    // @ts-ignore
    if (activeProject.features[id] !== undefined) return activeProject.features[id];
    return id.length % 2 === 0; // Mock state
  };

  const handleToggleService = (id: string) => {
    // @ts-ignore
    if (activeProject.features[id] !== undefined) toggleProjectFeature(activeProject.id, id);
  };

  const handleGeneralSave = () => {
    updateProject(activeProject.id, { name: projectName, description: projectDesc });
  };

  const filteredServices = useMemo(() => {
    return SERVICE_REGISTRY.filter(svc => 
      svc.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      svc.desc.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, activeProject]);

  const activeServiceData = SERVICE_REGISTRY.find(s => s.id === selectedSection);

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col animate-fade-up">
      <div className="mb-8">
         <h1 className="text-2xl font-black text-zinc-text uppercase italic tracking-tighter">Service Configuration</h1>
         <p className="text-[10px] font-black text-zinc-muted uppercase tracking-[0.3em] mt-1">Manage active modules for <span className="text-brand">{activeProject.name}</span></p>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8 min-h-0">
        {/* Sidebar List */}
        <div className="lg:col-span-4 flex flex-col gap-4 h-full min-h-0">
           {/* Top Actions */}
           <div className="flex gap-2">
              <button onClick={() => setSelectedSection('general')} className={cn("flex-1 py-3 px-4 rounded-sm border transition-all text-left flex items-center gap-3", selectedSection === 'general' ? "bg-brand/10 border-brand/30 text-brand" : "bg-obsidian-panel border-white/5 text-zinc-muted hover:text-zinc-text")}>
                 <SettingsIcon className="w-4 h-4" /> <span className="text-[10px] font-black uppercase tracking-widest">General</span>
              </button>
              <button onClick={() => setSelectedSection('billing')} className={cn("flex-1 py-3 px-4 rounded-sm border transition-all text-left flex items-center gap-3", selectedSection === 'billing' ? "bg-brand/10 border-brand/30 text-brand" : "bg-obsidian-panel border-white/5 text-zinc-muted hover:text-zinc-text")}>
                 <CreditCard className="w-4 h-4" /> <span className="text-[10px] font-black uppercase tracking-widest">Billing</span>
              </button>
           </div>

           {/* Service List */}
           <Card className="flex-1 flex flex-col p-0 overflow-hidden bg-obsidian-panel/50" noPadding>
              <div className="p-4 border-b border-white/5 bg-obsidian-panel">
                 <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-muted" />
                    <input type="text" placeholder="Filter services..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full h-10 bg-obsidian-outer border border-white/5 rounded-sm pl-10 pr-4 text-xs font-bold text-zinc-text outline-none focus:border-brand/30 transition-all" />
                 </div>
              </div>
              <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
                 {filteredServices.map((svc) => (
                    <button key={svc.id} onClick={() => setSelectedSection(svc.id)} className={cn("w-full flex items-center gap-3 p-3 rounded-sm border transition-all text-left group", selectedSection === svc.id ? "bg-brand/5 border-brand/20" : "bg-transparent border-transparent hover:bg-white/[0.02]")}>
                       <div className={cn("w-8 h-8 rounded-sm flex items-center justify-center border transition-colors", selectedSection === svc.id ? "bg-obsidian-outer border-brand/20 text-brand" : "bg-obsidian-outer border-white/5 text-zinc-muted")}>
                          <svc.icon className="w-4 h-4" />
                       </div>
                       <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-0.5">
                             <span className={cn("text-xs font-bold truncate", selectedSection === svc.id ? "text-zinc-text" : "text-zinc-secondary")}>{svc.name}</span>
                             <div className={cn("w-1.5 h-1.5 rounded-full", isServiceEnabled(svc.id) ? "bg-success" : "bg-white/10")} />
                          </div>
                          <span className="text-[9px] font-black text-zinc-muted uppercase tracking-widest">{svc.cat}</span>
                       </div>
                    </button>
                 ))}
              </div>
           </Card>
        </div>

        {/* Detail Content */}
        <div className="lg:col-span-8 h-full overflow-y-auto custom-scrollbar space-y-6">
           {selectedSection === 'general' && (
              <Card className="p-8 animate-in fade-in slide-in-from-right-2 duration-300">
                 <h2 className="text-xl font-black text-zinc-text uppercase italic tracking-tighter mb-6">General Settings</h2>
                 <div className="space-y-6 max-w-2xl">
                   <div>
                     <label className="block text-[9px] font-black text-zinc-muted uppercase tracking-widest mb-2 px-1">Project Name</label>
                     <input type="text" value={projectName} onChange={(e) => setProjectName(e.target.value)} className="w-full h-12 bg-obsidian-outer border border-white/5 rounded-sm px-4 text-sm font-bold text-zinc-text outline-none focus:border-brand/30 transition-all" />
                   </div>
                   <div>
                     <label className="block text-[9px] font-black text-zinc-muted uppercase tracking-widest mb-2 px-1">Description</label>
                     <textarea rows={4} value={projectDesc} onChange={(e) => setProjectDesc(e.target.value)} className="w-full bg-obsidian-outer border border-white/5 rounded-sm p-4 text-sm font-medium text-zinc-text outline-none focus:border-brand/30 transition-all resize-none" />
                   </div>
                   <div className="pt-2"><Button onClick={handleGeneralSave}>Save Changes</Button></div>
                 </div>
              </Card>
           )}

           {selectedSection === 'billing' && (
              <Card className="p-8 border-brand/30 bg-gradient-to-br from-obsidian-panel to-brand/5 relative overflow-hidden animate-in fade-in slide-in-from-right-2 duration-300">
                 <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                    <div>
                       <span className="inline-block px-3 py-1 bg-brand text-obsidian-outer text-[9px] font-black uppercase tracking-widest rounded-sm mb-3">Current Plan</span>
                       <h2 className="text-4xl font-black text-zinc-text uppercase italic tracking-tighter">{activeProject.plan}</h2>
                       <p className="text-sm font-bold text-zinc-muted mt-2">{activeProject.billing.amount}</p>
                    </div>
                    <div className="text-right">
                       <p className="text-[10px] font-black text-zinc-muted uppercase tracking-widest mb-1">Next Billing Date</p>
                       <p className="text-xl font-bold text-zinc-text">{activeProject.billing.nextDue}</p>
                    </div>
                 </div>
              </Card>
           )}

           {activeServiceData && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-2 duration-300">
                 <Card className="p-8 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-32 bg-white/[0.01] rounded-full blur-3xl group-hover:bg-brand/[0.03] transition-colors" />
                    <div className="relative z-10 flex items-start justify-between">
                       <div className="flex gap-6">
                          <div className="w-20 h-20 rounded-lg bg-obsidian-outer border border-white/10 flex items-center justify-center text-zinc-text shadow-xl">
                             <activeServiceData.icon className="w-10 h-10" strokeWidth={1} />
                          </div>
                          <div className="space-y-2">
                             <h2 className="text-3xl font-black text-zinc-text uppercase italic tracking-tighter">{activeServiceData.name}</h2>
                             <p className="text-sm font-medium text-zinc-muted max-w-lg leading-relaxed">{activeServiceData.desc}</p>
                             <div className="flex gap-2 pt-1">
                                <span className="text-[9px] font-black bg-white/5 px-2 py-1 rounded text-zinc-secondary uppercase tracking-widest">{activeServiceData.cat}</span>
                                {activeServiceData.core && <span className="text-[9px] font-black bg-brand/10 px-2 py-1 rounded text-brand uppercase tracking-widest">Core Module</span>}
                             </div>
                          </div>
                       </div>
                       <div className="flex flex-col items-end gap-3">
                          <button onClick={() => handleToggleService(activeServiceData.id)} className="flex items-center gap-3 transition-colors group/btn">
                             <span className="text-[10px] font-black text-zinc-muted uppercase tracking-widest group-hover/btn:text-zinc-text">Service Status</span>
                             {isServiceEnabled(activeServiceData.id) ? <ToggleRight className="w-10 h-10 text-success transition-transform" /> : <ToggleLeft className="w-10 h-10 text-zinc-muted transition-transform" />}
                          </button>
                          <span className={cn("text-[10px] font-bold uppercase tracking-widest", isServiceEnabled(activeServiceData.id) ? "text-success" : "text-zinc-muted")}>{isServiceEnabled(activeServiceData.id) ? "Active & Running" : "Disabled"}</span>
                       </div>
                    </div>
                 </Card>
                 <Card className="p-6">
                    <h3 className="text-xs font-black text-zinc-text uppercase tracking-widest mb-6 border-b border-white/5 pb-2">Configuration</h3>
                    <div className="space-y-5">
                       <div className="space-y-1.5">
                          <label className="block text-[9px] font-black text-zinc-muted uppercase tracking-widest px-1">API Endpoint URL</label>
                          <input type="text" disabled={!isServiceEnabled(activeServiceData.id)} defaultValue={`https://api.zonevast.com/v1/${activeServiceData.id.toLowerCase()}`} className="w-full h-10 bg-obsidian-outer border border-white/5 rounded-sm px-3 text-xs font-mono text-zinc-text outline-none focus:border-brand/30 disabled:opacity-50" />
                       </div>
                       <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                             <label className="block text-[9px] font-black text-zinc-muted uppercase tracking-widest px-1">Max Throughput</label>
                             <select disabled={!isServiceEnabled(activeServiceData.id)} className="w-full h-10 bg-obsidian-outer border border-white/5 rounded-sm px-3 text-xs font-bold text-zinc-text outline-none focus:border-brand/30 disabled:opacity-50"><option>Standard (1k req/s)</option><option>High (10k req/s)</option></select>
                          </div>
                          <div className="space-y-1.5">
                             <label className="block text-[9px] font-black text-zinc-muted uppercase tracking-widest px-1">Region</label>
                             <select disabled={!isServiceEnabled(activeServiceData.id)} className="w-full h-10 bg-obsidian-outer border border-white/5 rounded-sm px-3 text-xs font-bold text-zinc-text outline-none focus:border-brand/30 disabled:opacity-50"><option>Global (Auto)</option><option>US-East</option></select>
                          </div>
                       </div>
                       <div className="mt-8 pt-4 border-t border-white/5 flex justify-end"><Button size="sm" disabled={!isServiceEnabled(activeServiceData.id)}>Save Configuration</Button></div>
                    </div>
                 </Card>
              </div>
           )}
        </div>
      </div>
    </div>
  );
};
