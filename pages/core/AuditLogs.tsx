
import React from 'react';
import { Card } from '../../components/ui/Card';
import { Terminal, Shield, Filter, Download, Activity, User } from 'lucide-react';
import { cn } from '../../lib/cn';
import { useLanguage } from '../../amber-ui/contexts/LanguageContext';

const logs = [
  { id: 'LOG-882', time: '2025-05-20 12:44:01', actor: 'Alex Morgan', action: 'SCHEMA_UPDATE', node: 'CORE-01', status: 'SUCCESS' },
  { id: 'LOG-881', time: '2025-05-20 12:30:12', actor: 'System Process', action: 'BATCH_SYNC_SHOPIFY', node: 'DATA-04', status: 'SUCCESS' },
  { id: 'LOG-880', time: '2025-05-20 11:15:55', actor: 'Maria Garcia', action: 'DELETE_PRODUCT', node: 'CORE-02', status: 'WARNING' },
  { id: 'LOG-879', time: '2025-05-20 09:12:00', actor: 'Unknown Node', action: 'AUTH_ATTEMPT_FAILED', node: 'AUTH-SEC', status: 'ERROR' },
  { id: 'LOG-878', time: '2025-05-19 23:59:59', actor: 'System Process', action: 'CACHE_PURGE', node: 'CORE-01', status: 'SUCCESS' },
  { id: 'LOG-877', time: '2025-05-19 21:00:22', actor: 'James Wilson', action: 'PERMISSION_CHANGE', node: 'AUTH-SEC', status: 'SUCCESS' },
];

export const AuditLogs = () => {
  const { t } = useLanguage();

  return (
    <div className="animate-fade-up max-w-6xl mx-auto py-4 px-2 space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/5 pb-4">
        <div>
           <div className="flex items-center gap-2 text-brand mb-1">
             <Shield className="w-4 h-4" />
             <h1 className="text-xl font-black uppercase italic tracking-tighter">{t('audit.title')}</h1>
           </div>
           <p className="text-[10px] font-black text-zinc-muted uppercase tracking-[0.3em]">{t('audit.subtitle')}</p>
        </div>
        <div className="flex gap-2">
           <button className="flex items-center gap-2 px-3 py-1.5 bg-transparent rounded-sm text-[9px] font-black text-zinc-muted hover:text-zinc-text transition-all uppercase tracking-widest">
             <Download className="w-3.5 h-3.5" /> {t('audit.export')}
           </button>
           <button className="flex items-center gap-2 px-3 py-1.5 bg-obsidian-card border border-white/5 rounded-sm text-[9px] font-black text-zinc-muted hover:text-zinc-text transition-all uppercase tracking-widest">
             <Filter className="w-3 h-3" /> {t('audit.filter')}
           </button>
        </div>
      </div>

      <Card className="p-0 overflow-hidden bg-obsidian-panel/30 border-white/[0.03]" glass>
        <div className="overflow-x-auto">
          <table className="w-full text-start border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-white/[0.02] border-b border-white/5">
                <th className="px-5 py-3 text-start text-[9px] font-black text-zinc-muted uppercase tracking-[0.2em]">{t('audit.table.timestamp')}</th>
                <th className="px-5 py-3 text-start text-[9px] font-black text-zinc-muted uppercase tracking-[0.2em]">{t('audit.table.actor')}</th>
                <th className="px-5 py-3 text-start text-[9px] font-black text-zinc-muted uppercase tracking-[0.2em]">{t('audit.table.operation')}</th>
                <th className="px-5 py-3 text-start text-[9px] font-black text-zinc-muted uppercase tracking-[0.2em]">{t('audit.table.node')}</th>
                <th className="px-5 py-3 text-start text-[9px] font-black text-zinc-muted uppercase tracking-[0.2em]">{t('audit.table.status')}</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.03]">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="px-5 py-2">
                     <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-zinc-text font-mono">{log.time}</span>
                        <span className="text-[8px] font-black text-zinc-muted mt-0.5 tracking-tighter">{log.id}</span>
                     </div>
                  </td>
                  <td className="px-5 py-2">
                     <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-sm bg-obsidian-outer border border-white/5 flex items-center justify-center">
                           <User className="w-2.5 h-2.5 text-zinc-muted" />
                        </div>
                        <span className="text-[10px] font-black text-zinc-secondary uppercase tracking-tight">{log.actor}</span>
                     </div>
                  </td>
                  <td className="px-5 py-2 text-[10px] font-black text-zinc-text uppercase italic tracking-wider">
                     {log.action}
                  </td>
                  <td className="px-5 py-2">
                     <span className="text-[9px] font-bold text-zinc-muted font-mono">{log.node}</span>
                  </td>
                  <td className="px-5 py-2">
                    <span className={cn(
                      "text-[8px] font-black px-1.5 py-0.5 rounded-sm uppercase tracking-widest border",
                      log.status === 'SUCCESS' ? 'bg-success/5 text-success border-success/20' :
                      log.status === 'WARNING' ? 'bg-warning/5 text-warning border-warning/20' :
                      'bg-danger/5 text-danger border-danger/20'
                    )}>
                      {log.status}
                    </span>
                  </td>
                  <td className="px-5 py-2 text-end">
                     <button className="text-[8px] font-black text-zinc-muted hover:text-brand transition-colors uppercase">{t('label.details')}</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-3 border-t border-white/5 flex items-center justify-between text-[9px] font-black text-zinc-muted uppercase tracking-widest">
           <span>Page 01 of 184</span>
           <div className="flex gap-4">
              <button disabled className="opacity-30">Prev</button>
              <button className="hover:text-brand">Next</button>
           </div>
        </div>
      </Card>
    </div>
  );
};
