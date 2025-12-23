import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { DataForSEOSERPService } from '@/lib/services/dataforseo/serp'
import { DataForSEOOnPageService } from '@/lib/services/dataforseo/onpage'
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
      // Free tier: 1 competitor analysis
      const freeCompetitors = await prisma.competitorAnalysis.count({
        where: { userId: user.id },
      })
      if (freeCompetitors >= 1) {
        return NextResponse.json(
          { error: 'Free competitor analysis limit reached. Please subscribe to continue.' },
          { status: 403 }
        )
      }
    }

    // Parse and validate request
    const body = await request.json()
    const validation = keywordSchema.safeParse(body.keyword)
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: validation.error.errors },
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
      // Get SERP results for the keyword
      const serpResponse = await DataForSEOSERPService.getOrganic(keyword)
      const organicResults = serpResponse.tasks?.[0]?.data?.items
        ?.filter((item) => item.type === 'organic')
        .slice(0, 5) || []

      // Extract competitor URLs (excluding user's URL)
      const competitorUrls = organicResults
        .map((item) => item.url)
        .filter((url) => !url.includes(new URL(userUrl).hostname))
        .slice(0, 5)

      // Analyze user's page
      const userPageData = await DataForSEOOnPageService.analyzePageInstant(userUrl)
      const userPage = userPageData.tasks?.[0]?.data?.[0]

      // Analyze competitor pages
      const competitors = await Promise.all(
        competitorUrls.map(async (url) => {
          try {
            const competitorData = await DataForSEOOnPageService.analyzePageInstant(url)
            const competitorPage = competitorData.tasks?.[0]?.data?.[0]

            return {
              url,
              domain: new URL(url).hostname,
              title: competitorPage?.title || '',
              metaDescription: competitorPage?.meta_description || '',
              wordCount: competitorPage?.words_count || 0,
              h1Count: competitorPage?.h1?.length || 0,
              h2Count: competitorPage?.h2?.length || 0,
              internalLinks: competitorPage?.internal_links_count || 0,
              externalLinks: competitorPage?.external_links_count || 0,
              imagesCount: competitorPage?.images_count || 0,
            }
          } catch (error) {
            console.error(`Error analyzing competitor ${url}:`, error)
            return null
          }
        })
      )

      const validCompetitors = competitors.filter((c) => c !== null)

      // Compare metrics
      const comparison = {
        user: {
          title: userPage?.title || '',
          metaDescription: userPage?.meta_description || '',
          wordCount: userPage?.words_count || 0,
          h1Count: userPage?.h1?.length || 0,
          h2Count: userPage?.h2?.length || 0,
          internalLinks: userPage?.internal_links_count || 0,
          externalLinks: userPage?.external_links_count || 0,
          imagesCount: userPage?.images_count || 0,
        },
        competitors: validCompetitors,
        averages: {
          wordCount:
            validCompetitors.reduce((sum, c) => sum + (c?.wordCount || 0), 0) /
            validCompetitors.length,
          h1Count:
            validCompetitors.reduce((sum, c) => sum + (c?.h1Count || 0), 0) /
            validCompetitors.length,
          h2Count:
            validCompetitors.reduce((sum, c) => sum + (c?.h2Count || 0), 0) /
            validCompetitors.length,
          internalLinks:
            validCompetitors.reduce((sum, c) => sum + (c?.internalLinks || 0), 0) /
            validCompetitors.length,
        },
      }

      // Update competitor analysis record
      await prisma.competitorAnalysis.update({
        where: { id: competitorAnalysis.id },
        data: {
          competitors: validCompetitors,
          comparison,
        },
      })

      // Update usage count
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
      })
    } catch (error: any) {
      // Update competitor analysis with error
      await prisma.competitorAnalysis.update({
        where: { id: competitorAnalysis.id },
        data: {
          competitors: {},
          comparison: {},
        },
      })

      return NextResponse.json(
        { error: 'Competitor analysis failed', message: error.message },
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

