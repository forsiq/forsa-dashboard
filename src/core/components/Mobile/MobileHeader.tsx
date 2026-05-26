'use client';

import React from 'react';
import { useRouter } from 'next/router';
import { ArrowLeft, Bell, Plus } from 'lucide-react';
import { useLanguage } from '@core/contexts/LanguageContext';
import { cn } from '@core/lib/utils/cn';

interface MobileHeaderProps {
  title: string;
  showBack?: boolean;
  rightActions?: React.ReactNode;
  notificationCount?: number;
}

export const MobileHeader: React.FC<MobileHeaderProps> = ({
  title,
  showBack,
  rightActions,
  notificationCount,
}) => {
  const { dir } = useLanguage();
  const router = useRouter();

  const shouldShowBack = showBack ?? (typeof window !== 'undefined' && window.history.length > 1);

  const handleBack = () => {
    router.back();
  };

  return (
    <header
      className={cn(
        'sticky top-0 z-50 h-14 flex items-center gap-3 px-4',
        'bg-obsidian-card/80 backdrop-blur-md border-b border-white/5',
      )}
      dir={dir}
    >
      {shouldShowBack && (
        <button
          onClick={handleBack}
          className={cn(
            'p-2 -ms-2 rounded-lg text-zinc-muted hover:text-zinc-text hover:bg-white/10 transition-colors',
            dir === 'rtl' && 'rotate-180'
          )}
          aria-label="Back"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
      )}

      <h1 className="flex-1 text-base font-black text-zinc-text uppercase tracking-tight truncate min-w-0">
        {title}
      </h1>

      <div className="flex items-center gap-2 shrink-0">
        {rightActions}

        {notificationCount !== undefined && (
          <button className="relative p-2 rounded-lg text-zinc-muted hover:text-zinc-text hover:bg-white/10 transition-colors">
            <Bell className="w-5 h-5" />
            {notificationCount > 0 && (
              <span className="absolute top-1.5 end-1.5 w-2 h-2 rounded-full bg-red-500" />
            )}
          </button>
        )}
      </div>
    </header>
  );
};
