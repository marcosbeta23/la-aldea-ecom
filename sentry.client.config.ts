// Sentry Configuration for La Aldea E-Commerce
// This file is imported by Next.js instrumentation

import * as Sentry from '@sentry/nextjs';

const SENTRY_DSN = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN;

Sentry.init({
  dsn: SENTRY_DSN,
  
  // Performance monitoring
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.2 : 1.0,
  
  // Session replay (only in production)
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
  
  // Environment
  environment: process.env.NODE_ENV,
  
  // Release tracking
  release: process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA,
  
  // Ignore certain errors
  ignoreErrors: [
    // Browser extensions
    'top.GLOBALS',
    'originalCreateNotification',
    'canvas.contentDocument',
    'MyApp_RemoveAllHighlights',
    'http://tt.telecomitalia.it',
    'http://web.telecomitalia.it',
    'jigsaw is not defined',
    'ComboSearch is not defined',
    'atomicFindClose',
    'fb_xd_fragment',
    'bmi_SafeAddOnload',
    'EBCallBackMessageReceived',
    'conduitPage',
    
    // Common non-actionable errors
    'ResizeObserver loop limit exceeded',
    'ResizeObserver loop completed with undelivered notifications',
    'Network request failed',
    'Failed to fetch',
    'Load failed',
    'ChunkLoadError',
    
    // Authentication related (expected)
    'Unauthorized',
    'Session expired',
  ],
  
  // Filter out noisy transactions
  beforeSend(event, hint) {
    // Don't send errors from development
    if (process.env.NODE_ENV !== 'production') {
      return null;
    }
    
    // Filter out 404s
    if (event.exception?.values?.[0]?.value?.includes('404')) {
      return null;
    }
    
    return event;
  },
  
  // Integrations
  integrations: [
    Sentry.replayIntegration({
      // Only capture errors in replay
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],
});
