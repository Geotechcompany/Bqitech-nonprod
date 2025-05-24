"use client"

import { signIn, getSession } from "next-auth/react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { toast } from "react-hot-toast"
import { useEffect, useState } from "react"
import { Shield, Sparkles } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { useForm } from "react-hook-form"

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
  const { register, handleSubmit, formState: { errors } } = useForm()
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    toast.success("Welcome! Create your account to get started.", {
      icon: "✨",
      style: {
        borderRadius: "10px",
        background: "#333",
        color: "#fff",
      },
      position: "bottom-center"
    })
  }, [])

  const onSubmit = async (data: any) => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error('Signup failed')
      }

      const result = await signIn('credentials', {
        email: data.email,
        password: data.password,
        redirect: false,
      })

      if (result?.error) {
        throw new Error(result.error)
      }

      // Check user role and redirect accordingly
      const session = await getSession()
      if (session?.user?.role === "ADMIN") {
        router.push("/admin/overview")
      } else {
        router.push("/dashboard")
      }
    } catch (error) {
      toast.error(error.message || 'Signup failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

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
          <form onSubmit={handleSubmit(onSubmit)} className="w-full space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-gray-300">Name</Label>
              <Input
                id="name"
                {...register("name", { required: true })}
                className="bg-white/5 border-gray-600/30 text-white placeholder-gray-400 backdrop-blur-sm w-full"
                placeholder="Your full name"
              />
              {errors.name && <span className="text-red-400 text-sm">Name is required</span>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-300">Email</Label>
              <Input
                id="email"
                type="email"
                {...register("email", { required: true })}
                className="bg-white/5 border-gray-600/30 text-white placeholder-gray-400 backdrop-blur-sm w-full"
                placeholder="Your email"
              />
              {errors.email && <span className="text-red-400 text-sm">Email is required</span>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-300">Password</Label>
              <Input
                id="password"
                type="password"
                {...register("password", { required: true, minLength: 6 })}
                className="bg-white/5 border-gray-600/30 text-white placeholder-gray-400 backdrop-blur-sm w-full"
                placeholder="Your password"
              />
              {errors.password && <span className="text-red-400 text-sm">Password must be at least 6 characters</span>}
            </div>

            <Button
              type="submit"
              className="bg-gradient-to-r from-[#31CDFF] to-blue-500 hover:from-white hover:to-white hover:text-[#31CDFF] text-white transition-all duration-300 w-full"
              disabled={isLoading}
            >
              {isLoading ? "Creating account..." : "Create Account"}
            </Button>
          </form>
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