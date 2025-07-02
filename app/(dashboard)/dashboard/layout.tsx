"use client";

import { ReactNode, useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import UserDashboardSidebar, { MobileBottomTabs } from '@/components/user/UserDashboardSidebar';
import { DashboardHeader } from '@/components/user/DashboardHeader';
import { EmailVerificationGuard } from '@/components/auth/EmailVerificationGuard';
import { useRouter, usePathname } from 'next/navigation';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const { isAuthenticated, authLoading, user } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, authLoading, router]);

  // Get page title based on pathname
  const getPageTitle = () => {
    const path = pathname.split('/').pop();
    switch (path) {
      case 'overview':
        return 'Dashboard Overview';
      case 'applications':
        return 'My Applications';
      case 'jobs':
        return 'Available Jobs';
      case 'settings':
        return 'Settings';
      default:
        return 'Dashboard';
    }
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <EmailVerificationGuard requireVerification={true}>
      <div className="flex flex-col h-screen w-screen bg-gray-50 md:flex-row overflow-hidden">
        {/* Desktop Sidebar */}
        <UserDashboardSidebar 
          onClose={() => {}} 
          isCollapsed={isCollapsed}
          onCollapse={setIsCollapsed}
        />
        
        <div className={`
          flex-1 flex flex-col h-full w-full overflow-hidden
          transition-all duration-300
          ${isCollapsed ? 'md:pl-[100px]' : 'md:pl-[300px]'}
          pb-20 md:pb-0
        `}>
          {/* Dashboard Header */}
          <DashboardHeader 
            title={getPageTitle()}
          />
          
          {/* Main Content */}
          <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50">
            <div className="h-full w-full p-6 md:p-8">
              {children}
            </div>
          </main>
        </div>

        {/* iOS-style Bottom Tabs for Mobile */}
        <MobileBottomTabs />
      </div>
    </EmailVerificationGuard>
  );
}