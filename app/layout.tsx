import { Inter } from "next/font/google"
import type { Metadata } from "next"
import { ClientWrapper } from './ClientLayout'
import "./globals.css"
import "./clerk-overrides.css"
import { ReactNode } from 'react'
import { headers } from 'next/headers'

const inter = Inter({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
})

export async function generateMetadata(): Promise<Metadata> {
  return {
    metadataBase: new URL('https://bqitech.com'),
    title: 'Custom Software Development & IT Solutions | BQITech',
    description: 'BQITech offers custom software development, DevOps consultancy, and IT solutions for governments. Partner with top offshore software development experts today!',
    keywords: ['custom software development', 'IT solutions', 'DevOps consultancy', 'government software', 'offshore development'],
    authors: [{ name: 'BQI Tech' }],
    creator: 'BQI Tech',
    publisher: 'BQI Tech',
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
    openGraph: {
      type: 'website',
      locale: 'en_US',
      url: 'https://bqitech.com',
      siteName: 'BQITech',
      title: 'Custom Software Development & IT Solutions | BQITech',
      description: 'BQITech offers custom software development, DevOps consultancy, and IT solutions for governments. Partner with top offshore software development experts today!',
      images: [
        {
          url: '/og-image.jpg',
          width: 1200,
          height: 630,
          alt: 'BQITech - Custom Software Development & IT Solutions',
          type: 'image/jpeg',
        },
      ],
    },
    other: {
      'Content-Security-Policy': `
        default-src 'self';
        script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.clerk.accounts.dev https://*.googletagmanager.com https://accounts.google.com https://*.clerk.dev;
        style-src 'self' 'unsafe-inline';
        img-src 'self' data: https: blob:;
        font-src 'self' data:;
        connect-src 'self' 
          https://*.clerk.accounts.dev 
          https://*.clerk.dev 
          https://clerk-telemetry.com 
          https://*.googletagmanager.com 
          https://www.googletagmanager.com
          https://accounts.google.com
          ${process.env.NODE_ENV === 'development' ? 'ws://localhost:3000/_next/webpack-hmr' : ''};
        frame-src 'self' https://*.clerk.accounts.dev https://*.clerk.dev https://accounts.google.com;
        worker-src 'self' blob:;
      `.replace(/\n/g, ' ').trim()
    }
  }
}

export default function RootLayout({
  children,
}: {
  children: ReactNode
}) {
  return (
    <html lang="en" className={inter.className}>
      <head>
        <meta httpEquiv="Content-Security-Policy" content={`
          default-src 'self';
          script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.clerk.accounts.dev https://*.googletagmanager.com https://accounts.google.com https://*.clerk.dev;
          style-src 'self' 'unsafe-inline';
          img-src 'self' data: https: blob:;
          font-src 'self' data:;
          connect-src 'self' 
            https://*.clerk.accounts.dev 
            https://*.clerk.dev 
            https://clerk-telemetry.com 
            https://*.googletagmanager.com 
            https://www.googletagmanager.com
            https://accounts.google.com
            ${process.env.NODE_ENV === 'development' ? 'ws://localhost:3000/_next/webpack-hmr' : ''};
          frame-src 'self' https://*.clerk.accounts.dev https://*.clerk.dev https://accounts.google.com;
          worker-src 'self' blob:;
        `.replace(/\n/g, ' ').trim()} />
      </head>
      <body>
        <ClientWrapper>
          {children}
        </ClientWrapper>
      </body>
    </html>
  )
}

