import { Metadata } from "next"

export const metadata: Metadata = {
  metadataBase: new URL('https://bqitech.com'),
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
  }
}