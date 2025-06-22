import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Progress } from '@/components/ui/progress';

interface HiringProgressResponse {
  progress: number;
  stage: number;
  totalStages: number;
  status: string;
  applicationId: string;
}

export function HiringProgress() {
  const { data, isLoading } = useQuery<HiringProgressResponse>({
    queryKey: ['hiringProgress'],
    queryFn: async () => {
      const response = await api.get('/api/user/hiring-progress');
      return response.data;
    },
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

  return (
    <div className="bg-white p-4 rounded-lg border border-gray-100 space-y-3">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-medium text-gray-700">Hiring Progress</h3>
        <span className="text-xs text-blue-600 font-medium">
          {Math.round(data.progress)}% Complete
        </span>
      </div>
      
      <Progress value={data.progress} className="h-2" />
      
      <div className="flex justify-between items-center text-xs text-gray-500">
        <span>Stage: {data.stage}/{data.totalStages}</span>
        <span>{data.status}</span>
      </div>
    </div>
  );
} 