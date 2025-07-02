"use client";

import { useState, useEffect } from "react";
import { ApplicationsTable } from "./ApplicationsTable";
import { EditApplicationModal } from "@/components/admin/EditApplicationModal";
import { ViewApplicationModal } from "@/components/admin/ViewApplicationModal";
import { DeleteApplicationModal } from "@/components/admin/DeleteApplicationModal";
import { Application } from "@/types/application";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Download, Upload, FileText, Sheet, Search, ArrowUpDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { AdminPageLayout } from "@/components/admin/AdminPageLayout";
import { TableSkeleton } from "@/components/ui/skeleton";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { authService } from "@/lib/auth-backend";
import { toast } from "sonner";
import { adminApi } from "@/lib/api-backend";
import { useAuthErrorHandler } from "@/hooks/useAuthErrorHandler";

// Add sort options type
type SortOption = {
  field: string;
  label: string;
  order: 'asc' | 'desc';
};

export default function ApplicationsPage() {
  const router = useRouter();
  const { isAuthenticated, isAdmin, authLoading } = useAuth();
  const { handleError: handleAuthError } = useAuthErrorHandler();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPosition, setSelectedPosition] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [jobTitles, setJobTitles] = useState<Record<string, string>>({});
  const [sortBy, setSortBy] = useState<string>("createdAt");
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const [viewApplication, setViewApplication] = useState<Application | null>(null);
  const [editApplication, setEditApplication] = useState<Application | null>(null);
  const [deleteApplicationId, setDeleteApplicationId] = useState<string | null>(null);

  // Sort options
  const sortOptions: SortOption[] = [
    { field: 'createdAt', label: 'Latest Applications', order: 'desc' },
    { field: 'createdAt', label: 'Oldest Applications', order: 'asc' },
    { field: 'status', label: 'Status (A-Z)', order: 'asc' },
    { field: 'status', label: 'Status (Z-A)', order: 'desc' },
    { field: 'updatedAt', label: 'Last Updated (Newest)', order: 'desc' },
    { field: 'updatedAt', label: 'Last Updated (Oldest)', order: 'asc' },
    { field: 'appliedDate', label: 'Applied Date (Newest)', order: 'desc' },
    { field: 'appliedDate', label: 'Applied Date (Oldest)', order: 'asc' }
  ];

  // Handle sort selection
  const handleSortChange = (option: SortOption) => {
    setSortBy(option.field);
    setSortOrder(option.order);
    setCurrentPage(1); // Reset to first page when sorting changes
  };

  // Check authentication
  useEffect(() => {
    if (!authLoading && (!isAuthenticated || !isAdmin)) {
      router.push('/login');
    }
  }, [authLoading, isAuthenticated, isAdmin, router]);

  // Fetch applications
  const fetchApplications = async () => {
    try {
      setIsLoading(true);
      setError(null);

      console.log('Fetching applications with params:', {
        skip: (currentPage - 1) * itemsPerPage,
        limit: itemsPerPage,
        status: selectedStatus || undefined,
        search: searchTerm || undefined,
        sort_by: sortBy,
        sort_order: sortOrder
      });

      const response = await adminApi.getApplications({
        skip: (currentPage - 1) * itemsPerPage,
        limit: itemsPerPage,
        status: selectedStatus || undefined,
        search: searchTerm || undefined,
        sort_by: sortBy,
        sort_order: sortOrder
      });

      console.log('Applications response:', response);

      if (!response || typeof response !== 'object') {
        console.error('Invalid response format:', response);
        setError('Invalid response format from server');
        return;
      }

      const applications = Array.isArray(response.applications) ? response.applications : [];
      const total = typeof response.total === 'number' ? response.total : 0;

      // Map the new structure to match existing application interface
      const mappedApplications = applications.map(app => ({
        ...app,
        id: app.id,
        name: app.userDetails?.name || app.answers?.find(a => 
          a.questionText?.toLowerCase().includes('first name'))?.answer + ' ' + 
          app.answers?.find(a => a.questionText?.toLowerCase().includes('last name'))?.answer || 'N/A',
        email: app.userDetails?.email || app.answers?.find(a => 
          a.questionText?.toLowerCase().includes('email'))?.answer || 'N/A',
        phoneNumber: app.answers?.find(a => 
          a.questionText?.toLowerCase().includes('phone'))?.answer || 'N/A',
        position: app.position || app.jobDetails?.title || 'N/A',
        status: app.status || 'New',
        appliedDate: new Date(app.appliedDate),
        cvUrl: app.cvUrl,
        jobId: app.jobId,
        jobDetails: app.jobDetails
      }));

      setApplications(mappedApplications);
      setTotalPages(Math.ceil(total / itemsPerPage) || 1);

      // No need to fetch job titles separately as they're included in jobDetails now
      const jobTitlesMap: Record<string, string> = {};
      applications.forEach(app => {
        if (app.jobDetails?.id && app.jobDetails?.title) {
          jobTitlesMap[app.jobDetails.id] = app.jobDetails.title;
        }
      });
      setJobTitles(jobTitlesMap);

    } catch (error) {
      console.error('Failed to fetch applications:', error);
      
      // Handle authentication errors through the global handler
      const isAuthError = handleAuthError(error);
      
      if (!isAuthError) {
        setError('Failed to fetch applications');
        toast.error('Failed to fetch applications');
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && isAdmin) {
      fetchApplications();
    }
  }, [isAuthenticated, isAdmin, currentPage, selectedStatus, searchTerm, sortBy, sortOrder]);

  // Handlers
  const handleView = (id: string) => {
    const application = applications.find(app => app.id === id);
    setViewApplication(application || null);
  };

  const handleEdit = (id: string) => {
    const application = applications.find(app => app.id === id);
    setEditApplication(application || null);
  };

  const handleDelete = (id: string) => {
    setDeleteApplicationId(id);
  };

  const handleSaveEdit = async (updatedApplication: Application) => {
    try {
      await adminApi.updateApplication(updatedApplication.id, updatedApplication);
      await fetchApplications();
      setEditApplication(null);
      toast.success('Application updated successfully');
    } catch (error) {
      console.error('Failed to update application:', error);
      const isAuthError = handleAuthError(error);
      if (!isAuthError) {
        toast.error('Failed to update application');
      }
    }
  };

  const handleConfirmDelete = async (id: string) => {
    try {
      await adminApi.deleteApplication(id);
      await fetchApplications();
      setDeleteApplicationId(null);
      toast.success('Application deleted successfully');
    } catch (error) {
      console.error('Failed to delete application:', error);
      const isAuthError = handleAuthError(error);
      if (!isAuthError) {
        toast.error('Failed to delete application');
      }
    }
  };

  const handleBulkStatusChange = async (ids: string[], newStatus: string) => {
    try {
      await adminApi.updateBulkApplicationStatus(ids, newStatus);
      await fetchApplications();
      toast.success('Applications updated successfully');
    } catch (error) {
      console.error('Failed to update applications:', error);
      const isAuthError = handleAuthError(error);
      if (!isAuthError) {
        toast.error('Failed to update applications');
      }
    }
  };

  const handleBulkDelete = async (ids: string[]) => {
    try {
      await adminApi.deleteBulkApplications(ids);
      await fetchApplications();
      toast.success('Applications deleted successfully');
    } catch (error) {
      console.error('Failed to delete applications:', error);
      const isAuthError = handleAuthError(error);
      if (!isAuthError) {
        toast.error('Failed to delete applications');
      }
    }
  };

  if (authLoading) {
    return (
      <AdminPageLayout title="Applications">
        <TableSkeleton />
      </AdminPageLayout>
    );
  }

  if (error) {
    return (
      <AdminPageLayout title="Applications">
        <div className="p-4 text-red-500">
          Error: {error}
          <Button onClick={fetchApplications} className="ml-2">
            Retry
          </Button>
        </div>
      </AdminPageLayout>
    );
  }

  return (
    <AdminPageLayout 
      title="Applications" 
      searchPlaceholder="Search applications..."
      searchValue={searchTerm}
      onSearch={setSearchTerm}
      headerActions={
        <div className="flex items-center space-x-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary" className="flex items-center gap-2">
                <ArrowUpDown className="h-4 w-4" />
                Sort
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Sort Applications</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {sortOptions.map((option, index) => (
                <DropdownMenuItem
                  key={index}
                  onClick={() => handleSortChange(option)}
                  className="cursor-pointer"
                >
                  {option.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary" className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>Export Options</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <FileText className="h-4 w-4 mr-2" />
                Export as CSV
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Sheet className="h-4 w-4 mr-2" />
                Export as Excel
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      }
    >
      <div className="flex flex-col">
        <div className="overflow-x-auto">
          <ApplicationsTable
            applications={applications}
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
    </AdminPageLayout>
  );
}
