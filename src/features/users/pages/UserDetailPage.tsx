/**
 * User Detail Page
 *
 * Displays detailed information about a single user
 */

import { useRouter } from 'next/router';
import { useGetUser } from '../api';
import { formatPhone } from '@core/lib/utils/formatPhone';

import { useLanguage } from '@core/contexts/LanguageContext';
import { useToast } from '@core/contexts/ToastContext';
import { AmberCard } from '@core/components/AmberCard';
import { AmberButton } from '@core/components/AmberButton';
import { PageHeader } from '@core/components/Layout/PageHeader';
import { Edit, Shield, Mail, Phone, Calendar, UserCheck, UserX } from 'lucide-react';
import { useEffect, useState } from 'react';

export function UserDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const { t, dir } = useLanguage();
  const toast = useToast();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Query
  const { data: user, isLoading, error } = useGetUser((id as string) || '');

  // Error handling
  useEffect(() => {
    if (error) {
      toast.error(error.message || t('user.error.load_failed'));
    }
  }, [error, toast, t]);

  if (!isClient) return null;

  // Handle not found
  if (!isLoading && !user && router.isReady) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <UserX className="h-16 w-16 text-zinc-600 mb-4" />
        <h3 className="text-lg font-semibold text-white mb-2">
          {t('user.not_found')}
        </h3>
        <AmberButton variant="outline" onClick={() => router.push('/users')} className="mt-4">
          {t('user.back_to_list')}
        </AmberButton>
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
      user: 'bg-gray-500/20 text-gray-300 border-gray-500/30',
    };
    return colors[role as keyof typeof colors] || colors.user;
  };

  return (
    <div className="flex flex-col gap-4 p-4 pt-0">
      {/* Page Header */}
      <PageHeader
        title={user?.fullName || t('user.detail')}
        description={user?.userName}
        showBackButton
        backHref="/users"
        actions={
          <AmberButton
            variant="primary"
            onClick={() => router.push(`/users/${id}/edit`)}
            className="gap-2"
          >
            <Edit className="h-4 w-4" />
            {t('user.edit')}
          </AmberButton>
        }
      />

      {isLoading || !router.isReady ? (
        <div className="space-y-4">
          <AmberCard className="h-64 animate-pulse bg-white/5" />
          <AmberCard className="h-48 animate-pulse bg-white/5" />
        </div>
      ) : user ? (
        <>
          {/* User Info Card */}
          <AmberCard className="p-6">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <span className="text-2xl font-bold text-white">
                    {user.fullName.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">{user.fullName}</h2>
                  <p className="text-sm text-zinc-400">@{user.userName}</p>
                </div>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getRoleBadgeColor(user.role)}`}>
                <Shield className="inline h-4 w-4 mr-1 text-zinc-400" />
                {t(`user.role.${user.role}`)}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Email */}
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-white/5 flex items-center justify-center">
                  <Mail className="h-5 w-5 text-zinc-400" />
                </div>
                <div>
                  <p className="text-xs text-zinc-500">{t('user.email')}</p>
                  <p className="text-sm text-white">{user.email || '-'}</p>
                </div>
              </div>

              {/* Phone */}
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-white/5 flex items-center justify-center">
                  <Phone className="h-5 w-5 text-zinc-400" />
                </div>
                <div>
                  <p className="text-xs text-zinc-500">{t('user.phone')}</p>
                  <p className="text-sm text-white">{user.phone ? formatPhone(user.phone) : '-'}</p>
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
                  <p className="text-xs text-zinc-500">{t('user.is_active')}</p>
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
                    <p className="text-xs text-zinc-500">{t('user.password_status')}</p>
                    <p className="text-sm text-yellow-400">{t('user.temp_password')}</p>
                  </div>
                </div>
              )}
            </div>
          </AmberCard>

          {/* Timestamps Card */}
          <AmberCard className="p-6">
            <h3 className="text-lg font-semibold text-white mb-4">{t('user.timestamps')}</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-zinc-400" />
                <div>
                  <p className="text-xs text-zinc-500">{t('user.created_at')}</p>
                  <p className="text-sm text-white">{formatDate(user.createdAt)}</p>
                </div>
              </div>
              {user.updatedAt && user.updatedAt !== user.createdAt && (
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-zinc-400" />
                  <div>
                    <p className="text-xs text-zinc-500">{t('user.updated_at')}</p>
                    <p className="text-sm text-white">{formatDate(user.updatedAt)}</p>
                  </div>
                </div>
              )}
            </div>
          </AmberCard>
        </>
      ) : null}
    </div>
  );
}

export default UserDetailPage;
