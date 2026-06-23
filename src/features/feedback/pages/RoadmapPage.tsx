import React, { useMemo } from 'react';
import { useRoadmap } from '../api';
import { useLanguage } from '@core/contexts/LanguageContext';
import { useIsClient } from '@core/hooks/useIsClient';
import { PageHeader } from '@core/components/Layout';
import { AmberCard } from '@core/components/AmberCard';
import { cn } from '@core/lib/utils/cn';
import type { RoadmapItem } from '../types';

const STATUS_ORDER = ['planned', 'in_progress', 'completed'] as const;

type RoadmapStatus = (typeof STATUS_ORDER)[number];

const COLUMN_STYLE: Record<RoadmapStatus, string> = {
  planned: 'border-t-blue-500/70',
  in_progress: 'border-t-violet-500/70',
  completed: 'border-t-emerald-500/70',
};

function formatTargetDate(raw: string, locale: string): string {
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

export function RoadmapPage() {
  const isClient = useIsClient();
  const { t, language, dir, isRTL } = useLanguage();
  const { data: roadmapData, isLoading } = useRoadmap();

  const dateLocale = useMemo(() => (language === 'ar' ? 'ar-SA' : 'en-US'), [language]);

  if (!isClient) return null;

  const items: RoadmapItem[] = roadmapData?.data || [];

  const statusLabel = (status: string) => {
    const translated = t(`feedback.roadmap.status.${status}`);
    return translated.startsWith('[MISSING:') ? status.replace(/_/g, ' ') : translated;
  };

  const columns = STATUS_ORDER.map((status) => ({
    status,
    label: statusLabel(status),
    color: COLUMN_STYLE[status],
    items: items.filter((i) => i.status === status),
  }));

  return (
    <div
      className="space-y-8 p-6 max-w-[1600px] mx-auto animate-in fade-in duration-700"
      dir={dir}
      lang={language}
    >
      <PageHeader
        title={t('feedback.roadmap.title') || 'Roadmap'}
        description={
          t('feedback.roadmap.description') ||
          'Track planned, in-progress, and completed initiatives'
        }
      />

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <AmberCard
              key={i}
              className="border border-border border-t-4 border-t-white/10 p-4 animate-pulse"
            >
              <div className="mb-4 h-4 w-1/2 rounded-lg bg-obsidian-hover" />
              <div className="mb-2 h-3 w-full rounded-lg bg-obsidian-hover" />
              <div className="h-3 w-4/5 rounded-lg bg-obsidian-hover" />
            </AmberCard>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {columns.map((column) => (
            <AmberCard
              key={column.status}
              className={cn(
                'border border-border p-4 md:p-5 transition-colors hover:border-border',
                'border-t-4',
                column.color,
              )}
            >
              <h3
                className={cn(
                  'mb-4 text-sm font-black tracking-wide text-zinc-text',
                  isRTL ? 'normal-case' : 'uppercase',
                )}
              >
                {column.label}{' '}
                <span className="text-zinc-muted tabular-nums">
                  ({column.items.length})
                </span>
              </h3>
              <div className="space-y-3">
                {column.items.length === 0 ? (
                  <p className="py-4 text-center text-sm font-medium text-zinc-muted">
                    {t('feedback.roadmap.empty') || 'No items'}
                  </p>
                ) : (
                  column.items.map((item) => (
                    <div
                      key={item.id}
                      className="rounded-xl border border-border bg-obsidian-outer/80 p-3 transition-colors hover:border-border"
                    >
                      <h4
                        className="mb-1 text-sm font-semibold text-zinc-text"
                        dir="auto"
                        lang={language}
                      >
                        {item.title}
                      </h4>
                      {item.description ? (
                        <p
                          className="mb-2 text-xs leading-relaxed text-zinc-secondary"
                          dir="auto"
                          lang={language}
                        >
                          {item.description}
                        </p>
                      ) : null}
                      {item.targetDate ? (
                        <span className="text-xs text-zinc-muted">
                          {t('feedback.roadmap.target', {
                            date: formatTargetDate(item.targetDate, dateLocale),
                          })}
                        </span>
                      ) : null}
                    </div>
                  ))
                )}
              </div>
            </AmberCard>
          ))}
        </div>
      )}
    </div>
  );
}
