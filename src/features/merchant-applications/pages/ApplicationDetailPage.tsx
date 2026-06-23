import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useLanguage } from '@core/contexts/LanguageContext';
import {
  AdminListPageShell,
} from '@core/components/Layout';
import {
  AmberConfirmModal,
  AmberSlideOver,
} from '@core/components';
import { StatusBadge } from '@core/components/Data/StatusBadge';
import { AmberButton } from '@core/components/AmberButton';
import { cn } from '@core/lib/utils/cn';
import { DetailPageSkeleton } from '@core/loading';
import {
  UserPlus,
  ArrowLeft,
  Phone,
  Mail,
  Calendar,
  FileText,
  CreditCard,
  Tag,
  StickyNote,
  Activity,
  CheckCircle,
  XCircle,
  User,
  Inbox,
} from 'lucide-react';
import dayjs from 'dayjs';
import {
  useGetApplication,
  useApproveApplication,
  useRejectApplication,
} from '../hooks/useMerchantApplications';
import type { MerchantApplication } from '../services/merchantApplicationsService';
import { applicationStatusVariant } from './ApplicationsListPage';

export function ApplicationDetailPage({ id }: { id: number | string }) {
  const { t } = useLanguage();
  const router = useRouter();

  const { data: application, isPending } = useGetApplication(id, !!id);
  const approveMutation = useApproveApplication();
  const rejectMutation = useRejectApplication();

  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
  const [isRejectSlideOverOpen, setIsRejectSlideOverOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  if (isPending || !application) {
    return <DetailPageSkeleton />;
  }

  const isPendingStatus = application.status === 'pending';

  const handleApproveConfirm = async () => {
    await approveMutation.mutateAsync(application.id);
    router.push('/merchant-applications');
  };

  const handleRejectSubmit = async () => {
    const reason = rejectionReason.trim();
    if (!reason) return;
    await rejectMutation.mutateAsync({ id: application.id, rejectionReason: reason });
    setRejectionReason('');
    setIsRejectSlideOverOpen(false);
    router.push('/merchant-applications');
  };

  return (
    <AdminListPageShell
      title={application.businessName}
      description={t('merchantApps.subtitle') || 'Review and approve merchant join requests'}
      icon={UserPlus}
      headerActions={
        <Link href="/merchant-applications">
          <AmberButton
            variant="outline"
            className="h-9 px-4 text-xs font-bold uppercase tracking-wider"
          >
            <ArrowLeft className="w-3.5 h-3.5 me-1.5" />
            {t('common.back') || 'Back'}
          </AmberButton>
        </Link>
      }
      stats={[
        {
          label: t('merchantApps.detail.submitted_at') || 'Submitted At',
          value: dayjs(application.createdAt).format('MMM D, YYYY'),
          icon: Calendar,
          color: 'brand',
        },
        {
          label: t('merchantApps.table.status') || 'Status',
          value: application.status,
          icon: application.status === 'approved' ? CheckCircle : application.status === 'rejected' ? XCircle : Activity,
          color: application.status === 'approved' ? 'success' : application.status === 'rejected' ? 'danger' : 'warning',
        },
      ]}
      statsColumns={2}
    >
      <div className="space-y-6">
        {/* Application Details Card */}
        <div className="bg-[var(--color-obsidian-card)] border border-[var(--color-border)] rounded-2xl p-3 md:p-5 space-y-3 md:space-y-4">
          <h3 className="text-sm font-black text-zinc-text uppercase tracking-widest">
            {t('merchantApps.title') || 'Merchant Application'}
          </h3>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 md:gap-4">
            {/* Business Name */}
            <DetailField
              icon={UserPlus}
              label={t('merchantApps.detail.business_name') || 'Business Name'}
              value={application.businessName}
            />

            {/* Phone */}
            <DetailField
              icon={Phone}
              label={t('merchantApps.detail.phone') || 'Phone'}
              value={application.phone}
            />

            {/* Email */}
            <DetailField
              icon={Mail}
              label={t('merchantApps.detail.email') || 'Email'}
              value={application.email || '—'}
            />

            {/* Commercial Record */}
            <DetailField
              icon={FileText}
              label={t('merchantApps.detail.commercial_record') || 'Commercial Record'}
              value={application.commercialRecord || '—'}
            />

            {/* IBAN */}
            <DetailField
              icon={CreditCard}
              label={t('merchantApps.detail.iban') || 'IBAN'}
              value={application.iban || '—'}
            />

            {/* Product Categories */}
            <DetailField
              icon={Tag}
              label={t('merchantApps.detail.categories') || 'Product Categories'}
              value={application.productCategories || '—'}
            />
          </div>

          {/* Notes - full width */}
          <DetailField
            icon={StickyNote}
            label={t('merchantApps.detail.notes') || 'Notes'}
            value={application.notes || '—'}
            multiline
          />
        </div>

        {/* Status / Review Section */}
        {isPendingStatus ? (
          <div className="bg-[var(--color-obsidian-card)] border border-[var(--color-border)] rounded-2xl p-3 md:p-5 space-y-4">
            <h3 className="text-sm font-black text-zinc-text uppercase tracking-widest">
              {t('merchantApps.table.status') || 'Status'}
            </h3>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <StatusBadge
                status={application.status}
                variant={applicationStatusVariant(application.status)}
                showDot
                size="md"
                className="font-bold"
              />
              <div className="flex-1" />
              <div className="flex flex-col sm:flex-row gap-2">
                <AmberButton
                  variant="outline"
                  className="h-10 px-5 text-xs font-black uppercase tracking-widest border-red-500/30 text-red-400 hover:bg-red-500/10"
                  onClick={() => setIsRejectSlideOverOpen(true)}
                  disabled={approveMutation.isPending || rejectMutation.isPending}
                >
                  <XCircle className="w-4 h-4 me-1.5" />
                  {t('merchantApps.actions.reject') || 'Reject'}
                </AmberButton>
                <AmberButton
                  variant="primary"
                  className="h-10 px-5 text-xs font-black uppercase tracking-widest bg-emerald-500 text-black hover:bg-emerald-600"
                  onClick={() => setIsApproveModalOpen(true)}
                  disabled={approveMutation.isPending || rejectMutation.isPending}
                >
                  <CheckCircle className="w-4 h-4 me-1.5" />
                  {t('merchantApps.actions.approve') || 'Approve'}
                </AmberButton>
              </div>
            </div>
          </div>
        ) : (
          <ReviewInfoCard application={application} t={t} />
        )}

        {/* Back link */}
        <div className="flex justify-center pt-2">
          <Link href="/merchant-applications">
            <AmberButton
              variant="outline"
              className="h-9 px-4 text-xs font-bold uppercase tracking-wider"
            >
              <ArrowLeft className="w-3.5 h-3.5 me-1.5" />
              {t('common.back') || 'Back'}
            </AmberButton>
          </Link>
        </div>
      </div>

      {/* Approve Confirmation Modal */}
      <AmberConfirmModal
        isOpen={isApproveModalOpen}
        onClose={() => setIsApproveModalOpen(false)}
        onConfirm={handleApproveConfirm}
        title={t('merchantApps.actions.approve') || 'Approve'}
        message={t('merchantApps.actions.approve_confirm') || 'Are you sure you want to approve this application?'}
        confirmText={t('merchantApps.actions.approve') || 'Approve'}
        cancelText={t('merchantApps.actions.cancel') || 'Cancel'}
        variant="success"
        isLoading={approveMutation.isPending}
        size="sm"
      />

      {/* Reject SlideOver with reason input */}
      <AmberSlideOver
        isOpen={isRejectSlideOverOpen}
        onClose={() => setIsRejectSlideOverOpen(false)}
        title={t('merchantApps.actions.reject') || 'Reject Application'}
      >
        <div className="space-y-4 p-1">
          <div className="flex items-start gap-3 bg-red-500/5 border border-red-500/15 rounded-xl p-3">
            <XCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-zinc-text">
                {application.businessName}
              </p>
              <p className="text-xs text-zinc-muted mt-0.5">
                {t('merchantApps.actions.approve_confirm') || 'Are you sure you want to approve this application?'}
              </p>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-black uppercase tracking-widest text-zinc-muted">
              {t('merchantApps.detail.rejection_reason') || 'Rejection Reason'}
            </label>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              rows={5}
              placeholder={t('merchantApps.actions.reject_reason_placeholder') || 'Enter rejection reason...'}
              className="w-full bg-[var(--color-obsidian-outer)] border border-[var(--color-border)] rounded-xl px-4 py-3 text-sm text-zinc-text placeholder:text-zinc-muted focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)]/40 resize-none"
              autoFocus
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <AmberButton
              variant="outline"
              className="h-10 px-4 text-xs font-bold uppercase tracking-widest"
              onClick={() => {
                setRejectionReason('');
                setIsRejectSlideOverOpen(false);
              }}
              disabled={rejectMutation.isPending}
            >
              {t('merchantApps.actions.cancel') || 'Cancel'}
            </AmberButton>
            <AmberButton
              variant="primary"
              className="h-10 px-5 text-xs font-black uppercase tracking-widest bg-red-500 text-black hover:bg-red-600 disabled:opacity-50"
              onClick={handleRejectSubmit}
              disabled={!rejectionReason.trim() || rejectMutation.isPending}
            >
              {rejectMutation.isPending
                ? t('common.processing') || 'Processing...'
                : t('merchantApps.actions.reject') || 'Reject'}
            </AmberButton>
          </div>
        </div>
      </AmberSlideOver>
    </AdminListPageShell>
  );
}

function DetailField({
  icon: Icon,
  label,
  value,
  multiline = false,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  multiline?: boolean;
}) {
  return (
    <div className="flex items-start gap-2.5">
      <div className="w-8 h-8 rounded-lg bg-brand/10 flex items-center justify-center shrink-0">
        <Icon className="w-4 h-4 text-brand" />
      </div>
      <div className={cn('min-w-0', multiline ? 'flex-1' : 'flex-1')}>
        <p className="text-[11px] text-zinc-muted uppercase tracking-widest">{label}</p>
        <p className={cn('text-sm font-bold text-zinc-text', multiline ? 'whitespace-pre-wrap break-words' : 'truncate')}>
          {value}
        </p>
      </div>
    </div>
  );
}

function ReviewInfoCard({
  application,
  t,
}: {
  application: MerchantApplication;
  t: (key: string) => string;
}) {
  return (
    <div className="bg-[var(--color-obsidian-card)] border border-[var(--color-border)] rounded-2xl p-3 md:p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-black text-zinc-text uppercase tracking-widest">
          {t('merchantApps.table.status') || 'Status'}
        </h3>
        <StatusBadge
          status={application.status}
          variant={applicationStatusVariant(application.status)}
          showDot
          size="md"
          className="font-bold"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 md:gap-4">
        {/* Reviewed By */}
        <DetailField
          icon={User}
          label={t('merchantApps.detail.reviewed_by') || 'Reviewed By'}
          value={application.reviewedBy || '—'}
        />

        {/* Reviewed At */}
        <DetailField
          icon={Calendar}
          label={t('merchantApps.detail.reviewed_at') || 'Reviewed At'}
          value={application.reviewedAt ? dayjs(application.reviewedAt).format('MMM D, YYYY · HH:mm') : '—'}
        />
      </div>

      {/* Rejection Reason */}
      {application.status === 'rejected' && (
        <DetailField
          icon={Inbox}
          label={t('merchantApps.detail.rejection_reason') || 'Rejection Reason'}
          value={application.rejectionReason || '—'}
          multiline
        />
      )}
    </div>
  );
}
