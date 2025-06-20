import { ReactNode } from 'react'

export default function AdminRootLayout({
  children,
}: {
  children: ReactNode
}) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full m-0 p-0 overflow-hidden">{children}</body>
    </html>
  )
}
