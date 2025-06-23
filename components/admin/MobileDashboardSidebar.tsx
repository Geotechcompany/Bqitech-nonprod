import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { X, Bell } from 'lucide-react';
import Image from 'next/image';
import { signOut } from "next-auth/react";
import { menuSections } from './DashboardSidebar';

interface MobileDashboardSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MobileDashboardSidebar({ isOpen, onClose }: MobileDashboardSidebarProps) {
  const pathname = usePathname();

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9998] bg-black/50 md:hidden"
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.aside
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            transition={{ type: "spring", stiffness: 200, damping: 30 }}
            className="fixed inset-y-0 left-0 z-[9999] w-64 bg-white shadow-xl p-4 md:hidden transform"
          >
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-2 text-slate-800">
                <Image
                  src="/bqilogo.png"
                  alt="Logo"
                  width={68}
                  height={48}
                  className="rounded-lg"
                />
                <span className="font-bold text-lg">HR PORTAL</span>
              </div>
              
              <button
                onClick={onClose}
                className="p-2 hover:bg-slate-100 rounded-lg"
              >
                <X className="w-6 h-6 text-slate-600" />
              </button>
            </div>

            <nav className="space-y-4 h-[calc(100vh-160px)] overflow-y-auto">
              <Link
                href="/admin/overview"
                className={`flex items-center w-full p-2 rounded-lg text-sm
                  ${pathname === '/admin/overview' 
                    ? 'bg-sky-100 text-sky-600' 
                    : 'text-slate-600 hover:bg-slate-100'}
                `}
              >
                <span className="ml-3">Overview</span>
              </Link>

              {menuSections.map((section) => (
                <div key={section.title} className="space-y-2">
                  <div className="flex items-center w-full p-2 rounded-lg hover:bg-slate-100">
                    <span className="ml-3 text-sm font-medium">{section.title}</span>
                  </div>
                  
                  <div className="ml-4 space-y-1">
                    {section.items.map((item) => (
                      <Link
                        key={item.name}
                        href={item.href}
                        className={`flex items-center p-2 rounded-lg text-sm
                          ${pathname === item.href 
                            ? 'bg-sky-100 text-sky-600' 
                            : 'text-slate-600 hover:bg-slate-100'}
                        `}
                      >
                        <span className="ml-3">{item.name}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </nav>

            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              className="w-full mt-4 p-2 rounded-lg bg-sky-500 text-white hover:bg-sky-600"
            >
              Log Out
            </button>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
} 