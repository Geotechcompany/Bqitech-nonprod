"use client";

import { useState, useEffect } from "react";
import { AdminPageLayout } from "@/components/admin/AdminPageLayout";
import { HiredTable } from "@/components/admin/HiredTable";
import useSWR from "swr";
import { EditApplicationModal } from "@/components/admin/EditApplicationModal";
import { ViewApplicationModal } from "@/components/admin/ViewApplicationModal";
import { DeleteApplicationModal } from "@/components/admin/DeleteApplicationModal";
import { Application } from "@/types/application";
import { TableSkeleton } from "@/components/ui/skeleton";

const getAuthToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('authToken');
  }
  return null;
};

const refreshToken = async () => {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_PYTHON_API_URL || 'http://localhost:8000';
    const response = await fetch(`${baseUrl}/api/auth/refresh-token`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (response.ok) {
      const data = await response.json();
      localStorage.setItem('authToken', data.access_token);
      return data.access_token;
    }
    return null;
  } catch (error) {
    console.error('Token refresh failed:', error);
    return null;
  }
};

const fetcher = async (url: string) => {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_PYTHON_API_URL || 'http://localhost:8000';
    let token = getAuthToken();

    const makeRequest = async (authToken: string | null) => {
      const response = await fetch(`${baseUrl}${url}`, {
        method: 'GET',
        credentials: 'omit',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          ...(authToken ? { 'Authorization': `Bearer ${authToken}` } : {})
        },
        cache: 'no-store',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.applications || [];
    };

    try {
      return await makeRequest(token);
    } catch (error) {
      if (error instanceof Error && error.message.includes('401')) {
        // Token might be expired, try to refresh
        const newToken = await refreshToken();
        if (newToken) {
          // Retry with new token
          return await makeRequest(newToken);
        }
        // If refresh failed, redirect to login
        window.location.href = '/login';
        return [];
      }
      throw error;
    }
  } catch (error) {
    console.error('Fetch error:', error);
    throw error;
  }
};

export default function HiredPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const { data, error, isLoading, mutate } = useSWR<Application[]>(
    "/api/admin/hired",
    fetcher
  );
  const [viewApplication, setViewApplication] = useState<Application | null>(null);
  const [editApplication, setEditApplication] = useState<Application | null>(null);
  const [deleteApplicationId, setDeleteApplicationId] = useState<string | null>(null);
  const [jobTitles, setJobTitles] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchJobTitles = async () => {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_PYTHON_API_URL || 'http://localhost:8000';
        let token = getAuthToken();

        const makeRequest = async (authToken: string | null) => {
          const response = await fetch(`${baseUrl}/api/applications/jobs`, {
            method: 'GET',
            credentials: 'omit',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
              ...(authToken ? { 'Authorization': `Bearer ${authToken}` } : {})
            },
            cache: 'no-store',
          });

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          const data = await response.json();
          return data;
        };

        try {
          const data = await makeRequest(token);
          const titles = (data.jobs || []).reduce((acc: Record<string, string>, job: any) => {
            acc[job.id] = job.title;
            return acc;
          }, {});
          setJobTitles(titles);
        } catch (error) {
          if (error instanceof Error && error.message.includes('401')) {
            // Token might be expired, try to refresh
            const newToken = await refreshToken();
            if (newToken) {
              // Retry with new token
              const data = await makeRequest(newToken);
              const titles = (data.jobs || []).reduce((acc: Record<string, string>, job: any) => {
                acc[job.id] = job.title;
                return acc;
              }, {});
              setJobTitles(titles);
              return;
            }
            // If refresh failed, redirect to login
            window.location.href = '/login';
          }
          console.error('Failed to fetch job titles:', error);
          setJobTitles({});
        }
      } catch (error) {
        console.error('Failed to fetch job titles:', error);
        setJobTitles({});
      }
    };
    fetchJobTitles();
  }, []);

  const handleView = (id: string) => {
    const application = data?.find((app: Application) => app.id === id);
    setViewApplication(application || null);
  };

  const handleEdit = (id: string) => {
    const application = data?.find((app: Application) => app.id === id);
    setEditApplication(application || null);
  };

  const handleDelete = (id: string) => {
    setDeleteApplicationId(id);
  };

  const handleSaveEdit = async (updatedApplication: Application) => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_PYTHON_API_URL || 'http://localhost:8000';
      const token = getAuthToken();

      await fetch(`${baseUrl}/api/admin/applications/${updatedApplication.id}`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          'Accept': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify(updatedApplication),
      });
      setEditApplication(null);
      mutate();
    } catch (error) {
      console.error("Failed to update application:", error);
    }
  };

  const handleConfirmDelete = async (id: string) => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_PYTHON_API_URL || 'http://localhost:8000';
      const token = getAuthToken();

      await fetch(`${baseUrl}/api/admin/applications/${id}`, { 
        method: "DELETE",
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        }
      });
      setDeleteApplicationId(null);
      mutate();
    } catch (error) {
      console.error("Failed to delete application:", error);
    }
  };

  const filteredData = (Array.isArray(data) ? data : []).filter((app: Application) =>
    Object.values(app).some((value) =>
      String(value).toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  if (error) return <div>Failed to load hired candidates</div>;
  if (isLoading) return (
    <AdminPageLayout title="Hired" showSearch={false}>
      <TableSkeleton rows={8} columns={5} />
    </AdminPageLayout>
  );

  return (
    <AdminPageLayout
      title="Hired"
      searchPlaceholder="Search hired candidates..."
      searchValue={searchTerm}
      onSearch={setSearchTerm}
    >
      <div className="overflow-x-auto">
        <HiredTable
          applications={filteredData}
          jobTitles={jobTitles}
          onView={handleView}
          onEdit={handleEdit}
          onDelete={handleDelete}
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
        onSave={handleSaveEdit}
      />
      <DeleteApplicationModal
        applicationId={deleteApplicationId}
        isOpen={!!deleteApplicationId}
        onClose={() => setDeleteApplicationId(null)}
        onConfirm={handleConfirmDelete}
      />
    </AdminPageLayout>
  );
}
