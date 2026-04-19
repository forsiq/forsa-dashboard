import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { AlertCircle, ArrowLeft, Home } from 'lucide-react';
import { useLanguage } from '@core/contexts/LanguageContext';

export const NotFoundPage = () => {
  const router = useRouter();
  const { t } = useLanguage();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) return null;

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 animate-fade-up">
      <div className="relative mb-8">
        <div className="w-24 h-24 rounded-full bg-obsidian-panel border border-white/5 flex items-center justify-center relative z-10 shadow-2xl">
           <span className="text-4xl font-black text-zinc-muted/20 select-none">404</span>
           <AlertCircle className="w-10 h-10 text-danger absolute" />
        </div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-danger/5 rounded-full blur-xl -z-0 animate-pulse" />
      </div>

      <div className="text-center max-w-md space-y-4 mb-10">
        <h1 className="text-3xl font-black text-zinc-text tracking-tighter uppercase italic">
          {t('error.404_title')}
        </h1>
        <p className="text-sm font-medium text-zinc-muted leading-relaxed">
          {t('error.404_desc')}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-lg">
        <button
          onClick={() => router.back()}
          className="flex items-center justify-center gap-2 p-4 bg-obsidian-panel border border-white/10 rounded-sm hover:border-brand/30 hover:bg-white/5 transition-all group"
        >
           <ArrowLeft className="w-4 h-4 text-zinc-muted group-hover:text-brand transition-colors" />
           <span className="text-[10px] font-black text-zinc-text uppercase tracking-widest">{t('error.go_back')}</span>
        </button>

        <Link
          href="/portal"
          className="flex items-center justify-center gap-2 p-4 bg-obsidian-panel border border-white/10 rounded-sm hover:border-brand/30 hover:bg-white/5 transition-all group"
        >
           <Home className="w-4 h-4 text-zinc-muted group-hover:text-brand transition-colors" />
           <span className="text-[10px] font-black text-zinc-text uppercase tracking-widest">{t('error.dashboard')}</span>
        </Link>
      </div>
    </div>
  );
};
