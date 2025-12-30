import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { DodoPaymentsService } from '@/lib/services/dodopayments'
import { PLANS } from '@/lib/config/pricing'

export async function POST(request: NextRequest) {
  try {
    // Get raw body for signature verification (must be raw string, not parsed)
    const body = await request.text()
    
    // Dodo Payments webhook signature header (check docs for exact header name)
    // Common patterns: x-dodo-signature, x-signature, x-webhook-signature
    const signature = request.headers.get('x-dodo-signature') || 
                      request.headers.get('x-signature') || 
                      request.headers.get('x-webhook-signature') || 
                      request.headers.get('authorization')?.replace('Bearer ', '') || ''

    // Verify webhook signature (idempotent verification)
    if (!DodoPaymentsService.verifyWebhookSignature(body, signature)) {
      console.error('Invalid Dodo Payments webhook signature')
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    // Parse event after signature verification
    const event = JSON.parse(body)
    const { type, data } = event

    console.log(`Dodo Payments webhook received: ${type}`, { eventId: event.id || 'unknown' })

    // Handle different event types
    switch (type) {
      // Subscription lifecycle events
      case 'subscription.created':
      case 'subscription.active':
      case 'subscription.updated':
      case 'subscription.renewed':
      case 'subscription.plan_changed':
        await handleSubscriptionEvent(data)
        break
      // Subscription cancellation/expiration events
      case 'subscription.canceled':
      case 'subscription.cancelled':
      case 'subscription.expired':
        await handleSubscriptionCancellation(data)
        break
      // Payment success events
      case 'payment.completed':
      case 'payment.succeeded':
        await handlePaymentSuccess(data)
        break
      // Payment failure events
      case 'payment.failed':
      case 'subscription.failed':
        await handlePaymentFailure(data)
        break
      // Refund events (not currently handling refunds - no refund policy)
      case 'refund.succeeded':
      case 'refund.failed':
        console.log('Refund event received (not processed - no refund policy):', type, data)
        break
      default:
        console.log('Unhandled Dodo Payments event:', type)
    }

    return NextResponse.json({ received: true })
  } catch (error: any) {
    console.error('Dodo Payments webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed', message: error.message },
      { status: 500 }
    )
  }
}

async function handleSubscriptionEvent(data: any) {
  const subscription = data
  const customerId = subscription.customer_id
  const subscriptionId = subscription.id || subscription.subscription_id
  // Dodo Payments uses product_id (not plan_id) for subscriptions
  const productId = subscription.product_id || subscription.plan_id
  const status = subscription.status

  console.log(`Processing subscription event:`, {
    subscriptionId,
    customerId,
    productId,
    status,
  })

  // Find user by customer ID
  const user = await prisma.user.findFirst({
    where: {
      OR: [
        { dodoCustomerId: customerId },
        // Fallback: try to find by email if customer_id not set yet
      ],
    },
    include: { subscription: true },
  })

  if (!user) {
    console.error(`User not found for Dodo Payments customer ID: ${customerId}`)
    return
  }

  // Ensure customer ID is saved on user (in case subscription event comes before payment event)
  if (!user.dodoCustomerId && customerId) {
    await prisma.user.update({
      where: { id: user.id },
      data: { dodoCustomerId: customerId },
    })
    console.log(`Updated user ${user.email} with Dodo Payments customer ID: ${customerId}`)
  }

  // Determine plan from product_id (map product_id to plan)
  let plan: 'basic' | 'pro' | 'agency' = 'basic'
  if (productId === process.env.DODO_PLAN_BASIC) {
    plan = 'basic'
  } else if (productId === process.env.DODO_PLAN_PRO) {
    plan = 'pro'
  } else if (productId === process.env.DODO_PLAN_AGENCY) {
    plan = 'agency'
  } else {
    console.warn(`Unknown product_id: ${productId}, defaulting to basic plan`)
  }

  const planConfig = PLANS[plan]

  if (!planConfig) {
    console.error(`Invalid plan: ${plan}`)
    return
  }

  const limits = planConfig.limits

  // Update or create subscription
  if (user.subscription) {
    await prisma.subscription.update({
      where: { id: user.subscription.id },
      data: {
        dodoSubscriptionId: subscriptionId,
        dodoPlanId: productId,
        dodoCurrentPeriodEnd: subscription.current_period_end ? new Date(subscription.current_period_end) : undefined,
        plan,
        status: status === 'active' ? 'active' : status === 'canceled' || status === 'cancelled' ? 'canceled' : 'past_due',
        analysesLimit: limits.analyses,
        keywordsLimit: limits.keywords,
        competitorsLimit: limits.competitors,
      },
    })
    console.log(`Dodo Payments subscription ${subscriptionId} updated for user ${user.email}, plan: ${plan}`)
  } else {
    await prisma.subscription.create({
      data: {
        userId: user.id,
        dodoSubscriptionId: subscriptionId,
        dodoPlanId: productId,
        dodoCurrentPeriodEnd: subscription.current_period_end ? new Date(subscription.current_period_end) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        plan,
        status: status === 'active' ? 'active' : status === 'canceled' || status === 'cancelled' ? 'canceled' : 'past_due',
        analysesLimit: limits.analyses,
        keywordsLimit: limits.keywords,
        competitorsLimit: limits.competitors,
        analysesUsed: 0,
        keywordsUsed: 0,
        competitorsUsed: 0,
      },
    })
    console.log(`Dodo Payments subscription ${subscriptionId} created for user ${user.email}, plan: ${plan}`)
  }
}

async function handleSubscriptionCancellation(data: any) {
  const subscription = data
  const subscriptionId = subscription.id

  // Find subscription by Dodo Payments subscription ID
  const dbSubscription = await prisma.subscription.findUnique({
    where: { dodoSubscriptionId: subscriptionId },
    include: { user: true },
  })

  if (!dbSubscription) {
    console.error(`Subscription not found for Dodo Payments subscription ID: ${subscriptionId}`)
    return
  }

  // Update subscription status
  await prisma.subscription.update({
    where: { id: dbSubscription.id },
    data: {
      status: 'canceled',
    },
  })

  console.log(`Dodo Payments subscription ${subscriptionId} canceled for user ${dbSubscription.user.email}`)
}

async function handlePaymentSuccess(data: any) {
  // Payment succeeded - this is the source of truth for "paid"
  // Per official docs: "Your backend + webhooks are the source of truth for 'paid'"
  const payment = data
  const paymentId = payment.id || payment.payment_id
  const customerId = payment.customer_id
  const subscriptionId = payment.subscription_id || payment.subscription?.id

  console.log(`Payment succeeded: ${paymentId}`, {
    customerId,
    subscriptionId,
    amount: payment.amount,
    currency: payment.currency,
    metadata: payment.metadata,
  })

  // Find user by customer ID or email
  let user = null
  if (customerId) {
    user = await prisma.user.findFirst({
      where: {
        OR: [
          { dodoCustomerId: customerId },
          { email: payment.customer?.email },
        ],
      },
      include: { subscription: true },
    })

    // Update customer_id if user doesn't have it yet
    if (user && !user.dodoCustomerId) {
      await prisma.user.update({
        where: { id: user.id },
        data: { dodoCustomerId: customerId },
      })
      console.log(`Updated user ${user.email} with Dodo Payments customer ID: ${customerId}`)
    }
  }

  if (!user) {
    console.error(`User not found for payment ${paymentId}`, { customerId, email: payment.customer?.email })
    return
  }

  // Determine plan from payment metadata or product_id
  // Check metadata first (we pass user_id and plan in checkout)
  let plan: 'basic' | 'pro' | 'agency' = 'basic'
  if (payment.metadata?.plan) {
    plan = payment.metadata.plan as 'basic' | 'pro' | 'agency'
  } else {
    // Fallback: try to get product_id from payment line items or product_cart
    const productId = payment.product_id || 
                      payment.line_items?.[0]?.product_id ||
                      payment.product_cart?.[0]?.product_id
    
    if (productId) {
      // Map product_id to plan
      if (productId === process.env.DODO_PLAN_BASIC) {
        plan = 'basic'
      } else if (productId === process.env.DODO_PLAN_PRO) {
        plan = 'pro'
      } else if (productId === process.env.DODO_PLAN_AGENCY) {
        plan = 'agency'
      }
      console.log(`Determined plan from product_id: ${productId} -> ${plan}`)
    }
  }

  const planConfig = PLANS[plan]

  if (!planConfig) {
    console.error(`Invalid plan: ${plan}`)
    return
  }

  const limits = planConfig.limits

  // If payment is for a subscription, create or update it
  if (subscriptionId) {
    const dbSubscription = await prisma.subscription.findUnique({
      where: { dodoSubscriptionId: subscriptionId },
    })

    if (dbSubscription) {
      // Update existing subscription
      await prisma.subscription.update({
        where: { id: dbSubscription.id },
        data: {
          status: 'active',
          plan,
          dodoPlanId: payment.product_id || dbSubscription.dodoPlanId,
          analysesLimit: limits.analyses,
          keywordsLimit: limits.keywords,
          competitorsLimit: limits.competitors,
        },
      })
      console.log(`Dodo Payments subscription ${subscriptionId} updated and activated for user ${user.email}, plan: ${plan}`)
    } else {
      // Create new subscription
      await prisma.subscription.create({
        data: {
          userId: user.id,
          dodoSubscriptionId: subscriptionId,
          dodoPlanId: payment.product_id,
          dodoCurrentPeriodEnd: payment.current_period_end ? new Date(payment.current_period_end) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // Default to 30 days if not provided
          plan,
          status: 'active',
          analysesLimit: limits.analyses,
          keywordsLimit: limits.keywords,
          competitorsLimit: limits.competitors,
          analysesUsed: 0,
          keywordsUsed: 0,
          competitorsUsed: 0,
        },
      })
      console.log(`Dodo Payments subscription ${subscriptionId} created for user ${user.email}, plan: ${plan}`)
    }
  } else {
    // No subscription ID - might be a one-time payment or subscription not created yet
    // Create subscription based on product_id if available
    const productId = payment.product_id || 
                      payment.line_items?.[0]?.product_id ||
                      payment.product_cart?.[0]?.product_id

    if (productId && (productId === process.env.DODO_PLAN_BASIC || 
                      productId === process.env.DODO_PLAN_PRO || 
                      productId === process.env.DODO_PLAN_AGENCY)) {
      // Create subscription from product purchase
      if (!user.subscription) {
        await prisma.subscription.create({
          data: {
            userId: user.id,
            dodoPlanId: productId,
            dodoCurrentPeriodEnd: payment.current_period_end ? new Date(payment.current_period_end) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            plan,
            status: 'active',
            analysesLimit: limits.analyses,
            keywordsLimit: limits.keywords,
            competitorsLimit: limits.competitors,
            analysesUsed: 0,
            keywordsUsed: 0,
            competitorsUsed: 0,
          },
        })
        console.log(`Created subscription from payment ${paymentId} for user ${user.email}, plan: ${plan}`)
      } else {
        // Update existing subscription
        await prisma.subscription.update({
          where: { id: user.subscription.id },
          data: {
            plan,
            status: 'active',
            dodoPlanId: productId,
            analysesLimit: limits.analyses,
            keywordsLimit: limits.keywords,
            competitorsLimit: limits.competitors,
          },
        })
        console.log(`Updated subscription from payment ${paymentId} for user ${user.email}, plan: ${plan}`)
      }
    } else {
      console.warn(`Payment ${paymentId} has no subscription_id and product_id doesn't match any plan`)
    }
  }
}

async function handlePaymentFailure(data: any) {
  // Payment failed - mark subscription as past_due
  const payment = data
  const paymentId = payment.id || payment.payment_id
  const subscriptionId = payment.subscription_id || payment.subscription?.id

  console.log(`Payment failed: ${paymentId}`, {
    subscriptionId,
    failureReason: payment.failure_reason || payment.error_message,
  })

  if (subscriptionId) {
    const dbSubscription = await prisma.subscription.findUnique({
      where: { dodoSubscriptionId: subscriptionId },
      include: { user: true },
    })

    if (dbSubscription) {
      await prisma.subscription.update({
        where: { id: dbSubscription.id },
        data: {
          status: 'past_due',
        },
      })
      console.log(`Dodo Payments subscription ${subscriptionId} marked as past_due due to payment failure for user ${dbSubscription.user.email}`)
    } else {
      console.warn(`Subscription ${subscriptionId} not found in database for failed payment ${paymentId}`)
    }
  }

  // TODO: Notify user about payment failure (email, in-app notification, etc.)
}

// Refund handling removed - no refund policy currently implemented
// If refunds are enabled in the future, add refund event handlers here

