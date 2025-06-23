"use client";
import { Inter } from "next/font/google"
import ClientWrapper from './ClientWrapper'
import "./globals.css"
import { ReactNode } from 'react'
import { metadata } from './metadata'
import { usePathname } from 'next/navigation'
import { Toaster } from "react-hot-toast"
import { Toaster as SonnerToaster } from 'sonner'
import { Providers } from './providers'

const inter = Inter({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
})

export default function RootLayout({
  children,
}: {
  children: ReactNode
}) {
  return (
    <html lang="en" className={inter.className} suppressHydrationWarning>
      <head>
        <link 
          rel="preload" 
          href="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX" 
          as="script"
        />
        <meta name="color-scheme" content="light dark" />
      </head>
      <body suppressHydrationWarning>
        <Providers>
          <ClientWrapper>
            {children}
          </ClientWrapper>
          <Toaster />
        </Providers>
      </body>
    </html>
  )
}

