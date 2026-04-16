/**
 * User List Configuration
 */

import React from 'react';
import { Eye, Edit, Trash } from 'lucide-react';

// Local type definitions - ListConfig not exported from @core/services/types
type ColumnConfig = {
  key: string;
  label: string;
  sortable?: boolean;
  searchable?: boolean;
  render?: (row: any) => React.ReactNode;
  filterKey?: string;
};

type FilterConfig = {
  key: string;
  type: 'search' | 'select' | 'date';
  placeholder?: string;
  options?: Array<{ label: string; value: string }>;
  useCategories?: boolean;
};

type ListConfig = {
  columns: ColumnConfig[];
  filters: FilterConfig[];
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  defaultPageSize?: number;
};

export const userListConfig: ListConfig = {
  columns: [
    {
      key: 'userName',
      label: 'user.username',
      sortable: true,
      searchable: true,
    },
    {
      key: 'fullName',
      label: 'user.full_name',
      sortable: true,
      searchable: true,
    },
    {
      key: 'email',
      label: 'user.email',
      sortable: true,
    },
    {
      key: 'phone',
      label: 'user.phone',
    },
    {
      key: 'role',
      label: 'user.role',
      render: (row: any) => {
        const roleColors = {
          admin: 'bg-purple-500/20 text-purple-300',
          manager: 'bg-blue-500/20 text-blue-300',
          user: 'bg-gray-500/20 text-gray-300',
        };
        const roleKey = row.role as keyof typeof roleColors;
        return (
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${roleColors[roleKey] || roleColors.user}`}>
            {`user.role.${row.role}`}
          </span>
        );
      },
      filterKey: 'role',
    },
    {
      key: 'isActive',
      label: 'user.is_active',
      render: (row: any) => {
        const statusConfig = row.isActive
          ? { label: 'user.status.active', className: 'bg-green-500/20 text-green-300' }
          : { label: 'user.status.inactive', className: 'bg-red-500/20 text-red-300' };
        return (
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusConfig.className}`}>
            {statusConfig.label}
          </span>
        );
      },
      filterKey: 'status',
    },
    {
      key: 'createdAt',
      label: 'user.created_at',
      sortable: true,
      render: (row: any) => (row.createdAt ? new Date(row.createdAt).toLocaleDateString() : '-'),
    },
    {
      key: 'actions',
      label: 'actions',
      render: (row: any) => (
        <div className="flex gap-2">
          <button
            className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
            onClick={() => (window.location.href = `/users/${row.id}`)}
            title="user.view"
          >
            <Eye className="h-4 w-4" />
          </button>
          <button
            className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
            onClick={() => (window.location.href = `/users/${row.id}/edit`)}
            title="user.edit"
          >
            <Edit className="h-4 w-4" />
          </button>
          <button
            className="p-1.5 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors"
            onClick={() => {
              /* Handle delete */
            }}
            title="user.delete"
          >
            <Trash className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ],
  filters: [
    {
      key: 'search',
      type: 'search',
      placeholder: 'user.search_placeholder',
    },
    {
      key: 'role',
      type: 'select',
      placeholder: 'user.filter_by_role',
      options: [
        { label: 'all', value: 'all' },
        { label: 'admin', value: 'admin' },
        { label: 'manager', value: 'manager' },
        { label: 'user', value: 'user' },
      ],
    },
    {
      key: 'status',
      type: 'select',
      placeholder: 'user.filter_by_status',
      options: [
        { label: 'all', value: 'all' },
        { label: 'active', value: 'active' },
        { label: 'inactive', value: 'inactive' },
      ],
    },
  ],
  sortBy: 'createdAt',
  sortOrder: 'desc',
  defaultPageSize: 20,
};
