"use client";

import React, { createContext, useContext, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { authService } from '@/lib/auth-backend'
import { User } from '@/types/user'

interface AuthContextType {
  isAuthenticated: boolean
  isAdmin: boolean
  user: User | null
  userRole?: string
  authLoading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  refreshToken: () => Promise<void>
  register: (email: string, password: string, name: string) => Promise<void>
  updateUserAvatar: (avatarUrl: string) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [authState, setAuthState] = useState({
    isAuthenticated: false,
    isAdmin: false,
    user: null as User | null,
    userRole: undefined as string | undefined,
    authLoading: true
  })
  const router = useRouter()

  useEffect(() => {
    const initAuth = () => {
      try {
        const session = authService.getSession()
        console.log('Initial auth session:', session)
        
        if (session?.token && session?.user) {
          setAuthState({
            isAuthenticated: true,
            isAdmin: session.user.role === 'admin',
            user: session.user,
            userRole: session.user.role,
            authLoading: false
          })
        } else {
          setAuthState(prev => ({ ...prev, authLoading: false }))
        }
      } catch (error) {
        console.error('Auth initialization error:', error)
        setAuthState(prev => ({ ...prev, authLoading: false }))
      }
    }

    initAuth()
  }, [])

  const login = async (email: string, password: string) => {
    try {
      const response = await authService.login(email, password)
      console.log('Login successful:', response)
      
      setAuthState({
        isAuthenticated: true,
        isAdmin: response.user.role === 'admin',
        user: response.user,
        userRole: response.user.role,
        authLoading: false
      })
    } catch (error) {
      console.error('Login error:', error)
      setAuthState(prev => ({
        ...prev,
        isAuthenticated: false,
        isAdmin: false,
        user: null,
        userRole: undefined,
        authLoading: false
      }))
      throw error
    }
  }

  const register = async (email: string, password: string, name: string) => {
    try {
      const response = await authService.register(email, password, name)
      console.log('Registration successful:', response)
      
      setAuthState({
        isAuthenticated: true,
        isAdmin: response.user.role === 'admin',
        user: response.user,
        userRole: response.user.role,
        authLoading: false
      })
    } catch (error) {
      console.error('Registration error:', error)
      setAuthState(prev => ({
        ...prev,
        isAuthenticated: false,
        isAdmin: false,
        user: null,
        userRole: undefined,
        authLoading: false
      }))
      throw error
    }
  }

  const logout = async () => {
    try {
      await authService.logout()
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      setAuthState({
        isAuthenticated: false,
        isAdmin: false,
        user: null,
        userRole: undefined,
        authLoading: false
      })
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
      const newSession = {
        ...session,
        token: data.access_token,
        refreshToken: data.refresh_token
      }

      authService.setSession(newSession)
    } catch (error) {
      console.error('Token refresh failed:', error)
      authService.clearSession()
      setAuthState(prev => ({
        ...prev,
        isAuthenticated: false,
        isAdmin: false,
        user: null,
        userRole: undefined,
        authLoading: false
      }))
      router.push('/login')
    }
  }

  const updateUserAvatar = (avatarUrl: string) => {
    if (!authState.user) return

    const updatedUser = {
      ...authState.user,
      avatar: avatarUrl,
      name: authState.user.firstName && authState.user.lastName 
        ? `${authState.user.firstName} ${authState.user.lastName}` 
        : authState.user.email,
      isEmailVerified: authState.user.isEmailVerified || false
    }

    // Update local state
    setAuthState(prev => ({
      ...prev,
      user: updatedUser
    }))

    // Update session storage
    const currentSession = authService.getSession()
    if (currentSession) {
      authService.setSession({
        ...currentSession,
        user: updatedUser
      })
    }
  }

  console.log('Auth State Debug:', authState)

  return (
    <AuthContext.Provider
      value={{
        ...authState,
        login,
        logout,
        refreshToken,
        register,
        updateUserAvatar
      }}
    >
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
  const { user, authLoading } = useAuth();
  
  return {
    data: user ? { user, expires: new Date(Date.now() + 30 * 60 * 1000).toISOString() } : null,
    status: authLoading ? 'loading' : user ? 'authenticated' : 'unauthenticated',
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