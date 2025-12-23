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
        model: 'claude-3-5-sonnet-20241022',
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

Provide:
1. A brief summary (2-3 sentences)
2. Top 3-5 strengths
3. Top 3-5 weaknesses
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
      const summaryMatch = text.match(/summary[:\-]?\s*(.+?)(?=strengths|weaknesses|priority|$)/is)
      const strengthsMatch = text.match(/strengths?[:\-]?\s*(.+?)(?=weaknesses|priority|$)/is)
      const weaknessesMatch = text.match(/weaknesses?[:\-]?\s*(.+?)(?=priority|actions|$)/is)
      const actionsMatch = text.match(/priority\s+actions?[:\-]?\s*(.+?)(?=estimated|impact|$)/is)
      const impactMatch = text.match(/estimated\s+impact[:\-]?\s*(.+?)$/is)

      return {
        summary: summaryMatch?.[1]?.trim() || 'SEO analysis completed. Review the detailed metrics below.',
        strengths: strengthsMatch?.[1]
          ?.split(/\n|•|-/)
          .map((s) => s.trim())
          .filter((s) => s.length > 0)
          .slice(0, 5) || [],
        weaknesses: weaknessesMatch?.[1]
          ?.split(/\n|•|-/)
          .map((s) => s.trim())
          .filter((s) => s.length > 0)
          .slice(0, 5) || [],
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
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 2000,
        system: `You are a content strategist. Based on SERP analysis, provide content recommendations for creating optimized content.`,
        messages: [
          {
            role: 'user',
            content: `Create a content brief for the keyword "${keyword}".

Top Ranking Pages:
${serpData.topResults
  .slice(0, 5)
  .map((r, i) => `${i + 1}. ${r.title}\n   ${r.description}`)
  .join('\n\n')}

${serpData.featuredSnippet ? `Featured Snippet: ${serpData.featuredSnippet.title}\n${serpData.featuredSnippet.description}` : ''}

People Also Ask:
${serpData.paa.map((q) => `- ${q.question}`).join('\n')}

Provide:
1. Suggested title (50-60 characters)
2. Meta description (120-160 characters)
3. Content outline with H2/H3 headings and key points
4. Related keywords to include
5. Target word count`,
          },
        ],
      })

      const content = message.content[0]
      if (content.type !== 'text') {
        throw new Error('Unexpected response type from Claude')
      }

      // Simplified parsing (in production, use structured output)
      const text = content.text

      return {
        title: text.match(/title[:\-]?\s*(.+?)(?=meta|description|outline|$)/is)?.[1]?.trim() || `Complete Guide to ${keyword}`,
        metaDescription:
          text.match(/meta\s+description[:\-]?\s*(.+?)(?=outline|keywords|word|$)/is)?.[1]?.trim() ||
          `Learn everything about ${keyword} with our comprehensive guide.`,
        outline: [
          {
            heading: 'Introduction',
            points: ['Introduce the topic', 'Explain why it matters'],
          },
          {
            heading: 'Main Content',
            points: ['Cover key aspects', 'Provide detailed information'],
          },
        ],
        keywords: [keyword],
        wordTarget: 1500,
      }
    } catch (error) {
      console.error('Claude API error:', error)
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

