
import React, { useState } from 'react';
import { Card } from '../components/Card';
import { Button } from '../components/ui/Button';
import { Dropdown } from '../components/ui/Dropdown';
import { 
  Plus, 
  Search, 
  Play, 
  Square, 
  RefreshCw, 
  MoreVertical, 
  Globe,
  Cpu,
  Server
} from 'lucide-react';
import { useLanguage } from '../amber-ui/contexts/LanguageContext';

const instances = [
  { id: 'zv-001', name: 'Web-Server-Primary', type: 'zv.small', ip: '10.0.4.122', region: 'US-East', status: 'Running' },
  { id: 'zv-002', name: 'AI-Training-Node', type: 'zv.xlarge.gpu', ip: '10.0.1.44', region: 'EU-West', status: 'Running' },
  { id: 'zv-003', name: 'DB-Cluster-01', type: 'zv.medium', ip: '10.0.2.89', region: 'AP-South', status: 'Stopped' },
  { id: 'zv-004', name: 'Load-Balancer-Edge', type: 'zv.nano', ip: '192.168.1.1', region: 'Global', status: 'Provisioning' },
];

export const Compute: React.FC = () => {
  const { t, language, dir } = useLanguage();
  const [statusFilter, setStatusFilter] = useState('all');

  const statusOptions = [
    { label: t('label.all'), value: 'all' },
    { label: language === 'ar' ? 'يعمل' : 'Running', value: 'running' },
    { label: language === 'ar' ? 'متوقف' : 'Stopped', value: 'stopped' },
    { label: language === 'ar' ? 'جاري التهيئة' : 'Provisioning', value: 'provisioning' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-zinc-text tracking-widest uppercase">{t('comp.title')}</h1>
          <p className="text-sm text-zinc-muted font-medium mt-1">{t('comp.subtitle')}</p>
        </div>
        <Button size="sm" className="px-6 h-10">
          <Plus className={dir === 'rtl' ? "ml-2 w-4 h-4" : "mr-2 w-4 h-4"} />
          {t('comp.deploy')}
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-end bg-obsidian-panel p-4 rounded-sm border border-white/5 relative z-10">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 rtl:left-auto rtl:right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-muted" />
          <input 
            type="text" 
            placeholder={t('comp.search')}
            className="w-full bg-obsidian-outer border border-white/5 rounded-sm pl-10 pr-4 rtl:pr-10 rtl:pl-4 py-2.5 text-sm outline-none focus:border-white/10 transition-all placeholder-zinc-muted h-[40px]"
          />
        </div>
        <Dropdown 
          label={t('label.status')}
          options={statusOptions}
          value={statusFilter}
          onChange={setStatusFilter}
        />
        <div className="flex gap-2 h-[40px]">
           <button className="px-3 bg-obsidian-outer border border-white/5 rounded-sm text-zinc-muted hover:text-zinc-text transition-colors"><RefreshCw className="w-4 h-4" /></button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {instances.map((vm) => (
          <Card key={vm.id} className="group hover:border-brand/20 transition-all p-0">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between p-6 gap-6">
              <div className="flex items-start gap-5">
                <div className={`w-14 h-14 flex items-center justify-center rounded-sm border ${vm.status === 'Running' ? 'bg-success/5 border-success/20 text-success' : vm.status === 'Stopped' ? 'bg-zinc-muted/5 border-white/10 text-zinc-muted' : 'bg-info/5 border-info/20 text-info animate-pulse'}`}>
                  <Server className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-md font-black text-zinc-text group-hover:text-brand transition-colors uppercase italic tracking-tight">{vm.name}</h3>
                  <div className="flex items-center gap-3 mt-1.5">
                    <span className="font-mono text-[10px] text-zinc-muted font-bold tracking-widest uppercase">{vm.id}</span>
                    <span className="text-[10px] font-black px-2 py-0.5 rounded bg-obsidian-outer border border-white/5 text-zinc-secondary uppercase tracking-tighter">{vm.type}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 flex-1 lg:max-w-3xl px-2">
                <div>
                  <p className="text-[10px] font-black text-zinc-muted uppercase tracking-[0.2em] mb-1.5">{t('comp.label.status')}</p>
                  <div className="flex items-center gap-2">
                    <span className={`w-1.5 h-1.5 rounded-full ${vm.status === 'Running' ? 'bg-success shadow-[0_0_8px_rgba(69,196,144,0.6)]' : vm.status === 'Stopped' ? 'bg-zinc-muted' : 'bg-info animate-pulse'}`}></span>
                    <span className="text-[11px] font-bold text-zinc-text uppercase">
                      {language === 'ar' ? (vm.status === 'Running' ? 'يعمل' : vm.status === 'Stopped' ? 'متوقف' : 'جاري التهيئة') : vm.status}
                    </span>
                  </div>
                </div>
                <div>
                  <p className="text-[10px] font-black text-zinc-muted uppercase tracking-[0.2em] mb-1.5">{t('comp.label.network')}</p>
                  <p className="text-[11px] font-mono font-bold text-zinc-secondary">{vm.ip}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black text-zinc-muted uppercase tracking-[0.2em] mb-1.5">{t('comp.label.region')}</p>
                  <div className="flex items-center gap-2">
                    <Globe className="w-3.5 h-3.5 text-zinc-muted" />
                    <p className="text-[11px] font-bold text-zinc-text uppercase">{vm.region}</p>
                  </div>
                </div>
                <div className="hidden md:block">
                  <p className="text-[10px] font-black text-zinc-muted uppercase tracking-[0.2em] mb-1.5">{t('comp.label.resource')}</p>
                  <div className="flex items-center gap-2">
                    <Cpu className="w-3.5 h-3.5 text-brand" />
                    <p className="text-[11px] font-bold text-zinc-text uppercase">Standard Opt</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 bg-obsidian-outer/50 p-2 rounded-sm border border-white/5">
                {vm.status === 'Stopped' ? (
                  <button title="Start" className="p-2 text-success hover:bg-success/10 rounded-sm transition-all"><Play className="w-4 h-4 fill-current" /></button>
                ) : (
                  <button title="Stop" className="p-2 text-zinc-muted hover:text-danger hover:bg-danger/10 rounded-sm transition-all"><Square className="w-4 h-4 fill-current" /></button>
                )}
                <button title="Restart" className="p-2 text-info hover:bg-info/10 rounded-sm transition-all"><RefreshCw className="w-4 h-4" /></button>
                <div className="w-px h-4 bg-white/5 mx-1" />
                <button className="p-2 text-zinc-muted hover:text-zinc-text rounded-sm transition-all"><MoreVertical className="w-4 h-4" /></button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
