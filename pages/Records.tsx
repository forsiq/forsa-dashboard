
import React from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { 
  FileText, 
  Search, 
  Filter, 
  Download, 
  Hash, 
  Database,
  FileCode,
  FileJson
} from 'lucide-react';
import { useLanguage } from '../amber-ui/contexts/LanguageContext';
import { cn } from '../lib/cn';

const records = [
  { id: 'REC-9921', name: 'Global_Config_Manifest_v4.json', type: 'JSON', module: 'System Core', hash: '0x4f...921', date: '2025-05-20 12:44' },
  { id: 'REC-8812', name: 'User_Auth_Policy_Security.xml', type: 'XML', module: 'Auth Node', hash: '0x9a...22b', date: '2025-05-20 11:30' },
  { id: 'REC-7734', name: 'Inventory_Batch_Log_X9.csv', type: 'CSV', module: 'Inventory', hash: '0x1c...884', date: '2025-05-19 16:22' },
  { id: 'REC-6621', name: 'Compute_Node_Registry.yaml', type: 'YAML', module: 'Infrastructure', hash: '0x3d...119', date: '2025-05-19 09:15' },
  { id: 'REC-5592', name: 'API_Gateway_Routes.ts', type: 'TypeScript', module: 'Network', hash: '0x8e...772', date: '2025-05-18 22:00' },
];

export const Records = () => {
  const { t } = useLanguage();

  return (
    <div className="animate-fade-up space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
             <FileText className="w-5 h-5 text-brand" />
             <h1 className="text-2xl font-black text-zinc-text uppercase italic tracking-tighter">{t('rec.title')}</h1>
          </div>
          <p className="text-[10px] font-black text-zinc-muted uppercase tracking-[0.3em] italic">{t('rec.subtitle')}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" className="text-zinc-muted hover:text-zinc-text">
            <Download className="w-3.5 h-3.5 mr-2 rtl:ml-2 rtl:mr-0" /> {t('label.export')}
          </Button>
          <Button size="sm">
            <Filter className="w-3.5 h-3.5 mr-2 rtl:ml-2 rtl:mr-0" /> {t('label.filter')}
          </Button>
        </div>
      </div>

      {/* Filter Bar */}
      <Card className="bg-obsidian-panel/40 border border-white/5 rounded-sm p-4 relative z-10" glass>
        <div className="relative w-full">
          <Search className="absolute left-3 rtl:left-auto rtl:right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-muted" />
          <input 
            type="text" 
            placeholder={t('rec.search')}
            className="w-full bg-obsidian-outer border border-white/5 rounded-sm pl-10 pr-4 rtl:pr-10 rtl:pl-4 py-2.5 text-xs font-bold text-zinc-text outline-none focus:border-brand/30 transition-all placeholder:text-zinc-muted/60"
          />
        </div>
      </Card>

      {/* Records Table */}
      <Card noPadding className="bg-obsidian-panel/30 border-white/[0.03]" glass>
        <div className="overflow-x-auto">
          <table className="w-full text-start border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-white/[0.02] border-b border-white/5">
                <th className="px-6 py-4 text-start text-[9px] font-black text-zinc-muted uppercase tracking-[0.2em] italic">{t('rec.table.id')}</th>
                <th className="px-6 py-4 text-start text-[9px] font-black text-zinc-muted uppercase tracking-[0.2em] italic">{t('rec.table.name')}</th>
                <th className="px-6 py-4 text-start text-[9px] font-black text-zinc-muted uppercase tracking-[0.2em] italic">{t('rec.table.module')}</th>
                <th className="px-6 py-4 text-start text-[9px] font-black text-zinc-muted uppercase tracking-[0.2em] italic">{t('rec.table.hash')}</th>
                <th className="px-6 py-4 text-start text-[9px] font-black text-zinc-muted uppercase tracking-[0.2em] italic">{t('rec.table.date')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.03]">
              {records.map((rec) => (
                <tr key={rec.id} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="px-6 py-3">
                     <span className="font-mono text-[10px] font-bold text-brand uppercase tracking-widest">{rec.id}</span>
                  </td>
                  <td className="px-6 py-3">
                     <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-sm bg-obsidian-outer border border-white/5 flex items-center justify-center text-zinc-muted">
                           {rec.type === 'JSON' ? <FileJson className="w-4 h-4" /> : rec.type === 'CSV' ? <Database className="w-4 h-4" /> : <FileCode className="w-4 h-4" />}
                        </div>
                        <span className="text-sm font-bold text-zinc-text group-hover:text-brand transition-colors">{rec.name}</span>
                     </div>
                  </td>
                  <td className="px-6 py-3">
                     <span className="text-[10px] font-black bg-white/5 px-2 py-0.5 rounded-sm border border-white/5 text-zinc-secondary uppercase tracking-tighter">{rec.module}</span>
                  </td>
                  <td className="px-6 py-3">
                     <div className="flex items-center gap-2 text-zinc-muted font-mono text-[10px]">
                        <Hash className="w-3 h-3" />
                        {rec.hash}
                     </div>
                  </td>
                  <td className="px-6 py-3">
                     <span className="text-[10px] font-bold text-zinc-muted uppercase tracking-tight">{rec.date}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
