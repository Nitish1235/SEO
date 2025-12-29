import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { DodoPaymentsService } from '@/lib/services/dodopayments'
import { LemonSqueezyService } from '@/lib/services/lemonsqueezy'

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

    // Prioritize Dodo Payments subscription data if available
    if (user.subscription.dodoSubscriptionId) {
      try {
        const subscription = await DodoPaymentsService.getSubscription(
          user.subscription.dodoSubscriptionId
        )
        return NextResponse.json({
          plan: user.subscription.plan,
          status: subscription.status,
          currentPeriodEnd: new Date(subscription.current_period_end),
          analysesUsed: user.subscription.analysesUsed,
          analysesLimit: user.subscription.analysesLimit,
          keywordsUsed: user.subscription.keywordsUsed,
          keywordsLimit: user.subscription.keywordsLimit,
          competitorsUsed: user.subscription.competitorsUsed,
          competitorsLimit: user.subscription.competitorsLimit,
        })
      } catch (error) {
        console.error('Dodo Payments status check error, falling back to local data:', error)
        // If Dodo Payments API fails, return local subscription data
        return NextResponse.json({
          plan: user.subscription.plan,
          status: user.subscription.status,
          currentPeriodEnd: user.subscription.dodoCurrentPeriodEnd,
          analysesUsed: user.subscription.analysesUsed,
          analysesLimit: user.subscription.analysesLimit,
          keywordsUsed: user.subscription.keywordsUsed,
          keywordsLimit: user.subscription.keywordsLimit,
          competitorsUsed: user.subscription.competitorsUsed,
          competitorsLimit: user.subscription.competitorsLimit,
        })
      }
    }

    // Fallback to LemonSqueezy subscription data
    if (user.subscription.lemonSqueezySubscriptionId) {
      try {
        const subscription = await LemonSqueezyService.getSubscription(
          user.subscription.lemonSqueezySubscriptionId
        )
        return NextResponse.json({
          plan: user.subscription.plan,
          status: subscription.attributes.status,
          currentPeriodEnd: new Date(subscription.attributes.renews_at),
          analysesUsed: user.subscription.analysesUsed,
          analysesLimit: user.subscription.analysesLimit,
          keywordsUsed: user.subscription.keywordsUsed,
          keywordsLimit: user.subscription.keywordsLimit,
          competitorsUsed: user.subscription.competitorsUsed,
          competitorsLimit: user.subscription.competitorsLimit,
        })
      } catch (error) {
        console.error('LemonSqueezy status check error, falling back to local data:', error)
        return NextResponse.json({
          plan: user.subscription.plan,
          status: user.subscription.status,
          currentPeriodEnd: user.subscription.lemonSqueezyCurrentPeriodEnd,
          analysesUsed: user.subscription.analysesUsed,
          analysesLimit: user.subscription.analysesLimit,
          keywordsUsed: user.subscription.keywordsUsed,
          keywordsLimit: user.subscription.keywordsLimit,
          competitorsUsed: user.subscription.competitorsUsed,
          competitorsLimit: user.subscription.competitorsLimit,
        })
      }
    }

    // Fallback to Stripe subscription data
    return NextResponse.json({
      plan: user.subscription.plan,
      status: user.subscription.status,
      currentPeriodEnd: user.subscription.stripeCurrentPeriodEnd,
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

