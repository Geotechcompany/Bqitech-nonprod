"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  FileText,
  CheckCircle,
  Code,
  Users,
  XCircle,
  UserCheck,
  BarChart2,
  LogOut,
  X,
  Briefcase,
  Sparkles,
  Settings,
  ChevronRight,
  ChevronLeft,
  HelpCircle,
} from "lucide-react";
import { useClerk } from "@clerk/nextjs";
import { useSettings } from "@/contexts/SettingsContext";

const tabs = [
  {
    id: "overview",
    icon: BarChart2,
    label: "Overview",
    href: "/admin/overview",
  },
 
  {
    id: "applications",
    icon: FileText,
    label: "Applications",
    href: "/admin/applications",
  },
  {
    id: "shortlisted",
    icon: CheckCircle,
    label: "Shortlisted",
    href: "/admin/shortlisted",
  },
  {
    id: "technical-assessment",
    icon: Code,
    label: "Technical Assessment",
    href: "/admin/technical-assessment",
  },
  {
    id: "interviewing",
    icon: Users,
    label: "Interviewing",
    href: "/admin/interviewing",
  },
  {
    id: "disqualified",
    icon: XCircle,
    label: "Disqualified",
    href: "/admin/disqualified",
  },
  { id: "hired", icon: UserCheck, label: "Hired", href: "/admin/hired" },
  {
    id: "job-postings",
    icon: Briefcase,
    label: "Job Postings",
    href: "/admin/job-postings",
  },
  {
    id: "questions",
    icon: HelpCircle,
    label: "Questions Management",
    href: "/admin/job-postings/questions",
  },
  {
    id: "whats-new",
    icon: Sparkles,
    label: "What's New",
    href: "/admin/whats-new",
  },
  {
    id: "settings",
    icon: Settings,
    label: "Settings",
    href: "/admin/settings",
  },
  {
    id: "blog-management",
    icon: FileText,
    label: "Blog Management",
    href: "/admin/blog-management",
  },
];

interface DashboardSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function DashboardSidebar({ isOpen, onClose }: DashboardSidebarProps) {
  const { sidebarCollapsed, updateSettings } = useSettings();
  const pathname = usePathname();
  const { signOut } = useClerk();
  const router = useRouter();

  const handleLogout = async () => {
    await signOut();
    router.push('/');
  };

  return (
    <aside
      className={`
        fixed md:static inset-y-0 left-0 z-50 
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        ${sidebarCollapsed ? 'md:w-20' : 'md:w-64'} 
        md:translate-x-0 transition-all duration-300 
        bg-white border-r border-gray-200 p-4
      `}
    >
      <div className="flex items-center justify-between mb-6">
        {!sidebarCollapsed ? (
          <div className="flex items-center gap-2">
            <Image
              src="/bqilogo.png"
              alt="Logo"
              width={60}
              height={20}
              className="md:block"
            />
            <span className="font-semibold text-gray-800">HR ADMIN</span>
          </div>
        ) : (
          <Image
            src="/bqilogo.png"
            alt="Logo"
            width={60}
            height={20}
            className="md:block"
          />
        )}
        <button
          onClick={() => updateSettings({ sidebarCollapsed: !sidebarCollapsed })}
          className="hidden md:block text-gray-500 hover:text-gray-700"
        >
          {sidebarCollapsed ? (
            <ChevronRight className="w-5 h-5" />
          ) : (
            <ChevronLeft className="w-5 h-5" />
          )}
        </button>
        <button
          onClick={onClose}
          className="md:hidden text-gray-500"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      <nav className="space-y-2">
        {tabs.map((tab) => (
          <motion.div
            key={tab.id}
            className={`
              rounded-lg cursor-pointer
              ${pathname === tab.href
                ? "bg-purple-100 text-purple-600"
                : "text-gray-600"
              }
            `}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link
              href={tab.href}
              className={`
                flex items-center w-full p-3
                ${sidebarCollapsed ? 'justify-center' : ''}
              `}
              onClick={onClose}
            >
              <tab.icon className="w-5 h-5" />
              {!sidebarCollapsed && <span className="ml-3">{tab.label}</span>}
            </Link>
          </motion.div>
        ))}
      </nav>

      <div className="absolute bottom-0 left-0 right-0 p-4">
        <motion.button
          className={`
            flex items-center bg-red-500 text-white px-4 py-2 rounded-full 
            hover:bg-red-600 transition-colors w-full
            ${sidebarCollapsed ? 'justify-center' : 'justify-center md:justify-start'}
          `}
          onClick={handleLogout}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <LogOut className="w-5 h-5" />
          {!sidebarCollapsed && <span className="ml-2">Logout</span>}
        </motion.button>
      </div>
    </aside>
  );
}
