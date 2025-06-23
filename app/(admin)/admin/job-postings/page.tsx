"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { AdminPageLayout } from "@/components/admin/AdminPageLayout";
import DataTable from "@/components/admin/DataTable";
import { Edit, Trash2, Power, PowerOff } from "lucide-react";
import Loader from "@/components/Loader";
import toast from "react-hot-toast";
import { useAuth } from "@/contexts/AuthContext";
import { authService } from "@/lib/auth-backend";

interface JobPosting {
  id: string;
  title: string;
  department: string;
  location: string;
  description: string;
  postedDate: string;
  isActive: boolean;
}

export default function JobPostingsPage() {
  const [jobPostings, setJobPostings] = useState<JobPosting[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const router = useRouter();
  const { isAuthenticated, isAdmin, authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && (!isAuthenticated || !isAdmin)) {
      router.push('/login');
    }
  }, [authLoading, isAuthenticated, isAdmin, router]);

  useEffect(() => {
    async function fetchJobPostings() {
      try {
        const session = authService.getSession();
        if (!session) {
          router.push('/login');
          return;
        }

        const response = await fetch(`${process.env.NEXT_PUBLIC_PYTHON_API_URL}/api/admin/job-postings`, {
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
          const retryResponse = await fetch(`${process.env.NEXT_PUBLIC_PYTHON_API_URL}/api/admin/job-postings`, {
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${refreshed.access_token}`,
              'Accept': 'application/json'
            }
          });

          if (!retryResponse.ok) {
            throw new Error("Failed to fetch job postings");
          }

          const data = await retryResponse.json();
          setJobPostings(data.jobPostings || []);
          return;
        }

        if (!response.ok) {
          throw new Error("Failed to fetch job postings");
        }

        const data = await response.json();
        setJobPostings(data.jobPostings || []);
      } catch (err) {
        console.error('Error fetching job postings:', err);
        setError("Failed to load job postings. Please try again.");
      } finally {
        setIsLoading(false);
      }
    }

    if (isAuthenticated && isAdmin) {
      fetchJobPostings();
    }
  }, [isAuthenticated, isAdmin, router]);

  const handleEdit = (id: string) => {
    router.push(`/admin/job-postings/${id}/edit`);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this job posting?")) {
      try {
        const session = authService.getSession();
        if (!session) {
          router.push('/login');
          return;
        }

        const response = await fetch(`${process.env.NEXT_PUBLIC_PYTHON_API_URL}/api/admin/job-postings/${id}`, {
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
          await fetch(`${process.env.NEXT_PUBLIC_PYTHON_API_URL}/api/admin/job-postings/${id}`, {
            method: "DELETE",
            credentials: 'include',
            headers: {
              'Authorization': `Bearer ${refreshed.access_token}`,
              'Accept': 'application/json'
            }
          });
        }

        setJobPostings(jobPostings.filter((posting) => posting.id !== id));
        toast.success("Job posting deleted successfully");
      } catch (err) {
        console.error('Error deleting job posting:', err);
        toast.error("Failed to delete job posting");
      }
    }
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const session = authService.getSession();
      if (!session) {
        router.push('/login');
        return;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_PYTHON_API_URL}/api/admin/job-postings/${id}/toggle-status`, {
        method: "PATCH",
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.token}`,
          'Accept': 'application/json'
        },
        body: JSON.stringify({ isActive: !currentStatus }),
      });

      if (response.status === 401) {
        const refreshed = await authService.refreshToken();
        if (!refreshed) {
          router.push('/login');
          return;
        }

        // Retry with new token
        await fetch(`${process.env.NEXT_PUBLIC_PYTHON_API_URL}/api/admin/job-postings/${id}/toggle-status`, {
          method: "PATCH",
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${refreshed.access_token}`,
            'Accept': 'application/json'
          },
          body: JSON.stringify({ isActive: !currentStatus }),
        });
      }

      setJobPostings(prevPostings =>
        prevPostings.map(posting =>
          posting.id === id ? { ...posting, isActive: !posting.isActive } : posting
        )
      );

      toast.success(`Job posting ${!currentStatus ? 'activated' : 'deactivated'} successfully`);
    } catch (err) {
      console.error('Error toggling job status:', err);
      toast.error("Failed to update job status");
    }
  };

  const columns = [
    { header: "Title", accessor: "title" },
    { header: "Department", accessor: "department" },
    { header: "Location", accessor: "location" },
    { header: "Posted Date", accessor: "postedDate" },
    {
      header: "Status",
      accessor: "isActive",
      cell: ({ row }: { row: JobPosting }) => (
        <span className={`px-2 py-1 rounded-full text-sm ${
          row.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {row.isActive ? 'Active' : 'Inactive'}
        </span>
      ),
    },
  ];

  const actionButtons = (row: JobPosting) => (
    <div className="flex gap-2">
      <Button
        size="sm"
        variant="ghost"
        onClick={() => handleEdit(row.id)}
        className="p-2"
      >
        <Edit className="h-4 w-4" />
      </Button>
      <Button
        size="sm"
        variant="ghost"
        onClick={() => handleToggleActive(row.id, row.isActive)}
        className={`p-2 ${row.isActive ? 'text-red-600 hover:text-red-700' : 'text-green-600 hover:text-green-700'}`}
      >
        {row.isActive ? (
          <PowerOff className="h-4 w-4" />
        ) : (
          <Power className="h-4 w-4" />
        )}
      </Button>
      <Button
        size="sm"
        variant="ghost"
        onClick={() => handleDelete(row.id)}
        className="p-2 text-red-600 hover:text-red-700"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );

  const filteredData = jobPostings.filter((job) =>
    Object.values(job).some((value) =>
      String(value).toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  if (isLoading) return <Loader/>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <AdminPageLayout
      title="Job Postings"
      searchPlaceholder="Search job postings..."
      searchValue={searchTerm}
      onSearch={setSearchTerm}
    >
      <div className="space-y-6">
        <div className="flex justify-end">
          <Button onClick={() => router.push("/admin/job-postings/new")}>
            Add New Job Posting
          </Button>
        </div>
        <div className="overflow-x-auto">
          <DataTable
            columns={columns}
            data={filteredData}
            actionButtons={actionButtons}
          />
        </div>
      </div>
    </AdminPageLayout>
  );
}
