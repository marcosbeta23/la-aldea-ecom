// This file configures the initialization of Sentry on the client.
// The added config here will be used whenever a users loads a page in their browser.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Use tunnel to avoid ad blockers
  tunnel: "/api/sentry-tunnel",

  // Define how likely traces are sampled. Adjust this value in production, or use tracesSampler for greater control.
  tracesSampleRate: 0.05,
  // Enable logs to be sent to Sentry
  enableLogs: true,

  // Define how likely Replay events are sampled.
  replaysSessionSampleRate: 0.1,

  // Define how likely Replay events are sampled when an error occurs.
  replaysOnErrorSampleRate: 1.0,

  // Enable sending user PII (Personally Identifiable Information)
  sendDefaultPii: false,
});

// Lazy-load Replay only after page is interactive
if (typeof window !== 'undefined') {
  window.addEventListener('load', () => {
    setTimeout(async () => {
      const { replayIntegration } = await import('@sentry/nextjs');
      Sentry.addIntegration(replayIntegration());
    }, 5000); // 5s after load
  });
}

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
