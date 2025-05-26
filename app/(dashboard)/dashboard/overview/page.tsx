"use client";

import { motion } from 'framer-motion';
import { FileText, CheckCircle, Code, MessageSquare, UserCheck, XCircle, ChevronRight, ArrowUpRightIcon } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Skeleton } from '@/components/ui/skeleton';
import { useSession } from "next-auth/react";
import { NotificationButton } from "@/components/NotificationButton";
import { Application } from "@/types/application";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";

interface ApplicationStats {
  stats: {
    totalApplications: number;
    shortlisted: number;
    technicalAssessment: number;
    interviewing: number;
    hired: number;
    disqualified: number;
  };
}

export default function DashboardOverview() {
  const { data: session } = useSession();
  const { data, isLoading } = useQuery<ApplicationStats>({
    queryKey: ['applicationStats'],
    queryFn: () => api.get('/user/application-stats').then(res => res.data)
  });
  const stats = data?.stats;

  const { data: appsData } = useQuery<{ applications: Application[] }>({
    queryKey: ['recentApplications'],
    queryFn: () => api.get('/applications?limit=1').then(res => res.data),
  });

  const latestApplication = appsData?.applications?.[0];

  if (isLoading) {
    return <DashboardOverviewSkeleton />;
  }

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
            <span className="font-medium">{session?.user?.name || 'Guest'}</span>
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Application Overview
          </h1>
        </div>
        
        <div className="flex items-center gap-4">
          <NotificationButton variant="outline" />
          
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-gray-700 hidden sm:block">
              {session?.user?.name || ''}
            </span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {overviewItems.map((item, index) => (
          <motion.div
            key={item.title}
            className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-white to-gray-50 shadow-xl border border-gray-100"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            whileHover={{ y: -5 }}
          >
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <div className={`p-2 rounded-lg w-fit ${item.color}`}>
                    <item.icon className="w-6 h-6" />
                  </div>
                  <p className="text-lg font-medium text-gray-600">{item.title}</p>
                  <h3 className="text-3xl font-bold text-gray-900">{item.value}</h3>
                </div>
              </div>
            </div>
            <div className={`absolute bottom-0 right-0 w-32 h-32 transform translate-x-16 translate-y-8 ${item.color.replace('text', 'bg').replace('-600', '-100/30')} rounded-full`} />
          </motion.div>
        ))}
      </div>

      {/* Moved Latest Application Card */}
      {latestApplication && (
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
                  {latestApplication.position || 'No position specified'}
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
      )}
    </div>
  );
}

function DashboardOverviewSkeleton() {
  return (
    <div className="space-y-8">
      <div className="h-20 bg-gray-100 rounded-2xl animate-pulse" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-40 bg-gray-100 rounded-2xl animate-pulse" />
        ))}
      </div>
    </div>
  );
}
