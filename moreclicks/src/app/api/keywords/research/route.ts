import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { DataForSEOKeywordsService } from '@/lib/services/dataforseo/keywords'
import { SerperService } from '@/lib/services/serper'
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
      // Free tier: 3 keywords - only count completed keyword researches
      const freeKeywords = await prisma.keywordResearch.count({
        where: {
          userId: user.id,
          status: 'completed'
        },
      })
      if (freeKeywords >= 3) {
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
        { error: 'Invalid request', details: validation.error.issues },
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
      // Get SERP data from Serper.dev
      const serperResults = await SerperService.getSERP(keyword, { num: 10 })

      // Process SERP results
      const topResults = serperResults.organic?.map((item: any, index: number) => ({
        position: item.position || index + 1,
        title: item.title,
        url: item.link,
        description: item.snippet,
      })) || []

      // Extract PAA and featured snippet from Serper.dev
      const paa = serperResults.peopleAlsoAsk?.map((p: any) => ({
        question: p.question,
        answer: p.snippet,
        answerUrl: p.link,
      })) || []
      
      const featuredSnippet = serperResults.answerBox ? {
        title: serperResults.answerBox.title,
        description: serperResults.answerBox.answer,
        url: serperResults.answerBox.link || '',
        type: 'answer_box',
      } : null
      
      const relatedSearches = serperResults.relatedSearches?.map((r: any) => ({
        query: r.query,
        url: '',
      })) || []

      // Get keyword metrics
      let metrics: any = null
      try {
        const metricsResponse = await DataForSEOKeywordsService.getMetrics([keyword])
        console.log('DataForSEO Metrics Response:', JSON.stringify(metricsResponse, null, 2))
        
        // Check if response has data
        if (metricsResponse.tasks && metricsResponse.tasks.length > 0) {
          const task = metricsResponse.tasks[0]
          if (task.data && Array.isArray(task.data) && task.data.length > 0) {
            metrics = task.data[0]
          } else {
            console.warn('DataForSEO metrics response has no data array or empty array')
          }
        } else {
          console.warn('DataForSEO metrics response has no tasks')
        }
      } catch (metricsError: any) {
        console.error('DataForSEO Metrics API error:', metricsError)
        // Continue with null metrics - will default to 0
      }

      // Get related keywords
      let relatedKeywords: any[] = []
      try {
        const relatedKeywordsResponse = await DataForSEOKeywordsService.getRelated(keyword)
        const relatedData = relatedKeywordsResponse.tasks?.[0]?.data as any
        relatedKeywords =
          relatedData?.items?.map((item: any) => ({
            keyword: item.keyword,
            searchVolume: item.search_volume,
            difficulty: item.keyword_difficulty,
            cpc: item.cpc,
          })) || []
      } catch (relatedError: any) {
        console.error('DataForSEO Related Keywords API error:', relatedError)
        // Continue with empty array
      }

      // Prepare results - ensure we extract values correctly
      const searchVolume = metrics?.search_volume ?? metrics?.keyword_info?.search_volume ?? 0
      const keywordDifficulty = metrics?.keyword_difficulty ?? 0
      const cpc = metrics?.cpc ?? metrics?.keyword_info?.cpc ?? 0
      
      // Competition: store as decimal (0-1) since frontend multiplies by 100
      let competition = 0
      if (metrics?.competition !== undefined && metrics.competition !== null) {
        // If competition is already 0-1, use it; if 0-100, convert to 0-1
        competition = metrics.competition <= 1 ? metrics.competition : metrics.competition / 100
      } else if (metrics?.competition_index !== undefined && metrics.competition_index !== null) {
        // Use competition_index if available (usually 0-100, convert to 0-1)
        competition = metrics.competition_index / 100
      } else if (metrics?.competition_level) {
        // Derive from competition_level string (convert to 0-1)
        const level = metrics.competition_level.toUpperCase()
        competition = level === 'HIGH' ? 0.8 : level === 'MEDIUM' ? 0.5 : level === 'LOW' ? 0.2 : 0
      }
      
      console.log('Extracted metrics:', {
        searchVolume,
        keywordDifficulty,
        cpc,
        competition,
        rawMetrics: metrics,
      })

      // Generate content brief with Claude
      const contentBrief = await ClaudeService.generateContentBrief(keyword, {
        topResults: topResults.map((r: any) => ({
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
      }, {
        searchVolume,
        keywordDifficulty,
        cpc,
        competition,
      })

      // Prepare results
      const results = {
        keyword,
        metrics: {
          searchVolume,
          keywordDifficulty,
          cpc,
          competition,
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
      console.error('Keyword research processing error:', error)
      
      // Check if this is an external API error
      const isExternalAPIError = error.message?.includes('API error') || 
                                 error.message?.includes('502') ||
                                 error.message?.includes('503') ||
                                 error.message?.includes('504') ||
                                 error.message?.includes('DataForSEO') ||
                                 error.statusCode >= 500
      
      // Update keyword research with error
      await prisma.keywordResearch.update({
        where: { id: keywordResearch.id },
        data: {
          status: 'failed',
        },
      })

      // Don't charge user for external API failures
      if (isExternalAPIError) {
        return NextResponse.json(
          { 
            error: 'External service error. The keyword research could not be completed due to a service issue. Please try again later.',
            message: error.message,
            skipUsage: true, // Flag to indicate this shouldn't count against usage
          },
          { status: 502 }
        )
      }

      return NextResponse.json(
        { 
          error: 'Keyword research failed', 
          message: error.message,
          skipUsage: true, // Don't charge for failures
        },
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

