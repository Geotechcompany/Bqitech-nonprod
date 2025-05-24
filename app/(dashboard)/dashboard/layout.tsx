"use client";

import { ReactNode, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import UserDashboardSidebar from "@/components/user/UserDashboardSidebar";
import { Menu } from "lucide-react";
import { useRouter, usePathname } from 'next/navigation';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const { isLoaded, user } = useUser();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  if (!isLoaded) {
    return <div>Loading...</div>;
  }

  if (!user) {
    router.push('/login');
    return null;
  }

  return (
    <div className="flex flex-col h-screen bg-gray-100 md:flex-row">
      {/* Mobile Header */}
      <div className="md:hidden bg-white p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-gray-800">BQI Tech HR</h1>
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-gray-500">
          <Menu size={24} />
        </button>
      </div>

      {/* Sidebar */}
      <div className="hidden md:flex md:flex-shrink-0">
        <UserDashboardSidebar />
      </div>

      {/* Mobile Sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
          <div className="relative flex flex-col w-full max-w-xs bg-white h-full">
            <UserDashboardSidebar onClose={() => setSidebarOpen(false)} />
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-4 md:p-8">
        {children}
      </main>
    </div>
  );
}