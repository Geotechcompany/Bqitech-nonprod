"use client";

import { useState, useEffect } from "react";
import { AdminPageLayout } from "@/components/admin/AdminPageLayout";
import { TechnicalAssessmentTable } from "@/components/admin/TechnicalAssessmentTable";
import useSWR from "swr";
import { EditApplicationModal } from "@/components/admin/EditApplicationModal";
import { ViewApplicationModal } from "@/components/admin/ViewApplicationModal";
import { DeleteApplicationModal } from "@/components/admin/DeleteApplicationModal";
import { Application } from "@/types/application";
import { TableSkeleton } from "@/components/ui/skeleton";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { authService } from "@/lib/auth-backend";

const fetcher = async (url: string) => {
  const session = authService.getSession();
  if (!session) {
    throw new Error('No authentication session');
  }

  const baseUrl = process.env.NEXT_PUBLIC_PYTHON_API_URL || 'http://localhost:8000';
  const response = await fetch(`${baseUrl}/api/applications${url}`, {
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
    const retryResponse = await fetch(`${baseUrl}/api/applications${url}`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${refreshed.access_token}`,
        'Accept': 'application/json'
      }
    });

    if (!retryResponse.ok) {
      throw new Error('Failed to fetch data');
    }

    const data = await retryResponse.json();
    return data.applications;
  }

  if (!response.ok) {
    throw new Error('Failed to fetch data');
  }
  
  const data = await response.json();
  return data.applications;
};

export default function TechnicalAssessmentPage() {
  const router = useRouter();
  const { isAuthenticated, isAdmin, isLoading } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const { data: applications = [], error, isLoading: isDataLoading, mutate } = useSWR<Application[]>(
    isAuthenticated && isAdmin ? '/technical-assessment' : null,
    fetcher
  );
  const [viewApplication, setViewApplication] = useState<Application | null>(null);
  const [editApplication, setEditApplication] = useState<Application | null>(null);
  const [deleteApplicationId, setDeleteApplicationId] = useState<string | null>(null);
  const [jobTitles, setJobTitles] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || !isAdmin)) {
      router.push('/login');
    }
  }, [isLoading, isAuthenticated, isAdmin, router]);

  useEffect(() => {
    const fetchJobTitles = async () => {
      try {
        const session = authService.getSession();
        if (!session) return;

        const response = await fetch(`${process.env.NEXT_PUBLIC_PYTHON_API_URL}/api/applications/jobs`, {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
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
          const retryResponse = await fetch(`${process.env.NEXT_PUBLIC_PYTHON_API_URL}/api/applications/jobs`, {
            method: 'GET',
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${refreshed.access_token}`,
              'Accept': 'application/json'
            }
          });

          if (!retryResponse.ok) return;

          const data = await retryResponse.json();
          const titles = data.jobs.reduce((acc: Record<string, string>, job: any) => {
            acc[job.id] = job.title;
            return acc;
          }, {});
          setJobTitles(titles);
        } else if (response.ok) {
          const data = await response.json();
          const titles = data.jobs.reduce((acc: Record<string, string>, job: any) => {
            acc[job.id] = job.title;
            return acc;
          }, {});
          setJobTitles(titles);
        }
      } catch (error) {
        console.error('Failed to fetch job titles:', error);
      }
    };
    
    if (isAuthenticated && isAdmin) {
      fetchJobTitles();
    }
  }, [isAuthenticated, isAdmin, router]);

  if (isLoading || isDataLoading) {
    return (
      <AdminPageLayout title="Technical Assessment" showSearch={false}>
        <TableSkeleton rows={8} columns={5} />
      </AdminPageLayout>
    );
  }

  if (!isAuthenticated || !isAdmin) {
    return null; // Router will handle the redirect
  }

  if (error) return <div>Failed to load technical assessment candidates</div>;

  const filteredData = applications.filter((app: Application) =>
    Object.values(app).some((value) =>
      String(value).toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  return (
    <AdminPageLayout
      title="Technical Assessment"
      searchPlaceholder="Search technical assessment candidates..."
      searchValue={searchTerm}
      onSearch={setSearchTerm}
    >
      <div className="overflow-x-auto">
        <TechnicalAssessmentTable
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
