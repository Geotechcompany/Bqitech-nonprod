"use client"

import { SignUp } from "@clerk/nextjs"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { toast } from "react-hot-toast"
import { useEffect } from "react"
import { Shield, Sparkles } from "lucide-react"

// Floating background shapes component
function FloatingShapes() {
  return (
    <>
      {/* Animated gradient circles */}
      <motion.div
        className="absolute -left-20 -top-20 w-72 h-72 bg-[#31CDFF]/10 rounded-full blur-3xl"
        animate={{
          x: [0, 30, 0],
          y: [0, -30, 0],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      <motion.div
        className="absolute right-20 bottom-40 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl"
        animate={{
          x: [0, -20, 0],
          y: [0, 20, 0],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1
        }}
      />
      <motion.div
        className="absolute -right-20 -bottom-20 w-96 h-96 bg-gradient-to-br from-[#31CDFF]/20 to-blue-500/20 rounded-full blur-3xl"
        animate={{
          scale: [1, 1.1, 1],
          rotate: [0, 90, 0],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2
        }}
      />

      {/* Grid pattern overlay */}
      <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-[0.02]" />
    </>
  )
}

export default function SignUpPage() {
  const router = useRouter()

  useEffect(() => {
    toast.success("Welcome! Create your account to get started.", {
      icon: "✨",
      style: {
        borderRadius: "10px",
        background: "#333",
        color: "#fff",
      },
    })
  }, [])

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-[#272055] to-[#1D1640] px-4 overflow-hidden">
      <FloatingShapes />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-md z-10 pt-24 sm:pt-16 mt-16 sm:mt-0"
      >
        <div className="text-center mb-8 space-y-6 sm:space-y-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="flex items-center justify-center gap-2 mb-4 sm:mb-2"
          >
            <Sparkles className="w-5 h-5 text-[#31CDFF]" />
            <span className="text-[#31CDFF] font-medium uppercase tracking-wider text-sm">
              Get Started
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent px-4"
          >
            Create your account
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-gray-400 px-4"
          >
            Join us and unlock full access to our services
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6 }}
          className="backdrop-blur-sm bg-white/[0.02] rounded-3xl p-4 sm:p-6 shadow-xl border border-white/[0.05] mx-auto w-[calc(100%-2rem)] sm:w-full flex items-center justify-center"
        >
          <SignUp
            appearance={{
              elements: {
                formButtonPrimary: 
                  "bg-gradient-to-r from-[#31CDFF] to-blue-500 hover:from-white hover:to-white hover:text-[#31CDFF] text-white transition-all duration-300 w-full",
                card: "bg-transparent shadow-none p-0 sm:p-4 flex flex-col items-center",
                headerTitle: "hidden",
                headerSubtitle: "hidden",
                socialButtonsBlockButton: 
                  "border-gray-400/30 text-white hover:bg-white/10 backdrop-blur-sm w-full text-center",
                socialButtonsBlockButtonText: "text-white text-center",
                dividerLine: "bg-gray-600/30",
                dividerText: "text-gray-400 text-center",
                formFieldLabel: "text-gray-300 text-center w-full",
                formFieldInput: 
                  "bg-white/5 border-gray-600/30 text-white placeholder-gray-400 backdrop-blur-sm w-full text-center",
                footerActionLink: "text-[#31CDFF] hover:text-white text-center",
                footerActionText: "text-gray-300 text-center",
                footer: "hidden",
                rootBox: "bg-transparent w-full mx-auto flex flex-col items-center",
                form: "w-full mx-auto flex flex-col items-center space-y-4",
                formFieldInput__signUp: "w-full text-center",
                formFieldLabel__signUp: "w-full text-center",
                formButtonPrimary__signUp: "w-full",
                socialButtonsBlockButton__signUp: "w-full text-center",
                dividerRow: "w-full flex items-center justify-center",
                otherLoginOptions: "w-full flex flex-col items-center space-y-4",
              },
              layout: {
                socialButtonsPlacement: "bottom",
                privacyPageUrl: "/privacy",
                termsPageUrl: "/terms",
                showOptionalFields: false,
              },
            }}
            redirectUrl="/dashboard/jobs"
            afterSignUpUrl="/dashboard/jobs"
            signInUrl="/login"
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-center mt-8 space-y-4 w-full"
        >
          <div className="flex items-center justify-center gap-2 text-gray-400 text-sm">
            <Shield className="w-4 h-4" />
            <p>Protected by BQI security</p>
          </div>
          
          <p className="text-gray-300">
            Already have an account?{" "}
            <motion.span
              whileHover={{ scale: 1.05 }}
              className="text-[#31CDFF] hover:text-white cursor-pointer transition-colors"
              onClick={() => router.push('/login')}
            >
              Sign in here
            </motion.span>
          </p>
        </motion.div>
      </motion.div>
    </div>
  )
} 