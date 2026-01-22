
import React from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Store, MapPin, Activity, TrendingUp, MoreVertical, Globe, Layers, Plus } from 'lucide-react';
import { useLanguage } from '../../amber-ui/contexts/LanguageContext';

const branches = [
  { id: 'BR-NYC-01', name: 'Global Hub - NY', location: 'New York, USA', status: 'Online', traffic: 'Heavy', uptime: '99.9%' },
  { id: 'BR-LDN-02', name: 'European Node - London', location: 'London, UK', status: 'Online', traffic: 'Moderate', uptime: '99.8%' },
  { id: 'BR-TKO-03', name: 'APAC Cluster - Tokyo', location: 'Tokyo, JP', status: 'Online', traffic: 'Light', uptime: '100%' },
  { id: 'BR-DXB-04', name: 'MENA Gateway - Dubai', location: 'Dubai, UAE', status: 'Maintenance', traffic: 'Zero', uptime: 'N/A' },
];

export const StoresBranches = () => {
  const { t } = useLanguage();

  return (
    <div className="animate-fade-up space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-zinc-text tracking-tighter uppercase italic">{t('stores.title')}</h1>
          <p className="text-[10px] font-black text-zinc-muted uppercase tracking-[0.3em] mt-1 italic">{t('stores.subtitle')}</p>
        </div>
        <Button size="sm">
          <Plus className="w-4 h-4 mr-2 rtl:ml-2 rtl:mr-0" /> {t('stores.add')}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: t('stores.kpi.nodes'), val: '14', icon: Globe, color: 'text-brand' },
          { label: t('stores.kpi.footfall'), val: '124K', icon: Activity, color: 'text-success' },
          { label: t('stores.kpi.uptime'), val: '99.92%', icon: TrendingUp, color: 'text-info' },
          { label: t('stores.kpi.latency'), val: '24ms', icon: Layers, color: 'text-warning' },
        ].map((stat, i) => (
          <Card key={i} className="p-5 hover:border-brand/20 transition-all cursor-default">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[9px] font-black text-zinc-muted uppercase tracking-widest mb-1">{stat.label}</p>
                <p className="text-xl font-black text-zinc-text tracking-tighter italic">{stat.val}</p>
              </div>
              <stat.icon className={`w-5 h-5 opacity-20 ${stat.color}`} />
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4">
        {branches.map((branch) => (
          <Card key={branch.id} className="p-0 overflow-hidden border-white/[0.04] hover:border-brand/20 transition-all group">
             <div className="flex flex-col lg:flex-row items-center p-6 gap-8">
                <div className="flex items-center gap-6 flex-1">
                   <div className={`w-14 h-14 rounded-sm border flex items-center justify-center transition-colors ${branch.status === 'Online' ? 'bg-success/5 border-success/20 text-success' : 'bg-warning/5 border-warning/20 text-warning'}`}>
                      <Store className="w-7 h-7" />
                   </div>
                   <div>
                      <h3 className="text-lg font-black text-zinc-text uppercase italic tracking-tight group-hover:text-brand transition-colors leading-none mb-2">{branch.name}</h3>
                      <div className="flex items-center gap-3 text-[10px] font-bold text-zinc-muted uppercase tracking-widest">
                         <span className="font-mono text-brand/80">{branch.id}</span>
                         <span className="w-1 h-1 bg-white/10 rounded-full" />
                         <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {branch.location}</span>
                      </div>
                   </div>
                </div>

                <div className="grid grid-cols-3 gap-12 lg:w-[400px]">
                   <div className="space-y-1">
                      <p className="text-[9px] font-black text-zinc-muted uppercase tracking-widest">{t('stores.label.connectivity')}</p>
                      <div className="flex items-center gap-2">
                         <div className={`w-1.5 h-1.5 rounded-full ${branch.status === 'Online' ? 'bg-success shadow-[0_0_8px_rgba(69,196,144,0.6)]' : 'bg-warning animate-pulse'}`} />
                         <span className="text-[10px] font-black text-zinc-text uppercase">{branch.status}</span>
                      </div>
                   </div>
                   <div className="space-y-1">
                      <p className="text-[9px] font-black text-zinc-muted uppercase tracking-widest">{t('stores.label.throughput')}</p>
                      <span className="text-[10px] font-black text-zinc-secondary uppercase">{branch.traffic}</span>
                   </div>
                   <div className="space-y-1">
                      <p className="text-[9px] font-black text-zinc-muted uppercase tracking-widest">{t('stores.label.uptime_pulse')}</p>
                      <span className="text-[10px] font-black text-info uppercase italic">{branch.uptime}</span>
                   </div>
                </div>

                <div className="flex items-center gap-2">
                   <Button variant="ghost" size="sm" className="px-3">Diagnostics</Button>
                   <button className="p-2 text-zinc-muted hover:text-zinc-text transition-colors"><MoreVertical className="w-4 h-4" /></button>
                </div>
             </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
