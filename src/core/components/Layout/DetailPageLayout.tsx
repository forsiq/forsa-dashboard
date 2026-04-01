/**
 * DetailPageLayout Component
 *
 * A standard detail page layout that includes:
 * - PageHeader with back button and actions
 * - Tabs for different sections
 * - Content area
 *
 * @example
 * <DetailPageLayout
 *   title="Category Details"
 *   subtitle={category.name}
 *   breadcrumbs={[{ label: 'Categories', href: '/categories' }]}
 *   tabs={[
 *     { id: 'details', label: 'Details' },
 *     { id: 'activity', label: 'Activity' },
 *   ]}
 *   actions={<EditButton />}
 * >
 *   {content}
 * </DetailPageLayout>
 */

import React, { ReactNode, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Edit, Trash2 } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { cn } from '../../lib/utils/cn';
import { AmberButton } from '../AmberButton';

// ============================================================================
// Types
// ============================================================================

export interface DetailTab {
  id: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  content?: ReactNode;
  disabled?: boolean;
}

export interface DetailPageLayoutProps {
  // Header
  title: string;
  subtitle?: string;
  breadcrumbs?: Array<{ label: string; href?: string }>;
  backHref?: string;

  // Entity info
  entityId?: string;
  entityStatus?: 'active' | 'inactive' | 'pending' | 'success' | 'warning' | 'danger';
  entityBadge?: string;

  // Actions
  actions?: ReactNode;
  onEdit?: () => void;
  onDelete?: () => void;
  editHref?: string;
  editLabel?: string;
  deleteLabel?: string;

  // Tabs
  tabs?: DetailTab[];
  defaultTab?: string;

  // Content
  children: ReactNode;

  // Loading state
  isLoading?: boolean;

  // Styling
  className?: string;
}

// ============================================================================
// Tab Component
// ============================================================================

interface DetailTabsProps {
  tabs: DetailTab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

function DetailTabs({ tabs, activeTab, onTabChange }: DetailTabsProps) {
  return (
    <div className="flex items-center gap-1 border-b border-[var(--color-border)] px-6">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        const isDisabled = tab.disabled;

        return (
          <button
            key={tab.id}
            onClick={() => !isDisabled && onTabChange(tab.id)}
            disabled={isDisabled}
            className={cn(
              'flex items-center gap-2 px-4 py-3 text-sm font-bold transition-colors relative',
              isActive
                ? 'text-[var(--color-brand)]'
                : 'text-zinc-muted hover:text-zinc-text',
              isDisabled && 'opacity-50 cursor-not-allowed'
            )}
          >
            {Icon && <Icon className="w-4 h-4" />}
            {tab.label}
            {isActive && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--color-brand)]" />
            )}
          </button>
        );
      })}
    </div>
  );
}

// ============================================================================
// Main DetailPageLayout Component
// ============================================================================

export function DetailPageLayout({
  title,
  subtitle,
  breadcrumbs,
  backHref,
  entityId,
  entityStatus,
  entityBadge,
  actions,
  onEdit,
  onDelete,
  editHref,
  editLabel = 'common.edit',
  deleteLabel = 'common.delete',
  tabs,
  defaultTab,
  children,
  isLoading,
  className,
}: DetailPageLayoutProps) {
  const { t, dir } = useLanguage();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(defaultTab || tabs?.[0]?.id || '');

  const handleEdit = () => {
    if (editHref) {
      navigate(editHref);
    } else {
      onEdit?.();
    }
  };

  const handleDelete = () => {
    if (window.confirm(t('common.delete_confirm') || 'Are you sure?')) {
      onDelete?.();
    }
  };

  // Default action buttons
  const defaultActions = (onEdit || onDelete) ? (
    <div className="flex items-center gap-2">
      {onEdit && (
        <AmberButton
          variant="secondary"
          size="sm"
          onClick={handleEdit}
          className="gap-2"
        >
          <Edit className="w-4 h-4" />
          <span>{t(editLabel) || 'Edit'}</span>
        </AmberButton>
      )}
      {onDelete && (
        <AmberButton
          variant="ghost"
          size="sm"
          onClick={handleDelete}
          className="gap-2 text-danger hover:text-danger hover:bg-danger/10"
        >
          <Trash2 className="w-4 h-4" />
          <span>{t(deleteLabel) || 'Delete'}</span>
        </AmberButton>
      )}
    </div>
  ) : null;

  return (
    <div className={cn('max-w-[1600px] mx-auto', className)} dir={dir}>
      {/* Header */}
      <div className="bg-[var(--color-obsidian-card)] border-b border-[var(--color-border)]">
        <div className="p-6">
          {/* Breadcrumbs */}
          {breadcrumbs && breadcrumbs.length > 0 && (
            <nav className="flex items-center gap-2 text-sm text-zinc-muted mb-4" aria-label="Breadcrumb">
              {breadcrumbs.map((crumb, index) => (
                <React.Fragment key={index}>
                  {index > 0 && <span className="text-zinc-muted/30">/</span>}
                  {crumb.href ? (
                    <a href={crumb.href} className="hover:text-zinc-text transition-colors">
                      {crumb.label}
                    </a>
                  ) : (
                    <span className="text-zinc-text">{crumb.label}</span>
                  )}
                </React.Fragment>
              ))}
            </nav>
          )}

          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              {/* Entity Badge/Status */}
              {(entityBadge || entityStatus) && (
                <div className={cn(
                  'px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider',
                  entityStatus === 'active' && 'bg-success/10 text-success',
                  entityStatus === 'inactive' && 'bg-zinc-card text-zinc-muted',
                  entityStatus === 'pending' && 'bg-warning/10 text-warning',
                  entityStatus === 'success' && 'bg-success/10 text-success',
                  entityStatus === 'warning' && 'bg-warning/10 text-warning',
                  entityStatus === 'danger' && 'bg-danger/10 text-danger'
                )}>
                  {entityBadge || t(`common.status.${entityStatus}`) || entityStatus}
                </div>
              )}

              {/* Title */}
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-black text-zinc-text tracking-tight">
                    {title}
                  </h1>
                  {isLoading && (
                    <div className="w-4 h-4 border-2 border-brand border-t-transparent rounded-full animate-spin" />
                  )}
                </div>
                {subtitle && (
                  <p className="text-sm text-zinc-muted font-medium mt-0.5">
                    {subtitle}
                  </p>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              {actions}
              {defaultActions}
            </div>
          </div>
        </div>

        {/* Tabs */}
        {tabs && tabs.length > 0 && (
          <DetailTabs
            tabs={tabs}
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />
        )}
      </div>

      {/* Content */}
      <div className="p-6">
        {tabs ? (
          <div>
            {tabs.map((tab) => (
              tab.content && activeTab === tab.id && (
                <div key={tab.id}>
                  {tab.content}
                </div>
              )
            ))}
            {React.Children.map(children, (child) => {
              if (React.isValidElement(child) && child.type === React.Fragment) {
                return child;
              }
              return null;
            })}
          </div>
        ) : (
          children
        )}
      </div>
    </div>
  );
}

// ============================================================================
// Export Default
// ============================================================================

export default DetailPageLayout;
