// proxy.ts - Clerk Auth + Security middleware
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

// Routes that require Clerk authentication
const isAdminRoute = createRouteMatcher(['/admin(.*)', '/api/admin(.*)']);
// Admin login is public (Clerk renders its SignIn component there)
const isAdminLogin = createRouteMatcher(['/admin/login']);

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
  }

  // 3. Security headers are defined in next.config.ts — no need to duplicate here.
  const response = NextResponse.next();

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
