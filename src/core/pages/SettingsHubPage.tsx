import React from 'react';
import Link from 'next/link';
import { ArrowRight, Monitor, Palette, Sliders } from 'lucide-react';
import { AmberCard } from '@core/components/AmberCard';
import { PageHeader } from '@core/components/Layout/PageHeader';
import { useLanguage } from '@core/contexts/LanguageContext';
import { cn } from '@core/lib/utils/cn';

const serviceLinks = [
  { href: '/projects', labelKey: 'settings_portal.link_projects' as const },
  { href: '/flex-auth', labelKey: 'settings_portal.link_flex_auth' as const },
] as const;

export const SettingsHubPage: React.FC = () => {
  const { t, dir } = useLanguage();

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-4xl">
      <PageHeader title={t('settings_portal.page_title')} description={t('settings_portal.intro')} />

      <AmberCard glass className="space-y-3">
        <div className="flex items-start gap-3">
          <Palette className="mt-0.5 h-5 w-5 shrink-0 text-brand" />
          <div className="space-y-2">
            <h2 className="text-sm font-black uppercase tracking-tight text-white">
              {t('settings_portal.appearance_title')}
            </h2>
            <p className="text-sm leading-relaxed text-zinc-muted">
              {t('settings_portal.appearance_body')}
            </p>
          </div>
        </div>
      </AmberCard>

      <AmberCard className="border border-white/10 bg-white/[0.02]">
        <div className="flex items-start gap-3">
          <Monitor className="mt-0.5 h-5 w-5 shrink-0 text-info" />
          <div className="space-y-2">
            <h2 className="text-sm font-black uppercase tracking-tight text-white">
              {t('settings_portal.account_title')}
            </h2>
            <p className="text-sm leading-relaxed text-zinc-muted">
              {t('settings_portal.account_body')}
            </p>
          </div>
        </div>
      </AmberCard>

      <AmberCard className="border border-white/10 bg-white/[0.02] space-y-4">
        <div className="flex items-start gap-3">
          <Sliders className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />
          <div className="space-y-2">
            <h2 className="text-sm font-black uppercase tracking-tight text-white">
              {t('settings_portal.services_title')}
            </h2>
            <p className="text-sm leading-relaxed text-zinc-muted">
              {t('settings_portal.services_body')}
            </p>
          </div>
        </div>
        <ul className="space-y-2 pt-2">
          {serviceLinks.map(({ href, labelKey }) => (
            <li key={href}>
              <Link
                href={href}
                className={cn(
                  'flex items-center justify-between gap-3 rounded-lg border border-white/10 bg-white/[0.02] px-4 py-3 text-sm font-semibold text-zinc-text transition-colors hover:border-brand/30 hover:bg-brand/5',
                  dir === 'rtl' && 'flex-row-reverse'
                )}
              >
                <span>{t(labelKey)}</span>
                <ArrowRight
                  className={cn('h-4 w-4 shrink-0 text-brand', dir === 'rtl' && 'rotate-180')}
                />
              </Link>
            </li>
          ))}
        </ul>
      </AmberCard>
    </div>
  );
};
