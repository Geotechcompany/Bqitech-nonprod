// app/dashboard/jobs/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Briefcase, MapPin, Calendar, ArrowRight, Clock, Building, Users, Sparkles, TrendingUp, Search, CheckCircle } from "lucide-react";
import { JobPosting } from "@/types/jobPosting";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { userApi } from "@/lib/api-backend";
import { toast } from "react-hot-toast";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface JobWithApplicationStatus extends JobPosting {
  hasApplied: boolean;
}

// Enhanced Skeleton Loader Components
const JobSkeletonCard = () => (
  <div className="group relative overflow-hidden rounded-xl sm:rounded-2xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-white/20 shadow-lg">
    <div className="p-4 sm:p-6 space-y-4">
      <div className="flex items-start justify-between">
        <div className="flex-1 space-y-3">
          <Skeleton className="h-5 sm:h-6 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
        <Skeleton className="h-8 w-8 rounded-full" />
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
      </div>
      
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-2 sm:pt-4">
        <Skeleton className="h-10 sm:h-11 flex-1" />
        <Skeleton className="h-10 sm:h-11 w-full sm:w-24" />
      </div>
    </div>
  </div>
)

const JobsPageSkeleton = () => (
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
      
      {/* Jobs Grid Skeleton */}
      <div className="grid gap-4 sm:gap-6 lg:gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
        {[...Array(8)].map((_, i) => (
          <JobSkeletonCard key={i} />
        ))}
      </div>
    </div>
  </div>
)

// Floating animation variants - reduced for mobile performance
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

export default function JobListingsPage() {
  const [jobPostings, setJobPostings] = useState<JobWithApplicationStatus[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<JobWithApplicationStatus[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [applyingToJob, setApplyingToJob] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchJobPostings = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await userApi.getJobs({ 
          skip: (currentPage - 1) * 10,
          limit: 10 
        });
        
        if (response.jobs) {
          // Check application status for each job
          const jobsWithStatus = await Promise.all(
            response.jobs.map(async (job) => {
              try {
                const hasApplied = await userApi.hasApplied(job.id);
                return { ...job, hasApplied };
              } catch (error) {
                console.warn(`Failed to check application status for job ${job.id}:`, error);
                return { ...job, hasApplied: false };
              }
            })
          );
          
          setJobPostings(jobsWithStatus);
          setFilteredJobs(jobsWithStatus);
          setTotalPages(response.totalPages || 1);
        }
      } catch (error) {
        console.error("Failed to fetch jobs:", error);
        setError("Failed to load job postings. Please try again later.");
        toast.error("Failed to load job postings");
      } finally {
        setIsLoading(false);
      }
    };

    fetchJobPostings();
  }, [currentPage]);

  // Filter jobs based on search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredJobs(jobPostings);
    } else {
      const filtered = jobPostings.filter(job =>
        job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.location.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredJobs(filtered);
    }
  }, [searchTerm, jobPostings]);

  const handleApplyClick = async (jobId: string) => {
    setApplyingToJob(jobId);
    try {
      router.push(`/dashboard/apply/${jobId}`);
    } catch (error) {
      console.error("Navigation error:", error);
      toast.error("Failed to navigate to application page");
    } finally {
      setApplyingToJob(null);
    }
  };

  if (isLoading) return <JobsPageSkeleton />;

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-red-50/30 to-pink-100/20 dark:from-gray-900 dark:via-red-950/30 dark:to-pink-950/20">
        <div className="container mx-auto py-6 sm:py-8 lg:py-12 px-4 max-w-7xl">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center max-w-xs sm:max-w-sm lg:max-w-md mx-auto"
          >
            <div className="relative mb-4 sm:mb-6">
              <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 mx-auto bg-gradient-to-br from-red-100 to-pink-100 dark:from-red-900/20 dark:to-pink-900/20 rounded-full flex items-center justify-center backdrop-blur-sm border border-red-200/50">
                <Briefcase className="h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12 text-red-500" />
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
              Error Loading Jobs
            </h3>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-4 sm:mb-6 px-2">
              {error}
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-100/20 dark:from-gray-900 dark:via-blue-950/30 dark:to-indigo-950/20 relative overflow-hidden">
      {/* Background Decorations - Reduced for mobile */}
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
              <Briefcase className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-[#272055] dark:text-[#31CDFF]" />
            </div>
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-[#31CDFF]" />
            </motion.div>
          </div>
          <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-[#272055] to-[#31CDFF] text-transparent bg-clip-text mb-2 sm:mb-3 lg:mb-4 leading-tight px-2">
            Open Positions
          </h1>
          <p className="text-sm sm:text-base lg:text-lg text-gray-600 dark:text-gray-400 max-w-sm sm:max-w-xl lg:max-w-2xl mx-auto px-4">
            Discover exciting career opportunities and join our innovative team
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
              placeholder="Search jobs by title, department, or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 sm:pl-12 pr-4 py-3 sm:py-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-white/20 rounded-xl text-sm sm:text-base placeholder:text-gray-500 focus:ring-2 focus:ring-[#31CDFF]/50 focus:border-[#31CDFF]/50 transition-all duration-300 w-full"
            />
          </div>
        </motion.div>

        {/* Jobs Grid */}
        <AnimatePresence mode="wait">
          {filteredJobs.length === 0 && !isLoading ? (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-8 sm:py-12 lg:py-16"
            >
              <div className="relative mb-4 sm:mb-6">
                <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 mx-auto bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-full flex items-center justify-center backdrop-blur-sm border border-blue-200/50">
                  <Briefcase className="h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12 text-blue-500" />
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
                {searchTerm ? "No matching positions found" : "No open positions"}
              </h3>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-4 sm:mb-6 px-4 max-w-sm sm:max-w-md mx-auto">
                {searchTerm 
                  ? "Try adjusting your search terms or check back later for new opportunities." 
                  : "Check back later for new opportunities."
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
            <div className="grid gap-4 sm:gap-6 lg:gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
              {filteredJobs.map((job, index) => (
                <motion.div
                  key={job.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                  className="group relative overflow-hidden rounded-xl sm:rounded-2xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col h-full"
                >
                  <div className="p-4 sm:p-6 space-y-3 sm:space-y-4 flex flex-col flex-1">
                    {/* Job Header */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-base sm:text-lg lg:text-xl font-bold text-gray-900 dark:text-gray-100 group-hover:text-[#31CDFF] transition-colors duration-200 leading-tight mb-1 break-words">
                          {job.title}
                        </h3>
                        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 font-medium break-words">
                          {job.department}
                        </p>
                      </div>
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-[#31CDFF]/20 to-[#272055]/20 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/20">
                          <Building className="h-4 w-4 sm:h-5 sm:w-5 text-[#272055] dark:text-[#31CDFF]" />
                        </div>
                      </div>
                    </div>

                    {/* Job Details */}
                    <div className="space-y-2 flex-1">
                      <div className="flex items-start gap-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                        <MapPin className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0 mt-0.5" />
                        <span className="break-words flex-1">{job.location}</span>
                      </div>
                      <div className="flex items-start gap-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                        <Calendar className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0 mt-0.5" />
                        <span className="break-words flex-1">
                          Posted {new Date(job.postedDate).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col gap-2 sm:gap-3 pt-2 mt-auto">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="w-full">
                              <Button
                                onClick={() => !job.hasApplied && handleApplyClick(job.id)}
                                className={`w-full min-h-[44px] font-medium py-2.5 sm:py-3 rounded-lg transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg flex items-center justify-center gap-2 group/btn text-sm sm:text-base ${
                                  job.hasApplied
                                    ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white cursor-default shadow-lg'
                                    : applyingToJob === job.id
                                    ? 'bg-gradient-to-r from-gray-400 to-gray-500 text-white cursor-wait'
                                    : 'bg-gradient-to-r from-[#31CDFF] to-[#272055] hover:from-[#272055] hover:to-[#31CDFF] text-white shadow-lg'
                                }`}
                                disabled={job.hasApplied || applyingToJob === job.id}
                              >
                                {job.hasApplied ? (
                                  <>
                                    <CheckCircle className="h-4 w-4" />
                                    <span>Applied</span>
                                  </>
                                ) : applyingToJob === job.id ? (
                                  <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                                    <span>Loading...</span>
                                  </>
                                ) : (
                                  <>
                                    <span>Apply Now</span>
                                    <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4 group-hover/btn:translate-x-1 transition-transform" />
                                  </>
                                )}
                              </Button>
                            </div>
                          </TooltipTrigger>
                          {job.hasApplied && (
                            <TooltipContent>
                              <p>You have already applied for this position</p>
                            </TooltipContent>
                          )}
                        </Tooltip>
                      </TooltipProvider>
                      
                      <Button
                        variant="outline"
                        onClick={() => router.push(`/careers/jobs`)}
                        className="w-full py-2.5 sm:py-3 min-h-[44px] bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-white/20 hover:bg-white/90 dark:hover:bg-gray-800/90 rounded-lg text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 transition-all duration-300 text-sm sm:text-base"
                      >
                        View Details
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </AnimatePresence>

        {/* Pagination */}
        {totalPages > 1 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-6 sm:mt-8 lg:mt-12 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4"
          >
            <Button
              variant="outline"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="w-full sm:w-auto min-h-[44px] bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-white/20 hover:bg-white/90 dark:hover:bg-gray-800/90 transition-all duration-300 px-6"
            >
              Previous
            </Button>
            
            <div className="px-3 sm:px-4 py-2 bg-gradient-to-r from-[#272055]/10 to-[#31CDFF]/10 backdrop-blur-sm rounded-lg border border-white/20">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Page {currentPage} of {totalPages}
              </span>
            </div>
            
            <Button
              variant="outline"
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="w-full sm:w-auto min-h-[44px] bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-white/20 hover:bg-white/90 dark:hover:bg-gray-800/90 transition-all duration-300 px-6"
            >
              Next
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
