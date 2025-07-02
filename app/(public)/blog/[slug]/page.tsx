"use client"

import { useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import useSWR from 'swr'
import { Loader2, ArrowLeft, Twitter, Linkedin, Facebook, Share2, Mail, MessageSquare } from 'lucide-react'
import { Button } from '@/components/ui/button'

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

// Helper function to ensure valid image URL
const getImageUrl = (url: string) => {
  if (!url) return '/images/placeholder.jpg'
  if (url.startsWith('http')) return url
  if (url.startsWith('/')) return url
  return `/${url}`
}

// Social sharing component
const SocialShare = ({ post }: { post: BlogPost }) => {
  const currentUrl = typeof window !== 'undefined' ? window.location.href : ''
  const encodedUrl = encodeURIComponent(currentUrl)
  const encodedTitle = encodeURIComponent(post.title)
  const encodedText = encodeURIComponent(post.excerpt)

  const shareLinks = [
    {
      name: 'Twitter',
      icon: Twitter,
      url: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`,
      className: 'hover:bg-blue-400 hover:text-white'
    },
    {
      name: 'LinkedIn',
      icon: Linkedin,
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      className: 'hover:bg-blue-600 hover:text-white'
    },
    {
      name: 'Facebook',
      icon: Facebook,
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      className: 'hover:bg-blue-500 hover:text-white'
    },
    {
      name: 'WhatsApp',
      icon: MessageSquare,
      url: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
      className: 'hover:bg-green-500 hover:text-white'
    },
    {
      name: 'Email',
      icon: Mail,
      url: `mailto:?subject=${encodedTitle}&body=${encodedText}%0A%0A${encodedUrl}`,
      className: 'hover:bg-gray-600 hover:text-white'
    }
  ]

  const handleWebShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: post.title,
          text: post.excerpt,
          url: currentUrl,
        })
      } catch (error) {
        console.log('Error sharing:', error)
      }
    }
  }

  return (
    <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
      <div className="text-center">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">
          Like what you read? Share.
        </h3>
        
        <div className="flex flex-wrap justify-center gap-3 mb-6">
          {shareLinks.map((link) => {
            const IconComponent = link.icon
            return (
              <a
                key={link.name}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`p-3 rounded-full border border-gray-300 dark:border-gray-600 transition-all duration-200 ${link.className}`}
                aria-label={`Share on ${link.name}`}
              >
                <IconComponent className="h-5 w-5" />
              </a>
            )
          })}
          
          {/* Native Web Share API button for mobile */}
          {typeof window !== 'undefined' && navigator.share && (
            <button
              onClick={handleWebShare}
              className="p-3 rounded-full border border-gray-300 dark:border-gray-600 transition-all duration-200 hover:bg-gray-600 hover:text-white"
              aria-label="Share via device"
            >
              <Share2 className="h-5 w-5" />
            </button>
          )}
        </div>

        <p className="text-sm text-gray-600 dark:text-gray-400">
          Help us spread the word about this article
        </p>
      </div>
    </div>
  )
}

// Author Profile Component
const AuthorProfile = ({ post }: { post: BlogPost }) => {
  // Handle both nested authorProfile and flat format from API
  let authorData = null
  
  if (post.authorProfile && post.authorProfile.name) {
    // Use nested authorProfile format
    authorData = post.authorProfile
  } else if ((post as any).authorName) {
    // Use flat format from API response
    authorData = {
      name: (post as any).authorName,
      bio: (post as any).authorBio,
      profileImage: (post as any).authorProfileImage,
      title: (post as any).authorTitle,
      socialLinks: {
        twitter: (post as any).authorTwitter,
        linkedin: (post as any).authorLinkedin,
        github: (post as any).authorGithub,
        website: (post as any).authorWebsite,
      }
    }
  }

  if (!authorData && !post.author) {
    return null
  }

  if (!authorData) {
    // Fallback to simple author string display
    return (
      <div className="mb-8 p-6 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-gradient-to-br from-[#272055] to-[#31CDFF] rounded-full flex items-center justify-center">
            <span className="text-white font-semibold text-xl">
              {post.author.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {post.author}
            </h3>
            <p className="text-gray-600 dark:text-gray-400">Author</p>
          </div>
        </div>
      </div>
    )
  }

  const socialLinks = authorData.socialLinks || {}

  return (
    <div className="mb-8 p-6 bg-gray-50 dark:bg-gray-800 rounded-lg">
      <div className="flex flex-col sm:flex-row gap-6">
        {/* Author Image */}
        <div className="flex-shrink-0">
          <div className="w-20 h-20 relative overflow-hidden rounded-full">
            {authorData.profileImage ? (
              <Image
                src={getImageUrl(authorData.profileImage)}
                alt={authorData.name}
                fill
                className="object-cover"
                sizes="80px"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-[#272055] to-[#31CDFF] flex items-center justify-center">
                <span className="text-white font-semibold text-2xl">
                  {authorData.name.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Author Info */}
        <div className="flex-1">
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
            Author
          </p>
          <div className="mb-1">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-0">
              {authorData.name}
            </h3>
            <p className="text-[#31CDFF] font-medium text-xs">
              {authorData.title}
            </p>
          </div>
          
          <p className="text-gray-600 dark:text-gray-400 text-xs leading-relaxed mb-4">
            {authorData.bio}
          </p>

          {/* Social Links */}
          {Object.values(socialLinks).some(link => link) && (
            <div className="flex gap-3">
              {socialLinks.twitter && (
                <a
                  href={socialLinks.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-full bg-white dark:bg-gray-700 shadow-sm hover:shadow-md transition-all duration-200 hover:scale-105"
                  aria-label="Twitter"
                >
                  <Twitter className="h-4 w-4 text-blue-400" />
                </a>
              )}
              {socialLinks.linkedin && (
                <a
                  href={socialLinks.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-full bg-white dark:bg-gray-700 shadow-sm hover:shadow-md transition-all duration-200 hover:scale-105"
                  aria-label="LinkedIn"
                >
                  <Linkedin className="h-4 w-4 text-blue-600" />
                </a>
              )}
              {socialLinks.github && (
                <a
                  href={socialLinks.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-full bg-white dark:bg-gray-700 shadow-sm hover:shadow-md transition-all duration-200 hover:scale-105"
                  aria-label="GitHub"
                >
                  <svg className="h-4 w-4 text-gray-800 dark:text-gray-200" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                  </svg>
                </a>
              )}
              {socialLinks.website && (
                <a
                  href={socialLinks.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-full bg-white dark:bg-gray-700 shadow-sm hover:shadow-md transition-all duration-200 hover:scale-105"
                  aria-label="Website"
                >
                  <svg className="h-4 w-4 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                  </svg>
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
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

            {/* Author Profile */}
            <AuthorProfile post={post} />

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

          {/* Social Sharing Section */}
          <SocialShare post={post} />

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