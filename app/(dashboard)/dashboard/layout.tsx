"use client";

import { ReactNode, useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import UserDashboardSidebar from '@/components/user/UserDashboardSidebar';
import { Menu } from "lucide-react";
import { useRouter, usePathname } from 'next/navigation';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const { isAuthenticated, authLoading, user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, authLoading, router]);

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="flex flex-col h-screen w-screen bg-gray-100 md:flex-row overflow-hidden">
      <div className="md:hidden bg-white flex justify-between items-center h-16 px-4 flex-shrink-0 z-50">
        <h1 className="text-xl font-bold text-gray-800">BQI Tech Dashboard</h1>
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-gray-500">
          <Menu size={24} />
        </button>
      </div>
      
      <UserDashboardSidebar 
        onClose={() => setSidebarOpen(false)} 
        isCollapsed={isCollapsed}
        onCollapse={setIsCollapsed}
      />
      
      <main className={`
        flex-1 h-full w-full overflow-x-hidden overflow-y-auto bg-gray-100 
        transition-all duration-300
        ${isCollapsed ? 'md:pl-[80px]' : 'md:pl-[256px]'}
      `}>
        <div className="h-full w-full">
          {children}
        </div>
      </main>
    </div>
  );
}