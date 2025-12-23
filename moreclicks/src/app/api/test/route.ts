import { NextResponse } from 'next/server'
import { DataForSEOOnPageService } from '@/lib/services/dataforseo/onpage'
import { DataForSEOSERPService } from '@/lib/services/dataforseo/serp'
import { DataForSEOKeywordsService } from '@/lib/services/dataforseo/keywords'

/**
 * Test endpoint to verify API connections
 * Only use in development/staging
 */
export async function GET() {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not available in production' }, { status: 403 })
  }

  const results = {
    dataforseo: {
      onpage: 'not_tested',
      serp: 'not_tested',
      keywords: 'not_tested',
    },
    timestamp: new Date().toISOString(),
  }

  // Test On-Page API
  try {
    await DataForSEOOnPageService.analyzePageInstant('https://example.com')
    results.dataforseo.onpage = 'connected'
  } catch (error: any) {
    results.dataforseo.onpage = `error: ${error.message}`
  }

  // Test SERP API
  try {
    await DataForSEOSERPService.getOrganic('test keyword')
    results.dataforseo.serp = 'connected'
  } catch (error: any) {
    results.dataforseo.serp = `error: ${error.message}`
  }

  // Test Keywords API
  try {
    await DataForSEOKeywordsService.getMetrics(['test'])
    results.dataforseo.keywords = 'connected'
  } catch (error: any) {
    results.dataforseo.keywords = `error: ${error.message}`
  }

  return NextResponse.json(results)
}

