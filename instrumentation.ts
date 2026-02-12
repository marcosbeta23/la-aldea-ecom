// Next.js Instrumentation for Sentry
// This file initializes Sentry for both server and edge runtimes

import * as Sentry from '@sentry/nextjs';

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    await import('./sentry.server.config');
  }

  if (process.env.NEXT_RUNTIME === 'edge') {
    await import('./sentry.edge.config');
  }
}

// This is called when an error happens in a Server Component
export const onRequestError = Sentry.captureRequestError;
