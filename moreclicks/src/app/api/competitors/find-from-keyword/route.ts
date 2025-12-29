import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { SerperService } from '@/lib/services/serper'
import { ScrapeDoService } from '@/lib/services/scrapedo'
import { ClaudeService } from '@/lib/services/claude'
import { keywordSchema } from '@/lib/utils/validators'

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user and subscription
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { subscription: true },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Check subscription limits
    if (user.subscription) {
      if (user.subscription.competitorsUsed >= user.subscription.competitorsLimit) {
        return NextResponse.json(
          { error: 'Competitor analysis limit reached. Please upgrade your plan.' },
          { status: 403 }
        )
      }
    } else {
      // Free tier: 0 competitor analyses - only count completed analyses
      const freeCompetitors = await prisma.competitorAnalysis.count({
        where: {
          userId: user.id,
          status: 'completed'
        },
      })
      if (freeCompetitors >= 0) {
        return NextResponse.json(
          { error: 'Competitor analysis is not available on the free tier. Please subscribe to continue.' },
          { status: 403 }
        )
      }
    }

    // Parse and validate request
    const body = await request.json()
    const validation = keywordSchema.safeParse(body.keyword)
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: validation.error.issues },
        { status: 400 }
      )
    }

    const { keyword, userUrl } = body

    if (!userUrl) {
      return NextResponse.json({ error: 'User URL is required' }, { status: 400 })
    }

    // Create competitor analysis record
    const competitorAnalysis = await prisma.competitorAnalysis.create({
      data: {
        userId: user.id,
        userUrl,
        userDomain: new URL(userUrl).hostname,
        method: 'keyword',
        sourceKeyword: keyword,
        competitors: {},
        comparison: {},
      },
    })

    try {
      // Get SERP results using Serper.dev
      const serperResults = await SerperService.getSERP(keyword, { num: 10 })

      // Extract competitor URLs (excluding user's URL and non-useful domains)
      const userDomain = new URL(userUrl).hostname.replace('www.', '')
      
      // Domains to exclude (social media, forums, wikis, etc.)
      const excludedDomains = [
        'reddit.com', 'redd.it',
        'wikipedia.org', 'wikimedia.org',
        'twitter.com', 'x.com',
        'facebook.com', 'fb.com',
        'instagram.com',
        'linkedin.com',
        'youtube.com', 'youtu.be',
        'pinterest.com',
        'tumblr.com',
        'medium.com',
        'quora.com',
        'stackoverflow.com', 'stackexchange.com',
        'github.com',
        'blogspot.com', 'blogger.com',
        'wordpress.com',
        'tiktok.com',
        'snapchat.com',
        'discord.com',
        'telegram.org',
      ]
      
      const competitorUrls = (serperResults.organic || [])
        .filter((item: any) => {
          try {
            const domain = new URL(item.link).hostname.replace('www.', '').toLowerCase()
            const baseDomain = domain.split('.').slice(-2).join('.') // Get base domain (e.g., 'reddit.com' from 'old.reddit.com')
            
            // Exclude user's domain
            if (domain === userDomain || baseDomain === userDomain.split('.').slice(-2).join('.')) {
              return false
            }
            
            // Exclude social media and non-useful domains
            if (excludedDomains.some(excluded => domain.includes(excluded) || baseDomain === excluded)) {
              return false
            }
            
            return true
          } catch {
            return false
          }
        })
        .map((item: any) => item.link)
        .slice(0, 5)

      // Analyze user's page using Scrape.do - handle errors gracefully
      let userScrapedData: any = null
      try {
        userScrapedData = await ScrapeDoService.getCompetitorContent(userUrl, keyword)
      } catch (scrapeError: any) {
        console.error('Failed to scrape user URL:', userUrl, scrapeError)
        // If scraping fails, we can't complete the analysis - don't charge user
        await prisma.competitorAnalysis.update({
          where: { id: competitorAnalysis.id },
          data: {
            status: 'failed',
            competitors: {},
            comparison: {},
          },
        })
        return NextResponse.json(
          { 
            error: 'Failed to analyze your website. The website may be unreachable or blocking requests. Please try again later.',
            message: scrapeError.message || 'Scraping failed',
            skipUsage: true, // Flag to indicate this shouldn't count against usage
          },
          { status: 502 }
        )
      }

      // Analyze competitor pages using Scrape.do
      // If we can't scrape at least one competitor, don't charge the user
      const competitors = await Promise.all(
        competitorUrls.map(async (url: string) => {
          try {
            const scrapedData = await ScrapeDoService.getCompetitorContent(url, keyword)
            return {
              url,
              domain: new URL(url).hostname.replace('www.', ''),
              title: scrapedData?.title || '',
              titleLength: scrapedData?.seoAnalysis?.title?.length || 0,
              titleHasKeyword: scrapedData?.seoAnalysis?.title?.hasKeyword || false,
              metaDescription: scrapedData?.metaDescription || '',
              metaDescriptionLength: scrapedData?.seoAnalysis?.meta?.descriptionLength || 0,
              metaHasKeyword: scrapedData?.seoAnalysis?.meta?.hasKeyword || false,
              wordCount: scrapedData?.wordCount || 0,
              h1: scrapedData?.h1 || [],
              h1Count: scrapedData?.headings?.h1 || 0,
              h1Length: scrapedData?.seoAnalysis?.headings?.h1Length || 0,
              h2Count: scrapedData?.headings?.h2 || 0,
              h3Count: scrapedData?.headings?.h3 || 0,
              imagesCount: scrapedData?.images || 0,
              imagesWithAlt: scrapedData?.seoAnalysis?.images?.withAlt || 0,
              imagesWithoutAlt: scrapedData?.seoAnalysis?.images?.withoutAlt || 0,
              imagesAltQuality: scrapedData?.seoAnalysis?.images?.altQuality || {
                good: 0, poor: 0, generic: 0, tooLong: 0, missing: 0,
              },
              linksCount: scrapedData?.links || 0,
              internalLinks: scrapedData?.seoAnalysis?.links?.internal || 0,
              externalLinks: scrapedData?.seoAnalysis?.links?.external || 0,
              linksWithText: scrapedData?.seoAnalysis?.links?.withText || 0,
              linksWithoutText: scrapedData?.seoAnalysis?.links?.withoutText || 0,
              nofollowLinks: scrapedData?.seoAnalysis?.links?.nofollow || 0,
              readingTime: scrapedData?.wordCount ? Math.ceil(scrapedData.wordCount / 200) : 0,
              contentStrategy: scrapedData?.contentStrategy || null,
              imageStrategy: scrapedData?.imageStrategy ? {
                ...scrapedData.imageStrategy,
                // Calculate alt text coverage percentage - use seoAnalysis data if available, otherwise use imageStrategy
                imagesWithAlt: scrapedData?.seoAnalysis?.images?.withAlt || scrapedData.imageStrategy.imagesWithAlt || 0,
                altTextCoverage: (scrapedData?.seoAnalysis?.images?.withAlt || scrapedData.imageStrategy.imagesWithAlt || 0) > 0 && scrapedData.imageStrategy.totalImages > 0
                  ? Math.round(((scrapedData?.seoAnalysis?.images?.withAlt || scrapedData.imageStrategy.imagesWithAlt || 0) / scrapedData.imageStrategy.totalImages) * 100)
                  : 0,
              } : null,
              seoAnalysis: scrapedData?.seoAnalysis || null,
            }
          } catch (error: any) {
            // Log error but don't spam console - only log if it's not a common connection error
            if (error?.statusCode !== 502 && error?.statusCode !== 503 && error?.statusCode !== 504) {
              console.error(`Error analyzing competitor ${url}:`, error.message || error)
            } else {
              // For common connection errors, just log a brief message
              console.log(`⚠️  Skipping competitor ${url} - connection failed (${error.statusCode || 'unknown'})`)
            }
            return null
          }
        })
      )

      const validCompetitors = competitors.filter((c) => c !== null)
      
      // If we couldn't scrape any competitors, don't charge the user
      if (validCompetitors.length === 0) {
        await prisma.competitorAnalysis.update({
          where: { id: competitorAnalysis.id },
          data: {
            status: 'failed',
            competitors: {},
            comparison: {},
          },
        })
        return NextResponse.json(
          { 
            error: 'Failed to analyze competitors. The websites may be unreachable or blocking requests. Please try again later.',
            message: 'No competitors could be analyzed',
            skipUsage: true, // Flag to indicate this shouldn't count against usage
          },
          { status: 502 }
        )
      }

      // Compare metrics with enhanced data
      const userMetrics = {
        title: userScrapedData?.title || '',
        titleLength: userScrapedData?.seoAnalysis?.title?.length || 0,
        titleHasKeyword: userScrapedData?.seoAnalysis?.title?.hasKeyword || false,
        metaDescription: userScrapedData?.metaDescription || '',
        metaDescriptionLength: userScrapedData?.seoAnalysis?.meta?.descriptionLength || 0,
        metaHasKeyword: userScrapedData?.seoAnalysis?.meta?.hasKeyword || false,
        wordCount: userScrapedData?.wordCount || 0,
        h1: userScrapedData?.h1 || [],
        h1Count: userScrapedData?.headings?.h1 || 0,
        h1Length: userScrapedData?.seoAnalysis?.headings?.h1Length || 0,
        h2Count: userScrapedData?.headings?.h2 || 0,
        h3Count: userScrapedData?.headings?.h3 || 0,
        imagesCount: userScrapedData?.images || 0,
        imagesWithAlt: userScrapedData?.seoAnalysis?.images?.withAlt || 0,
        imagesWithoutAlt: userScrapedData?.seoAnalysis?.images?.withoutAlt || 0,
        imagesAltQuality: userScrapedData?.seoAnalysis?.images?.altQuality || {
          good: 0, poor: 0, generic: 0, tooLong: 0, missing: 0,
        },
        linksCount: userScrapedData?.links || 0,
        internalLinks: userScrapedData?.seoAnalysis?.links?.internal || 0,
        externalLinks: userScrapedData?.seoAnalysis?.links?.external || 0,
        linksWithText: userScrapedData?.seoAnalysis?.links?.withText || 0,
        linksWithoutText: userScrapedData?.seoAnalysis?.links?.withoutText || 0,
        nofollowLinks: userScrapedData?.seoAnalysis?.links?.nofollow || 0,
        readingTime: userScrapedData?.wordCount ? Math.ceil(userScrapedData.wordCount / 200) : 0,
        contentStrategy: userScrapedData?.contentStrategy || null,
        imageStrategy: userScrapedData?.imageStrategy || null,
        seoAnalysis: userScrapedData?.seoAnalysis || null,
      }

      // Calculate averages for all metrics
      const calculateAverage = (key: string) => {
        return validCompetitors.length > 0
          ? validCompetitors.reduce((sum, c) => {
              const value = c?.[key]
              return sum + (typeof value === 'number' ? value : 0)
            }, 0) / validCompetitors.length
          : 0
      }

      const averages = {
        wordCount: calculateAverage('wordCount'),
        titleLength: calculateAverage('titleLength'),
        metaDescriptionLength: calculateAverage('metaDescriptionLength'),
        h1Count: calculateAverage('h1Count'),
        h1Length: calculateAverage('h1Length'),
        h2Count: calculateAverage('h2Count'),
        h3Count: calculateAverage('h3Count'),
        imagesCount: calculateAverage('imagesCount'),
        imagesWithAlt: calculateAverage('imagesWithAlt'),
        imagesWithoutAlt: calculateAverage('imagesWithoutAlt'),
        imagesAltQuality: {
          good: validCompetitors.length > 0
            ? validCompetitors.reduce((sum, c) => sum + (c?.imagesAltQuality?.good || 0), 0) / validCompetitors.length
            : 0,
          poor: validCompetitors.length > 0
            ? validCompetitors.reduce((sum, c) => sum + (c?.imagesAltQuality?.poor || 0), 0) / validCompetitors.length
            : 0,
          generic: validCompetitors.length > 0
            ? validCompetitors.reduce((sum, c) => sum + (c?.imagesAltQuality?.generic || 0), 0) / validCompetitors.length
            : 0,
          tooLong: validCompetitors.length > 0
            ? validCompetitors.reduce((sum, c) => sum + (c?.imagesAltQuality?.tooLong || 0), 0) / validCompetitors.length
            : 0,
          missing: validCompetitors.length > 0
            ? validCompetitors.reduce((sum, c) => sum + (c?.imagesAltQuality?.missing || 0), 0) / validCompetitors.length
            : 0,
        },
        internalLinks: calculateAverage('internalLinks'),
        externalLinks: calculateAverage('externalLinks'),
        linksWithText: calculateAverage('linksWithText'),
        linksWithoutText: calculateAverage('linksWithoutText'),
        nofollowLinks: calculateAverage('nofollowLinks'),
        readingTime: calculateAverage('readingTime'),
        // Percentage metrics
        altTextCoverage: validCompetitors.length > 0
          ? validCompetitors.reduce((sum, c) => {
              const total = c?.imagesCount || 0
              const withAlt = c?.imagesWithAlt || 0
              return sum + (total > 0 ? (withAlt / total) * 100 : 0)
            }, 0) / validCompetitors.length
          : 0,
        titleKeywordUsage: validCompetitors.length > 0
          ? (validCompetitors.filter(c => c?.titleHasKeyword).length / validCompetitors.length) * 100
          : 0,
        metaKeywordUsage: validCompetitors.length > 0
          ? (validCompetitors.filter(c => c?.metaHasKeyword).length / validCompetitors.length) * 100
          : 0,
      }

      // Calculate comprehensive gaps (both positive and negative)
      const calculateGap = (userValue: number, avgValue: number) => {
        const diff = userValue - avgValue
        return {
          value: Math.abs(diff),
          isPositive: diff > 0, // User is ahead
          isNegative: diff < 0, // User is behind
          percentage: avgValue > 0 ? (diff / avgValue) * 100 : 0,
        }
      }

      const gaps = {
        wordCount: calculateGap(userMetrics.wordCount, averages.wordCount),
        titleLength: calculateGap(userMetrics.titleLength, averages.titleLength),
        metaDescriptionLength: calculateGap(userMetrics.metaDescriptionLength, averages.metaDescriptionLength),
        h1Count: calculateGap(userMetrics.h1Count, averages.h1Count),
        h1Length: calculateGap(userMetrics.h1Length, averages.h1Length),
        h2Count: calculateGap(userMetrics.h2Count, averages.h2Count),
        h3Count: calculateGap(userMetrics.h3Count, averages.h3Count),
        imagesCount: calculateGap(userMetrics.imagesCount, averages.imagesCount),
        imagesWithAlt: calculateGap(userMetrics.imagesWithAlt, averages.imagesWithAlt),
        imagesWithoutAlt: calculateGap(userMetrics.imagesWithoutAlt, averages.imagesWithoutAlt),
        internalLinks: calculateGap(userMetrics.internalLinks, averages.internalLinks),
        externalLinks: calculateGap(userMetrics.externalLinks, averages.externalLinks),
        linksWithText: calculateGap(userMetrics.linksWithText, averages.linksWithText),
        linksWithoutText: calculateGap(userMetrics.linksWithoutText, averages.linksWithoutText),
        readingTime: calculateGap(userMetrics.readingTime, averages.readingTime),
        altTextCoverage: {
          value: Math.abs((userMetrics.imagesCount > 0 ? (userMetrics.imagesWithAlt / userMetrics.imagesCount) * 100 : 0) - averages.altTextCoverage),
          isPositive: (userMetrics.imagesCount > 0 ? (userMetrics.imagesWithAlt / userMetrics.imagesCount) * 100 : 0) > averages.altTextCoverage,
          isNegative: (userMetrics.imagesCount > 0 ? (userMetrics.imagesWithAlt / userMetrics.imagesCount) * 100 : 0) < averages.altTextCoverage,
          percentage: averages.altTextCoverage > 0 
            ? (((userMetrics.imagesCount > 0 ? (userMetrics.imagesWithAlt / userMetrics.imagesCount) * 100 : 0) - averages.altTextCoverage) / averages.altTextCoverage) * 100
            : 0,
        },
      }

      // Now create the comparison object
      const comparison = {
        user: userMetrics,
        competitors: validCompetitors,
        averages,
        gaps,
      }

      // Generate AI insights for competitor analysis - handle errors gracefully
      let aiInsights: any = null
      try {
        aiInsights = await generateCompetitorInsights(keyword, userUrl, userMetrics, validCompetitors, comparison)
      } catch (aiError: any) {
        console.error('Error generating AI insights (non-fatal):', aiError)
        // AI insights failure shouldn't fail the whole analysis
        aiInsights = {
          summary: 'Analysis completed. Review the comparison data below for insights.',
          strengths: [],
          weaknesses: [],
          opportunities: [],
          recommendations: ['Review competitor content to identify improvement opportunities'],
        }
      }

      // Update competitor analysis record
      await prisma.competitorAnalysis.update({
        where: { id: competitorAnalysis.id },
        data: {
          status: 'completed',
          competitors: validCompetitors,
          comparison,
          aiInsights,
        },
      })

      // Only update usage count if analysis was successful
      // (We've already returned early if scraping failed, so we only get here on success)
      if (user.subscription) {
        await prisma.subscription.update({
          where: { id: user.subscription.id },
          data: {
            competitorsUsed: { increment: 1 },
          },
        })
      }

      return NextResponse.json({
        id: competitorAnalysis.id,
        keyword,
        userUrl,
        competitors: validCompetitors,
        comparison,
        aiInsights,
      })
    } catch (error: any) {
      console.error('Competitor analysis error:', error)
      
      // Check if this is an external API error (5xx status codes)
      const isExternalAPIError = error.message?.includes('API error') || 
                                 error.message?.includes('502') ||
                                 error.message?.includes('503') ||
                                 error.message?.includes('504') ||
                                 error.message?.includes('cannot connect')
      
      // Update competitor analysis with error
      await prisma.competitorAnalysis.update({
        where: { id: competitorAnalysis.id },
        data: {
          status: 'failed',
          competitors: {},
          comparison: {},
        },
      })

      // Don't charge user for external API failures
      if (isExternalAPIError) {
        return NextResponse.json(
          { 
            error: 'External service error. The analysis could not be completed due to a service issue. Please try again later.',
            message: error.message,
            skipUsage: true, // Flag to indicate this shouldn't count against usage
          },
          { status: 502 }
        )
      }

      // For other errors, still don't charge (to be safe)
      return NextResponse.json(
        { 
          error: 'Competitor analysis failed', 
          message: error.message,
          skipUsage: true, // Don't charge for failures
        },
        { status: 500 }
      )
    }
  } catch (error: any) {
    console.error('Competitor analysis API error:', error)
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    )
  }
}

async function generateCompetitorInsights(
  keyword: string,
  userUrl: string,
  userMetrics: any,
  competitors: any[],
  comparison: any
): Promise<any> {
  try {
    // Build detailed competitor information
    const competitorDetails = competitors.map((c, idx) => ({
      rank: idx + 1,
      domain: c.domain,
      title: c.title,
      wordCount: c.wordCount,
      h2Count: c.h2Count,
      imagesCount: c.imagesCount,
      readingTime: c.readingTime,
      contentStrategy: c.contentStrategy ? {
        hasFAQ: c.contentStrategy.hasFAQ,
        hasList: c.contentStrategy.hasList,
        hasTable: c.contentStrategy.hasTable,
        avgWordsPerHeading: c.contentStrategy.avgWordsPerHeading,
        imageDensity: c.contentStrategy.imageDensity,
      } : null,
      imageStrategy: c.imageStrategy ? {
        totalImages: c.imageStrategy.totalImages,
        imagesWithAlt: c.imageStrategy.imagesWithAlt,
        altTextCoverage: c.imageStrategy.totalImages > 0 
          ? Math.round((c.imageStrategy.imagesWithAlt / c.imageStrategy.totalImages) * 100) 
          : 0,
      } : null,
    }))

    const prompt = `You are an expert SEO strategist. Analyze competitor data for keyword "${keyword}" and provide detailed, actionable insights with section-wise recommendations.

USER'S PAGE (${userUrl}):
- Title: "${userMetrics.title}" (${userMetrics.titleLength} chars, keyword: ${userMetrics.titleHasKeyword ? 'Yes' : 'No'})
- Meta Description: ${userMetrics.metaDescriptionLength} chars (keyword: ${userMetrics.metaHasKeyword ? 'Yes' : 'No'})
- Word Count: ${userMetrics.wordCount}
- H1: ${userMetrics.h1.join(', ')} (${userMetrics.h1Count} total)
- H2 Count: ${userMetrics.h2Count}
- H3 Count: ${userMetrics.h3Count}
- Images: ${userMetrics.imagesCount} (${userMetrics.imagesWithAlt} with alt text, ${userMetrics.imagesWithoutAlt} without)
- Alt Text Coverage: ${userMetrics.imagesCount > 0 ? Math.round((userMetrics.imagesWithAlt / userMetrics.imagesCount) * 100) : 0}%
- Internal Links: ${userMetrics.internalLinks}
- External Links: ${userMetrics.externalLinks}
- Links with Text: ${userMetrics.linksWithText}
- Links without Text: ${userMetrics.linksWithoutText}
- Reading Time: ${userMetrics.readingTime} minutes

COMPETITOR DETAILS:
${competitorDetails.map(c => `
${c.rank}. ${c.domain}:
   - Title: "${c.title}"
   - Word Count: ${c.wordCount.toLocaleString()}
   - H2 Sections: ${c.h2Count}
   - Images: ${c.imagesCount}
   - Reading Time: ${c.readingTime} min
   - Content Strategy: ${c.contentStrategy ? `FAQ: ${c.contentStrategy.hasFAQ}, Lists: ${c.contentStrategy.hasList}, Tables: ${c.contentStrategy.hasTable}, ${c.contentStrategy.avgWordsPerHeading} words/heading, ${c.contentStrategy.imageDensity} images per 1000 words` : 'N/A'}
   - Image Strategy: ${c.imageStrategy ? `${c.imageStrategy.altTextCoverage}% alt text coverage (${c.imageStrategy.imagesWithAlt}/${c.imageStrategy.totalImages})` : 'N/A'}
`).join('')}

INDUSTRY AVERAGES:
- Word Count: ${comparison.averages.wordCount.toFixed(0)}
- H2 Count: ${comparison.averages.h2Count.toFixed(0)}
- Images: ${comparison.averages.imagesCount.toFixed(0)}
- Alt Text Coverage: ${comparison.averages.altTextCoverage.toFixed(0)}%
- Internal Links: ${comparison.averages.internalLinks.toFixed(0)}
- External Links: ${comparison.averages.externalLinks.toFixed(0)}

CONTENT GAPS (vs. averages):
- Word Count: ${comparison.gaps.wordCount.isNegative ? 'Behind by' : 'Ahead by'} ${Math.abs(comparison.gaps.wordCount.value).toFixed(0)} words (${Math.abs(comparison.gaps.wordCount.percentage).toFixed(0)}%)
- H2 Count: ${comparison.gaps.h2Count.isNegative ? 'Behind by' : 'Ahead by'} ${Math.abs(comparison.gaps.h2Count.value).toFixed(0)} sections (${Math.abs(comparison.gaps.h2Count.percentage).toFixed(0)}%)
- Images: ${comparison.gaps.imagesCount.isNegative ? 'Behind by' : 'Ahead by'} ${Math.abs(comparison.gaps.imagesCount.value).toFixed(0)} images (${Math.abs(comparison.gaps.imagesCount.percentage).toFixed(0)}%)
- Alt Text Coverage: ${comparison.gaps.altTextCoverage.isNegative ? 'Behind by' : 'Ahead by'} ${Math.abs(comparison.gaps.altTextCoverage.value).toFixed(0)}% (${Math.abs(comparison.gaps.altTextCoverage.percentage).toFixed(0)}%)

Provide detailed analysis as JSON with section-wise actionable recommendations:
{
  "summary": "2-3 sentence overview of competitive position",
  "strengths": ["what user is doing well"],
  "weaknesses": ["where user falls short"],
  "opportunities": ["specific opportunities to improve"],
  "recommendations": ["prioritized actionable recommendations"],
  "sectionRecommendations": {
    "title": ["specific actions to improve title tag - what to add/change"],
    "metaDescription": ["specific actions to improve meta description - what to add/change"],
    "headings": ["specific actions to improve heading structure - what headings to add/modify"],
    "content": ["specific actions to improve content - what content to add/expand"],
    "images": ["specific actions to improve images - what alt text to add/improve"],
    "links": ["specific actions to improve linking - what links to add/modify"]
  },
  "competitorInsights": [
    {
      "domain": "competitor domain",
      "whatTheyDoWell": ["specific things this competitor excels at"],
      "contentStrategy": "description of their content approach",
      "imageStrategy": "description of their image usage",
      "keyTakeaways": ["actionable insights to learn from"]
    }
  ]
}`

    // Use Claude to generate insights
    const anthropic = require('@anthropic-ai/sdk').default
    const client = new anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
    
    const message = await client.messages.create({
        model: 'claude-sonnet-4-5-20250929',
      max_tokens: 2000,
      messages: [{ role: 'user', content: prompt }],
    })

    const text = message.content[0].type === 'text' ? message.content[0].text : ''
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    const jsonString = jsonMatch ? jsonMatch[0] : text

    try {
      return JSON.parse(jsonString)
    } catch {
      return {
        summary: 'Analyze competitor content to identify opportunities',
        strengths: [],
        weaknesses: [],
        opportunities: [],
        recommendations: ['Match or exceed competitor word counts', 'Improve heading structure', 'Add more visual content'],
      }
    }
  } catch (error) {
    console.error('Error generating competitor insights:', error)
    return {
      summary: 'Review competitor analysis to identify improvement opportunities',
      strengths: [],
      weaknesses: [],
      opportunities: [],
      recommendations: [],
    }
  }
}

