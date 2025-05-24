"use client"

import { motion } from "framer-motion"
import { useEffect, useState } from "react"

export function ComingSoon() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex items-center justify-center p-4">
      <motion.div 
        className="text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <motion.div
          className="mb-8"
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <img 
            src="/bqilogo-light.png" 
            alt="BQI Tech Logo" 
            className="h-24 mx-auto mb-6"
          />
        </motion.div>
        
        <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
          Coming Soon
        </h1>
        <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
          We're working on something exciting! Our new website will be launching soon.
        </p>
        
        <div className="flex justify-center space-x-4">
          <a 
            href="mailto:contact@bqitech.com"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors duration-200"
          >
            Contact Us
          </a>
        </div>
      </motion.div>
    </div>
  )
}
