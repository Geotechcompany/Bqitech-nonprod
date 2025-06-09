"use client"

import Image from 'next/image'
import Link from 'next/link'
import useSWR from "swr"
import type { BlogPost } from "@/types/blog"

// Helper function to ensure valid image URL
const getImageUrl = (url: string) => {
  if (!url) return '/images/placeholder.jpg'
  if (url.startsWith('http')) return url
  if (url.startsWith('/')) return url
  return `/${url}`
}

const fetcher = (url: string) => fetch(url).then(res => {
  if (!res.ok) throw new Error('Failed to fetch posts')
  return res.json()
})

function BlogCard({ post }: { post: BlogPost }) {
  return (
    <Link href={`/blog/${post.slug}`} className="group">
      <article className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
        <div className="relative h-48 w-full">
          <Image
            src={getImageUrl(post.imageUrl)}
            alt={post.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          <div className="absolute top-4 left-4">
            <span className="px-3 py-1 text-sm font-medium text-white bg-[#31CDFF] rounded-full">
              {post.category}
            </span>
          </div>
        </div>
        
        <div className="p-6">
          <div className="flex items-center gap-4 mb-3 text-sm text-gray-600 dark:text-gray-400">
            <time dateTime={new Date(post.createdAt).toISOString()}>
              {new Date(post.createdAt).toLocaleDateString()}
            </time>
            <span aria-hidden="true">•</span>
            <span>{post.readTime}</span>
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
  )
}

export default function BlogPage() {
  const { data: posts, isLoading } = useSWR<BlogPost[]>(
    '/api/blog-posts',
    fetcher,
    { refreshInterval: 30000 }
  )

  if (isLoading) {
    return (
      <div className="container mx-auto py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-8">
            <div className="h-72 bg-gray-200 rounded-2xl" />
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-gray-200 h-96 rounded-2xl" />
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!posts || posts.length === 0) {
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

  const latestPost = posts[0]
  const otherPosts = posts.slice(1)
  const categories = Array.from(new Set(posts.map(post => post.category).filter(Boolean)))

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-12 sm:py-16 lg:py-20">
        <header className="max-w-3xl mx-auto text-center mb-12 sm:mb-16 lg:mb-20">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4 bg-gradient-to-r from-[#272055] to-[#31CDFF] text-transparent bg-clip-text pb-2">
            Blog & Insights
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Stay updated with the latest insights in government technology and digital transformation
          </p>
        </header>

        {latestPost && (
          <section className="mb-16 sm:mb-20">
            <Link href={`/blog/${latestPost.slug}`} className="group">
              <article className="relative bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300">
                <div className="relative aspect-[21/9] sm:aspect-[16/9] w-full">
                  <Image
                    src={getImageUrl(latestPost.imageUrl)}
                    alt={latestPost.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 1200px"
                    priority
                    quality={90}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8 lg:p-10 text-white">
                    <div className="flex flex-wrap items-center gap-4 mb-4 text-sm sm:text-base opacity-90">
                      <span className="px-3 py-1 bg-[#31CDFF] rounded-full font-medium">
                        {latestPost.category}
                      </span>
                      <time dateTime={new Date(latestPost.createdAt).toISOString()}>
                        {new Date(latestPost.createdAt).toLocaleDateString()}
                      </time>
                      <span>•</span>
                      <span>{latestPost.readTime}</span>
                    </div>
                    <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 group-hover:text-[#31CDFF] transition-colors duration-300">
                      {latestPost.title}
                    </h2>
                    <p className="text-base sm:text-lg text-gray-200 line-clamp-2 sm:line-clamp-3">
                      {latestPost.excerpt}
                    </p>
                  </div>
                </div>
              </article>
            </Link>
          </section>
        )}

        <section className="mb-16 sm:mb-20">
          <h2 className="text-2xl sm:text-3xl font-bold mb-8">Latest Articles</h2>
          <div className="grid gap-6 sm:gap-8 md:grid-cols-2 lg:grid-cols-3">
            {otherPosts.map((post) => (
              <BlogCard key={post.id} post={post} />
            ))}
          </div>
        </section>

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