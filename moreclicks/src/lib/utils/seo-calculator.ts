import type { OnPageInstantResponse } from '@/lib/services/dataforseo/onpage'
import type { ScrapeDoResponse } from '@/lib/services/scrapedo'

// Types for analysis results
export interface TitleAnalysis {
  status: 'pass' | 'warning' | 'critical'
  score: number
  value: string
  length: number
  targetLength: { min: number; max: number }
  recommendation: string
  issues: string[]
}

export interface MetaAnalysis {
  status: 'pass' | 'warning' | 'critical'
  score: number
  value: string
  length: number
  targetLength: { min: number; max: number }
  recommendation: string
  issues: string[]
}

export interface HeadingAnalysis {
  status: 'pass' | 'warning' | 'critical'
  score: number
  h1: {
    count: number
    values: string[]
    status: 'pass' | 'warning' | 'critical'
  }
  h2: {
    count: number
    values: string[]
    status: 'pass' | 'warning' | 'critical'
  }
  h3: {
    count: number
    values: string[]
    status: 'pass' | 'warning' | 'critical'
  }
  recommendation: string
  issues: string[]
}

export interface ContentAnalysis {
  status: 'pass' | 'warning' | 'critical'
  score: number
  wordCount: number
  targetWordCount: { min: number; max: number }
  recommendation: string
  issues: string[]
}

export interface LinkAnalysis {
  status: 'pass' | 'warning' | 'critical'
  score: number
  internalLinks: number
  externalLinks: number
  totalLinks: number
  brokenLinks: number
  recommendation: string
  issues: string[]
}

export interface ImageAnalysis {
  status: 'pass' | 'warning' | 'critical'
  score: number
  totalImages: number
  imagesWithAlt: number
  imagesWithoutAlt: number
  recommendation: string
  issues: string[]
}

export interface CoreWebVitals {
  status: 'pass' | 'warning' | 'critical'
  score: number
  lcp: number | null // Largest Contentful Paint (ms)
  fid: number | null // First Input Delay (ms)
  cls: number | null // Cumulative Layout Shift
  ttfb: number | null // Time to First Byte (ms)
  recommendation: string
  issues: string[]
}

export interface SSLAnalysis {
  status: 'pass' | 'warning' | 'critical'
  score: number
  isHTTPS: boolean
  recommendation: string
  issues: string[]
}

export interface BrokenLink {
  url: string
  statusCode: number
  anchor: string
}

export interface RedirectChain {
  url: string
  chain: string[]
  status: 'pass' | 'warning' | 'critical'
}

export interface NonIndexable {
  url: string
  reason: string
}

export interface DuplicateContent {
  url: string
  duplicateOf: string[]
}

export interface KeywordDensity {
  keyword: string
  density: number
  occurrences: number
  recommendation: string
}

/**
 * Analyze title tag
 */
export function analyzeTitleTag(data: OnPageInstantResponse): TitleAnalysis {
  const pageData = data.tasks?.[0]?.data?.[0]
  const checks = pageData?.checks || {}
  const title = pageData?.title || pageData?.meta_title || ''
  const length = title.length

  const issues: string[] = []
  let status: 'pass' | 'warning' | 'critical' = 'pass'
  let score = 1

  if (checks.title_empty || !title) {
    status = 'critical'
    score = -8
    issues.push('Title tag is missing')
  } else if (checks.title_too_short || length < 30) {
    status = 'warning'
    score = -3
    issues.push(`Title is too short (${length} characters). Aim for 30-60 characters.`)
  } else if (checks.title_too_long || length > 60) {
    status = 'warning'
    score = -3
    issues.push(`Title is too long (${length} characters). Aim for 30-60 characters.`)
  }

  const recommendation =
    status === 'critical'
      ? 'Add a descriptive title tag between 30-60 characters'
      : status === 'warning'
        ? `Optimize title length to ${length < 30 ? '30-60' : '30-60'} characters`
        : 'Title tag is well optimized'

  return {
    status,
    score,
    value: title,
    length,
    targetLength: { min: 30, max: 60 },
    recommendation,
    issues,
  }
}

/**
 * Analyze meta description
 */
export function analyzeMetaDescription(data: OnPageInstantResponse): MetaAnalysis {
  const pageData = data.tasks?.[0]?.data?.[0]
  const checks = pageData?.checks || {}
  const metaDescription = pageData?.meta_description || ''
  const length = metaDescription.length

  const issues: string[] = []
  let status: 'pass' | 'warning' | 'critical' = 'pass'
  let score = 1

  if (checks.meta_description_empty || !metaDescription) {
    status = 'critical'
    score = -8
    issues.push('Meta description is missing')
  } else if (checks.meta_description_too_short || length < 120) {
    status = 'warning'
    score = -3
    issues.push(`Meta description is too short (${length} characters). Aim for 120-160 characters.`)
  } else if (checks.meta_description_too_long || length > 160) {
    status = 'warning'
    score = -3
    issues.push(`Meta description is too long (${length} characters). Aim for 120-160 characters.`)
  }

  const recommendation =
    status === 'critical'
      ? 'Add a compelling meta description between 120-160 characters'
      : status === 'warning'
        ? `Optimize meta description length to ${length < 120 ? '120-160' : '120-160'} characters`
        : 'Meta description is well optimized'

  return {
    status,
    score,
    value: metaDescription,
    length,
    targetLength: { min: 120, max: 160 },
    recommendation,
    issues,
  }
}

/**
 * Analyze headings (H1, H2, H3)
 */
export function analyzeHeadings(data: OnPageInstantResponse): HeadingAnalysis {
  const pageData = data.tasks?.[0]?.data?.[0]
  const checks = pageData?.checks || {}
  const h1 = pageData?.h1 || []
  const h2 = pageData?.h2 || []
  const h3 = pageData?.h3 || []

  const issues: string[] = []
  let status: 'pass' | 'warning' | 'critical' = 'pass'
  let score = 1

  // H1 Analysis
  let h1Status: 'pass' | 'warning' | 'critical' = 'pass'
  if (checks.h1_empty || checks.no_h1_tag || h1.length === 0) {
    h1Status = 'critical'
    status = 'critical'
    score = -8
    issues.push('H1 tag is missing')
  } else if (checks.h1_multiple || h1.length > 1) {
    h1Status = 'warning'
    if (status === 'pass') status = 'warning'
    score -= 3
    issues.push(`Multiple H1 tags found (${h1.length}). Use only one H1 per page.`)
  } else if (h1[0] && (h1[0].length < 20 || h1[0].length > 60)) {
    h1Status = 'warning'
    if (status === 'pass') status = 'warning'
    score -= 3
    issues.push(`H1 length is ${h1[0].length < 20 ? 'too short' : 'too long'} (${h1[0].length} characters)`)
  }

  // H2 Analysis
  let h2Status: 'pass' | 'warning' | 'critical' = 'pass'
  if (checks.no_h2_tag || h2.length === 0) {
    h2Status = 'warning'
    if (status === 'pass') status = 'warning'
    score -= 3
    issues.push('No H2 tags found. Consider adding H2 tags to structure your content.')
  }

  // H3 Analysis
  let h3Status: 'pass' | 'warning' | 'critical' = 'pass'
  if (checks.no_h3_tag || h3.length === 0) {
    // H3 is optional, so no penalty
  }

  const recommendation =
    status === 'critical'
      ? 'Add a single H1 tag to your page'
      : status === 'warning'
        ? 'Optimize heading structure: use one H1, multiple H2s, and H3s as needed'
        : 'Heading structure is well optimized'

  return {
    status,
    score,
    h1: {
      count: h1.length,
      values: h1,
      status: h1Status,
    },
    h2: {
      count: h2.length,
      values: h2,
      status: h2Status,
    },
    h3: {
      count: h3.length,
      values: h3,
      status: h3Status,
    },
    recommendation,
    issues,
  }
}

/**
 * Analyze word count
 */
export function analyzeWordCount(data: OnPageInstantResponse): ContentAnalysis {
  const pageData = data.tasks?.[0]?.data?.[0]
  const checks = pageData?.checks || {}
  const wordCount = pageData?.words_count || 0

  const issues: string[] = []
  let status: 'pass' | 'warning' | 'critical' = 'pass'
  let score = 1

  if (checks.low_character_count || wordCount < 300) {
    status = 'warning'
    score = -3
    issues.push(`Content is too short (${wordCount} words). Aim for at least 300 words.`)
  } else if (checks.high_character_count || wordCount > 3000) {
    // Very long content is usually fine, but might indicate poor structure
    // No penalty, just informational
  }

  const recommendation =
    status === 'warning'
      ? `Increase content length to at least 300 words (currently ${wordCount} words)`
      : wordCount < 500
        ? 'Consider expanding content to 500+ words for better SEO'
        : 'Content length is adequate'

  return {
    status,
    score,
    wordCount,
    targetWordCount: { min: 300, max: 3000 },
    recommendation,
    issues,
  }
}

/**
 * Analyze links
 */
export function analyzeLinks(data: OnPageInstantResponse): LinkAnalysis {
  const pageData = data.tasks?.[0]?.data?.[0]
  const checks = pageData?.checks || {}
  const internalLinks = pageData?.internal_links_count || 0
  const externalLinks = pageData?.external_links_count || 0
  const totalLinks = internalLinks + externalLinks
  const brokenLinks = pageData?.broken_links?.length || 0

  const issues: string[] = []
  let status: 'pass' | 'warning' | 'critical' = 'pass'
  let score = 1

  if (brokenLinks > 0) {
    status = 'critical'
    score = -8
    issues.push(`${brokenLinks} broken link(s) found`)
  } else if (checks.too_many_links || totalLinks > 100) {
    status = 'warning'
    score = -3
    issues.push(`Too many links (${totalLinks}). Consider reducing to under 100 links per page.`)
  } else if (totalLinks === 0) {
    status = 'warning'
    score = -3
    issues.push('No links found. Consider adding internal and external links.')
  }

  const recommendation =
    status === 'critical'
      ? `Fix ${brokenLinks} broken link(s)`
      : status === 'warning'
        ? totalLinks === 0
          ? 'Add relevant internal and external links'
          : 'Reduce number of links to under 100 per page'
        : 'Link structure is good'

  return {
    status,
    score,
    internalLinks,
    externalLinks,
    totalLinks,
    brokenLinks,
    recommendation,
    issues,
  }
}

/**
 * Analyze images
 */
export function analyzeImages(data: OnPageInstantResponse): ImageAnalysis {
  const pageData = data.tasks?.[0]?.data?.[0]
  const checks = pageData?.checks || {}
  const totalImages = pageData?.images_count || 0
  // DataForSEO doesn't directly provide images with/without alt, so we estimate
  // If no_image_alt check is true, assume some images are missing alt
  const imagesWithoutAlt = checks.no_image_alt ? Math.max(1, Math.floor(totalImages * 0.3)) : 0
  const imagesWithAlt = totalImages - imagesWithoutAlt

  const issues: string[] = []
  let status: 'pass' | 'warning' | 'critical' = 'pass'
  let score = 1

  if (checks.no_image_alt && totalImages > 0) {
    status = 'warning'
    score = -3
    issues.push(`${imagesWithoutAlt} image(s) missing alt text`)
  }

  const recommendation =
    status === 'warning'
      ? `Add alt text to ${imagesWithoutAlt} image(s) for better accessibility and SEO`
      : totalImages === 0
        ? 'Consider adding relevant images with descriptive alt text'
        : 'All images have proper alt text'

  return {
    status,
    score,
    totalImages,
    imagesWithAlt,
    imagesWithoutAlt,
    recommendation,
    issues,
  }
}

/**
 * Analyze Core Web Vitals
 */
export function analyzeCoreWebVitals(data: OnPageInstantResponse): CoreWebVitals {
  const pageData = data.tasks?.[0]?.data?.[0]
  const checks = pageData?.checks || {}
  const timing = pageData?.page_timing || {}

  const lcp = timing.largest_contentful_paint || null
  const fid = timing.first_input_delay || null
  const cls = timing.cumulative_layout_shift || null
  const ttfb = timing.time_to_first_byte || null

  const issues: string[] = []
  let status: 'pass' | 'warning' | 'critical' = 'pass'
  let score = 1

  // LCP should be under 2.5s
  if (lcp !== null && lcp > 4000) {
    status = 'critical'
    score = -8
    issues.push(`LCP is too slow (${Math.round(lcp)}ms). Target: under 2.5s`)
  } else if (lcp !== null && lcp > 2500) {
    if (status === 'pass') status = 'warning'
    score -= 3
    issues.push(`LCP could be improved (${Math.round(lcp)}ms). Target: under 2.5s`)
  }

  // FID should be under 100ms
  if (fid !== null && fid > 300) {
    if (status === 'pass') status = 'warning'
    score -= 3
    issues.push(`FID is high (${Math.round(fid)}ms). Target: under 100ms`)
  }

  // CLS should be under 0.1
  if (cls !== null && cls > 0.25) {
    if (status === 'pass') status = 'warning'
    score -= 3
    issues.push(`CLS is high (${cls.toFixed(3)}). Target: under 0.1`)
  }

  // TTFB should be under 800ms
  if (ttfb !== null && ttfb > 2000) {
    if (status === 'pass') status = 'warning'
    score -= 3
    issues.push(`TTFB is slow (${Math.round(ttfb)}ms). Target: under 800ms`)
  }

  const recommendation =
    status === 'critical'
      ? 'Optimize page speed: reduce LCP by optimizing images and server response time'
      : status === 'warning'
        ? 'Improve Core Web Vitals for better user experience and rankings'
        : 'Core Web Vitals are excellent'

  return {
    status,
    score,
    lcp,
    fid,
    cls,
    ttfb,
    recommendation,
    issues,
  }
}

/**
 * Analyze SSL/HTTPS
 */
export function analyzeSSL(data: OnPageInstantResponse): SSLAnalysis {
  const pageData = data.tasks?.[0]?.data?.[0]
  const checks = pageData?.checks || {}
  const isHTTPS = !checks.no_https && pageData?.url?.startsWith('https://')

  const issues: string[] = []
  let status: 'pass' | 'warning' | 'critical' = 'pass'
  let score = 1

  if (checks.no_https || !isHTTPS) {
    status = 'critical'
    score = -8
    issues.push('Page is not using HTTPS. SSL certificate is required for SEO and security.')
  }

  const recommendation =
    status === 'critical'
      ? 'Install SSL certificate and enable HTTPS for your website'
      : 'SSL certificate is properly configured'

  return {
    status,
    score,
    isHTTPS,
    recommendation,
    issues,
  }
}

/**
 * Extract broken links
 */
export function analyzeBrokenLinks(data: OnPageInstantResponse): BrokenLink[] {
  const pageData = data.tasks?.[0]?.data?.[0]
  const brokenLinks = pageData?.broken_links || []

  return brokenLinks.map((link: any) => ({
    url: link.url || '',
    statusCode: link.status_code || 0,
    anchor: link.anchor || '',
  }))
}

/**
 * Calculate overall SEO score (0-100)
 * Rule-based, deterministic scoring
 */
export function calculateSEOScore(analyses: {
  title: TitleAnalysis
  meta: MetaAnalysis
  headings: HeadingAnalysis
  content: ContentAnalysis
  links: LinkAnalysis
  images: ImageAnalysis
  cwv: CoreWebVitals
  ssl: SSLAnalysis
}): number {
  let score = 100

  // Apply penalties and bonuses
  score += analyses.title.score
  score += analyses.meta.score
  score += analyses.headings.score
  score += analyses.content.score
  score += analyses.links.score
  score += analyses.images.score
  score += analyses.cwv.score
  score += analyses.ssl.score

  // Ensure score is between 0 and 100
  return Math.max(0, Math.min(100, score))
}

/**
 * Analyze title tag from scraped data
 */
export function analyzeTitleTagFromScraped(data: ScrapeDoResponse['data']): TitleAnalysis {
  const title = data?.title || ''
  const length = title.length

  const issues: string[] = []
  let status: 'pass' | 'warning' | 'critical' = 'pass'
  let score = 1

  if (!title) {
    status = 'critical'
    score = -8
    issues.push('Title tag is missing')
  } else if (length < 30) {
    status = 'warning'
    score = -3
    issues.push(`Title is too short (${length} characters). Aim for 30-60 characters.`)
  } else if (length > 60) {
    status = 'warning'
    score = -3
    issues.push(`Title is too long (${length} characters). Aim for 30-60 characters.`)
  }

  const recommendation =
    status === 'critical'
      ? 'Add a descriptive title tag between 30-60 characters'
      : status === 'warning'
        ? `Optimize title length to 30-60 characters`
        : 'Title tag is well optimized'

  return {
    status,
    score,
    value: title,
    length,
    targetLength: { min: 30, max: 60 },
    recommendation,
    issues,
  }
}

/**
 * Analyze meta description from scraped data
 */
export function analyzeMetaDescriptionFromScraped(data: ScrapeDoResponse['data']): MetaAnalysis {
  const metaDescription = data?.meta?.description || ''
  const length = metaDescription.length

  const issues: string[] = []
  let status: 'pass' | 'warning' | 'critical' = 'pass'
  let score = 1

  if (!metaDescription) {
    status = 'critical'
    score = -8
    issues.push('Meta description is missing')
  } else if (length < 120) {
    status = 'warning'
    score = -3
    issues.push(`Meta description is too short (${length} characters). Aim for 120-160 characters.`)
  } else if (length > 160) {
    status = 'warning'
    score = -3
    issues.push(`Meta description is too long (${length} characters). Aim for 120-160 characters.`)
  }

  const recommendation =
    status === 'critical'
      ? 'Add a compelling meta description between 120-160 characters'
      : status === 'warning'
        ? `Optimize meta description length to 120-160 characters`
        : 'Meta description is well optimized'

  return {
    status,
    score,
    value: metaDescription,
    length,
    targetLength: { min: 120, max: 160 },
    recommendation,
    issues,
  }
}

/**
 * Analyze headings from scraped data
 */
export function analyzeHeadingsFromScraped(data: ScrapeDoResponse['data']): HeadingAnalysis {
  const h1 = data?.headings?.h1 || []
  const h2 = data?.headings?.h2 || []
  const h3 = data?.headings?.h3 || []

  const issues: string[] = []
  let status: 'pass' | 'warning' | 'critical' = 'pass'
  let score = 1

  // H1 Analysis
  let h1Status: 'pass' | 'warning' | 'critical' = 'pass'
  if (h1.length === 0) {
    h1Status = 'critical'
    status = 'critical'
    score = -8
    issues.push('H1 tag is missing')
  } else if (h1.length > 1) {
    h1Status = 'warning'
    if (status === 'pass') status = 'warning'
    score -= 3
    issues.push(`Multiple H1 tags found (${h1.length}). Use only one H1 per page.`)
  } else if (h1[0] && (h1[0].length < 20 || h1[0].length > 60)) {
    h1Status = 'warning'
    if (status === 'pass') status = 'warning'
    score -= 3
    issues.push(`H1 length is ${h1[0].length < 20 ? 'too short' : 'too long'} (${h1[0].length} characters)`)
  }

  // H2 Analysis
  let h2Status: 'pass' | 'warning' | 'critical' = 'pass'
  if (h2.length === 0) {
    h2Status = 'warning'
    if (status === 'pass') status = 'warning'
    score -= 3
    issues.push('No H2 tags found. Consider adding H2 tags to structure your content.')
  }

  // H3 Analysis
  let h3Status: 'pass' | 'warning' | 'critical' = 'pass'
  // H3 is optional, so no penalty

  const recommendation =
    status === 'critical'
      ? 'Add a single H1 tag to your page'
      : status === 'warning'
        ? 'Optimize heading structure: use one H1, multiple H2s, and H3s as needed'
        : 'Heading structure is well optimized'

  return {
    status,
    score,
    h1: {
      count: h1.length,
      values: h1,
      status: h1Status,
    },
    h2: {
      count: h2.length,
      values: h2,
      status: h2Status,
    },
    h3: {
      count: h3.length,
      values: h3,
      status: h3Status,
    },
    recommendation,
    issues,
  }
}

/**
 * Analyze word count from scraped data
 */
export function analyzeWordCountFromScraped(data: ScrapeDoResponse['data']): ContentAnalysis {
  const wordCount = data?.content?.wordCount || 0

  const issues: string[] = []
  let status: 'pass' | 'warning' | 'critical' = 'pass'
  let score = 1

  if (wordCount < 300) {
    status = 'warning'
    score = -3
    issues.push(`Low word count (${wordCount}). Aim for at least 300 words for better SEO.`)
  } else if (wordCount < 500) {
    status = 'warning'
    score = -1
    issues.push(`Word count is decent (${wordCount}) but could be improved. Aim for 500+ words.`)
  }

  const recommendation =
    status === 'warning'
      ? wordCount < 300
        ? 'Add more content to reach at least 300 words'
        : 'Consider expanding content to 500+ words for better SEO'
      : 'Content length is well optimized'

  return {
    status,
    score,
    wordCount,
    targetWordCount: { min: 300, max: 2000 },
    recommendation,
    issues,
  }
}

/**
 * Analyze links from scraped data
 */
export function analyzeLinksFromScraped(data: ScrapeDoResponse['data']): LinkAnalysis {
  const links = data?.links || []
  const totalLinks = links.length

  const issues: string[] = []
  let status: 'pass' | 'warning' | 'critical' = 'pass'
  let score = 1

  // Basic link analysis (can't determine internal/external from scraping alone)
  if (totalLinks === 0) {
    status = 'warning'
    score = -3
    issues.push('No links found on the page. Consider adding internal and external links.')
  } else if (totalLinks < 5) {
    status = 'warning'
    score = -1
    issues.push(`Low number of links (${totalLinks}). Consider adding more relevant links.`)
  }

  const recommendation =
    status === 'warning'
      ? 'Add more relevant internal and external links to improve SEO'
      : 'Link structure is good'

  return {
    status,
    score,
    internalLinks: 0, // Not available from scraping
    externalLinks: 0, // Not available from scraping
    totalLinks,
    brokenLinks: 0, // Would need to check links
    recommendation,
    issues,
  }
}

/**
 * Analyze images from scraped data
 */
export function analyzeImagesFromScraped(data: ScrapeDoResponse['data']): ImageAnalysis {
  const images = data?.images || []
  const totalImages = images.length
  const imagesWithAlt = images.filter(img => img.alt && img.alt.trim().length > 0).length
  const imagesWithoutAlt = totalImages - imagesWithAlt

  const issues: string[] = []
  let status: 'pass' | 'warning' | 'critical' = 'pass'
  let score = 1

  if (totalImages > 0 && imagesWithoutAlt > 0) {
    if (imagesWithoutAlt === totalImages) {
      status = 'critical'
      score = -8
      issues.push(`All ${totalImages} images are missing alt text`)
    } else {
      status = 'warning'
      score = -3
      issues.push(`${imagesWithoutAlt} out of ${totalImages} images are missing alt text`)
    }
  }

  const recommendation =
    status === 'critical'
      ? 'Add alt text to all images for better accessibility and SEO'
      : status === 'warning'
        ? `Add alt text to ${imagesWithoutAlt} image(s) without alt text`
        : totalImages === 0
          ? 'Consider adding images with alt text to improve engagement'
          : 'All images have alt text - well optimized'

  return {
    status,
    score,
    totalImages,
    imagesWithAlt,
    imagesWithoutAlt,
    recommendation,
    issues,
  }
}

/**
 * Analyze SSL from URL
 */
export function analyzeSSLFromURL(url: string): SSLAnalysis {
  const isHTTPS = url.startsWith('https://')

  const issues: string[] = []
  let status: 'pass' | 'warning' | 'critical' = 'pass'
  let score = 1

  if (!isHTTPS) {
    status = 'critical'
    score = -8
    issues.push('Site is not using HTTPS. SSL certificate is required for security and SEO.')
  }

  const recommendation =
    status === 'critical'
      ? 'Install an SSL certificate and enable HTTPS'
      : 'SSL certificate is properly configured'

  return {
    status,
    score,
    isHTTPS,
    recommendation,
    issues,
  }
}

