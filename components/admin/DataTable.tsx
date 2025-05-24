import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Edit, Trash2, Eye, CheckSquare, ChevronDown, Settings, ClipboardList, Code, Users, UserCheck, XCircle } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Column {
  header: string;
  accessor: string | ((row: any) => string);
  cell?: ({ row }: { row: any }) => React.ReactNode;
}

interface DataTableProps {
  columns: Column[];
  data: any[];
  actionButtons?: (row: any) => React.ReactNode;
  onView?: (id: string) => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onApply?: (jobId: string) => void;
  onStatusChange?: (ids: string[], status: string) => void;
  isLoading?: boolean;
}

export default function DataTable({ 
  columns, 
  data, 
  onView, 
  onEdit, 
  onDelete, 
  onApply, 
  onStatusChange,
  actionButtons
}: DataTableProps) {
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());

  const toggleSelectAll = () => {
    if (selectedRows.size === data.length) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(data.map((_, index) => index)));
    }
  };

  const toggleSelectRow = (index: number) => {
    const newSelectedRows = new Set(selectedRows);
    if (newSelectedRows.has(index)) {
      newSelectedRows.delete(index);
    } else {
      newSelectedRows.add(index);
    }
    setSelectedRows(newSelectedRows);
  };

  const handleBulkDelete = () => {
    selectedRows.forEach((index) => {
      const row = data[index];
      if (onDelete) onDelete(row.id);
    });
    setSelectedRows(new Set());
  };

  const handleBulkStatusChange = (status: string) => {
    const selectedIds = Array.from(selectedRows).map(index => data[index].id);
    if (onStatusChange) {
      onStatusChange(selectedIds, status);
      setSelectedRows(new Set());
    }
  };

  const statusOptions = [
    { 
      label: "Applications", 
      value: "Applications", 
      color: "bg-blue-500",
      icon: ClipboardList 
    },
    { 
      label: "Shortlisted", 
      value: "Shortlisted", 
      color: "bg-yellow-500",
      icon: UserCheck 
    },
    { 
      label: "Technical Assessment", 
      value: "Technical Assessment", 
      color: "bg-indigo-500",
      icon: Code 
    },
    { 
      label: "Interviewing", 
      value: "Interviewing", 
      color: "bg-purple-500",
      icon: Users 
    },
    { 
      label: "Hired", 
      value: "Hired", 
      color: "bg-green-500",
      icon: UserCheck 
    },
    { 
      label: "Disqualified", 
      value: "Disqualified", 
      color: "bg-red-500",
      icon: XCircle 
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative overflow-x-auto"
    >
      <table className="min-w-full bg-white">
        <thead className="bg-gradient-to-r from-blue-300 to-purple-300 text-gray-800 uppercase text-sm leading-normal">
          <tr>
            <th className="py-3 px-6 text-center relative">
              <input
                type="checkbox"
                checked={selectedRows.size === data.length}
                onChange={toggleSelectAll}
                className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
              />
            </th>
            {columns.map((column, index) => (
              <th key={index} className={`py-3 px-6 text-left ${index === 0 ? 'sticky left-0 bg-blue-300 z-10' : ''}`}>{column.header}</th>
            ))}
            <th className="py-3 px-6 text-center">Actions</th>
          </tr>
        </thead>
        <tbody className="text-gray-600 text-sm font-light">
          {data.map((row, rowIndex) => (
            <motion.tr
              key={row.id}
              className="border-b border-gray-200 hover:bg-gray-50"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: rowIndex * 0.05 }}
            >
              <td className="py-3 px-6 text-center">
                <input
                  type="checkbox"
                  checked={selectedRows.has(rowIndex)}
                  onChange={() => toggleSelectRow(rowIndex)}
                  className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                />
              </td>
              {columns.map((column, colIndex) => (
                <td key={colIndex} className={`py-3 px-6 text-left whitespace-nowrap ${colIndex === 0 ? 'sticky left-0 bg-white z-10' : ''}`}>
                  {column.cell ? (
                    column.cell({ row })
                  ) : (
                    typeof column.accessor === 'function' 
                      ? column.accessor(row)
                      : row[column.accessor]
                  )}
                </td>
              ))}
              <td className="py-3 px-6 text-center">
                {actionButtons ? (
                  actionButtons(row)
                ) : (
                  <div className="flex items-center justify-center">
                    {onView && (
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => onView(row.id)}
                        className="w-4 mr-2 transform hover:text-purple-500 hover:scale-110"
                      >
                        <Eye size={16} />
                      </motion.button>
                    )}
                    {onEdit && (
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => onEdit(row.id)}
                        className="w-4 mr-2 transform hover:text-blue-500 hover:scale-110"
                      >
                        <Edit size={16} />
                      </motion.button>
                    )}
                    {onDelete && (
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => onDelete(row.id)}
                        className="w-4 mr-2 transform hover:text-red-500 hover:scale-110"
                      >
                        <Trash2 size={16} />
                      </motion.button>
                    )}
                    {onApply && (
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => onApply(row.id)}
                        className="w-4 mr-2 transform hover:text-green-500 hover:scale-110"
                      >
                        Apply
                      </motion.button>
                    )}
                  </div>
                )}
              </td>
            </motion.tr>
          ))}
        </tbody>
        {selectedRows.size > 0 && (
          <tfoot>
            <tr>
              <td className="py-2 px-6">
                <AnimatePresence>
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="flex items-center gap-2"
                  >
                    <button
                      onClick={handleBulkDelete}
                      className="flex items-center gap-1.5 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-2 py-1.5 rounded-md shadow-sm hover:shadow-md transition-all duration-200 transform hover:scale-105"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span className="text-sm font-medium">{selectedRows.size}</span>
                    </button>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="flex items-center gap-1.5 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-2 py-1.5 rounded-md shadow-sm hover:shadow-md transition-all duration-200 transform hover:scale-105">
                          <Settings className="w-4 h-4" />
                          <ChevronDown className="w-3 h-3" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start" className="p-2">
                        {statusOptions.map((status) => (
                          <DropdownMenuItem
                            key={status.value}
                            onClick={() => handleBulkStatusChange(status.value)}
                            className={`${status.color} text-white hover:brightness-110 rounded-md my-1 transition-all duration-200 flex items-center gap-2`}
                          >
                            <status.icon className="w-4 h-4" />
                            {status.label}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </motion.div>
                </AnimatePresence>
              </td>
              <td colSpan={columns.length + 1}></td>
            </tr>
          </tfoot>
        )}
      </table>
    </motion.div>
  );
}