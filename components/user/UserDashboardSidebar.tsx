"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  BarChart2,
  FileText,
  Briefcase,
  Settings,
  LogOut,
  Menu,
} from "lucide-react";
import { signOut } from "next-auth/react";
import { cn } from "@/lib/utils";

const tabs = [
  {
    id: "overview",
    icon: BarChart2,
    label: "Overview",
    href: "/dashboard/overview",
  },
  {
    id: "applications",
    icon: FileText,
    label: "My Applications",
    href: "/dashboard/applications",
  },
  {
    id: "jobs",
    icon: Briefcase,
    label: "Job Listings",
    href: "/dashboard/jobs",
  },
  {
    id: "settings",
    icon: Settings,
    label: "Settings",
    href: "/dashboard/settings",
  },
];

export default function UserDashboardSidebar({ onClose }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push("/");
  };

  return (
    <aside className={cn(
      "bg-white dark:bg-gray-850 shadow-lg h-full relative transition-all duration-300 ease-in-out",
      isCollapsed ? "w-20" : "w-64"
    )}>
      <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-700">
        {!isCollapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center"
          >
            <Image
              src="/bqilogo.png"
              alt="BQI Tech Logo"
              width={40}
              height={40}
              className="mr-2 rounded-lg"
            />
            <h1 className="text-xl font-bold text-gray-800 dark:text-white">BQI Tech</h1>
          </motion.div>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
        >
          <Menu className="w-6 h-6" />
        </button>
      </div>

      <div className="p-4">
        <nav className="space-y-1">
          {tabs.map((tab) => (
            <motion.div
              key={tab.id}
              className={cn(
                "rounded-xl overflow-hidden",
                pathname === tab.href
                  ? "bg-blue-50/50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-200"
                  : "text-gray-600 dark:text-gray-400 hover:bg-gray-100/50 dark:hover:bg-gray-700/50"
              )}
              whileHover={{ scale: 1.02 }}
            >
              <Link
                href={tab.href}
                className={cn(
                  "flex items-center px-4 py-3 group",
                  isCollapsed ? "justify-center" : "justify-start"
                )}
                onClick={onClose}
              >
                <tab.icon className="w-5 h-5 flex-shrink-0" />
                {!isCollapsed && (
                  <span className="ml-3 text-sm font-medium whitespace-nowrap">
                    {tab.label}
                  </span>
                )}
              </Link>
            </motion.div>
          ))}
        </nav>
      </div>

      <div className={cn(
        "absolute bottom-0 left-0 right-0 p-4 border-t border-gray-100 dark:border-gray-700",
        isCollapsed ? "flex flex-col items-center space-y-3" : "flex justify-between items-center"
      )}>
    
        <button
          onClick={handleLogout}
          className="text-red-500 hover:text-red-700 dark:hover:text-red-300 p-2 rounded-lg hover:bg-gray-100/50 dark:hover:bg-gray-700/50"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>
    </aside>
  );
}