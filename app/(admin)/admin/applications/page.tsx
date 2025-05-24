"use client";

import { useState, useEffect } from "react";

import { ApplicationsTable } from "./ApplicationsTable";
import useSWR from "swr";
import { EditApplicationModal } from "@/components/admin/EditApplicationModal";
import { ViewApplicationModal } from "@/components/admin/ViewApplicationModal";
import { DeleteApplicationModal } from "@/components/admin/DeleteApplicationModal";
import { Application } from "@/types/application";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Button } from "@/components/ui/button";
import { Download, Upload, FileText, Sheet } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function ApplicationsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPosition, setSelectedPosition] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedStructure, setSelectedStructure] = useState<'all' | 'old' | 'new'>('all');
  const { data, error, isLoading, mutate } = useSWR<{ applications: Application[] }>(
    "/api/admin/applications", 
    fetcher
  );
  const [applications, setApplications] = useState<Application[]>([]);
  const [viewApplication, setViewApplication] = useState<Application | null>(null);
  const [editApplication, setEditApplication] = useState<Application | null>(null);
  const [deleteApplicationId, setDeleteApplicationId] = useState<string | null>(null);
  const [dynamicColumns, setDynamicColumns] = useState<Column[]>([]);
  const [jobTitles, setJobTitles] = useState<Record<string, string>>({});

  useEffect(() => {
    if (data?.applications) {
      setApplications(data.applications || []);
      const newColumns = getDynamicColumns(data.applications || []);
      setDynamicColumns(newColumns);
    }
  }, [data]);

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

  const allColumns = [
    ...staticColumns,
    ...getDynamicColumns(applications)
  ];

  if (error) return <div>Failed to load applications</div>;
  if (isLoading) return <div>Loading...</div>;

  const filteredApplications = applications?.filter((app) => {
    const isOldStructure = app.cotsExperience !== undefined;
    const isNewStructure = app.answers !== undefined;
    
    if (selectedStructure === 'old') return isOldStructure;
    if (selectedStructure === 'new') return isNewStructure;
    return true;
  }) ?? [];

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
      setEditApplication(null);
    } catch (error) {
      console.error("Failed to update application:", error);
    }
  }

  async function handleConfirmDelete(id: string) {
    try {
      await fetch(`/api/admin/applications/${id}`, { method: "DELETE" });
      const updatedApplications = applications.filter((app) => app.id !== id);
      setApplications(updatedApplications);
      setDeleteApplicationId(null);
    } catch (error) {
      console.error("Failed to delete application:", error);
    }
  }

  return (
    <>
      <AdminPageHeader title="Applications">
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
                  await fetch('/api/admin/applications/import', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
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
                  href="/api/admin/applications/export?format=json"
                  className="cursor-pointer"
                >
                  <FileText className="mr-2 h-4 w-4" />
                  JSON
                </a>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <a
                  href="/api/admin/applications/export?format=csv"
                  className="cursor-pointer"
                >
                  <Sheet className="mr-2 h-4 w-4" />
                  CSV
                </a>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <a
                  href="/api/admin/applications/export?format=xlsx"
                  className="cursor-pointer"
                >
                  <Sheet className="mr-2 h-4 w-4" />
                  Excel
                </a>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </AdminPageHeader>
      
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
                {[...new Set(applications.map((app) => app.position))].map((position) => (
                  <option key={position} value={position}>
                    {position}
                  </option>
                ))}
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

              <select
                value={selectedStructure}
                onChange={(e) => setSelectedStructure(e.target.value as 'all' | 'old' | 'new')}
                className="rounded-md border p-2"
              >
                <option value="all">All Structures</option>
                <option value="old">Old Structure</option>
                <option value="new">New Structure</option>
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
