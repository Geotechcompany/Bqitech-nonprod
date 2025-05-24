"use client";

import { ReactNode, useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import DashboardSidebar from '@/components/admin/DashboardSidebar';
import { Menu } from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';
import { toast } from "react-hot-toast";

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { isLoaded, user } = useUser();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (isLoaded) {
      const role = user?.publicMetadata?.role;
      
      if (!user) {
        router.push('/admin/login');
      } else if (role !== "admin" && !pathname?.includes('/login')) {
        toast.error("You don't have admin access");
        router.push('/');
      }
    }
  }, [isLoaded, user, router, pathname]);

  if (!isLoaded) {
    return <div>Loading...</div>;
  }

  if (!user && !pathname?.includes('/login')) {
    return null;
  }

  return (
    <div className="flex flex-col h-screen bg-gray-100 md:flex-row">
      {user?.publicMetadata?.role === "admin" && (
        <>
          <div className="md:hidden bg-white p-4 flex justify-between items-center">
            <h1 className="text-xl font-bold text-gray-800">BQI Tech HR</h1>
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-gray-500">
              <Menu size={24} />
            </button>
          </div>
          <DashboardSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        </>
      )}
      <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-4 md:p-8">
        {children}
      </main>
    </div>
  );
}
