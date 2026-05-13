'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, CheckCheck } from 'lucide-react';

import { useLanguage } from '@core/contexts/LanguageContext';
import { useChangelog } from '@features/changelog/hooks/useChangelog';
import { ChangelogCard } from './ChangelogCard';

interface ChangelogSectionProps {
  className?: string;
}

export const ChangelogSection: React.FC<ChangelogSectionProps> = ({ className }) => {
  const { t } = useLanguage();
  const { releases, unseenCount, markAllAsSeen } = useChangelog();

  if (releases.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className={className}
    >
      {/* Section header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-brand/10 rounded-sm border border-brand/20">
            <Sparkles className="w-5 h-5 text-brand" />
          </div>
          <div>
            <h2 className="text-xl font-black text-white tracking-tighter uppercase">
              {t('changelog.title')}
            </h2>
            <p className="text-[11px] text-zinc-muted font-medium tracking-tight">
              {t('changelog.subtitle')}
            </p>
          </div>
          {unseenCount > 0 && (
            <span className="px-2 py-0.5 text-[10px] font-black bg-brand/15 text-brand border border-brand/20 rounded-full">
              {unseenCount}
            </span>
          )}
        </div>
        {unseenCount > 0 && (
          <button
            type="button"
            onClick={markAllAsSeen}
            className="flex items-center gap-2 px-3 py-1.5 text-[10px] font-black text-zinc-muted hover:text-brand bg-white/[0.03] hover:bg-white/[0.06] border border-white/10 hover:border-brand/20 rounded-sm transition-all uppercase tracking-widest"
          >
            <CheckCheck className="w-3.5 h-3.5" />
            {t('changelog.mark_all_read')}
          </button>
        )}
      </div>

      {/* Release cards */}
      <div className="space-y-3">
        {releases.map((release, idx) => (
          <ChangelogCard key={release.version} release={release} isLatest={idx === 0} />
        ))}
      </div>
    </motion.div>
  );
};
