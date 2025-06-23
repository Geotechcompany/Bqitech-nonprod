"use client"

import { useRouter } from "next/navigation"
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query"
import { AdminPageLayout } from "@/components/admin/AdminPageLayout"
import { Button } from "@/components/ui/button"
import { PlusCircle, Eye, Pencil, Trash2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { useState, useEffect } from "react"
import { toast } from "sonner"
import Image from "next/image"
import { useAuth } from "@/contexts/AuthContext"
import { authService } from "@/lib/auth-backend"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import type { BlogPost } from "@/types/blog"
import { format } from "date-fns"

export default function BlogManagementPage() {
  const router = useRouter()
  const { isAuthenticated, isAdmin, authLoading } = useAuth()
  const queryClient = useQueryClient()
  const [postIdToDelete, setPostIdToDelete] = useState<string | null>(null)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isUpdating, setIsUpdating] = useState<string | null>(null)

  useEffect(() => {
    if (!authLoading && (!isAuthenticated || !isAdmin)) {
      router.push('/login')
    }
  }, [authLoading, isAuthenticated, isAdmin, router])

  const { data, isLoading: isDataLoading, error } = useQuery({
    queryKey: ['blog-posts'],
    queryFn: async () => {
      const session = authService.getSession()
      if (!session) {
        throw new Error('No authentication session')
      }

      const baseUrl = process.env.NEXT_PUBLIC_PYTHON_API_URL || 'http://localhost:8000'
      const res = await fetch(`${baseUrl}/api/admin/blog-posts`, {
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
        const retryRes = await fetch(`${baseUrl}/api/admin/blog-posts`, {
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${refreshed.access_token}`,
            'Accept': 'application/json'
          }
        })

        if (!retryRes.ok) {
          const error = await retryRes.json()
          throw new Error(error.message || 'Failed to fetch posts')
        }
        return retryRes.json()
      }

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.message || 'Failed to fetch posts')
      }
      return res.json()
    },
    enabled: isAuthenticated && isAdmin
  })

  const posts = data?.blogPosts || []

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const session = authService.getSession()
      if (!session) {
        throw new Error('No authentication session')
      }

      const baseUrl = process.env.NEXT_PUBLIC_PYTHON_API_URL || 'http://localhost:8000'
      const res = await fetch(`${baseUrl}/api/admin/blog-posts/${id}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${session.token}`,
          'Accept': 'application/json'
        }
      })

      if (res.status === 401) {
        const refreshed = await authService.refreshToken()
        if (!refreshed) {
          throw new Error('Session expired')
        }

        // Retry with new token
        const retryRes = await fetch(`${baseUrl}/api/admin/blog-posts/${id}`, {
          method: 'DELETE',
          credentials: 'include',
          headers: {
            'Authorization': `Bearer ${refreshed.access_token}`,
            'Accept': 'application/json'
          }
        })

        if (!retryRes.ok) {
          const error = await retryRes.json()
          throw new Error(error.message || 'Failed to delete post')
        }
        return retryRes.json()
      }

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.message || 'Failed to delete post')
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blog-posts'] })
      toast.success('Blog post deleted successfully')
      setIsDeleteModalOpen(false)
      setPostIdToDelete(null)
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to delete post')
    }
  })

  const togglePublishMutation = useMutation({
    mutationFn: async ({ id, published }: { id: string; published: boolean }) => {
      setIsUpdating(id)
      try {
        const session = authService.getSession()
        if (!session) {
          throw new Error('No authentication session')
        }

        const baseUrl = process.env.NEXT_PUBLIC_PYTHON_API_URL || 'http://localhost:8000'
        const res = await fetch(`${baseUrl}/api/admin/blog-posts/${id}`, {
          method: 'PATCH',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.token}`,
            'Accept': 'application/json'
          },
          body: JSON.stringify({ published })
        })

        if (res.status === 401) {
          const refreshed = await authService.refreshToken()
          if (!refreshed) {
            throw new Error('Session expired')
          }

          // Retry with new token
          const retryRes = await fetch(`${baseUrl}/api/admin/blog-posts/${id}`, {
            method: 'PATCH',
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${refreshed.access_token}`,
              'Accept': 'application/json'
            },
            body: JSON.stringify({ published })
          })

          if (!retryRes.ok) {
            const error = await retryRes.json()
            throw new Error(error.message || 'Failed to update post status')
          }
          return retryRes.json()
        }

        if (!res.ok) {
          const error = await res.json()
          throw new Error(error.message || 'Failed to update post status')
        }
        return res.json()
      } finally {
        setIsUpdating(null)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blog-posts'] })
      toast.success('Blog post status updated successfully')
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to update post status')
    }
  })

  const handleDelete = (id: string) => {
    if (!id) return
    deleteMutation.mutate(id)
  }

  const handleTogglePublish = async (id: string, currentStatus: boolean) => {
    if (!id) {
      toast.error('Invalid blog post ID')
      return
    }
    await togglePublishMutation.mutateAsync({ id, published: !currentStatus })
  }

  if (authLoading || isDataLoading) {
    return (
      <AdminPageLayout title="Blog Management">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
        </div>
      </AdminPageLayout>
    )
  }

  if (!isAuthenticated || !isAdmin) {
    return null // Router will handle the redirect
  }

  if (error) {
    return (
      <AdminPageLayout title="Blog Management">
        <div className="flex justify-center items-center h-64">
          <div className="text-red-500">
            {error instanceof Error ? error.message : 'Failed to load blog posts'}
          </div>
        </div>
      </AdminPageLayout>
    )
  }

  return (
    <AdminPageLayout title="Blog Management">
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Post</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this post? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setIsDeleteModalOpen(false)
                setPostIdToDelete(null)
              }}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive"
              onClick={() => {
                if (postIdToDelete) {
                  handleDelete(postIdToDelete)
                }
              }}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? 'Deleting...' : 'Delete Post'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Blog Posts</h1>
        <Button onClick={() => router.push('/admin/blog-management/new')}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Create New Post
        </Button>
      </div>

      <div className="rounded-md border">
        <div className="relative w-full overflow-auto">
          <table className="w-full caption-bottom text-sm">
            <thead className="[&_tr]:border-b">
              <tr className="border-b transition-colors hover:bg-muted/50">
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Image</th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Title</th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Category</th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Status</th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Created At</th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="[&_tr:last-child]:border-0">
              {posts?.map((post) => (
                <tr key={post.id} className="border-b transition-colors hover:bg-muted/50">
                  <td className="p-4 align-middle">
                    <div className="relative h-16 w-24 rounded-md overflow-hidden">
                      <Image
                        src={post.imageUrl}
                        alt={post.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 96px) 100vw, 96px"
                        priority={false}
                      />
                    </div>
                  </td>
                  <td className="p-4 align-middle max-w-[300px] truncate">{post.title}</td>
                  <td className="p-4 align-middle">
                    <Badge variant="outline">{post.category}</Badge>
                  </td>
                  <td className="p-4 align-middle">
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={post.published}
                        onCheckedChange={() => handleTogglePublish(post.id, post.published)}
                        disabled={isUpdating === post.id}
                      />
                      <span className="text-sm text-muted-foreground">
                        {post.published ? 'Published' : 'Draft'}
                      </span>
                    </div>
                  </td>
                  <td className="p-4 align-middle">
                    {format(new Date(post.createdAt), 'MMM d, yyyy')}
                  </td>
                  <td className="p-4 align-middle">
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.push(`/admin/blog-management/${post.id}/view`)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.push(`/admin/blog-management/${post.id}/edit`)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setPostIdToDelete(post.id)
                          setIsDeleteModalOpen(true)
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminPageLayout>
  )
} 