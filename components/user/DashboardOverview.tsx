"use client";

import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { userApi } from '@/lib/api-backend';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { HiringProgress } from '@/components/user/HiringProgress';
import { formatDate } from '@/lib/utils';
import { ArrowUpRightIcon, FileText, CheckCircle, Code, MessageSquare, UserCheck, XCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';

interface ApplicationStats {
  total: number;
  pending: number;
  shortlisted: number;
  hired: number;
  technicalAssessment: number;
  interviewing: number;
  disqualified: number;
}

interface LatestApplicationResponse {
  application: {
    id: string;
    position: string;
    status: string;
    appliedDate: string;
    jobDetails?: {
      title: string;
    };
  };
}

export function DashboardOverview() {
  const router = useRouter();
  const { user } = useAuth();

  const { data: stats, isLoading: isStatsLoading } = useQuery<ApplicationStats>({
    queryKey: ['applicationStats'],
    queryFn: () => userApi.getApplicationStats(),
    staleTime: 30000,
  });

  const { data: latestAppData, isLoading: isLatestAppLoading } = useQuery<LatestApplicationResponse>({
    queryKey: ['latestApplication'],
    queryFn: () => userApi.getLatestApplication(),
    staleTime: 30000,
    gcTime: 60000,
  });

  if (isStatsLoading || isLatestAppLoading) {
    return <DashboardOverviewSkeleton />;
  }

  const displayName = user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email : 'User';
  const latestApplication = latestAppData?.application;

  const statCards = [
    {
      title: 'Total Applications',
      value: stats?.total || 0,
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
    }
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 p-8 text-white">
        <div className="relative z-10">
          <h1 className="text-3xl font-bold mb-2">Welcome back, {displayName}! 👋</h1>
          <p className="text-blue-100">Here's what's happening with your applications</p>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full transform translate-x-32 -translate-y-32 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/20 rounded-full transform -translate-x-32 translate-y-32 blur-3xl" />
      </div>

      {/* Hiring Progress */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <HiringProgress />
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl ${stat.color}`}>
                  <stat.icon className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">{stat.title}</p>
                  <p className="text-2xl font-semibold">{stat.value}</p>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Latest Application */}
      {latestApplication ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="relative overflow-hidden rounded-2xl bg-white p-6 shadow-sm border border-gray-100"
        >
          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <h2 className="text-xl font-semibold text-gray-900">Latest Application</h2>
                <p className="text-sm text-gray-600">
                  {latestApplication.jobDetails?.title || latestApplication.position || 'No position specified'}
                </p>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    latestApplication.status === 'Hired' ? 'bg-emerald-100 text-emerald-700' :
                    latestApplication.status === 'Rejected' ? 'bg-rose-100 text-rose-700' :
                    'bg-blue-100 text-blue-700'
                  }`}>
                    {latestApplication.status || 'Pending'}
                  </span>
                  <span className="text-sm text-gray-500">
                    Applied {formatDate(new Date(latestApplication.appliedDate))}
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

function DashboardOverviewSkeleton() {
  return (
    <div className="space-y-8">
      {/* Welcome Section Skeleton */}
      <div className="h-40 bg-gray-100 rounded-2xl animate-pulse" />

      {/* Hiring Progress Skeleton */}
      <div className="h-20 bg-gray-100 rounded-2xl animate-pulse" />

      {/* Stats Grid Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-24 bg-gray-100 rounded-2xl animate-pulse" />
        ))}
      </div>

      {/* Latest Application Skeleton */}
      <div className="h-40 bg-gray-100 rounded-2xl animate-pulse" />
    </div>
  );
}
