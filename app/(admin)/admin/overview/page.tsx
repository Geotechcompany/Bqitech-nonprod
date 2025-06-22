"use client";

import { motion } from 'framer-motion';
import { Users, FileText, CheckCircle, XCircle, UserCheck, Code, MessageSquare, ArrowRight, ChevronDown, Clock, BarChart, Plus, ArrowUp, ArrowDown, TrendingUp, Briefcase, Target, Activity } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Line, Pie, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { AdminPageLayout } from "@/components/admin/AdminPageLayout";
import { Skeleton } from "@/components/ui/skeleton";
import Link from 'next/link';
import { adminApi } from '@/lib/api-backend';
import { toast } from 'react-hot-toast';
import { ViewApplicationModal } from "@/components/admin/ViewApplicationModal";
import { Application } from "@/types/application";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

interface OverviewData {
  applications: {
    total: number;
    new: number;
    shortlisted: number;
    interviewing: number;
    hired: number;
    rejected: number;
    technical_assessment: number;
    disqualified: number;
    recent: number;
  };
  jobs: {
    total: number;
    active: number;
  };
  users: {
    total: number;
  };
  status_breakdown: Array<{ status: string; count: number }>;
}

interface ApplicationsByJob {
  applicationsByJob: Array<{
    position: string;
    totalApplications: number;
    statusBreakdown: Record<string, number>;
  }>;
}

const statusColors = {
  New: 'bg-blue-100 text-blue-800',
  Shortlisted: 'bg-green-100 text-green-800',
  Interviewing: 'bg-purple-100 text-purple-800',
  Hired: 'bg-emerald-100 text-emerald-800',
  Rejected: 'bg-rose-100 text-rose-800',
  'Technical Assessment': 'bg-yellow-100 text-yellow-800',
  Disqualified: 'bg-red-100 text-red-800',
};

const MetricCard = ({ 
  title, 
  value, 
  icon: Icon, 
  trend, 
  color, 
  path, 
  subtitle,
  isLarge = false 
}: {
  title: string;
  value: number;
  icon: any;
  trend?: number;
  color: string;
  path: string;
  subtitle?: string;
  isLarge?: boolean;
}) => (
  <Link href={path} className="hover:opacity-90 transition-opacity">
    <motion.div
      whileHover={{ y: -2, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`bg-gradient-to-br from-white to-gray-50/50 rounded-2xl border border-gray-200/60 p-6 shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer backdrop-blur-sm ${
        isLarge ? 'lg:col-span-2' : ''
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-3">
            <div className={`p-3 rounded-xl ${color} shadow-sm`}>
              <Icon className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
              {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
            </div>
          </div>
          <div className="space-y-2">
            <h3 className="text-3xl font-bold text-gray-900">{value.toLocaleString()}</h3>
            {trend !== undefined && (
              <div className="flex items-center gap-2">
                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                  trend > 0 ? 'bg-green-100 text-green-700' : trend < 0 ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'
                }`}>
                  {trend > 0 ? (
                    <ArrowUp className="h-3 w-3 mr-1" />
                  ) : trend < 0 ? (
                    <ArrowDown className="h-3 w-3 mr-1" />
                  ) : null}
                  {trend === 0 ? 'No change' : `${Math.abs(trend)}%`}
                </span>
                <span className="text-xs text-gray-500">vs last month</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  </Link>
);

const StatusCard = ({ 
  title, 
  count, 
  percentage, 
  icon: Icon, 
  color, 
  path 
}: {
  title: string;
  count: number;
  percentage: number;
  icon: any;
  color: string;
  path: string;
}) => (
  <Link href={path}>
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="bg-gradient-to-br from-white via-gray-50/30 to-gray-100/50 rounded-xl border border-gray-200/60 p-5 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer backdrop-blur-sm"
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`p-2.5 rounded-lg ${color}`}>
          <Icon className="h-5 w-5" />
        </div>
        <span className="text-2xl font-bold text-gray-900">{count}</span>
      </div>
      <div className="space-y-2">
        <h4 className="font-semibold text-gray-900">{title}</h4>
        <Progress value={percentage} className="h-2" />
        <p className="text-xs text-gray-500">{percentage.toFixed(1)}% of total</p>
      </div>
    </motion.div>
  </Link>
);

export default function OverviewPage() {
  const [overviewData, setOverviewData] = useState<OverviewData | null>(null);
  const [applicationsByJob, setApplicationsByJob] = useState<ApplicationsByJob | null>(null);
  const [recentApplications, setRecentApplications] = useState<Application[]>([]);
  const [trendData, setTrendData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewApplication, setViewApplication] = useState<Application | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Load all data in parallel
      const [overviewResponse, recentAppsResponse, trendsResponse, jobApplicationsResponse] = await Promise.allSettled([
        adminApi.getOverview(),
        adminApi.getApplications({ limit: 10 }),
        adminApi.getTrends(30),
        adminApi.getApplicationsByJob()
      ]);

      // Handle overview data
      if (overviewResponse.status === 'fulfilled') {
        setOverviewData(overviewResponse.value);
      }

      // Handle recent applications
      if (recentAppsResponse.status === 'fulfilled') {
        const apps = recentAppsResponse.value.applications || [];
        setRecentApplications(apps.slice(0, 8));
      }

      // Handle trends data
      if (trendsResponse.status === 'fulfilled') {
        setTrendData(trendsResponse.value);
      }

      // Handle applications by job data
      if (jobApplicationsResponse.status === 'fulfilled') {
        setApplicationsByJob(jobApplicationsResponse.value);
      }

    } catch (err) {
      console.error('Failed to load dashboard data:', err);
      setError('Failed to load dashboard data');
      toast.error('Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  // Chart configurations
  const trendChartData = {
    labels: trendData?.trends?.map((t: any) => {
      const date = new Date(t._id);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }) || [],
    datasets: [
      {
        label: 'Applications',
        data: trendData?.trends?.map((t: any) => t.count) || [],
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
        tension: 0.4,
        pointBackgroundColor: 'rgb(59, 130, 246)',
        pointBorderColor: 'white',
        pointBorderWidth: 2,
        pointRadius: 4,
      },
    ],
  };

  const pieChartData = {
    labels: applicationsByJob?.applicationsByJob?.map(item => {
      const position = item.position || 'Unknown Position';
      return position.length > 20 ? `${position.substring(0, 20)}...` : position;
    }) || [],
    datasets: [
      {
        data: applicationsByJob?.applicationsByJob?.map(item => item.totalApplications || 0) || [],
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(139, 92, 246, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(239, 68, 68, 0.8)',
          'rgba(236, 72, 153, 0.8)',
          'rgba(14, 165, 233, 0.8)',
          'rgba(34, 197, 94, 0.8)',
          'rgba(168, 85, 247, 0.8)',
          'rgba(251, 146, 60, 0.8)',
        ],
        borderColor: [
          'rgba(59, 130, 246, 1)',
          'rgba(16, 185, 129, 1)',
          'rgba(139, 92, 246, 1)',
          'rgba(245, 158, 11, 1)',
          'rgba(239, 68, 68, 1)',
          'rgba(236, 72, 153, 1)',
          'rgba(14, 165, 233, 1)',
          'rgba(34, 197, 94, 1)',
          'rgba(168, 85, 247, 1)',
          'rgba(251, 146, 60, 1)',
        ],
        borderWidth: 2,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          padding: 20,
          usePointStyle: true,
          font: {
            size: 12,
          },
        },
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: 'white',
        bodyColor: 'white',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
      },
    },
  };

  const pieChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right' as const,
        labels: {
          padding: 15,
          usePointStyle: true,
          font: {
            size: 11,
          },
          generateLabels: (chart: any) => {
            const data = chart.data;
            if (data.labels.length && data.datasets.length) {
              return data.labels.map((label: string, i: number) => {
                const value = data.datasets[0].data[i];
                const total = data.datasets[0].data.reduce((a: number, b: number) => a + b, 0);
                const percentage = ((value / total) * 100).toFixed(1);
                return {
                  text: `${label} (${percentage}%)`,
                  fillStyle: data.datasets[0].backgroundColor[i],
                  strokeStyle: data.datasets[0].borderColor[i],
                  lineWidth: 2,
                  pointStyle: 'circle',
                };
              });
            }
            return [];
          },
        },
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: 'white',
        bodyColor: 'white',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        callbacks: {
          label: function(context: any) {
            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
            const percentage = ((context.parsed / total) * 100).toFixed(1);
            return `${context.label}: ${context.parsed} (${percentage}%)`;
          }
        }
      },
    },
  };

  const handleViewApplication = (app: Application) => {
    setViewApplication(app);
  };

  if (isLoading) return (
    <AdminPageLayout title="Dashboard Overview" showSearch={false}>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
        <div className="space-y-8 p-4 md:p-6 w-full max-w-none">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => <Skeleton key={i} className="h-32 rounded-2xl" />)}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <Skeleton className="h-96 lg:col-span-2 rounded-2xl" />
            <Skeleton className="h-96 rounded-2xl" />
          </div>
        </div>
      </div>
    </AdminPageLayout>
  );

  if (error) return (
    <AdminPageLayout title="Dashboard Overview" showSearch={false}>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center">
        <div className="text-center py-12">
          <div className="bg-red-50 rounded-full p-4 w-16 h-16 mx-auto mb-4">
            <XCircle className="h-8 w-8 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold mb-4 text-gray-900">Something went wrong</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <Button onClick={loadDashboardData} className="bg-blue-600 hover:bg-blue-700">
            <ArrowRight className="mr-2 h-4 w-4" />
            Try Again
          </Button>
        </div>
      </div>
    </AdminPageLayout>
  );

  if (!overviewData) return null;

  const totalApplications = overviewData.applications.total;

  return (
    <AdminPageLayout
      title="Dashboard Overview"
      showSearch={false}
      headerActions={
        <div className="flex gap-3">
          <Link href="/admin/applications">
            <Button variant="outline" size="sm" className="gap-2">
              <FileText className="h-4 w-4" />
              View Applications
            </Button>
          </Link>
          <Link href="/admin/job-postings/new">
            <Button size="sm" className="gap-2 bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4" />
              New Job
            </Button>
          </Link>
        </div>
      }
    >
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
        <div className="space-y-8 p-4 md:p-6 w-full max-w-none">
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <MetricCard
              title="Total Applications"
              value={overviewData.applications.total}
              icon={FileText}
              color="bg-blue-100 text-blue-600"
              path="/admin/applications"
              subtitle="All time applications"
              trend={12}
            />
            <MetricCard
              title="Active Jobs"
              value={overviewData.jobs.active}
              icon={Briefcase}
              color="bg-green-100 text-green-600"
              path="/admin/job-postings"
              subtitle="Currently hiring"
              trend={8}
            />
            <MetricCard
              title="Recent Applications"
              value={overviewData.applications.recent}
              icon={Activity}
              color="bg-purple-100 text-purple-600"
              path="/admin/applications"
              subtitle="Last 7 days"
              trend={25}
            />
            <MetricCard
              title="Total Users"
              value={overviewData.users.total}
              icon={Users}
              color="bg-orange-100 text-orange-600"
              path="/admin/user-management"
              subtitle="Registered users"
              trend={5}
            />
          </div>

          {/* Application Status Overview */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <StatusCard
              title="New"
              count={overviewData.applications.new}
              percentage={(overviewData.applications.new / totalApplications) * 100}
              icon={FileText}
              color="bg-blue-100 text-blue-600"
              path="/admin/applications?status=new"
            />
            <StatusCard
              title="Shortlisted"
              count={overviewData.applications.shortlisted}
              percentage={(overviewData.applications.shortlisted / totalApplications) * 100}
              icon={UserCheck}
              color="bg-green-100 text-green-600"
              path="/admin/shortlisted"
            />
            <StatusCard
              title="Interviewing"
              count={overviewData.applications.interviewing}
              percentage={(overviewData.applications.interviewing / totalApplications) * 100}
              icon={MessageSquare}
              color="bg-purple-100 text-purple-600"
              path="/admin/interviewing"
            />
            <StatusCard
              title="Technical"
              count={overviewData.applications.technical_assessment}
              percentage={(overviewData.applications.technical_assessment / totalApplications) * 100}
              icon={Code}
              color="bg-yellow-100 text-yellow-600"
              path="/admin/technical-assessment"
            />
            <StatusCard
              title="Hired"
              count={overviewData.applications.hired}
              percentage={(overviewData.applications.hired / totalApplications) * 100}
              icon={CheckCircle}
              color="bg-emerald-100 text-emerald-600"
              path="/admin/hired"
            />
            <StatusCard
              title="Disqualified"
              count={overviewData.applications.disqualified}
              percentage={(overviewData.applications.disqualified / totalApplications) * 100}
              icon={XCircle}
              color="bg-red-100 text-red-600"
              path="/admin/disqualified"
            />
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            {/* Application Trends Chart */}
            <Card className="lg:col-span-3 shadow-sm border-gray-200/60">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-3 text-lg">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <TrendingUp className="h-5 w-5 text-blue-600" />
                  </div>
                  Application Trends
                  <span className="text-sm font-normal text-gray-500">(Last 30 Days)</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                {trendData?.trends ? (
                  <div className="h-80">
                    <Line data={trendChartData} options={chartOptions} />
                  </div>
                ) : (
                  <div className="h-80 flex items-center justify-center text-gray-500">
                    <div className="text-center">
                      <BarChart className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p>No trend data available</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Applications by Job Pie Chart */}
            <Card className="lg:col-span-2 shadow-sm border-gray-200/60">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-3 text-lg">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Target className="h-5 w-5 text-green-600" />
                  </div>
                  Applications by Job
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                {applicationsByJob?.applicationsByJob && applicationsByJob.applicationsByJob.length > 0 ? (
                  <div className="h-80">
                    <Doughnut data={pieChartData} options={pieChartOptions} />
                  </div>
                ) : (
                  <div className="h-80 flex items-center justify-center text-gray-500">
                    <div className="text-center">
                      <Target className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p>No job application data</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Recent Applications */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Clock className="h-5 w-5 text-purple-600" />
                  </div>
                  Recent Applications
                </div>
                <Link href="/admin/applications" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                  View All →
                </Link>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              {recentApplications.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {recentApplications.map((app) => {
                    const firstName = app.answers?.find(a => 
                      a.questionText === "First Name"
                    )?.answer || "Unknown";
                    
                    return (
                      <motion.div
                        key={app.id}
                        whileHover={{ scale: 1.02 }}
                        className="bg-white rounded-lg p-4 border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer"
                        onClick={() => handleViewApplication(app)}
                      >
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h2 className="text-xl font-semibold text-gray-800 line-clamp-1">
                              {app.position}
                            </h2>
                            <p className="text-sm text-gray-600 mt-1">
                              {firstName}
                            </p>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleViewApplication(app);
                            }}
                            className="hover:bg-gray-100 p-1 rounded-full transition-colors"
                          >
                            <ArrowRight className="h-4 w-4 text-gray-500" />
                          </button>
                        </div>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between text-sm">
                            <Badge
                              className={`${
                                statusColors[app.status as keyof typeof statusColors] || 
                                "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {app.status}
                            </Badge>
                            <span className="text-gray-500">
                              {new Date(app.appliedDate).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-6 text-gray-500">
                  No recent applications
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Application View Modal */}
      <ViewApplicationModal
        application={viewApplication}
        isOpen={!!viewApplication}
        onClose={() => setViewApplication(null)}
      />
    </AdminPageLayout>
  );
}
