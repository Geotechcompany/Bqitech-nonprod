import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About BQI Tech | Leading Software Development & IT Solutions Firm',
  description: 'Learn about BQI Tech, a leading software development firm specializing in government IT solutions, cloud computing, and digital transformation.',
  keywords: ['software development', 'IT solutions', 'government technology', 'cloud computing', 'digital transformation'],
  openGraph: {
    title: 'About BQI Tech | Leading Software Development & IT Solutions Firm',
    description: 'Learn about BQI Tech, a leading software development firm specializing in government IT solutions, cloud computing, and digital transformation.',
    type: 'website',
    url: 'https://bqitech.com/about',
    siteName: 'BQI Tech',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'BQI Tech - Leading Software Development & IT Solutions',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'About BQI Tech | Leading Software Development & IT Solutions Firm',
    description: 'Learn about BQI Tech, a leading software development firm specializing in government IT solutions, cloud computing, and digital transformation.',
    images: ['/og-image.jpg'],
  },
  alternates: {
    canonical: 'https://bqitech.com/about'
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-snippet': -1,
      'max-image-preview': 'large',
      'max-video-preview': -1
    },
  },
}; 