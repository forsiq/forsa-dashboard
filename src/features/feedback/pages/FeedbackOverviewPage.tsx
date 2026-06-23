import React from 'react';
import { Star, TrendingUp, Clock, MessageSquare, type LucideIcon } from 'lucide-react';
import { useFeedbackStats } from '../api';
import { useLanguage } from '@core/contexts/LanguageContext';
import { useIsClient } from '@core/hooks/useIsClient';
import { PageHeader } from '@core/components/Layout';
import { AmberCard } from '@core/components/AmberCard';

export function FeedbackOverviewPage() {
  const isClient = useIsClient();
  const { t } = useLanguage();
  const { data: statsData, isLoading } = useFeedbackStats();

  if (!isClient) return null;

  const stats = statsData?.data;

  const items: {
    id: string;
    label: string;
    value: number;
    suffix?: string;
    icon: LucideIcon;
    bgColor: string;
    textColor: string;
  }[] = [
    {
      id: 'total_reviews',
      label: t('feedback.stats.total_reviews') || 'Total Reviews',
      value: stats?.reviews?.total ?? 0,
      icon: Star,
      bgColor: 'bg-amber-500/10',
      textColor: 'text-amber-400',
    },
    {
      id: 'avg_rating',
      label: t('feedback.stats.avg_rating') || 'Average Rating',
      value: stats?.reviews?.averageRating ?? 0,
      suffix: '/ 5',
      icon: TrendingUp,
      bgColor: 'bg-emerald-500/10',
      textColor: 'text-emerald-400',
    },
    {
      id: 'pending',
      label: t('feedback.stats.pending_reviews') || 'Pending Reviews',
      value: stats?.reviews?.pending ?? 0,
      icon: Clock,
      bgColor: 'bg-orange-500/10',
      textColor: 'text-orange-400',
    },
    {
      id: 'posts',
      label: t('feedback.stats.total_posts') || 'Feature Requests',
      value: stats?.posts?.total ?? 0,
      icon: MessageSquare,
      bgColor: 'bg-blue-500/10',
      textColor: 'text-blue-400',
    },
  ];

  function formatValue(v: number): string | number {
    if (typeof v === 'number' && v % 1 !== 0) return v.toFixed(2);
    return v;
  }

  return (
    <div className="space-y-8 p-6 max-w-[1600px] mx-auto animate-in fade-in duration-700">
      <PageHeader
        title={t('feedback.overview.title') || 'Feedback Dashboard'}
        description={
          t('feedback.overview.description') ||
          'Monitor reviews, feature requests, and user feedback'
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {isLoading
          ? [1, 2, 3, 4].map((i) => (
              <AmberCard key={i} className="p-6 border border-border">
                <div className="flex items-center justify-between animate-pulse">
                  <div className="min-w-0 flex-1 space-y-3 pe-3">
                    <div className="h-4 rounded-lg bg-obsidian-hover w-3/5" />
                    <div className="h-8 rounded-lg bg-obsidian-hover w-2/5" />
                  </div>
                  <div className="h-12 w-12 shrink-0 rounded-xl bg-obsidian-hover" />
                </div>
              </AmberCard>
            ))
          : items.map((item) => {
              const Icon = item.icon;
              return (
                <AmberCard
                  key={item.id}
                  className="p-6 border border-border hover:border-border transition-colors"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-zinc-muted font-medium">{item.label}</p>
                      <p
                        className={`text-3xl font-black mt-1 tabular-nums ${item.textColor}`}
                      >
                        {formatValue(Number(item.value))}
                        {item.suffix ? (
                          <span className="text-lg font-bold text-zinc-muted ms-1">
                            {item.suffix}
                          </span>
                        ) : null}
                      </p>
                    </div>
                    <div
                      className={`h-12 w-12 shrink-0 rounded-xl ${item.bgColor} flex items-center justify-center`}
                    >
                      <Icon className={`h-6 w-6 ${item.textColor}`} />
                    </div>
                  </div>
                </AmberCard>
              );
            })}
      </div>
    </div>
  );
}
