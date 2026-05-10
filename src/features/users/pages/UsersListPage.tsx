/**
 * Users List Page
 *
 * Displays all users with search, filters, and pagination
 */

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/router';
import { useGetUsers, useGetUserStats, useDeleteUser, useUpdateUserStatus } from '../api';

import { useLanguage } from '@core/contexts/LanguageContext';
import { useToast } from '@core/contexts/ToastContext';
import { AmberButton } from '@core/components/AmberButton';
import { AmberInput } from '@core/components/AmberInput';
import { StatsGrid } from '@core/components/Layout/StatsGrid';
import { AmberTableSkeleton } from '@core/components/Loading/AmberTableSkeleton';
import { PageHeader } from '@core/components/Layout/PageHeader';
import { StatusBadge } from '@core/components/Data/StatusBadge';
import { DataTable, Column, Action } from '@core/components/Data/DataTable';
import { useDebounce } from '@core/hooks/useDebounce';
import { Search, Plus, Eye, Edit, Trash2, Shield, ShieldAlert, User, UserCheck, UserX } from 'lucide-react';
import type { UserFilters } from '../types';

export function UsersListPage() {
  const router = useRouter();
  const { t, dir } = useLanguage();
  const toast = useToast();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // State for filters
  const [searchInput, setSearchInput] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [page, setPage] = useState(1);

  // Debounce search — only hit API after 300ms of inactivity
  const debouncedSearch = useDebounce(searchInput, 300);

  // API filters — only search goes to backend (role/status filtered client-side)
  const apiFilters: UserFilters = useMemo(() => ({
    page: 1,
    limit: 200,
    search: debouncedSearch || undefined,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  }), [debouncedSearch]);

  // Queries
  const { data: usersData, isLoading: isLoadingUsers, error: usersError } = useGetUsers(apiFilters);
  const { data: stats, isLoading: isLoadingStats } = useGetUserStats();

  // Mutations
  const deleteMutation = useDeleteUser();
  const statusMutation = useUpdateUserStatus();

  // Error handling
  useEffect(() => {
    if (usersError) {
      toast.error(usersError.message || t('user.error.load_failed'));
    }
  }, [usersError, toast, t]);

  // Client-side filtering for role and status (backend compat doesn't support these)
  const filteredUsers = useMemo(() => {
    let users = usersData?.users || [];

    if (roleFilter !== 'all') {
      users = users.filter((u: any) => u.role === roleFilter);
    }

    if (statusFilter !== 'all') {
      const isActive = statusFilter === 'active';
      users = users.filter((u: any) => u.isActive === isActive);
    }

    return users;
  }, [usersData?.users, roleFilter, statusFilter]);

  // Paginate filtered results
  const pageSize = 20;
  const totalFiltered = filteredUsers.length;
  const totalPages = Math.ceil(totalFiltered / pageSize);
  const paginatedUsers = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredUsers.slice(start, start + pageSize);
  }, [filteredUsers, page, pageSize]);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, roleFilter, statusFilter]);

  // Handle user actions
  const handleView = (id: string) => {
    router.push(`/users/${id}`);
  };

  const handleEdit = (id: string) => {
    router.push(`/users/${id}/edit`);
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

  // Table columns
  const columns: Column<any>[] = [
    {
      key: 'userName',
      label: t('user.username') || 'Username',
      cardTitle: true,
      render: (user: any) => (
        <span className="text-sm font-medium text-white">{user.userName}</span>
      ),
      sortable: true,
    },
    {
      key: 'fullName',
      label: t('user.full_name') || 'Full Name',
      cardSubtitle: true,
      render: (user: any) => (
        <span className="text-sm text-zinc-300">{user.fullName}</span>
      ),
      sortable: true,
    },
    {
      key: 'email',
      label: t('user.email') || 'Email',
      hideInCard: true,
      render: (user: any) => (
        <span className="text-sm text-zinc-400">{user.email || '-'}</span>
      ),
    },
    {
      key: 'role',
      label: t('user.role') || 'Role',
      cardBadge: true,
      render: (user: any) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getRoleBadgeColor(user.role)}`}>
          {t(`user.role.${user.role}`)}
        </span>
      ),
    },
    {
      key: 'isActive',
      label: t('user.is_active') || 'Status',
      cardBadge: true,
      render: (user: any) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleToggleStatus(String(user.id), user.isActive);
          }}
          className={`px-2 py-1 rounded-full text-xs font-medium border transition-colors ${
            user.isActive
              ? 'bg-green-500/20 text-green-300 border-green-500/30'
              : 'bg-red-500/20 text-red-300 border-red-500/30'
          }`}
        >
          {t(user.isActive ? 'user.status.active' : 'user.status.inactive')}
        </button>
      ),
    },
    {
      key: 'createdAt',
      label: t('user.created_at') || 'Created',
      render: (user: any) => (
        <span className="text-sm text-zinc-400">{formatDate(user.createdAt)}</span>
      ),
      sortable: true,
      align: 'center',
    },
  ];

  const rowActions: Action<any>[] = [
    {
      label: t('user.view') || 'View',
      icon: Eye,
      onClick: (user: any) => handleView(String(user.id)),
    },
    {
      label: t('user.edit') || 'Edit',
      icon: Edit,
      onClick: (user: any) => handleEdit(String(user.id)),
    },
    {
      label: t('user.delete') || 'Delete',
      icon: Trash2,
      variant: 'danger',
      onClick: (user: any) => handleDelete(String(user.id), user.fullName),
    },
  ];

  if (!isClient) return null;

  return (
    <div className="flex flex-col gap-4 p-4 pt-0">
      {/* Page Header */}
      <PageHeader
        title={t('user.title')}
        description={t('user.subtitle')}
        actions={
          <AmberButton
            variant="primary"
            onClick={() => router.push('/users/new')}
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
            <div key={i} className="h-24 animate-pulse bg-white/5 rounded-xl" />
          ))}
        </div>
      ) : (
        <StatsGrid
          stats={[
            {
              label: t('user.stats.total'),
              value: stats?.total || 0,
              icon: User,
              color: 'info',
            },
            {
              label: t('user.stats.active'),
              value: stats?.active || 0,
              icon: UserCheck,
              color: 'success',
            },
            {
              label: t('user.stats.inactive'),
              value: stats?.inactive || 0,
              icon: UserX,
              color: 'danger',
            },
            {
              label: t('user.stats.admins'),
              value: stats?.admins || 0,
              icon: Shield,
              color: 'primary',
            },
          ]}
        />
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-center gap-4">
        {/* Search — debounced */}
        <div className="relative flex-1 max-w-sm w-full">
          <Search className="absolute top-1/2 -translate-y-1/2 start-3 w-4 h-4 text-zinc-muted" />
          <AmberInput
            placeholder={t('user.search_placeholder')}
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="bg-[var(--color-obsidian-card)] border-[var(--color-border)] shadow-sm rounded-xl h-11 focus:ring-[var(--color-brand)]/20 ps-4 pe-10"
          />
        </div>

        {/* Role Filter — client-side */}
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="px-4 py-2.5 bg-[var(--color-obsidian-card)] border border-[var(--color-border)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)]/20 text-zinc-text text-sm font-bold shadow-sm"
        >
          <option value="all">{t('user.filter.all_roles') || 'All Roles'}</option>
          <option value="manager">{t('user.role.manager') || 'Manager'}</option>
          <option value="admin">{t('user.role.admin') || 'Admin'}</option>
          <option value="user">{t('user.role.user') || 'User'}</option>
        </select>

        {/* Status Filter — client-side */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2.5 bg-[var(--color-obsidian-card)] border border-[var(--color-border)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)]/20 text-zinc-text text-sm font-bold shadow-sm"
        >
          <option value="all">{t('user.filter.all_status') || 'All Status'}</option>
          <option value="active">{t('user.status.active') || 'Active'}</option>
          <option value="inactive">{t('user.status.inactive') || 'Inactive'}</option>
        </select>
      </div>

      {/* Users DataTable */}
      <div className="bg-[var(--color-obsidian-card)] border border-[var(--color-border)] rounded-2xl shadow-sm overflow-hidden">
        {isLoadingUsers ? (
          <AmberTableSkeleton columns={7} rows={5} />
        ) : paginatedUsers.length === 0 ? (
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
              onClick={() => router.push('/users/new')}
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              {t('user.add_first')}
            </AmberButton>
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={paginatedUsers}
            keyField="id"
            rowActions={rowActions}
            onRowClick={(row) => handleView(String(row.id))}
            pagination
            pageSize={pageSize}
            totalItems={totalFiltered}
            currentPage={page}
            onPageChange={setPage}
            showViewToggle
          />
        )}
      </div>
    </div>
  );
}

export default UsersListPage;
