import { MetadataRoute } from 'next'
import mongoose from 'mongoose'
import { JobPosting } from '@/models/jobPosting'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Get your base URL from environment variable
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://bqitech.com'

  try {
    await mongoose.connect(process.env.MONGODB_URI!, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000
    })

    const jobs = await JobPosting.find().lean()

    // Static routes with their update frequency and priority
    const staticRoutes = [
      {
        url: baseUrl,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: 1,
      },
      {
        url: `${baseUrl}/about`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.8,
      },
      {
        url: `${baseUrl}/services`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.8,
      },
      {
        url: `${baseUrl}/careers`,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: 0.9,
      },
      {
        url: `${baseUrl}/contact-us`,
        lastModified: new Date(),
        changeFrequency: 'monthly' as const,
        priority: 0.7,
      },
      {
        url: `${baseUrl}/about/cookie-policy`,
        lastModified: new Date(),
        changeFrequency: 'monthly' as const,
        priority: 0.5,
      },
      {
        url: `${baseUrl}/about/terms`,
        lastModified: new Date(),
        changeFrequency: 'monthly' as const,
        priority: 0.5,
      },
      {
        url: `${baseUrl}/about/expertise`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.8,
      },
      {
        url: `${baseUrl}/about/backlinks`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.8,
      },
    ]

    // Dynamic routes for job postings
    const jobRoutes = jobs.map((job) => ({
      url: `${baseUrl}/careers/jobs/${job._id}`,
      lastModified: job.postedDate,
      changeFrequency: 'daily' as const,
      priority: 0.7,
    }))

    return [...staticRoutes, ...jobRoutes]
  } catch (error) {
    console.error('Failed to generate sitemap:', error)
    return []
  } finally {
    await mongoose.disconnect()
  }
} 