"use client";

import { motion } from 'framer-motion';
import { FileText, CheckCircle, Code, MessageSquare, UserCheck, XCircle, ChevronRight } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Skeleton } from '@/components/ui/skeleton';
import { UserButton } from '@clerk/nextjs';
import { useUser } from "@clerk/nextjs";
import { NotificationButton } from "@/components/NotificationButton";

interface ApplicationStats {
  totalApplications: number;
  shortlisted: number;
  technicalAssessment: number;
  interviewing: number;
  hired: number;
  disqualified: number;
}

export default function DashboardOverview() {
  const { user } = useUser()
  const { data: stats, isLoading } = useQuery<ApplicationStats>({
    queryKey: ['applicationStats'],
    queryFn: () => api.get('/user/application-stats').then(res => res.data)
  });

  if (isLoading) {
    return <DashboardOverviewSkeleton />;
  }

  const overviewItems = [
    { 
      title: 'Total Applications', 
      value: stats?.totalApplications || 0, 
      icon: FileText, 
      color: 'from-blue-600 to-blue-700' 
    },
    { 
      title: 'Shortlisted', 
      value: stats?.shortlisted || 0, 
      icon: CheckCircle, 
      color: 'from-green-600 to-green-700' 
    },
    { 
      title: 'Technical Assessment', 
      value: stats?.technicalAssessment || 0, 
      icon: Code, 
      color: 'from-yellow-600 to-yellow-700' 
    },
    { 
      title: 'Interviewing', 
      value: stats?.interviewing || 0, 
      icon: MessageSquare, 
      color: 'from-purple-600 to-purple-700' 
    },
    { 
      title: 'Hired', 
      value: stats?.hired || 0, 
      icon: UserCheck, 
      color: 'from-indigo-600 to-indigo-700' 
    },
    { 
      title: 'Disqualified', 
      value: stats?.disqualified || 0, 
      icon: XCircle, 
      color: 'from-red-600 to-red-700' 
    },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
            <span>Dashboard</span>
            <ChevronRight className="h-4 w-4" />
            <span>Overview</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Overview</h1>
        </div>
        
        <div className="flex items-center gap-4">
          <NotificationButton variant="outline" />
          
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-gray-700 hidden sm:block">
              {user?.firstName || ''}
            </span>
            <UserButton 
              afterSignOutUrl="/"
              appearance={{
                elements: {
                  avatarBox: "h-8 w-8",
                  footer: "hidden",
                  userPreviewMainIdentifier: "hidden",
                  userButtonPopoverFooter: "hidden",
                  userButtonPopoverCard: "!mb-0",
                  developmentModeText: "hidden",
                  userButtonPopoverSecurityBox: "hidden",
                  rootBox: "!mb-0",
                  card: "!mb-0",
                  navbar: "hidden",
                  navbarMobileMenuButton: "hidden",
                  headerTitle: "hidden",
                  headerSubtitle: "hidden",
                  profileSectionTitleText: "hidden",
                  accordionTriggerButton: "hidden",
                  organizationSwitcherTrigger: "hidden",
                  organizationPreviewTextContainer: "hidden"
                },
                layout: {
                  socialButtonsPlacement: "bottom",
                  socialButtonsVariant: "iconButton"
                }
              }}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {overviewItems.map((item, index) => (
          <motion.div
            key={item.title}
            className="relative overflow-hidden rounded-2xl shadow-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            whileHover={{ y: -5, transition: { duration: 0.2 } }}
          >
            <div className="absolute top-0 right-0 w-32 h-32 transform translate-x-16 -translate-y-16">
              <div className="absolute inset-0 rounded-full bg-white opacity-10" />
            </div>
            <div className={`relative p-6 bg-gradient-to-br ${item.color}`}>
              <div className="flex items-center justify-between">
                <div className="space-y-4">
                  <div className="p-3 bg-white/10 rounded-lg w-fit">
                    <item.icon className="w-6 h-6 text-white" />
                  </div>
                  <p className="text-lg font-medium text-white/80">{item.title}</p>
                  <h3 className="text-4xl font-bold text-white">{item.value}</h3>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
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
