"use client"

import { SettingsProvider } from "@/contexts/SettingsContext"
import { JsonLd } from '@/components/JsonLd'
import ClientLayout from "@/components/ClientLayout"
import Script from 'next/script'

export default function ClientWrapper({ children }: { children: React.ReactNode }) {
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
        <ClientLayout>
          {children}
        </ClientLayout>
      </SettingsProvider>
      <JsonLd />
    </>
  )
} 