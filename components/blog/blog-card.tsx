"use client"

import Image from 'next/image'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Calendar, Clock, User } from 'lucide-react'
import { AuthorProfile } from '@/types/blog'

interface BlogCardProps {
  id: string
  title: string
  excerpt: string
  imageUrl: string
  category: string
  readTime: string
  slug: string
  createdAt: string
  author?: string | AuthorProfile
  authorProfile?: AuthorProfile
}

// Enhanced image error handler
const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
  const target = e.target as HTMLImageElement
  console.warn('Image failed to load:', target.src)
  target.src = '/images/placeholder.jpg'
}

// Enhanced image URL validation
const getOptimizedImageUrl = (url: string) => {
  if (!url) return '/images/placeholder.jpg'
  
  // For external URLs, ensure they're properly formatted
  if (url.startsWith('http')) {
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

export function BlogCard({
  id,
  title,
  excerpt,
  imageUrl,
  category,
  readTime,
  slug,
  createdAt,
  author,
  authorProfile
}: BlogCardProps) {
  // Determine author info to display
  const authorInfo = authorProfile || (typeof author === 'object' ? author : null)
  const authorName = authorInfo?.name || (typeof author === 'string' ? author : 'Anonymous')
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <Card className="group overflow-hidden border-0 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-white/20">
      <Link href={`/blog/${slug}`} className="block">
        <div className="relative aspect-[4/3] sm:aspect-video overflow-hidden">
          <Image
            src={getOptimizedImageUrl(imageUrl)}
            alt={title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            quality={90}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            placeholder="blur"
            blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
            onError={handleImageError}
            loading="lazy"
          />
          <div className="absolute top-3 sm:top-4 left-3 sm:left-4">
            <Badge variant="secondary" className="bg-white/90 text-gray-900 hover:bg-white backdrop-blur-sm border border-white/20 text-xs sm:text-sm px-2 py-1 sm:px-3 sm:py-1">
              {category}
            </Badge>
          </div>
        </div>
      </Link>
      
      <CardContent className="p-4 sm:p-6">
        <Link href={`/blog/${slug}`} className="block mb-3 sm:mb-4">
          <h3 className="text-lg sm:text-xl font-bold line-clamp-2 group-hover:text-[#31CDFF] transition-colors duration-200 leading-tight min-h-[44px] flex items-center">
            {title}
          </h3>
        </Link>
        
        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 mb-4 sm:mb-6 line-clamp-3 leading-relaxed">
          {excerpt}
        </p>
        
        {/* Author Profile Section */}
        <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4 pb-3 sm:pb-4 border-b border-gray-100 dark:border-gray-800">
          {authorInfo?.profileImage ? (
            <div className="relative w-8 h-8 sm:w-10 sm:h-10 rounded-full overflow-hidden flex-shrink-0 ring-1 sm:ring-2 ring-white/20">
              <Image
                src={getOptimizedImageUrl(authorInfo.profileImage)}
                alt={authorInfo.name}
                fill
                className="object-cover"
                quality={85}
                sizes="(max-width: 640px) 32px, 40px"
                placeholder="blur"
                blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
                onError={handleImageError}
                loading="lazy"
              />
            </div>
          ) : (
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 flex items-center justify-center flex-shrink-0 ring-1 sm:ring-2 ring-white/20">
              <User className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />
            </div>
          )}
          
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm sm:text-base text-gray-900 dark:text-gray-100 truncate">
              {authorName}
            </p>
            {authorInfo?.title && (
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 truncate">
                {authorInfo.title}
              </p>
            )}
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="flex items-center gap-1 sm:gap-1.5">
              <Calendar className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
              <span className="truncate">{formatDate(createdAt)}</span>
            </div>
            <div className="flex items-center gap-1 sm:gap-1.5">
              <Clock className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
              <span className="truncate">{readTime}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 