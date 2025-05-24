"use client"

import { usePathname } from 'next/navigation'

interface JsonLdProps {
  organizationData?: boolean
  websiteData?: boolean
  pageData?: boolean
}

export function JsonLd({ organizationData = true, websiteData = true, pageData = true }: JsonLdProps) {
  const pathname = usePathname()
  const baseUrl = 'https://bqitech.com'

  const organization = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'BQI Tech',
    url: baseUrl,
    logo: `${baseUrl}/bqilogo.png`,
    sameAs: [
      'https://www.linkedin.com/company/bqi-technologies',
      // Add other social media URLs
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+254-11-229-5287',
      contactType: 'customer service',
      email: 'info@bqitech.com',
      areaServed: 'KE',
      availableLanguage: ['en']
    }
  }

  const website = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'BQI Tech',
    url: baseUrl,
  }

  const page = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'BQI Tech',
    description: 'BQI Tech provides innovative solutions across industries to improve quality of life worldwide.',
    url: `${baseUrl}${pathname}`,
  }

  const partnership = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: 'BQI Tech Partnership Program',
    provider: {
      '@type': 'Organization',
      name: 'BQI Tech'
    },
    description: 'Technology partnership program for government digital transformation solutions.',
    url: `${baseUrl}/about/backlinks`,
    areaServed: {
      '@type': 'Country',
      name: 'Kenya'
    }
  }

  return (
    <>
      {organizationData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organization) }}
        />
      )}
      {websiteData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(website) }}
        />
      )}
      {pageData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(page) }}
        />
      )}
      {pathname === '/about/backlinks' && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(partnership) }}
        />
      )}
    </>
  )
} 