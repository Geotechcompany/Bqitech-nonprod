"use client"

import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { BlogPostForm } from "@/components/admin/BlogPostForm"
import { AdminPageLayout } from "@/components/admin/AdminPageLayout"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { BlogPost } from "@/types/blog"

export default function NewBlogPost() {
  const router = useRouter()

  const handleSubmit = async (data: Partial<BlogPost>) => {
    try {
      const response = await fetch("/api/admin/blog-posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Failed to create blog post")
      }

      toast.success("Blog post created successfully")
      router.push("/admin/blog-management")
      router.refresh()
    } catch (error) {
      console.error('Save error:', error)
      toast.error(error instanceof Error ? error.message : "Failed to create blog post")
    }
  }

  return (
    <AdminPageLayout title="Create Blog Post">
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
            onSubmit={handleSubmit} 
          />
        </div>
      </div>
    </AdminPageLayout>
  )
} 