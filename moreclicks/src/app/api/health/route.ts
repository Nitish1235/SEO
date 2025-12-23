import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { CacheService } from '@/lib/utils/cache'

export async function GET() {
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    services: {
      database: 'unknown',
      cache: 'unknown',
    },
  }

  // Check database
  try {
    await prisma.$queryRaw`SELECT 1`
    health.services.database = 'connected'
  } catch (error) {
    health.services.database = 'disconnected'
    health.status = 'degraded'
  }

  // Check cache
  try {
    await CacheService.get('health-check')
    health.services.cache = 'connected'
  } catch (error) {
    health.services.cache = 'disconnected'
    health.status = 'degraded'
  }

  const statusCode = health.status === 'healthy' ? 200 : 503

  return NextResponse.json(health, { status: statusCode })
}

