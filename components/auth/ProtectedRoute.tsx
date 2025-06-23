"use client";

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, ReactNode } from 'react';

interface ProtectedRouteProps {
  children: ReactNode;
  requireAdmin?: boolean;
  fallback?: ReactNode;
  redirectTo?: string;
}

export function ProtectedRoute({
  children,
  requireAdmin = false,
  fallback,
  redirectTo,
}: ProtectedRouteProps) {
  const { isAuthenticated, isAdmin, authLoading, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) {
        const redirect = redirectTo || '/login';
        router.push(redirect);
        return;
      }

      if (requireAdmin && !isAdmin) {
        router.push('/unauthorized');
        return;
      }
    }
  }, [authLoading, isAuthenticated, isAdmin, requireAdmin, router, redirectTo]);

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return fallback || (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Access Denied</h2>
          <p className="text-gray-600">Please log in to access this page.</p>
        </div>
      </div>
    );
  }

  if (requireAdmin && !isAdmin) {
    return fallback || (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Admin Access Required</h2>
          <p className="text-gray-600">You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
} 

export default ProtectedRoute;

// Higher-order component version
export function withAuth<P extends object>(
  Component: React.ComponentType<P>,
  options: { requireAdmin?: boolean } = {}
) {
  return function AuthenticatedComponent(props: P) {
    return (
      <ProtectedRoute requireAdmin={options.requireAdmin}>
        <Component {...props} />
      </ProtectedRoute>
    );
  };
} 