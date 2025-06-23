import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Paths that don't require authentication
const publicPaths = [
  '/',
  '/login',
  '/sign-up',
  '/forgot-password',
  '/reset-password',
  '/about',
  '/contact-us',
  '/services',
  '/blog',
  '/careers'
]

// Paths that don't require email verification
const noVerificationPaths = [
  '/auth/verify-email',
  '/login',
  '/sign-up',
  '/forgot-password',
  '/reset-password'
]

// Helper function to get auth token from custom auth system
function getAuthToken(request: NextRequest): string | null {
  // Check for token in Authorization header
  const authHeader = request.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  
  // Check for token in cookies (if stored there)
  const tokenCookie = request.cookies.get('auth_token');
  if (tokenCookie) {
    return tokenCookie.value;
  }
  
  return null;
}

// Helper function to decode JWT token (basic decode without verification)
function decodeToken(token: string): any {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload;
  } catch (error) {
    return null;
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const authSession = request.cookies.get('auth_session')?.value;
  
  // Allow public paths without authentication
  if (publicPaths.some(path => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // If no session, redirect to login
  if (!authSession) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  try {
    // Parse the session to check email verification status
    const session = JSON.parse(authSession);
    const isEmailVerified = session?.user?.isEmailVerified;

    // If email is not verified and not on a verification-exempt path,
    // redirect to verification page with email
    if (!isEmailVerified && !noVerificationPaths.some(path => pathname.startsWith(path))) {
      const verifyUrl = new URL('/auth/verify-email', request.url);
      verifyUrl.searchParams.set('email', session?.user?.email || '');
      return NextResponse.redirect(verifyUrl);
    }

    return NextResponse.next();
  } catch (error) {
    // If session is invalid, clear it and redirect to login
    const response = NextResponse.redirect(new URL('/login', request.url));
    response.cookies.delete('auth_session');
    return response;
  }
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
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
};

