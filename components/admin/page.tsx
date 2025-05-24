"use client";

import { useState } from "react";
import { Search, Eye, Edit, Trash2 } from "lucide-react";
import DataTable from "@/components/admin/DataTable";
import useSWR from "swr";
import { Button } from "@/components/ui/button";
import { ViewApplicationModal } from "@/components/admin/ViewApplicationModal";
import { EditApplicationModal } from "@/components/admin/EditApplicationModal";
import { DeleteApplicationModal } from "@/components/admin/DeleteApplicationModal";
import Loader from "../Loader";
import { Application } from "@/types/application";
import { useRouter } from "next/router";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function ApplicationsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const {
    data: applications,
    error,
    mutate,
  } = useSWR<Application[]>("/api/admin/applications", fetcher);
  const router = useRouter();

  const [viewApplication, setViewApplication] = useState<Application | null>(null);
  const [editingApplication, setEditingApplication] = useState<Application | null>(null);
  const [deleteApplicationId, setDeleteApplicationId] = useState<string | null>(null);

  function handleView(id: string) {
    const application = applications?.find((app) => app.id === id);
    setViewApplication(application || null);
  }

  function handleEdit(id: string) {
    const application = applications?.find((app) => app.id === id);
    setEditingApplication(application || null);
  }

  function handleDelete(id: string) {
    setDeleteApplicationId(id);
  }

  async function handleSaveEdit(updatedApplication: Application) {
    try {
      const response = await fetch(`/api/admin/applications/${updatedApplication.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedApplication),
      });

      if (!response.ok) {
        throw new Error('Failed to update application');
      }

      mutate(); // Refresh the data
      setEditingApplication(null); // Close the modal

      // Redirect based on the new status
      if (updatedApplication.status !== "Application") {
        router.push(`/admin/${updatedApplication.status.toLowerCase().replace(' ', '-')}`);
      }
    } catch (error) {
      console.error("Failed to update application:", error);
    }
  }

  async function handleConfirmDelete(id: string) {
    try {
      await fetch(`/api/admin/applications/${id}`, { method: "DELETE" });
      mutate(); // Refresh the data
      setDeleteApplicationId(null); // Close the modal
    } catch (error) {
      console.error("Failed to delete application:", error);
    }
  }

  const columns = [
    { header: "Name", accessor: "name" },
    { header: "Email", accessor: "email" },
    { header: "Position", accessor: "position" },
    { header: "Application Date", accessor: "appliedDate" },
    { header: "Status", accessor: "status" },
    {
      header: "Actions",
      accessor: "actions",
      Cell: ({ row }: { row: Application }) => (
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleView(row.id)}
            className="p-1 text-blue-600 hover:text-blue-800"
          >
            <Eye className="h-4 w-4 mr-2" />
            View
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleEdit(row.id)}
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleDelete(row.id)}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      ),
    },
  ];

  if (error) return <div>Failed to load applications</div>;
  if (!applications) return <Loader />;

  const filteredApplications = applications.filter(
    (app) =>
      app.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.position.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Applications</h1>
      <div className="mb-4 relative">
        <input
          type="text"
          placeholder="Search applications..."
          className="w-full p-2 border rounded"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <Search className="absolute right-3 top-2.5 text-gray-400" />
      </div>
      <DataTable
        columns={columns}
        data={filteredApplications}
        onView={handleView}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
      <ViewApplicationModal
        application={viewApplication}
        isOpen={!!viewApplication}
        onClose={() => setViewApplication(null)}
      />
      <EditApplicationModal
        application={editingApplication}
        isOpen={!!editingApplication}
        onClose={() => setEditingApplication(null)}
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
