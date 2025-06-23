"use client";

import { useState, useEffect } from "react";
import { AdminPageLayout } from "@/components/admin/AdminPageLayout";
import { DisqualifiedTable } from "@/components/admin/DisqualifiedTable";
import useSWR from "swr";
import { EditApplicationModal } from "@/components/admin/EditApplicationModal";
import { ViewApplicationModal } from "@/components/admin/ViewApplicationModal";
import { DeleteApplicationModal } from "@/components/admin/DeleteApplicationModal";
import { Application } from "@/types/application";
import { TableSkeleton } from "@/components/ui/skeleton";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { authService } from "@/lib/auth-backend";
import { adminApi } from "@/lib/api-backend";
import { toast } from "react-hot-toast";

const fetcher = async (url: string) => {
  const session = authService.getSession();
  if (!session) {
    throw new Error('No authentication session');
  }

  const baseUrl = process.env.NEXT_PUBLIC_PYTHON_API_URL || 'http://localhost:8000';
  const response = await fetch(`${baseUrl}/api${url}`, {
    method: 'GET',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session.token}`,
      'Accept': 'application/json'
    }
  });
  
  if (response.status === 401) {
    // Token expired, try to refresh
    const refreshed = await authService.refreshToken();
    if (!refreshed) {
      window.location.href = '/login';
      throw new Error('Session expired');
    }

    // Retry with new token
    const retryResponse = await fetch(`${baseUrl}/api${url}`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${refreshed.access_token}`,
        'Accept': 'application/json'
      }
    });

    if (!retryResponse.ok) {
      const errorData = await retryResponse.json().catch(() => ({}));
      throw new Error(errorData.detail || 'Failed to fetch data');
    }

    const data = await retryResponse.json();
    return data.applications;
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Failed to fetch data');
  }
  
  const data = await response.json();
  return data.applications;
};

export default function DisqualifiedPage() {
  const router = useRouter();
  const { isAuthenticated, isAdmin, authLoading } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const { data: applications = [], error, isLoading: isDataLoading, mutate } = useSWR<Application[]>(
    isAuthenticated && isAdmin ? '/applications/disqualified' : null,
    fetcher,
    {
      onError: (err) => {
        console.error('Error fetching disqualified applications:', err);
      }
    }
  );
  const [viewApplication, setViewApplication] = useState<Application | null>(null);
  const [editApplication, setEditApplication] = useState<Application | null>(null);
  const [deleteApplicationId, setDeleteApplicationId] = useState<string | null>(null);
  const [jobTitles, setJobTitles] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    } else if (!authLoading && !isAdmin) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, isAdmin, authLoading, router]);

  useEffect(() => {
    const fetchJobTitles = async () => {
      try {
        const response = await adminApi.getJobPostings();
        const jobs = Array.isArray(response) ? response : 
                    response.jobPostings ? response.jobPostings : [];
        
        const jobTitlesMap: Record<string, string> = {};
        jobs.forEach((job: any) => {
          const jobId = job.id || (job._id ? String(job._id) : null);
          if (jobId && job.title) {
            jobTitlesMap[jobId] = job.title;
          }
        });
        setJobTitles(jobTitlesMap);
      } catch (error) {
        console.error('Failed to fetch job titles:', error);
        toast.error('Failed to fetch job titles');
      }
    };
    
    if (isAuthenticated && isAdmin) {
      fetchJobTitles();
    }
  }, [isAuthenticated, isAdmin, router]);

  if (authLoading || isDataLoading) {
    return (
      <AdminPageLayout title="Disqualified" showSearch={false}>
        <TableSkeleton rows={8} columns={5} />
      </AdminPageLayout>
    );
  }

  if (!isAuthenticated || !isAdmin) {
    return null; // Router will handle the redirect
  }

  if (error) return <div>Failed to load disqualified candidates</div>;

  const filteredData = applications.filter((app: Application) =>
    Object.values(app).some((value) =>
      String(value).toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  return (
    <AdminPageLayout
      title="Disqualified"
      searchPlaceholder="Search disqualified candidates..."
      searchValue={searchTerm}
      onSearch={setSearchTerm}
    >
      <div className="overflow-x-auto">
        <DisqualifiedTable
          applications={filteredData}
          jobTitles={jobTitles}
          onView={(id) => {
            const application = applications?.find((app) => app.id === id);
            setViewApplication(application || null);
          }}
          onEdit={(id) => {
            const application = applications?.find((app) => app.id === id);
            setEditApplication(application || null);
          }}
          onDelete={(id) => setDeleteApplicationId(id)}
        />
      </div>

      <ViewApplicationModal
        application={viewApplication}
        isOpen={!!viewApplication}
        onClose={() => setViewApplication(null)}
      />
      <EditApplicationModal
        application={editApplication}
        isOpen={!!editApplication}
        onClose={() => setEditApplication(null)}
        onSave={async (updatedApplication) => {
          try {
            const session = authService.getSession();
            if (!session) {
              router.push('/login');
              return;
            }

            const response = await fetch(`${process.env.NEXT_PUBLIC_PYTHON_API_URL}/api/applications/${updatedApplication.id}`, {
              method: "PUT",
              headers: { 
                "Content-Type": "application/json",
                'Authorization': `Bearer ${session.token}`,
                'Accept': 'application/json'
              },
              credentials: 'include',
              body: JSON.stringify(updatedApplication),
            });

            if (response.status === 401) {
              const refreshed = await authService.refreshToken();
              if (!refreshed) {
                router.push('/login');
                return;
              }

              // Retry with new token
              await fetch(`${process.env.NEXT_PUBLIC_PYTHON_API_URL}/api/applications/${updatedApplication.id}`, {
                method: "PUT",
                headers: { 
                  "Content-Type": "application/json",
                  'Authorization': `Bearer ${refreshed.access_token}`,
                  'Accept': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify(updatedApplication),
              });
            }

            setEditApplication(null);
            mutate();
          } catch (error) {
            console.error("Failed to update application:", error);
          }
        }}
      />
      <DeleteApplicationModal
        applicationId={deleteApplicationId}
        isOpen={!!deleteApplicationId}
        onClose={() => setDeleteApplicationId(null)}
        onConfirm={async (id) => {
          try {
            const session = authService.getSession();
            if (!session) {
              router.push('/login');
              return;
            }

            const response = await fetch(`${process.env.NEXT_PUBLIC_PYTHON_API_URL}/api/applications/${id}`, {
              method: "DELETE",
              credentials: 'include',
              headers: {
                'Authorization': `Bearer ${session.token}`,
                'Accept': 'application/json'
              }
            });

            if (response.status === 401) {
              const refreshed = await authService.refreshToken();
              if (!refreshed) {
                router.push('/login');
                return;
              }

              // Retry with new token
              await fetch(`${process.env.NEXT_PUBLIC_PYTHON_API_URL}/api/applications/${id}`, {
                method: "DELETE",
                credentials: 'include',
                headers: {
                  'Authorization': `Bearer ${refreshed.access_token}`,
                  'Accept': 'application/json'
                }
              });
            }

            setDeleteApplicationId(null);
            mutate();
          } catch (error) {
            console.error("Failed to delete application:", error);
          }
        }}
      />
    </AdminPageLayout>
  );
}
