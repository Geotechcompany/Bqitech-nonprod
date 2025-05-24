"use client"

import { motion } from "framer-motion"
import { ReactNode } from "react"
import { Breadcrumb } from "@/components/Breadcrumb"

interface AboutLayoutProps {
  children: ReactNode
  title: string
  subtitle: string
  breadcrumbItems: Array<{ label: string; href?: string }>
  className?: string
}

export function AboutLayout({ children, title, subtitle, breadcrumbItems, className }: AboutLayoutProps) {
  return (
    <div className="min-h-screen pt-32 pb-16 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-7xl mx-auto"
      >
        <Breadcrumb items={breadcrumbItems} />
        <h1 className="text-4xl md:text-5xl font-bold text-[#272055] mb-4">{title}</h1>
        <p className="text-xl text-gray-600 mb-12">{subtitle}</p>
        {children}
      </motion.div>
    </div>
  )
} 