"use client"

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { Loader2, CheckCircle2, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card'
import toast, { Toaster } from 'react-hot-toast'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.3 } }
}

const childVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1 }
}

export default function EmailVerificationPage() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        if (!token) throw new Error('Missing verification token')

        const response = await fetch('/api/auth/verify-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token })
        })

        if (!response.ok) throw new Error(await response.text())

        setStatus('success')
        toast.success('Email verified successfully!')
      } catch (error) {
        console.error('Verification error:', error)
        setStatus('error')
        toast.error(error.message || 'Email verification failed')
      }
    }

    verifyEmail()
  }, [token])

  return (
    <>
      <Toaster position="top-center" toastOptions={{
        className: 'bg-white text-gray-900 shadow-lg',
        success: { iconTheme: { primary: '#10B981', secondary: 'white' } },
        error: { iconTheme: { primary: '#EF4444', secondary: 'white' } }
      }} />
      
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4"
      >
        <Card className="w-full max-w-md shadow-xl rounded-2xl overflow-hidden">
          <CardHeader className="border-b p-6">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Email Verification
            </h1>
          </CardHeader>

          <CardContent className="p-6 space-y-6">
            <motion.div
              key={status}
              variants={childVariants}
              className="flex flex-col items-center text-center space-y-4"
            >
              {status === 'loading' && (
                <>
                  <div className="relative h-16 w-16">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                      className="absolute inset-0 border-4 border-blue-200 border-t-blue-600 rounded-full"
                    />
                    <Loader2 className="h-12 w-12 text-blue-600 absolute inset-0 m-auto animate-pulse" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900">Check Your Email</h2>
                  <p className="text-gray-600">
                    We've sent a verification link to your email address. Please:
                  </p>
                  <ul className="text-sm text-gray-600 list-disc list-inside text-left">
                    <li>Check your inbox for the verification email</li>
                    <li>Look in your spam/junk folder if you don't see it</li>
                    <li>Allow 5-10 minutes for delivery</li>
                  </ul>
                </>
              )}

              {status === 'success' && (
                <>
                  <div className="relative h-16 w-16">
                    <div className="absolute inset-0 bg-green-100 rounded-full animate-ping" />
                    <CheckCircle2 className="h-16 w-16 text-green-600 relative" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900">Verification Successful!</h2>
                  <p className="text-gray-600">
                    Your email address has been successfully verified and activated
                  </p>
                </>
              )}

              {status === 'error' && (
                <>
                  <div className="relative h-16 w-16">
                    <div className="absolute inset-0 bg-red-100 rounded-full animate-ping" />
                    <XCircle className="h-16 w-16 text-red-600 relative" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900">Verification Failed</h2>
                  <p className="text-gray-600">
                    The link is invalid or expired. Please check your email again or:
                  </p>
                  <ul className="text-sm text-gray-600 list-disc list-inside text-left">
                    <li>Ensure you're using the most recent verification email</li>
                    <li>Check your spam/junk folder</li>
                    <li>Request a new verification link if needed</li>
                  </ul>
                </>
              )}
            </motion.div>
          </CardContent>

          <CardFooter className="border-t p-6">
            <div className="w-full flex justify-center space-x-4">
              {status === 'success' ? (
                <Button
                  asChild
                  className="rounded-full px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  <a href="/login">Continue to Login</a>
                </Button>
              ) : status === 'error' ? (
                <Button
                  asChild
                  variant="outline"
                  className="rounded-full px-8 py-4 border-blue-600 text-blue-600 hover:bg-blue-50"
                >
                  <a href="/sign-up">Try Again</a>
                </Button>
              ) : null}
            </div>
          </CardFooter>
        </Card>
      </motion.div>
    </>
  )
} 