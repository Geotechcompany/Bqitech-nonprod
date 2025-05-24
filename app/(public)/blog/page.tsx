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

  if (isLoading) return <div className="container mx-auto py-12">Loading...</div>

  const latestPost = posts?.[0]
  const otherPosts = posts?.slice(1) || []

  return (
    <div className="container mx-auto px-4 py-16">
      <header className="max-w-3xl mx-auto text-center mb-16">
        <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-[#272055] to-[#31CDFF] text-transparent bg-clip-text pb-2">
          Blog & Insights
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400">
          Stay updated with the latest insights in government technology and digital transformation
        </p>
      </header>

      {latestPost && (
        <section className="mb-20">
          <Link href={`/blog/${latestPost.slug}`} className="group">
            <article className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="relative aspect-[16/9] w-full">
                <Image
                  src={getImageUrl(latestPost.imageUrl)}
                  alt={latestPost.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                  sizes="100vw"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
                  <div className="flex items-center gap-4 mb-4 text-sm opacity-90">
                    <span className="px-3 py-1 bg-[#31CDFF] rounded-full">
                      {latestPost.category}
                    </span>
                    <time dateTime={new Date(latestPost.createdAt).toISOString()}>
                      {new Date(latestPost.createdAt).toLocaleDateString()}
                    </time>
                    <span>•</span>
                    <span>{latestPost.readTime}</span>
                  </div>
                  <h2 className="text-3xl font-bold mb-3 group-hover:text-[#31CDFF] transition-colors duration-300">
                    {latestPost.title}
                  </h2>
                  <p className="text-lg text-gray-200">
                    {latestPost.excerpt}
                  </p>
                </div>
              </div>
            </article>
          </Link>
        </section>
      )}

      <section>
        <h2 className="text-2xl font-bold mb-8">Latest Articles</h2>
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {otherPosts.map((post) => (
            <BlogCard key={post.id} post={post} />
          ))}
        </div>
      </section>

      <section className="mt-20">
        <h2 className="text-3xl font-bold text-center mb-8 bg-gradient-to-r from-[#272055] to-[#31CDFF] text-transparent bg-clip-text">
          Popular Categories
        </h2>
        <div className="flex flex-wrap justify-center gap-4">
          {Array.from(new Set(posts?.map(post => post.category))).map((category) => (
            <Link
              key={category}
              href={`/blog/category/${category.toLowerCase().replace(/\s+/g, '-')}`}
              className="px-4 py-2 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-[#31CDFF] hover:text-white transition-colors duration-300"
            >
              {category}
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
} 