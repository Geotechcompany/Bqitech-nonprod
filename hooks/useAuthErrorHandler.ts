"use client";

import { useAuth } from '@/contexts/AuthContext';
import { useCallback } from 'react';

export function useAuthErrorHandler() {
  const { handleAuthError } = useAuth();

  const handleError = useCallback((error: any) => {
    // Check if it's an authentication/authorization error
    const isAuthError = 
      error?.response?.status === 401 ||
      error?.status === 401 ||
      error?.message?.includes('authentication') ||
      error?.message?.includes('token') ||
      error?.message?.includes('unauthorized') ||
      error?.detail?.includes('authentication') ||
      error?.detail?.includes('token') ||
      error?.message?.includes('No authentication token');

    if (isAuthError) {
      console.log('Authentication error detected by useAuthErrorHandler:', error);
      handleAuthError(error);
      return true; // Indicates this was an auth error
    }

    return false; // Not an auth error, let normal error handling proceed
  }, [handleAuthError]);

  return { handleError };
} 