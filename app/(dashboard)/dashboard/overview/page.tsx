"use client";

import { motion } from 'framer-motion';
import { FileText, CheckCircle, Code, MessageSquare, UserCheck, XCircle, ChevronRight, ArrowUpRightIcon, Briefcase, TrendingUp, Sparkles, Star } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext'
import { api } from '@/lib/api';
import { useQuery } from '@tanstack/react-query';
import { DashboardOverviewSkeleton } from '@/components/skeletons';
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";
import type { Application, ApplicationStats } from '@/types/application'
import { HiringProgress } from '@/components/user/HiringProgress';

interface ApplicationResponse {
  applications: Application[];
}

export default function DashboardOverview() {
  const { user } = useAuth();
  
  // Get the correct user ID format
  const userId = user?.id;
  
  // Fetch application stats for the current user
  const { data: statsData, isLoading: isStatsLoading } = useQuery<ApplicationStats>({
    queryKey: ['applicationStats', userId],
    queryFn: async () => {
      if (!userId) throw new Error('User ID not found');
      const response = await api.get(`/api/applications/users/application-stats`);
      return response.data;
    },
    enabled: !!userId,
    staleTime: 30000,
  });

  // Fetch latest application for the current user
  const { data: latestAppData, isLoading: isLatestAppLoading } = useQuery<Application | null>({
    queryKey: ['latestApplication', userId],
    queryFn: async () => {
      if (!userId) throw new Error('User ID not found');
      const response = await api.get(`/api/applications/users/latest-application`);
      return response.data;
    },
    enabled: !!userId,
    staleTime: 30000,
    gcTime: 60000,
  });

  const stats = statsData;
  const latestApplication = latestAppData;

  if (isStatsLoading || !userId) {
    return <DashboardOverviewSkeleton />;
  }

  const displayName = user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email : 'User';

  const overviewItems = [
    { 
      title: 'Total Applications', 
      value: stats?.total || 0, 
      icon: FileText, 
      gradient: 'from-blue-500 via-blue-600 to-cyan-500',
      bgGradient: 'from-blue-50/80 via-blue-50/60 to-cyan-50/80',
      iconBg: 'bg-gradient-to-br from-blue-500/15 to-cyan-500/15',
      textColor: 'text-blue-600',
      shadowColor: 'shadow-blue-500/20',
      description: 'Applications submitted'
    },
    { 
      title: 'Shortlisted', 
      value: stats?.byStatus?.['SHORTLISTED'] || stats?.byStatus?.['shortlisted'] || stats?.byStatus?.['Shortlisted'] || 0, 
      icon: CheckCircle, 
      gradient: 'from-emerald-500 via-emerald-600 to-teal-500',
      bgGradient: 'from-emerald-50/80 via-emerald-50/60 to-teal-50/80',
      iconBg: 'bg-gradient-to-br from-emerald-500/15 to-teal-500/15',
      textColor: 'text-emerald-600',
      shadowColor: 'shadow-emerald-500/20',
      description: 'Applications shortlisted'
    },
    { 
      title: 'Technical Assessment', 
      value: stats?.byStatus?.['PENDING'] || stats?.byStatus?.['pending'] || stats?.byStatus?.['Pending'] || 0, 
      icon: Code, 
      gradient: 'from-amber-500 via-amber-600 to-orange-500',
      bgGradient: 'from-amber-50/80 via-amber-50/60 to-orange-50/80',
      iconBg: 'bg-gradient-to-br from-amber-500/15 to-orange-500/15',
      textColor: 'text-amber-600',
      shadowColor: 'shadow-amber-500/20',
      description: 'Technical assessments'
    },
    { 
      title: 'Interviewing', 
      value: stats?.byStatus?.['INTERVIEWING'] || stats?.byStatus?.['interviewing'] || stats?.byStatus?.['Interviewing'] || 0, 
      icon: MessageSquare, 
      gradient: 'from-violet-500 via-violet-600 to-purple-500',
      bgGradient: 'from-violet-50/80 via-violet-50/60 to-purple-50/80',
      iconBg: 'bg-gradient-to-br from-violet-500/15 to-purple-500/15',
      textColor: 'text-violet-600',
      shadowColor: 'shadow-violet-500/20',
      description: 'Interview rounds'
    },
    { 
      title: 'Hired', 
      value: stats?.byStatus?.['HIRED'] || stats?.byStatus?.['hired'] || stats?.byStatus?.['Hired'] || 0, 
      icon: UserCheck, 
      gradient: 'from-indigo-500 via-indigo-600 to-blue-500',
      bgGradient: 'from-indigo-50/80 via-indigo-50/60 to-blue-50/80',
      iconBg: 'bg-gradient-to-br from-indigo-500/15 to-blue-500/15',
      textColor: 'text-indigo-600',
      shadowColor: 'shadow-indigo-500/20',
      description: 'Successful hires'
    },
    { 
      title: 'Disqualified', 
      value: stats?.byStatus?.['REJECTED'] || stats?.byStatus?.['rejected'] || stats?.byStatus?.['Rejected'] || 0, 
      icon: XCircle, 
      gradient: 'from-rose-500 via-rose-600 to-pink-500',
      bgGradient: 'from-rose-50/80 via-rose-50/60 to-pink-50/80',
      iconBg: 'bg-gradient-to-br from-rose-500/15 to-pink-500/15',
      textColor: 'text-rose-600',
      shadowColor: 'shadow-rose-500/20',
      description: 'Applications closed'
    },
  ];

  // Function to get position title from various possible sources
  const getPositionTitle = (application: Application) => {
    return application.jobDetails?.title || 
           application.jobId?.title || 
           application.position || 
           'Position not specified';
  };

  return (
    <div className="space-y-6 sm:space-y-8 lg:space-y-10">
      {/* Welcome Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-br from-[#272055] via-[#31CDFF] to-[#272055] p-6 sm:p-8 lg:p-10 text-white shadow-2xl"
      >
        <div className="relative z-10">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
            <motion.div 
              className="p-3 sm:p-4 rounded-2xl sm:rounded-3xl bg-white/10 backdrop-blur-sm border border-white/20 shadow-2xl"
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              <Sparkles className="h-6 w-6 sm:h-8 sm:w-8" />
            </motion.div>
            <div className="flex-1">
              <motion.h1 
                className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-1 sm:mb-2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                Welcome back, {displayName}! 👋
              </motion.h1>
              <motion.p 
                className="text-white/90 text-sm sm:text-base lg:text-lg"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                Track your application progress and accelerate your career journey
              </motion.p>
            </div>
          </div>
        </div>
        
        {/* Enhanced animated background elements - adjusted for mobile */}
        <div className="absolute top-0 right-0 w-48 h-48 sm:w-72 sm:h-72 lg:w-96 lg:h-96 bg-white/5 rounded-full transform translate-x-24 sm:translate-x-36 lg:translate-x-48 -translate-y-24 sm:-translate-y-36 lg:-translate-y-48 blur-3xl animate-pulse" />
        <div className="absolute bottom-0 left-0 w-48 h-48 sm:w-72 sm:h-72 lg:w-96 lg:h-96 bg-[#31CDFF]/20 rounded-full transform -translate-x-24 sm:-translate-x-36 lg:-translate-x-48 translate-y-24 sm:translate-y-36 lg:translate-y-48 blur-3xl animate-pulse" />
        <div className="absolute top-1/2 right-1/4 w-20 h-20 sm:w-32 sm:h-32 lg:w-40 lg:h-40 bg-white/10 rounded-full blur-2xl animate-bounce" />
        <div className="absolute top-1/4 left-1/4 w-12 h-12 sm:w-18 sm:h-18 lg:w-24 lg:h-24 bg-[#31CDFF]/30 rounded-full blur-xl animate-pulse" />
        
        {/* Floating particles - reduced for mobile */}
        {[...Array(4)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1.5 h-1.5 sm:w-2 sm:h-2 bg-white/30 rounded-full"
            animate={{
              y: [0, -15, 0],
              opacity: [0.3, 1, 0.3],
            }}
            transition={{
              duration: 3 + i * 0.5,
              repeat: Infinity,
              delay: i * 0.3,
            }}
            style={{
              left: `${20 + i * 20}%`,
              top: `${30 + (i % 2) * 40}%`,
            }}
          />
        ))}
      </motion.div>

      {/* Hiring Progress */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <HiringProgress />
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
        {overviewItems.map((item, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: index * 0.1, type: "spring", stiffness: 200 }}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            className="group"
          >
            <div className={`relative overflow-hidden p-4 sm:p-6 lg:p-8 bg-gradient-to-br ${item.bgGradient} border-0 shadow-xl hover:shadow-2xl ${item.shadowColor} transition-all duration-500 group-hover:scale-105 rounded-2xl sm:rounded-3xl`}>
              <div className="absolute inset-0 bg-gradient-to-br from-white/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              {/* Floating background decoration - adjusted for mobile */}
              <div className="absolute top-0 right-0 w-16 h-16 sm:w-24 sm:h-24 lg:w-32 lg:h-32 transform translate-x-8 sm:translate-x-12 lg:translate-x-16 -translate-y-8 sm:-translate-y-12 lg:-translate-y-16 bg-gradient-to-br from-white/10 to-transparent rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
              
              <div className="relative z-10 space-y-3 sm:space-y-4">
                <div className="flex items-center justify-between">
                  <motion.div 
                    className={`p-3 sm:p-4 rounded-2xl sm:rounded-3xl ${item.iconBg} shadow-xl border border-white/20 group-hover:scale-110 transition-transform duration-300`}
                    whileHover={{ rotate: 5 }}
                  >
                    <item.icon className={`h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8 ${item.textColor}`} />
                  </motion.div>
                  <div className="flex items-center gap-1">
                    <Star className={`h-3 w-3 sm:h-4 sm:w-4 ${item.textColor} opacity-60`} />
                    <Star className={`h-2.5 w-2.5 sm:h-3 sm:w-3 ${item.textColor} opacity-40`} />
                  </div>
                </div>
                
                <div className="space-y-1 sm:space-y-2">
                  <p className="text-xs sm:text-sm font-semibold text-gray-600 uppercase tracking-wide">
                    {item.title}
                  </p>
                  <motion.p 
                    className={`text-2xl sm:text-3xl lg:text-4xl font-bold ${item.textColor} group-hover:scale-110 transition-transform duration-300 origin-left`}
                    whileHover={{ scale: 1.1 }}
                  >
                    {item.value}
                  </motion.p>
                  <p className="text-xs text-gray-500 font-medium">
                    {item.description}
                  </p>
                </div>
              </div>
              
              {/* Enhanced decorative gradient line */}
              <div className={`absolute bottom-0 left-0 right-0 h-1.5 sm:h-2 bg-gradient-to-r ${item.gradient} opacity-70 group-hover:opacity-100 group-hover:h-2 sm:group-hover:h-3 transition-all duration-300`} />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Latest Application Card */}
      {isLatestAppLoading ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="animate-pulse"
        >
          <div className="h-40 sm:h-48 lg:h-56 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl sm:rounded-3xl"></div>
        </motion.div>
      ) : latestApplication ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="group relative overflow-hidden rounded-2xl sm:rounded-3xl bg-white/90 backdrop-blur-sm p-6 sm:p-8 lg:p-10 shadow-2xl border border-gray-100/50 hover:shadow-3xl transition-all duration-700"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-purple-50/30 to-pink-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
          
          <div className="relative z-10">
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
              <div className="space-y-4 sm:space-y-6 flex-1">
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                  <motion.div 
                    className="p-3 sm:p-4 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10 border-2 border-blue-200/50 shadow-xl self-start"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ type: "spring", stiffness: 400 }}
                  >
                    <Briefcase className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
                  </motion.div>
                  <div className="flex-1">
                    <motion.h2 
                      className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-1 sm:mb-2"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 }}
                    >
                      Latest Application
                    </motion.h2>
                    <motion.p 
                      className="text-base sm:text-lg lg:text-xl font-semibold text-gray-700"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.6 }}
                    >
                      {getPositionTitle(latestApplication)}
                    </motion.p>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6">
                  <motion.span 
                    className={`px-4 sm:px-6 py-2 sm:py-3 rounded-full text-xs sm:text-sm font-bold border-2 shadow-lg self-start ${
                      latestApplication.status === 'Hired' 
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                      latestApplication.status === 'Rejected' 
                        ? 'bg-rose-50 text-rose-700 border-rose-200' :
                      latestApplication.status === 'Shortlisted' 
                        ? 'bg-blue-50 text-blue-700 border-blue-200' :
                      latestApplication.status === 'Interviewing' 
                        ? 'bg-purple-50 text-purple-700 border-purple-200' :
                        'bg-gray-50 text-gray-700 border-gray-200'
                    }`}
                    whileHover={{ scale: 1.05 }}
                    transition={{ type: "spring", stiffness: 400 }}
                  >
                    {latestApplication.status || 'New'}
                  </motion.span>
                  <span className="text-sm sm:text-base lg:text-lg text-gray-600 font-semibold">
                    Applied {formatDate(latestApplication.appliedDate)}
                  </span>
                </div>
              </div>
              
              <Link href="/dashboard/applications" className="group/button">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-full lg:w-auto"
                >
                  <Button 
                    size="lg"
                    className="w-full lg:w-auto gap-2 sm:gap-3 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 px-6 sm:px-8 py-3 sm:py-4 text-sm sm:text-base lg:text-lg font-semibold"
                  >
                    View Details
                    <ArrowUpRightIcon className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 transition-transform group-hover/button:translate-x-1 group-hover/button:-translate-y-1" />
                  </Button>
                </motion.div>
              </Link>
            </div>
          </div>
          
          {/* Enhanced decorative elements - adjusted for mobile */}
          <div className="absolute bottom-0 right-0 w-32 h-32 sm:w-40 sm:h-40 lg:w-48 lg:h-48 transform translate-x-16 sm:translate-x-20 lg:translate-x-24 translate-y-16 sm:translate-y-20 lg:translate-y-24 bg-gradient-to-br from-blue-200/20 via-purple-200/20 to-pink-200/20 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000" />
          <div className="absolute top-0 right-0 w-20 h-20 sm:w-24 sm:h-24 lg:w-32 lg:h-32 transform translate-x-10 sm:translate-x-12 lg:translate-x-16 -translate-y-10 sm:-translate-y-12 lg:-translate-y-16 bg-gradient-to-br from-blue-300/15 via-purple-300/15 to-pink-300/15 rounded-full blur-2xl group-hover:scale-125 transition-transform duration-700" />
          <div className="absolute top-1/2 left-0 w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 transform -translate-x-8 sm:-translate-x-10 lg:-translate-x-12 bg-gradient-to-br from-purple-200/20 to-pink-200/20 rounded-full blur-xl group-hover:scale-110 transition-transform duration-500" />
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="relative overflow-hidden p-6 sm:p-8 lg:p-10 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-gray-50/80 to-gray-100/50 border-2 border-dashed border-gray-300 text-center group hover:border-gray-400 transition-all duration-500"
        >
          <div className="relative z-10">
            <motion.div 
              className="mb-6 sm:mb-8"
              whileHover={{ scale: 1.1 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              <div className="p-4 sm:p-6 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 w-16 h-16 sm:w-20 sm:h-20 mx-auto flex items-center justify-center shadow-lg">
                <FileText className="h-8 w-8 sm:h-10 sm:w-10 text-gray-500" />
              </div>
            </motion.div>
            <h3 className="text-xl sm:text-2xl font-bold text-gray-700 mb-3 sm:mb-4">No Applications Yet</h3>
            <p className="text-gray-600 mb-6 sm:mb-8 max-w-md mx-auto text-sm sm:text-base lg:text-lg leading-relaxed">
              Start your journey by exploring available positions and submitting your first application.
            </p>
            <Link href="/dashboard/jobs">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button size="lg" className="gap-2 sm:gap-3 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 text-white shadow-xl hover:shadow-2xl transition-all duration-300 px-6 sm:px-8 py-3 sm:py-4 text-sm sm:text-base lg:text-lg font-semibold">
                  <Briefcase className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6" />
                  Browse Jobs
                </Button>
              </motion.div>
            </Link>
          </div>
          
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50/20 via-purple-50/20 to-pink-50/20 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
        </motion.div>
      )}
    </div>
  );
}
