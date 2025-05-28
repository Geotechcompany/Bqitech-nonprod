"use client"

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import toast from 'react-hot-toast'

export default function VerifyEmailPage() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  useEffect(() => {
    const verifyToken = async () => {
      try {
        const response = await fetch('/api/auth/verify-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token })
        })

        if (!response.ok) {
          throw new Error('Invalid or expired verification token')
        }

        setStatus('success')
        toast.success('Email verified successfully!')
      } catch (error) {
        setStatus('error')
        toast.error(error.message)
      }
    }

    if (token) verifyToken()
  }, [token])

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-4 text-center">
        {status === 'loading' && (
          <>
            <Loader2 className="h-12 w-12 animate-spin mx-auto" />
            <h1 className="text-2xl font-bold">Verifying your email...</h1>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="text-green-500">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold">Email Verified!</h1>
            <p>Your email address has been successfully verified.</p>
            <Button asChild>
              <a href="/dashboard">Go to Dashboard</a>
            </Button>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="text-red-500">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold">Verification Failed</h1>
            <p>The verification link is invalid or has expired.</p>
            <Button asChild>
              <a href="/sign-up">Try Again</a>
            </Button>
          </>
        )}
      </div>
    </div>
  )
} 