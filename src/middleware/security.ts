import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

export function securityMiddleware(request: NextRequest): NextResponse {
  // Allow only safe methods for non-API routes if needed (example policy)
  const unsafeMethods: Set<string> = new Set(['TRACE', 'TRACK']);
  if (unsafeMethods.has(request.method.toUpperCase())) {
    return new NextResponse('Method Not Allowed', { status: 405 });
  }

  const response = NextResponse.next();

  // Set common security headers (adjust per requirements)
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'SAMEORIGIN');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

  // Basic CSP (can be tightened later)
  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob:",
    "connect-src 'self' https:" ,
    "font-src 'self' data:",
    "frame-ancestors 'self'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join('; ');
  response.headers.set('Content-Security-Policy', csp);

  return response;
}

