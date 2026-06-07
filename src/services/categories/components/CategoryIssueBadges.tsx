import React from 'react';
import { AlertTriangle, AlertCircle } from 'lucide-react';
import { cn } from '@core/lib/utils/cn';
import type { CategoryIssue } from '../lib/categoryHealth';

interface CategoryIssueBadgesProps {
  issues: CategoryIssue[];
  t: (key: string) => string;
  compact?: boolean;
  className?: string;
}

export function CategoryIssueBadges({
  issues,
  t,
  compact = false,
  className,
}: CategoryIssueBadgesProps) {
  if (!issues.length) return null;

  const errorCount = issues.filter((i) => i.severity === 'error').length;
  const Icon = errorCount > 0 ? AlertCircle : AlertTriangle;

  if (compact) {
    return (
      <span
        className={cn(
          'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest shrink-0',
          errorCount > 0
            ? 'bg-danger/15 text-danger border border-danger/25'
            : 'bg-warning/15 text-warning border border-warning/25',
          className,
        )}
        title={issues.map((i) => t(i.labelKey)).join(' · ')}
      >
        <Icon className="w-3 h-3" />
        {issues.length}
      </span>
    );
  }

  return (
    <div className={cn('flex flex-wrap gap-1.5', className)}>
      {issues.map((issue) => (
        <span
          key={issue.type}
          className={cn(
            'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide',
            issue.severity === 'error'
              ? 'bg-danger/10 text-danger border border-danger/20'
              : 'bg-warning/10 text-warning border border-warning/20',
          )}
        >
          {issue.severity === 'error' ? (
            <AlertCircle className="w-3 h-3 shrink-0" />
          ) : (
            <AlertTriangle className="w-3 h-3 shrink-0" />
          )}
          {t(issue.labelKey)}
        </span>
      ))}
    </div>
  );
}
