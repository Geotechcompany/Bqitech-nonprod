"use client"

import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import type { BlogPost } from '@/app/types'
import { BlogCard } from '@/components/blog/blog-card'
import { cn } from '@/lib/utils'
import React from 'react'

// Helper function to ensure valid image URL
const getImageUrl = (url: string) => {
  if (!url) return '/images/placeholder.jpg'
  if (url.startsWith('http')) return url
  if (url.startsWith('/')) return url
  return `/${url}`
}

// Helper function to format content with proper spacing and images
const formatContent = (content: string) => {
  // Parse the HTML content
  const parser = new DOMParser()
  const doc = parser.parseFromString(content, 'text/html')
  
  // Convert NodeList to Array for easier manipulation
  const elements = Array.from(doc.body.children)
  
  return elements.map((element, index) => {
    // Handle images
    if (element.tagName.toLowerCase() === 'img') {
      const src = element.getAttribute('src') || ''
      const alt = element.getAttribute('alt') || ''
      const className = element.getAttribute('class') || ''
      
      return (
        <div key={index} className={cn("my-8 relative aspect-video w-full rounded-lg overflow-hidden", className)}>
          <Image
            src={getImageUrl(src)}
            alt={alt}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>
      )
    }

    // Handle paragraphs with proper spacing
    if (element.tagName.toLowerCase() === 'p') {
      return React.createElement('p', {
        key: index,
        className: "prose prose-lg dark:prose-invert max-w-none my-6",
        dangerouslySetInnerHTML: { __html: element.innerHTML }
      })
    }

    // Handle headings
    if (['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(element.tagName.toLowerCase())) {
      return React.createElement(element.tagName.toLowerCase(), {
        key: index,
        className: "prose prose-lg dark:prose-invert max-w-none mt-8 mb-4",
        dangerouslySetInnerHTML: { __html: element.innerHTML }
      })
    }

    // Handle lists
    if (['ul', 'ol'].includes(element.tagName.toLowerCase())) {
      return React.createElement(element.tagName.toLowerCase(), {
        key: index,
        className: "prose prose-lg dark:prose-invert max-w-none my-6 list-inside",
        dangerouslySetInnerHTML: { __html: element.innerHTML }
      })
    }

    // Handle blockquotes
    if (element.tagName.toLowerCase() === 'blockquote') {
      return React.createElement('blockquote', {
        key: index,
        className: "prose prose-lg dark:prose-invert max-w-none my-6 pl-4 border-l-4 border-gray-300 dark:border-gray-700",
        dangerouslySetInnerHTML: { __html: element.innerHTML }
      })
    }

    // Handle code blocks
    if (element.tagName.toLowerCase() === 'pre') {
      return React.createElement('pre', {
        key: index,
        className: "prose prose-lg dark:prose-invert max-w-none my-6 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-x-auto",
        dangerouslySetInnerHTML: { __html: element.innerHTML }
      })
    }
    
    // Handle other elements
    return React.createElement('div', {
      key: index,
      className: "prose prose-lg dark:prose-invert max-w-none my-4",
      dangerouslySetInnerHTML: { __html: element.outerHTML }
    })
  })
}

export default function BlogPostPage() {
  // Fetch current blog post
  const { data: post, isLoading: isLoadingPost } = useQuery<BlogPost>({
    queryKey: ['blog-post'],
    queryFn: async () => {
      const res = await fetch(`/api/blog-posts/${window.location.pathname.split('/').pop()}`)
      if (!res.ok) throw new Error('Failed to fetch post')
      return res.json()
    }
  })

  // Fetch related posts
  const { data: relatedPosts, isLoading: isLoadingRelated } = useQuery<BlogPost[]>({
    queryKey: ['related-posts', post?.category],
    queryFn: async () => {
      const res = await fetch('/api/blog-posts')
      if (!res.ok) throw new Error('Failed to fetch related posts')
      const posts = await res.json()
      return posts
        .filter((p: BlogPost) => p.id !== post?.id && p.category === post?.category)
        .slice(0, 3)
    },
    enabled: !!post
  })

  if (isLoadingPost) {
    return (
      <div className="min-h-screen  bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto">
            <div className="animate-pulse space-y-8">
              <div className="h-[60vh] bg-gray-200 rounded-2xl" />
              <div className="space-y-4">
                <div className="h-8 bg-gray-200 rounded w-3/4" />
                <div className="h-4 bg-gray-200 rounded w-1/4" />
                <div className="h-4 bg-gray-200 rounded w-full" />
                <div className="h-4 bg-gray-200 rounded w-full" />
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-3xl font-bold mb-4">Post not found</h1>
            <Link 
              href="/blog"
              className="text-[#31CDFF] hover:underline inline-flex items-center"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Blog
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero Section */}
      <div className="relative h-[80vh] w-full -mt-[64px]">
        <Image
          src={getImageUrl(post.imageUrl)}
          alt={post.title}
          fill
          className="object-cover"
          sizes="100vw"
          priority
          quality={90}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/20" />
        <div className="absolute inset-0 flex items-end">
          <div className="container mx-auto px-4 py-12 sm:py-16">
            <div className="max-w-4xl mx-auto text-white mb-8">
              <div className="flex flex-wrap items-center gap-4 mb-4 text-sm sm:text-base opacity-90">
                <span className="px-3 py-1 bg-[#31CDFF] rounded-full font-medium">
                  {post.category}
                </span>
                <time dateTime={new Date(post.createdAt).toISOString()}>
                  {new Date(post.createdAt).toLocaleDateString()}
                </time>
                <span>•</span>
                <span>{post.readTime}</span>
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
                {post.title}
              </h1>
              <p className="text-lg sm:text-xl text-gray-200 max-w-3xl">
                {post.excerpt}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section with Sidebar */}
      <div className="container mx-auto px-4 py-12 sm:py-16">
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Main Content */}
          <div className="flex-1">
            <Link 
              href="/blog"
              className="inline-flex items-center text-gray-600 dark:text-gray-400 hover:text-[#31CDFF] dark:hover:text-[#31CDFF] mb-8 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Blog
            </Link>

            <div className="prose prose-lg dark:prose-invert max-w-none">
              {formatContent(post.content)}
            </div>

            {post.tags && post.tags.length > 0 && (
              <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-800">
                <h2 className="text-lg font-semibold mb-4">Tags</h2>
                <div className="flex flex-wrap gap-2">
                  {post.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-full text-sm"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar with Related Posts */}
          <div className="lg:w-80 xl:w-96">
            <div className="sticky top-8">
              <h2 className="text-xl font-bold mb-6">Related Articles</h2>
              {isLoadingRelated ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-48 bg-gray-200 rounded-xl mb-3" />
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                      <div className="h-4 bg-gray-200 rounded w-1/2" />
                    </div>
                  ))}
                </div>
              ) : relatedPosts && relatedPosts.length > 0 ? (
                <div className="space-y-6">
                  {relatedPosts.map((relatedPost) => (
                    <div key={relatedPost.id} className="relative">
                      <BlogCard post={relatedPost} />
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600 dark:text-gray-400">
                  No related articles found
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 