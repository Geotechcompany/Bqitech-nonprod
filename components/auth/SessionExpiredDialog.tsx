"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Clock, RefreshCw, LogOut, AlertTriangle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";

interface SessionExpiredDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onRefresh?: () => Promise<void>;
  countdownDuration?: number; // in seconds
}

export function SessionExpiredDialog({
  isOpen,
  onClose,
  onRefresh,
  countdownDuration = 30
}: SessionExpiredDialogProps) {
  const [countdown, setCountdown] = useState(countdownDuration);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { logout, refreshToken } = useAuth();
  const router = useRouter();

  // Reset countdown when dialog opens
  useEffect(() => {
    if (isOpen) {
      setCountdown(countdownDuration);
    }
  }, [isOpen, countdownDuration]);

  // Countdown timer
  useEffect(() => {
    if (!isOpen || countdown <= 0) return;

    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          // Auto-logout when countdown reaches 0
          handleLogout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, countdown]);

  const handleRefresh = async () => {
    try {
      setIsRefreshing(true);
      
      if (onRefresh) {
        await onRefresh();
      } else {
        await refreshToken();
      }
      
      onClose();
    } catch (error) {
      console.error('Failed to refresh session:', error);
      // If refresh fails, logout immediately
      handleLogout();
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/login');
      onClose();
    } catch (error) {
      console.error('Logout error:', error);
      // Force redirect even if logout fails
      router.push('/login');
      onClose();
    }
  };

  const progressPercentage = ((countdownDuration - countdown) / countdownDuration) * 100;

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent 
        className="w-[95vw] max-w-md p-0 rounded-xl sm:rounded-2xl overflow-hidden border-0 shadow-2xl"
        style={{ zIndex: 10000 }}
      >
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 dark:from-red-950/20 dark:via-orange-950/20 dark:to-yellow-950/20" />
        
        {/* Content */}
        <div className="relative p-6 space-y-6">
          {/* Header */}
          <DialogHeader className="text-center space-y-4">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.1, type: "spring" }}
              className="mx-auto p-3 bg-gradient-to-br from-orange-100 to-red-100 dark:from-orange-900/20 dark:to-red-900/20 rounded-full"
            >
              <AlertTriangle className="h-8 w-8 text-orange-600 dark:text-orange-400" />
            </motion.div>
            
            <div className="space-y-2">
              <DialogTitle className="text-xl font-bold text-gray-900 dark:text-gray-100">
                Session Expired
              </DialogTitle>
              <DialogDescription className="text-gray-600 dark:text-gray-400 text-sm">
                Your session has expired. You will be automatically logged out in:
              </DialogDescription>
            </div>
          </DialogHeader>

          {/* Countdown Display */}
          <div className="text-center space-y-4">
            <motion.div
              key={countdown}
              initial={{ scale: 1.2 }}
              animate={{ scale: 1 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-full border border-orange-200 dark:border-orange-700"
            >
              <Clock className="h-5 w-5 text-orange-600 dark:text-orange-400" />
              <span className="text-2xl font-bold text-orange-600 dark:text-orange-400 font-mono">
                {countdown}s
              </span>
            </motion.div>

            {/* Progress Bar */}
            <div className="space-y-2">
              <Progress 
                value={progressPercentage} 
                className="h-2 bg-gray-200 dark:bg-gray-700"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Auto-logout in progress...
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={handleRefresh}
              disabled={isRefreshing || countdown <= 0}
              className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 min-h-[44px]"
            >
              {isRefreshing ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Refreshing...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Stay Logged In
                </>
              )}
            </Button>
            
            <Button
              onClick={handleLogout}
              variant="outline"
              disabled={isRefreshing}
              className="flex-1 border-red-200 hover:bg-red-50 hover:border-red-300 text-red-600 hover:text-red-700 dark:border-red-700 dark:hover:bg-red-950/20 dark:text-red-400 dark:hover:text-red-300 min-h-[44px]"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout Now
            </Button>
          </div>

          {/* Helper Text */}
          <p className="text-xs text-center text-gray-500 dark:text-gray-400">
            Click "Stay Logged In" to refresh your session and continue working.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
} 