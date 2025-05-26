"use client";
import { Inter } from "next/font/google"
import { ClientWrapper } from './ClientLayout'
import "./globals.css"
import { ReactNode } from 'react'
import { SessionProvider } from "next-auth/react"
import { metadata } from './metadata'
import { usePathname } from 'next/navigation'

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
    <SessionProvider>
      <html lang="en" className={inter.className}>
        <head>
          <meta httpEquiv="Content-Security-Policy" content={metadata.other?.['Content-Security-Policy'] as string} />
        </head>
        <body>
          <ClientWrapper>
            {children}
          </ClientWrapper>
        </body>
      </html>
    </SessionProvider>
  )
}

