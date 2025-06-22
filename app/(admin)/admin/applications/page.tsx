"use client";

import { useState, useEffect } from "react";
import { ApplicationsTable } from "./ApplicationsTable";
import useSWR from "swr";
import { EditApplicationModal } from "@/components/admin/EditApplicationModal";
import { ViewApplicationModal } from "@/components/admin/ViewApplicationModal";
import { DeleteApplicationModal } from "@/components/admin/DeleteApplicationModal";
import { Application } from "@/types/application";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import { Button } from "@/components/ui/button";
import { Download, Upload, FileText, Sheet } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AdminPageLayout } from "@/components/admin/AdminPageLayout";
import { TableSkeleton } from "@/components/ui/skeleton";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { authService } from "@/lib/auth-backend";

interface Column {
  header: string;
  accessor: string | ((row: Application) => string);
}

const getDynamicColumns = (applications: Application[]) => {
  return []; // No dynamic columns needed now
};

const staticColumns = [
  {
    header: "Applicant",
    accessor: (row: Application) => row.name || [
      ...(row.answers || []).filter(a => a.questionText.toLowerCase().includes('name')),
    ].map(a => a.answer).join(' ')
  },
  {
    header: "Email",
    accessor: (row: Application) => row.email || 
      (row.answers || []).find(a => a.questionText.toLowerCase().includes('email'))?.answer
  },
  {
    header: "Phone",
    accessor: (row: Application) => row.phoneNumber ||
      (row.answers || []).find(a => a.questionText.toLowerCase().includes('phone'))?.answer
  },
  { header: "Position", accessor: "position" },
  { header: "Status", accessor: "status" },
  { 
    header: "Applied Date", 
    accessor: (row: Application) => new Date(row.appliedDate).toLocaleDateString() 
  },
  { 
    header: "CV", 
    accessor: (row: Application) => row.cvUrl
  },
  {
    header: "Answers",
    accessor: (row: Application) => row.answers?.map(a => 
      `${a.questionText}: ${a.answer}`
    ).join('\n') || '-',
    cell: ({ value }: { value: string }) => (
      <pre className="whitespace-pre-wrap">{value}</pre>
    )
  }
];

const oldStructureColumns = [
  { header: "COTS Experience", accessor: "cotsExperience" },
  { header: "SQL/JS Experience", accessor: "sqlJavaScriptExperience" },
  { header: "Report Development", accessor: "reportDevelopmentExperience" }
];

const newStructureColumns = [
  {
    header: "Answers",
    accessor: (row: Application) => row.answers?.map(a => 
      `${a.questionText}: ${a.answer}`
    ).join('\n') || '-'
  }
];

// Add custom error type definition
interface ApiError extends Error {
  info?: any;
  status?: number;
}

const fetcher = async (url: string) => {
  try {
    const session = authService.getSession();
    if (!session) {
      throw new Error('No authentication session');
    }

    const baseUrl = process.env.NEXT_PUBLIC_PYTHON_API_URL || 'http://localhost:10000';
    const fullUrl = `${baseUrl}${url}`;
    
    console.log('Fetching applications from:', fullUrl);

    const response = await fetch(fullUrl, {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.token}`,
        'Accept': 'application/json',
        'X-User-Session': JSON.stringify({
          id: session.user.id,
          email: session.user.email,
          role: session.user.role
        })
      }
    });

    if (!response.ok) {
      if (response.status === 401) {
        console.log('Token expired, attempting refresh...');
        const refreshed = await authService.refreshToken();
        if (!refreshed) {
          window.location.href = '/login';
          throw new Error('Session expired');
        }

        const retryResponse = await fetch(fullUrl, {
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${refreshed.access_token}`,
            'Accept': 'application/json',
            'X-User-Session': JSON.stringify({
              id: session.user.id,
              email: session.user.email,
              role: session.user.role
            })
          }
        });

        if (!retryResponse.ok) {
          throw new Error(`Failed to fetch data: ${retryResponse.statusText}`);
        }

        const data = await retryResponse.json();
        return data;
      }
      throw new Error(`Failed to fetch data: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Fetcher error:', error);
    throw error;
  }
};

export default function ApplicationsPage() {
  const router = useRouter();
  const { isAuthenticated, isAdmin, isLoading } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPosition, setSelectedPosition] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const { data, error, isLoading: isDataLoading, mutate } = useSWR<{
    applications: Application[];
    total: number;
    page: number;
    totalPages: number;
  }>(
    isAuthenticated && isAdmin 
      ? `/api/admin/applications?limit=${itemsPerPage}&skip=${(currentPage - 1) * itemsPerPage}${selectedStatus ? `&status=${selectedStatus}` : ''}`
      : null,
    fetcher,
    {
      onError: (err) => {
        console.error('SWR Error:', err);
        setFetchError(err.message);
      },
      revalidateOnFocus: true,
      refreshInterval: 30000, // Refresh every 30 seconds
      dedupingInterval: 5000,
      shouldRetryOnError: true,
      errorRetryCount: 3
    }
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

        const response = await fetch(`${process.env.NEXT_PUBLIC_PYTHON_API_URL}/api/jobs`, {
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.token}`,
            'Accept': 'application/json',
            'X-User-Session': JSON.stringify({
              id: session.user.id,
              email: session.user.email,
              role: session.user.role
            })
          }
        });

        if (response.status === 401) {
          const refreshed = await authService.refreshToken();
          if (!refreshed) {
            router.push('/login');
            return;
          }

          // Retry with new token
          const retryResponse = await fetch(`${process.env.NEXT_PUBLIC_PYTHON_API_URL}/api/jobs`, {
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${refreshed.access_token}`,
              'Accept': 'application/json',
              'X-User-Session': JSON.stringify({
                id: session.user.id,
                email: session.user.email,
                role: session.user.role
              })
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

  // Add effect to log auth state changes
  useEffect(() => {
    console.log('Auth state:', { isAuthenticated, isAdmin, isLoading });
  }, [isAuthenticated, isAdmin, isLoading]);

  // Force refresh data when component mounts
  useEffect(() => {
    if (isAuthenticated && isAdmin) {
      mutate();
    }
  }, [isAuthenticated, isAdmin, mutate]);

  // Add debug logging
  useEffect(() => {
    if (data?.applications) {
      console.log('Received applications:', data.applications);
    }
  }, [data]);

  if (isLoading || isDataLoading) {
    return (
      <AdminPageLayout title="Applications" showSearch={false}>
        <TableSkeleton rows={10} columns={6} />
      </AdminPageLayout>
    );
  }

  if (!isAuthenticated || !isAdmin) {
    return null; // Router will handle the redirect
  }

  if (error || fetchError) {
    return (
      <AdminPageLayout title="Applications" showSearch={false}>
        <div className="p-4 text-red-600">
          Error loading applications: {error?.message || fetchError}
        </div>
      </AdminPageLayout>
    );
  }

  const applications = data?.applications || [];
  const totalPages = data?.totalPages || 1;

  const filteredApplications = applications
    .filter(app => {
      const matchesSearch = [
        app.name,
        app.email,
        app.position,
        // Also search in answers
        ...(app.answers?.map(a => a.answer) || [])
      ].some(field => 
        field?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      const matchesPosition = !selectedPosition || app.position === selectedPosition;
      const matchesStatus = !selectedStatus || app.status === selectedStatus;
      
      return matchesSearch && matchesPosition && matchesStatus;
    })
    .sort((a, b) => {
      // Ensure we have valid dates and sort in descending order (newest first)
      const dateA = new Date(a.appliedDate || 0).getTime();
      const dateB = new Date(b.appliedDate || 0).getTime();
      return dateB - dateA;
    });

  function handleView(id: string) {
    const application = applications.find((app) => app.id === id);
    setViewApplication(application || null);
  }

  function handleEdit(id: string) {
    const application = applications.find((app) => app.id === id);
    setEditApplication(application || null);
  }

  function handleDelete(id: string) {
    setDeleteApplicationId(id);
  }

  async function handleSaveEdit(updatedApplication: Application) {
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

      mutate();
      setEditApplication(null);
    } catch (error) {
      console.error("Failed to update application:", error);
    }
  }

  async function handleConfirmDelete(id: string) {
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

      mutate();
      setDeleteApplicationId(null);
    } catch (error) {
      console.error("Failed to delete application:", error);
    }
  }

  const handleBulkStatusChange = async (ids: string[], newStatus: string) => {
    try {
      const session = authService.getSession();
      if (!session) {
        router.push('/login');
        return;
      }

      await fetch(`${process.env.NEXT_PUBLIC_PYTHON_API_URL}/api/admin/applications/bulk-status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.token}`,
          'Accept': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ ids, status: newStatus })
      });

      mutate(); // Refresh the data
    } catch (error) {
      console.error('Failed to update application statuses:', error);
    }
  };

  const handleBulkDelete = async (ids: string[]) => {
    try {
      const session = authService.getSession();
      if (!session) {
        router.push('/login');
        return;
      }

      await fetch(`${process.env.NEXT_PUBLIC_PYTHON_API_URL}/api/admin/applications/bulk`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.token}`,
          'Accept': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ ids })
      });

      mutate(); // Refresh the data
    } catch (error) {
      console.error('Failed to delete applications:', error);
    }
  };

  return (
    <>
      <AdminPageHeader title="Applications" />
      
      {/* Action Bar */}
      <div className="bg-white border-b px-6 py-4">
        <div className="flex gap-2">
          <input
            type="file"
            id="importFile"
            accept=".json"
            className="hidden"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (file) {
                const reader = new FileReader();
                reader.onload = async (event) => {
                  const data = JSON.parse(event.target?.result as string);
                  const session = authService.getSession();
                  if (!session) {
                    router.push('/login');
                    return;
                  }

                  await fetch(`${process.env.NEXT_PUBLIC_PYTHON_API_URL}/api/admin/applications/import`, {
                    method: 'POST',
                    headers: { 
                      'Content-Type': 'application/json',
                      'Authorization': `Bearer ${session.token}`,
                      'Accept': 'application/json'
                    },
                    credentials: 'include',
                    body: JSON.stringify(data)
                  });
                  // Refresh data
                  mutate();
                };
                reader.readAsText(file);
              }
            }}
          />
          <Button
            variant="outline"
            onClick={() => document.getElementById('importFile')?.click()}
          >
            <Upload className="mr-2 h-4 w-4" />
            Import
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem asChild>
                <a 
                  href={`${process.env.NEXT_PUBLIC_PYTHON_API_URL}/api/admin/applications/export?format=json`}
                  className="cursor-pointer"
                >
                  <FileText className="mr-2 h-4 w-4" />
                  JSON
                </a>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <a
                  href={`${process.env.NEXT_PUBLIC_PYTHON_API_URL}/api/admin/applications/export?format=csv`}
                  className="cursor-pointer"
                >
                  <Sheet className="mr-2 h-4 w-4" />
                  CSV
                </a>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <a
                  href={`${process.env.NEXT_PUBLIC_PYTHON_API_URL}/api/admin/applications/export?format=xlsx`}
                  className="cursor-pointer"
                >
                  <Sheet className="mr-2 h-4 w-4" />
                  Excel
                </a>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      
      {/* Sticky Search and Filter Section */}
      <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-sm border-b">
        <div className="p-4 max-w-[2000px] mx-auto">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Search by name, email or position..."
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <svg
                className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            
            <div className="flex flex-row gap-3 md:w-auto">
              <select
                className="w-full md:w-48 px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
                value={selectedPosition}
                onChange={(e) => setSelectedPosition(e.target.value)}
              >
                <option value="">All Positions</option>
                {Array.isArray(applications) && 
                  [...new Set(applications.map(app => app.position))].map(position => (
                    <option key={position} value={position}>{position}</option>
                  ))
                }
              </select>
              
              <select
                className="w-full md:w-48 px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
              >
                <option value="">All Statuses</option>
                <option value="Applied">Applied</option>
                <option value="In Review">In Review</option>
                <option value="Interview">Interview</option>
                <option value="Hired">Hired</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="p-6">
        <div className="overflow-x-auto">
          <ApplicationsTable
            applications={filteredApplications}
            jobTitles={jobTitles}
            onView={handleView}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onBulkStatusChange={handleBulkStatusChange}
            onBulkDelete={handleBulkDelete}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>

        {/* Modals */}
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
      </div>
    </>
  );
}
