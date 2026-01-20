// proxy.ts - Security and route protection (Next.js 16+ convention)
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  // 1. CSRF Protection for API routes
  if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(request.method)) {
    // Excepciones: webhooks externos que no tienen origin header
    const isWebhook = request.nextUrl.pathname.startsWith('/api/webhooks/');
    
    if (!isWebhook) {
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
