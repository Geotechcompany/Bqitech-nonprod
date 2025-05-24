import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Blog & Insights | BQI Tech',
  description: 'Stay updated with the latest insights, trends and news in government technology, digital transformation and IT solutions from BQI Tech.',
  keywords: ['tech blog', 'IT insights', 'digital transformation news', 'government tech updates'],
  alternates: {
    canonical: 'https://bqitech.com/blog'
  }
}

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
} 