import crypto from 'crypto'

export async function generateEmailVerificationToken(email: string) {
  const token = crypto.randomBytes(32).toString('hex')
  const expires = new Date(Date.now() + 3600 * 1000) // 1 hour expiration
  
  // In real implementation, store token in DB associated with user email
  return { token, expires }
} 