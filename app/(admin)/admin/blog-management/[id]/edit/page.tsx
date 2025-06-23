"use client"

import { useParams, useRouter } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import { toast } from "sonner"
import { BlogPostForm } from "@/components/admin/BlogPostForm"
import { AdminPageLayout } from "@/components/admin/AdminPageLayout"
import { ArrowLeft, Loader } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { BlogPost } from "@/types/blog"
import { useAuth } from "@/contexts/AuthContext"
import { authService } from "@/lib/auth-backend"
import { useEffect } from "react"

export default function EditBlogPost() {
  const params = useParams()
  const router = useRouter()
  const postId = params.id as string
  const { isAuthenticated, isAdmin, authLoading } = useAuth()

  useEffect(() => {
    if (!authLoading && (!isAuthenticated || !isAdmin)) {
      router.push('/login')
    }
  }, [authLoading, isAuthenticated, isAdmin, router])

  const { data: blogPost, isLoading, error } = useQuery({
    queryKey: ['blog-post', postId],
    queryFn: async () => {
      const session = authService.getSession()
      if (!session) {
        throw new Error('No authentication session')
      }

      const baseUrl = process.env.NEXT_PUBLIC_PYTHON_API_URL || 'http://localhost:8000'
      const res = await fetch(`${baseUrl}/api/admin/blog-posts/${postId}`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.token}`,
          'Accept': 'application/json'
        }
      })

      if (res.status === 401) {
        const refreshed = await authService.refreshToken()
        if (!refreshed) {
          router.push('/login')
          throw new Error('Session expired')
        }

        // Retry with new token
        const retryRes = await fetch(`${baseUrl}/api/admin/blog-posts/${postId}`, {
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${refreshed.access_token}`,
            'Accept': 'application/json'
          }
        })

        if (!retryRes.ok) {
          const error = await retryRes.json()
          throw new Error(error.message || 'Failed to fetch post')
        }
        return retryRes.json() as Promise<BlogPost>
      }

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.message || 'Failed to fetch post')
      }
      return res.json() as Promise<BlogPost>
    },
    enabled: isAuthenticated && isAdmin
  })

  const handleSubmit = async (data: Partial<BlogPost>) => {
    try {
      const session = authService.getSession()
      if (!session) {
        router.push('/login')
        return
      }

      const baseUrl = process.env.NEXT_PUBLIC_PYTHON_API_URL || 'http://localhost:8000'
      const response = await fetch(`${baseUrl}/api/admin/blog-posts/${postId}`, {
        method: "PATCH",
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
        const retryResponse = await fetch(`${baseUrl}/api/admin/blog-posts/${postId}`, {
          method: "PATCH",
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
          throw new Error(error.message || "Failed to save blog post")
        }
      } else if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Failed to save blog post")
      }

      toast.success("Blog post saved successfully")
      router.push("/admin/blog-management")
      router.refresh()
    } catch (error) {
      console.error('Save error:', error)
      toast.error(error instanceof Error ? error.message : "Failed to save blog post")
    }
  }

  if (authLoading || isLoading) {
    return (
      <AdminPageLayout title="Loading...">
        <div className="flex justify-center items-center py-8">
          <Loader className="h-8 w-8 animate-spin" />
        </div>
      </AdminPageLayout>
    )
  }

  if (!isAuthenticated || !isAdmin) {
    return null // Router will handle the redirect
  }

  if (error || !blogPost) {
    return (
      <AdminPageLayout title="Error">
        <div className="text-center py-8">
          <h2 className="text-2xl font-bold mb-4">Failed to load blog post</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {error instanceof Error ? error.message : "An error occurred"}
          </p>
          <Button onClick={() => router.push('/admin/blog-management')}>
            Back to Posts
          </Button>
        </div>
      </AdminPageLayout>
    )
  }

  return (
    <AdminPageLayout title="Edit Blog Post">
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