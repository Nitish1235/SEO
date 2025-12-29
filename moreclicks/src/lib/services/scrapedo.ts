/**
 * Scrape.do API Service
 * Provides web scraping capabilities for competitor content analysis
 */

const SCRAPEDO_API_KEY = process.env.SCRAPEDO_API_KEY!
const SCRAPEDO_BASE_URL = 'https://api.scrape.do'

export interface ScrapeDoResponse {
  success: boolean
  data?: {
    url: string
    title?: string
    meta?: {
      description?: string
      keywords?: string
      ogTitle?: string
      ogDescription?: string
      ogImage?: string
      og?: Record<string, string>
      twitter?: Record<string, string>
    }
    headings?: {
      h1?: string[]
      h2?: string[]
      h3?: string[]
      h4?: string[]
      h5?: string[]
      h6?: string[]
    }
    content?: {
      text?: string
      html?: string
      wordCount?: number
      readingTime?: number
      structure?: {
        hasLists?: boolean
        hasTables?: boolean
        hasFAQ?: boolean
        listCount?: number
        tableCount?: number
      }
    }
    links?: Array<{
      url: string
      text: string
      rel?: string
    }>
    images?: Array<{
      src: string
      alt?: string
      title?: string
      width?: number | null
      height?: number | null
      hasAlt?: boolean
      altQuality?: string
    }>
    schema?: any
    language?: string
    seoAnalysis?: {
      title?: {
        length?: number
        hasKeyword?: boolean
      }
      meta?: {
        descriptionLength?: number
        hasKeyword?: boolean
      }
      images?: {
        total?: number
        withAlt?: number
        withoutAlt?: number
        altQuality?: {
          good?: number
          poor?: number
          generic?: number
          tooLong?: number
          missing?: number
        }
      }
      links?: {
        total?: number
        internal?: number
        external?: number
        anchor?: number
        withText?: number
        withoutText?: number
        nofollow?: number
      }
      headings?: {
        h1Count?: number
        h2Count?: number
        h3Count?: number
        h1Length?: number
      }
    }
  }
  error?: string
}

export class ScrapeDoService {
  /**
   * Scrape a URL and extract SEO-relevant content
   */
  static async scrapeURL(url: string, keyword?: string): Promise<ScrapeDoResponse> {
    try {
      // Scrape.do API endpoint
      const response = await fetch(`${SCRAPEDO_BASE_URL}?token=${SCRAPEDO_API_KEY}&url=${encodeURIComponent(url)}`)
      
      if (!response.ok) {
        const errorText = await response.text()
        let errorMessage = `Scrape.do API error: ${response.status}`
        
        // Try to parse error JSON for better error messages
        try {
          const errorJson = JSON.parse(errorText)
          if (errorJson.Message && Array.isArray(errorJson.Message)) {
            errorMessage = errorJson.Message.join('. ')
          } else if (errorJson.Message) {
            errorMessage = errorJson.Message
          }
        } catch {
          // If not JSON, use the raw text
          errorMessage = errorText
        }
        
        // Create error with status code for detection
        const error: any = new Error(`Scrape.do API error: ${response.status} - ${errorMessage}`)
        error.statusCode = response.status
        error.isExternalAPIError = true
        throw error
      }

      const html = await response.text()
      
      // Parse HTML to extract structured data
      // Note: In production, you might want to use a proper HTML parser like cheerio or jsdom
      // For now, we'll use regex-based extraction (simplified)
      const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i)
      const metaDescMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i)
      const h1Matches = html.match(/<h1[^>]*>([^<]+)<\/h1>/gi) || []
      const h2Matches = html.match(/<h2[^>]*>([^<]+)<\/h2>/gi) || []
      const h3Matches = html.match(/<h3[^>]*>([^<]+)<\/h3>/gi) || []
      
      // Extract text content (remove script and style tags)
      const textContent = html
        .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
        .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
      
      const wordCount = textContent.split(/\s+/).filter(w => w.length > 0).length
      const readingTime = Math.ceil(wordCount / 200) // Average reading speed: 200 words/min
      
      // Extract schema markup (JSON-LD)
      const schemaMatches = html.match(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi) || []
      const schemas = schemaMatches.map(schema => {
        try {
          const jsonMatch = schema.match(/<script[^>]*>([\s\S]*?)<\/script>/i)
          if (jsonMatch) {
            return JSON.parse(jsonMatch[1])
          }
        } catch {
          return null
        }
        return null
      }).filter(s => s !== null)
      
      // Extract Open Graph tags
      const ogTags: Record<string, string> = {}
      const ogMatches = html.match(/<meta[^>]*property=["']og:([^"']+)["'][^>]*content=["']([^"']+)["']/gi) || []
      ogMatches.forEach(og => {
        const propMatch = og.match(/property=["']og:([^"']+)["']/i)
        const contentMatch = og.match(/content=["']([^"']+)["']/i)
        if (propMatch && contentMatch) {
          ogTags[propMatch[1]] = contentMatch[1]
        }
      })
      
      // Extract Twitter Card tags
      const twitterTags: Record<string, string> = {}
      const twitterMatches = html.match(/<meta[^>]*name=["']twitter:([^"']+)["'][^>]*content=["']([^"']+)["']/gi) || []
      twitterMatches.forEach(tw => {
        const nameMatch = tw.match(/name=["']twitter:([^"']+)["']/i)
        const contentMatch = tw.match(/content=["']([^"']+)["']/i)
        if (nameMatch && contentMatch) {
          twitterTags[nameMatch[1]] = contentMatch[1]
        }
      })
      
      // Detect language
      const langMatch = html.match(/<html[^>]*lang=["']([^"']+)["']/i) || html.match(/lang=["']([^"']+)["']/i)
      const language = langMatch?.[1] || 'en'
      
      // Analyze content structure
      const hasLists = /<ul|<ol|<li/.test(html)
      const hasTables = /<table/.test(html)
      const hasFAQ = /faq|frequently asked|questions?/i.test(textContent) || /^\s*(q:|question|a:|answer)/im.test(textContent)
      const listCount = (html.match(/<li[^>]*>/gi) || []).length
      const tableCount = (html.match(/<table[^>]*>/gi) || []).length
      
      // Extract images with detailed analysis
      const imageMatches = html.match(/<img[^>]*>/gi) || []
      const images = imageMatches.map(img => {
        const srcMatch = img.match(/src=["']([^"']+)["']/i)
        const altMatch = img.match(/alt=["']([^"']+)["']/i)
        const titleMatch = img.match(/title=["']([^"']+)["']/i)
        const widthMatch = img.match(/width=["']?(\d+)["']?/i)
        const heightMatch = img.match(/height=["']?(\d+)["']?/i)
        
        const alt = altMatch?.[1] || ''
        const hasAlt = alt.length > 0
        const altQuality = hasAlt ? (
          alt.length < 5 ? 'poor' : // Too short
          alt.length > 125 ? 'too-long' : // Too long
          alt.toLowerCase() === 'image' || alt.toLowerCase() === 'img' ? 'generic' : // Generic
          'good'
        ) : 'missing'
        
        return {
          src: srcMatch?.[1] || '',
          alt: alt,
          title: titleMatch?.[1] || '',
          width: widthMatch?.[1] ? parseInt(widthMatch[1]) : null,
          height: heightMatch?.[1] ? parseInt(heightMatch[1]) : null,
          hasAlt,
          altQuality,
        }
      }).filter(img => img.src)
      
      // Extract links with detailed analysis
      const linkMatches = html.match(/<a[^>]*href=["']([^"']+)["'][^>]*>([^<]*)<\/a>/gi) || []
      const currentDomain = new URL(url).hostname
      const links = linkMatches.map(link => {
        const hrefMatch = link.match(/href=["']([^"']+)["']/i)
        const textMatch = link.match(/>([^<]+)</i)
        const relMatch = link.match(/rel=["']([^"']+)["']/i)
        const targetMatch = link.match(/target=["']([^"']+)["']/i)
        
        const linkUrl = hrefMatch?.[1] || ''
        const linkText = textMatch?.[1]?.trim() || ''
        
        let linkType: 'internal' | 'external' | 'anchor' | 'invalid' = 'invalid'
        try {
          if (linkUrl.startsWith('http')) {
            const linkDomain = new URL(linkUrl).hostname
            linkType = linkDomain === currentDomain || linkDomain.replace('www.', '') === currentDomain.replace('www.', '') 
              ? 'internal' 
              : 'external'
          } else if (linkUrl.startsWith('#')) {
            linkType = 'anchor'
          } else if (linkUrl.startsWith('/')) {
            linkType = 'internal'
          }
        } catch {
          linkType = 'invalid'
        }
        
        return {
          url: linkUrl,
          text: linkText,
          rel: relMatch?.[1] || '',
          target: targetMatch?.[1] || '',
          type: linkType,
          hasText: linkText.length > 0,
          isNofollow: (relMatch?.[1] || '').includes('nofollow'),
        }
      }).filter(link => link.url && (link.url.startsWith('http') || link.url.startsWith('/') || link.url.startsWith('#')))
      
      return {
        success: true,
        data: {
          url,
          title: titleMatch?.[1]?.trim() || '',
          meta: {
            description: metaDescMatch?.[1]?.trim() || '',
          },
          headings: {
            h1: h1Matches.map(h => h.replace(/<[^>]+>/g, '').trim()),
            h2: h2Matches.map(h => h.replace(/<[^>]+>/g, '').trim()),
            h3: h3Matches.map(h => h.replace(/<[^>]+>/g, '').trim()),
          },
          content: {
            text: textContent.substring(0, 10000), // Limit to first 10k chars
            html: html.substring(0, 50000), // Store HTML for further analysis
            wordCount,
            readingTime,
            structure: {
              hasLists,
              hasTables,
              hasFAQ,
              listCount,
              tableCount,
            },
          },
          links: links.slice(0, 100), // Limit to first 100 links
          images: images.slice(0, 50), // Limit to first 50 images
          schema: schemas.length > 0 ? schemas : undefined,
          meta: {
            description: metaDescMatch?.[1]?.trim() || '',
            og: Object.keys(ogTags).length > 0 ? ogTags : undefined,
            twitter: Object.keys(twitterTags).length > 0 ? twitterTags : undefined,
          },
          language,
          // Detailed analysis
          seoAnalysis: {
            title: {
              length: titleMatch?.[1]?.trim().length || 0,
              hasKeyword: keyword ? (titleMatch?.[1]?.toLowerCase().includes(keyword.toLowerCase()) || false) : false,
            },
            meta: {
              descriptionLength: metaDescMatch?.[1]?.trim().length || 0,
              hasKeyword: keyword ? (metaDescMatch?.[1]?.toLowerCase().includes(keyword.toLowerCase()) || false) : false,
            },
            images: {
              total: images.length,
              withAlt: images.filter(img => img.hasAlt).length,
              withoutAlt: images.filter(img => !img.hasAlt).length,
              altQuality: {
                good: images.filter(img => img.altQuality === 'good').length,
                poor: images.filter(img => img.altQuality === 'poor').length,
                generic: images.filter(img => img.altQuality === 'generic').length,
                tooLong: images.filter(img => img.altQuality === 'too-long').length,
                missing: images.filter(img => img.altQuality === 'missing').length,
              },
            },
            links: {
              total: links.length,
              internal: links.filter(l => l.type === 'internal').length,
              external: links.filter(l => l.type === 'external').length,
              anchor: links.filter(l => l.type === 'anchor').length,
              withText: links.filter(l => l.hasText).length,
              withoutText: links.filter(l => !l.hasText).length,
              nofollow: links.filter(l => l.isNofollow).length,
            },
            headings: {
              h1Count: h1Matches.length,
              h2Count: h2Matches.length,
              h3Count: h3Matches.length,
              h1Length: h1Matches.length > 0 ? h1Matches[0].replace(/<[^>]+>/g, '').trim().length : 0,
            },
          },
        },
      }
    } catch (error) {
      console.error('Scrape.do API error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  /**
   * Scrape multiple URLs in parallel (with rate limiting)
   */
  static async scrapeMultipleURLs(urls: string[]): Promise<ScrapeDoResponse[]> {
    // Process in batches of 5 to avoid rate limits
    const batchSize = 5
    const results: ScrapeDoResponse[] = []
    
    for (let i = 0; i < urls.length; i += batchSize) {
      const batch = urls.slice(i, i + batchSize)
      const batchResults = await Promise.all(
        batch.map(url => this.scrapeURL(url))
      )
      results.push(...batchResults)
      
      // Wait 1 second between batches to respect rate limits
      if (i + batchSize < urls.length) {
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
    }
    
    return results
  }

  /**
   * Extract competitor content metrics with enhanced insights
   */
  static async getCompetitorContent(url: string, keyword?: string): Promise<{
    title: string
    metaDescription: string
    h1: string[]
    wordCount: number
    headings: {
      h1: number
      h2: number
      h3: number
    }
    images: number
    links: number
    contentStrategy?: {
      hasFAQ: boolean
      hasList: boolean
      hasTable: boolean
      readingTime: number
      avgWordsPerHeading: number
      imageDensity: number // images per 1000 words
    }
    imageStrategy?: {
      totalImages: number
      imagesWithAlt: number
      imageTypes: string[] // jpg, png, svg, etc.
    }
    seoAnalysis?: {
      title?: {
        length?: number
        hasKeyword?: boolean
      }
      meta?: {
        descriptionLength?: number
        hasKeyword?: boolean
      }
      images?: {
        total?: number
        withAlt?: number
        withoutAlt?: number
        altQuality?: {
          good?: number
          poor?: number
          generic?: number
          tooLong?: number
          missing?: number
        }
      }
      links?: {
        total?: number
        internal?: number
        external?: number
        anchor?: number
        withText?: number
        withoutText?: number
        nofollow?: number
      }
      headings?: {
        h1Count?: number
        h2Count?: number
        h3Count?: number
        h1Length?: number
      }
    }
  }> {
    const result = await this.scrapeURL(url, keyword)
    
    if (!result.success || !result.data) {
      // Create a more informative error with status code if available
      const error: any = new Error(result.error || 'Failed to scrape URL')
      // Preserve status code from scrapeURL if it was a 502/503/504
      if (result.error?.includes('502') || result.error?.includes('503') || result.error?.includes('504')) {
        error.statusCode = parseInt(result.error.match(/\d{3}/)?.[0] || '502')
        error.isExternalAPIError = true
      }
      throw error
    }
    
    const wordCount = result.data.content?.wordCount || 0
    const h2Count = result.data.headings?.h2?.length || 0
    const imagesCount = result.data.images?.length || 0
    
    // Analyze content strategy
    const contentText = result.data.content?.text || ''
    const hasFAQ = /faq|frequently asked|questions?/i.test(contentText) || 
                   /^\s*(q:|question|a:|answer)/im.test(contentText)
    const hasList = /^\s*[-*•]\s/m.test(contentText) || /\d+\.\s/m.test(contentText)
    const hasTable = /<table/i.test(result.data.content?.html || '')
    const readingTime = Math.ceil(wordCount / 200)
    const avgWordsPerHeading = h2Count > 0 ? Math.round(wordCount / h2Count) : 0
    const imageDensity = wordCount > 0 ? Math.round((imagesCount / wordCount) * 1000) : 0
    
    // Analyze image strategy
    const images = result.data.images || []
    const imagesWithAlt = images.filter((img: any) => img.alt && img.alt.trim().length > 0).length
    const imageTypes = Array.from(new Set(
      images.map((img: any) => {
        const src = img.src || ''
        const ext = src.split('.').pop()?.toLowerCase() || ''
        return ['jpg', 'jpeg', 'png', 'svg', 'gif', 'webp'].includes(ext) ? ext : 'unknown'
      })
    ))
    
    return {
      title: result.data.title || '',
      metaDescription: result.data.meta?.description || '',
      h1: result.data.headings?.h1 || [],
      wordCount,
      headings: {
        h1: result.data.headings?.h1?.length || 0,
        h2: h2Count,
        h3: result.data.headings?.h3?.length || 0,
      },
      images: imagesCount,
      links: result.data.links?.length || 0,
      contentStrategy: {
        hasFAQ,
        hasList,
        hasTable,
        readingTime,
        avgWordsPerHeading,
        imageDensity,
      },
      imageStrategy: {
        totalImages: imagesCount,
        imagesWithAlt,
        imageTypes,
      },
      seoAnalysis: result.data.seoAnalysis,
    }
  }
}

