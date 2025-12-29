import { CacheService, ONPAGE_CACHE_TTL } from '@/lib/utils/cache'
import type { OnPageInstantResponse } from './types'

const DATAFORSEO_BASE_URL = 'https://api.dataforseo.com/v3'
const DATAFORSEO_LOGIN = process.env.DATAFORSEO_LOGIN!
const DATAFORSEO_PASSWORD = process.env.DATAFORSEO_PASSWORD!

// Base64 encode credentials for authentication
const getAuthHeader = (): string => {
  const credentials = Buffer.from(`${DATAFORSEO_LOGIN}:${DATAFORSEO_PASSWORD}`).toString('base64')
  return `Basic ${credentials}`
}

// Re-export type for convenience
export type { OnPageInstantResponse }

export class DataForSEOOnPageService {
  /**
   * Analyze a single page instantly (no crawling)
   * Best for MVP - returns immediate results
   */
  static async analyzePageInstant(url: string): Promise<OnPageInstantResponse> {
    // Check cache first
    const cacheKey = CacheService.getOnPageKey(url)
    const cached = await CacheService.get<OnPageInstantResponse>(cacheKey)
    if (cached) {
      return cached
    }

    try {
      const response = await fetch(`${DATAFORSEO_BASE_URL}/on_page/instant_pages`, {
        method: 'POST',
        headers: {
          'Authorization': getAuthHeader(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify([
          {
            url: url,
            enable_javascript: false,
            enable_browser_rendering: false,
            enable_content_parsing: true,
            enable_browser_rendering_priority: false,
            enable_xhr: false,
            store_raw_html: false,
            custom_user_agent: '',
            browser_preset: 'desktop',
            browser_screen_width: 1920,
            browser_screen_height: 1080,
            browser_screen_scale_factor: 1,
            accept_language: '',
            accept_encoding: '',
            disable_cookie: false,
            return_malware_status: false,
            return_backlinks_info: false,
            return_redirect_chain: true,
            return_duplicate_tags: true,
            return_broken_resources: true,
            return_broken_links: true,
            return_images: true,
            return_pages: false,
            return_non_indexable: false,
            return_waterfall: false,
            return_click_depth: false,
            return_keyword_density: false,
            return_canonical_info: true,
            return_meta_info: true,
            return_content_encoding_info: true,
            return_spell_info: false,
            return_links_info: true,
            return_redirect_info: true,
            return_duplicate_content: false,
            return_historical_data: false,
          },
        ]),
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`DataForSEO API error: ${response.status} - ${errorText}`)
      }

      const data: OnPageInstantResponse = await response.json()

      // Cache the result
      await CacheService.set(cacheKey, data, ONPAGE_CACHE_TTL)

      return data
    } catch (error) {
      console.error('DataForSEO On-Page API error:', error)
      throw error
    }
  }
}

