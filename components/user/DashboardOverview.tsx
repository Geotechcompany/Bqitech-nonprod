"use client";

import { motion } from 'framer-motion';
import { FileText, CheckCircle, Code, MessageSquare, UserCheck, XCircle, ChevronRight } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Skeleton } from '@/components/ui/skeleton';
import { useSession } from "next-auth/react";
import { NotificationButton } from "@/components/NotificationButton";
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import useSWR from "swr"
import { Application } from '@/types/application';
import { formatDate } from '@/lib/utils';
import Link from 'next/link';
import { ArrowUpRightIcon } from 'lucide-react';

interface ApplicationStats {
  totalApplications: number;
  shortlisted: number;
  technicalAssessment: number;
  interviewing: number;
  hired: number;
  disqualified: number;
}

interface LatestApplicationResponse {
  application: Application | null;
}

export function DashboardOverview() {
  const router = useRouter()
  const { user } = useAuth()

  const fetcher = (url: string) => api.get(url).then(res => res.data)
  const { data: stats } = useSWR("/user/application-stats", fetcher)

  const { data: latestAppData, isLoading: isLatestAppLoading } = useQuery<LatestApplicationResponse>({
    queryKey: ['latestApplication'],
    queryFn: async () => {
      const response = await api.get('/api/user/latest-application');
      return response.data;
    },
    gcTime: 60000, // Keep data in garbage collection for 1 minute
    staleTime: 30000, // Consider data fresh for 30 seconds
  });

  if (isLatestAppLoading) {
    return <div className="animate-pulse">
      <div className="h-32 bg-gray-200 rounded-lg"></div>
    </div>;
  }

  const latestApplication = latestAppData?.application;

  if (!latestApplication) {
    return (
      <div className="p-6 rounded-lg bg-gray-50 border border-gray-200">
        <p className="text-gray-600">No applications found</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Welcome, {user?.name || 'Guest'}</h2>
            <p className="text-gray-500">Here's what's happening with your applications</p>
          </div>
          <Button onClick={() => router.push('/dashboard/applications')}>
            View Applications
          </Button>
        </div>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="p-6">
          <h3 className="font-semibold">Total Applications</h3>
          <p className="text-3xl font-bold">{stats?.totalApplications || 0}</p>
        </Card>
        <Card className="p-6">
          <h3 className="font-semibold">In Progress</h3>
          <p className="text-3xl font-bold">{stats?.inProgress || 0}</p>
        </Card>
        <Card className="p-6">
          <h3 className="font-semibold">Shortlisted</h3>
          <p className="text-3xl font-bold">{stats?.shortlisted || 0}</p>
        </Card>
        <Card className="p-6">
          <h3 className="font-semibold">Completed</h3>
          <p className="text-3xl font-bold">{stats?.completed || 0}</p>
        </Card>
      </div>

      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 shadow-xl border border-blue-100">
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
      </div>
    </div>
  )
}

function DashboardOverviewSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="rounded-2xl shadow-md p-6 bg-gray-100">
          <div className="flex items-center justify-between">
            <div className="space-y-4">
              <Skeleton className="h-12 w-12 rounded-lg" /> {/* Icon */}
              <Skeleton className="h-6 w-32" /> {/* Title */}
              <Skeleton className="h-10 w-20" /> {/* Value */}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
