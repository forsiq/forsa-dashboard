
import React, { useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Dropdown } from '../../components/ui/Dropdown';
import { 
  Plus, 
  Search, 
  MoreVertical, 
  Download, 
  ChevronRight, 
  CheckSquare, 
  Square,
  ArrowUpDown,
  ListFilter,
  Layers,
  Activity,
  Zap,
  ShieldCheck
} from 'lucide-react';
import { cn } from '../../lib/cn';
import { useLanguage } from '../../amber-ui/contexts/LanguageContext';

export const ListTemplate = () => {
  const { t } = useLanguage();
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  const mockData = Array.from({ length: 10 }).map((_, i) => ({
    id: `ID-${1000 + i}`,
    title: `Enterprise Service Resource ${i + 1}`,
    type: i % 2 === 0 ? 'Production' : 'Development',
    status: i % 3 === 0 ? 'Active' : 'Pending',
    health: 70 + Math.floor(Math.random() * 30)
  }));

  const toggleSelectAll = () => {
    if (selectedItems.length === mockData.length) setSelectedItems([]);
    else setSelectedItems(mockData.map(d => d.id));
  };

  const toggleSelect = (id: string) => {
    setSelectedItems(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  return (
    <div className="animate-fade-up space-y-6 max-w-7xl mx-auto py-4 px-2">
      {/* 1. Header Area */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-zinc-text uppercase italic tracking-tighter">{t('list.title')}</h1>
          <p className="text-[10px] font-black text-zinc-muted uppercase tracking-[0.3em] mt-1 italic">{t('list.subtitle')}</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2 bg-transparent rounded-sm text-[10px] font-black text-zinc-muted hover:text-zinc-text transition-all uppercase tracking-widest italic">
            <Download className="w-3.5 h-3.5" /> {t('list.bulk_export')}
          </button>
          <button className="flex items-center gap-2 px-5 py-2 bg-brand text-obsidian-outer rounded-sm text-[10px] font-black shadow-sm hover:opacity-90 transition-all uppercase tracking-widest italic">
            <Plus className="w-4 h-4" /> {t('list.deploy')}
          </button>
        </div>
      </div>

      {/* 2. Stats Grid (Added per spec) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Nodes', value: '42', icon: Layers, color: 'text-brand' },
          { label: 'Active Clusters', value: '14', icon: Activity, color: 'text-success' },
          { label: 'Throughput', value: '98%', icon: Zap, color: 'text-info' },
          { label: 'Health Score', value: 'A+', icon: ShieldCheck, color: 'text-warning' },
        ].map((stat, i) => (
          <Card key={i} className="p-4 hover:border-brand/20 transition-all cursor-default">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[9px] font-black text-zinc-muted uppercase tracking-widest mb-1">{stat.label}</p>
                <p className="text-lg font-black text-zinc-text tracking-tighter">{stat.value}</p>
              </div>
              <stat.icon className={cn("w-5 h-5 opacity-20", stat.color)} />
            </div>
          </Card>
        ))}
      </div>

      {/* 3. Filter Bar */}
      <Card className="bg-obsidian-panel/40 border border-white/5 rounded-sm p-4 flex flex-col lg:flex-row gap-4 items-end relative z-10" glass>
        <div className="flex-1 w-full">
          <label className="block text-[9px] font-black text-zinc-muted uppercase tracking-widest mb-1.5 px-1 italic">{t('list.global_filter')}</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-muted" />
            <input 
              type="text" 
              placeholder="..."
              className="w-full h-10 bg-obsidian-outer border border-white/5 rounded-sm pl-10 pr-4 text-xs outline-none focus:border-brand/30 transition-all placeholder:text-zinc-muted/40 italic rtl:pl-4 rtl:pr-10"
            />
          </div>
        </div>
        
        <Dropdown label={t('list.type_label')} options={[{label: 'All Nodes', value: 'all'}]} value="all" onChange={() => {}} className="w-full lg:w-44" />
        <Dropdown label={t('list.status_label')} options={[{label: 'All Active', value: 'all'}]} value="all" onChange={() => {}} className="w-full lg:w-44" />
        
        <button className="h-10 px-4 bg-obsidian-card border border-white/5 text-zinc-muted hover:text-zinc-text transition-all rounded-sm flex items-center justify-center">
          <ListFilter className="w-4 h-4" />
        </button>
      </Card>

      {/* 4. Authoritative Table */}
      <Card className="p-0 overflow-hidden bg-obsidian-panel/30 border-white/[0.03]" glass>
        <div className="overflow-x-auto">
          <table className="w-full text-start border-collapse min-w-[1000px]">
            <thead>
              <tr className="bg-white/[0.02] border-b border-white/5">
                <th className="w-12 px-5 py-3">
                  <button onClick={toggleSelectAll} className="text-zinc-muted hover:text-brand transition-colors">
                    {selectedItems.length === mockData.length ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
                  </button>
                </th>
                <th className="px-5 py-3 text-start text-[9px] font-black text-zinc-muted uppercase tracking-[0.2em] italic">
                   <div className="flex items-center gap-2 cursor-pointer hover:text-zinc-text transition-colors group">
                     {t('list.table.id')} <ArrowUpDown className="w-3 h-3 opacity-0 group-hover:opacity-40" />
                   </div>
                </th>
                <th className="px-5 py-3 text-start text-[9px] font-black text-zinc-muted uppercase tracking-[0.2em] italic">{t('list.table.auth')}</th>
                <th className="px-5 py-3 text-start text-[9px] font-black text-zinc-muted uppercase tracking-[0.2em] italic">{t('list.table.integrity')}</th>
                <th className="px-5 py-3 text-start text-[9px] font-black text-zinc-muted uppercase tracking-[0.2em] italic">{t('list.table.status')}</th>
                <th className="px-5 py-3 text-end"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.03]">
              {mockData.map((item) => (
                <tr key={item.id} className={cn(
                  "transition-colors group",
                  selectedItems.includes(item.id) ? "bg-brand/[0.03]" : "hover:bg-white/[0.02]"
                )}>
                  <td className="px-5 py-2.5">
                     <button onClick={() => toggleSelect(item.id)} className={cn(
                       "transition-colors",
                       selectedItems.includes(item.id) ? "text-brand" : "text-zinc-muted"
                     )}>
                       {selectedItems.includes(item.id) ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
                     </button>
                  </td>
                  <td className="px-5 py-2.5 font-mono text-[10px] font-bold text-brand uppercase tracking-widest italic">{item.id}</td>
                  <td className="px-5 py-2.5">
                     <div className="space-y-0.5">
                        <p className="text-xs font-black text-zinc-text uppercase tracking-tight italic">{item.title}</p>
                        <p className="text-[9px] font-bold text-zinc-muted uppercase tracking-widest">{item.type} Cluster</p>
                     </div>
                  </td>
                  <td className="px-5 py-2.5">
                     <div className="flex items-center gap-3">
                        <div className="flex-1 w-24 h-1 bg-obsidian-outer rounded-full overflow-hidden border border-white/5">
                           <div className="h-full bg-success" style={{ width: `${item.health}%` }} />
                        </div>
                        <span className="text-[10px] font-black text-zinc-text">{item.health}%</span>
                     </div>
                  </td>
                  <td className="px-5 py-2.5">
                     <span className={cn(
                       "text-[8px] font-black px-2 py-0.5 rounded-sm border uppercase tracking-widest italic",
                       item.status === 'Active' ? 'bg-success/5 text-success border-success/20' : 'bg-warning/5 text-warning border-warning/20'
                     )}>
                       {item.status}
                     </span>
                  </td>
                  <td className="px-5 py-2.5 text-end">
                     <button className="p-2 text-zinc-muted hover:text-brand transition-colors"><MoreVertical className="w-4 h-4" /></button>
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
