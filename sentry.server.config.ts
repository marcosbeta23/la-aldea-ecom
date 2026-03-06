// Sentry Server Configuration for La Aldea E-Commerce

import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN,
  
  // Enable logs
  enableLogs: true,
  
  // Performance monitoring (lower rate for server)
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  
  // Environment
  environment: process.env.NODE_ENV,
  
  // Release tracking
  release: process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA,
  
  // Additional server-side settings
  profilesSampleRate: 0.1,
  
  // Ignore certain errors
  ignoreErrors: [
    'Unauthorized',
    'Session expired',
    'NEXT_NOT_FOUND',
    'NEXT_REDIRECT',
  ],
});
