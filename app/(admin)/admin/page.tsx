"use client";

import { useState, useEffect } from "react";
import { Search } from "lucide-react";
import DataTable from "@/components/admin/DataTable";
import useSWR from "swr";
import { EditApplicationModal } from "@/components/admin/EditApplicationModal";
import { ViewApplicationModal } from "@/components/admin/ViewApplicationModal";
import { DeleteApplicationModal } from "@/components/admin/DeleteApplicationModal";
import { Application } from "@/types/application";

const columns = [
  { header: "Name", accessor: "name" },
  { header: "Email", accessor: "email" },
  { header: "Position", accessor: "position" },
  { header: "Applied Date", accessor: "appliedDate" },
  { header: "Status", accessor: "status" },
];

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function ApplicationsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const { data, error, isLoading } = useSWR<
    Application[] | { applications: Application[] }
  >("/api/admin/applications", fetcher);
  const [applications, setApplications] = useState<Application[]>([]);
  const [viewApplication, setViewApplication] = useState<Application | null>(
    null
  );
  const [editApplication, setEditApplication] = useState<Application | null>(
    null
  );
  const [deleteApplicationId, setDeleteApplicationId] = useState<string | null>(
    null
  );

  useEffect(() => {
    if (data) {
      if (Array.isArray(data)) {
        setApplications(data);
      } else if (data.applications && Array.isArray(data.applications)) {
        setApplications(data.applications);
      } else {
        console.error("Unexpected data format:", data);
        setApplications([]);
      }
    }
  }, [data]);

  if (error) return <div>Failed to load applications</div>;
  if (isLoading) return <div>Loading...</div>;

  const filteredApplications = applications?.filter((app) =>
    Object.values(app).some((value) =>
      String(value).toLowerCase().includes(searchTerm.toLowerCase())
    )
  ) ?? [];

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
      await fetch(`/api/admin/applications/${updatedApplication.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedApplication),
      });
      const updatedApplications = applications.map((app) =>
        app.id === updatedApplication.id ? updatedApplication : app
      );
      setApplications(updatedApplications);
      setEditApplication(null); // Close the modal
    } catch (error) {
      console.error("Failed to update application:", error);
    }
  }

  async function handleConfirmDelete(id: string) {
    try {
      await fetch(`/api/admin/applications/${id}`, { method: "DELETE" });
      const updatedApplications = applications.filter((app) => app.id !== id);
      setApplications(updatedApplications);
      setDeleteApplicationId(null); // Close the modal
    } catch (error) {
      console.error("Failed to delete application:", error);
    }
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl md:text-3xl font-semibold text-gray-800">
        Applications
      </h2>
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
      <div className="overflow-x-auto">
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
