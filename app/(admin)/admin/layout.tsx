"use client";

import { ReactNode, useState, useEffect } from 'react';
import { useAuth } from "@/contexts/AuthContext";
import { useSettings } from "@/contexts/SettingsContext";
import DashboardSidebar from '@/components/admin/DashboardSidebar';
import MobileDashboardSidebar from '@/components/admin/MobileDashboardSidebar';
import { EmailVerificationGuard } from '@/components/auth/EmailVerificationGuard';
import { Menu } from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';
import { toast } from "react-hot-toast";

export default function AdminLayout({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { sidebarCollapsed } = useSettings();
  const { user, authLoading, isAuthenticated, isAdmin } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  // Debug admin layout
  useEffect(() => {
    console.log('Admin Layout Debug:', {
      pathname,
      authLoading,
      isAuthenticated,
      isAdmin,
      user: user?.role,
    });
  }, [pathname, authLoading, isAuthenticated, isAdmin, user]);

  // Handle authentication redirects ONLY for protected admin pages (not login)
  useEffect(() => {
    // Skip redirect logic for login page - let the login page handle its own redirects
    if (pathname?.includes('/login')) {
      return;
    }
    
    if (!authLoading) {
      // For non-login pages, check authentication
      if (!isAuthenticated) {
        console.log('Not authenticated, redirecting to login');
        window.location.href = '/admin/login';
        return;
      }
      
      if (isAuthenticated && !isAdmin) {
        console.log('Not admin, redirecting to dashboard');
        toast.error('Access denied. Admin privileges required.');
        window.location.href = '/dashboard';
        return;
      }
    }
  }, [authLoading, isAuthenticated, isAdmin, pathname]);

  // Show loading only for non-login pages
  if (authLoading && !pathname?.includes('/login')) {
    return (
      <div className="flex items-center justify-center h-screen w-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Checking authentication...</p>
        </div>
      </div>
    );
  }

  // For login page, don't show sidebar and let login page handle everything
  if (pathname?.includes('/login')) {
    return <div data-admin-page className="h-screen w-screen">{children}</div>;
  }

  // Don't render admin interface if not authenticated or not admin
  if (!authLoading && (!isAuthenticated || !isAdmin)) {
    return null;
  }

  return (
    <EmailVerificationGuard requireVerification={true}>
      <div data-admin-page className="flex flex-col h-screen w-screen bg-gray-100 md:flex-row overflow-hidden">
        <div className="md:hidden bg-white flex justify-between items-center h-16 px-4 flex-shrink-0 z-50">
          <h1 className="text-xl font-bold text-gray-800">BQI Tech HR</h1>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-gray-500">
            <Menu size={24} />
          </button>
        </div>
        
        {/* Desktop Sidebar */}
        <DashboardSidebar 
          isOpen={sidebarOpen} 
          onClose={() => setSidebarOpen(false)}
          className="hidden md:block flex-shrink-0"
        />
        
        {/* Mobile Sidebar */}
        <MobileDashboardSidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
        
        <main className={`
          flex-1 h-full w-full overflow-x-hidden overflow-y-auto bg-gray-100
          transition-all duration-300 ease-in-out
          ${sidebarCollapsed ? 'md:ml-20' : 'md:ml-64'}
        `}>
          <div className="h-full w-full">
            {children}
          </div>
        </main>
      </div>
    </EmailVerificationGuard>
  );
}
