import { formatCurrency } from '@core/lib/utils/formatCurrency';

export type MetricFormat = 'currency' | 'number' | 'percent' | 'text';

export function formatReportMetric(value: number, format: MetricFormat): string {
  switch (format) {
    case 'currency':
      return formatCurrency(value);
    case 'percent':
      return `${value}%`;
    case 'number':
      return value.toLocaleString('en-US');
    default:
      return String(value);
  }
}

export const reportPageClass =
  'space-y-6 md:space-y-8 p-3 md:p-6 max-w-[1600px] mx-auto animate-in fade-in duration-700 min-w-0';

export const reportKpiGridClass =
  'grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6 min-w-0';

export const reportChartGridClass =
  'grid grid-cols-1 xl:grid-cols-2 gap-4 md:gap-8 min-w-0';

export const reportHeaderTitleClass =
  'text-2xl sm:text-3xl lg:text-4xl font-black text-zinc-text tracking-tight leading-tight break-words';

export const reportHeaderSubtitleClass =
  'text-sm sm:text-base text-zinc-secondary font-bold leading-relaxed';

export const chartTooltipStyle = {
  backgroundColor: '#18181b',
  border: '1px solid #27272a',
  borderRadius: '12px',
};

export const chartGridStroke = 'rgba(255,255,255,0.05)';

export const chartAxisTick = { fill: '#71717a', fontSize: 10, fontWeight: 700 as const };

export const chartMargin = { top: 8, right: 12, left: 0, bottom: 8 };

/** X-axis props for category labels (Arabic/RTL-friendly). */
export function getCategoryXAxisProps(isRTL: boolean) {
  return {
    stroke: '#3f3f46',
    tick: chartAxisTick,
    tickLine: false,
    axisLine: false,
    interval: 0,
    angle: isRTL ? -30 : -20,
    textAnchor: 'end' as const,
    height: 64,
  };
}

export function getValueYAxisProps() {
  return {
    stroke: '#3f3f46',
    tick: chartAxisTick,
    tickLine: false,
    axisLine: false,
    width: 40,
    allowDecimals: false,
  };
}

/** Numeric X-axis for horizontal bar charts (integer ticks only). */
export function getIntegerXAxisProps() {
  return {
    stroke: '#3f3f46',
    tick: chartAxisTick,
    tickLine: false,
    axisLine: false,
    allowDecimals: false,
    domain: [0, 'auto'] as [number, string],
  };
}

/** Category Y-axis for horizontal bar charts. */
export function getCategoryYAxisProps(width = 72) {
  return {
    type: 'category' as const,
    tick: chartAxisTick,
    axisLine: false,
    tickLine: false,
    width,
  };
}
