/**
 * Users List Page
 *
 * Displays all users with search, filters, and pagination
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGetUsers, useGetUserStats, useDeleteUser, useUpdateUserStatus } from '../graphql';
import { useLanguage } from '@core/contexts/LanguageContext';
import { useToast } from '@core/contexts/ToastContext';
import { AmberCard } from '@core/components/AmberCard';
import { AmberButton } from '@core/components/AmberButton';
import { AmberInput } from '@core/components/AmberInput';
import { StatsGrid } from '@core/components/Layout/StatsGrid';
import { AmberTableSkeleton } from '@core/components/Loading/AmberTableSkeleton';
import { PageHeader } from '@core/components/Layout/PageHeader';
import { ListPageLayout } from '@core/components/Layout/ListPageLayout';
import { StatusBadge } from '@core/components/Data/StatusBadge';
import { Search, Plus, Eye, Edit, Trash2, Shield, ShieldAlert, User, UserCheck, UserX } from 'lucide-react';
import type { UserFilters } from '../types';

export function UsersListPage() {
  const navigate = useNavigate();
  const { t, dir } = useLanguage();
  const toast = useToast();

  // State for filters
  const [filters, setFilters] = useState<UserFilters>({
    page: 1,
    limit: 20,
    search: '',
    role: 'all',
    status: 'all',
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  // Queries
  const { data: usersData, isLoading: isLoadingUsers, error: usersError } = useGetUsers(filters);
  const { data: stats, isLoading: isLoadingStats } = useGetUserStats();

  // Mutations
  const deleteMutation = useDeleteUser();
  const statusMutation = useUpdateUserStatus();

  // Error handling
  if (usersError) {
    toast.error(usersError.message || t('user.error.load_failed'));
  }

  // Handle filter changes
  const handleFilterChange = (key: keyof UserFilters, value: string | number) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: key !== 'page' ? 1 : (typeof value === 'number' ? value : parseInt(value) || 1),
    }));
  };

  // Handle pagination
  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }));
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle user actions
  const handleView = (id: string) => {
    navigate(`/users/${id}`);
  };

  const handleEdit = (id: string) => {
    navigate(`/users/${id}/edit`);
  };

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`${t('user.confirm_delete') || 'Are you sure you want to delete'} ${name}?`)) {
      try {
        await deleteMutation.mutateAsync(id);
        toast.success(t('user.delete_success'));
      } catch (error: any) {
        toast.error(error.message || t('user.delete_failed'));
      }
    }
  };

  const handleToggleStatus = async (id: string, isActive: boolean) => {
    try {
      await statusMutation.mutateAsync({ id, isActive: !isActive });
      toast.success(isActive ? t('user.deactivated') : t('user.activated'));
    } catch (error: any) {
      toast.error(error.message || t('user.status_update_failed'));
    }
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

  // Format date
  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString(dir === 'rtl' ? 'ar-IQ' : 'en-US');
  };

  const users = usersData?.users || [];
  const total = usersData?.total || 0;
  const totalPages = usersData?.totalPages || 1;

  return (
    <div className="flex flex-col gap-4 p-4 pt-0">
      {/* Page Header */}
      <PageHeader
        title={t('user.title')}
        description={t('user.subtitle')}
        actions={
          <AmberButton
            variant="primary"
            onClick={() => navigate('/users/new')}
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            {t('user.add')}
          </AmberButton>
        }
      />

      {/* Stats Cards */}
      {isLoadingStats ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <AmberCard key={i} className="h-24 animate-pulse bg-white/5" />
          ))}
        </div>
      ) : (
        <StatsGrid
          stats={[
            {
              label: t('user.stats.total'),
              value: stats?.total || 0,
              icon: User,
              color: 'text-blue-400',
            },
            {
              label: t('user.stats.active'),
              value: stats?.active || 0,
              icon: UserCheck,
              color: 'text-green-400',
            },
            {
              label: t('user.stats.inactive'),
              value: stats?.inactive || 0,
              icon: UserX,
              color: 'text-red-400',
            },
            {
              label: t('user.stats.admins'),
              value: stats?.admins || 0,
              icon: Shield,
              color: 'text-purple-400',
            },
          ]}
        />
      )}

      {/* Filters */}
      <AmberCard className="p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className={`absolute top-1/2 -translate-y-1/2 ${dir === 'rtl' ? 'right' : 'left'}-3 h-4 w-4 text-zinc-400`} />
            <AmberInput
              placeholder={t('user.search_placeholder')}
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className={`py-2 ${dir === 'rtl' ? 'pr-10 pl-4' : 'pl-10 pr-4'}`}
            />
          </div>

          {/* Role Filter */}
          <select
            value={filters.role}
            onChange={(e) => handleFilterChange('role', e.target.value)}
            className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
          >
            <option value="all">{t('user.filter.all_roles')}</option>
            <option value="admin">{t('user.role.admin')}</option>
            <option value="manager">{t('user.role.manager')}</option>
            <option value="user">{t('user.role.user')}</option>
          </select>

          {/* Status Filter */}
          <select
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
          >
            <option value="all">{t('user.filter.all_status')}</option>
            <option value="active">{t('user.status.active')}</option>
            <option value="inactive">{t('user.status.inactive')}</option>
          </select>
        </div>
      </AmberCard>

      {/* Users Table */}
      <AmberCard className="overflow-hidden">
        {isLoadingUsers ? (
          <AmberTableSkeleton columns={7} rows={5} />
        ) : users.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <ShieldAlert className="h-16 w-16 text-zinc-600 mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">
              {t('user.no_users')}
            </h3>
            <p className="text-sm text-zinc-400 mb-6">
              {t('user.no_users_description')}
            </p>
            <AmberButton
              variant="primary"
              onClick={() => navigate('/users/new')}
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              {t('user.add_first')}
            </AmberButton>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white/5">
                <tr>
                  <th className={`px-4 py-3 text-right text-sm font-medium text-zinc-400 ${dir === 'rtl' ? 'text-right' : 'text-left'}`}>
                    {t('user.username')}
                  </th>
                  <th className={`px-4 py-3 text-right text-sm font-medium text-zinc-400 ${dir === 'rtl' ? 'text-right' : 'text-left'}`}>
                    {t('user.full_name')}
                  </th>
                  <th className={`px-4 py-3 text-right text-sm font-medium text-zinc-400 ${dir === 'rtl' ? 'text-right' : 'text-left'}`}>
                    {t('user.email')}
                  </th>
                  <th className={`px-4 py-3 text-right text-sm font-medium text-zinc-400 ${dir === 'rtl' ? 'text-right' : 'text-left'}`}>
                    {t('user.role')}
                  </th>
                  <th className={`px-4 py-3 text-right text-sm font-medium text-zinc-400 ${dir === 'rtl' ? 'text-right' : 'text-left'}`}>
                    {t('user.is_active')}
                  </th>
                  <th className={`px-4 py-3 text-right text-sm font-medium text-zinc-400 ${dir === 'rtl' ? 'text-right' : 'text-left'}`}>
                    {t('user.created_at')}
                  </th>
                  <th className={`px-4 py-3 text-right text-sm font-medium text-zinc-400 ${dir === 'rtl' ? 'text-left' : 'text-right'}`}>
                    {t('actions')}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-white/5 transition-colors">
                    <td className={`px-4 py-3 text-sm font-medium text-white ${dir === 'rtl' ? 'text-right' : 'text-left'}`}>
                      {user.userName}
                    </td>
                    <td className={`px-4 py-3 text-sm text-zinc-300 ${dir === 'rtl' ? 'text-right' : 'text-left'}`}>
                      {user.fullName}
                    </td>
                    <td className={`px-4 py-3 text-sm text-zinc-400 ${dir === 'rtl' ? 'text-right' : 'text-left'}`}>
                      {user.email || '-'}
                    </td>
                    <td className={`px-4 py-3 ${dir === 'rtl' ? 'text-right' : 'text-left'}`}>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getRoleBadgeColor(user.role)}`}>
                        {t(`user.role.${user.role}`)}
                      </span>
                    </td>
                    <td className={`px-4 py-3 ${dir === 'rtl' ? 'text-right' : 'text-left'}`}>
                      <button
                        onClick={() => handleToggleStatus(String(user.id), user.isActive)}
                        className={`px-2 py-1 rounded-full text-xs font-medium border transition-colors ${
                          user.isActive
                            ? 'bg-green-500/20 text-green-300 border-green-500/30'
                            : 'bg-red-500/20 text-red-300 border-red-500/30'
                        }`}
                      >
                        {t(user.isActive ? 'user.status.active' : 'user.status.inactive')}
                      </button>
                    </td>
                    <td className={`px-4 py-3 text-sm text-zinc-400 ${dir === 'rtl' ? 'text-right' : 'text-left'}`}>
                      {formatDate(user.createdAt)}
                    </td>
                    <td className={`px-4 py-3 ${dir === 'rtl' ? 'text-left' : 'text-right'}`}>
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleView(String(user.id))}
                          className="p-1.5 hover:bg-white/10 rounded-lg transition-colors text-zinc-400 hover:text-white"
                          title={t('user.view')}
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleEdit(String(user.id))}
                          className="p-1.5 hover:bg-white/10 rounded-lg transition-colors text-zinc-400 hover:text-white"
                          title={t('user.edit')}
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(String(user.id), user.fullName)}
                          className="p-1.5 hover:bg-red-500/20 rounded-lg transition-colors text-zinc-400 hover:text-red-400"
                          title={t('user.delete')}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </AmberCard>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-zinc-400">
            {`${t('user.showing') || 'Showing'} ${(filters.page! - 1) * filters.limit! + 1}-${Math.min(filters.page! * filters.limit!, total)} ${t('user.of') || 'of'} ${total}`}
          </p>
          <div className="flex gap-2">
            <AmberButton
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(filters.page! - 1)}
              disabled={filters.page === 1}
            >
              {t('pagination.previous')}
            </AmberButton>
            <span className="px-4 py-2 text-sm text-zinc-400">
              {filters.page} / {totalPages}
            </span>
            <AmberButton
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(filters.page! + 1)}
              disabled={filters.page === totalPages}
            >
              {t('pagination.next')}
            </AmberButton>
          </div>
        </div>
      )}
    </div>
  );
}

export default UsersListPage;
