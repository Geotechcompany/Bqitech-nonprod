"use client"

import Image from 'next/image'
import Link from 'next/link'
import type { BlogPost } from "@/types/blog"

// Helper function to ensure valid image URL
const getImageUrl = (url: string) => {
  if (!url) return '/images/placeholder.jpg'
  if (url.startsWith('http')) return url
  if (url.startsWith('/')) return url
  return `/${url}`
}

export function BlogCard({ post }: { post: BlogPost }) {
  return (
    <Link href={`/blog/${post.slug}`} className="group">
      <article className="h-full bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 flex flex-col">
        <div className="relative aspect-[16/9] w-full">
          <Image
            src={getImageUrl(post.imageUrl)}
            alt={post.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            quality={85}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>
        
        <div className="flex-1 p-5 sm:p-6">
          <div className="flex items-center gap-3 mb-3">
            <span className="px-2.5 py-0.5 text-sm font-medium text-[#31CDFF] bg-[#31CDFF]/10 rounded-full">
              {post.category}
            </span>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {post.readTime}
            </span>
          </div>
          
          <h3 className="text-lg sm:text-xl font-bold mb-2 group-hover:text-[#31CDFF] transition-colors duration-300 line-clamp-2">
            {post.title}
          </h3>
          
          <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base line-clamp-2 mb-4">
            {post.excerpt}
          </p>

          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mt-auto">
            <time dateTime={new Date(post.createdAt).toISOString()}>
              {new Date(post.createdAt).toLocaleDateString()}
            </time>
          </div>
        </div>
      </article>
    </Link>
  )
} 