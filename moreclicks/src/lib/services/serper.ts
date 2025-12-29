/**
 * Serper.dev API Service
 * Provides SERP results and ranking data
 */

const SERPER_API_KEY = process.env.SERPER_API_KEY!
const SERPER_BASE_URL = 'https://google.serper.dev'

export interface SerperSERPResponse {
  searchParameters: {
    q: string
    type: string
    engine: string
    gl?: string
    hl?: string
    num?: number
  }
  organic: Array<{
    title: string
    link: string
    snippet: string
    position: number
    date?: string
    sitelinks?: Array<{
      title: string
      link: string
    }>
  }>
  peopleAlsoAsk?: Array<{
    question: string
    snippet: string
    title: string
    link: string
  }>
  relatedSearches?: Array<{
    query: string
  }>
  answerBox?: {
    title: string
    answer: string
    link?: string
    date?: string
  }
  knowledgeGraph?: {
    title: string
    type: string
    website?: string
    description?: string
    attributes?: Record<string, any>
  }
  topStories?: Array<{
    title: string
    link: string
    source: string
    date: string
    snippet: string
  }>
  shopping?: Array<{
    title: string
    price: string
    link: string
    source: string
    rating?: number
    reviews?: number
  }>
}

export class SerperService {
  /**
   * Get SERP results for a keyword
   */
  static async getSERP(
    keyword: string,
    options?: {
      location?: string // e.g., "us", "uk"
      language?: string // e.g., "en"
      num?: number // Number of results (default: 10, max: 100)
    }
  ): Promise<SerperSERPResponse> {
    try {
      const response = await fetch(`${SERPER_BASE_URL}/search`, {
        method: 'POST',
        headers: {
          'X-API-KEY': SERPER_API_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          q: keyword,
          gl: options?.location || 'us',
          hl: options?.language || 'en',
          num: options?.num || 10,
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Serper.dev API error: ${response.status} - ${errorText}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Serper.dev API error:', error)
      throw error
    }
  }

  /**
   * Get top 10 rankings for a keyword
   */
  static async getTop10Rankings(keyword: string, location?: string): Promise<Array<{
    position: number
    title: string
    url: string
    snippet: string
  }>> {
    const serp = await this.getSERP(keyword, { location, num: 10 })
    
    return (serp.organic || []).map((result, index) => ({
      position: result.position || index + 1,
      title: result.title,
      url: result.link,
      snippet: result.snippet,
    }))
  }

  /**
   * Check if a URL ranks for a keyword
   */
  static async checkRanking(keyword: string, url: string, location?: string): Promise<{
    ranking: number | null
    title?: string
    snippet?: string
  }> {
    const serp = await this.getSERP(keyword, { location, num: 100 })
    
    const domain = new URL(url).hostname.replace('www.', '')
    
    for (const result of serp.organic || []) {
      const resultDomain = new URL(result.link).hostname.replace('www.', '')
      if (resultDomain === domain || result.link === url) {
        return {
          ranking: result.position || null,
          title: result.title,
          snippet: result.snippet,
        }
      }
    }
    
    return { ranking: null }
  }
}

