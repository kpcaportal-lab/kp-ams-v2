import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Protected routes require authentication
const protectedRoutes = ['/dashboard', '/clients', '/proposals', '/assignments', '/billing', '/organization'];

export function middleware(request: NextRequest) {
  const token = request.cookies.get('kp_token')?.value;
  const { pathname } = request.nextUrl;

  // Redirect authenticated users away from login
  if (pathname === '/login' && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Check if route is protected
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));

  if (isProtectedRoute && !token) {
    const url = new URL('/login', request.url);
    url.searchParams.set('callbackUrl', encodeURI(pathname));
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
