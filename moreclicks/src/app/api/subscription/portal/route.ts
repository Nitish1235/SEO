import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { DodoPaymentsService } from '@/lib/services/dodopayments'
import { LemonSqueezyService } from '@/lib/services/lemonsqueezy'
import { getStripe } from '@/lib/stripe'

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

    if (!user || !user.subscription) {
      return NextResponse.json(
        { error: 'No active subscription found' },
        { status: 404 }
      )
    }

    // Prioritize Dodo Payments (primary)
    if (user.subscription.dodoSubscriptionId && user.dodoCustomerId) {
      try {
        const portalUrl = await DodoPaymentsService.getCustomerPortalUrl(user.dodoCustomerId)
        return NextResponse.json({ url: portalUrl })
      } catch (error) {
        console.error('Dodo Payments portal error, falling back:', error)
        // Fall through to other providers
      }
    }

    // Fallback to LemonSqueezy
    if (user.subscription.lemonSqueezySubscriptionId && user.lemonSqueezyCustomerId) {
      const portalUrl = `https://app.lemonsqueezy.com/my-orders?customer=${user.lemonSqueezyCustomerId}`
      return NextResponse.json({ url: portalUrl })
    }

    // Fallback to Stripe if neither Dodo nor LemonSqueezy found
    if (user.subscription.stripeSubscriptionId && user.stripeCustomerId) {
      const stripe = getStripe()
      const portalSession = await stripe.billingPortal.sessions.create({
        customer: user.stripeCustomerId!,
        return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing`,
      })
      return NextResponse.json({ url: portalSession.url })
    }

    return NextResponse.json(
      { error: 'No active subscription found for any payment provider.' },
      { status: 404 }
    )
  } catch (error: any) {
    console.error('Billing portal error:', error)
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    )
  }
}

