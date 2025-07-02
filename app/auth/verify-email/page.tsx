"use client"

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { Loader2, CheckCircle2, XCircle, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import OtpInput from 'react-otp-input'
import { Controller } from 'react-hook-form'
import { useRouter } from 'next/navigation'
import { authService } from '@/lib/auth-backend'
import { useAuth } from '@/contexts/AuthContext'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.3 } }
}

const childVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1 }
}

const otpSchema = z.object({
  code: z.string().length(6, 'Code must be 6 digits')
})

const initialState = 'idle'

export default function EmailVerificationPage() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>(initialState)
  const [otp, setOtp] = useState('')
  const searchParams = useSearchParams()
  const email = searchParams.get('email')
  const [error, setError] = useState('')
  const [initialEmailSent, setInitialEmailSent] = useState(false)
  const router = useRouter()
  const { updateEmailVerificationStatus } = useAuth()

  const { handleSubmit, formState: { errors }, control, setError: setFormError } = useForm<z.infer<typeof otpSchema>>({
    resolver: zodResolver(otpSchema),
    defaultValues: {
      code: ''
    }
  })

  useEffect(() => {
    if (otp.length === 6) {
      handleSubmit(onSubmit)()
    }
  }, [otp, handleSubmit])

  useEffect(() => {
    const sendInitialVerification = async () => {
      if (email && !initialEmailSent && status === 'idle') {
        try {
          setStatus('loading')
          const response = await authService.authenticatedFetch(`${process.env.NEXT_PUBLIC_PYTHON_API_URL}/api/users/resend-verification`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(email)
          })

          if (!response.ok) {
            const data = await response.json()
            throw new Error(data.detail || 'Failed to send verification')
          }
          
          toast.success('Verification code sent! Check your email.')
        } catch (error: any) {
          toast.error(error.message || 'Failed to send verification email')
        } finally {
          setStatus('idle')
          setInitialEmailSent(true)
        }
      }
    }

    const debounceTimer = setTimeout(sendInitialVerification, 500)
    return () => clearTimeout(debounceTimer)
  }, [email, initialEmailSent, status])

  const onSubmit = async (data: z.infer<typeof otpSchema>) => {
    setStatus('loading')
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_PYTHON_API_URL}/api/auth/verify-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ 
          email,
          code: data.code 
        })
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.detail || 'Verification failed')
      }

      const result = await response.json()
      setStatus('success')
      toast.success('Email verified successfully!')
      
      // Try to refresh user profile to update verification status
      try {
        await updateEmailVerificationStatus(true)
      } catch (sessionError) {
        console.error('Error updating session:', sessionError)
      }
      
      // Redirect to appropriate dashboard based on user role
      const redirectPath = result.user?.role === 'admin' ? '/admin' : '/dashboard'
      setTimeout(() => {
        router.push(redirectPath)
      }, 1500)
      
    } catch (error) {
      setStatus('error')
      toast.error(error.message || 'Verification failed')
      setOtp('')
    }
  }

  const handleResendCode = async () => {
    try {
      if (!email || status === 'loading') {
        throw new Error('Operation in progress')
      }
      
      setStatus('loading')
      const response = await authService.authenticatedFetch(`${process.env.NEXT_PUBLIC_PYTHON_API_URL}/api/users/resend-verification`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(email)
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.detail || 'Failed to resend code')
      }
      
      toast.success('New verification code sent!')
    } catch (error: any) {
      toast.error(error.message || 'Failed to resend code')
    } finally {
      setStatus('idle')
    }
  }

  const handleInputChange = (value: string) => {
    setOtp(value)
    if (error) setError('')
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left Panel - Gradient Background (Same as Login) */}
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
            <span className="text-sm">Secure Verification</span>
          </div>
        </div>
      </div>

      {/* Right Panel - Adjusted for mobile */}
      <div className="flex items-center justify-center p-8 bg-background sm:px-4">
        <div className="relative z-10 bg-background p-8 rounded-lg shadow-2xl w-full max-w-[90%] sm:max-w-md">
          <Card className="w-full">
            <CardHeader className="text-center space-y-2">
              <h1 className="text-3xl sm:text-2xl font-bold">Verify Your Email</h1>
              <p className="text-muted-foreground text-sm sm:text-base">
                Enter the 6-digit code sent to <br className="sm:hidden" />{email || 'your email'}
              </p>
            </CardHeader>

            <CardContent>
              <motion.form 
                onSubmit={handleSubmit(onSubmit)}
                variants={childVariants}
                className="space-y-6"
              >
                <div className="space-y-2">
                  <Controller
                    name="code"
                    control={control}
                    render={({ field }) => (
                      <OtpInput
                        {...field}
                        value={otp}
                        onChange={(value) => {
                          field.onChange(value)
                          handleInputChange(value)
                        }}
                        numInputs={6}
                        renderInput={(props) => (
                          <input
                            {...props}
                            className="!w-10 h-12 sm:!w-12 sm:h-14 text-center border rounded-md 
                                     focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg sm:text-xl"
                            disabled={status === 'loading'}
                          />
                        )}
                        containerStyle="flex justify-center gap-2 sm:gap-4"
                        inputType="number"
                        shouldAutoFocus
                      />
                    )}
                  />
                  {errors.code && (
                    <p className="text-sm text-destructive text-center">
                      {errors.code.message}
                    </p>
                  )}
                </div>

                <Button 
                  type="submit" 
                  className="w-full h-12 text-sm sm:text-base"
                  disabled={status === 'loading' || otp.length !== 6}
                >
                  {status === 'loading' ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Verifying...
                    </>
                  ) : status === 'success' ? (
                    <>
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      Verified
                    </>
                  ) : status === 'error' ? (
                    <>
                      <XCircle className="mr-2 h-4 w-4" />
                      Try Again
                    </>
                  ) : null}
                </Button>
              </motion.form>
            </CardContent>

            <CardFooter className="flex justify-center">
              <p className="text-sm text-muted-foreground text-center">
                Didn't receive the code?{' '}
                <Button
                  variant="link"
                  className="h-auto p-0 text-blue-600 whitespace-nowrap"
                  onClick={handleResendCode}
                  disabled={status === 'loading'}
                >
                  {status === 'loading' ? 'Sending...' : 'Resend code'}
                </Button>
              </p>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
}
