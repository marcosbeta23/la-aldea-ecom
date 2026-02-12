# Sentry Setup Guide for La Aldea E-Commerce

## Quick Setup

### 1. Create Sentry Account & Project

1. Go to [sentry.io](https://sentry.io) and create a free account
2. Create a new project:
   - Platform: **Next.js**
   - Name: `la-aldea-ecom`
3. Copy your DSN (looks like: `https://xxxxx@xxx.ingest.sentry.io/xxxxx`)

### 2. Add Environment Variables

Add to `.env.local` (development) and Vercel (production):

```bash
# Sentry DSN
SENTRY_DSN=https://your-dsn@xxx.ingest.sentry.io/xxxxx
NEXT_PUBLIC_SENTRY_DSN=https://your-dsn@xxx.ingest.sentry.io/xxxxx

# Sentry Auth Token (for source maps - optional but recommended)
SENTRY_AUTH_TOKEN=your-auth-token

# Sentry Org and Project (for source maps)
SENTRY_ORG=your-org-slug
SENTRY_PROJECT=la-aldea-ecom
```

### 3. Install Sentry SDK

```bash
pnpm add @sentry/nextjs
```

### 4. Files Already Created

The following files have been created:

- `sentry.client.config.ts` - Browser/client-side configuration
- `sentry.server.config.ts` - Server-side configuration  
- `sentry.edge.config.ts` - Edge runtime configuration
- `instrumentation.ts` - Next.js instrumentation hook
- `app/global-error.tsx` - Global error boundary

### 5. Update next.config.ts (Optional)

For source maps and better error tracking, wrap your config:

```typescript
import { withSentryConfig } from '@sentry/nextjs';

const nextConfig = {
  // your existing config
};

export default withSentryConfig(nextConfig, {
  // Sentry options
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  
  // Only upload source maps in production
  silent: true,
  
  // Hide source maps from client bundles
  hideSourceMaps: true,
  
  // Automatically tree-shake Sentry logger
  disableLogger: true,
});
```

## Features Configured

### Error Tracking
- Automatic capture of unhandled exceptions
- Server-side and client-side errors
- API route errors
- React Server Component errors

### Performance Monitoring
- Production: 20% of transactions sampled
- Development: 100% (for testing)

### Session Replay (Production Only)
- 10% of sessions recorded normally
- 100% of sessions with errors recorded

### Filtered Errors
The following are automatically filtered out:
- Browser extension errors
- ResizeObserver warnings
- Network failures (expected)
- 404 errors
- Authentication errors (expected)

## Verifying Setup

### Test Error Capture

Add this temporary code to test:

```typescript
// In any component or page
<button onClick={() => {
  throw new Error('Sentry Test Error');
}}>
  Test Sentry
</button>
```

Or in an API route:
```typescript
throw new Error('Sentry API Test Error');
```

Then check your Sentry dashboard to see the error.

## Dashboard Access

1. Go to [sentry.io](https://sentry.io)
2. Select your project
3. View:
   - **Issues** - All captured errors
   - **Performance** - Transaction traces
   - **Releases** - Track errors by deployment
   - **Replays** - Session recordings

## Alerts Setup (Recommended)

In Sentry dashboard:
1. Go to Alerts
2. Create alert rules for:
   - New issues (immediate notification)
   - High error rate (>10 errors/hour)
   - Performance degradation

## Cost Considerations

Sentry free tier includes:
- 5,000 errors/month
- 10,000 performance transactions/month
- 50 session replays/month

The configured sample rates keep you well within free tier limits.

## Troubleshooting

### Errors not appearing?
1. Check DSN is correctly set
2. Verify `NODE_ENV=production` (errors filtered in dev)
3. Check browser console for Sentry initialization

### Source maps not working?
1. Verify `SENTRY_AUTH_TOKEN` is set
2. Check Sentry project settings match

### Performance traces missing?
1. Increase `tracesSampleRate` temporarily
2. Verify API routes are being called
