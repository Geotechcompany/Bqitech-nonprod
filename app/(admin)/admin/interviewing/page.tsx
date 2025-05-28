"use client";

import { useState, useEffect } from "react";
import { AdminPageLayout } from "@/components/admin/AdminPageLayout";
import { InterviewingTable } from "@/components/admin/InterviewingTable";
import useSWR from "swr";
import { EditApplicationModal } from "@/components/admin/EditApplicationModal";
import { ViewApplicationModal } from "@/components/admin/ViewApplicationModal";
import { DeleteApplicationModal } from "@/components/admin/DeleteApplicationModal";
import { Application } from "@/types/application";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function InterviewingPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const { data, error, isLoading, mutate } = useSWR<Application[]>(
    "/api/admin/interviewing",
    fetcher
  );
  const [viewApplication, setViewApplication] = useState<Application | null>(null);
  const [editApplication, setEditApplication] = useState<Application | null>(null);
  const [deleteApplicationId, setDeleteApplicationId] = useState<string | null>(null);
  const [jobTitles, setJobTitles] = useState<Record<string, string>>({});

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
      await fetch(`/api/admin/applications/${updatedApplication.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
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
      await fetch(`/api/admin/applications/${id}`, { method: "DELETE" });
      setDeleteApplicationId(null);
    } catch (error) {
      console.error("Failed to delete application:", error);
    }
  };

  const filteredData = (Array.isArray(data) ? data : []).filter((app: Application) =>
    Object.values(app).some((value) =>
      String(value).toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  if (error) return <div>Failed to load interviewing candidates</div>;
  if (isLoading) return <div>Loading...</div>;

  return (
    <AdminPageLayout
      title="Interviewing"
      searchPlaceholder="Search interviewing candidates..."
      searchValue={searchTerm}
      onSearch={setSearchTerm}
    >
      <div className="overflow-x-auto">
        <InterviewingTable
          applications={filteredData}
          jobTitles={jobTitles}
          onView={(id) => {
            const application = data?.find((app) => app.id === id);
            setViewApplication(application || null);
          }}
          onEdit={(id) => {
            const application = data?.find((app) => app.id === id);
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
