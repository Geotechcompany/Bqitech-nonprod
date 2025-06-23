"use client";

import { useAuth } from "@/contexts/AuthContext";
import { motion } from "framer-motion";
import { Zap, Loader2, Shield, Database, Cpu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useState, useEffect } from "react";

// Modern Tech Loading Component
const TechLoadingScreen = ({ message = "Loading..." }) => {
  const [systemStatus, setSystemStatus] = useState({
    systemOnline: false,
    secureConnection: false,
    databaseReady: false,
    isChecking: true
  });

  useEffect(() => {
    checkSystemStatus();
  }, []);

  const checkSystemStatus = async () => {
    setSystemStatus(prev => ({ ...prev, isChecking: true }));
    
    try {
      // Check if system is online by testing the health endpoint
      const healthResponse = await fetch('/api/health', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      
      const systemOnline = healthResponse.ok;
      
      // Check secure connection (HTTPS or localhost)
      const secureConnection = window.location.protocol === 'https:' || 
                              window.location.hostname === 'localhost';

      // Check database by testing a backend endpoint
      let databaseReady = false;
      try {
        const backendUrl = process.env.NEXT_PUBLIC_PYTHON_API_URL || 'http://localhost:8000';
        const dbResponse = await fetch(`${backendUrl}/api/health`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        });
        databaseReady = dbResponse.ok;
      } catch (error) {
        console.log('Backend health check failed:', error);
        databaseReady = false;
      }

      setSystemStatus({
        systemOnline,
        secureConnection,
        databaseReady,
        isChecking: false
      });

    } catch (error) {
      console.error('System status check failed:', error);
      setSystemStatus({
        systemOnline: false,
        secureConnection: window.location.protocol === 'https:' || 
                         window.location.hostname === 'localhost',
        databaseReady: false,
        isChecking: false
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 relative overflow-hidden">
      {/* Animated Background Grid */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-900/10 to-blue-900/10 animate-pulse"></div>
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 25% 25%, rgba(6, 182, 212, 0.1) 0%, transparent 50%), 
                           radial-gradient(circle at 75% 75%, rgba(59, 130, 246, 0.1) 0%, transparent 50%)`
        }}></div>
      </div>

      {/* Floating Particles */}
      <div className="absolute inset-0">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-cyan-400 rounded-full opacity-60"
            initial={{ 
              x: Math.random() * 1200, 
              y: Math.random() * 800,
              scale: 0 
            }}
            animate={{ 
              y: [null, -100, Math.random() * 800],
              scale: [0, 1, 0],
              opacity: [0, 1, 0]
            }}
            transition={{
              duration: Math.random() * 3 + 2,
              repeat: Infinity,
              delay: Math.random() * 2
            }}
          />
        ))}
      </div>

      <div className="relative flex items-center justify-center min-h-screen">
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-8 px-8"
        >
          {/* Tech Logo/Icon */}
          <motion.div 
            className="relative mx-auto w-24 h-24"
            animate={{ rotate: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full opacity-20 animate-pulse"></div>
            <div className="absolute inset-2 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full flex items-center justify-center">
              <Cpu className="w-8 h-8 text-white" />
            </div>
            
            {/* Orbiting elements */}
            <motion.div
              className="absolute top-0 left-1/2 w-3 h-3 bg-cyan-400 rounded-full -translate-x-1/2"
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              style={{ transformOrigin: "50% 48px" }}
            />
            <motion.div
              className="absolute top-0 left-1/2 w-2 h-2 bg-blue-400 rounded-full -translate-x-1/2"
              animate={{ rotate: -360 }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
              style={{ transformOrigin: "50% 36px" }}
            />
          </motion.div>

          {/* Loading Animation */}
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="space-y-4"
            >
              <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                BQI TECH HR PORTAL
              </h2>
              <p className="text-slate-300 text-lg">{message}</p>
            </motion.div>

            {/* Progress Bar */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="w-64 mx-auto"
            >
              <div className="h-1 bg-slate-700 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full"
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </div>
            </motion.div>

            {/* System Status - Real Status Checks */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="flex items-center justify-center space-x-6 text-sm text-slate-400"
            >
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${
                  systemStatus.isChecking 
                    ? 'bg-yellow-400 animate-pulse' 
                    : systemStatus.systemOnline 
                      ? 'bg-green-400 animate-pulse' 
                      : 'bg-red-400'
                }`}></div>
                <span>
                  {systemStatus.isChecking ? 'Checking...' : 
                   systemStatus.systemOnline ? 'System Online' : 'System Offline'}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Shield className={`w-4 h-4 ${
                  systemStatus.secureConnection ? 'text-cyan-400' : 'text-red-400'
                }`} />
                <span>
                  {systemStatus.secureConnection ? 'Secure Connection' : 'Insecure Connection'}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Database className={`w-4 h-4 ${
                  systemStatus.isChecking 
                    ? 'text-yellow-400' 
                    : systemStatus.databaseReady 
                      ? 'text-blue-400' 
                      : 'text-red-400'
                }`} />
                <span>
                  {systemStatus.isChecking ? 'Checking DB...' :
                   systemStatus.databaseReady ? 'Database Ready' : 'Database Offline'}
                </span>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* Corner Tech Elements */}
      <div className="absolute top-4 right-4 text-cyan-400 opacity-60">
        <div className="text-xs space-y-1 text-right font-mono">
          <div>SYS_STATUS: {systemStatus.systemOnline ? 'ACTIVE' : 'ERROR'}</div>
          <div>CONN: {systemStatus.secureConnection ? 'ENCRYPTED' : 'INSECURE'}</div>
          <div>DB: {systemStatus.databaseReady ? 'READY' : 'OFFLINE'}</div>
          <div>VER: 2.4.1</div>
        </div>
      </div>
    </div>
  );
};

export default function AdminLoginPage() {
  const router = useRouter();
  const { login, isAuthenticated, isAdmin, authLoading, user } = useAuth();
  const { register, handleSubmit, formState: { isSubmitting } } = useForm();
  const [isLoading, setIsLoading] = useState(false);
  const [hasCheckedAuth, setHasCheckedAuth] = useState(false);

  // Debug auth state
  useEffect(() => {
    console.log('Auth State Debug:', {
      authLoading,
      isAuthenticated,
      isAdmin,
      user,
      userRole: user?.role,
      hasCheckedAuth
    });
  }, [authLoading, isAuthenticated, isAdmin, user, hasCheckedAuth]);

  // Handle redirect for already authenticated admin users
  useEffect(() => {
    if (!authLoading && !hasCheckedAuth) {
      setHasCheckedAuth(true);
      
      if (isAuthenticated && isAdmin) {
        console.log('Already authenticated admin user, redirecting to overview');
        toast.success("Already logged in!", {
          description: "Redirecting to dashboard...",
        });
        
        setTimeout(() => {
          window.location.href = "/admin/overview";
        }, 1000);
      }
    }
  }, [authLoading, isAuthenticated, isAdmin, hasCheckedAuth]);

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      console.log('Attempting login...');
      await login(data.email, data.password);
      
      console.log('Login successful, redirecting...');
      
      toast.success("Welcome back!", {
        description: "Redirecting to dashboard...",
      });
      
      // Use window.location for immediate redirect after login
      setTimeout(() => {
        console.log('Performing post-login redirect...');
        window.location.href = "/admin/overview";
      }, 500);
      
    } catch (error) {
      console.error('Login error:', error);
      toast.error("Invalid credentials", {
        description: error.message || "Please check your email and password",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Show tech loading if checking auth state
  if (authLoading) {
    return <TechLoadingScreen message="Initializing System..." />;
  }

  // If already authenticated admin, show loading while redirecting
  if (isAuthenticated && isAdmin) {
    return <TechLoadingScreen message="Already logged in! Redirecting..." />;
  }

  // Show different message if authenticated but not admin
  if (isAuthenticated && !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Access Denied</h2>
          <p className="text-muted-foreground mb-4">
            You don't have admin privileges to access this area.
          </p>
          <p className="text-sm text-muted-foreground">
            Current role: {user?.role || 'Unknown'}
          </p>
          <Button 
            onClick={() => window.location.href = '/dashboard'} 
            className="mt-4"
          >
            Go to User Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left Panel - Decorative Gradient */}
      <div className="hidden lg:block relative bg-gradient-to-br from-teal-600 to-blue-800">
        <div className="absolute inset-0 pattern-dots pattern-blue-500 pattern-bg-transparent pattern-opacity-20 pattern-size-4" />
        <div className="relative h-full flex flex-col justify-between p-12 text-white">
          <Zap className="w-12 h-12" />
          <div className="space-y-4">
            <h2 className="text-4xl font-bold">BQI Tech Portal</h2>
            <p className="text-lg opacity-90">
              Empowering innovation through secure access
            </p>
          </div>
          <div className="flex gap-4 opacity-75">
            <span className="text-sm">v2.4.0</span>
            <span className="text-sm">•</span>
            <span className="text-sm">Secure Login</span>
          </div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="flex items-center justify-center p-8 bg-background">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md space-y-8"
        >
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold">Admin Portal</h1>
            <p className="text-muted-foreground">
              Sign in to manage your organization
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="email" className="mb-2">
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  {...register("email", { required: true })}
                  placeholder="admin@bqitech.com"
                  className="h-12"
                  autoComplete="email"
                />
              </div>
              <div>
                <Label htmlFor="password" className="mb-2">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  {...register("password", { required: true })}
                  placeholder="••••••••"
                  className="h-12"
                  autoComplete="current-password"
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-12 text-base"
              disabled={isLoading || isSubmitting}
            >
              {isLoading || isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Authenticating...
                </>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
