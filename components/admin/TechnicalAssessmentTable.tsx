"use client";

import { Application } from "@/types/application";
import { Button } from "@/components/ui/button";
import { Eye, Pencil, Trash2, ClipboardCheck } from "lucide-react";
import Link from "next/link";

interface Column<T> {
  header: string;
  accessor: (row: T) => string | number | Date;
  cell?: (value: ReturnType<Column<T>['accessor']>) => React.ReactNode;
}

interface TechnicalAssessmentTableProps {
  applications: Application[];
  jobTitles: Record<string, string>;
  onView: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

const isUUID = (str: string) => 
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(str);

export function TechnicalAssessmentTable({ applications, jobTitles, onView, onEdit, onDelete }: TechnicalAssessmentTableProps) {
  const columns: Column<Application>[] = [
    { 
      header: "Applicant", 
      accessor: (row: Application) => {
        if (row.name) return row.name;
        const firstName = row.answers?.find(a => 
          a.questionText.toLowerCase().includes('first name')
        )?.answer || '';
        const lastName = row.answers?.find(a => 
          a.questionText.toLowerCase().includes('last name')
        )?.answer || '';
        return `${firstName} ${lastName}`.trim() || 'N/A';
      }
    },
    { 
      header: "Email", 
      accessor: (row: Application) => 
        row.email || row.answers?.find(a => 
          a.questionText.toLowerCase().includes('email')
        )?.answer || 'N/A'
    },
    { 
      header: "Position", 
      accessor: (row: Application) => {
        if (row.position && !isUUID(row.position)) return row.position;
        if (row.position && isUUID(row.position)) return jobTitles[row.position] || row.position;
        return row.answers?.find(a => 
          a.questionText.toLowerCase().includes('position')
        )?.answer || 'N/A';
      }
    },
    { 
      header: "Assessment Date", 
      accessor: (row: Application) => new Date(row.assessmentDate),
      cell: (date: Date) => date.toLocaleDateString()
    },
    { 
      header: "Result", 
      accessor: (row: Application) => row.assessmentResult || 'N/A'
    },
    { 
      header: "CV", 
      accessor: (row: Application) => row.cvUrl || '',
      cell: (value: string) => value ? (
        <Link href={value} target="_blank" className="text-blue-600 hover:underline">
          View CV
        </Link>
      ) : 'N/A'
    }
  ];

  return (
    <div className="overflow-x-auto rounded-lg border">
      {applications.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 text-center">
          <div className="mb-4 rounded-full bg-blue-50 p-4">
            <ClipboardCheck className="h-12 w-12 text-blue-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900">No Candidates in Technical Assessment</h3>
          <p className="mt-2 max-w-xl text-gray-500">
            Candidates who are undergoing technical assessments will appear here.
            Use this stage to evaluate candidates' technical skills before moving them to interviews.
          </p>
        </div>
      ) : (
        <table className="min-w-full divide-y divide-gray-200">
          {/* Table structure similar to other components */}
        </table>
      )}
    </div>
  );
} 