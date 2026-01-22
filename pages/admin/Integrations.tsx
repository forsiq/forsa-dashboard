
import React from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Plug, ExternalLink, Zap, RefreshCcw, ShieldCheck, Key, Settings, Plus } from 'lucide-react';
import { useLanguage } from '../../amber-ui/contexts/LanguageContext';

const connections = [
  { id: 'conn_shopify_01', name: 'Shopify Storefront', type: 'E-commerce', status: 'Connected', lastSync: '14s ago' },
  { id: 'conn_amazon_02', name: 'Amazon Merchant Node', type: 'Marketplace', status: 'Connected', lastSync: '2m ago' },
  { id: 'conn_sap_03', name: 'SAP ERP Uplink', type: 'Enterprise Resource', status: 'Error', lastSync: '1h ago' },
  { id: 'conn_stripe_04', name: 'Stripe Gateway', type: 'Payment Processor', status: 'Connected', lastSync: 'Real-time' },
];

export const Integrations = () => {
  const { t } = useLanguage();

  return (
    <div className="animate-fade-up space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-zinc-text tracking-tighter uppercase italic">{t('integ.title')}</h1>
          <p className="text-[10px] font-black text-zinc-muted uppercase tracking-[0.3em] mt-1 italic">{t('integ.subtitle')}</p>
        </div>
        <div className="flex gap-2">
           <Button variant="secondary" size="sm"><Key className="w-3.5 h-3.5 mr-2 rtl:ml-2 rtl:mr-0" /> {t('integ.vault')}</Button>
           <Button size="sm"><Plus className="w-3.5 h-3.5 mr-2 rtl:ml-2 rtl:mr-0" /> {t('integ.add')}</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         <div className="lg:col-span-2 space-y-4">
            <h3 className="text-xs font-black text-zinc-muted uppercase tracking-[0.4em] mb-4 italic px-2">{t('integ.cluster')}</h3>
            <div className="space-y-3">
               {connections.map((conn) => (
                 <Card key={conn.id} className="p-0 overflow-hidden border-white/[0.04] hover:border-brand/20 transition-all group">
                    <div className="flex items-center p-5 gap-6">
                       <div className={`w-12 h-12 rounded-sm border flex items-center justify-center shrink-0 ${conn.status === 'Connected' ? 'bg-success/5 border-success/20 text-success' : 'bg-danger/5 border-danger/20 text-danger'}`}>
                          <Plug className="w-6 h-6" />
                       </div>
                       <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-1">
                             <h4 className="text-sm font-black text-zinc-text uppercase tracking-tight italic group-hover:text-brand transition-colors">{conn.name}</h4>
                             <span className="text-[9px] font-bold text-zinc-muted font-mono">{conn.id}</span>
                          </div>
                          <div className="flex items-center gap-4 text-[10px] font-black text-zinc-muted uppercase tracking-widest opacity-60">
                             <span>{conn.type}</span>
                             <span className="w-1 h-1 bg-white/10 rounded-full" />
                             <span className="flex items-center gap-1"><RefreshCcw className="w-3 h-3" /> {conn.lastSync}</span>
                          </div>
                       </div>
                       <div className="flex items-center gap-3">
                          <span className={`text-[8px] font-black uppercase tracking-[0.2em] ${conn.status === 'Connected' ? 'text-success' : 'text-danger'}`}>{conn.status}</span>
                          <button className="p-2 bg-obsidian-outer border border-white/5 rounded-sm hover:text-brand transition-colors"><Settings className="w-4 h-4" /></button>
                       </div>
                    </div>
                 </Card>
               ))}
            </div>
         </div>

         <div className="space-y-6">
            <Card className="p-6 border-brand/20" glass>
               <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xs font-black text-brand uppercase tracking-[0.3em] italic">{t('integ.stats')}</h3>
                  <Zap className="w-4 h-4 text-brand fill-brand" />
               </div>
               <div className="space-y-6">
                  {[
                    { label: 'Uplink Throughput', val: '4.2k req/m' },
                    { label: 'Avg Latency', val: '84ms' },
                    { label: 'Error Rate', val: '0.04%' },
                  ].map((stat, i) => (
                    <div key={i} className="flex justify-between items-center border-b border-white/5 pb-2">
                       <span className="text-[10px] font-black text-zinc-muted uppercase tracking-widest">{stat.label}</span>
                       <span className="text-[11px] font-black text-zinc-text tracking-tighter italic">{stat.val}</span>
                    </div>
                  ))}
               </div>
               <div className="mt-8">
                  <p className="text-[9px] font-black text-zinc-muted uppercase italic mb-3">API Health Nodes</p>
                  <div className="flex gap-1.5">
                     {Array.from({length: 24}).map((_, i) => (
                        <div key={i} className={`h-6 w-full rounded-sm ${i === 18 ? 'bg-danger/40' : i % 7 === 0 ? 'bg-warning/40' : 'bg-success/40'}`} title={`Hour ${i}: OK`} />
                     ))}
                  </div>
               </div>
            </Card>

            <Card className="p-6 bg-obsidian-panel/40">
               <h3 className="text-xs font-black text-zinc-text uppercase tracking-widest mb-4 italic flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-info" /> {t('integ.auth')}
               </h3>
               <p className="text-[10px] font-bold text-zinc-muted uppercase italic leading-relaxed mb-6">
                  {t('integ.auth_desc')}
               </p>
               <div className="space-y-3">
                  <Button variant="secondary" className="w-full text-[9px] italic justify-between">
                     Regenerate Secrets <ExternalLink className="w-3.5 h-3.5" />
                  </Button>
                  <Button variant="outline" className="w-full text-[9px] italic justify-between">
                     Download SDK <ExternalLink className="w-3.5 h-3.5" />
                  </Button>
               </div>
            </Card>
         </div>
      </div>
    </div>
  );
};
