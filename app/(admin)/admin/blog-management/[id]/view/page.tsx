"use client"

import { useQuery } from "@tanstack/react-query"
import { useParams, useRouter } from "next/navigation"
import { AdminPageLayout } from "@/components/admin/AdminPageLayout"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Pencil } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { BlogPost } from "@/app/types"
import { format } from "date-fns"
import Image from "next/image"
import { useAuth } from "@/contexts/AuthContext"
import { authService } from "@/lib/auth-backend"
import { useEffect } from "react"

export default function ViewBlogPost() {
  const params = useParams()
  const router = useRouter()
  const postId = params.id as string
  const { isAuthenticated, isAdmin, authLoading } = useAuth()

  useEffect(() => {
    if (!authLoading && (!isAuthenticated || !isAdmin)) {
      router.push('/login')
    }
  }, [authLoading, isAuthenticated, isAdmin, router])

  const { data: post, isLoading, error } = useQuery({
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

  if (authLoading || isLoading) {
    return (
      <AdminPageLayout title="View Blog Post">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
        </div>
      </AdminPageLayout>
    )
  }

  if (!isAuthenticated || !isAdmin) {
    return null // Router will handle the redirect
  }

  if (error || !post) {
    return (
      <AdminPageLayout title="View Blog Post">
        <div className="flex justify-center items-center h-64">
          <div className="text-red-500">
            {error instanceof Error ? error.message : 'Failed to load blog post'}
          </div>
        </div>
      </AdminPageLayout>
    )
  }

  return (
    <AdminPageLayout title="View Blog Post">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => router.back()}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <Button
            onClick={() => router.push(`/admin/blog-management/${postId}/edit`)}
          >
            <Pencil className="mr-2 h-4 w-4" />
            Edit Post
          </Button>
        </div>

        <div className="space-y-8">
          <div>
            <h1 className="text-3xl font-bold mb-4">{post.title}</h1>
            <div className="flex gap-4 text-sm text-muted-foreground">
              <div>Created: {format(new Date(post.createdAt), 'MMM d, yyyy')}</div>
              <div>Updated: {format(new Date(post.updatedAt), 'MMM d, yyyy')}</div>
              <Badge variant={post.published ? "default" : "secondary"}>
                {post.published ? "Published" : "Draft"}
              </Badge>
              <Badge variant="outline">{post.category}</Badge>
              <div>{post.readTime} read</div>
            </div>
          </div>

          <div className="relative w-full h-[400px] rounded-lg overflow-hidden">
            <Image
              src={post.imageUrl}
              alt={post.title}
              fill
              className="object-cover"
              sizes="(max-width: 1200px) 100vw, 1200px"
              priority
            />
          </div>

          <div className="prose prose-lg max-w-none">
            <h2 className="text-xl font-semibold mb-2">Excerpt</h2>
            <p className="text-muted-foreground">{post.excerpt}</p>
          </div>

          <div className="prose prose-lg max-w-none">
            <h2 className="text-xl font-semibold mb-2">Content</h2>
            <div dangerouslySetInnerHTML={{ __html: post.content }} />
          </div>

          {post.tags && post.tags.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-2">Tags</h2>
              <div className="flex gap-2">
                {post.tags.map((tag, index) => (
                  <Badge key={index} variant="outline">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {post.metaDescription && (
            <div className="prose prose-lg max-w-none">
              <h2 className="text-xl font-semibold mb-2">Meta Description</h2>
              <p className="text-muted-foreground">{post.metaDescription}</p>
            </div>
          )}

          <div className="flex gap-4 text-sm text-muted-foreground">
            <div>Views: {post.views || 0}</div>
            <div>Likes: {post.likes || 0}</div>
          </div>
        </div>
      </div>
    </AdminPageLayout>
  )
} 