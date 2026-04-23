import React from 'react';

export interface Column<T = any> {
  key: string;
  label: string | React.ReactNode;
  render?: (row: T) => React.ReactNode;
  sortable?: boolean;
  align?: 'left' | 'center' | 'right';
  width?: string;
  className?: string;
  hideInCard?: boolean;
  cardTitle?: boolean;
  cardSubtitle?: boolean;
  cardMedia?: boolean;
  cardBadge?: boolean;
}

export interface Action<T = any> {
  label: string | ((row: T) => string);
  icon?: React.ElementType | ((row: T) => React.ElementType);
  onClick: (row: T) => void;
  variant?: 'default' | 'danger' | 'success';
}

export interface BulkAction<T = any> {
  label: string;
  icon?: React.ElementType;
  onClick: (selectedIds: string[], selectedRows: T[]) => void;
  variant?: 'default' | 'danger' | 'success';
}

export type ViewMode = 'table' | 'grid';

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyField?: keyof T;
  sortable?: boolean;
  selectable?: boolean;
  expandable?: boolean;
  pagination?: boolean;
  pageSize?: number;
  loading?: boolean;
  onRowClick?: (row: T) => void;
  onSelectionChange?: (selectedIds: string[]) => void;
  rowActions?: Action<T>[];
  bulkActions?: BulkAction<T>[];
  expandComponent?: (row: T) => React.ReactNode;
  emptyMessage?: string;
  className?: string;
  viewMode?: ViewMode;
  showViewToggle?: boolean;
  onViewModeChange?: (mode: ViewMode) => void;
  gridCols?: 1 | 2 | 3 | 4 | 'auto';
  renderCard?: (row: T, columns: Column<T>[], actions?: Action<T>[]) => React.ReactNode;
}

export type { DataTableProps };
