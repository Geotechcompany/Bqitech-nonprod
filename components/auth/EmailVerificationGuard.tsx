"use client";

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, Mail, Shield } from 'lucide-react';
import { motion } from 'framer-motion';

interface EmailVerificationGuardProps {
  children: React.ReactNode;
  requireVerification?: boolean;
}

// Paths that don't require email verification
const noVerificationPaths = [
  '/auth/verify-email',
  '/login',
  '/sign-up',
  '/forgot-password',
  '/reset-password',
  '/logout'
];

export function EmailVerificationGuard({ 
  children, 
  requireVerification = true 
}: EmailVerificationGuardProps) {
  const { user, isAuthenticated, authLoading, isEmailVerified } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkVerification = async () => {
      // Skip verification check if disabled or on exempt paths
      if (!requireVerification || noVerificationPaths.some(path => pathname.startsWith(path))) {
        setIsChecking(false);
        return;
      }

      // Wait for auth to load
      if (authLoading) {
        return;
      }

      // If user is not authenticated, let other auth guards handle it
      if (!isAuthenticated || !user) {
        setIsChecking(false);
        return;
      }

      // Check if email is verified
      const isVerified = isEmailVerified();
      console.log('EmailVerificationGuard - Verification check:', {
        pathname,
        isVerified,
        userEmail: user.email,
        isEmailVerified: user.isEmailVerified
      });

      if (!isVerified) {
        console.log('Email not verified, redirecting to verification page');
        const verifyUrl = `/auth/verify-email?email=${encodeURIComponent(user.email)}`;
        router.push(verifyUrl);
        return;
      }

      setIsChecking(false);
    };

    checkVerification();
  }, [
    isAuthenticated, 
    user, 
    authLoading, 
    pathname, 
    requireVerification, 
    isEmailVerified, 
    router
  ]);

  // Show loading screen while checking verification
  if (isChecking || authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-100/20 dark:from-gray-900 dark:via-blue-950/30 dark:to-indigo-950/20 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center p-8"
        >
          <div className="relative mb-6">
            <div className="w-20 h-20 mx-auto bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-full flex items-center justify-center backdrop-blur-sm border border-blue-200/50">
              <Shield className="h-10 w-10 text-blue-500" />
            </div>
            <motion.div
              className="absolute -top-1 -right-1 text-blue-400"
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            >
              <Loader2 className="h-6 w-6" />
            </motion.div>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Verifying Access
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Checking your email verification status...
          </p>
        </motion.div>
      </div>
    );
  }

  // If we reach here, verification passed or is not required
  return <>{children}</>;
} 