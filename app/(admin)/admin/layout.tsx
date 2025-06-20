"use client";

import { ReactNode, useState, useEffect } from 'react';
import { getSession } from "next-auth/react";
import DashboardSidebar from '@/components/admin/DashboardSidebar';
import MobileDashboardSidebar from '@/components/admin/MobileDashboardSidebar';
import { Menu } from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';
import { toast } from "react-hot-toast";
import { useSettings } from "@/contexts/SettingsContext";

declare module "next-auth" {
  interface User {
    role?: string;
  }
}

export default function AdminLayout({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [session, setSession] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const { sidebarCollapsed } = useSettings();

  useEffect(() => {
    const checkSession = async () => {
      const session = await getSession();
      setSession(session);
      setIsLoading(false);

      if (!session) {
        router.push('/admin/login');
      } else if (session.user.role !== "ADMIN") {
        toast.error("You don't have admin access");
        router.push('/admin/login');
      }
    };

    checkSession();
  }, [router, pathname]);

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen w-screen">Loading...</div>;
  }

  if (!session && !pathname?.includes('/login')) {
    return null;
  }

  return (
    <div data-admin-page className="flex flex-col h-screen w-screen bg-gray-100 md:flex-row overflow-hidden">
      {session?.user?.role === "ADMIN" && (
        <>
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
        </>
      )}
      <main className={`
        flex-1 h-full w-full overflow-x-hidden overflow-y-auto bg-gray-100
        transition-all duration-300 ease-in-out
        ${session?.user?.role === "ADMIN" ? (sidebarCollapsed ? 'md:ml-20' : 'md:ml-64') : 'ml-0'}
      `}>
        <div className="h-full w-full">
          {children}
        </div>
      </main>
    </div>
  );
}
