import React from 'react';
import { cn } from '@core/lib/utils/cn';

interface FormSectionProps {
  icon: React.ReactNode;
  iconBgColor?: string;
  iconBorderColor?: string;
  iconTextColor?: string;
  title: string;
  children: React.ReactNode;
  className?: string;
}

const colorMap: Record<string, { bg: string; border: string; text: string }> = {
  brand: { bg: 'bg-brand/10', border: 'border-brand/20', text: 'text-brand' },
  success: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', text: 'text-emerald-400' },
  info: { bg: 'bg-info/10', border: 'border-info/20', text: 'text-info' },
  warning: { bg: 'bg-warning/10', border: 'border-warning/20', text: 'text-warning' },
  danger: { bg: 'bg-danger/10', border: 'border-danger/20', text: 'text-danger' },
};

export function FormSection({
  icon,
  iconBgColor = 'brand',
  title,
  children,
  className,
}: FormSectionProps) {
  const colors = colorMap[iconBgColor] || colorMap.brand;

  return (
    <div className={cn('!p-8 bg-obsidian-card border-border shadow-xl space-y-8', className)}>
      <div className="flex items-center gap-3 border-b border-white/[0.03] pb-6">
        <div className={cn(
          'w-10 h-10 rounded-lg flex items-center justify-center border',
          colors.bg,
          colors.border,
          colors.text,
        )}>
          {icon}
        </div>
        <h3 className="text-sm font-black text-zinc-text uppercase tracking-[0.25em]">{title}</h3>
      </div>
      {children}
    </div>
  );
}
