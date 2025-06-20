"use client";

import { motion } from 'framer-motion';
import { Users, FileText, CheckCircle, XCircle, UserCheck, Code, MessageSquare, ArrowRight, ChevronDown, Clock, BarChart, Plus, ArrowUp, ArrowDown } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
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

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface Application {
  id: string;
  name: string;
  email: string;
  position: string;
  status: string;
  appliedDate: Date;
}

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
  status_breakdown: Array<{ _id: string; count: number }>;
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

const StatCard = ({ title, value, icon: Icon, trend, color, path }: {
  title: string;
  value: number;
  icon: any;
  trend?: number;
  color: string;
  path: string;
}) => (
  <Link href={path} className="hover:opacity-90 transition-opacity">
    <motion.div
      whileHover={{ y: -4 }}
      className="bg-background rounded-2xl border p-5 shadow-lg hover:shadow-xl transition-shadow cursor-pointer"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground mb-2">{title}</p>
          <h3 className="text-3xl font-bold">{value.toLocaleString()}</h3>
        </div>
        <div className={`p-3 rounded-xl ${color} relative overflow-hidden`}>
          <Icon className="h-6 w-6" />
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />
        </div>
      </div>
      {trend && (
        <div className="flex items-center mt-4">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            trend > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {trend > 0 ? (
              <ArrowUp className="h-3 w-3 mr-1" />
            ) : (
              <ArrowDown className="h-3 w-3 mr-1" />
            )}
            {Math.abs(trend)}%
          </span>
          <span className="text-sm text-muted-foreground ml-2">vs last month</span>
        </div>
      )}
    </motion.div>
  </Link>
);

const PipelineStage = ({ title, count, progress, icon: Icon, color }: {
  title: string;
  count: number;
  progress: number;
  icon: any;
  color: string;
}) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <motion.div
      className="border rounded-xl p-5 bg-background shadow-sm hover:shadow-md transition-shadow"
      animate={{ height: expanded ? 'auto' : '80px' }}
    >
      <div className="flex items-center justify-between cursor-pointer" onClick={() => setExpanded(!expanded)}>
        <div className="flex items-center space-x-4">
          <div className={`p-3 rounded-xl ${color} relative overflow-hidden`}>
            <Icon className="h-6 w-6" />
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />
          </div>
          <div>
            <h4 className="font-semibold text-lg">{title}</h4>
            <p className="text-sm text-muted-foreground">{count} candidates</p>
          </div>
        </div>
        <ChevronDown className={`h-5 w-5 transform transition-transform ${
          expanded ? 'rotate-180' : ''
        }`} />
      </div>
      
      {expanded && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-5 space-y-4"
        >
          <Progress value={progress} className="h-2 bg-muted" />
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">Conversion Rate</span>
            <span className="font-medium">{Math.round(progress)}%</span>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default function OverviewPage() {
  const [overviewData, setOverviewData] = useState<OverviewData | null>(null);
  const [recentApplications, setRecentApplications] = useState<Application[]>([]);
  const [trendData, setTrendData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Load all data in parallel
      const [overviewResponse, recentAppsResponse, trendsResponse] = await Promise.allSettled([
        adminApi.getOverview(),
        adminApi.getApplications({ limit: 10 }),
        adminApi.getTrends(30)
      ]);

      // Handle overview data
      if (overviewResponse.status === 'fulfilled') {
        setOverviewData(overviewResponse.value);
      }

      // Handle recent applications
      if (recentAppsResponse.status === 'fulfilled') {
        const apps = recentAppsResponse.value.applications || [];
        setRecentApplications(apps.slice(0, 10));
      }

      // Handle trends data
      if (trendsResponse.status === 'fulfilled') {
        setTrendData(trendsResponse.value);
      }

    } catch (err) {
      console.error('Failed to load dashboard data:', err);
      setError('Failed to load dashboard data');
      toast.error('Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  const chartData = {
    labels: trendData?.trends?.map((t: any) => t._id) || [],
    datasets: [
      {
        label: 'Applications',
        data: trendData?.trends?.map((t: any) => t.count) || [],
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
      },
    ],
  };

  if (isLoading) return (
    <AdminPageLayout title="Dashboard Overview" showSearch={false}>
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-24" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="h-96 lg:col-span-2" />
          <Skeleton className="h-96" />
        </div>
      </div>
    </AdminPageLayout>
  );

  if (error) return (
    <AdminPageLayout title="Dashboard Overview" showSearch={false}>
      <div className="text-center py-8">
        <h2 className="text-2xl font-bold mb-4 text-red-600">Error</h2>
        <p className="text-gray-600 mb-4">{error}</p>
        <Button onClick={loadDashboardData}>Retry</Button>
      </div>
    </AdminPageLayout>
  );

  if (!overviewData) return null;

  return (
    <AdminPageLayout
      title="Dashboard Overview"
      showSearch={false}
      headerActions={
        <Link href="/admin/job-postings/new">
          <Button size="sm" className="gap-1">
            <Plus className="h-4 w-4" /> New Job
          </Button>
        </Link>
      }
    >
      <div className="space-y-6">
        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-3">
          <StatCard
            title="Total Applications"
            value={overviewData.applications.total}
            icon={FileText}
            color="bg-blue-100/50 text-blue-600"
            path="/admin/applications"
          />
          <StatCard
            title="Shortlisted"
            value={overviewData.applications.shortlisted}
            icon={UserCheck}
            color="bg-green-100/50 text-green-600"
            path="/admin/shortlisted"
          />
          <StatCard
            title="Interviewing"
            value={overviewData.applications.interviewing}
            icon={MessageSquare}
            color="bg-purple-100/50 text-purple-600"
            path="/admin/interviewing"
          />
          <StatCard
            title="Hired"
            value={overviewData.applications.hired}
            icon={CheckCircle}
            color="bg-emerald-100/50 text-emerald-600"
            path="/admin/hired"
          />
          <StatCard
            title="Technical Assessment"
            value={overviewData.applications.technical_assessment}
            icon={Code}
            color="bg-yellow-100/50 text-yellow-600"
            path="/admin/technical-assessment"
          />
          <StatCard
            title="Disqualified"
            value={overviewData.applications.disqualified}
            icon={XCircle}
            color="bg-red-100/50 text-red-600"
            path="/admin/disqualified"
          />
        </div>

        {/* Charts and Recent Applications */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Applications Trend Chart */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart className="h-5 w-5" />
                Application Trends (Last 30 Days)
              </CardTitle>
            </CardHeader>
            <CardContent>
              {trendData?.trends ? (
                <Line data={chartData} options={{ responsive: true, maintainAspectRatio: false }} height={300} />
              ) : (
                <div className="h-64 flex items-center justify-center text-gray-500">
                  No trend data available
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Applications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Recent Applications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {recentApplications.length > 0 ? (
                recentApplications.map((app) => (
                  <div key={app.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{app.name}</p>
                      <p className="text-sm text-muted-foreground truncate">{app.position}</p>
                    </div>
                    <Badge className={statusColors[app.status] || 'bg-gray-100 text-gray-800'}>
                      {app.status}
                    </Badge>
                  </div>
                ))
              ) : (
                <div className="text-center text-gray-500 py-4">
                  No recent applications
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Link href="/admin/applications" className="w-full">
                <Button variant="outline" className="w-full">
                  View All Applications
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardFooter>
          </Card>
        </div>

        {/* Pipeline Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <PipelineStage
            title="New Applications"
            count={overviewData.applications.new}
            progress={85}
            icon={FileText}
            color="bg-blue-100/50 text-blue-600"
          />
          <PipelineStage
            title="In Review"
            count={overviewData.applications.shortlisted}
            progress={65}
            icon={UserCheck}
            color="bg-green-100/50 text-green-600"
          />
          <PipelineStage
            title="Interview Stage"
            count={overviewData.applications.interviewing}
            progress={45}
            icon={MessageSquare}
            color="bg-purple-100/50 text-purple-600"
          />
          <PipelineStage
            title="Final Stage"
            count={overviewData.applications.hired}
            progress={25}
            icon={CheckCircle}
            color="bg-emerald-100/50 text-emerald-600"
          />
        </div>
      </div>
    </AdminPageLayout>
  );
}
