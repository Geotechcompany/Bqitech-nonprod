"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Eye, Pencil, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import Image from "next/image"

interface BlogPost {
  title: string
  published: boolean
  createdAt: string
  id: string
  onView: (id: string) => void
  onEdit: (id: string) => void
  onDelete: (id: string) => void
  category: string
  readTime: string
}

export const columns = [
  { 
    header: "Title", 
    accessor: (row: BlogPost) => row.title 
  },
  { 
    header: "Category", 
    accessor: (row: BlogPost) => row.category 
  },
  { 
    header: "Status", 
    accessor: (row: BlogPost) => row.published ? "Published" : "Draft",
    cell: ({ row }: { row: BlogPost }) => (
      <span className={`px-2 py-1 rounded-full text-sm ${
        row.published ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
      }`}>
        {row.published ? "Published" : "Draft"}
      </span>
    )
  },
  { 
    header: "Read Time", 
    accessor: (row: BlogPost) => row.readTime 
  },
  { 
    header: "Created At", 
    accessor: (row: BlogPost) => new Date(row.createdAt).toLocaleDateString(),
  },
  {
    header: "Actions",
    accessor: (row: BlogPost) => row.id,
    cell: ({ row }: { row: BlogPost }) => (
      <div className="flex gap-2">
        <Button onClick={() => row.onView(row.id)}>
          <Eye className="h-4 w-4" />
        </Button>
        <Button onClick={() => row.onEdit(row.id)}>
          <Pencil className="h-4 w-4" />
        </Button>
        <Button 
          onClick={() => row.onDelete(row.id)} 
          variant="destructive"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    )
  }
] 