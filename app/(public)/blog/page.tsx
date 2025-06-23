"use client"

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import useSWR from "swr"
import { Loader2, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

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
    throw new Error('Failed to fetch posts')
  }
  const data = await response.json()
  console.log('Fetched data:', data);
  return data
}

export default function BlogPage() {
  const [currentPage, setCurrentPage] = useState(1)
  const { data, error, isLoading } = useSWR<{
    posts: BlogPost[];
    total: number;
    page: number;
    totalPages: number;
  }>(
    '/blog?limit=9&skip=' + ((currentPage - 1) * 9),
    fetcher,
    { 
      refreshInterval: 5000, // Refresh every 5 seconds
      revalidateOnFocus: true, // Refresh when window regains focus
      onSuccess: (data) => console.log('Successfully fetched data:', data),
      onError: (error) => console.error('Error fetching data:', error)
    }
  )

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= (data?.totalPages || 1)) {
      setCurrentPage(newPage)
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-12 px-4">
        <div className="max-w-7xl mx-auto">
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
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600">
            Error loading blog posts
          </h2>
          <p className="mt-2 text-gray-600">
            {error.message || 'Please try again later'}
          </p>
        </div>
      </div>
    )
  }

  if (!data?.posts || data.posts.length === 0) {
    return (
      <div className="container mx-auto py-12 px-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            No posts found
          </h2>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Check back later for new content
          </p>
        </div>
      </div>
    )
  }

  const { posts } = data
  const latestPost = posts[0]
  const otherPosts = posts.slice(1)
  const categories = Array.from(new Set(posts.map(post => post.category).filter(Boolean)))

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-12 sm:py-16">
        {/* Latest Post */}
        {latestPost && (
          <div className="mb-16 sm:mb-20">
            <Link href={`/blog/${latestPost.slug}`} className="group">
              <div className="relative aspect-[16/9] w-full overflow-hidden rounded-2xl">
                <Image
                  src={getImageUrl(latestPost.imageUrl)}
                  alt={latestPost.title}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-0 p-6 sm:p-8">
                  <div className="space-y-2">
                    <div className="flex items-center gap-4 text-sm text-white/90">
                      {latestPost.category && (
                        <span className="rounded-full bg-[#31CDFF] px-3 py-1 text-sm font-medium text-white">
                          {latestPost.category}
                        </span>
                      )}
                      <time dateTime={latestPost.createdAt}>
                        {new Date(latestPost.createdAt).toLocaleDateString()}
                      </time>
                      {latestPost.readTime && (
                        <span>{latestPost.readTime}</span>
                      )}
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-bold text-white">
                      {latestPost.title}
                    </h2>
                    <p className="text-sm sm:text-base text-white/90 line-clamp-2">
                      {latestPost.excerpt}
                    </p>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        )}

        {/* Other Posts */}
        {otherPosts.length > 0 && (
          <section className="mb-16 sm:mb-20">
            <h2 className="text-2xl sm:text-3xl font-bold mb-8">Latest Articles</h2>
            <div className="grid gap-6 sm:gap-8 md:grid-cols-2 lg:grid-cols-3">
              {otherPosts.map((post) => (
                <Link key={post.id} href={`/blog/${post.slug}`} className="group">
                  <article className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
                    <div className="relative h-48 w-full">
                      <Image
                        src={getImageUrl(post.imageUrl)}
                        alt={post.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                      {post.category && (
                        <div className="absolute top-4 left-4">
                          <span className="px-3 py-1 text-sm font-medium text-white bg-[#31CDFF] rounded-full">
                            {post.category}
                          </span>
                        </div>
                      )}
                    </div>
                    
                    <div className="p-6">
                      <div className="flex items-center gap-4 mb-3 text-sm text-gray-600 dark:text-gray-400">
                        <time dateTime={post.createdAt}>
                          {new Date(post.createdAt).toLocaleDateString()}
                        </time>
                        {post.readTime && (
                          <>
                            <span aria-hidden="true">•</span>
                            <span>{post.readTime}</span>
                          </>
                        )}
                      </div>
                      
                      <h3 className="text-xl font-bold mb-2 group-hover:text-[#31CDFF] transition-colors duration-300">
                        {post.title}
                      </h3>
                      
                      <p className="text-gray-600 dark:text-gray-400 line-clamp-2">
                        {post.excerpt}
                      </p>
                    </div>
                  </article>
                </Link>
              ))}
            </div>

            {/* Pagination Controls */}
            {data.totalPages > 1 && (
              <div className="mt-8 flex items-center justify-center gap-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Page {currentPage} of {data.totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === data.totalPages}
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </section>
        )}

        {/* Categories */}
        {categories.length > 0 && (
          <section>
            <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8 bg-gradient-to-r from-[#272055] to-[#31CDFF] text-transparent bg-clip-text">
              Popular Categories
            </h2>
            <div className="flex flex-wrap justify-center gap-3 sm:gap-4">
              {categories.map((category) => (
                <Link
                  key={category}
                  href={`/blog/category/${category.toLowerCase().replace(/\s+/g, '-')}`}
                  className="px-4 py-2 rounded-full bg-white dark:bg-gray-800 hover:bg-[#31CDFF] hover:text-white transition-all duration-300 shadow-sm hover:shadow-md text-sm sm:text-base"
                >
                  {category}
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
} 