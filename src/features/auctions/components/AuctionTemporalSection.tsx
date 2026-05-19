import React from 'react';
import { Clock, Calendar } from 'lucide-react';
import { useLanguage } from '@core/contexts/LanguageContext';
import { cn } from '@core/lib/utils/cn';
import { AmberCard as Card } from '@core/components/AmberCard';
import { AmberInput } from '@core/components/AmberInput';
import { AmberDatePicker } from '@core/components/AmberDatePicker';

interface AuctionTemporalSectionProps {
  startTime: string | undefined;
  endTime: string | undefined;
  errors: Record<string, string>;
  durationDays: number;
  useDurationMode: boolean;
  computedEndTime: string;
  onStartTimeChange: (val: string) => void;
  onEndTimeChange: (val: string) => void;
  onDurationDaysChange: (days: number) => void;
  onUseDurationModeChange: (use: boolean) => void;
}

export const AuctionTemporalSection: React.FC<AuctionTemporalSectionProps> = ({
  startTime,
  endTime,
  errors,
  durationDays,
  useDurationMode,
  computedEndTime,
  onStartTimeChange,
  onEndTimeChange,
  onDurationDaysChange,
  onUseDurationModeChange,
}) => {
  const { t, dir } = useLanguage();

  return (
    <Card className="!p-8 bg-obsidian-card border-border shadow-xl space-y-6">
      <div className="flex items-center justify-between border-b border-white/[0.03] pb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center text-warning border border-warning/20">
            <Clock className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-black text-zinc-text uppercase tracking-[0.25em]">{t('auction.form.section.temporal')}</h3>
        </div>
        {/* Mode toggle in header */}
        <div className="flex items-center gap-1 bg-white/[0.02] rounded-lg p-0.5 border border-white/5">
          <button
            type="button"
            onClick={() => onUseDurationModeChange(true)}
            title={t('auction.form.cycle_duration') || 'Duration'}
            className={cn(
              "p-1.5 rounded-md transition-all",
              useDurationMode
                ? "bg-brand/15 text-brand border border-brand/30"
                : "text-zinc-muted hover:text-zinc-text"
            )}
          >
            <Clock className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => onUseDurationModeChange(false)}
            title={t('auction.form.temporal_end') || 'Manual Date'}
            className={cn(
              "p-1.5 rounded-md transition-all",
              !useDurationMode
                ? "bg-brand/15 text-brand border border-brand/30"
                : "text-zinc-muted hover:text-zinc-text"
            )}
          >
            <Calendar className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
      <div className="space-y-6">
        <AmberDatePicker
          label={t('auction.form.temporal_start')}
          value={startTime}
          onChange={onStartTimeChange}
          error={errors.startTime}
          icon={<Calendar className="w-4 h-4" />}
        />

        {useDurationMode ? (
          /* Duration mode: number of days */
          <>
            <AmberInput
              label={t('auction.form.cycle_duration') || 'Duration (Days)'}
              type="number"
              value={durationDays}
              onChange={(e) => {
                const val = Math.max(1, Math.min(90, Number(e.target.value) || 1));
                onDurationDaysChange(val);
              }}
              icon={<Clock className="w-4 h-4" />}
              min={1}
              max={90}
            />
            <div className="p-4 rounded-xl bg-obsidian-panel/40 border border-white/5 space-y-3">
              <div className="flex items-center justify-between text-[11px] font-black uppercase tracking-widest">
                <span className="text-zinc-muted">{t('auction.form.temporal_end')}</span>
                <span className="text-success font-mono text-xs">
                  {computedEndTime
                    ? new Date(computedEndTime).toLocaleDateString(dir === 'rtl' ? 'ar-IQ' : 'en-US', {
                        month: 'short', day: 'numeric', year: 'numeric',
                        hour: '2-digit', minute: '2-digit',
                      })
                    : '-'
                  }
                </span>
              </div>
              <div className="h-1 bg-white/[0.03] rounded-full overflow-hidden">
                <div
                  className="h-full bg-warning rounded-full transition-all duration-500"
                  style={{ width: `${Math.min((durationDays / 30) * 100, 100)}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[11px] font-black uppercase tracking-widest mt-1">
                <span className="text-zinc-muted">{durationDays} {durationDays === 1 ? 'day' : 'days'}</span>
                <span className="text-warning">{Math.round((durationDays / 30) * 100)}%</span>
              </div>
              {errors.endTime ? (
                <p className="text-[13px] text-danger font-medium pt-2">{errors.endTime}</p>
              ) : null}
            </div>
          </>
        ) : (
          /* Manual mode: pick exact end date */
          <AmberDatePicker
            label={t('auction.form.temporal_end')}
            value={endTime}
            onChange={onEndTimeChange}
            error={errors.endTime}
            icon={<Clock className="w-4 h-4" />}
          />
        )}
      </div>
    </Card>
  );
};
