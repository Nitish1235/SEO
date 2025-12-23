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

    if (!user.subscription) {
      return NextResponse.json({ plan: null, status: 'none' })
    }

    return NextResponse.json({
      plan: user.subscription.plan,
      status: user.subscription.status,
      stripeCurrentPeriodEnd: user.subscription.stripeCurrentPeriodEnd,
      analysesUsed: user.subscription.analysesUsed,
      analysesLimit: user.subscription.analysesLimit,
      keywordsUsed: user.subscription.keywordsUsed,
      keywordsLimit: user.subscription.keywordsLimit,
      competitorsUsed: user.subscription.competitorsUsed,
      competitorsLimit: user.subscription.competitorsLimit,
    })
  } catch (error: any) {
    console.error('Get subscription status error:', error)
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    )
  }
}

