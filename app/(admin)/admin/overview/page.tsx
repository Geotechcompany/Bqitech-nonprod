"use client";

import { motion } from 'framer-motion';
import { Users, FileText, CheckCircle, XCircle, UserCheck, Code, MessageSquare, ArrowRight, ChevronDown, Clock, BarChart, Plus, ArrowUp, ArrowDown } from 'lucide-react';
import useSWR from 'swr';
import { useState } from 'react';
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

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

// Unified fetcher with error handling
const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch data');
  return res.json();
};

interface Application {
  id: string;
  name: string;
  email: string;
  position: string;
  status: string;
  appliedDate: Date;
}

const statusColors = {
  New: 'bg-blue-100 text-blue-800',
  Shortlisted: 'bg-green-100 text-green-800',
  Interviewing: 'bg-purple-100 text-purple-800',
  Hired: 'bg-emerald-100 text-emerald-800',
  Rejected: 'bg-rose-100 text-rose-800',
};

const StatCard = ({ title, value, icon: Icon, trend, color }: {
  title: string;
  value: number;
  icon: any;
  trend?: number;
  color: string;
}) => (
  <motion.div
    whileHover={{ y: -4 }}
    className="bg-background rounded-2xl border p-5 shadow-lg hover:shadow-xl transition-shadow"
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
  const { data: overviewData, error: overviewError, isLoading } = useSWR('/api/admin/overview', fetcher);
  const { data: recentApplications = [] } = useSWR('/api/admin/applications/recent', fetcher);
  const { data: trendData } = useSWR('/api/admin/trends', fetcher);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);

  const chartData = {
    labels: trendData?.labels || [],
    datasets: [
      {
        label: 'Applications',
        data: trendData?.values || [],
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
      },
    ],
  };

  if (isLoading) return (
    <AdminPageLayout title="Dashboard Overview" className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-24" />)}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Skeleton className="h-96 lg:col-span-2" />
        <Skeleton className="h-96" />
      </div>
    </AdminPageLayout>
  );

  if (overviewError) return <div className="text-center py-8">Failed to load dashboard data</div>;

  return (
    <AdminPageLayout
      title="Dashboard Overview"
      className="space-y-4"
      headerActions={<Button size="sm" className="gap-1"><Plus className="h-4 w-4" /> New Job</Button>}
    >
      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-3">
        <StatCard
          title="Total Applications"
          value={overviewData.totalApplications}
          icon={FileText}
          trend={12}
          color="bg-blue-100/50 text-blue-600"
        />
        <StatCard
          title="Shortlisted"
          value={overviewData.shortlisted}
          icon={UserCheck}
          color="bg-green-100/50 text-green-600"
        />
        <StatCard
          title="In Assessment"
          value={overviewData.technicalAssessment}
          icon={Code}
          color="bg-amber-100/50 text-amber-600"
        />
        <StatCard
          title="Interviewing"
          value={overviewData.interviewing}
          icon={MessageSquare}
          color="bg-purple-100/50 text-purple-600"
        />
        <StatCard
          title="Hired"
          value={overviewData.hired}
          icon={CheckCircle}
          color="bg-emerald-100/50 text-emerald-600"
        />
        <StatCard
          title="Disqualified"
          value={overviewData.disqualified}
          icon={XCircle}
          color="bg-rose-100/50 text-rose-600"
        />
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-4">
        {/* Recent Applications Card */}
        <Card className="lg:col-span-2 ">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between ">
              <CardTitle>Recent Applications</CardTitle>
              <Button variant="ghost" size="sm" className="gap-1">
                View All <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead>Candidate</TableHead>
                  <TableHead>Position</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Applied</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentApplications.map((app: Application) => (
                  <TableRow
                    key={app.id}
                    className="hover:bg-muted/50 cursor-pointer"
                    onClick={() => setSelectedApp(app)}
                  >
                    <TableCell>
                      <div className="font-medium">{app.name}</div>
                      <div className="text-sm text-muted-foreground">{app.email}</div>
                    </TableCell>
                    <TableCell>{app.position}</TableCell>
                    <TableCell>
                      <Badge className={statusColors[app.status as keyof typeof statusColors]}>
                        {app.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {new Date(app.appliedDate).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Hiring Pipeline */}
        <div className="space-y-3">
          <PipelineStage
            title="Hired"
            count={overviewData.hired}
            progress={(overviewData.hired / overviewData.totalApplications) * 100}
            icon={CheckCircle}
            color="bg-emerald-100/50 text-emerald-600"
          />
          <PipelineStage
            title="Interviewing"
            count={overviewData.interviewing}
            progress={(overviewData.interviewing / overviewData.totalApplications) * 100}
            icon={MessageSquare}
            color="bg-purple-100/50 text-purple-600"
          />
          <PipelineStage
            title="Technical Assessment"
            count={overviewData.technicalAssessment}
            progress={(overviewData.technicalAssessment / overviewData.totalApplications) * 100}
            icon={Code}
            color="bg-amber-100/50 text-amber-600"
          />
           <PipelineStage
            title="Shortlisted"
            count={overviewData.shortlisted}
            progress={(overviewData.shortlisted / overviewData.totalApplications) * 100}
            icon={UserCheck}
            color="bg-green-100/50 text-green-600"
          />
        </div>
      </div>

      {/* Application Trends */}
      <Card>
        <CardHeader>
          <CardTitle>Application Trends</CardTitle>
        </CardHeader>
        <CardContent className="h-80">
          <Line
            data={chartData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: { position: 'top' },
                tooltip: { mode: 'index' }
              },
              scales: {
                x: { grid: { display: false } },
                y: { border: { dash: [4] } }
              }
            }}
          />
        </CardContent>
      </Card>
    </AdminPageLayout>
  );
}
