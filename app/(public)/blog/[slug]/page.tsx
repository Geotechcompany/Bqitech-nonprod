"use client"

import { useParams } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import Image from "next/image"
import Link from "next/link"

interface BlogPost {
  id: string
  title: string
  excerpt: string
  content: string
  imageUrl: string
  category: string
  readTime: string
  slug: string
  published: boolean
  createdAt: string
}

export default function BlogPostPage() {
  const { slug } = useParams()

  // Helper function to ensure valid image URL
  const getImageUrl = (url: string) => {
    if (!url) return '/images/placeholder.jpg'
    if (url.startsWith('http')) return url
    if (url.startsWith('/')) return url
    return `/${url}`
  }

  const { data: post, isLoading } = useQuery({
    queryKey: ['blog-post', slug],
    queryFn: async () => {
      const res = await fetch(`/api/blog-posts/${slug}`)
      if (!res.ok) throw new Error('Failed to fetch post')
      return res.json() as Promise<BlogPost>
    }
  })

  if (isLoading) return <div className="container mx-auto py-12">Loading...</div>
  if (!post) return <div className="container mx-auto py-12">Post not found</div>

  return (
    <article className="container mx-auto px-4 py-16 max-w-4xl">
      <Link 
        href="/blog"
        className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-8"
      >
        ← Back to Blog
      </Link>

      <header className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <span className="px-3 py-1 text-sm font-medium text-white bg-[#31CDFF] rounded-full">
            {post.category}
          </span>
          <time className="text-gray-600" dateTime={new Date(post.createdAt).toISOString()}>
            {new Date(post.createdAt).toLocaleDateString()}
          </time>
          <span className="text-gray-600">•</span>
          <span className="text-gray-600">{post.readTime}</span>
        </div>
        
        <h1 className="text-4xl font-bold mb-4">{post.title}</h1>
        <p className="text-xl text-gray-600">{post.excerpt}</p>
      </header>

      <div className="relative w-full h-[400px] mb-12">
        <Image
          src={getImageUrl(post.imageUrl)}
          alt={post.title}
          fill
          className="object-cover rounded-2xl"
          priority
        />
      </div>

      <div 
        className="prose prose-lg max-w-none dark:prose-invert"
        dangerouslySetInnerHTML={{ __html: post.content }}
      />
    </article>
  )
} 