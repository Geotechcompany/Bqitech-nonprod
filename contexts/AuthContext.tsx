"use client";

import React, { createContext, useContext, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { authService, type User, type SessionData } from '@/lib/auth-backend'

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isAdmin: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  refreshToken: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const initAuth = async () => {
      try {
        const session = authService.getSession()
        if (session) {
          setUser(session.user)
        }
      } catch (error) {
        console.error('Failed to initialize auth:', error)
      } finally {
        setIsLoading(false)
      }
    }

    initAuth()
  }, [])

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_PYTHON_API_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.detail || 'Login failed')
      }

      const data = await response.json()
      const session: SessionData = {
        user: data.user,
        token: data.access_token,
        refreshToken: data.refresh_token
      }

      authService.setSession(session)
      setUser(session.user)

      if (!session.user.isEmailVerified) {
        router.push(`/auth/verify-email?email=${encodeURIComponent(email)}`)
        throw new Error('VERIFICATION_REQUIRED')
      }

      router.push('/dashboard')
    } catch (error: any) {
      throw error
    }
  }

  const logout = async () => {
    try {
      const session = authService.getSession()
      if (session) {
        await fetch(`${process.env.NEXT_PUBLIC_PYTHON_API_URL}/api/auth/logout`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.token}`
          },
          credentials: 'include'
        })
      }
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      authService.clearSession()
      setUser(null)
      router.push('/login')
    }
  }

  const refreshToken = async () => {
    try {
      const session = authService.getSession()
      if (!session?.refreshToken) {
        throw new Error('No refresh token')
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_PYTHON_API_URL}/api/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          refresh_token: session.refreshToken
        })
      })

      if (!response.ok) {
        throw new Error('Failed to refresh token')
      }

      const data = await response.json()
      const newSession: SessionData = {
        ...session,
        token: data.access_token,
        refreshToken: data.refresh_token
      }

      authService.setSession(newSession)
    } catch (error) {
      console.error('Token refresh failed:', error)
      authService.clearSession()
      setUser(null)
      router.push('/login')
    }
  }

  const value = {
    user,
    isAuthenticated: !!user,
    isAdmin: user?.role?.toUpperCase() === 'ADMIN' || user?.role?.toUpperCase() === 'SUPER_ADMIN',
    isLoading,
    login,
    logout,
    refreshToken
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// Compatibility hooks for easier migration from NextAuth
export function useSession() {
  const { user, isLoading } = useAuth();
  
  return {
    data: user ? { user, expires: new Date(Date.now() + 30 * 60 * 1000).toISOString() } : null,
    status: isLoading ? 'loading' : user ? 'authenticated' : 'unauthenticated',
  };
}

export function signIn(provider?: string, options?: any) {
  // For now, redirect to login page
  if (typeof window !== 'undefined') {
    const callbackUrl = options?.callbackUrl || '/dashboard';
    window.location.href = `/login?callbackUrl=${encodeURIComponent(callbackUrl)}`;
  }
}

export function signOut(options?: any) {
  const { logout } = useAuth();
  logout().then(() => {
    if (typeof window !== 'undefined') {
      const callbackUrl = options?.callbackUrl || '/';
      window.location.href = callbackUrl;
    }
  });
} 