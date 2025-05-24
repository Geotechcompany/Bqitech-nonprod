"use client";

import { useState } from "react";
import { AdminPageLayout } from "@/components/admin/AdminPageLayout";
import DataTable from "@/components/admin/DataTable";
import useSWR from "swr";
import { EditApplicationModal } from "@/components/admin/EditApplicationModal";
import { ViewApplicationModal } from "@/components/admin/ViewApplicationModal";
import { DeleteApplicationModal } from "@/components/admin/DeleteApplicationModal";
import { Application } from "@/types/application";

interface DisqualifiedApplication extends Application {
  disqualificationDate: string;
  disqualificationReason: string;
}

const columns = [
  { header: "Name", accessor: "name" },
  { header: "Email", accessor: "email" },
  { header: "Position", accessor: "position" },
  { header: "Disqualified Date", accessor: "disqualificationDate" },
  { header: "Reason", accessor: "disqualificationReason" },
  { header: "Status", accessor: "status" },
];

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function DisqualifiedPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const { data, error, isLoading } = useSWR<{ applications: DisqualifiedApplication[] }>(
    "/api/admin/applications?status=Disqualified",
    fetcher
  );

  const [viewApplication, setViewApplication] = useState<DisqualifiedApplication | null>(null);
  const [editApplication, setEditApplication] = useState<Application | null>(null);
  const [deleteApplicationId, setDeleteApplicationId] = useState<string | null>(null);

  const handleView = (id: string) => {
    const application = data?.applications.find((app: DisqualifiedApplication) => app.id === id);
    setViewApplication(application || null);
  };

  const handleEdit = (id: string) => {
    const application = data?.applications.find((app: DisqualifiedApplication) => app.id === id);
    setEditApplication(application || null);
  };

  const handleDelete = (id: string) => {
    setDeleteApplicationId(id);
  };

  const handleSaveEdit = async (updatedApplication: Application) => {
    try {
      await fetch(`/api/admin/applications/${updatedApplication.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedApplication),
      })
      setEditApplication(null)
      // Optionally, you can refetch the data here to update the UI
    } catch (error) {
      console.error("Failed to update application:", error)
    }
  };

  const handleConfirmDelete = async (id: string) => {
    try {
      await fetch(`/api/admin/applications/${id}`, { method: "DELETE" });
      setDeleteApplicationId(null);
    } catch (error) {
      console.error("Failed to delete application:", error);
    }
  };

  const filteredData = data?.applications.filter((app: DisqualifiedApplication) =>
    Object.values(app).some((value) =>
      String(value).toLowerCase().includes(searchTerm.toLowerCase())
    )
  ) ?? [];

  if (error) return <div>Failed to load disqualified candidates</div>;
  if (isLoading) return <div>Loading...</div>;

  return (
    <AdminPageLayout
      title="Disqualified"
      searchPlaceholder="Search disqualified candidates..."
      searchValue={searchTerm}
      onSearch={setSearchTerm}
    >
      <div className="overflow-x-auto">
        <DataTable
          columns={columns}
          data={filteredData}
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
