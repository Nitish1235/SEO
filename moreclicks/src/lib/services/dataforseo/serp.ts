import { CacheService, SERP_CACHE_TTL } from '@/lib/utils/cache'

const DATAFORSEO_BASE_URL = 'https://api.dataforseo.com/v3'
const DATAFORSEO_LOGIN = process.env.DATAFORSEO_LOGIN!
const DATAFORSEO_PASSWORD = process.env.DATAFORSEO_PASSWORD!

const getAuthHeader = () => {
  const credentials = Buffer.from(`${DATAFORSEO_LOGIN}:${DATAFORSEO_PASSWORD}`).toString('base64')
  return `Basic ${credentials}`
}

export interface SERPOrganicResponse {
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
    data: {
      api: string
      function: string
      se: string
      se_type: string
      location_code: number
      language_code: string
      keyword: string
      device: string
      os: string
      check_url: string
      datetime: string
      items_count: number
      items: Array<{
        type: string
        rank_group: number
        rank_absolute: number
        position: string
        xpath: string
        domain: string
        title: string
        url: string
        breadcrumb: string
        website_name: string
        is_featured_snippet: boolean
        featured_snippet_type: string
        featured_snippet_rank_group: number
        featured_snippet_rank_absolute: number
        description: string
        description_rows: string[]
        links: Array<{
          type: string
          title: string
          description: string
          url: string
        }>
        is_paid: boolean
        is_amp: boolean
        is_video: boolean
        is_image: boolean
        is_featured: boolean
        is_malicious: boolean
        is_web_story: boolean
        about_this_result: {
          source: string
          source_info: string
          source_url: string
          source_url_platform: string
          language: string
          location: string
          spell: {
            keyword: string
            type: string
          }
        }
        rectangle: {
          x: number
          y: number
          width: number
          height: number
        }
      }>
      serp_info: {
        se_results_count: number
        last_updated_time: string
        previous_updated_time: string
      }
      total_count: number
      search_parameters: {
        se_type: string
        location_name: string
        language_name: string
        check_url: string
        device: string
        os: string
      }
      search_info: {
        people_also_ask: Array<{
          type: string
          title: string
          expanded_element: string
          answer_text: string
          answer_source: string
          answer_url: string
          answer_source_url: string
          related_items: Array<{
            type: string
            title: string
            expanded_element: string
            answer_text: string
            answer_source: string
            answer_url: string
            answer_source_url: string
          }>
        }>
        related_searches: Array<{
          type: string
          title: string
          url: string
        }>
        knowledge_graph: {
          type: string
          title: string
          subtitle: string
          description: string
          url: string
          images: Array<{
            type: string
            url: string
          }>
          social_links: Array<{
            type: string
            title: string
            url: string
          }>
          facts: Array<{
            type: string
            title: string
            value: string
          }>
        }
      }
    }[]
  }>
}

export class DataForSEOSERPService {
  /**
   * Get organic search results for a keyword
   * Returns top 100 ranking URLs, PAA, featured snippets, related searches
   */
  static async getOrganic(
    keyword: string,
    location?: string,
    language?: string
  ): Promise<SERPOrganicResponse> {
    // Check cache first
    const cacheKey = CacheService.getSERPKey(keyword, location)
    const cached = await CacheService.get<SERPOrganicResponse>(cacheKey)
    if (cached) {
      return cached
    }

    try {
      const response = await fetch(`${DATAFORSEO_BASE_URL}/serp/google/organic/live/advanced`, {
        method: 'POST',
        headers: {
          'Authorization': getAuthHeader(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify([
          {
            keyword: keyword,
            location_code: location ? parseInt(location) : 2840, // Default: United States
            language_code: language || 'en',
            device: 'desktop',
            os: 'windows',
            depth: 100, // Get top 100 results
            calculate_rectangles: true,
            browser_screen_width: 1920,
            browser_screen_height: 1080,
            browser_screen_scale_factor: 1,
            search_param: '',
            tag: '',
            postback_url: '',
            postback_data: '',
            pingback_url: '',
          },
        ]),
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`DataForSEO SERP API error: ${response.status} - ${errorText}`)
      }

      const data: SERPOrganicResponse = await response.json()

      // Cache the result
      await CacheService.set(cacheKey, data, SERP_CACHE_TTL)

      return data
    } catch (error) {
      console.error('DataForSEO SERP API error:', error)
      throw error
    }
  }

  /**
   * Extract People Also Ask questions from SERP response
   */
  static extractPAA(response: SERPOrganicResponse): Array<{
    question: string
    answer: string
    answerUrl: string
  }> {
    const paa: Array<{ question: string; answer: string; answerUrl: string }> = []
    const serpData = response.tasks?.[0]?.data as any

    if (serpData?.search_info?.people_also_ask) {
      for (const item of serpData.search_info.people_also_ask) {
        paa.push({
          question: item.title || '',
          answer: item.answer_text || '',
          answerUrl: item.answer_url || '',
        })
      }
    }

    return paa
  }

  /**
   * Extract featured snippet from SERP response
   */
  static extractFeaturedSnippet(response: SERPOrganicResponse): {
    title: string
    description: string
    url: string
    type: string
  } | null {
    const serpData = response.tasks?.[0]?.data as any
    const items = serpData?.items || []
    const featured = items.find((item: any) => item.is_featured_snippet)

    if (featured) {
      return {
        title: featured.title || '',
        description: featured.description || '',
        url: featured.url || '',
        type: featured.featured_snippet_type || '',
      }
    }

    return null
  }

  /**
   * Extract related searches from SERP response
   */
  static extractRelatedSearches(response: SERPOrganicResponse): Array<{
    query: string
    url: string
  }> {
    const related: Array<{ query: string; url: string }> = []
    const serpData = response.tasks?.[0]?.data as any

    if (serpData?.search_info?.related_searches) {
      for (const item of serpData.search_info.related_searches) {
        related.push({
          query: item.title || '',
          url: item.url || '',
        })
      }
    }

    return related
  }
}

