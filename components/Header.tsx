"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Search, Phone, User, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { MobileMenu } from "@/components/MobileMenu"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { useSession, signOut } from "next-auth/react"

export default function Header() {
  const { data: session } = useSession()
  const router = useRouter()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const toggleMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen)

  const handleClick = () => {
    if (session) {
      router.push("/dashboard")
    } else {
      router.push("/login")
    }
  }

  return (
    <>
      <div className="w-full fixed border-b top-0 left-0 right-0 z-50 bg-white rounded-b-[20px] shadow-md overflow-hidden">
  

        {/* Main Header */}
        <header className="w-full border-b border-gray-200">
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
                className="flex items-center gap-1.5 text-[16px] font-medium hover:text-gray-600 rounded-md px-2 py-2"
              >
                Home
              </Link>

              <Link 
                href="/careers" 
                className="flex items-center gap-1.5 text-[16px] font-medium hover:text-gray-600 rounded-md px-2 py-2"
              >
                Careers
              </Link>

              <Link 
                href="/services" 
                className="flex items-center gap-1.5 text-[16px] font-medium hover:text-gray-600 rounded-md px-2 py-2"
              >
                Services
              </Link>

              <Link 
                href="/about" 
                className="flex items-center gap-1.5 text-[16px] font-medium hover:text-gray-600 rounded-md px-2 py-2"
              >
                About
              </Link>
              <Link 
                href="/blog" 
                className="flex items-center gap-1.5 text-[16px] font-medium hover:text-gray-600 rounded-md px-2 py-2"
              >
                Blog
              </Link>
            </nav>

            {/* Mobile Actions */}
            <div className="flex items-center gap-3">
              <Button 
                className="bg-[#272055] hover:bg-[#31CDFF] rounded-[20px] text-[14px] font-medium px-5 h-[36px]"
                onClick={() => router.push("/careers")}
              >
                Join Our Team
              </Button>
              <motion.button 
                className="md:hidden p-2 relative z-50 hover:bg-gray-100 rounded-full transition-colors"
                onClick={toggleMenu}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Menu 
                  className={`w-6 h-6 transition-colors duration-200 ${
                    isMobileMenuOpen ? 'text-[#31CDFF]' : 'text-[#272055]'
                  }`}
                />
              </motion.button>
            </div>
          </div>
        </header>
      </div>

      {/* Spacer for fixed header */}
      <div className="h-[120px] w-full" />

      <MobileMenu 
        isOpen={isMobileMenuOpen} 
        onClose={() => setIsMobileMenuOpen(false)} 
      />
    </>
  )
}