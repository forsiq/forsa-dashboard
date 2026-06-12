import { useEffect } from 'react';
import Link from 'next/link';
import { useGetUser } from '../api';
import { formatPhone } from '@core/lib/utils/formatPhone';

import { useLanguage } from '@core/contexts/LanguageContext';
import { useToast } from '@core/contexts/ToastContext';
import { AmberCard } from '@core/components/AmberCard';
import { AmberButton } from '@core/components/AmberButton';
import { PageHeader } from '@core/components/Layout/PageHeader';
import { Edit, Shield, Mail, Phone, Calendar, UserCheck, UserX } from 'lucide-react';
import { Star } from 'lucide-react';
import { DetailPageSkeleton } from '@core/loading';
import { useRouteParam } from '@core/hooks/useRouteParam';
import { useIsClient } from '@core/hooks/useIsClient';

export function UserDetailPage() {
  const [userId, paramReady] = useRouteParam('id', { parse: 'string', safe: true });
  const { t, dir } = useLanguage();
  const toast = useToast();
  const isClient = useIsClient();

  // Query
  const { data: user, isPending, error } = useGetUser(userId || '', !!userId);

  // Error handling
  useEffect(() => {
    if (error) {
      toast.error(error.message || t('user.error.load_failed'));
    }
  }, [error, toast, t]);

  if (!isClient) return <DetailPageSkeleton />;

  if (!isPending && !user && paramReady) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <UserX className="h-16 w-16 text-zinc-600 mb-4" />
        <h3 className="text-lg font-semibold text-zinc-text mb-2">
          {t('user.not_found')}
        </h3>
        <Link href="/users">
          <AmberButton variant="outline" className="mt-4">
            {t('user.back_to_list')}
          </AmberButton>
        </Link>
      </div>
    );
  }

  // Format date
  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString(dir === 'rtl' ? 'ar-IQ' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Get role badge color
  const getRoleBadgeColor = (role: string) => {
    const colors = {
      admin: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
      manager: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
      user: 'bg-zinc-500/20 text-zinc-muted border-zinc-500/30',
    };
    return colors[role as keyof typeof colors] || colors.user;
  };

  return (
    <div className="flex flex-col gap-4 p-3 md:p-4 pt-0">
      {/* Page Header */}
      <PageHeader
        title={user?.fullName || t('user.detail')}
        description={user?.userName}
        showBackButton
        backHref="/users"
        actions={
          <Link href={`/users/${userId}/edit`}>
            <AmberButton
              variant="primary"
              className="gap-2"
            >
              <Edit className="h-4 w-4" />
              {t('user.edit')}
            </AmberButton>
          </Link>
        }
      />

      {isPending || !userId || !paramReady ? (
        <div className="space-y-4">
          <AmberCard className="h-64 animate-pulse bg-white/5" />
          <AmberCard className="h-48 animate-pulse bg-white/5" />
        </div>
      ) : user ? (
        <>
          {/* User Info Card */}
          <AmberCard className="p-3 md:p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 md:mb-6 gap-3">
              <div className="flex items-center gap-3 md:gap-4">
                <div className="h-12 w-12 md:h-16 md:w-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <span className="text-lg md:text-2xl font-bold text-zinc-text">
                    {user.fullName.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <h2 className="text-lg md:text-xl font-bold text-zinc-text">{user.fullName}</h2>
                  <p className="text-sm text-zinc-muted">@{user.userName}</p>
                </div>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getRoleBadgeColor(user.role)}`}>
                <Shield className="inline h-4 w-4 me-1 text-zinc-muted" />
                {t(`user.role.${user.role}`)}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Email */}
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-white/5 flex items-center justify-center">
                  <Mail className="h-5 w-5 text-zinc-muted" />
                </div>
                <div>
                  <p className="text-[13px] text-zinc-500">{t('user.email')}</p>
                  <p className="text-sm text-zinc-text">{user.email || '-'}</p>
                </div>
              </div>

              {/* Phone */}
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-white/5 flex items-center justify-center">
                  <Phone className="h-5 w-5 text-zinc-muted" />
                </div>
                <div>
                  <p className="text-[13px] text-zinc-500">{t('user.phone')}</p>
                  <p className="text-sm text-zinc-text" dir="ltr">{user.phone ? formatPhone(user.phone) : '-'}</p>
                </div>
              </div>

              {/* Status */}
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-white/5 flex items-center justify-center">
                  {user.isActive ? (
                    <UserCheck className="h-5 w-5 text-green-400" />
                  ) : (
                    <UserX className="h-5 w-5 text-red-400" />
                  )}
                </div>
                <div>
                  <p className="text-[13px] text-zinc-500">{t('user.is_active')}</p>
                  <p className={`text-sm font-medium ${user.isActive ? 'text-green-400' : 'text-red-400'}`}>
                    {t(user.isActive ? 'user.status.active' : 'user.status.inactive')}
                  </p>
                </div>
              </div>

              {/* Temporary Password */}
              {user.isTempPass && (
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-yellow-500/20 flex items-center justify-center">
                    <Shield className="h-5 w-5 text-yellow-400" />
                  </div>
                  <div>
                    <p className="text-[13px] text-zinc-500">{t('user.password_status')}</p>
                    <p className="text-sm text-yellow-400">{t('user.temp_password')}</p>
                  </div>
                </div>
              )}
            </div>
          </AmberCard>

          {/* Timestamps Card */}
          <AmberCard className="p-3 md:p-6">
            <h3 className="text-base md:text-lg font-semibold text-zinc-text mb-3 md:mb-4">{t('user.timestamps')}</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-zinc-muted" />
                <div>
                  <p className="text-[13px] text-zinc-500">{t('user.created_at')}</p>
                  <p className="text-sm text-zinc-text">{formatDate(user.createdAt)}</p>
                </div>
              </div>
              {user.updatedAt && user.updatedAt !== user.createdAt && (
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-zinc-muted" />
                  <div>
                    <p className="text-[13px] text-zinc-500">{t('user.updated_at')}</p>
                    <p className="text-sm text-zinc-text">{formatDate(user.updatedAt)}</p>
                  </div>
                </div>
              )}
            </div>
          </AmberCard>

          {/* Engagement Stats Card */}
          <AmberCard className="p-3 md:p-6">
            <h3 className="text-base md:text-lg font-semibold text-zinc-text mb-3 md:mb-4 flex items-center gap-2">
              <Star className="w-5 h-5 text-amber-400" />
              Engagement
            </h3>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="bg-brand-50 rounded-lg p-3">
                <p className="text-2xl font-bold text-brand-600">-</p>
                <p className="text-xs text-zinc-500 mt-1">Points</p>
              </div>
              <div className="bg-amber-50 rounded-lg p-3">
                <p className="text-2xl font-bold text-amber-600">-</p>
                <p className="text-xs text-zinc-500 mt-1">Level</p>
              </div>
              <div className="bg-purple-50 rounded-lg p-3">
                <p className="text-2xl font-bold text-purple-600">-</p>
                <p className="text-xs text-zinc-500 mt-1">Rewards</p>
              </div>
            </div>
            <p className="text-xs text-zinc-400 mt-3 text-center">
              Connect rewards API to see live engagement data
            </p>
          </AmberCard>
        </>
      ) : null}
    </div>
  );
}

export default UserDetailPage;
