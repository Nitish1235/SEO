import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { SerperService } from '@/lib/services/serper'
import { z } from 'zod'

const serpTrackerSchema = z.object({
  keyword: z.string().min(1).max(200),
  targetUrl: z.string().url().optional(),
  location: z.string().optional().default('us'),
  language: z.string().optional().default('en'),
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
      if (user.subscription.serpTrackingsUsed >= user.subscription.serpTrackingsLimit) {
        return NextResponse.json(
          { error: 'SERP tracking limit reached. Please upgrade your plan.' },
          { status: 403 }
        )
      }
    } else {
      const freeTrackings = await prisma.sERPTracking.count({
        where: {
          userId: user.id,
          status: { not: 'failed' },
        },
      })
      if (freeTrackings >= 3) {
        return NextResponse.json(
          { error: 'Free SERP tracking limit reached. Please subscribe to continue.' },
          { status: 403 }
        )
      }
    }

    const body = await request.json()
    const validation = serpTrackerSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: validation.error.issues },
        { status: 400 }
      )
    }

    const { keyword, targetUrl, location, language } = validation.data

    // Check if tracking already exists
    const existingTracking = await prisma.sERPTracking.findFirst({
      where: {
        userId: user.id,
        keyword,
        targetUrl: targetUrl || null,
        location,
        language,
      },
      orderBy: { createdAt: 'desc' },
    })

    let trackingId: string
    let isNewTracking = false

    if (existingTracking) {
      trackingId = existingTracking.id
    } else {
      // Create new tracking record
      const newTracking = await prisma.sERPTracking.create({
        data: {
          userId: user.id,
          keyword,
          targetUrl: targetUrl || null,
          targetDomain: targetUrl ? new URL(targetUrl).hostname.replace('www.', '') : null,
          location,
          language,
          status: 'processing',
          rankings: [],
          serpData: {},
        },
      })
      trackingId = newTracking.id
      isNewTracking = true
    }

    try {
      // Get SERP results using Serper.dev
      const serperResults = await SerperService.getSERP(keyword, { location, num: 100 })

      // Process SERP results
      const topRankings = serperResults.organic || []

      // Check ranking for target URL if provided
      let currentRanking: number | null = null
      let rankingData: any = null

      if (targetUrl) {
        const rankingCheck = await SerperService.checkRanking(keyword, targetUrl, location)
        currentRanking = rankingCheck.ranking
        if (currentRanking) {
          rankingData = {
            position: currentRanking,
            title: rankingCheck.title,
            snippet: rankingCheck.snippet,
            url: targetUrl,
          }
        }
      }

      // Get existing rankings history
      const tracking = await prisma.sERPTracking.findUnique({
        where: { id: trackingId },
      })

      const existingRankings = (tracking?.rankings as any[]) || []
      const previousRanking = existingRankings.length > 0 
        ? existingRankings[existingRankings.length - 1].ranking 
        : null

      // Create new ranking entry
      const newRankingEntry = {
        date: new Date().toISOString(),
        ranking: currentRanking,
        url: targetUrl || null,
        title: rankingData?.title || null,
        snippet: rankingData?.snippet || null,
        top10: topRankings.slice(0, 10).map((r, i) => ({
          position: i + 1,
          title: r.title,
          url: r.link,
          snippet: r.snippet,
        })),
      }

      const updatedRankings = [...existingRankings, newRankingEntry]

      // Calculate best and worst rankings
      const allRankings = updatedRankings
        .map((r) => r.ranking)
        .filter((r): r is number => r !== null && r !== undefined)
      const bestRanking = allRankings.length > 0 ? Math.min(...allRankings) : null
      const worstRanking = allRankings.length > 0 ? Math.max(...allRankings) : null

      // Update tracking record
      await prisma.sERPTracking.update({
        where: { id: trackingId },
        data: {
          status: 'completed',
          currentRanking,
          previousRanking,
          bestRanking,
          worstRanking,
          rankings: updatedRankings,
          serpData: {
            top10: topRankings.slice(0, 10),
            peopleAlsoAsk: serperResults.peopleAlsoAsk || [],
            relatedSearches: serperResults.relatedSearches || [],
            answerBox: serperResults.answerBox || null,
            knowledgeGraph: serperResults.knowledgeGraph || null,
          },
          lastChecked: new Date(),
        },
      })

      // Update usage count if new tracking
      if (isNewTracking && user.subscription) {
        await prisma.subscription.update({
          where: { id: user.subscription.id },
          data: {
            serpTrackingsUsed: { increment: 1 },
          },
        })
      }

      return NextResponse.json({
        id: trackingId,
        keyword,
        targetUrl,
        location,
        language,
        currentRanking,
        previousRanking,
        bestRanking,
        worstRanking,
        rankingChange: currentRanking && previousRanking 
          ? previousRanking - currentRanking 
          : null,
        rankings: updatedRankings,
        serpData: {
          top10: topRankings.slice(0, 10),
          peopleAlsoAsk: serperResults?.peopleAlsoAsk || [],
          relatedSearches: serperResults?.relatedSearches || [],
        },
      })
    } catch (error: any) {
      await prisma.sERPTracking.update({
        where: { id: trackingId },
        data: {
          status: 'failed',
        },
      })

      return NextResponse.json(
        { error: 'SERP tracking failed', message: error.message },
        { status: 500 }
      )
    }
  } catch (error: any) {
    console.error('SERP tracker API error:', error)
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const searchParams = request.nextUrl.searchParams
    const keyword = searchParams.get('keyword')
    const targetUrl = searchParams.get('targetUrl')

    const trackings = await prisma.sERPTracking.findMany({
      where: {
        userId: user.id,
        ...(keyword && { keyword: { contains: keyword, mode: 'insensitive' } }),
        ...(targetUrl && { targetUrl }),
      },
      orderBy: { lastChecked: 'desc' },
      take: 50,
    })

    return NextResponse.json({ trackings })
  } catch (error: any) {
    console.error('SERP tracker GET API error:', error)
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    )
  }
}

