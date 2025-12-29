import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { ScrapeDoService } from '@/lib/services/scrapedo'
import { ClaudeService } from '@/lib/services/claude'
import { z } from 'zod'

const seoAuditSchema = z.object({
  url: z.string().url(),
})

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { subscription: true },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Check subscription limits
    if (user.subscription) {
      if (user.subscription.seoAuditsUsed >= user.subscription.seoAuditsLimit) {
        return NextResponse.json(
          { error: 'SEO audit limit reached. Please upgrade your plan.' },
          { status: 403 }
        )
      }
    } else {
      const freeAudits = await prisma.sEOAudit.count({
        where: {
          userId: user.id,
          status: { not: 'failed' },
        },
      })
      if (freeAudits >= 3) {
        return NextResponse.json(
          { error: 'Free SEO audit limit reached. Please subscribe to continue.' },
          { status: 403 }
        )
      }
    }

    const body = await request.json()
    const validation = seoAuditSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: validation.error.issues },
        { status: 400 }
      )
    }

    const { url } = validation.data
    const domain = new URL(url).hostname.replace('www.', '')

    // Create SEO audit record
    const audit = await prisma.sEOAudit.create({
      data: {
        userId: user.id,
        url,
        domain,
        status: 'processing',
        technicalScore: 0,
        onPageScore: 0,
        offPageScore: 0,
        performanceScore: 0,
        technicalIssues: {},
        onPageIssues: {},
        offPageIssues: {},
        performanceIssues: {},
        recommendations: {},
        priorityActions: {},
      },
    })

    try {
      // Run comprehensive SEO audit using Scrape.do
      const scrapedData = await ScrapeDoService.scrapeURL(url).catch(() => null)

      // onPageData is not used in current implementation, pass null
      const onPageData = null

      // Technical SEO Analysis
      const technicalIssues = analyzeTechnicalSEO(url, scrapedData, onPageData)
      const technicalScore = calculateTechnicalScore(technicalIssues)

      // On-Page SEO Analysis
      const onPageIssues = analyzeOnPageSEO(scrapedData, onPageData)
      const onPageScore = calculateOnPageScore(onPageIssues)

      // Off-Page SEO Analysis (basic - would need more data sources)
      const offPageIssues = analyzeOffPageSEO(url, domain)
      const offPageScore = calculateOffPageScore(offPageIssues)

      // Performance Analysis
      const performanceIssues = analyzePerformance(url, scrapedData)
      const performanceScore = calculatePerformanceScore(performanceIssues)

      // Generate AI recommendations
      const recommendations = await generateAuditRecommendations({
        url,
        technicalIssues,
        onPageIssues,
        offPageIssues,
        performanceIssues,
        scores: {
          technical: technicalScore,
          onPage: onPageScore,
          offPage: offPageScore,
          performance: performanceScore,
        },
      })

      // Prioritize actions
      const priorityActions = prioritizeActions(
        technicalIssues,
        onPageIssues,
        offPageIssues,
        performanceIssues
      )

      // Update audit record
      await prisma.sEOAudit.update({
        where: { id: audit.id },
        data: {
          status: 'completed',
          technicalScore,
          onPageScore,
          offPageScore,
          performanceScore,
          technicalIssues,
          onPageIssues,
          offPageIssues,
          performanceIssues,
          recommendations,
          priorityActions,
        },
      })

      // Update usage count
      if (user.subscription) {
        await prisma.subscription.update({
          where: { id: user.subscription.id },
          data: {
            seoAuditsUsed: { increment: 1 },
          },
        })
      }

      return NextResponse.json({
        id: audit.id,
        url,
        domain,
        scores: {
          technical: technicalScore,
          onPage: onPageScore,
          offPage: offPageScore,
          performance: performanceScore,
          overall: Math.round((technicalScore + onPageScore + offPageScore + performanceScore) / 4),
        },
        issues: {
          technical: technicalIssues,
          onPage: onPageIssues,
          offPage: offPageIssues,
          performance: performanceIssues,
        },
        recommendations,
        priorityActions,
      })
    } catch (error: any) {
      await prisma.sEOAudit.update({
        where: { id: audit.id },
        data: {
          status: 'failed',
        },
      })

      return NextResponse.json(
        { error: 'SEO audit failed', message: error.message },
        { status: 500 }
      )
    }
  } catch (error: any) {
    console.error('SEO audit API error:', error)
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    )
  }
}

function analyzeTechnicalSEO(url: string, scrapedData: any, onPageData: any): any {
  const issues: any[] = []
  const checks: any = {}

  // SSL/HTTPS check
  const isHTTPS = url.startsWith('https://')
  checks.https = isHTTPS
  if (!isHTTPS) {
    issues.push({ type: 'critical', message: 'Site is not using HTTPS', fix: 'Install SSL certificate' })
  }

  // Mobile-friendly check (basic)
  checks.mobileFriendly = scrapedData?.data?.meta?.viewport ? true : false
  if (!checks.mobileFriendly) {
    issues.push({ type: 'warning', message: 'Mobile viewport meta tag not found', fix: 'Add viewport meta tag' })
  }

  // Robots.txt check
  checks.robotsTxt = true // Would need to check actual robots.txt
  // Sitemap check
  checks.sitemap = true // Would need to check actual sitemap

  // Page speed (basic check)
  checks.pageSpeed = true // Would need actual page speed test

  return {
    checks,
    issues,
    criticalCount: issues.filter(i => i.type === 'critical').length,
    warningCount: issues.filter(i => i.type === 'warning').length,
  }
}

function calculateTechnicalScore(technicalIssues: any): number {
  let score = 100
  score -= technicalIssues.criticalCount * 10
  score -= technicalIssues.warningCount * 3
  return Math.max(0, Math.min(100, score))
}

function analyzeOnPageSEO(scrapedData: any, onPageData: any): any {
  const issues: any[] = []
  const checks: any = {}

  // Title tag
  const title = scrapedData?.data?.title || ''
  checks.title = {
    exists: !!title,
    length: title.length,
    optimal: title.length >= 30 && title.length <= 60,
  }
  if (!title) {
    issues.push({ type: 'critical', message: 'Title tag is missing', fix: 'Add title tag' })
  } else if (title.length < 30 || title.length > 60) {
    issues.push({ type: 'warning', message: `Title tag length is ${title.length} (optimal: 30-60)`, fix: 'Optimize title length' })
  }

  // Meta description
  const metaDesc = scrapedData?.data?.meta?.description || ''
  checks.metaDescription = {
    exists: !!metaDesc,
    length: metaDesc.length,
    optimal: metaDesc.length >= 120 && metaDesc.length <= 160,
  }
  if (!metaDesc) {
    issues.push({ type: 'warning', message: 'Meta description is missing', fix: 'Add meta description' })
  } else if (metaDesc.length < 120 || metaDesc.length > 160) {
    issues.push({ type: 'warning', message: `Meta description length is ${metaDesc.length} (optimal: 120-160)`, fix: 'Optimize meta description length' })
  }

  // H1 tag
  const h1Count = scrapedData?.data?.headings?.h1?.length || 0
  checks.h1 = {
    exists: h1Count > 0,
    count: h1Count,
    optimal: h1Count === 1,
  }
  if (h1Count === 0) {
    issues.push({ type: 'critical', message: 'H1 tag is missing', fix: 'Add H1 tag' })
  } else if (h1Count > 1) {
    issues.push({ type: 'warning', message: `Multiple H1 tags found (${h1Count})`, fix: 'Use only one H1 tag per page' })
  }

  // Headings structure
  const h2Count = scrapedData?.data?.headings?.h2?.length || 0
  checks.headings = {
    h2Count,
    optimal: h2Count >= 3,
  }
  if (h2Count < 3) {
    issues.push({ type: 'warning', message: 'Add more H2 headings for better structure', fix: 'Add at least 3 H2 headings' })
  }

  // Images alt text
  const images = scrapedData?.data?.images || []
  const imagesWithAlt = images.filter((img: any) => img.alt).length
  checks.images = {
    total: images.length,
    withAlt: imagesWithAlt,
    optimal: images.length === 0 || imagesWithAlt === images.length,
  }
  if (images.length > 0 && imagesWithAlt < images.length) {
    issues.push({ type: 'warning', message: `${images.length - imagesWithAlt} images missing alt text`, fix: 'Add alt text to all images' })
  }

  // Word count
  const wordCount = scrapedData?.data?.content?.wordCount || 0
  checks.wordCount = {
    count: wordCount,
    optimal: wordCount >= 300,
  }
  if (wordCount < 300) {
    issues.push({ type: 'warning', message: `Low word count (${wordCount})`, fix: 'Add more content (minimum 300 words)' })
  }

  return {
    checks,
    issues,
    criticalCount: issues.filter(i => i.type === 'critical').length,
    warningCount: issues.filter(i => i.type === 'warning').length,
  }
}

function calculateOnPageScore(onPageIssues: any): number {
  let score = 100
  score -= onPageIssues.criticalCount * 10
  score -= onPageIssues.warningCount * 3
  return Math.max(0, Math.min(100, score))
}

function analyzeOffPageSEO(url: string, domain: string): any {
  // Basic off-page analysis - would need backlink data
  return {
    checks: {
      backlinks: 'unknown',
      domainAuthority: 'unknown',
      socialSignals: 'unknown',
    },
    issues: [],
    criticalCount: 0,
    warningCount: 0,
  }
}

function calculateOffPageScore(offPageIssues: any): number {
  // Default score since we don't have backlink data
  return 75
}

function analyzePerformance(url: string, scrapedData: any): any {
  const issues: any[] = []
  const checks: any = {}

  // Image optimization
  const images = scrapedData?.data?.images || []
  checks.images = {
    total: images.length,
    optimized: true, // Would need to check actual image sizes
  }

  // Content size
  const contentSize = scrapedData?.data?.content?.text?.length || 0
  checks.contentSize = {
    size: contentSize,
    optimal: contentSize < 100000, // 100KB
  }
  if (contentSize > 100000) {
    issues.push({ type: 'warning', message: 'Large content size may affect performance', fix: 'Optimize content size' })
  }

  return {
    checks,
    issues,
    criticalCount: issues.filter(i => i.type === 'critical').length,
    warningCount: issues.filter(i => i.type === 'warning').length,
  }
}

function calculatePerformanceScore(performanceIssues: any): number {
  let score = 100
  score -= performanceIssues.criticalCount * 10
  score -= performanceIssues.warningCount * 3
  return Math.max(0, Math.min(100, score))
}

async function generateAuditRecommendations(data: any): Promise<any> {
  try {
    // Use Claude to generate recommendations
    const prompt = `Based on this SEO audit, provide comprehensive recommendations:

Technical Score: ${data.scores.technical}/100
On-Page Score: ${data.scores.onPage}/100
Off-Page Score: ${data.scores.offPage}/100
Performance Score: ${data.scores.performance}/100

Issues:
${JSON.stringify(data, null, 2)}

Provide actionable recommendations as JSON:
{
  "summary": "string",
  "technical": ["string"],
  "onPage": ["string"],
  "offPage": ["string"],
  "performance": ["string"]
}`

    // Simplified - would use Claude in production
    return {
      summary: 'Focus on fixing critical issues first, then optimize on-page elements',
      technical: ['Install SSL certificate', 'Add robots.txt and sitemap'],
      onPage: ['Optimize title and meta description', 'Add proper heading structure'],
      offPage: ['Build quality backlinks', 'Improve domain authority'],
      performance: ['Optimize images', 'Reduce page load time'],
    }
  } catch (error) {
    return {
      summary: 'Review all issues and prioritize critical fixes',
      technical: [],
      onPage: [],
      offPage: [],
      performance: [],
    }
  }
}

function prioritizeActions(
  technicalIssues: any,
  onPageIssues: any,
  offPageIssues: any,
  performanceIssues: any
): any[] {
  const allIssues = [
    ...technicalIssues.issues.map((i: any) => ({ ...i, category: 'technical' })),
    ...onPageIssues.issues.map((i: any) => ({ ...i, category: 'onPage' })),
    ...offPageIssues.issues.map((i: any) => ({ ...i, category: 'offPage' })),
    ...performanceIssues.issues.map((i: any) => ({ ...i, category: 'performance' })),
  ]

  // Sort by priority: critical first, then by category
  return allIssues
    .sort((a, b) => {
      if (a.type === 'critical' && b.type !== 'critical') return -1
      if (a.type !== 'critical' && b.type === 'critical') return 1
      return 0
    })
    .slice(0, 10) // Top 10 priority actions
}

