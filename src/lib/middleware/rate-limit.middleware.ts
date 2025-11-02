// Simple in-memory rate limiter for auth endpoints
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()

/**
 * Simple rate limiter for auth endpoints
 */
export function rateLimit(identifier: string, limit: number = 5, windowMs: number = 15 * 60 * 1000): boolean {
  const now = Date.now()
  const key = identifier
  const current = rateLimitMap.get(key)
  
  if (!current || now > current.resetTime) {
    rateLimitMap.set(key, { count: 1, resetTime: now + windowMs })
    return true
  }
  
  if (current.count >= limit) {
    return false
  }
  
  current.count++
  return true
}

/**
 * Clean up expired entries periodically
 */
setInterval(() => {
  const now = Date.now()
  const keys = Array.from(rateLimitMap.keys())
  keys.forEach((key) => {
    const value = rateLimitMap.get(key)
    if (value && now > value.resetTime) {
      rateLimitMap.delete(key)
    }
  })
}, 60 * 1000) // Clean up every minute