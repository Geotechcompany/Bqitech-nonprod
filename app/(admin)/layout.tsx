import { ReactNode } from 'react'

export default function AdminRootLayout({
  children,
}: {
  children: ReactNode
}) {
  return (
    <div className="h-screen w-screen m-0 p-0 overflow-hidden" data-admin-layout>
      {children}
    </div>
  )
}
