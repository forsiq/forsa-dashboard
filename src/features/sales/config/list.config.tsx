/**
 * Group Buying List Configuration
 */

import React from 'react';
import { Eye, Edit, Trash2 } from 'lucide-react';
import { formatCurrency, calculateDiscount, calculateProgress, getStatusVariant } from '../graphql/utils';

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

export const groupBuyingListConfig: ListConfig = {
  columns: [
    {
      key: 'title',
      label: 'groupBuying.title',
      sortable: true,
      searchable: true,
    },
    {
      key: 'category',
      label: 'groupBuying.category',
      render: (row: any) => row.category?.name || '-',
      filterKey: 'categoryId',
    },
    {
      key: 'pricing',
      label: 'groupBuying.pricing',
      render: (row: any) => {
        const discount = calculateDiscount(row.originalPrice, row.dealPrice);
        return (
          <div className="text-right">
            <div className="text-sm text-zinc-500 line-through">{formatCurrency(row.originalPrice)}</div>
            <div className="font-semibold text-green-400">{formatCurrency(row.dealPrice)}</div>
            <div className="text-xs text-zinc-500">
              {discount}% discount
            </div>
          </div>
        );
      },
    },
    {
      key: 'progress',
      label: 'groupBuying.progress',
      render: (row: any) => {
        const progress = calculateProgress(row.currentParticipants, row.maxParticipants);
        return (
          <div className="w-full">
            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="text-xs text-zinc-500 mt-1">
              {row.currentParticipants}/{row.maxParticipants}
            </div>
          </div>
        );
      },
    },
    {
      key: 'status',
      label: 'groupBuying.status',
      render: (row: any) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusVariant(row.status)}`}>
          {row.status}
        </span>
      ),
      filterKey: 'status',
    },
    {
      key: 'endTime',
      label: 'groupBuying.end_time',
      sortable: true,
      render: (row: any) => new Date(row.endTime).toLocaleDateString(),
    },
    {
      key: 'actions',
      label: 'actions',
      render: (row: any) => (
        <div className="flex items-center justify-end gap-1">
          <button
            className="p-1.5 hover:bg-white/10 rounded-lg transition-colors text-zinc-400 hover:text-white"
            onClick={() => (window.location.href = `/group-buying/${row.id}`)}
            title="view"
          >
            <Eye className="h-4 w-4" />
          </button>
          <button
            className="p-1.5 hover:bg-white/10 rounded-lg transition-colors text-zinc-400 hover:text-white"
            onClick={() => (window.location.href = `/group-buying/${row.id}/edit`)}
            title="edit"
          >
            <Edit className="h-4 w-4" />
          </button>
          <button
            className="p-1.5 hover:bg-red-500/20 rounded-lg transition-colors text-zinc-400 hover:text-red-400"
            onClick={() => {
              /* Handle delete */
            }}
            title="delete"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ],
  filters: [
    {
      key: 'search',
      type: 'search',
      placeholder: 'groupBuying.search_placeholder',
    },
    {
      key: 'status',
      type: 'select',
      placeholder: 'groupBuying.filter_by_status',
      options: [
        { label: 'all', value: 'all' },
        { label: 'draft', value: 'draft' },
        { label: 'scheduled', value: 'scheduled' },
        { label: 'active', value: 'active' },
        { label: 'unlocked', value: 'unlocked' },
        { label: 'completed', value: 'completed' },
        { label: 'cancelled', value: 'cancelled' },
        { label: 'expired', value: 'expired' },
      ],
    },
    {
      key: 'categoryId',
      type: 'select',
      placeholder: 'groupBuying.filter_by_category',
      options: [], // Populated from categories service
      useCategories: true, // Special flag to load categories
    },
  ],
  sortBy: 'createdAt',
  sortOrder: 'desc',
  defaultPageSize: 20,
};
