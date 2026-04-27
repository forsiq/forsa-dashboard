import React from 'react';
import Link from 'next/link';
import { ArrowRight, BookOpen, LifeBuoy } from 'lucide-react';
import { AmberCard } from '@core/components/AmberCard';
import { PageHeader } from '@core/components/Layout/PageHeader';
import { useLanguage } from '@core/contexts/LanguageContext';
import { cn } from '@core/lib/utils/cn';

const links = [
  { href: '/portal', key: 'help.link_portal' },
  { href: '/projects', key: 'help.link_projects' },
  { href: '/flex-auth', key: 'help.link_flex_auth' },
] as const;

export const HelpPage: React.FC = () => {
  const { t, dir } = useLanguage();

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-4xl">
      <PageHeader title={t('help.page_title')} description={t('help.intro')} />

      <AmberCard glass className="space-y-4">
        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-muted">
          <BookOpen className="w-4 h-4 text-brand" />
          {t('help.quick_links')}
        </div>
        <ul className="space-y-2">
          {links.map(({ href, key }) => (
            <li key={href}>
              <Link
                href={href}
                className={cn(
                  'flex items-center justify-between gap-3 rounded-lg border border-white/10 bg-white/[0.02] px-4 py-3 text-sm font-semibold text-zinc-text transition-colors hover:border-brand/30 hover:bg-brand/5',
                  dir === 'rtl' && 'flex-row-reverse'
                )}
              >
                <span>{t(key)}</span>
                <ArrowRight
                  className={cn('h-4 w-4 shrink-0 text-brand', dir === 'rtl' && 'rotate-180')}
                />
              </Link>
            </li>
          ))}
        </ul>
      </AmberCard>

      <AmberCard className="border border-white/10 bg-white/[0.02]">
        <div className="flex items-start gap-3">
          <LifeBuoy className="mt-0.5 h-5 w-5 shrink-0 text-info" />
          <div className="space-y-2">
            <h2 className="text-sm font-black uppercase tracking-tight text-white">
              {t('help.contact_title')}
            </h2>
            <p className="text-sm leading-relaxed text-zinc-muted">{t('help.contact_body')}</p>
          </div>
        </div>
      </AmberCard>
    </div>
  );
};
