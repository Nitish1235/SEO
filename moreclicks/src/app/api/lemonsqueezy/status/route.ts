import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
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

    if (!user.subscription?.lemonSqueezySubscriptionId) {
      return NextResponse.json({
        hasSubscription: false,
        status: null,
      })
    }

    // Get subscription status from LemonSqueezy
    try {
      const subscription = await LemonSqueezyService.getSubscription(
        user.subscription.lemonSqueezySubscriptionId
      )

      // Update local subscription if needed
      if (subscription.attributes.status !== user.subscription.status) {
        await prisma.subscription.update({
          where: { id: user.subscription.id },
          data: {
            status: subscription.attributes.status,
            lemonSqueezyCurrentPeriodEnd: new Date(subscription.attributes.renews_at),
          },
        })
      }

      return NextResponse.json({
        hasSubscription: true,
        status: subscription.attributes.status,
        plan: user.subscription.plan,
        currentPeriodEnd: subscription.attributes.renews_at,
        canceled: subscription.attributes.cancelled,
        customerPortalUrl: subscription.attributes.urls.customer_portal,
      })
    } catch (error) {
      // If LemonSqueezy API fails, return local subscription data
      return NextResponse.json({
        hasSubscription: true,
        status: user.subscription.status,
        plan: user.subscription.plan,
        currentPeriodEnd: user.subscription.lemonSqueezyCurrentPeriodEnd,
      })
    }
  } catch (error: any) {
    console.error('LemonSqueezy status check error:', error)
    return NextResponse.json(
      { error: 'Failed to check subscription status', message: error.message },
      { status: 500 }
    )
  }
}

