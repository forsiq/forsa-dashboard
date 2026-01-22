
import React, { useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { 
  Plus, 
  Zap, 
  Search, 
  Settings2, 
  History,
  ToggleLeft,
  ToggleRight,
  ArrowRight,
  Trash2
} from 'lucide-react';
import { cn } from '../../lib/cn';
import { useLanguage } from '../../amber-ui/contexts/LanguageContext';

const rules = [
  { id: 'R-001', name: 'Global Stock Re-indexing', trigger: 'Low Stock Event', action: 'Notify Admin + Sync Node', status: 'Enabled', lastRun: '2m ago' },
  { id: 'R-002', name: 'Security Audit Purge', trigger: 'Every 24 Hours', action: 'Archive Logs + Clear Cache', status: 'Enabled', lastRun: '6h ago' },
  { id: 'R-003', name: 'Region Failover Sequence', trigger: 'Node Downtime Detected', action: 'Redirect Traffic to EU-W', status: 'Disabled', lastRun: '12d ago' },
  { id: 'R-004', name: 'Auto-Scaling Provision', trigger: 'Latency > 100ms', action: 'Initialize Lambda Instance', status: 'Enabled', lastRun: '44m ago' },
];

export const AutomationTemplate = () => {
  const { t } = useLanguage();
  const [activeRule, setActiveRule] = useState<string | null>(null);

  return (
    <div className="animate-fade-up max-w-6xl mx-auto py-4 space-y-8">
      {/* Automation Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/5 pb-6">
        <div>
           <div className="flex items-center gap-2 text-brand mb-1">
             <Zap className="w-5 h-5 fill-brand" />
             <h1 className="text-2xl font-black uppercase italic tracking-tighter">{t('auto.title')}</h1>
           </div>
           <p className="text-[10px] font-black text-zinc-muted uppercase tracking-[0.3em] italic">{t('auto.subtitle')}</p>
        </div>
        <div className="flex gap-2">
           <Button variant="secondary" size="sm"><History className="w-3.5 h-3.5 mr-2 rtl:ml-2 rtl:mr-0" /> {t('auto.history')}</Button>
           <Button size="sm"><Plus className="w-3.5 h-3.5 mr-2 rtl:ml-2 rtl:mr-0" /> {t('auto.new_rule')}</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Rules Directory */}
        <div className="lg:col-span-7 space-y-4">
           <div className="relative mb-6">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-muted" />
             <input 
               type="text" 
               placeholder="..."
               className="w-full h-10 bg-obsidian-panel border border-white/5 rounded-sm pl-10 pr-4 text-xs font-bold text-zinc-text outline-none focus:border-brand/30 transition-all italic"
             />
           </div>

           <div className="space-y-3">
              {rules.map((rule) => (
                <Card 
                  key={rule.id} 
                  className={cn(
                    "p-0 overflow-hidden hover:border-brand/20 transition-all cursor-pointer group",
                    activeRule === rule.id ? "border-brand/40 ring-1 ring-brand/10" : "border-white/5"
                  )}
                  onClick={() => setActiveRule(rule.id)}
                >
                   <div className="flex items-center p-5 gap-6">
                      <div className={cn(
                        "w-12 h-12 rounded-sm border flex items-center justify-center shrink-0 transition-colors",
                        rule.status === 'Enabled' ? "bg-brand/5 border-brand/20 text-brand" : "bg-obsidian-outer border-white/10 text-zinc-muted"
                      )}>
                        <Zap className={cn("w-6 h-6", rule.status === 'Enabled' ? "fill-brand" : "")} />
                      </div>
                      <div className="flex-1 min-w-0">
                         <div className="flex items-center gap-3 mb-1">
                            <h3 className="text-sm font-black text-zinc-text uppercase tracking-tight italic group-hover:text-brand transition-colors">{rule.name}</h3>
                            <span className="text-[8px] font-bold text-zinc-muted font-mono">{rule.id}</span>
                         </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                         <div className="flex items-center gap-2">
                           {rule.status === 'Enabled' ? <ToggleRight className="w-5 h-5 text-success" /> : <ToggleLeft className="w-5 h-5 text-zinc-muted" />}
                         </div>
                         <span className="text-[8px] font-black text-zinc-muted uppercase">Run: {rule.lastRun}</span>
                      </div>
                   </div>
                </Card>
              ))}
           </div>
        </div>

        {/* Rule Builder */}
        <div className="lg:col-span-5 space-y-6">
           <Card className="p-8 border-brand/20 bg-obsidian-panel/40" glass>
              <div className="flex items-center justify-between mb-8">
                 <h3 className="text-xs font-black text-brand uppercase tracking-[0.4em]">{t('auto.builder_title')}</h3>
                 <Settings2 className="w-4 h-4 text-zinc-muted" />
              </div>

              <div className="space-y-8 relative before:absolute before:inset-y-0 before:left-[11px] before:w-0.5 before:bg-white/5 rtl:before:left-auto rtl:before:right-[11px]">
                 {/* Step 1 */}
                 <div className="relative pl-10 rtl:pl-0 rtl:pr-10 space-y-2">
                    <div className="absolute left-0 rtl:left-auto rtl:right-0 top-0 w-6 h-6 rounded-full bg-brand text-obsidian-outer flex items-center justify-center text-[10px] font-black shadow-[0_0_15px_rgba(245,196,81,0.4)]">
                       1
                    </div>
                    <div>
                       <h4 className="text-[10px] font-black text-zinc-text uppercase tracking-widest">{t('auto.step1_title')}</h4>
                       <p className="text-[9px] font-bold text-zinc-muted uppercase italic mt-0.5">{t('auto.step1_desc')}</p>
                    </div>
                 </div>

                 {/* Step 2 */}
                 <div className="relative pl-10 rtl:pl-0 rtl:pr-10 space-y-2">
                    <div className="absolute left-0 rtl:left-auto rtl:right-0 top-0 w-6 h-6 rounded-full bg-obsidian-card border border-white/10 text-brand flex items-center justify-center text-[10px] font-black">
                       2
                    </div>
                    <div>
                       <h4 className="text-[10px] font-black text-zinc-text uppercase tracking-widest">{t('auto.step2_title')}</h4>
                       <p className="text-[9px] font-bold text-zinc-muted uppercase italic mt-0.5">{t('auto.step2_desc')}</p>
                    </div>
                 </div>

                 {/* Step 3 */}
                 <div className="relative pl-10 rtl:pl-0 rtl:pr-10 space-y-2">
                    <div className="absolute left-0 rtl:left-auto rtl:right-0 top-0 w-6 h-6 rounded-full bg-success text-obsidian-outer flex items-center justify-center text-[10px] font-black">
                       3
                    </div>
                    <div>
                       <h4 className="text-[10px] font-black text-zinc-text uppercase tracking-widest">{t('auto.step3_title')}</h4>
                       <p className="text-[9px] font-bold text-zinc-muted uppercase italic mt-0.5">{t('auto.step3_desc')}</p>
                    </div>
                 </div>
              </div>

              <div className="mt-12 pt-6 border-t border-white/5 flex gap-3">
                 <Button className="flex-1">Update Logic</Button>
                 <button className="p-2.5 bg-danger/5 border border-danger/20 text-danger rounded-sm hover:bg-danger/10 transition-colors">
                    <Trash2 className="w-4 h-4" />
                 </button>
              </div>
           </Card>

           <Card className="p-5">
              <h3 className="text-xs font-black text-zinc-muted uppercase tracking-widest mb-4 italic">{t('auto.summary_title')}</h3>
              <div className="grid grid-cols-2 gap-4">
                 <div className="p-3 bg-white/[0.02] border border-white/5 rounded-sm text-center">
                    <p className="text-[8px] font-black text-zinc-muted uppercase mb-1">Total Runs</p>
                    <p className="text-sm font-black text-zinc-text">1,482</p>
                 </div>
                 <div className="p-3 bg-white/[0.02] border border-white/5 rounded-sm text-center">
                    <p className="text-[8px] font-black text-zinc-muted uppercase mb-1">Success Rate</p>
                    <p className="text-sm font-black text-success">100%</p>
                 </div>
              </div>
           </Card>
        </div>
      </div>
    </div>
  );
};
