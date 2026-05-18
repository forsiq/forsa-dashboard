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
import { AmberTableSkeleton } from '@core/components/Loading/AmberTableSkeleton';
import {
  AdminListPageShell,
  ListPageToolbar,
  ListPageToolbarSearch,
} from '@core/components/Layout';
import { StatusBadge } from '@core/components/Data/StatusBadge';
import { DataTable, Column, Action } from '@core/components/Data/DataTable';
import { useDebounce } from '@core/hooks/useDebounce';
import { Plus, Eye, Edit, Trash2, Shield, ShieldAlert, User, UserCheck, UserX } from 'lucide-react';
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
  const { data: usersData, isPending: isLoadingUsers, isFetching, error: usersError } = useGetUsers(apiFilters);
  const { data: stats, isPending: isLoadingStats } = useGetUserStats();

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

  const activeFilterCount =
    (roleFilter !== 'all' ? 1 : 0) + (statusFilter !== 'all' ? 1 : 0);

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
      user: 'bg-zinc-500/20 text-zinc-muted border-zinc-500/30',
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
        <span className="text-sm font-medium text-zinc-text">{user.userName}</span>
      ),
      sortable: true,
    },
    {
      key: 'fullName',
      label: t('user.full_name') || 'Full Name',
      cardSubtitle: true,
      render: (user: any) => (
        <span className="text-sm text-zinc-secondary">{user.fullName}</span>
      ),
      sortable: true,
    },
    {
      key: 'email',
      label: t('user.email') || 'Email',
      hideInCard: true,
      render: (user: any) => (
        <span className="text-sm text-zinc-muted">{user.email || '-'}</span>
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
        <span className="text-sm text-zinc-muted">{formatDate(user.createdAt)}</span>
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
    <AdminListPageShell
      title={t('user.title')}
      description={t('user.subtitle')}
      icon={User}
      statsLoading={isLoadingStats}
      stats={[
        { label: t('user.stats.total'), value: stats?.total || 0, icon: User, color: 'info' },
        { label: t('user.stats.active'), value: stats?.active || 0, icon: UserCheck, color: 'success' },
        { label: t('user.stats.inactive'), value: stats?.inactive || 0, icon: UserX, color: 'danger' },
        { label: t('user.stats.admins'), value: stats?.admins || 0, icon: Shield, color: 'primary' },
      ]}
      headerActions={
        <AmberButton variant="primary" onClick={() => router.push('/users/new')} className="gap-2 h-11 bg-brand text-black font-black rounded-xl px-6">
          <Plus className="h-4 w-4" />
          {t('user.add')}
        </AmberButton>
      }
      toolbar={
        <ListPageToolbar>
          <ListPageToolbarSearch value={searchInput} onChange={setSearchInput} placeholder={t('user.search_placeholder')} className="flex-1 min-w-[200px]" />
          <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="px-4 py-2.5 h-11 bg-[var(--color-obsidian-card)] border border-[var(--color-border)] rounded-xl text-zinc-text text-sm font-bold shadow-sm">
            <option value="all">{t('user.filter.all_roles') || 'All Roles'}</option>
            <option value="manager">{t('user.role.manager') || 'Manager'}</option>
            <option value="admin">{t('user.role.admin') || 'Admin'}</option>
            <option value="user">{t('user.role.user') || 'User'}</option>
          </select>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-4 py-2.5 h-11 bg-[var(--color-obsidian-card)] border border-[var(--color-border)] rounded-xl text-zinc-text text-sm font-bold shadow-sm">
            <option value="all">{t('user.filter.all_status') || 'All Status'}</option>
            <option value="active">{t('user.status.active') || 'Active'}</option>
            <option value="inactive">{t('user.status.inactive') || 'Inactive'}</option>
          </select>
        </ListPageToolbar>
      }
    >
      {/* Users DataTable */}
      <div className="bg-[var(--color-obsidian-card)] border border-[var(--color-border)] rounded-2xl shadow-sm overflow-hidden">
        {isLoadingUsers ? (
          <AmberTableSkeleton columns={7} rows={5} />
        ) : paginatedUsers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <ShieldAlert className="h-16 w-16 text-zinc-600 mb-4" />
            <h3 className="text-lg font-semibold text-zinc-text mb-2">
              {t('user.no_users')}
            </h3>
            <p className="text-sm text-zinc-muted mb-6">
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
    </AdminListPageShell>
  );
}

export default UsersListPage;
