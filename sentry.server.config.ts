// Sentry Server Configuration for La Aldea E-Commerce

import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: "https://4b4aa76cb525cd257eb3045b695719ce@o4510870980657152.ingest.us.sentry.io/4510870986031104",
  
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
