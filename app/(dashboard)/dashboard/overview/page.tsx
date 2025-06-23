"use client";

import { motion } from 'framer-motion';
import { FileText, CheckCircle, Code, MessageSquare, UserCheck, XCircle, ChevronRight, ArrowUpRightIcon } from 'lucide-react';
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

interface LatestApplicationResponse {
  application: Application | null;
}

export default function DashboardOverview() {
  const { user } = useAuth();
  
  // Get the correct user ID format
  const userId = user?.id;
  
  // Fetch application stats for the current user
  const { data: statsData, isLoading: isStatsLoading } = useQuery<{ stats: ApplicationStats }>({
    queryKey: ['applicationStats', userId],
    queryFn: async () => {
      if (!userId) throw new Error('User ID not found');
      const response = await api.get(`/api/users/application-stats`);
      return response.data;
    },
    enabled: !!userId,
    staleTime: 30000,
  });

  // Fetch latest application for the current user
  const { data: latestAppData, isLoading: isLatestAppLoading } = useQuery<LatestApplicationResponse>({
    queryKey: ['latestApplication', userId],
    queryFn: async () => {
      if (!userId) throw new Error('User ID not found');
      const response = await api.get(`/api/users/latest-application`);
      return response.data;
    },
    enabled: !!userId,
    staleTime: 30000,
    gcTime: 60000,
  });

  const stats = statsData?.stats;
  const latestApplication = latestAppData?.application;

  if (isStatsLoading || !userId) {
    return <DashboardOverviewSkeleton />;
  }

  const userName = user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : 'User';

  const overviewItems = [
    { 
      title: 'Total Applications', 
      value: stats?.totalApplications || 0, 
      icon: FileText, 
      color: 'text-blue-600 bg-blue-100/30' 
    },
    { 
      title: 'Shortlisted', 
      value: stats?.shortlisted || 0, 
      icon: CheckCircle, 
      color: 'text-emerald-600 bg-emerald-100/30' 
    },
    { 
      title: 'Technical Assessment', 
      value: stats?.technicalAssessment || 0, 
      icon: Code, 
      color: 'text-amber-600 bg-amber-100/30' 
    },
    { 
      title: 'Interviewing', 
      value: stats?.interviewing || 0, 
      icon: MessageSquare, 
      color: 'text-violet-600 bg-violet-100/30' 
    },
    { 
      title: 'Hired', 
      value: stats?.hired || 0, 
      icon: UserCheck, 
      color: 'text-indigo-600 bg-indigo-100/30' 
    },
    { 
      title: 'Disqualified', 
      value: stats?.disqualified || 0, 
      icon: XCircle, 
      color: 'text-rose-600 bg-rose-100/30' 
    },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
            <span className="text-blue-600">Welcome back,</span>
            <ChevronRight className="h-4 w-4 text-gray-400" />
            <span className="font-medium">{userName}</span>
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Application Overview
          </h1>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-gray-700 hidden sm:block">
              {userName}
            </span>
          </div>
        </div>
      </div>

      {/* Hiring Progress */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <HiringProgress />
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {overviewItems.map((item, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-lg ${item.color}`}>
                <item.icon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-gray-500">{item.title}</p>
                <p className="text-2xl font-semibold">{item.value}</p>
              </div>
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
          <div className="h-32 bg-gray-200 rounded-2xl"></div>
        </motion.div>
      ) : latestApplication ? (
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 shadow-xl border border-blue-100"
        >
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <h2 className="text-xl font-semibold text-blue-900">Latest Application</h2>
                <p className="text-sm text-blue-700">
                  {latestApplication.jobDetails?.title || latestApplication.position || 'No position specified'}
                </p>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    latestApplication.status === 'Hired' ? 'bg-green-100 text-green-700' :
                    latestApplication.status === 'Rejected' ? 'bg-red-100 text-red-700' :
                    'bg-blue-100 text-blue-700'
                  }`}>
                    {latestApplication.status || 'Pending'}
                  </span>
                  <span className="text-sm text-blue-600">
                    Applied {formatDate(latestApplication.appliedDate)}
                  </span>
                </div>
              </div>
              <Link href="/dashboard/applications" className="group">
                <Button variant="outline" className="gap-1.5 border-blue-200 hover:bg-blue-50">
                  View Details
                  <ArrowUpRightIcon className="h-4 w-4 text-blue-600 transition-transform group-hover:translate-x-0.5" />
                </Button>
              </Link>
            </div>
          </div>
          <div className="absolute bottom-0 right-0 w-32 h-32 transform translate-x-16 translate-y-8 bg-blue-100/30 rounded-full" />
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="p-6 rounded-2xl bg-gray-50 border border-gray-200"
        >
          <p className="text-gray-600">No applications found</p>
        </motion.div>
      )}
    </div>
  );
}
