import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  Star,
  TrendingUp,
  Clock,
  MessageSquare,
  Map,
  FileText,
  ArrowRight,
  Plus,
  type LucideIcon,
} from 'lucide-react';
import {
  useFeedbackStats,
  useReviews,
  usePosts,
  useCreatePost,
} from '../api';
import { useLanguage } from '@core/contexts/LanguageContext';
import { useIsClient } from '@core/hooks/useIsClient';
import { AdminListPageShell } from '@core/components/Layout';
import { AmberCard } from '@core/components/AmberCard';
import { AmberButton } from '@core/components/AmberButton';
import { AmberInput } from '@core/components/AmberInput';
import { AmberSelect } from '@core/components/AmberSelect';
import { StatusBadge } from '@core/components/Data/StatusBadge';
import { cn } from '@core/lib/utils/cn';
import type { FeedbackPost, Review } from '../types';

const RECENT_LIMIT = 5;

const QUICK_LINKS: { path: string; labelKey: string; icon: LucideIcon }[] = [
  { path: '/feedback/reviews', labelKey: 'feedback.overview.link_reviews', icon: Star },
  { path: '/feedback/posts', labelKey: 'feedback.overview.link_posts', icon: MessageSquare },
  { path: '/feedback/roadmap', labelKey: 'feedback.overview.link_roadmap', icon: Map },
  { path: '/feedback/changelog', labelKey: 'feedback.overview.link_changelog', icon: FileText },
];

const POST_CATEGORIES = ['feature', 'bug', 'improvement', 'other'] as const;

function formatDate(value: string, locale: string) {
  try {
    return new Date(value).toLocaleDateString(locale, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return value;
  }
}

function reviewStatusVariant(status: Review['status']): 'success' | 'warning' | 'error' | 'inactive' {
  if (status === 'approved') return 'success';
  if (status === 'pending') return 'warning';
  if (status === 'rejected') return 'error';
  return 'inactive';
}

function postStatusVariant(status: FeedbackPost['status']): 'success' | 'warning' | 'info' | 'inactive' {
  if (status === 'completed') return 'success';
  if (status === 'in_progress') return 'info';
  if (status === 'under_review' || status === 'planned') return 'warning';
  return 'inactive';
}

export function FeedbackOverviewPage() {
  const isClient = useIsClient();
  const { t, language, dir } = useLanguage();
  const dateLocale = useMemo(() => (language === 'ar' ? 'ar-SA' : 'en-US'), [language]);

  const { data: statsData, isLoading: statsLoading } = useFeedbackStats();
  const { data: reviewsData, isLoading: reviewsLoading } = useReviews({ limit: RECENT_LIMIT });
  const { data: postsData, isLoading: postsLoading } = usePosts({ limit: RECENT_LIMIT });
  const createPostMutation = useCreatePost();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<string>('feature');
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState(false);

  if (!isClient) return null;

  const stats = statsData?.data;
  const recentReviews: Review[] = reviewsData?.data || [];
  const recentPosts: FeedbackPost[] = postsData?.data || [];

  const statItems: {
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
      label: t('feedback.stats.total_reviews'),
      value: stats?.reviews?.total ?? 0,
      icon: Star,
      bgColor: 'bg-amber-500/10',
      textColor: 'text-amber-400',
    },
    {
      id: 'avg_rating',
      label: t('feedback.stats.avg_rating'),
      value: stats?.reviews?.averageRating ?? 0,
      suffix: '/ 5',
      icon: TrendingUp,
      bgColor: 'bg-emerald-500/10',
      textColor: 'text-emerald-400',
    },
    {
      id: 'pending',
      label: t('feedback.stats.pending_reviews'),
      value: stats?.reviews?.pending ?? 0,
      icon: Clock,
      bgColor: 'bg-orange-500/10',
      textColor: 'text-orange-400',
    },
    {
      id: 'posts',
      label: t('feedback.stats.total_posts'),
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

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(false);

    const trimmedTitle = title.trim();
    const trimmedDescription = description.trim();
    if (!trimmedTitle || !trimmedDescription) {
      setFormError(t('feedback.overview.add_validation'));
      return;
    }

    try {
      await createPostMutation.mutateAsync({
        title: trimmedTitle,
        description: trimmedDescription,
        category: category as FeedbackPost['category'],
      });
      setTitle('');
      setDescription('');
      setCategory('feature');
      setFormSuccess(true);
    } catch {
      setFormError(t('feedback.overview.add_error'));
    }
  };

  return (
    <AdminListPageShell
      title={t('feedback.overview.title')}
      description={t('feedback.overview.description')}
      icon={MessageSquare}
      className="p-3 md:p-6 space-y-6 md:space-y-8"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsLoading
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
          : statItems.map((item) => {
              const Icon = item.icon;
              return (
                <AmberCard
                  key={item.id}
                  className="p-6 border border-border hover:border-border transition-colors"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-zinc-muted font-medium">{item.label}</p>
                      <p className={`text-3xl font-black mt-1 tabular-nums ${item.textColor}`}>
                        {formatValue(Number(item.value))}
                        {item.suffix ? (
                          <span className="text-lg font-bold text-zinc-muted ms-1">{item.suffix}</span>
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

      <AmberCard className="p-6 border border-border space-y-6">
        <div>
          <h2 className="text-lg font-black text-zinc-text tracking-tight">
            {t('feedback.overview.discover_title')}
          </h2>
          <p className="text-sm text-zinc-muted mt-1">{t('feedback.overview.discover_description')}</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {QUICK_LINKS.map(({ path, labelKey, icon: Icon }) => (
            <Link
              key={path}
              href={path}
              className="flex items-center gap-3 rounded-xl border border-white/5 bg-obsidian-outer/30 px-4 py-3 text-sm font-bold text-zinc-text hover:border-brand/30 hover:bg-brand/5 transition-colors"
            >
              <Icon className="h-4 w-4 text-brand shrink-0" />
              <span className="truncate">{t(labelKey)}</span>
            </Link>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-xs font-black uppercase tracking-widest text-zinc-muted">
                {t('feedback.overview.recent_reviews')}
              </h3>
              <Link
                href="/feedback/reviews"
                className="text-[10px] font-bold uppercase tracking-widest text-brand hover:underline flex items-center gap-1"
              >
                {t('feedback.overview.view_all')}
                <ArrowRight className={cn('h-3 w-3', dir === 'rtl' && 'rotate-180')} />
              </Link>
            </div>
            {reviewsLoading ? (
              <div className="space-y-2 animate-pulse">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-14 rounded-lg bg-obsidian-hover" />
                ))}
              </div>
            ) : recentReviews.length === 0 ? (
              <p className="text-sm text-zinc-muted py-4">{t('feedback.reviews.empty')}</p>
            ) : (
              <ul className="space-y-2">
                {recentReviews.map((review) => (
                  <li
                    key={review.id}
                    className="flex items-start justify-between gap-3 rounded-lg border border-white/5 px-4 py-3"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold text-zinc-text truncate">
                        {review.title || `${review.itemType} #${review.itemId}`}
                      </p>
                      <p className="text-xs text-zinc-muted mt-0.5">
                        {formatDate(review.createdAt, dateLocale)}
                        {review.rating ? ` · ${review.rating}/5` : ''}
                      </p>
                    </div>
                    <StatusBadge
                      status={review.status}
                      labelKey={`feedback.reviews.status.${review.status}`}
                      variant={reviewStatusVariant(review.status)}
                      size="sm"
                    />
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-xs font-black uppercase tracking-widest text-zinc-muted">
                {t('feedback.overview.recent_posts')}
              </h3>
              <Link
                href="/feedback/posts"
                className="text-[10px] font-bold uppercase tracking-widest text-brand hover:underline flex items-center gap-1"
              >
                {t('feedback.overview.view_all')}
                <ArrowRight className={cn('h-3 w-3', dir === 'rtl' && 'rotate-180')} />
              </Link>
            </div>
            {postsLoading ? (
              <div className="space-y-2 animate-pulse">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-14 rounded-lg bg-obsidian-hover" />
                ))}
              </div>
            ) : recentPosts.length === 0 ? (
              <p className="text-sm text-zinc-muted py-4">{t('feedback.posts.empty')}</p>
            ) : (
              <ul className="space-y-2">
                {recentPosts.map((post) => (
                  <li
                    key={post.id}
                    className="flex items-start justify-between gap-3 rounded-lg border border-white/5 px-4 py-3"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold text-zinc-text truncate">{post.title}</p>
                      <p className="text-xs text-zinc-muted mt-0.5">
                        {formatDate(post.createdAt, dateLocale)}
                        {' · '}
                        {t(`feedback.posts.category.${post.category}`)}
                      </p>
                    </div>
                    <StatusBadge
                      status={post.status}
                      labelKey={`feedback.posts.status.${post.status}`}
                      variant={postStatusVariant(post.status)}
                      size="sm"
                    />
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </AmberCard>

      <AmberCard className="p-6 border border-border">
        <div className="flex items-start gap-3 mb-6">
          <div className="h-10 w-10 rounded-xl bg-brand/10 flex items-center justify-center shrink-0">
            <Plus className="h-5 w-5 text-brand" />
          </div>
          <div>
            <h2 className="text-lg font-black text-zinc-text tracking-tight">
              {t('feedback.overview.add_title')}
            </h2>
            <p className="text-sm text-zinc-muted mt-1">{t('feedback.overview.add_description')}</p>
          </div>
        </div>

        <form onSubmit={handleCreatePost} className="space-y-4 max-w-2xl">
          <AmberInput
            label={t('feedback.overview.add_field_title')}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-[0.15em] text-zinc-muted/90 px-1">
              {t('feedback.overview.add_field_description')}
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              required
              className="w-full rounded-xl border border-white/[0.06] bg-obsidian-card px-4 py-3 text-sm font-medium text-zinc-text outline-none transition-colors focus:border-brand/40 focus:ring-2 focus:ring-brand/10 resize-y min-h-[100px]"
            />
          </div>
          <AmberSelect
            label={t('feedback.overview.add_field_category')}
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            {POST_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {t(`feedback.posts.category.${cat}`)}
              </option>
            ))}
          </AmberSelect>

          {formError && (
            <p className="text-sm font-bold text-danger">{formError}</p>
          )}
          {formSuccess && (
            <p className="text-sm font-bold text-emerald-400">{t('feedback.overview.add_success')}</p>
          )}

          <AmberButton
            type="submit"
            className="h-11 rounded-xl px-6"
            disabled={createPostMutation.isPending}
          >
            {createPostMutation.isPending
              ? t('common.loading')
              : t('feedback.overview.add_submit')}
          </AmberButton>
        </form>
      </AmberCard>
    </AdminListPageShell>
  );
}
