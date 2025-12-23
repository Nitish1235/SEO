import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { DataForSEOOnPageService } from '@/lib/services/dataforseo/onpage'
import {
  analyzeTitleTag,
  analyzeMetaDescription,
  analyzeHeadings,
  analyzeWordCount,
  analyzeLinks,
  analyzeImages,
  analyzeCoreWebVitals,
  analyzeSSL,
  analyzeBrokenLinks,
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
      // Free tier: 3 analyses
      const freeAnalyses = await prisma.analysis.count({
        where: { userId: user.id },
      })
      if (freeAnalyses >= 3) {
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
        { error: 'Invalid request', details: validation.error.errors },
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
      // Call DataForSEO On-Page API
      const onPageData = await DataForSEOOnPageService.analyzePageInstant(url)

      // Check if API call was successful
      if (onPageData.status_code !== 20000 || !onPageData.tasks?.[0]?.data?.[0]) {
        throw new Error(onPageData.status_message || 'DataForSEO API error')
      }

      // Process all metrics
      const titleAnalysis = analyzeTitleTag(onPageData)
      const metaAnalysis = analyzeMetaDescription(onPageData)
      const headingsAnalysis = analyzeHeadings(onPageData)
      const contentAnalysis = analyzeWordCount(onPageData)
      const linksAnalysis = analyzeLinks(onPageData)
      const imagesAnalysis = analyzeImages(onPageData)
      const cwvAnalysis = analyzeCoreWebVitals(onPageData)
      const sslAnalysis = analyzeSSL(onPageData)
      const brokenLinks = analyzeBrokenLinks(onPageData)

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

      // Generate AI insights (advisory only)
      const aiInsights = await ClaudeService.generateSEOInsights({
        url,
        score: seoScore,
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
      })

      // Prepare results
      const results = {
        seoScore,
        title: titleAnalysis,
        meta: metaAnalysis,
        headings: headingsAnalysis,
        content: contentAnalysis,
        links: linksAnalysis,
        images: imagesAnalysis,
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
          seoScore,
          results,
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
        seoScore,
        results,
      })
    } catch (error: any) {
      // Update analysis with error
      await prisma.analysis.update({
        where: { id: analysis.id },
        data: {
          status: 'failed',
          errorMessage: error.message || 'Analysis failed',
        },
      })

      return NextResponse.json(
        { error: 'Analysis failed', message: error.message },
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

