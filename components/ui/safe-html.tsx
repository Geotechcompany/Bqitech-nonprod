'use client'

import DOMPurify from 'dompurify'

interface SafeHtmlProps {
  html: string
  className?: string
}

export function SafeHtml({ html, className }: SafeHtmlProps) {
  // Pre-process HTML to handle entities
  const processedHtml = html?.replace(/&nbsp;/g, ' ') || ''
  
  const sanitizedHtml = DOMPurify.sanitize(processedHtml, {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'],
    ALLOWED_ATTR: ['class']
  })
  
  return (
    <div 
      className={className}
      dangerouslySetInnerHTML={{ __html: sanitizedHtml }} 
    />
  )
}
