"use client";

import React, { createContext, useContext, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { authService } from '@/lib/auth-backend'
import { User } from '@/types/user'
import { SessionExpiredDialog } from '@/components/auth/SessionExpiredDialog'

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
  refreshUserProfile: () => Promise<void>
  handleAuthError: (error: any) => void
  isEmailVerified: () => boolean
  checkEmailVerification: () => void
  updateEmailVerificationStatus: (isVerified: boolean) => void
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
  const [showSessionExpired, setShowSessionExpired] = useState(false)
  const router = useRouter()

  // Check email verification and redirect if needed
  const checkEmailVerification = () => {
    if (authState.isAuthenticated && authState.user) {
      const isVerified = authState.user.isEmailVerified || false;
      console.log('Checking email verification:', { 
        isVerified, 
        email: authState.user.email,
        user: authState.user 
      });
      
      if (!isVerified) {
        console.log('User email not verified, redirecting to verification page');
        const verifyUrl = `/auth/verify-email?email=${encodeURIComponent(authState.user.email)}`;
        router.push(verifyUrl);
        return false;
      }
      return true;
    }
    return false;
  };

  // Check email verification status
  const isEmailVerified = () => {
    return authState.user?.isEmailVerified || false;
  };

  // Auto-check email verification when user state changes
  useEffect(() => {
    if (authState.isAuthenticated && authState.user && !authState.authLoading) {
      // Only check verification for dashboard and admin routes
      const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';
      const requiresVerification = currentPath.startsWith('/dashboard') || currentPath.startsWith('/admin');
      
      if (requiresVerification && !authState.user.isEmailVerified) {
        console.log('User not verified, redirecting from:', currentPath);
        checkEmailVerification();
      }
    }
  }, [authState.isAuthenticated, authState.user, authState.authLoading]);

  // Handle authentication errors
  const handleAuthError = (error: any) => {
    console.error('Authentication error detected:', error)
    
    // Check if it's an authentication/authorization error
    const isAuthError = 
      error?.response?.status === 401 ||
      error?.status === 401 ||
      error?.message?.includes('authentication') ||
      error?.message?.includes('token') ||
      error?.message?.includes('unauthorized') ||
      error?.detail?.includes('authentication') ||
      error?.detail?.includes('token')

    // Only show session expired dialog if user was previously authenticated
    // Don't show it if user was never logged in or already logged out
    if (isAuthError && authState.isAuthenticated && authState.user) {
      console.log('Authentication error detected for authenticated user, showing session expired dialog')
      setShowSessionExpired(true)
    } else if (isAuthError && !authState.isAuthenticated) {
      console.log('Authentication error for non-authenticated user, redirecting to login')
      // For non-authenticated users, just redirect to login
      router.push('/login')
    }
  }

  useEffect(() => {
    const initAuth = async () => {
      try {
        const session = authService.getSession()
        console.log('Initial auth session:', session)
        
        if (session?.token && session?.user) {
          // Fetch complete user profile
          try {
            const profileResponse = await authService.authenticatedFetch(`${process.env.NEXT_PUBLIC_PYTHON_API_URL}/api/users/profile`)
            if (profileResponse.ok) {
              const profileData = await profileResponse.json()
              console.log('Profile data fetched on init:', profileData)
              
              setAuthState({
                isAuthenticated: true,
                isAdmin: profileData.role === 'admin',
                user: {
                  ...session.user,
                  ...profileData,
                  firstName: profileData.firstName || '',
                  lastName: profileData.lastName || ''
                },
                userRole: profileData.role,
                authLoading: false
              })
            } else {
              // Fallback to session user if profile fetch fails
              setAuthState({
                isAuthenticated: true,
                isAdmin: session.user.role === 'admin',
                user: session.user,
                userRole: session.user.role,
                authLoading: false
              })
            }
          } catch (profileError) {
            console.error('Error fetching profile on init:', profileError)
            // Fallback to session user if profile fetch fails
            setAuthState({
              isAuthenticated: true,
              isAdmin: session.user.role === 'admin',
              user: session.user,
              userRole: session.user.role,
              authLoading: false
            })
          }
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
      
      // Fetch complete user profile after login
      try {
        const profileResponse = await authService.authenticatedFetch(`${process.env.NEXT_PUBLIC_PYTHON_API_URL}/api/users/profile`)
        if (profileResponse.ok) {
          const profileData = await profileResponse.json()
          console.log('Profile data fetched:', profileData)
          
          setAuthState({
            isAuthenticated: true,
            isAdmin: profileData.role === 'admin',
            user: {
              ...response.user,
              ...profileData,
              firstName: profileData.firstName || '',
              lastName: profileData.lastName || ''
            },
            userRole: profileData.role,
            authLoading: false
          })
        } else {
          // Fallback to login response if profile fetch fails
          setAuthState({
            isAuthenticated: true,
            isAdmin: response.user.role === 'admin',
            user: response.user,
            userRole: response.user.role,
            authLoading: false
          })
        }
      } catch (profileError) {
        console.error('Error fetching profile:', profileError)
        // Fallback to login response if profile fetch fails
        setAuthState({
          isAuthenticated: true,
          isAdmin: response.user.role === 'admin',
          user: response.user,
          userRole: response.user.role,
          authLoading: false
        })
      }
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

  const refreshUserProfile = async () => {
    try {
      const session = authService.getSession()
      if (!session?.token) {
        throw new Error('No session token')
      }

      const response = await authService.authenticatedFetch(`${process.env.NEXT_PUBLIC_PYTHON_API_URL}/api/users/profile`)
      if (response.ok) {
        const profileData = await response.json()
        console.log('Profile data refreshed:', profileData)
        
        const updatedUser = {
          ...session.user,
          ...profileData,
          firstName: profileData.firstName || '',
          lastName: profileData.lastName || '',
          isEmailVerified: profileData.isEmailVerified || false
        }
        
        // Update session storage
        authService.setSession({
          ...session,
          user: updatedUser
        })
        
        setAuthState(prev => ({
          ...prev,
          user: updatedUser,
          userRole: profileData.role,
          isAdmin: profileData.role === 'admin',
          authLoading: false
        }))
        
        console.log('Auth state updated with verification status:', updatedUser.isEmailVerified)
      } else {
        console.error('Failed to refresh user profile')
        setAuthState(prev => ({
          ...prev,
          authLoading: false
        }))
      }
    } catch (error) {
      console.error('Error refreshing user profile:', error)
      setAuthState(prev => ({
        ...prev,
        authLoading: false
      }))
    }
  }

  // Method to update verification status after email verification
  const updateEmailVerificationStatus = (isVerified: boolean) => {
    if (authState.user) {
      const updatedUser = {
        ...authState.user,
        isEmailVerified: isVerified,
        name: authState.user.name || authState.user.email || `${authState.user.firstName || ''} ${authState.user.lastName || ''}`.trim()
      }
      
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
      
      console.log('Email verification status updated:', isVerified)
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
        updateUserAvatar,
        refreshUserProfile,
        handleAuthError,
        isEmailVerified,
        checkEmailVerification,
        updateEmailVerificationStatus
      }}
    >
      {children}
      
      {/* Session Expired Dialog */}
      <SessionExpiredDialog
        isOpen={showSessionExpired}
        onClose={() => setShowSessionExpired(false)}
        onRefresh={async () => {
          try {
            await refreshToken()
            setShowSessionExpired(false)
          } catch (error) {
            console.error('Failed to refresh token:', error)
            // If refresh fails, let the dialog handle logout
            throw error
          }
        }}
        countdownDuration={30}
      />
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