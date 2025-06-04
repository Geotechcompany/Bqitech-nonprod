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
} from "lucide-react";
import { signOut } from "next-auth/react";
import { useSettings } from "@/contexts/SettingsContext";
import { useState } from "react";

export const menuSections = [
  {
    title: "Candidates",
    icon: Users,
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
    items: [
      {
        name: "User Management",
        href: "/admin/user-management",
        icon: Users,
      },
      {
        name: "Analytics",
        href: "/admin/overview",
        icon: BarChart,
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

export default function DashboardSidebar({ isOpen, onClose, className }: DashboardSidebarProps) {
  const { sidebarCollapsed, updateSettings } = useSettings();
  const pathname = usePathname();
  const [expandedSection, setExpandedSection] = useState<string | null>('Candidates');

  if (pathname === '/admin/login') return null;

  const toggleSection = (title: string) => {
    setExpandedSection(expandedSection === title ? null : title);
  };

  return (
    <motion.aside
      initial={{ x: -300 }}
      animate={{ x: 0 }}
      transition={{ type: "spring", stiffness: 200, damping: 30 }}
      className={`
        fixed inset-y-0 left-0 z-50 bg-gradient-to-b from-slate-50 to-white
        shadow-xl w-64 p-4 transition-all duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        ${sidebarCollapsed ? 'md:w-20 md:translate-x-0' : 'md:w-64'}
        border-r border-slate-100
        ${className || ''}
      `}
    >
      <div className="flex items-center justify-between mb-8">
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="flex items-center gap-2 text-slate-800"
        >
          <Image
            src="/bqilogo.png"
            alt="Logo"
            width={68}
            height={48}
            className="rounded-lg"
          />
          {!sidebarCollapsed && (
            <span className="font-bold text-lg">HR PORTAL</span>
          )}
        </motion.div>
        
        <div className="flex gap-2">
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
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={onClose}
            className="md:hidden p-2 hover:bg-slate-100 rounded-lg"
          >
            <X className="w-6 h-6 text-slate-600" />
          </motion.button>
        </div>
      </div>

      <nav className="space-y-4">
        {/* Standalone Overview Link */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="space-y-2"
        >
          <Link
            href="/admin/overview"
            className={`flex items-center w-full p-2 rounded-lg text-sm transition-colors
              ${pathname === '/admin/overview' 
                ? 'bg-sky-100 text-sky-600' 
                : 'text-slate-600 hover:bg-slate-100'}
            `}
          >
            <LayoutDashboard className="w-5 h-5 text-sky-600" />
            {!sidebarCollapsed && (
              <span className="ml-3">Overview</span>
            )}
          </Link>
        </motion.div>

        {menuSections.map((section) => (
          <div key={section.title} className="space-y-2">
            <motion.button
              onClick={() => toggleSection(section.title)}
              className="flex items-center w-full p-2 rounded-lg hover:bg-slate-100"
              whileHover={{ scale: 1.02 }}
            >
              <section.icon className="w-5 h-5 text-sky-600" />
              {!sidebarCollapsed && (
                <>
                  <span className="ml-3 text-sm font-medium">{section.title}</span>
                  <ChevronRight
                    className={`w-4 h-4 ml-auto transition-transform ${
                      expandedSection === section.title ? 'rotate-90' : ''
                    }`}
                  />
                </>
              )}
            </motion.button>

            <AnimatePresence>
              {(!sidebarCollapsed && expandedSection === section.title) && (
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
          </div>
        ))}
      </nav>

      <motion.div
        className="absolute bottom-4 left-4 right-4"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <button
          onClick={() => signOut({ callbackUrl: '/' })}
          className="w-full flex items-center justify-center p-2 space-x-2 rounded-lg
                   bg-gradient-to-r from-sky-500 to-blue-600 text-white
                   hover:from-sky-600 hover:to-blue-700 transition-all
                   shadow-sm hover:shadow-md relative overflow-hidden"
        >
          <motion.div
            whileHover={{ rotate: 180 }}
            transition={{ duration: 0.3 }}
            className="flex items-center"
          >
            <LogOut className="w-4 h-4" />
          </motion.div>
          {!sidebarCollapsed && (
            <motion.span
              initial={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-sm"
            >
              Log Out
            </motion.span>
          )}
          <motion.div
            className="absolute inset-0 bg-white/10 opacity-0 hover:opacity-20"
            transition={{ duration: 0.2 }}
          />
        </button>
      </motion.div>
    </motion.aside>
  );
}

