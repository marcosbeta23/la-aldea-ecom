// middleware.ts - Security and route protection
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // 1. CSRF Protection for API routes
  if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(request.method)) {
    // Excepciones: webhooks y sentry tunnel
    const isWebhook = request.nextUrl.pathname.startsWith('/api/webhooks/');
    const isSentryTunnel = request.nextUrl.pathname === '/api/sentry-tunnel';
    
    if (!isWebhook && !isSentryTunnel) {
      // Verificar que request venga del mismo origen
      const origin = request.headers.get('origin');
      const host = request.headers.get('host');
      
      // Si hay origin header y NO coincide con nuestro host
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

  // 2. Admin panel protection
  if (request.nextUrl.pathname.startsWith('/admin')) {
    // Skip login page
    if (request.nextUrl.pathname === '/admin/login') {
      return NextResponse.next();
    }
    
    const adminToken = request.cookies.get('admin_token');
    
    // Check if token matches secret
    if (!adminToken || adminToken.value !== process.env.ADMIN_SESSION_SECRET) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }

  // 3. Security headers (CSP is in next.config.ts)
  const response = NextResponse.next();
  
  // Prevent clickjacking
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
