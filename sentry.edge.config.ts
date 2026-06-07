// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from '@sentry/nextjs';
import {
  dropSentryExampleTestEvents,
  sentryExampleIgnoreErrors,
} from './sentryExampleFilters';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  tracesSampleRate: process.env.NODE_ENV === 'development' ? 1 : 0.1,

  enableLogs: true,

  sendDefaultPii: false,

  ignoreErrors: sentryExampleIgnoreErrors,
  beforeSend: dropSentryExampleTestEvents,
});
