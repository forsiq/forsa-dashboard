// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from '@sentry/nextjs';
import {
  dropSentryExampleTestEvents,
  sentryExampleIgnoreErrors,
} from './sentryExampleFilters';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  tracesSampleRate: 0.1,

  enableLogs: true,

  sendDefaultPii: false,

  ignoreErrors: sentryExampleIgnoreErrors,
  beforeSend: dropSentryExampleTestEvents,
});
