import { CacheService, KEYWORD_CACHE_TTL } from '@/lib/utils/cache'

const DATAFORSEO_BASE_URL = 'https://api.dataforseo.com/v3'
const DATAFORSEO_LOGIN = process.env.DATAFORSEO_LOGIN!
const DATAFORSEO_PASSWORD = process.env.DATAFORSEO_PASSWORD!

const getAuthHeader = () => {
  const credentials = Buffer.from(`${DATAFORSEO_LOGIN}:${DATAFORSEO_PASSWORD}`).toString('base64')
  return `Basic ${credentials}`
}

export interface KeywordMetricsResponse {
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
      keyword: string
      location_code: number
      language_code: string
      search_volume: number
      competition: number
      competition_level: string
      cpc: number
      monthly_searches: Array<{
        year: number
        month: number
        search_volume: number
      }>
      keyword_difficulty: number
      keyword_info: {
        se_type: string
        last_updated_time: string
        competition_index: number
        cpc: number
        search_volume: number
        categories: number[]
        monthly_searches: Array<{
          year: number
          month: number
          search_volume: number
        }>
      }
    }[]
  }>
}

export interface KeywordSuggestionsResponse {
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
      keyword: string
      location_code: number
      language_code: string
      items_count: number
      items: Array<{
        keyword: string
        search_volume: number
        competition: number
        competition_level: string
        cpc: number
        monthly_searches: Array<{
          year: number
          month: number
          search_volume: number
        }>
        keyword_difficulty: number
      }>
    }[]
  }>
}

export interface RelatedKeywordsResponse {
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
      keyword: string
      location_code: number
      language_code: string
      items_count: number
      items: Array<{
        keyword: string
        search_volume: number
        competition: number
        competition_level: string
        cpc: number
        monthly_searches: Array<{
          year: number
          month: number
          search_volume: number
        }>
        keyword_difficulty: number
      }>
    }[]
  }>
}

export class DataForSEOKeywordsService {
  /**
   * Get keyword metrics (volume, difficulty, CPC, competition)
   */
  static async getMetrics(
    keywords: string[],
    location?: string,
    language?: string
  ): Promise<KeywordMetricsResponse> {
    // Check cache for each keyword
    const uncachedKeywords: string[] = []
    const cachedResults: any[] = []

    for (const keyword of keywords) {
      const cacheKey = CacheService.getKeywordKey(keyword)
      const cached = await CacheService.get<any>(cacheKey)
      if (cached) {
        cachedResults.push(cached)
      } else {
        uncachedKeywords.push(keyword)
      }
    }

    // If all keywords are cached, return combined results
    if (uncachedKeywords.length === 0) {
      return {
        version: '1.0',
        status_code: 20000,
        status_message: 'Ok.',
        time: new Date().toISOString(),
        cost: 0,
        tasks_count: 1,
        tasks_error: 0,
        tasks: [
          {
            id: 'cached',
            status_code: 20000,
            status_message: 'Ok.',
            time: new Date().toISOString(),
            cost: 0,
            result_count: cachedResults.length,
            path: [],
            data: cachedResults,
          },
        ],
      }
    }

    try {
      const response = await fetch(
        `${DATAFORSEO_BASE_URL}/dataforseo_labs/google/bulk_keyword_difficulty/live`,
        {
          method: 'POST',
          headers: {
            'Authorization': getAuthHeader(),
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(
            uncachedKeywords.map((keyword) => ({
              keyword: keyword,
              location_code: location ? parseInt(location) : 2840, // Default: United States
              language_code: language || 'en',
            }))
          ),
        }
      )

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`DataForSEO Keywords API error: ${response.status} - ${errorText}`)
      }

      const data: KeywordMetricsResponse = await response.json()

      // Cache each keyword result
      if (data.tasks?.[0]?.data) {
        for (const item of data.tasks[0].data) {
          const cacheKey = CacheService.getKeywordKey(item.keyword)
          await CacheService.set(cacheKey, item, KEYWORD_CACHE_TTL)
        }
      }

      // Combine with cached results
      if (cachedResults.length > 0) {
        data.tasks[0].data = [...cachedResults, ...(data.tasks[0].data || [])]
        data.tasks[0].result_count = data.tasks[0].data.length
      }

      return data
    } catch (error) {
      console.error('DataForSEO Keywords API error:', error)
      throw error
    }
  }

  /**
   * Get keyword suggestions (long-tail variations)
   */
  static async getSuggestions(
    keyword: string,
    location?: string,
    language?: string
  ): Promise<KeywordSuggestionsResponse> {
    try {
      const response = await fetch(
        `${DATAFORSEO_BASE_URL}/dataforseo_labs/google/keyword_suggestions/live`,
        {
          method: 'POST',
          headers: {
            'Authorization': getAuthHeader(),
            'Content-Type': 'application/json',
          },
          body: JSON.stringify([
            {
              keyword: keyword,
              location_code: location ? parseInt(location) : 2840,
              language_code: language || 'en',
              limit: 50,
            },
          ]),
        }
      )

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`DataForSEO Keywords API error: ${response.status} - ${errorText}`)
      }

      return await response.json()
    } catch (error) {
      console.error('DataForSEO Keywords Suggestions API error:', error)
      throw error
    }
  }

  /**
   * Get related keywords
   */
  static async getRelated(
    keyword: string,
    location?: string,
    language?: string
  ): Promise<RelatedKeywordsResponse> {
    try {
      const response = await fetch(
        `${DATAFORSEO_BASE_URL}/dataforseo_labs/google/related_keywords/live`,
        {
          method: 'POST',
          headers: {
            'Authorization': getAuthHeader(),
            'Content-Type': 'application/json',
          },
          body: JSON.stringify([
            {
              keyword: keyword,
              location_code: location ? parseInt(location) : 2840,
              language_code: language || 'en',
              limit: 15,
            },
          ]),
        }
      )

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`DataForSEO Keywords API error: ${response.status} - ${errorText}`)
      }

      return await response.json()
    } catch (error) {
      console.error('DataForSEO Related Keywords API error:', error)
      throw error
    }
  }
}

