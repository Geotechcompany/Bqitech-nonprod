"use client"

// Add new imports at the top
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { PasswordStrengthMeter } from "@/components/auth/password-strength-meter"

import zxcvbn from "zxcvbn"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import Link from "next/link"
import { useState, useEffect } from "react"
import { Loader2, CheckCircle, XCircle, Eye, EyeOff } from "lucide-react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Zap } from "lucide-react"
import { useRouter } from "next/navigation"
import { useForm, FieldError } from "react-hook-form"
import toast from "react-hot-toast"
import { Turnstile } from "@marsidev/react-turnstile"
import { rateLimit } from '@/lib/rate-limit'
import ReCAPTCHA from "react-google-recaptcha"

// Add schema validation
const formSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters").max(50),
  lastName: z.string().min(2, "Last name must be at least 2 characters").max(50),
  email: z.string().email("Invalid email address"),
  password: z.string()
    .min(12, "Password must be at least 12 characters")
    .refine(password => zxcvbn(password).score >= 3, 
      "Password is too weak (minimum strength: 3/4)"),
  confirmPassword: z.string(),
  token: z.string().min(20, "Security check required")
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
})

export default function SignUpPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()
  
  // Add form initialization here
  const { register, handleSubmit, formState: { errors }, watch, setError, setValue } = useForm({
    resolver: zodResolver(formSchema)
  })

  // Password strength calculation
  const password = watch("password", "")
  const passwordStrength = zxcvbn(password)

  // Add state for captcha
  const [captchaKey, setCaptchaKey] = useState(Date.now())

  // Add new state variables at the top of the component
  const [emailQuery, setEmailQuery] = useState('')
  const [isEmailAvailable, setIsEmailAvailable] = useState<boolean | null>(null)
  const [isCheckingEmail, setIsCheckingEmail] = useState(false)

  // Add this useEffect hook for email availability check
  useEffect(() => {
    const checkEmailAvailability = async () => {
      if (!emailQuery || !z.string().email().safeParse(emailQuery).success) {
        setIsEmailAvailable(null)
        return
      }
      
      setIsCheckingEmail(true)
      try {
        const res = await fetch(`/api/auth/check-email?email=${encodeURIComponent(emailQuery)}`)
        if (!res.ok) throw new Error('Email check failed')
        const data = await res.json()
        setIsEmailAvailable(data.available)
      } catch (error) {
        console.error('Email availability check failed:', error)
        setIsEmailAvailable(null)
      } finally {
        setIsCheckingEmail(false)
      }
    }

    const debounceTimer = setTimeout(checkEmailAvailability, 500)
    return () => clearTimeout(debounceTimer)
  }, [emailQuery])

  // Add showPassword state
  const [showPassword, setShowPassword] = useState(false)
  const [isPasswordFocused, setIsPasswordFocused] = useState(false)

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    const toastId = toast.loading('Creating account...')
    try {
      // Rate limiting via API
      const limitResponse = await fetch('/api/rate-limit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: data.email })
      })
      
      const { success } = await limitResponse.json()
      if (!success) {
        throw new Error("Too many attempts. Please try again later.")
      }

      // Final email check
      const emailCheck = await fetch(`/api/auth/check-email?email=${encodeURIComponent(data.email)}`)
      if (!emailCheck.ok || !(await emailCheck.json()).available) {
        throw new Error('This email is already registered')
      }

      setIsSubmitting(true)
      
      // Add error handling for the fetch request
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: `${data.firstName} ${data.lastName}`,
          email: data.email,
          password: data.password,
          token: data.token
        })
      })

      const responseData = await response.json()
      
      if (!response.ok) {
        throw new Error(responseData.error || 'Registration failed. Please try again.')
      }

      // Remove client-side token generation and storage
      // Keep only the redirection
      toast.success('Verification code sent! Check your email.', { 
        id: toastId,
        duration: 5000 
      })
      router.push(`/auth/verify-email?email=${encodeURIComponent(data.email)}`)
    } catch (error) {
      console.error('Signup error:', error)
      setCaptchaKey(Date.now())
      toast.error(error.message || 'Account creation failed', { 
        id: toastId,
        duration: 4000
      })
      
      if (error.message.includes('captcha') || error.message.includes('security')) {
        setError("token", { message: "Security check failed. Please try again." })
      }
      
      if (error.message.includes('email')) {
        setEmailQuery('')
        setIsEmailAvailable(null)
        setError("email", { message: error.message })
      }
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

            {/* Email Field with status indicators */}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Input
                  id="email"
                  type="email"
                  {...register("email")}
                  onChange={(e) => {
                    register("email").onChange(e)
                    setEmailQuery(e.target.value)
                  }}
                  className="h-12 focus:ring-2 focus:ring-[#31CDFF] pr-10"
                />
                <div className="absolute right-3 top-3">
                  {isCheckingEmail ? (
                    <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
                  ) : isEmailAvailable === true ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : isEmailAvailable === false ? (
                    <XCircle className="h-5 w-5 text-red-500" />
                  ) : null}
                </div>
              </div>
              {errors.email && (
                <p className="text-sm text-red-500">{(errors.email as FieldError).message}</p>
              )}
            </div>

            {/* Password Field with Strength Meter */}
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  {...register("password")}
                  className="h-12 focus:ring-2 focus:ring-[#31CDFF] pr-10"
                  onFocus={() => setIsPasswordFocused(true)}
                  onBlur={() => setIsPasswordFocused(false)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
              {password.length > 0 && (
                <PasswordStrengthMeter 
                  password={password}
                  strengthResult={passwordStrength} 
                />
              )}
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

            {/* CAPTCHA Component */}
            <ReCAPTCHA
              sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY!}
              onChange={(token) => setValue("token", token)}
            />

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