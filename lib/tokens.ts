import crypto from 'crypto'

export function generateEmailVerificationToken() {
  // Generate 6-digit numeric code
  const token = Math.floor(100000 + Math.random() * 900000).toString()
  const expires = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes expiration
  
  // In real implementation, store token in DB associated with user email
  return { token, expires }
} 