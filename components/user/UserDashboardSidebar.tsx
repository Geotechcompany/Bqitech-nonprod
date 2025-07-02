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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useAuth } from "@/contexts/AuthContext";
import { User } from "@/types/user";
import Logo from "@/components/logo";

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
    label: "Applications",
    href: "/dashboard/applications",
  },
  {
    id: "jobs",
    icon: Briefcase,
    label: "Jobs",
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
      <TooltipProvider>
        <motion.aside
          initial={{ width: 280 }}
          animate={{ width: isCollapsed ? 80 : 280 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="hidden md:flex flex-col fixed left-0 top-0 bottom-0 z-[9998] bg-white/95 backdrop-blur-xl border-r border-gray-200/60 shadow-xl flex-shrink-0"
        >
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="h-10 flex items-center justify-between px-4 border-b border-gray-100/80 mb-4">
              {!isCollapsed && (
                <Link href="/dashboard" className="flex items-center space-x-3 group">
                  <div className="w-16 h-5 relative transition-transform group-hover:scale-105">
                    <Logo />
                  </div>
                </Link>
              )}
              {isCollapsed && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link href="/dashboard" className="flex items-center justify-center w-full group">
                      <div className="w-8 h-8 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105 border border-white/20">
                        <div className="w-6 h-4 relative">
                          <Logo />
                        </div>
                      </div>
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    <p>Dashboard</p>
                  </TooltipContent>
                </Tooltip>
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onCollapse?.(!isCollapsed)}
                className="ml-auto hover:bg-gray-100/80 rounded-xl transition-all duration-200 hover:scale-105"
              >
                <ChevronRight className={`h-4 w-4 transition-transform duration-300 ${isCollapsed ? 'rotate-180' : ''}`} />
              </Button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto px-4 py-6 mt-4 space-y-2">
              {tabs.map((tab) => (
                <div key={tab.id}>
                  {isCollapsed ? (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Link
                          href={tab.href}
                          className={cn(
                            "flex items-center justify-center px-4 py-3 rounded-xl transition-all duration-200 relative group",
                            pathname === tab.href
                              ? "bg-gradient-to-r from-[#31CDFF]/10 to-[#272055]/10 text-[#272055] shadow-sm border border-[#31CDFF]/20"
                              : "text-gray-600 hover:bg-gray-50/80 hover:text-[#272055]"
                          )}
                        >
                          <div className={cn(
                            "p-2 rounded-lg transition-all duration-200",
                            pathname === tab.href 
                              ? "bg-gradient-to-br from-[#31CDFF] to-[#272055] text-white shadow-md" 
                              : "bg-gray-100/60 text-gray-500 group-hover:bg-[#31CDFF]/10 group-hover:text-[#31CDFF]"
                          )}>
                            <tab.icon className="h-5 w-5" />
                          </div>
                        </Link>
                      </TooltipTrigger>
                      <TooltipContent side="right">
                        <p>{tab.label}</p>
                      </TooltipContent>
                    </Tooltip>
                  ) : (
                    <Link
                      href={tab.href}
                      className={cn(
                        "flex items-center px-4 py-3 rounded-xl transition-all duration-200 relative group",
                        pathname === tab.href
                          ? "bg-gradient-to-r from-[#31CDFF]/10 to-[#272055]/10 text-[#272055] shadow-sm border border-[#31CDFF]/20"
                          : "text-gray-600 hover:bg-gray-50/80 hover:text-[#272055]"
                      )}
                    >
                      <div className={cn(
                        "p-2 rounded-lg transition-all duration-200",
                        pathname === tab.href 
                          ? "bg-gradient-to-br from-[#31CDFF] to-[#272055] text-white shadow-md" 
                          : "bg-gray-100/60 text-gray-500 group-hover:bg-[#31CDFF]/10 group-hover:text-[#31CDFF]"
                      )}>
                        <tab.icon className="h-5 w-5" />
                      </div>
                      <span className="ml-4 font-medium text-sm">{tab.label}</span>
                      {pathname === tab.href && (
                        <motion.div
                          layoutId="activeIndicator"
                          className="absolute right-2 w-2 h-2 bg-gradient-to-br from-[#31CDFF] to-[#272055] rounded-full"
                          initial={false}
                          transition={{ type: "spring", stiffness: 500, damping: 30 }}
                        />
                      )}
                    </Link>
                  )}
                </div>
              ))}
            </nav>

            {/* Footer - User Profile */}
            <div className="p-4 border-t border-gray-100/80">
              {!isCollapsed ? (
                <Link 
                  href="/dashboard/settings"
                  className="group flex items-center space-x-3 p-4 rounded-xl hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100/50 transition-all duration-300 cursor-pointer border border-transparent hover:border-gray-200/60"
                >
                  <div className="relative">
                    <Avatar className="h-12 w-12 ring-2 ring-white shadow-lg group-hover:ring-[#31CDFF]/30 transition-all duration-300 group-hover:shadow-xl">
                      <AvatarImage 
                        src={user?.avatar}
                        alt={displayName}
                        className="object-cover"
                      />
                      <AvatarFallback className="bg-gradient-to-br from-[#272055] to-[#31CDFF] text-white font-semibold text-lg">
                        {userInitial}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full shadow-sm"></div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate group-hover:text-[#272055] transition-colors">
                      {user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : user?.email || 'User'}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {user?.firstName ? user?.email : ''}
                    </p>
                    <div className="flex items-center mt-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                      <span className="text-xs text-green-600 font-medium">Online</span>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-[#31CDFF] transition-colors" />
                </Link>
              ) : (
                <div className="flex justify-center">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Link href="/dashboard/settings" className="group">
                        <Avatar className="h-12 w-12 ring-2 ring-white shadow-lg group-hover:ring-[#31CDFF]/30 transition-all duration-300 group-hover:shadow-xl group-hover:scale-105">
                          <AvatarImage 
                            src={user?.avatar}
                            alt={displayName}
                            className="object-cover"
                          />
                          <AvatarFallback className="bg-gradient-to-br from-[#272055] to-[#31CDFF] text-white font-semibold">
                            {userInitial}
                          </AvatarFallback>
                        </Avatar>
                      </Link>
                    </TooltipTrigger>
                    <TooltipContent side="right">
                      <p>Profile Settings</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              )}
            </div>
          </div>
        </motion.aside>
      </TooltipProvider>
    </>
  );
}

// iOS-like Bottom Tab Navigation Component
export function MobileBottomTabs() {
  const pathname = usePathname();

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50">
      {/* iOS-style backdrop blur effect */}
      <div className="bg-white/90 ios-backdrop-blur border-t border-gray-200/30 shadow-2xl">
        <div className="safe-area-pb">
          <nav className="flex items-center justify-around px-1 py-1">
            {tabs.map((tab) => {
              const isActive = pathname === tab.href;
              return (
                <Link
                  key={tab.id}
                  href={tab.href}
                  className="flex flex-col items-center justify-center min-w-0 flex-1 relative"
                >
                  <motion.div
                    className="flex flex-col items-center justify-center relative px-3 py-2 rounded-2xl"
                    whileTap={{ scale: 0.9 }}
                    whileHover={{ scale: 1.05 }}
                    transition={{ 
                      type: "spring", 
                      stiffness: 400, 
                      damping: 17,
                      duration: 0.15
                    }}
                  >
                    {/* Active indicator background */}
                    {isActive && (
                      <motion.div
                        layoutId="activeTabMobile"
                        className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-blue-600/20 rounded-2xl border border-blue-200/50"
                        initial={false}
                        transition={{ 
                          type: "spring", 
                          stiffness: 500, 
                          damping: 35,
                          duration: 0.3
                        }}
                      />
                    )}
                    
                    {/* Icon container */}
                    <div className="relative z-10 mb-1">
                      <motion.div
                        animate={{
                          scale: isActive ? 1.1 : 1,
                        }}
                        transition={{ duration: 0.2 }}
                      >
                        <tab.icon 
                          className={cn(
                            "h-6 w-6 transition-all duration-300",
                            isActive 
                              ? "text-blue-600 drop-shadow-sm" 
                              : "text-gray-500"
                          )} 
                        />
                      </motion.div>
                    </div>
                    
                    {/* Label */}
                    <motion.span 
                      className={cn(
                        "text-xs font-medium transition-all duration-300 relative z-10",
                        isActive 
                          ? "text-blue-600 font-semibold" 
                          : "text-gray-500"
                      )}
                      animate={{
                        scale: isActive ? 1.05 : 1,
                      }}
                      transition={{ duration: 0.2 }}
                    >
                      {tab.label}
                    </motion.span>
                  </motion.div>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </div>
  );
}