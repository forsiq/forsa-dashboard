
import React, { useState } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { 
  PlayCircle, 
  RefreshCw, 
  Trash2, 
  ShieldCheck, 
  Database, 
  CloudLightning,
  Network,
  Lock,
  Play
} from 'lucide-react';
import { useLanguage } from '../amber-ui/contexts/LanguageContext';
import { cn } from '../lib/cn';

const actions = [
  { id: 'act_01', title: 'Purge Global Cache', desc: 'Clear CDN buffers and local storage cache nodes.', icon: Trash2, color: 'text-danger' },
  { id: 'act_02', title: 'Sync Inventory Mesh', desc: 'Force synchronization of SKU data across all regional clusters.', icon: RefreshCw, color: 'text-brand' },
  { id: 'act_03', title: 'Validate Schemas', desc: 'Run integrity checks on all JSON/XML configuration files.', icon: ShieldCheck, color: 'text-success' },
  { id: 'act_04', title: 'Database Optimization', desc: 'Re-index primary SQL tables and vacuum dead tuples.', icon: Database, color: 'text-info' },
  { id: 'act_05', title: 'Restart Edge Nodes', desc: 'Reboot the AP-South and EU-West compute instances.', icon: CloudLightning, color: 'text-warning' },
  { id: 'act_06', title: 'Flush DNS Resolver', desc: 'Reset internal networking DNS cache for the VPC.', icon: Network, color: 'text-zinc-text' },
  { id: 'act_07', title: 'Rotate API Keys', desc: 'Invalidate current session tokens and generate new ones.', icon: Lock, color: 'text-brand' },
];

export const Actions = () => {
  const { t } = useLanguage();
  const [executing, setExecuting] = useState<string | null>(null);

  const handleExecute = (id: string) => {
    setExecuting(id);
    setTimeout(() => setExecuting(null), 2000);
  };

  return (
    <div className="animate-fade-up space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
             <PlayCircle className="w-5 h-5 text-brand" />
             <h1 className="text-2xl font-black text-zinc-text uppercase italic tracking-tighter">{t('act.title')}</h1>
          </div>
          <p className="text-[10px] font-black text-zinc-muted uppercase tracking-[0.3em] italic">{t('act.subtitle')}</p>
        </div>
      </div>

      {/* Actions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {actions.map((act) => (
          <Card key={act.id} className="p-6 border-white/[0.03] hover:border-brand/30 transition-all group flex flex-col justify-between h-full bg-obsidian-panel/40" glass>
             <div className="space-y-4">
                <div className="flex justify-between items-start">
                   <div className={cn("p-3 rounded-sm bg-obsidian-outer border border-white/5 group-hover:border-brand/20 transition-all", act.color)}>
                      <act.icon className="w-6 h-6" />
                   </div>
                   <span className="text-[9px] font-black text-zinc-muted font-mono">{act.id}</span>
                </div>
                <div>
                   <h3 className="text-sm font-black text-zinc-text uppercase tracking-tight italic group-hover:text-brand transition-colors">{act.title}</h3>
                   <p className="text-[10px] font-bold text-zinc-secondary mt-2 leading-relaxed opacity-80">{act.desc}</p>
                </div>
             </div>
             
             <div className="mt-8">
                <Button 
                  onClick={() => handleExecute(act.id)}
                  disabled={executing === act.id}
                  className={cn(
                    "w-full text-[10px] uppercase tracking-widest font-black flex items-center justify-center gap-2",
                    executing === act.id ? "bg-white/5 text-zinc-muted border-white/5" : "bg-brand text-obsidian-outer hover:bg-brand/90"
                  )}
                >
                  {executing === act.id ? (
                    <>
                      <div className="w-3 h-3 rounded-full border-2 border-zinc-muted border-t-transparent animate-spin" />
                      {t('act.running')}
                    </>
                  ) : (
                    <>
                      <Play className="w-3 h-3 fill-current" />
                      {t('act.btn')}
                    </>
                  )}
                </Button>
             </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
