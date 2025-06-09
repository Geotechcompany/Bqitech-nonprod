"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { Loader } from '@/components/ui/loader'
import { motion } from "framer-motion"
import { Mail, Lock, Github, Chrome, ArrowRight, UserPlus } from "lucide-react"
import Link from "next/link"

const formSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

export function LoginForm({ 
  providers,
  onError 
}: { 
  providers: any,
  onError?: (error: string) => void 
}) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  })

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    try {
      setIsLoading(true)

      const result = await signIn('credentials', {
        email: data.email,
        password: data.password,
        redirect: false,
      })

      if (result?.error) {
        toast.error(result.error)
        onError?.(result.error)
        return
      }
      
      if (result?.ok) {
        // Check email verification status from API
        const verificationCheck = await fetch('/api/auth/check-email?email=' + encodeURIComponent(data.email))
        const verificationData = await verificationCheck.json()

        if (!verificationData.isVerified) {
          router.push(`/auth/verify-email?email=${encodeURIComponent(data.email)}`)
        } else {
          window.location.href = "/dashboard"
        }
      }
    } catch (error) {
      console.error('Login error:', error)
      toast.error('An error occurred during login. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full space-y-8"
    >
      <div className="text-center space-y-2">
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-bold"
        >
          Welcome Back
        </motion.h1>
        <p className="text-muted-foreground">
          Sign in to your account
        </p>
      </div>

      <motion.form
        onSubmit={handleSubmit(onSubmit)}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="space-y-6"
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <Input
              type="email"
              placeholder="Email"
              {...register('email')}
              error={errors.email?.message}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Input
                type="password"
                placeholder="Password"
                {...register('password')}
                error={errors.password?.message}
              />
              <Link
                href="/forgot-password"
                className="text-sm font-medium text-[#31CDFF] hover:text-[#31CDFF]/90"
              >
                Forgot password?
              </Link>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full h-12 text-base bg-gradient-to-r from-[#31CDFF] to-blue-500 hover:from-[#31CDFF]/90 hover:to-blue-500/90"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader className="mr-2" />
                Signing In...
              </>
            ) : (
              <>
                Sign In
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </>
            )}
          </Button>
        </div>

        <div className="text-center text-sm text-muted-foreground">
          Don't have an account?{" "}
          <Link
            href="/sign-up"
            className="font-medium text-[#31CDFF] hover:underline"
          >
            Sign up
          </Link>
        </div>
      </motion.form>
    </motion.div>
  )
} 