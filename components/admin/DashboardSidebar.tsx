"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronRight,
  ChevronLeft,
  X,
  LogOut,
  Folder,
  Users,
  FileText,
  Settings,
  LayoutDashboard,
  BriefcaseBusiness,
  ClipboardList,
  BrainCircuit,
  BadgeCheck,
  Laptop2,
  Handshake,
  Ban,
  BookText,
  Rocket,
  BarChart,
  HelpCircle,
  Bell,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useSettings } from "@/contexts/SettingsContext";
import { useState } from "react";

interface MenuSection {
  title: string;
  icon: any; // Using any for Lucide icons type
  alwaysExpanded: boolean;
  items: {
    name: string;
    href: string;
    icon: any;
  }[];
}

export const menuSections: MenuSection[] = [
  {
    title: "Candidates",
    icon: Users,
    alwaysExpanded: true,
    items: [
      {
        name: "Shortlisted",
        href: "/admin/shortlisted",
        icon: BadgeCheck,
      },
      {
        name: "Technical Screen",
        href: "/admin/technical-assessment",
        icon: Laptop2,
      },
      {
        name: "Interviews",
        href: "/admin/interviewing",
        icon: Handshake,
      },
      {
        name: "Hired",
        href: "/admin/hired",
        icon: Rocket,
      },
      {
        name: "Disqualified",
        href: "/admin/disqualified",
        icon: Ban,
      },
    ],
  },
  {
    title: "Recruitment",
    icon: BriefcaseBusiness,
    alwaysExpanded: true,
    items: [
      {
        name: "Job Postings",
        href: "/admin/job-postings",
        icon: ClipboardList,
      },
      {
        name: "Applications",
        href: "/admin/applications",
        icon: Folder,
      },
      {
        name: "Questions Bank",
        href: "/admin/job-postings/questions",
        icon: BrainCircuit,
      },
    ],
  },
  {
    title: "Content",
    icon: BookText,
    alwaysExpanded: false,
    items: [
      {
        name: "Blog Management",
        href: "/admin/blog-management",
        icon: FileText,
      },
      {
        name: "Release Notes",
        href: "/admin/whats-new",
        icon: Rocket,
      },
    ],
  },
  {
    title: "Workspace",
    icon: LayoutDashboard,
    alwaysExpanded: false,
    items: [
      {
        name: "User Management",
        href: "/admin/user-management",
        icon: Users,
      },
      {
        name: "Analytics",
        href: "/admin/analytics",
        icon: BarChart,
      },
      {
        name: "Notifications",
        href: "/admin/notifications",
        icon: Bell,
      },
      {
        name: "Settings",
        href: "/admin/settings",
        icon: Settings,
      },
    ],
  },
];

interface DashboardSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  className?: string;
}

// Tooltip component for collapsed sidebar
const Tooltip = ({ children, content, position = "right" }: { 
  children: React.ReactNode; 
  content: string; 
  position?: "right" | "left" 
}) => (
  <div className="relative group">
    {children}
    <div 
      className={`
        absolute z-50 px-2 py-1 text-xs font-medium
        bg-black text-white rounded-md shadow-lg
        opacity-0 group-hover:opacity-100
        transition-opacity duration-200 ease-in-out
        pointer-events-none
        ${position === "right" ? "left-full ml-2" : "right-full mr-2"}
        top-1/2 -translate-y-1/2 
      `}
    >
      {content}
      <div 
        className={`
          absolute top-1/2 -translate-y-1/2 w-2 h-2 
          bg-black rotate-45
          ${position === "right" ? "-left-1" : "-right-1"}
        `} 
      />
    </div>
  </div>
);

export default function DashboardSidebar({ isOpen, onClose, className }: DashboardSidebarProps) {
  const { sidebarCollapsed, updateSettings } = useSettings();
  const { logout } = useAuth();
  const pathname = usePathname();
  const [expandedSection, setExpandedSection] = useState<string | null>('Workspace');

  if (pathname === '/admin/login') return null;

  const toggleSection = (title: string) => {
    const section = menuSections.find(s => s.title === title);
    if (section?.alwaysExpanded) return; // Don't toggle always expanded sections
    setExpandedSection(expandedSection === title ? null : title);
  };

  const isExpanded = (section: MenuSection) => {
    return section.alwaysExpanded || expandedSection === section.title;
  };

  return (
    <motion.aside
      initial={{ x: -300 }}
      animate={{ x: 0 }}
      transition={{ type: "spring", stiffness: 200, damping: 30 }}
      className={`
        fixed inset-y-0 left-0 z-[9999] bg-gradient-to-b from-slate-50 to-white
        shadow-xl transition-all duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        ${sidebarCollapsed ? 'w-20' : 'w-64'}
        border-r border-slate-100
        ${className || ''}
      `}
    >
      <div className="flex items-center justify-between mb-8 p-4">
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="flex items-center gap-2 text-slate-800"
        >
          <Image
            src="/bqilogo.png"
            alt="Logo"
            width={sidebarCollapsed ? 32 : 68}
            height={sidebarCollapsed ? 32 : 48}
            className="rounded-lg"
          />
          {!sidebarCollapsed && (
            <span className="font-bold text-lg">HR PORTAL</span>
          )}
        </motion.div>
        
        <div className="flex gap-2">
          <Tooltip content={sidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}>
            <motion.button
              whileHover={{ scale: 1.1 }}
              onClick={() => updateSettings({ sidebarCollapsed: !sidebarCollapsed })}
              className="hidden md:block p-2 hover:bg-slate-100 rounded-lg"
            >
              {sidebarCollapsed ? (
                <ChevronRight className="w-5 h-5 text-slate-600" />
              ) : (
                <ChevronLeft className="w-5 h-5 text-slate-600" />
              )}
            </motion.button>
          </Tooltip>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={onClose}
            className="md:hidden p-2 hover:bg-slate-100 rounded-lg"
          >
            <X className="w-6 h-6 text-slate-600" />
          </motion.button>
        </div>
      </div>

      <nav className="space-y-2 px-4 pb-20 overflow-y-auto max-h-[calc(100vh-200px)]">
        {/* Standalone Overview Link */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="space-y-2"
        >
          {sidebarCollapsed ? (
            <Tooltip content="Overview">
              <Link
                href="/admin/overview"
                className={`flex items-center justify-center w-full p-3 rounded-lg text-sm transition-colors
                  ${pathname === '/admin/overview' 
                    ? 'bg-sky-100 text-sky-600' 
                    : 'text-slate-600 hover:bg-slate-100'}
                `}
              >
                <LayoutDashboard className="w-5 h-5" />
              </Link>
            </Tooltip>
          ) : (
            <Link
              href="/admin/overview"
              className={`flex items-center w-full p-3 rounded-lg text-sm transition-colors
                ${pathname === '/admin/overview' 
                  ? 'bg-sky-100 text-sky-600' 
                  : 'text-slate-600 hover:bg-slate-100'}
              `}
            >
              <LayoutDashboard className="w-5 h-5 text-sky-600" />
              <span className="ml-3">Overview</span>
            </Link>
          )}
        </motion.div>

        {menuSections.map((section: MenuSection) => (
          <div key={section.title} className="space-y-1">
            {sidebarCollapsed ? (
              // Collapsed sidebar - show section icon with dropdown on hover
              <div className="relative group">
                <Tooltip content={section.title}>
                  <motion.button
                    className={`
                      flex items-center justify-center w-full p-3 rounded-lg transition-colors
                      ${pathname.includes(section.items[0].href.split('/')[2]) 
                        ? 'bg-sky-100 text-sky-600' 
                        : 'text-slate-600 hover:bg-slate-100'}
                    `}
                    whileHover={{ scale: 1.02 }}
                  >
                    <section.icon className="w-5 h-5" />
                  </motion.button>
                </Tooltip>
                
                {/* Hover dropdown for collapsed sidebar */}
                <div
                  className={`
                    absolute left-full top-1/2 -translate-y-1/2 ml-2 
                    bg-white shadow-xl rounded-lg border border-slate-200 
                    opacity-0 group-hover:opacity-100 
                    transition-opacity duration-200 ease-in-out
                    pointer-events-none group-hover:pointer-events-auto 
                    z-50 min-w-[200px] py-2
                  `}
                >
                  <div className="p-2">
                    <div className="text-xs font-semibold text-slate-500 mb-2 px-2">{section.title}</div>
                    {section.items.map((item) => (
                      <Link
                        key={item.name}
                        href={item.href}
                        className={`
                          flex items-center p-2 rounded-md text-sm transition-colors w-full
                          ${pathname === item.href 
                            ? 'bg-sky-100 text-sky-600' 
                            : 'text-slate-600 hover:bg-slate-100'}
                        `}
                      >
                        <item.icon className="w-4 h-4 mr-3 shrink-0" />
                        <span className="font-medium truncate">{item.name}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              // Expanded sidebar
              <>
                <motion.button
                  onClick={() => toggleSection(section.title)}
                  className={`flex items-center w-full p-3 rounded-lg transition-colors
                    ${section.alwaysExpanded 
                      ? 'cursor-default' 
                      : 'hover:bg-slate-100 cursor-pointer'}
                  `}
                  whileHover={{ scale: section.alwaysExpanded ? 1 : 1.02 }}
                >
                  <section.icon className="w-5 h-5 text-sky-600" />
                  <span className="ml-3 text-sm font-medium">{section.title}</span>
                  {!section.alwaysExpanded && (
                    <ChevronRight
                      className={`w-4 h-4 ml-auto transition-transform ${
                        isExpanded(section) ? 'rotate-90' : ''
                      }`}
                    />
                  )}
                </motion.button>

                <AnimatePresence>
                  {isExpanded(section) && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="ml-8 space-y-1"
                    >
                      {section.items.map((item, index) => (
                        <motion.div
                          key={item.name}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                        >
                          <Link
                            href={item.href}
                            className={`flex items-center p-2 rounded-lg text-sm transition-colors
                              ${pathname === item.href 
                                ? 'bg-sky-100 text-sky-600' 
                                : 'text-slate-600 hover:bg-slate-100'}
                            `}
                          >
                            <item.icon className="w-4 h-4" />
                            <span className="ml-3">{item.name}</span>
                          </Link>
                        </motion.div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </>
            )}
          </div>
        ))}
      </nav>

      <motion.div
        className="absolute bottom-4 left-4 right-4"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        {sidebarCollapsed ? (
          <Tooltip content="Log Out">
            <button
              onClick={() => logout()}
              className="w-full flex items-center justify-center p-3 rounded-lg
                       bg-gradient-to-r from-sky-500 to-blue-600 text-white
                       hover:from-sky-600 hover:to-blue-700 transition-all
                       shadow-sm hover:shadow-md relative overflow-hidden"
            >
              <motion.div
                whileHover={{ rotate: 180 }}
                transition={{ duration: 0.3 }}
              >
                <LogOut className="w-4 h-4" />
              </motion.div>
            </button>
          </Tooltip>
        ) : (
          <button
            onClick={() => logout()}
            className="w-full flex items-center justify-center p-3 space-x-2 rounded-lg
                     bg-gradient-to-r from-sky-500 to-blue-600 text-white
                     hover:from-sky-600 hover:to-blue-700 transition-all
                     shadow-sm hover:shadow-md relative overflow-hidden"
          >
            <motion.div
              whileHover={{ rotate: 180 }}
              transition={{ duration: 0.3 }}
            >
              <LogOut className="w-4 h-4" />
            </motion.div>
            <span className="text-sm">Log Out</span>
          </button>
        )}
      </motion.div>
    </motion.aside>
  );
}

