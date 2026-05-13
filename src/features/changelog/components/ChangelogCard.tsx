'use client';

import React from 'react';
import {
  Plus,
  Wrench,
  ArrowUpRight,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Sparkles,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import dayjs from 'dayjs';

import { cn } from '@core/lib/utils/cn';
import { useLanguage } from '@core/contexts/LanguageContext';
import { AmberCard } from '@core/components/AmberCard';
import type { ChangelogRelease, ChangeType } from '@features/changelog/types';

const TYPE_CONFIG: Record<
  ChangeType,
  { icon: React.ComponentType<{ className?: string }>; colorClass: string; bgClass: string }
> = {
  added: {
    icon: Plus,
    colorClass: 'text-emerald-400',
    bgClass: 'bg-emerald-500/10 border-emerald-500/20',
  },
  fixed: {
    icon: Wrench,
    colorClass: 'text-rose-400',
    bgClass: 'bg-rose-500/10 border-rose-500/20',
  },
  improved: {
    icon: ArrowUpRight,
    colorClass: 'text-blue-400',
    bgClass: 'bg-blue-500/10 border-blue-500/20',
  },
  changed: {
    icon: RefreshCw,
    colorClass: 'text-amber-400',
    bgClass: 'bg-amber-500/10 border-amber-500/20',
  },
};

interface ChangelogCardProps {
  release: ChangelogRelease;
  isLatest?: boolean;
}

export const ChangelogCard: React.FC<ChangelogCardProps> = ({ release, isLatest = false }) => {
  const { t } = useLanguage();
  const [isExpanded, setIsExpanded] = React.useState(isLatest);

  const daysSinceRelease = dayjs().diff(dayjs(release.date), 'day');
  const isNew = daysSinceRelease < 30;

  const formatDate = (date: string) => {
    return dayjs(date).format('MMM D, YYYY');
  };

  // Group entries by type
  const grouped = release.entries.reduce(
    (acc, entry) => {
      if (!acc[entry.type]) acc[entry.type] = [];
      acc[entry.type].push(entry);
      return acc;
    },
    {} as Record<ChangeType, typeof release.entries>,
  );

  const typeOrder: ChangeType[] = ['added', 'improved', 'fixed', 'changed'];

  return (
    <AmberCard
      className={cn(
        'transition-all duration-300',
        isNew && 'border-brand/20 hover:border-brand/40',
      )}
    >
      {/* Header */}
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between gap-4 text-left"
      >
        <div className="flex items-center gap-3 min-w-0">
          {isNew && (
            <span className="shrink-0 px-2 py-0.5 text-[9px] font-black uppercase tracking-widest bg-brand/15 text-brand border border-brand/20 rounded-sm">
              {t('changelog.new_badge')}
            </span>
          )}
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-zinc-muted/60">
                v{release.version}
              </span>
              <span className="text-[10px] text-zinc-muted/40">•</span>
              <span className="text-[10px] font-medium text-zinc-muted/50">
                {formatDate(release.date)}
              </span>
            </div>
            <h4 className="text-sm font-black text-white tracking-tight truncate">
              {release.title}
            </h4>
          </div>
        </div>
        <div className="shrink-0 text-zinc-muted/40">
          {isExpanded ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </div>
      </button>

      {/* Expanded content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="mt-4 pt-4 border-t border-white/5 space-y-4">
              {typeOrder.map(type => {
                const entries = grouped[type];
                if (!entries || entries.length === 0) return null;
                const config = TYPE_CONFIG[type];
                const Icon = config.icon;

                return (
                  <div key={type} className="space-y-1.5">
                    <div className="flex items-center gap-2 mb-2">
                      <div
                        className={cn(
                          'w-5 h-5 rounded-sm flex items-center justify-center border',
                          config.bgClass,
                        )}
                      >
                        <Icon className={cn('w-3 h-3', config.colorClass)} />
                      </div>
                      <span className={cn('text-[10px] font-black uppercase tracking-widest', config.colorClass)}>
                        {t(`changelog.type.${type}`)}
                      </span>
                      <span className="text-[10px] text-zinc-muted/30 font-mono">
                        ({entries.length})
                      </span>
                    </div>
                    <ul className="space-y-1">
                      {entries.map((entry, idx) => (
                        <li
                          key={idx}
                          className="flex items-start gap-2 text-[12px] text-zinc-text/80 leading-relaxed"
                        >
                          <span className="mt-1.5 w-1 h-1 rounded-full bg-zinc-muted/30 shrink-0" />
                          <span>{entry.description}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}

              {isLatest && (
                <div className="flex items-center gap-2 pt-2 text-brand/60">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">
                    {t('changelog.whats_new')}
                  </span>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </AmberCard>
  );
};
