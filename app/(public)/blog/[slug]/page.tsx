"use client"

import { useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import useSWR from 'swr'
import { Loader2, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface BlogPost {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  imageUrl: string;
  category: string;
  author: string;
  createdAt: string;
  readTime: string;
  slug: string;
  tags: string[];
  isPublished: boolean;
  publishedAt: string;
}

// Helper function to ensure valid image URL
const getImageUrl = (url: string) => {
  if (!url) return '/images/placeholder.jpg'
  if (url.startsWith('http')) return url
  if (url.startsWith('/')) return url
  return `/${url}`
}

const fetcher = async (url: string) => {
  const baseUrl = process.env.NEXT_PUBLIC_PYTHON_API_URL || 'http://localhost:10000'
  console.log('Fetching from:', `${baseUrl}/api${url}`);
  const response = await fetch(`${baseUrl}/api${url}`)
  if (!response.ok) {
    throw new Error('Failed to fetch post')
  }
  const data = await response.json()
  console.log('Fetched data:', data);
  return data
}

export default function BlogPostPage({ params }: { params: { slug: string } }) {
  const { data: post, error, isLoading } = useSWR<BlogPost>(
    `/blog/by-slug/${params.slug}`,
    fetcher,
    {
      refreshInterval: 5000, // Refresh every 5 seconds
      revalidateOnFocus: true, // Refresh when window regains focus
      onSuccess: (data) => console.log('Successfully fetched post:', data),
      onError: (error) => console.error('Error fetching post:', error)
    }
  )

  useEffect(() => {
    // Scroll to top when the page loads
    window.scrollTo(0, 0)
  }, [])

  if (isLoading) {
    return (
      <div className="container mx-auto py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center min-h-[400px]">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto py-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-red-600">
            Error loading blog post
          </h2>
          <p className="mt-2 text-gray-600">
            {error.message || 'Please try again later'}
          </p>
          <Link href="/blog" className="mt-4 inline-block">
            <Button variant="outline" className="mt-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Blog
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  if (!post) {
    return (
      <div className="container mx-auto py-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Post not found
          </h2>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            The blog post you're looking for doesn't exist or has been removed.
          </p>
          <Link href="/blog" className="mt-4 inline-block">
            <Button variant="outline" className="mt-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Blog
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Back Button */}
          <Link href="/blog">
            <Button variant="outline" className="mb-8">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Blog
            </Button>
          </Link>

          {/* Article Header */}
          <header className="mb-8">
            <div className="flex items-center gap-4 mb-4">
              {post.category && (
                <span className="rounded-full bg-[#31CDFF] px-3 py-1 text-sm font-medium text-white">
                  {post.category}
                </span>
              )}
              <time dateTime={post.createdAt} className="text-sm text-gray-600 dark:text-gray-400">
                {new Date(post.createdAt).toLocaleDateString()}
              </time>
              {post.readTime && (
                <>
                  <span aria-hidden="true" className="text-gray-600 dark:text-gray-400">•</span>
                  <span className="text-sm text-gray-600 dark:text-gray-400">{post.readTime}</span>
                </>
              )}
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold mb-4">
              {post.title}
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              {post.excerpt}
            </p>
          </header>

          {/* Featured Image */}
          {post.imageUrl && (
            <div className="relative aspect-[16/9] w-full mb-8 overflow-hidden rounded-2xl">
              <Image
                src={getImageUrl(post.imageUrl)}
                alt={post.title}
                fill
                className="object-cover"
                priority
              />
            </div>
          )}

          {/* Article Content */}
          <article className="prose prose-lg dark:prose-invert max-w-none">
            <div dangerouslySetInnerHTML={{ __html: post.content }} />
          </article>

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold mb-4">Tags</h2>
              <div className="flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-full text-sm text-gray-700 dark:text-gray-300"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 