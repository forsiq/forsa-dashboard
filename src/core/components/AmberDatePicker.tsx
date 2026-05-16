import React, { useState, useRef, useEffect, useLayoutEffect, useCallback, useMemo } from 'react';
import { Calendar, ChevronLeft, ChevronRight, Clock, X } from 'lucide-react';
import { useLanguage } from '@core/contexts/LanguageContext';
import { cn } from '@core/lib/utils/cn';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export type AmberDatePickerProps = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  'type' | 'value' | 'onChange'
> & {
  label?: string;
  /** Shown inline after the label (e.g. help icon + popover) */
  labelEndSlot?: React.ReactNode;
  error?: string;
  value: string; // "YYYY-MM-DDTHH:mm"
  onChange: (value: string) => void;
  showTime?: boolean;
  min?: string;
  max?: string;
  icon?: React.ReactNode;
};

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

const MONTH_NAMES_AR = [
  'كانون الثاني', 'شباط', 'آذار', 'نيسان', 'أيار', 'حزيران',
  'تموز', 'آب', 'أيلول', 'تشرين الأول', 'تشرين الثاني', 'كانون الأول',
];
const MONTH_NAMES_EN = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];
const DAY_NAMES_AR = ['أحد', 'إثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة', 'سبت'];
const DAY_NAMES_EN = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function pad(n: number) { return n.toString().padStart(2, '0'); }

function toDateParts(value: string) {
  if (!value) return null;
  const d = new Date(value);
  if (isNaN(d.getTime())) return null;
  return {
    year: d.getFullYear(),
    month: d.getMonth(), // 0-based
    day: d.getDate(),
    hour: d.getHours(),
    minute: d.getMinutes(),
  };
}

function toDateString(year: number, month: number, day: number, hour: number, minute: number) {
  return `${year}-${pad(month + 1)}-${pad(day)}T${pad(hour)}:${pad(minute)}`;
}

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfWeek(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

/** Estimated popover height before first layout measure (calendar + time + footer). */
const POPOVER_HEIGHT_ESTIMATE = 335;
const POPOVER_FLIP_MARGIN = 8;

function shouldOpenPopoverAbove(
  triggerRect: DOMRect,
  popoverHeight: number
): boolean {
  const spaceBelow = window.innerHeight - triggerRect.bottom;
  const spaceAbove = triggerRect.top;
  return (
    spaceBelow < popoverHeight + POPOVER_FLIP_MARGIN &&
    spaceAbove > spaceBelow
  );
}

/* ------------------------------------------------------------------ */
/*  Calendar Grid                                                      */
/* ------------------------------------------------------------------ */

interface CalendarGridProps {
  viewYear: number;
  viewMonth: number;
  selectedYear?: number;
  selectedMonth?: number;
  selectedDay?: number;
  minDate?: Date | null;
  maxDate?: Date | null;
  isRTL: boolean;
  language: string;
  onSelect: (year: number, month: number, day: number) => void;
  onPrevMonth: () => void;
  onNextMonth: () => void;
}

const CalendarGrid: React.FC<CalendarGridProps> = ({
  viewYear, viewMonth,
  selectedYear, selectedMonth, selectedDay,
  minDate, maxDate,
  isRTL, language,
  onSelect, onPrevMonth, onNextMonth,
}) => {
  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDay = getFirstDayOfWeek(viewYear, viewMonth);
  const dayNames = language === 'ar' ? DAY_NAMES_AR : DAY_NAMES_EN;
  const monthNames = language === 'ar' ? MONTH_NAMES_AR : MONTH_NAMES_EN;
  const today = new Date();
  const isToday = (d: number) =>
    d === today.getDate() && viewMonth === today.getMonth() && viewYear === today.getFullYear();

  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  const isSelected = (d: number) =>
    d === selectedDay && viewMonth === selectedMonth && viewYear === selectedYear;

  const isDisabled = (d: number) => {
    const cellDate = new Date(viewYear, viewMonth, d);
    if (minDate && cellDate < minDate) return true;
    if (maxDate && cellDate > maxDate) return true;
    return false;
  };

  return (
    <div className="select-none">
      {/* Header: month/year + navigation */}
      <div className="flex items-center justify-between mb-3 px-1">
        <button
          type="button"
          onClick={onPrevMonth}
          className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-obsidian-hover transition-colors text-zinc-muted hover:text-zinc-text"
        >
          {isRTL ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
        <span className="text-sm font-black text-zinc-text uppercase tracking-wide">
          {monthNames[viewMonth]} {viewYear}
        </span>
        <button
          type="button"
          onClick={onNextMonth}
          className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-obsidian-hover transition-colors text-zinc-muted hover:text-zinc-text"
        >
          {isRTL ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </button>
      </div>

      {/* Day names */}
      <div className="grid grid-cols-7 gap-0.5 mb-1">
        {dayNames.map((name, i) => (
          <div
            key={i}
            className="h-8 flex items-center justify-center text-[10px] font-black text-zinc-muted/60 uppercase tracking-widest"
          >
            {name}
          </div>
        ))}
      </div>

      {/* Day cells */}
      <div className="grid grid-cols-7 gap-0.5">
        {cells.map((day, i) => (
          <button
            key={i}
            type="button"
            disabled={day === null || isDisabled(day)}
            onClick={() => day && !isDisabled(day) && onSelect(viewYear, viewMonth, day)}
            className={cn(
              'h-9 rounded-lg flex items-center justify-center text-sm font-bold transition-all duration-150',
              day === null && 'pointer-events-none',
              day !== null && !isSelected(day!) && !isToday(day!) && !isDisabled(day!) &&
                'text-zinc-text hover:bg-brand/10 hover:text-brand',
              day !== null && isToday(day!) && !isSelected(day!) &&
                'text-brand font-black ring-1 ring-brand/20',
              day !== null && isSelected(day!) &&
                'bg-brand text-black font-black shadow-md shadow-brand/20',
              day !== null && isDisabled(day!) &&
                'text-zinc-muted/30 cursor-not-allowed'
            )}
          >
            {day}
          </button>
        ))}
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/*  Time Picker                                                        */
/* ------------------------------------------------------------------ */

interface TimePickerProps {
  hour: number;
  minute: number;
  onChange: (hour: number, minute: number) => void;
  isRTL: boolean;
  language: string;
}

const TimePicker: React.FC<TimePickerProps> = ({ hour, minute, onChange, isRTL, language }) => {
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const minutes = Array.from({ length: 60 }, (_, i) => i);

  const labelHour = language === 'ar' ? 'الساعة' : 'Hour';
  const labelMinute = language === 'ar' ? 'الدقيقة' : 'Min';

  return (
    <div className="flex items-center gap-3 pt-3 border-t border-white/[0.05] mt-3">
      <Clock className="w-4 h-4 text-zinc-muted shrink-0" />
      <div className="flex items-center gap-2 flex-1">
        <div className="flex-1">
          <label className="block text-[9px] font-black text-zinc-muted/60 uppercase tracking-widest mb-1">
            {labelHour}
          </label>
          <select
            value={hour}
            onChange={(e) => onChange(Number(e.target.value), minute)}
            className="w-full h-9 rounded-lg bg-obsidian-hover border border-white/[0.05] text-sm text-zinc-text font-bold px-2 focus:outline-none focus:border-brand/40 transition-colors appearance-none cursor-pointer text-center"
          >
            {hours.map((h) => (
              <option key={h} value={h}>{pad(h)}</option>
            ))}
          </select>
        </div>
        <span className="text-lg font-black text-zinc-muted/40 mt-4">:</span>
        <div className="flex-1">
          <label className="block text-[9px] font-black text-zinc-muted/60 uppercase tracking-widest mb-1">
            {labelMinute}
          </label>
          <select
            value={minute}
            onChange={(e) => onChange(hour, Number(e.target.value))}
            className="w-full h-9 rounded-lg bg-obsidian-hover border border-white/[0.05] text-sm text-zinc-text font-bold px-2 focus:outline-none focus:border-brand/40 transition-colors appearance-none cursor-pointer text-center"
          >
            {minutes.map((m) => (
              <option key={m} value={m}>{pad(m)}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/*  Main Component                                                     */
/* ------------------------------------------------------------------ */

export const AmberDatePicker = React.forwardRef<HTMLInputElement, AmberDatePickerProps>(
  (
    {
      label, labelEndSlot, error, className, value, onChange, showTime = true,
      min, max, required, disabled, placeholder, icon, ...rest
    },
    ref
  ) => {
    const { dir, isRTL, language, t } = useLanguage();
    const [isOpen, setIsOpen] = useState(false);
    const [openAbove, setOpenAbove] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const triggerRef = useRef<HTMLDivElement>(null);
    const popoverRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Parse selected date from value
    const parsed = useMemo(() => toDateParts(value), [value]);

    // Calendar view state
    const [viewYear, setViewYear] = useState(parsed?.year ?? new Date().getFullYear());
    const [viewMonth, setViewMonth] = useState(parsed?.month ?? new Date().getMonth());

    // Sync view to selected when value changes
    useEffect(() => {
      if (parsed) {
        setViewYear(parsed.year);
        setViewMonth(parsed.month);
      }
    }, [parsed]);

    const updatePopoverPlacement = useCallback(() => {
      const trigger = triggerRef.current;
      if (!trigger) return;
      const triggerRect = trigger.getBoundingClientRect();
      const popoverHeight =
        popoverRef.current?.offsetHeight ?? POPOVER_HEIGHT_ESTIMATE;
      setOpenAbove(shouldOpenPopoverAbove(triggerRect, popoverHeight));
    }, []);

    // Refine vertical placement after popover mounts (actual height)
    useLayoutEffect(() => {
      if (!isOpen) return;
      updatePopoverPlacement();
    }, [isOpen, showTime, parsed, updatePopoverPlacement]);

    const handleToggleOpen = useCallback(() => {
      if (disabled) return;
      setIsOpen((wasOpen) => {
        if (wasOpen) return false;
        const trigger = triggerRef.current;
        if (trigger) {
          const triggerRect = trigger.getBoundingClientRect();
          setOpenAbove(
            shouldOpenPopoverAbove(triggerRect, POPOVER_HEIGHT_ESTIMATE)
          );
        }
        return true;
      });
    }, [disabled]);

    // Close on outside click
    useEffect(() => {
      const handleClick = (e: MouseEvent) => {
        if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
          setIsOpen(false);
        }
      };
      if (isOpen) {
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
      }
    }, [isOpen]);

    // Close on Escape
    useEffect(() => {
      const handleKey = (e: KeyboardEvent) => {
        if (e.key === 'Escape') setIsOpen(false);
      };
      if (isOpen) {
        document.addEventListener('keydown', handleKey);
        return () => document.removeEventListener('keydown', handleKey);
      }
    }, [isOpen]);

    const minDate = min ? new Date(min) : null;
    const maxDate = max ? new Date(max) : null;

    const handleSelectDate = useCallback(
      (year: number, month: number, day: number) => {
        const h = parsed?.hour ?? new Date().getHours();
        const m = parsed?.minute ?? 0;
        onChange(toDateString(year, month, day, h, m));
      },
      [parsed, onChange]
    );

    const handleSelectTime = useCallback(
      (hour: number, minute: number) => {
        if (!parsed) return;
        onChange(toDateString(parsed.year, parsed.month, parsed.day, hour, minute));
      },
      [parsed, onChange]
    );

    const handlePrevMonth = () => {
      if (viewMonth === 0) {
        setViewMonth(11);
        setViewYear((y) => y - 1);
      } else {
        setViewMonth((m) => m - 1);
      }
    };

    const handleNextMonth = () => {
      if (viewMonth === 11) {
        setViewMonth(0);
        setViewYear((y) => y + 1);
      } else {
        setViewMonth((m) => m + 1);
      }
    };

    const handleClear = (e: React.SyntheticEvent) => {
      e.stopPropagation();
      onChange('');
      setIsOpen(false);
    };

    // Display value
    const displayValue = useMemo(() => {
      if (!parsed) return '';
      const d = new Date(parsed.year, parsed.month, parsed.day, parsed.hour, parsed.minute);
      const locale = language === 'ar' ? 'ar-IQ' : 'en-US';
      if (showTime) {
        return d.toLocaleString(locale, {
          year: 'numeric', month: 'short', day: 'numeric',
          hour: '2-digit', minute: '2-digit',
        });
      }
      return d.toLocaleDateString(locale, {
        year: 'numeric', month: 'short', day: 'numeric',
      });
    }, [parsed, showTime, language]);

    const placeholderText = placeholder ||
      (language === 'ar'
        ? (showTime ? 'اختر التاريخ والوقت' : 'اختر التاريخ')
        : (showTime ? 'Select date & time' : 'Select date'));

    return (
      <div
        className={cn('amber-datetime-local space-y-1.5 w-full', className)}
        dir={dir}
        ref={containerRef}
      >
        {label && (
          <label
            className={cn(
              'text-xs font-bold uppercase tracking-[0.15em] px-1 flex justify-between transition-colors',
              error ? 'text-danger' : 'text-zinc-muted/90 dark:text-zinc-muted/80'
            )}
          >
            <span className="inline-flex items-center gap-1.5">
              {label}
              {required ? <span className="text-brand ml-0.5">*</span> : null}
              {labelEndSlot}
            </span>
            {error ? <span className="normal-case opacity-90 text-[10px]">{error}</span> : null}
          </label>
        )}

        <div ref={triggerRef} className="relative group">
          {/* Trigger: open picker (clear is a separate sibling button — avoids invalid nested buttons) */}
          <button
            type="button"
            disabled={disabled}
            onClick={handleToggleOpen}
            className={cn(
              'w-full h-14 rounded-xl border text-base font-medium text-left outline-none transition-all shadow-sm tabular-nums',
              'bg-white dark:bg-obsidian-card',
              'focus:outline-none focus:border-brand/40 dark:focus:bg-obsidian-hover',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              'flex items-center gap-3',
              error
                ? 'border-danger focus:border-danger bg-danger/[0.03]'
                : 'border-zinc-200 dark:border-white/5',
              icon ? (isRTL ? 'pr-11 pl-4' : 'pl-11 pr-4') : 'px-4',
              value ? (isRTL ? 'pl-12' : 'pr-12') : ''
            )}
            dir="ltr"
          >
            {icon && (
              <div
                className={cn(
                  'absolute top-1/2 -translate-y-1/2 z-10 pointer-events-none transition-colors',
                  isRTL ? 'right-4' : 'left-4',
                  error ? 'text-danger' : 'text-zinc-muted dark:text-zinc-muted group-focus-within:text-brand'
                )}
              >
                {icon}
              </div>
            )}
            <span
              className={cn(
                'flex-1 truncate',
                displayValue ? 'text-zinc-text dark:text-zinc-text' : 'text-zinc-muted/40'
              )}
            >
              {displayValue || placeholderText}
            </span>
          </button>
          {value && !disabled && (
            <button
              type="button"
              onClick={handleClear}
              className={cn(
                'absolute top-1/2 -translate-y-1/2 z-20 p-1.5 rounded-md hover:bg-white/10 text-zinc-muted hover:text-danger transition-colors',
                isRTL ? 'left-2' : 'right-2'
              )}
              aria-label="Clear"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Hidden input for form compatibility */}
          <input
            ref={ref}
            type="hidden"
            value={value}
            readOnly
            {...rest}
          />

          {/* Dropdown */}
          {isOpen && (
            <div
              ref={popoverRef}
              className={cn(
                'absolute z-50 rounded-2xl border border-white/[0.08] shadow-2xl shadow-black/30',
                'bg-white dark:bg-obsidian-card p-4',
                'animate-in fade-in duration-200',
                openAbove
                  ? 'bottom-full mb-2 slide-in-from-bottom-2'
                  : 'top-full mt-2 slide-in-from-top-2',
                isRTL ? 'right-0' : 'left-0',
                'w-[320px]'
              )}
            >
              <CalendarGrid
                viewYear={viewYear}
                viewMonth={viewMonth}
                selectedYear={parsed?.year}
                selectedMonth={parsed?.month}
                selectedDay={parsed?.day}
                minDate={minDate}
                maxDate={maxDate}
                isRTL={isRTL}
                language={language}
                onSelect={handleSelectDate}
                onPrevMonth={handlePrevMonth}
                onNextMonth={handleNextMonth}
              />
              {showTime && parsed && (
                <TimePicker
                  hour={parsed.hour}
                  minute={parsed.minute}
                  onChange={handleSelectTime}
                  isRTL={isRTL}
                  language={language}
                />
              )}

              {/* Quick action: Now */}
              <div className="mt-3 pt-3 border-t border-white/[0.05] flex items-center justify-between">
                <button
                  type="button"
                  className="text-[10px] font-black text-brand uppercase tracking-widest hover:text-brand/80 transition-colors"
                  onClick={() => {
                    const now = new Date();
                    onChange(toDateString(
                      now.getFullYear(), now.getMonth(), now.getDate(),
                      now.getHours(), now.getMinutes()
                    ));
                  }}
                >
                  {language === 'ar' ? 'الآن' : 'Now'}
                </button>
                <button
                  type="button"
                  className="text-[10px] font-black text-zinc-muted uppercase tracking-widest hover:text-zinc-text transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  {language === 'ar' ? 'إغلاق' : 'Close'}
                </button>
              </div>
            </div>
          )}
        </div>

        {error && !label && (
          <p className="text-xs text-danger font-medium">{error}</p>
        )}
      </div>
    );
  }
);

AmberDatePicker.displayName = 'AmberDatePicker';
