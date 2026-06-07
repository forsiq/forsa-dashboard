import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  CheckCircle2,
  XCircle,
  Clock,
  MessageSquare,
  Loader2,
  User,
  Calendar,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { useLanguage } from '@core/contexts/LanguageContext';
import { cn } from '@core/lib/utils/cn';
import { AmberButton } from '@core/components/AmberButton';
import { AmberInput } from '@core/components/AmberInput';
import { StatusBadge } from '@core/components/Data/StatusBadge';
import { EmptyState } from '@core/components/EmptyState';
import { getLocalizedName } from '../types';
import type { CategorySuggestion, ReviewSuggestionInput } from '../types';

import {
  useCategorySuggestions,
  useReviewSuggestion,
  useMainCategories,
} from '../hooks';

import {
  rejectSuggestionSchema,
  type RejectSuggestionFormData,
  REJECTION_REASON_MAX,
} from '../lib';

type SuggestionStatus = 'all' | 'pending' | 'approved' | 'rejected';

interface SuggestionCardProps {
  suggestion: CategorySuggestion;
  parentCategories: { id: string; name: string }[];
  onReview: (id: string, input: ReviewSuggestionInput) => void;
  isReviewing: boolean;
}

function SuggestionCard({
  suggestion,
  parentCategories,
  onReview,
  isReviewing,
}: SuggestionCardProps) {
  const { t, language, dir, isRTL } = useLanguage();
  const [expanded, setExpanded] = useState(false);
  const [showRejectForm, setShowRejectForm] = useState(false);

  // Reject form with RHF + Zod
  const {
    register: registerReject,
    handleSubmit: handleRejectSubmit,
    formState: { errors: rejectErrors, isValid: rejectFormValid },
    reset: resetRejectForm,
  } = useForm<RejectSuggestionFormData>({
    resolver: zodResolver(rejectSuggestionSchema as any),
    defaultValues: { rejectionReason: '' },
    mode: 'onBlur',
    reValidateMode: 'onChange',
  });

  const parentCategory = suggestion.parentId
    ? parentCategories.find(
        (c) => String(c.id) === String(suggestion.parentId),
      )
    : null;

  const statusConfig: Record<
    string,
    { variant: 'warning' | 'success' | 'failed'; icon: React.ReactNode }
  > = {
    pending: {
      variant: 'warning',
      icon: <Clock className="w-3.5 h-3.5" />,
    },
    approved: {
      variant: 'success',
      icon: <CheckCircle2 className="w-3.5 h-3.5" />,
    },
    rejected: {
      variant: 'failed',
      icon: <XCircle className="w-3.5 h-3.5" />,
    },
  };

  const config = statusConfig[suggestion.status] || statusConfig.pending;
  const isPending = suggestion.status === 'pending';

  const handleApprove = () => {
    onReview(suggestion.id, { status: 'approved' });
  };

  const onRejectValid = (data: RejectSuggestionFormData) => {
    onReview(suggestion.id, {
      status: 'rejected',
      rejectionReason: (data.rejectionReason ?? '').trim(),
    });
    setShowRejectForm(false);
    resetRejectForm();
  };

  const formattedDate = new Date(suggestion.createdAt).toLocaleDateString(
    language === 'ar' ? 'ar-SA' : 'en-US',
    {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    },
  );

  return (
    <div className="bg-obsidian-card border border-border rounded-xl overflow-hidden transition-all hover:border-white/10">
      {/* Card Header */}
      <div
        className="flex items-center gap-4 p-4 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3">
            <span className="text-sm font-bold text-zinc-text truncate">
              {suggestion.name}
            </span>
            <StatusBadge
              status={suggestion.status}
              variant={config.variant}
              size="sm"
            />
          </div>
          {parentCategory && (
            <p className="text-[11px] text-zinc-muted mt-1 font-medium">
              {t('category.parent') || 'Parent'}:{' '}
              {getLocalizedName(parentCategory as any, language)}
            </p>
          )}
        </div>

        <div className="flex items-center gap-3 text-[11px] text-zinc-muted shrink-0">
          <span className="hidden sm:flex items-center gap-1.5">
            <Calendar className="w-3 h-3" />
            {formattedDate}
          </span>
          {expanded ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </div>
      </div>

      {/* Expanded Content */}
      {expanded && (
        <div className="border-t border-border px-4 pb-4 pt-3 space-y-3">
          {suggestion.description && (
            <p className="text-sm text-zinc-text/80">
              {suggestion.description}
            </p>
          )}

          <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-zinc-muted">
            <span className="flex items-center gap-1.5">
              <User className="w-3 h-3" />
              {t('category.suggested_by') || 'Suggested by'}: {suggestion.suggestedBy.slice(0, 8)}...
            </span>
            <span className="flex items-center gap-1.5 sm:hidden">
              <Calendar className="w-3 h-3" />
              {formattedDate}
            </span>
          </div>

          {suggestion.rejectionReason && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-danger/5 border border-danger/10">
              <MessageSquare className="w-4 h-4 text-danger shrink-0 mt-0.5" />
              <div>
                <p className="text-[11px] font-bold text-danger uppercase tracking-widest">
                  {t('category.rejection_reason') || 'Rejection Reason'}
                </p>
                <p className="text-sm text-zinc-text mt-1">
                  {suggestion.rejectionReason}
                </p>
              </div>
            </div>
          )}

          {/* Action Buttons (only for pending) */}
          {isPending && !showRejectForm && (
            <div className="flex items-center gap-3 pt-1">
              <AmberButton
                onClick={handleApprove}
                disabled={isReviewing}
                className="h-9 px-5 bg-success hover:bg-success text-white font-bold rounded-lg border-none text-sm"
              >
                {isReviewing ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    {t('category.approve') || 'Approve'}
                  </span>
                )}
              </AmberButton>
              <AmberButton
                onClick={() => setShowRejectForm(true)}
                disabled={isReviewing}
                variant="outline"
                className="h-9 px-5 border-danger/40 text-danger hover:bg-danger/10 font-bold rounded-lg text-sm"
              >
                <span className="flex items-center gap-1.5">
                  <XCircle className="w-4 h-4" />
                  {t('category.reject') || 'Reject'}
                </span>
              </AmberButton>
            </div>
          )}

          {/* Reject Form */}
          {isPending && showRejectForm && (
            <form onSubmit={handleRejectSubmit(onRejectValid)} className="space-y-3 pt-1">
              <AmberInput
                label={
                  t('category.rejection_reason_label') || 'Reason for rejection'
                }
                placeholder={
                  t('category.rejection_reason_placeholder') ||
                  'Explain why this is being rejected...'
                }
                maxLength={REJECTION_REASON_MAX}
                error={rejectErrors.rejectionReason?.message ? t(rejectErrors.rejectionReason.message) : undefined}
                multiline
                rows={2}
                required
                {...registerReject('rejectionReason')}
              />
              <div className="flex items-center gap-3">
                <AmberButton
                  type="submit"
                  disabled={isReviewing}
                  className="h-9 px-5 bg-danger hover:bg-danger text-white font-bold rounded-lg border-none text-sm"
                >
                  {isReviewing ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    t('category.confirm_reject') || 'Confirm Reject'
                  )}
                </AmberButton>
                <AmberButton
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowRejectForm(false);
                    resetRejectForm();
                  }}
                  className="h-9 px-5 rounded-lg font-bold text-sm"
                >
                  {t('common.cancel') || 'Cancel'}
                </AmberButton>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
}

export function SuggestionReview() {
  const { t, language } = useLanguage();
  const [statusFilter, setStatusFilter] = useState<SuggestionStatus>('all');

  const { data: suggestions, isLoading, refetch } = useCategorySuggestions(
    statusFilter === 'all' ? undefined : statusFilter,
  );

  const { data: mainCategories } = useMainCategories();

  const reviewMutation = useReviewSuggestion();

  const parentCategories = React.useMemo(() => {
    return (mainCategories || []).map((cat: any) => ({
      id: String(cat.id),
      name: getLocalizedName(cat, language),
    }));
  }, [mainCategories, language]);

  const handleReview = (id: string, input: ReviewSuggestionInput) => {
    reviewMutation.mutate(
      { id, input },
      {
        onSuccess: () => {
          refetch();
        },
      },
    );
  };

  const STATUS_TABS: { key: SuggestionStatus; label: string }[] = [
    { key: 'all', label: t('common.all') || 'All' },
    { key: 'pending', label: t('status.pending') || 'Pending' },
    { key: 'approved', label: t('status.approved') || 'Approved' },
    { key: 'rejected', label: t('status.rejected') || 'Rejected' },
  ];

  const filteredSuggestions = suggestions || [];

  return (
    <div className="space-y-6">
      {/* Filter Tabs */}
      <div className="flex items-center gap-1 bg-obsidian-card border border-border p-1.5 rounded-xl overflow-x-auto">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setStatusFilter(tab.key)}
            className={cn(
              'px-4 py-2 rounded-lg text-[11px] font-black uppercase tracking-widest transition-colors whitespace-nowrap',
              statusFilter === tab.key
                ? 'bg-brand text-black shadow-sm'
                : 'text-zinc-muted hover:text-zinc-text hover:bg-black/5',
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Suggestions List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-brand" />
        </div>
      ) : filteredSuggestions.length === 0 ? (
        <EmptyState
          icon={MessageSquare}
          title={t('category.no_suggestions') || 'No Suggestions'}
          description={
            t('category.no_suggestions_desc') ||
            'No category suggestions found for this filter.'
          }
        />
      ) : (
        <div className="space-y-3">
          {filteredSuggestions.map((suggestion) => (
            <SuggestionCard
              key={suggestion.id}
              suggestion={suggestion}
              parentCategories={parentCategories}
              onReview={handleReview}
              isReviewing={reviewMutation.isPending}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default SuggestionReview;
