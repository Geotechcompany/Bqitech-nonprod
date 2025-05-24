"use client"

import { useParams } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import Link from "next/link"
import { BlogCard } from "@/components/blog/blog-card"
import type { BlogPost } from "@/types/blog"

export default function BlogCategoryPage() {
  const { category } = useParams()
  
  const decodedCategory = decodeURIComponent(category as string)
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')

  const { data: posts, isLoading } = useQuery({
    queryKey: ['blog-posts-by-category', category],
    queryFn: async () => {
      const res = await fetch(`/api/blog-posts?category=${category}`)
      if (!res.ok) throw new Error('Failed to fetch posts')
      return res.json() as Promise<BlogPost[]>
    }
  })

  if (isLoading) return <div className="container mx-auto py-12">Loading...</div>

  return (
    <div className="container mx-auto px-4 py-16">
      <Link 
        href="/blog"
        className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-8"
      >
        ← Back to Blog
      </Link>

      <header className="max-w-2xl mx-auto text-center mb-16">
        <h1 className="text-4xl font-bold mb-4">
          {decodedCategory}
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400">
          Articles in {decodedCategory} category
        </p>
      </header>

      <section>
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {posts?.map((post) => (
            <BlogCard key={post.id} post={post} />
          ))}
        </div>
      </section>
    </div>
  )
} 