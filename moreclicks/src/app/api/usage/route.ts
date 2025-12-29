import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
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

    if (user.subscription) {
      return NextResponse.json({
        analysesUsed: user.subscription.analysesUsed,
        analysesLimit: user.subscription.analysesLimit,
        keywordsUsed: user.subscription.keywordsUsed,
        keywordsLimit: user.subscription.keywordsLimit,
        competitorsUsed: user.subscription.competitorsUsed,
        competitorsLimit: user.subscription.competitorsLimit,
      })
    }

    // Free tier limits - only count completed records (not processing or failed)
    const analysesCount = await prisma.analysis.count({
      where: {
        userId: user.id,
        status: 'completed'
      },
    })
    const keywordsCount = await prisma.keywordResearch.count({
      where: {
        userId: user.id,
        status: 'completed'
      },
    })
    const competitorsCount = await prisma.competitorAnalysis.count({
      where: {
        userId: user.id,
        status: 'completed'
      },
    })

    return NextResponse.json({
      analysesUsed: analysesCount,
      analysesLimit: 1,
      keywordsUsed: keywordsCount,
      keywordsLimit: 3,
      competitorsUsed: competitorsCount,
      competitorsLimit: 0,
    })
  } catch (error: any) {
    console.error('Get usage error:', error)
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    )
  }
}

