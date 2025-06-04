"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  BarChart2,
  FileText,
  Briefcase,
  Settings,
  LogOut,
  X,
  Sun,
  Moon,
  Menu,
} from "lucide-react";
import { signOut } from "next-auth/react";
import { useTheme } from "@/contexts/ThemeContext";
import { cn } from "@/lib/utils"; // Assuming you have a utility class helper
import useSWR from 'swr';

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

// Create interface for slot data
interface ApplicationSlots {
  used: number;
  total: number;
}

export default function UserDashboardSidebar({ onClose }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();

  // Inside the component, add SWR hook
  const { data: slotData } = useSWR<{
    used: number;
    total: number;
    statusCounts: Record<string, number>;
    currentStage: string;
  }>('/api/user/application-slots', {
    refreshInterval: 30000,
    revalidateOnFocus: true
  });

  // Update current stage calculation
  const stages = ['applied', 'shortlisted', 'technicalAssessment', 'interviewing', 'hired', 'disqualified'];
  const currentStageIndex = stages.indexOf(slotData?.currentStage || 'applied');

  // Calculate progress percentage
  const progress = slotData ? (slotData.used / slotData.total) * 100 : 0;
  const circumference = 2 * Math.PI * 40; // 2πr where r=40

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push("/");
  };

  // Update status color mapping
  const getStatusColor = (stage?: string) => {
    switch(stage) {
      case 'applied': return { bg: 'bg-gray-500', text: 'text-gray-600' };
      case 'shortlisted': return { bg: 'bg-blue-500', text: 'text-blue-600' };
      case 'technicalAssessment': return { bg: 'bg-yellow-500', text: 'text-yellow-600' };
      case 'interviewing': return { bg: 'bg-purple-500', text: 'text-purple-600' };
      case 'hired': return { bg: 'bg-green-500', text: 'text-green-600' };
      case 'disqualified': return { bg: 'bg-red-500', text: 'text-red-600' };
      default: return { bg: 'bg-gray-500', text: 'text-gray-600' };
    }
  };

  // Update stage labels
  const getStageLabel = (stage?: string) => {
    const labels: Record<string, string> = {
      applied: 'Applied',
      shortlisted: 'Shortlisted',
      technicalAssessment: 'Technical Review',
      interviewing: 'Interviewing',
      hired: 'Hired',
      disqualified: 'Disqualified'
    };
    return labels[stage || 'applied'] || 'Applied';
  };

  // Update progress calculation functions
  const calculateProgress = (stage?: string) => {
    const stageOrder = ['applied', 'shortlisted', 'technicalAssessment', 'interviewing', 'hired'];
    const index = stageOrder.indexOf(stage || 'applied');
    return Math.min(((index + 1) / stageOrder.length) * 100, 100);
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

      <div className="p-4 space-y-4">
        <div className="bg-blue-100/50 dark:bg-blue-900/30 backdrop-blur-sm p-4 rounded-xl border border-blue-200/50 dark:border-blue-800/50">
          {!isCollapsed ? (
            <div className="flex items-center gap-4">
              <div className="flex-1 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                    Hiring Progress
                  </span>
                  <span className={`text-xs font-semibold ${getStatusColor(slotData?.currentStage).text}`}>
                    {getStageLabel(slotData?.currentStage)}
                  </span>
                </div>
                
                <div className="relative h-2.5 rounded-full bg-gray-200 dark:bg-gray-700">
                  <div 
                    className={`absolute h-full rounded-full transition-all duration-500 ${
                      getStatusColor(slotData?.currentStage).bg
                    }`}
                    style={{ width: `${calculateProgress(slotData?.currentStage)}%` }}
                  />
                </div>
                
                <div className="flex justify-between text-xs text-gray-600 dark:text-gray-300">
                  <span>{calculateProgress(slotData?.currentStage)}% Complete</span>
                  <span>Stage: {currentStageIndex + 1}/5</span>
                </div>
              </div>
              <div>
           
              </div>
            </div>
          ) : (
            <div className="relative w-10 h-10 mx-auto">
              <svg className="w-full h-full" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  className="stroke-current text-gray-200 dark:text-gray-700"
                  strokeWidth="8"
                  fill="none"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  className="stroke-current text-blue-500 dark:text-blue-400"
                  strokeWidth="8"
                  fill="none"
                  strokeLinecap="round"
                  strokeDasharray="251.2"
                  strokeDashoffset="100.48"
                  transform="rotate(-90 50 50)"
                />
              </svg>
            </div>
          )}
        </div>

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
          onClick={toggleTheme}
          className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 p-2 rounded-lg hover:bg-gray-100/50 dark:hover:bg-gray-700/50"
        >
          {theme === 'dark' ? (
            <Sun className="w-5 h-5" />
          ) : (
            <Moon className="w-5 h-5" />
          )}
        </button>
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