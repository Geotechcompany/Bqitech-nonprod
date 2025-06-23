"use client";

import { motion } from 'framer-motion';
import { FileText, CheckCircle, Code, MessageSquare, UserCheck, XCircle, ChevronRight, ArrowUpRightIcon, Briefcase } from 'lucide-react';
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

  const overviewItems = [
    { 
      title: 'Total Applications', 
      value: stats?.total || 0, 
      icon: FileText, 
      color: 'text-blue-600 bg-blue-100/30' 
    },
    { 
      title: 'Shortlisted', 
      value: stats?.byStatus?.['SHORTLISTED'] || stats?.byStatus?.['shortlisted'] || stats?.byStatus?.['Shortlisted'] || 0, 
      icon: CheckCircle, 
      color: 'text-emerald-600 bg-emerald-100/30' 
    },
    { 
      title: 'Technical Assessment', 
      value: stats?.byStatus?.['PENDING'] || stats?.byStatus?.['pending'] || stats?.byStatus?.['Pending'] || 0, 
      icon: Code, 
      color: 'text-amber-600 bg-amber-100/30' 
    },
    { 
      title: 'Interviewing', 
      value: stats?.byStatus?.['INTERVIEWING'] || stats?.byStatus?.['interviewing'] || stats?.byStatus?.['Interviewing'] || 0, 
      icon: MessageSquare, 
      color: 'text-violet-600 bg-violet-100/30' 
    },
    { 
      title: 'Hired', 
      value: stats?.byStatus?.['HIRED'] || stats?.byStatus?.['hired'] || stats?.byStatus?.['Hired'] || 0, 
      icon: UserCheck, 
      color: 'text-indigo-600 bg-indigo-100/30' 
    },
    { 
      title: 'Disqualified', 
      value: stats?.byStatus?.['REJECTED'] || stats?.byStatus?.['rejected'] || stats?.byStatus?.['Rejected'] || 0, 
      icon: XCircle, 
      color: 'text-rose-600 bg-rose-100/30' 
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
    <div className="space-y-6">
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
                <p className="text-lg font-medium text-blue-800">
                  {getPositionTitle(latestApplication)}
                </p>
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    latestApplication.status === 'Hired' ? 'bg-green-100 text-green-700' :
                    latestApplication.status === 'Rejected' ? 'bg-red-100 text-red-700' :
                    latestApplication.status === 'Shortlisted' ? 'bg-blue-100 text-blue-700' :
                    latestApplication.status === 'Interviewing' ? 'bg-purple-100 text-purple-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {latestApplication.status || 'New'}
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
          className="p-8 rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 text-center"
        >
          <div className="mb-4">
            <FileText className="h-12 w-12 text-gray-400 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-700 mb-2">No Applications Yet</h3>
          <p className="text-gray-600 mb-4">Start your journey by applying to available positions.</p>
          <Link href="/dashboard/jobs">
            <Button className="gap-2">
              <Briefcase className="h-4 w-4" />
              Browse Jobs
            </Button>
          </Link>
        </motion.div>
      )}
    </div>
  );
}
