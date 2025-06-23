"use client"

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import LoginWrapper from '../LoginWrapper'

export default function LoginPage() {
  const { isAuthenticated, authLoading } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirectTo')

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

  return <LoginWrapper />
} 