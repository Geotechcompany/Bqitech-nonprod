"use client"

// Add new imports at the top
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { PasswordStrengthMeter } from "@/components/auth/password-strength-meter"
import { cn } from "@/lib/utils"
import zxcvbn from "zxcvbn"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import Link from "next/link"
import { useState } from "react"
import { Loader2 } from "lucide-react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Zap } from "lucide-react"
import { useRouter } from "next/navigation"
import { useForm, FieldError } from "react-hook-form"
import { toast } from "sonner"

// Add schema validation
const formSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .refine(password => zxcvbn(password).score >= 2, 
      "Password is too weak"),
  confirmPassword: z.string()
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
})

export default function SignUpPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()
  
  // Add form initialization here
  const { register, handleSubmit, formState: { errors }, watch } = useForm({
    resolver: zodResolver(formSchema)
  })

  // Password strength calculation
  const password = watch("password", "")
  const passwordStrength = zxcvbn(password)

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    setIsSubmitting(true)
    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: `${data.firstName} ${data.lastName}`,
          email: data.email,
          password: data.password
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || errorData.message || 'Signup failed')
      }
      
      router.push('/dashboard')
    } catch (error) {
      toast.error(error.message || 'Signup failed. Please try again.', {
        duration: 10000,
        action: {
          label: 'Contact Support',
          onClick: () => window.open('mailto:support@bqitech.com')
        },
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Update the form section
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
              Empowering innovation through secure access
            </p>
          </div>
          <div className="flex gap-4 opacity-75">
            <span className="text-sm">v2.4.0</span>
            <span className="text-sm">•</span>
            <span className="text-sm">Secure Signup</span>
          </div>
        </div>
      </div>

      {/* Right Panel - Signup Form */}
      <div className="flex items-center justify-center p-8 bg-background">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md space-y-8"
        >
          <div className="text-center space-y-2">
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-3xl font-bold"
            >
              Create your account
            </motion.h1>
            <p className="text-muted-foreground">
              Get started with our platform
            </p>
          </div>

          <motion.form
            onSubmit={handleSubmit(onSubmit)}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-6"
          >
            <div className="grid grid-cols-2 gap-4">
              {/* First Name Field */}
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  {...register("firstName")}
                  className="h-12 focus:ring-2 focus:ring-[#31CDFF]"
                />
                {errors.firstName && (
                  <p className="text-sm text-red-500">{(errors.firstName as FieldError).message}</p>
                )}
              </div>

              {/* Last Name Field */}
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  {...register("lastName")}
                  className="h-12 focus:ring-2 focus:ring-[#31CDFF]"
                />
                {errors.lastName && (
                  <p className="text-sm text-red-500">{(errors.lastName as FieldError).message}</p>
                )}
              </div>
            </div>

            {/* Email Field */}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                {...register("email")}
                className="h-12 focus:ring-2 focus:ring-[#31CDFF]"
              />
              {errors.email && (
                <p className="text-sm text-red-500">{(errors.email as FieldError).message}</p>
              )}
            </div>

            {/* Password Field with Strength Meter */}
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                {...register("password")}
                className="h-12 focus:ring-2 focus:ring-[#31CDFF]"
              />
              <PasswordStrengthMeter strengthResult={passwordStrength} />
              {errors.password && (
                <p className="text-sm text-red-500">{(errors.password as FieldError).message}</p>
              )}
            </div>

            {/* Confirm Password Field */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                {...register("confirmPassword")}
                className="h-12 focus:ring-2 focus:ring-[#31CDFF]"
              />
              {errors.confirmPassword && (
                <p className="text-sm text-red-500">{(errors.confirmPassword as FieldError).message}</p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full h-12 text-base bg-[#31CDFF] hover:bg-[#31CDFF]/90"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Account...
                </>
              ) : (
                "Sign Up"
              )}
            </Button>
          </motion.form>

          <div className="text-center text-sm text-muted-foreground">
            <p>
              Already have an account?{" "}
              <Link
                href="/login"
                className="font-medium text-[#31CDFF] hover:underline"
              >
                Sign in
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}