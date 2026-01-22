
import React, { useState, useEffect, useMemo } from 'react';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { useLanguage } from '../../../amber-ui/contexts/LanguageContext';
import { useTheme } from '../../../amber-ui/contexts/ThemeContext';
import { useProjects } from '../../../contexts/ProjectContext';
import { 
  Package, Layers, Zap, CreditCard, 
  Settings as SettingsIcon, Search, 
  ArrowLeft, ToggleLeft, ToggleRight,
  Database, Globe, Server, Activity, ShieldCheck, 
  MessageSquare, Box, Cloud, Lock
} from 'lucide-react';
import { cn } from '../../../lib/cn';
import { useNavigate } from 'react-router-dom';
import { SERVICE_REGISTRY } from '../../../config/serviceRegistry';

export const ProjectConfiguration: React.FC = () => {
  const { t } = useLanguage();
  const { activeProject, toggleProjectFeature, updateProject } = useProjects();
  const navigate = useNavigate();
  
  // State for the View
  const [selectedSection, setSelectedSection] = useState<string>('enableInventory'); // Default to inventory
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'enabled' | 'disabled'>('all');
  
  // Project General State
  const [projectName, setProjectName] = useState(activeProject?.name || '');
  const [projectDesc, setProjectDesc] = useState(activeProject?.description || '');

  useEffect(() => {
    if (activeProject) {
      setProjectName(activeProject.name);
      setProjectDesc(activeProject.description);
    }
  }, [activeProject]);

  if (!activeProject) return null;

  // -- Helpers --

  const isServiceEnabled = (id: string) => {
    return activeProject.features[id] === true;
  };

  const handleToggleService = (id: string) => {
    toggleProjectFeature(activeProject.id, id);
  };

  const handleGeneralSave = () => {
    updateProject(activeProject.id, { name: projectName, description: projectDesc });
  };

  const filteredServices = useMemo(() => {
    return SERVICE_REGISTRY.filter(svc => {
      const matchesSearch = svc.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            svc.desc.toLowerCase().includes(searchQuery.toLowerCase());
      const enabled = isServiceEnabled(svc.id);
      const matchesFilter = filterStatus === 'all' 
        ? true 
        : filterStatus === 'enabled' ? enabled : !enabled;
      
      return matchesSearch && matchesFilter;
    });
  }, [searchQuery, filterStatus, activeProject]);

  const activeServiceData = SERVICE_REGISTRY.find(s => s.id === selectedSection);

  // -- Render Sections --

  return (
    <div className="h-[calc(100vh-100px)] animate-fade-up flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between pb-6 border-b border-white/5 mb-6">
        <div className="flex items-center gap-4">
           <button onClick={() => navigate('/portal')} className="p-2 bg-white/5 rounded-sm hover:bg-white/10 transition-colors text-zinc-muted">
              <ArrowLeft className="w-5 h-5 rtl:rotate-180" />
           </button>
           <div>
              <h1 className="text-2xl font-black text-zinc-text uppercase italic tracking-tighter">Project Console</h1>
              <p className="text-[10px] font-black text-zinc-muted uppercase tracking-[0.3em] mt-1">
                 Configuring: <span className="text-brand">{activeProject.name}</span>
              </p>
           </div>
        </div>
        <div className="flex items-center gap-3">
           <div className="px-3 py-1 rounded-sm bg-obsidian-outer border border-white/10 text-[10px] font-bold text-zinc-muted uppercase tracking-widest">
              Plan: <span className="text-zinc-text">{activeProject.plan}</span>
           </div>
        </div>
      </div>

      {/* Main Layout: Master / Detail */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0">
        
        {/* LEFT SIDEBAR: Service List */}
        <div className="lg:col-span-4 flex flex-col gap-4 min-h-0 h-full">
           
           {/* Core Navigation */}
           <div className="flex gap-2">
              <button 
                onClick={() => setSelectedSection('general')}
                className={cn(
                  "flex-1 py-3 px-4 rounded-sm border transition-all text-left flex items-center gap-3",
                  selectedSection === 'general' ? "bg-brand/10 border-brand/30 text-brand" : "bg-obsidian-panel border-white/5 text-zinc-muted hover:text-zinc-text"
                )}
              >
                 <SettingsIcon className="w-4 h-4" />
                 <span className="text-[10px] font-black uppercase tracking-widest">General</span>
              </button>
              <button 
                onClick={() => setSelectedSection('billing')}
                className={cn(
                  "flex-1 py-3 px-4 rounded-sm border transition-all text-left flex items-center gap-3",
                  selectedSection === 'billing' ? "bg-brand/10 border-brand/30 text-brand" : "bg-obsidian-panel border-white/5 text-zinc-muted hover:text-zinc-text"
                )}
              >
                 <CreditCard className="w-4 h-4" />
                 <span className="text-[10px] font-black uppercase tracking-widest">Billing</span>
              </button>
           </div>

           {/* Service Filter & Search */}
           <Card className="flex-1 flex flex-col p-0 overflow-hidden bg-obsidian-panel/50" noPadding>
              <div className="p-4 border-b border-white/5 space-y-4 bg-obsidian-panel">
                 <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-muted" />
                    <input 
                      type="text" 
                      placeholder="Filter services..." 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full h-10 bg-obsidian-outer border border-white/5 rounded-sm pl-10 pr-4 text-xs font-bold text-zinc-text outline-none focus:border-brand/30 transition-all"
                    />
                 </div>
                 <div className="flex p-1 bg-obsidian-outer rounded-sm">
                    {['all', 'enabled', 'disabled'].map((status) => (
                       <button
                         key={status}
                         onClick={() => setFilterStatus(status as any)}
                         className={cn(
                           "flex-1 py-1.5 text-[9px] font-black uppercase tracking-widest rounded-sm transition-all",
                           filterStatus === status ? "bg-white/10 text-zinc-text shadow-sm" : "text-zinc-muted hover:text-zinc-secondary"
                         )}
                       >
                         {status}
                       </button>
                    ))}
                 </div>
              </div>

              {/* Scrollable List */}
              <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
                 {filteredServices.map((svc) => {
                    const isActive = selectedSection === svc.id;
                    const isEnabled = isServiceEnabled(svc.id);
                    return (
                       <button
                         key={svc.id}
                         onClick={() => setSelectedSection(svc.id)}
                         className={cn(
                           "w-full flex items-center gap-3 p-3 rounded-sm border transition-all text-left group",
                           isActive 
                             ? "bg-brand/5 border-brand/20" 
                             : "bg-transparent border-transparent hover:bg-white/[0.02]"
                         )}
                       >
                          <div className={cn(
                             "w-10 h-10 rounded-sm flex items-center justify-center border transition-colors",
                             isActive ? "bg-obsidian-outer border-brand/20 text-brand" : "bg-obsidian-outer border-white/5 text-zinc-muted group-hover:text-zinc-text"
                          )}>
                             <svc.icon className="w-5 h-5" />
                          </div>
                          <div className="flex-1 min-w-0">
                             <div className="flex items-center justify-between mb-0.5">
                                <span className={cn("text-xs font-bold truncate", isActive ? "text-zinc-text" : "text-zinc-secondary group-hover:text-zinc-text")}>{svc.name}</span>
                                <div className={cn("w-2 h-2 rounded-full", isEnabled ? "bg-success" : "bg-white/10")} />
                             </div>
                             <span className="text-[9px] font-black text-zinc-muted uppercase tracking-widest">{svc.cat}</span>
                          </div>
                       </button>
                    );
                 })}
                 {filteredServices.length === 0 && (
                    <div className="p-8 text-center text-zinc-muted">
                       <p className="text-xs">No services found.</p>
                    </div>
                 )}
              </div>
           </Card>
        </div>

        {/* RIGHT CONTENT: Details & Config */}
        <div className="lg:col-span-8 flex flex-col h-full overflow-y-auto custom-scrollbar">
           
           {/* GENERAL SETTINGS VIEW */}
           {selectedSection === 'general' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                 <Card className="p-8">
                    <h2 className="text-xl font-black text-zinc-text uppercase italic tracking-tighter mb-6">General Settings</h2>
                    <div className="space-y-6 max-w-2xl">
                      <div>
                        <label className="block text-[9px] font-black text-zinc-muted uppercase tracking-widest mb-2 px-1">Project Name</label>
                        <input 
                          type="text" 
                          value={projectName}
                          onChange={(e) => setProjectName(e.target.value)}
                          className="w-full h-12 bg-obsidian-outer border border-white/5 rounded-sm px-4 text-sm font-bold text-zinc-text outline-none focus:border-brand/30 transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] font-black text-zinc-muted uppercase tracking-widest mb-2 px-1">Description</label>
                        <textarea 
                          rows={4}
                          value={projectDesc}
                          onChange={(e) => setProjectDesc(e.target.value)}
                          className="w-full bg-obsidian-outer border border-white/5 rounded-sm p-4 text-sm font-medium text-zinc-text outline-none focus:border-brand/30 transition-all resize-none"
                        />
                      </div>
                      <div className="pt-2">
                        <Button onClick={handleGeneralSave}>Save Changes</Button>
                      </div>
                    </div>
                 </Card>
              </div>
           )}

           {/* BILLING VIEW */}
           {selectedSection === 'billing' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                 <Card className="p-8 border-brand/30 bg-gradient-to-br from-obsidian-panel to-brand/5 relative overflow-hidden">
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
                 {/* Simplified Plan List for Layout brevity */}
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {['Starter', 'Pro', 'Enterprise'].map(plan => (
                       <Card key={plan} className={cn("p-6 border transition-all", activeProject.plan === plan ? "border-brand bg-obsidian-panel" : "border-white/5 opacity-50")}>
                          <h3 className="text-lg font-black text-zinc-text uppercase italic">{plan}</h3>
                          {activeProject.plan === plan && <p className="text-[10px] font-bold text-brand uppercase mt-2">Active Plan</p>}
                       </Card>
                    ))}
                 </div>
              </div>
           )}

           {/* SERVICE DETAILS VIEW */}
           {activeServiceData && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                 
                 {/* Service Header */}
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
                          <button 
                            onClick={() => handleToggleService(activeServiceData.id)}
                            className="flex items-center gap-3 transition-colors group/btn"
                          >
                             <span className="text-[10px] font-black text-zinc-muted uppercase tracking-widest group-hover/btn:text-zinc-text">Service Status</span>
                             {isServiceEnabled(activeServiceData.id) 
                               ? <ToggleRight className="w-10 h-10 text-success transition-transform" />
                               : <ToggleLeft className="w-10 h-10 text-zinc-muted transition-transform" />
                             }
                          </button>
                          <span className={cn(
                             "text-[10px] font-bold uppercase tracking-widest",
                             isServiceEnabled(activeServiceData.id) ? "text-success" : "text-zinc-muted"
                          )}>
                             {isServiceEnabled(activeServiceData.id) ? "Active & Running" : "Disabled"}
                          </span>
                       </div>
                    </div>
                 </Card>

                 {/* Configuration Panel */}
                 <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                    <div className="xl:col-span-2 space-y-6">
                       <Card className="p-6">
                          <h3 className="text-xs font-black text-zinc-text uppercase tracking-widest mb-6 border-b border-white/5 pb-2">Configuration</h3>
                          {/* Mock Forms based on Service */}
                          <div className="space-y-5">
                             <div className="space-y-1.5">
                                <label className="block text-[9px] font-black text-zinc-muted uppercase tracking-widest px-1">API Endpoint URL</label>
                                <input type="text" disabled={!isServiceEnabled(activeServiceData.id)} defaultValue={`https://api.zonevast.com/v1/${activeServiceData.id.toLowerCase()}`} className="w-full h-10 bg-obsidian-outer border border-white/5 rounded-sm px-3 text-xs font-mono text-zinc-text outline-none focus:border-brand/30 disabled:opacity-50" />
                             </div>
                             
                             <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                   <label className="block text-[9px] font-black text-zinc-muted uppercase tracking-widest px-1">Max Throughput</label>
                                   <select disabled={!isServiceEnabled(activeServiceData.id)} className="w-full h-10 bg-obsidian-outer border border-white/5 rounded-sm px-3 text-xs font-bold text-zinc-text outline-none focus:border-brand/30 disabled:opacity-50">
                                      <option>Standard (1k req/s)</option>
                                      <option>High (10k req/s)</option>
                                      <option>Ultra (Unlimited)</option>
                                   </select>
                                </div>
                                <div className="space-y-1.5">
                                   <label className="block text-[9px] font-black text-zinc-muted uppercase tracking-widest px-1">Region</label>
                                   <select disabled={!isServiceEnabled(activeServiceData.id)} className="w-full h-10 bg-obsidian-outer border border-white/5 rounded-sm px-3 text-xs font-bold text-zinc-text outline-none focus:border-brand/30 disabled:opacity-50">
                                      <option>Global (Auto)</option>
                                      <option>US-East</option>
                                      <option>EU-West</option>
                                   </select>
                                </div>
                             </div>

                             <div className="flex items-center gap-2 pt-2">
                                <input type="checkbox" className="accent-brand" id="logs" disabled={!isServiceEnabled(activeServiceData.id)} defaultChecked />
                                <label htmlFor="logs" className="text-[10px] font-bold text-zinc-muted uppercase tracking-widest cursor-pointer select-none">Enable Verbose Logging</label>
                             </div>
                          </div>
                          
                          <div className="mt-8 pt-4 border-t border-white/5 flex justify-end">
                             <Button size="sm" disabled={!isServiceEnabled(activeServiceData.id)}>Save Configuration</Button>
                          </div>
                       </Card>
                    </div>

                    <div className="space-y-6">
                       <Card className="p-6 bg-obsidian-panel/40">
                          <h3 className="text-xs font-black text-zinc-text uppercase tracking-widest mb-4">Service Health</h3>
                          {isServiceEnabled(activeServiceData.id) ? (
                             <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                   <span className="text-[10px] font-bold text-zinc-muted uppercase">Uptime (24h)</span>
                                   <span className="text-xs font-bold text-success">99.99%</span>
                                </div>
                                <div className="w-full bg-obsidian-outer h-1.5 rounded-full overflow-hidden">
                                   <div className="bg-success h-full w-[99%]" />
                                </div>
                                <div className="flex justify-between items-center pt-2">
                                   <span className="text-[10px] font-bold text-zinc-muted uppercase">Latency</span>
                                   <span className="text-xs font-bold text-zinc-text">24ms</span>
                                </div>
                             </div>
                          ) : (
                             <div className="flex flex-col items-center justify-center py-8 text-zinc-muted opacity-50">
                                <Activity className="w-8 h-8 mb-2" />
                                <span className="text-[10px] font-black uppercase tracking-widest">Service Inactive</span>
                             </div>
                          )}
                       </Card>
                       
                       <Card className="p-6 bg-obsidian-panel/40">
                          <h3 className="text-xs font-black text-zinc-text uppercase tracking-widest mb-4">Documentation</h3>
                          <ul className="space-y-2">
                             {['API Reference', 'Integration Guide', 'SLA Terms'].map(link => (
                                <li key={link} className="text-[10px] font-bold text-zinc-muted hover:text-brand cursor-pointer flex items-center gap-2 uppercase tracking-wide transition-colors">
                                   <div className="w-1 h-1 bg-zinc-muted rounded-full" /> {link}
                                </li>
                             ))}
                          </ul>
                       </Card>
                    </div>
                 </div>
              </div>
           )}
        </div>
      </div>
    </div>
  );
};
