import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { ScrapeDoService } from '@/lib/services/scrapedo'
import {
  analyzeTitleTagFromScraped,
  analyzeMetaDescriptionFromScraped,
  analyzeHeadingsFromScraped,
  analyzeWordCountFromScraped,
  analyzeLinksFromScraped,
  analyzeImagesFromScraped,
  analyzeSSLFromURL,
  calculateSEOScore,
} from '@/lib/utils/seo-calculator'
import { ClaudeService } from '@/lib/services/claude'
import { analyzeRequestSchema } from '@/lib/utils/validators'

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
      if (user.subscription.analysesUsed >= user.subscription.analysesLimit) {
        return NextResponse.json(
          { error: 'Analysis limit reached. Please upgrade your plan.' },
          { status: 403 }
        )
      }
    } else {
      // Free tier: 1 analysis - only count completed analyses
      const freeAnalyses = await prisma.analysis.count({
        where: {
          userId: user.id,
          status: 'completed'
        },
      })
      if (freeAnalyses >= 1) {
        return NextResponse.json(
          { error: 'Free analysis limit reached. Please subscribe to continue.' },
          { status: 403 }
        )
      }
    }

    // Parse and validate request
    const body = await request.json()
    const validation = analyzeRequestSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: validation.error.issues },
        { status: 400 }
      )
    }

    const { url, type } = validation.data

    // Extract domain from URL
    const domain = new URL(url).hostname

    // Create analysis record
    const analysis = await prisma.analysis.create({
      data: {
        userId: user.id,
        url,
        domain,
        type,
        status: 'processing',
        seoScore: 0,
        results: {},
      },
    })

    try {
      // Scrape page using Scrape.do
      const scrapedData = await ScrapeDoService.scrapeURL(url)
      
      if (!scrapedData.success || !scrapedData.data) {
        console.error('Scrape.do error:', scrapedData.error)
        // If scraping fails, don't charge the user
        await prisma.analysis.update({
          where: { id: analysis.id },
          data: {
            status: 'failed',
            errorMessage: scrapedData.error || 'Failed to scrape page',
          },
        })
        return NextResponse.json(
          { 
            error: 'Failed to analyze website. The website may be unreachable or blocking requests. Please try again later.',
            message: scrapedData.error || 'Scraping failed',
            skipUsage: true, // Flag to indicate this shouldn't count against usage
          },
          { status: 502 }
        )
      }
      
      // Validate scraped data has required fields
      // Check if we have at least some content (title, text, or headings)
      const hasContent = 
        scrapedData.data.title || 
        scrapedData.data.content?.text || 
        scrapedData.data.content?.html ||
        scrapedData.data.headings?.h1?.length ||
        scrapedData.data.headings?.h2?.length
      
      if (!hasContent) {
        console.error('Scraped data is empty:', JSON.stringify(scrapedData.data, null, 2))
        // If scraping returned empty data, don't charge the user
        await prisma.analysis.update({
          where: { id: analysis.id },
          data: {
            status: 'failed',
            errorMessage: 'Scraped data is empty or invalid - no content found',
          },
        })
        return NextResponse.json(
          { 
            error: 'Failed to analyze website. The website content could not be extracted. Please try again later.',
            message: 'Scraped data is empty or invalid',
            skipUsage: true, // Flag to indicate this shouldn't count against usage
          },
          { status: 502 }
        )
      }

      // Process all metrics from scraped data
      const titleAnalysis = analyzeTitleTagFromScraped(scrapedData.data)
      const metaAnalysis = analyzeMetaDescriptionFromScraped(scrapedData.data)
      const headingsAnalysis = analyzeHeadingsFromScraped(scrapedData.data)
      const contentAnalysis = analyzeWordCountFromScraped(scrapedData.data)
      const linksAnalysis = analyzeLinksFromScraped(scrapedData.data)
      const imagesAnalysis = analyzeImagesFromScraped(scrapedData.data)
      const sslAnalysis = analyzeSSLFromURL(url)
      
      // Core Web Vitals - not available from scraping, set as passed
      const cwvAnalysis = {
        status: 'pass' as const,
        score: 0, // No penalty since we can't measure it
        lcp: null,
        fid: null,
        cls: null,
        ttfb: null,
        recommendation: 'Core Web Vitals require performance testing tools',
        issues: [],
      }
      
      // Broken links - basic check from scraped links
      const brokenLinks = {
        broken: 0,
        total: scrapedData.data.links?.length || 0,
        issues: [],
      }

      // Calculate overall SEO score
      const seoScore = calculateSEOScore({
        title: titleAnalysis,
        meta: metaAnalysis,
        headings: headingsAnalysis,
        content: contentAnalysis,
        links: linksAnalysis,
        images: imagesAnalysis,
        cwv: cwvAnalysis,
        ssl: sslAnalysis,
      })
      
      // Ensure seoScore is a valid number
      const validSeoScore = isNaN(seoScore) || !isFinite(seoScore) ? 0 : Math.max(0, Math.min(100, Math.round(seoScore)))

      // Extract additional data for enhanced insights
      const additionalData = {
        schema: scrapedData.data.schema || [],
        ogTags: scrapedData.data.meta?.og || {},
        twitterTags: scrapedData.data.meta?.twitter || {},
        language: scrapedData.data.language || 'en',
        contentStructure: scrapedData.data.content?.structure || {},
        imageDetails: {
          total: imagesAnalysis.totalImages,
          withDimensions: scrapedData.data.images?.filter((img: any) => img.width && img.height).length || 0,
          avgWidth: scrapedData.data.images?.length > 0 
            ? Math.round((scrapedData.data.images.reduce((sum: number, img: any) => sum + (img.width || 0), 0) / scrapedData.data.images.length))
            : 0,
          avgHeight: scrapedData.data.images?.length > 0
            ? Math.round((scrapedData.data.images.reduce((sum: number, img: any) => sum + (img.height || 0), 0) / scrapedData.data.images.length))
            : 0,
        },
        linkDetails: {
          total: linksAnalysis.totalLinks,
          internal: linksAnalysis.internalLinks,
          external: linksAnalysis.externalLinks,
          nofollow: scrapedData.data.seoAnalysis?.links?.nofollow || 0,
          anchorTexts: scrapedData.data.links?.slice(0, 20).map((l: any) => l.text).filter((t: string) => t.length > 0) || [],
        },
      }

      // Generate AI insights (advisory only) - wrap in try/catch to continue even if Claude fails
      let aiInsights
      try {
        aiInsights = await ClaudeService.generateSEOInsights({
          url,
          score: validSeoScore,
          analyses: {
            title: {
              status: titleAnalysis.status,
              recommendation: titleAnalysis.recommendation,
              issues: titleAnalysis.issues,
            },
            meta: {
              status: metaAnalysis.status,
              recommendation: metaAnalysis.recommendation,
              issues: metaAnalysis.issues,
            },
            headings: {
              status: headingsAnalysis.status,
              recommendation: headingsAnalysis.recommendation,
              issues: headingsAnalysis.issues,
            },
            content: {
              status: contentAnalysis.status,
              recommendation: contentAnalysis.recommendation,
              issues: contentAnalysis.issues,
            },
            links: {
              status: linksAnalysis.status,
              recommendation: linksAnalysis.recommendation,
              issues: linksAnalysis.issues,
            },
            images: {
              status: imagesAnalysis.status,
              recommendation: imagesAnalysis.recommendation,
              issues: imagesAnalysis.issues,
            },
            cwv: {
              status: cwvAnalysis.status,
              recommendation: cwvAnalysis.recommendation,
              issues: cwvAnalysis.issues,
            },
            ssl: {
              status: sslAnalysis.status,
              recommendation: sslAnalysis.recommendation,
              issues: sslAnalysis.issues,
            },
          },
          additionalData,
        })
      } catch (claudeError: any) {
        console.error('Claude API error (non-fatal):', claudeError)
        // Use default insights if Claude fails
        aiInsights = {
          summary: 'SEO analysis completed. Review the detailed metrics below for actionable insights.',
          strengths: ['Analysis completed successfully'],
          weaknesses: ['Review individual metrics for specific issues'],
          priorityActions: [
            {
              action: 'Address critical issues first',
              impact: 'high' as const,
              effort: 'medium' as const,
            },
          ],
          estimatedImpact: 'Addressing critical issues can significantly improve your SEO score.',
        }
      }

      // Prepare results
      const results = {
        seoScore: validSeoScore,
        title: titleAnalysis,
        meta: metaAnalysis,
        headings: headingsAnalysis,
        content: contentAnalysis,
        links: linksAnalysis,
        images: imagesAnalysis,
        // Additional insights
        schema: {
          found: additionalData.schema.length > 0,
          count: additionalData.schema.length,
          types: additionalData.schema.map((s: any) => s['@type'] || 'unknown'),
        },
        social: {
          ogTags: additionalData.ogTags,
          twitterTags: additionalData.twitterTags,
          hasOG: Object.keys(additionalData.ogTags).length > 0,
          hasTwitter: Object.keys(additionalData.twitterTags).length > 0,
        },
        contentStructure: additionalData.contentStructure,
        language: additionalData.language,
        imageDetails: additionalData.imageDetails,
        linkDetails: additionalData.linkDetails,
        cwv: cwvAnalysis,
        ssl: sslAnalysis,
        brokenLinks,
        aiInsights,
      }

      // Update analysis record
      await prisma.analysis.update({
        where: { id: analysis.id },
        data: {
          status: 'completed',
          seoScore: validSeoScore,
          results: results as any,
        },
      })

      // Update usage count
      if (user.subscription) {
        await prisma.subscription.update({
          where: { id: user.subscription.id },
          data: {
            analysesUsed: { increment: 1 },
          },
        })
      }

      return NextResponse.json({
        id: analysis.id,
        url,
        domain,
        seoScore: validSeoScore,
        results,
      })
    } catch (error: any) {
      console.error('Analysis processing error:', error)
      console.error('Error stack:', error.stack)
      
      // Check if this is an external API error (5xx status codes or scraping errors)
      const isExternalAPIError = error.statusCode >= 500 || 
                                 error.isExternalAPIError ||
                                 error.message?.includes('API error') ||
                                 error.message?.includes('502') ||
                                 error.message?.includes('503') ||
                                 error.message?.includes('504') ||
                                 error.message?.includes('cannot connect') ||
                                 error.message?.includes('Failed to scrape')
      
      // Update analysis with error
      try {
        await prisma.analysis.update({
          where: { id: analysis.id },
          data: {
            status: 'failed',
            errorMessage: error.message || 'Analysis failed',
          },
        })
      } catch (dbError) {
        console.error('Failed to update analysis record:', dbError)
      }

      // Don't charge user for external API failures
      if (isExternalAPIError) {
        return NextResponse.json(
          { 
            error: 'External service error. The analysis could not be completed due to a service issue. Please try again later.',
            message: error.message || 'Unknown error occurred',
            skipUsage: true, // Flag to indicate this shouldn't count against usage
            details: process.env.NODE_ENV === 'development' ? error.stack : undefined
          },
          { status: 502 }
        )
      }

      return NextResponse.json(
        { 
          error: 'Analysis failed', 
          message: error.message || 'Unknown error occurred',
          skipUsage: true, // Don't charge for failures
          details: process.env.NODE_ENV === 'development' ? error.stack : undefined
        },
        { status: 500 }
      )
    }
  } catch (error: any) {
    console.error('Analysis API error:', error)
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    )
  }
}
