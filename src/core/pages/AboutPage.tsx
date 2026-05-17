'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Terminal,
  Layout,
  Globe,
  Cpu,
  Shield,
} from 'lucide-react';
import { AmberCard as Card } from '@core/components/AmberCard';
import { useLanguage } from '@core/contexts/LanguageContext';
import { AmberLogo } from '@core/components/AmberLogo';
import { cn } from '@core/lib/utils/cn';
import { ChangelogSection } from '@features/changelog/components/ChangelogSection';
import releasesData from '@features/changelog/data/releases.yaml';
import type { ChangelogRelease } from '@features/changelog/types';

export const AboutPage: React.FC = () => {
  const { t, dir } = useLanguage();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const latestVersion = useMemo(() => {
    const releases = releasesData as ChangelogRelease[];
    if (releases.length === 0) return null;
    return [...releases].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    )[0];
  }, []);

  if (!isClient) return null;

  return (
    <div
      className="max-w-5xl mx-auto space-y-12 py-10 animate-in fade-in duration-700 px-4 relative"
      dir={dir}
    >
      <div className={cn('absolute top-4 z-20', dir === 'rtl' ? 'right-4' : 'left-4')}>
        <Link
          href="/"
          className="flex items-center gap-2 text-[10px] font-black text-zinc-muted hover:text-zinc-text uppercase tracking-widest transition-colors bg-obsidian-card/80 backdrop-blur-sm px-3 py-1.5 rounded-full border border-border hover:border-brand/20"
        >
          <ArrowLeft className={cn('w-3 h-3', dir === 'rtl' && 'rotate-180')} />{' '}
          {t('about.return_home')}
        </Link>
      </div>

      <div className="text-center space-y-8 pt-8">
        <div className="flex justify-center relative">
          <div className="absolute inset-0 bg-brand/10 blur-[60px] rounded-full scale-150 animate-pulse pointer-events-none" />
          <div className="p-6 bg-obsidian-panel border border-brand/20 rounded-3xl shadow-2xl relative z-10 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-brand/5 to-transparent pointer-events-none" />
            <AmberLogo className="w-24 h-24 text-brand" />
          </div>
        </div>

        <div className="space-y-4">
          <h1 className="text-5xl font-black text-zinc-text uppercase tracking-tighter leading-none">
            Forsa <span className="text-brand">Dashboard</span>
          </h1>
          <p className="text-sm text-zinc-muted font-bold uppercase tracking-[0.4em] opacity-80">
            {t('about.hero.subtitle')}
          </p>
          {latestVersion && (
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/5 text-[10px] font-black text-zinc-text uppercase tracking-widest">
              <span>{t('about.hero.latest_build')}:</span>
              <span className="text-brand font-mono">v{latestVersion.version}</span>
            </div>
          )}
        </div>
      </div>

      <Card
        className="p-10 border-brand/10 bg-gradient-to-br from-obsidian-panel to-obsidian-card text-center relative overflow-hidden"
        glass
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand/5 blur-[80px] rounded-full pointer-events-none" />
        <div className="relative z-10 max-w-3xl mx-auto space-y-6">
          <h3 className="text-brand uppercase tracking-[0.4em] text-[10px] font-black">
            {t('about.directive.title')}
          </h3>
          <p className="text-2xl md:text-3xl font-black text-white leading-tight tracking-tight">
            {t('about.directive.desc')}
          </p>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: Layout, title: t('about.features.core_systems'), desc: t('about.features.core_systems_desc') },
          { icon: Globe, title: t('about.features.unified_data'), desc: t('about.features.unified_data_desc') },
          { icon: Cpu, title: t('about.features.ai_insights'), desc: t('about.features.ai_insights_desc') },
          { icon: Shield, title: t('about.features.secure_edge'), desc: t('about.features.secure_edge_desc') },
        ].map((feat, i) => (
          <Card
            key={i}
            className="p-6 text-center hover:border-brand/20 transition-all group relative overflow-hidden"
            glass
          >
            <div className="absolute -right-4 -bottom-4 opacity-[0.03] group-hover:opacity-[0.08] transition-all duration-700">
              <feat.icon className="w-24 h-24" />
            </div>
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-obsidian-outer border border-border rounded-xl group-hover:bg-brand/10 group-hover:text-brand transition-colors text-zinc-muted shadow-inner">
                <feat.icon className="w-5 h-5" />
              </div>
            </div>
            <h4 className="text-xs font-black text-zinc-text uppercase tracking-widest mb-1 leading-tight">
              {feat.title}
            </h4>
            <p className="text-[10px] font-bold text-zinc-muted uppercase leading-relaxed">{feat.desc}</p>
          </Card>
        ))}
      </div>

      <section className="space-y-4">
        <div className="flex items-center gap-3 mb-2 px-2">
          <div className="p-1.5 bg-brand/10 rounded-lg">
            <Terminal className="w-4 h-4 text-brand" />
          </div>
          <h3 className="text-xs font-black text-zinc-text uppercase tracking-[0.4em]">
            {t('about.history.title')}
          </h3>
        </div>
        <ChangelogSection />
      </section>

      <div className="pt-12 border-t border-white/5 text-center">
        <p className="text-[10px] text-zinc-muted/20 font-bold uppercase tracking-[1em]">
          Forsa © {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
};
