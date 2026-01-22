
import React, { useState } from 'react';
import { Card } from '../components/ui/Card';
import { 
  Settings2, 
  Cpu, 
  Globe, 
  ShieldCheck, 
  Zap,
  Save,
  CheckCircle2,
  LayoutTemplate
} from 'lucide-react';
import { cn } from '../lib/cn';
import { Button } from '../components/ui/Button';
import { useProjects } from '../contexts/ProjectContext';

// Reusable Toggle Component
const ServiceToggle = ({ 
  label, 
  description, 
  enabled, 
  onChange, 
  icon: Icon 
}: { 
  label: string; 
  description: string; 
  enabled: boolean; 
  onChange: (val: boolean) => void; 
  icon: any; 
}) => (
  <div className={cn(
    "flex items-start justify-between p-5 border rounded-sm transition-all group",
    enabled ? "bg-brand/5 border-brand/20" : "bg-obsidian-outer border-white/5"
  )}>
    <div className="flex gap-4">
      <div className={cn(
        "w-10 h-10 rounded-sm flex items-center justify-center transition-colors",
        enabled ? "bg-brand/20 text-brand" : "bg-white/5 text-zinc-muted"
      )}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <h3 className={cn("text-xs font-black uppercase tracking-widest transition-colors", enabled ? "text-zinc-text" : "text-zinc-secondary")}>
          {label}
        </h3>
        <p className="text-[10px] font-medium text-zinc-muted mt-1 leading-relaxed max-w-sm">
          {description}
        </p>
      </div>
    </div>
    
    <button 
      onClick={() => onChange(!enabled)}
      className={cn(
        "w-10 h-5 rounded-full relative transition-colors duration-200 ease-in-out focus:outline-none shrink-0 mt-1",
        enabled ? "bg-brand" : "bg-white/10"
      )}
    >
      <div className={cn(
        "absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-obsidian-outer shadow-sm transition-transform duration-200 ease-in-out",
        enabled ? "translate-x-5" : "translate-x-0"
      )} />
    </button>
  </div>
);

export const ServiceSettings = () => {
  const { activeProject, toggleProjectFeature } = useProjects();
  const [saving, setSaving] = useState(false);

  // Mock save function since context updates immediately
  const handleSave = () => {
    setSaving(true);
    setTimeout(() => setSaving(false), 800);
  };

  if (!activeProject) return (
    <div className="p-8 text-center text-zinc-muted">Please select a project to configure services.</div>
  );

  return (
    <div className="animate-fade-up max-w-5xl mx-auto py-6 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/5 pb-6">
        <div>
          <h1 className="text-2xl font-black text-zinc-text uppercase italic tracking-tighter flex items-center gap-3">
            <Settings2 className="w-6 h-6 text-brand" /> Service Configuration
          </h1>
          <p className="text-[10px] font-black text-zinc-muted uppercase tracking-[0.3em] mt-1">
            Control active features for <span className="text-brand">{activeProject.name}</span>
          </p>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? 'Saving...' : (
            <>
              <Save className="w-4 h-4 mr-2" /> Save Changes
            </>
          )}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Configuration Area */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6 space-y-4">
            <div className="mb-4">
               <h2 className="text-sm font-black text-zinc-text uppercase tracking-widest">Core Features</h2>
               <p className="text-[9px] text-zinc-muted uppercase tracking-wider mt-1">Essential capabilities for this service instance.</p>
            </div>
            
            <ServiceToggle 
              label="Inventory Management"
              description="Enable stock tracking, low stock alerts, and warehouse management."
              icon={Zap}
              enabled={activeProject.features.enableInventory}
              onChange={() => toggleProjectFeature(activeProject.id, 'enableInventory')}
            />

            <ServiceToggle 
              label="Analytics Engine"
              description="Enable advanced reporting, sales velocity tracking, and visual dashboards."
              icon={Globe}
              enabled={activeProject.features.enableAnalytics}
              onChange={() => toggleProjectFeature(activeProject.id, 'enableAnalytics')}
            />

            <ServiceToggle 
              label="Product Wizard Mode"
              description="Use the step-by-step wizard for adding new products instead of the single-page form."
              icon={LayoutTemplate}
              enabled={activeProject.features.useProductWizard || false}
              onChange={() => toggleProjectFeature(activeProject.id, 'useProductWizard')}
            />
          </Card>

          <Card className="p-6 space-y-4">
            <div className="mb-4">
               <h2 className="text-sm font-black text-zinc-text uppercase tracking-widest">Diagnostics & Security</h2>
               <p className="text-[9px] text-zinc-muted uppercase tracking-wider mt-1">System health and integrity controls.</p>
            </div>

            <ServiceToggle 
              label="Detailed Audit Logging"
              description="Record every read/write operation to the immutable ledger. Increases storage usage."
              icon={ShieldCheck}
              enabled={true} // Mock read-only for now
              onChange={() => {}}
            />

            <ServiceToggle 
              label="Verbose Debug Mode"
              description="Output raw stack traces to the console. Not recommended for production."
              icon={Settings2}
              enabled={false}
              onChange={() => {}}
            />
          </Card>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
           <Card className="p-6 bg-obsidian-panel/40 border-brand/20">
              <h3 className="text-xs font-black text-brand uppercase tracking-widest mb-4">Service Status</h3>
              <div className="flex items-center gap-3 mb-6">
                 <div className="w-3 h-3 rounded-full bg-success animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                 <span className="text-sm font-bold text-zinc-text">Operational</span>
              </div>
              <div className="space-y-3">
                 <div className="flex justify-between text-[10px] font-bold text-zinc-muted uppercase tracking-widest">
                    <span>Uptime</span>
                    <span className="text-zinc-text">99.99%</span>
                 </div>
                 <div className="flex justify-between text-[10px] font-bold text-zinc-muted uppercase tracking-widest">
                    <span>Version</span>
                    <span className="text-zinc-text">v2.4.0</span>
                 </div>
                 <div className="flex justify-between text-[10px] font-bold text-zinc-muted uppercase tracking-widest">
                    <span>Region</span>
                    <span className="text-zinc-text">US-East</span>
                 </div>
              </div>
           </Card>

           <Card className="p-6 bg-obsidian-outer/50 border-white/5">
              <div className="flex items-center gap-2 mb-3">
                 <CheckCircle2 className="w-4 h-4 text-zinc-muted" />
                 <h3 className="text-[10px] font-black text-zinc-text uppercase tracking-widest">Last Sync</h3>
              </div>
              <p className="text-[9px] font-bold text-zinc-muted leading-relaxed">
                 Configuration was last synchronized with the master node just now by <strong>System Admin</strong>.
              </p>
           </Card>
        </div>
      </div>
    </div>
  );
};
