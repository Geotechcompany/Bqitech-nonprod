"use client"

import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { BlogPostForm } from "@/components/admin/BlogPostForm"
import { AdminPageLayout } from "@/components/admin/AdminPageLayout"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { BlogPost } from "@/types/blog"
import { useAuth } from "@/contexts/AuthContext"
import { authService } from "@/lib/auth-backend"
import { useEffect } from "react"

export default function NewBlogPost() {
  const router = useRouter()
  const { isAuthenticated, isAdmin, authLoading } = useAuth()

  useEffect(() => {
    if (!authLoading && (!isAuthenticated || !isAdmin)) {
      router.push('/login')
    }
  }, [authLoading, isAuthenticated, isAdmin, router])

  const handleSubmit = async (data: Partial<BlogPost>) => {
    try {
      const session = authService.getSession()
      if (!session) {
        router.push('/login')
        return
      }

      const baseUrl = process.env.NEXT_PUBLIC_PYTHON_API_URL || 'http://localhost:8000'
      const response = await fetch(`${baseUrl}/api/admin/blog-posts`, {
        method: "POST",
        credentials: 'include',
        headers: { 
          "Content-Type": "application/json",
          'Authorization': `Bearer ${session.token}`,
          'Accept': 'application/json'
        },
        body: JSON.stringify(data),
      })

      if (response.status === 401) {
        const refreshed = await authService.refreshToken()
        if (!refreshed) {
          router.push('/login')
          throw new Error('Session expired')
        }

        // Retry with new token
        const retryResponse = await fetch(`${baseUrl}/api/admin/blog-posts`, {
          method: "POST",
          credentials: 'include',
          headers: { 
            "Content-Type": "application/json",
            'Authorization': `Bearer ${refreshed.access_token}`,
            'Accept': 'application/json'
          },
          body: JSON.stringify(data),
        })

        if (!retryResponse.ok) {
          const error = await retryResponse.json()
          throw new Error(error.message || "Failed to create blog post")
        }
      } else if (!response.ok) {
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

  if (authLoading) {
    return (
      <AdminPageLayout title="Create Blog Post">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
        </div>
      </AdminPageLayout>
    )
  }

  if (!isAuthenticated || !isAdmin) {
    return null // Router will handle the redirect
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