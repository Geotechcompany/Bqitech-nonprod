"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  BarChart2,
  FileText,
  Briefcase,
  Settings,
  LogOut,
  Menu,
  ChevronRight,
  Home,
} from "lucide-react";
import { signOut } from "next-auth/react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { User } from "@/types/user";

const tabs = [
  {
    id: "overview",
    icon: Home,
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

interface SidebarProps {
  onClose: () => void;
  isCollapsed?: boolean;
  onCollapse?: (collapsed: boolean) => void;
}

export default function UserDashboardSidebar({ 
  onClose,
  isCollapsed = false,
  onCollapse
}: SidebarProps) {
  const pathname = usePathname();
  const { user } = useAuth();

  const displayName = user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email : 'User';
  const userInitial = displayName[0]?.toUpperCase() || 'U';

  return (
    <>
      {/* Desktop Sidebar */}
      <motion.aside
        initial={{ width: 256 }}
        animate={{ width: isCollapsed ? 80 : 256 }}
        transition={{ type: "spring", stiffness: 200, damping: 25 }}
        className="hidden md:flex flex-col fixed left-0 top-0 bottom-0 z-[9998] bg-white border-r border-gray-100 flex-shrink-0"
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="h-16 flex items-center justify-between px-4 border-b border-gray-100">
            {!isCollapsed && (
              <Link href="/dashboard" className="flex items-center space-x-2">
                <span className="font-semibold text-lg bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  BQI Tech
                </span>
              </Link>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onCollapse?.(!isCollapsed)}
              className="ml-auto"
            >
              <ChevronRight className={`h-4 w-4 transition-transform ${isCollapsed ? 'rotate-180' : ''}`} />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-3 space-y-2">
            {tabs.map((tab) => (
              <Link
                key={tab.id}
                href={tab.href}
                className={cn(
                  "flex items-center px-3 py-2 rounded-lg transition-colors relative group",
                  pathname === tab.href
                    ? "bg-blue-50 text-blue-600"
                    : "text-gray-600 hover:bg-gray-50"
                )}
              >
                <tab.icon className={cn(
                  "h-5 w-5 transition-colors",
                  pathname === tab.href ? "text-blue-600" : "text-gray-500 group-hover:text-blue-600"
                )} />
                {!isCollapsed && (
                  <span className="ml-3 font-medium">{tab.label}</span>
                )}
                {pathname === tab.href && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 rounded-lg bg-blue-50 -z-10"
                  />
                )}
              </Link>
            ))}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-gray-100">
            <div className={cn(
              "flex items-center",
              isCollapsed ? "justify-center" : "space-x-3"
            )}>
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center text-white font-semibold">
                {userInitial}
              </div>
              {!isCollapsed && (
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {displayName}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {user?.email || ''}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.aside>

      {/* Mobile Sidebar */}
      <div className="md:hidden">
        <Button
          variant="ghost"
          size="icon"
          className="fixed top-4 right-4 z-50"
          onClick={onClose}
        >
          <Menu className="h-6 w-6" />
        </Button>

        <motion.div
          initial={{ x: -300 }}
          animate={{ x: 0 }}
          exit={{ x: -300 }}
          transition={{ type: "spring", stiffness: 200, damping: 25 }}
          className="fixed inset-0 z-[9999] bg-white w-[280px] shadow-xl"
        >
          <div className="flex flex-col h-full">
            <div className="h-16 flex items-center px-4 border-b border-gray-100">
              <Link href="/dashboard" className="flex items-center space-x-2">
                <span className="font-semibold text-lg bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  BQI Tech
                </span>
              </Link>
            </div>

            <nav className="flex-1 overflow-y-auto p-3 space-y-2">
              {tabs.map((tab) => (
                <Link
                  key={tab.id}
                  href={tab.href}
                  onClick={onClose}
                  className={cn(
                    "flex items-center px-3 py-2 rounded-lg transition-colors relative group",
                    pathname === tab.href
                      ? "bg-blue-50 text-blue-600"
                      : "text-gray-600 hover:bg-gray-50"
                  )}
                >
                  <tab.icon className={cn(
                    "h-5 w-5 transition-colors",
                    pathname === tab.href ? "text-blue-600" : "text-gray-500 group-hover:text-blue-600"
                  )} />
                  <span className="ml-3 font-medium">{tab.label}</span>
                  {pathname === tab.href && (
                    <motion.div
                      layoutId="activeTabMobile"
                      className="absolute inset-0 rounded-lg bg-blue-50 -z-10"
                    />
                  )}
                </Link>
              ))}
            </nav>

            <div className="p-4 border-t border-gray-100">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center text-white font-semibold">
                  {userInitial}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {displayName}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {user?.email || ''}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </>
  );
}