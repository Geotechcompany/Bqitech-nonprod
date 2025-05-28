"use client";
import { Inter } from "next/font/google"
import { ClientWrapper } from './ClientLayout'
import "./globals.css"
import { ReactNode } from 'react'
import { SessionProvider } from "next-auth/react"
import { metadata } from './metadata'
import { usePathname } from 'next/navigation'
import { Toaster } from "react-hot-toast"

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
          <link 
            rel="preload" 
            href="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX" 
            as="script"
          />
        </head>
        <body>
          <ClientWrapper>
            {children}
          </ClientWrapper>
          <Toaster
            position="top-center"
            toastOptions={{
              style: {
                background: '#fff',
                color: '#374151',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
              }
            }}
          />
        </body>
      </html>
    </SessionProvider>
  )
}

