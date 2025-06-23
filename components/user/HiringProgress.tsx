"use client";

import { useQuery } from '@tanstack/react-query';
import { userApi } from '@/lib/api-backend';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/contexts/AuthContext';

interface HiringProgressResponse {
  stages: string[];
  currentStage: string | null;
  stageData: {
    [key: string]: {
      count: number;
      applications: Array<{
        id: string;
        jobId: string;
        status: string;
        appliedDate: string;
      }>;
    };
  };
}

export function HiringProgress() {
  const { user } = useAuth();

  const { data, isLoading } = useQuery<HiringProgressResponse>({
    queryKey: ['hiringProgress'],
    queryFn: () => userApi.getHiringProgress(),
    staleTime: 30000,
    gcTime: 60000,
  });

  if (isLoading) {
    return (
      <div className="space-y-2 animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-24"></div>
        <div className="h-2 bg-gray-200 rounded"></div>
        <div className="h-4 bg-gray-200 rounded w-16"></div>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  // Calculate progress based on current stage
  const hasApplications = Object.values(data.stageData).some(stage => stage.count > 0);
  const currentStageIndex = hasApplications ? data.stages.indexOf(data.currentStage || 'New') : -1;
  const progress = hasApplications ? ((currentStageIndex + 1) / data.stages.length) * 100 : 0;

  const statusColors = {
    'New': 'text-blue-600',
    'Shortlisted': 'text-emerald-600',
    'Technical Assessment': 'text-amber-600',
    'Interviewing': 'text-violet-600',
    'Hired': 'text-indigo-600',
    'Rejected': 'text-rose-600',
    'Disqualified': 'text-rose-600'
  };

  const statusColor = statusColors[data.currentStage as keyof typeof statusColors] || 'text-gray-500';

  return (
    <div className="bg-white p-4 rounded-lg border border-gray-100 space-y-3">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-medium text-gray-700">Hiring Progress</h3>
        <span className="text-xs text-blue-600 font-medium">
          {Math.round(progress)}% Complete
        </span>
      </div>
      
      <Progress value={progress} className="h-2" />
      
      <div className="flex justify-between items-center text-xs">
        <span className="text-gray-500">
          Stage: {hasApplications ? `${currentStageIndex + 1}/${data.stages.length}` : '0/6'}
        </span>
        <span className={`font-medium ${statusColor}`}>
          {hasApplications ? (data.currentStage || 'New') : 'No Applications'}
        </span>
      </div>
    </div>
  );
} 