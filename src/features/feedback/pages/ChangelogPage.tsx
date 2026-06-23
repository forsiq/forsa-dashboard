import React, { useMemo } from 'react';
import { useChangelog } from '../api';
import { useLanguage } from '@core/contexts/LanguageContext';
import { useIsClient } from '@core/hooks/useIsClient';
import { PageHeader } from '@core/components/Layout';
import { AmberCard } from '@core/components/AmberCard';
import { cn } from '@core/lib/utils/cn';
import type { ChangelogEntry } from '../types';

function formatEntryDate(raw: string, locale: string): string {
  const d = new Date(raw);
  if (!Number.isNaN(d.getTime())) {
    return d.toLocaleDateString(locale, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }
  return raw;
}

export function ChangelogPage() {
  const isClient = useIsClient();
  const { t, language, dir, isRTL } = useLanguage();
  const { data: changelogData, isLoading } = useChangelog();

  const dateLocale = useMemo(() => (language === 'ar' ? 'ar-SA' : 'en-US'), [language]);

  if (!isClient) return null;

  const entries: ChangelogEntry[] = changelogData?.data || [];

  const typeLabel = (type: string) => {
    const translated = t(`feedback.changelog.type.${type}`);
    return translated.startsWith('[MISSING:') ? type : translated;
  };

  const getTypeBadge = (type: string) => {
    const colors: Record<string, string> = {
      feature: 'bg-blue-500/15 text-blue-700 dark:text-blue-300 border border-blue-500/25',
      fix: 'bg-red-500/15 text-red-700 dark:text-red-300 border border-red-500/25',
      improvement:
        'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/25',
      breaking:
        'bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/25',
    };
    return colors[type] || 'bg-obsidian-hover text-zinc-muted border border-border';
  };

  const chipCase = isRTL ? 'normal-case' : 'uppercase';

  return (
    <div
      className="space-y-8 p-6 max-w-[1600px] mx-auto animate-in fade-in duration-700"
      dir={dir}
      lang={language}
    >
      <PageHeader
        title={t('feedback.changelog.title') || 'Changelog'}
        description={
          t('feedback.changelog.description') || 'Latest product updates and releases'
        }
      />

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <AmberCard key={i} className="border border-border p-4 animate-pulse">
              <div className="mb-2 h-4 w-1/4 rounded-lg bg-obsidian-hover" />
              <div className="h-3 w-full rounded-lg bg-obsidian-hover" />
            </AmberCard>
          ))}
        </div>
      ) : (
        <div className="relative">
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-obsidian-hover"
            aria-hidden
            style={{ insetInlineStart: '1rem' }}
          />
          <div className="space-y-4">
            {entries.length === 0 ? (
              <div className="py-12 text-center text-sm font-medium text-zinc-muted">
                {t('feedback.changelog.empty') || 'No entries'}
              </div>
            ) : (
              entries.map((entry) => (
                <div key={entry.id} className="relative ps-10">
                  <div
                    className="absolute top-4 h-3 w-3 rounded-full border-2 border-obsidian-panel bg-brand shadow-[0_0_0_4px_rgba(245,196,81,0.15)]"
                    aria-hidden
                    style={{ insetInlineStart: '0.625rem' }}
                  />
                  <AmberCard className="border border-border p-4 md:p-5 transition-colors hover:border-border">
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <h3
                        className="font-semibold text-zinc-text"
                        dir="auto"
                        lang={language}
                      >
                        {entry.title}
                      </h3>
                      <span
                        className={cn(
                          'rounded-full border px-2 py-0.5 text-[10px] font-bold tracking-wide',
                          chipCase,
                          getTypeBadge(entry.type),
                        )}
                      >
                        {typeLabel(entry.type)}
                      </span>
                      {entry.version ? (
                        <span className="rounded-full border border-border bg-obsidian-hover px-2 py-0.5 font-mono text-[10px] font-bold text-zinc-muted">
                          v{entry.version}
                        </span>
                      ) : null}
                      <span className="ms-auto text-xs tabular-nums text-zinc-muted">
                        {formatEntryDate(entry.date, dateLocale)}
                      </span>
                    </div>
                    <p
                      className="whitespace-pre-wrap text-sm leading-relaxed text-zinc-secondary"
                      dir="auto"
                      lang={language}
                    >
                      {entry.content}
                    </p>
                  </AmberCard>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
