import React, { useMemo } from 'react';
import { useAdminReviews, useApproveReview, useRejectReview } from '../api';
import { useLanguage } from '@core/contexts/LanguageContext';
import { useIsClient } from '@core/hooks/useIsClient';
import { useFilterState } from '@core/hooks/useFilterState';
import { PageHeader } from '@core/components/Layout';
import { cn } from '@core/lib/utils/cn';
import type { Review } from '../types';

const STATUS_FILTERS = ['', 'pending', 'approved', 'rejected'] as const;

export function ReviewsListPage() {
  const isClient = useIsClient();
  const [statusFilter, setStatusFilter] = useFilterState('status', '');
  const { t, language } = useLanguage();
  const { data: reviewsData, isLoading } = useAdminReviews({
    status: statusFilter || undefined,
    limit: 50,
  });
  const approveMutation = useApproveReview();
  const rejectMutation = useRejectReview();

  const dateLocale = useMemo(() => (language === 'ar' ? 'ar-SA' : 'en-US'), [language]);

  if (!isClient) return null;

  const reviews = reviewsData?.data || [];

  const filterLabel = (status: string) => {
    if (status === '') return t('feedback.reviews.filter_all');
    if (status === 'pending') return t('feedback.reviews.filter_pending');
    if (status === 'approved') return t('feedback.reviews.filter_approved');
    if (status === 'rejected') return t('feedback.reviews.filter_rejected');
    return status;
  };

  const statusLabel = (status: string) => {
    const translated = t(`feedback.reviews.status.${status}`);
    return translated.startsWith('[MISSING:') ? status : translated;
  };

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      approved:
        'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/25',
      pending: 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/25',
      rejected: 'bg-red-500/15 text-red-700 dark:text-red-300 border border-red-500/25',
    };
    return colors[status] || 'bg-obsidian-hover text-zinc-muted border border-border';
  };

  return (
    <div className="space-y-8 p-6 max-w-[1600px] mx-auto animate-in fade-in duration-700">
      <PageHeader
        title={t('feedback.reviews.title') || 'Reviews'}
        description={
          t('feedback.reviews.description') || 'Moderate and manage user reviews'
        }
      />

      <div className="flex flex-wrap gap-2">
        {STATUS_FILTERS.map((status) => (
          <button
            key={status || 'all'}
            type="button"
            onClick={() => setStatusFilter(status)}
            className={cn(
              'px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wide transition-colors border',
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
            <div
              key={i}
              className="rounded-xl border border-border bg-obsidian-panel p-4 animate-pulse"
            >
              <div className="h-4 rounded-lg bg-obsidian-hover w-1/4 mb-2" />
              <div className="h-3 rounded-lg bg-obsidian-hover w-3/4" />
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {reviews.length === 0 ? (
            <div className="text-center py-12 text-zinc-muted text-sm font-medium">
              {t('feedback.reviews.empty') || 'No reviews found'}
            </div>
          ) : (
            reviews.map((review: Review) => (
              <div
                key={review.id}
                className="rounded-xl border border-border bg-obsidian-panel p-4 transition-colors hover:border-border"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-3 mb-2">
                      <span className="text-amber-400 font-bold shrink-0" aria-hidden>
                        {'★'.repeat(review.rating)}
                        {'☆'.repeat(5 - review.rating)}
                      </span>
                      <span
                        className={cn(
                          'px-2 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide',
                          getStatusBadge(review.status),
                        )}
                      >
                        {statusLabel(review.status)}
                      </span>
                      <span className="text-xs text-zinc-muted font-mono">
                        {review.itemType} #{review.itemId}
                      </span>
                    </div>
                    {review.title ? (
                      <h3 className="text-zinc-text font-semibold mb-1">{review.title}</h3>
                    ) : null}
                    {review.comment ? (
                      <p className="text-zinc-secondary text-sm leading-relaxed">
                        {review.comment}
                      </p>
                    ) : null}
                    <p className="text-xs text-zinc-muted mt-2">
                      {review.isGuest ? (
                        <>
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-blue-500/15 text-blue-700 dark:text-blue-300 text-xs font-semibold uppercase mr-2">
                            {t('feedback.reviews.guest_badge') || 'Guest'}
                          </span>
                          {review.guestEmail}
                        </>
                      ) : (
                        <>
                          {t('feedback.reviews.user_prefix') || 'User'}:{' '}
                          {review.userId?.slice(0, 8) ?? '—'}…
                        </>
                      )}
                      {' · '}
                      {new Date(review.createdAt).toLocaleDateString(dateLocale, {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                  {review.status === 'pending' && (
                    <div className="flex shrink-0 gap-2">
                      <button
                        type="button"
                        onClick={() => approveMutation.mutate(review.id)}
                        disabled={approveMutation.isPending}
                        className="px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wide bg-emerald-600 hover:bg-emerald-500 text-white disabled:opacity-50 transition-colors"
                      >
                        {t('feedback.reviews.approve') || 'Approve'}
                      </button>
                      <button
                        type="button"
                        onClick={() => rejectMutation.mutate(review.id)}
                        disabled={rejectMutation.isPending}
                        className="px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wide bg-red-600 hover:bg-red-500 text-white disabled:opacity-50 transition-colors"
                      >
                        {t('feedback.reviews.reject') || 'Reject'}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
