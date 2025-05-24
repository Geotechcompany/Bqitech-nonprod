"use client"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { ReactQueryDevtools } from "@tanstack/react-query-devtools"
import { ClerkProvider } from '@clerk/nextjs'
import { Toaster } from 'react-hot-toast'
import { SettingsProvider } from "@/contexts/SettingsContext"
import { JsonLd } from '@/components/JsonLd'
import ClientLayout from "@/components/ClientLayout"
import { CookieConsentBanner } from '@/components/CookieConsentBanner'
import Script from 'next/script'
import Image from 'next/image'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
      refetchOnWindowFocus: false,
    },
  },
})

export function ClientWrapper({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
      />
      <Script
        id="google-analytics"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}');
          `,
        }}
      />
      <SettingsProvider>
        <QueryClientProvider client={queryClient}>
          <ClerkProvider>
            <ClientLayout>
              {children}
            </ClientLayout>
            <CookieConsentBanner />
          </ClerkProvider>
          <Toaster position="top-right" />
          <ReactQueryDevtools initialIsOpen={false} />
          <JsonLd />
        </QueryClientProvider>
      </SettingsProvider>
      <Image 
        src="/bqilogo-light.png"
        alt="BQI Tech Logo"
        width={150}
        height={50}
        priority
      />
    </>
  )
} 