'use client'

import { motion } from 'framer-motion'

export default function Loader() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-white bg-opacity-50 backdrop-blur-md z-50">
      <div className="relative w-24 h-24">
        <motion.div
          className="absolute inset-0 border-4 border-blue-500 rounded-full"
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 360],
            borderRadius: ["50%", "25%", "50%"],
          }}
          transition={{
            duration: 2,
            ease: "easeInOut",
            times: [0, 0.5, 1],
            repeat: Infinity,
          }}
        />
        <motion.div
          className="absolute inset-0 border-4 border-green-500 rounded-full"
          animate={{
            scale: [1.2, 1, 1.2],
            rotate: [0, -360],
            borderRadius: ["25%", "50%", "25%"],
          }}
          transition={{
            duration: 2,
            ease: "easeInOut",
            times: [0, 0.5, 1],
            repeat: Infinity,
          }}
        />
        <motion.div
          className="absolute inset-0 flex items-center justify-center text-blue-600 font-bold"
          animate={{
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: 2,
            ease: "easeInOut",
            times: [0, 0.5, 1],
            repeat: Infinity,
          }}
        >
          Loading
        </motion.div>
      </div>
    </div>
  )
}
