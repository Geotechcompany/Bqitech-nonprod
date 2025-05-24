"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  BarChart2,
  FileText,
  Briefcase,
  Settings,
  LogOut,
  X,
  LayoutDashboard,
} from "lucide-react";
import { useClerk } from "@clerk/nextjs";

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

export default function UserDashboardSidebar({
  onClose,
}: {
  onClose?: () => void;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { signOut } = useClerk();

  const handleLogout = () => {
    signOut(() => router.push("/"));
  };

  return (
    <aside className="bg-white shadow-md p-6 h-full relative">
      <div className="flex items-center mb-6 border-b pb-4">
        <Image
          src="/bqilogo.png"
          alt="BQI Tech Logo"
          width={40}
          height={40}
          className="mr-2"
        />
        <h1 className="text-xl font-bold text-gray-800">BQI Tech</h1>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          <X className="w-6 h-6" />
        </button>
      )}
      <nav className="space-y-2">
        {tabs.map((tab) => (
          <motion.div
            key={tab.id}
            className={`rounded-lg ${
              pathname === tab.href
                ? "bg-blue-100 text-blue-800"
                : "text-gray-600 hover:bg-gray-100"
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link
              href={tab.href}
              className="flex items-center w-full px-4 py-2"
              onClick={onClose}
            >
              <tab.icon className="w-5 h-5 mr-3" />
              {tab.label}
            </Link>
          </motion.div>
        ))}
      </nav>
      <div className="absolute bottom-0 left-0 right-0 p-4">
        <motion.button
          className="flex items-center justify-center w-full bg-red-500 text-white px-4 py-2 rounded-full hover:bg-red-600 transition-colors"
          onClick={handleLogout}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <LogOut className="w-5 h-5 mr-2" />
          Logout
        </motion.button>
      </div>
    </aside>
  );
}
