import { CacheService } from './cache'

const RATE_LIMIT_WINDOW = 60 // 1 minute in seconds
const MAX_REQUESTS_PER_WINDOW = 2000 // DataForSEO limit: 2000 requests/minute

export class RateLimiter {
  /**
   * Check if request is within rate limit
   * Returns true if allowed, false if rate limited
   */
  static async checkRateLimit(identifier: string): Promise<boolean> {
    const key = `rate_limit:${identifier}`
    const current = await CacheService.get<number>(key)

    if (!current) {
      await CacheService.set(key, 1, RATE_LIMIT_WINDOW)
      return true
    }

    if (current >= MAX_REQUESTS_PER_WINDOW) {
      return false
    }

    await CacheService.set(key, current + 1, RATE_LIMIT_WINDOW)
    return true
  }

  /**
   * Get remaining requests in current window
   */
  static async getRemainingRequests(identifier: string): Promise<number> {
    const key = `rate_limit:${identifier}`
    const current = await CacheService.get<number>(key) || 0
    return Math.max(0, MAX_REQUESTS_PER_WINDOW - current)
  }
}

