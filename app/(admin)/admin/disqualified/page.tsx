"use client";

import { useState, useEffect } from "react";
import { AdminPageLayout } from "@/components/admin/AdminPageLayout";
import { DisqualifiedTable } from "@/components/admin/DisqualifiedTable";
import useSWR from "swr";
import { EditApplicationModal } from "@/components/admin/EditApplicationModal";
import { ViewApplicationModal } from "@/components/admin/ViewApplicationModal";
import { DeleteApplicationModal } from "@/components/admin/DeleteApplicationModal";
import { Application } from "@/types/application";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function DisqualifiedPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const { data, error, isLoading, mutate } = useSWR<Application[]>(
    "/api/admin/disqualified",
    fetcher
  );
  const [viewApplication, setViewApplication] = useState<Application | null>(null);
  const [editApplication, setEditApplication] = useState<Application | null>(null);
  const [deleteApplicationId, setDeleteApplicationId] = useState<string | null>(null);
  const [jobTitles, setJobTitles] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchJobTitles = async () => {
      try {
        const response = await fetch('/api/admin/jobs');
        const jobs = await response.json();
        const titles = jobs.reduce((acc: Record<string, string>, job: any) => {
          acc[job.id] = job.title;
          return acc;
        }, {});
        setJobTitles(titles);
      } catch (error) {
        console.error('Failed to fetch job titles:', error);
      }
    };
    fetchJobTitles();
  }, []);

  const filteredData = (Array.isArray(data) ? data : []).filter((app: Application) =>
    Object.values(app).some((value) =>
      String(value).toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

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
        <DisqualifiedTable
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
        onSave={() => {
          mutate();
          setEditApplication(null);
        }}
      />
      <DeleteApplicationModal
        applicationId={deleteApplicationId}
        isOpen={!!deleteApplicationId}
        onClose={() => setDeleteApplicationId(null)}
        onConfirm={async (id) => {
          try {
            await fetch(`/api/admin/applications/${id}`, { method: "DELETE" });
            mutate();
            setDeleteApplicationId(null);
          } catch (error) {
            console.error("Failed to delete application:", error);
          }
        }}
      />
    </AdminPageLayout>
  );
}
