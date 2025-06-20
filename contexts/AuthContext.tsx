"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { authService, User, SessionData } from '@/lib/auth-backend';

interface AuthContextType {
  user: User | null;
  session: SessionData | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<SessionData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasCheckedSession, setHasCheckedSession] = useState(false);

  // Check for existing session on mount (only once)
  useEffect(() => {
    if (!hasCheckedSession) {
      checkSession();
    }
  }, [hasCheckedSession]);

  const checkSession = async () => {
    try {
      setIsLoading(true);
      setHasCheckedSession(true);
      
      const currentSession = authService.getSession();
      
      if (currentSession) {
        setSession(currentSession);
        setUser(currentSession.user);
        console.log('Session found:', currentSession.user.role);
      } else {
        setSession(null);
        setUser(null);
        console.log('No session found');
      }
    } catch (error) {
      console.error('Session check error:', error);
      setSession(null);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const response = await authService.login(email, password);
      
      // Let authService handle the session, then get it
      const storedSession = authService.getSession();
      
      if (storedSession) {
        setSession(storedSession);
        setUser(storedSession.user);
      }
      
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, password: string, name: string) => {
    try {
      setIsLoading(true);
      const response = await authService.register(email, password, name);
      
      const newSession = {
        user: response.user,
        token: response.access_token,
        expires: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 minutes
      };
      
      setSession(newSession);
      setUser(response.user);
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setSession(null);
      setUser(null);
    }
  };

  const refreshSession = async () => {
    try {
      const refreshed = await authService.refreshToken();
      
      if (refreshed) {
        const newSession = {
          user: refreshed.user,
          token: refreshed.access_token,
          expires: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
        };
        
        setSession(newSession);
        setUser(refreshed.user);
      } else {
        setSession(null);
        setUser(null);
      }
    } catch (error) {
      console.error('Session refresh error:', error);
      setSession(null);
      setUser(null);
    }
  };

  const isAdmin = user?.role?.toLowerCase() === 'admin' || user?.role?.toLowerCase() === 'super_admin';

  const contextValue: AuthContextType = {
    user,
    session,
    isLoading,
    isAuthenticated: user !== null,
    isAdmin,
    login,
    register,
    logout,
    refreshSession,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
}

// Compatibility hooks for easier migration from NextAuth
export function useSession() {
  const { session, user, isLoading } = useAuth();
  
  return {
    data: session ? { user, expires: session.expires } : null,
    status: isLoading ? 'loading' : session ? 'authenticated' : 'unauthenticated',
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