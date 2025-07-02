"use client"

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import useSWR from "swr"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronLeft, ChevronRight, Sparkles, BookOpen, Clock, Calendar, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { BlogCard } from "@/components/blog/blog-card"
import { Skeleton } from "@/components/ui/skeleton"

interface BlogPost {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  imageUrl: string;
  category: string;
  author: string;
  authorProfile?: {
    name: string;
    bio: string;
    profileImage: string;
    title: string;
    socialLinks?: {
      twitter?: string;
      linkedin?: string;
      github?: string;
      website?: string;
    };
  };
  createdAt: string;
  readTime: string;
  slug: string;
  tags: string[];
  isPublished: boolean;
  publishedAt: string;
}

// High-quality placeholder component
const ImagePlaceholder = ({ className = "", aspectRatio = "aspect-video" }: { className?: string, aspectRatio?: string }) => (
  <div className={`${aspectRatio} ${className} bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 flex items-center justify-center relative overflow-hidden`}>
    <div className="absolute inset-0 bg-gradient-to-br from-[#31CDFF]/5 to-[#272055]/5" />
    <BookOpen className="h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12 text-gray-400 dark:text-gray-500 relative z-10" />
    <div className="absolute inset-0 bg-noise opacity-20" />
  </div>
)

// Enhanced Skeleton Loader Components
const BlogSkeletonCard = () => (
  <div className="group relative overflow-hidden rounded-xl sm:rounded-2xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-white/20 dark:border-gray-700/20 shadow-lg">
    <div className="aspect-[4/3] relative overflow-hidden">
      <ImagePlaceholder aspectRatio="aspect-[4/3]" />
    </div>
    <div className="p-4 sm:p-6 space-y-3 sm:space-y-4">
      <div className="flex items-center gap-2 sm:gap-3">
        <Skeleton className="h-5 sm:h-6 w-16 sm:w-20 rounded-full" />
        <Skeleton className="h-3 sm:h-4 w-20 sm:w-24" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-5 sm:h-6 w-full" />
        <Skeleton className="h-5 sm:h-6 w-3/4" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-3 sm:h-4 w-full" />
        <Skeleton className="h-3 sm:h-4 w-5/6" />
        <Skeleton className="h-3 sm:h-4 w-2/3" />
      </div>
      <div className="flex items-center justify-between pt-2">
        <Skeleton className="h-3 sm:h-4 w-16 sm:w-20" />
        <Skeleton className="h-3 sm:h-4 w-12 sm:w-16" />
      </div>
    </div>
  </div>
)

const FeaturedBlogSkeleton = () => (
  <div className="relative aspect-[4/3] sm:aspect-[16/9] w-full overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-br from-[#272055]/20 to-[#31CDFF]/20 backdrop-blur-sm border border-white/20">
    <ImagePlaceholder aspectRatio="aspect-[4/3] sm:aspect-[16/9]" className="absolute inset-0" />
    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
    <div className="absolute bottom-0 p-4 sm:p-6 lg:p-8 space-y-3 sm:space-y-4 w-full">
      <div className="flex flex-wrap items-center gap-2 sm:gap-4">
        <Skeleton className="h-6 sm:h-8 w-20 sm:w-24 rounded-full" />
        <Skeleton className="h-4 sm:h-5 w-24 sm:w-32" />
        <Skeleton className="h-4 sm:h-5 w-16 sm:w-20" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-6 sm:h-8 w-full sm:w-3/4 bg-white/20" />
        <Skeleton className="h-6 sm:h-8 w-3/4 sm:w-1/2 bg-white/20" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 sm:h-5 w-full bg-white/20" />
        <Skeleton className="h-4 sm:h-5 w-4/5 bg-white/20" />
      </div>
    </div>
  </div>
)

const BlogPageSkeleton = () => (
  <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-100/20 dark:from-gray-900 dark:via-blue-950/30 dark:to-indigo-950/20">
    <div className="container mx-auto px-4 py-8 sm:py-12 lg:py-16">
      {/* Featured Post Skeleton */}
      <div className="mb-12 sm:mb-16 lg:mb-20">
        <FeaturedBlogSkeleton />
      </div>

      {/* Section Header Skeleton */}
      <div className="mb-6 sm:mb-8">
        <Skeleton className="h-6 sm:h-8 w-32 sm:w-48 mx-auto sm:mx-0" />
      </div>

      {/* Blog Cards Grid Skeleton */}
      <div className="grid gap-4 sm:gap-6 lg:gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 mb-12 sm:mb-16">
        {[...Array(6)].map((_, i) => (
          <BlogSkeletonCard key={i} />
        ))}
      </div>

      {/* Categories Section Skeleton */}
      <div className="text-center space-y-6 sm:space-y-8">
        <Skeleton className="h-6 sm:h-8 w-48 sm:w-64 mx-auto" />
        <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-8 sm:h-10 w-20 sm:w-24 rounded-full" />
          ))}
        </div>
      </div>
    </div>
  </div>
)

// Helper function to ensure valid image URL with optimization
const getImageUrl = (url: string) => {
  if (!url) return '/images/placeholder.jpg'
  
  // For external URLs, ensure they're properly formatted
  if (url.startsWith('http')) {
    // Check if it's a supported image format
    const supportedFormats = ['.jpg', '.jpeg', '.png', '.webp', '.avif']
    const hasValidFormat = supportedFormats.some(format => 
      url.toLowerCase().includes(format)
    )
    
    if (!hasValidFormat) {
      console.warn('Image URL may not be in a supported format:', url)
    }
    
    return url
  }
  
  if (url.startsWith('/')) return url
  return `/${url}`
}

// Enhanced image error handler
const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
  const target = e.target as HTMLImageElement
  console.warn('Image failed to load:', target.src)
  target.src = '/images/placeholder.jpg'
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

// Floating animation variants - reduced for mobile performance
const floatingVariants = {
  animate: {
    y: [-5, 5, -5],
    rotate: [-1, 1, -1],
    transition: {
      y: { duration: 4, repeat: Infinity, ease: "easeInOut" },
      rotate: { duration: 3, repeat: Infinity, ease: "easeInOut" },
    }
  }
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
    return <BlogPageSkeleton />
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-red-50/30 to-pink-100/20 dark:from-gray-900 dark:via-red-950/30 dark:to-pink-950/20">
        <div className="container mx-auto py-8 sm:py-12 px-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center max-w-sm sm:max-w-md mx-auto"
          >
            <div className="relative mb-6">
              <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto bg-gradient-to-br from-red-100 to-pink-100 dark:from-red-900/20 dark:to-pink-900/20 rounded-full flex items-center justify-center backdrop-blur-sm border border-red-200/50">
                <BookOpen className="h-10 w-10 sm:h-12 sm:w-12 text-red-500" />
              </div>
              <motion.div
                className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 text-red-400"
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Sparkles className="h-5 w-5 sm:h-6 sm:w-6" />
              </motion.div>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-red-600 dark:text-red-400 mb-3">
              Error loading blog posts
            </h2>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-6">
              {error.message || 'Please try again later'}
            </p>
            <Button 
              onClick={() => window.location.reload()}
              className="w-full sm:w-auto bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 min-h-[44px]"
            >
              Try Again
            </Button>
          </motion.div>
        </div>
      </div>
    )
  }

  if (!data?.posts || data.posts.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-100/20 dark:from-gray-900 dark:via-blue-950/30 dark:to-indigo-950/20">
        <div className="container mx-auto py-8 sm:py-12 px-4">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-sm sm:max-w-md mx-auto"
          >
            <div className="relative mb-6">
              <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-full flex items-center justify-center backdrop-blur-sm border border-blue-200/50">
                <BookOpen className="h-10 w-10 sm:h-12 sm:w-12 text-blue-500" />
              </div>
              <motion.div
                className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 text-blue-400"
                variants={floatingVariants}
                animate="animate"
              >
                <Sparkles className="h-5 w-5 sm:h-6 sm:w-6" />
              </motion.div>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100 mb-3">
              No posts found
            </h2>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
              Check back later for new content
            </p>
          </motion.div>
        </div>
      </div>
    )
  }

  const { posts } = data
  const latestPost = posts[0]
  const otherPosts = posts.slice(1)
  const categories = Array.from(new Set(posts.map(post => post.category).filter(Boolean)))

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-100/20 dark:from-gray-900 dark:via-blue-950/30 dark:to-indigo-950/20 relative overflow-hidden">
      {/* Background Decorations - Reduced for mobile */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-10 sm:top-20 left-5 sm:left-10 w-20 h-20 sm:w-32 sm:h-32 bg-gradient-to-br from-[#31CDFF]/10 to-[#272055]/10 rounded-full blur-xl"
          variants={floatingVariants}
          animate="animate"
        />
        <motion.div
          className="absolute top-20 sm:top-40 right-10 sm:right-20 w-16 h-16 sm:w-24 sm:h-24 bg-gradient-to-br from-[#272055]/10 to-[#31CDFF]/10 rounded-full blur-xl"
          variants={floatingVariants}
          animate="animate"
          transition={{ delay: 1 }}
        />
        <motion.div
          className="absolute bottom-20 sm:bottom-40 left-1/4 w-24 h-24 sm:w-40 sm:h-40 bg-gradient-to-br from-blue-400/5 to-indigo-400/5 rounded-full blur-2xl"
          variants={floatingVariants}
          animate="animate"
          transition={{ delay: 2 }}
        />
      </div>

      <div className="container mx-auto px-4 py-8 sm:py-12 lg:py-16 relative z-10">
        {/* Page Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8 sm:mb-12 lg:mb-16"
        >
          <div className="inline-flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
            <div className="p-1.5 sm:p-2 bg-gradient-to-br from-[#31CDFF]/20 to-[#272055]/20 rounded-lg sm:rounded-xl backdrop-blur-sm border border-white/20">
              <BookOpen className="h-5 w-5 sm:h-6 sm:w-6 text-[#272055] dark:text-[#31CDFF]" />
            </div>
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-[#31CDFF]" />
            </motion.div>
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-[#272055] to-[#31CDFF] text-transparent bg-clip-text mb-3 sm:mb-4 leading-tight">
            Our Blog
          </h1>
          <p className="text-sm sm:text-base lg:text-lg text-gray-600 dark:text-gray-400 max-w-xl sm:max-w-2xl mx-auto px-4">
            Discover insights, trends, and stories from our industry experts
          </p>
        </motion.div>

        {/* Latest Post */}
        <AnimatePresence mode="wait">
          {latestPost && (
            <motion.div 
              key={latestPost.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-12 sm:mb-16 lg:mb-20"
            >
              <Link href={`/blog/${latestPost.slug}`} className="group block">
                <div className="relative aspect-[4/3] sm:aspect-[16/9] w-full overflow-hidden rounded-2xl sm:rounded-3xl bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-white/20 shadow-xl sm:shadow-2xl hover:shadow-3xl transition-all duration-500 group-hover:scale-[1.01] sm:group-hover:scale-[1.02]">
                  <Image
                    src={getImageUrl(latestPost.imageUrl)}
                    alt={latestPost.title}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105 sm:group-hover:scale-110"
                    priority
                    quality={95}
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 80vw"
                    placeholder="blur"
                    blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
                    onError={handleImageError}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  
                  {/* Floating Badge */}
                  <div className="absolute top-3 sm:top-4 lg:top-6 left-3 sm:left-4 lg:left-6">
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      className="px-3 py-1.5 sm:px-4 sm:py-2 bg-gradient-to-r from-[#31CDFF] to-[#272055] text-white text-xs sm:text-sm font-semibold rounded-full shadow-lg backdrop-blur-sm border border-white/20"
                    >
                      <div className="flex items-center gap-1.5 sm:gap-2">
                        <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4" />
                        <span className="hidden sm:inline">Featured Post</span>
                        <span className="sm:hidden">Featured</span>
                      </div>
                    </motion.div>
                  </div>

                  <div className="absolute bottom-0 p-4 sm:p-6 lg:p-8 w-full">
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="space-y-3 sm:space-y-4"
                    >
                      <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-white/90">
                        {latestPost.category && (
                          <span className="px-2 py-1 sm:px-3 sm:py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs sm:text-sm font-medium text-white border border-white/20">
                            {latestPost.category}
                          </span>
                        )}
                        <div className="flex items-center gap-1 sm:gap-2">
                          <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
                          <time dateTime={latestPost.createdAt} className="text-xs sm:text-sm">
                            {new Date(latestPost.createdAt).toLocaleDateString()}
                          </time>
                        </div>
                        {latestPost.readTime && (
                          <div className="flex items-center gap-1 sm:gap-2">
                            <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
                            <span className="text-xs sm:text-sm">{latestPost.readTime}</span>
                          </div>
                        )}
                      </div>
                      <h2 className="text-lg sm:text-2xl md:text-3xl lg:text-4xl font-bold text-white leading-tight">
                        {latestPost.title}
                      </h2>
                      <p className="text-sm sm:text-base text-white/90 line-clamp-2 sm:line-clamp-3 max-w-full sm:max-w-3xl">
                        {latestPost.excerpt}
                      </p>
                    </motion.div>
                  </div>
                </div>
              </Link>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Other Posts */}
        {otherPosts.length > 0 && (
          <motion.section 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-12 sm:mb-16 lg:mb-20"
          >
            <div className="flex items-center gap-2 sm:gap-3 mb-6 sm:mb-8">
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-gray-100">
                Latest Articles
              </h2>
              <motion.div
                animate={{ x: [0, 3, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="hidden sm:block"
              >
                <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6 text-[#31CDFF]" />
              </motion.div>
            </div>
            
            <div className="grid gap-4 sm:gap-6 lg:gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {otherPosts.map((post, index) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                >
                  <BlogCard
                    id={post.id}
                    title={post.title}
                    excerpt={post.excerpt}
                    imageUrl={getImageUrl(post.imageUrl)}
                    category={post.category}
                    readTime={post.readTime}
                    slug={post.slug}
                    createdAt={post.createdAt}
                    author={post.author}
                    authorProfile={post.authorProfile}
                  />
                </motion.div>
              ))}
            </div>

            {/* Pagination Controls */}
            {data.totalPages > 1 && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="mt-8 sm:mt-12 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4"
              >
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="w-full sm:w-auto min-h-[44px] bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-white/20 hover:bg-white/90 dark:hover:bg-gray-800/90 transition-all duration-300"
                >
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  Previous
                </Button>
                
                <div className="px-3 sm:px-4 py-2 bg-gradient-to-r from-[#272055]/10 to-[#31CDFF]/10 backdrop-blur-sm rounded-lg border border-white/20">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Page {currentPage} of {data.totalPages}
                  </span>
                </div>
                
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === data.totalPages}
                  className="w-full sm:w-auto min-h-[44px] bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-white/20 hover:bg-white/90 dark:hover:bg-gray-800/90 transition-all duration-300"
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              </motion.div>
            )}
          </motion.section>
        )}

        {/* Categories */}
        {categories.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-center"
          >
            <div className="inline-flex items-center gap-2 sm:gap-3 mb-6 sm:mb-8">
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-[#272055] to-[#31CDFF] text-transparent bg-clip-text">
                Popular Categories
              </h2>
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                className="hidden sm:block"
              >
                <Sparkles className="h-5 w-5 sm:h-6 sm:w-6 text-[#31CDFF]" />
              </motion.div>
            </div>
            
            <div className="flex flex-wrap justify-center gap-2 sm:gap-3 lg:gap-4">
              {categories.map((category, index) => (
                <motion.div
                  key={category}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 * index }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link
                    href={`/blog/category/${category.toLowerCase().replace(/\s+/g, '-')}`}
                    className="inline-block px-4 py-2 sm:px-6 sm:py-3 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-white/20 hover:bg-gradient-to-r hover:from-[#31CDFF] hover:to-[#272055] hover:text-white transition-all duration-300 shadow-lg hover:shadow-xl rounded-full text-sm sm:text-base font-medium text-gray-700 dark:text-gray-300 hover:border-transparent min-h-[44px] flex items-center"
                  >
                    {category}
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.section>
        )}
      </div>
    </div>
  )
}