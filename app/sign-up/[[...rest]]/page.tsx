"use client"

import SignupWrapper from '../SignupWrapper'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'

export default function SignupPage() {
  return (
    <div className="relative min-h-screen">
      <div className="absolute top-4 left-4 z-50">
        <Link
          href="/"
          className="flex items-center text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back to Home
        </Link>
      </div>
      <SignupWrapper />
    </div>
  )
}