import Link from 'next/link'
import { ChevronRight } from 'lucide-react'

interface BreadcrumbItem {
  label: string
  href?: string
}

interface BreadcrumbProps {
  items: BreadcrumbItem[]
}

export function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav className="flex items-center space-x-2 text-sm mb-8">
      <Link 
        href="/" 
        className="text-gray-500 hover:text-[#31CDFF] transition-colors"
      >
        Home
      </Link>
      {items.map((item, index) => (
        <div key={item.label} className="flex items-center space-x-2">
          <ChevronRight className="w-4 h-4 text-gray-400" />
          {item.href ? (
            <Link
              href={item.href}
              className="text-gray-500 hover:text-[#31CDFF] transition-colors"
            >
              {item.label}
            </Link>
          ) : (
            <span className="text-[#31CDFF] font-medium">{item.label}</span>
          )}
        </div>
      ))}
    </nav>
  )
} 