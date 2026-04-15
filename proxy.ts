// proxy.ts - Clerk Auth + Security middleware
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

// Routes that require Clerk authentication
const isAdminRoute = createRouteMatcher(['/admin(.*)', '/api/admin(.*)']);
// Admin login is public (Clerk renders its SignIn component there)
const isAdminLogin = createRouteMatcher(['/admin/login']);

// External script origins shared between dev and prod CSP
const SCRIPT_ORIGINS = [
  'https://www.googletagmanager.com',
  'https://www.google-analytics.com',
  'https://sdk.mercadopago.com',
  'https://browser.sentry-cdn.com',
  'https://*.sentry.io',
  'https://*.clerk.accounts.dev',
  'https://*.clerk.com',
  'https://us.i.posthog.com',
  'https://clerk.laaldeatala.com.uy',
].join(' ');

function buildCsp(nonce: string): string {
  const isDev = process.env.NODE_ENV !== 'production';

  const scriptSrc = isDev
    ? `script-src 'self' 'unsafe-eval' 'unsafe-inline' ${SCRIPT_ORIGINS}`
    : `script-src 'self' 'nonce-${nonce}' 'strict-dynamic' ${SCRIPT_ORIGINS}`;

  return [
    "default-src 'self'",
    scriptSrc,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https: blob:",
    "font-src 'self' data:",
    "connect-src 'self' https://api.mercadopago.com https://*.supabase.co https://*.ingest.sentry.io https://*.ingest.us.sentry.io https://*.sentry.io https://browser.sentry-cdn.com https://www.google-analytics.com https://google-analytics.com https://*.google-analytics.com https://analytics.google.com https://stats.g.doubleclick.net https://www.googletagmanager.com https://*.clerk.accounts.dev https://*.clerk.com https://api.clerk.com https://clerk.laaldeatala.com.uy https://us.i.posthog.com https://cloudflareinsights.com",
    "worker-src 'self' blob:",
    "frame-src 'self' https://www.google.com https://maps.google.com https://www.mercadopago.com https://*.clerk.accounts.dev https://*.clerk.com",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'self'",
  ].join('; ');
}

export default clerkMiddleware(async (auth, request) => {
  // 1. CSRF Protection for API routes
  if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(request.method)) {
    const isWebhook = request.nextUrl.pathname.startsWith('/api/webhooks/');
    const isSentryTunnel = request.nextUrl.pathname === '/api/sentry-tunnel';
    const isCron = request.nextUrl.pathname.startsWith('/api/cron/');
    const isInngest = request.nextUrl.pathname === '/api/inngest';

    if (!isWebhook && !isSentryTunnel && !isCron && !isInngest) {
      const origin = request.headers.get('origin');
      const host = request.headers.get('host');

      if (origin && !origin.includes(host!)) {
        console.error('CSRF attempt detected:', {
          origin,
          host,
          path: request.nextUrl.pathname,
          method: request.method
        });

        return NextResponse.json(
          { error: 'Forbidden - Invalid origin' },
          { status: 403 }
        );
      }
    }
  }

  // 2. Protect admin routes with Clerk (except login page)
  if (isAdminRoute(request) && !isAdminLogin(request)) {
    await auth.protect();

    const { sessionClaims } = await auth();
    const role = (sessionClaims?.metadata as { role?: string })?.role;

    // Require explicit admin role for ALL admin routes.
    if (role !== 'owner' && role !== 'staff') {
      console.warn('Admin access denied: missing admin role', {
        path: request.nextUrl.pathname,
        method: request.method,
      });

      if (request.nextUrl.pathname.startsWith('/api/')) {
        return NextResponse.json(
          { error: 'Acceso restringido al panel de administración' },
          { status: 403 }
        );
      }
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }

    // 3. Role-based route protection for owner-only admin pages
    const ownerOnlyRoutes = createRouteMatcher([
      '/admin/analytics(.*)',
      '/admin/customers(.*)',
      '/admin/search-analytics(.*)',
      '/admin/reviews(.*)',
      '/admin/partners(.*)',
      '/admin/guides(.*)',
      '/admin/reports(.*)',
      '/api/admin/analytics(.*)',
      '/api/admin/customers(.*)',
      '/api/admin/search-analytics(.*)',
      '/api/admin/reviews(.*)',
      '/api/admin/partners(.*)',
      '/api/admin/guides(.*)',
      '/api/admin/reports(.*)',
    ]);

    if (ownerOnlyRoutes(request)) {
      if (role !== 'owner') {
        console.warn('Admin access denied: owner-only route', {
          path: request.nextUrl.pathname,
          method: request.method,
        });

        // For API routes return 403, for page routes redirect to dashboard
        if (request.nextUrl.pathname.startsWith('/api/')) {
          return NextResponse.json(
            { error: 'Acceso restringido al propietario' },
            { status: 403 }
          );
        }
        return NextResponse.redirect(new URL('/admin', request.url));
      }
    }
  }

  // 3. Generate a per-request nonce and set CSP header
  // Edge Runtime: use Web Crypto API (no Buffer/Node.js APIs available)
  const nonce = btoa(crypto.randomUUID());

  // Forward nonce to Server Components via request header
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-nonce', nonce);

  const response = NextResponse.next({ request: { headers: requestHeaders } });
  response.headers.set('Content-Security-Policy', buildCsp(nonce));

  return response;
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
