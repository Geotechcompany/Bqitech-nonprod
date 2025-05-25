"use client";

import { ReactNode, useState, useEffect } from 'react';
import { getSession } from "next-auth/react";
import DashboardSidebar from '@/components/admin/DashboardSidebar';
import { Menu } from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';
import { toast } from "react-hot-toast";

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
    return <div>Loading...</div>;
  }

  if (!session && !pathname?.includes('/login')) {
    return null;
  }

  return (
    <div className="flex flex-col h-screen bg-gray-100 md:flex-row">
      {session?.user?.role === "ADMIN" && (
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
