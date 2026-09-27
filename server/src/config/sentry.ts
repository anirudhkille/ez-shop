import * as Sentry from "@sentry/node";

import { env } from "./env.config";

export const sentryEnabled = Boolean(env.SENTRY_DSN) && env.NODE_ENV !== "test";

if (sentryEnabled) {
  Sentry.init({
    dsn: env.SENTRY_DSN,
    environment: env.SENTRY_ENVIRONMENT ?? env.NODE_ENV,
    release: env.SENTRY_RELEASE,
    tracesSampleRate: env.SENTRY_TRACES_SAMPLE_RATE,
  });
}

export { Sentry };

export const flushSentry = (timeout = 2000) => Sentry.flush(timeout);
