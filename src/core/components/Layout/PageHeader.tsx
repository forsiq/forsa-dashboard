/**
 * PageHeader Component
 *
 * A consistent page header component with title, description, and actions.
 *
 * @example
 * <PageHeader
 *   title="Categories"
 *   description="Manage your product categories"
 *   actions={<NewButton />}
 *   breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Categories' }]}
 * />
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, ArrowLeft } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { cn } from '../../lib/utils/cn';
import { AmberButton } from '../AmberButton';

// ============================================================================
// Types
// ============================================================================

export interface BreadcrumbItem {
  label: string;
  href?: string;
  onClick?: () => void;
}

export interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  breadcrumbs?: BreadcrumbItem[];
  showBackButton?: boolean;
  backHref?: string;
  backLabel?: string;
  className?: string;
}

// ============================================================================
// Breadcrumb Component
// ============================================================================

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

function Breadcrumbs({ items, className }: BreadcrumbsProps) {
  const { t } = useLanguage();

  return (
    <nav className={cn('flex items-center gap-2 text-sm', className)} aria-label="Breadcrumb">
      {items.map((item, index) => (
        <React.Fragment key={index}>
          {index > 0 && (
            <span className="text-zinc-muted/50">/</span>
          )}
          {item.href ? (
            <a
              href={item.href}
              className="text-zinc-muted hover:text-zinc-text transition-colors"
            >
              {item.label}
            </a>
          ) : item.onClick ? (
            <button
              onClick={item.onClick}
              className="text-zinc-muted hover:text-zinc-text transition-colors"
            >
              {item.label}
            </button>
          ) : (
            <span className="text-zinc-text font-medium">{item.label}</span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
}

// ============================================================================
// Main PageHeader Component
// ============================================================================

export function PageHeader({
  title,
  description,
  actions,
  breadcrumbs,
  showBackButton = false,
  backHref,
  backLabel,
  className,
}: PageHeaderProps) {
  const { t, dir } = useLanguage();
  const navigate = useNavigate();
  const isRTL = dir === 'rtl';

  const handleBack = () => {
    if (backHref) {
      navigate(backHref);
    } else {
      navigate(-1);
    }
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* Breadcrumbs */}
      {breadcrumbs && breadcrumbs.length > 0 && (
        <Breadcrumbs items={breadcrumbs} />
      )}

      {/* Header Content */}
      <div className={cn(
        'flex flex-col sm:flex-row sm:items-start justify-between gap-4',
        isRTL ? 'text-right' : 'text-left'
      )}>
        <div className="space-y-1">
          {/* Back Button */}
          {showBackButton && (
            <button
              onClick={handleBack}
              className={cn(
                'flex items-center gap-2 text-sm text-zinc-muted hover:text-zinc-text transition-colors mb-2',
                isRTL ? 'flex-row-reverse' : 'flex-row'
              )}
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{backLabel || (t('common.back') || 'Back')}</span>
            </button>
          )}

          {/* Title */}
          <h1 className="text-4xl font-black text-zinc-text tracking-tight leading-none">
            {title}
          </h1>

          {/* Description */}
          {description && (
            <p className="text-base text-zinc-secondary font-bold">
              {description}
            </p>
          )}
        </div>

        {/* Actions */}
        {actions && (
          <div className="flex items-center gap-3 flex-shrink-0">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// Convenience Components
// ============================================================================

export interface NewPageButtonProps {
  label?: string;
  onClick?: () => void;
  href?: string;
  icon?: React.ComponentType<{ className?: string }>;
}

export function NewPageButton({ label, onClick, href, icon: Icon = Plus }: NewPageButtonProps) {
  const { t } = useLanguage();
  const navigate = useNavigate();

  const handleClick = () => {
    if (href) {
      navigate(href);
    } else {
      onClick?.();
    }
  };

  return (
    <AmberButton
      onClick={handleClick}
      className="gap-2 px-6 h-11 bg-[var(--color-brand)] hover:bg-[var(--color-brand)] text-black font-bold rounded-xl shadow-sm transition-all border-none"
    >
      <span>{label || (t('common.new') || 'New')}</span>
      <Icon className="w-5 h-5" />
    </AmberButton>
  );
}

// ============================================================================
// Export Default
// ============================================================================

export default PageHeader;
