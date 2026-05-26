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
import { cn } from '@core/lib/utils/cn';
import { useIsMobile } from '@core/hooks/useIsMobile';
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
import { ListPageSkeleton, FetchingOverlay } from '@core/loading';
import { EmptyState } from '@core/components/EmptyState';
import { AmberSlideOver } from '@core/components';
import { useConfirmModal } from '@core/components/Feedback/AmberConfirmModal';

export function UsersListPage() {
  const router = useRouter();
  const { t, dir } = useLanguage();
  const toast = useToast();
  const { isMobile } = useIsMobile();
  const [isClient, setIsClient] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // State for filters
  const [searchInput, setSearchInput] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);

  // Debounce search
  const debouncedSearch = useDebounce(searchInput, 300);

  // API filters
  const apiFilters: UserFilters = useMemo(() => ({
    page: 1,
    limit: 200,
    search: debouncedSearch || undefined,
    sortBy,
    sortOrder,
  }), [debouncedSearch, sortBy, sortOrder]);

  // Queries
  const { data: usersData, isPending: isLoadingUsers, isFetching, error: usersError } = useGetUsers(apiFilters);
  const { data: stats, isPending: isLoadingStats } = useGetUserStats();

  // Mutations
  const deleteMutation = useDeleteUser();
  const statusMutation = useUpdateUserStatus();
  const { openConfirm, ConfirmModal } = useConfirmModal();

  // Error handling
  useEffect(() => {
    if (usersError) {
      toast.error(usersError.message || t('user.error.load_failed'));
    }
  }, [usersError, toast, t]);

  // Client-side filtering for role and status
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
    openConfirm({
      title: t('user.confirm_delete') || 'Delete User',
      message: `${t('user.confirm_delete') || 'Are you sure you want to delete'} ${name}?`,
      variant: 'danger',
      onConfirm: async () => {
        try {
          await deleteMutation.mutateAsync(id);
          toast.success(t('user.delete_success'));
        } catch (error: any) {
          toast.error(error.message || t('user.delete_failed'));
        }
      },
    });
  };

  const handleToggleStatus = async (id: string, isActive: boolean) => {
    try {
      await statusMutation.mutateAsync({ id, isActive: !isActive });
      toast.success(isActive ? t('user.deactivated') : t('user.activated'));
    } catch (error: any) {
      toast.error(error.message || t('user.status_update_failed'));
    }
  };

  const handleSortChange = (key: string, direction: 'asc' | 'desc') => {
    setSortBy(key);
    setSortOrder(direction);
    setPage(1);
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
      className="p-3 md:p-6 space-y-4 md:space-y-8"
      stats={[
        { label: t('user.stats.total'), value: stats?.total || 0, icon: User, color: 'info' },
        { label: t('user.stats.active'), value: stats?.active || 0, icon: UserCheck, color: 'success' },
        { label: t('user.stats.inactive'), value: stats?.inactive || 0, icon: UserX, color: 'danger' },
        { label: t('user.stats.admins'), value: stats?.admins || 0, icon: Shield, color: 'primary' },
      ]}
      headerActions={
        <AmberButton variant="primary" onClick={() => router.push('/users/new')} className="gap-2 h-11 bg-brand text-black font-black rounded-xl px-4 md:px-6">
          <Plus className="h-4 w-4" />
          <span className="hidden md:inline">{t('user.add')}</span>
        </AmberButton>
      }
      toolbar={
        <ListPageToolbar
          search={<ListPageToolbarSearch value={searchInput} onChange={(v) => { setSearchInput(v); setPage(1); }} placeholder={t('user.search_placeholder')} className="flex-1 min-w-[200px]" />}
          onFilterClick={() => setIsFilterOpen(true)}
          filterLabel={t('common.filters') || 'Filters'}
          activeFilterCount={activeFilterCount}
        />
      }
    >
      {/* Users DataTable */}
      <div className="space-y-6">
        {isLoadingUsers ? (
          <ListPageSkeleton count={8} columns={4} showStats />
        ) : paginatedUsers.length === 0 ? (
          <EmptyState
            icon={ShieldAlert}
            title={t('user.no_users') || 'No Users'}
            description={t('user.no_users_description') || 'No users found matching your criteria.'}
            actionLabel={t('user.add_first') || 'Add User'}
            onAction={() => router.push('/users/new')}
          />
        ) : (
          <div className="relative bg-[var(--color-obsidian-card)] border border-[var(--color-border)] rounded-2xl shadow-sm overflow-hidden">
            {isFetching && <FetchingOverlay />}
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
              onSortChange={handleSortChange}
              sortBy={sortBy}
              sortOrder={sortOrder}
            />
          </div>
        )}
      </div>

      {/* Filter SlideOver */}
      <AmberSlideOver
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        title={t('common.filters') || 'Filters'}
        description={t('user.filter_description') || 'Filter users by role and status.'}
      >
        <div className="space-y-8 py-4">
          <div className="space-y-3">
            <label className="text-[11px] font-black text-zinc-muted uppercase tracking-widest">{t('user.role') || 'Role'}</label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { value: 'all', label: t('user.filter.all_roles') || 'All Roles' },
                { value: 'admin', label: t('user.role.admin') || 'Admin' },
                { value: 'manager', label: t('user.role.manager') || 'Manager' },
                { value: 'user', label: t('user.role.user') || 'User' },
              ].map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setRoleFilter(opt.value)}
                  className={cn(
                    "h-11 px-4 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all border",
                    roleFilter === opt.value
                      ? "bg-brand text-black border-brand shadow-lg"
                      : "bg-obsidian-panel text-zinc-muted border-white/5 hover:border-white/10"
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="h-px bg-white/5" />

          <div className="space-y-3">
            <label className="text-[11px] font-black text-zinc-muted uppercase tracking-widest">{t('user.is_active') || 'Status'}</label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { value: 'all', label: t('user.filter.all_status') || 'All Status' },
                { value: 'active', label: t('user.status.active') || 'Active' },
                { value: 'inactive', label: t('user.status.inactive') || 'Inactive' },
              ].map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setStatusFilter(opt.value)}
                  className={cn(
                    "h-11 px-4 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all border",
                    statusFilter === opt.value
                      ? "bg-brand text-black border-brand shadow-lg"
                      : "bg-obsidian-panel text-zinc-muted border-white/5 hover:border-white/10"
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-8 space-y-3">
            <AmberButton className="w-full h-12 bg-zinc-text text-black font-black uppercase tracking-widest active:scale-95 transition-all" onClick={() => setIsFilterOpen(false)}>
              {t('common.done') || 'Apply'}
            </AmberButton>
            <AmberButton
              variant="secondary"
              className="w-full h-12 font-black uppercase tracking-widest border border-white/5 active:scale-95 transition-all"
              onClick={() => {
                setRoleFilter('all');
                setStatusFilter('all');
                setIsFilterOpen(false);
              }}
            >
              {t('common.reset') || 'Reset'}
            </AmberButton>
          </div>
        </div>
      </AmberSlideOver>

      <ConfirmModal />
    </AdminListPageShell>
  );
}

export default UsersListPage;
