"use client"

import { useRouter } from "next/navigation"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { AdminPageLayout } from "@/components/admin/AdminPageLayout"
import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"
import DataTable from '@/components/admin/DataTable'
import { columns } from "./columns"

interface BlogPost {
  id: string
  title: string
  excerpt: string
  imageUrl: string
  category: string
  readTime: string
  published: boolean
  createdAt: string
}

export default function BlogManagementPage() {
  const router = useRouter()
  const queryClient = useQueryClient()

  const { data: posts, isLoading } = useQuery({
    queryKey: ['blog-posts'],
    queryFn: async () => {
      const res = await fetch('/api/admin/blog-posts')
      if (!res.ok) throw new Error('Failed to fetch posts')
      return res.json() as Promise<BlogPost[]>
    }
  })

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this post?')) return

    const res = await fetch(`/api/admin/blog-posts/${id}`, {
      method: 'DELETE',
    })

    if (res.ok) {
      queryClient.invalidateQueries({ queryKey: ['blog-posts'] })
    }
  }

  const postsWithActions = posts?.map(post => ({
    ...post,
    onView: (id: string) => router.push(`/admin/blog-management/${id}`),
    onEdit: (id: string) => router.push(`/admin/blog-management/${id}`),
    onDelete: handleDelete
  })) || []

  return (
    <AdminPageLayout title="Blog Management">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Blog Posts</h1>
        <Button onClick={() => router.push('/admin/blog-management/new')}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Create New Post
        </Button>
      </div>

      <DataTable 
        columns={columns} 
        data={postsWithActions}
        isLoading={isLoading}
        onView={(id) => router.push(`/admin/blog-management/${id}`)}
        onEdit={(id) => router.push(`/admin/blog-management/${id}`)}
        onDelete={handleDelete}
      />
    </AdminPageLayout>
  )
} 