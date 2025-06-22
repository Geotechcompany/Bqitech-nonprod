// app/dashboard/applications/page.tsx
"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Application } from "@/types/application";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/lib/api";
import { ViewApplicationModal } from "@/components/admin/ViewApplicationModal";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface ApplicationResponse {
  applications: Application[];
}

export default function ApplicationsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [viewApplication, setViewApplication] = useState<Application | null>(null);

  const { data, isLoading, error } = useQuery<ApplicationResponse>({
    queryKey: ['userApplications'],
    queryFn: async () => {
      try {
        const response = await api.get('/api/user/applications');
        return response.data;
      } catch (error: any) {
        throw new Error(error.response?.data?.detail || 'Failed to load applications');
      }
    },
    retry: 1,
  });

  const handleView = (id: string) => {
    const application = data?.applications.find(app => app.id === id);
    setViewApplication(application || null);
  };

  if (error) {
    return (
      <Alert variant="destructive" className="mb-6">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          {error instanceof Error ? error.message : 'Failed to load applications'}
        </AlertDescription>
      </Alert>
    );
  }

  if (isLoading) return <ApplicationsTableSkeleton />;

  const applications = data?.applications || [];

  const filteredApplications = applications.filter(app => {
    const search = searchTerm.toLowerCase();
    return (
      (app.name?.toLowerCase() ?? '').includes(search) ||
      (app.email?.toLowerCase() ?? '').includes(search) ||
      (app.position?.toLowerCase() ?? '').includes(search) ||
      (app.jobDetails?.title?.toLowerCase() ?? '').includes(search)
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl md:text-3xl font-semibold text-gray-800">
          My Applications
        </h2>
        <p className="text-muted-foreground">
          Track and manage your job applications
        </p>
      </div>

      <div className="flex items-center space-x-2">
        <input
          type="text"
          placeholder="Search applications..."
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="rounded-md border">
        <div className="overflow-x-auto">
          <table className="w-full divide-y divide-border">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Position</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Applied Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Department</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Location</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-background divide-y divide-border">
              {filteredApplications.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">
                    No applications found
                  </td>
                </tr>
              ) : (
                filteredApplications.map((app) => (
                  <tr key={app.id} className="hover:bg-muted/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-foreground">
                        {app.jobDetails?.title || app.position || 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        getStatusStyle(app.status)
                      }`}>
                        {app.status || 'Pending'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {app.appliedDate ? new Date(app.appliedDate).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {app.jobDetails?.department || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {app.jobDetails?.location || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => handleView(app.id)}
                        className="text-primary hover:text-primary/80 font-medium"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ViewApplicationModal
        application={viewApplication}
        isOpen={!!viewApplication}
        onClose={() => setViewApplication(null)}
      />
    </div>
  );
}

function getStatusStyle(status: string = ''): string {
  const statusStyles: Record<string, string> = {
    'pending': 'bg-yellow-100 text-yellow-800',
    'shortlisted': 'bg-blue-100 text-blue-800',
    'technical_assessment': 'bg-purple-100 text-purple-800',
    'interviewing': 'bg-indigo-100 text-indigo-800',
    'hired': 'bg-green-100 text-green-800',
    'disqualified': 'bg-red-100 text-red-800',
    'rejected': 'bg-gray-100 text-gray-800'
  };

  return statusStyles[status.toLowerCase()] || 'bg-gray-100 text-gray-800';
}

function ApplicationsTableSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-10 w-64" />
      <Skeleton className="h-12 w-full" />
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    </div>
  );
}