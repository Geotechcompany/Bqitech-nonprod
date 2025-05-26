"use client";

import { Application } from "@/types/application";
import { Button } from "@/components/ui/button";
import { Eye, Pencil, Trash2 } from "lucide-react";
import Link from "next/link";

interface Column<T> {
  header: string;
  accessor: (row: T) => string | number | Date;
  cell?: (value: ReturnType<Column<T>['accessor']>) => React.ReactNode;
}

interface ApplicationsTableProps {
  applications: Application[];
  jobTitles: Record<string, string>;
  onView: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  structureType: 'new' | 'old';
}

const isUUID = (str: string) => 
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(str);

export function ApplicationsTable({ applications, jobTitles, onView, onEdit, onDelete, structureType }: ApplicationsTableProps) {
  const columns: Column<Application>[] = structureType === 'new' ? [
    { 
      header: "Applicant", 
      accessor: (row: Application) => {
        if (row.name) return row.name;
        
        // Extract from answers
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
        row.email ||
        row.answers?.find(a => 
          a.questionText.toLowerCase().includes('email')
        )?.answer ||
        'N/A'
    },
    { 
      header: "Position", 
      accessor: (row: Application) => {
        // First check if we have a direct position value
        if (row.position && !isUUID(row.position)) {
          return row.position;
        }
        
        // If position is a UUID, look up job title
        if (row.position && isUUID(row.position)) {
          return jobTitles[row.position] || row.position;
        }
        
        // Fallback to answers
        return row.answers?.find(a => 
          a.questionText.toLowerCase().includes('position')
        )?.answer || 'N/A';
      },
      cell: (value: string) => value
    },
    { 
      header: "Status", 
      accessor: (row: Application) => row.status 
    },
    { 
      header: "Applied Date", 
      accessor: (row: Application) => new Date(row.appliedDate),
      cell: (date: Date) => date.toLocaleDateString()
    },
    { 
      header: "CV", 
      accessor: (row: Application) => row.cvUrl || '',
      cell: (value: string) => value ? (
        <Link href={value} target="_blank" className="text-blue-600 hover:underline">
          View CV
        </Link>
      ) : 'N/A'
    },
    {
      header: "Answers",
      accessor: (row: Application) => row.answers?.map(a => 
        `${a.questionText}: ${a.answer}`
      ).join('\n') || 'N/A',
      cell: (value: string) => (
        <pre className="whitespace-pre-wrap text-sm">{value}</pre>
      )
    }
  ] : [
    { header: "Applicant", accessor: (row) => row.name },
    { header: "Email", accessor: (row) => row.email },
    { header: "Position", accessor: (row) => row.position },
    { header: "Status", accessor: (row) => row.status },
    { header: "Experience", accessor: (row) => row.experience },
    { header: "Location", accessor: (row) => row.location },
    { header: "Salary", accessor: (row) => row.salary },
    { header: "COTS Exp", accessor: (row) => row.cotsExperience },
    { header: "SQL/JS Exp", accessor: (row) => row.sqlJavaScriptExperience },
    { header: "Report Dev", accessor: (row) => row.reportDevelopmentExperience }
  ];

  return (
    <div className="overflow-x-auto rounded-lg border">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {columns.map((column, index) => (
              <th
                key={index}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                {column.header}
              </th>
            ))}
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {applications.map((application) => (
            <tr key={application.id} className="hover:bg-gray-50">
              {columns.map((column, colIndex) => (
                <td
                  key={colIndex}
                  className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                >
                  {(() => {
                    const value = column.accessor(application);
                    return column.cell 
                      ? column.cell(value)
                      : value instanceof Date 
                        ? value.toLocaleDateString()
                        : value;
                  })()}
                </td>
              ))}
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onView(application.id)}
                >
                  <Eye className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onEdit(application.id)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onDelete(application.id)}
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
} 