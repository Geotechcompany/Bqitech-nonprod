"use client";

import { useQuery } from '@tanstack/react-query';
import { userApi } from '@/lib/api-backend';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';
import { CheckCircle, Clock, TrendingUp, Target } from 'lucide-react';

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
      <div className="relative overflow-hidden rounded-3xl bg-white/80 backdrop-blur-sm p-8 shadow-xl border border-gray-100/50">
        <div className="space-y-6 animate-pulse">
          <div className="flex items-center justify-between">
            <div className="h-6 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg w-32"></div>
            <div className="h-5 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full w-20"></div>
          </div>
          <div className="h-3 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full"></div>
          <div className="flex justify-between">
            <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-24"></div>
            <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-20"></div>
          </div>
        </div>
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

  const statusIcons = {
    'New': Clock,
    'Shortlisted': CheckCircle,
    'Technical Assessment': Target,
    'Interviewing': TrendingUp,
    'Hired': CheckCircle,
    'Rejected': Clock,
    'Disqualified': Clock
  };

  const statusColors = {
    'New': {
      text: 'text-blue-600',
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      gradient: 'from-blue-500 to-cyan-500'
    },
    'Shortlisted': {
      text: 'text-emerald-600',
      bg: 'bg-emerald-50',
      border: 'border-emerald-200',
      gradient: 'from-emerald-500 to-teal-500'
    },
    'Technical Assessment': {
      text: 'text-amber-600',
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      gradient: 'from-amber-500 to-orange-500'
    },
    'Interviewing': {
      text: 'text-violet-600',
      bg: 'bg-violet-50',
      border: 'border-violet-200',
      gradient: 'from-violet-500 to-purple-500'
    },
    'Hired': {
      text: 'text-indigo-600',
      bg: 'bg-indigo-50',
      border: 'border-indigo-200',
      gradient: 'from-indigo-500 to-blue-500'
    },
    'Rejected': {
      text: 'text-rose-600',
      bg: 'bg-rose-50',
      border: 'border-rose-200',
      gradient: 'from-rose-500 to-pink-500'
    },
    'Disqualified': {
      text: 'text-rose-600',
      bg: 'bg-rose-50',
      border: 'border-rose-200',
      gradient: 'from-rose-500 to-pink-500'
    }
  };

  const currentStageColor = statusColors[data.currentStage as keyof typeof statusColors] || statusColors['New'];
  const StatusIcon = statusIcons[data.currentStage as keyof typeof statusIcons] || Clock;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="group relative overflow-hidden rounded-3xl bg-white/80 backdrop-blur-sm p-8 shadow-xl border border-gray-100/50 hover:shadow-2xl transition-all duration-500"
    >
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 to-purple-50/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      <div className="relative z-10 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-2xl bg-gradient-to-br ${currentStageColor.bg} ${currentStageColor.border} border-2 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
              <StatusIcon className={`h-6 w-6 ${currentStageColor.text}`} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-1">Hiring Progress</h3>
              <p className="text-sm text-gray-600">Track your application journey</p>
            </div>
          </div>
          <motion.div 
            className={`px-4 py-2 rounded-full text-sm font-bold ${currentStageColor.bg} ${currentStageColor.text} border-2 ${currentStageColor.border} shadow-lg`}
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 400 }}
          >
            {Math.round(progress)}% Complete
          </motion.div>
        </div>
        
        {/* Progress Bar */}
        <div className="space-y-3">
          <div className="relative">
            <Progress 
              value={progress} 
              className="h-4 bg-gray-100 shadow-inner rounded-full overflow-hidden" 
            />
            <div 
              className={`absolute top-0 left-0 h-full bg-gradient-to-r ${currentStageColor.gradient} rounded-full transition-all duration-1000 ease-out shadow-lg`}
              style={{ width: `${progress}%` }}
            />
          </div>
          
          {/* Progress Indicators */}
          <div className="flex justify-between items-center">
            {data.stages.slice(0, 4).map((stage, index) => (
              <div key={stage} className="flex flex-col items-center gap-1">
                <div className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index <= currentStageIndex 
                    ? `bg-gradient-to-r ${currentStageColor.gradient} shadow-lg` 
                    : 'bg-gray-200'
                }`} />
                <span className="text-xs font-medium text-gray-500 text-center max-w-16 leading-tight">
                  {stage.replace(' ', '\n')}
                </span>
              </div>
            ))}
          </div>
        </div>
        
        {/* Status Summary */}
        <div className="flex justify-between items-center pt-4 border-t border-gray-100">
          <div className="text-sm text-gray-600">
            <span className="font-semibold">Stage:</span> {hasApplications ? `${currentStageIndex + 1} of ${data.stages.length}` : 'Not Started'}
          </div>
          <div className={`flex items-center gap-2 font-bold ${currentStageColor.text}`}>
            <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${currentStageColor.gradient} animate-pulse`} />
            {hasApplications ? (data.currentStage || 'New') : 'No Applications'}
          </div>
        </div>
      </div>
      
      {/* Decorative Elements */}
      <div className="absolute top-0 right-0 w-32 h-32 transform translate-x-16 -translate-y-16 bg-gradient-to-br from-blue-200/20 to-purple-200/20 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
      <div className="absolute bottom-0 left-0 w-24 h-24 transform -translate-x-12 translate-y-12 bg-gradient-to-br from-purple-200/20 to-pink-200/20 rounded-full blur-xl group-hover:scale-125 transition-transform duration-500" />
    </motion.div>
  );
}