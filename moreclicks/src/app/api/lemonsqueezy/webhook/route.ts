import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { LemonSqueezyService } from '@/lib/services/lemonsqueezy'
import { PLANS } from '@/lib/config/pricing'

export async function POST(request: NextRequest) {
  try {
    // Get raw body for signature verification
    const body = await request.text()
    const signature = request.headers.get('x-signature') || ''

    // Verify webhook signature
    if (!LemonSqueezyService.verifyWebhookSignature(body, signature)) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    const event = JSON.parse(body)
    const { meta, data } = event

    // Handle different event types
    switch (meta.event_name) {
      case 'subscription_created':
      case 'subscription_updated':
      case 'subscription_payment_success':
        await handleSubscriptionEvent(data)
        break
      case 'subscription_cancelled':
      case 'subscription_expired':
        await handleSubscriptionCancellation(data)
        break
      default:
        console.log('Unhandled LemonSqueezy event:', meta.event_name)
    }

    return NextResponse.json({ received: true })
  } catch (error: any) {
    console.error('LemonSqueezy webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed', message: error.message },
      { status: 500 }
    )
  }
}

async function handleSubscriptionEvent(data: any) {
  const subscription = data.attributes
  const customerId = data.relationships?.customer?.data?.id

  if (!customerId) {
    console.error('No customer ID in subscription event')
    return
  }

  // Find user by LemonSqueezy customer ID
  const user = await prisma.user.findFirst({
    where: {
      lemonSqueezyCustomerId: customerId.toString(),
    },
  })

  if (!user) {
    console.error('User not found for LemonSqueezy customer:', customerId)
    return
  }

  // Determine plan from variant ID
  const variantId = subscription.variant_id.toString()
  const plan = getPlanFromVariantId(variantId)

  // Update or create subscription
  const existingSubscription = await prisma.subscription.findUnique({
    where: { userId: user.id },
  })

  const subscriptionData = {
    lemonSqueezySubscriptionId: data.id.toString(),
    lemonSqueezyVariantId: variantId,
    lemonSqueezyCurrentPeriodEnd: new Date(subscription.renews_at),
    plan,
    status: subscription.status === 'active' ? 'active' : 'canceled',
    analysesLimit: PLANS[plan].limits.analyses,
    keywordsLimit: PLANS[plan].limits.keywords,
    competitorsLimit: PLANS[plan].limits.competitors,
    serpTrackingsLimit: 50,
    contentOptimizationsLimit: 50,
    seoAuditsLimit: 50,
  }

  if (existingSubscription) {
    await prisma.subscription.update({
      where: { id: existingSubscription.id },
      data: subscriptionData,
    })
  } else {
    await prisma.subscription.create({
      data: {
        userId: user.id,
        ...subscriptionData,
      },
    })
  }
}

async function handleSubscriptionCancellation(data: any) {
  const subscriptionId = data.id.toString()

  const subscription = await prisma.subscription.findFirst({
    where: {
      lemonSqueezySubscriptionId: subscriptionId,
    },
  })

  if (subscription) {
    await prisma.subscription.update({
      where: { id: subscription.id },
      data: {
        status: 'canceled',
      },
    })
  }
}

function getPlanFromVariantId(variantId: string): 'basic' | 'pro' | 'agency' {
  // Map variant IDs to plans
  // You'll need to set these in your environment variables
  const variantMap: Record<string, 'basic' | 'pro' | 'agency'> = {
    [process.env.LEMONSQUEEZY_VARIANT_BASIC || '']: 'basic',
    [process.env.LEMONSQUEEZY_VARIANT_PRO || '']: 'pro',
    [process.env.LEMONSQUEEZY_VARIANT_AGENCY || '']: 'agency',
  }

  return variantMap[variantId] || 'basic'
}

