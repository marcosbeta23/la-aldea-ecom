// Sentry Server Configuration for La Aldea E-Commerce

import * as Sentry from '@sentry/nextjs';

const PII_KEY_PATTERN = /(email|phone|telefono|name|nombre|customer|client)/i;

function redactPII<T>(input: T): T {
  if (Array.isArray(input)) {
    return input.map((item) => redactPII(item)) as T;
  }

  if (input && typeof input === 'object') {
    const clone: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(input as Record<string, unknown>)) {
      if (PII_KEY_PATTERN.test(key)) {
        clone[key] = '[REDACTED]';
      } else {
        clone[key] = redactPII(value);
      }
    }
    return clone as T;
  }

  return input;
}

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

  beforeSend(event) {
    if (event.user) {
      event.user.email = '[REDACTED]';
      event.user.username = '[REDACTED]';
      event.user.ip_address = '[REDACTED]';
      event.user.id = '[REDACTED]';
    }

    if (event.request?.headers) {
      const headers = event.request.headers as Record<string, unknown>;
      if ('authorization' in headers) headers.authorization = '[REDACTED]';
      if ('cookie' in headers) headers.cookie = '[REDACTED]';
      if ('x-forwarded-for' in headers) headers['x-forwarded-for'] = '[REDACTED]';
      if ('x-real-ip' in headers) headers['x-real-ip'] = '[REDACTED]';
    }

    if (event.extra) event.extra = redactPII(event.extra);
    if (event.contexts) event.contexts = redactPII(event.contexts);
    if (event.tags) event.tags = redactPII(event.tags);

    return event;
  },
});
