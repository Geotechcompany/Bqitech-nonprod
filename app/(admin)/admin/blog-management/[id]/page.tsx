"use client"

import { useParams, useRouter } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import { toast } from "sonner"
import { BlogPostForm } from "@/components/admin/BlogPostForm"
import { AdminPageLayout } from "@/components/admin/AdminPageLayout"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { BlogPost } from "@/types/blog"

export default function BlogPostEditor() {
  const { id } = useParams()
  const router = useRouter()
  const isNew = id === "new"

  const { data: blogPost, isLoading } = useQuery({
    queryKey: ['blog-post', id],
    queryFn: async () => {
      if (isNew) return null
      const res = await fetch(`/api/admin/blog-posts/${id}`)
      if (!res.ok) throw new Error('Failed to fetch post')
      return res.json()
    }
  })

  const handleSubmit = async (data: Partial<BlogPost>) => {
    try {
      const url = isNew ? "/api/admin/blog-posts" : `/api/admin/blog-posts/${id}`
      const method = isNew ? "POST" : "PATCH"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (!response.ok) throw new Error("Failed to save blog post")

      toast.success("Blog post saved successfully")
      router.push("/admin/blog-management")
      router.refresh()
    } catch (error) {
      toast.error("Failed to save blog post")
    }
  }

  if (!isNew && isLoading) {
    return <div>Loading...</div>
  }

  return (
    <AdminPageLayout title={isNew ? "Create Blog Post" : "Edit Blog Post"}>
      <div className="h-full space-y-4">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            onClick={() => router.push('/admin/blog-management')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Blog Posts
          </Button>
        </div>

        <div className="max-w-4xl bg-white dark:bg-gray-800 rounded-lg p-6">
          <BlogPostForm 
            initialData={blogPost} 
            onSubmit={handleSubmit} 
          />
        </div>
      </div>
    </AdminPageLayout>
  )
} 