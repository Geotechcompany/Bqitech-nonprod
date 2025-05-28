import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'
import 'server-only'  // Prevent client-side usage

// Runtime validation
if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
  throw new Error('Missing Upstash Redis configuration')
}

export const rateLimit = new Ratelimit({
  redis: new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  }),
  limiter: Ratelimit.slidingWindow(3, '1 m'),
  analytics: true
})