// app/dashboard/applications/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Application } from "@/types/application";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/lib/api";
import { ViewApplicationModal } from "@/components/admin/ViewApplicationModal";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  AlertCircle, 
  Search, 
  FileText, 
  Calendar, 
  MapPin, 
  Building, 
  Eye,
  Sparkles,
  Clock,
  CheckCircle,
  XCircle,
  UserCheck,
  Users,
  Target
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { authService } from "@/lib/auth-backend";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface ApplicationResponse {
  applications: Application[];
  total: number;
  page: number;
  totalPages: number;
}

// Enhanced Skeleton Components
const ApplicationCardSkeleton = () => (
  <div className="group relative overflow-hidden rounded-xl sm:rounded-2xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-white/20 shadow-lg">
    <div className="p-4 sm:p-6 space-y-4">
      <div className="flex items-start justify-between">
        <div className="flex-1 space-y-3">
          <Skeleton className="h-5 sm:h-6 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
        <Skeleton className="h-6 w-20 rounded-full" />
      </div>
      
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-4" />
          <Skeleton className="h-4 w-20 sm:w-24" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-4" />
          <Skeleton className="h-4 w-24 sm:w-32" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-4" />
          <Skeleton className="h-4 w-16 sm:w-20" />
        </div>
      </div>
      
      <Skeleton className="h-10 w-full" />
    </div>
  </div>
)

const ApplicationsPageSkeleton = () => (
  <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-100/20 dark:from-gray-900 dark:via-blue-950/30 dark:to-indigo-950/20">
    <div className="container mx-auto px-4 py-6 sm:py-8 lg:py-12">
      {/* Header Skeleton */}
      <div className="text-center mb-6 sm:mb-8 lg:mb-12">
        <Skeleton className="h-6 sm:h-8 lg:h-10 w-32 sm:w-48 lg:w-64 mx-auto mb-3 sm:mb-4" />
        <Skeleton className="h-4 sm:h-5 w-48 sm:w-64 lg:w-80 mx-auto" />
      </div>
      
      {/* Search Skeleton */}
      <div className="max-w-md mx-auto mb-6 sm:mb-8 lg:mb-12">
        <Skeleton className="h-10 sm:h-12 w-full rounded-xl" />
      </div>
      
      {/* Applications Grid Skeleton */}
      <div className="grid gap-4 sm:gap-6 lg:gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <ApplicationCardSkeleton key={i} />
        ))}
      </div>
    </div>
  </div>
)

// Floating animation variants
const floatingVariants = {
  animate: {
    y: [-3, 3, -3],
    rotate: [-0.5, 0.5, -0.5],
    transition: {
      y: { duration: 4, repeat: Infinity, ease: "easeInOut" },
      rotate: { duration: 3, repeat: Infinity, ease: "easeInOut" },
    }
  }
}

// Status configuration with icons and colors
const statusConfig = {
  'New': { 
    icon: Clock, 
    color: 'from-blue-500 to-cyan-500', 
    bgColor: 'bg-blue-100 dark:bg-blue-900/20', 
    textColor: 'text-blue-700 dark:text-blue-300',
    borderColor: 'border-blue-200 dark:border-blue-700'
  },
  'Shortlisted': { 
    icon: Target, 
    color: 'from-green-500 to-emerald-500', 
    bgColor: 'bg-green-100 dark:bg-green-900/20', 
    textColor: 'text-green-700 dark:text-green-300',
    borderColor: 'border-green-200 dark:border-green-700'
  },
  'Interviewing': { 
    icon: Users, 
    color: 'from-yellow-500 to-orange-500', 
    bgColor: 'bg-yellow-100 dark:bg-yellow-900/20', 
    textColor: 'text-yellow-700 dark:text-yellow-300',
    borderColor: 'border-yellow-200 dark:border-yellow-700'
  },
  'Hired': { 
    icon: CheckCircle, 
    color: 'from-green-500 to-emerald-500', 
    bgColor: 'bg-green-100 dark:bg-green-900/20', 
    textColor: 'text-green-700 dark:text-green-300',
    borderColor: 'border-green-200 dark:border-green-700'
  },
  'Rejected': { 
    icon: XCircle, 
    color: 'from-red-500 to-pink-500', 
    bgColor: 'bg-red-100 dark:bg-red-900/20', 
    textColor: 'text-red-700 dark:text-red-300',
    borderColor: 'border-red-200 dark:border-red-700'
  },
  'Disqualified': { 
    icon: XCircle, 
    color: 'from-gray-500 to-slate-500', 
    bgColor: 'bg-gray-100 dark:bg-gray-900/20', 
    textColor: 'text-gray-700 dark:text-gray-300',
    borderColor: 'border-gray-200 dark:border-gray-700'
  },
}

export default function ApplicationsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [viewApplication, setViewApplication] = useState<Application | null>(null);
  const { user, refreshToken, handleAuthError } = useAuth();

  const { data, isLoading, error } = useQuery<ApplicationResponse>({
    queryKey: ['userApplications', user?.id],
    queryFn: async () => {
      try {
        if (!user?.id) {
          console.error('No user ID available');
          throw new Error('User not authenticated');
        }

        console.log('Fetching applications for user:', user.id);
        const session = authService.getSession();
        console.log('Current session:', session ? { 
          ...session, 
          user: { ...session.user, id: session.user.id } 
        } : null);

        const response = await authService.authenticatedFetch(
          `${process.env.NEXT_PUBLIC_PYTHON_API_URL}/api/applications`
        );

        console.log('Response status:', response.status);
        const data = await response.json();
        console.log('Response data:', data);

        if (!response.ok) {
          const error = new Error(data.detail || 'Failed to load applications');
          // Handle authentication errors through the global handler
          if (response.status === 401) {
            handleAuthError({ status: 401, detail: data.detail });
          }
          throw error;
        }

        return data;
      } catch (error: any) {
        console.error('Error fetching applications:', error);
        
        // Handle authentication errors through the global handler
        if (error.response?.status === 401 || error.status === 401) {
          handleAuthError(error);
        }
        
        throw new Error(error.response?.data?.detail || error.message || 'Failed to load applications');
      }
    },
    retry: (failureCount, error: any) => {
      // Don't retry on authentication errors
      if (error?.message?.includes('authentication') || 
          error?.message?.includes('token') ||
          error?.response?.status === 401) {
        return false;
      }
      return failureCount < 1;
    },
    enabled: !!user?.id, // Only run query if we have a user ID
  });

  // Log state changes
  useEffect(() => {
    console.log('Auth state:', { 
      user: user ? { ...user, id: user.id } : null,
      isLoading, 
      error: error ? error.toString() : null,
      hasData: !!data,
      applicationCount: data?.applications?.length
    });
  }, [user, isLoading, error, data]);

  const handleView = (id: string) => {
    const application = data?.applications.find(app => app.id === id);
    setViewApplication(application || null);
  };

  // Handle authentication errors gracefully
  const isAuthError = error && (
    error.message?.includes('authentication') ||
    error.message?.includes('token') ||
    error.message?.includes('unauthorized') ||
    error.message?.includes('User not authenticated')
  );

  // Don't show error UI for auth errors, let SessionExpiredDialog handle it
  if (error && !isAuthError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-red-50/30 to-pink-100/20 dark:from-gray-900 dark:via-red-950/30 dark:to-pink-950/20">
        <div className="container mx-auto py-6 sm:py-8 lg:py-12 px-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center max-w-sm sm:max-w-md lg:max-w-lg mx-auto"
          >
            <div className="relative mb-4 sm:mb-6">
              <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 mx-auto bg-gradient-to-br from-red-100 to-pink-100 dark:from-red-900/20 dark:to-pink-900/20 rounded-full flex items-center justify-center backdrop-blur-sm border border-red-200/50">
                <AlertCircle className="h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12 text-red-500" />
              </div>
              <motion.div
                className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 text-red-400"
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6" />
              </motion.div>
            </div>
            <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-red-600 dark:text-red-400 mb-2 sm:mb-3">
              Error Loading Applications
            </h3>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-4 sm:mb-6 px-2">
              {error instanceof Error ? error.message : 'Failed to load applications'}
            </p>
            <Button 
              onClick={() => window.location.reload()}
              className="w-full sm:w-auto bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 min-h-[44px] px-6"
            >
              Try Again
            </Button>
          </motion.div>
        </div>
      </div>
    );
  }

  // Show loading skeleton for auth errors while SessionExpiredDialog handles it
  if (isAuthError) {
    return <ApplicationsPageSkeleton />;
  }

  if (isLoading) return <ApplicationsPageSkeleton />;

  const applications = data?.applications || [];

  const filteredApplications = applications.filter(app => {
    const search = searchTerm.toLowerCase();
    return (
      (app.name?.toLowerCase() ?? '').includes(search) ||
      (app.email?.toLowerCase() ?? '').includes(search) ||
      (app.position?.toLowerCase() ?? '').includes(search) ||
      (app.jobDetails?.title?.toLowerCase() ?? '').includes(search)
    );
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-100/20 dark:from-gray-900 dark:via-blue-950/30 dark:to-indigo-950/20 relative overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-5 sm:top-10 lg:top-20 left-3 sm:left-5 lg:left-10 w-16 h-16 sm:w-20 sm:h-20 lg:w-32 lg:h-32 bg-gradient-to-br from-[#31CDFF]/10 to-[#272055]/10 rounded-full blur-xl"
          variants={floatingVariants}
          animate="animate"
        />
        <motion.div
          className="absolute top-10 sm:top-20 lg:top-40 right-5 sm:right-10 lg:right-20 w-12 h-12 sm:w-16 sm:h-16 lg:w-24 lg:h-24 bg-gradient-to-br from-[#272055]/10 to-[#31CDFF]/10 rounded-full blur-xl"
          variants={floatingVariants}
          animate="animate"
          transition={{ delay: 1 }}
        />
        <motion.div
          className="absolute bottom-10 sm:bottom-20 lg:bottom-40 left-1/4 w-20 h-20 sm:w-24 sm:h-24 lg:w-40 lg:h-40 bg-gradient-to-br from-blue-400/5 to-indigo-400/5 rounded-full blur-2xl"
          variants={floatingVariants}
          animate="animate"
          transition={{ delay: 2 }}
        />
      </div>

      <div className="container mx-auto px-4 py-6 sm:py-8 lg:py-12 relative z-10">
        {/* Page Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-6 sm:mb-8 lg:mb-12"
        >
          <div className="inline-flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
            <div className="p-1.5 sm:p-2 bg-gradient-to-br from-[#31CDFF]/20 to-[#272055]/20 rounded-lg sm:rounded-xl backdrop-blur-sm border border-white/20">
              <FileText className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-[#272055] dark:text-[#31CDFF]" />
            </div>
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-[#31CDFF]" />
            </motion.div>
          </div>
          <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-[#272055] to-[#31CDFF] text-transparent bg-clip-text mb-2 sm:mb-3 lg:mb-4 leading-tight px-2">
            My Applications
          </h1>
          <p className="text-sm sm:text-base lg:text-lg text-gray-600 dark:text-gray-400 max-w-sm sm:max-w-xl lg:max-w-2xl mx-auto px-4">
            Track and manage your job applications
          </p>
        </motion.div>

        {/* Search Bar */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="max-w-md mx-auto mb-6 sm:mb-8 lg:mb-12"
        >
          <div className="relative">
            <Search className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Search applications..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 sm:pl-12 pr-4 py-3 sm:py-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-white/20 rounded-xl text-sm sm:text-base placeholder:text-gray-500 focus:ring-2 focus:ring-[#31CDFF]/50 focus:border-[#31CDFF]/50 transition-all duration-300 w-full"
            />
          </div>
        </motion.div>

        {/* Applications Grid */}
        <AnimatePresence mode="wait">
          {filteredApplications.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-8 sm:py-12 lg:py-16"
            >
              <div className="relative mb-4 sm:mb-6">
                <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 mx-auto bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-full flex items-center justify-center backdrop-blur-sm border border-blue-200/50">
                  <FileText className="h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12 text-blue-500" />
                </div>
                <motion.div
                  className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 text-blue-400"
                  variants={floatingVariants}
                  animate="animate"
                >
                  <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6" />
                </motion.div>
              </div>
              <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2 sm:mb-3 px-2">
                {searchTerm ? "No matching applications found" : "No applications yet"}
              </h3>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-4 sm:mb-6 px-4 max-w-sm sm:max-w-md mx-auto">
                {searchTerm 
                  ? "Try adjusting your search terms." 
                  : "Start by applying to some of our open positions."
                }
              </p>
              {searchTerm && (
                <Button 
                  onClick={() => setSearchTerm("")}
                  variant="outline"
                  className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-white/20 hover:bg-white/90 dark:hover:bg-gray-800/90 transition-all duration-300 min-h-[44px] px-6"
                >
                  Clear Search
                </Button>
              )}
            </motion.div>
          ) : (
            <div className="grid gap-4 sm:gap-6 lg:gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
              {filteredApplications.map((app, index) => {
                const status = app.status || 'New';
                const config = statusConfig[status] || statusConfig['New'];
                const StatusIcon = config.icon;

                return (
                  <motion.div
                    key={app.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * index }}
                    className="group relative overflow-hidden rounded-xl sm:rounded-2xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col h-full"
                  >
                    <div className="p-4 sm:p-6 space-y-3 sm:space-y-4 flex flex-col flex-1">
                      {/* Application Header */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-base sm:text-lg lg:text-xl font-bold text-gray-900 dark:text-gray-100 group-hover:text-[#31CDFF] transition-colors duration-200 leading-tight mb-1 break-words">
                            {app.jobDetails?.title || app.position || 'N/A'}
                          </h3>
                          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 font-medium break-words">
                            {app.jobDetails?.department || 'N/A'}
                          </p>
                        </div>
                        <div className={`flex items-center gap-1.5 px-2 py-1 sm:px-3 sm:py-1.5 ${config.bgColor} ${config.textColor} text-xs sm:text-sm font-semibold rounded-full ${config.borderColor} border backdrop-blur-sm`}>
                          <StatusIcon className="h-3 w-3 sm:h-4 sm:w-4" />
                          <span className="hidden sm:inline">{status}</span>
                        </div>
                      </div>

                      {/* Application Details */}
                      <div className="space-y-2 flex-1">
                        <div className="flex items-start gap-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                          <MapPin className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0 mt-0.5" />
                          <span className="break-words flex-1">{app.jobDetails?.location || 'N/A'}</span>
                        </div>
                        <div className="flex items-start gap-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                          <Calendar className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0 mt-0.5" />
                          <span className="break-words flex-1">
                            Applied {app.appliedDate ? new Date(app.appliedDate).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            }) : 'N/A'}
                          </span>
                        </div>
                      </div>

                      {/* Action Button */}
                      <div className="pt-2 mt-auto">
                        <Button
                          onClick={() => handleView(app.id)}
                          className="w-full min-h-[44px] font-medium py-2.5 sm:py-3 rounded-lg transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg flex items-center justify-center gap-2 group/btn text-sm sm:text-base bg-gradient-to-r from-[#31CDFF] to-[#272055] hover:from-[#272055] hover:to-[#31CDFF] text-white shadow-lg"
                        >
                          <Eye className="h-4 w-4" />
                          <span>View Application</span>
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </AnimatePresence>

        {/* View Application Modal */}
        <AnimatePresence>
          {viewApplication && (
            <ViewApplicationModal
              application={viewApplication}
              isOpen={!!viewApplication}
              onClose={() => setViewApplication(null)}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}