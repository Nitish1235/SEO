import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

/**
 * Claude AI Service
 * IMPORTANT: Claude only receives pre-processed, rule-based results
 * Claude does NOT detect issues, calculate metrics, or decide pass/fail
 * Claude only provides advisory insights and recommendations
 */
export class ClaudeService {
  /**
   * Generate SEO insights from pre-processed analysis data
   * Input: Rule-based analysis results (already processed)
   * Output: Advisory insights only
   */
  static async generateSEOInsights(data: {
    url: string
    score: number
    analyses: {
      title: { status: string; recommendation: string; issues: string[] }
      meta: { status: string; recommendation: string; issues: string[] }
      headings: { status: string; recommendation: string; issues: string[] }
      content: { status: string; recommendation: string; issues: string[] }
      links: { status: string; recommendation: string; issues: string[] }
      images: { status: string; recommendation: string; issues: string[] }
      cwv: { status: string; recommendation: string; issues: string[] }
      ssl: { status: string; recommendation: string; issues: string[] }
    }
    additionalData?: {
      schema?: any[]
      ogTags?: Record<string, string>
      twitterTags?: Record<string, string>
      language?: string
      contentStructure?: {
        hasLists?: boolean
        hasTables?: boolean
        hasFAQ?: boolean
        listCount?: number
        tableCount?: number
      }
      imageDetails?: {
        total: number
        withDimensions: number
        avgWidth: number
        avgHeight: number
      }
      linkDetails?: {
        total: number
        internal: number
        external: number
        nofollow: number
        anchorTexts: string[]
      }
    }
  }): Promise<{
    summary: string
    strengths: string[]
    weaknesses: string[]
    priorityActions: Array<{
      action: string
      impact: 'high' | 'medium' | 'low'
      effort: 'easy' | 'medium' | 'hard'
    }>
    estimatedImpact: string
  }> {
    try {
      const message = await anthropic.messages.create({
        model: 'claude-sonnet-4-5-20250929',
        max_tokens: 2000,
        system: `You are an SEO expert providing advisory insights. You receive pre-processed, rule-based analysis results. Your role is to:
- Provide strategic recommendations based on the analysis
- Suggest priority actions
- Identify content opportunities
- Provide actionable advice

You do NOT:
- Detect SEO issues (already done by rule-based system)
- Calculate metrics (already calculated)
- Decide pass/fail status (already determined)

You provide advisory insights only.`,
        messages: [
          {
            role: 'user',
            content: `Based on this SEO analysis for ${data.url} (Score: ${data.score}/100), provide strategic insights:

Title Tag: ${data.analyses.title.status} - ${data.analyses.title.recommendation}
${data.analyses.title.issues.length > 0 ? `Issues: ${data.analyses.title.issues.join(', ')}` : ''}

Meta Description: ${data.analyses.meta.status} - ${data.analyses.meta.recommendation}
${data.analyses.meta.issues.length > 0 ? `Issues: ${data.analyses.meta.issues.join(', ')}` : ''}

Headings: ${data.analyses.headings.status} - ${data.analyses.headings.recommendation}
${data.analyses.headings.issues.length > 0 ? `Issues: ${data.analyses.headings.issues.join(', ')}` : ''}

Content: ${data.analyses.content.status} - ${data.analyses.content.recommendation}
${data.analyses.content.issues.length > 0 ? `Issues: ${data.analyses.content.issues.join(', ')}` : ''}

Links: ${data.analyses.links.status} - ${data.analyses.links.recommendation}
${data.analyses.links.issues.length > 0 ? `Issues: ${data.analyses.links.issues.join(', ')}` : ''}

Images: ${data.analyses.images.status} - ${data.analyses.images.recommendation}
${data.analyses.images.issues.length > 0 ? `Issues: ${data.analyses.images.issues.join(', ')}` : ''}

Core Web Vitals: ${data.analyses.cwv.status} - ${data.analyses.cwv.recommendation}
${data.analyses.cwv.issues.length > 0 ? `Issues: ${data.analyses.cwv.issues.join(', ')}` : ''}

SSL: ${data.analyses.ssl.status} - ${data.analyses.ssl.recommendation}
${data.analyses.ssl.issues.length > 0 ? `Issues: ${data.analyses.ssl.issues.join(', ')}` : ''}

ADDITIONAL DATA:
${data.additionalData ? `
Schema Markup: ${data.additionalData.schema?.length > 0 ? `${data.additionalData.schema.length} schema(s) found (${data.additionalData.schema.map((s: any) => s['@type'] || 'unknown').join(', ')})` : 'None detected'}
Open Graph Tags: ${data.additionalData.ogTags && Object.keys(data.additionalData.ogTags).length > 0 ? `Present (${Object.keys(data.additionalData.ogTags).join(', ')})` : 'Missing'}
Twitter Cards: ${data.additionalData.twitterTags && Object.keys(data.additionalData.twitterTags).length > 0 ? `Present (${Object.keys(data.additionalData.twitterTags).join(', ')})` : 'Missing'}
Language: ${data.additionalData.language || 'Not specified'}
Content Structure: ${data.additionalData.contentStructure ? `
  - Lists: ${data.additionalData.contentStructure.hasLists ? `Yes (${data.additionalData.contentStructure.listCount || 0} items)` : 'No'}
  - Tables: ${data.additionalData.contentStructure.hasTables ? `Yes (${data.additionalData.contentStructure.tableCount || 0} tables)` : 'No'}
  - FAQ Section: ${data.additionalData.contentStructure.hasFAQ ? 'Yes' : 'No'}
` : 'Not analyzed'}
Image Optimization: ${data.additionalData.imageDetails ? `
  - Total Images: ${data.additionalData.imageDetails.total}
  - With Dimensions: ${data.additionalData.imageDetails.withDimensions} (${data.additionalData.imageDetails.total > 0 ? Math.round((data.additionalData.imageDetails.withDimensions / data.additionalData.imageDetails.total) * 100) : 0}%)
  - Average Size: ${data.additionalData.imageDetails.avgWidth}x${data.additionalData.imageDetails.avgHeight}px
` : ''}
Link Analysis: ${data.additionalData.linkDetails ? `
  - Internal: ${data.additionalData.linkDetails.internal}
  - External: ${data.additionalData.linkDetails.external}
  - Nofollow: ${data.additionalData.linkDetails.nofollow}
  - Sample Anchor Texts: ${data.additionalData.linkDetails.anchorTexts.slice(0, 10).join(', ')}
` : ''}
` : ''}

Provide:
1. A brief summary (2-3 sentences)
2. All strengths (list all positive aspects, not limited to 3-5)
3. All weaknesses (list all areas for improvement, not limited to 3-5)
4. Priority actions with impact and effort ratings
5. Estimated impact of improvements`,
          },
        ],
      })

      const content = message.content[0]
      if (content.type !== 'text') {
        throw new Error('Unexpected response type from Claude')
      }

      // Parse the response (simplified - in production, use structured output)
      const text = content.text

      // Extract sections (this is a simplified parser)
      const summaryMatch = text.match(/summary[:\-]?\s*([\s\S]+?)(?=strengths|weaknesses|priority|$)/i)
      const strengthsMatch = text.match(/strengths?[:\-]?\s*([\s\S]+?)(?=weaknesses|priority|$)/i)
      const weaknessesMatch = text.match(/weaknesses?[:\-]?\s*([\s\S]+?)(?=priority|actions|$)/i)
      const actionsMatch = text.match(/priority\s+actions?[:\-]?\s*([\s\S]+?)(?=estimated|impact|$)/i)
      const impactMatch = text.match(/estimated\s+impact[:\-]?\s*([\s\S]+?)$/i)

      return {
        summary: summaryMatch?.[1]?.trim() || 'SEO analysis completed. Review the detailed metrics below.',
        strengths: strengthsMatch?.[1]
          ?.split(/\n|•|-/)
          .map((s) => s.trim().replace(/^\d+[\.\)]\s*/, '')) // Remove numbered list prefixes
          .filter((s) => s.length > 0) || [],
        weaknesses: weaknessesMatch?.[1]
          ?.split(/\n|•|-/)
          .map((s) => s.trim().replace(/^\d+[\.\)]\s*/, '')) // Remove numbered list prefixes
          .filter((s) => s.length > 0) || [],
        priorityActions: [
          {
            action: 'Fix critical issues first',
            impact: 'high' as const,
            effort: 'medium' as const,
          },
        ],
        estimatedImpact: impactMatch?.[1]?.trim() || 'Improving these issues could increase SEO score by 10-20 points.',
      }
    } catch (error) {
      console.error('Claude API error:', error)
      // Return default insights if Claude fails
      return {
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
  }

  /**
   * Generate content brief for a keyword
   * Input: Keyword and SERP data (pre-processed)
   * Output: Content recommendations
   */
  static async generateContentBrief(
    keyword: string,
    serpData: {
      topResults: Array<{ title: string; description: string; url: string }>
      paa: Array<{ question: string; answer: string }>
      featuredSnippet?: { title: string; description: string }
    },
    metrics?: {
      searchVolume: number
      keywordDifficulty: number
      cpc: number
      competition: number
    }
  ): Promise<{
    title: string
    metaDescription: string
    outline: Array<{ heading: string; points: string[] }>
    keywords: string[]
    wordTarget: number
  }> {
    try {
      const message = await anthropic.messages.create({
        model: 'claude-3-haiku-20240307',
        max_tokens: 2000,
        system: `You are an expert SEO content strategist. Your goal is to create a highly detailed, comprehensive, and actionable content brief that will help the user rank for the target keyword.
        
        Use the provided metrics to tailor your advice:
        - High Search Volume: Focus on broad appeal and comprehensive coverage.
        - High Difficulty: Suggest unique angles, depth, and "skyscraping" existing content.
        - Low Difficulty: Target specific user intent directly.
        
        Analyze the top ranking pages to understand what Google currently favors, but suggest ways to OUTPERFORM them.
        
        IMPORTANT: Return the response as raw JSON only. Do not wrap in markdown code blocks.`,
        messages: [
          {
            role: 'user',
            content: `Create a high-quality SEO content brief for the keyword "${keyword}".
            
Metric Context:
- Search Volume: ${metrics?.searchVolume || 'N/A'}
- Difficulty: ${metrics?.keywordDifficulty ?? 'N/A'}/100
- CPC: $${metrics?.cpc || '0.00'}
- Competition Level: ${metrics?.competition || 'N/A'}/100

Top ranked competitors to beat:
${serpData.topResults
                .slice(0, 5)
                .map((r, i) => `${i + 1}. ${r.title}\n   ${r.description}`)
                .join('\n\n')}

People Also Ask (User Intent):
${serpData.paa.map((q) => `- ${q.question}`).join('\n')}

${serpData.featuredSnippet ? `Current Featured Snippet (Target to steal):\n${serpData.featuredSnippet.title}\n${serpData.featuredSnippet.description}` : ''}

Provide a structured JSON response with the following schema:
{
  "title": "string (50-60 chars)",
  "metaDescription": "string (120-160 chars)",
  "outline": [
    { "heading": "string (H2)", "points": ["string (detailed point)", "string"] }
  ],
  "keywords": ["string (related keyword)", "string"],
  "wordTarget": number
}

Make the outline specific, not generic. Don't just say "Introduction", say what exactly should be covered in the introduction.`,
          },
        ],
      })

      const content = message.content[0]
      if (content.type !== 'text') {
        throw new Error('Unexpected response type from Claude')
      }

      const text = content.text.trim()

      // Attempt to extract JSON if it's wrapped in text
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      const jsonString = jsonMatch ? jsonMatch[0] : text

      let parsed
      try {
        parsed = JSON.parse(jsonString)
      } catch (e) {
        console.error('Failed to parse Claude JSON:', text)
        throw new Error('Failed to parse AI response')
      }

      return {
        title: parsed.title || `Complete Guide to ${keyword}`,
        metaDescription: parsed.metaDescription || `Learn everything about ${keyword} with our comprehensive guide.`,
        outline: Array.isArray(parsed.outline) ? parsed.outline : [
          {
            heading: 'Introduction',
            points: ['Introduce the topic', 'Explain why it matters'],
          },
          {
            heading: 'Main Content',
            points: ['Cover key aspects', 'Provide detailed information'],
          },
        ],
        keywords: Array.isArray(parsed.keywords) ? parsed.keywords : [keyword],
        wordTarget: typeof parsed.wordTarget === 'number' ? parsed.wordTarget : 1500,
      }
    } catch (error) {
      console.error('Claude API error:', error)
      console.error('FULL CLAUDE ERROR:', error)
      // Return default brief if Claude fails
      return {
        title: `Complete Guide to ${keyword}`,
        metaDescription: `Learn everything about ${keyword} with our comprehensive guide.`,
        outline: [
          {
            heading: 'Introduction',
            points: ['Introduce the topic'],
          },
        ],
        keywords: [keyword],
        wordTarget: 1500,
      }
    }
  }
}

