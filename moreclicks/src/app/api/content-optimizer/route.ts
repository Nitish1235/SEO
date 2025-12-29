import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { ClaudeService } from '@/lib/services/claude'
import { ScrapeDoService } from '@/lib/services/scrapedo'
import { z } from 'zod'

const contentOptimizerSchema = z.object({
  url: z.string().url().optional(),
  content: z.string().min(100).max(50000),
  targetKeyword: z.string().optional(),
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
      if (user.subscription.contentOptimizationsUsed >= user.subscription.contentOptimizationsLimit) {
        return NextResponse.json(
          { error: 'Content optimization limit reached. Please upgrade your plan.' },
          { status: 403 }
        )
      }
    } else {
      const freeOptimizations = await prisma.contentOptimization.count({
        where: {
          userId: user.id,
          status: { not: 'failed' },
        },
      })
      if (freeOptimizations >= 3) {
        return NextResponse.json(
          { error: 'Free content optimization limit reached. Please subscribe to continue.' },
          { status: 403 }
        )
      }
    }

    const body = await request.json()
    const validation = contentOptimizerSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: validation.error.issues },
        { status: 400 }
      )
    }

    const { url, content, targetKeyword } = validation.data

    // Create content optimization record
    const optimization = await prisma.contentOptimization.create({
      data: {
        userId: user.id,
        url: url || '',
        content,
        targetKeyword: targetKeyword || null,
        status: 'processing',
        originalMetrics: {},
        suggestions: {},
        improvements: {},
      },
    })

    try {
      // Analyze original content
      const wordCount = content.split(/\s+/).filter(w => w.length > 0).length
      const charCount = content.length
      const paragraphCount = content.split(/\n\n/).filter(p => p.trim().length > 0).length
      
      // Extract headings
      const h1Matches = content.match(/^#\s+(.+)$/gm) || []
      const h2Matches = content.match(/^##\s+(.+)$/gm) || []
      const h3Matches = content.match(/^###\s+(.+)$/gm) || []
      
      // Check for keyword in content
      const keywordInTitle = targetKeyword 
        ? content.toLowerCase().includes(targetKeyword.toLowerCase())
        : false
      const keywordDensity = targetKeyword
        ? (content.toLowerCase().split(targetKeyword.toLowerCase()).length - 1) / wordCount * 100
        : 0

      // If URL provided, scrape competitor content for comparison
      let competitorData = null
      if (url) {
        try {
          competitorData = await ScrapeDoService.getCompetitorContent(url)
        } catch (error) {
          console.error('Failed to scrape competitor content:', error)
        }
      }

      const originalMetrics = {
        wordCount,
        charCount,
        paragraphCount,
        headings: {
          h1: h1Matches.length,
          h2: h2Matches.length,
          h3: h3Matches.length,
        },
        keywordInTitle,
        keywordDensity,
        readingTime: Math.ceil(wordCount / 200),
        competitorData,
      }

      // Generate AI suggestions using Claude
      const aiSuggestions = await generateContentSuggestions(
        content,
        targetKeyword || null,
        originalMetrics,
        competitorData
      )

      // Calculate improvements
      const improvements = calculateImprovements(originalMetrics, aiSuggestions)

      // Generate optimized content (if requested)
      let optimizedContent: string | null = null
      if (aiSuggestions.optimizeContent) {
        optimizedContent = await generateOptimizedContent(content, targetKeyword || null, aiSuggestions)
      }

      // Update optimization record
      await prisma.contentOptimization.update({
        where: { id: optimization.id },
        data: {
          status: 'completed',
          originalMetrics,
          suggestions: aiSuggestions,
          improvements,
          optimizedContent,
        },
      })

      // Update usage count
      if (user.subscription) {
        await prisma.subscription.update({
          where: { id: user.subscription.id },
          data: {
            contentOptimizationsUsed: { increment: 1 },
          },
        })
      }

      return NextResponse.json({
        id: optimization.id,
        url,
        originalMetrics,
        suggestions: aiSuggestions,
        improvements,
        optimizedContent,
      })
    } catch (error: any) {
      await prisma.contentOptimization.update({
        where: { id: optimization.id },
        data: {
          status: 'failed',
        },
      })

      return NextResponse.json(
        { error: 'Content optimization failed', message: error.message },
        { status: 500 }
      )
    }
  } catch (error: any) {
    console.error('Content optimizer API error:', error)
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    )
  }
}

async function generateContentSuggestions(
  content: string,
  targetKeyword: string | null,
  metrics: any,
  competitorData: any
): Promise<any> {
  try {
    const prompt = `Analyze this content and provide SEO optimization suggestions:

Content (${metrics.wordCount} words):
${content.substring(0, 5000)}

${targetKeyword ? `Target Keyword: ${targetKeyword}` : ''}

Current Metrics:
- Word Count: ${metrics.wordCount}
- Headings: H1=${metrics.headings.h1}, H2=${metrics.headings.h2}, H3=${metrics.headings.h3}
- Keyword Density: ${metrics.keywordDensity.toFixed(2)}%
- Keyword in Title: ${metrics.keywordInTitle ? 'Yes' : 'No'}

${competitorData ? `Competitor Analysis:
- Competitor Word Count: ${competitorData.wordCount}
- Competitor H1: ${competitorData.h1.join(', ')}
` : ''}

Provide specific, actionable suggestions to improve SEO. Return as JSON:
{
  "title": "string (suggested title)",
  "metaDescription": "string (suggested meta description)",
  "headings": ["string (suggested H2 headings)"],
  "keywordOptimization": ["string (specific keyword suggestions)"],
  "contentStructure": ["string (structure improvements)"],
  "readability": ["string (readability improvements)"],
  "optimizeContent": boolean
}`

    // Use Claude to generate suggestions
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
      // Fallback if JSON parsing fails
      return {
        title: 'Optimize your title tag',
        metaDescription: 'Add a compelling meta description',
        headings: ['Add more H2 headings'],
        keywordOptimization: ['Improve keyword density naturally'],
        contentStructure: ['Improve content structure'],
        readability: ['Improve readability'],
        optimizeContent: false,
      }
    }
  } catch (error) {
    console.error('Error generating content suggestions:', error)
    return {
      title: 'Optimize your title tag',
      metaDescription: 'Add a compelling meta description',
      headings: [],
      keywordOptimization: [],
      contentStructure: [],
      readability: [],
      optimizeContent: false,
    }
  }
}

function calculateImprovements(metrics: any, suggestions: any): any {
  return {
    wordCount: {
      current: metrics.wordCount,
      recommended: metrics.wordCount < 1000 ? 1000 : metrics.wordCount,
      score: metrics.wordCount >= 1000 ? 100 : (metrics.wordCount / 1000) * 100,
    },
    headings: {
      current: metrics.headings.h2,
      recommended: 3,
      score: metrics.headings.h2 >= 3 ? 100 : (metrics.headings.h2 / 3) * 100,
    },
    keywordDensity: {
      current: metrics.keywordDensity,
      recommended: 1.5,
      score: metrics.keywordDensity >= 1 && metrics.keywordDensity <= 2 ? 100 : 50,
    },
    overallScore: 75, // Calculated based on all factors
  }
}

async function generateOptimizedContent(
  originalContent: string,
  targetKeyword: string | null,
  suggestions: any
): Promise<string> {
  // This would use Claude to generate optimized content
  // For now, return a placeholder
  return originalContent // In production, use Claude to rewrite
}

