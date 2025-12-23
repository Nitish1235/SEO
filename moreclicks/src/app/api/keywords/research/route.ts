import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { DataForSEOSERPService } from '@/lib/services/dataforseo/serp'
import { DataForSEOKeywordsService } from '@/lib/services/dataforseo/keywords'
import { ClaudeService } from '@/lib/services/claude'
import { keywordResearchSchema } from '@/lib/utils/validators'

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
      if (user.subscription.keywordsUsed >= user.subscription.keywordsLimit) {
        return NextResponse.json(
          { error: 'Keyword research limit reached. Please upgrade your plan.' },
          { status: 403 }
        )
      }
    } else {
      // Free tier: 5 keywords
      const freeKeywords = await prisma.keywordResearch.count({
        where: { userId: user.id },
      })
      if (freeKeywords >= 5) {
        return NextResponse.json(
          { error: 'Free keyword research limit reached. Please subscribe to continue.' },
          { status: 403 }
        )
      }
    }

    // Parse and validate request
    const body = await request.json()
    const validation = keywordResearchSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: validation.error.errors },
        { status: 400 }
      )
    }

    const { keyword } = validation.data

    // Create keyword research record
    const keywordResearch = await prisma.keywordResearch.create({
      data: {
        userId: user.id,
        keyword,
        status: 'processing',
        serpData: {},
      },
    })

    try {
      // Get SERP data
      const serpResponse = await DataForSEOSERPService.getOrganic(keyword)
      const topResults = serpResponse.tasks?.[0]?.data?.items
        ?.filter((item) => item.type === 'organic')
        .slice(0, 10)
        .map((item) => ({
          position: item.rank_absolute,
          title: item.title,
          url: item.url,
          description: item.description,
        })) || []

      // Extract PAA and featured snippet
      const paa = DataForSEOSERPService.extractPAA(serpResponse)
      const featuredSnippet = DataForSEOSERPService.extractFeaturedSnippet(serpResponse)
      const relatedSearches = DataForSEOSERPService.extractRelatedSearches(serpResponse)

      // Get keyword metrics
      const metricsResponse = await DataForSEOKeywordsService.getMetrics([keyword])
      const metrics = metricsResponse.tasks?.[0]?.data?.[0]

      // Get related keywords
      const relatedKeywordsResponse = await DataForSEOKeywordsService.getRelated(keyword)
      const relatedKeywords =
        relatedKeywordsResponse.tasks?.[0]?.data?.items?.map((item) => ({
          keyword: item.keyword,
          searchVolume: item.search_volume,
          difficulty: item.keyword_difficulty,
          cpc: item.cpc,
        })) || []

      // Generate content brief with Claude
      const contentBrief = await ClaudeService.generateContentBrief(keyword, {
        topResults: topResults.map((r) => ({
          title: r.title,
          description: r.description,
          url: r.url,
        })),
        paa: paa.map((p) => ({
          question: p.question,
          answer: p.answer,
        })),
        featuredSnippet: featuredSnippet
          ? {
              title: featuredSnippet.title,
              description: featuredSnippet.description,
            }
          : undefined,
      })

      // Prepare results
      const results = {
        keyword,
        metrics: {
          searchVolume: metrics?.search_volume || 0,
          keywordDifficulty: metrics?.keyword_difficulty || 0,
          cpc: metrics?.cpc || 0,
          competition: metrics?.competition || 0,
        },
        serp: {
          topResults,
          featuredSnippet,
          paa,
          relatedSearches,
        },
        relatedKeywords,
        contentBrief,
      }

      // Update keyword research record
      await prisma.keywordResearch.update({
        where: { id: keywordResearch.id },
        data: {
          status: 'completed',
          searchVolume: results.metrics.searchVolume,
          keywordDifficulty: results.metrics.keywordDifficulty,
          cpc: results.metrics.cpc,
          competition: results.metrics.competition,
          serpData: results.serp,
          relatedKeywords: results.relatedKeywords,
          contentBrief: results.contentBrief,
        },
      })

      // Update usage count
      if (user.subscription) {
        await prisma.subscription.update({
          where: { id: user.subscription.id },
          data: {
            keywordsUsed: { increment: 1 },
          },
        })
      }

      return NextResponse.json({
        id: keywordResearch.id,
        ...results,
      })
    } catch (error: any) {
      // Update keyword research with error
      await prisma.keywordResearch.update({
        where: { id: keywordResearch.id },
        data: {
          status: 'failed',
        },
      })

      return NextResponse.json(
        { error: 'Keyword research failed', message: error.message },
        { status: 500 }
      )
    }
  } catch (error: any) {
    console.error('Keyword research API error:', error)
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    )
  }
}

