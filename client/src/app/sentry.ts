import * as Sentry from "@sentry/react";

const dsn = import.meta.env.VITE_SENTRY_DSN;
const sampleRate = Number(import.meta.env.VITE_SENTRY_TRACES_SAMPLE_RATE ?? 0);

export const sentryEnabled = Boolean(dsn);

if (sentryEnabled) {
  Sentry.init({
    dsn,
    environment:
      import.meta.env.VITE_SENTRY_ENVIRONMENT ?? import.meta.env.MODE,
    release: import.meta.env.VITE_SENTRY_RELEASE,
    tracesSampleRate: Number.isFinite(sampleRate) ? sampleRate : 0,
    integrations: [
      ...(sampleRate > 0 ? [Sentry.browserTracingIntegration()] : []),
    ],
  });
}

export { Sentry };

export const setSentryUser = (user: { id: string } | null) => {
  if (!sentryEnabled) return;

  Sentry.setUser(user);
};
