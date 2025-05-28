import crypto from 'crypto'

export function generateEmailVerificationToken() {
  // Add validation for crypto availability
  if (!crypto || !crypto.randomInt) {
    throw new Error('Crypto module not available')
  }
  
  // Ensure numeric token generation
  const token = crypto.randomInt(0, 999999).toString().padStart(6, '0')
  const expires = new Date(Date.now() + 3600000) // 1 hour
  
  // In real implementation, store token in DB associated with user email
  return { token, expires }
} 