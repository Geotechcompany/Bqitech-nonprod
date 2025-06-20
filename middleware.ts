import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

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

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Skip middleware for login pages and public APIs - let them handle their own logic
  if (pathname === "/admin/login" || 
      pathname.startsWith("/admin/login/") || 
      pathname.startsWith("/api/auth/") || 
      pathname.startsWith("/api/health") ||
      pathname.startsWith("/login") ||
      pathname.startsWith("/api/admin/login")) {
    return NextResponse.next();
  }

  // Only run middleware for protected admin routes (not login)
  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    // For server-side middleware, we'll rely on the auth context in components
    // Since we can't access localStorage here, we'll let the client-side handle it
    console.log(`Middleware: Allowing access to ${pathname} - client-side auth will handle protection`);
    return NextResponse.next();
  }

  // For dashboard routes, also let client-side handle it
  if (pathname.startsWith("/dashboard")) {
    console.log(`Middleware: Allowing access to ${pathname} - client-side auth will handle protection`);
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/dashboard/:path*"]
};

