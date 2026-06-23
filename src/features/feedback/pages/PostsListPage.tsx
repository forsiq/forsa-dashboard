import React, { useMemo } from 'react';
import { ThumbsUp, MessageCircle } from 'lucide-react';
import { usePosts, useUpdatePostStatus } from '../api';
import { useLanguage } from '@core/contexts/LanguageContext';
import { useIsClient } from '@core/hooks/useIsClient';
import { useFilterState } from '@core/hooks/useFilterState';
import { PageHeader } from '@core/components/Layout';
import { AmberCard } from '@core/components/AmberCard';
import { AmberSelect } from '@core/components/AmberSelect';
import { cn } from '@core/lib/utils/cn';
import type { FeedbackPost } from '../types';

const STATUS_FILTERS = [
  '',
  'under_review',
  'planned',
  'in_progress',
  'completed',
  'declined',
] as const;

const POST_STATUSES: FeedbackPost['status'][] = [
  'under_review',
  'planned',
  'in_progress',
  'completed',
  'declined',
];

export function PostsListPage() {
  const isClient = useIsClient();
  const [statusFilter, setStatusFilter] = useFilterState('status', '');
  const { t, language, dir, isRTL } = useLanguage();
  const { data: postsData, isLoading } = usePosts({
    status: statusFilter || undefined,
    limit: 50,
  });
  const updateStatusMutation = useUpdatePostStatus();

  const dateLocale = useMemo(() => (language === 'ar' ? 'ar-SA' : 'en-US'), [language]);

  const votesLabel = (count: number) =>
    count === 1
      ? t('feedback.posts.vote_single', { count })
      : t('feedback.posts.votes_plural', { count });

  const commentsLabel = (count: number) =>
    count === 1
      ? t('feedback.posts.comment_single', { count })
      : t('feedback.posts.comments_plural', { count });

  if (!isClient) return null;

  const posts = postsData?.data || [];

  const filterLabel = (status: string) => {
    if (status === '') return t('feedback.posts.filter_all') || 'All';
    return t(`feedback.posts.filter_${status}`);
  };

  const statusLabel = (status: string) => {
    const translated = t(`feedback.posts.status.${status}`);
    return translated.startsWith('[MISSING:') ? status.replace(/_/g, ' ') : translated;
  };

  const categoryLabel = (category: string) => {
    const translated = t(`feedback.posts.category.${category}`);
    return translated.startsWith('[MISSING:') ? category : translated;
  };

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      under_review:
        'bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/25',
      planned: 'bg-blue-500/15 text-blue-700 dark:text-blue-300 border border-blue-500/25',
      in_progress: 'bg-violet-500/15 text-violet-300 border border-violet-500/25',
      completed:
        'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/25',
      declined: 'bg-red-500/15 text-red-700 dark:text-red-300 border border-red-500/25',
    };
    return colors[status] || 'bg-obsidian-hover text-zinc-muted border border-border';
  };

  const getCategoryBadge = (category: string) => {
    const colors: Record<string, string> = {
      bug: 'bg-red-500/15 text-red-700 dark:text-red-300 border border-red-500/25',
      feature: 'bg-blue-500/15 text-blue-700 dark:text-blue-300 border border-blue-500/25',
      improvement:
        'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/25',
      other: 'bg-obsidian-hover text-zinc-muted border border-border',
    };
    return colors[category] || 'bg-obsidian-hover text-zinc-muted border border-border';
  };

  const chipCase = isRTL ? 'normal-case' : 'uppercase';

  return (
    <div
      className="space-y-8 p-6 max-w-[1600px] mx-auto animate-in fade-in duration-700"
      dir={dir}
      lang={language}
    >
      <PageHeader
        title={t('feedback.posts.title') || 'Feature Requests'}
        description={
          t('feedback.posts.description') || 'Review and triage user feature requests'
        }
      />

      <div className="flex flex-wrap gap-2">
        {STATUS_FILTERS.map((status) => (
          <button
            key={status || 'all'}
            type="button"
            onClick={() => setStatusFilter(status)}
            className={cn(
              'px-4 py-2 rounded-xl text-xs font-bold tracking-wide transition-colors border',
              chipCase,
              statusFilter === status
                ? 'bg-brand text-white border-brand/40 shadow-sm'
                : 'bg-obsidian-panel text-zinc-muted border-border hover:bg-obsidian-hover hover:text-zinc-text',
            )}
          >
            {filterLabel(status)}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <AmberCard key={i} className="p-4 border border-border animate-pulse">
              <div className="h-4 rounded-lg bg-obsidian-hover w-1/3 mb-2" />
              <div className="h-3 rounded-lg bg-obsidian-hover w-2/3" />
            </AmberCard>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {posts.length === 0 ? (
            <div className="text-center py-12 text-sm font-medium text-zinc-muted">
              {t('feedback.posts.empty') || 'No posts found'}
            </div>
          ) : (
            posts.map((post: FeedbackPost) => (
              <AmberCard
                key={post.id}
                className="p-4 md:p-5 border border-border hover:border-border transition-colors"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0 flex-1 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3
                        className="text-zinc-text font-semibold leading-snug"
                        dir="auto"
                        lang={language}
                      >
                        {post.title}
                      </h3>
                      <span
                        className={cn(
                          'px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide',
                          chipCase,
                          getCategoryBadge(post.category),
                        )}
                      >
                        {categoryLabel(post.category)}
                      </span>
                      <span
                        className={cn(
                          'px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide',
                          chipCase,
                          getStatusBadge(post.status),
                        )}
                      >
                        {statusLabel(post.status)}
                      </span>
                    </div>
                    <p
                      className="text-zinc-secondary text-sm leading-relaxed"
                      dir="auto"
                      lang={language}
                    >
                      {post.description}
                    </p>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-zinc-muted">
                      <span className="inline-flex items-center gap-1.5">
                        <ThumbsUp className="h-3.5 w-3.5 shrink-0 opacity-80" aria-hidden />
                        {votesLabel(post.votesCount)}
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <MessageCircle
                          className="h-3.5 w-3.5 shrink-0 opacity-80"
                          aria-hidden
                        />
                        {commentsLabel(post.commentsCount)}
                      </span>
                      <span className="font-mono tabular-nums">
                        {new Date(post.createdAt).toLocaleDateString(dateLocale, {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    </div>
                  </div>
                  <div className="w-full shrink-0 sm:w-44 sm:max-w-[11rem]">
                    <AmberSelect
                      label={t('feedback.posts.status_field') || 'Status'}
                      fieldSize="xs"
                      value={post.status}
                      disabled={updateStatusMutation.isPending}
                      onChange={(e) =>
                        updateStatusMutation.mutate({
                          id: post.id,
                          status: e.target.value as FeedbackPost['status'],
                        })
                      }
                      className="font-medium"
                    >
                      {POST_STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {statusLabel(s)}
                        </option>
                      ))}
                    </AmberSelect>
                  </div>
                </div>
              </AmberCard>
            ))
          )}
        </div>
      )}
    </div>
  );
}
