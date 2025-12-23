import { Redis } from '@upstash/redis'

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

// Cache TTL constants
export const SERP_CACHE_TTL = 3600 // 1 hour
export const KEYWORD_CACHE_TTL = 86400 // 24 hours
export const ONPAGE_CACHE_TTL = 3600 // 1 hour

export class CacheService {
  /**
   * Get cached data by key
   */
  static async get<T>(key: string): Promise<T | null> {
    try {
      const data = await redis.get<T>(key)
      return data
    } catch (error) {
      console.error('Cache get error:', error)
      return null
    }
  }

  /**
   * Set cached data with TTL
   */
  static async set(key: string, value: any, ttl: number): Promise<void> {
    try {
      await redis.set(key, value, { ex: ttl })
    } catch (error) {
      console.error('Cache set error:', error)
    }
  }

  /**
   * Delete cached data
   */
  static async delete(key: string): Promise<void> {
    try {
      await redis.del(key)
    } catch (error) {
      console.error('Cache delete error:', error)
    }
  }

  /**
   * Generate cache key for SERP results
   */
  static getSERPKey(keyword: string, location?: string): string {
    return `serp:${keyword}:${location || 'global'}`
  }

  /**
   * Generate cache key for keyword metrics
   */
  static getKeywordKey(keyword: string): string {
    return `keyword:${keyword}`
  }

  /**
   * Generate cache key for On-Page analysis
   */
  static getOnPageKey(url: string): string {
    return `onpage:${url}`
  }
}

