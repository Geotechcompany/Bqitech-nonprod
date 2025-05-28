import crypto from 'crypto'

export function generateEmailVerificationToken() {
  // Generate 6-digit numeric code
  const token = crypto.randomInt(100000, 999999).toString()
  const expires = new Date(Date.now() + 3600000) // 1 hour expiration
  
  // In real implementation, store token in DB associated with user email
  return { token, expires }
} 