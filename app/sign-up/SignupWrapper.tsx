"use client"

import { Zap } from "lucide-react"
import { SignupForm } from "@/components/auth/signup-form"
import { useAuth } from "@/contexts/AuthContext"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

export default function SignupWrapper() {
  const { register } = useAuth()
  const router = useRouter()

  const handleSignup = async (email: string, password: string, name: string) => {
    try {
      await register(email, password, name)
      toast.success('Account created successfully! Please verify your email.')
      router.push(`/auth/verify-email?email=${encodeURIComponent(email)}`)
    } catch (error) {
      toast.error(error.message || 'Failed to create account')
    }
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left Panel - Gradient Background */}
      <div className="hidden lg:block relative bg-gradient-to-br from-[#31CDFF] to-blue-600">
        <div className="absolute inset-0 pattern-dots pattern-blue-500 pattern-bg-transparent pattern-opacity-20 pattern-size-4" />
        <div className="relative h-full flex flex-col justify-between p-12 text-white">
          <Zap className="w-12 h-12" />
          <div className="space-y-4">
            <h2 className="text-4xl font-bold">BQI Tech Portal</h2>
            <p className="text-lg opacity-90">
              Join our innovative platform
            </p>
          </div>
          <div className="flex gap-4 opacity-75">
            <span className="text-sm">v2.4.0</span>
            <span className="text-sm">•</span>
            <span className="text-sm">Secure Registration</span>
          </div>
        </div>
      </div>

      {/* Right Panel - Signup Form */}
      <div className="flex items-center justify-center p-8 bg-background">
        <div className="relative z-10 bg-background p-8 rounded-lg shadow-2xl w-full max-w-md">
          <SignupForm onSignup={handleSignup} />
        </div>
      </div>
    </div>
  )
} 