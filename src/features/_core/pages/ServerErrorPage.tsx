import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { ServerCrash, RefreshCcw, Home, Terminal } from 'lucide-react';
import { useLanguage } from '@core/contexts/LanguageContext';

export const ServerErrorPage = () => {
  const router = useRouter();
  const { t } = useLanguage();
  const [isClient, setIsClient] = useState(false);
  const [traceId, setTraceId] = useState('');

  useEffect(() => {
    setIsClient(true);
    setTraceId(`ERR-${Math.floor(Math.random() * 100000).toString(16).toUpperCase()}`);
  }, []);

  if (!isClient) return null;

  return (
    <div className="min-h-screen bg-obsidian-outer flex flex-col items-center justify-center p-6 text-center relative overflow-hidden">
      {/* Background Glitch Effect */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
         <div className="absolute top-[20%] left-[10%] w-64 h-64 bg-danger/10 rounded-full blur-[100px]" />
         <div className="absolute bottom-[20%] right-[10%] w-96 h-96 bg-brand/5 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 animate-in fade-in zoom-in-95 duration-500">
        <div className="w-24 h-24 mx-auto mb-8 rounded-full bg-obsidian-panel border border-white/10 flex items-center justify-center shadow-2xl relative">
          <ServerCrash className="w-10 h-10 text-danger" />
          <div className="absolute inset-0 border-2 border-danger/20 rounded-full animate-ping opacity-20" />
        </div>

        <h1 className="text-5xl font-black text-zinc-text tracking-tighter uppercase mb-2">
          {t('error.500_title')}
        </h1>
        <p className="text-[10px] font-black text-zinc-muted uppercase tracking-[0.4em] mb-8">
          {t('error.500_subtitle')}
        </p>

        <div className="max-w-md mx-auto bg-obsidian-panel border border-white/5 rounded-sm p-6 mb-8 text-start">
           <div className="flex items-center gap-2 mb-4 border-b border-white/5 pb-2">
              <Terminal className="w-4 h-4 text-zinc-muted" />
              <span className="text-[10px] font-mono text-zinc-muted">{t('error.diagnostic')}</span>
           </div>
           <div className="space-y-2 font-mono text-[10px] text-zinc-secondary">
              <p>&gt; {t('error.initiating_recovery')}</p>
              <p className="text-danger">&gt; {t('error.upstream_timeout')}</p>
              <p>&gt; {t('error.trace_prefix')} <span className="text-zinc-text font-bold">{traceId}</span></p>
              <p>&gt; {t('error.contact_admin')}</p>
           </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-brand text-obsidian-outer rounded-sm text-[10px] font-black uppercase tracking-widest hover:opacity-90 transition-all flex items-center justify-center gap-2"
          >
            <RefreshCcw className="w-3.5 h-3.5" /> {t('error.reload_system')}
          </button>
          <button
            onClick={() => router.push('/portal')}
            className="px-6 py-3 bg-white/5 border border-white/10 text-zinc-text rounded-sm text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all flex items-center justify-center gap-2"
          >
            <Home className="w-3.5 h-3.5" /> {t('error.return_base')}
          </button>
        </div>
      </div>

      <div className="absolute bottom-6 left-0 right-0 text-center">
         <p className="text-[10px] font-mono text-zinc-muted/40 uppercase">{t('error.zonevast_enterprise')} • {traceId}</p>
      </div>
    </div>
  );
};
