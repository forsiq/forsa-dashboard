import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { WifiOff, RefreshCw, ArrowLeft } from 'lucide-react';
import { useLanguage } from '@core/contexts/LanguageContext';

export const NetworkErrorPage = () => {
  const router = useRouter();
  const { t } = useLanguage();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) return null;

  return (
    <div className="min-h-screen bg-obsidian-outer flex flex-col items-center justify-center p-6 text-center">
      <div className="max-w-md w-full animate-fade-up">
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-obsidian-panel border border-white/5 flex items-center justify-center text-zinc-muted">
           <WifiOff className="w-8 h-8" />
        </div>

        <h1 className="text-3xl font-black text-zinc-text tracking-tighter uppercase italic mb-3">
          {t('error.network_title')}
        </h1>
        <p className="text-xs font-bold text-zinc-secondary uppercase tracking-wider mb-8">
          {t('error.network_desc')}
        </p>

        <div className="p-4 bg-warning/5 border border-warning/10 rounded-sm mb-8 text-left flex gap-4">
           <div className="w-1 h-full bg-warning/50 rounded-full" />
           <div>
              <p className="text-[10px] font-black text-warning uppercase tracking-widest mb-1">{t('error.diagnostic_advice')}</p>
              <ul className="text-[10px] text-zinc-muted space-y-1 list-disc pl-3">
                 <li>{t('error.check_network')}</li>
                 <li>{t('error.check_vpn')}</li>
                 <li>{t('error.server_maintenance')}</li>
              </ul>
           </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
           <button
             onClick={() => router.back()}
             className="px-4 py-3 bg-transparent border border-white/10 text-zinc-text rounded-sm text-[10px] font-black uppercase tracking-widest hover:bg-white/5 transition-all flex items-center justify-center gap-2"
           >
             <ArrowLeft className="w-3.5 h-3.5" /> {t('error.go_back')}
           </button>
           <button
             onClick={() => window.location.reload()}
             className="px-4 py-3 bg-zinc-text text-obsidian-outer rounded-sm text-[10px] font-black uppercase tracking-widest hover:bg-white/90 transition-all flex items-center justify-center gap-2"
           >
             <RefreshCw className="w-3.5 h-3.5" /> {t('error.reconnect')}
           </button>
        </div>
      </div>
    </div>
  );
};
