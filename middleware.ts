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
  '/reset-password',
  '/logout',
  '/api'
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
  
  console.log('Middleware processing:', { pathname, hasSession: !!authSession });
  
  // Allow public paths without authentication
  if (publicPaths.some(path => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // If no session, redirect to login
  if (!authSession) {
    console.log('No auth session, redirecting to login');
    return NextResponse.redirect(new URL('/login', request.url));
  }

  try {
    // Parse the session to check email verification status
    const session = JSON.parse(authSession);
    const user = session?.user;
    const isEmailVerified = user?.isEmailVerified;

    console.log('Session data:', { 
      userEmail: user?.email, 
      isEmailVerified, 
      userRole: user?.role 
    });

    // If email is not verified and not on a verification-exempt path,
    // redirect to verification page with email
    if (!isEmailVerified && !noVerificationPaths.some(path => pathname.startsWith(path))) {
      console.log('Email not verified, redirecting to verification page');
      const verifyUrl = new URL('/auth/verify-email', request.url);
      if (user?.email) {
        verifyUrl.searchParams.set('email', user.email);
      }
      return NextResponse.redirect(verifyUrl);
    }

    // Check admin access for admin routes
    if (pathname.startsWith('/admin') && user?.role !== 'admin') {
      console.log('Non-admin user trying to access admin area');
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    return NextResponse.next();
  } catch (error) {
    console.error('Error parsing session:', error);
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

