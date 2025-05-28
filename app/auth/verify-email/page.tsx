"use client"

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { Loader2, CheckCircle2, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast, { Toaster } from 'react-hot-toast'
import OtpInput from 'react-otp-input'

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

export default function EmailVerificationPage() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [otp, setOtp] = useState('')
  const searchParams = useSearchParams()
  const email = searchParams.get('email')
  const tokenParam = searchParams.get('token')

  const { handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(otpSchema)
  })

  // Auto-submit when OTP is complete
  useEffect(() => {
    if (otp.length === 6) {
      handleSubmit(onSubmit)()
    }
  }, [otp])

  const onSubmit = async () => {
    try {
      setStatus('loading')
      const response = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: otp })
      })

      if (!response.ok) {
        throw new Error(await response.text())
      }

      setStatus('success')
      toast.success('Email verified successfully!')
      // Redirect to login after 2 seconds
      setTimeout(() => window.location.href = '/login', 2000)
    } catch (error) {
      setStatus('error')
      toast.error(error.message || 'Verification failed')
      setOtp('')
    }
  }

  const handleResendCode = async () => {
    try {
      if (!email) throw new Error('No email provided for resend')
      
      const response = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })

      if (!response.ok) throw new Error('Failed to resend code')
      
      toast.success('New verification code sent!')
    } catch (error) {
      toast.error(error.message || 'Failed to resend code')
    }
  }

  return (
    <>
      <Toaster position="top-center" />
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="min-h-screen flex items-center justify-center p-4"
      >
        <Card className="w-full max-w-md">
          <CardHeader className="text-center space-y-2">
            <h1 className="text-2xl font-bold">Verify Your Email</h1>
            <p className="text-muted-foreground">
              Enter the 6-digit code sent to {email || 'your email'}
            </p>
          </CardHeader>

          <CardContent>
            <motion.form 
              onSubmit={handleSubmit(onSubmit)}
              variants={childVariants}
              className="space-y-6"
            >
              <div className="space-y-2">
                <OtpInput
                  value={otp}
                  onChange={setOtp}
                  numInputs={6}
                  renderInput={(props) => (
                    <input
                      {...props}
                      className="!w-12 h-14 text-center border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-xl"
                      disabled={status === 'loading'}
                    />
                  )}
                  containerStyle="flex justify-center gap-2"
                  inputType="number"
                  shouldAutoFocus
                />
                {errors.code?.message && (
                  <p className="text-sm text-destructive text-center">
                    {errors.code.message.toString()}
                  </p>
                )}
              </div>

              <Button 
                type="submit" 
                className="w-full h-12"
                disabled={status === 'loading' || otp.length !== 6}
              >
                {status === 'loading' ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : status === 'success' ? (
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                ) : status === 'error' ? (
                  <XCircle className="mr-2 h-4 w-4" />
                ) : null}
                {status === 'loading' ? 'Verifying...' : 'Verify Email'}
              </Button>
            </motion.form>
          </CardContent>

          <CardFooter className="flex justify-center">
            <p className="text-sm text-muted-foreground">
              Didn't receive the code?{' '}
              <Button
                variant="link"
                className="h-auto p-0 text-blue-600"
                onClick={handleResendCode}
                disabled={status === 'loading'}
              >
                Resend code
              </Button>
            </p>
          </CardFooter>
        </Card>
      </motion.div>
    </>
  )
}
