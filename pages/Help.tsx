
import React from 'react';
import { Card } from '../components/ui/Card';
import { Book, FileText, ExternalLink, ShieldAlert, MessageCircle } from 'lucide-react';
import { useLanguage } from '../amber-ui/contexts/LanguageContext';

export const Help = () => {
  const { t } = useLanguage();

  return (
    <div className="animate-fade-up max-w-4xl mx-auto py-4 px-2 space-y-6">
      <div className="pb-6 border-b border-white/5">
        <h1 className="text-xl font-black text-zinc-text tracking-tighter uppercase italic">{t('help.title')}</h1>
        <p className="text-[10px] font-black text-zinc-muted uppercase tracking-[0.3em] mt-1">{t('help.subtitle')}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          { label: t('help.docs'), icon: Book, desc: 'Technical manuals for the ZoneVast infrastructure.' },
          { label: t('help.api'), icon: FileText, desc: 'REST and GraphQL endpoint specifications.' },
          { label: t('help.security'), icon: ShieldAlert, desc: 'Compliance tracking and protocol updates.' },
        ].map((item, i) => (
          <Card key={i} className="p-4 hover:border-brand/30 transition-all group cursor-pointer">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 rounded bg-obsidian-outer border border-white/5 group-hover:text-brand transition-colors">
                <item.icon className="w-4 h-4" />
              </div>
              <ExternalLink className="w-3 h-3 text-zinc-muted/30 group-hover:text-brand transition-colors rtl:rotate-180" />
            </div>
            <h3 className="text-xs font-black text-zinc-text uppercase tracking-widest italic mb-1">{item.label}</h3>
            <p className="text-[9px] font-bold text-zinc-muted uppercase tracking-tight leading-relaxed">{item.desc}</p>
          </Card>
        ))}
      </div>

      <Card className="p-6 bg-obsidian-panel/40" glass>
         <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
               <div className="w-12 h-12 rounded-full bg-brand/10 border border-brand/20 flex items-center justify-center text-brand">
                 <MessageCircle className="w-6 h-6" />
               </div>
               <div className="text-start">
                  <h3 className="text-sm font-black text-zinc-text uppercase tracking-widest italic">{t('help.assistant')}</h3>
                  <p className="text-[9px] font-bold text-zinc-muted uppercase tracking-widest mt-0.5">{t('help.assistant_desc')}</p>
               </div>
            </div>
            <button className="px-6 py-2.5 bg-brand text-obsidian-outer text-[10px] font-black uppercase tracking-widest rounded-sm hover:opacity-90 transition-all">
              {t('help.init_conn')}
            </button>
         </div>
      </Card>
    </div>
  );
};
