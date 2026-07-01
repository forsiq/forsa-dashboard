import type { ErrorEvent, EventHint } from '@sentry/nextjs';

/** Known sentry-example-page / sentry-example-api test noise — keep pages, drop events. */
const SENTRY_EXAMPLE_IGNORE = [
  'TEST: Sentry connectivity check from auction2',
  'SentryExampleAPIError',
  'SentryExampleFrontendError',
];

function getErrorText(event: ErrorEvent, hint?: EventHint): string {
  const parts: string[] = [];
  if (event.message) parts.push(event.message);
  for (const ex of event.exception?.values ?? []) {
    if (ex.type) parts.push(ex.type);
    if (ex.value) parts.push(ex.value);
  }
  const original = hint?.originalException;
  if (original instanceof Error) {
    parts.push(original.name, original.message);
  } else if (typeof original === 'string') {
    parts.push(original);
  }
  return parts.join(' ');
}

export function isSentryExampleTestEvent(event: ErrorEvent, hint?: EventHint): boolean {
  const text = getErrorText(event, hint);
  return SENTRY_EXAMPLE_IGNORE.some((needle) => text.includes(needle));
}

/** Build/HMR/service-worker noise that only occurs during local development. */
const DEV_NOISE_PATTERNS = [
  'ModuleBuildError',
  'Failed to compile',
  'ENOENT',
  'SecurityError',
  'ServiceWorker',
];

export const sentryExampleIgnoreErrors = [...SENTRY_EXAMPLE_IGNORE, ...DEV_NOISE_PATTERNS];

function isLocalHost(url: string | undefined): boolean {
  if (!url) return false;
  return /localhost|127\.0\.0\.1/i.test(url);
}

function isDevNoiseEvent(event: ErrorEvent, hint?: EventHint): boolean {
  const isDev =
    process.env.NODE_ENV === 'development' ||
    event.environment === 'development' ||
    isLocalHost(event.request?.url);
  if (!isDev) return false;

  const text = getErrorText(event, hint);
  return DEV_NOISE_PATTERNS.some((pattern) => text.includes(pattern));
}

export function dropSentryExampleTestEvents(
  event: ErrorEvent,
  hint?: EventHint,
): ErrorEvent | null {
  if (isSentryExampleTestEvent(event, hint)) return null;
  if (isDevNoiseEvent(event, hint)) return null;
  return event;
}
