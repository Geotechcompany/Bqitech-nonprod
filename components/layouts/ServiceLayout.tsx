"use client"

import { motion } from "framer-motion"
import { Breadcrumb } from "@/components/Breadcrumb"

interface ServiceLayoutProps {
  title: string
  subtitle: string
  breadcrumbItems: Array<{ label: string; href?: string }>
  children: React.ReactNode
}

export function ServiceLayout({ 
  title, 
  subtitle, 
  breadcrumbItems, 
  children 
}: ServiceLayoutProps) {
  return (
    <div className="container mx-auto px-4 py-40">
      <motion.div
        className="mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Breadcrumb items={breadcrumbItems} />
        <h1 className="text-4xl font-bold mb-2 text-blue-600">{title}</h1>
        <p className="text-xl text-gray-600 mb-8">{subtitle}</p>
      </motion.div>
      {children}
    </div>
  )
} 