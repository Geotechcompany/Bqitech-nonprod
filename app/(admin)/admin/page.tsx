"use client";

import { useState, useEffect } from "react";
import { Search } from "lucide-react";
import DataTable from "@/components/admin/DataTable";
import { EditApplicationModal } from "@/components/admin/EditApplicationModal";
import { ViewApplicationModal } from "@/components/admin/ViewApplicationModal";
import { DeleteApplicationModal } from "@/components/admin/DeleteApplicationModal";
import { Application } from "@/types/application";
import { adminApi } from "@/lib/api-backend";
import { toast } from "react-hot-toast";

const columns = [
  { header: "Name", accessor: "name" },
  { header: "Email", accessor: "email" },
  { header: "Position", accessor: "position" },
  { header: "Applied Date", accessor: "appliedDate" },
  { header: "Status", accessor: "status" },
];

export default function ApplicationsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [applications, setApplications] = useState<Application[]>([]);
  const [filteredApplications, setFilteredApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewApplication, setViewApplication] = useState<Application | null>(null);
  const [editApplication, setEditApplication] = useState<Application | null>(null);
  const [deleteApplicationId, setDeleteApplicationId] = useState<string | null>(null);

  // Fetch applications from backend
  useEffect(() => {
    loadApplications();
  }, []);

  // Filter applications based on search term
  useEffect(() => {
    if (!searchTerm) {
      setFilteredApplications(applications);
    } else {
      const filtered = applications.filter((app) =>
        Object.values(app).some((value) =>
          String(value).toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
      setFilteredApplications(filtered);
    }
  }, [searchTerm, applications]);

  const loadApplications = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await adminApi.getApplications({
        limit: 100, // Get more records initially
      });
      
      const apps = response.applications || [];
      setApplications(apps);
      setFilteredApplications(apps);
    } catch (err) {
      console.error('Failed to load applications:', err);
      setError('Failed to load applications');
      toast.error('Failed to load applications');
    } finally {
      setIsLoading(false);
    }
  };

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
      await adminApi.updateApplication(updatedApplication.id, updatedApplication);
      
      const updatedApplications = applications.map((app) =>
        app.id === updatedApplication.id ? updatedApplication : app
      );
      setApplications(updatedApplications);
      setEditApplication(null);
      toast.success('Application updated successfully');
    } catch (error) {
      console.error("Failed to update application:", error);
      toast.error('Failed to update application');
    }
  }

  async function handleConfirmDelete(id: string) {
    try {
      await adminApi.deleteApplication(id);
      
      const updatedApplications = applications.filter((app) => app.id !== id);
      setApplications(updatedApplications);
      setDeleteApplicationId(null);
      toast.success('Application deleted successfully');
    } catch (error) {
      console.error("Failed to delete application:", error);
      toast.error('Failed to delete application');
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full w-full">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full w-full">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4 text-red-600">Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={loadApplications}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full flex flex-col bg-gray-100">
      <div className="flex-shrink-0 p-6 pb-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl md:text-3xl font-semibold text-gray-800">
            Applications
          </h2>
          <button
            onClick={loadApplications}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
          >
            Refresh
          </button>
        </div>
        <div className="relative">
          <input
            type="text"
            placeholder="Search applications..."
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search className="absolute left-3 top-2.5 text-gray-400" />
        </div>
      </div>
      
      <div className="flex-1 overflow-auto px-6 pb-6">
        <div className="mb-4 text-sm text-gray-600">
          Showing {filteredApplications.length} of {applications.length} applications
        </div>
        <DataTable
          columns={columns}
          data={filteredApplications}
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
    </div>
  );
}
