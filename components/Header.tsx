"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Search, Phone, User, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { MobileMenu } from "@/components/MobileMenu"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"

export default function Header() {
  const { user, isAuthenticated, logout } = useAuth()
  const router = useRouter()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const toggleMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen)

  const handleClick = () => {
    if (isAuthenticated) {
      router.push("/dashboard")
    } else {
      router.push("/login")
    }
  }

  return (
    <>
      <div className="w-full fixed top-0 left-0 right-0 z-50 bg-transparent">
        {/* Main Header */}
        <header className="w-full">
          <div className="container flex h-[80px] items-center justify-between px-6 max-w-[1400px] mx-auto">
            <Link href="/" className="flex items-center gap-2 py-4">
              <Image
                src="/bqilogo.png"
                alt="BQI Logo"
                width={300}
                height={90}
                className="h-20 w-auto"
              />
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-8">
              <Link 
                href="/" 
                className="flex items-center gap-1.5 text-[16px] font-medium text-[#31CDFF] hover:text-[#31CDFF] rounded-md px-2 py-2 transition-colors"
              >
                Home
              </Link>

              <Link 
                href="/careers" 
                className="flex items-center gap-1.5 text-[16px] font-medium text-[#31CDFF] hover:text-[#31CDFF] rounded-md px-2 py-2 transition-colors"
              >
                Careers
              </Link>

              <Link 
                href="/services" 
                className="flex items-center gap-1.5 text-[16px] font-medium text-[#31CDFF] hover:text-[#31CDFF] rounded-md px-2 py-2 transition-colors"
              >
                Services
              </Link>

              <Link 
                href="/about" 
                className="flex items-center gap-1.5 text-[16px] font-medium text-[#31CDFF] hover:text-[#31CDFF] rounded-md px-2 py-2 transition-colors"
              >
                About
              </Link>
              <Link 
                href="/blog" 
                className="flex items-center gap-1.5 text-[16px] font-medium text-[#31CDFF] hover:text-[#31CDFF] rounded-md px-2 py-2 transition-colors"
              >
                Blog
              </Link>
            </nav>

            {/* Mobile Actions */}
            <div className="flex items-center gap-3">
              <Button 
                className="bg-[#31CDFF] hover:bg-[#0052CC] text-white rounded-full text-[14px] font-medium px-8 h-10 transition-colors"
                onClick={() => router.push("/careers")}
              >
                Join Our Team
              </Button>
              <motion.button 
                className="md:hidden p-2 relative z-50 hover:bg-white/10 rounded-full transition-colors"
                onClick={toggleMenu}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Menu 
                  className="w-6 h-6 text-[#31CDFF] transition-colors duration-200"
                />
              </motion.button>
            </div>
          </div>
        </header>
      </div>

      {/* Remove or reduce spacer for fixed header */}
      <div className="h-[80px] w-full" />

      <MobileMenu 
        isOpen={isMobileMenuOpen} 
        onClose={() => setIsMobileMenuOpen(false)} 
      />
    </>
  )
}