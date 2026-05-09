import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Clock, Calendar, X, Loader2, Plus } from 'lucide-react';
import { useLanguage } from '@core/contexts/LanguageContext';
import { cn } from '@core/lib/utils/cn';
import { AmberButton } from '@core/components/AmberButton';
import { AmberInput } from '@core/components/AmberInput';
import { useRescheduleAuction } from '../api';
import type { Auction } from '../types/auction.types';

interface RescheduleModalProps {
  isOpen: boolean;
  onClose: (success?: boolean) => void;
  auction: Auction | null;
}

function toLocalDatetimeString(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function formatDateTime(dateStr: string, locale: string): string {
  try {
    return new Date(dateStr).toLocaleString(locale === 'ar' ? 'ar-SA' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return dateStr;
  }
}

const QUICK_OPTIONS = [
  { labelKey: 'auction.reschedule.plus_15m', minutes: 15 },
  { labelKey: 'auction.reschedule.plus_30m', minutes: 30 },
  { labelKey: 'auction.reschedule.plus_1h', minutes: 60 },
  { labelKey: 'auction.reschedule.plus_24h', minutes: 1440 },
];

export const RescheduleModal: React.FC<RescheduleModalProps> = ({ isOpen, onClose, auction }) => {
  const { t, language, dir } = useLanguage();
  const rescheduleMutation = useRescheduleAuction();

  const currentEndTime = useMemo(() => {
    if (!auction?.endTime) return new Date();
    const end = new Date(auction.endTime);
    const now = new Date();
    return end > now ? end : now;
  }, [auction?.endTime]);

  const [newEndTime, setNewEndTime] = useState<string>('');
  const [mode, setMode] = useState<'quick' | 'custom'>('quick');

  // Reset form state when modal opens with a new auction
  React.useEffect(() => {
    if (isOpen) {
      setNewEndTime('');
      setMode('quick');
    }
  }, [isOpen]);

  const getQuickEndTime = (minutes: number): string => {
    const d = new Date(currentEndTime.getTime() + minutes * 60000);
    return toLocalDatetimeString(d);
  };

  const getQuickLabel = (labelKey: string, minutes: number): string => {
    const fallback =
      minutes < 60
        ? `+${minutes}m`
        : minutes < 1440
          ? `+${minutes / 60}h`
          : `+${minutes / 1440}d`;
    return t(labelKey) || fallback;
  };

  const selectedEndTime = mode === 'quick' ? '' : newEndTime;

  const handleQuickSelect = (minutes: number) => {
    if (!auction) return;
    const newDate = new Date(currentEndTime.getTime() + minutes * 60000);
    rescheduleMutation.mutate(
      { id: auction.id, endTime: newDate.toISOString() },
      { onSuccess: () => onClose(true) }
    );
  };

  const handleCustomSubmit = () => {
    if (!newEndTime || !auction) return;
    rescheduleMutation.mutate(
      { id: auction.id, endTime: new Date(newEndTime).toISOString() },
      { onSuccess: () => onClose(true) }
    );
  };

  if (!isOpen || !auction) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={() => onClose()}
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: 'spring', duration: 0.2 }}
        className="relative bg-obsidian-card border border-white/10 rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-auto"
      >
        <button
          onClick={() => onClose()}
          disabled={rescheduleMutation.isPending}
          className={cn(
            'absolute top-3 p-2 rounded-lg text-zinc-muted hover:text-zinc-text hover:bg-white/10 transition-colors disabled:opacity-50 z-10',
            dir === 'rtl' ? 'left-3' : 'right-3'
          )}
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-6 space-y-6" dir={dir}>
          <div className={cn('flex items-start gap-4', dir === 'rtl' && 'flex-row-reverse')}>
            <div className="p-3 rounded-lg bg-brand/10">
              <Calendar className="w-6 h-6 text-brand" />
            </div>
            <div className={cn('flex-1 space-y-1', dir === 'rtl' ? 'text-right' : 'text-left')}>
              <h3 className="text-lg font-bold text-zinc-text">
                {t('auction.reschedule.title') || 'Reschedule Auction'}
              </h3>
              <p className="text-sm text-zinc-muted">
                {auction.title}
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-zinc-muted uppercase tracking-widest">
              {t('auction.reschedule.current_end') || 'Current End Time'}
            </label>
            <div className="flex items-center gap-2 text-sm text-zinc-text bg-obsidian-outer border border-white/5 rounded-lg px-4 py-3">
              <Clock className="w-4 h-4 text-warning shrink-0" />
              <span className="font-bold tabular-nums">{formatDateTime(auction.endTime, language)}</span>
            </div>
          </div>

          <div className="h-px bg-white/5" />

          <div className="space-y-3">
            <label className="text-[10px] font-black text-zinc-muted uppercase tracking-widest">
              {t('auction.reschedule.quick_extend') || 'Quick Extend'}
            </label>
            <div className="grid grid-cols-2 gap-2">
              {QUICK_OPTIONS.map((opt) => (
                <button
                  key={opt.minutes}
                  onClick={() => handleQuickSelect(opt.minutes)}
                  disabled={rescheduleMutation.isPending}
                  className={cn(
                    'flex items-center justify-center gap-2 px-4 py-3 rounded-lg',
                    'text-xs font-black uppercase tracking-widest transition-all',
                    'bg-obsidian-outer border border-white/5 text-zinc-text',
                    'hover:border-brand/30 hover:bg-brand/5',
                    'disabled:opacity-50 disabled:cursor-not-allowed',
                    'active:scale-95'
                  )}
                >
                  <Plus className="w-3.5 h-3.5" />
                  {getQuickLabel(opt.labelKey, opt.minutes)}
                </button>
              ))}
            </div>
          </div>

          <div className="h-px bg-white/5" />

          <div className="space-y-3">
            <label className="text-[10px] font-black text-zinc-muted uppercase tracking-widest">
              {t('auction.reschedule.custom_time') || 'Set Custom Time'}
            </label>
            <AmberInput
              type="datetime-local"
              value={newEndTime}
              onChange={(e) => {
                setNewEndTime(e.target.value);
                setMode('custom');
              }}
              className="h-12 bg-obsidian-outer border-white/5 text-sm font-bold tabular-nums"
              min={toLocalDatetimeString(new Date())}
            />
            <AmberButton
              onClick={handleCustomSubmit}
              disabled={!newEndTime || rescheduleMutation.isPending}
              className="w-full h-12 bg-brand text-black font-black uppercase tracking-widest rounded-xl active:scale-95 transition-all border-none disabled:opacity-50"
            >
              {rescheduleMutation.isPending ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {t('common.loading') || 'Loading...'}
                </span>
              ) : (
                t('auction.reschedule.confirm') || 'Reschedule'
              )}
            </AmberButton>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
