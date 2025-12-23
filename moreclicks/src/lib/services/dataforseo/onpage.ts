import { CacheService, ONPAGE_CACHE_TTL } from '@/lib/utils/cache'

const DATAFORSEO_BASE_URL = 'https://api.dataforseo.com/v3'
const DATAFORSEO_LOGIN = process.env.DATAFORSEO_LOGIN!
const DATAFORSEO_PASSWORD = process.env.DATAFORSEO_PASSWORD!

// Base64 encode credentials for authentication
const getAuthHeader = () => {
  const credentials = Buffer.from(`${DATAFORSEO_LOGIN}:${DATAFORSEO_PASSWORD}`).toString('base64')
  return `Basic ${credentials}`
}

export interface OnPageInstantResponse {
  version: string
  status_code: number
  status_message: string
  time: string
  cost: number
  tasks_count: number
  tasks_error: number
  tasks: Array<{
    id: string
    status_code: number
    status_message: string
    time: string
    cost: number
    result_count: number
    path: string[]
    data: Array<{
      url: string
      resource_type: string
      status_code: number
      location: string
      url_main: string
      canonical: string
      internal_links_count: number
      external_links_count: number
      images_count: number
      words_count: number
      title: string
      meta_description: string
      meta_keywords: string
      h1: string[]
      h2: string[]
      h3: string[]
      meta_title: string
      meta_h1: string
      page_timing: {
        time_to_interactive: number
        dom_complete: number
        largest_contentful_paint: number
        first_input_delay: number
        cumulative_layout_shift: number
        time_to_first_byte: number
        download_time: number
        connection_time: number
        dns_time: number
      }
      broken_links: Array<{
        url: string
        status_code: number
        anchor: string
      }>
      broken_resources: Array<{
        url: string
        status_code: number
        resource_type: string
      }>
      duplicate_tags: Array<{
        tag: string
        pages: string[]
      }>
      onpage_score: number
      checks: {
        title_too_long: boolean
        title_too_short: boolean
        title_empty: boolean
        meta_description_too_long: boolean
        meta_description_too_short: boolean
        meta_description_empty: boolean
        h1_too_long: boolean
        h1_too_short: boolean
        h1_empty: boolean
        h1_multiple: boolean
        no_doctype: boolean
        no_html_tag: boolean
        no_title_tag: boolean
        no_meta_description: boolean
        no_h1_tag: boolean
        no_https: boolean
        low_content_rate: boolean
        high_content_rate: boolean
        small_page_size: boolean
        large_page_size: boolean
        low_character_count: boolean
        high_character_count: boolean
        no_encoding: boolean
        no_favicon: boolean
        no_image_alt: boolean
        no_image_title: boolean
        flash: boolean
        no_structured_data: boolean
        https_to_http_links: boolean
        http_to_https_links: boolean
        too_many_links: boolean
        redirect_loop: boolean
        is_redirect: boolean
        is_broken: boolean
        is_4xx_code: boolean
        is_5xx_code: boolean
        is_main_resource_4xx: boolean
        is_main_resource_5xx: boolean
        too_long_resource: boolean
        too_slow_resource: boolean
        too_large_resource: boolean
        is_redirected_to_main_url: boolean
        canonical: boolean
        duplicate_meta_tags: boolean
        duplicate_title_tag: boolean
        no_h2_tag: boolean
        no_h3_tag: boolean
        deprecated_html_tags: boolean
        duplicate_title: boolean
        duplicate_description: boolean
        duplicate_content: boolean
        click_depth: boolean
        no_encoding_meta_tag: boolean
        high_waiting_time: boolean
        high_download_time: boolean
        high_time_to_interactive: boolean
        high_dom_complete: boolean
        high_largest_contentful_paint: boolean
        high_cumulative_layout_shift: boolean
        high_first_input_delay: boolean
        high_time_to_first_byte: boolean
        low_character_count: boolean
        high_character_count: boolean
        low_content_rate: boolean
        high_content_rate: boolean
        small_page_size: boolean
        large_page_size: boolean
        no_doctype: boolean
        no_html_tag: boolean
        no_title_tag: boolean
        no_meta_description: boolean
        no_h1_tag: boolean
        no_https: boolean
        no_encoding: boolean
        no_favicon: boolean
        no_image_alt: boolean
        no_image_title: boolean
        flash: boolean
        no_structured_data: boolean
        https_to_http_links: boolean
        http_to_https_links: boolean
        too_many_links: boolean
        redirect_loop: boolean
        is_redirect: boolean
        is_broken: boolean
        is_4xx_code: boolean
        is_5xx_code: boolean
        is_main_resource_4xx: boolean
        is_main_resource_5xx: boolean
        too_long_resource: boolean
        too_slow_resource: boolean
        too_large_resource: boolean
        is_redirected_to_main_url: boolean
        canonical: boolean
        duplicate_meta_tags: boolean
        duplicate_title_tag: boolean
        no_h2_tag: boolean
        no_h3_tag: boolean
        deprecated_html_tags: boolean
        duplicate_title: boolean
        duplicate_description: boolean
        duplicate_content: boolean
        click_depth: boolean
        no_encoding_meta_tag: boolean
        high_waiting_time: boolean
        high_download_time: boolean
        high_time_to_interactive: boolean
        high_dom_complete: boolean
        high_largest_contentful_paint: boolean
        high_cumulative_layout_shift: boolean
        high_first_input_delay: boolean
        high_time_to_first_byte: boolean
      }
    }[]
  }>
}

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

