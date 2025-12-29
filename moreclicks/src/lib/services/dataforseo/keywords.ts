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
      // Use bulk_keyword_difficulty and historical_search_volume endpoints
      // These are the standard endpoints that provide comprehensive keyword data
      const difficultyRequest = fetch(
        `${DATAFORSEO_BASE_URL}/dataforseo_labs/google/bulk_keyword_difficulty/live`,
        {
          method: 'POST',
          headers: {
            'Authorization': getAuthHeader(),
            'Content-Type': 'application/json',
          },
          body: JSON.stringify([
            {
              keywords: uncachedKeywords,
              location_code: location ? parseInt(location) : 2840,
              language_code: language || 'en',
            },
          ]),
        }
      )

      const volumeRequest = fetch(
        `${DATAFORSEO_BASE_URL}/dataforseo_labs/google/historical_search_volume/live`,
        {
          method: 'POST',
          headers: {
            'Authorization': getAuthHeader(),
            'Content-Type': 'application/json',
          },
          body: JSON.stringify([
            {
              keywords: uncachedKeywords,
              location_code: location ? parseInt(location) : 2840,
              language_code: language || 'en',
            },
          ]),
        }
      )

      // Execute in parallel
      const [difficultyResponse, volumeResponse] = await Promise.all([
        difficultyRequest,
        volumeRequest,
      ])

      // Parse responses - handle different response structures
      let difficultyItems: any[] = []
      if (difficultyResponse.ok) {
        try {
          const data = await difficultyResponse.json()
          console.log('DataForSEO Difficulty Response:', JSON.stringify(data, null, 2))
          
          const task = data.tasks?.[0]
          if (task) {
            if (task.result?.[0]?.items) {
              difficultyItems = task.result[0].items
            } else if (Array.isArray(task.data)) {
              difficultyItems = task.data
            } else if (task.result?.[0]?.data) {
              difficultyItems = Array.isArray(task.result[0].data) ? task.result[0].data : [task.result[0].data]
            }
          }
          console.log('Extracted difficulty items:', difficultyItems.length)
        } catch (e) {
          console.error('Error parsing difficulty response:', e)
        }
      } else {
        const errorText = await difficultyResponse.text()
        console.error('DataForSEO Difficulty API error:', difficultyResponse.status, errorText)
      }

      // Parse volume response as fallback
      let volumeItems: any[] = []
      if (volumeResponse.ok) {
        try {
          const data = await volumeResponse.json()
          console.log('DataForSEO Volume Response:', JSON.stringify(data, null, 2))
          
          const task = data.tasks?.[0]
          if (task) {
            if (task.result?.[0]?.items) {
              volumeItems = task.result[0].items
            } else if (Array.isArray(task.data)) {
              volumeItems = task.data
            } else if (task.result?.[0]?.data) {
              volumeItems = Array.isArray(task.result[0].data) ? task.result[0].data : [task.result[0].data]
            }
          }
          console.log('Extracted volume items:', volumeItems.length)
        } catch (e) {
          console.error('Error parsing volume response:', e)
        }
      } else {
        const errorText = await volumeResponse.text()
        console.error('DataForSEO Volume API error:', volumeResponse.status, errorText)
      }

      // Merge results from difficulty and volume endpoints
      const mergedResults = uncachedKeywords.map((keyword) => {
        const difficultyData = difficultyItems.find((i) => i.keyword === keyword)
        const volumeData = volumeItems.find((i) => i.keyword === keyword)
        
        // Volume data might be directly in volumeData or in volumeData.keyword_info
        const info = volumeData?.keyword_info || volumeData
        
        // Extract values with multiple fallbacks
        const searchVolume = volumeData?.search_volume ?? 
                            info?.search_volume ?? 
                            (volumeData?.keyword_info?.search_volume !== undefined ? volumeData.keyword_info.search_volume : null) ??
                            0
        
        const cpc = volumeData?.cpc ?? 
                   info?.cpc ?? 
                   (volumeData?.keyword_info?.cpc !== undefined ? volumeData.keyword_info.cpc : null) ??
                   0
        
        const competitionIndex = volumeData?.competition_index ?? 
                               info?.competition_index ??
                               (volumeData?.keyword_info?.competition_index !== undefined ? volumeData.keyword_info.competition_index : null)
        
        const competitionLevel = volumeData?.competition_level ?? 
                               info?.competition_level ??
                               (volumeData?.keyword_info?.competition_level !== undefined ? volumeData.keyword_info.competition_level : null)
        
        // Get keyword difficulty
        const keywordDifficulty = difficultyData?.keyword_difficulty ?? 
                                 (difficultyData?.keyword_info?.keyword_difficulty !== undefined ? difficultyData.keyword_info.keyword_difficulty : null) ??
                                 0
        
        // Calculate competition (0-1 scale for frontend)
        let competition = 0
        if (competitionIndex !== undefined && competitionIndex !== null && competitionIndex > 0) {
          // competition_index is usually 0-100, convert to 0-1
          competition = competitionIndex / 100
        } else if (competitionLevel) {
          const level = competitionLevel.toUpperCase()
          competition = level === 'HIGH' ? 0.8 : level === 'MEDIUM' ? 0.5 : level === 'LOW' ? 0.2 : 0
        }

        console.log(`Merging data for keyword "${keyword}":`, {
          difficultyData: difficultyData ? { 
            keyword_difficulty: difficultyData.keyword_difficulty,
            has_keyword_info: !!difficultyData.keyword_info,
          } : null,
          volumeData: volumeData ? { 
            search_volume: volumeData.search_volume,
            cpc: volumeData.cpc,
            competition_level: volumeData.competition_level,
            competition_index: volumeData.competition_index,
            has_keyword_info: !!volumeData.keyword_info,
            keyword_info: volumeData.keyword_info ? {
              search_volume: volumeData.keyword_info.search_volume,
              cpc: volumeData.keyword_info.cpc,
              competition_index: volumeData.keyword_info.competition_index,
            } : null,
          } : null,
          final: {
            search_volume: searchVolume,
            cpc: cpc,
            keyword_difficulty: keywordDifficulty,
            competition_level: competitionLevel,
            competition_index: competitionIndex,
            competition: competition,
          },
        })

        return {
          api: 'dataforseo_labs',
          function: 'bulk_keyword_difficulty',
          keyword,
          location_code: location ? parseInt(location) : 2840,
          language_code: language || 'en',
          keyword_difficulty: keywordDifficulty,
          search_volume: searchVolume,
          cpc: cpc,
          competition: competition,
          competition_level: competitionLevel || 'LOW',
          monthly_searches: volumeData?.monthly_searches ?? 
                          info?.monthly_searches ?? 
                          volumeData?.keyword_info?.monthly_searches ?? 
                          [],
          keyword_info: {
            se_type: 'google',
            last_updated_time: volumeData?.keyword_info?.last_updated_time ?? 
                              difficultyData?.keyword_info?.last_updated_time ?? 
                              new Date().toISOString(),
            competition_index: competitionIndex ?? 0,
            cpc: cpc,
            search_volume: searchVolume,
            categories: volumeData?.keyword_info?.categories ?? 
                       difficultyData?.keyword_info?.categories ?? 
                       [],
            monthly_searches: volumeData?.monthly_searches ?? 
                            info?.monthly_searches ?? 
                            volumeData?.keyword_info?.monthly_searches ?? 
                            [],
          },
        }
      })

      // Cache merged results
      for (const item of mergedResults) {
        const cacheKey = CacheService.getKeywordKey(item.keyword)
        await CacheService.set(cacheKey, item, KEYWORD_CACHE_TTL)
      }

      // Combine with previously cached results
      let combinedItems = mergedResults
      if (cachedResults.length > 0) {
        combinedItems = [...cachedResults, ...mergedResults]
      }

      return {
        version: '1.0',
        status_code: 20000,
        status_message: 'Ok.',
        time: '0',
        cost: 0,
        tasks_count: 1,
        tasks_error: 0,
        tasks: [
          {
            id: 'combined',
            status_code: 20000,
            status_message: 'Ok.',
            time: '0',
            cost: 0,
            result_count: combinedItems.length,
            path: [],
            data: combinedItems,
          },
        ],
      }
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

