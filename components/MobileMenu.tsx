import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronDown, UserCircle } from "lucide-react"
import { useState } from "react"

import { useAuth } from "@/contexts/AuthContext"
import { useRouter } from "next/navigation"

interface MobileMenuProps {
  isOpen: boolean
  onClose: () => void
}

interface MenuItem {
  title: string
  href?: string
  items?: { label: string; href: string }[]
}

const menuItems: MenuItem[] = [
  { title: "Home", href: "/" },
  { title: "Careers", href: "/careers" },
  { title: "Services",href: "/services" },
  { title: "About", href: "/about" },
  { title: "Blog", href: "/blog" },
]

function MenuItem({ item, onClose }: { item: MenuItem; onClose: () => void }) {
  const [isOpen, setIsOpen] = useState(false)

  if (item.href) {
    return (
      <Link 
        href={item.href}
        className="flex items-center py-4 px-6 text-[#31CDFF] text-[16px] font-medium hover:bg-white/5 border-b border-white/10"
        onClick={onClose}
      >
        {item.title}
      </Link>
    )
  }

  return (
    <div className="border-b border-gray-200">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full py-3 px-4 text-[15px] font-medium hover:bg-gray-50"
      >
        {item.title}
        <ChevronDown
          className={`w-4 h-4 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden bg-gray-50"
          >
            {item.items?.map((subItem) => (
              <Link
                key={subItem.href}
                href={subItem.href}
                className="block py-2 px-8 text-[14px] text-gray-600 hover:text-gray-900"
                onClick={onClose}
              >
                {subItem.label}
              </Link>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  const { isAuthenticated } = useAuth()
  const router = useRouter()

  const handleAuthClick = () => {
    if (isAuthenticated) {
      router.push("/dashboard")
    } else {
      router.push("/login")
    }
    onClose()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
            style={{ marginTop: '80px' }}
            onClick={onClose}
          />
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            transition={{ 
              type: "spring",
              stiffness: 300,
              damping: 30,
              duration: 0.3
            }}
            className="fixed top-[80px] left-0 right-0 bg-black/40 backdrop-blur-md z-50 overflow-hidden rounded-b-[15px]"
          >
            <nav className="py-2 max-h-[calc(100vh-80px)] overflow-y-auto">
              {menuItems.map((item) => (
                <MenuItem key={item.title} item={item} onClose={onClose} />
              ))}
            </nav>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}