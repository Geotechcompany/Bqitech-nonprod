// app/dashboard/applications/page.tsx
"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Application } from "@/types/application";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/lib/api";
import { ViewApplicationModal } from "@/components/admin/ViewApplicationModal";

interface ApplicationResponse {
  applications: Application[];
}

export default function ApplicationsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [viewApplication, setViewApplication] = useState<Application | null>(null);

  const { data, isLoading, error } = useQuery<ApplicationResponse>({
    queryKey: ['userApplications'],
    queryFn: () => api.get('/applications').then(res => res.data),
  });

  const handleView = (id: string) => {
    const application = data?.applications.find(app => app.id === id);
    setViewApplication(application || null);
  };

  if (error) return <div>Failed to load applications</div>;
  if (isLoading) return <ApplicationsTableSkeleton />;

  const applications = data?.applications || [];

  const filteredApplications = applications.filter(app => {
    const search = searchTerm.toLowerCase();
    return (
      (app.name?.toLowerCase() ?? '').includes(search) ||
      (app.email?.toLowerCase() ?? '').includes(search) ||
      (app.position?.toLowerCase() ?? '').includes(search)
    );
  });

  return (
    <div className="space-y-6">
      <h2 className="text-2xl md:text-3xl font-semibold text-gray-800">
        My Applications
      </h2>
      <input
        type="text"
        placeholder="Search applications..."
        className="w-full p-2 border rounded"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <div className="overflow-x-auto rounded-lg border shadow-sm">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Position</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Applied Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredApplications.map((app) => {
              const firstName = app.answers?.find(a => 
                a.questionText.toLowerCase().includes('first name')
              )?.answer || '';
              const lastName = app.answers?.find(a => 
                a.questionText.toLowerCase().includes('last name')
              )?.answer || '';
              
              return (
                <tr key={app.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {app.name || `${firstName} ${lastName}`.trim() || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {app.email?.toLowerCase() || 
                     app.answers?.find(a => a.questionText.toLowerCase().includes('email'))?.answer || 
                     'Not provided'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {app.phoneNumber || 
                     app.answers?.find(a => a.questionText.toLowerCase().includes('phone'))?.answer || 
                     'Not provided'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {app.position || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                      {app.status || 'Pending'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {app.appliedDate ? new Date(app.appliedDate).toLocaleDateString() : 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <button
                      onClick={() => handleView(app.id)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      View
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      <ViewApplicationModal
        application={viewApplication}
        isOpen={!!viewApplication}
        onClose={() => setViewApplication(null)}
      />
    </div>
  );
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