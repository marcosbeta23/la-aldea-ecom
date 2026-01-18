// proxy.ts - Security and route protection (Next.js 16+ convention)
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  // 1. Rate limiting for API routes
  if (request.nextUrl.pathname.startsWith('/api/')) {
    // Simple IP-based rate limiting
    const ip = request.headers.get('x-forwarded-for') ?? request.headers.get('x-real-ip') ?? 'unknown';
    
    // TODO: Implement actual rate limiting with Vercel KV or Redis
    // For now, just log suspicious activity
    console.log(`API request from ${ip} to ${request.nextUrl.pathname}`);
  }

  // 2. Admin panel protection
  if (request.nextUrl.pathname.startsWith('/admin')) {
    const adminPassword = request.cookies.get('admin-session');
    
    if (!adminPassword) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }

  // 3. Security headers
  const response = NextResponse.next();
  
  // Prevent clickjacking - but allow Google Maps iframe
  response.headers.set('X-Frame-Options', 'SAMEORIGIN');
  
  // Prevent MIME type sniffing
  response.headers.set('X-Content-Type-Options', 'nosniff');
  
  // XSS Protection
  response.headers.set('X-XSS-Protection', '1; mode=block');
  
  // Strict Transport Security (HTTPS only)
  response.headers.set(
    'Strict-Transport-Security',
    'max-age=31536000; includeSubDomains'
  );
  
  // Content Security Policy - Allow Google Maps iframe
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://*.supabase.co https://api.mercadopago.com; frame-src 'self' https://www.google.com https://maps.google.com;"
  );

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
