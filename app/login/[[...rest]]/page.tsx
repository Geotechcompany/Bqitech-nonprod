"use client"

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import LoginWrapper from '../LoginWrapper'
import { toast } from 'sonner'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'

export default function LoginPage() {
  const { isAuthenticated, authLoading } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirectTo')

  useEffect(() => {
    // Check for success message from logout
    const message = searchParams.get('message')
    if (message === 'Successfully logged out') {
      toast.success('Successfully logged out')
    }
  }, [searchParams])

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      router.push(redirectTo || '/dashboard')
    }
  }, [isAuthenticated, authLoading, redirectTo, router])

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="relative">
      <div className="absolute top-4 left-4 z-10">
        <Link
          href="/"
          className="flex items-center text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back to Home
        </Link>
      </div>
      <LoginWrapper />
    </div>
  )
} 