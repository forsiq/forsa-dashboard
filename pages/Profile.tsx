
import React from 'react';
import { Card } from '../components/ui/Card';
import { useLanguage } from '../amber-ui/contexts/LanguageContext';
import { User, Mail, Shield, Key, History, Terminal } from 'lucide-react';

export const Profile = () => {
  const { t } = useLanguage();

  return (
    <div className="animate-fade-up max-w-4xl mx-auto py-4 px-2 space-y-6">
      <div className="flex items-center gap-6 pb-6 border-b border-white/5">
        <div className="w-20 h-20 rounded bg-obsidian-card border border-brand/20 flex items-center justify-center text-3xl font-black text-brand italic">
          AM
        </div>
        <div>
           <h1 className="text-xl font-black text-zinc-text tracking-tighter uppercase italic">Alex Morgan</h1>
           <p className="text-[10px] font-black text-brand uppercase tracking-[0.3em] mt-1">Catalog Administrator • Senior Level</p>
           <div className="flex gap-4 mt-3">
              <div className="flex items-center gap-1.5 text-[9px] font-bold text-zinc-muted uppercase tracking-widest">
                <Mail className="w-3 h-3" /> alex@zonevast.corp
              </div>
              <div className="flex items-center gap-1.5 text-[9px] font-bold text-zinc-muted uppercase tracking-widest">
                <Shield className="w-3 h-3" /> Role: SUPER_ADMIN
              </div>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-4" glass>
            <h3 className="text-[10px] font-black text-zinc-text uppercase tracking-widest mb-4 flex items-center gap-2">
              <History className="w-3.5 h-3.5 text-brand" /> Account Activity
            </h3>
            <div className="space-y-2">
              {[
                { ev: 'Catalog Schema Modified', time: '2h ago', node: 'ZV-CORE-01' },
                { ev: 'Bulk Export: SKU_PRICING', time: 'Yesterday', node: 'ZV-DATA-04' },
                { ev: 'User Credentials Updated', time: '3d ago', node: 'ZV-AUTH-SEC' },
              ].map((log, i) => (
                <div key={i} className="flex items-center justify-between p-2.5 bg-obsidian-outer/40 border border-white/5 rounded-sm text-[9px] font-bold">
                  <span className="text-zinc-text uppercase italic">{log.ev}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-zinc-muted">{log.time}</span>
                    <span className="text-[8px] bg-white/5 px-1.5 py-0.5 rounded text-zinc-muted uppercase">{log.node}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div className="space-y-4">
          <Card className="p-4 bg-brand/5 border-brand/10">
            <h3 className="text-[9px] font-black text-brand uppercase tracking-widest mb-3 flex items-center gap-2">
              <Key className="w-3.5 h-3.5" /> Security Status
            </h3>
            <p className="text-[10px] font-bold text-zinc-secondary leading-relaxed uppercase italic">
              2FA: ENFORCED<br/>
              LAST PASSWORD CHANGE: 12D AGO<br/>
              NODE CLEARANCE: LEVEL 5
            </p>
          </Card>
          
          <Card className="p-4">
             <h3 className="text-[9px] font-black text-zinc-muted uppercase tracking-widest mb-3 flex items-center gap-2">
               <Terminal className="w-3.5 h-3.5" /> Assigned Nodes
             </h3>
             <div className="space-y-1.5">
                {['CATALOG_WRITE', 'INVENTORY_ADMIN', 'ANALYTICS_VIEW'].map(tag => (
                  <div key={tag} className="text-[8px] font-black bg-white/5 p-1.5 rounded text-zinc-muted uppercase tracking-[0.2em] italic border border-white/5">
                    {tag}
                  </div>
                ))}
             </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
